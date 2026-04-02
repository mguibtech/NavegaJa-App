import {ApiError} from './types';

export const API_ERROR_MAP: Record<string, string> = {
  // Erros de Autenticação
  'AUTH_INVALID_CREDENTIALS': 'E-mail ou senha incorretos.',
  'AUTH_USER_NOT_FOUND': 'Usuário não encontrado.',
  'AUTH_ACCOUNT_BLOCKED': 'Sua conta foi suspensa. Entre em contato com o suporte.',
  'AUTH_EXPIRED_TOKEN': 'Sua sessão expirou. Por favor, faça login novamente.',
  
  // Erros de Validação
  'VALIDATION_ERROR': 'Alguns dados informados são inválidos.',
  'DUPLICATE_ENTRY': 'Este registro já existe em nosso sistema.',
  
  // Erros de Encomenda (Shipments)
  'SHIPMENT_NOT_FOUND': 'Encomenda não encontrada.',
  'SHIPMENT_ALREADY_PAID': 'Esta encomenda já foi paga.',
  'SHIPMENT_INVALID_WEIGHT': 'O peso informado é inválido para esta viagem.',
  
  // Erros de Reserva (Bookings)
  'BOOKING_FULL': 'Infelizmente esta viagem não possui mais assentos disponíveis.',
  'BOOKING_NOT_FOUND': 'Reserva não encontrada.',
  
  // Erros Genéricos de Sistema
  'INTERNAL_SERVER_ERROR': 'Ocorreu um erro interno no servidor. Tente novamente mais tarde.',
  'NETWORK_ERROR': 'Erro de conexão. Verifique sua internet.',
  'TIMEOUT_ERROR': 'O servidor demorou muito para responder. Tente novamente.',
};

export class ApiErrorHandler {
  static handle(error: ApiError): string {
    // 1. Tenta mapear pelo código de erro específico do backend (se existir)
    if (error.error && API_ERROR_MAP[error.error]) {
      return API_ERROR_MAP[error.error];
    }

    // 2. Se a mensagem for "Erro ao se comunicar com o servidor", mapeia para erro de rede
    if (error.message === 'Erro ao se comunicar com o servidor') {
      return API_ERROR_MAP.NETWORK_ERROR;
    }

    // 3. Fallback para a mensagem que veio do backend ou mensagem padrão
    return error.message || API_ERROR_MAP.INTERNAL_SERVER_ERROR;
  }
}
