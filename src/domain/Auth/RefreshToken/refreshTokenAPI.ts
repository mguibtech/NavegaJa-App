import {api} from '@api';

import {RefreshTokenRequest, RefreshTokenResponse} from './refreshTokenTypes';

class RefreshTokenAPI {
  async refreshToken(data: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    const response = await api.post<RefreshTokenResponse>('/auth/refresh', data);
    return response;
  }
}

export const refreshTokenAPI = new RefreshTokenAPI();
