import { api } from "@/lib/api";
import { AxiosError } from "axios";

export interface ValidateDocumentRequest {
    docType: 'driverLicense' | 'tlcLicense' | 'carRegistration' | 'vehicleInspection' | 'tlcDiamond' | 'insuranceFiles';
    file: string;       // base64, may include data URL prefix
    mimeType: string;
    expectedName: string;
    expectedPlate: string;
}

export interface ValidateDocumentResult {
    valid: boolean;
    extractedPlate: string;
    errorCode: 'WRONG_DOC_TYPE' | 'NAME_MISMATCH' | 'PLATE_MISMATCH' | 'EXPIRED' | 'UNREADABLE' | '';
    errorMessage: string;
}

// Maps transport-level failures to the sentinel error messages the UI expects.
// Preserves the previous fetch-based behavior (rate limit / payload size) while
// going through the shared axios instance (auth header + global 401 handling).
const toVisionError = (err: unknown): Error => {
    if (err instanceof AxiosError) {
        if (err.response?.status === 429) return new Error('RATE_LIMIT_EXCEEDED');
        if (err.response?.status === 413) return new Error('FILE_TOO_LARGE');
        const data = err.response?.data;
        const msg = typeof data === 'string' ? data : data?.message;
        return new Error(msg || 'Server error');
    }
    return err instanceof Error ? err : new Error('Server error');
};

export const visionService = {
    analyzeImage: async (base64Image: string): Promise<{ isFormal: boolean; labels: string[] }> => {
        try {
            const { data } = await api.post('/drivers/validate-photo', { image: base64Image });
            return { isFormal: data.is_formal, labels: data.labels || [] };
        } catch (err) {
            throw toVisionError(err);
        }
    },

    validateDocument: async (req: ValidateDocumentRequest): Promise<ValidateDocumentResult> => {
        try {
            const { data } = await api.post('/drivers/validate-document', req);
            return data;
        } catch (err) {
            throw toVisionError(err);
        }
    },
};
