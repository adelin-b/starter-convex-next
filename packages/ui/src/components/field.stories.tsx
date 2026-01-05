import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { Checkbox } from "@/components/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/components/field";
import { Input } from "@/components/input";
import { RadioGroup, RadioGroupItem } from "@/components/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/select";
import { Slider } from "@/components/slider";
import { Switch } from "@/components/switch";
import { Textarea } from "@/components/textarea";

const DEFAULT_PRICE_MIN = 200;
const DEFAULT_PRICE_MAX = 800;

/**
 * Combine labels, controls, and help text to compose accessible form fields and grouped inputs.
 */
const meta: Meta<typeof Field> = {
  title: "ui/Field",
  component: Field,
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: "select",
      options: ["vertical", "horizontal", "responsive"],
    },
  },
  parameters: {
    layout: "centered",
  },
  args: {
    orientation: "vertical",
  },
  decorators: (FieldStory) => (
    <div className="w-full min-w-sm max-w-md">
      <FieldStory />
    </div>
  ),
} satisfies Meta<typeof Field>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Field with Input component for text input.
 */
export const WithInput: Story = {
  render: (args) => (
    <FieldSet>
      <FieldGroup>
        <Field {...args}>
          <FieldLabel htmlFor="username">Username</FieldLabel>
          <Input id="username" placeholder="Max Leiter" type="text" />
          <FieldDescription>Choose a unique username for your account.</FieldDescription>
        </Field>
      </FieldGroup>
    </FieldSet>
  ),
};

/**
 * Field with textarea for longer text input.
 */
export const WithTextarea: Story = {
  render: (args) => (
    <FieldSet>
      <FieldGroup>
        <Field {...args}>
          <FieldLabel htmlFor="feedback">Feedback</FieldLabel>
          <Textarea id="feedback" placeholder="Your feedback helps us improve..." rows={4} />
          <FieldDescription>Share your thoughts about our service.</FieldDescription>
        </Field>
      </FieldGroup>
    </FieldSet>
  ),
};

/**
 * Field with Select component for dropdown selections.
 */
export const WithSelect: Story = {
  render: (args) => (
    <Field {...args}>
      <FieldLabel>Department</FieldLabel>
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Choose department" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="engineering">Engineering</SelectItem>
          <SelectItem value="design">Design</SelectItem>
          <SelectItem value="marketing">Marketing</SelectItem>
          <SelectItem value="sales">Sales</SelectItem>
          <SelectItem value="support">Customer Support</SelectItem>
          <SelectItem value="hr">Human Resources</SelectItem>
          <SelectItem value="finance">Finance</SelectItem>
          <SelectItem value="operations">Operations</SelectItem>
        </SelectContent>
      </Select>
      <FieldDescription>Select your department or area of work.</FieldDescription>
    </Field>
  ),
};

/**
 * Field with Slider component and dynamic value display.
 */
export const WithSlider: Story = {
  render: () => {
    const [value, setValue] = React.useState([DEFAULT_PRICE_MIN, DEFAULT_PRICE_MAX]);
    return (
      <Field>
        <FieldTitle>Price Range</FieldTitle>
        <FieldDescription>
          Set your budget range ($
          <span className="font-medium tabular-nums">{value[0]}</span> -{" "}
          <span className="font-medium tabular-nums">{value[1]}</span>).
        </FieldDescription>
        <Slider
          aria-label="Price Range"
          className="mt-2 w-full"
          max={1000}
          min={0}
          onValueChange={setValue}
          step={10}
          value={value}
        />
      </Field>
    );
  },
};

/**
 * FieldSet with multiple related fields in a grid layout.
 */
export const WithFieldset: Story = {
  render: () => (
    <div className="w-full max-w-md space-y-6">
      <FieldSet>
        <FieldLegend>Address Information</FieldLegend>
        <FieldDescription>We need your address to deliver your order.</FieldDescription>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="street">Street Address</FieldLabel>
            <Input id="street" placeholder="123 Main St" type="text" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="city">City</FieldLabel>
              <Input id="city" placeholder="New York" type="text" />
            </Field>
            <Field>
              <FieldLabel htmlFor="zip">Postal Code</FieldLabel>
              <Input id="zip" placeholder="90502" type="text" />
            </Field>
          </div>
        </FieldGroup>
      </FieldSet>
    </div>
  ),
};

/**
 * Field with checkbox inputs using FieldSet structure.
 */
