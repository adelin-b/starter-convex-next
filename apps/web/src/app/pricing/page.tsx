/* eslint-disable lingui/no-unlocalized-strings */
import { Button } from "@starter-saas/ui/button";
import type { Metadata } from "next";
import Link from "next/link";
import { PricingTable } from "@/features/billing";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple, transparent pricing for everyone",
};

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link className="flex items-center gap-2" href="/">
            <div className="size-8 rounded-lg bg-primary" />
            <span className="font-semibold text-lg">Starter SaaS</span>
          </Link>
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

      {/* Pricing Content */}
      <main className="flex-1">
        <section className="container py-16 md:py-24">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <h1 className="mb-4 font-bold text-4xl tracking-tight sm:text-5xl">
              Simple, Transparent Pricing
            </h1>
            <p className="text-lg text-muted-foreground">
              Choose the plan that works best for you. All plans include a 14-day free trial.
            </p>
          </div>

          <PricingTable />

          <div className="mt-16 text-center">
            <p className="mb-4 text-muted-foreground">
              Need a custom plan for your enterprise? We've got you covered.
            </p>
            <Button render={<Link href="mailto:sales@example.com" />} variant="outline">
              Contact Sales
            </Button>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="border-t bg-muted/50 py-16">
          <div className="container">
            <h2 className="mb-8 text-center font-bold text-2xl">Frequently Asked Questions</h2>
            <div className="mx-auto max-w-2xl space-y-6">
              <FaqItem
                answer="Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate your billing."
                question="Can I change plans later?"
              />
              <FaqItem
                answer="We accept all major credit cards, including Visa, Mastercard, and American Express. We also support PayPal for annual subscriptions."
                question="What payment methods do you accept?"
              />
              <FaqItem
                answer="Yes, all paid plans come with a 14-day free trial. No credit card required to start."
                question="Is there a free trial?"
              />
              <FaqItem
                answer="Absolutely. You can cancel your subscription at any time from your account settings. You'll continue to have access until the end of your billing period."
                question="Can I cancel anytime?"
              />
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
            <Link className="hover:text-foreground" href="https://nextjs.org" target="_blank">
              Next.js
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <h3 className="mb-2 font-semibold">{question}</h3>
      <p className="text-muted-foreground text-sm">{answer}</p>
    </div>
  );
}
