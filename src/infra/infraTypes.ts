export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends Error {
  public isNetworkError = true;
  constructor(
    message = 'Erro de conexão. Verifique sua internet e tente novamente.',
    public isTimeout = false,
  ) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class AuthError extends Error {
  constructor(
    message = 'Erro de autenticação. Faça login novamente.',
    public requiresReauth = false,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export class ValidationError extends Error {
  constructor(
    message = 'Dados inválidos.',
    public fields?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}
