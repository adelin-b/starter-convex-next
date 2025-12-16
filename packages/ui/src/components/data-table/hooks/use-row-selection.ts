import type { Table as TanStackTable } from "@tanstack/react-table";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Hook for managing row selection with Shift+Click range selection support
 *
 * Features:
 * - Tracks Shift key state for range selection
 * - Handles individual row toggle
 * - Supports range selection (Shift+Click)
 * - Manages keyboard event listeners
 *
 * @param table - TanStack Table instance
 * @param enableSelection - Whether selection is enabled
 * @returns Object with selection handler and state
 */
export function useRowSelection<TData>(table: TanStackTable<TData>, enableSelection: boolean) {
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  const shiftKeyRef = useRef(false);

  // Track Shift key state
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Shift") {
      shiftKeyRef.current = true;
    }
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.key === "Shift") {
      shiftKeyRef.current = false;
    }
  }, []);

  // Setup keyboard listeners
  useEffect(() => {
    if (enableSelection) {
      globalThis.addEventListener("keydown", handleKeyDown);
      globalThis.addEventListener("keyup", handleKeyUp);

      return () => {
        globalThis.removeEventListener("keydown", handleKeyDown);
        globalThis.removeEventListener("keyup", handleKeyUp);
      };
    }
  }, [enableSelection, handleKeyDown, handleKeyUp]);

  // Handle individual row selection with range support
  const handleRowSelection = useCallback(
    (rowIndex: number) => {
      const row = table.getRowModel().rows[rowIndex];
      if (!row) {
        return;
      }

      // Shift+Click: Range selection
      if (shiftKeyRef.current && lastSelectedIndex !== null) {
        const start = Math.min(lastSelectedIndex, rowIndex);
        const end = Math.max(lastSelectedIndex, rowIndex);

        // Select all rows in range
        for (let index = start; index <= end; index += 1) {
          const rangeRow = table.getRowModel().rows[index];
          if (rangeRow) {
            rangeRow.toggleSelected(true);
          }
        }
      }
      // Regular click: Toggle individual row
      else {
        row.toggleSelected();
        setLastSelectedIndex(rowIndex);
      }
    },
    [table, lastSelectedIndex],
  );

  return {
    handleRowSelection,
    lastSelectedIndex,
    shiftKeyRef,
  };
}
