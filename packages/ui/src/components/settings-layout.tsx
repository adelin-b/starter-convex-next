"use client";

import { cn } from "@starter-saas/ui/utils";
import type * as React from "react";
import { Separator } from "./separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

type SettingsTab = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
};

type SettingsLayoutProps = {
  /**
   * Page title
   */
  title: string;
  /**
   * Page description
   */
  description?: string;
  /**
   * Settings tabs configuration
   */
  tabs: SettingsTab[];
  /**
   * Default active tab
   */
  defaultTab?: string;
  /**
   * Controlled tab value
   */
  value?: string;
  /**
   * Tab change callback
   */
  onValueChange?: (value: string) => void;
  /**
   * Custom className
   */
  className?: string;
};

/**
 * SettingsLayout component for settings pages with tabbed navigation.
 *
 * Provides a consistent layout for settings interfaces with vertical tab navigation.
 *
 * @example
 * const settingsTabs = [
 *   {
 *     id: "general",
 *     label: "General",
 *     icon: <Settings className="size-4" />,
 *     content: <GeneralSettings />,
 *   },
 *   {
 *     id: "security",
 *     label: "Security",
 *     icon: <Shield className="size-4" />,
 *     content: <SecuritySettings />,
 *   },
 * ];
 *
 * <SettingsLayout
 *   title="Settings"
 *   description="Manage your account settings and preferences"
 *   tabs={settingsTabs}
 * />
 */
export function SettingsLayout({
  title,
  description,
  tabs,
  defaultTab,
  value,
  onValueChange,
  className,
}: SettingsLayoutProps) {
  const defaultValue = defaultTab || tabs[0]?.id;

  return (
    <div className={cn("space-y-6", className)} data-slot="settings-layout">
      <SettingsLayoutHeader description={description} title={title} />

      <Separator />

      <Tabs
        className="flex flex-col gap-6 md:flex-row md:gap-8"
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        value={value}
      >
        <aside className="md:w-64">
          <TabsList className="flex h-auto flex-col items-stretch justify-start gap-2 bg-transparent p-0">
            {tabs.map((tab) => (
              <TabsTrigger
                className={cn(
                  "w-full justify-start gap-2 rounded-lg px-3 py-2",
                  "data-[state=active]:bg-muted data-[state=active]:shadow-none",
                )}
                key={tab.id}
                value={tab.id}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </aside>

        <div className="flex-1">
          {tabs.map((tab) => (
            <TabsContent className="mt-0" key={tab.id} value={tab.id}>
              <SettingsLayoutPanel>{tab.content}</SettingsLayoutPanel>
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
}

/**
 * SettingsLayoutHeader - Header with title and description
 */
type SettingsLayoutHeaderProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
};

export function SettingsLayoutHeader({ title, description, actions }: SettingsLayoutHeaderProps) {
  return (
    <div className="flex items-center justify-between" data-slot="settings-layout-header">
      <div className="space-y-1">
        <h1 className="font-bold text-3xl tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

/**
 * SettingsLayoutPanel - Content panel for each tab
 */
export function SettingsLayoutPanel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("space-y-6", className)} data-slot="settings-layout-panel" {...props} />
  );
}

/**
 * SettingsLayoutSection - Individual setting section
 */
interface SettingsLayoutSectionProps extends React.ComponentProps<"div"> {
  title: string;
  description?: string;
}

export function SettingsLayoutSection({
  title,
  description,
  className,
  children,
  ...props
}: SettingsLayoutSectionProps) {
  return (
    <div className={cn("space-y-4", className)} data-slot="settings-layout-section" {...props}>
      <div className="space-y-1">
        <h3 className="font-medium text-lg">{title}</h3>
        {description && <p className="text-muted-foreground text-sm">{description}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

/**
 * SettingsLayoutItem - Individual setting item with label and control
 */
interface SettingsLayoutItemProps extends React.ComponentProps<"div"> {
  label: string;
  description?: string;
  control: React.ReactNode;
}

export function SettingsLayoutItem({
  label,
  description,
  control,
  className,
  ...props
}: SettingsLayoutItemProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4",
        className,
      )}
      data-slot="settings-layout-item"
      {...props}
    >
      <div className="space-y-0.5">
        <div className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </div>
        {description && <p className="text-muted-foreground text-sm">{description}</p>}
      </div>
      <div className="sm:w-auto sm:min-w-[200px]">{control}</div>
    </div>
  );
}
