import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  FormWizard,
  FormWizardContent,
  FormWizardNavigation,
  FormWizardPanel,
  FormWizardSteps,
  useFormWizard,
} from "../components/form-wizard";

const testSteps = [
  { id: "step1", title: "Step 1", description: "First step" },
  { id: "step2", title: "Step 2", description: "Second step" },
  { id: "step3", title: "Step 3", optional: true },
];

describe("FormWizard", () => {
  it("renders with data-slot attribute", () => {
    render(
      <FormWizard steps={testSteps}>
        <div>Content</div>
      </FormWizard>,
    );

    expect(screen.getByText("Content").parentElement).toHaveAttribute("data-slot", "form-wizard");
  });

  it("starts at first step by default", () => {
    render(
      <FormWizard steps={testSteps}>
        <FormWizardPanel stepId="step1">Step 1 Content</FormWizardPanel>
        <FormWizardPanel stepId="step2">Step 2 Content</FormWizardPanel>
      </FormWizard>,
    );

    expect(screen.getByText("Step 1 Content")).toBeInTheDocument();
    expect(screen.queryByText("Step 2 Content")).not.toBeInTheDocument();
  });

  it("respects controlled currentStep prop", () => {
    render(
      <FormWizard currentStep={1} steps={testSteps}>
        <FormWizardPanel stepId="step1">Step 1 Content</FormWizardPanel>
        <FormWizardPanel stepId="step2">Step 2 Content</FormWizardPanel>
      </FormWizard>,
    );

    expect(screen.queryByText("Step 1 Content")).not.toBeInTheDocument();
    expect(screen.getByText("Step 2 Content")).toBeInTheDocument();
  });

  it("calls onStepChange when step changes", async () => {
    const user = userEvent.setup();
    const handleStepChange = vi.fn();

    render(
      <FormWizard onStepChange={handleStepChange} steps={testSteps}>
        <FormWizardNavigation />
      </FormWizard>,
    );

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(handleStepChange).toHaveBeenCalledWith(1);
  });
});

describe("FormWizardSteps", () => {
  it("renders all step indicators", () => {
    render(
      <FormWizard steps={testSteps}>
        <FormWizardSteps />
      </FormWizard>,
    );

    expect(screen.getByText("Step 1")).toBeInTheDocument();
    expect(screen.getByText("Step 2")).toBeInTheDocument();
    expect(screen.getByText("Step 3")).toBeInTheDocument();
  });

  it("shows step descriptions", () => {
    render(
      <FormWizard steps={testSteps}>
        <FormWizardSteps />
      </FormWizard>,
    );

    expect(screen.getByText("First step")).toBeInTheDocument();
    expect(screen.getByText("Second step")).toBeInTheDocument();
  });

  it("shows optional label for optional steps", () => {
    render(
      <FormWizard steps={testSteps}>
        <FormWizardSteps optionalLabel="(Optional)" />
      </FormWizard>,
    );

    expect(screen.getByText("(Optional)")).toBeInTheDocument();
  });

  it("disables future steps", async () => {
    const user = userEvent.setup();
    const handleStepChange = vi.fn();

    render(
      <FormWizard onStepChange={handleStepChange} steps={testSteps}>
        <FormWizardSteps />
      </FormWizard>,
    );

    // Step 2 button should be disabled since we're on step 1
    const step2Button = screen.getAllByRole("button")[1];
    await user.click(step2Button);

    // Should not have changed step
    expect(handleStepChange).not.toHaveBeenCalled();
  });

  it("allows clicking completed steps", async () => {
    const user = userEvent.setup();
    const handleStepChange = vi.fn();

    render(
      <FormWizard currentStep={2} onStepChange={handleStepChange} steps={testSteps}>
        <FormWizardSteps />
      </FormWizard>,
    );

    // Step 1 should be clickable (it's completed)
    const step1Button = screen.getAllByRole("button")[0];
    await user.click(step1Button);

    expect(handleStepChange).toHaveBeenCalledWith(0);
  });

  it("shows check icon for completed steps", () => {
    const { container } = render(
      <FormWizard currentStep={2} steps={testSteps}>
        <FormWizardSteps />
      </FormWizard>,
    );

    // Check icons should be present for completed steps
    const svgElements = container.querySelectorAll("svg");
    expect(svgElements.length).toBeGreaterThan(0);
  });
});

describe("FormWizardContent", () => {
  it("renders with data-slot attribute", () => {
    render(
      <FormWizard steps={testSteps}>
        <FormWizardContent>Content here</FormWizardContent>
      </FormWizard>,
    );

    expect(screen.getByText("Content here")).toHaveAttribute("data-slot", "form-wizard-content");
  });

  it("applies custom className", () => {
    render(
      <FormWizard steps={testSteps}>
        <FormWizardContent className="custom-content">Content</FormWizardContent>
      </FormWizard>,
    );

    expect(screen.getByText("Content")).toHaveClass("custom-content");
  });
});

