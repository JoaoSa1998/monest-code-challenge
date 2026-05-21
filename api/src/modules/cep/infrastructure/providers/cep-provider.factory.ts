import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CepProviderName,
  CepProviderPort,
} from '../../application/ports/cep-provider.port';
import {
  AppFailure,
  AppResult,
} from '../../../shared/domain/types/app-result.type';
import { CepErrorCode } from '../../domain/types/cep-error-code.type';
import { CepResult } from '../../domain/types/cep-result.type';
import { AsyncDelayService } from '../../../shared/infrastructure/services/async-delay.service';
import { AppFailureService } from '../../../shared/infrastructure/services/app-failure.service';
import { BrasilApiAdapter } from '../adapters/brasilapi.adapter';
import { ViaCepAdapter } from '../adapters/viacep.adapter';

@Injectable()
export class CepProviderFactory {
  private readonly providers: Record<CepProviderName, CepProviderPort>;
  private readonly providerNames: CepProviderName[];
  private readonly providerState: Record<
    CepProviderName,
    { consecutiveFailures: number; cooldownUntil: number | null }
  >;
  private nextProviderIndex = 0;
  private readonly logger = new Logger(CepProviderFactory.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly asyncDelayService: AsyncDelayService,
    private readonly appFailureService: AppFailureService,
    viaCepAdapter: ViaCepAdapter,
    brasilApiAdapter: BrasilApiAdapter,
  ) {
    this.providers = {
      viacep: viaCepAdapter,
      brasilapi: brasilApiAdapter,
    };
    this.providerNames = Object.keys(this.providers);
    this.providerState = this.providerNames.reduce(
      (state, providerName) => {
        state[providerName] = {
          consecutiveFailures: 0,
          cooldownUntil: null,
        };
        return state;
      },
      {} as Record<
        CepProviderName,
        { consecutiveFailures: number; cooldownUntil: number | null }
      >,
    );


    //Preference  provider defined in the config :P

    const preferredProvider = this.configService.get<CepProviderName>(
      'cep.provider',
      'viacep',
    );

    const preferredProviderIndex = this.providerNames.indexOf(preferredProvider);
    this.nextProviderIndex =preferredProviderIndex >= 0 ? preferredProviderIndex : 0;
  }

  async findByCep(cep: string): Promise<AppResult<CepResult, CepErrorCode>> {
    const attemptsLimit = this.configService.get<number>('cep.attemptsLimit', 2);
    const retryDelay = this.configService.get<number>('cep.retryDelay', 0);
    const providerOrder = this.getProviderOrder();
    let lastFailure: AppFailure<CepErrorCode> | null = null;
    let notFoundCount = 0;
    const unavailableProviders = new Set<CepProviderName>();

    for (let attempt = 0; attempt < attemptsLimit; attempt++) {
      const provider = providerOrder[attempt % providerOrder.length];
      const result = await provider.findByCep(cep);

      if (result.ok) {
        this.resetProviderState(provider.providerName);
        return result;
      }

      lastFailure = result;
      this.updateProviderState(provider.providerName, result);

      if (result.code === 'not_found') {
        notFoundCount += 1;
      }

      if (
        result.code === 'provider_timeout' ||
        result.code === 'provider_unavailable'
      ) {
        unavailableProviders.add(provider.providerName);
      }

      if (attempt < attemptsLimit - 1 && retryDelay > 0) {
        await this.asyncDelayService.wait(retryDelay);
      }
    }

    if (notFoundCount === attemptsLimit) {
      return this.appFailureService.createFailure({
        code: 'not_found',
        message: 'CEP not found',
        severity: 'low',
        source: 'cep',
      });
    }

    if (unavailableProviders.size === this.providerNames.length) {
      return this.appFailureService.createFailure({
        code: 'provider_unavailable',
        message: 'All CEP providers are unavailable',
        severity: 'critical',
        source: 'cep',
      });
    }

    const fallbackFailure =
      lastFailure ??
      this.appFailureService.createFailure({
        code: 'provider_unavailable',
        message: 'CEP providers are unavailable',
        severity: 'high',
        source: 'cep',
      });

    return fallbackFailure;
  }

  private getProviderOrder(): CepProviderPort[] {
    const availableProviderNames = this.providerNames.filter((providerName) =>
      this.isProviderAvailable(providerName),
    );
    const providerNamesForRotation =
      availableProviderNames.length > 0
        ? availableProviderNames
        : this.providerNames;

    const normalizedStartIndex =
      this.nextProviderIndex % providerNamesForRotation.length;

    this.nextProviderIndex =
      (this.nextProviderIndex + 1) % providerNamesForRotation.length;

    return providerNamesForRotation.map((_, index) => {
      const rotatedIndex =
        (normalizedStartIndex + index) % providerNamesForRotation.length;
      return this.providers[providerNamesForRotation[rotatedIndex]];
    });
  }

  private isProviderAvailable(providerName: CepProviderName): boolean {
    const cooldownUntil = this.providerState[providerName].cooldownUntil;

    if (cooldownUntil === null) {
      return true;
    }

    if (Date.now() >= cooldownUntil) {
      this.providerState[providerName].cooldownUntil = null;
      return true;
    }

    return false;
  }

  private updateProviderState(
    providerName: CepProviderName,
    result: AppFailure<CepErrorCode>,
  ): void {
    if (
      result.code !== 'provider_timeout' &&
      result.code !== 'provider_unavailable'
    ) {
      this.resetProviderState(providerName);
      return;
    }

    const providerFailureStreakLimit = this.configService.get<number>(
      'cep.providerFailureStreakLimit',
      2,
    );
    const providerCooldownMs = this.configService.get<number>(
      'cep.providerCooldownMs',
      30000,
    );
    const state = this.providerState[providerName];

    state.consecutiveFailures += 1;

    if (state.consecutiveFailures < providerFailureStreakLimit) {
      return;
    }

    state.cooldownUntil = Date.now() + providerCooldownMs;
    state.consecutiveFailures = 0;

    this.logger.warn(
      `[medium] [${providerName}] provider entered cooldown for ${providerCooldownMs}ms after consecutive failures`,
    );
  }

  private resetProviderState(providerName: CepProviderName): void {
    this.providerState[providerName] = {
      consecutiveFailures: 0,
      cooldownUntil: null,
    };
  }
}
