
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/auth.service";

const AuthCallback = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState("Initializing...");
    const [details, setDetails] = useState("");
    const processed = useRef(false);

    useEffect(() => {
        if (processed.current) return;
        processed.current = true;

        const handleCallback = async () => {
            // 1. Inspect URL before Supabase might clean it
            const hash = window.location.hash;
            const search = window.location.search;
            const hasCode = search.includes("code=");
            const hasToken = hash.includes("access_token=");
            const hasError = search.includes("error=") || hash.includes("error=");

            setStatus("Analyzing URL parameters...");
            setDetails(`Code: ${hasCode}, Token: ${hasToken}, Error: ${hasError}`);

            if (hasError) {
                setStatus("OAuth Error detected");
                toast.error("Login failed (Provider Error)");
                setTimeout(() => navigate("/login"), 3000);
                return;
            }

            if (!hasCode && !hasToken) {
                // No auth params? Maybe we already have a session?
                console.log("No auth params found. Checking existing session...");
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    setStatus("Session found (Persisted)");
                    handleRedirect(session);
                } else {
                    setStatus("No credentials found");
                    setDetails("URL has no code/token and no session exists.");
                    setTimeout(() => navigate("/login"), 3000);
                }
                return;
            }

            // 2. Let Supabase process the exchange
            setStatus("Exchanging code for session...");

            // MANUAL HASH PROCESSING
            if (hasToken && !hasCode) {
                try {
                    const params = new URLSearchParams(hash.substring(1)); // Remove #
                    const access_token = params.get("access_token");
                    const refresh_token = params.get("refresh_token");

                    // Debug info
                    const paramKeys = Array.from(params.keys()).join(", ");
                    setDetails(`Keys found: ${paramKeys}`);

                    if (access_token) {
                        if (refresh_token) {
                            setStatus("Manual token extraction (Full)...");
                            const { data, error } = await supabase.auth.setSession({
                                access_token,
                                refresh_token,
                            });
                            if (!error && data.session) {
                                setStatus("Manual Session Established!");
                                handleRedirect(data.session);
                                return;
                            } else {
                                setDetails(`SetSession Failed: ${error?.message}`);
                            }
                        } else {
                            // Fallback: Try getting user with just access token
                            setStatus("Missing Refresh Token - Verifying Access Token...");
                            const { data: { user }, error } = await supabase.auth.getUser(access_token);

                            if (!error && user) {
                                setStatus("User Verified (No Persistence)");
                                handleRedirect({ user });
                                return;
                            } else {
                                setDetails(`GetUser Failed: ${error?.message}`);
                            }
                        }
                    }
                } catch (err: any) {
                    console.error("Manual token processing failed:", err);
                    setDetails(`Processing Exception: ${err.message}`);
                }
            }

            // Listen for the specific SIGNED_IN event that completes the exchange
            const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
                console.log("Callback Auth Event:", event);

                if (event === 'SIGNED_IN' && session) {
                    setStatus("Exchange Successful!");
                    handleRedirect(session);
                } else if (event === 'SIGNED_OUT') {
                    // Sometimes happens before signed in?
                }
            });

            // Trigger getSession to force the client to check the URL params
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) {
                console.error("getSession error:", error);
                setStatus("Error during exchange");
                setDetails(error.message);
                return;
            }

            if (session) {
                // Immediate success (e.g. Implicit flow or fast PKCE)
                setStatus("Session established immediately");
                handleRedirect(session);
            } else {
                setStatus("Waiting for session establishment...");
            }
        };

        handleCallback();

    }, [navigate]);

    const handleRedirect = async (session: any) => {
        const user = session.user;
        const pendingType = localStorage.getItem("pendingDriverType");

        console.log("Redirecting user:", user.email, "Pending Type:", pendingType);
        setStatus("Verifying user profile and role...");

        try {
            // Check role and existence in our backend
            const response = await authService.checkUserExists();

            // --- AUTO APPLY REFERRAL ---
            const pendingReferral = localStorage.getItem("pending_referral");
            if (pendingReferral) {
                console.log("⚙️ Auto-applying pending referral in callback:", pendingReferral);
                try {
                    await authService.applyReferral(pendingReferral);
                    toast.success(`✅ Linked to referrer: ${pendingReferral}`);
                    localStorage.removeItem("pending_referral");
                } catch (err: any) {
                    // Handle specific errors as in the user script
                    if (err.response?.status === 409) {
                        console.log("User already has a referrer.");
                        localStorage.removeItem("pending_referral");
                    } else if (err.response?.status === 400 && err.response?.data?.message?.includes("yourself")) {
                        toast.error("⚠️ You cannot refer yourself.");
                        localStorage.removeItem("pending_referral");
                    } else {
                        console.error("Auto-referral apply failed silently:", err);
                    }
                }
            }
            // ---------------------------

            const isAdminLoginAttempt = localStorage.getItem("isAdminLoginAttempt") === "true";
            localStorage.removeItem("isAdminLoginAttempt");

            // Enforcement for "Log in as Admin" button
            if (isAdminLoginAttempt) {
                if (response.role === 'admin') {
                    console.log("Admin login success, redirecting to dashboard");
                    toast.success("Welcome, Administrator");
                    navigate("/admin");
                } else {
                    console.log("Non-admin user tried to log in as admin");
                    toast.error("Only an admin can enter the dashboard");
                    navigate("/profile");
                }
                return;
            }

            // Normal redirection logic
            if (response.role === 'admin') {
                console.log("Admin detected during normal login, redirecting to dashboard");
                navigate("/admin");
                return;
            }

            if (pendingType) {
                localStorage.removeItem("pendingDriverType");
                navigate(pendingType === "luxury" ? "/register/luxury" : "/register/regular");
            } else if (response.exists) {
                navigate("/profile");
            } else {
                // If no profile exists and no pending type, go home or profile
                navigate("/profile");
            }
        } catch (error) {
            console.error("Redirection error:", error);
            // Default fallback
            navigate("/profile");
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <h2 className="text-xl font-semibold mb-2">{status}</h2>
            <p className="text-muted-foreground text-sm font-mono max-w-lg break-all bg-secondary/30 p-2 rounded">
                {details}
            </p>

            <Button
                variant="outline"
                className="mt-8"
                onClick={() => navigate("/login")}
            >
                Back to Login
            </Button>
        </div>
    );
};

export default AuthCallback;
