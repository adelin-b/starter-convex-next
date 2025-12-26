import { zodResolver } from "@hookform/resolvers/zod";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useForm } from "react-hook-form";
import { action } from "storybook/actions";
import { expect, userEvent, within } from "storybook/test";
import * as z from "zod";
import { Button } from "@/components/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/form";

// Validation constants
const MIN_USERNAME_LENGTH = 6;

// Test regex patterns
const USERNAME_PATTERN = /username/i;
const SUBMIT_PATTERN = /submit/i;
const ERROR_MESSAGE_PATTERN = /username must be at least 6 characters/i;

/**
 * Building forms with React Hook Form and Zod.
 */
const meta: Meta<typeof Form> = {
  title: "ui/Form",
  component: Form,
  tags: ["autodocs"],
  argTypes: {},
  render: (args) => <ProfileForm {...args} />,
} satisfies Meta<typeof Form>;

export default meta;

type Story = StoryObj<typeof meta>;

const formSchema = z.object({
  username: z.string().min(MIN_USERNAME_LENGTH, {
    message: "Username must be at least 6 characters.",
  }),
});

const ProfileForm = (args: Story["args"]) => {
  const form = useForm<z.infer<typeof formSchema>>({
    // @ts-expect-error - Zod v3.25 compatibility with zodResolver
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  });
  function onSubmit(values: z.infer<typeof formSchema>) {
    action("onSubmit")(values);
  }
  return (
    <Form {...args} {...form}>
      <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <input
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  placeholder="username"
                  {...field}
                />
              </FormControl>
              <FormDescription>This is your public display name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};

/**
 * The default form of the form.
 */
export const Default: Story = {};

export const ShouldSucceedWhenValidInput: Story = {
  name: "when typing a valid username, should not show an error message",
  tags: ["!dev", "!autodocs"],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("Type a valid username", async () => {
      await userEvent.type(
        await canvas.findByRole("textbox", { name: USERNAME_PATTERN }),
        "mockuser",
      );
    });

    await step("Click the submit button", async () => {
      await userEvent.click(await canvas.findByRole("button", { name: SUBMIT_PATTERN }));
      expect(
        await canvas.queryByText(ERROR_MESSAGE_PATTERN, {
          exact: true,
        }),
      ).toBeNull();
    });
  },
};

export const ShouldShowErrorWhenInvalidInput: Story = {
  name: "when typing a short username, should show an error message",
  tags: ["!dev", "!autodocs"],
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("Type a short username", async () => {
      await userEvent.type(await canvas.findByRole("textbox", { name: USERNAME_PATTERN }), "fail");
    });

    await step("Click the submit button", async () => {
      await userEvent.click(await canvas.findByRole("button", { name: SUBMIT_PATTERN }));
      expect(
        await canvas.queryByText(ERROR_MESSAGE_PATTERN, {
          exact: true,
        }),
      ).toBeVisible();
    });
  },
};
