import { apiRequest } from "./client";

export type UserRole = "citizen" | "government";

export interface AuthUser {
  id: number;
  iin: string | null;
  name: string;
  email: string | null;
  role: UserRole;
  region_id: number | null;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: "bearer";
}

// --- Government (админ) — логин по ИИН ---

export interface AdminRegisterPayload {
  iin: string;
  name: string;
  email?: string | null;
  password: string;
  role: UserRole;
}

export interface AdminLoginPayload {
  iin: string;
  password: string;
}

export async function adminRegister(payload: AdminRegisterPayload): Promise<AuthUser> {
  return apiRequest<AuthUser>("/auth/register", { method: "POST", body: payload });
}

export async function adminLogin(payload: AdminLoginPayload): Promise<TokenResponse> {
  return apiRequest<TokenResponse>("/auth/login", { method: "POST", body: payload });
}

// --- Citizen (юзер) — логин по телефону ---

export interface UserRegisterPayload {
  name: string;
  phone: string;
  password: string;
}

export interface UserLoginPayload {
  phone: string;
  password: string;
}

export async function userRegister(payload: UserRegisterPayload): Promise<TokenResponse> {
  return apiRequest<TokenResponse>("/auth/user-register", { method: "POST", body: payload });
}

export async function userLogin(payload: UserLoginPayload): Promise<TokenResponse> {
  return apiRequest<TokenResponse>("/auth/user-login", { method: "POST", body: payload });
}

// --- Общее ---

export async function getMe(): Promise<AuthUser> {
  return apiRequest<AuthUser>("/auth/me");
}