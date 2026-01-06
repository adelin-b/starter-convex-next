"use client";
/* eslint-disable lingui/no-unlocalized-strings */

import { CustomerPortalLink } from "@convex-dev/polar/react";
import { api } from "@starter-saas/backend/convex/_generated/api";
import { Badge } from "@starter-saas/ui/badge";
import { Button } from "@starter-saas/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@starter-saas/ui/card";
import { Skeleton } from "@starter-saas/ui/skeleton";
import { CreditCardIcon, ExternalLinkIcon } from "lucide-react";
import { useQueryWithStatus } from "@/lib/convex-hooks";

export function SubscriptionStatus() {
  const { data: subscription, isPending } = useQueryWithStatus(api.polar.getCurrentSubscription);

  // Loading state
  if (isPending) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCardIcon className="size-5" />
            Subscription
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-10 w-40" />
        </CardContent>
      </Card>
    );
  }

  // No subscription (free tier)
  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCardIcon className="size-5" />
            Subscription
          </CardTitle>
          <CardDescription>Manage your subscription and billing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="font-medium">Current Plan:</span>
            <Badge variant="secondary">Free</Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            You're on the free plan. Upgrade to unlock more features.
          </p>
          <Button render={<a href="/pricing" />}>View Plans</Button>
        </CardContent>
      </Card>
    );
  }

  // Has subscription
  const planName = subscription.productKey?.replace(/Monthly|Yearly/g, "") ?? "Unknown";
  const isYearly = subscription.productKey?.includes("Yearly");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCardIcon className="size-5" />
          Subscription
        </CardTitle>
        <CardDescription>Manage your subscription and billing</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="font-medium">Current Plan:</span>
          <Badge className="capitalize" variant="default">
            {planName}
          </Badge>
          <Badge variant="outline">{isYearly ? "Yearly" : "Monthly"}</Badge>
        </div>

        {subscription.currentPeriodEnd && (
          <p className="text-muted-foreground text-sm">
            {subscription.cancelAtPeriodEnd
              ? `Your subscription will end on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
              : `Next billing date: ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`}
          </p>
        )}

        <div className="flex gap-2">
          <CustomerPortalLink
            polarApi={{
              generateCustomerPortalUrl: api.polar.generateCustomerPortalUrl,
            }}
          >
            <Button variant="outline">
              Manage Subscription
              <ExternalLinkIcon className="ml-2 size-4" />
            </Button>
          </CustomerPortalLink>

          <Button render={<a href="/pricing" />} variant="ghost">Change Plan</Button>
        </div>
      </CardContent>
    </Card>
  );
}
