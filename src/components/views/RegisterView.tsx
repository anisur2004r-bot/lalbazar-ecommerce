"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Phone, Lock, Eye, EyeOff, UserPlus, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export function RegisterView() {
  const navigate = useStore((s) => s.navigate);
  const setUser = useStore((s) => s.setUser);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const validatePhone = (p: string) => /^01\d{9}$/.test(p);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !password) { toast.error("Please fill in all fields"); return; }
    if (!validatePhone(phone)) { toast.error("Phone must be 11 digits starting with 01"); return; }
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (password !== confirm) { toast.error("Passwords do not match"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, phone, password }) });
      const data = await res.json();
      if (!res.ok || data.error) { toast.error(data.error || "Registration failed"); return; }
      setUser(data.user);
      toast.success(`Welcome to LalBazar, ${data.user.name.split(" ")[0]}!`);
      navigate("home");
    } catch { toast.error("Something went wrong."); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gradient-to-br from-zinc-50 to-primary/5 px-4 py-10">
      <Card className="w-full max-w-md shadow-lg border-zinc-200">
        <CardHeader className="space-y-3 items-center text-center">
          <Logo size="lg" />
          <div className="pt-2">
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <CardDescription className="text-sm mt-1">রেজিস্টার করুন — Join LalBazar today</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" /><Input id="name" placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} className="pl-9" autoComplete="name" required /></div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" /><Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" autoComplete="email" required /></div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" /><Input id="phone" type="tel" placeholder="01XXXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-9" maxLength={11} autoComplete="tel" required /></div>
              <p className="text-[11px] text-zinc-500">Must be 11 digits starting with 01</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" /><Input id="password" type={showPw ? "text" : "password"} placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9 pr-10" autoComplete="new-password" required /><button type="button" onClick={() => setShowPw((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600" aria-label={showPw ? "Hide password" : "Show password"}>{showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm">Confirm Password</Label>
              <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" /><Input id="confirm" type={showPw ? "text" : "password"} placeholder="Re-enter password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="pl-9" autoComplete="new-password" required />{confirm && confirm === password && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />}</div>
            </div>
            <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={loading}>{loading ? (<><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating account…</>) : (<><UserPlus className="w-4 h-4" /> Create Account</>)}</Button>
          </form>
          <p className="text-xs text-zinc-500 mt-4 text-center">By signing up you agree to our <button onClick={() => navigate("terms")} className="text-primary hover:underline">Terms</button> and <button onClick={() => navigate("privacy")} className="text-primary hover:underline">Privacy Policy</button>.</p>
        </CardContent>
        <Separator />
        <CardFooter className="justify-center py-4"><div className="text-sm text-zinc-600 text-center">Already have an account? <button onClick={() => navigate("login")} className="text-primary font-semibold hover:underline inline-flex items-center gap-1"><ArrowLeft className="w-3 h-3" /> Sign in</button></div></CardFooter>
      </Card>
    </div>
  );
}
