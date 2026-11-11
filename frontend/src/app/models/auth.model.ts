export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  email: string;
  name: string;
  role: string;
  expiresInSeconds: number;
}

export interface CurrentUser {
  email: string;
  name: string;
  role: string;
}
