import type { Metadata } from "next";
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
        {/* Baseline: synchronous third-party scripts in <head> block parsing
            on every page, even though nothing above the fold needs them. */}
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.30.1/moment.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js"></script>
      </head>
      <body className="antialiased">
        <WebVitals />
        {children}
      </body>
    </html>
  );
}
