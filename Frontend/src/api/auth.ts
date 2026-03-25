import { apiRequest } from "./client";

export type UserRole = "citizen" | "government";

export interface AuthUser {
  id: number;
  iin: string;
  name: string;
  email: string | null;
  role: UserRole;
  region_id: number | null;
  created_at: string;
}

export interface RegisterPayload {
  iin: string;
  name: string;
  email?: string | null;
  password: string;
  role: UserRole;
}

export interface LoginPayload {
  iin: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: "bearer";
}

export async function register(payload: RegisterPayload): Promise<AuthUser> {
  return apiRequest<AuthUser>("/auth/register", { method: "POST", body: payload });
}

export async function login(payload: LoginPayload): Promise<TokenResponse> {
  return apiRequest<TokenResponse>("/auth/login", { method: "POST", body: payload });
}

export async function getMe(): Promise<AuthUser> {
  return apiRequest<AuthUser>("/auth/me");
}

