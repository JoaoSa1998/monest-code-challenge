import { Injectable } from '@nestjs/common';

@Injectable()
export class AsyncDelayService {
  async wait(ms: number, signal?: AbortSignal): Promise<void> {
    if (ms <= 0) {
      return;
    }

    await new Promise<void>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        cleanup();
        resolve();
      }, ms);

      const handleAbort = () => {
        cleanup();
        reject(signal?.reason ?? new Error('Delay aborted'));
      };

      const cleanup = () => {
        clearTimeout(timeoutId);
        signal?.removeEventListener('abort', handleAbort);
      };

      if (signal?.aborted) {
        handleAbort();
        return;
      }

      signal?.addEventListener('abort', handleAbort, { once: true });
    });
  }
}
