import {
  Bell,
  CreditCard,
  Home,
  MessageSquare,
  UserCheck,
  Users,
} from "lucide-react";

export type AppFrame = {
  id: string;
  title: string;
  subtitle: string;
  accent: string;
};

export const APP_FRAMES: AppFrame[] = [
  {
    id: "dashboard",
    title: "Society dashboard",
    subtitle: "All modules at a glance — maintenance, visitors, complaints, and more.",
    accent: "from-primary/20 to-primary/5",
  },
  {
    id: "visitors",
    title: "Visitor approvals",
    subtitle: "Pre-approve guests and guards get instant alerts at the gate.",
    accent: "from-accent/20 to-accent/5",
  },
  {
    id: "maintenance",
    title: "Maintenance billing",
    subtitle: "Track dues, send reminders, and collect payments on time.",
    accent: "from-amber-500/20 to-amber-500/5",
  },
  {
    id: "complaints",
    title: "Complaint tracker",
    subtitle: "Raise, assign, and resolve issues with full transparency.",
    accent: "from-rose-500/20 to-rose-500/5",
  },
  {
    id: "announcements",
    title: "Announcements",
    subtitle: "Broadcast notices to every resident in one tap.",
    accent: "from-violet-500/20 to-violet-500/5",
  },
];

type ScreenProps = { className?: string };

function StatusBar() {
  return (
    <div className="flex items-center justify-between px-4 pt-3 pb-1 text-[9px] font-medium text-foreground/70">
      <span>9:41</span>
      <div className="flex gap-1 items-center">
        <span className="w-3 h-1.5 rounded-sm bg-foreground/30" />
        <span className="w-2.5 h-2.5 rounded-full border border-foreground/30" />
      </div>
    </div>
  );
}

function AppHeader({ title }: { title: string }) {
  return (
    <div className="px-4 py-2 border-b border-border/60 bg-card/80">
      <p className="text-[11px] font-bold text-foreground">{title}</p>
      <p className="text-[8px] text-muted-foreground">Green Valley Apartments</p>
    </div>
  );
}

export function DashboardScreen({ className }: ScreenProps) {
  const tiles = [
    { icon: Users, label: "Visitors", color: "bg-accent/15 text-accent" },
    { icon: CreditCard, label: "Pay", color: "bg-primary/15 text-primary" },
    { icon: MessageSquare, label: "Issues", color: "bg-rose-500/15 text-rose-600" },
    { icon: Bell, label: "Notices", color: "bg-violet-500/15 text-violet-600" },
  ];

  return (
    <div className={className}>
      <StatusBar />
      <AppHeader title="My Building" />
      <div className="p-3 space-y-3">
        <div className="rounded-xl bg-primary/10 p-3">
          <p className="text-[8px] text-muted-foreground">Welcome back</p>
          <p className="text-sm font-bold">A-402, Block B</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {tiles.map((t) => (
            <div key={t.label} className={`rounded-lg p-2.5 ${t.color}`}>
              <t.icon className="w-3.5 h-3.5 mb-1" />
              <p className="text-[9px] font-semibold">{t.label}</p>
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-border p-2 flex items-center gap-2">
          <Home className="w-3.5 h-3.5 text-primary" />
          <div>
            <p className="text-[9px] font-medium">Maintenance due</p>
            <p className="text-[10px] font-bold text-destructive">₹2,450</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function VisitorsScreen({ className }: ScreenProps) {
  const visitors = [
    { name: "Rahul Mehta", time: "2:30 PM", status: "Pending" },
    { name: "Delivery - Amazon", time: "3:15 PM", status: "Approved" },
    { name: "Priya Shah", time: "5:00 PM", status: "Pending" },
  ];

  return (
    <div className={className}>
      <StatusBar />
      <AppHeader title="Visitors" />
      <div className="p-3 space-y-2">
        {visitors.map((v) => (
          <div key={v.name} className="rounded-lg border border-border p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-accent/15 flex items-center justify-center">
                <UserCheck className="w-3.5 h-3.5 text-accent" />
              </div>
              <div>
                <p className="text-[9px] font-semibold">{v.name}</p>
                <p className="text-[8px] text-muted-foreground">{v.time}</p>
              </div>
            </div>
            <span
              className={`text-[7px] font-bold px-1.5 py-0.5 rounded-full ${
                v.status === "Approved"
                  ? "bg-accent/15 text-accent"
                  : "bg-amber-500/15 text-amber-600"
              }`}
            >
              {v.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MaintenanceScreen({ className }: ScreenProps) {
  return (
    <div className={className}>
      <StatusBar />
      <AppHeader title="Maintenance" />
      <div className="p-3 space-y-3">
        <div className="rounded-xl bg-gradient-to-br from-primary to-primary/80 p-3 text-primary-foreground">
          <p className="text-[8px] opacity-80">March 2026</p>
          <p className="text-lg font-extrabold">₹2,450</p>
          <p className="text-[8px] opacity-90">Due by 10 Mar</p>
        </div>
        <div className="space-y-2">
          {["Common area", "Water charges", "Sinking fund"].map((item, i) => (
            <div key={item} className="flex justify-between text-[9px] border-b border-border/60 pb-1.5">
              <span className="text-muted-foreground">{item}</span>
              <span className="font-semibold">₹{[1200, 650, 600][i]}</span>
            </div>
          ))}
        </div>
        <div className="rounded-lg bg-accent text-accent-foreground text-center py-2 text-[10px] font-bold">
          Pay now
        </div>
      </div>
    </div>
  );
}

export function ComplaintsScreen({ className }: ScreenProps) {
  const items = [
    { title: "Lift not working", status: "In progress", color: "text-amber-600 bg-amber-500/15" },
    { title: "Water leakage B-wing", status: "Open", color: "text-rose-600 bg-rose-500/15" },
    { title: "Parking issue", status: "Resolved", color: "text-accent bg-accent/15" },
  ];

  return (
    <div className={className}>
      <StatusBar />
      <AppHeader title="Complaints" />
      <div className="p-3 space-y-2">
        {items.map((c) => (
          <div key={c.title} className="rounded-lg border border-border p-2.5">
            <div className="flex justify-between items-start gap-2">
              <p className="text-[9px] font-semibold leading-tight">{c.title}</p>
              <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${c.color}`}>
                {c.status}
              </span>
            </div>
            <p className="text-[8px] text-muted-foreground mt-1">Raised 2 days ago</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AnnouncementsScreen({ className }: ScreenProps) {
  const notices = [
    { title: "AGM on 15 March", tag: "Important" },
    { title: "Water supply maintenance", tag: "Notice" },
    { title: "Holi celebration in clubhouse", tag: "Event" },
  ];

  return (
    <div className={className}>
      <StatusBar />
      <AppHeader title="Announcements" />
      <div className="p-3 space-y-2">
        {notices.map((n) => (
          <div key={n.title} className="rounded-lg bg-muted/50 border border-border/60 p-2.5">
            <span className="text-[7px] font-bold uppercase tracking-wide text-primary">{n.tag}</span>
            <p className="text-[9px] font-semibold mt-0.5">{n.title}</p>
            <p className="text-[8px] text-muted-foreground mt-1">Posted by Secretary</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const SCREEN_COMPONENTS = [
  DashboardScreen,
  VisitorsScreen,
  MaintenanceScreen,
  ComplaintsScreen,
  AnnouncementsScreen,
];

export function AppScreenByIndex({ index }: { index: number }) {
  const Screen = SCREEN_COMPONENTS[Math.min(index, SCREEN_COMPONENTS.length - 1)];
  return <Screen className="h-full w-full bg-background" />;
}
