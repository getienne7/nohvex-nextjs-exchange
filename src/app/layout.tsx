import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NOHVEX - Professional Crypto Exchange Platform",
  description: "Trade 900+ cryptocurrencies with zero fees. Secure, fast, and anonymous crypto trading platform with real-time prices and instant execution.",
  keywords: "cryptocurrency, crypto exchange, bitcoin, ethereum, trading, blockchain, digital assets",
  authors: [{ name: "NOHVEX Team" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#1e40af",
  openGraph: {
    title: "NOHVEX - Professional Crypto Exchange",
    description: "Trade 900+ cryptocurrencies with zero fees. Secure, fast, and anonymous crypto trading.",
    type: "website",
    locale: "en_US",
    siteName: "NOHVEX",
  },
  twitter: {
    card: "summary_large_image",
    title: "NOHVEX - Professional Crypto Exchange",
    description: "Trade 900+ cryptocurrencies with zero fees. Secure, fast, and anonymous crypto trading.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
