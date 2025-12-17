"use client";

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
import { cn } from "@starter-saas/ui/lib/utils";
import { CheckIcon } from "lucide-react";

export type PricingTier = {
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: string[];
  highlighted?: boolean;
  productIds: {
    monthly: string;
    yearly: string;
  };
};

type PricingCardProps = {
  tier: PricingTier;
  billingPeriod: "monthly" | "yearly";
  currentPlan?: boolean;
  onSelect?: (productId: string) => void;
  isLoading?: boolean;
};

export function PricingCard({
  tier,
  billingPeriod,
  currentPlan,
  onSelect,
  isLoading,
}: PricingCardProps) {
  const price = billingPeriod === "monthly" ? tier.price.monthly : tier.price.yearly;
  const productId = billingPeriod === "monthly" ? tier.productIds.monthly : tier.productIds.yearly;
  const yearlyDiscount = Math.round((1 - tier.price.yearly / 12 / tier.price.monthly) * 100);

  return (
    <Card
      className={cn(
        "relative flex flex-col",
        tier.highlighted && "border-primary shadow-lg",
        currentPlan && "border-green-500",
      )}
    >
      {tier.highlighted && (
        <Badge className="-top-3 -translate-x-1/2 absolute left-1/2" variant="default">
          Most Popular
        </Badge>
      )}
      {currentPlan && (
        <Badge className="-top-3 -translate-x-1/2 absolute left-1/2" variant="secondary">
          Current Plan
        </Badge>
      )}

      <CardHeader>
        <CardTitle className="text-xl">{tier.name}</CardTitle>
        <CardDescription>{tier.description}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="mb-6">
          <span className="font-bold text-4xl">${price}</span>
          <span className="text-muted-foreground">
            /{billingPeriod === "monthly" ? "mo" : "yr"}
          </span>
          {billingPeriod === "yearly" && yearlyDiscount > 0 && (
            <Badge className="ml-2" variant="secondary">
              Save {yearlyDiscount}%
            </Badge>
          )}
        </div>

        <ul className="space-y-3">
          {tier.features.map((feature) => (
            <li className="flex items-start gap-2" key={feature}>
              <CheckIcon className="size-5 shrink-0 text-primary" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          disabled={currentPlan || isLoading}
          onClick={() => onSelect?.(productId)}
          variant={tier.highlighted ? "default" : "outline"}
        >
          {currentPlan ? "Current Plan" : isLoading ? "Loading..." : "Get Started"}
        </Button>
      </CardFooter>
    </Card>
  );
}
