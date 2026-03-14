import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Car, Crown, ArrowLeft, ArrowRight, CheckCircle, Upload, AlertTriangle, LogOut, Camera, RefreshCw, XCircle, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import g4Logo from "@/assets/g4-logo.jpg";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import { visionService } from "@/services/vision.service";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import { ParticlesBackground } from "@/components/ParticlesBackground";

interface RegisterDriverProps {
    type: "regular" | "luxury";
}

type WizardStep = 'welcome' | 'form' | 'review' | 'success';

// Tipos de preguntas soportadas
type QuestionType = 'text' | 'email' | 'tel' | 'number' | 'select' | 'radio' | 'file';

interface QuestionOption {
    label: string;
    value: string;
}

interface Question {
    id: string;
    label: string;
    type: QuestionType;
    placeholder?: string;
    required?: boolean;
    helper?: string;
    options?: QuestionOption[]; // Para select o radio
    accept?: string; // Para inputs de archivo
    multiple?: boolean; // Para inputs de archivo
    useCamera?: boolean; // Nueva propiedad para indicar si usa cámara
    sampleImage?: string; // ID o nombre de la imagen de ejemplo en el bucket
    onlyFor?: 'regular' | 'luxury'; // Filtro opcional por tipo de conductor
}

const VEHICLE_TIERS = {
    'tier_1': {
        label: 'Tier 1 - Luxury',
        image: 'tier-1-group.jpg',
        models: [
            { id: 'escalade', label: 'Cadillac Escalade' },
            { id: 'escalade', label: 'Cadillac Escalade Interrail' },
        ]
    },
    'tier_2': {
        label: 'Tier 2 - Luxury SUV XL',
        image: 'tier-2-group.jpg',
        models: [
            { id: 'yukon-xl', label: 'GMC Yukon XL' },
            { id: 'suburban', label: 'Suburban SUV XL' },
            { id: 'expedition', label: 'Ford Expedition XL' },
            { id: 'navigator-xl', label: 'Lincoln Navigator XL' },
            { id: 'grand-wagoneer', label: 'Jeep Grand Wagoneer XL' },
        ]
    },
    'tier_3': {
        label: 'Tier 3 - Luxury SUV',
        image: 'tier-3-group.jpg',
        models: [
            { id: 'gla', label: 'Mercedes-Benz GLA' },
            { id: 'nautilus', label: 'Lincoln Nautilus' },
            { id: 'x5', label: 'BMW X5' },
            { id: 'telluride', label: 'Kia Telluride' },
            { id: 'palisade', label: 'Hyundai Palisade' },
            { id: 'highlander', label: 'Toyota Grand Highlander' },
            { id: 'x90-b6', label: 'Volvo X90 B6' },
            { id: 'xt6', label: 'Cadillac XT6' },
        ]
    },
    'tier_4': {
        label: 'Tier 4 - Luxury EV',
        image: 'tier-4-group.jpg',
        models: [
            { id: 'model-y', label: 'Tesla Model Y' },
            { id: 'model-s', label: 'Tesla Model S' },
            { id: 'model-x', label: 'Tesla Model X' },
            { id: 'lyriq', label: 'Cadillac Lyriq' },
            { id: 'eqe-350', label: 'Mercedes-Benz EQE 350 + SUV' },
        ]
    },
    'tier_5': {
        label: 'Tier 5 - Luxury Sedan',
        image: 'tier-5-group.jpg',
        models: [
            { id: 's-580', label: 'Mercedes-S Class' },
            { id: '340', label: 'BMW 340' },
            { id: 'continental', label: 'Lincoln Continental' },
            { id: 'ct5', label: 'Cadillac CT5' },
        ]
    },
    'tier_6': {
        label: 'Tier 6 - Reservation only',
        image: 'tier-6-group.jpg',
        models: [
            { id: 's90-b9', label: 'Volvo S90 B9' },
            { id: 's8', label: 'Audi S8' },
            { id: 's-580', label: 'Mercedes-S 580' },
            { id: '740ti', label: '2025 BMW 7 Series 740i' },
            { id: 'sienna', label: 'Chrysler Pacifica Wheelchair' },
            { id: 'sienna', label: 'Toyota Sienna Wheelchair' },
            { id: 'sprinter', label: 'Mercedes Sprinter' },
        ]
    }
};

