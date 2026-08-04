import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { BrandLogo } from "@/components/BrandLogo";
import {
  INDIA_STATES,
  MAX_LOGO_BYTES,
  PAYMENT_METHOD_OPTIONS,
  SOCIETY_TYPES,
  ALLOWED_LOGO_TYPES,
  getCitiesForState,
  isValidStateCity,
  validateImageDataUrl,
  type PaymentMethodKey,
} from "@/data/indiaLocations";

const API_BASE =
  (import.meta.env.VITE_API_BASE && import.meta.env.VITE_API_BASE !== "undefined"
    ? (import.meta.env.VITE_API_BASE as string)
    : "") || "http://localhost:5000/api";

const STEPS = ["Your Details", "Society Info", "Payment Setup"];
const PHONE_RE = /^[6-9]\d{9}$/;
const stripPhone = (v: string) => v.replace(/\D/g, "").slice(0, 10);

export default function RegisterSociety() {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const logoRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [checkingReferral, setCheckingReferral] = useState(false);
  const [done, setDone] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Step 1 — personal details
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [referralCode, setReferralCode] = useState("");

  // Step 2 — society info
  const [societyName, setSocietyName] = useState("");
  const [societyType, setSocietyType] = useState("");
  const [totalWings, setTotalWings] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [address, setAddress] = useState("");
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Step 3 — payment (multi-select)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodKey[]>([]);
  const [maintenanceFixed, setMaintenanceFixed] = useState(false);
  const [waterBillSeparate, setWaterBillSeparate] = useState(false);
  const [lateFee, setLateFee] = useState("");

  const cityOptions = useMemo(() => getCitiesForState(state), [state]);

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) setReferralCode(ref.toUpperCase().replace(/\s/g, ""));
  }, [searchParams]);

  const clearLogo = () => {
    setLogoBase64(null);
    setLogoPreview(null);
    if (logoRef.current) logoRef.current.value = "";
    setFieldErrors((e) => {
      const next = { ...e };
      delete next.logo;
      return next;
    });
  };

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_LOGO_TYPES.includes(file.type as (typeof ALLOWED_LOGO_TYPES)[number])) {
      const message = "Society logo must be a JPG, PNG, WebP, or GIF image";
      toast({ title: "Image required", description: message, variant: "destructive" });
      setFieldErrors((prev) => ({ ...prev, logo: message }));
      e.target.value = "";
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      toast({ title: "File too large", description: "Logo must be 2 MB or smaller.", variant: "destructive" });
      setFieldErrors((prev) => ({ ...prev, logo: "Logo must be 2 MB or smaller" }));
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      const check = validateImageDataUrl(result);
      if (check.ok === false) {
        toast({ title: "Invalid logo", description: check.error, variant: "destructive" });
        setFieldErrors((prev) => ({ ...prev, logo: check.error }));
        if (logoRef.current) logoRef.current.value = "";
        return;
      }
      setLogoBase64(result);
      setLogoPreview(result);
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.logo;
        return next;
      });
    };
    reader.readAsDataURL(file);
  };

  const togglePaymentMethod = (key: PaymentMethodKey) => {
    setPaymentMethods((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next.payment;
      return next;
    });
  };

  const onStateChange = (value: string) => {
    setState(value);
    setCity("");
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next.state;
      delete next.city;
      return next;
    });
  };

  const validateStep = () => {
    const errors: Record<string, string> = {};

    if (step === 0) {
      if (!name.trim()) errors.name = "Name is required";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = "Valid email is required";
      if (!PHONE_RE.test(phone)) errors.phone = "Enter a valid 10-digit Indian mobile number";
      const ref = referralCode.trim().toUpperCase().replace(/\s/g, "");
      if (ref && !/^[A-Z0-9]{4,12}$/.test(ref)) {
        errors.referral = "Use 4–12 letters or digits";
      }
    }

    if (step === 1) {
      if (!logoBase64) {
        errors.logo = "Society logo image is required";
      } else {
        const check = validateImageDataUrl(logoBase64);
        if (check.ok === false) errors.logo = check.error;
      }
      if (!societyName.trim()) errors.societyName = "Society name is required";
      else if (societyName.trim().length > 100) errors.societyName = "Society name must not exceed 100 characters";
      if (!societyType) errors.societyType = "Society type is required";
      if (!totalWings) errors.totalWings = "Total wings is required";
      else {
        const w = Number(totalWings);
        if (isNaN(w) || w < 1 || w > 100) errors.totalWings = "Wings must be between 1 and 100";
      }
      if (!/^\d{6}$/.test(pincode)) errors.pincode = "Pincode must be exactly 6 digits";
      if (!state) errors.state = "State is required";
      if (!city) errors.city = "City is required";
      else if (state && !isValidStateCity(state, city)) errors.city = "Select a city for the chosen state";
      if (!address.trim()) errors.address = "Full address is required";
      else if (!/[A-Za-z]/.test(address.trim())) {
        errors.address = "Full address must include letters and cannot contain only numbers";
      }
    }

    if (step === 2) {
      if (paymentMethods.length === 0) errors.payment = "Select at least one payment method";
      if (lateFee !== "") {
        const f = Number(lateFee);
        if (isNaN(f) || f < 0) errors.lateFee = "Late fee must be a non-negative number";
      }
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      const first = Object.values(errors)[0];
      toast({ title: "Please fix the form", description: first, variant: "destructive" });
      return false;
    }
    return true;
  };

  const next = async () => {
    if (!validateStep()) return;

    const normalizedReferral = referralCode.trim().toUpperCase().replace(/\s/g, "");
    if (step === 0 && normalizedReferral) {
      setCheckingReferral(true);
      try {
        const response = await fetch(`${API_BASE}/inquiries/public/validate-referral`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            referral_code: normalizedReferral,
            user_email: email.trim(),
          }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.valid) {
          const message = data.error || "Invalid referral code";
          setFieldErrors((prev) => ({ ...prev, referral: message }));
          toast({ title: "Referral code not accepted", description: message, variant: "destructive" });
          return;
        }
      } catch {
        const message = "Could not verify the referral code. Please try again.";
        setFieldErrors((prev) => ({ ...prev, referral: message }));
        toast({ title: "Referral verification failed", description: message, variant: "destructive" });
        return;
      } finally {
        setCheckingReferral(false);
      }
    }

    setStep((s) => s + 1);
  };
  const back = () => {
    setFieldErrors({});
    setStep((s) => s - 1);
  };

  const submit = async () => {
    if (!validateStep()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/inquiries/public`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_name: name.trim(),
          user_email: email.trim(),
          user_phone: phone,
          society_name: societyName.trim(),
          society_type: societyType,
          total_wings: Number(totalWings),
          state,
          city,
          pincode: pincode.trim(),
          address: address.trim(),
          payment_methods: paymentMethods,
          maintenance_fixed: maintenanceFixed,
          water_bill_separate: waterBillSeparate,
          late_fee: lateFee || null,
          society_logo: logoBase64,
          referral_code: referralCode.trim().toUpperCase().replace(/\s/g, "") || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Submission failed", description: data.error, variant: "destructive" });
      } else {
        setDone(true);
      }
    } catch {
      toast({ title: "Network error", description: "Could not reach server.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Registration Submitted!</h2>
          <p className="text-gray-500 leading-relaxed mb-6">
            Thank you, <strong>{name}</strong>! We&apos;ve received your society registration for{" "}
            <strong>{societyName}</strong>. Our team will review and contact you at <strong>{email}</strong>{" "}
            within 24 hours.
          </p>
          <Link to="/">
            <Button className="w-full">Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2">
          <BrandLogo size="sm" wordmarkClassName="font-bold text-gray-800" />
        </Link>
        <span className="text-gray-300">|</span>
        <span className="text-sm text-gray-500">Register Your Society</span>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${
                  i < step
                    ? "bg-green-500 text-white"
                    : i === step
                      ? "bg-[#3B5FC0] text-white"
                      : "bg-gray-200 text-gray-400"
                }`}
              >
                {i < step ? "✓" : i + 1}
              </div>
              <span
                className={`text-sm font-semibold hidden sm:block ${
                  i === step ? "text-[#3B5FC0]" : "text-gray-400"
                }`}
              >
                {label}
              </span>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 ${i < step ? "bg-green-500" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8">
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-extrabold text-gray-800">Your Details</h2>
                <p className="text-sm text-gray-500 mt-1">Tell us who you are — we&apos;ll use this to contact you.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. Rajesh Patel"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-invalid={!!fieldErrors.name}
                />
                {fieldErrors.name && <p className="text-xs text-red-500">{fieldErrors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={!!fieldErrors.email}
                />
                {fieldErrors.email && <p className="text-xs text-red-500">{fieldErrors.email}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">
                  Mobile Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  placeholder="10-digit mobile number"
                  value={phone}
                  maxLength={10}
                  onChange={(e) => {
                    setPhone(stripPhone(e.target.value));
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next.phone;
                      return next;
                    });
                  }}
                  aria-invalid={!!fieldErrors.phone}
                />
                {fieldErrors.phone && <p className="text-xs text-red-500">{fieldErrors.phone}</p>}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="referral">Referral Code</Label>
                  <span className="text-xs text-gray-400 font-medium">Optional</span>
                </div>
                <Input
                  id="referral"
                  placeholder="Friend's referral code"
                  value={referralCode}
                  onChange={(e) => {
                    setReferralCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""));
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next.referral;
                      return next;
                    });
                  }}
                  maxLength={12}
                  autoCapitalize="characters"
                />
                {fieldErrors.referral && <p className="text-xs text-red-500">{fieldErrors.referral}</p>}
                <p className="text-xs text-gray-500">
                  Enter a referral code when registering your society so your friend can earn rewards.
                </p>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-extrabold text-gray-800">Society Information</h2>
                <p className="text-sm text-gray-500 mt-1">Tell us about your residential society.</p>
              </div>

              <div className="space-y-2">
                <Label>
                  Society Logo <span className="text-red-500">*</span>
                </Label>
                <div
                  className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center gap-3 cursor-pointer hover:border-[#3B5FC0] hover:bg-blue-50 transition-colors ${
                    fieldErrors.logo ? "border-red-400" : "border-gray-300"
                  }`}
                  onClick={() => logoRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") logoRef.current?.click();
                  }}
                  role="button"
                  tabIndex={0}
                >
                  {logoPreview ? (
                    <div className="relative">
                      <img src={logoPreview} alt="Society logo preview" className="w-20 h-20 object-contain rounded-xl" />
                      <button
                        type="button"
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow"
                        onClick={(ev) => {
                          ev.stopPropagation();
                          clearLogo();
                        }}
                        aria-label="Remove logo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400" />
                      <p className="text-sm text-gray-500">Click to upload society logo</p>
                      <p className="text-xs text-gray-400">JPG, PNG, WebP, or GIF — up to 2 MB</p>
                    </>
                  )}
                  {logoPreview && (
                    <p className="text-xs text-green-600 font-semibold">Logo uploaded — click to change</p>
                  )}
                </div>
                <input
                  ref={logoRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogo}
                  data-testid="logo-input"
                />
                {fieldErrors.logo && <p className="text-xs text-red-500">{fieldErrors.logo}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sname">
                  Society Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="sname"
                  placeholder="e.g. Shree Residency"
                  value={societyName}
                  onChange={(e) => setSocietyName(e.target.value)}
                  maxLength={100}
                />
                {fieldErrors.societyName && <p className="text-xs text-red-500">{fieldErrors.societyName}</p>}
              </div>

              <div className="space-y-2">
                <Label>
                  Society Type <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SOCIETY_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSocietyType(t)}
                      className={`text-sm px-3 py-2 rounded-xl border-2 font-semibold transition-colors ${
                        societyType === t
                          ? "border-[#3B5FC0] bg-[#3B5FC0] text-white"
                          : "border-gray-200 text-gray-600 hover:border-[#3B5FC0]"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                {fieldErrors.societyType && <p className="text-xs text-red-500">{fieldErrors.societyType}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="wings">
                    Total Wings <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="wings"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={3}
                    placeholder="e.g. 4"
                    value={totalWings}
                    onChange={(e) => setTotalWings(e.target.value.replace(/\D/g, "").slice(0, 3))}
                  />
                  {fieldErrors.totalWings && <p className="text-xs text-red-500">{fieldErrors.totalWings}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode">
                    Pincode <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="pincode"
                    inputMode="numeric"
                    maxLength={6}
                    pattern="[0-9]*"
                    placeholder="395004"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  />
                  {fieldErrors.pincode && <p className="text-xs text-red-500">{fieldErrors.pincode}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    State <span className="text-red-500">*</span>
                  </Label>
                  <Select value={state || undefined} onValueChange={onStateChange}>
                    <SelectTrigger data-testid="state-select">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      {INDIA_STATES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldErrors.state && <p className="text-xs text-red-500">{fieldErrors.state}</p>}
                </div>
                <div className="space-y-2">
                  <Label>
                    City <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={city || undefined}
                    onValueChange={(v) => {
                      setCity(v);
                      setFieldErrors((prev) => {
                        const next = { ...prev };
                        delete next.city;
                        return next;
                      });
                    }}
                    disabled={!state}
                  >
                    <SelectTrigger data-testid="city-select">
                      <SelectValue placeholder={state ? "Select city" : "Select state first"} />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      {cityOptions.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldErrors.city && <p className="text-xs text-red-500">{fieldErrors.city}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">
                  Full Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="address"
                  placeholder="Street, area, landmark..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
                {fieldErrors.address && <p className="text-xs text-red-500">{fieldErrors.address}</p>}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-extrabold text-gray-800">Payment Setup</h2>
                <p className="text-sm text-gray-500 mt-1">
                  How will residents pay their maintenance? Select all that apply.
                </p>
              </div>

              <div className="space-y-2">
                <Label>
                  Payment Methods <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" data-testid="payment-methods">
                  {PAYMENT_METHOD_OPTIONS.map((pm) => {
                    const selected = paymentMethods.includes(pm.key);
                    return (
                      <button
                        key={pm.key}
                        type="button"
                        onClick={() => togglePaymentMethod(pm.key)}
                        aria-pressed={selected}
                        className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-colors ${
                          selected ? "border-[#3B5FC0] bg-blue-50" : "border-gray-200 hover:border-[#3B5FC0]"
                        }`}
                      >
                        <span className="text-2xl" aria-hidden>
                          {pm.icon}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className={`font-bold text-sm ${selected ? "text-[#3B5FC0]" : "text-gray-700"}`}>
                              {pm.key}
                            </p>
                            <span
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center text-xs font-bold ${
                                selected ? "bg-[#3B5FC0] border-[#3B5FC0] text-white" : "border-gray-300 text-transparent"
                              }`}
                            >
                              ✓
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">{pm.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {fieldErrors.payment && <p className="text-xs text-red-500">{fieldErrors.payment}</p>}
                <p className="text-xs text-gray-400">You can select more than one payment method.</p>
              </div>

              <div className="space-y-3">
                <Label>Additional Options</Label>
                {[
                  {
                    key: "maintenanceFixed",
                    label: "Fixed maintenance amount for all flats",
                    value: maintenanceFixed,
                    set: setMaintenanceFixed,
                  },
                  {
                    key: "waterBill",
                    label: "Water bill charged separately",
                    value: waterBillSeparate,
                    set: setWaterBillSeparate,
                  },
                ].map((opt) => (
                  <label key={opt.key} className="flex items-center gap-3 cursor-pointer">
                    <div
                      onClick={() => opt.set(!opt.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") opt.set(!opt.value);
                      }}
                      role="checkbox"
                      aria-checked={opt.value}
                      tabIndex={0}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        opt.value ? "bg-[#3B5FC0] border-[#3B5FC0]" : "border-gray-300"
                      }`}
                    >
                      {opt.value && <span className="text-white text-xs font-bold">✓</span>}
                    </div>
                    <span className="text-sm text-gray-700">{opt.label}</span>
                  </label>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="latefee">Late Fee Amount (₹)</Label>
                <Input
                  id="latefee"
                  type="number"
                  min={0}
                  placeholder="e.g. 50 (leave blank if none)"
                  value={lateFee}
                  onChange={(e) => setLateFee(e.target.value)}
                />
                {fieldErrors.lateFee && <p className="text-xs text-red-500">{fieldErrors.lateFee}</p>}
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <Button type="button" variant="outline" onClick={back} className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            )}
            {step < STEPS.length - 1 ? (
              <Button
                type="button"
                onClick={next}
                disabled={checkingReferral}
                className="flex-1"
                data-testid="next-step"
              >
                {checkingReferral ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying referral...
                  </>
                ) : (
                  <>
                    Next <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={submit}
                disabled={submitting}
                className="flex-1 bg-green-600 hover:bg-green-700"
                data-testid="submit-registration"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
                  </>
                ) : (
                  "Submit Registration"
                )}
              </Button>
            )}
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-[#3B5FC0] font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
