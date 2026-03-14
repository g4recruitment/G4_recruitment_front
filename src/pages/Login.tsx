import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { authService } from "@/services/auth.service";
import { useSearchParams } from "react-router-dom";
import g4Logo from "@/assets/g4-logo.jpg";
import { Chrome, Loader2 } from "lucide-react";
import { ParticlesBackground } from "@/components/ParticlesBackground";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const Login = () => {
    const [searchParams] = useSearchParams();
    // Prioritize URL param, fallback to localStorage (for post-OAuth return)
    const urlType = searchParams.get("type");
    const storedType = localStorage.getItem("pendingDriverType");
    const driverType = urlType || storedType;

    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    // View state: 'selection' (choose type) | 'login' (google button)
    // If we have a type, we default to 'login' mode. If not, 'selection'.
    const [viewMode, setViewMode] = useState<"selection" | "login">(driverType ? "login" : "selection");

    // Force update view mode if URL changes
    useEffect(() => {
        if (driverType) setViewMode("login");
    }, [driverType]);

    useEffect(() => {
        const checkUserAndRedirect = async (session: any) => {
            console.log("🔥 [Login] Checking user logic started. Session email:", session?.user?.email);
            if (session?.user?.email) {
                setIsLoading(true);
                try {
                    // Check if user exists (now calls /user/me, no email arg needed)
                    console.log("🔥 [Login] Calling checkUserExists()...");
                    const { exists, role } = await authService.checkUserExists();
                    console.log("🔥 [Login] checkUserExists result:", { exists, role });

                    const isAdminLoginAttempt = localStorage.getItem("isAdminLoginAttempt") === "true";
                    localStorage.removeItem("isAdminLoginAttempt");

                    // 1. Enforcement for "Log in as Admin" button
                    if (isAdminLoginAttempt) {
                        if (role === 'admin') {
                            console.log("🔥 [Login] Admin login success -> Redirecting to /admin");
                            toast.success("Welcome Administrator");
                            navigate("/admin");
                        } else {
                            console.log("🔥 [Login] Non-admin user tried to log in as admin");
                            toast.error("Only an admin can enter the dashboard");
                            navigate("/profile");
                        }
                        return;
                    }

                    // 2. Normal check for ADMIN role
                    if (role === 'admin') {
                        console.log("🔥 [Login] Decision: Role is ADMIN -> Redirecting to /admin");
                        navigate("/admin");
                        return;
                    }

                    // 3. Check for Driver Application
                    if (exists) {
                        console.log("🔥 [Login] Decision: Driver Application FOUND -> Redirecting to /profile");
                        navigate("/profile");
                    } else {
                        // 4. New User / Pending Registration
                        console.log("🔥 [Login] Decision: Driver Application MISSING");

                        if (driverType) {
                            console.log("🔥 [Login] Pending Driver Type found:", driverType);
                            const targetRoute = driverType === "luxury" ? "/register/luxury" : "/register/regular";
                            console.log("🔥 [Login] Final Destination:", targetRoute);
                            // Clean up storage
                            localStorage.removeItem("pendingDriverType");
                            navigate(targetRoute);
                        } else {
                            // 5. New User BUT no driver type selected (Generic Login)
                            // They are authenticated but have no profile and no intention selected.
                            // We should prompt them to select.
                            console.log("🔥 [Login] No driver type selected. Staying on selection screen.");
                            toast.info("Account verified! Please select a driver type to continue.");
                            setViewMode("selection");
                        }
                    }
                } catch (err) {
                    console.error("🔥 [Login] Error in checkUserAndRedirect:", err);
                    toast.error("Error verifying account status. See console.");
                } finally {
                    setIsLoading(false);
                }
            }
        };

        // Subscription to auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log("Auth State Change:", event, session?.user?.email);
            if (session) {
                checkUserAndRedirect(session);
            }
        });

        // Initial session check
        supabase.auth.getSession().then(({ data: { session } }) => {
            console.log("Initial Session Check:", session?.user?.email);
            if (session) {
                checkUserAndRedirect(session);
            } else {
                // Fallback: Check for hash tokens if auto-detect failed
                const hash = window.location.hash;
                if (hash && hash.includes("access_token")) {
                    console.log("🔥 [Login] No session but hash found. Attempting manual recovery...");

                    try {
                        const params = new URLSearchParams(hash.substring(1));
                        const access_token = params.get("access_token");
                        const refresh_token = params.get("refresh_token");

                        if (access_token && refresh_token) {
                            supabase.auth.setSession({ access_token, refresh_token }).then(({ data, error }) => {
                                if (!error && data.session) {
                                    console.log("🔥 [Login] Manual recovery success!");
                                    checkUserAndRedirect(data.session);
                                } else {
                                    console.error("🔥 [Login] Manual recovery failed:", error);
                                }
                            });
                        }
                    } catch (e) {
                        console.error("Hash parsing error:", e);
                    }
                }
            }
        });

        return () => subscription.unsubscribe();
    }, [navigate, driverType]);

    const handleGoogleLogin = async () => {
        try {
            // Save type to localStorage before leaving for Google
            if (driverType) {
                localStorage.setItem("pendingDriverType", driverType);
            }

            console.log("🔥 [Login] Starting Google Auth with default callback...");
            await authService.signInWithGoogle();
        } catch (error) {
            toast.error("Error signing in with Google");
            console.error(error);
        }
    };

    // Handler for selection buttons.
    // If not logged in -> Redirect to login with type (which sets viewMode=login)
    // If logged in (e.g. generic login flow waiting for selection) -> Redirect to Register
    const handleSelection = async (type: "regular" | "luxury") => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            // User is already auth'd, just needs to register
            navigate(type === "luxury" ? "/register/luxury" : "/register/regular");
        } else {
            // User needs to login first with this context
            navigate(`/login?type=${type}`);
        }
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
            <ParticlesBackground type={(driverType as "luxury" | "regular") || "regular"} />

            {viewMode === "selection" ? (
                // SELECTION MODE
                <Card className="w-full max-w-2xl p-8 bg-card border-border shadow-2xl relative z-10">
                    <div className="text-center mb-8">
                        <img src={g4Logo} alt="G4 Car Service" className="h-12 mx-auto mb-6 rounded-lg" />
                        <h1 className="text-2xl font-bold text-foreground mb-2">Choose your Path</h1>
                        <p className="text-muted-foreground">
                            Select the type of driver you want to be
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <Button
                            variant="outline"
                            className="h-auto py-8 flex flex-col gap-4 hover:border-success hover:bg-success/5 hover:text-foreground transition-all"
                            onClick={() => handleSelection("regular")}
                        >
                            <div className="p-3 rounded-full bg-success/10 text-success">
                                <Chrome className="w-6 h-6" />
                            </div>
                            <div className="text-center">
                                <h3 className="font-bold text-lg mb-1">Standard Driver</h3>
                                <p className="text-sm text-muted-foreground">Own vehicle, flexible hours</p>
                            </div>
                        </Button>

                        <Button
                            variant="outline"
                            className="h-auto py-8 flex flex-col gap-4 hover:border-accent hover:bg-accent/5 hover:text-foreground transition-all"
                            onClick={() => handleSelection("luxury")}
                        >
                            <div className="p-3 rounded-full bg-accent/10 text-accent">
                                <Chrome className="w-6 h-6" />
                            </div>
                            <div className="text-center">
                                <h3 className="font-bold text-lg mb-1">Luxury Driver</h3>
                                <p className="text-sm text-muted-foreground">Premium fleet, higher rates</p>
                            </div>
                        </Button>
                    </div>

                    <div className="mt-8 flex flex-col gap-3 items-center">
                        <div className="relative w-full max-w-xs">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">
                                    Already a member?
                                </span>
                            </div>
                        </div>
                        <Button
                            onClick={() => setViewMode("login")}
                            variant="ghost"
                            className="text-primary hover:text-primary/80 font-medium"
                        >
                            Sign In to your account
                        </Button>

                        <Button
                            variant="link"
                            className="text-muted-foreground text-xs"
                            onClick={() => navigate("/")}
                        >
                            Back to Home
                        </Button>
                    </div>
                </Card>
            ) : (
                // LOGIN MODE
                <Card className="w-full max-w-md p-8 bg-card border-border shadow-2xl relative z-10">
                    <div className="text-center mb-8">
                        <img src={g4Logo} alt="G4 Car Service" className="h-12 mx-auto mb-6 rounded-lg" />
                        <h1 className="text-2xl font-bold text-foreground mb-2">
                            {driverType ? "Welcome" : "Welcome Back"}
                        </h1>
                        <p className="text-muted-foreground">
                            {driverType
                                ? <span>Sign in to continue as a <span className="capitalize font-medium text-foreground">{driverType}</span> driver</span>
                                : "Sign in to access your dashboard"}
                        </p>
                    </div>

                    <div className="space-y-4">
                        <Button
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                            className="w-full h-12 text-base font-medium flex items-center justify-center gap-2 bg-white text-black hover:bg-gray-100 border border-gray-200"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Chrome className="w-5 h-5" />}
                            {isLoading ? "Checking account..." : "Continue with Google"}
                        </Button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">
                                    Secure Authentication
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-center gap-4">
                            <Button
                                variant="link"
                                size="sm"
                                className="text-muted-foreground text-xs"
                                onClick={() => {
                                    if (driverType) {
                                        // Clear URL param if present
                                        navigate("/login");
                                    } else {
                                        setViewMode("selection");
                                    }
                                }}
                            >
                                {driverType ? "Change Driver Type" : "Register as new driver"}
                            </Button>
                        </div>

                        <p className="text-center text-sm text-muted-foreground">
                            By continuing, you agree to our Terms of Service and Privacy Policy.
                        </p>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default Login;
