import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { WebVitals } from "@/components/WebVitals";

// Pass 5: fonts are self-hosted via next/font — subsetted woff2 served
// from our own origin with a preload link, font-display: swap, and a
// size-adjusted fallback font so the swap doesn't shift layout. No more
// render-blocking stylesheet from fonts.googleapis.com.
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const sora = Sora({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
  variable: "--font-sora",
});

export const metadata: Metadata = {
  title: "FinDash — All your money, one dashboard",
  description:
    "Track spending, budgets and cash flow across every account in real time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <body className="antialiased">
        <WebVitals />
        {children}
        {/* Pass 4: the third-party scripts (stand-ins for analytics/chat
            widgets) load via next/script lazyOnload — fetched after the
            page is fully loaded and idle, off the critical path. Nothing
            above the fold ever needed them. For heavyweight embeds, prefer
            a facade: render a static placeholder and load the real widget
            on first interaction. */}
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js"
          strategy="lazyOnload"
        />
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.30.1/moment.min.js"
          strategy="lazyOnload"
        />
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
