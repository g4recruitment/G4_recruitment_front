
import { createContext, useContext, useEffect, useState } from "react";
import { Session, AuthChangeEvent } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";

interface AuthContextType {
    session: Session | null;
    isLoading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // 1. Initialize Session
        const initializeAuth = async () => {
            try {
                const { data: { session: initialSession } } = await supabase.auth.getSession();
                setSession(initialSession);
            } catch (error) {
                console.error("Error checking session:", error);
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();

        // 2. Listen to Supabase Auth Changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, currentSession) => {
            console.log("🔔 [Auth] State Change:", event);

            if (event === 'SIGNED_OUT') {
                setSession(null);
                // Only redirect if not already on public pages to avoid loop/jarring UX
                if (location.pathname !== '/login' && location.pathname !== '/') {
                    navigate('/login');
                }
            } else if (event === 'TOKEN_REFRESHED') {
                setSession(currentSession);
            } else if (event === 'SIGNED_IN') {
                setSession(currentSession);
            }
        });

        // 3. Listen to Custom "401" Unauthorized Events from API Interceptor
        const handleUnauthorized = async () => {
            console.warn("⚠️ [Auth] Received 401 Unauthorized event. Logging out...");
            toast.error("Session expired. Please log in again.");

            try {
                await supabase.auth.signOut();
            } catch (err) {
                console.error("Error during auto-logout:", err);
            } finally {
                // Force local cleanup
                setSession(null);
                localStorage.removeItem("pending_referral");
                localStorage.removeItem("pendingDriverType");
                navigate('/login');
            }
        };

        window.addEventListener('auth:unauthorized', handleUnauthorized);

        return () => {
            subscription.unsubscribe();
            window.removeEventListener('auth:unauthorized', handleUnauthorized);
        };
    }, [navigate, location.pathname]);

    const signOut = async () => {
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error("Error signing out:", error);
        } finally {
            // Force local cleanup regardless of server response
            setSession(null);
            localStorage.removeItem("pending_referral");
            localStorage.removeItem("pendingDriverType");
            navigate('/login');
        }
    };

    return (
        <AuthContext.Provider value={{ session, isLoading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
