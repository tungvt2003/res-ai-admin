// src/apis/authApi.ts
import { AxiosInstance } from "axios";
import api from "../../../shares/configs/axios";
import { User } from "../../../shares/stores/authSlice";

export type RegisterRequest = {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phone: string;
  roles: string;
};

export type LoginRequest = {
  username: string;
  password: string;
};

export type TokenResponse = {
  accessToken: string;
  accessExpire: string;
  userId?: string;
  role?: string;
  user?: User;
};

export type RegisterResponse = {
  message: string;
  user: User;
  accessToken: string;
};

export type SuccessResponse<T = unknown> = {
  status: number;
  message: string;
  data?: T;
};

export type ErrorResponse = {
  status: number;
  message: string;
};

class AuthClient {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = api;
  }

  // ---------------- Register ----------------
  async register(form: RegisterRequest): Promise<SuccessResponse<RegisterResponse>> {
    const response = await this.client.post<SuccessResponse<RegisterResponse>>(
      "/auth/register",
      form,
    );
    return response.data;
  }

  // ---------------- Login ----------------
  async login(form: LoginRequest): Promise<SuccessResponse<TokenResponse>> {
    const response = await this.client.post<SuccessResponse<TokenResponse>>("/auth/login", form);
    return response.data;
  }

  // ---------------- Logout ----------------
  async logout(): Promise<SuccessResponse> {
    const response = await this.client.post<SuccessResponse>("/public/logout");
    return response.data;
  }
}

const AuthApi = new AuthClient();
export { AuthApi };
