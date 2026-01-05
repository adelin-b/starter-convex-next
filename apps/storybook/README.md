# Storybook for Better Starter SaaS UI Components

This Storybook app provides interactive documentation for the UI components used in the Better Starter SaaS project.

## Features

- Interactive UI component documentation
- Theme switching (light/dark) integration
- Compatible with shadcn-ui and Tailwind CSS
- Optimized build setup with Turborepo

## Development

To run Storybook locally:

```bash
# From the project root
bun run dev:storybook

# Or from this directory
bun run dev
```

## Build

To build the static Storybook for deployment:

```bash
# From the project root
bun run build --filter=@starter-saas/storybook

# Or from this directory
bun run build
```

## Adding Stories

To add documentation for a new component:

1. Create a new `.stories.tsx` file next to your component file in `packages/ui/src/components/`
2. Import your component and use `defaultStoryOptions` from `@story-helpers`
3. Define stories for different component variations using `args`

### Basic Example

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { defaultStoryOptions } from "@story-helpers";
import { YourComponent } from "./your-component";

const meta: Meta<typeof YourComponent> = {
  ...defaultStoryOptions,
  title: "ui/YourComponent",
  component: YourComponent,
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary"],
    },
  },
  args: {
    variant: "default",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Secondary: Story = {
  args: { variant: "secondary" },
};
```

### Interactive Component Example

For components that need state management:

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { defaultStoryOptions } from "@story-helpers";
import { InteractiveComponent } from "./interactive-component";

// Wrapper component for state management
function InteractiveComponentWrapper({
  initialValue = "",
}: {
  initialValue?: string;
}) {
  const [value, setValue] = useState(initialValue);
  return <InteractiveComponent value={value} onChange={setValue} />;
}

const meta: Meta<typeof InteractiveComponentWrapper> = {
  ...defaultStoryOptions,
  title: "ui/InteractiveComponent",
  component: InteractiveComponentWrapper,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithInitialValue: Story = {
  args: { initialValue: "Hello" },
};
```

**Key Points:**

- Use `defaultStoryOptions` for consistent meta configuration
- Prefer `args` over `render` when possible
- Use wrapper components for interactive state management
- Keep stories simple and focused on showcasing the component

## Structure

- `storybook/` - Storybook configuration (main.ts, preview.ts)
- `src/` - Additional source files if needed
- Stories are located in `packages/ui/src/components/` alongside component files

## Integration with Turborepo

This Storybook app is configured for optimal caching in Turborepo:

- The `storybook` and `build-storybook` tasks are defined in `turbo.json`
- Proper input/output definitions ensure efficient caching
- Dependencies on the UI package are correctly tracked
