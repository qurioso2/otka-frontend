import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./ui/Header";
import Footer from "./ui/Footer";
import { Toaster } from "sonner";
import CookieBanner from "./ui/CookieBanner";
import CartProvider from "./ui/cart/CartProvider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "OTKA — Mobilier, Iluminat și Design Interior | Prețuri Avantajoase",
  description: "Mobilier design, corpuri de iluminat și obiecte decorative pentru amenajări interioare. Produse de calitate, program parteneriat pentru designeri și arhitecți.",
  keywords: "mobilier design, corpuri iluminat, amenajari interioare, design interior, mobilier modern, lustre, fotolii, canapele, program parteneriat designeri",
  openGraph: {
    title: "OTKA — Mobilier, Iluminat și Design Interior | Prețuri Avantajoase",
    description: "Mobilier design, corpuri de iluminat și obiecte decorative pentru amenajări interioare. Program de parteneriat pentru designeri și arhitecți.",
    url: process.env.NEXT_PUBLIC_URL || "https://otka.ro",
    siteName: "OTKA",
    locale: "ro_RO",
    type: "website",
    images: [
      {
        url: "/logo-og.png",
        width: 1200,
        height: 630,
        alt: "OTKA - Produse resigilate și expuse",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OTKA — Produse resigilate și expuse",
    description: "Descoperă produse resigilate și ex-demo de calitate la prețuri avantajoase.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || "https://otka.ro"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro">
      <body className={`${inter.variable} antialiased text-neutral-900 gradient-bg`}>
        <Toaster richColors position="top-right" />
        <CartProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </CartProvider>
        <CookieBanner />
      </body>
    </html>
  );
}
