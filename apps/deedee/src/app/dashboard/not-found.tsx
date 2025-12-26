"use client";

import { Badge } from "@starter-saas/ui/badge";
import { Button } from "@starter-saas/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@starter-saas/ui/card";
import { Input } from "@starter-saas/ui/input";
import { AlertCircle, ArrowLeft, FileQuestion, Home, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DashboardNotFound() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/dashboard?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center p-4">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="space-y-4 text-center">
          <div className="flex items-center justify-center">
            <div className="rounded-full bg-red-100 p-6 dark:bg-red-900/30">
              <FileQuestion className="h-16 w-16 text-red-500 dark:text-red-400" />
            </div>
          </div>
          <div className="space-y-2">
            <Badge className="px-4 py-1 font-mono text-sm" variant="destructive">
              404 Error
            </Badge>
            <h1 className="font-bold text-4xl tracking-tight">Page Not Found</h1>
            <p className="text-lg text-muted-foreground">
              The page you&apos;re looking for doesn&apos;t exist. Use the sidebar to navigate or
              search below.
            </p>
          </div>
        </div>

        {/* Search Box */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Dashboard
            </CardTitle>
            <CardDescription>Find agents, calls, or any feature</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex gap-2" onSubmit={handleSearch}>
              <Input
                autoFocus
                className="flex-1"
                data-testid="dashboard-404-search-input"
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search agents, calls, features..."
                type="search"
                value={searchQuery}
              />
              <Button data-testid="dashboard-404-search-button" type="submit">
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Common Issues */}
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

        {/* Action Buttons */}
        <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
          <Button
            className="min-w-[180px]"
            data-testid="dashboard-404-back-button"
            onClick={() => router.back()}
            size="lg"
            variant="outline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
          <Link data-testid="dashboard-404-home-button" href="/dashboard">
            <Button className="min-w-[180px]" size="lg">
              <Home className="mr-2 h-4 w-4" />
              Dashboard Home
            </Button>
          </Link>
        </div>

        {/* Support Note */}
        <div className="pt-4 text-center">
          <p className="text-muted-foreground text-sm">
            Need help?{" "}
            <a className="font-medium text-primary hover:underline" href="mailto:support@deedee.ai">
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
