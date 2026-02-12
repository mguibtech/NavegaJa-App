import {RegisterDto, AuthResponse} from '../authTypes';

// Re-exporta os tipos compartilhados para manter compatibilidade
export type RegisterRequest = RegisterDto;
export type RegisterResponse = AuthResponse;
