import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X, FileText, Smartphone, Car, Users, BadgeCheck,
    ZoomIn, Shield, Camera, ChevronRight, DollarSign,
    MapPin, Star, Layers,
} from "lucide-react";

const GOLD = "#D4AF37";

interface ProfileDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    application: any;
    referrals?: { full_name: string; created_at: string; status: string }[];
}

/* ── Small helpers ── */
function GoldLine() {
    return (
        <div className="h-[1.5px] w-full bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent" />
    );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value?: string | number }) {
    if (!value && value !== 0) return null;
    return (
        <div className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: "rgba(212,175,55,0.1)" }}>
                <Icon className="w-3.5 h-3.5" style={{ color: GOLD }} strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
                <p className="text-[11px] text-gray-500 uppercase tracking-wide mb-0.5">{label}</p>
                <p className="text-sm text-white font-medium leading-snug">{value}</p>
            </div>
        </div>
    );
}

function DocCard({ label, url, onClick }: { label: string; url: string; onClick: (url: string) => void }) {
    if (!url) return null;
    return (
        <button
            onClick={() => onClick(url)}
            className="group relative aspect-[4/3] rounded-xl overflow-hidden border border-white/10 hover:border-[#D4AF37]/50 transition-all duration-300 w-full"
        >
            <img src={url} alt={label} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-2.5">
                <p className="text-white text-[11px] font-medium truncate leading-tight">{label}</p>
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-9 h-9 rounded-full bg-black/60 flex items-center justify-center border border-[#D4AF37]/40">
                    <ZoomIn className="w-4 h-4" style={{ color: GOLD }} />
                </div>
            </div>
        </button>
    );
}

function SectionHeader({ icon: Icon, title }: { icon: any; title: string }) {
    return (
        <div className="flex items-center gap-2 mb-4">
            <Icon className="w-4 h-4" style={{ color: GOLD }} strokeWidth={1.5} />
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">{title}</h3>
            <div className="flex-1 h-px bg-white/5 ml-2" />
        </div>
    );
}

function PriceRow({ label, value }: { label: string; value?: string | number }) {
    if (!value && value !== 0) return null;
    const display = typeof value === "number" || !isNaN(Number(value))
        ? `$${Number(value).toFixed(2)}`
        : String(value);
    return (
        <div className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
            <span className="text-sm text-gray-400">{label}</span>
            <span className="text-sm font-semibold" style={{ color: GOLD }}>{display}</span>
        </div>
    );
}

const VEHICLE_CATEGORY_LABELS: Record<string, string> = {
    ev: "Electric Vehicle (EV)",
    hybrid: "Hybrid",
    gasoline: "Gasoline",
    wheelchair: "Wheelchair Accessible",
};

const VEHICLE_TIER_LABELS: Record<string, string> = {
    luxury_sedan: "Luxury Sedan",
    luxury_ev: "Luxury EV",
    luxury_suv: "Luxury SUV",
    luxury_suv_xl: "Luxury SUV XL",
    luxury_escalade: "Luxury Escalade",
};

type Tab = "overview" | "luxury";

export const ProfileDetailsModal = ({ isOpen, onClose, application }: ProfileDetailsModalProps) => {
    const [lightbox, setLightbox] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>("overview");

    if (!application) return null;

    const isLuxury = application.driver_category === "luxury";
    const info = application.additional_info ?? {};

    const singleDocs = [
        { label: "Profile Photo", url: application.profile_photo_url },
        { label: "Driver License", url: application.driver_license_url },
        { label: "TLC License", url: application.tlc_license_url },
        { label: "Car Registration", url: application.car_registration_url },
        { label: "Vehicle Inspection", url: application.vehicle_inspection_url },
        { label: "TLC Diamond", url: application.tlc_diamond_url },
    ].filter(d => d.url);

    const insuranceDocs = (application.insurance_files_urls ?? []).map((url: string, i: number) => ({
        label: `Insurance ${i + 1}`,
        url,
    }));

    const vehicleDocs = (application.vehicle_photos_urls ?? []).map((url: string, i: number) => ({
        label: `Vehicle ${i + 1}`,
        url,
    }));

    const statusColor = application.status === "approved"
        ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/30"
        : application.status === "rejected"
        ? "text-red-400 bg-red-400/10 border-red-400/30"
        : "text-yellow-400 bg-yellow-400/10 border-yellow-400/30";

    const hasAirportRates = info.manhattanToJFK || info.manhattanToLGA || info.manhattanToEWR
        || info.manhattanToWestchester || info.manhattanToTeterboro;

    return (
        <>
            {/* Main modal */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            key="backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
                            onClick={onClose}
                        />

                        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center pointer-events-none">
                        <motion.div
                            key="panel"
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 40 }}
                            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                            className="w-full md:w-[700px] pointer-events-auto flex flex-col"
                            style={{ maxHeight: "92dvh" }}
                        >
                            <div className="relative flex flex-col rounded-t-3xl md:rounded-2xl overflow-hidden border border-[#D4AF37]/20"
                                style={{ background: "rgba(5,5,5,0.97)", backdropFilter: "blur(20px)", maxHeight: "92dvh" }}>

                                <GoldLine />

                                {/* Header */}
                                <div className="flex items-start justify-between px-6 pt-5 pb-4 shrink-0">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <BadgeCheck className="w-4 h-4" style={{ color: GOLD }} />
                                            <h2 className="text-white font-bold text-base">Driver Profile</h2>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium capitalize ${statusColor}`}>
                                                {application.status}
                                            </span>
                                            <span className="text-xs px-2.5 py-0.5 rounded-full border border-white/10 text-gray-400 capitalize">
                                                {application.driver_category}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Tabs — only rendered when luxury */}
                                {isLuxury && (
                                    <div className="px-6 pb-0 shrink-0">
                                        <div className="flex gap-1 p-1 rounded-xl border border-white/8"
                                            style={{ background: "rgba(255,255,255,0.03)" }}>
                                            {(["overview", "luxury"] as Tab[]).map(tab => (
                                                <button
                                                    key={tab}
                                                    onClick={() => setActiveTab(tab)}
                                                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all duration-200 ${
                                                        activeTab === tab
                                                            ? "text-[#1a1a1a] shadow-sm"
                                                            : "text-gray-500 hover:text-gray-300"
                                                    }`}
                                                    style={activeTab === tab ? { background: GOLD } : {}}
                                                >
                                                    {tab === "overview"
                                                        ? <><FileText className="w-3 h-3" /> Overview</>
                                                        : <><Star className="w-3 h-3" /> Luxury Details</>
                                                    }
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="h-px bg-white/5 mx-6 mt-4" />

                                {/* Scrollable body */}
                                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-7">

                                    {/* ── OVERVIEW TAB (default, always shown for comfort) ── */}
                                    {(!isLuxury || activeTab === "overview") && (
                                        <>
                                            {/* Personal & Vehicle Info */}
                                            <section>
                                                <SectionHeader icon={Users} title="Personal & Vehicle Info" />
                                                <div className="rounded-xl border border-white/8 overflow-hidden"
                                                    style={{ background: "rgba(255,255,255,0.02)" }}>
                                                    <InfoRow icon={Users} label="Full Name" value={application.full_name} />
                                                    <InfoRow icon={Smartphone} label="Phone" value={application.phone_number} />
                                                    <InfoRow icon={Shield} label="Emergency Contact" value={application.emergency_number} />
                                                    <InfoRow icon={FileText} label="Address" value={application.address} />
                                                    <InfoRow icon={Car} label="Vehicle Type" value={application.vehicle_type} />
                                                    <InfoRow icon={Users} label="Capacity" value={application.passenger_capacity ? `${application.passenger_capacity} passengers` : undefined} />
                                                    <InfoRow icon={Smartphone} label="Device" value={application.device_type} />
                                                </div>
                                            </section>

                                            {/* Documents & Licenses */}
                                            {singleDocs.length > 0 && (
                                                <section>
                                                    <SectionHeader icon={FileText} title="Documents & Licenses" />
                                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                        {singleDocs.map(d => (
                                                            <DocCard key={d.label} label={d.label} url={d.url} onClick={setLightbox} />
                                                        ))}
                                                    </div>
                                                </section>
                                            )}

                                            {/* Insurance */}
                                            {insuranceDocs.length > 0 && (
                                                <section>
                                                    <SectionHeader icon={Shield} title="Insurance Files" />
                                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                        {insuranceDocs.map((d: { label: string; url: string }) => (
                                                            <DocCard key={d.label} label={d.label} url={d.url} onClick={setLightbox} />
                                                        ))}
                                                    </div>
                                                </section>
                                            )}

                                            {/* Vehicle Photos */}
                                            {vehicleDocs.length > 0 && (
                                                <section>
                                                    <SectionHeader icon={Car} title="Vehicle Photos" />
                                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                        {vehicleDocs.map((d: { label: string; url: string }) => (
                                                            <DocCard key={d.label} label={d.label} url={d.url} onClick={setLightbox} />
                                                        ))}
                                                    </div>
                                                </section>
                                            )}
                                        </>
                                    )}

                                    {/* ── LUXURY DETAILS TAB ── */}
                                    {isLuxury && activeTab === "luxury" && (
                                        <>
                                            {/* Vehicle Classification */}
                                            <section>
                                                <SectionHeader icon={Layers} title="Vehicle Classification" />
                                                <div className="rounded-xl border border-white/8 overflow-hidden"
                                                    style={{ background: "rgba(255,255,255,0.02)" }}>
                                                    <InfoRow
                                                        icon={Star}
                                                        label="Vehicle Tier"
                                                        value={VEHICLE_TIER_LABELS[info.vehicleTier] ?? info.vehicleTier}
                                                    />
                                                    <InfoRow
                                                        icon={Car}
                                                        label="Vehicle Model"
                                                        value={info.vehicleModel ?? info.vehicleClass}
                                                    />
                                                    <InfoRow
                                                        icon={Car}
                                                        label="Vehicle Category"
                                                        value={VEHICLE_CATEGORY_LABELS[info.vehicleCategory] ?? info.vehicleCategory}
                                                    />
                                                    <InfoRow
                                                        icon={Camera}
                                                        label="Photo Usage Permission"
                                                        value={info.permissionPicture === "yes" ? "Granted ✓" : info.permissionPicture === "no" ? "Denied" : undefined}
                                                    />
                                                </div>
                                            </section>

                                            {/* Service Rates */}
                                            {(info.hourlyRate || info.mileageRate) && (
                                                <section>
                                                    <SectionHeader icon={DollarSign} title="Service Rates" />
                                                    <div className="rounded-xl border border-white/8 px-4 py-1"
                                                        style={{ background: "rgba(255,255,255,0.02)" }}>
                                                        <PriceRow label="Hourly Rate" value={info.hourlyRate} />
                                                        <PriceRow label="Per Mile Rate" value={info.mileageRate} />
                                                    </div>
                                                </section>
                                            )}

                                            {/* Airport Routes */}
                                            {hasAirportRates && (
                                                <section>
                                                    <SectionHeader icon={MapPin} title="Airport Routes (from Manhattan)" />
                                                    <div className="rounded-xl border border-white/8 px-4 py-1"
                                                        style={{ background: "rgba(255,255,255,0.02)" }}>
                                                        <PriceRow label="→ JFK Airport" value={info.manhattanToJFK} />
                                                        <PriceRow label="→ LGA Airport" value={info.manhattanToLGA} />
                                                        <PriceRow label="→ EWR Airport" value={info.manhattanToEWR} />
                                                        <PriceRow label="→ Westchester County Airport" value={info.manhattanToWestchester} />
                                                        <PriceRow label="→ Teterboro Airport" value={info.manhattanToTeterboro} />
                                                    </div>
                                                </section>
                                            )}

                                            {/* Additional Notes */}
                                            {info.additionalInfo && (
                                                <section>
                                                    <SectionHeader icon={FileText} title="Additional Notes" />
                                                    <div className="rounded-xl border border-white/8 p-4"
                                                        style={{ background: "rgba(255,255,255,0.02)" }}>
                                                        <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                                                            {info.additionalInfo}
                                                        </p>
                                                    </div>
                                                </section>
                                            )}

                                            {/* Empty state */}
                                            {!info.vehicleTier && !info.hourlyRate && !hasAirportRates && !info.additionalInfo && (
                                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                                    <Star className="w-8 h-8 text-gray-700 mb-3" />
                                                    <p className="text-sm text-gray-500">No luxury details available for this driver.</p>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* Application ID */}
                                    <div className="flex items-center gap-2 text-gray-600 text-xs pt-1 pb-2">
                                        <ChevronRight className="w-3 h-3" />
                                        ID: {application.id}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>

            {/* Lightbox */}
            <AnimatePresence>
                {lightbox && (
                    <>
                        <motion.div
                            key="lb-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-6"
                            onClick={() => setLightbox(null)}
                        >
                            <button
                                onClick={() => setLightbox(null)}
                                className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <motion.img
                                key="lb-img"
                                initial={{ opacity: 0, scale: 0.92 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.92 }}
                                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                                src={lightbox}
                                alt="Document"
                                className="max-w-full max-h-[90dvh] object-contain rounded-xl shadow-2xl"
                                onClick={e => e.stopPropagation()}
                            />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};
