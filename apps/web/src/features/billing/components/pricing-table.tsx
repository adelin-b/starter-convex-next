"use client";
/* eslint-disable lingui/no-unlocalized-strings */

import { CheckoutLink } from "@convex-dev/polar/react";
import { api } from "@starter-saas/backend/convex/_generated/api";
import { Label } from "@starter-saas/ui/label";
import { Switch } from "@starter-saas/ui/switch";
import { useState } from "react";
import { useQueryWithStatus } from "@/lib/convex-hooks";
import { PricingCard, type PricingTier } from "./pricing-card";

/**
 * Default pricing tiers - customize these for your SaaS
 */
const defaultTiers: PricingTier[] = [
  {
    name: "Free",
    description: "Perfect for trying out the platform",
    price: { monthly: 0, yearly: 0 },
    features: ["Up to 3 projects", "Basic analytics", "Community support", "1 team member"],
    productIds: {
      monthly: "", // Free tier doesn't need product IDs
      yearly: "",
    },
  },
  {
    name: "Pro",
    description: "For professionals and growing teams",
    price: { monthly: 19, yearly: 190 },
    features: [
      "Unlimited projects",
      "Advanced analytics",
      "Priority support",
      "Up to 5 team members",
      "Custom integrations",
      "API access",
    ],
    highlighted: true,
    productIds: {
      monthly: "proMonthly",
      yearly: "proYearly",
    },
  },
  {
    name: "Team",
    description: "For organizations that need more",
    price: { monthly: 49, yearly: 490 },
    features: [
      "Everything in Pro",
      "Unlimited team members",
      "SSO authentication",
      "Advanced security",
      "Custom branding",
      "Dedicated support",
      "SLA guarantee",
    ],
    productIds: {
      monthly: "teamMonthly",
      yearly: "teamYearly",
    },
  },
];

type PricingTableProps = {
  tiers?: PricingTier[];
  showBillingToggle?: boolean;
};

export function PricingTable({
  tiers = defaultTiers,
  showBillingToggle = true,
}: PricingTableProps) {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

  // Get current user's subscription (returns null if not subscribed or not logged in)
  const { data: subscription } = useQueryWithStatus(api.polar.getCurrentSubscription);
  const currentProductKey = subscription?.productKey ?? null;

  return (
    <div className="space-y-8">
      {showBillingToggle && (
        <div className="flex items-center justify-center gap-4">
          <Label
            className={billingPeriod === "monthly" ? "font-semibold" : "text-muted-foreground"}
            htmlFor="billing-toggle"
          >
            Monthly
          </Label>
          <Switch
            checked={billingPeriod === "yearly"}
            id="billing-toggle"
            onCheckedChange={(checked) => setBillingPeriod(checked ? "yearly" : "monthly")}
          />
          <Label
            className={billingPeriod === "yearly" ? "font-semibold" : "text-muted-foreground"}
            htmlFor="billing-toggle"
          >
            Yearly
          </Label>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {tiers.map((tier) => {
          const productKey =
            billingPeriod === "monthly" ? tier.productIds.monthly : tier.productIds.yearly;

          const isCurrentPlan = currentProductKey === productKey;
          const isFree = tier.price.monthly === 0;

          // For free tier, show regular card without checkout
          if (isFree) {
            return (
              <PricingCard
                billingPeriod={billingPeriod}
                currentPlan={!currentProductKey}
                key={tier.name}
                tier={tier} // Current if no subscription
              />
            );
          }

          // For paid tiers, wrap in CheckoutLink
          return (
            <CheckoutLink
              className="block"
              key={tier.name}
              polarApi={api.polar}
              productIds={[tier.productIds.monthly, tier.productIds.yearly]}
            >
              <PricingCard billingPeriod={billingPeriod} currentPlan={isCurrentPlan} tier={tier} />
            </CheckoutLink>
          );
        })}
      </div>
    </div>
  );
}
