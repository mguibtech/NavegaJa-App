export const OFFLINE_QUEUED_ERROR_CODE = 'OFFLINE_QUEUED';

type ApiLikeError = {
  statusCode?: number;
  message?: string;
  error?: string;
  code?: string;
};

export class OfflineQueuedError extends Error {
  code = OFFLINE_QUEUED_ERROR_CODE;
  jobId: string;

  constructor(message: string, jobId: string) {
    super(message);
    this.name = 'OfflineQueuedError';
    this.jobId = jobId;
  }
}

export function isOfflineQueuedError(error: unknown): error is OfflineQueuedError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as {code?: string}).code === OFFLINE_QUEUED_ERROR_CODE
  );
}

export function isLikelyOfflineError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const apiError = error as ApiLikeError;
  const message = (apiError.message ?? '').toLowerCase();
  const internalCode = (apiError.code ?? '').toLowerCase();

  if (internalCode === 'ecanceled' || internalCode === 'econnaborted') {
    return true;
  }

  if (
    message.includes('conex') ||
    message.includes('internet') ||
    message.includes('network') ||
    message.includes('timeout')
  ) {
    return true;
  }

  return apiError.statusCode === 0;
}
