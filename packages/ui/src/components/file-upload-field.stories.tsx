import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Button } from "./button";
import { FileUploadField } from "./file-upload-field";

const MOCK_UPLOAD_DELAY_MS = 500;

/**
 * FileUploadField component with drag-and-drop, preview, and react-hook-form integration.
 */
const meta: Meta<typeof FileUploadField> = {
  title: "domain/FileUploadField",
  component: FileUploadField,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    accept: {
      control: "text",
      description: "Accepted file types (e.g., 'image/*', '.pdf,.doc')",
    },
    maxSizeMB: {
      control: "number",
      description: "Maximum file size in MB",
    },
    showPreview: {
      control: "boolean",
      description: "Show file preview (for images)",
    },
    multiple: {
      control: "boolean",
      description: "Allow multiple files",
    },
    required: {
      control: "boolean",
      description: "Required field",
    },
    disabled: {
      control: "boolean",
      description: "Disabled state",
    },
  },
  args: {
    maxSizeMB: 10,
    showPreview: false,
    multiple: false,
    required: false,
    disabled: false,
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

// Mock upload function for Storybook
const mockGenerateUploadUrl = async () => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, MOCK_UPLOAD_DELAY_MS));
  return "mock-upload-url";
};

/**
 * Basic file upload with form integration.
 */
export const Default: Story = {
  render: () => {
    const form = useForm({
      defaultValues: {
        document: null,
      },
    });

    return (
      <FormProvider {...form}>
        <form className="w-full max-w-md space-y-4">
          <FileUploadField
            description="Upload a document (max 10MB)"
            generateUploadUrl={mockGenerateUploadUrl}
            label="Document"
            name="document"
            required
          />
          <Button type="submit">Submit</Button>
        </form>
      </FormProvider>
    );
  },
};

/**
 * Image upload with preview enabled.
 */
export const ImageUpload: Story = {
  render: () => {
    const form = useForm({
      defaultValues: {
        logo: null,
      },
    });

    return (
      <FormProvider {...form}>
        <form className="w-full max-w-md space-y-4">
          <FileUploadField
            accept="image/*"
            description="Upload your company logo (PNG, JPG, max 2MB)"
            generateUploadUrl={mockGenerateUploadUrl}
            label="Company Logo"
            maxSizeMB={2}
            name="logo"
            required
            showPreview
          />
          <Button type="submit">Save Logo</Button>
        </form>
      </FormProvider>
    );
  },
};

/**
 * Multiple file upload.
 */
export const MultipleFiles: Story = {
  render: () => {
    const form = useForm({
      defaultValues: {
        documents: null,
      },
    });

    return (
      <FormProvider {...form}>
        <form className="w-full max-w-md space-y-4">
          <FileUploadField
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            description="Upload multiple documents (.pdf, .doc, .docx)"
            generateUploadUrl={mockGenerateUploadUrl}
            label="Supporting Documents"
            multiple
            name="documents"
          />
          <Button type="submit">Upload Documents</Button>
        </form>
      </FormProvider>
    );
  },
};

/**
 * Disabled state.
 */
export const Disabled: Story = {
  render: () => {
    const form = useForm({
      defaultValues: {
        file: null,
      },
    });

    return (
      <FormProvider {...form}>
        <form className="w-full max-w-md">
          <FileUploadField
            description="This field is disabled"
            disabled
            generateUploadUrl={mockGenerateUploadUrl}
            label="File Upload"
            name="file"
          />
        </form>
      </FormProvider>
    );
  },
};

/**
 * With validation error.
 */
export const WithError: Story = {
  render: () => {
    const form = useForm({
      defaultValues: {
        document: null,
      },
    });

    // Set validation error
    form.setError("document", {
      type: "manual",
      message: "This field is required",
    });

    return (
      <FormProvider {...form}>
        <form className="w-full max-w-md">
          <FileUploadField
            description="Upload a required document"
            generateUploadUrl={mockGenerateUploadUrl}
            label="Required Document"
            name="document"
            required
          />
        </form>
      </FormProvider>
    );
  },
};

/**
 * Different file types (PDF only).
 */
export const PDFOnly: Story = {
  render: () => {
    const form = useForm({
      defaultValues: {
        contract: null,
      },
    });

    return (
      <FormProvider {...form}>
        <form className="w-full max-w-md space-y-4">
          <FileUploadField
            accept=".pdf,application/pdf"
            description="Upload contract in PDF format only"
            generateUploadUrl={mockGenerateUploadUrl}
            label="Contract PDF"
            maxSizeMB={5}
            name="contract"
            required
          />
          <Button type="submit">Submit Contract</Button>
        </form>
      </FormProvider>
    );
  },
};

/**
 * Small size limit example.
 */
export const SmallSizeLimit: Story = {
  render: () => {
    const form = useForm({
      defaultValues: {
        avatar: null,
      },
    });

    return (
      <FormProvider {...form}>
        <form className="w-full max-w-md space-y-4">
          <FileUploadField
            accept="image/*"
            description="Upload a profile picture (max 1MB)"
            generateUploadUrl={mockGenerateUploadUrl}
            label="Profile Picture"
            maxSizeMB={1}
            name="avatar"
            required
            showPreview
          />
          <Button type="submit">Update Profile</Button>
        </form>
      </FormProvider>
    );
  },
};

/**
 * With upload complete callback.
 */
export const WithCallback: Story = {
  render: () => {
    const form = useForm({
      defaultValues: {
        file: null,
      },
    });

    const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

    const handleUploadComplete = async (uploaded: any[]) => {
      setUploadedFiles((prev) => [...prev, ...uploaded.map((f) => f.file.name)]);
    };

    return (
      <FormProvider {...form}>
        <div className="w-full max-w-md space-y-4">
          <form className="space-y-4">
            <FileUploadField
              description="Files will be logged on upload"
              generateUploadUrl={mockGenerateUploadUrl}
              label="Upload File"
              name="file"
              onUploadComplete={handleUploadComplete}
            />
            <Button type="submit">Submit</Button>
          </form>

          {uploadedFiles.length > 0 && (
            <div className="rounded-lg bg-muted p-4">
              <h4 className="mb-2 font-semibold text-sm">Uploaded Files:</h4>
              <ul className="space-y-1">
                {uploadedFiles.map((file, i) => (
                  <li className="text-muted-foreground text-xs" key={i}>
                    {file}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </FormProvider>
    );
  },
};
