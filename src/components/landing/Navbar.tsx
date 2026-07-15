import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { BrandLogo } from "@/components/BrandLogo";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  const links = [
    { label: "App Demo", href: "#app-demo" },
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Testimonials", href: "#testimonials" },
    { label: "FAQ", href: "#faq" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-2xl border-b border-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <BrandLogo size="md" />
          </Link>

          <div className="hidden md:flex items-center gap-7">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {l.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="rounded-full">Log in</Button>
            </Link>
            <Link to="/register-society">
              <Button size="sm" className="rounded-full px-5">Get Started</Button>
            </Link>
          </div>

          <button className="md:hidden" onClick={() => setOpen(!open)}>
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-3">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block text-sm font-medium text-muted-foreground hover:text-foreground">
              {l.label}
            </a>
          ))}
          <div className="flex gap-2 pt-2">
            <Link to="/login" className="flex-1"><Button variant="outline" className="w-full" size="sm">Log in</Button></Link>
            <Link to="/register-society" className="flex-1"><Button className="w-full" size="sm">Get Started</Button></Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
