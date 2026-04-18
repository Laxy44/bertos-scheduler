import type { Metadata } from "next";
import { IBM_Plex_Mono, Manrope } from "next/font/google";
import { Suspense } from "react";
import AppNavigateFallback from "@/components/ui/AppNavigateFallback";
import { AuthEmailHashForward } from "./auth-email-hash-forward";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "Planyo",
    template: "%s | Planyo",
  },
  description: "Staff scheduling platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthEmailHashForward />
        <Suspense fallback={<AppNavigateFallback />}>{children}</Suspense>
      </body>
    </html>
  );
}
