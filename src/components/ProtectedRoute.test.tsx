import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProtectedRoute, AdminRoute } from "./ProtectedRoute";
import { useAuth } from "@/providers/AuthProvider";
import { authService } from "@/services/auth.service";

vi.mock("@/providers/AuthProvider", () => ({ useAuth: vi.fn() }));
vi.mock("@/services/auth.service", () => ({
    authService: { checkUserExists: vi.fn() },
}));

const mockAuth = vi.mocked(useAuth);
const checkUserExists = vi.mocked(authService.checkUserExists);

const session = { access_token: "tok" } as never;

const setAuth = (over: Partial<ReturnType<typeof useAuth>>) =>
    mockAuth.mockReturnValue({ session: null, isLoading: false, signOut: vi.fn(), ...over });

/** Renders the guard with the sibling routes it can redirect to. */
const renderGuard = (guard: React.ReactNode) => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return render(
        <QueryClientProvider client={client}>
            <MemoryRouter initialEntries={["/protected"]}>
                <Routes>
                    <Route path="/protected" element={guard} />
                    <Route path="/login" element={<p>login page</p>} />
                    <Route path="/profile" element={<p>profile page</p>} />
                </Routes>
            </MemoryRouter>
        </QueryClientProvider>,
    );
};

const Secret = () => <p>secret content</p>;

describe("ProtectedRoute", () => {
    it("renders the page for an authenticated user", () => {
        setAuth({ session });

        renderGuard(<ProtectedRoute><Secret /></ProtectedRoute>);

        expect(screen.getByText("secret content")).toBeInTheDocument();
    });

    it("redirects to /login without a session", () => {
        setAuth({ session: null });

        renderGuard(<ProtectedRoute><Secret /></ProtectedRoute>);

        expect(screen.getByText("login page")).toBeInTheDocument();
        expect(screen.queryByText("secret content")).not.toBeInTheDocument();
    });

    // Redirecting while the session is still resolving would bounce a logged-in
    // user to /login on every hard refresh.
    it("waits instead of redirecting while the session resolves", () => {
        setAuth({ session: null, isLoading: true });

        renderGuard(<ProtectedRoute><Secret /></ProtectedRoute>);

        expect(screen.queryByText("login page")).not.toBeInTheDocument();
        expect(screen.queryByText("secret content")).not.toBeInTheDocument();
    });
});

describe("AdminRoute", () => {
    it("renders the dashboard for an admin", async () => {
        setAuth({ session });
        checkUserExists.mockResolvedValue({ exists: true, role: "admin" });

        renderGuard(<AdminRoute><Secret /></AdminRoute>);

        expect(await screen.findByText("secret content")).toBeInTheDocument();
    });

    it("sends a non-admin to /profile without mounting the dashboard", async () => {
        setAuth({ session });
        checkUserExists.mockResolvedValue({ exists: true, role: "driver" });

        renderGuard(<AdminRoute><Secret /></AdminRoute>);

        expect(await screen.findByText("profile page")).toBeInTheDocument();
        expect(screen.queryByText("secret content")).not.toBeInTheDocument();
    });

    it("does not query the role for an anonymous visitor", () => {
        setAuth({ session: null });

        renderGuard(<AdminRoute><Secret /></AdminRoute>);

        expect(screen.getByText("login page")).toBeInTheDocument();
        expect(checkUserExists).not.toHaveBeenCalled();
    });

    it("keeps the dashboard closed while the role is still unknown", () => {
        setAuth({ session });
        checkUserExists.mockReturnValue(new Promise(() => {})); // never settles

        renderGuard(<AdminRoute><Secret /></AdminRoute>);

        expect(screen.queryByText("secret content")).not.toBeInTheDocument();
        expect(screen.queryByText("profile page")).not.toBeInTheDocument();
    });
});
