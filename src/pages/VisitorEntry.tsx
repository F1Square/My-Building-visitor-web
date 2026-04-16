import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Building2, Camera, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const API_BASE = import.meta.env.VITE_API_BASE as string;
// Entry routes are mounted at /entry (not under /api)
const BACKEND_BASE = API_BASE.replace(/\/api$/, "");

interface BuildingInfo {
  id: string;
  name: string;
  address?: string;
}

const PHONE_RE = /^[6-9]\d{9}$/;

const VisitorEntry = () => {
  const { building_id } = useParams<{ building_id: string }>();
  const { toast } = useToast();

  const [building, setBuilding] = useState<BuildingInfo | null>(null);
  const [loadingBuilding, setLoadingBuilding] = useState(true);
  const [buildingError, setBuildingError] = useState("");

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [flatNo, setFlatNo] = useState("");
  const [purpose, setPurpose] = useState("");
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  // Fetch building info on mount
  useEffect(() => {
    if (!building_id) return;
    fetch(`${BACKEND_BASE}/entry/building/${building_id}/info`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setBuildingError(data.error);
        else setBuilding(data);
      })
      .catch(() => setBuildingError("Could not reach server. Check your connection."))
      .finally(() => setLoadingBuilding(false));
  }, [building_id]);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setPhotoBase64(result);
      setPhotoPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!PHONE_RE.test(mobile.trim())) {
      toast({ title: "Invalid mobile", description: "Enter a valid 10-digit Indian mobile number.", variant: "destructive" });
      return;
    }
    if (!photoBase64) {
      toast({ title: "Photo required", description: "Please take or upload a photo.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${BACKEND_BASE}/entry/building/${building_id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          mobile: mobile.trim(),
          flat_no: flatNo.trim(),
          purpose: purpose.trim(),
          photo_url: photoBase64,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        toast({ title: "Submission failed", description: data.error || "Something went wrong.", variant: "destructive" });
      } else {
        setSuccess(true);
      }
    } catch {
      toast({ title: "Network error", description: "Check your connection and try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingBuilding) {
    return (
      <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1E3A8A]" />
      </div>
    );
  }

  if (buildingError || !building) {
    return (
      <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center p-6">
        <div className="text-center">
          <Building2 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-bold text-gray-700">Building Not Found</h2>
          <p className="text-gray-500 mt-2">{buildingError || "Invalid QR code."}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center p-6">
        <div className="text-center">
          <CheckCircle2 className="w-20 h-20 mx-auto text-green-500 mb-4" />
          <h2 className="text-2xl font-extrabold text-green-600">Entry Registered!</h2>
          <p className="text-gray-500 mt-3 leading-relaxed">
            Your visit to <strong>{building.name}</strong> has been recorded.<br />
            The residents have been notified.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8] py-8 px-4">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-[#1E3A8A] flex items-center justify-center mx-auto mb-3">
          <Building2 className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#1E3A8A]">{building.name}</h1>
        <p className="text-sm text-gray-500 mt-1">{building.address || "Visitor Entry Form"}</p>
      </div>

      {/* Form card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-6 max-w-md mx-auto space-y-4">
        <div className="space-y-1">
          <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
          <Input id="name" placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
        </div>

        <div className="space-y-1">
          <Label htmlFor="mobile">Mobile Number <span className="text-red-500">*</span></Label>
          <Input
            id="mobile"
            type="tel"
            inputMode="numeric"
            placeholder="10-digit mobile number"
            maxLength={10}
            value={mobile}
            onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
            required
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="flat_no">Visiting Flat No <span className="text-red-500">*</span></Label>
          <Input id="flat_no" placeholder="e.g. A-101" value={flatNo} onChange={(e) => setFlatNo(e.target.value)} required autoComplete="off" />
        </div>

        <div className="space-y-1">
          <Label htmlFor="purpose">Purpose of Visit</Label>
          <Textarea id="purpose" placeholder="e.g. Delivery, Meeting, Repair work..." value={purpose} onChange={(e) => setPurpose(e.target.value)} className="resize-none h-20" />
        </div>

        {/* Photo upload */}
        <div className="space-y-2">
          <Label>Live Photo <span className="text-red-500">*</span></Label>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-[#1E3A8A] rounded-xl py-3 px-4 bg-blue-50 text-[#1E3A8A] font-semibold text-sm hover:bg-blue-100 transition-colors"
          >
            <Camera className="w-5 h-5" />
            {photoBase64 ? "Photo selected ✓" : "Take / Upload Photo"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handlePhoto}
          />
          {photoPreview && (
            <img src={photoPreview} alt="Preview" className="w-full max-h-52 object-cover rounded-xl mt-2" />
          )}
        </div>

        <Button type="submit" className="w-full bg-[#1E3A8A] hover:bg-[#1e3a8a]/90 text-white font-bold py-3 text-base" disabled={submitting}>
          {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</> : "Register Entry"}
        </Button>
      </form>
    </div>
  );
};

export default VisitorEntry;
