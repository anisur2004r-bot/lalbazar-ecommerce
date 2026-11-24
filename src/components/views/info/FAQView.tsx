"use client";

import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, ShoppingBag, CreditCard, Truck, RotateCcw, User } from "lucide-react";

const FAQS: { category: string; icon: React.ReactNode; items: { q: string; a: string }[] }[] = [
  { category: "Ordering", icon: <ShoppingBag className="w-4 h-4" />, items: [
    { q: "How do I place an order?", a: "Browse our products, add items to your cart, then proceed to checkout. Provide your delivery address, choose a payment method (COD, bKash, Nagad, or card), and confirm your order. You'll receive an order number via SMS and email." },
    { q: "Is there a minimum order value?", a: "No, there is no minimum order value. You can order as little or as much as you like. However, orders above ৳2000 qualify for free standard delivery." },
    { q: "Can I modify or cancel my order after placing it?", a: "Yes, you can modify or cancel your order before it enters the SHIPPED stage. Please contact our support team immediately with your order number. Once shipped, cancellation is not possible." },
    { q: "Do you offer bulk or wholesale pricing?", a: "Yes, for bulk orders please contact us at sales@lalbazar.com with your requirements. We offer special pricing for businesses, restaurants, and event organizers." },
  ] },
  { category: "Payment", icon: <CreditCard className="w-4 h-4" />, items: [
    { q: "What payment methods are accepted?", a: "We accept Cash on Delivery (COD), bKash, Nagad, and SSLCommerz (Visa, Mastercard, Amex, and local bank cards). All online payments are processed securely through encrypted gateways." },
    { q: "Is it safe to use my card on your website?", a: "Yes. We use SSLCommerz, a PCI-DSS compliant payment gateway, and your card information is processed directly by the bank. We never store full card numbers on our servers." },
    { q: "Do you charge any extra fee for COD?", a: "No, we do not charge any additional fee for Cash on Delivery. The price you see at checkout is the price you pay." },
    { q: "Can I get an invoice or receipt?", a: "Yes, an electronic invoice is sent to your registered email after order confirmation. For businesses needing a VAT-compliant invoice, please contact us with your company details." },
  ] },
  { category: "Delivery", icon: <Truck className="w-4 h-4" />, items: [
    { q: "How long does delivery take?", a: "Inside Dhaka, deliveries typically take 24-48 hours. Outside Dhaka, delivery takes 3-7 business days depending on the destination. Same-day delivery is available for select Dhaka areas when ordered before 12 PM." },
    { q: "Do you deliver nationwide?", a: "Yes, we deliver to all 64 districts of Bangladesh. Whether you're in Dhaka, Chattogram, Sylhet, or a remote upazila, we will get your order to you." },
    { q: "What are the delivery charges?", a: "Inside Dhaka: ৳60. Outside Dhaka: ৳120. Orders above ৳2000 qualify for free standard delivery. Bulky items may incur additional charges shown at checkout." },
    { q: "What if I'm not home during delivery?", a: "Our delivery agent will call you before arriving. You can arrange for someone else to receive the order on your behalf, or schedule a redelivery for a convenient time." },
  ] },
  { category: "Returns & Refunds", icon: <RotateCcw className="w-4 h-4" />, items: [
    { q: "Can I return a product?", a: "Yes. Non-perishable items can be returned within 7 days of delivery if unused and in original packaging. Perishable goods may be returned within 24 hours if unsatisfactory. See our Returns page for full details." },
    { q: "How do I get a refund?", a: "Once we receive and inspect the returned item, refunds are processed within 5-7 business days to your original payment method. For COD orders, refunds are issued via bKash, Nagad, bank transfer, or store credit." },
    { q: "What if I receive a damaged or wrong product?", a: "Please contact us within 48 hours of delivery with photos. We will arrange a free pickup and send a replacement or issue a full refund, including delivery charges." },
    { q: "Can I exchange an item?", a: "Yes, exchanges for size, colour, or variant are allowed within 7 days, subject to availability. If the new item costs more, you pay the difference; if less, we refund the difference." },
  ] },
  { category: "Account", icon: <User className="w-4 h-4" />, items: [
    { q: "How do I track my order?", a: "Visit the Track Order page and enter your order number (and optionally your phone). You'll see real-time status updates from Order Placed through Delivered." },
    { q: "I forgot my password. How can I reset it?", a: "Click the \"Forgot password?\" link on the login page and enter your email. In demo mode, please contact support@lalbazar.com to reset your password." },
    { q: "Do I need to create an account to order?", a: "You can browse and add to cart without an account, but you'll need to register or log in during checkout to complete your order. This helps us track your order and provide support." },
    { q: "How do I update my profile or address?", a: "Log in, go to My Account, and select Profile or Addresses. You can add, edit, or delete addresses, and update your name and phone number." },
  ] },
];

