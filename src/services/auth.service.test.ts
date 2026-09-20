import { describe, it, expect, vi, beforeEach } from "vitest";
import { AxiosError } from "axios";
import { api } from "@/lib/api";
import { authService } from "./auth.service";

vi.mock("@/lib/api", () => ({
    api: { get: vi.fn(), put: vi.fn(), post: vi.fn() },
}));

const apiGet = vi.mocked(api.get);
const apiPut = vi.mocked(api.put);

const httpError = (status: number) =>
    new AxiosError("request failed", "ERR_BAD_RESPONSE", undefined, undefined, {
        status,
        data: "error",
        statusText: "",
        headers: {},
        config: {} as never,
    });

beforeEach(() => {
    localStorage.clear();
});

describe("authService.checkUserExists", () => {
    it("reports an existing application with its role", async () => {
        apiGet.mockResolvedValue({ data: { role: "admin", application: { id: "abc-123" } } });

        await expect(authService.checkUserExists()).resolves.toEqual({ exists: true, role: "admin" });
        expect(apiGet).toHaveBeenCalledWith("/user/me");
    });

    it("defaults to the driver role when the backend omits it", async () => {
        apiGet.mockResolvedValue({ data: { application: { id: "abc-123" } } });

        await expect(authService.checkUserExists()).resolves.toEqual({ exists: true, role: "driver" });
    });

    it("treats a user with no application as not registered", async () => {
        apiGet.mockResolvedValue({ data: { role: "driver" } });

        await expect(authService.checkUserExists()).resolves.toMatchObject({ exists: false });
    });

    // The backend hands back a zero UUID for an empty application row; taking it
    // as real would send a registered-looking user to a profile with no data.
    it("does not count the zero-UUID placeholder application", async () => {
        apiGet.mockResolvedValue({
            data: { role: "driver", application: { id: "00000000-0000-0000-0000-000000000000" } },
        });

        await expect(authService.checkUserExists()).resolves.toMatchObject({ exists: false });
    });

    it("maps a 404 to 'needs registration'", async () => {
        apiGet.mockRejectedValue(httpError(404));

        await expect(authService.checkUserExists()).resolves.toEqual({ exists: false, role: "driver" });
    });

    // A 500 or a network blip must NOT look like "new user", or the app would
    // push an already-registered driver back through the whole wizard.
    it.each([500, 401, 503])("rethrows a %i instead of pretending the user is new", async (status) => {
        apiGet.mockRejectedValue(httpError(status));

        await expect(authService.checkUserExists()).rejects.toBeInstanceOf(AxiosError);
    });

    it("rethrows network errors with no response", async () => {
        apiGet.mockRejectedValue(new Error("Network Error"));

        await expect(authService.checkUserExists()).rejects.toThrow("Network Error");
    });
});

describe("authService.applyReferral", () => {
    it("sends the code to the profile endpoint with PUT", async () => {
        apiPut.mockResolvedValue({ data: { status: "updated" } });

        await expect(authService.applyReferral("G4-XYZ")).resolves.toEqual({ status: "updated" });
        expect(apiPut).toHaveBeenCalledWith("/user/profile", { referral_code: "G4-XYZ" });
    });

    it("propagates a 409 so the caller can tell the user they were already referred", async () => {
        apiPut.mockRejectedValue(httpError(409));

        await expect(authService.applyReferral("G4-XYZ")).rejects.toBeInstanceOf(AxiosError);
    });
});
