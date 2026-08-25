import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { authService } from "@/services/auth.service";

const FullScreenSpinner = () => (
    <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
    </div>
);

/**
 * Requires an authenticated Supabase session. While the session is still
 * being resolved we show a spinner; unauthenticated users are redirected
 * to /login. This is defense-in-depth — the backend JWT middleware remains
 * the real authorization barrier.
 */
export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
    const { session, isLoading } = useAuth();

    if (isLoading) return <FullScreenSpinner />;
    if (!session) return <Navigate to="/login" replace />;

    return <>{children}</>;
};

/**
 * Requires an authenticated session AND role === 'admin' (as reported by the
 * backend via /user/me). Non-admins are bounced to /profile so the
 * AdminDashboard never mounts or fires its queries for them.
 */
export const AdminRoute = ({ children }: { children: ReactNode }) => {
    const { session, isLoading } = useAuth();

    const { data, isLoading: isRoleLoading } = useQuery({
        queryKey: ["auth", "role"],
        queryFn: authService.checkUserExists,
        enabled: !!session,
        staleTime: 5 * 60 * 1000,
    });

    if (isLoading || (session && isRoleLoading)) return <FullScreenSpinner />;
    if (!session) return <Navigate to="/login" replace />;
    if (data?.role !== "admin") return <Navigate to="/profile" replace />;

    return <>{children}</>;
};
