import type { Metadata } from "next";
import { Bodoni_Moda, Space_Mono, Kalam, Nunito_Sans } from "next/font/google";
import "./globals.css";

const bodoni = Bodoni_Moda({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["700", "900"],
});

const spaceMono = Space_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const kalam = Kalam({
  variable: "--font-script",
  subsets: ["latin", "devanagari"],
  weight: ["400", "700"],
});

const nunito = Nunito_Sans({
  variable: "--font-chrome",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "HH Goa 2026 — Stamp Office",
  description: "Get your HH Goa 2026 builder ID stamped, issued, and ready to share.",
  icons: {
    icon: "/icon.png",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${bodoni.variable} ${spaceMono.variable} ${kalam.variable} ${nunito.variable} h-full`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
