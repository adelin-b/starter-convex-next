"use client";

import type { Id } from "@starter-saas/backend/convex/_generated/dataModel";
import { Badge } from "@starter-saas/ui/badge";
import { Button } from "@starter-saas/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@starter-saas/ui/card";
import { Progress } from "@starter-saas/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@starter-saas/ui/tooltip";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  ClipboardCopy,
  Lightbulb,
  MessageSquare,
  Phone,
  Play,
  SkipForward,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import { useCallback, useState } from "react";

// UI constants
const PERCENTAGE_MULTIPLIER = 100;
const COPY_FEEDBACK_DELAY_MS = 2000;
const MAX_DISPLAYED_INSIGHTS = 3;
const MAX_DISPLAYED_TRIGGERS = 4;

type ScriptPhase = "opening" | "discovery" | "presentation" | "objection" | "closing";

type VehicleInsight = {
  _id: Id<"vehicleInsights">;
  category: string;
  title: string;
  content: string;
  tags?: string[];
  vehicleTypes?: string[];
  priceRange?: string;
};

type ProspectBrief = {
  prospect: {
    _id: string;
    firstName?: string;
    lastName?: string;
    company?: string;
    status: string;
  };
  prepNotes?: {
    currentPhase?: ScriptPhase;
    completedPhases?: string[];
    detectedObjections?: string[];
    extractedInfo?: {
      vehicleType?: string;
      budget?: string;
      needs?: string[];
    };
  } | null;
  script?: {
    name: string;
    openingScript?: string;
    mainScript?: string;
    closingScript?: string;
  } | null;
};

const SCRIPT_PHASES: {
  id: ScriptPhase;
  title: string;
  icon: typeof Phone;
  description: string;
  defaultScript: string;
  tips: string[];
  nextPhaseTriggers: string[];
}[] = [
  {
    id: "opening",
    title: "Opening",
    icon: Phone,
    description: "Introduce yourself and build initial rapport",
    defaultScript:
      "Hi [Name], this is [Your Name] from [Dealership]. I'm reaching out because we have some great options that might fit what you're looking for. Do you have a moment to chat?",
    tips: [
      "Smile - they can hear it in your voice",
      "Mention their name early",
      "Keep it brief and respectful of their time",
    ],
    nextPhaseTriggers: ["yes", "sure", "ok", "go ahead", "tell me"],
  },
  {
    id: "discovery",
    title: "Discovery",
    icon: Target,
    description: "Understand their needs, preferences, and situation",
    defaultScript:
      "Great! To make sure I can help you find the perfect fit, could you tell me a bit about what you're looking for? What type of vehicle interests you most?",
    tips: [
      "Ask open-ended questions",
      "Listen for budget hints",
      "Note family size for vehicle recommendations",
      "Understand timeline urgency",
    ],
    nextPhaseTriggers: ["suv", "sedan", "truck", "budget", "family", "commute", "looking for"],
  },
  {
    id: "presentation",
    title: "Presentation",
    icon: Sparkles,
    description: "Present recommendations based on their needs",
    defaultScript:
      "Based on what you've told me, I'd recommend the [Vehicle]. It's perfect for [their needs] and we have excellent options in your price range.",
    tips: [
      "Match vehicle features to expressed needs",
      "Mention current inventory availability",
      "Highlight competitive advantages",
      'Use social proof - "one of our best sellers"',
    ],
    nextPhaseTriggers: ["sounds good", "interested", "tell me more", "price", "cost"],
  },
  {
    id: "objection",
    title: "Objection Handling",
    icon: AlertTriangle,
    description: "Address concerns and hesitations",
    defaultScript: "I completely understand. Let me address that...",
    tips: [
      "Acknowledge their concern first",
      "Don't be defensive",
      "Turn objections into opportunities",
      "Use specific numbers when possible",
    ],
    nextPhaseTriggers: [
      "expensive",
      "think about it",
      "other dealer",
      "not sure",
      "need to discuss",
    ],
  },
  {
    id: "closing",
    title: "Closing",
    icon: Check,
    description: "Secure next steps and commitment",
    defaultScript:
      "I'd love to get you in for a test drive so you can experience it yourself. Would Tuesday or Thursday work better for you?",
    tips: [
      "Offer two specific time options",
      "Create gentle urgency with inventory",
      "Confirm contact details",
      "Set clear next steps",
    ],
    nextPhaseTriggers: ["yes", "tuesday", "thursday", "schedule", "book", "appointment"],
  },
];

