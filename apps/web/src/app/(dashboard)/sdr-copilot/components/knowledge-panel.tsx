"use client";

import type { Id } from "@starter-saas/backend/convex/_generated/dataModel";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@starter-saas/ui/accordion";
import { Badge } from "@starter-saas/ui/badge";
import { Button } from "@starter-saas/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@starter-saas/ui/card";
import { Input } from "@starter-saas/ui/input";
import {
  AlertTriangle,
  BookOpen,
  Car,
  ClipboardCopy,
  DollarSign,
  Filter,
  Gauge,
  Plus,
  Search,
  Sparkles,
  Star,
  ThumbsUp,
  Wrench,
} from "lucide-react";
import { useMemo, useState } from "react";

// UI constants
const COPY_FEEDBACK_DELAY_MS = 2000;
const MAX_DISPLAYED_TAGS = 3;

type VehicleInsight = {
  _id: Id<"vehicleInsights">;
  category: string;
  title: string;
  content: string;
  tags?: string[];
  vehicleTypes?: string[];
  priceRange?: string;
};

type CategoryConfig = {
  label: string;
  icon: typeof Car;
  color: string;
  bgColor: string;
};

const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  best_sellers: {
    label: "Best Sellers",
    icon: Star,
    color: "text-amber-600",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
  },
  mileage_tips: {
    label: "Mileage Tips",
    icon: Gauge,
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
  },
  parts_info: {
    label: "Parts & Reliability",
    icon: Wrench,
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-950/30",
  },
  objection_handlers: {
    label: "Objection Handlers",
    icon: AlertTriangle,
    color: "text-orange-600",
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
  },
  pricing_tips: {
    label: "Pricing Tips",
    icon: DollarSign,
    color: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
  },
};

export function KnowledgePanel({ insights }: { insights: VehicleInsight[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Group insights by category
  const groupedInsights = useMemo(() => {
    let filtered = insights;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (insight) =>
          insight.title.toLowerCase().includes(query) ||
          insight.content.toLowerCase().includes(query) ||
          insight.tags?.some((tag) => tag.toLowerCase().includes(query)),
      );
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter((insight) => insight.category === selectedCategory);
    }

    // Group by category
    return filtered.reduce(
      (acc, insight) => {
        if (!acc[insight.category]) {
          acc[insight.category] = [];
        }
        acc[insight.category].push(insight);
        return acc;
      },
      {} as Record<string, VehicleInsight[]>,
    );
  }, [insights, searchQuery, selectedCategory]);

  const handleCopyContent = (insight: VehicleInsight) => {
    navigator.clipboard.writeText(`${insight.title}: ${insight.content}`);
    setCopiedId(insight._id);
    setTimeout(() => setCopiedId(null), COPY_FEEDBACK_DELAY_MS);
  };

  const categories = Object.keys(CATEGORY_CONFIG);
  const hasResults = Object.keys(groupedInsights).length > 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5 text-violet-600" />
              Knowledge Base
            </CardTitle>
            <Button size="sm" variant="ghost">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search insights..."
              value={searchQuery}
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-1">
            <Button
              className="h-7 text-xs"
              onClick={() => setSelectedCategory(null)}
              size="sm"
              variant={selectedCategory === null ? "default" : "outline"}
            >
              All
            </Button>
            {categories.map((cat) => {
              const config = CATEGORY_CONFIG[cat];
              const Icon = config.icon;
              return (
                <Button
                  className="h-7 text-xs"
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  size="sm"
                  variant={selectedCategory === cat ? "default" : "outline"}
                >
                  <Icon className="mr-1 h-3 w-3" />
                  {config.label.split(" ")[0]}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Insights by Category */}
      {hasResults ? (
        <Accordion className="space-y-2" defaultValue={categories} type="multiple">
          {categories.map((category) => {
            const categoryInsights = groupedInsights[category];
            if (!categoryInsights || categoryInsights.length === 0) {
              return null;
            }

            const config = CATEGORY_CONFIG[category];
            const Icon = config.icon;

            return (
              <AccordionItem className="rounded-lg border" key={category} value={category}>
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded ${config.bgColor}`}
                    >
                      <Icon className={`h-4 w-4 ${config.color}`} />
                    </div>
                    <span className="font-medium text-sm">{config.label}</span>
                    <Badge className="ml-1 text-xs" variant="secondary">
                      {categoryInsights.length}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-3">
                  <div className="space-y-2">
                    {categoryInsights.map((insight) => (
                      <InsightCard
                        config={config}
                        insight={insight}
                        isCopied={copiedId === insight._id}
                        key={insight._id}
                        onCopy={() => handleCopyContent(insight)}
                      />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <Filter className="mx-auto mb-3 h-10 w-10 text-muted-foreground opacity-50" />
            <p className="font-medium text-sm">No insights found</p>
            <p className="text-muted-foreground text-xs">Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <Card>
        <CardContent className="py-3">
          <div className="grid grid-cols-2 gap-3 text-center">
            <div>
              <p className="font-bold text-xl">{insights.length}</p>
              <p className="text-muted-foreground text-xs">Total Insights</p>
            </div>
            <div>
              <p className="font-bold text-xl">{categories.length}</p>
              <p className="text-muted-foreground text-xs">Categories</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Insight CTA */}
      <Card className="border-dashed">
        <CardContent className="py-4 text-center">
          <Sparkles className="mx-auto mb-2 h-6 w-6 text-violet-500" />
          <p className="font-medium text-sm">Have a selling tip?</p>
          <p className="mb-3 text-muted-foreground text-xs">Submit new insights for team review</p>
          <Button size="sm" variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Submit Insight
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function getPriceRangeLabel(priceRange: string) {
  if (priceRange === "budget") {
    return "Budget-friendly";
  }
  if (priceRange === "mid") {
    return "Mid-range";
  }
  return "Premium";
}

function InsightCard({
  insight,
  config: _config,
  onCopy,
  isCopied,
}: {
  insight: VehicleInsight;
  config: CategoryConfig;
  onCopy: () => void;
  isCopied: boolean;
}) {
  return (
    <div className={"group relative rounded-md border p-3 transition-colors hover:bg-muted/50"}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 space-y-1">
          <p className="font-medium text-sm">{insight.title}</p>
          <p className="text-muted-foreground text-xs leading-relaxed">{insight.content}</p>
        </div>
        <Button
          className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={onCopy}
          size="icon"
          variant="ghost"
        >
          {isCopied ? (
            <ThumbsUp className="h-3 w-3 text-green-500" />
          ) : (
            <ClipboardCopy className="h-3 w-3" />
          )}
        </Button>
      </div>

      {/* Tags */}
      {insight.tags && insight.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {insight.tags.slice(0, MAX_DISPLAYED_TAGS).map((tag) => (
            <Badge className="text-[10px]" key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
          {insight.tags.length > MAX_DISPLAYED_TAGS && (
            <Badge className="text-[10px]" variant="outline">
              +{insight.tags.length - MAX_DISPLAYED_TAGS}
            </Badge>
          )}
        </div>
      )}

      {/* Vehicle Types */}
      {insight.vehicleTypes && insight.vehicleTypes.length > 0 && (
        <div className="mt-2 flex items-center gap-1 text-muted-foreground text-xs">
          <Car className="h-3 w-3" />
          {insight.vehicleTypes.join(", ")}
        </div>
      )}

      {/* Price Range */}
      {insight.priceRange && (
        <div className="mt-1 flex items-center gap-1 text-muted-foreground text-xs">
          <DollarSign className="h-3 w-3" />
          {getPriceRangeLabel(insight.priceRange)}
        </div>
      )}
    </div>
  );
}
