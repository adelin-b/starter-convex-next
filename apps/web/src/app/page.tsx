import { Button } from "@starter-saas/ui/button";
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
              A production-ready starter template with authentication, organizations,
              real-time database, and beautiful UI components out of the box.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Link href="/login">
              <Button size="lg">
                Get Started Free
              </Button>
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
              title="Authentication"
              description="Email/password, magic links, and OAuth with Google & GitHub. Multi-tenancy with organizations built-in."
            />
            <FeatureCard
              title="Real-time Database"
              description="Powered by Convex for instant updates. Type-safe queries and mutations with full TypeScript support."
            />
            <FeatureCard
              title="Modern Stack"
              description="Next.js 15, React 19, TailwindCSS, and shadcn/ui. Optimized for developer experience."
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-muted-foreground text-sm">
            Built with the Starter SaaS template
          </p>
          <div className="flex gap-4 text-muted-foreground text-sm">
            <Link href="https://docs.convex.dev" target="_blank" className="hover:text-foreground">
              Convex
            </Link>
            <Link href="https://www.better-auth.com" target="_blank" className="hover:text-foreground">
              Better-Auth
            </Link>
            <Link href="https://nextjs.org" target="_blank" className="hover:text-foreground">
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
