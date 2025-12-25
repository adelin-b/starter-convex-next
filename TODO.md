# StarterSaaS TODO - DataTable & UI Improvements

## ✅ Completed

### Type Safety
- [x] Added `assertNever` exhaustiveness check to ConnectionStatusOverlay
- [x] Connection state switch statement is now compile-safe

### DataTable Reactivity
- [x] Added `getRowId: (row) => row._id || row.id` to DataTable for proper row tracking
- [x] Added `key={id-status}` to vehicle status Select to force remount on change
- [x] Vehicle status updates should now reflect immediately without view switch

### Code Organization
- [x] Created `packages/ui/src/lib/table-utils.ts` with:
  - `DEFAULT_TABLE_CONFIG` constant
  - `STANDARD_VIEWS` and `EXTENDED_VIEWS` arrays
- [x] Removed Dashboard and Home pages
- [x] Updated all redirects from `/dashboard` to `/vehicles`
- [x] Removed `LayoutGroup` from providers (causing framer-motion dependency issue)

## ⚠️ Critical Issues - Needs Testing

### 1. DataTable Filters Not Working
**Status**: Configured but untested

**What's configured**:
- `enableGlobalFilter: true` in table config
- `getFilteredRowModel()` included
- Toolbar should connect to `globalFilter` state

**Need to verify**:
- Does search input update `globalFilter` state?
- Does toolbar filter panel work?
- Are filters applied to rows?

**Files to check**:
- `packages/ui/src/components/data-table/components/data-table-toolbar.tsx`
- `packages/ui/src/components/data-table/hooks/use-table-state.ts`

### 2. DataTable Sorting Not Working
**Status**: Configured but untested

**What's configured**:
- `enableSorting: true` in table config
- `getSortedRowModel()` included
- Columns have `accessorKey` for sorting

**Need to verify**:
- Can you click column headers to sort?
- Does sort indicator appear?
- Are sorted rows actually reordered?

**Possible issues**:
- Columns might need explicit `enableSorting: true` per column
- Custom cells might need `sortingFn` for complex data

### 3. Vehicle Status Update
**Status**: Fixed in code, needs runtime testing

**What was fixed**:
- Added `key={id-status}` to force Select remount
- Added `getRowId` for proper row identity

**Need to verify**:
- Change vehicle status in dropdown
- Does UI update immediately?
- Or do you still need to switch views?

## 🔨 TODO - High Priority

### 1. Extract Column Definitions
**Current state**: Duplicated across 3 pages

**Files with duplication**:
- `apps/web/src/app/(dashboard)/admin/agencies/page.tsx` (useAgencyColumns)
- `apps/web/src/app/(dashboard)/admin/agencies/[id]/members/page.tsx` (useMemberColumns)
- `apps/web/src/app/(dashboard)/vehicles/page.tsx` (useVehicleColumns)

**Pattern to extract**:
```typescript
// All columns follow this pattern:
{
  id: "name",
  accessorKey: "name",
  header: intl.formatMessage({ id: "...", defaultMessage: "..." }),
  cell: ({ row }) => <Component>{row.original.field}</Component>,
}
```

**Recommendation**:
- Create column factory functions in each page
- Or use `table-utils.ts` helpers more extensively

### 2. Fix Missing Translations
**Status**: Not audited

**Need to**:
- Grep for all `FormattedMessage` and `intl.formatMessage` calls
- Check if all message IDs exist in locale files
- Add missing translations to `apps/web/src/locales/en.json` and `fr.json`

**Files to audit**:
- All 3 DataTable pages
- Connection status overlay
- Auth components

### 3. Apply Table Utils to Pages
**Status**: Created but not used

**What to do**:
- Refactor agencies page to use `DEFAULT_TABLE_CONFIG`
- Refactor members page to use `DEFAULT_TABLE_CONFIG`
- Refactor vehicles page to use `DEFAULT_TABLE_CONFIG`

**Before**:
```typescript
<DataTable
  enableSearch
  enableSorting
  enablePagination
  enableViewSwitcher
  defaultView="table"
  // ... etc
/>
```

