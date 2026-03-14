
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
    additional_info?: any;
}

export interface UserDashboard {
    profile: DashboardProfile;
    referral_stats: ReferralStats;
    referral_list: ReferralItem[];
    application?: DriverApplication;
}

export const dashboardService = {
    getMyDashboard: async (page = 1, limit = 10): Promise<UserDashboard> => {
        const { data } = await api.get(`/user/dashboard?page=${page}&limit=${limit}`);
        return data;
    }
};
