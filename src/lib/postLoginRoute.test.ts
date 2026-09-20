import { describe, it, expect } from "vitest";
import { resolvePostLoginRoute, type PostLoginContext } from "./postLoginRoute";

const ctx = (over: Partial<PostLoginContext> = {}): PostLoginContext => ({
    role: "driver",
    exists: false,
    isAdminLoginAttempt: false,
    pendingType: null,
    ...over,
});

describe("resolvePostLoginRoute", () => {
    describe('"Log in as Admin" flow', () => {
        it("lets a real admin into the dashboard", () => {
            expect(resolvePostLoginRoute(ctx({ isAdminLoginAttempt: true, role: "admin" }))).toEqual({
                kind: "navigate",
                path: "/admin",
                toast: { type: "success", message: "Welcome, Administrator" },
            });
        });

        it("bounces a driver to the profile with an error", () => {
            const decision = resolvePostLoginRoute(ctx({ isAdminLoginAttempt: true, role: "driver", exists: true }));
            expect(decision).toMatchObject({ kind: "navigate", path: "/profile" });
            expect(decision).toHaveProperty("toast.type", "error");
        });
    });

    it("sends admins to the dashboard even without the admin button", () => {
        expect(resolvePostLoginRoute(ctx({ role: "admin" }))).toEqual({ kind: "navigate", path: "/admin" });
    });

    it("sends a registered driver to the profile", () => {
        expect(resolvePostLoginRoute(ctx({ exists: true }))).toEqual({ kind: "navigate", path: "/profile" });
    });

    // Regression: AuthCallback used to check pendingType first, so a stale
    // `pendingDriverType` in localStorage threw registered drivers back into
    // the wizard. See the note in postLoginRoute.ts.
    it("ignores a stale pendingType when the driver already applied", () => {
        expect(resolvePostLoginRoute(ctx({ exists: true, pendingType: "luxury" }))).toEqual({
            kind: "navigate",
            path: "/profile",
        });
    });

    it("resumes registration on the chosen type", () => {
        expect(resolvePostLoginRoute(ctx({ pendingType: "luxury" }))).toMatchObject({ path: "/register/luxury" });
        expect(resolvePostLoginRoute(ctx({ pendingType: "regular" }))).toMatchObject({ path: "/register/regular" });
    });

    it("treats an unknown pendingType as regular rather than dead-ending", () => {
        expect(resolvePostLoginRoute(ctx({ pendingType: "something-else" }))).toMatchObject({
            path: "/register/regular",
        });
    });

    it("asks for a driver type when there is nothing to resume", () => {
        const decision = resolvePostLoginRoute(ctx());
        expect(decision.kind).toBe("selectType");
        expect(decision).toHaveProperty("toast.type", "info");
    });
});
