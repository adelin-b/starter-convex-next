import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { Button } from "./button";
import { FormActions, SubmitButton } from "./submit-button";

// Async operation delay for simulated submissions (ms)
const SUBMISSION_DELAY = 1500;

/**
 * SubmitButton component with automatic loading states and success/error feedback.
 */
const meta: Meta<typeof SubmitButton> = {
  title: "domain/SubmitButton",
  component: SubmitButton,
  tags: ["autodocs"],
  argTypes: {
    loadingText: {
      control: "text",
      description: "Text to display during submission",
    },
    successText: {
      control: "text",
      description: "Text to display on success",
    },
    errorText: {
      control: "text",
      description: "Text to display on error",
    },
    feedbackDuration: {
      control: "number",
      description: "Duration (ms) to show success/error state",
    },
    showSuccessState: {
      control: "boolean",
      description: "Show success state after submission",
    },
    showErrorState: {
      control: "boolean",
      description: "Show error state on failure",
    },
  },
  parameters: {
    layout: "centered",
  },
  args: {
    loadingText: "Saving...",
    successText: "Success!",
    errorText: "Error",
    feedbackDuration: 2000,
    showSuccessState: true,
    showErrorState: true,
  },
} satisfies Meta<typeof SubmitButton>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Standalone submit button with manual state handling.
 */
export const Default: Story = {
  render: (args) => {
    const [result, setResult] = useState("");

    const handleSubmit = async () => {
      // Simulate async operation
      await new Promise((resolve) => setTimeout(resolve, SUBMISSION_DELAY));
      setResult("Form submitted successfully!");
    };

    return (
      <div className="flex flex-col items-center gap-4">
        <SubmitButton {...args} onSubmit={handleSubmit}>
          Submit
        </SubmitButton>
        {result && <p className="text-muted-foreground text-sm">{result}</p>}
      </div>
    );
  },
};

/**
 * Submit button with custom loading and success text.
 */
export const CustomText: Story = {
  render: (args) => {
    const handleSubmit = async () => {
      await new Promise((resolve) => setTimeout(resolve, SUBMISSION_DELAY));
    };

    return (
      <SubmitButton
        {...args}
        loadingText="Creating agent..."
        onSubmit={handleSubmit}
        successText="Agent created!"
      >
        Create Agent
      </SubmitButton>
    );
  },
};

/**
 * Submit button that simulates an error state.
 */
export const WithError: Story = {
  render: (args) => {
    const handleSubmit = async () => {
      await new Promise((resolve) => setTimeout(resolve, SUBMISSION_DELAY));
      throw new Error("Simulated error");
    };

    return (
      <SubmitButton {...args} errorText="Failed to save" onSubmit={handleSubmit} showErrorState>
        Save (will fail)
      </SubmitButton>
    );
  },
};

/**
 * Submit button integrated with react-hook-form.
 */
export const WithForm: Story = {
  render: () => {
    const form = useForm({
      defaultValues: {
        email: "",
        name: "",
      },
    });

    const onSubmit = async (data: unknown) => {
      console.log("Form data:", data);
      // Simulate async submission
      await new Promise((resolve) => setTimeout(resolve, SUBMISSION_DELAY));
    };

    return (
      <FormProvider {...form}>
        <form className="flex w-[300px] flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <label className="font-medium text-sm" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              {...form.register("name", { required: true })}
              className="w-full rounded-md border px-3 py-2"
              placeholder="Enter your name"
            />
          </div>

          <div className="space-y-2">
            <label className="font-medium text-sm" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              {...form.register("email", { required: true })}
              className="w-full rounded-md border px-3 py-2"
              placeholder="Enter your email"
            />
          </div>

          <SubmitButton loadingText="Submitting...">Submit Form</SubmitButton>
        </form>
      </FormProvider>
    );
  },
};

/**
 * FormActions component with multiple buttons.
 */
export const WithFormActions: Story = {
  render: () => {
    const [result, setResult] = useState("");

    const handleSubmit = async () => {
      await new Promise((resolve) => setTimeout(resolve, SUBMISSION_DELAY));
      setResult("Changes saved!");
    };

    return (
      <div className="flex flex-col items-center gap-4">
        <FormActions align="right">
          <Button onClick={() => setResult("canceled")} type="button" variant="outline">
            Cancel
          </Button>
          <SubmitButton loadingText="Saving..." onSubmit={handleSubmit} successText="Saved!">
            Save Changes
          </SubmitButton>
        </FormActions>
        {result && <p className="text-muted-foreground text-sm">{result}</p>}
      </div>
    );
  },
};

/**
 * Different alignment options for FormActions.
 */
export const FormActionsAlignment: Story = {
  render: () => (
    <div className="w-full max-w-md space-y-6">
      <div className="space-y-2">
        <p className="font-medium text-sm">Right Aligned (default)</p>
        <FormActions align="right">
          <Button variant="outline">Cancel</Button>
          <Button>Save</Button>
        </FormActions>
      </div>

      <div className="space-y-2">
        <p className="font-medium text-sm">Left Aligned</p>
        <FormActions align="left">
          <Button variant="outline">Cancel</Button>
          <Button>Save</Button>
        </FormActions>
      </div>

      <div className="space-y-2">
        <p className="font-medium text-sm">Center Aligned</p>
        <FormActions align="center">
          <Button variant="outline">Cancel</Button>
          <Button>Save</Button>
        </FormActions>
      </div>

      <div className="space-y-2">
        <p className="font-medium text-sm">Space Between</p>
        <FormActions align="between">
          <Button variant="destructive">Delete</Button>
          <div className="flex gap-2">
            <Button variant="outline">Cancel</Button>
            <Button>Save</Button>
          </div>
        </FormActions>
      </div>
    </div>
  ),
  parameters: {
    layout: "padded",
  },
};

/**
 * Submit button without success state feedback.
 */
export const NoSuccessState: Story = {
  render: (args) => {
    const handleSubmit = async () => {
      await new Promise((resolve) => setTimeout(resolve, SUBMISSION_DELAY));
    };

    return (
      <SubmitButton {...args} onSubmit={handleSubmit} showSuccessState={false}>
        Submit
      </SubmitButton>
    );
  },
};

/**
 * Submit button with different button variants.
 */
export const Variants: Story = {
  render: () => {
    const handleSubmit = async () => {
      await new Promise((resolve) => setTimeout(resolve, SUBMISSION_DELAY));
    };

    return (
      <div className="flex flex-col gap-4">
        <SubmitButton onSubmit={handleSubmit} variant="default">
          Default
        </SubmitButton>
        <SubmitButton onSubmit={handleSubmit} variant="destructive">
          Destructive
        </SubmitButton>
        <SubmitButton onSubmit={handleSubmit} variant="outline">
          Outline
        </SubmitButton>
        <SubmitButton onSubmit={handleSubmit} variant="secondary">
          Secondary
        </SubmitButton>
      </div>
    );
  },
};
