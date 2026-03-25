const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api/v1";
const TOKEN_KEY = "nps_token";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

function buildHeaders(method: HttpMethod, extra?: Record<string, string>): Record<string, string> {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers: Record<string, string> = { ...extra };

  if (method !== "GET" && method !== "DELETE") {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

function handleUnauthorized() {
  localStorage.removeItem(TOKEN_KEY);
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const method = options.method ?? "GET";

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: buildHeaders(method, options.headers),
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    if (res.status === 401) {
      handleUnauthorized();
    }
    throw new ApiError((data && (data.detail as string)) || "Request failed", res.status, data);
  }

  return data as T;
}

export { API_BASE_URL, TOKEN_KEY };