export function FAQView() {
  const navigate = useStore((s) => s.navigate);
  return (
    <div className="bg-zinc-50">
      <section className="bg-zinc-900 text-white"><div className="container mx-auto px-4 max-w-7xl py-10"><div className="flex items-center gap-2 text-sm text-zinc-400 mb-2"><HelpCircle className="w-4 h-4" /> Help Center • সাহায্য</div><h1 className="text-3xl font-bold mb-2">Frequently Asked Questions</h1><p className="text-sm text-zinc-300 max-w-2xl">Find quick answers to common questions about ordering, payments, delivery, returns, and your account.</p></div></section>
      <div className="container mx-auto px-4 max-w-4xl py-8">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-8">{FAQS.map((f) => (<a key={f.category} href={`#cat-${f.category.toLowerCase().replace(/[^a-z]/g, "")}`} className="bg-white rounded-xl border border-zinc-200 p-3 text-center hover:border-primary hover:shadow-sm transition"><div className="w-8 h-8 mx-auto rounded-full bg-primary/10 text-primary flex items-center justify-center mb-1.5">{f.icon}</div><div className="text-xs font-medium text-zinc-900">{f.category}</div></a>))}</div>
        <div className="space-y-6">{FAQS.map((cat) => { const anchor = `cat-${cat.category.toLowerCase().replace(/[^a-z]/g, "")}`; return (<Card key={cat.category} id={anchor} className="scroll-mt-24"><CardHeader><CardTitle className="text-lg flex items-center gap-2"><span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">{cat.icon}</span>{cat.category}</CardTitle></CardHeader><CardContent className="pt-0"><Accordion type="single" collapsible className="w-full">{cat.items.map((item, idx) => (<AccordionItem key={idx} value={`${cat.category}-${idx}`}><AccordionTrigger className="text-sm font-medium text-zinc-900 text-left">{item.q}</AccordionTrigger><AccordionContent className="text-sm text-zinc-600 leading-relaxed">{item.a}</AccordionContent></AccordionItem>))}</Accordion></CardContent></Card>); })}</div>
        <Card className="mt-8 bg-zinc-900 text-white border-zinc-800"><CardContent className="py-8 text-center"><HelpCircle className="w-10 h-10 mx-auto mb-3 text-primary" /><h2 className="text-xl font-bold mb-1">Still have questions?</h2><p className="text-sm text-zinc-300 mb-4 max-w-md mx-auto">Our friendly support team is ready to help. Reach out and we&apos;ll get back to you within 24 hours.</p><div className="flex flex-wrap gap-2 justify-center"><Button onClick={() => navigate("contact")} variant="secondary" className="bg-white text-zinc-900 hover:bg-white/90">Contact Support</Button><Button variant="outline" className="bg-transparent border-white text-white hover:bg-white/10" onClick={() => navigate("order-tracking")}>Track My Order</Button></div></CardContent></Card>
      </div>
    </div>
  );
}
