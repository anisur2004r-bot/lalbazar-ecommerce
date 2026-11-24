"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mail, Lock, Eye, EyeOff, LogIn, Shield, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export function LoginView() {
  const navigate = useStore((s) => s.navigate);
  const setUser = useStore((s) => s.setUser);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Please enter email and password"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (!res.ok || data.error) { toast.error(data.error || "Login failed"); return; }
      setUser(data.user);
      toast.success(`Welcome back, ${data.user.name.split(" ")[0]}`);
      navigate(data.user.role === "ADMIN" ? "admin" : "home");
    } catch { toast.error("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  };

  const fillAdmin = () => { setEmail("admin@lalbazar.com"); setPassword("admin123"); toast.info("Admin credentials filled"); };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gradient-to-br from-zinc-50 to-primary/5 px-4 py-10">
      <Card className="w-full max-w-md shadow-lg border-zinc-200">
        <CardHeader className="space-y-3 items-center text-center">
          <Logo size="lg" />
          <div className="pt-2">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription className="text-sm mt-1">লগইন করুন — Sign in to your LalBazar account</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" autoComplete="email" required />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button type="button" onClick={() => navigate("forgot-password")} className="text-xs text-primary hover:underline font-medium">Forgot password?</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input id="password" type={showPw ? "text" : "password"} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9 pr-10" autoComplete="current-password" required />
                <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600" aria-label={showPw ? "Hide password" : "Show password"}>{showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
            </div>
            <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={loading}>
              {loading ? (<><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Signing in…</>) : (<><LogIn className="w-4 h-4" /> Sign In</>)}
            </Button>
          </form>
          <div className="mt-4 flex flex-col gap-2">
            <Button type="button" variant="outline" className="w-full h-10 border-zinc-300" onClick={fillAdmin}><Shield className="w-4 h-4 text-primary" /> Login as Admin</Button>
          </div>
          <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
            <div className="font-semibold mb-1">Demo Credentials</div>
            <div className="space-y-0.5">
              <div><span className="font-medium">Admin:</span> admin@lalbazar.com / admin123</div>
              <div><span className="font-medium">Customer:</span> demo@lalbazar.com / demo123</div>
            </div>
          </div>
        </CardContent>
        <Separator />
        <CardFooter className="justify-center py-4">
          <div className="text-sm text-zinc-600 text-center">Don&apos;t have an account?{" "}<button onClick={() => navigate("register")} className="text-primary font-semibold hover:underline inline-flex items-center gap-1">Register <ArrowRight className="w-3 h-3" /></button></div>
        </CardFooter>
      </Card>
    </div>
  );
}
