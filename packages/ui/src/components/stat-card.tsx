import { cn } from "@starter-saas/ui/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent } from "./card";

const statCardVariants = cva("", {
  variants: {
    variant: {
      default: "",
      bordered: "border-2",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface StatCardProps
  extends React.ComponentProps<typeof Card>,
    VariantProps<typeof statCardVariants> {}

/**
 * StatCard component for displaying metrics with icons, values, and trends.
 *
 * @example
 * <StatCard>
 *   <StatCardHeader>
 *     <StatCardIcon>
 *       <Users className="size-4" />
 *     </StatCardIcon>
 *     <StatCardTitle>Total Users</StatCardTitle>
 *   </StatCardHeader>
 *   <StatCardValue>1,234</StatCardValue>
 *   <StatCardTrend type="increase" value="+12.3%" />
 * </StatCard>
 */
function StatCard({ className, variant, ...props }: StatCardProps) {
  return (
    <Card
      className={cn(statCardVariants({ variant }), className)}
      data-slot="stat-card"
      {...props}
    />
  );
}

function StatCardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex items-center gap-2", className)}
      data-slot="stat-card-header"
      {...props}
    />
  );
}

function StatCardIcon({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground [&_svg]:size-4",
        className,
      )}
      data-slot="stat-card-icon"
      {...props}
    />
  );
}

function StatCardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      className={cn("font-medium text-muted-foreground text-sm", className)}
      data-slot="stat-card-title"
      {...props}
    />
  );
}

function StatCardValue({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("font-bold text-2xl tracking-tight", className)}
      data-slot="stat-card-value"
      {...props}
    />
  );
}

interface StatCardTrendProps extends React.ComponentProps<"div"> {
  type: "increase" | "decrease" | "neutral";
  value: string;
}

/**
 * Trend indicator for stat cards
 */
function StatCardTrend({ type, value, className, ...props }: StatCardTrendProps) {
  const Icon = type === "increase" ? TrendingUp : TrendingDown;

  let colorClass = "text-muted-foreground";
  if (type === "increase") {
    colorClass = "text-green-600 dark:text-green-400";
  } else if (type === "decrease") {
    colorClass = "text-red-600 dark:text-red-400";
  }

  if (type === "neutral") {
    return (
      <div
        className={cn("flex items-center gap-1 text-muted-foreground text-xs", className)}
        data-slot="stat-card-trend"
        {...props}
      >
        <span>{value}</span>
      </div>
    );
  }

  return (
    <div
      className={cn("flex items-center gap-1 text-xs", colorClass, className)}
      data-slot="stat-card-trend"
      {...props}
    >
      <Icon className="size-3" />
      <span>{value}</span>
    </div>
  );
}

function StatCardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={cn("text-muted-foreground text-xs", className)}
      data-slot="stat-card-description"
      {...props}
    />
  );
}

/**
 * Content wrapper for stat card (handles padding)
 */
function StatCardContentWrapper({ className, ...props }: React.ComponentProps<typeof CardContent>) {
  return (
    <CardContent className={cn("space-y-2", className)} data-slot="stat-card-content" {...props} />
  );
}

export {
  StatCard,
  StatCardHeader,
  StatCardIcon,
  StatCardTitle,
  StatCardValue,
  StatCardTrend,
  StatCardDescription,
  StatCardContentWrapper,
};
