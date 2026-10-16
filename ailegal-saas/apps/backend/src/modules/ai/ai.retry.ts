import { setTimeout as sleep } from 'node:timers/promises';

function statusOf(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null) return;
  const status = (error as { status?: number }).status;
  return typeof status === 'number' ? status : undefined;
}

export class AIUnavailableError extends Error {
  readonly retryAfter = 10;
  readonly statusCode: number;
  constructor(cause: unknown) {
    const rateLimited = statusOf(cause) === 429;
    super(rateLimited
      ? 'O serviço de IA atingiu o limite de requisições. Aguarde e tente novamente.'
      : 'O serviço de IA está temporariamente indisponível. Aguarde alguns instantes e tente novamente.', { cause });
    this.statusCode = rateLimited ? 429 : 503;
  }
}

function isTransient(error: unknown): boolean {
  const status = statusOf(error);
  if (status !== undefined) return [429, 500, 502, 503, 504].includes(status);
  if (typeof error !== 'object' || error === null) return false;
  const { code, cause } = error as { code?: string; cause?: unknown };
  return ['ECONNRESET', 'ETIMEDOUT', 'EAI_AGAIN', 'UND_ERR_CONNECT_TIMEOUT'].includes(code ?? '')
    || (cause !== undefined && isTransient(cause));
}

export async function withAIRetry<T>(operation: () => Promise<T>, options: {
  wait?: (milliseconds: number) => Promise<unknown>;
  random?: () => number;
} = {}): Promise<T> {
  const wait = options.wait ?? sleep;
  const random = options.random ?? Math.random;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (!isTransient(error)) throw error;
      if (attempt === 2) throw new AIUnavailableError(error);
      await wait(1000 * (2 ** attempt) + Math.floor(random() * 500));
    }
  }
  throw new Error('Falha inesperada ao consultar a IA.');
}
