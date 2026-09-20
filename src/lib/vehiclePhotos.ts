// Slot bookkeeping for the vehicle photos step of the registration wizard.
//
// The wizard needs exactly 4 photos (Front, Back, Left Side, Right Side) and
// only hands them to the backend as a complete set. This logic used to live
// inline in RegisterDriver mixed with camera/DOM state, where an upload wrote
// into a shared preview buffer and each new file silently replaced the previous
// one. Keeping it here as pure functions means the accumulate/replace rules can
// be tested without mounting the 1600-line wizard.

export const VEHICLE_PHOTO_SLOTS = 4;

export const VEHICLE_PHOTO_LABELS = [
    'Front / Frente',
    'Back / Atrás',
    'Left Side / Lado Izquierdo',
    'Right Side / Lado Derecho',
];

export type VehiclePhotoSlots = (string | null)[];

export interface VehiclePhotoEntry {
    index: number;
    dataUrl: string;
}

/**
 * Slots an upload should fill, in order: the currently selected one first (so a
 * single pick replaces what the user is looking at), then the remaining empty
 * ones left to right. Picking 4 images at once therefore lands them as
 * Front → Back → Left → Right.
 */
export function vehiclePhotoTargets(photos: VehiclePhotoSlots, selected: number): number[] {
    const rest = photos
        .map((_, i) => i)
        .filter((i) => i !== selected && !photos[i]);
    return [selected, ...rest];
}

/** Returns a new slot array with the entries written in. Never mutates. */
export function applyVehiclePhotos(
    photos: VehiclePhotoSlots,
    entries: VehiclePhotoEntry[],
): VehiclePhotoSlots {
    const updated = [...photos];
    entries.forEach(({ index, dataUrl }) => {
        updated[index] = dataUrl;
    });
    return updated;
}

/**
 * Where the focus goes after committing: the next empty slot after `lastIndex`,
 * otherwise the first empty one, otherwise stay where we are (set complete).
 */
export function nextVehicleSlot(photos: VehiclePhotoSlots, lastIndex: number): number {
    const after = photos.findIndex((p, i) => i > lastIndex && !p);
    if (after !== -1) return after;
    const anyEmpty = photos.findIndex((p) => !p);
    return anyEmpty !== -1 ? anyEmpty : lastIndex;
}

/** The backend only accepts the full set, so this gates both submit and "Next". */
export function isVehiclePhotoSetComplete(photos: VehiclePhotoSlots): boolean {
    return photos.length === VEHICLE_PHOTO_SLOTS && photos.every((p) => !!p);
}
