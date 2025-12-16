import type { Meta, StoryObj } from "@storybook/react-vite";
import { DollarSign, Phone, TrendingUp, Users } from "lucide-react";

import {
  StatCard,
  StatCardContentWrapper,
  StatCardDescription,
  StatCardHeader,
  StatCardIcon,
  StatCardTitle,
  StatCardTrend,
  StatCardValue,
} from "./stat-card";

/**
 * StatCard component for displaying metrics with icons, values, and trends.
 */
const meta: Meta<typeof StatCard> = {
  title: "domain/StatCard",
  component: StatCard,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "bordered"],
      description: "Card styling variant",
    },
  },
  parameters: {
    layout: "padded",
  },
  args: {
    variant: "default",
  },
} satisfies Meta<typeof StatCard>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Default stat card with positive trend.
 */
export const Default: Story = {
  render: (args) => (
    <div className="w-[300px]">
      <StatCard {...args}>
        <StatCardContentWrapper>
          <StatCardHeader>
            <StatCardIcon>
              <Users className="size-4" />
            </StatCardIcon>
            <StatCardTitle>Total Users</StatCardTitle>
          </StatCardHeader>
          <StatCardValue>1,234</StatCardValue>
          <StatCardTrend type="increase" value="+12.3%" />
          <StatCardDescription>Compared to last month</StatCardDescription>
        </StatCardContentWrapper>
      </StatCard>
    </div>
  ),
};

/**
 * Stat card showing a decrease trend.
 */
export const DecreasingTrend: Story = {
  render: (args) => (
    <div className="w-[300px]">
      <StatCard {...args}>
        <StatCardContentWrapper>
          <StatCardHeader>
            <StatCardIcon>
              <Phone className="size-4" />
            </StatCardIcon>
            <StatCardTitle>Call Volume</StatCardTitle>
          </StatCardHeader>
          <StatCardValue>892</StatCardValue>
          <StatCardTrend type="decrease" value="-5.2%" />
          <StatCardDescription>vs. last week</StatCardDescription>
        </StatCardContentWrapper>
      </StatCard>
    </div>
  ),
};

/**
 * Stat card with neutral trend (no change).
 */
export const NeutralTrend: Story = {
  render: (args) => (
    <div className="w-[300px]">
      <StatCard {...args}>
        <StatCardContentWrapper>
          <StatCardHeader>
            <StatCardIcon>
              <TrendingUp className="size-4" />
            </StatCardIcon>
            <StatCardTitle>Active Agents</StatCardTitle>
          </StatCardHeader>
          <StatCardValue>48</StatCardValue>
          <StatCardTrend type="neutral" value="No change" />
          <StatCardDescription>from yesterday</StatCardDescription>
        </StatCardContentWrapper>
      </StatCard>
    </div>
  ),
};

/**
 * Bordered variant for emphasis.
 */
export const Bordered: Story = {
  render: (args) => (
    <div className="w-[300px]">
      <StatCard {...args} variant="bordered">
        <StatCardContentWrapper>
          <StatCardHeader>
            <StatCardIcon>
              <DollarSign className="size-4" />
            </StatCardIcon>
            <StatCardTitle>Revenue</StatCardTitle>
          </StatCardHeader>
          <StatCardValue>$12,345</StatCardValue>
          <StatCardTrend type="increase" value="+23.1%" />
          <StatCardDescription>Monthly recurring revenue</StatCardDescription>
        </StatCardContentWrapper>
      </StatCard>
    </div>
  ),
};

/**
 * Multiple stat cards in a grid layout.
 */
export const Grid: Story = {
  render: () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard>
        <StatCardContentWrapper>
          <StatCardHeader>
            <StatCardIcon>
              <Users className="size-4" />
            </StatCardIcon>
            <StatCardTitle>Total Users</StatCardTitle>
          </StatCardHeader>
          <StatCardValue>2,543</StatCardValue>
          <StatCardTrend type="increase" value="+12%" />
        </StatCardContentWrapper>
      </StatCard>

      <StatCard>
        <StatCardContentWrapper>
          <StatCardHeader>
            <StatCardIcon>
              <Phone className="size-4" />
            </StatCardIcon>
            <StatCardTitle>Calls Today</StatCardTitle>
          </StatCardHeader>
          <StatCardValue>187</StatCardValue>
          <StatCardTrend type="increase" value="+8%" />
        </StatCardContentWrapper>
      </StatCard>

      <StatCard>
        <StatCardContentWrapper>
          <StatCardHeader>
            <StatCardIcon>
              <TrendingUp className="size-4" />
            </StatCardIcon>
            <StatCardTitle>Active Agents</StatCardTitle>
          </StatCardHeader>
          <StatCardValue>42</StatCardValue>
          <StatCardTrend type="neutral" value="0%" />
        </StatCardContentWrapper>
      </StatCard>

      <StatCard>
        <StatCardContentWrapper>
          <StatCardHeader>
            <StatCardIcon>
              <DollarSign className="size-4" />
            </StatCardIcon>
            <StatCardTitle>Revenue</StatCardTitle>
          </StatCardHeader>
          <StatCardValue>$45.2K</StatCardValue>
          <StatCardTrend type="increase" value="+20%" />
        </StatCardContentWrapper>
      </StatCard>
    </div>
  ),
  parameters: {
    layout: "centered",
  },
};

/**
 * Minimal stat card without trend indicator.
 */
export const WithoutTrend: Story = {
  render: (args) => (
    <div className="w-[300px]">
      <StatCard {...args}>
        <StatCardContentWrapper>
          <StatCardHeader>
            <StatCardIcon>
              <Users className="size-4" />
            </StatCardIcon>
            <StatCardTitle>Team Size</StatCardTitle>
          </StatCardHeader>
          <StatCardValue>12</StatCardValue>
          <StatCardDescription>active members</StatCardDescription>
        </StatCardContentWrapper>
      </StatCard>
    </div>
  ),
};
