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
export interface ApiClientOptions extends RequestInit {
    rawResponse?: boolean;
    auth?: boolean;
}

/**
 * Wrapper around fetch to include credentials and standard headers if needed.
 */
export async function apiFetch(path: string, options: ApiClientOptions = {}) {
    const { rawResponse, auth = true, ...fetchOptions } = options;
    const url = buildApiUrl(path);

    console.log('[apiFetch]', fetchOptions.method || 'GET', url, 'rawResponse=', rawResponse);

    // Default headers
    const headers = new Headers(fetchOptions.headers);

    // Add token if it exists and not already present, AND if auth is true
    const token = localStorage.getItem('token');
    if (auth && token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    // Ensure Content-Type is NOT set if body is FormData (browser handles it)
    if (fetchOptions.body instanceof FormData) {
        if (headers.has('Content-Type')) {
            headers.delete('Content-Type');
        }
    } else if (!headers.has('Content-Type')) {
        // Default to JSON if not specified and not FormData
        // headers.set('Content-Type', 'application/json'); 
    }

    try {
        const res = await fetch(url, {
            credentials: "include",
            ...fetchOptions,
            headers
        });

        // If rawResponse is true, return the response object directly
        if (rawResponse) {
            return res;
        }

        // Default behavior: if !ok, try to parse JSON and throw Error with clear message
        if (!res.ok) {
            let message = 'Error en la petición a la API.';
            try {
                const data = await res.json();
                if (data && typeof data.message === 'string') {
                    message = data.message;
                }
            } catch (_) {
                // ignore
            }
            const error = new Error(message) as Error & { status?: number };
            (error as any).status = res.status;
            throw error;
        }

        return res;
    } catch (error) {
        console.error('[apiFetch] network error', error);
        throw error;
    }
}

export const API_CONFIG = {
    BASE_URL: API_BASE_URL || DEFAULT_DEV_API
};
