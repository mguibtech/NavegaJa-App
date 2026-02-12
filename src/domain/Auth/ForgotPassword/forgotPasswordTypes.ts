import {ForgotPasswordDto} from '../authTypes';

// Re-exporta o tipo compartilhado para manter compatibilidade
export type ForgotPasswordRequest = ForgotPasswordDto;

export interface ForgotPasswordResponse {
  message: string;
}
