import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./ui/Header";
import Footer from "./ui/Footer";
import { Toaster } from "sonner";
import CookieBanner from "./ui/CookieBanner";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "OTKA — Produse resigilate și expuse",
  description: "OTKA: listă produse resigilate și ex-demo, cu prețuri avantajoase.",
  openGraph: {
    title: "OTKA — Produse resigilate și expuse",
    description: "Listă produse resigilate și ex-demo, cu prețuri avantajoase.",
    url: process.env.NEXT_PUBLIC_URL || "https://otka.ro",
    siteName: "OTKA",
    locale: "ro_RO",
    type: "website",
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
      <body className={`${inter.variable} antialiased bg-white text-neutral-900`}>
        <Toaster richColors position="top-right" />
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <CookieBanner />
      </body>
    </html>
  );
}
