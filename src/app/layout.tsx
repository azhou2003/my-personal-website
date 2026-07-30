import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { GlobalStars } from "@/components/layout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Anjie Zhou",
    default: "Home | Anjie Zhou",
  },
  description: "Software developer passionate about pushing to main. Blog & Portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Remove all favicon links. You will add your own favicon code here. */}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased relative isolate`}
      >
        <GlobalStars />
        <div className="relative z-10">{children}</div>
        <Analytics />
      </body>
    </html>
  );
}
