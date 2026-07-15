import { useState, useRef, useEffect, useCallback } from "react";
import { Camera, Upload, CheckCircle, XCircle, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { visionService } from "@/services/vision.service";

const DOC_QUESTIONS = [
  'driverLicense', 'tlcLicense', 'carRegistration',
  'vehicleInspection', 'tlcDiamond', 'insuranceFiles',
] as const;
export type DocQuestionId = typeof DOC_QUESTIONS[number];

export interface DocumentUploadFieldProps {
  questionId: DocQuestionId;
  accept: string;
  multiple?: boolean;
  driverType: "regular" | "luxury";
  fullName: string;
  expectedPlate: string;
  onFilesChange: (questionId: DocQuestionId, files: File[]) => void;
  onClear: (questionId: DocQuestionId) => void;
  onPlateExtracted: (plate: string) => void;
}

type ValidationState = 'idle' | 'validating' | 'valid' | 'invalid';

// Single source of truth per uploaded file. Replaces the 4 parallel arrays
// (files / previewUrls / validations / validationErrors) that had to be kept
// in sync by hand — a stable `id` also makes async validation resilient to the
// file being removed mid-flight.
interface FileEntry {
  id: string;
  file: File;
  previewUrl: string;
  validation: ValidationState;
  error: string;
}

const makeId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const dataURLtoFile = (dataurl: string, filename: string): File => {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] ?? 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new File([u8arr], filename, { type: mime });
};