describe("FormWizardPanel", () => {
  it("renders only active panel", () => {
    render(
      <FormWizard steps={testSteps}>
        <FormWizardContent>
          <FormWizardPanel stepId="step1">Panel 1</FormWizardPanel>
          <FormWizardPanel stepId="step2">Panel 2</FormWizardPanel>
        </FormWizardContent>
      </FormWizard>,
    );

    expect(screen.getByText("Panel 1")).toBeInTheDocument();
    expect(screen.queryByText("Panel 2")).not.toBeInTheDocument();
  });

  it("has data-step-id attribute", () => {
    render(
      <FormWizard steps={testSteps}>
        <FormWizardPanel stepId="step1">Content</FormWizardPanel>
      </FormWizard>,
    );

    expect(screen.getByText("Content")).toHaveAttribute("data-step-id", "step1");
  });
});

describe("FormWizardNavigation", () => {
  it("renders Previous and Next buttons", () => {
    render(
      <FormWizard steps={testSteps}>
        <FormWizardNavigation />
      </FormWizard>,
    );

    expect(screen.getByRole("button", { name: "Previous" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
  });

  it("disables Previous on first step", () => {
    render(
      <FormWizard steps={testSteps}>
        <FormWizardNavigation />
      </FormWizard>,
    );

    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next" })).not.toBeDisabled();
  });

  it("enables Previous after first step", () => {
    render(
      <FormWizard currentStep={1} steps={testSteps}>
        <FormWizardNavigation />
      </FormWizard>,
    );

    expect(screen.getByRole("button", { name: "Previous" })).not.toBeDisabled();
  });

  it("navigates forward on Next click", async () => {
    const user = userEvent.setup();

    render(
      <FormWizard steps={testSteps}>
        <FormWizardPanel stepId="step1">Step 1</FormWizardPanel>
        <FormWizardPanel stepId="step2">Step 2</FormWizardPanel>
        <FormWizardNavigation />
      </FormWizard>,
    );

    expect(screen.getByText("Step 1")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.queryByText("Step 1")).not.toBeInTheDocument();
    expect(screen.getByText("Step 2")).toBeInTheDocument();
  });

  it("navigates backward on Previous click", async () => {
    const user = userEvent.setup();

    // Use uncontrolled mode for navigation testing
    render(
      <FormWizard steps={testSteps}>
        <FormWizardPanel stepId="step1">Panel 1</FormWizardPanel>
        <FormWizardPanel stepId="step2">Panel 2</FormWizardPanel>
        <FormWizardNavigation />
      </FormWizard>,
    );

    // Start at step 1
    expect(screen.getByText("Panel 1")).toBeInTheDocument();

    // Go to step 2
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Panel 2")).toBeInTheDocument();

    // Go back to step 1
    await user.click(screen.getByRole("button", { name: "Previous" }));
    expect(screen.getByText("Panel 1")).toBeInTheDocument();
    expect(screen.queryByText("Panel 2")).not.toBeInTheDocument();
  });

  it("shows Finish button on last step", () => {
    render(
      <FormWizard currentStep={2} steps={testSteps}>
        <FormWizardNavigation />
      </FormWizard>,
    );

    expect(screen.getByRole("button", { name: "Finish" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Next" })).not.toBeInTheDocument();
  });

  it("calls onFinish when Finish is clicked", async () => {
    const user = userEvent.setup();
    const handleFinish = vi.fn();

    render(
      <FormWizard currentStep={2} steps={testSteps}>
        <FormWizardNavigation onFinish={handleFinish} />
      </FormWizard>,
    );

    await user.click(screen.getByRole("button", { name: "Finish" }));
    expect(handleFinish).toHaveBeenCalledTimes(1);
  });

  it("uses custom button text", () => {
    render(
      <FormWizard steps={testSteps}>
        <FormWizardNavigation finishText="Complete" nextText="Continue" previousText="Back" />
      </FormWizard>,
    );

    expect(screen.getByRole("button", { name: "Back" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continue" })).toBeInTheDocument();
  });
});

describe("useFormWizard", () => {
  it("throws error when used outside FormWizard", () => {
    const TestComponent = () => {
      useFormWizard();
      return null;
    };

    expect(() => render(<TestComponent />)).toThrow("useFormWizard must be used within FormWizard");
  });

  it("provides context values", () => {
    let contextValue: ReturnType<typeof useFormWizard> | null = null;

    const TestComponent = () => {
      contextValue = useFormWizard();
      return null;
    };

    render(
      <FormWizard steps={testSteps}>
        <TestComponent />
      </FormWizard>,
    );

    expect(contextValue).not.toBeNull();
    expect(contextValue!.currentStep).toBe(0);
    expect(contextValue!.totalSteps).toBe(3);
    expect(contextValue!.isFirstStep).toBe(true);
    expect(contextValue!.isLastStep).toBe(false);
    expect(contextValue!.canGoPrev).toBe(false);
    expect(contextValue!.canGoNext).toBe(true);
  });
});
