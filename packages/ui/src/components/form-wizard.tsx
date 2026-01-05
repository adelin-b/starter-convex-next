"use client";

import { cn } from "@starter-saas/ui/utils";
import { Check } from "lucide-react";
import * as React from "react";
import { Button } from "./button";
import { Separator } from "./separator";

type FormWizardStep = {
  id: string;
  title: string;
  description?: string;
  optional?: boolean;
};

type FormWizardContextValue = {
  currentStep: number;
  totalSteps: number;
  steps: FormWizardStep[];
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
  setCanGoNext: (can: boolean) => void;
};

const FormWizardContext = React.createContext<FormWizardContextValue | null>(null);

export function useFormWizard() {
  const context = React.useContext(FormWizardContext);
  if (!context) {
    throw new Error("useFormWizard must be used within FormWizard");
  }
  return context;
}

type FormWizardProps = {
  steps: FormWizardStep[];
  currentStep?: number;
  onStepChange?: (step: number) => void;
  children: React.ReactNode;
};

/**
 * FormWizard component for multi-step forms.
 *
 * @example
 * const steps = [
 *   { id: "basic", title: "Basic Info", description: "Enter your details" },
 *   { id: "config", title: "Configuration" },
 *   { id: "review", title: "Review" },
 * ];
 *
 * <FormWizard steps={steps}>
 *   <FormWizardSteps />
 *   <FormWizardContent>
 *     <FormWizardPanel stepId="basic">
 *       <FormField ... />
 *     </FormWizardPanel>
 *     <FormWizardPanel stepId="config">
 *       <FormField ... />
 *     </FormWizardPanel>
 *     <FormWizardPanel stepId="review">
 *       <p>Review your information</p>
 *     </FormWizardPanel>
 *   </FormWizardContent>
 *   <FormWizardNavigation />
 * </FormWizard>
 */
export function FormWizard({
  steps,
  currentStep: controlledStep,
  onStepChange,
  children,
}: FormWizardProps) {
  const [uncontrolledStep, setUncontrolledStep] = React.useState(0);
  const [canGoNext, setCanGoNext] = React.useState(true);

  const currentStep = controlledStep ?? uncontrolledStep;
  const isControlled = controlledStep !== undefined;

  const setCurrentStep = React.useCallback(
    (step: number) => {
      if (step < 0 || step >= steps.length) {
        return;
      }

      if (isControlled) {
        onStepChange?.(step);
      } else {
        setUncontrolledStep(step);
        onStepChange?.(step);
      }
    },
    [isControlled, onStepChange, steps.length],
  );

  const goToStep = React.useCallback(
    (step: number) => {
      setCurrentStep(step);
    },
    [setCurrentStep],
  );

  const nextStep = React.useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, setCurrentStep, steps.length]);

  const prevStep = React.useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep, setCurrentStep]);

  const value: FormWizardContextValue = {
    currentStep,
    totalSteps: steps.length,
    steps,
    goToStep,
    nextStep,
    prevStep,
    canGoNext,
    canGoPrev: currentStep > 0,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === steps.length - 1,
    setCanGoNext,
  };

  return (
    <FormWizardContext.Provider value={value}>
      <div className="space-y-8" data-slot="form-wizard">
        {children}
      </div>
    </FormWizardContext.Provider>
  );
}

/**
 * FormWizardSteps - Visual step indicator
 */
export function FormWizardSteps({
  className,
  optionalLabel = "(Optional)",
}: {
  className?: string;
  optionalLabel?: string;
}) {
  const { steps, currentStep, goToStep } = useFormWizard();

  return (
    <nav aria-label="Progress" className={className} data-slot="form-wizard-steps">
      <ol className="flex items-center">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isClickable = index <= currentStep;

          return (
            <li
              className={cn("flex items-center", index !== steps.length - 1 && "flex-1")}
              key={step.id}
            >
              <button
                className={cn(
                  "group flex items-center gap-2",
                  !isClickable && "cursor-not-allowed",
                )}
                disabled={!isClickable}
                onClick={() => isClickable && goToStep(index)}
                type="button"
              >
                <span
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-full border-2 font-medium text-sm transition-colors",
                    isCompleted && "border-primary bg-primary text-primary-foreground",
                    isCurrent && "border-primary text-primary",
                    !(isCompleted || isCurrent) &&
                      "border-muted-foreground/25 text-muted-foreground",
                  )}
                >
                  {isCompleted ? <Check className="size-5" /> : <span>{index + 1}</span>}
                </span>
                <div className="text-left">
                  <p
                    className={cn(
                      "font-medium text-sm transition-colors",
                      isCurrent && "text-foreground",
                      !isCurrent && "text-muted-foreground",
                    )}
                  >
                    {step.title}
                    {step.optional && <span className="ml-2 text-xs">{optionalLabel}</span>}
                  </p>
                  {step.description && (
                    <p className="text-muted-foreground text-xs">{step.description}</p>
                  )}
                </div>
              </button>
              {index !== steps.length - 1 && (
                <Separator className={cn("mx-4 flex-1", index < currentStep && "bg-primary")} />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * FormWizardContent - Container for wizard panels
 */
export function FormWizardContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-h-[400px]", className)} data-slot="form-wizard-content">
      {children}
    </div>
  );
}

/**
 * FormWizardPanel - Individual step content
 */
type FormWizardPanelProps = {
  stepId: string;
  children: React.ReactNode;
  className?: string;
};

export function FormWizardPanel({ stepId, children, className }: FormWizardPanelProps) {
  const { steps, currentStep } = useFormWizard();
  const stepIndex = steps.findIndex((s) => s.id === stepId);
  const isActive = stepIndex === currentStep;

  if (!isActive) {
    return null;
  }

  return (
    <div className={cn("space-y-6", className)} data-slot="form-wizard-panel" data-step-id={stepId}>
      {children}
    </div>
  );
}

/**
 * FormWizardNavigation - Previous/Next buttons
 */
type FormWizardNavigationProps = {
  className?: string;
  previousText?: string;
  nextText?: string;
  finishText?: string;
  onFinish?: () => void | Promise<void>;
};

export function FormWizardNavigation({
  className,
  previousText = "Previous",
  nextText = "Next",
  finishText = "Finish",
  onFinish,
}: FormWizardNavigationProps) {
  const { canGoPrev, canGoNext, isLastStep, prevStep, nextStep } = useFormWizard();

  return (
    <div
      className={cn("flex items-center justify-between", className)}
      data-slot="form-wizard-navigation"
    >
      <Button disabled={!canGoPrev} onClick={prevStep} type="button" variant="outline">
        {previousText}
      </Button>
      <Button
        disabled={!(canGoNext || isLastStep)}
        onClick={isLastStep ? onFinish : nextStep}
        type={isLastStep ? "submit" : "button"}
      >
        {isLastStep ? finishText : nextText}
      </Button>
    </div>
  );
}
