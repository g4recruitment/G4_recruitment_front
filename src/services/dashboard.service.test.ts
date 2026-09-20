import { describe, it, expect, vi } from "vitest";
import { api } from "@/lib/api";
import { dashboardService } from "./dashboard.service";

vi.mock("@/lib/api", () => ({
    api: { get: vi.fn(), put: vi.fn(), post: vi.fn(), patch: vi.fn() },
}));

const apiGet = vi.mocked(api.get);
const apiPut = vi.mocked(api.put);

const file = (name = "doc.jpg") => new File(["x"], name, { type: "image/jpeg" });

describe("dashboardService", () => {
    it("paginates the dashboard request", async () => {
        apiGet.mockResolvedValue({ data: { profile: {} } });

        await dashboardService.getMyDashboard(3, 25);

        expect(apiGet).toHaveBeenCalledWith("/user/dashboard?page=3&limit=25");
    });

    it("defaults to the first page", async () => {
        apiGet.mockResolvedValue({ data: {} });

        await dashboardService.getMyDashboard();

        expect(apiGet).toHaveBeenCalledWith("/user/dashboard?page=1&limit=10");
    });

    // Regression: the swagger also documents PATCH, but PATCH is blocked by CORS
    // in the current deployment, so these writes must stay on PUT.
    it("updates the profile with PUT", async () => {
        apiPut.mockResolvedValue({ data: { status: "updated" } });

        await dashboardService.updateProfile({ full_name: "Ada Lovelace" });

        expect(apiPut).toHaveBeenCalledWith("/user/profile", { full_name: "Ada Lovelace" });
        expect(vi.mocked(api.patch)).not.toHaveBeenCalled();
    });

    it("updates a vehicle with PUT on its id", async () => {
        apiPut.mockResolvedValue({ data: { id: "veh-1" } });

        await dashboardService.updateVehicle("veh-1", { passenger_capacity: 4 });

        expect(apiPut).toHaveBeenCalledWith("/user/vehicles/veh-1", { passenger_capacity: 4 });
    });

    it("sends a driver document as multipart under the 'file' field", async () => {
        apiPut.mockResolvedValue({ data: {} });

        await dashboardService.updateDriverDocument("driver_license", file());

        const [url, body, config] = apiPut.mock.calls[0];
        expect(url).toBe("/user/documents/driver_license");
        expect(body).toBeInstanceOf(FormData);
        expect((body as FormData).get("file")).toBeInstanceOf(File);
        expect(config).toMatchObject({ headers: { "Content-Type": "multipart/form-data" } });
    });

    it("routes a vehicle document to the vehicle's own endpoint", async () => {
        apiPut.mockResolvedValue({ data: {} });

        await dashboardService.updateVehicleDocument("veh-1", "vehicle_photos", file("front.jpg"));

        const [url, body] = apiPut.mock.calls[0];
        expect(url).toBe("/user/vehicles/veh-1/documents/vehicle_photos");
        expect((body as FormData).get("file")).toBeInstanceOf(File);
    });

    it("reads the vehicle list with its active/max counters", async () => {
        apiGet.mockResolvedValue({ data: { vehicles: [{ id: "veh-1" }], active_count: 1, max_active: 3 } });

        await expect(dashboardService.getVehicles()).resolves.toMatchObject({ active_count: 1, max_active: 3 });
        expect(apiGet).toHaveBeenCalledWith("/user/vehicles");
    });
});
