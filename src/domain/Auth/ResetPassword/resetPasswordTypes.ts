import {ResetPasswordDto} from '../authTypes';

// Re-exporta o tipo compartilhado para manter compatibilidade
export type ResetPasswordRequest = ResetPasswordDto;

export interface ResetPasswordResponse {
  message: string;
}