const RegisterDriver = ({ type }: RegisterDriverProps) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<any>({
        driverCategory: type === "luxury" ? "luxury" : "comfort",
    });
    const [step, setStep] = useState<WizardStep>('welcome');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

    useEffect(() => {
        // Load pending referral code if exists
        const pendingRef = localStorage.getItem("pending_referral");
        if (pendingRef) {
            console.log("🎁 Applying pending referral code to registration:", pendingRef);
            setFormData(prev => ({ ...prev, referralCode: pendingRef }));
            setIsReferralLocked(true);
        }
    }, []);

    // Estado para previsualización de archivos
    const [previewUrls, setPreviewUrls] = useState<Record<string, string[]>>({});

    // --- ESTADOS CÁMARA & VISIÓN ---
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isValidatingImage, setIsValidatingImage] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isReferralLocked, setIsReferralLocked] = useState(false);

    // --- CONFIGURACIÓN DE PREGUNTAS ---
    const questions: Question[] = [
        // 1) Referral
        { id: 'referralCode', label: 'Referral driver # / Número de referencia del chofer', type: 'text', placeholder: 'Enter code if applicable', required: false },

        // 2) Email (Pre-filled)
        { id: 'email', label: 'Email / Correo Electrónico', type: 'email', placeholder: 'email@example.com', required: true },

        // 3) Full Name
        { id: 'fullName', label: 'Full Name / Nombre Completo', type: 'text', placeholder: 'John Doe', required: true },

        // 4) Address
        { id: 'address', label: 'Full Address / Dirección donde vive', type: 'text', placeholder: '123 Abc Street #1 Bronx, NY 10000', required: true, helper: 'Example: 123 Abc Street #1 Bronx, NY 10000' },

        // 5) Phone
        { id: 'phone', label: 'Phone Number / Número de teléfono', type: 'tel', placeholder: '+1 555 000 0000', required: true },

        // 6) Emergency Number
        { id: 'emergencyNumber', label: 'Emergency Number / Número de emergencia', type: 'tel', placeholder: '+1 555 999 9999', required: true },

        // 7) Device Type
        {
            id: 'deviceType',
            label: 'Please select the device where you will receive the trip information / Seleccione el dispositivo',
            type: 'radio',
            required: true,
            options: [
                { label: 'Phone / Teléfono', value: 'phone' },
                { label: 'Tablet / Tableta', value: 'tablet' }
            ]
        },

        // 8) Vehicle Type Category
        {
            id: 'vehicleCategory',
            label: 'Please indicate what type of vehicle you have / Indique qué tipo de vehículo tiene',
            type: 'radio',
            required: true,
            options: [
                { label: 'EV (Electric Vehicle)', value: 'ev' },
                { label: 'Hybrid Car', value: 'hybrid' },
                { label: 'Gasoline Car', value: 'gasoline' },
                { label: 'Wheelchair Accessible', value: 'wheelchair' }
            ]
        },

        // 9) Passenger Capacity
        { id: 'passengerCapacity', label: 'How many passengers can your vehicle carry? / ¿Cuántos pasajeros pueden viajar?', type: 'number', placeholder: '4', required: true },

        // Vehicle Class Selection (REGULAR)
        {
            id: 'vehicleClass',
            label: 'Select your vehicle class / Seleccione la clase de su vehículo',
            type: 'select',
            required: true,
            onlyFor: 'regular',
            options: [
                { label: 'Compact vehicle or SEDAN (3 pass | 2 bags)', value: 'sedan' },
                { label: 'SUV (4 pass | 3 bags)', value: 'suv' },
                { label: 'SUV XL or Minivan (5 pass | 3 bags)', value: 'suv_xl' },
                { label: 'SUV 2XL (6 pass | 5 bags)', value: 'suv_2xl' }
            ]
        },

        // Vehicle Tier Selection (LUXURY)
        {
            id: 'vehicleTier',
            label: 'Select your vehicle tier / Seleccione el nivel de su vehículo',
            type: 'select',
            required: true,
            onlyFor: 'luxury',
            options: Object.entries(VEHICLE_TIERS).map(([id, tier]) => ({
                label: tier.label,
                value: id
            }))
        },

        // Specific Model Selection (LUXURY)
        {
            id: 'vehicleClass',
            label: 'Select your vehicle model / Seleccione el modelo de su vehículo',
            type: 'select',
            required: true,
            onlyFor: 'luxury',
            options: formData.vehicleTier ? VEHICLE_TIERS[formData.vehicleTier as keyof typeof VEHICLE_TIERS]?.models.map(m => ({
                label: m.label,
                value: m.id
            })) : []
        },

        // --- DOCUMENT UPLOADS ---
        { id: 'driverLicense', label: 'Driver License ID / Licencia de Conducir', type: 'file', accept: 'image/*,.pdf', required: true, helper: 'Provided Clear Picture or PDF Files. Max 10MB.', sampleImage: 'drivers-license.png' },
        { id: 'tlcLicense', label: 'TLC License ID / Licencia de TLC', type: 'file', accept: 'image/*,.pdf', required: true, helper: 'Provided Clear Picture or PDF Files. Max 10MB.', sampleImage: 'TLC-license.png' },
        { id: 'carRegistration', label: 'Car Registration / Registración de vehículo', type: 'file', accept: 'image/*,.pdf', required: true, helper: 'Provided Clear Picture or PDF Files. Max 10MB.', sampleImage: 'car-registration.png' },
        { id: 'vehicleInspection', label: 'Vehicle Inspection / Inspección de Vehículo', type: 'file', accept: 'image/*,.pdf', required: true, helper: 'Provided Clear Picture or PDF Files. Max 10MB.', sampleImage: 'vehicle-inspection.png' },
        { id: 'tlcDiamond', label: 'TLC Diamond / Diamante de TLC', type: 'file', accept: 'image/*,.pdf', required: true, helper: 'Provided Clear Picture or PDF Files. Max 10MB.', sampleImage: 'TLC-diamond.jpg' },
        { id: 'insuranceFiles', label: 'Car Insurance / Seguro de Vehículo (FH-1, Liability, Declarations)', type: 'file', accept: 'image/*,.pdf', multiple: true, required: true, helper: 'Upload all forms (FH-1, CERTIFICATE, DECLARATIONS). Max 10MB each.', sampleImage: 'car-insurance.png' },

        // 15a) Self Portrait (MODIFIED FOR CAMERA)
        {
            id: 'profilePhoto',
            label: 'Self-portrait wearing a polo / Autorretrato con polo',
            type: 'file', // Usamos 'file' como base pero renderizamos cámara custom
            useCamera: true, // Flag para activar cámara
            accept: 'image/*',
            required: true,
            helper: type === 'luxury'
                ? 'Luxury Requirement: Tie and Formal Wear MUST be detected.'
                : 'Please ensure your hairstyle is well-groomed and attire aligns with dress code.',
            sampleImage: 'self-portrait.jpg'
        },

        // 15b) Vehicle Photos
        { id: 'vehiclePhotos', label: '4 pictures of all the views of the vehicle / 4 fotos del vehículo', type: 'file', accept: 'image/*', multiple: true, required: true, helper: 'Front, Back, Left Side, Right Side. Clean vehicle before taking pictures.', sampleImage: '4-pictures-vehicle.png' },

        { id: 'additionalInfo', label: 'Additional information / Información adicional', type: 'text', required: false },

        // --- NEW LUXURY QUESTIONS ---
        { id: 'hourlyRate', label: 'How much do you charge an hour? / ¿Cuánto cobra por hora?', type: 'number', placeholder: '0.00', required: true, onlyFor: 'luxury' },
        { id: 'mileageRate', label: 'How much you charge per mile? / ¿Cuánto cobra por milla?', type: 'number', placeholder: '0.00', required: true, onlyFor: 'luxury' },
        { id: 'manhattanToJFK', label: 'How much you charge for Manhattan to JFK? / Manhattan a JFK', type: 'number', placeholder: '0.00', required: true, onlyFor: 'luxury' },
        { id: 'manhattanToLGA', label: 'How much you charge for Manhattan to LGA? / Manhattan a LGA', type: 'number', placeholder: '0.00', required: true, onlyFor: 'luxury' },
        { id: 'manhattanToEWR', label: 'How much you charge for Manhattan to EWR? / Manhattan a EWR', type: 'number', placeholder: '0.00', required: true, onlyFor: 'luxury' },
        { id: 'manhattanToWestchester', label: 'How much you charge for Manhattan to Westchester County Airport?', type: 'number', placeholder: '0.00', required: true, onlyFor: 'luxury' },
        { id: 'manhattanToTeterboro', label: 'How much you charge for Manhattan to Teterboro Airport?', type: 'number', placeholder: '0.00', required: true, onlyFor: 'luxury' },
        {
            id: 'permissionPicture',
            label: 'Do you give us permission to use your picture? / ¿Nos da permiso para usar su foto?',
            type: 'radio',
            required: true,
            onlyFor: 'luxury',
            options: [
                { label: 'Yes / Sí', value: 'yes' },
                { label: 'No', value: 'no' }
            ]
        },
    ];

    useEffect(() => {
        // Pre-fill email
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user?.email) {
                setFormData(prev => ({ ...prev, email: session.user.email! }));
            }
        });
    }, []);

    // Filter questions based on driver type
    const filteredQuestions = questions.filter(q => !q.onlyFor || q.onlyFor === type);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        let { name, value } = e.target;

        // 1. Validation: Seat Capacity (Max 6)
        if (name === 'passengerCapacity') {
            const numVal = parseInt(value);
            if (numVal > 6) {
                toast.error("Maximum passenger capacity is 6");
                return;
            }
            if (numVal < 0) return;
        }

        // 2. Specific Validation: Phone Numbers (Q5 & Q6)
        // Allow ONLY numbers and special phone symbols. Remove letters/others immediately.
        if (name === 'phone' || name === 'emergencyNumber') {
            const cleanValue = value.replace(/[^0-9+\-\s().]/g, '');
            if (value !== cleanValue) {
                // If the user typed an invalid char, we don't update state with it.
                // Optionally warn? No, cleaner to just block input.
                return;
            }
            // Max length for phone (e.g. 20 chars)
            if (cleanValue.length > 20) return;
            value = cleanValue;
        }

        // 3. Validation: Full Name (Min/Max limit enforcement during typing - Max 50)
        if (name === 'fullName') {
            if (value.length > 50) return; // Silent block
        }

        // 4. Validation: Address (Max 200)
        if (name === 'address') {
            if (value.length > 200) return; // Silent block
        }

        // 5. Generic Safety Net
        if (value.length > 300 && name !== 'additionalInfo') {
            return;
        }

        setFormData({ ...formData, [name]: value });
    };

    const handleSelectChange = (value: string, name: string) => {
        if (name === 'vehicleTier') {
            setFormData({ ...formData, [name]: value, vehicleClass: '' });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    // Función específica para manejar inputs de tipo 'radio'
    const handleRadioChange = (value: string, name: string) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        const name = e.target.name;

        if (files && files.length > 0) {
            // 3. Validation: Max Files (Max 4)
            if (files.length > 4) {
                toast.error("Maximum 4 files allowed per field");
                e.target.value = ""; // Clear input
                return;
            }

            const newUrls: string[] = [];
            Array.from(files).forEach(file => {
                newUrls.push(URL.createObjectURL(file));
            });

            setPreviewUrls(prev => ({ ...prev, [name]: newUrls }));
            setFormData(prev => ({ ...prev, [name]: files }));
        }
    };

    // --- CÁMARA LOGIC ---
    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
            setStream(mediaStream);
            setIsCameraOpen(true);
            setValidationError(null);
        } catch (err) {
            console.error("Camera error:", err);
            toast.error("Could not access camera. Please allow permissions.");
        }
    };

    // Use a callback ref to handle the video element mounting
    const setVideoRef = useCallback((node: HTMLVideoElement | null) => {
        videoRef.current = node;
        if (node && stream) {
            node.srcObject = stream;
            // Explicitly play to avoid some browser restrictions
            node.play().catch(err => console.error("Error playing video:", err));
        }
    }, [stream]);

    // Cleanup effect
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setIsCameraOpen(false);
    };

    const capturePhoto = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

        const photoData = canvas.toDataURL('image/jpeg');
        setCapturedImage(photoData);
        stopCamera();

        // VALIDACIÓN LUXURY
        if (type === 'luxury') {
            setIsValidatingImage(true);
            try {
                // Mock validation fallback in case service fails or key missing
                const { isFormal } = await visionService.analyzeImage(photoData);


                if (isFormal) {
                    toast.success("Formal Attire Verified! (Suit/Tie Detected)");
                    setValidationError(null);
                    // Guardar en formData
                    setFormData(prev => ({ ...prev, profilePhoto: photoData }));
                } else {
                    setValidationError("Review Failed: No formal wear (Suit/Tie) detected. Please ensure you are wearing a tie and suit.");
                    toast.error("Verification Failed: Formal wear not detected.");
                }

            } catch (error) {
                console.error("Vision API Validation failed:", error);
                // En fallback, si falla la API, podríamos dejar pasar o bloquear. Por ahora bloqueamos.
                setValidationError("Could not verify image. Please try again or ensure good lighting.");
            } finally {
                setIsValidatingImage(false);
            }
        } else {
            // REGULAR DRIVER - No validation needed
            setFormData(prev => ({ ...prev, profilePhoto: photoData }));
        }
    };

    const retakePhoto = () => {
        setCapturedImage(null);
        setValidationError(null);
        startCamera();
    };

    const handleNext = () => {
        const currentQ = filteredQuestions[currentQuestionIndex];

        // Validación básica
        if (currentQ.required) {
            const val = formData[currentQ.id];

            // Validación específica para cámara
            if (currentQ.useCamera) {
                if (!val && !capturedImage) {
                    toast.error("Please take a photo to continue");
                    return;
                }
                if (type === 'luxury' && validationError) {
                    toast.error("Formal wear verification failed. Please retake photo.");
                    return;
                }
            }
            // Validación archivos normales
            else if (currentQ.type === 'file') {
                if (!val || val.length === 0) {
                    toast.error("Please upload the required file(s)");
                    return;
                }
            } else {
                if (!val) {
                    toast.error("Please answer the question to continue");
                    return;
                }

                // --- LENGTH & REGEX VALIDATIONS ---

                // 1. Full Name: Min 3 chars
                if (currentQ.id === 'fullName') {
                    if (val.trim().length < 3) {
                        toast.error("Full Name must be at least 3 characters long");
                        return;
                    }
                }

                // 2. Address: Min 10 chars
                if (currentQ.id === 'address') {
                    if (val.trim().length < 10) {
                        toast.error("Address must be at least 10 characters long");
                        return;
                    }
                }

                if (currentQ.type === 'email') {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(val)) {
                        toast.error("Please enter a valid email address");
                        return;
                    }
                }

                if (currentQ.type === 'tel') {
                    // Min 10 digits, allow +, -, space, brackets
                    const digits = val.replace(/\D/g, '');
                    if (digits.length < 10) {
                        toast.error("Phone number must have at least 10 digits");
                        return;
                    }
                }
            }
        }

        if (currentQuestionIndex < filteredQuestions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            setStep('review');
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        } else {
            setStep('welcome');
        }
    };

    // Función auxiliar para convertir la foto de la cámara (Base64) a Archivo real
    const dataURLtoFile = (dataurl: string, filename: string) => {
        const arr = dataurl.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    };

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);
            console.log("=== PREPARANDO ENVÍO ===");

            const formDataToSend = new FormData();

            // 1. CAMPOS DE TEXTO
            // Mapeamos del Estado (camelCase) al Backend (snake_case)
            formDataToSend.append("full_name", formData.fullName || "");
            formDataToSend.append("address", formData.address || "");
            formDataToSend.append("phone_number", formData.phone || "");
            formDataToSend.append("emergency_number", formData.emergencyNumber || "");
            formDataToSend.append("device_type", formData.deviceType || "");
            formDataToSend.append("vehicle_type", formData.vehicleClass || ""); // Ojo: vehicleClass -> vehicle_type
            formDataToSend.append("passenger_capacity", formData.passengerCapacity?.toString() || "");
            formDataToSend.append("driver_category", type === "luxury" ? "luxury" : "comfort");

            // 2. ARCHIVOS INDIVIDUALES
            // Lógica: Leemos el nombre del estado (camelCase) -> Enviamos como (snake_case)
            // Usamos [0] porque 'files' es una lista

            // Licencia
            if (formData.driverLicense && formData.driverLicense[0]) {
                formDataToSend.append("driver_license", formData.driverLicense[0]);
            }

            // TLC License
            if (formData.tlcLicense && formData.tlcLicense[0]) {
                formDataToSend.append("tlc_license", formData.tlcLicense[0]);
            }

            // Car Registration
            if (formData.carRegistration && formData.carRegistration[0]) {
                formDataToSend.append("car_registration", formData.carRegistration[0]);
            }

            // Vehicle Inspection
            if (formData.vehicleInspection && formData.vehicleInspection[0]) {
                formDataToSend.append("vehicle_inspection", formData.vehicleInspection[0]);
            }

            // TLC Diamond
            if (formData.tlcDiamond && formData.tlcDiamond[0]) {
                formDataToSend.append("tlc_diamond", formData.tlcDiamond[0]);
            }

            // 3. FOTO DE PERFIL (Manejo Especial: Cámara vs Archivo)
            if (formData.profilePhoto) {
                // Caso A: Es un string (Viene de la cámara como Base64)
                if (typeof formData.profilePhoto === 'string' && formData.profilePhoto.startsWith('data:')) {
                    const file = dataURLtoFile(formData.profilePhoto, 'profile_photo.jpg');
                    formDataToSend.append("profile_photo", file);
                }
                // Caso B: Es un FileList (Viene del input type="file" tradicional)
                else if (formData.profilePhoto instanceof FileList && formData.profilePhoto.length > 0) {
                    formDataToSend.append("profile_photo", formData.profilePhoto[0]);
                }
                // Caso C: Es un File único (casos raros)
                else if (formData.profilePhoto instanceof File) {
                    formDataToSend.append("profile_photo", formData.profilePhoto);
                }
            }

            // 4. ARCHIVOS MÚLTIPLES (Fotos del auto)
            if (formData.vehiclePhotos && formData.vehiclePhotos.length > 0) {
                for (let i = 0; i < formData.vehiclePhotos.length; i++) {
                    formDataToSend.append("vehicle_photos", formData.vehiclePhotos[i]);
                }
            }

            // 5. ARCHIVOS MÚLTIPLES (Seguros)
            if (formData.insuranceFiles && formData.insuranceFiles.length > 0) {
                for (let i = 0; i < formData.insuranceFiles.length; i++) {
                    formDataToSend.append("insurance_files", formData.insuranceFiles[i]);
                }
            }

            // 6. INFO ADICIONAL (Referral para todos, campos extra solo Luxury)
            const additionalInfo: any = {
                referralCode: formData.referralCode || "",
            };

            if (type === 'luxury') {
                additionalInfo.vehicleCategory = formData.vehicleCategory || "";
                additionalInfo.additionalInfo = formData.additionalInfo || "";
                additionalInfo.hourlyRate = formData.hourlyRate || "";
                additionalInfo.mileageRate = formData.mileageRate || "";
                additionalInfo.manhattanToJFK = formData.manhattanToJFK || "";
                additionalInfo.manhattanToLGA = formData.manhattanToLGA || "";
                additionalInfo.manhattanToEWR = formData.manhattanToEWR || "";
                additionalInfo.manhattanToWestchester = formData.manhattanToWestchester || "";
                additionalInfo.manhattanToTeterboro = formData.manhattanToTeterboro || "";
                additionalInfo.permissionPicture = formData.permissionPicture || "";
                additionalInfo.vehicleTier = formData.vehicleTier || "";
                additionalInfo.vehicleModel = formData.vehicleClass || "";
            }

            formDataToSend.append("additional_info", JSON.stringify(additionalInfo));

            // 7. ENVÍO
            const { data: { session } } = await supabase.auth.getSession();

            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/drivers/register`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session?.access_token}`,
                    // NO Content-Type manual
                },
                body: formDataToSend
            });

            if (!response.ok) {
                const errorText = await response.text();
                // Detectar Rate Limit
                if (response.status === 429) {
                    throw new Error("Demasiados intentos. Por favor espera 5 minutos.");
                }
                throw new Error(errorText || "Error en el servidor");
            }

            const result = await response.json();
            console.log("Success:", result);
            toast.success("¡Solicitud enviada con éxito!");
            navigate("/profile");

        } catch (error: any) {
            console.error("Submission error:", error);
            toast.error(error.message || "Error al enviar la solicitud");
        } finally {
            setIsSubmitting(false);
        }
    };
    const handleLogout = async () => {
        try {
            await authService.signOut();
            toast.success("Signed out successfully");
            navigate("/");
        } catch (error) {
            console.error(error);
            toast.error("Error signing out");
        }
    };

    const currentQ = filteredQuestions[currentQuestionIndex];

    const Header = () => (
        <header className={`py-6 border-b ${type === "luxury" ? "border-muted-foreground/20" : "border-border"}`}>
            <div className="container mx-auto px-6">
                <div className="flex items-center justify-between">
                    <div className="w-20"></div>

                    <img src={g4Logo} alt="G4 Car Service" className="h-10 rounded-lg" />

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        className={`flex items-center gap-2 ${type === "luxury" ? "text-red-400 hover:text-red-300 hover:bg-white/10" : "text-red-500 hover:text-red-600 hover:bg-red-50"}`}
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="hidden md:inline">Logout</span>
                    </Button>
                </div>
            </div>
        </header>
    );

    // RENDERIZADO DE INPUTS SEGÚN TIPO
    const renderInput = () => {
        // --- CÁMARA INPUT ---
        if (currentQ.useCamera) {
            return (
                <div className="space-y-4 text-center">
                    <div className="relative mx-auto w-full max-w-sm aspect-square bg-black rounded-xl overflow-hidden shadow-lg border-2 border-border">
                        {/* 1. Live Camera */}
                        {isCameraOpen && !capturedImage && (
                            <video
                                ref={setVideoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover transform scale-x-[-1]" // Matrix transform for mirror effect
                            />
                        )}

                        {/* 2. Captured Image */}
                        {capturedImage && (
                            <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                        )}

                        {/* 3. Placeholder / Initial State */}
                        {!isCameraOpen && !capturedImage && (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                <Camera className="w-16 h-16 mb-2 opacity-50" />
                                <p>Cámara inactiva</p>
                            </div>
                        )}

                        {/* Canvas oculto para captura */}
                        <canvas ref={canvasRef} className="hidden" />
                    </div>

                    {/* Validating Spinner */}
                    {isValidatingImage && (
                        <div className="text-blue-500 animate-pulse font-medium">
                            Verifying Formal Wear with AI...
                        </div>
                    )}

                    {/* Error Message */}
                    {validationError && (
                        <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 flex items-center justify-center gap-2">
                            <XCircle className="w-5 h-5 flex-shrink-0" />
                            <span className="text-sm text-left">{validationError}</span>
                        </div>
                    )}

                    {/* Success Message */}
                    {type === 'luxury' && capturedImage && !validationError && !isValidatingImage && (
                        <div className="p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-green-500 flex items-center justify-center gap-2">
                            <CheckCircle className="w-5 h-5" />
                            <span className="text-sm">Formal wear approved!</span>
                        </div>
                    )}

                    {/* Controls */}
                    <div className="flex flex-col gap-3">
                        {!isCameraOpen && !capturedImage && (
                            <>
                                <Button onClick={startCamera} size="lg" className="w-full">
                                    <Camera className="mr-2 w-5 h-5" /> Open Camera
                                </Button>
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t border-border" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className={`px-2 ${type === "luxury" ? "bg-foreground text-muted" : "bg-background text-muted-foreground"}`}>
                                            Or
                                        </span>
                                    </div>
                                </div>
                                <label htmlFor={`file-upload-${currentQ.id}`}>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="lg"
                                        className={`w-full ${type === "luxury" ? "bg-transparent border-accent text-accent hover:bg-accent/10" : ""}`}
                                        asChild
                                    >
                                        <span>
                                            <Upload className="mr-2 w-5 h-5" /> Upload Image
                                        </span>
                                    </Button>
                                    <input
                                        id={`file-upload-${currentQ.id}`}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                if (file.size > 2 * 1024 * 1024) {
                                                    toast.error("File size exceeds 2MB limit. Please upload a smaller image.");
                                                    return;
                                                }
                                                const reader = new FileReader();
                                                reader.onload = (event) => {
                                                    const imageData = event.target?.result as string;
                                                    setCapturedImage(imageData);

                                                    // Validate if luxury
                                                    if (type === 'luxury') {
                                                        setIsValidatingImage(true);
                                                        visionService.analyzeImage(imageData)
                                                            .then(({ isFormal }) => {
                                                                if (isFormal) {
                                                                    setValidationError(null);
                                                                    setFormData(prev => ({ ...prev, [currentQ.id]: file }));
                                                                } else {
                                                                    setValidationError("Formal wear not detected. Please upload a photo in formal attire.");
                                                                    setCapturedImage(null);
                                                                }
                                                            })
                                                            .catch(err => {
                                                                console.error("Vision API error:", err);
                                                                let errorMsg = "Could not validate image. Please try again.";

                                                                if (err.message === "RATE_LIMIT_EXCEEDED") {
                                                                    errorMsg = "Too many attempts. Please wait 1 minute before trying again.";
                                                                } else if (err.message === "FILE_TOO_LARGE") {
                                                                    errorMsg = "File size exceeds limit. Please choose a smaller photo.";
                                                                }

                                                                setValidationError(errorMsg);
                                                                toast.error(errorMsg);
                                                                setCapturedImage(null);
                                                            })
                                                            .finally(() => setIsValidatingImage(false));
                                                    } else {
                                                        setFormData(prev => ({ ...prev, [currentQ.id]: file }));
                                                    }
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                </label>
                            </>
                        )}

                        {isCameraOpen && (
                            <div className="flex gap-2">
                                <Button onClick={capturePhoto} size="lg" variant="default" className="flex-1 bg-white text-black hover:bg-gray-200">
                                    <div className="w-4 h-4 rounded-full bg-red-500 mr-2 animate-pulse" /> Capture
                                </Button>
                                <Button onClick={stopCamera} size="lg" variant="destructive" className="flex-1">
                                    <LogOut className="w-4 h-4 mr-2 rotate-180" /> Cancel
                                </Button>
                            </div>
                        )}

                        {capturedImage && (
                            <Button
                                onClick={retakePhoto}
                                variant="outline"
                                className={`w-full ${type === "luxury" ? "bg-transparent border-accent text-accent hover:bg-accent/10" : ""}`}
                            >
                                <RefreshCw className="mr-2 w-4 h-4" /> Retake Photo
                            </Button>
                        )}
                    </div>
                </div>
            );
        }

        let inputElement;

        switch (currentQ.type) {
            case 'select':
                inputElement = (
                    <select
                        name={currentQ.id}
                        value={formData[currentQ.id] || ''}
                        onChange={(e) => handleSelectChange(e.target.value, currentQ.id)}
                        className={`w-full p-4 rounded-md border text-lg ${type === 'luxury'
                            ? 'bg-card/10 border-muted-foreground/30 text-card'
                            : 'bg-background border-input text-foreground'
                            }`}
                    >
                        <option value="" className="text-gray-900 bg-white">Select an option...</option>
                        {currentQ.options?.map(opt => (
                            <option key={opt.value} value={opt.value} className="text-gray-900 bg-white">{opt.label}</option>
                        ))}
                    </select>
                );
                break;

            case 'radio':
                inputElement = (
                    <div className="space-y-3">
                        {currentQ.options?.map(opt => (
                            <label
                                key={opt.value}
                                className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${formData[currentQ.id] === opt.value
                                    ? (type === 'luxury' ? 'bg-accent/20 border-accent' : 'bg-primary/10 border-primary')
                                    : (type === 'luxury' ? 'border-muted-foreground/30 hover:bg-white/5' : 'border-input hover:bg-gray-50')
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name={currentQ.id}
                                    value={opt.value}
                                    checked={formData[currentQ.id] === opt.value}
                                    onChange={() => handleRadioChange(opt.value, currentQ.id)}
                                    className="w-5 h-5 text-primary"
                                />
                                <span className={`text-lg ${type === 'luxury' ? 'text-card' : 'text-foreground'}`}>
                                    {opt.label}
                                </span>
                            </label>
                        ))}
                    </div>
                );
                break;

            case 'file':
                inputElement = (
                    <div className="space-y-4">
                        <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${type === 'luxury' ? 'border-muted-foreground/30 hover:border-accent' : 'border-input hover:border-primary'
                            }`}>
                            <Upload className={`w-10 h-10 mx-auto mb-4 ${type === 'luxury' ? 'text-muted' : 'text-muted-foreground'}`} />
                            <label className="cursor-pointer">
                                <span className={`text-lg font-medium hover:underline ${type === 'luxury' ? 'text-accent' : 'text-primary'}`}>
                                    Click to upload
                                </span>
                                <input
                                    type="file"
                                    name={currentQ.id}
                                    accept={currentQ.accept}
                                    multiple={currentQ.multiple}
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>
                            <p className="text-sm text-muted-foreground mt-2">
                                {currentQ.multiple ? 'Supported files: Images, PDF. Max 10MB per file.' : 'Supported file: Image or PDF. Max 10MB.'}
                            </p>
                        </div>

                        {/* Previews */}
                        {previewUrls[currentQ.id] && (
                            <div className="flex gap-4 flex-wrap mt-4">
                                {previewUrls[currentQ.id].map((url, idx) => (
                                    <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-border">
                                        <img src={url} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        )}
                        {formData[currentQ.id] && (
                            <div className={`text-sm ${type === 'luxury' ? 'text-green-400' : 'text-green-600'} flex items-center gap-2`}>
                                <CheckCircle className="w-4 h-4" />
                                {formData[currentQ.id].length} file(s) selected
                            </div>
                        )}
                    </div>
                );
                break;

            default: // Text, Email, Tel, Number
                inputElement = (
                    <Input
                        autoFocus
                        name={currentQ.id}
                        type={currentQ.type}
                        placeholder={currentQ.placeholder}
                        value={formData[currentQ.id] || ''}
                        onChange={handleInputChange}
                        disabled={(currentQ.id === 'email' && !!formData.email && formData.email !== '') || (currentQ.id === 'referralCode' && isReferralLocked)}
                        className={`text-lg p-6 ${type === "luxury" ? "bg-card/5 border-muted-foreground/30 text-card placeholder:text-muted" : ""} ${(currentQ.id === 'referralCode' && isReferralLocked) ? "opacity-60 cursor-not-allowed bg-gray-100/10" : ""}`}
                    />
                );
                break;
        }

        return (
            <div className="space-y-4">
                {inputElement}

                {/* PREVIEW PARA VEHICULOS LUXURY */}
                {type === 'luxury' && (
                    <>

                        {currentQ.id === 'vehicleClass' && formData.vehicleClass && (
                            <div className="mt-4 animate-in fade-in zoom-in-95 duration-500 text-center">
                                <p className="text-sm text-muted-foreground mb-2">Vehicle Preview:</p>
                                <div className="inline-block rounded-xl overflow-hidden border-2 border-accent bg-black/20 p-4">
                                    <img
                                        src={`${import.meta.env.VITE_STORAGE_URL}/cars/${formData.vehicleClass}.png`}
                                        alt="Vehicle preview"
                                        className="h-32 w-auto object-contain"
                                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/300x200?text=Model+Preview' }}
                                    />
                                    <p className="mt-2 font-semibold text-accent capitalize">{formData.vehicleClass.replace(/-/g, ' ')}</p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        );
    };

    // --- VISTAS DEL WIZARD (Mismas de antes, con contenido actualizado) ---

    // 1. WELCOME
    if (step === 'welcome') {
        return (
            <div className={`min-h-screen flex flex-col relative overflow-hidden ${type === "luxury" ? "bg-foreground" : "bg-background"}`}>
                <ParticlesBackground type={type} />
                <Header />
                <div className="flex-1 flex items-center justify-center p-4 relative z-10">
                    <Card className={`max-w-xl w-full p-8 text-center border-border shadow-2xl ${type === "luxury" ? "bg-[#1a1a1a] text-white border-white/10" : "bg-card"}`}>
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 ${type === "luxury"
                            ? "bg-primary text-primary-foreground border border-primary/50 shadow-[0_0_20px_rgba(234,179,8,0.4)]"
                            : "bg-secondary text-foreground"
                            }`}>
                            {type === "luxury" ? <Crown className="w-5 h-5 drop-shadow-[0_0_3px_rgba(255,255,255,0.8)]" /> : <Car className="w-5 h-5" />}
                            <span className={`font-medium capitalize ${type === "luxury" ? "drop-shadow-[0_0_2px_rgba(255,255,255,0.5)]" : ""}`}>
                                {type} Driver Registration
                            </span>
                        </div>

                        <h1 className={`text-4xl font-bold mb-4 ${type === "luxury" ? "text-card" : "text-foreground"}`}>
                            Ready to join G4?
                        </h1>
                        <p className={`text-lg mb-8 ${type === "luxury" ? "text-muted" : "text-muted-foreground"}`}>
                            We'll guide you through the registration process step by step.
                            It will only take a few minutes.
                        </p>

                        {type === "luxury" && (
                            <div className="bg-accent/20 border border-accent/30 p-4 rounded-lg mb-8 text-left flex gap-3">
                                <AlertTriangle className="w-6 h-6 text-accent flex-shrink-0" />
                                <div>
                                    <h4 className="font-semibold text-card text-sm">Requirement</h4>
                                    <p className="text-xs text-muted">Formal attire is mandatory for Luxury drivers.</p>
                                </div>
                            </div>
                        )}

                        <Button
                            size="lg"
                            onClick={() => setStep('form')}
                            className={`w-full text-lg py-6 ${type === "luxury" ? "bg-accent hover:bg-accent/90" : ""}`}
                        >
                            Start Registration <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </Card>
                </div>
            </div>
        );
    }

    // 2. FORM
    if (step === 'form') {
        return (
            <div className={`min-h-screen flex flex-col relative overflow-hidden ${type === "luxury" ? "bg-foreground" : "bg-background"}`}>
                <ParticlesBackground type={type} />
                <Header />
                <div className="flex-1 flex flex-col items-center justify-center p-4">
                    <div className="w-full max-w-xl mb-8">
                        {/* Progress Bar */}
                        <div className={`h-2 rounded-full overflow-hidden ${type === "luxury" ? "bg-white/10" : "bg-secondary"}`}>
                            <div
                                className={`h-full transition-all duration-300 ${type === "luxury" ? "bg-accent" : "bg-primary"}`}
                                style={{ width: `${((currentQuestionIndex + 1) / filteredQuestions.length) * 100}%` }}
                            />
                        </div>
                        <div className={`flex justify-between mt-2 text-sm ${type === "luxury" ? "text-muted" : "text-muted-foreground"}`}>
                            <span>Question {currentQuestionIndex + 1} of {filteredQuestions.length}</span>
                            <span>{Math.round(((currentQuestionIndex + 1) / filteredQuestions.length) * 100)}% Completed</span>
                        </div>
                    </div>

                    <Card className={`w-full max-w-xl p-8 min-h-[400px] flex flex-col justify-between border-border shadow-2xl relative z-10 ${type === "luxury" ? "bg-[#1a1a1a] text-white border-white/10" : "bg-card"}`}>

                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="flex items-center gap-2 mb-4">
                                <Label className={`text-2xl font-semibold block ${type === "luxury" ? "text-card" : "text-foreground"}`}>
                                    {currentQ.label}
                                </Label>

                                {currentQ.sampleImage && (
                                    <HoverCard openDelay={200}>
                                        <HoverCardTrigger asChild>
                                            <div className="cursor-help transition-all duration-300 hover:scale-110">
                                                <div className="relative">
                                                    <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                                                    <HelpCircle className={`w-6 h-6 relative z-10 ${type === 'luxury' ? 'text-accent' : 'text-primary'} drop-shadow-[0_0_8px_rgba(var(--primary),0.8)]`} />
                                                </div>
                                            </div>
                                        </HoverCardTrigger>
                                        <HoverCardContent className="w-80 p-2">
                                            <div className="space-y-2">
                                                <h4 className="text-sm font-semibold">Reference Image / Imagen de Referencia</h4>
                                                <div className="aspect-video relative rounded-md overflow-hidden bg-muted">
                                                    <img
                                                        src={`${import.meta.env.VITE_STORAGE_URL}/documentation-examples/${currentQ.sampleImage}`}
                                                        alt="Reference"
                                                        className="object-cover w-full h-full"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = 'https://placehold.co/400x300?text=No+Image+Available';
                                                        }}
                                                    />
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    Please upload a document similar to this example.
                                                </p>
                                            </div>
                                        </HoverCardContent>
                                    </HoverCard>
                                )}
                            </div>

                            {/* Renderizador dinámico de Inputs */}
                            {renderInput()}

                            {currentQ.helper && (
                                <p className="text-sm text-muted-foreground mt-2">{currentQ.helper}</p>
                            )}
                        </div>

                        <div className="flex gap-4 mt-8 pt-8 border-t border-border">
                            <Button
                                variant="outline"
                                onClick={handlePrevious}
                                // Fix visibility for Luxury Mode Previous Button
                                className={`flex-1 ${type === "luxury" ? "bg-transparent border-accent text-accent hover:bg-accent/10" : ""}`}
                            >
                                <ArrowLeft className="mr-2 w-4 h-4" /> Previous
                            </Button>
                            <Button
                                onClick={handleNext}
                                className={`flex-1 ${type === "luxury" ? "bg-accent hover:bg-accent/90" : ""}`}
                            >
                                {currentQuestionIndex === filteredQuestions.length - 1 ? 'Review Answers' : 'Next'} <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </div>
                    </Card>
                </div >
            </div >
        );
    }

    // 3. REVIEW
    if (step === 'review') {
        return (
            <div className={`min-h-screen flex flex-col relative overflow-hidden ${type === "luxury" ? "bg-foreground" : "bg-background"}`}>
                <ParticlesBackground type={type} />
                <Header />
                <div className="flex-1 py-12 px-4">
                    <div className="max-w-2xl mx-auto space-y-8">
                        <div className="text-center">
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h2 className={`text-3xl font-bold mb-2 ${type === "luxury" ? "text-card" : "text-foreground"}`}>
                                Review your Application
                            </h2>
                            <p className={type === "luxury" ? "text-muted" : "text-muted-foreground"}>
                                Please verify your information before submitting.
                            </p>
                        </div>

                        <Card className={`p-8 space-y-6 border-border shadow-2xl relative z-10 ${type === "luxury" ? "bg-[#1a1a1a] text-white border-white/10" : "bg-card"}`}>
                            <div className="grid gap-6">
                                {filteredQuestions.map((q) => (
                                    <div key={q.id} className="grid grid-cols-1 md:grid-cols-3 gap-2 border-b border-border/50 pb-4 last:border-0">
                                        <span className={`font-medium ${type === "luxury" ? "text-muted" : "text-muted-foreground"}`}>
                                            {q.label}
                                        </span>
                                        <span className={`md:col-span-2 font-medium break-all ${type === "luxury" ? "text-card" : "text-foreground"}`}>
                                            {/* Renderizar valor textual o indicador de archivo */}
                                            {q.useCamera && formData[q.id] ? (
                                                <div className="flex items-center gap-2 text-green-500">
                                                    <Camera className="w-4 h-4" /> Photo Captured
                                                </div>
                                            ) : q.type === 'file' ? (
                                                formData[q.id] ? `${formData[q.id].length} file(s)` : 'No file'
                                            ) : (
                                                formData[q.id] || <span className="text-muted-foreground italic">Not answered</span>
                                            )}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-4 pt-6">
                                <Button
                                    variant="outline"
                                    onClick={() => setStep('form')}
                                    className={`flex-1 ${type === "luxury" ? "bg-transparent border-accent text-accent hover:bg-accent/10" : ""}`}
                                >
                                    Edit Information
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    size="lg"
                                    disabled={isSubmitting}
                                    className={`flex-[2] ${type === "luxury" ? "bg-accent hover:bg-accent/90" : ""}`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        'Send Application'
                                    )}
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default RegisterDriver;
