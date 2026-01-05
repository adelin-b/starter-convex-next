import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Button } from "./button";
import {
  DetailLayout,
  DetailLayoutDetail,
  DetailLayoutDetailHeader,
  DetailLayoutDetailSection,
  DetailLayoutList,
} from "./detail-layout";

// Panel size constants (percentages)
const DEFAULT_LIST_SIZE = 35;
const DEFAULT_DETAIL_SIZE = 65;
const MIN_LIST_SIZE = 20;
const MIN_DETAIL_SIZE = 50;
const WIDER_LIST_SIZE = 45;
const WIDER_DETAIL_SIZE = 55;
const CUSTOM_MIN_LIST_SIZE = 30;
const CUSTOM_MIN_DETAIL_SIZE = 40;

/**
 * DetailLayout component for split view list + detail interfaces.
 */
const meta: Meta<typeof DetailLayout> = {
  title: "domain/DetailLayout",
  component: DetailLayout,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    defaultSize: {
      control: "object",
      description: "Default size percentages [list, detail]",
    },
    minSize: {
      control: "object",
      description: "Minimum size percentages [list, detail]",
    },
  },
  args: {
    defaultSize: [DEFAULT_LIST_SIZE, DEFAULT_DETAIL_SIZE],
    minSize: [MIN_LIST_SIZE, MIN_DETAIL_SIZE],
  },
} satisfies Meta<typeof DetailLayout>;

export default meta;

type Story = StoryObj<typeof meta>;

const agents = [
  { id: "1", name: "Customer Support Bot", status: "active" },
  { id: "2", name: "Sales Assistant", status: "active" },
  { id: "3", name: "Tech Support", status: "inactive" },
];

/**
 * Default detail layout with list and detail panels.
 */
export const Default: Story = {
  render: (args) => {
    const [selectedId, setSelectedId] = useState<string | null>("1");

    return (
      <div className="h-screen">
        <DetailLayout
          {...args}
          detail={
            selectedId ? (
              <DetailLayoutDetail>
                <DetailLayoutDetailHeader
                  actions={
                    <>
                      <Button variant="outline">Edit</Button>
                      <Button variant="destructive">Delete</Button>
                    </>
                  }
                  description="Voice agent configuration and details"
                  title={agents.find((a) => a.id === selectedId)?.name || ""}
                />
                <DetailLayoutDetailSection
                  description="Agent configuration settings"
                  title="Settings"
                >
                  <p className="text-muted-foreground text-sm">Configuration details go here...</p>
                </DetailLayoutDetailSection>
              </DetailLayoutDetail>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">Select an agent</p>
              </div>
            )
          }
          detailOpen={!!selectedId}
          list={
            <DetailLayoutList>
              {agents.map((agent) => (
                <Button
                  className="w-full justify-start"
                  key={agent.id}
                  onClick={() => setSelectedId(agent.id)}
                  variant={selectedId === agent.id ? "secondary" : "ghost"}
                >
                  <div className="flex flex-col items-start gap-1">
                    <span className="font-medium">{agent.name}</span>
                    <span className="text-muted-foreground text-xs">{agent.status}</span>
                  </div>
                </Button>
              ))}
            </DetailLayoutList>
          }
          onDetailOpenChange={(open) => !open && setSelectedId(null)}
        />
      </div>
    );
  },
};

/**
 * Custom panel sizes (wider list panel).
 */
export const WiderList: Story = {
  render: () => {
    const [selectedId, setSelectedId] = useState<string | null>("1");

    return (
      <div className="h-screen">
        <DetailLayout
          defaultSize={[WIDER_LIST_SIZE, WIDER_DETAIL_SIZE]}
          detail={
            <DetailLayoutDetail>
              <DetailLayoutDetailHeader title="Agent Details" />
              <p className="text-sm">Detail content...</p>
            </DetailLayoutDetail>
          }
          detailOpen={!!selectedId}
          list={
            <DetailLayoutList>
              {agents.map((agent) => (
                <Button
                  className="w-full justify-start"
                  key={agent.id}
                  onClick={() => setSelectedId(agent.id)}
                  variant={selectedId === agent.id ? "secondary" : "ghost"}
                >
                  {agent.name}
                </Button>
              ))}
            </DetailLayoutList>
          }
          minSize={[CUSTOM_MIN_LIST_SIZE, CUSTOM_MIN_DETAIL_SIZE]}
          onDetailOpenChange={(open) => !open && setSelectedId(null)}
        />
      </div>
    );
  },
};
