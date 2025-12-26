"use client";

import { Badge } from "@starter-saas/ui/badge";
import { Button } from "@starter-saas/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@starter-saas/ui/card";
import { Separator } from "@starter-saas/ui/separator";
import { useConvexAuth } from "convex/react";
import {
  ArrowRight,
  Award,
  Brain,
  Check,
  Loader2,
  PhoneCall,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  Users2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { UseCasesShowcase } from "@/components/landing/use-cases-showcase";
import { useUser } from "@/hooks/use-user";

export default function Home() {
  const { isAuthenticated, isLoading: convexLoading } = useConvexAuth();
  const { isLoading, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !convexLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, convexLoading, isLoaded, router]);

  const handleSignIn = () => {
    router.push("/auth/sign-in");
  };

  const handleSignUp = () => {
    router.push("/auth/sign-up");
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="flex flex-col items-center space-y-6">
          <Loader2 className="h-12 w-12 animate-spin text-white" />
          <p className="font-medium text-lg text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }

  // If authenticated, redirect to dashboard (handled by useEffect)
  if (isAuthenticated) {
    return null;
  }

  // Show landing page for unauthenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <PhoneCall className="h-8 w-8 text-primary" />
            <span className="font-bold text-2xl">DeeDee AI</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button onClick={handleSignIn} variant="ghost">
              Sign In
            </Button>
            <Button onClick={handleSignUp}>Get Started</Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-6xl text-center">
          <Badge className="mb-6 px-4 py-2 font-medium text-sm" variant="secondary">
            <Brain className="mr-2 h-4 w-4" />
            AI-Powered Call Center Automation
          </Badge>
          <h1 className="mb-8 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text font-bold text-7xl text-transparent tracking-tight">
            Never Lose a Lead
            <br />
            <span className="text-6xl">Again</span>
          </h1>
          <p className="mx-auto mb-12 max-w-4xl text-2xl text-muted-foreground leading-relaxed">
            We automatically analyze your business with AI and set up a call center to capture leads
            you&apos;d otherwise lose. Enhance your agents with real-time training, intelligent
            suggestions, and automated note-taking.
          </p>
          <div className="mb-16 flex flex-col items-center justify-center gap-6 sm:flex-row">
            <Button
              className="group px-8 py-4 font-semibold text-lg shadow-lg transition-all duration-300 hover:shadow-xl"
              onClick={handleSignUp}
              size="lg"
            >
              Start Capturing Leads
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              className="border-2 px-8 py-4 font-semibold text-lg transition-all duration-300 hover:bg-slate-50"
              onClick={handleSignIn}
              size="lg"
              variant="outline"
            >
              Sign In
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-col items-center space-y-4">
            <p className="text-muted-foreground text-sm">Trusted by sales teams worldwide</p>
            <div className="flex items-center space-x-8 opacity-60">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-6 w-6" />
                <span className="font-semibold">45% More Leads</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-6 w-6" />
                <span className="font-semibold">24/7 Coverage</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="h-6 w-6" />
                <span className="font-semibold">AI-Enhanced</span>
              </div>
            </div>
          </div>
        </div>

        {/* Use Cases Showcase */}
        <div className="mt-32">
          <div className="mb-16 text-center">
            <Badge className="mb-4" variant="outline">
              See It In Action
            </Badge>
            <h2 className="mb-4 font-bold text-4xl">Real Use Cases, Real Results</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground text-xl">
              See how DeeDee AI transforms sales operations with live demos and actual customer
              metrics
            </p>
          </div>
          <UseCasesShowcase />
        </div>

        {/* Features Section */}
        <div className="mt-32">
          <div className="mb-16 text-center">
            <Badge className="mb-4" variant="outline">
              Features
            </Badge>
            <h2 className="mb-4 font-bold text-4xl">Complete Call Center Solution</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground text-xl">
              From AI analysis to agent empowerment, everything you need to maximize conversions
            </p>
          </div>

          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
            <Card className="group border-0 text-center shadow-lg transition-all duration-300 hover:shadow-xl">
              <CardHeader className="pb-6">
                <div className="mb-6 flex justify-center">
                  <div className="rounded-full bg-blue-100 p-4 transition-colors group-hover:bg-blue-200 dark:bg-blue-900/30 dark:group-hover:bg-blue-800/40">
                    <Brain className="h-12 w-12 text-primary" />
                  </div>
                </div>
                <CardTitle className="mb-4 text-xl">AI Business Analysis</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Automatically analyze your business and set up an optimized call center to capture
                  leads that would otherwise slip away.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group border-0 text-center shadow-lg transition-all duration-300 hover:shadow-xl">
              <CardHeader className="pb-6">
                <div className="mb-6 flex justify-center">
                  <div className="rounded-full bg-green-100 p-4 transition-colors group-hover:bg-green-200 dark:bg-green-900/30 dark:group-hover:bg-green-800/40">
                    <Users2 className="h-12 w-12 text-primary" />
                  </div>
                </div>
                <CardTitle className="mb-4 text-xl">Agent Enhancement</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Train and develop your calling agents with continuous learning, personalized
                  coaching, and performance optimization.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group border-0 text-center shadow-lg transition-all duration-300 hover:shadow-xl">
              <CardHeader className="pb-6">
                <div className="mb-6 flex justify-center">
                  <div className="rounded-full bg-purple-100 p-4 transition-colors group-hover:bg-purple-200 dark:bg-purple-900/30 dark:group-hover:bg-purple-800/40">
                    <Sparkles className="h-12 w-12 text-primary" />
                  </div>
                </div>
                <CardTitle className="mb-4 text-xl">Real-Time Assistance</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Provide agents with the right arguments at the right time, plus automated
                  note-taking to keep them focused on closing deals.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="mt-32">
          <div className="mb-16 text-center">
            <Badge className="mb-4" variant="outline">
              Testimonials
            </Badge>
            <h2 className="mb-4 font-bold text-4xl">Loved by sales teams worldwide</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground text-xl">
              See how businesses are capturing more leads with DeeDee AI
            </p>
          </div>

          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" key={i} />
                  ))}
                </div>
                <p className="mb-4 text-muted-foreground">
                  &ldquo;DeeDee AI analyzed our business and set up our call center in days.
                  We&apos;re now capturing 45% more leads that we used to miss after hours.&rdquo;
                </p>
                <div className="flex items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 font-semibold text-white">
                    SM
                  </div>
                  <div className="ml-3">
                    <p className="font-semibold">Sarah Miller</p>
                    <p className="text-muted-foreground text-sm">Sales Director, TechCorp</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" key={i} />
                  ))}
                </div>
                <p className="mb-4 text-muted-foreground">
                  &ldquo;The real-time agent assistance is game-changing. Our team gets the right
                  talking points instantly, and automated notes let them focus on selling.&rdquo;
                </p>
                <div className="flex items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-blue-500 font-semibold text-white">
                    DJ
                  </div>
                  <div className="ml-3">
                    <p className="font-semibold">David Johnson</p>
                    <p className="text-muted-foreground text-sm">Sales Manager, InnovateLab</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" key={i} />
                  ))}
                </div>
                <p className="mb-4 text-muted-foreground">
                  &ldquo;The AI training and coaching turned our junior agents into top performers
                  in weeks. Conversion rates are up 60%.&rdquo;
                </p>
                <div className="flex items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 font-semibold text-white">
                    EW
                  </div>
                  <div className="ml-3">
                    <p className="font-semibold">Emily Wilson</p>
                    <p className="text-muted-foreground text-sm">VP of Sales, SecureApp</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="mt-32">
          <div className="mb-16 text-center">
            <Badge className="mb-4" variant="outline">
              Pricing
            </Badge>
            <h2 className="mb-4 font-bold text-4xl">Simple, transparent pricing</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground text-xl">
              Choose the plan that&apos;s right for your team
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-6 text-center">
                <CardTitle className="text-2xl">Starter</CardTitle>
                <div className="mt-4">
                  <span className="font-bold text-4xl">$0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <CardDescription className="mt-4">
                  Perfect for small sales teams testing the waters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Check className="mr-3 h-5 w-5 text-green-500" />
                    <span>Up to 50 calls/month</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="mr-3 h-5 w-5 text-green-500" />
                    <span>Basic AI analysis</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="mr-3 h-5 w-5 text-green-500" />
                    <span>Email support</span>
                  </div>
                </div>
                <Button className="mt-6 w-full" onClick={handleSignUp} variant="outline">
                  Get Started
                </Button>
              </CardContent>
            </Card>

            <Card className="relative border-2 border-primary shadow-xl">
              <Badge className="-top-3 -translate-x-1/2 absolute left-1/2 transform bg-primary">
                Most Popular
              </Badge>
              <CardHeader className="pb-6 text-center">
                <CardTitle className="text-2xl">Professional</CardTitle>
                <div className="mt-4">
                  <span className="font-bold text-4xl">$29</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <CardDescription className="mt-4">
                  Ideal for growing sales teams that need full AI capabilities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Check className="mr-3 h-5 w-5 text-green-500" />
                    <span>Unlimited calls</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="mr-3 h-5 w-5 text-green-500" />
                    <span>Real-time agent assistance</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="mr-3 h-5 w-5 text-green-500" />
                    <span>AI training & coaching</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="mr-3 h-5 w-5 text-green-500" />
                    <span>Automated note-taking</span>
                  </div>
                </div>
                <Button className="mt-6 w-full" onClick={handleSignUp}>
                  Start Free Trial
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-6 text-center">
                <CardTitle className="text-2xl">Enterprise</CardTitle>
                <div className="mt-4">
                  <span className="font-bold text-4xl">$99</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <CardDescription className="mt-4">
                  For large sales organizations with complex requirements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Check className="mr-3 h-5 w-5 text-green-500" />
                    <span>Everything in Professional</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="mr-3 h-5 w-5 text-green-500" />
                    <span>Custom AI workflows</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="mr-3 h-5 w-5 text-green-500" />
                    <span>Dedicated success manager</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="mr-3 h-5 w-5 text-green-500" />
                    <span>99.9% uptime SLA</span>
                  </div>
                </div>
                <Button className="mt-6 w-full" onClick={handleSignUp} variant="outline">
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-32">
          <Card className="border-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl">
            <CardContent className="p-12 text-center">
              <h2 className="mb-4 font-bold text-4xl">Ready to capture more leads?</h2>
              <p className="mx-auto mb-8 max-w-2xl text-xl opacity-90">
                Join hundreds of sales teams already using DeeDee AI to never miss an opportunity
                and empower their agents.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button
                  className="bg-white px-8 py-4 font-semibold text-blue-600 text-lg shadow-lg transition-all duration-300 hover:bg-gray-100 hover:shadow-xl"
                  onClick={handleSignUp}
                  size="lg"
                >
                  Start Your Free Trial
                </Button>
                <Button
                  className="border-white px-8 py-4 font-semibold text-lg text-white transition-all duration-300 hover:bg-white hover:text-blue-600"
                  onClick={handleSignIn}
                  size="lg"
                  variant="outline"
                >
                  Sign In
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto border-slate-200 border-t px-4 py-16 dark:border-slate-700">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <PhoneCall className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">DeeDee AI</span>
            </div>
            <p className="text-muted-foreground">
              AI-powered call center automation and agent enhancement platform.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Product</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a className="transition-colors hover:text-foreground" href="/features">
                  Features
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-foreground" href="/pricing">
                  Pricing
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-foreground" href="/integrations">
                  Integrations
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-foreground" href="/api">
                  API
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Company</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a className="transition-colors hover:text-foreground" href="/about">
                  About
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-foreground" href="/blog">
                  Blog
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-foreground" href="/careers">
                  Careers
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-foreground" href="/contact">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Support</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a className="transition-colors hover:text-foreground" href="/help">
                  Help Center
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-foreground" href="/docs">
                  Documentation
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-foreground" href="/status">
                  Status
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-foreground" href="/security">
                  Security
                </a>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between text-muted-foreground md:flex-row">
          <p>&copy; 2024 DeeDee AI. All rights reserved.</p>
          <div className="mt-4 flex space-x-6 md:mt-0">
            <a className="transition-colors hover:text-foreground" href="/privacy">
              Privacy
            </a>
            <a className="transition-colors hover:text-foreground" href="/terms">
              Terms
            </a>
            <a className="transition-colors hover:text-foreground" href="/cookies">
              Cookies
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
