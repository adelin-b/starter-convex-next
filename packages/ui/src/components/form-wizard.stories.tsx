import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import {
  FormWizard,
  FormWizardContent,
  FormWizardNavigation,
  FormWizardPanel,
  FormWizardSteps,
} from "./form-wizard";
import { Input } from "./input";
import { Label } from "./label";

/**
 * FormWizard component for multi-step forms with step indicators and navigation.
 */
const meta: Meta<typeof FormWizard> = {
  title: "domain/FormWizard",
  component: FormWizard,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof FormWizard>;

export default meta;

type Story = StoryObj<typeof meta>;

const steps = [
  {
    id: "basic",
    title: "Basic Info",
    description: "Enter your basic information",
  },
  {
    id: "config",
    title: "Configuration",
    description: "Configure your settings",
  },
  {
    id: "review",
    title: "Review",
    description: "Review and confirm",
  },
];

/**
 * Default form wizard with three steps.
 */
export const Default: Story = {
  render: () => {
    const handleFinish = () => {
      console.log("Wizard completed!");
    };

    return (
      <div className="mx-auto max-w-4xl">
        <FormWizard steps={steps}>
          <FormWizardSteps />
          <FormWizardContent>
            <FormWizardPanel stepId="basic">
              <div className="space-y-4">
                <h2 className="font-bold text-2xl">Basic Information</h2>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="Enter your name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" placeholder="your@email.com" type="email" />
                </div>
              </div>
            </FormWizardPanel>

            <FormWizardPanel stepId="config">
              <div className="space-y-4">
                <h2 className="font-bold text-2xl">Configuration</h2>
                <div className="space-y-2">
                  <Label htmlFor="company">Company Name</Label>
                  <Input id="company" placeholder="Your company" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" placeholder="Your role" />
                </div>
              </div>
            </FormWizardPanel>

            <FormWizardPanel stepId="review">
              <div className="space-y-4">
                <h2 className="font-bold text-2xl">Review</h2>
                <p className="text-muted-foreground">
                  Please review your information before submitting.
                </p>
                <div className="space-y-2 rounded-lg border p-4">
                  <div>
                    <strong>Name:</strong> John Doe
                  </div>
                  <div>
                    <strong>Email:</strong> john@example.com
                  </div>
                  <div>
                    <strong>Company:</strong> Acme Inc
                  </div>
                  <div>
                    <strong>Role:</strong> Developer
                  </div>
                </div>
              </div>
            </FormWizardPanel>
          </FormWizardContent>
          <FormWizardNavigation onFinish={handleFinish} />
        </FormWizard>
      </div>
    );
  },
};

/**
 * Controlled wizard with external state management.
 */
export const Controlled: Story = {
  render: () => {
    const [currentStep, setCurrentStep] = useState(0);

    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <p className="text-muted-foreground text-sm">
          Current step: {currentStep + 1} of {steps.length}
        </p>
        <FormWizard currentStep={currentStep} onStepChange={setCurrentStep} steps={steps}>
          <FormWizardSteps />
          <FormWizardContent>
            <FormWizardPanel stepId="basic">
              <h3 className="font-semibold text-xl">Step 1 Content</h3>
            </FormWizardPanel>
            <FormWizardPanel stepId="config">
              <h3 className="font-semibold text-xl">Step 2 Content</h3>
            </FormWizardPanel>
            <FormWizardPanel stepId="review">
              <h3 className="font-semibold text-xl">Step 3 Content</h3>
            </FormWizardPanel>
          </FormWizardContent>
          <FormWizardNavigation />
        </FormWizard>
      </div>
    );
  },
};

/**
 * Wizard with optional steps.
 */
export const WithOptionalSteps: Story = {
  render: () => {
    const stepsWithOptional = [
      { id: "required1", title: "Account", description: "Create account" },
      {
        id: "optional",
        title: "Profile",
        description: "Add profile details",
        optional: true,
      },
      { id: "required2", title: "Finish", description: "Complete setup" },
    ];

    return (
      <div className="mx-auto max-w-4xl">
        <FormWizard steps={stepsWithOptional}>
          <FormWizardSteps />
          <FormWizardContent>
            <FormWizardPanel stepId="required1">
              <h3 className="font-semibold text-xl">Account Setup (Required)</h3>
            </FormWizardPanel>
            <FormWizardPanel stepId="optional">
              <h3 className="font-semibold text-xl">Profile Details (Optional)</h3>
            </FormWizardPanel>
            <FormWizardPanel stepId="required2">
              <h3 className="font-semibold text-xl">Complete Setup</h3>
            </FormWizardPanel>
          </FormWizardContent>
          <FormWizardNavigation finishText="Complete" />
        </FormWizard>
      </div>
    );
  },
};

/**
 * Five-step wizard for complex flows.
 */
export const FiveSteps: Story = {
  render: () => {
    const manySteps = [
      { id: "step1", title: "Welcome" },
      { id: "step2", title: "Account" },
      { id: "step3", title: "Profile" },
      { id: "step4", title: "Preferences" },
      { id: "step5", title: "Done" },
    ];

    return (
      <div className="mx-auto max-w-4xl">
        <FormWizard steps={manySteps}>
          <FormWizardSteps />
          <FormWizardContent>
            {manySteps.map((step) => (
              <FormWizardPanel key={step.id} stepId={step.id}>
                <h3 className="font-semibold text-xl">{step.title}</h3>
              </FormWizardPanel>
            ))}
          </FormWizardContent>
          <FormWizardNavigation />
        </FormWizard>
      </div>
    );
  },
};
