"use client";

import { Badge } from "@starter-saas/ui/badge";
import { Card, CardContent } from "@starter-saas/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@starter-saas/ui/tabs";
import { cn } from "@starter-saas/ui/utils";
import {
  ArrowUpRight,
  Brain,
  CheckCircle2,
  Clock,
  MessageSquare,
  Phone,
  Sparkles,
  Target,
  TrendingUp,
  Users2,
} from "lucide-react";
import { useState } from "react";

type MetricProps = {
  label: string;
  before: string;
  after: string;
  improvement: string;
  icon: React.ReactNode;
};

function Metric({ label, before, after, improvement, icon }: MetricProps) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-4 dark:border-slate-700 dark:from-slate-800/50 dark:to-slate-900/50">
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="flex-1">
        <div className="font-medium text-muted-foreground text-sm">{label}</div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-muted-foreground text-sm line-through opacity-60">{before}</span>
          <ArrowUpRight className="h-4 w-4 text-green-500" />
          <span className="font-bold text-2xl">{after}</span>
        </div>
        <div className="mt-1 font-medium text-green-600 text-xs dark:text-green-400">
          {improvement}
        </div>
      </div>
    </div>
  );
}

type MiniCallUIProps = {
  status: "incoming" | "active" | "notes";
  agentName: string;
  callTime?: string;
  suggestions?: string[];
  autoNotes?: string[];
};

