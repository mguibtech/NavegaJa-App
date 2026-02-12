import {LoginDto, AuthResponse} from '../authTypes';

// Re-exporta os tipos compartilhados para manter compatibilidade
export type LoginRequest = LoginDto;
export type LoginResponse = AuthResponse;
