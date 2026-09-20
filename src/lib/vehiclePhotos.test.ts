import { describe, it, expect } from "vitest";
import {
    VEHICLE_PHOTO_SLOTS,
    VEHICLE_PHOTO_LABELS,
    vehiclePhotoTargets,
    applyVehiclePhotos,
    nextVehicleSlot,
    isVehiclePhotoSetComplete,
    type VehiclePhotoSlots,
} from "./vehiclePhotos";

const empty = (): VehiclePhotoSlots => Array(VEHICLE_PHOTO_SLOTS).fill(null);

describe("vehiclePhotoTargets", () => {
    it("fills front → back → left → right when nothing is captured yet", () => {
        expect(vehiclePhotoTargets(empty(), 0)).toEqual([0, 1, 2, 3]);
    });

    it("starts at the selected slot and continues with the empty ones", () => {
        const photos: VehiclePhotoSlots = ["front", null, null, null];
        expect(vehiclePhotoTargets(photos, 1)).toEqual([1, 2, 3]);
    });

    it("targets a filled slot for replacement without offering it twice", () => {
        const photos: VehiclePhotoSlots = ["front", "back", "left", "right"];
        expect(vehiclePhotoTargets(photos, 2)).toEqual([2]);
    });

    it("keeps the selected slot first even when earlier slots are empty", () => {
        const photos: VehiclePhotoSlots = [null, null, "left", null];
        expect(vehiclePhotoTargets(photos, 3)).toEqual([3, 0, 1]);
    });
});

describe("applyVehiclePhotos", () => {
    it("accumulates instead of replacing the previous pick (the bug this guards)", () => {
        let photos = empty();
        photos = applyVehiclePhotos(photos, [{ index: 0, dataUrl: "front" }]);
        photos = applyVehiclePhotos(photos, [{ index: 1, dataUrl: "back" }]);
        expect(photos).toEqual(["front", "back", null, null]);
    });

    it("writes a whole multi-file selection at once", () => {
        const photos = applyVehiclePhotos(empty(), [
            { index: 0, dataUrl: "a" },
            { index: 1, dataUrl: "b" },
            { index: 2, dataUrl: "c" },
            { index: 3, dataUrl: "d" },
        ]);
        expect(photos).toEqual(["a", "b", "c", "d"]);
    });

    it("replaces only the targeted slot", () => {
        const photos = applyVehiclePhotos(["a", "b", "c", "d"], [{ index: 2, dataUrl: "new-left" }]);
        expect(photos).toEqual(["a", "b", "new-left", "d"]);
    });

    it("does not mutate the input array", () => {
        const original = empty();
        applyVehiclePhotos(original, [{ index: 0, dataUrl: "front" }]);
        expect(original).toEqual([null, null, null, null]);
    });
});

describe("nextVehicleSlot", () => {
    it("advances to the following empty slot", () => {
        expect(nextVehicleSlot(["front", null, null, null], 0)).toBe(1);
    });

    it("wraps back to an earlier gap when the tail is full", () => {
        expect(nextVehicleSlot([null, "b", "c", "d"], 3)).toBe(0);
    });

    it("stays put once the set is complete", () => {
        expect(nextVehicleSlot(["a", "b", "c", "d"], 2)).toBe(2);
    });
});

describe("isVehiclePhotoSetComplete", () => {
    it("is false while any side is missing", () => {
        expect(isVehiclePhotoSetComplete(["a", "b", "c", null])).toBe(false);
    });

    it("is true only with the 4 sides", () => {
        expect(isVehiclePhotoSetComplete(["a", "b", "c", "d"])).toBe(true);
    });

    it("rejects a short array (a partial set must never reach the backend)", () => {
        expect(isVehiclePhotoSetComplete(["a", "b", "c"])).toBe(false);
    });
});

describe("VEHICLE_PHOTO_LABELS", () => {
    it("has one label per slot, in capture order", () => {
        expect(VEHICLE_PHOTO_LABELS).toHaveLength(VEHICLE_PHOTO_SLOTS);
        expect(VEHICLE_PHOTO_LABELS.map((l) => l.split(" / ")[0])).toEqual([
            "Front",
            "Back",
            "Left Side",
            "Right Side",
        ]);
    });
});
