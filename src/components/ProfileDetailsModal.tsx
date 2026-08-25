import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X, FileText, Smartphone, Car, Users, BadgeCheck,
    ZoomIn, Shield, Camera, ChevronRight, DollarSign,
    MapPin, Star, Layers, Pencil, Check, Loader2, Upload,
} from "lucide-react";
import { toast } from "sonner";
import { dashboardService, Vehicle, UpdateProfilePayload, UpdateVehiclePayload } from "@/services/dashboard.service";
import { logger } from "@/lib/logger";

const GOLD = "#D4AF37";

interface ProfileDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    application: any;
    referrals?: { full_name: string; created_at: string; status: string }[];
    onUpdate?: () => void;
}

/* ── Small helpers ── */
function GoldLine() {
    return (
        <div className="h-[1.5px] w-full bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent" />
    );
}

/* ── Editable Info Row ── */
type EditableField = "full_name" | "phone_number" | "emergency_number" | "address" | "device_type"
    | "vehicle_type" | "passenger_capacity" | "driver_category";

interface EditableInfoRowProps {
    icon: any;
    label: string;
    value?: string | number;
    field: EditableField;
    type?: "text" | "tel" | "number" | "select";
    options?: { label: string; value: string }[];
    editingField: EditableField | null;
    onStartEdit: (field: EditableField) => void;
    onSave: (field: EditableField, value: string) => void;
    onCancel: () => void;
    isSaving: boolean;
}

