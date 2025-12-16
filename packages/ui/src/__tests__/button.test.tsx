import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../components/button";

describe("Button Component", () => {
  it("renders with children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button")).toHaveTextContent("Click me");
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<Button onClick={handleClick}>Click me</Button>);
    await user.click(screen.getByRole("button"));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(
      <Button disabled onClick={handleClick}>
        Click me
      </Button>,
    );

    await user.click(screen.getByRole("button"));
    expect(handleClick).not.toHaveBeenCalled();
  });

  describe("variants", () => {
    it("renders default variant", () => {
      render(<Button variant="default">Default</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-primary", "text-primary-foreground");
    });

    it("renders destructive variant", () => {
      render(<Button variant="destructive">Destructive</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-destructive", "text-white");
    });

    it("renders outline variant", () => {
      render(<Button variant="outline">Outline</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("border", "bg-background", "shadow-xs");
    });

    it("renders secondary variant", () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-secondary", "text-secondary-foreground");
    });

    it("renders ghost variant", () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("hover:bg-accent", "hover:text-accent-foreground");
    });

    it("renders link variant", () => {
      render(<Button variant="link">Link</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("text-primary", "underline-offset-4");
    });
  });

  describe("sizes", () => {
    it("renders default size", () => {
      render(<Button size="default">Default Size</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("h-9", "px-4", "py-2");
    });

    it("renders sm size", () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("h-8", "px-3");
    });

    it("renders lg size", () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("h-10", "px-6");
    });

    it("renders icon size", () => {
      render(<Button size="icon">Icon</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("size-9");
    });

    it("renders icon-sm size", () => {
      render(<Button size="icon-sm">Icon Small</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("size-8");
    });

    it("renders icon-lg size", () => {
      render(<Button size="icon-lg">Icon Large</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("size-10");
    });
  });

  it("has data-slot attribute", () => {
    render(<Button>Test</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-slot", "button");
  });

  it("merges custom className", () => {
    render(<Button className="custom-class">Custom</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("custom-class");
    expect(button).toHaveClass("bg-primary"); // Should still have default variant classes
  });
});
