"use client";

import { Badge } from "@starter-saas/ui/badge";
import { Button } from "@starter-saas/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@starter-saas/ui/card";
import { Input } from "@starter-saas/ui/input";
import { Separator } from "@starter-saas/ui/separator";
import { SidebarInset, SidebarProvider } from "@starter-saas/ui/sidebar";
import {
  AlertCircle,
  ArrowLeft,
  FileQuestion,
  Home,
  LayoutDashboard,
  Mail,
  MessageCircle,
  PhoneCall,
  Search,
  Users2,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { AppSidebar } from "@/components/sidebar/app-sidebar";

export default function NotFound() {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");

  // Check if we're on a dashboard route
  const isDashboardRoute = pathname?.startsWith("/dashboard");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to dashboard with search - you can implement search later
      router.push(`/dashboard?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const quickLinks = [
    {
      href: "/dashboard",
      label: "Dashboard",
      description: "Go to your main dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/dashboard/agents",
      label: "Agents",
      description: "Manage your AI agents",
      icon: Users2,
    },
    {
      href: "/dashboard/call-history",
      label: "Call History",
      description: "View past calls and recordings",
      icon: PhoneCall,
    },
    {
      href: "/dashboard/chat-history",
      label: "Chat History",
      description: "Review chat transcripts",
      icon: MessageCircle,
    },
  ];

  const supportOptions = [
    {
      href: "mailto:support@deedee.ai",
      label: "Email Support",
      description: "Get help via email",
      icon: Mail,
    },
    {
      href: "/dashboard/account",
      label: "Account Settings",
      description: "Manage your account",
      icon: Users2,
    },
  ];

  const content = (
    <div
      className={
        isDashboardRoute
          ? "flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center p-4"
          : "flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-4 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
      }
    >
      <div
        className={
          isDashboardRoute
            ? "mx-auto w-full max-w-2xl space-y-6"
            : "mx-auto w-full max-w-4xl space-y-8"
        }
      >
        {/* Header */}
        <div className="space-y-4 text-center">
          <div className="flex items-center justify-center">
            <div className="rounded-full bg-red-100 p-6 dark:bg-red-900/30">
              <FileQuestion className="h-20 w-20 text-red-500 dark:text-red-400" />
            </div>
          </div>
          <div className="space-y-2">
            <Badge className="px-4 py-1 font-mono text-sm" variant="destructive">
              404 Error
            </Badge>
            <h1
              className={
                isDashboardRoute
                  ? "font-bold text-4xl tracking-tight"
                  : "font-bold text-5xl tracking-tight"
              }
            >
              Page Not Found
            </h1>
            <p
              className={
                isDashboardRoute
                  ? "text-lg text-muted-foreground"
                  : "mx-auto max-w-2xl text-muted-foreground text-xl"
              }
            >
              The page you&apos;re looking for doesn&apos;t exist
              {isDashboardRoute
                ? ". Use the sidebar to navigate or search below."
                : " or has been moved. Let's get you back on track."}
            </p>
          </div>
        </div>

        {/* Search Box */}
        <Card className="border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search for what you need
            </CardTitle>
            <CardDescription>Try searching for agents, calls, or any feature</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex gap-2" onSubmit={handleSearch}>
              <Input
                autoFocus
                className="flex-1"
                data-testid="404-search-input"
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search agents, calls, features..."
                type="search"
                value={searchQuery}
              />
              <Button data-testid="404-search-button" type="submit">
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Common Issues - Dashboard version */}
        {isDashboardRoute && (
          <Card className="bg-muted/50 shadow-sm">
            <CardContent className="p-4">
              <h3 className="mb-2 flex items-center gap-2 font-semibold">
                <AlertCircle className="h-4 w-4 text-primary" />
                Common Issues
              </h3>
              <ul className="space-y-1 text-muted-foreground text-sm">
                <li>• Double-check the URL for typos</li>
                <li>• The page may have been removed or renamed</li>
                <li>• Use the sidebar navigation to find what you need</li>
                <li>• Try searching for specific features above</li>
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Quick Navigation - Only show on non-dashboard routes */}
        {!isDashboardRoute && (
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h2 className="mb-4 flex items-center gap-2 font-semibold text-xl">
                <LayoutDashboard className="h-5 w-5 text-primary" />
                Quick Links
              </h2>
              <div className="space-y-3">
                {quickLinks.map((link) => (
                  <Link
                    className="group block"
                    data-testid={`404-link-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                    href={link.href}
                    key={link.href}
                  >
                    <Card className="shadow-sm transition-all duration-200 hover:border-primary/50 hover:shadow-md group-hover:scale-[1.02]">
                      <CardContent className="flex items-start gap-3 p-4">
                        <div className="rounded-lg bg-primary/10 p-2 transition-colors group-hover:bg-primary/20">
                          <link.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold transition-colors group-hover:text-primary">
                            {link.label}
                          </h3>
                          <p className="text-muted-foreground text-sm">{link.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-4 flex items-center gap-2 font-semibold text-xl">
                <AlertCircle className="h-5 w-5 text-primary" />
                Need Help?
              </h2>
              <div className="space-y-3">
                {supportOptions.map((option) => (
                  <Link
                    className="group block"
                    data-testid={`404-support-${option.label.toLowerCase().replace(/\s+/g, "-")}`}
                    href={option.href}
                    key={option.href}
                  >
                    <Card className="shadow-sm transition-all duration-200 hover:border-primary/50 hover:shadow-md group-hover:scale-[1.02]">
                      <CardContent className="flex items-start gap-3 p-4">
                        <div className="rounded-lg bg-primary/10 p-2 transition-colors group-hover:bg-primary/20">
                          <option.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold transition-colors group-hover:text-primary">
                            {option.label}
                          </h3>
                          <p className="text-muted-foreground text-sm">{option.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}

                {/* Common Issues Card */}
                <Card className="bg-muted/50 shadow-sm">
                  <CardContent className="p-4">
                    <h3 className="mb-2 flex items-center gap-2 font-semibold">
                      <AlertCircle className="h-4 w-4 text-primary" />
                      Common Issues
                    </h3>
                    <ul className="space-y-1 text-muted-foreground text-sm">
                      <li>• Double-check the URL for typos</li>
                      <li>• The page may have been removed or renamed</li>
                      <li>• You might need to sign in to access this page</li>
                      <li>• Try using the search above to find what you need</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {!isDashboardRoute && <Separator className="my-8" />}

        {/* Action Buttons */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            className="min-w-[200px]"
            data-testid="404-back-button"
            onClick={() => router.back()}
            size="lg"
            variant="outline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
          <Link data-testid="404-home-button" href="/dashboard">
            <Button className="min-w-[200px]" size="lg">
              <Home className="mr-2 h-4 w-4" />
              {isDashboardRoute ? "Dashboard Home" : "Go to Dashboard"}
            </Button>
          </Link>
        </div>

        {/* Footer Note */}
        <div className="text-center">
          <p className="text-muted-foreground text-sm">
            Still can&apos;t find what you&apos;re looking for?{" "}
            <a className="font-medium text-primary hover:underline" href="mailto:support@deedee.ai">
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );

  // Wrap with sidebar if on dashboard route
  if (isDashboardRoute) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>{content}</SidebarInset>
      </SidebarProvider>
    );
  }

  return content;
}
