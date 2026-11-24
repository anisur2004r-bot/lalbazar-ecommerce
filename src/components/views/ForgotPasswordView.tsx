"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mail, ArrowLeft, Send, MailCheck } from "lucide-react";
import { toast } from "sonner";

export function ForgotPasswordView() {
  const navigate = useStore((s) => s.navigate);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { toast.error("Please enter your email address"); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setSent(true);
    toast.success("Password reset link sent (demo mode). Please contact support@lalbazar.com for assistance.");
    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gradient-to-br from-zinc-50 to-primary/5 px-4 py-10">
      <Card className="w-full max-w-md shadow-lg border-zinc-200">
        <CardHeader className="space-y-3 items-center text-center">
          <Logo size="lg" />
          <div className="pt-2">
            <CardTitle className="text-2xl">Forgot Password</CardTitle>
            <CardDescription className="text-sm mt-1">পাসওয়ার্ড ভুলে গেছেন? — We&apos;ll help you reset it</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="text-center py-4 space-y-4">
              <div className="mx-auto w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                <MailCheck className="w-7 h-7 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-zinc-900 mb-1">Check your inbox</p>
                <p className="text-sm text-zinc-600">
                  If an account exists for <span className="font-medium text-zinc-900">{email}</span>, a password reset link has been sent.
                </p>
              </div>
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 text-left">
                <span className="font-semibold">Demo Mode:</span> Email service is not configured. Please contact{" "}
                <a href="mailto:support@lalbazar.com" className="font-semibold underline">support@lalbazar.com</a>{" "}
                for assistance with password reset.
              </div>
              <Button onClick={() => navigate("login")} variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" autoComplete="email" required />
                </div>
                <p className="text-[11px] text-zinc-500">Enter the email address associated with your LalBazar account.</p>
              </div>
              <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={loading}>
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending…</>
                ) : (
                  <><Send className="w-4 h-4" /> Send Reset Link</>
                )}
              </Button>
            </form>
          )}
        </CardContent>
        {!sent && (
          <>
            <Separator />
            <CardFooter className="justify-center py-4">
              <div className="text-sm text-zinc-600 text-center">
                Remember your password?{" "}
                <button onClick={() => navigate("login")} className="text-primary font-semibold hover:underline inline-flex items-center gap-1">
                  <ArrowLeft className="w-3 h-3" /> Back to Login
                </button>
              </div>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}
