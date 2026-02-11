export interface ResetPasswordRequest {
  phone: string;
  code: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}
