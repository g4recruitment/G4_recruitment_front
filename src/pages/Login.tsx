import { authService } from "@/services/auth.service";
import { useSearchParams } from "react-router-dom";
import { Loader2, ArrowLeft, Crown, Car } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { ASSETS } from "@/lib/assets";
import { resolvePostLoginRoute } from "@/lib/postLoginRoute";
import { logger } from "@/lib/logger";
import type { Session } from "@supabase/supabase-js";

const BG_IMAGE = ASSETS.heroDriverPov;
const G4_LOGO = ASSETS.logoGold;

const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
        <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.657 13.075 17.64 11.273 17.64 9.2z" />
        <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
        <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.039l3.007-2.332z" />
        <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" />
    </svg>
);

const panelVariants = {
    initial: { opacity: 0, y: 16, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, y: -10, scale: 0.98, transition: { duration: 0.25 } },
};

const Login = () => {
    const [searchParams] = useSearchParams();
    const urlType = searchParams.get("type");
    const storedType = localStorage.getItem("pendingDriverType");
    const driverType = urlType || storedType;

    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [viewMode, setViewMode] = useState<"selection" | "login">(driverType ? "login" : "selection");

    useEffect(() => {
        if (driverType) setViewMode("login");
    }, [driverType]);

    useEffect(() => {
        const checkUserAndRedirect = async (session: Session | { user?: { email?: string } } | null) => {
            if (session?.user?.email) {
                setIsLoading(true);
                try {
                    const { exists, role } = await authService.checkUserExists();

                    const isAdminLoginAttempt = localStorage.getItem("isAdminLoginAttempt") === "true";
                    localStorage.removeItem("isAdminLoginAttempt");

                    const decision = resolvePostLoginRoute({ role, exists, isAdminLoginAttempt, pendingType: driverType });

                    if (decision.kind === "selectType") {
                        if (decision.toast) toast[decision.toast.type](decision.toast.message);
                        setViewMode("selection");
                        return;
                    }

                    if (decision.path.startsWith("/register")) localStorage.removeItem("pendingDriverType");
                    if (decision.toast) toast[decision.toast.type](decision.toast.message);
                    navigate(decision.path);
                } catch (err) {
                    logger.error(err);
                    toast.error("Error verifying account status.");
                } finally {
                    setIsLoading(false);
                }
            }
        };

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
            if (session) checkUserAndRedirect(session);
        });

        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                checkUserAndRedirect(session);
            } else {
                const hash = window.location.hash;
                if (hash && hash.includes("access_token")) {
                    try {
                        const params = new URLSearchParams(hash.substring(1));
                        const access_token = params.get("access_token");
                        const refresh_token = params.get("refresh_token");
                        if (access_token && refresh_token) {
                            supabase.auth.setSession({ access_token, refresh_token }).then(({ data, error }) => {
                                if (!error && data.session) checkUserAndRedirect(data.session);
                            });
                        }
                    } catch (e) {
                        logger.error("Hash parsing error:", e);
                    }
                }
            }
        });

        return () => subscription.unsubscribe();
    }, [navigate, driverType]);

    const handleGoogleLogin = async () => {
        try {
            if (driverType) localStorage.setItem("pendingDriverType", driverType);
            await authService.signInWithGoogle();
        } catch {
            toast.error("Error signing in with Google");
        }
    };

    const handleSelection = async (type: "regular" | "luxury") => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            navigate(type === "luxury" ? "/register/luxury" : "/register/regular");
        } else {
            navigate(`/login?type=${type}`);
        }
    };

    const isLuxury = driverType === "luxury";

    return (
        <div className="min-h-[100dvh] bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden">

            {/* Background image */}
            <div className="absolute inset-0 z-0">
                <img
                    src={BG_IMAGE}
                    alt=""
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-zinc-950/65" />
                {isLuxury && (
                    <div className="absolute inset-0 bg-[#D4AF37]/6" />
                )}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-zinc-950 to-transparent" />
            </div>

            {/* Back to home */}
            <button
                onClick={() => navigate("/")}
                className="absolute top-5 left-5 z-20 flex items-center gap-1.5 text-white/40 hover:text-white/80 text-sm transition-colors duration-200"
            >
                <ArrowLeft className="w-4 h-4" />
                Back
            </button>

            <AnimatePresence mode="wait">

                {viewMode === "selection" ? (
                    /* ── SELECTION MODE ── */
                    <motion.div
                        key="selection"
                        variants={panelVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="relative z-10 w-full max-w-lg"
                    >
                        <div className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-[0_32px_80px_rgba(0,0,0,0.6)] shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]">

                            {/* Logo */}
                            <div className="flex justify-center mb-7">
                                <img src={G4_LOGO} alt="G4 Car Services" className="h-8 w-auto object-contain" />
                            </div>

                            {/* Header */}
                            <div className="text-center mb-8">
                                <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">
                                    Join G4 Car Services
                                </h1>
                                <p className="text-gray-400 text-sm">
                                    Select your driver category to begin the application
                                </p>
                            </div>

                            {/* Driver type cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-7">
                                {/* Luxury */}
                                <button
                                    onClick={() => handleSelection("luxury")}
                                    className="group relative text-left p-5 rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/5 hover:border-[#D4AF37]/70 hover:bg-[#D4AF37]/10 transition-all duration-300 overflow-hidden"
                                >
                                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
                                    <div className="mb-3">
                                        <div className="w-9 h-9 rounded-full bg-[#D4AF37]/15 flex items-center justify-center mb-3">
                                            <Crown className="w-4 h-4 text-[#D4AF37]" />
                                        </div>
                                        <img
                                            src={ASSETS.carEscalade}
                                            alt="Luxury Escalade"
                                            className="w-full h-20 object-contain drop-shadow-lg group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                    <p className="font-bold text-white text-sm mb-0.5">Luxury Driver</p>
                                    <p className="text-[10px] text-[#D4AF37]/70 uppercase tracking-widest">Premium fleet</p>
                                </button>

                                {/* Standard */}
                                <button
                                    onClick={() => handleSelection("regular")}
                                    className="group relative text-left p-5 rounded-xl border border-white/10 bg-white/4 hover:border-white/20 hover:bg-white/8 transition-all duration-300 overflow-hidden"
                                >
                                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="mb-3">
                                        <div className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center mb-3">
                                            <Car className="w-4 h-4 text-gray-300" />
                                        </div>
                                        <img
                                            src={ASSETS.carCorolla}
                                            alt="Standard Sedan"
                                            className="w-full h-20 object-contain grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                                        />
                                    </div>
                                    <p className="font-bold text-white text-sm mb-0.5">Standard Driver</p>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">Your vehicle</p>
                                </button>
                            </div>

                            {/* Divider */}
                            <div className="flex items-center gap-3 mb-5">
                                <div className="flex-1 border-t border-white/8" />
                                <span className="text-[11px] text-gray-600 uppercase tracking-wider shrink-0">
                                    Already registered
                                </span>
                                <div className="flex-1 border-t border-white/8" />
                            </div>

                            <button
                                onClick={() => setViewMode("login")}
                                className="w-full py-2.5 text-sm text-[#D4AF37]/80 hover:text-[#D4AF37] transition-colors duration-200 font-medium"
                            >
                                Sign in to your account
                            </button>
                        </div>
                    </motion.div>

                ) : (
                    /* ── LOGIN MODE ── */
                    <motion.div
                        key="login"
                        variants={panelVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="relative z-10 w-full max-w-sm"
                    >
                        <div
                            className={`bg-black/50 backdrop-blur-xl rounded-2xl p-8 shadow-[0_32px_80px_rgba(0,0,0,0.6)] shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] border transition-colors duration-500 ${
                                isLuxury ? "border-[#D4AF37]/25" : "border-white/10"
                            }`}
                        >
                            {/* Logo */}
                            <div className="flex flex-col items-center mb-6">
                                <img src={G4_LOGO} alt="G4 Car Services" className="h-8 w-auto object-contain mb-5" />
                                <div className="w-10 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent" />
                            </div>

                            {/* Type badge — only when a type is selected */}
                            {driverType && (
                                <div className="flex justify-center mb-5">
                                    <span
                                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.18em] border ${
                                            isLuxury
                                                ? "border-[#D4AF37]/40 text-[#D4AF37] bg-[#D4AF37]/8"
                                                : "border-white/15 text-gray-300 bg-white/5"
                                        }`}
                                    >
                                        {isLuxury ? <Crown className="w-3 h-3" /> : <Car className="w-3 h-3" />}
                                        {isLuxury ? "Luxury Driver" : "Standard Driver"}
                                    </span>
                                </div>
                            )}

                            {/* Header */}
                            <div className="text-center mb-7">
                                <h1 className="text-xl font-bold text-white mb-2 tracking-tight">
                                    {driverType ? "Continue Your Application" : "Welcome Back"}
                                </h1>
                                <p className="text-gray-500 text-sm leading-relaxed">
                                    {driverType
                                        ? "Sign in with Google to complete your registration"
                                        : "Sign in to access your G4 driver account"}
                                </p>
                            </div>

                            {/* Google button */}
                            <button
                                onClick={handleGoogleLogin}
                                disabled={isLoading}
                                className="w-full h-12 flex items-center justify-center gap-3 bg-white hover:bg-gray-50 active:scale-[0.98] text-zinc-900 font-semibold text-sm rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_2px_12px_rgba(0,0,0,0.4)]"
                            >
                                {isLoading
                                    ? <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
                                    : <GoogleIcon />
                                }
                                {isLoading ? "Verifying account..." : "Continue with Google"}
                            </button>

                            {/* Separator */}
                            <div className="flex items-center gap-3 my-5">
                                <div className="flex-1 border-t border-white/8" />
                                <span className="text-[11px] text-gray-600 uppercase tracking-wider shrink-0">
                                    {driverType ? "or" : "Not registered yet?"}
                                </span>
                                <div className="flex-1 border-t border-white/8" />
                            </div>

                            {/* Bottom action */}
                            {driverType ? (
                                /* With type: styled "change type" button */
                                <button
                                    onClick={() => navigate("/login")}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 bg-white/4 hover:border-white/20 hover:bg-white/8 text-gray-400 hover:text-white text-xs font-medium transition-all duration-200"
                                >
                                    <ArrowLeft className="w-3.5 h-3.5" />
                                    Change driver type
                                </button>
                            ) : (
                                /* Without type: two apply buttons */
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => handleSelection("luxury")}
                                        className="group flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border border-[#D4AF37]/25 bg-[#D4AF37]/5 hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/10 transition-all duration-300"
                                    >
                                        <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
                                        <span className="text-[10px] font-semibold text-white">Luxury</span>
                                        <span className="text-[9px] text-[#D4AF37]/60 uppercase tracking-wider">Apply</span>
                                    </button>
                                    <button
                                        onClick={() => handleSelection("regular")}
                                        className="group flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border border-white/10 bg-white/4 hover:border-white/20 hover:bg-white/8 transition-all duration-300"
                                    >
                                        <Car className="w-3.5 h-3.5 text-gray-400" />
                                        <span className="text-[10px] font-semibold text-white">Standard</span>
                                        <span className="text-[9px] text-gray-600 uppercase tracking-wider">Apply</span>
                                    </button>
                                </div>
                            )}

                            <p className="text-[10px] text-gray-700 text-center mt-5 leading-relaxed">
                                By continuing, you agree to our Terms of Service and Privacy Policy.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Login;
