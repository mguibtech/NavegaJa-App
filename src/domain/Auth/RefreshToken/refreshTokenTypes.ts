import {RefreshTokenDto, AuthResponse} from '../authTypes';

// Re-exporta os tipos compartilhados para manter compatibilidade
export type RefreshTokenRequest = RefreshTokenDto;
export type RefreshTokenResponse = AuthResponse;
