import type { Metadata } from "next";
import { Geist, Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { FooterGate } from "@/components/FooterGate";
import { MotionRoot } from "@/components/system/MotionRoot";
import { PageTransition } from "@/components/system/PageTransition";
import Script from "next/script";

/* Geist is the primary face — display, body and UI. Inter is kept only as a
   metric-compatible fallback in the font stack; Geist Mono still carries data
   and labels. */
const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

const GA_ID = "G-C59E24WX8G"; // Google Analytics 4 — public client-side measurement id
const SITE = "https://toorunt.ai";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "tOOrunt AI — The accountable AI engineering team",
    template: "%s — tOOrunt AI",
  },
  description:
    "A governed AI engineering team — one bot per teammate, each with its own Jira and GitHub identity, 14 hard gates on every change, and an audit trail you can hand to your auditor. Clears your backend backlog overnight, with mandatory human approval or policy-bounded autonomy.",
  keywords: [
    "AI engineering team", "autonomous software engineer", "AI code review",
    "governed AI agents", "Jira GitHub AI", "AI SDLC", "agentic engineering",
  ],
  authors: [{ name: "tOOrunt AI" }],
  openGraph: {
    type: "website",
    siteName: "tOOrunt AI",
    url: SITE,
    images: [{ url: "/og/home.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/og/home.png"] },
  icons: { icon: "/icon.svg", apple: "/apple-icon.png" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "tOOrunt AI",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  description:
    "A governed AI engineering team that works your real Jira and GitHub — one bot per teammate, 14 hard gates per change, a tamper-evident audit trail.",
  offers: { "@type": "Offer", priceCurrency: "USD", price: "150", description: "Per merged pull request" },
};

/**
 * The layout is now just chrome.
 *
 * It previously mounted six client components before the page even started:
 * a fixed full-viewport WebGL canvas, a pointer-signal driver, a magnetic-hover
 * binder, a perspective-tilt writer, the Dynamic Island cursor, and a Lenis
 * smooth-scroll provider wrapping the whole tree. All six are gone. The only
 * animated surface left is the hero's own canvas, which the hero mounts itself.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geist.variable} ${inter.variable} ${geistMono.variable}`}
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Google tag (gtag.js) — every page, after hydration */}
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
        </Script>

        {/* One IntersectionObserver for the whole document — see
            components/system/MotionRoot.tsx. Renders nothing. */}
        <MotionRoot />
        <PageTransition />

        <Nav />
        <main>{children}</main>
        <FooterGate>
          <Footer />
        </FooterGate>
      </body>
    </html>
  );
}