function MiniCallUI({
  status,
  agentName,
  callTime = "00:45",
  suggestions = [],
  autoNotes = [],
}: MiniCallUIProps) {
  return (
    <div className="relative">
      {/* Phone Call Interface */}
      <div className="mx-auto max-w-sm rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 p-6 text-white shadow-2xl">
        {/* Status Bar */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
            <span className="font-medium text-sm">
              {status === "incoming" && "Incoming Call"}
              {status === "active" && "Active Call"}
              {status === "notes" && "Call Ended"}
            </span>
          </div>
          <span className="text-sm opacity-80">{callTime}</span>
        </div>

        {/* Caller Info */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <Phone className="h-10 w-10" />
          </div>
          <div className="font-semibold text-xl">Sarah Johnson</div>
          <div className="text-sm opacity-80">+1 (555) 123-4567</div>
          <Badge className="mt-2 border-white/30 bg-white/20">High Value Lead</Badge>
        </div>

        {/* AI Suggestions */}
        {suggestions.length > 0 && (
          <div className="mb-4 rounded-xl bg-white/10 p-4 backdrop-blur-md">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-yellow-300" />
              <span className="font-medium text-sm">AI Suggestions</span>
            </div>
            <div className="space-y-2">
              {suggestions.map((suggestion, idx) => (
                <div
                  className="flex items-start gap-2 rounded-lg bg-white/10 p-2 text-sm"
                  key={idx}
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-300" />
                  <span className="leading-tight">{suggestion}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Auto Notes */}
        {autoNotes.length > 0 && (
          <div className="rounded-xl bg-white/10 p-4 backdrop-blur-md">
            <div className="mb-3 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-blue-300" />
              <span className="font-medium text-sm">Auto Notes</span>
            </div>
            <div className="space-y-1.5 text-xs">
              {autoNotes.map((note, idx) => (
                <div className="flex items-start gap-2 leading-tight opacity-90" key={idx}>
                  <span className="flex-shrink-0 text-blue-300">•</span>
                  <span>{note}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Agent Info */}
        <div className="mt-6 flex items-center justify-between border-white/20 border-t pt-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 font-semibold text-sm">
              {agentName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <span className="text-sm">{agentName}</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <Brain className="h-3 w-3" />
            <span>AI Enhanced</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function UseCasesShowcase() {
  const [activeTab, setActiveTab] = useState("afterhours");

  const useCases = {
    afterhours: {
      title: "After-Hours Lead Capture",
      description: "Never miss a lead when your team is offline",
      icon: <Clock className="h-5 w-5" />,
      color: "from-blue-600 to-cyan-600",
      metrics: [
        {
          label: "Leads Captured",
          before: "45/week",
          after: "89/week",
          improvement: "+98% increase",
          icon: <Target className="h-5 w-5" />,
        },
        {
          label: "Response Time",
          before: "12 hrs",
          after: "< 1 min",
          improvement: "Instant response",
          icon: <Clock className="h-5 w-5" />,
        },
        {
          label: "Conversion Rate",
          before: "12%",
          after: "28%",
          improvement: "+133% improvement",
          icon: <TrendingUp className="h-5 w-5" />,
        },
      ],
      ui: (
        <MiniCallUI
          agentName="AI Agent - Night Shift"
          status="incoming"
          suggestions={[
            "Caller researched pricing page 3x",
            "Mention Q4 enterprise discount",
            "Reference similar customer success story",
          ]}
        />
      ),
    },
    training: {
      title: "AI Agent Training",
      description: "Transform juniors into top performers faster",
      icon: <Users2 className="h-5 w-5" />,
      color: "from-purple-600 to-pink-600",
      metrics: [
        {
          label: "Training Time",
          before: "6 weeks",
          after: "10 days",
          improvement: "83% faster onboarding",
          icon: <Clock className="h-5 w-5" />,
        },
        {
          label: "Agent Performance",
          before: "65%",
          after: "91%",
          improvement: "+40% improvement",
          icon: <TrendingUp className="h-5 w-5" />,
        },
        {
          label: "Quality Score",
          before: "7.2/10",
          after: "9.4/10",
          improvement: "+31% increase",
          icon: <CheckCircle2 className="h-5 w-5" />,
        },
      ],
      ui: (
        <MiniCallUI
          agentName="Mike Chen (Junior)"
          autoNotes={[
            "Customer interested in Enterprise plan",
            "Team size: 50-100 agents",
            "Current pain: Manual call logging",
          ]}
          callTime="02:15"
          status="active"
          suggestions={[
            "Great rapport building! ✓",
            "Try addressing budget concerns next",
            "Suggested script: 'Many clients see ROI in 60 days...'",
          ]}
        />
      ),
    },
    realtime: {
      title: "Real-Time Call Assistance",
      description: "Give agents superpowers during every call",
      icon: <Sparkles className="h-5 w-5" />,
      color: "from-green-600 to-emerald-600",
      metrics: [
        {
          label: "Close Rate",
          before: "23%",
          after: "41%",
          improvement: "+78% increase",
          icon: <TrendingUp className="h-5 w-5" />,
        },
        {
          label: "Note-Taking Time",
          before: "8 min",
          after: "0 min",
          improvement: "Fully automated",
          icon: <Clock className="h-5 w-5" />,
        },
        {
          label: "Customer Satisfaction",
          before: "3.8/5",
          after: "4.7/5",
          improvement: "+24% increase",
          icon: <CheckCircle2 className="h-5 w-5" />,
        },
      ],
      ui: (
        <MiniCallUI
          agentName="Lisa Martinez"
          autoNotes={[
            "Decision maker: Yes (VP of Sales)",
            "Timeline: Q1 2025 implementation",
            "Objection: Integration concerns - addressed ✓",
            "Next step: Send technical documentation",
          ]}
          callTime="05:32"
          status="active"
          suggestions={[
            "Customer mentioned 'budget constraints'",
            "Offer payment plan option",
            "Reference case study: TechCorp saved 40%",
          ]}
        />
      ),
    },
  };

  return (
    <div className="w-full">
      <Tabs className="w-full" onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="mx-auto mb-12 grid w-full max-w-2xl grid-cols-3">
          {Object.entries(useCases).map(([key, useCase]) => (
            <TabsTrigger className="flex items-center gap-2" key={key} value={key}>
              {useCase.icon}
              <span className="hidden sm:inline">{useCase.title}</span>
              <span className="sm:hidden">{useCase.title.split(" ")[0]}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(useCases).map(([key, useCase]) => (
          <TabsContent className="mt-0" key={key} value={key}>
            <div className="grid items-start gap-12 lg:grid-cols-2">
              {/* Left: Mini UI */}
              <div className="order-2 lg:order-1">
                <div className="sticky top-8">
                  <div className="mb-6">
                    <Badge
                      className={cn("mb-4 border-0 bg-gradient-to-r text-white", useCase.color)}
                    >
                      Live Demo
                    </Badge>
                    <h3 className="mb-2 font-bold text-2xl">{useCase.title}</h3>
                    <p className="text-muted-foreground">{useCase.description}</p>
                  </div>
                  {useCase.ui}
                </div>
              </div>

              {/* Right: Metrics */}
              <div className="order-1 space-y-4 lg:order-2">
                <div className="mb-6">
                  <h4 className="mb-2 flex items-center gap-2 font-semibold text-xl">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Key Metrics Impact
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    Real results from our customers using this feature
                  </p>
                </div>
                {useCase.metrics.map((metric, idx) => (
                  <Metric key={idx} {...metric} />
                ))}
                <Card className="mt-8 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <CheckCircle2 className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h5 className="mb-2 font-semibold">Why it works so well</h5>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {key === "afterhours" &&
                            "Our AI agents work 24/7, instantly responding to leads with personalized, context-aware conversations that feel completely human."}
                          {key === "training" &&
                            "Real-time coaching and performance feedback helps agents learn from every call, with AI identifying improvement areas and providing instant guidance."}
                          {key === "realtime" &&
                            "AI analyzes conversations in real-time, surfacing relevant talking points, detecting objections, and automatically documenting everything."}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
