import { Shield, Users, CreditCard, Bell, MessageSquare, CalendarDays, FileText, Lock } from "lucide-react";
import { ScrollReveal, StaggerItem, StaggerReveal } from "@/components/landing/scroll/ScrollReveal";

const features = [
  { icon: CreditCard, title: "Maintenance Billing", desc: "Auto-generate bills, send reminders, and track payments in real-time." },
  { icon: Users, title: "Visitor Management", desc: "Pre-approve guests, get notified on arrival, and maintain a digital logbook." },
  { icon: MessageSquare, title: "Complaint Tracker", desc: "Raise, assign, and resolve complaints with full transparency." },
  { icon: Bell, title: "Announcements", desc: "Broadcast notices to all residents instantly via push & in-app." },
  { icon: CalendarDays, title: "Event Booking", desc: "Book amenities, halls, and common areas with conflict-free scheduling." },
  { icon: FileText, title: "Digital Documents", desc: "Store NOCs, bylaws, and meeting minutes in a secure cloud vault." },
  { icon: Shield, title: "Guard Patrol", desc: "Track security rounds with GPS checkpoints and real-time alerts." },
  { icon: Lock, title: "Gate Access", desc: "Digital gate pass system with QR codes for seamless entry." },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Features</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Everything your society needs
          </h2>
          <p className="text-muted-foreground text-lg">
            A complete toolkit to manage your residential community efficiently.
          </p>
        </ScrollReveal>

        <StaggerReveal className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <StaggerItem key={f.title}>
              <div className="group relative surface-card p-6 transition-shadow duration-300 hover:shadow-md h-full">
                <div className="w-11 h-11 rounded-2xl bg-primary/[0.08] flex items-center justify-center mb-5">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2 tracking-tight">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerReveal>
      </div>
    </section>
  );
};

export default FeaturesSection;
