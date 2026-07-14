import type { Metadata } from "next";
import { Geist, Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { SmoothScroll } from "@/components/SmoothScroll";
import { BackgroundFX } from "@/components/BackgroundFX";
import { ThemeDriver } from "@/components/ThemeDriver";
import { GlowCursor } from "@/components/GlowCursor";
import { Magnetic } from "@/components/Magnetic";
import { PerspectiveTilt } from "@/components/PerspectiveTilt";

// Display face — a modern, flat grotesk (no serif). Body stays Inter; data stays Geist Mono.
const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

const SITE = "https://toorunt.ai";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Toorunt AI — The accountable AI engineering team",
    template: "%s — Toorunt AI",
  },
  description:
    "A governed AI engineering team — one bot per teammate, each with its own Jira and GitHub identity, 14 hard gates on every change, and an audit trail you can hand to your auditor. Clears your backend backlog overnight, with mandatory human approval or policy-bounded autonomy.",
  keywords: [
    "AI engineering team", "autonomous software engineer", "AI code review",
    "governed AI agents", "Jira GitHub AI", "AI SDLC", "agentic engineering",
  ],
  authors: [{ name: "Toorunt AI" }],
  openGraph: {
    type: "website",
    siteName: "Toorunt AI",
    url: SITE,
    images: [{ url: "/og/home.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/og/home.png"] },
  icons: { icon: "/icon.svg", apple: "/apple-icon.png" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Toorunt AI",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  description:
    "A governed AI engineering team that works your real Jira and GitHub — one bot per teammate, 14 hard gates per change, a tamper-evident audit trail.",
  offers: { "@type": "Offer", priceCurrency: "USD", price: "150", description: "Per merged pull request" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${inter.variable} ${geistMono.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <BackgroundFX />
        <ThemeDriver />
        <Magnetic />
        <PerspectiveTilt />
        <GlowCursor />
        <SmoothScroll>
          <Nav />
          <main>{children}</main>
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