const OBJECTION_KEYWORDS = {
  price: ["expensive", "too much", "can't afford", "budget", "cheaper", "cost"],
  timing: ["think about it", "not ready", "later", "need time", "discuss with"],
  competitor: ["other dealer", "seen elsewhere", "better deal", "competitor"],
  trust: ["not sure", "don't know", "reviews", "reliable"],
  trade_in: ["my old car", "trade in", "current vehicle", "what about my"],
};

type PhaseCardProps = {
  phase: (typeof SCRIPT_PHASES)[number];
  status: "completed" | "current" | "pending";
  isExpanded: boolean;
  onToggleExpand: () => void;
  prospectName: string;
  copiedText: string | null;
  onCopyScript: (text: string) => void;
  relevantInsights: VehicleInsight[];
  objectionHandlers: VehicleInsight[];
  detectedObjection: string | null;
  onDetectObjection: (type: string) => void;
  onCompletePhase: () => void;
  onSkipPhase: () => void;
  getCardClassName: (status: string) => string;
  getIconClassName: (status: string) => string;
};

function PhaseCard({
  phase,
  status,
  isExpanded,
  onToggleExpand,
  prospectName,
  copiedText,
  onCopyScript,
  relevantInsights,
  objectionHandlers,
  detectedObjection,
  onDetectObjection,
  onCompletePhase,
  onSkipPhase,
  getCardClassName,
  getIconClassName,
}: PhaseCardProps) {
  const Icon = phase.icon;
  const scriptWithName = phase.defaultScript.replace("[Name]", prospectName);

  // Get relevant handlers for this objection
  const relevantHandlers =
    phase.id === "objection" && detectedObjection
      ? objectionHandlers.filter(
          (h) =>
            h.title.toLowerCase().includes(detectedObjection.toLowerCase()) ||
            h.tags?.some((t) => t.toLowerCase().includes(detectedObjection.toLowerCase())),
        )
      : [];

  return (
    <Card className={`transition-all ${getCardClassName(status)}`}>
      <CardHeader className="cursor-pointer pb-2" onClick={onToggleExpand}>
        <PhaseCardHeader
          getIconClassName={getIconClassName}
          Icon={Icon}
          isExpanded={isExpanded}
          phase={phase}
          status={status}
        />
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          <PhaseScriptSection
            copiedText={copiedText}
            onCopyScript={onCopyScript}
            scriptWithName={scriptWithName}
          />

          <PhaseTipsSection tips={phase.tips} />

          {phase.id === "presentation" && (
            <PresentationInsightsSection insights={relevantInsights} />
          )}

          {phase.id === "objection" && (
            <ObjectionHandlingSection
              detectedObjection={detectedObjection}
              objectionHandlers={objectionHandlers}
              onDetectObjection={onDetectObjection}
              relevantHandlers={relevantHandlers}
            />
          )}

          {status === "current" && (
            <div className="flex items-center gap-2 pt-2">
              <Button className="flex-1" onClick={onCompletePhase} variant="default">
                <Check className="mr-2 h-4 w-4" />
                Complete & Continue
              </Button>
              <Button onClick={onSkipPhase} variant="outline">
                <SkipForward className="mr-2 h-4 w-4" />
                Skip
              </Button>
            </div>
          )}

          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <ArrowRight className="h-3 w-3" />
            <span>
              Listen for: {phase.nextPhaseTriggers.slice(0, MAX_DISPLAYED_TRIGGERS).join(", ")}...
            </span>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function PhaseCardHeader({
  phase,
  status,
  Icon,
  isExpanded,
  getIconClassName,
}: {
  phase: (typeof SCRIPT_PHASES)[number];
  status: string;
  Icon: typeof Phone;
  isExpanded: boolean;
  getIconClassName: (status: string) => string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full ${getIconClassName(status)}`}
        >
          {status === "completed" ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
        </div>
        <div>
          <CardTitle className="text-base">{phase.title}</CardTitle>
          <p className="text-muted-foreground text-xs">{phase.description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {status === "current" && <Badge className="bg-violet-500">Current</Badge>}
        {status === "completed" && (
          <Badge className="bg-green-100 text-green-700" variant="secondary">
            Done
          </Badge>
        )}
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
    </div>
  );
}

function PhaseScriptSection({
  scriptWithName,
  copiedText,
  onCopyScript,
}: {
  scriptWithName: string;
  copiedText: string | null;
  onCopyScript: (text: string) => void;
}) {
  return (
    <div className="relative rounded-lg border bg-muted/30 p-4">
      <p className="pr-10 text-sm leading-relaxed">{scriptWithName}</p>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="absolute top-2 right-2"
              onClick={() => onCopyScript(scriptWithName)}
              size="icon"
              variant="ghost"
            >
              <ClipboardCopy
                className={`h-4 w-4 ${copiedText === scriptWithName ? "text-green-500" : ""}`}
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {copiedText === scriptWithName ? "Copied!" : "Copy script"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

function PhaseTipsSection({ tips }: { tips: string[] }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 font-medium text-sm">
        <Lightbulb className="h-4 w-4 text-amber-500" />
        Tips
      </div>
      <ul className="space-y-1">
        {tips.map((tip) => (
          <li className="flex items-start gap-2 text-muted-foreground text-sm" key={tip}>
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-400" />
            {tip}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PresentationInsightsSection({ insights }: { insights: VehicleInsight[] }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 font-medium text-sm">
        <Zap className="h-4 w-4 text-blue-500" />
        Selling Points
      </div>
      <div className="grid gap-2">
        {insights.slice(0, MAX_DISPLAYED_INSIGHTS).map((insight) => (
          <div
            className="rounded-md border bg-blue-50/50 p-2 dark:bg-blue-950/20"
            key={insight._id}
          >
            <p className="font-medium text-sm">{insight.title}</p>
            <p className="text-muted-foreground text-xs">{insight.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ObjectionHandlingSection({
  detectedObjection,
  onDetectObjection,
  relevantHandlers,
  objectionHandlers,
}: {
  detectedObjection: string | null;
  onDetectObjection: (type: string) => void;
  relevantHandlers: VehicleInsight[];
  objectionHandlers: VehicleInsight[];
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 font-medium text-sm">
        <AlertTriangle className="h-4 w-4 text-orange-500" />
        Common Objections
      </div>
      <div className="flex flex-wrap gap-2">
        {Object.keys(OBJECTION_KEYWORDS).map((type) => (
          <Button
            key={type}
            onClick={() => onDetectObjection(type)}
            size="sm"
            variant={detectedObjection === type ? "default" : "outline"}
          >
            {type.replace("_", " ")}
          </Button>
        ))}
      </div>

      {relevantHandlers.length > 0 && (
        <div className="mt-3 space-y-2">
          <p className="font-medium text-sm">Suggested Response:</p>
          {relevantHandlers.map((handler) => (
            <div
              className="rounded-md border bg-orange-50 p-3 dark:bg-orange-950/20"
              key={handler._id}
            >
              <p className="font-medium text-sm">{handler.title}</p>
              <p className="text-sm">{handler.content}</p>
            </div>
          ))}
        </div>
      )}

      {objectionHandlers.length > 0 && !detectedObjection && (
        <div className="mt-3 space-y-2">
          {objectionHandlers.slice(0, MAX_DISPLAYED_INSIGHTS).map((handler) => (
            <div className="rounded-md border p-2" key={handler._id}>
              <p className="font-medium text-sm">{handler.title}</p>
              <p className="text-muted-foreground text-xs">{handler.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function DynamicScript({
  prospectId: _prospectId,
  brief,
  insights,
}: {
  prospectId: Id<"prospects">;
  brief: ProspectBrief;
  insights: VehicleInsight[];
}) {
  const [currentPhase, setCurrentPhase] = useState<ScriptPhase>(
    brief.prepNotes?.currentPhase || "opening",
  );
  const [completedPhases, setCompletedPhases] = useState<ScriptPhase[]>(
    (brief.prepNotes?.completedPhases as ScriptPhase[]) || [],
  );
  const [detectedObjection, setDetectedObjection] = useState<string | null>(null);
  const [expandedPhase, setExpandedPhase] = useState<ScriptPhase | null>(currentPhase);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Get relevant objection handlers
  const objectionHandlers = insights.filter((i) => i.category === "objection_handlers");

  // Get relevant insights based on context
  const getRelevantInsights = useCallback(() => {
    const vehicleType = brief.prepNotes?.extractedInfo?.vehicleType;
    return insights.filter(
      (i) =>
        i.category !== "objection_handlers" &&
        (!i.vehicleTypes?.length || (vehicleType && i.vehicleTypes.includes(vehicleType))),
    );
  }, [insights, brief.prepNotes?.extractedInfo?.vehicleType]);

  const _currentPhaseData = SCRIPT_PHASES.find((p) => p.id === currentPhase);
  const currentPhaseIndex = SCRIPT_PHASES.findIndex((p) => p.id === currentPhase);
  const progressPercent = ((currentPhaseIndex + 1) / SCRIPT_PHASES.length) * PERCENTAGE_MULTIPLIER;

  const getCardClassName = (status: string) => {
    if (status === "current") {
      return "border-violet-400 ring-2 ring-violet-200 dark:ring-violet-900";
    }
    if (status === "completed") {
      return "border-green-300 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20";
    }
    return "opacity-70";
  };

  const getIconClassName = (status: string) => {
    if (status === "completed") {
      return "bg-green-500 text-white";
    }
    if (status === "current") {
      return "bg-violet-500 text-white";
    }
    return "bg-muted text-muted-foreground";
  };

  const handleCopyScript = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), COPY_FEEDBACK_DELAY_MS);
  };

  const handleCompletePhase = () => {
    if (!completedPhases.includes(currentPhase)) {
      setCompletedPhases([...completedPhases, currentPhase]);
    }
    // Move to next phase
    const nextIndex = currentPhaseIndex + 1;
    if (nextIndex < SCRIPT_PHASES.length) {
      const nextPhase = SCRIPT_PHASES[nextIndex].id;
      setCurrentPhase(nextPhase);
      setExpandedPhase(nextPhase);
    }
  };

  const handleSkipPhase = () => {
    const nextIndex = currentPhaseIndex + 1;
    if (nextIndex < SCRIPT_PHASES.length) {
      const nextPhase = SCRIPT_PHASES[nextIndex].id;
      setCurrentPhase(nextPhase);
      setExpandedPhase(nextPhase);
    }
  };

  const handleDetectObjection = (objectionType: string) => {
    setDetectedObjection(objectionType);
    setCurrentPhase("objection");
    setExpandedPhase("objection");
  };

  const getPhaseStatus = (phaseId: ScriptPhase) => {
    if (completedPhases.includes(phaseId)) {
      return "completed";
    }
    if (phaseId === currentPhase) {
      return "current";
    }
    return "pending";
  };

  const prospectName = brief.prospect.firstName || "there";

  return (
    <div className="space-y-4">
      {/* Script Header */}
      <Card className="border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50 dark:border-violet-900 dark:from-violet-950/30 dark:to-purple-950/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-violet-600" />
              Dynamic Call Script
            </CardTitle>
            <Badge className="text-violet-600" variant="outline">
              {brief.script?.name || "Standard Script"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">
                {currentPhaseIndex + 1} / {SCRIPT_PHASES.length} phases
              </span>
            </div>
            <Progress className="h-2" value={progressPercent} />
          </div>
        </CardContent>
      </Card>

      {/* Objection Alert */}
      {detectedObjection && (
        <Card className="border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
          <CardContent className="flex items-center gap-3 py-3">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <div className="flex-1">
              <p className="font-medium text-sm">Objection Detected: {detectedObjection}</p>
              <p className="text-muted-foreground text-xs">
                Script adjusted to handle this objection
              </p>
            </div>
            <Button onClick={() => setDetectedObjection(null)} size="sm" variant="ghost">
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Script Phases */}
      <div className="space-y-3">
        {SCRIPT_PHASES.map((phase) => (
          <PhaseCard
            copiedText={copiedText}
            detectedObjection={detectedObjection}
            getCardClassName={getCardClassName}
            getIconClassName={getIconClassName}
            isExpanded={expandedPhase === phase.id}
            key={phase.id}
            objectionHandlers={objectionHandlers}
            onCompletePhase={handleCompletePhase}
            onCopyScript={handleCopyScript}
            onDetectObjection={handleDetectObjection}
            onSkipPhase={handleSkipPhase}
            onToggleExpand={() => setExpandedPhase(expandedPhase === phase.id ? null : phase.id)}
            phase={phase}
            prospectName={prospectName}
            relevantInsights={getRelevantInsights()}
            status={getPhaseStatus(phase.id)}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardContent className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Play className="h-4 w-4" />
            <span>Script controls</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setCurrentPhase("opening");
                setCompletedPhases([]);
                setExpandedPhase("opening");
                setDetectedObjection(null);
              }}
              size="sm"
              variant="outline"
            >
              Reset Script
            </Button>
            <Button
              disabled={currentPhaseIndex >= SCRIPT_PHASES.length - 1}
              onClick={handleCompletePhase}
              size="sm"
              variant="default"
            >
              Next Phase
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
