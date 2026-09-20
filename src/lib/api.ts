
import axios from 'axios';
import { supabase } from './supabase';
import { logger } from './logger';

/**
 * Builds the API base URL out of VITE_API_URL.
 *
 * The backend serves everything under /api, but the variable is typed by hand
 * per environment (.env locally, the Vercel dashboard in production) and shows
 * up both with and without that suffix — appending it blindly turned every
 * request into /api/api, which 404s. Normalizing here means a typo in the
 * dashboard can't take production down.
 */
export const resolveBaseURL = (raw?: string): string => {
    const base = (raw || '').trim().replace(/\/+$/, '') || 'http://localhost:8080';
    return base.endsWith('/api') ? base : `${base}/api`;
};

export const api = axios.create({
    baseURL: resolveBaseURL(import.meta.env.VITE_API_URL),
    timeout: 15000,
});

api.interceptors.request.use(async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            logger.warn("⚠️ API reported 401 Unauthorized. Dispatching auth:unauthorized event.");
            window.dispatchEvent(new Event('auth:unauthorized'));
        }
        return Promise.reject(error);
    }
);
