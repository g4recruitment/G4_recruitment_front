// Centralized public asset URLs.
//
// These buckets are public (not secrets) but the same literals were copy-pasted
// across many components (the gold logo alone lived in 6 files). Keeping them
// here means a bucket/rename change is a single edit.
//
// All public assets live in the `public-resources` bucket of the active
// Supabase project (bglvvffnlgawlcfxctbl). NOTE: these used to be served from a
// second project (xhcxkvwrjcnioopultzq) which was DELETED — its subdomain no
// longer resolves (NXDOMAIN), so logos/cars/fleet went 404. The identical files
// already exist in the active bucket, so we point everything here. See
// [[project_supabase]].
const RESOURCES_BASE =
    "https://bglvvffnlgawlcfxctbl.supabase.co/storage/v1/object/public/public-resources";

export const ASSETS = {
    logoGold: `${RESOURCES_BASE}/logos/G4_GOLD_brand.webp`,
    logoTransparent: `${RESOURCES_BASE}/logos/G4-transparent-logo.png`,
    carCorolla: `${RESOURCES_BASE}/cars/corolla.png`,
    carEscalade: `${RESOURCES_BASE}/cars/escalade-2026-vehicle.png`,
    // "Our Exclusive Fleet" gallery photos.
    fleet: [
        `${RESOURCES_BASE}/our-fleet/WhatsApp%20Image%202026-01-21%20at%2015.56.01.jpeg`,
        `${RESOURCES_BASE}/our-fleet/WhatsApp%20Image%202026-01-21%20at%2015.56.02.jpeg`,
        `${RESOURCES_BASE}/our-fleet/WhatsApp%20Image%202026-01-21%20at%2015.56.03.jpeg`,
        `${RESOURCES_BASE}/our-fleet/WhatsApp%20Image%202026-01-21%20at%2015.56.04.jpeg`,
        `${RESOURCES_BASE}/our-fleet/WhatsApp%20Image%202026-01-21%20at%2015.56.03%20(1).jpeg`,
        `${RESOURCES_BASE}/our-fleet/WhatsApp%20Image%202026-01-21%20at%2015.56.03%20(2).jpeg`,
    ],
    // External stock hero image (driver POV) used by the landing slider and login.
    heroDriverPov:
        "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop",
} as const;
