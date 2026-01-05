/**
 * Storybook Story Helpers
 *
 * Reusable utilities to reduce duplication across story files
 */

import type { Meta } from "@storybook/react";

// ============================================================================
// Default Story Options
// ============================================================================

/**
 * Default options for Storybook meta configurations
 *
 * @example
 * const meta: Meta<typeof Button> = {
 *   ...defaultStoryOptions,
 *   title: "ui/Button",
 *   component: Button,
 * };
 */
export const defaultStoryOptions: Partial<Meta<React.ComponentType>> = {
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};