export function DocumentUploadField({
  questionId,
  accept,
  multiple = false,
  driverType,
  fullName,
  expectedPlate,
  onFilesChange,
  onClear,
  onPlateExtracted,
}: DocumentUploadFieldProps) {
  const [entries, setEntries] = useState<FileEntry[]>([]);

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stop stream tracks on unmount
  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [stream]);

  // Attach stream to video element via callback ref (avoids timing issues)
  const setVideoRef = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
    if (node && stream) {
      node.srcObject = stream;
      node.play().catch(() => {});
    }
  }, [stream]);

  const isLuxury = driverType === 'luxury';
  const accentBorder = isLuxury ? 'border-accent/30' : 'border-blue-500/30';
  const accentBg = isLuxury
    ? 'bg-accent hover:bg-accent/90 text-black'
    : 'bg-blue-600 hover:bg-blue-500 text-white';
  const outlineBtn = isLuxury
    ? 'bg-transparent border-accent text-accent hover:bg-accent/10'
    : 'bg-transparent border-blue-500/35 text-blue-400 hover:bg-blue-500/10';
  const addMoreBtn = isLuxury
    ? 'border-accent/30 text-accent hover:bg-accent/5'
    : 'border-blue-500/30 text-blue-400 hover:bg-blue-500/5';

  // Updates a single entry by id — safe even if the entry was removed while its
  // validation request was in flight (the map simply matches nothing).
  const patchEntry = (id: string, patch: Partial<FileEntry>) =>
    setEntries(prev => prev.map(e => (e.id === id ? { ...e, ...patch } : e)));

  const validateFile = async (id: string, file: File) => {
    patchEntry(id, { validation: 'validating', error: '' });
    try {
      const base64 = await fileToBase64(file);
      const result = await visionService.validateDocument({
        docType: questionId,
        file: base64,
        mimeType: file.type || 'image/jpeg',
        expectedName: fullName,
        expectedPlate,
      });
      if (result.valid) {
        patchEntry(id, { validation: 'valid' });
        if (result.extractedPlate) onPlateExtracted(result.extractedPlate);
      } else {
        patchEntry(id, { validation: 'invalid', error: result.errorMessage });
      }
    } catch (err: unknown) {
      const msg = (err instanceof Error && err.message === 'RATE_LIMIT_EXCEEDED')
        ? 'Too many attempts. Please wait before retrying.'
        : 'Could not verify document. Please try again.';
      patchEntry(id, { validation: 'invalid', error: msg });
    }
  };

  const makeEntry = (file: File): FileEntry => ({
    id: makeId(),
    file,
    previewUrl: URL.createObjectURL(file),
    validation: 'idle',
    error: '',
  });

  // Adds a batch in a single state update (called once per user action) so the
  // 4-file cap and parent sync stay consistent even when several files arrive
  // at once from the file picker.
  const addFiles = (incoming: File[]) => {
    if (!multiple) {
      const file = incoming[0];
      if (!file) return;
      entries.forEach(e => URL.revokeObjectURL(e.previewUrl));
      const entry = makeEntry(file);
      setEntries([entry]);
      onFilesChange(questionId, [file]);
      validateFile(entry.id, file);
      return;
    }

    const room = 4 - entries.length;
    if (room <= 0) {
      toast.error('Maximum 4 files allowed per field');
      return;
    }
    if (incoming.length > room) {
      toast.error('Maximum 4 files allowed per field');
    }
    const added = incoming.slice(0, room).map(makeEntry);
    if (added.length === 0) return;
    const next = [...entries, ...added];
    setEntries(next);
    onFilesChange(questionId, next.map(e => e.file));
    added.forEach(e => validateFile(e.id, e.file));
  };

  const removeFile = (id: string) => {
    const target = entries.find(e => e.id === id);
    if (target) URL.revokeObjectURL(target.previewUrl);
    const next = entries.filter(e => e.id !== id);
    setEntries(next);
    if (next.length === 0) {
      onClear(questionId);
    } else {
      onFilesChange(questionId, next.map(e => e.file));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected || selected.length === 0) return;
    addFiles(Array.from(selected));
    e.target.value = '';
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      setStream(mediaStream);
      setIsCameraOpen(true);
      setCapturedPreview(null);
    } catch {
      toast.error('Could not access camera. Please allow permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach(t => t.stop());
    setStream(null);
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
    setCapturedPreview(canvas.toDataURL('image/jpeg'));
    stopCamera();
  };

  const confirmCapture = () => {
    if (!capturedPreview) return;
    const file = dataURLtoFile(capturedPreview, `${questionId}_${Date.now()}.jpg`);
    setCapturedPreview(null);
    addFiles([file]);
  };

  const canAddMore = multiple && entries.length < 4 && !isCameraOpen && !capturedPreview;
  const isEmpty = entries.length === 0 && !isCameraOpen && !capturedPreview;

  return (
    <div className="space-y-4">
      {/* ── Estado vacío: dos CTAs ── */}
      {isEmpty && (
        <>
          <div className="flex flex-col gap-3">
            <Button type="button" size="lg" className={`w-full ${accentBg}`} onClick={startCamera}>
              <Camera className="mr-2 w-5 h-5" /> Open Camera
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className={`px-2 ${isLuxury ? 'bg-foreground text-muted' : 'bg-[#0a1628] text-slate-500'}`}>
                  Or
                </span>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className={`w-full ${outlineBtn}`}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-2 w-5 h-5" /> Upload File
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            className="hidden"
            onChange={handleFileInput}
          />
          <p className={`text-xs text-center ${isLuxury ? 'text-muted' : 'text-slate-500'}`}>
            {multiple
              ? 'Image or PDF · Max 4 files · 10MB each'
              : 'Image or PDF · Max 10MB'}
          </p>
        </>
      )}

      {/* ── Cámara en vivo ── */}
      {isCameraOpen && (
        <div className="space-y-3">
          <div className={`relative w-full aspect-video bg-black rounded-xl overflow-hidden border-2 ${accentBorder}`}>
            <video ref={setVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />
          </div>
          <div className="flex gap-2">
            <Button onClick={capturePhoto} size="lg" className="flex-1 bg-white text-black hover:bg-gray-200">
              <div className="w-4 h-4 rounded-full bg-red-500 mr-2 animate-pulse" /> Capture
            </Button>
            <Button onClick={stopCamera} size="lg" variant="destructive" className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* ── Preview de captura: confirmar o reintentar ── */}
      {capturedPreview && (
        <div className="space-y-3">
          <div className={`relative w-full aspect-video bg-black rounded-xl overflow-hidden border-2 ${accentBorder}`}>
            <img src={capturedPreview} alt="Captured document" className="w-full h-full object-cover" />
          </div>
          <div className="flex gap-2">
            <Button onClick={confirmCapture} size="lg" className={`flex-1 ${accentBg}`}>
              <CheckCircle className="mr-2 w-4 h-4" /> Confirm
            </Button>
            <Button
              onClick={() => { setCapturedPreview(null); startCamera(); }}
              size="lg"
              variant="outline"
              className={`flex-1 ${outlineBtn}`}
            >
              <RefreshCw className="mr-2 w-4 h-4" /> Retake
            </Button>
          </div>
        </div>
      )}

      {/* ── Thumbnails de archivos subidos ── */}
      {entries.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-3 items-start">
            {entries.map((entry) => (
              <div key={entry.id} className="relative">
                <div className={`w-24 h-24 rounded-lg overflow-hidden border-2 ${
                  entry.validation === 'valid'
                    ? 'border-emerald-500'
                    : entry.validation === 'invalid'
                      ? 'border-red-500/60'
                      : accentBorder
                }`}>
                  {entry.file.type === 'application/pdf' ? (
                    <div className={`flex flex-col items-center justify-center h-full text-xs gap-1 ${
                      isLuxury ? 'bg-card/10 text-muted' : 'bg-blue-500/10 text-blue-400'
                    }`}>
                      <span className="text-2xl">📄</span>
                      <span>PDF</span>
                    </div>
                  ) : (
                    <img src={entry.previewUrl} alt="Document preview" className="w-full h-full object-cover" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(entry.id)}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center hover:bg-red-500/40 transition-colors"
                  aria-label="Remove file"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {/* Botones para añadir más (solo múltiple con slots disponibles) */}
            {canAddMore && (
              <div className="flex flex-col gap-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={accept}
                  multiple
                  className="hidden"
                  onChange={handleFileInput}
                />
                <button
                  type="button"
                  onClick={startCamera}
                  className={`w-24 h-[46px] rounded-lg border-2 border-dashed flex items-center justify-center ${addMoreBtn} transition-colors`}
                  title="Take photo"
                >
                  <Camera className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-24 h-[46px] rounded-lg border-2 border-dashed flex items-center justify-center ${addMoreBtn} transition-colors`}
                  title="Upload file"
                >
                  <Upload className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Badges de validación */}
          {entries.map((entry) =>
            entry.validation !== 'idle' ? (
              <div
                key={entry.id}
                className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                  entry.validation === 'validating'
                    ? 'bg-blue-500/10 border border-blue-500/30 text-blue-400'
                    : entry.validation === 'valid'
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                      : 'bg-red-500/10 border border-red-500/30 text-red-400'
                }`}
              >
                {entry.validation === 'validating' && (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin flex-shrink-0" />
                    <span>Verifying document with AI...</span>
                  </>
                )}
                {entry.validation === 'valid' && (
                  <>
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    <span>Document verified</span>
                  </>
                )}
                {entry.validation === 'invalid' && (
                  <>
                    <XCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{entry.error}</span>
                  </>
                )}
              </div>
            ) : null
          )}
        </div>
      )}
    </div>
  );
}
