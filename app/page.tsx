// Pass 2: pure Server Component — statically generated at build time; the
// page's code and data never ship in the client bundle.
import Link from "next/link";
import Image from "next/image";
import { Badge, Button, Card, CardContent } from "@practics/ui";
import { ArrowRight, ShieldCheck, Zap, LineChart } from "lucide-react";
import { DashboardCta } from "@/components/DashboardCta";
import heroImage from "@/public/images/hero.png";
import appPreviewImage from "@/public/images/app-preview.png";
import featureInsights from "@/public/images/feature-insights.png";
import featureBudgets from "@/public/images/feature-budgets.png";
import featureAlerts from "@/public/images/feature-alerts.png";
import avatar1 from "@/public/images/avatar-1.jpg";
import avatar2 from "@/public/images/avatar-2.jpg";
import avatar3 from "@/public/images/avatar-3.jpg";

const FEATURES = [
  {
    title: "Spending insights",
    body: "Every transaction categorized automatically, with trends that surface where your money actually goes.",
    image: featureInsights,
    icon: <LineChart className="h-5 w-5" />,
  },
  {
    title: "Budgets that adapt",
    body: "Set monthly targets per category and let FinDash rebalance them as your habits change.",
    image: featureBudgets,
    icon: <Zap className="h-5 w-5" />,
  },
  {
    title: "Real-time alerts",
    body: "Get notified the second a charge looks off — duplicate, oversized, or from a new merchant.",
    image: featureAlerts,
    icon: <ShieldCheck className="h-5 w-5" />,
  },
];

const TESTIMONIALS = [
  {
    name: "Maya Chen",
    role: "Freelance designer",
    quote:
      "FinDash caught a duplicate subscription within a week. It paid for itself before the trial ended.",
    avatar: avatar1,
  },
  {
    name: "Devon Park",
    role: "Engineering manager",
    quote:
      "The first finance app where the dashboard loads faster than my banking app's splash screen.",
    avatar: avatar2,
  },
  {
    name: "Sofia Alvarez",
    role: "Small business owner",
    quote:
      "I reconcile three accounts in one view. Month-end used to take an evening; now it takes coffee.",
    avatar: avatar3,
  },
];

const STATS = [
  { value: "120k+", label: "accounts connected" },
  { value: "$2.4B", label: "transactions tracked" },
  { value: "18%", label: "avg. monthly savings found" },
  { value: "4.9/5", label: "app store rating" },
];

export default function LandingPage() {
  return (
    <main>
      {/* Nav */}
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="font-display text-xl font-bold text-primary">
            FinDash
          </span>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground">
              Features
            </a>
            <a href="#preview" className="hover:text-foreground">
              Product
            </a>
            <a href="#testimonials" className="hover:text-foreground">
              Customers
            </a>
          </nav>
          <DashboardCta iconRight={<ArrowRight className="h-4 w-4" />}>
            Open dashboard
          </DashboardCta>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-12 text-center">
        <Badge variant="secondary" className="mb-6">
          Now syncing 12,000+ banks
        </Badge>
        <h1 className="font-display mx-auto max-w-3xl text-4xl font-extrabold tracking-tight sm:text-6xl">
          All your money, one dashboard
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          FinDash pulls every account, card and investment into a single
          real-time view — so you always know where you stand.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <DashboardCta size="lg">Get started free</DashboardCta>
          <a href="#preview">
            <Button size="lg" variant="outline">
              See it in action
            </Button>
          </a>
        </div>
        {/* Pass 1: next/image — the hero is the LCP element, so it gets
            priority (preloaded, fetchpriority=high); static import provides
            intrinsic dimensions; AVIF/WebP negotiated; responsive srcset. */}
        <Image
          src={heroImage}
          alt="FinDash dashboard overview"
          priority
          sizes="(max-width: 1152px) 100vw, 1104px"
          className="mt-14 w-full rounded-2xl border border-border shadow-2xl"
        />
      </section>

      {/* Stats band */}
      <section className="border-y border-border bg-secondary">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-12 md:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-display text-3xl font-bold text-primary">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-display text-center text-3xl font-bold sm:text-4xl">
          Built for people who hate spreadsheets
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
          Three things FinDash does better than your bank&apos;s app.
        </p>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {FEATURES.map((feature) => (
            <Card key={feature.title} className="overflow-hidden">
              <Image
                src={feature.image}
                alt={feature.title}
                sizes="(max-width: 768px) 100vw, 350px"
                className="w-full object-cover"
              />
              <CardContent className="p-6">
                <div className="mb-3 inline-flex rounded-lg bg-accent p-2 text-accent-foreground">
                  {feature.icon}
                </div>
                <h3 className="font-display text-lg font-semibold">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {feature.body}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Product preview */}
      <section id="preview" className="bg-secondary py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-3xl font-bold sm:text-4xl">
                Your finances, at a glance
              </h2>
              <p className="mt-4 text-muted-foreground">
                Ten thousand transactions, six accounts, one screen. Filter by
                category, search any merchant, and drill into any charge in a
                click.
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                {[
                  "Live cash-flow chart across all accounts",
                  "Category breakdown with month-over-month deltas",
                  "Instant search over your full history",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/dashboard" className="mt-8 inline-block">
                <Button iconRight={<ArrowRight className="h-4 w-4" />}>
                  Explore the dashboard
                </Button>
              </Link>
            </div>
            <Image
              src={appPreviewImage}
              alt="FinDash transactions view"
              sizes="(max-width: 1024px) 100vw, 540px"
              className="w-full rounded-2xl border border-border shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-display text-center text-3xl font-bold sm:text-4xl">
          Loved by people with complicated money
        </h2>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {TESTIMONIALS.map((testimonial) => (
            <Card key={testimonial.name}>
              <CardContent className="p-6">
                <p className="text-sm leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    sizes="40px"
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary">
        <div className="mx-auto max-w-6xl px-6 py-16 text-center">
          <h2 className="font-display text-3xl font-bold text-primary-foreground sm:text-4xl">
            Take control of your money today
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
            Free for personal use. Connect your first account in under two
            minutes.
          </p>
          <Link href="/dashboard" className="mt-8 inline-block">
            <Button size="lg" variant="secondary">
              Open the dashboard
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8 text-sm text-muted-foreground">
          <span>© 2026 FinDash. A performance case study.</span>
          <span>Built with Next.js + @practics/ui</span>
        </div>
      </footer>
    </main>
  );
}
