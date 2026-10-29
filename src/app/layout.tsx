import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";
import { Analytics } from "@vercel/analytics/next";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "NMIMS GPA Command Center · Official Grading Engine",
  description:
    "Next-gen academic command center and target optimizer for NMIMS B.Tech, MBA Tech, and Diploma students.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f9fa" },
    { media: "(prefers-color-scheme: dark)", color: "#06080f" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-dvh flex flex-col antialiased bg-canvas text-primary selection:bg-cyan-500/25 selection:text-cyan-300">
        <AppShell>{children}</AppShell>
        <Analytics />
      </body>
    </html>
  );
}
