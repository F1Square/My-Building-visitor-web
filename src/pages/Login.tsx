import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../context/AuthContext";
import api from "../lib/apiClient";
import type { User, Subscription } from "../types";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, isAuthenticated } = useAuth();

  // Already authenticated — redirect via effect, not during render
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.post<{ token: string; user: User; subscription?: Subscription }>("/auth/login/unified", { email, password });
      login(data.token, data.user, data.subscription);
      toast({ title: "Welcome back!", description: `Hello, ${data.user.name}` });
      navigate("/dashboard");
    } catch (e: unknown) {
      toast({ title: "Login failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full border-2 border-primary-foreground" />
          <div className="absolute bottom-32 right-16 w-48 h-48 rounded-full border-2 border-primary-foreground" />
        </div>
        <div className="relative text-primary-foreground text-center">
          <Building2 className="w-16 h-16 mx-auto mb-6" />
          <h2 className="text-3xl font-extrabold font-['Plus_Jakarta_Sans'] mb-4">Welcome to MyBuilding</h2>
          <p className="text-primary-foreground/80 max-w-sm">Manage your society smarter. Bills, visitors, complaints—all in one place.</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8">
              <ArrowLeft className="w-4 h-4" /> Back to home
            </Link>
            <div className="flex items-center gap-2 mb-2 lg:hidden">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold font-['Plus_Jakarta_Sans']">MyBuilding</span>
            </div>
            <h1 className="text-2xl font-extrabold font-['Plus_Jakarta_Sans']">Sign in to your account</h1>
            <p className="text-muted-foreground text-sm mt-1">Enter your credentials to access your dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary font-semibold hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
