
import { api } from "@/lib/api";

export interface DashboardProfile {
    email: string;
    referral_code: string;
    avatar_url: string;
    status: string;
    full_name: string;
}

export interface ReferralStats {
    total_referred: number;
    total_pages: number;
    current_page: number;
    items_per_page: number;
}

export interface ReferralItem {
    email: string;
    full_name: string;
    avatar_url: string;
    joined_at: string;
    status: string;
}

export interface DriverApplication {
    id: string;
    user_id: string;
    full_name: string;
    address: string;
    phone_number: string;
    emergency_number: string;
    device_type: string;
    vehicle_type: string;
    passenger_capacity: number;
    driver_category: string;
    driver_license_url: string;
    tlc_license_url: string;
    car_registration_url: string;
    vehicle_inspection_url: string;
    tlc_diamond_url: string;
    insurance_files_urls: string[];
    profile_photo_url: string;
    vehicle_photos_urls: string[];
    status: string;
    created_at: string;
    additional_info?: unknown;
}

export interface UserDashboard {
    profile: DashboardProfile;
    referral_stats: ReferralStats;
    referral_list: ReferralItem[];
    application?: DriverApplication;
}

export interface Vehicle {
    id: string;
    application_id: string;
    vehicle_type: string;
    passenger_capacity: number;
    driver_category: string;
    car_registration_url: string;
    vehicle_inspection_url: string;
    tlc_diamond_url: string;
    insurance_files_urls: string[];
    vehicle_photos_urls: string[];
    status: string;
    slot: number;
    created_at: string;
    updated_at: string;
    archived_at: string | null;
}

export interface VehiclesResponse {
    vehicles: Vehicle[];
    active_count: number;
    max_active: number;
}

export interface UpdateProfilePayload {
    full_name?: string;
    phone_number?: string;
    address?: string;
    emergency_number?: string;
    device_type?: string;
    avatar_url?: string;
}

export interface UpdateVehiclePayload {
    vehicle_type?: string;
    passenger_capacity?: number;
    driver_category?: string;
}

export const dashboardService = {
    getMyDashboard: async (page = 1, limit = 10): Promise<UserDashboard> => {
        const { data } = await api.get(`/user/dashboard?page=${page}&limit=${limit}`);
        return data;
    },

    updateProfile: async (payload: UpdateProfilePayload): Promise<{ status: string }> => {
        const { data } = await api.put("/user/profile", payload);
        return data;
    },

    updateDriverDocument: async (
        type: "driver_license" | "tlc_license" | "profile_photo",
        file: File
    ): Promise<Record<string, string>> => {
        const formData = new FormData();
        formData.append("file", file);
        const { data } = await api.put(`/user/documents/${type}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return data;
    },

    getVehicles: async (): Promise<VehiclesResponse> => {
        const { data } = await api.get("/user/vehicles");
        return data;
    },

    updateVehicle: async (
        id: string,
        payload: UpdateVehiclePayload
    ): Promise<Vehicle> => {
        const { data } = await api.put(`/user/vehicles/${id}`, payload);
        return data;
    },

    updateVehicleDocument: async (
        vehicleId: string,
        type: "car_registration" | "vehicle_inspection" | "tlc_diamond" | "insurance_files" | "vehicle_photos",
        file: File
    ): Promise<Vehicle> => {
        const formData = new FormData();
        formData.append("file", file);
        const { data } = await api.put(
            `/user/vehicles/${vehicleId}/documents/${type}`,
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
        );
        return data;
    },
};
