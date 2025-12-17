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
import { CheckIcon } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary" />
            <span className="font-semibold text-lg">Starter SaaS</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/login">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container flex flex-col items-center justify-center gap-8 py-24 text-center md:py-32">
          <div className="space-y-4">
            <h1 className="font-bold text-4xl tracking-tight sm:text-5xl md:text-6xl">
              Build Your SaaS
              <br />
              <span className="text-primary">Faster Than Ever</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
              A production-ready starter template with authentication, organizations, real-time
              database, and beautiful UI components out of the box.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Link href="/login">
              <Button size="lg">Get Started Free</Button>
            </Link>
            <Link href="https://github.com" target="_blank">
              <Button size="lg" variant="outline">
                View on GitHub
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="container py-16">
          <div className="grid gap-8 md:grid-cols-3">
            <FeatureCard
              description="Email/password, magic links, and OAuth with Google & GitHub. Multi-tenancy with organizations built-in."
              title="Authentication"
            />
            <FeatureCard
              description="Powered by Convex for instant updates. Type-safe queries and mutations with full TypeScript support."
              title="Real-time Database"
            />
            <FeatureCard
              description="Next.js 15, React 19, TailwindCSS, and shadcn/ui. Optimized for developer experience."
              title="Modern Stack"
            />
          </div>
        </section>

        {/* Pricing Section */}
        <section className="border-t bg-muted/50 py-16" id="pricing">
          <div className="container">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <h2 className="mb-4 font-bold text-3xl tracking-tight sm:text-4xl">
                Simple, Transparent Pricing
              </h2>
              <p className="text-lg text-muted-foreground">
                Start free, upgrade when you're ready. No hidden fees.
              </p>
            </div>

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

            <div className="mt-8 text-center">
              <Link href="/pricing">
                <Button size="lg" variant="outline">
                  View All Plans
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-muted-foreground text-sm">Built with the Starter SaaS template</p>
          <div className="flex gap-4 text-muted-foreground text-sm">
            <Link className="hover:text-foreground" href="https://docs.convex.dev" target="_blank">
              Convex
            </Link>
            <Link className="hover:text-foreground" href="https://polar.sh" target="_blank">
              Polar
            </Link>
            <Link
              className="hover:text-foreground"
              href="https://www.better-auth.com"
              target="_blank"
            >
              Better-Auth
            </Link>
            <Link className="hover:text-foreground" href="https://nextjs.org" target="_blank">
              Next.js
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <h3 className="mb-2 font-semibold text-lg">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
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
    <Card className={highlighted ? "relative border-primary shadow-lg" : "relative"}>
      {highlighted && (
        <Badge className="-top-3 -translate-x-1/2 absolute left-1/2">Most Popular</Badge>
      )}
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <span className="font-bold text-3xl">${price}</span>
          <span className="text-muted-foreground">/mo</span>
        </div>
        <ul className="space-y-2">
          {features.map((feature) => (
            <li className="flex items-center gap-2 text-sm" key={feature}>
              <CheckIcon className="size-4 text-primary" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Link className="w-full" href="/pricing">
          <Button className="w-full" variant={highlighted ? "default" : "outline"}>
            Get Started
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
