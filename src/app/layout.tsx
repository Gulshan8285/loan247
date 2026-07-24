import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SiteHeader } from "@/components/loan/site-header";
import { SiteFooter } from "@/components/loan/site-footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.loan247.online"),
  title: "LOAN247 - Personal Loan Application Online",
  description: "Apply for a LOAN247 personal loan through a simple, secure, mobile-friendly online application journey.",
  keywords: [
    "LOAN247",
    "personal loan",
    "online loan application",
    "instant loan",
    "loan app India",
    "secure loan application",
  ],
  authors: [{ name: "LOAN247" }],
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": "/rss.xml",
    },
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "LOAN247 - Personal Loan Application Online",
    description: "Apply for a personal loan with LOAN247 through a simple and secure online journey.",
    url: "https://www.loan247.online/",
    siteName: "LOAN247",
    images: [
      {
        url: "/images/hero-loan.png",
        width: 1200,
        height: 630,
        alt: "LOAN247 personal loan application",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LOAN247 - Personal Loan Application Online",
    description: "Apply for a personal loan with LOAN247 through a simple and secure online journey.",
    images: ["/images/hero-loan.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LOAN247",
  },
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-dvh flex-col antialiased bg-background text-foreground`}
      >
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
        <Toaster />
      </body>
    </html>
  );
}
