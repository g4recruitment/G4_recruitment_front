
import { supabase } from "@/lib/supabase";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const visionService = {
    /**
     * Sends image to backend for analysis using Google Vision API.
     * @param base64Image Image in base64 format
     * @returns Object containing formal wear validation result and detected labels
     */
    analyzeImage: async (base64Image: string): Promise<{ isFormal: boolean; labels: string[] }> => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            if (!token) {
                console.warn("No auth token found");
                // Fallback for dev/testing if needed, or throw
            }

            const response = await fetch(`${API_URL}/api/drivers/validate-photo`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ image: base64Image })
            });

            if (!response.ok) {
                if (response.status === 429) {
                    throw new Error("RATE_LIMIT_EXCEEDED");
                }
                if (response.status === 413) {
                    throw new Error("FILE_TOO_LARGE");
                }
                const errorText = await response.text();
                throw new Error(errorText || "Server error");
            }

            const data = await response.json();
            // Expected data: { is_formal: boolean, labels: string[] }

            return {
                isFormal: data.is_formal,
                labels: data.labels || []
            };

        } catch (error) {
            console.error("Vision API Error:", error);
            throw error;
        }
    },

    /**
     * @deprecated Validation is now performed on the backend. 
     * This helper is kept compatibility or client-side double-check if needed.
     */
    validateFormalWear: (labels: string[]): boolean => {
        // This is now redundant as analyzeImage returns the definitive boolean
        return true;
    }
};
