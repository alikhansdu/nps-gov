// Frontend-only mode for UI development without backend.
// Set VITE_FRONTEND_ONLY=0 when backend is ready.
export const FRONTEND_ONLY = (import.meta.env.VITE_FRONTEND_ONLY ?? "0") === "1";

