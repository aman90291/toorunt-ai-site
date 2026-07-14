import type { Metadata } from "next";
import { Lora, Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
  fallback: ["Iowan Old Style", "Palatino Linotype", "Georgia", "serif"],
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

const SITE = "https://devagent.dev";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "DevAgent — The accountable AI engineering team",
    template: "%s — DevAgent",
  },
  description:
    "A governed AI engineering team — one bot per teammate, each with its own Jira and GitHub identity, 14 hard gates on every change, and an audit trail you can hand to your auditor. Clears your backend backlog overnight, with mandatory human approval or policy-bounded autonomy.",
  keywords: [
    "AI engineering team", "autonomous software engineer", "AI code review",
    "governed AI agents", "Jira GitHub AI", "AI SDLC", "agentic engineering",
  ],
  authors: [{ name: "DevAgent" }],
  openGraph: {
    type: "website",
    siteName: "DevAgent",
    url: SITE,
    images: [{ url: "/og/home.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/og/home.png"] },
  icons: { icon: "/icon.svg", apple: "/apple-icon.png" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "DevAgent",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  description:
    "A governed AI engineering team that works your real Jira and GitHub — one bot per teammate, 14 hard gates per change, a tamper-evident audit trail.",
  offers: { "@type": "Offer", priceCurrency: "USD", price: "150", description: "Per merged pull request" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${lora.variable} ${inter.variable} ${geistMono.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
