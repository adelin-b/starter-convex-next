import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { UploadInput } from "./upload-input";

/**
 * A file input component integrated with uploadstuff for handling file uploads.
 * Automatically clears the input after successful upload.
 */
const meta: Meta<typeof UploadInput> = {
  title: "ui/UploadInput",
  component: UploadInput,
  tags: ["autodocs"],
  argTypes: {
    accept: {
      control: "text",
      description: "File types to accept (e.g., 'image/*', '.pdf')",
    },
    required: {
      control: "boolean",
      description: "Whether the input is required",
    },
  },
  args: {
    generateUploadUrl: fn(async () => "/mock-upload-url"),
    onUploadComplete: fn(async (uploaded) => {
      console.log("Upload complete:", uploaded);
    }),
  },
  parameters: {
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The default form of the upload input. Accepts any file type.
 */
export const Default: Story = {};

/**
 * Upload input configured to accept only image files.
 */
export const ImagesOnly: Story = {
  args: {
    accept: "image/*",
  },
};

/**
 * Upload input configured to accept only PDF files.
 */
export const PDFOnly: Story = {
  args: {
    accept: ".pdf",
  },
};

/**
 * Upload input configured to accept multiple file types.
 */
export const MultipleTypes: Story = {
  args: {
    accept: ".pdf,.doc,.docx,image/*",
  },
};

/**
 * Required upload input with custom styling.
 */
export const Required: Story = {
  args: {
    required: true,
    className: "block w-full text-sm text-foreground/60",
  },
};

/**
 * Upload input with custom ID for label association.
 */
export const WithLabel: Story = {
  render: (args) => (
    <div className="grid gap-2">
      <label className="font-medium text-sm" htmlFor="file-upload">
        Choose a file
      </label>
      <UploadInput {...args} id="file-upload" />
    </div>
  ),
};
