import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../components/select";

/**
 * NOTE: Radix Select uses pointer capture which is not fully supported in JSDOM.
 * Interactive tests (clicking, selecting options) are tested via Playwright e2e.
 * These unit tests verify basic rendering and props.
 */

const BasicSelect = ({ placeholder = "Select..." }: { placeholder?: string }) => (
  <Select>
    <SelectTrigger>
      <SelectValue placeholder={placeholder} />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectLabel>Options</SelectLabel>
        <SelectItem value="a">Option A</SelectItem>
        <SelectItem value="b">Option B</SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
);

describe("Select", () => {
  it("renders trigger with placeholder", () => {
    render(<BasicSelect placeholder="Choose one" />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByText("Choose one")).toBeInTheDocument();
  });

  it("has data-slot attribute on trigger", () => {
    render(<BasicSelect />);
    expect(screen.getByRole("combobox")).toHaveAttribute("data-slot", "select-trigger");
  });

  it("can be disabled", () => {
    render(
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Disabled" />
        </SelectTrigger>
      </Select>,
    );
    expect(screen.getByRole("combobox")).toBeDisabled();
  });

  it("shows selected value when controlled", () => {
    render(
      <Select value="selected">
        <SelectTrigger>
          <SelectValue>Selected Option</SelectValue>
        </SelectTrigger>
      </Select>,
    );
    expect(screen.getByRole("combobox")).toHaveTextContent("Selected Option");
  });
});

describe("SelectTrigger", () => {
  it("supports default size", () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Test" />
        </SelectTrigger>
      </Select>,
    );
    expect(screen.getByRole("combobox")).toHaveAttribute("data-size", "default");
  });

  it("supports sm size", () => {
    render(
      <Select>
        <SelectTrigger size="sm">
          <SelectValue placeholder="Test" />
        </SelectTrigger>
      </Select>,
    );
    expect(screen.getByRole("combobox")).toHaveAttribute("data-size", "sm");
  });

  it("merges custom className", () => {
    render(
      <Select>
        <SelectTrigger className="custom-trigger">
          <SelectValue placeholder="Test" />
        </SelectTrigger>
      </Select>,
    );
    expect(screen.getByRole("combobox")).toHaveClass("custom-trigger");
  });

  it("includes chevron icon", () => {
    const { container } = render(<BasicSelect />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });
});
