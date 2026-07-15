import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { WebVitals } from "@/components/WebVitals";

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
    <html lang="en">
      <head>
        {/* Baseline: render-blocking webfont stylesheets from a CDN, no
            preconnect, no font-display strategy. */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Sora:wght@600;700;800"
        />
      </head>
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
