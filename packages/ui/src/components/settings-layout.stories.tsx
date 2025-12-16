import type { Meta, StoryObj } from "@storybook/react-vite";
import { Bell, Settings, Shield, User } from "lucide-react";

import { Button } from "./button";
import { Input } from "./input";
import {
  SettingsLayout,
  SettingsLayoutItem,
  SettingsLayoutPanel,
  SettingsLayoutSection,
} from "./settings-layout";
import { Switch } from "./switch";

/**
 * SettingsLayout component for settings pages with tabbed navigation.
 */
const meta: Meta<typeof SettingsLayout> = {
  title: "domain/SettingsLayout",
  component: SettingsLayout,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof SettingsLayout>;

export default meta;

type Story = StoryObj<typeof meta>;

const tabs = [
  {
    id: "general",
    label: "General",
    icon: <Settings className="size-4" />,
    content: (
      <SettingsLayoutPanel>
        <SettingsLayoutSection description="Update your personal information" title="Profile">
          <SettingsLayoutItem
            control={<Input defaultValue="John Doe" />}
            description="Your full name"
            label="Name"
          />
          <SettingsLayoutItem
            control={<Input defaultValue="john@example.com" type="email" />}
            description="Your email address"
            label="Email"
          />
        </SettingsLayoutSection>
      </SettingsLayoutPanel>
    ),
  },
  {
    id: "security",
    label: "Security",
    icon: <Shield className="size-4" />,
    content: (
      <SettingsLayoutPanel>
        <SettingsLayoutSection
          description="Manage your password and authentication"
          title="Password"
        >
          <SettingsLayoutItem control={<Input type="password" />} label="Current Password" />
          <SettingsLayoutItem control={<Input type="password" />} label="New Password" />
        </SettingsLayoutSection>
      </SettingsLayoutPanel>
    ),
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: <Bell className="size-4" />,
    content: (
      <SettingsLayoutPanel>
        <SettingsLayoutSection
          description="Configure what emails you receive"
          title="Email Notifications"
        >
          <SettingsLayoutItem
            control={<Switch />}
            description="Receive emails about new features"
            label="Marketing emails"
          />
          <SettingsLayoutItem
            control={<Switch defaultChecked />}
            description="Receive alerts about account security"
            label="Security alerts"
          />
        </SettingsLayoutSection>
      </SettingsLayoutPanel>
    ),
  },
];

/**
 * Default settings layout with multiple tabs.
 */
export const Default: Story = {
  render: () => (
    <div className="p-8">
      <SettingsLayout
        description="Manage your account settings and preferences"
        tabs={tabs}
        title="Settings"
      />
    </div>
  ),
};

/**
 * Settings layout with single section.
 */
export const SingleSection: Story = {
  render: () => {
    const singleTab = [
      {
        id: "account",
        label: "Account",
        icon: <User className="size-4" />,
        content: (
          <SettingsLayoutPanel>
            <SettingsLayoutSection
              description="Manage your account preferences"
              title="Account Settings"
            >
              <SettingsLayoutItem
                control={<Input defaultValue="johndoe" />}
                description="Your unique username"
                label="Username"
              />
              <SettingsLayoutItem control={<Input defaultValue="John" />} label="Display Name" />
              <SettingsLayoutItem
                control={<Switch defaultChecked />}
                description="Choose your preferred theme"
                label="Theme"
              />
            </SettingsLayoutSection>
            <div className="flex justify-end pt-4">
              <Button>Save Changes</Button>
            </div>
          </SettingsLayoutPanel>
        ),
      },
    ];

    return (
      <div className="p-8">
        <SettingsLayout tabs={singleTab} title="Account Settings" />
      </div>
    );
  },
};