export const WithCheckbox: Story = {
  render: () => (
    <FieldGroup>
      <FieldSet>
        <FieldLegend variant="label">Show these items on the desktop</FieldLegend>
        <FieldDescription>Select the items you want to show on the desktop.</FieldDescription>
        <FieldGroup className="gap-3">
          <Field orientation="horizontal">
            <Checkbox id="finder-pref-9k2-hard-disks-ljj" />
            <FieldLabel
              className="font-normal"
              defaultChecked
              htmlFor="finder-pref-9k2-hard-disks-ljj"
            >
              Hard disks
            </FieldLabel>
          </Field>
          <Field orientation="horizontal">
            <Checkbox id="finder-pref-9k2-external-disks-1yg" />
            <FieldLabel className="font-normal" htmlFor="finder-pref-9k2-external-disks-1yg">
              External disks
            </FieldLabel>
          </Field>
          <Field orientation="horizontal">
            <Checkbox id="finder-pref-9k2-cds-dvds-fzt" />
            <FieldLabel className="font-normal" htmlFor="finder-pref-9k2-cds-dvds-fzt">
              CDs, DVDs, and iPods
            </FieldLabel>
          </Field>
          <Field orientation="horizontal">
            <Checkbox id="finder-pref-9k2-connected-servers-6l2" />
            <FieldLabel className="font-normal" htmlFor="finder-pref-9k2-connected-servers-6l2">
              Connected servers
            </FieldLabel>
          </Field>
        </FieldGroup>
      </FieldSet>
      <FieldSeparator />
      <Field orientation="horizontal">
        <Checkbox defaultChecked id="finder-pref-9k2-sync-folders-nep" />
        <FieldContent>
          <FieldLabel htmlFor="finder-pref-9k2-sync-folders-nep">
            Sync Desktop & Documents folders
          </FieldLabel>
          <FieldDescription>
            Your Desktop & Documents folders are being synced with iCloud Drive. You can access them
            from other devices.
          </FieldDescription>
        </FieldContent>
      </Field>
    </FieldGroup>
  ),
};

/**
 * Field with RadioGroup for single selection.
 */
export const WithRadio: Story = {
  render: () => (
    <FieldSet>
      <FieldLabel>Subscription Plan</FieldLabel>
      <FieldDescription>Yearly and lifetime plans offer significant savings.</FieldDescription>
      <RadioGroup defaultValue="monthly">
        <Field orientation="horizontal">
          <RadioGroupItem id="plan-monthly" value="monthly" />
          <FieldLabel className="font-normal" htmlFor="plan-monthly">
            Monthly ($9.99/month)
          </FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <RadioGroupItem id="plan-yearly" value="yearly" />
          <FieldLabel className="font-normal" htmlFor="plan-yearly">
            Yearly ($99.99/year)
          </FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <RadioGroupItem id="plan-lifetime" value="lifetime" />
          <FieldLabel className="font-normal" htmlFor="plan-lifetime">
            Lifetime ($299.99)
          </FieldLabel>
        </Field>
      </RadioGroup>
    </FieldSet>
  ),
};

/**
 * Field with Switch in horizontal orientation.
 */
export const WithSwitch: Story = {
  render: () => (
    <Field orientation="horizontal">
      <FieldContent>
        <FieldLabel htmlFor="2fa">Multi-factor authentication</FieldLabel>
        <FieldDescription>
          Enable multi-factor authentication. If you do not have a two-factor device, you can use a
          one-time code sent to your email.
        </FieldDescription>
      </FieldContent>
      <Switch id="2fa" />
    </Field>
  ),
};

/**
 * Selectable field groups with RadioItem for choice cards.
 */
export const ChoiceCard: Story = {
  render: () => (
    <FieldGroup>
      <FieldSet>
        <FieldLabel htmlFor="compute-environment-p8w">Compute Environment</FieldLabel>
        <FieldDescription>Select the compute environment for your cluster.</FieldDescription>
        <RadioGroup defaultValue="kubernetes">
          <FieldLabel htmlFor="kubernetes-r2h">
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle>Kubernetes</FieldTitle>
                <FieldDescription>Run GPU workloads on a K8s configured cluster.</FieldDescription>
              </FieldContent>
              <RadioGroupItem id="kubernetes-r2h" value="kubernetes" />
            </Field>
          </FieldLabel>
          <FieldLabel htmlFor="vm-z4k">
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle>Virtual Machine</FieldTitle>
                <FieldDescription>
                  Access a VM configured cluster to run GPU workloads.
                </FieldDescription>
              </FieldContent>
              <RadioGroupItem id="vm-z4k" value="vm" />
            </Field>
          </FieldLabel>
        </RadioGroup>
      </FieldSet>
    </FieldGroup>
  ),
};
