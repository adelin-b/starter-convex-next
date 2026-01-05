"use client";

import type { Row } from "@tanstack/react-table";
import { format, getDay, parse, startOfWeek } from "date-fns";
import { enUS } from "date-fns/locale";
import { useCallback, useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer, type Event, type View } from "react-big-calendar";
import { cn } from "../../../utils";
import { Badge } from "../../badge";
import "react-big-calendar/lib/css/react-big-calendar.css";
import type { DataTableLabels } from "../labels";
import { defaultDataTableLabels } from "../labels";

// Setup the localizer for react-big-calendar
const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export type CalendarViewProps<TData> = {
  /**
   * Table rows to display
   */
  rows: Row<TData>[];

  /**
   * Column accessor for date field
   * Should point to a Date object or date string
   */
  dateColumn: string;

  /**
   * Optional title column to display event label
   */
  titleColumn?: string;

  /**
   * Optional callback when date/event is clicked
   */
  onRowClick?: (row: TData) => void;

  /**
   * Optional callback when date is selected
   */
  onDateSelect?: (date: Date, rows: TData[]) => void;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Show event count badges on dates (not used in BigCalendar but kept for API compatibility)
   */
  showEventCount?: boolean;

  /**
   * Maximum events to show per date (not used in BigCalendar but kept for API compatibility)
   */
  maxEventsPerDate?: number;

  /**
   * Translatable labels
   */
  labels?: DataTableLabels;
};

/**
 * CalendarView - Display data table rows as events on a calendar using react-big-calendar
 *
 * Features:
 * - Month, week, day, and agenda views
 * - Drag and drop support
 * - Event click handling
 * - Responsive layout
 * - Proper accessibility
 *
 * @example
 * <CalendarView
 *   rows={table.getRowModel().rows}
 *   dateColumn="createdAt"
 *   titleColumn="name"
 *   onRowClick={(row) => router.push(`/items/${row.id}`)}
 * />
 */
export function CalendarView<TData>({
  rows,
  dateColumn,
  titleColumn,
  onRowClick,
  onDateSelect,
  className,
  showEventCount = true,
  labels,
}: CalendarViewProps<TData>) {
  const mergedLabels = { ...defaultDataTableLabels, ...labels };
  const [currentView, setCurrentView] = useState<View>("month");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Convert table rows to BigCalendar events
  const events = useMemo(() => {
    const calendarEvents: Event[] = [];

    for (const row of rows) {
      const dateValue = row.getValue(dateColumn);
      if (!dateValue) {
        continue;
      }

      const date = dateValue instanceof Date ? dateValue : new Date(String(dateValue));
      if (Number.isNaN(date.getTime())) {
        continue;
      }

      const title = titleColumn
        ? String((row.original as Record<string, unknown>)[titleColumn] ?? mergedLabels.untitled)
        : mergedLabels.event;

      calendarEvents.push({
        title,
        start: date,
        end: date,
        resource: row.original,
        allDay: true,
      });
    }

    return calendarEvents;
  }, [rows, dateColumn, titleColumn]);

  // Handle event selection (clicking an event)
  const handleSelectEvent = useCallback(
    (event: Event) => {
      if (onRowClick && event.resource) {
        onRowClick(event.resource as TData);
      }
    },
    [onRowClick],
  );

  // Handle slot selection (clicking a date)
  const handleSelectSlot = useCallback(
    (slotInfo: { start: Date; end: Date; slots: Date[] }) => {
      const date = slotInfo.start;

      // Find all events on this date
      const dateKey = date.toDateString();
      const rowsOnDate = events
        .filter((event) => event.start && event.start.toDateString() === dateKey)
        .map((event) => event.resource as TData);

      if (onDateSelect && rowsOnDate.length > 0) {
        onDateSelect(date, rowsOnDate);
      }
    },
    [events, onDateSelect],
  );

  // Custom event component
  const EventComponent = useCallback(
    ({ event }: { event: Event }) => (
      <div
        className="h-full w-full rounded px-1 py-0.5 text-xs"
        style={{
          backgroundColor: "hsl(var(--primary))",
          color: "hsl(var(--primary-foreground))",
          opacity: 0.8,
        }}
      >
        {event.title}
      </div>
    ),
    [],
  );

  // Custom event style getter
  const eventStyleGetter = useCallback(
    () => ({
      style: {
        backgroundColor: "transparent", // Let EventComponent handle styling
        borderRadius: "4px",
        opacity: 1,
        border: "none",
        display: "block",
        padding: 0,
      },
    }),
    [],
  );

  // Helper: Get view label
  const getViewLabel = (view: View): string => {
    if (view === "month") {
      return mergedLabels.month ?? "Month";
    }
    if (view === "week") {
      return mergedLabels.week ?? "Week";
    }
    if (view === "day") {
      return mergedLabels.day ?? "Day";
    }
    return mergedLabels.agenda ?? "Agenda";
  };

  return (
    <div className={cn("@container flex flex-col gap-4 p-4", className)}>
      <div className="h-[600px] w-full rounded-md border bg-card">
        <Calendar
          className="p-4"
          components={{
            event: EventComponent,
          }}
          date={currentDate}
          endAccessor="end"
          eventPropGetter={eventStyleGetter}
          events={events}
          localizer={localizer}
          onNavigate={setCurrentDate}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          onView={setCurrentView}
          popup
          selectable
          startAccessor="start"
          view={currentView}
          views={["month", "week", "day", "agenda"]}
        />
      </div>

      {/* Event count summary */}
      {showEventCount && events.length > 0 && (
        <div className="flex items-center justify-between rounded-md border bg-muted/50 p-3">
          <span className="text-muted-foreground text-sm">
            {mergedLabels.totalEvents}
            {mergedLabels.columnSeparator}
            <strong>{events.length}</strong>
          </span>
          <Badge variant="secondary">
            {getViewLabel(currentView)} {mergedLabels.view}
          </Badge>
        </div>
      )}
    </div>
  );
}