**After**:
```typescript
<DataTable
  {...DEFAULT_TABLE_CONFIG}
  enabledViews={STANDARD_VIEWS}
  // ... only custom overrides
/>
```

### 4. Members Page - Add GroupBy
**Status**: Not implemented

**Requirement**: Use DataTable's `groupBy` functionality on members page

**Questions**:
- Group by what field? (Agency? Role?)
- What does grouped view look like?
- Should it be optional or default?

**Files to modify**:
- `apps/web/src/app/(dashboard)/admin/agencies/[id]/members/page.tsx`

### 5. Multiple DataTables Per Agency
**Status**: Requirement unclear

**Question**: What does "show multiples datable per agencies" mean?
- One table per agency on agencies list page?
- Multiple tables on single agency detail page?
- Something else?

**Need clarification before implementing**

## 🔍 TODO - Medium Priority

### 1. Deduplicate DataTable Configuration
**Current state**: Each page has inline config

**Recommendation**:
```typescript
// Create in shared/src/datatable-config.ts or each page
export const AGENCY_TABLE_CONFIG = {
  ...DEFAULT_TABLE_CONFIG,
  enabledViews: STANDARD_VIEWS,
  searchPlaceholder: "Search agencies...",
  emptyStateMessage: "No agencies found.",
} as const;
```

### 2. Add Column Helpers
**Status**: Basic helper exists, need more

**What's needed**:
```typescript
// In table-utils.ts
export function createLocalizedColumn<TData>(params: {
  id: string;
  messageId: string;
  defaultMessage: string;
  intl: IntlShape;
  cell?: ColumnDef<TData>['cell'];
}): ColumnDef<TData>
```

**Problem**: Need `react-intl` types in UI package

**Options**:
- Add `react-intl` as peer dep to UI package
- Keep helpers in app code, not shared

### 3. Test E2E Updates
**Status**: Deferred (UI still being defined)

**What needs updating when ready**:
- All `/dashboard` references → `/vehicles`
- Auth flow expectations
- Navigation test expectations

## 📝 Notes

### Why Vehicle Status Might Not Update

The original issue was that changing vehicle status didn't update UI until view switch. This happened because:

1. **Convex is reactive** ✅ - Query updates when data changes
2. **TanStack Table sees new data** ✅ - `data` prop changes
3. **Select component doesn't remount** ❌ - React sees same component tree
4. **Controlled value doesn't trigger update** ❌ - `value` prop updates but component doesn't know

**The fix**:
- Added `key={id-status}` to Select
- Forces React to unmount old Select and mount new one
- New Select has updated `value` prop from the start

### Why Filters/Sorting Might Not Work

Both are configured correctly in the table, but:

**Filters**:
- Toolbar needs to call `setGlobalFilter(value)`
- Filter state needs to flow to table's `state.globalFilter`
- `getFilteredRowModel()` applies the filter

**Sorting**:
- Column headers need click handlers
- Click needs to call `setSorting([{ id, desc }])`
- Sort state needs to flow to table's `state.sorting`
- `getSortedRowModel()` applies the sort

**Both need manual testing to verify the connections work**

## 🚀 Next Steps

1. **Kill hanging processes**:
   ```bash
   lsof -ti:2223 | xargs kill -9
   lsof -ti:3001 | xargs kill -9
   ```

2. **Start clean dev server**:
   ```bash
   bun run dev:web
   ```

3. **Manual testing checklist**:
   - [ ] Navigate to `/vehicles`
   - [ ] Change a vehicle status
   - [ ] Verify UI updates immediately (no view switch needed)
   - [ ] Try global search - does it filter rows?
   - [ ] Try clicking column headers - does it sort?
   - [ ] Switch between table/list/gallery views
   - [ ] Navigate to `/admin/agencies`
   - [ ] Test search and sort there too
   - [ ] Navigate to agency members page
   - [ ] Test search and sort there too

4. **Fix any failing tests**:
   - Check console for errors
   - Check network tab for failed requests
   - Add logs to track state updates

5. **Document findings and iterate**
