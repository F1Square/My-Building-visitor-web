import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const API_BASE = import.meta.env.VITE_API_BASE as string;

const ContactSection = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Failed to send", description: data.error || "Something went wrong.", variant: "destructive" });
      } else {
        toast({ title: "Message sent!", description: "We'll get back to you within 24 hours." });
        setForm({ name: "", email: "", subject: "", message: "" });
      }
    } catch {
      toast({ title: "Network error", description: "Could not reach server. Try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-24 px-4 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Contact</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">Get in touch</h2>
          <p className="text-muted-foreground text-lg">Have questions? We'd love to hear from you.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <div className="space-y-8">
            {[
              { icon: Mail,   label: "Email",  value: "matechnology02@gmail.com" },
              { icon: Phone,  label: "Phone",  value: "+91 88666 43153" },
              { icon: MapPin, label: "Office", value: "Surat, Gujarat, India" },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="Your name" value={form.name} onChange={set("name")} required />
              <Input type="email" placeholder="Email address" value={form.email} onChange={set("email")} required />
            </div>
            <Input placeholder="Subject" value={form.subject} onChange={set("subject")} required />
            <Textarea placeholder="Your message" rows={5} value={form.message} onChange={set("message")} required />
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
