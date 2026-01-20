import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Switch } from "../components/switch";

describe("Switch", () => {
  it("renders as a switch role", () => {
    render(<Switch />);
    expect(screen.getByRole("switch")).toBeInTheDocument();
  });

  it("has data-slot attribute", () => {
    render(<Switch />);
    expect(screen.getByRole("switch")).toHaveAttribute("data-slot", "switch");
  });

  it("is unchecked by default", () => {
    render(<Switch />);
    expect(screen.getByRole("switch")).not.toBeChecked();
    expect(screen.getByRole("switch")).toHaveAttribute("data-state", "unchecked");
  });

  it("respects defaultChecked prop", () => {
    render(<Switch defaultChecked />);
    expect(screen.getByRole("switch")).toBeChecked();
    expect(screen.getByRole("switch")).toHaveAttribute("data-state", "checked");
  });

  it("respects checked prop (controlled)", () => {
    render(<Switch checked />);
    expect(screen.getByRole("switch")).toBeChecked();
  });

  it("toggles state when clicked", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<Switch onCheckedChange={handleChange} />);
    const switchElement = screen.getByRole("switch");

    expect(switchElement).not.toBeChecked();

    await user.click(switchElement);
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it("toggles from checked to unchecked", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<Switch defaultChecked onCheckedChange={handleChange} />);
    const switchElement = screen.getByRole("switch");

    expect(switchElement).toBeChecked();

    await user.click(switchElement);
    expect(handleChange).toHaveBeenCalledWith(false);
  });

  it("can be disabled", () => {
    render(<Switch disabled />);
    expect(screen.getByRole("switch")).toBeDisabled();
  });

  it("does not toggle when disabled", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<Switch disabled onCheckedChange={handleChange} />);

    await user.click(screen.getByRole("switch"));
    expect(handleChange).not.toHaveBeenCalled();
  });

  it("merges custom className", () => {
    render(<Switch className="custom-class" />);
    const switchElement = screen.getByRole("switch");
    expect(switchElement).toHaveClass("custom-class");
    expect(switchElement).toHaveClass("peer"); // Default class should still be there
  });

  it("can have aria-label for accessibility", () => {
    render(<Switch aria-label="Enable notifications" />);
    expect(screen.getByRole("switch", { name: "Enable notifications" })).toBeInTheDocument();
  });

  it("can be associated with a label via aria-labelledby", () => {
    render(
      <>
        <label id="switch-label">Toggle setting</label>
        <Switch aria-labelledby="switch-label" />
      </>,
    );
    expect(screen.getByRole("switch")).toHaveAttribute("aria-labelledby", "switch-label");
  });

  // NOTE: Radix Switch uses a hidden input for form semantics.
  // The name, required, and value props are applied to the hidden input,
  // not the visible switch button element. Form behavior is tested via e2e.
});
