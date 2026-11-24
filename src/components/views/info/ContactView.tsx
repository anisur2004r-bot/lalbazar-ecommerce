"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Settings } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, MapPin, Clock, Send, Facebook, Instagram, Youtube, MessageCircle, User, MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface ContactViewProps { settings?: Settings | null; }

export function ContactView({ settings }: ContactViewProps) {
  const navigate = useStore((s) => s.navigate);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) { toast.error("Please fill in all required fields"); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    toast.success("Message sent! We'll get back to you within 24 hours.");
    setName(""); setEmail(""); setPhone(""); setSubject(""); setMessage("");
  };

  return (
    <div>
      <section className="bg-gradient-to-br from-primary to-rose-600 text-white"><div className="container mx-auto px-4 max-w-7xl py-12 sm:py-16"><div className="text-sm font-medium text-white/80 mb-2">Get in Touch • যোগাযোগ</div><h1 className="text-3xl sm:text-4xl font-bold mb-3">Contact Us</h1><p className="text-white/90 max-w-2xl">Have a question, feedback, or need help with an order? Our team is here for you — reach out and we&apos;ll respond within 24 hours.</p></div></section>
      <div className="container mx-auto px-4 max-w-7xl py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card><CardHeader><CardTitle className="text-lg flex items-center gap-2"><Send className="w-5 h-5 text-primary" /> Send us a Message</CardTitle></CardHeader><CardContent><form onSubmit={handleSubmit} className="space-y-3.5"><div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><div className="space-y-1.5"><Label htmlFor="name">Name *</Label><div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" /><Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="pl-9" placeholder="Your name" required /></div></div><div className="space-y-1.5"><Label htmlFor="email">Email *</Label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" /><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" placeholder="you@example.com" required /></div></div></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><div className="space-y-1.5"><Label htmlFor="phone">Phone</Label><div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" /><Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-9" placeholder="01XXXXXXXXX" /></div></div><div className="space-y-1.5"><Label htmlFor="subject">Subject *</Label><div className="relative"><MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" /><Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="pl-9" placeholder="How can we help?" required /></div></div></div><div className="space-y-1.5"><Label htmlFor="message">Message *</Label><Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} rows={5} placeholder="Write your message here…" required /></div><Button type="submit" disabled={loading} className="w-full sm:w-auto">{loading ? (<><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending…</>) : (<><Send className="w-4 h-4" /> Send Message</>)}</Button></form></CardContent></Card>
          <div className="space-y-4">
            <Card><CardHeader><CardTitle className="text-lg">Contact Information</CardTitle></CardHeader><CardContent className="space-y-3">{settings?.address && (<div className="flex items-start gap-3"><div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><MapPin className="w-4 h-4 text-primary" /></div><div className="min-w-0"><div className="text-xs text-zinc-500">Address</div><div className="text-sm font-medium text-zinc-900">{settings.address}</div></div></div>)}{settings?.phone && (<div className="flex items-start gap-3"><div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Phone className="w-4 h-4 text-primary" /></div><div className="min-w-0"><div className="text-xs text-zinc-500">Phone</div><a href={`tel:${settings.phone}`} className="text-sm font-medium text-zinc-900 hover:text-primary transition">{settings.phone}</a></div></div>)}{settings?.email && (<div className="flex items-start gap-3"><div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Mail className="w-4 h-4 text-primary" /></div><div className="min-w-0"><div className="text-xs text-zinc-500">Email</div><a href={`mailto:${settings.email}`} className="text-sm font-medium text-zinc-900 hover:text-primary transition">{settings.email}</a></div></div>)}<Separator /><div className="space-y-1"><div className="flex items-center gap-2 text-sm"><Clock className="w-4 h-4 text-primary" /><span className="font-medium text-zinc-900">Business Hours</span></div><div className="pl-6 text-sm text-zinc-600 space-y-0.5"><div>Saturday – Thursday: 9:00 AM – 9:00 PM</div><div>Friday: 3:00 PM – 9:00 PM</div></div></div></CardContent></Card>
            <Card><CardHeader><CardTitle className="text-lg">Follow Us</CardTitle></CardHeader><CardContent><div className="flex flex-wrap gap-2">{settings?.facebook && (<a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition text-sm font-medium"><Facebook className="w-4 h-4" /> Facebook</a>)}{settings?.instagram && (<a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-pink-50 text-pink-700 hover:bg-pink-100 transition text-sm font-medium"><Instagram className="w-4 h-4" /> Instagram</a>)}{settings?.youtube && (<a href={settings.youtube} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition text-sm font-medium"><Youtube className="w-4 h-4" /> YouTube</a>)}{settings?.whatsapp && (<a href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition text-sm font-medium"><MessageCircle className="w-4 h-4" /> WhatsApp</a>)}</div></CardContent></Card>
            <Card><CardContent className="p-0 overflow-hidden"><div className="relative h-48 bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center"><div className="text-center"><div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-2"><MapPin className="w-6 h-6 text-primary" /></div><div className="text-sm font-medium text-zinc-700">LalBazar Headquarters</div><div className="text-xs text-zinc-500">{settings?.address || "Dhaka, Bangladesh"}</div></div></div></CardContent></Card>
          </div>
        </div>
        <div className="mt-8 text-center"><Button variant="outline" onClick={() => navigate("faq")}>View FAQs</Button></div>
      </div>
    </div>
  );
}
