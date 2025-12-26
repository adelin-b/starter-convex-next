"use client";

import "@copilotkit/react-textarea/styles.css";
import type { CopilotTextareaProps } from "@copilotkit/react-textarea";
import { CopilotTextarea } from "@copilotkit/react-textarea";

/**
 * AI-powered textarea with proper Enter key behavior.
 *
 * By default, CopilotTextarea only accepts AI suggestions on Tab key.
 * This wrapper ensures proper styling and configuration.
 *
 * - Tab: Accept AI suggestions
 * - Enter: Create newlines (default textarea behavior)
 */
export const AITextarea = (props: CopilotTextareaProps) => <CopilotTextarea {...props} />;

AITextarea.displayName = "AITextarea";
