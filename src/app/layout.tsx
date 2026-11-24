import type { Metadata } from "next";
import { Geist, Geist_Mono, Hind_Siliguri } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const hind = Hind_Siliguri({
  variable: "--font-hind",
  subsets: ["bengali", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "LalBazar – Online Shopping in Bangladesh | Groceries, Electronics, Fashion & More",
  description: "LalBazar is Bangladesh's trusted online marketplace. Shop groceries, electronics, fashion, home appliances, beauty and more. Cash on Delivery, bKash, Nagad accepted. Fast delivery in Dhaka and nationwide.",
  keywords: ["LalBazar", "Bangladesh online shopping", "online grocery Bangladesh", "ecommerce Bangladesh", "bKash shopping", "Nagad shopping", "cash on delivery", "Dhaka delivery"],
  authors: [{ name: "LalBazar Team" }],
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "LalBazar – Online Shopping in Bangladesh",
    description: "Shop groceries, electronics, fashion & more. COD, bKash, Nagad accepted. Fast delivery nationwide.",
    siteName: "LalBazar",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${hind.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
