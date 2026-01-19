/* eslint-disable lingui/no-unlocalized-strings */
import { Badge } from "@starter-saas/ui/badge";
import { Button } from "@starter-saas/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@starter-saas/ui/card";
import {
  ArrowRightIcon,
  CheckIcon,
  GlobeIcon,
  LayersIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ZapIcon,
} from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      {/* Atmospheric background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {/* Primary gradient orb */}
        <div className="absolute -top-[40%] left-1/2 size-[80vw] -translate-x-1/2 rounded-full bg-gradient-to-br from-primary/20 via-primary/5 to-transparent blur-3xl" />
        {/* Secondary accent orb */}
        <div className="absolute top-[30%] -right-[20%] size-[50vw] rounded-full bg-gradient-to-bl from-secondary/15 via-secondary/5 to-transparent blur-3xl" />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px),
                             linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 border-border/40 border-b bg-background/80 backdrop-blur-xl">
        <div className="container flex h-20 items-center justify-between">
          <Link className="group flex items-center gap-3" href="/">
            <div className="relative flex size-10 items-center justify-center">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25 transition-transform duration-300 group-hover:scale-105" />
              <SparklesIcon className="relative size-5 text-primary-foreground" />
            </div>
            <span className="font-serif text-xl tracking-tight">Starter</span>
          </Link>

          <nav className="flex items-center gap-2">
            <Link href="#features">
              <Button className="text-muted-foreground" variant="ghost">
                Features
              </Button>
            </Link>
            <Link href="/pricing">
              <Button className="text-muted-foreground" variant="ghost">
                Pricing
              </Button>
            </Link>
            <div className="ml-2 h-6 w-px bg-border" />
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/login">
              <Button className="shadow-lg shadow-primary/20">Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="relative z-10 flex-1">
        {/* Hero Section */}
        <section className="relative py-24 md:py-32 lg:py-40">
          <div className="container">
            <div className="mx-auto max-w-4xl text-center">
              {/* Eyebrow */}
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/50 px-4 py-1.5 text-sm backdrop-blur-sm">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-secondary opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-secondary" />
                </span>
                <span className="text-muted-foreground">Now with React 19 & Next.js 15</span>
              </div>

              {/* Main headline */}
              <h1 className="mb-6 font-serif text-5xl leading-[1.1] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
                Build Your SaaS
                <br />
                <span className="bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
                  Faster Than Ever
                </span>
              </h1>

              {/* Subheading */}
              <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground leading-relaxed md:text-xl">
                A production-ready starter template with authentication, organizations, real-time
                database, and beautiful UI components—everything you need to ship faster.
              </p>

              {/* CTA buttons */}
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/login">
                  <Button
                    className="group h-12 min-w-[180px] gap-2 rounded-full shadow-primary/25 shadow-xl transition-all duration-300 hover:shadow-2xl hover:shadow-primary/30"
                    size="lg"
                  >
                    Get Started Free
                    <ArrowRightIcon className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="https://github.com" target="_blank">
                  <Button
                    className="h-12 min-w-[180px] rounded-full border-border/50 backdrop-blur-sm"
                    size="lg"
                    variant="outline"
                  >
                    View on GitHub
                  </Button>
                </Link>
              </div>

              {/* Social proof */}
              <div className="mt-16 flex flex-col items-center gap-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      className="size-10 rounded-full border-2 border-background bg-gradient-to-br from-muted to-muted-foreground/20"
                      key={i}
                    />
                  ))}
                </div>
                <p className="text-muted-foreground text-sm">
                  <span className="font-semibold text-foreground">500+</span> developers building
                  with Starter
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative border-border/40 border-y bg-muted/30 py-24" id="features">
          <div className="container">
            {/* Section header */}
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <Badge className="mb-4" variant="secondary">
                Features
              </Badge>
              <h2 className="mb-4 font-serif text-3xl tracking-tight sm:text-4xl md:text-5xl">
                Everything you need to ship
              </h2>
              <p className="text-lg text-muted-foreground">
                Built on battle-tested technologies, designed for developer experience.
              </p>
            </div>

            {/* Feature grid */}
            <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                description="Email/password, magic links, OAuth with Google & GitHub. Multi-tenant workspaces built-in."
                icon={<ShieldCheckIcon className="size-5" />}
                title="Authentication"
              />
              <FeatureCard
                description="Powered by Convex for instant updates. Type-safe queries and mutations with full TypeScript."
                icon={<ZapIcon className="size-5" />}
                title="Real-time Database"
              />
              <FeatureCard
                description="Next.js 15, React 19, TailwindCSS, and shadcn/ui. Optimized for developer experience."
                icon={<LayersIcon className="size-5" />}
                title="Modern Stack"
              />
              <FeatureCard
                description="Accept payments with Polar. Handle subscriptions, plans, and billing portal out of the box."
                icon={<SparklesIcon className="size-5" />}
                title="Payments"
              />
              <FeatureCard
                description="Vitest for unit tests, Playwright for E2E. BDD with Gherkin feature files."
                icon={<CheckIcon className="size-5" />}
                title="Testing"
              />
              <FeatureCard
                description="Deploy anywhere. Vercel, Cloudflare, or self-host. Zero vendor lock-in."
                icon={<GlobeIcon className="size-5" />}
                title="Deploy Anywhere"
              />
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="relative py-24 md:py-32" id="pricing">
          <div className="container">
            {/* Section header */}
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <Badge className="mb-4" variant="secondary">
                Pricing
              </Badge>
              <h2 className="mb-4 font-serif text-3xl tracking-tight sm:text-4xl md:text-5xl">
                Simple, transparent pricing
              </h2>
              <p className="text-lg text-muted-foreground">
                Start free, upgrade when you're ready. No hidden fees.
              </p>
            </div>

            {/* Pricing cards */}
            <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
              <PricingPreviewCard
                description="Perfect for trying out"
                features={["Up to 3 projects", "Basic analytics", "Community support"]}
                name="Free"
                price={0}
              />
              <PricingPreviewCard
                description="For professionals"
                features={[
                  "Unlimited projects",
                  "Advanced analytics",
                  "Priority support",
                  "API access",
                ]}
                highlighted
                name="Pro"
                price={19}
              />
              <PricingPreviewCard
                description="For organizations"
                features={[
                  "Everything in Pro",
                  "Unlimited team members",
                  "SSO",
                  "Dedicated support",
                ]}
                name="Team"
                price={49}
              />
            </div>

            <div className="mt-12 text-center">
              <Link href="/pricing">
                <Button className="rounded-full" size="lg" variant="outline">
                  View All Plans
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative border-border/40 border-t bg-muted/30 py-24">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="mb-4 font-serif text-3xl tracking-tight sm:text-4xl md:text-5xl">
                Ready to ship faster?
              </h2>
              <p className="mb-8 text-lg text-muted-foreground">
                Join hundreds of developers building their SaaS with Starter.
              </p>
              <Link href="/login">
                <Button
                  className="group h-12 gap-2 rounded-full shadow-primary/25 shadow-xl"
                  size="lg"
                >
                  Start Building Today
                  <ArrowRightIcon className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-border/40 border-t py-12">
        <div className="container">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80">
                <SparklesIcon className="size-4 text-primary-foreground" />
              </div>
              <span className="font-serif tracking-tight">Starter</span>
            </div>

            {/* Links */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-muted-foreground text-sm">
              <Link className="transition-colors hover:text-foreground" href="/pricing">
                Pricing
              </Link>
              <Link
                className="transition-colors hover:text-foreground"
                href="https://docs.convex.dev"
                target="_blank"
              >
                Convex
              </Link>
              <Link
                className="transition-colors hover:text-foreground"
                href="https://polar.sh"
                target="_blank"
              >
                Polar
              </Link>
              <Link
                className="transition-colors hover:text-foreground"
                href="https://www.better-auth.com"
                target="_blank"
              >
                Better-Auth
              </Link>
            </div>

            {/* Copyright */}
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} Starter SaaS
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-border hover:bg-card hover:shadow-primary/5 hover:shadow-xl">
      {/* Subtle gradient on hover */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative">
        <div className="mb-4 inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
        <h3 className="mb-2 font-semibold text-lg">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function PricingPreviewCard({
  name,
  price,
  description,
  features,
  highlighted,
}: {
  name: string;
  price: number;
  description: string;
  features: string[];
  highlighted?: boolean;
}) {
  return (
    <Card
      className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
        highlighted
          ? "border-primary/50 bg-gradient-to-b from-primary/5 to-transparent shadow-primary/10 shadow-xl"
          : "border-border/50 hover:border-border"
      }`}
    >
      {highlighted && (
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
      )}
      {highlighted && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 shadow-lg" variant="default">
          Most Popular
        </Badge>
      )}
      <CardHeader className="pt-8">
        <CardTitle className="font-serif text-xl">{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <span className="font-serif text-4xl">${price}</span>
          <span className="text-muted-foreground">/mo</span>
        </div>
        <ul className="space-y-3">
          {features.map((feature) => (
            <li className="flex items-center gap-3 text-sm" key={feature}>
              <div className="flex size-5 items-center justify-center rounded-full bg-primary/10">
                <CheckIcon className="size-3 text-primary" />
              </div>
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Link className="w-full" href="/pricing">
          <Button
            className={`w-full rounded-full ${highlighted ? "shadow-lg shadow-primary/25" : ""}`}
            variant={highlighted ? "default" : "outline"}
          >
            Get Started
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