function EditableInfoRow({
    icon: Icon, label, value, field, type = "text", options,
    editingField, onStartEdit, onSave, onCancel, isSaving,
}: EditableInfoRowProps) {
    const isEditing = editingField === field;
    const [editValue, setEditValue] = useState(String(value ?? ""));
    const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);

    useEffect(() => {
        if (isEditing) {
            setEditValue(String(value ?? ""));
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isEditing, value]);

    const handleSave = () => {
        if (editValue !== String(value ?? "")) {
            onSave(field, editValue);
        } else {
            onCancel();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleSave();
        if (e.key === "Escape") onCancel();
    };

    if (isEditing) {
        return (
            <div className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0 bg-white/[0.03]">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: "rgba(212,175,55,0.1)" }}>
                    <Icon className="w-3.5 h-3.5" style={{ color: GOLD }} strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-gray-500 uppercase tracking-wide mb-1">{label}</p>
                    {type === "select" && options ? (
                        <select
                            ref={inputRef as React.RefObject<HTMLSelectElement>}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full bg-black/50 border border-[#D4AF37]/30 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#D4AF37]/60"
                        >
                            {options.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    ) : (
                        <input
                            ref={inputRef as React.RefObject<HTMLInputElement>}
                            type={type}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full bg-black/50 border border-[#D4AF37]/30 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#D4AF37]/60"
                        />
                    )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-emerald-400 hover:bg-emerald-400/10 transition-colors disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    </button>
                    <button
                        onClick={onCancel}
                        disabled={isSaving}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:bg-white/10 transition-colors"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        );
    }

    if (!value && value !== 0) return null;
    return (
        <div className="group flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: "rgba(212,175,55,0.1)" }}>
                <Icon className="w-3.5 h-3.5" style={{ color: GOLD }} strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[11px] text-gray-500 uppercase tracking-wide mb-0.5">{label}</p>
                <p className="text-sm text-white font-medium leading-snug">{value}</p>
            </div>
            <button
                onClick={() => onStartEdit(field)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all opacity-0 group-hover:opacity-100 shrink-0 mt-0.5"
                title={`Edit ${label}`}
            >
                <Pencil className="w-3.5 h-3.5" />
            </button>
        </div>
    );
}

/* ── Read-only Info Row (for luxury details, etc.) ── */
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

/* ── Editable Doc Card ── */
interface EditableDocCardProps {
    label: string;
    url: string;
    onClick: (url: string) => void;
    isEditing: boolean;
    isUploading: boolean;
    onEdit: () => void;
    onStartCamera: () => void;
    onStartUpload: () => void;
    onCancelEdit: () => void;
}

function EditableDocCard({
    label, url, onClick, isEditing, isUploading,
    onEdit, onStartCamera, onStartUpload, onCancelEdit,
}: EditableDocCardProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (isEditing) {
        return (
            <div className="relative rounded-xl overflow-hidden border border-[#D4AF37]/40 bg-black/60 p-3">
                <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-2">{label}</p>
                {isUploading ? (
                    <div className="flex flex-col items-center justify-center py-6 gap-2">
                        <Loader2 className="w-6 h-6 animate-spin" style={{ color: GOLD }} />
                        <p className="text-xs text-gray-400">Uploading...</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={onStartCamera}
                            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-medium transition-all"
                            style={{ background: "rgba(212,175,55,0.15)", color: GOLD }}
                        >
                            <Camera className="w-4 h-4" /> Open Camera
                        </button>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-medium border border-white/10 text-gray-300 hover:bg-white/5 transition-all"
                        >
                            <Upload className="w-4 h-4" /> Upload File
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,.pdf"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    onStartUpload();
                                    // Trigger the parent's upload via a custom event
                                    const event = new CustomEvent("doc-upload", { detail: { file } });
                                    window.dispatchEvent(event);
                                }
                                e.target.value = "";
                            }}
                        />
                        <button
                            onClick={onCancelEdit}
                            className="text-xs text-gray-500 hover:text-gray-300 transition-colors mt-1"
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>
        );
    }

    if (!url) return null;
    return (
        <div className="group relative">
            <button
                onClick={() => onClick(url)}
                className="relative aspect-[4/3] rounded-xl overflow-hidden border border-white/10 hover:border-[#D4AF37]/50 transition-all duration-300 w-full"
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
            <button
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] opacity-0 group-hover:opacity-100 transition-all hover:bg-[#D4AF37]/20 z-10"
                title={`Edit ${label}`}
            >
                <Pencil className="w-3 h-3" />
            </button>
        </div>
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

const DEVICE_OPTIONS = [
    { label: "Phone", value: "phone" },
    { label: "Tablet", value: "tablet" },
];

const VEHICLE_CATEGORY_OPTIONS = [
    { label: "EV (Electric Vehicle)", value: "ev" },
    { label: "Hybrid", value: "hybrid" },
    { label: "Gasoline", value: "gasoline" },
    { label: "Wheelchair Accessible", value: "wheelchair" },
];

type Tab = "overview" | "luxury";

export const ProfileDetailsModal = ({ isOpen, onClose, application, onUpdate }: ProfileDetailsModalProps) => {
    const [lightbox, setLightbox] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>("overview");

    // Editing state
    const [editingField, setEditingField] = useState<EditableField | null>(null);
    const [isSavingField, setIsSavingField] = useState(false);
    const [editingDoc, setEditingDoc] = useState<string | null>(null);
    const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

    // Vehicle state
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [vehicleLoading, setVehicleLoading] = useState(false);

    // Local state for optimistic updates
    const [localApplication, setLocalApplication] = useState(application);

    useEffect(() => {
        setLocalApplication(application);
    }, [application]);

    // Fetch vehicles when modal opens
    useEffect(() => {
        if (!isOpen) return;
        setVehicleLoading(true);
        dashboardService.getVehicles()
            .then((res) => setVehicles(res.vehicles))
            .catch((err) => logger.error("Failed to fetch vehicles:", err))
            .finally(() => setVehicleLoading(false));
    }, [isOpen]);

    // Listen for file upload from the hidden input
    useEffect(() => {
        const handler = async (e: Event) => {
            const customEvent = e as CustomEvent<{ file: File }>;
            const file = customEvent.detail?.file;
            if (!file || !editingDoc) return;

            setUploadingDoc(editingDoc);
            try {
                // Determine if it's a driver doc or vehicle doc
                const driverDocs = ["profile_photo", "driver_license", "tlc_license"] as const;
                type DriverDocType = typeof driverDocs[number];

                if ((driverDocs as readonly string[]).includes(editingDoc)) {
                    // Driver document
                    await dashboardService.updateDriverDocument(editingDoc as DriverDocType, file);
                    toast.success(`${editingDoc.replace(/_/g, " ")} updated successfully`);
                } else if (vehicles.length > 0) {
                    // Vehicle document — use the first active vehicle
                    const activeVehicle = vehicles.find(v => v.status === "active") || vehicles[0];
                    const vehicleDocType = editingDoc as "car_registration" | "vehicle_inspection" | "tlc_diamond" | "insurance_files" | "vehicle_photos";
                    await dashboardService.updateVehicleDocument(activeVehicle.id, vehicleDocType, file);
                    toast.success(`${editingDoc.replace(/_/g, " ")} updated successfully`);
                }

                setEditingDoc(null);
                onUpdate?.();
            } catch (err) {
                logger.error("Document upload failed:", err);
                toast.error("Failed to update document. Please try again.");
            } finally {
                setUploadingDoc(null);
            }
        };

        window.addEventListener("doc-upload", handler);
        return () => window.removeEventListener("doc-upload", handler);
    }, [editingDoc, vehicles, onUpdate]);

    // Cleanup editing state on close
    useEffect(() => {
        if (!isOpen) {
            setEditingField(null);
            setEditingDoc(null);
            setUploadingDoc(null);
        }
    }, [isOpen]);

    if (!localApplication) return null;

    const app = localApplication;
    const isLuxury = app.driver_category === "luxury";
    const info = app.additional_info ?? {};

    const singleDocs = [
        { label: "Profile Photo", url: app.profile_photo_url, key: "profile_photo" },
        { label: "Driver License", url: app.driver_license_url, key: "driver_license" },
        { label: "TLC License", url: app.tlc_license_url, key: "tlc_license" },
        { label: "Car Registration", url: app.car_registration_url, key: "car_registration" },
        { label: "Vehicle Inspection", url: app.vehicle_inspection_url, key: "vehicle_inspection" },
        { label: "TLC Diamond", url: app.tlc_diamond_url, key: "tlc_diamond" },
    ].filter(d => d.url);

    const insuranceDocs = (app.insurance_files_urls ?? []).map((url: string, i: number) => ({
        label: `Insurance ${i + 1}`,
        url,
        key: `insurance_${i}`,
    }));

    const vehicleDocs = (app.vehicle_photos_urls ?? []).map((url: string, i: number) => ({
        label: `Vehicle ${i + 1}`,
        url,
        key: `vehicle_photo_${i}`,
    }));

    const statusColor = app.status === "approved"
        ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/30"
        : app.status === "rejected"
        ? "text-red-400 bg-red-400/10 border-red-400/30"
        : "text-yellow-400 bg-yellow-400/10 border-yellow-400/30";

    const hasAirportRates = info.manhattanToJFK || info.manhattanToLGA || info.manhattanToEWR
        || info.manhattanToWestchester || info.manhattanToTeterboro;

    const handleFieldSave = async (field: EditableField, newValue: string) => {
        setIsSavingField(true);
        try {
            const profilePayload: UpdateProfilePayload = {};
            const vehiclePayload: UpdateVehiclePayload = {};
            let target = "profile";

            switch (field) {
                case "full_name":
                    profilePayload.full_name = newValue;
                    break;
                case "phone_number":
                    profilePayload.phone_number = newValue;
                    break;
                case "emergency_number":
                    profilePayload.emergency_number = newValue;
                    break;
                case "address":
                    profilePayload.address = newValue;
                    break;
                case "device_type":
                    profilePayload.device_type = newValue;
                    break;
                case "vehicle_type":
                    vehiclePayload.vehicle_type = newValue;
                    target = "vehicle";
                    break;
                case "passenger_capacity":
                    vehiclePayload.passenger_capacity = parseInt(newValue, 10) || 0;
                    target = "vehicle";
                    break;
                case "driver_category":
                    vehiclePayload.driver_category = newValue;
                    target = "vehicle";
                    break;
            }

            if (target === "profile") {
                await dashboardService.updateProfile(profilePayload);
            } else if (target === "vehicle" && vehicles.length > 0) {
                const activeVehicle = vehicles.find(v => v.status === "active") || vehicles[0];
                await dashboardService.updateVehicle(activeVehicle.id, vehiclePayload);
            }

            // Optimistic update
            setLocalApplication((prev: any) => {
                const updated = { ...prev };
                if (field in profilePayload) {
                    updated[field] = newValue;
                } else if (field === "vehicle_type" || field === "passenger_capacity" || field === "driver_category") {
                    updated[field] = field === "passenger_capacity" ? parseInt(newValue, 10) || 0 : newValue;
                }
                return updated;
            });

            toast.success(`${field.replace(/_/g, " ")} updated successfully`);
            setEditingField(null);
            onUpdate?.();
        } catch (err) {
            logger.error("Profile update failed:", err);
            toast.error("Failed to update. Please try again.");
        } finally {
            setIsSavingField(false);
        }
    };

    const handleDocCamera = (docKey: string) => {
        setEditingDoc(docKey);
        // Open camera directly
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
            .then((stream) => {
                // Create a simple camera capture UI
                const video = document.createElement("video");
                video.srcObject = stream;
                video.autoplay = true;
                video.playsInline = true;
                video.style.cssText = "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:90vw;max-width:400px;z-index:9999;border-radius:12px;border:2px solid #D4AF37";

                const overlay = document.createElement("div");
                overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:9998;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px";

                const captureBtn = document.createElement("button");
                captureBtn.textContent = "Capture";
                captureBtn.style.cssText = `position:fixed;bottom:80px;left:50%;transform:translateX(-50%);z-index:10000;padding:12px 32px;border-radius:12px;background:#D4AF37;color:#000;font-weight:600;font-size:14px;border:none;cursor:pointer`;

                const cancelBtn = document.createElement("button");
                cancelBtn.textContent = "Cancel";
                cancelBtn.style.cssText = "position:fixed;bottom:30px;left:50%;transform:translateX(-50%);z-index:10000;padding:10px 28px;border-radius:12px;background:transparent;color:#888;font-size:13px;border:1px solid #333;cursor:pointer";

                const canvas = document.createElement("canvas");

                const cleanup = () => {
                    stream.getTracks().forEach(t => t.stop());
                    video.remove();
                    overlay.remove();
                    captureBtn.remove();
                    cancelBtn.remove();
                };

                captureBtn.onclick = () => {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    canvas.getContext("2d")?.drawImage(video, 0, 0);
                    canvas.toBlob((blob) => {
                        cleanup();
                        if (blob) {
                            const file = new File([blob], `${docKey}_${Date.now()}.jpg`, { type: "image/jpeg" });
                            // Dispatch upload
                            const event = new CustomEvent("doc-upload", { detail: { file } });
                            window.dispatchEvent(event);
                        }
                    }, "image/jpeg", 0.9);
                };

                cancelBtn.onclick = () => {
                    cleanup();
                    setEditingDoc(null);
                };

                document.body.appendChild(overlay);
                document.body.appendChild(video);
                document.body.appendChild(captureBtn);
                document.body.appendChild(cancelBtn);
            })
            .catch(() => {
                toast.error("Could not access camera. Please allow permissions.");
                setEditingDoc(null);
            });
    };

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
                                                {app.status}
                                            </span>
                                            <span className="text-xs px-2.5 py-0.5 rounded-full border border-white/10 text-gray-400 capitalize">
                                                {app.driver_category}
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
                                                    <EditableInfoRow
                                                        icon={Users} label="Full Name" value={app.full_name}
                                                        field="full_name" type="text"
                                                        editingField={editingField} onStartEdit={setEditingField}
                                                        onSave={handleFieldSave} onCancel={() => setEditingField(null)}
                                                        isSaving={isSavingField}
                                                    />
                                                    <EditableInfoRow
                                                        icon={Smartphone} label="Phone" value={app.phone_number}
                                                        field="phone_number" type="tel"
                                                        editingField={editingField} onStartEdit={setEditingField}
                                                        onSave={handleFieldSave} onCancel={() => setEditingField(null)}
                                                        isSaving={isSavingField}
                                                    />
                                                    <EditableInfoRow
                                                        icon={Shield} label="Emergency Contact" value={app.emergency_number}
                                                        field="emergency_number" type="tel"
                                                        editingField={editingField} onStartEdit={setEditingField}
                                                        onSave={handleFieldSave} onCancel={() => setEditingField(null)}
                                                        isSaving={isSavingField}
                                                    />
                                                    <EditableInfoRow
                                                        icon={FileText} label="Address" value={app.address}
                                                        field="address" type="text"
                                                        editingField={editingField} onStartEdit={setEditingField}
                                                        onSave={handleFieldSave} onCancel={() => setEditingField(null)}
                                                        isSaving={isSavingField}
                                                    />
                                                    <EditableInfoRow
                                                        icon={Car} label="Vehicle Type" value={app.vehicle_type}
                                                        field="vehicle_type" type="text"
                                                        editingField={editingField} onStartEdit={setEditingField}
                                                        onSave={handleFieldSave} onCancel={() => setEditingField(null)}
                                                        isSaving={isSavingField}
                                                    />
                                                    <EditableInfoRow
                                                        icon={Users} label="Capacity"
                                                        value={app.passenger_capacity ? `${app.passenger_capacity} passengers` : undefined}
                                                        field="passenger_capacity" type="number"
                                                        editingField={editingField} onStartEdit={setEditingField}
                                                        onSave={handleFieldSave} onCancel={() => setEditingField(null)}
                                                        isSaving={isSavingField}
                                                    />
                                                    <EditableInfoRow
                                                        icon={Smartphone} label="Device" value={app.device_type}
                                                        field="device_type" type="select" options={DEVICE_OPTIONS}
                                                        editingField={editingField} onStartEdit={setEditingField}
                                                        onSave={handleFieldSave} onCancel={() => setEditingField(null)}
                                                        isSaving={isSavingField}
                                                    />
                                                </div>
                                            </section>

                                            {/* Documents & Licenses */}
                                            {singleDocs.length > 0 && (
                                                <section>
                                                    <SectionHeader icon={FileText} title="Documents & Licenses" />
                                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                        {singleDocs.map(d => (
                                                            <EditableDocCard
                                                                key={d.key}
                                                                label={d.label}
                                                                url={d.url}
                                                                onClick={setLightbox}
                                                                isEditing={editingDoc === d.key}
                                                                isUploading={uploadingDoc === d.key}
                                                                onEdit={() => setEditingDoc(d.key)}
                                                                onStartCamera={() => handleDocCamera(d.key)}
                                                                onStartUpload={() => {}}
                                                                onCancelEdit={() => { setEditingDoc(null); setUploadingDoc(null); }}
                                                            />
                                                        ))}
                                                    </div>
                                                </section>
                                            )}

                                            {/* Insurance */}
                                            {insuranceDocs.length > 0 && (
                                                <section>
                                                    <SectionHeader icon={Shield} title="Insurance Files" />
                                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                        {insuranceDocs.map((d: { label: string; url: string; key: string }) => (
                                                            <EditableDocCard
                                                                key={d.key}
                                                                label={d.label}
                                                                url={d.url}
                                                                onClick={setLightbox}
                                                                isEditing={editingDoc === d.key}
                                                                isUploading={uploadingDoc === d.key}
                                                                onEdit={() => setEditingDoc(d.key)}
                                                                onStartCamera={() => handleDocCamera(d.key)}
                                                                onStartUpload={() => {}}
                                                                onCancelEdit={() => { setEditingDoc(null); setUploadingDoc(null); }}
                                                            />
                                                        ))}
                                                    </div>
                                                </section>
                                            )}

                                            {/* Vehicle Photos */}
                                            {vehicleDocs.length > 0 && (
                                                <section>
                                                    <SectionHeader icon={Car} title="Vehicle Photos" />
                                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                        {vehicleDocs.map((d: { label: string; url: string; key: string }) => (
                                                            <EditableDocCard
                                                                key={d.key}
                                                                label={d.label}
                                                                url={d.url}
                                                                onClick={setLightbox}
                                                                isEditing={editingDoc === d.key}
                                                                isUploading={uploadingDoc === d.key}
                                                                onEdit={() => setEditingDoc(d.key)}
                                                                onStartCamera={() => handleDocCamera(d.key)}
                                                                onStartUpload={() => {}}
                                                                onCancelEdit={() => { setEditingDoc(null); setUploadingDoc(null); }}
                                                            />
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
                                        ID: {app.id}
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
