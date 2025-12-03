const DEFAULT_DEV_API = "http://localhost:3001/api";

// Determine the base URL
// In production, we expect VITE_API_BASE_URL to be set.
// In development, we fallback to localhost.
const API_BASE_URL =
    (import.meta.env.PROD
        ? import.meta.env.VITE_API_BASE_URL
        : import.meta.env.VITE_API_BASE_URL || DEFAULT_DEV_API
    )?.replace(/\/$/, "");

if (!API_BASE_URL) {
    console.warn("[apiClient] API_BASE_URL no definida. Revisar VITE_API_BASE_URL en Vercel.");
}

/**
 * Helper to build the full API URL for a given path.
 * Ensures no double slashes (other than protocol).
 */
export function buildApiUrl(path: string): string {
    const safePath = path.startsWith("/") ? path : `/${path}`;
    // If path starts with /api and base url ends with /api, remove one
    // But usually API_BASE_URL includes /api.
    // Let's assume API_BASE_URL is like "https://api.com/api"

    // If the path passed is "/auth/login", result is "https://api.com/api/auth/login"
    return `${API_BASE_URL || DEFAULT_DEV_API}${safePath}`;
}

/**
 * Wrapper around fetch to include credentials and standard headers if needed.
 */
export async function apiFetch(path: string, options: RequestInit = {}) {
    const url = buildApiUrl(path);

    // Default headers
    const headers = new Headers(options.headers);

    // Add token if it exists and not already present
    const token = localStorage.getItem('token');
    if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const res = await fetch(url, {
        credentials: "include", // Important for cookies if used, though we use Bearer token mostly
        ...options,
        headers
    });
    return res;
}

export const API_CONFIG = {
    BASE_URL: API_BASE_URL || DEFAULT_DEV_API
};
