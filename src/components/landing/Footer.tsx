import { Building2 } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-border py-12 px-4">
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Building2 className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold font-['Plus_Jakarta_Sans']">MyBuilding</span>
        </Link>
        <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          <a href="#contact" className="hover:text-foreground transition-colors">Contact</a>
          <Link to="/login" className="hover:text-foreground transition-colors">Login</Link>
        </div>
        <p className="text-xs text-muted-foreground">© 2026 MyBuilding. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
