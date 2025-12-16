import type { Meta, StoryObj } from "@storybook/react";
import type { Row } from "@tanstack/react-table";
import { useState } from "react";

import { CalendarView } from "./calendar-view";

// Sample task data
type Task = {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  status: "pending" | "in-progress" | "completed";
  assignee: string;
  priority: "low" | "medium" | "high";
};

// Generate sample data spread across multiple dates
const generateTasks = (count: number): Task[] => {
  const statuses: Task["status"][] = ["pending", "in-progress", "completed"];
  const priorities: Task["priority"][] = ["low", "medium", "high"];
  const assignees = ["Alice", "Bob", "Carol", "David", "Eve"];

  const tasks: Task[] = [];
  const today = new Date();

  for (let i = 0; i < count; i += 1) {
    const daysOffset = Math.floor(Math.random() * 60) - 30; // Random date within ±30 days
    const dueDate = new Date(today);
    dueDate.setDate(today.getDate() + daysOffset);

    tasks.push({
      id: `task-${i + 1}`,
      title: `Task ${i + 1}`,
      description: `Description for task ${i + 1}`,
      dueDate,
      status: statuses[Math.floor(Math.random() * statuses.length)] ?? "pending",
      assignee: assignees[Math.floor(Math.random() * assignees.length)] ?? "Alice",
      priority: priorities[Math.floor(Math.random() * priorities.length)] ?? "medium",
    });
  }

  return tasks.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
};

// Mock rows with getValue method matching TanStack Table Row interface
// Using type assertion since we're creating simplified mocks for stories
const createMockRows = (data: Task[]): Row<Task>[] =>
  data.map((item) => ({
    original: item,
    getValue: (columnId: string) => item[columnId as keyof Task],
  })) as Row<Task>[];

// Wrapper to properly type the generic component for Storybook
function CalendarViewStory(props: React.ComponentProps<typeof CalendarView<Task>>) {
  return <CalendarView<Task> {...props} />;
}

const meta: Meta<typeof CalendarViewStory> = {
  title: "composite/Datatable/CalendarView",
  component: CalendarViewStory,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default calendar view with sample task data
 */
export const Default: Story = {
  args: {
    rows: createMockRows(generateTasks(20)),
    dateColumn: "dueDate",
    titleColumn: "title",
    onRowClick: (row: Task) => {
      console.log("Task clicked:", row);
    },
    onDateSelect: (date: Date, rows: Task[]) => {
      console.log("Date selected:", date, "Rows:", rows);
    },
  },
};

/**
 * Calendar view with many events
 */
export const ManyEvents: Story = {
  args: {
    rows: createMockRows(generateTasks(100)),
    dateColumn: "dueDate",
    titleColumn: "title",
    onRowClick: (row: Task) => {
      console.log("Task clicked:", row);
    },
  },
};

/**
 * Calendar view with few events
 */
export const FewEvents: Story = {
  args: {
    rows: createMockRows(generateTasks(5)),
    dateColumn: "dueDate",
    titleColumn: "title",
    onRowClick: (row: Task) => {
      console.log("Task clicked:", row);
    },
  },
};

/**
 * Calendar view with no events
 */
export const NoEvents: Story = {
  args: {
    rows: [],
    dateColumn: "dueDate",
    titleColumn: "title",
  },
};

/**
 * Calendar view without event count badge
 */
export const NoEventCount: Story = {
  args: {
    rows: createMockRows(generateTasks(20)),
    dateColumn: "dueDate",
    titleColumn: "title",
    showEventCount: false,
  },
};

/**
 * Calendar view with custom max events per date
 */
export const CustomMaxEvents: Story = {
  args: {
    rows: createMockRows(generateTasks(50)),
    dateColumn: "dueDate",
    titleColumn: "title",
    maxEventsPerDate: 10,
  },
};

/**
 * Interactive calendar with state management
 */
function InteractiveCalendar() {
  const [tasks] = useState<Task[]>(generateTasks(30));
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  return (
    <div className="flex h-screen flex-col gap-4 p-4">
      <CalendarView
        dateColumn="dueDate"
        onDateSelect={(date, rows) => {
          setSelectedDate(date);
          console.log(`Selected ${date.toLocaleDateString()} with ${rows.length} tasks`);
        }}
        onRowClick={(task) => {
          setSelectedTask(task);
          console.log("Selected task:", task);
        }}
        rows={createMockRows(tasks)}
        titleColumn="title"
      />

      {/* Selected task details */}
      {selectedTask && (
        <div className="rounded-md border bg-card p-4">
          <h3 className="mb-2 font-semibold text-lg">Selected Task</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <strong>Title:</strong> {selectedTask.title}
            </div>
            <div>
              <strong>Status:</strong> {selectedTask.status}
            </div>
            <div>
              <strong>Assignee:</strong> {selectedTask.assignee}
            </div>
            <div>
              <strong>Priority:</strong> {selectedTask.priority}
            </div>
            <div>
              <strong>Due Date:</strong> {selectedTask.dueDate.toLocaleDateString()}
            </div>
          </div>
        </div>
      )}

      {/* Selected date info */}
      {selectedDate && (
        <div className="rounded-md border bg-muted/50 p-3 text-sm">
          <strong>Last selected date:</strong> {selectedDate.toLocaleDateString()}
        </div>
      )}
    </div>
  );
}

export const Interactive: Story = {
  render: () => <InteractiveCalendar />,
  args: {} as never, // Interactive story doesn't use args
};

/**
 * Calendar view with specific date range
 */
export const SpecificDateRange: Story = {
  args: {
    rows: createMockRows(
      Array.from({ length: 10 }, (_, i) => {
        const date = new Date(2024, 2, 1); // March 1, 2024
        date.setDate(date.getDate() + i * 3);
        return {
          id: `task-${i + 1}`,
          title: `Task ${i + 1}`,
          description: `Scheduled task ${i + 1}`,
          dueDate: date,
          status: "pending" as const,
          assignee: "Alice",
          priority: "medium" as const,
        };
      }),
    ),
    dateColumn: "dueDate",
    titleColumn: "title",
  },
};

/**
 * Calendar with tasks using different date formats
 */
export const MixedDateFormats: Story = {
  args: {
    rows: createMockRows([
      {
        id: "1",
        title: "Task with Date object",
        description: "Uses Date object",
        dueDate: new Date(),
        status: "pending",
        assignee: "Alice",
        priority: "high",
      },
      {
        id: "2",
        title: "Task with ISO string",
        description: "Uses ISO date string",
        dueDate: new Date(new Date().setDate(new Date().getDate() + 5)),
        status: "in-progress",
        assignee: "Bob",
        priority: "medium",
      },
      {
        id: "3",
        title: "Task with custom date",
        description: "Uses custom date format",
        dueDate: new Date(new Date().setDate(new Date().getDate() - 3)),
        status: "completed",
        assignee: "Carol",
        priority: "low",
      },
    ]),
    dateColumn: "dueDate",
    titleColumn: "title",
  },
};
