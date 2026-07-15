
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import { logger } from "@/lib/logger";

export const authService = {
    signInWithGoogle: async (redirectTo?: string) => {
        const referralCode = localStorage.getItem("pending_referral");
        logger.log("🔥 [Auth] Starting Google Sign In. Referral Code:", referralCode);

        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: redirectTo || `${window.location.origin}/login`,
                queryParams: referralCode ? {
                    referred_by: referralCode // Some implementations use queryParams
                } : undefined
            },
        });
        if (error) throw error;
        return data;
    },

    signOut: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    getSession: async () => {
        const { data } = await supabase.auth.getSession();
        return data.session;
    },

    checkUserExists: async () => {
        try {
            logger.log("Checking user existence via /user/me...");
            const response = await api.get("/user/me");

            logger.log("API Response /user/me:", response.data);

            // Extract info
            const role = response.data.role || 'driver'; // Default to driver if missing

            // Check if application is truly present and valid (e.g., has an ID)
            const app = response.data.application;
            const hasApplication = !!(app && app.id && app.id !== '00000000-0000-0000-0000-000000000000');

            return {
                exists: hasApplication,
                role: role
            };
        } catch (error: any) {
            logger.error("API Error /user/me:", error);
            // ONLY treat 404 as "User does not exist" (= needs registration)
            // Any other error (500, network, timeout) should be THROWN so the UI handles it
            if (error.response?.status === 404) {
                return { exists: false, role: 'driver' };
            }
            throw error;
        }
    },

    applyReferral: async (code: string) => {
        try {
            logger.log("⚙️ Auto-applying pending referral:", code);
            const response = await api.put("/user/profile", { referral_code: code });
            logger.log("✅ Referral API Response:", response.data);
            return response.data;
        } catch (error: any) {
            logger.error("Auto-referral failed:", error.response?.data || error.message);
            throw error;
        }
    }
};
