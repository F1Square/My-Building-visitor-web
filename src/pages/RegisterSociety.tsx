import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Building2, CheckCircle2, ExternalLink, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const API_BASE = import.meta.env.VITE_API_BASE as string;

const SOCIETY_TYPES = [
  "Apartment Complex",
  "Gated Community",
  "Township",
  "Co-operative Housing",
  "Villa Society",
  "Other",
];

const PAYMENT_METHODS = [
  { key: "Cash", icon: "💵", desc: "Residents pay maintenance in cash" },
  { key: "Cheque", icon: "📝", desc: "Residents pay via cheque" },
  { key: "Transaction Receipt", icon: "🧾", desc: "Bank transfer with receipt upload" },
  { key: "Payment Gateway", icon: "💳", desc: "Online payment via payment gateway" },
];

const STEPS = ["Your Details", "Society Info", "Payment Setup"];

export default function RegisterSociety() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const logoRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  // Step 1 — personal details
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
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

  // Step 3 — payment
  const [paymentMethod, setPaymentMethod] = useState("");
  const [gatewayLink, setGatewayLink] = useState("");
  const [maintenanceFixed, setMaintenanceFixed] = useState(false);
  const [waterBillSeparate, setWaterBillSeparate] = useState(false);
  const [lateFee, setLateFee] = useState("");

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) setReferralCode(ref.toUpperCase().replace(/\s/g, ""));
  }, [searchParams]);

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setLogoBase64(result);
      setLogoPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const validateStep = () => {
    if (step === 0) {
      if (!name.trim()) { toast({ title: "Name required", variant: "destructive" }); return false; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { toast({ title: "Valid email required", variant: "destructive" }); return false; }
      const ref = referralCode.trim().toUpperCase().replace(/\s/g, "");
      if (ref && !/^[A-Z0-9]{4,12}$/.test(ref)) {
        toast({ title: "Invalid referral code", description: "Use 4–12 letters or digits.", variant: "destructive" });
        return false;
      }
    }
    if (step === 1) {
      if (!societyName.trim()) { toast({ title: "Society name required", variant: "destructive" }); return false; }
      if (!state.trim() || !city.trim()) { toast({ title: "State and city required", variant: "destructive" }); return false; }
      if (pincode && !/^\d{6}$/.test(pincode)) { toast({ title: "Pincode must be 6 digits", variant: "destructive" }); return false; }
    }
    if (step === 2) {
      if (!paymentMethod) { toast({ title: "Select a payment method", variant: "destructive" }); return false; }
      if (paymentMethod === "Payment Gateway" && gatewayLink.trim()) {
        try { new URL(gatewayLink.trim()); } catch { toast({ title: "Enter a valid URL for payment gateway", variant: "destructive" }); return false; }
      }
    }
    return true;
  };

  const next = () => { if (validateStep()) setStep(s => s + 1); };
  const back = () => setStep(s => s - 1);

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
          society_name: societyName.trim(),
          society_type: societyType || null,
          total_wings: totalWings || null,
          state: state.trim(),
          city: city.trim(),
          pincode: pincode.trim() || null,
          address: address.trim() || null,
          payment_method: paymentMethod,
          payment_gateway_link: paymentMethod === "Payment Gateway" ? gatewayLink.trim() || null : null,
          maintenance_fixed: maintenanceFixed,
          water_bill_separate: waterBillSeparate,
          late_fee: lateFee || null,
          society_logo: logoBase64 || null,
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
            Thank you, <strong>{name}</strong>! We've received your society registration for <strong>{societyName}</strong>.
            Our team will review and contact you at <strong>{email}</strong> within 24 hours.
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
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#3B5FC0] flex items-center justify-center">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-800">MyBuilding</span>
        </Link>
        <span className="text-gray-300">|</span>
        <span className="text-sm text-gray-500">Register Your Society</span>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${
                i < step ? "bg-green-500 text-white" : i === step ? "bg-[#3B5FC0] text-white" : "bg-gray-200 text-gray-400"
              }`}>
                {i < step ? "✓" : i + 1}
              </div>
              <span className={`text-sm font-semibold hidden sm:block ${i === step ? "text-[#3B5FC0]" : "text-gray-400"}`}>{label}</span>
              {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 ${i < step ? "bg-green-500" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8">

          {/* ── STEP 0: Your Details ── */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-extrabold text-gray-800">Your Details</h2>
                <p className="text-sm text-gray-500 mt-1">Tell us who you are — we'll use this to contact you.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
                <Input id="name" placeholder="e.g. Rajesh Patel" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
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
                  onChange={e => setReferralCode(e.target.value.toUpperCase().replace(/\s/g, ""))}
                  maxLength={12}
                  autoCapitalize="characters"
                />
                <p className="text-xs text-gray-500">
                  Enter a referral code when registering your society so your friend can earn rewards.
                </p>
              </div>
            </div>
          )}

          {/* ── STEP 1: Society Info ── */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-extrabold text-gray-800">Society Information</h2>
                <p className="text-sm text-gray-500 mt-1">Tell us about your residential society.</p>
              </div>

              {/* Society Logo */}
              <div className="space-y-2">
                <Label>Society Logo</Label>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center gap-3 cursor-pointer hover:border-[#3B5FC0] hover:bg-blue-50 transition-colors"
                  onClick={() => logoRef.current?.click()}
                >
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="w-20 h-20 object-contain rounded-xl" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400" />
                      <p className="text-sm text-gray-500">Click to upload society logo</p>
                      <p className="text-xs text-gray-400">PNG, JPG up to 2MB</p>
                    </>
                  )}
                  {logoPreview && <p className="text-xs text-green-600 font-semibold">Logo uploaded ✓ — click to change</p>}
                </div>
                <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogo} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sname">Society Name <span className="text-red-500">*</span></Label>
                <Input id="sname" placeholder="e.g. Shree Residency" value={societyName} onChange={e => setSocietyName(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label>Society Type</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SOCIETY_TYPES.map(t => (
                    <button
                      key={t} type="button"
                      onClick={() => setSocietyType(t)}
                      className={`text-sm px-3 py-2 rounded-xl border-2 font-semibold transition-colors ${
                        societyType === t ? "border-[#3B5FC0] bg-[#3B5FC0] text-white" : "border-gray-200 text-gray-600 hover:border-[#3B5FC0]"
                      }`}
                    >{t}</button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="wings">Total Wings</Label>
                  <Input id="wings" type="number" min="1" max="100" placeholder="e.g. 4" value={totalWings} onChange={e => setTotalWings(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input id="pincode" inputMode="numeric" maxLength={6} placeholder="6-digit pincode" value={pincode} onChange={e => setPincode(e.target.value.replace(/\D/g, ""))} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City <span className="text-red-500">*</span></Label>
                  <Input id="city" placeholder="e.g. Surat" value={city} onChange={e => setCity(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State <span className="text-red-500">*</span></Label>
                  <Input id="state" placeholder="e.g. Gujarat" value={state} onChange={e => setState(e.target.value)} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Full Address</Label>
                <Input id="address" placeholder="Street, area, landmark..." value={address} onChange={e => setAddress(e.target.value)} />
              </div>
            </div>
          )}

          {/* ── STEP 2: Payment Setup ── */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-extrabold text-gray-800">Payment Setup</h2>
                <p className="text-sm text-gray-500 mt-1">How will residents pay their maintenance?</p>
              </div>

              <div className="space-y-2">
                <Label>Payment Method <span className="text-red-500">*</span></Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PAYMENT_METHODS.map(pm => (
                    <button
                      key={pm.key} type="button"
                      onClick={() => setPaymentMethod(pm.key)}
                      className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-colors ${
                        paymentMethod === pm.key
                          ? "border-[#3B5FC0] bg-blue-50"
                          : "border-gray-200 hover:border-[#3B5FC0]"
                      }`}
                    >
                      <span className="text-2xl">{pm.icon}</span>
                      <div>
                        <p className={`font-bold text-sm ${paymentMethod === pm.key ? "text-[#3B5FC0]" : "text-gray-700"}`}>{pm.key}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{pm.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Gateway link — shown only when Payment Gateway is selected */}
              {paymentMethod === "Payment Gateway" && (
                <div className="space-y-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="space-y-2">
                    <Label htmlFor="gwlink">Payment Gateway Link</Label>
                    <Input
                      id="gwlink"
                      type="url"
                      placeholder="https://rzp.io/l/your-link"
                      value={gatewayLink}
                      onChange={e => setGatewayLink(e.target.value)}
                    />
                    <p className="text-xs text-gray-500">Residents will be redirected to this link to pay online.</p>
                  </div>
                  {gatewayLink.trim() && (() => { try { new URL(gatewayLink.trim()); return (
                    <a
                      href={gatewayLink.trim()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-[#3B5FC0] font-semibold hover:underline"
                    >
                      <ExternalLink className="w-4 h-4" /> Preview payment link
                    </a>
                  ); } catch { return null; } })()}

                  {/* Razorpay charges info */}
                  <div className="mt-2 border border-blue-200 rounded-xl overflow-hidden">
                    <div className="bg-blue-100 px-4 py-2 flex items-center gap-2">
                      <span className="text-blue-700 text-sm font-bold">ℹ️ Platform charges (excl. GST)</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left px-3 py-2 text-gray-600 font-semibold">Payment Mode</th>
                            <th className="text-right px-3 py-2 text-gray-600 font-semibold">Charges</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {[
                            ["Debit Card (below ₹2000)", "0.45%"],
                            ["Debit Card (above ₹2000)", "0.95%"],
                            ["Credit Card", "1.95%"],
                            ["Amex / Corporate Credit Card", "2.75%"],
                            ["Net Banking", "1.80%"],
                            ["UPI (GPay, PhonePe, etc.)", "0.20%"],
                            ["Credit Card on UPI", "1.95%"],
                            ["Wallets (Paytm, Mobikwik, etc.)", "1.90%"],
                          ].map(([mode, charge]) => (
                            <tr key={mode} className="hover:bg-gray-50">
                              <td className="px-3 py-2 text-gray-700">{mode}</td>
                              <td className="px-3 py-2 text-right font-semibold text-gray-800">{charge}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500">
                      * Platform charges + GST applicable. Settlements within T+1 working day (max T+2).
                    </div>
                    <div className="px-4 py-2 border-t border-blue-100 text-xs text-blue-600">
                      ℹ️ By using third party payment gateway, you agree to abide by{" "}
                      <a
                        href="https://razorpay.com/terms/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline font-semibold"
                      >
                        terms &amp; conditions
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Additional options */}
              <div className="space-y-3">
                <Label>Additional Options</Label>
                {[
                  { key: "maintenanceFixed", label: "Fixed maintenance amount for all flats", value: maintenanceFixed, set: setMaintenanceFixed },
                  { key: "waterBill", label: "Water bill charged separately", value: waterBillSeparate, set: setWaterBillSeparate },
                ].map(opt => (
                  <label key={opt.key} className="flex items-center gap-3 cursor-pointer">
                    <div
                      onClick={() => opt.set(!opt.value)}
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
                  min="0"
                  placeholder="e.g. 50 (leave blank if none)"
                  value={lateFee}
                  onChange={e => setLateFee(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <Button type="button" variant="outline" onClick={back} className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            )}
            {step < STEPS.length - 1 ? (
              <Button type="button" onClick={next} className="flex-1">
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button type="button" onClick={submit} disabled={submitting} className="flex-1 bg-green-600 hover:bg-green-700">
                {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</> : "Submit Registration"}
              </Button>
            )}
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-[#3B5FC0] font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
