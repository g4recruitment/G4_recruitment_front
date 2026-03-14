
import { api } from "@/lib/api";

export interface DashboardStats {
    total_users: number; // Corrected from totalDrivers
    total_comfort: number; // Corrected from regularDrivers
    total_luxury: number; // Corrected from luxuryDrivers
    new_users_last_week: number;
    total_referrals: number;
}

export interface AdminUserListItem {
    id: string;
    email: string;
    full_name: string;
    role: string;
    driver_category: string;
    driver_status: string;
    referred_count: number;
    created_at?: string;
}

export interface AdminUsersResponse {
    data: AdminUserListItem[];
    meta: {
        current_page: number;
        items_per_page: number;
        total_items: number;
        total_pages: number;
    };
}

export interface UserApplicationDetails {
    id: string;
    user_id: string;
    full_name: string;
    email: string;
    phone_number: string;
    emergency_number: string;
    address: string;
    device_type: string;
    driver_category: string;
    vehicle_type: string;
    passenger_capacity: number;
    driver_license_url: string;
    tlc_license_url: string;
    car_registration_url: string;
    vehicle_inspection_url: string;
    tlc_diamond_url: string;
    insurance_files_urls: string[];
    profile_photo_url: string;
    vehicle_photos_urls: string[];
    additional_info: any;
    status: string;
    created_at: string;
}

export interface ReferralItem {
    full_name: string;
    created_at: string;
    status: string;
}

export interface UserDetailResponse {
    id: string;
    email: string;
    avatar_url: string;
    referral_code: string;
    referred_by: string;
    application?: UserApplicationDetails;
    referrals?: ReferralItem[];
}

export interface GetUsersParams {
    page?: number;
    limit?: number;
    search?: string;
    category?: string; // 'luxury' | 'comfort'
    sort?: string;
}

export const adminService = {
    getStats: async (): Promise<DashboardStats> => {
        const { data } = await api.get("/admin/stats");
        return data;
    },

    getUsers: async (params: GetUsersParams = {}): Promise<AdminUsersResponse> => {
        const { data } = await api.get("/admin/users", { params });
        return data;
    },

    getUserDetail: async (id: string): Promise<UserDetailResponse> => {
        const { data } = await api.get(`/admin/user?id=${id}`);
        return data;
    }
};
