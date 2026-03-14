
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { X, FileText, Smartphone, Car, Users, BadgeCheck, ZoomIn } from "lucide-react";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface ProfileDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    application: any;
    referrals?: { full_name: string; created_at: string; status: string }[];
}

export const ProfileDetailsModal = ({ isOpen, onClose, application, referrals }: ProfileDetailsModalProps) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    if (!application) return null;

    const DetailItem = ({ icon: Icon, label, value }: { icon: any, label: string, value: string | number }) => (
        <div className="flex items-center gap-3 p-3 bg-secondary/20 rounded-lg">
            <div className="p-2 bg-secondary rounded-full">
                <Icon className="w-4 h-4 text-primary" />
            </div>
            <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="font-medium text-sm text-foreground">{value || "N/A"}</p>
            </div>
        </div>
    );

    const DocumentPreview = ({ label, url }: { label: string, url: string }) => {
        if (!url) return null;
        return (
            <div
                className="group relative aspect-video bg-muted rounded-lg overflow-hidden cursor-pointer border border-border hover:border-primary transition-colors"
                onClick={() => setSelectedImage(url)}
            >
                <img
                    src={url}
                    alt={label}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex items-center gap-2 text-white bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-sm">
                        <ZoomIn className="w-4 h-4" />
                        <span className="text-xs font-medium">View</span>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <p className="text-xs font-medium text-white truncate">{label}</p>
                </div>
            </div>
        );
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <DialogContent
                    className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-background"
                    onInteractOutside={(e) => {
                        if (selectedImage) {
                            e.preventDefault();
                        }
                    }}
                    onEscapeKeyDown={(e) => {
                        if (selectedImage) {
                            e.preventDefault();
                            setSelectedImage(null); // Handle ESC for lightbox
                        }
                    }}
                >
                    <DialogHeader className="px-6 py-4 border-b border-border bg-card">
                        <div className="flex items-center justify-between">
                            <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                <BadgeCheck className="w-5 h-5 text-primary" />
                                Driver Profile Details
                            </DialogTitle>

                        </div>
                        <div className="flex items-center gap-2 mt-2">
                            <Badge variant={application.status === 'approved' ? 'default' : 'secondary'} className="capitalize">
                                {application.status}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                                {application.driver_category}
                            </Badge>
                            <p className="text-xs text-muted-foreground ml-2">
                                ID: {application.id}
                            </p>
                        </div>
                    </DialogHeader>

                    <ScrollArea className="flex-1 p-6">
                        <div className="space-y-8">
                            {/* Personal & Vehicle Info Section */}
                            <section>
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
                                    <Car className="w-5 h-5 text-primary" />
                                    Vehicle & Personal Info
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <DetailItem icon={Users} label="Full Name" value={application.full_name} />
                                    <DetailItem icon={Smartphone} label="Phone Number" value={application.phone_number} />
                                    <DetailItem icon={Smartphone} label="Emergency Contact" value={application.emergency_number} />
                                    <DetailItem icon={FileText} label="Address" value={application.address} />
                                    <DetailItem icon={Car} label="Vehicle Type" value={application.vehicle_type} />
                                    <DetailItem icon={Users} label="Capacity" value={`${application.passenger_capacity} Passengers`} />
                                    <DetailItem icon={Smartphone} label="Device Type" value={application.device_type} />
                                    {application.additional_info?.permissionPicture && (
                                        <DetailItem
                                            icon={BadgeCheck}
                                            label="Permission to use picture"
                                            value={application.additional_info.permissionPicture === 'yes' ? 'Granted' : 'Denied'}
                                        />
                                    )}
                                </div>
                            </section>

                            {/* Documents Section */}
                            <section>
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
                                    <FileText className="w-5 h-5 text-primary" />
                                    Documents & Licenses
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    <DocumentPreview label="Profile Photo" url={application.profile_photo_url} />
                                    <DocumentPreview label="Driver License" url={application.driver_license_url} />
                                    <DocumentPreview label="TLC License" url={application.tlc_license_url} />
                                    <DocumentPreview label="Car Registration" url={application.car_registration_url} />
                                    <DocumentPreview label="Vehicle Inspection" url={application.vehicle_inspection_url} />
                                    <DocumentPreview label="TLC Diamond" url={application.tlc_diamond_url} />
                                </div>

                                {/* Array Documents */}
                                <div className="mt-6">
                                    <p className="text-sm font-medium mb-3 text-muted-foreground">Insurance Files</p>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {application.insurance_files_urls?.map((url: string, index: number) => (
                                            <DocumentPreview key={`ins-${index}`} label={`Insurance ${index + 1}`} url={url} />
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <p className="text-sm font-medium mb-3 text-muted-foreground">Vehicle Photos</p>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {application.vehicle_photos_urls?.map((url: string, index: number) => (
                                            <DocumentPreview key={`veh-${index}`} label={`Vehicle Photo ${index + 1}`} url={url} />
                                        ))}
                                    </div>
                                </div>
                            </section>

                            {/* Referrals Section */}
                            {referrals && referrals.length > 0 && (
                                <section>
                                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
                                        <Users className="w-5 h-5 text-primary" />
                                        Referrals ({referrals.length})
                                    </h3>
                                    <div className="bg-card border rounded-lg overflow-hidden flex flex-col">
                                        <div className="bg-muted/50 border-b">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr>
                                                        <th className="text-left py-3 px-4 font-medium text-muted-foreground w-1/3">Name</th>
                                                        <th className="text-left py-3 px-4 font-medium text-muted-foreground w-1/3">Status</th>
                                                        <th className="text-right py-3 px-4 font-medium text-muted-foreground w-1/3">Registered Date</th>
                                                    </tr>
                                                </thead>
                                            </table>
                                        </div>
                                        <div className="max-h-60 overflow-y-auto">
                                            <table className="w-full text-sm">
                                                <tbody className="divide-y">
                                                    {referrals.map((ref, i) => (
                                                        <tr key={i} className="hover:bg-muted/50">
                                                            <td className="py-3 px-4 font-medium w-1/3">{ref.full_name || "Unknown"}</td>
                                                            <td className="py-3 px-4 w-1/3">
                                                                <Badge variant="secondary" className="capitalize font-normal">
                                                                    {ref.status || "Pending"}
                                                                </Badge>
                                                            </td>
                                                            <td className="py-3 px-4 text-right text-muted-foreground w-1/3">
                                                                {new Date(ref.created_at).toLocaleDateString()}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </section>
                            )}
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>

            {/* Lightbox / Image Viewer */}
            {/* Lightbox / Image Viewer */}
            {/* Lightbox / Image Viewer */}
            <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
                <DialogContent className="max-w-[95vw] max-h-[95vh] w-fit h-fit p-0 border-none bg-transparent shadow-none sm:rounded-lg overflow-visible">
                    <DialogHeader className="hidden">
                        <DialogTitle>Image View</DialogTitle>
                    </DialogHeader>
                    <div className="relative flex items-center justify-center">
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute -top-12 right-0 z-50 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors cursor-pointer"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <img
                            src={selectedImage!}
                            alt="Full view"
                            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};
