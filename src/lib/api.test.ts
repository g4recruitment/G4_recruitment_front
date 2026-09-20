import { describe, it, expect, vi, beforeEach } from "vitest";
import type { InternalAxiosRequestConfig } from "axios";
import { AxiosError } from "axios";
import { supabase } from "./supabase";
import { api, resolveBaseURL } from "./api";

vi.mock("./supabase", () => ({
    supabase: { auth: { getSession: vi.fn() } },
}));

const getSession = vi.mocked(supabase.auth.getSession);

// Axios keeps its interceptors in an internal `handlers` array; running them
// directly is the only way to test them without a real network round-trip.
type Handler = { fulfilled?: (v: unknown) => unknown; rejected?: (e: unknown) => unknown };
const requestInterceptor = (api.interceptors.request as unknown as { handlers: Handler[] }).handlers[0];
const responseInterceptor = (api.interceptors.response as unknown as { handlers: Handler[] }).handlers[0];

const config = () => ({ headers: {} }) as unknown as InternalAxiosRequestConfig;

const httpError = (status: number) =>
    new AxiosError("failed", "ERR_BAD_RESPONSE", undefined, undefined, {
        status,
        data: "",
        statusText: "",
        headers: {},
        config: {} as never,
    });

beforeEach(() => {
    getSession.mockReset();
});

describe("resolveBaseURL", () => {
    // The real backend answers on /api (a probe of /api/user/me returns 401,
    // while /api/api/user/me and /user/me both 404), so every form below has to
    // land on exactly one /api.
    it.each([
        ["https://g4-recruitment-api.onrender.com", "https://g4-recruitment-api.onrender.com/api"],
        ["https://g4-recruitment-api.onrender.com/", "https://g4-recruitment-api.onrender.com/api"],
        ["https://g4-recruitment-api.onrender.com/api", "https://g4-recruitment-api.onrender.com/api"],
        ["https://g4-recruitment-api.onrender.com/api/", "https://g4-recruitment-api.onrender.com/api"],
        ["  https://g4-recruitment-api.onrender.com/api  ", "https://g4-recruitment-api.onrender.com/api"],
    ])("normalizes %s", (raw, expected) => {
        expect(resolveBaseURL(raw)).toBe(expected);
    });

    it.each([undefined, "", "   "])("falls back to localhost for %o", (raw) => {
        expect(resolveBaseURL(raw)).toBe("http://localhost:8080/api");
    });

    it("configures the shared client with the normalized URL", () => {
        expect(api.defaults.baseURL).toBe("https://api.test/api");
    });
});

describe("api request interceptor", () => {
    it("attaches the Supabase access token as a bearer header", async () => {
        getSession.mockResolvedValue({ data: { session: { access_token: "tok-123" } } } as never);

        const result = (await requestInterceptor.fulfilled!(config())) as InternalAxiosRequestConfig;

        expect(result.headers.Authorization).toBe("Bearer tok-123");
    });

    it("leaves the request unauthenticated when there is no session", async () => {
        getSession.mockResolvedValue({ data: { session: null } } as never);

        const result = (await requestInterceptor.fulfilled!(config())) as InternalAxiosRequestConfig;

        expect(result.headers.Authorization).toBeUndefined();
    });
});

describe("api response interceptor", () => {
    it("announces a 401 so AuthProvider can log the user out", async () => {
        const listener = vi.fn();
        window.addEventListener("auth:unauthorized", listener);

        await expect(responseInterceptor.rejected!(httpError(401))).rejects.toBeInstanceOf(AxiosError);
        expect(listener).toHaveBeenCalledTimes(1);

        window.removeEventListener("auth:unauthorized", listener);
    });

    it.each([403, 404, 500])("does not log the user out on a %i", async (status) => {
        const listener = vi.fn();
        window.addEventListener("auth:unauthorized", listener);

        await expect(responseInterceptor.rejected!(httpError(status))).rejects.toBeTruthy();
        expect(listener).not.toHaveBeenCalled();

        window.removeEventListener("auth:unauthorized", listener);
    });

    it("passes successful responses through untouched", () => {
        const response = { status: 200, data: { ok: true } };

        expect(responseInterceptor.fulfilled!(response)).toBe(response);
    });
});
