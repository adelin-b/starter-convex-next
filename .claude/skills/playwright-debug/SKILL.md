---
name: playwright-debug
description: >-
  This skill should be used when debugging UI issues, testing frontend features,
  or reproducing bugs visually. It leverages Playwright MCP to navigate,
  interact, capture screenshots, inspect console/network, and iterate on
  hypotheses.
targets:
  - '*'
---
# Playwright Debug Skill

Automates UI debugging workflow using Playwright MCP for visual testing and diagnosis.

## When to Use

- Debugging frontend rendering issues
- Testing user flows (login, forms, navigation)
- Reproducing reported bugs
- Inspecting console errors and network requests
- Verifying fixes work before marking complete

## Workflow

### Phase 1: Setup
1. Navigate to target URL using `mcp__playwright__browser_navigate`
2. Take initial snapshot with `mcp__playwright__browser_snapshot`
3. Check for console errors with `mcp__playwright__browser_console_messages`

### Phase 2: Reproduce
1. Interact with page elements via `mcp__playwright__browser_click`, `mcp__playwright__browser_type`
2. Wait for expected states with `mcp__playwright__browser_wait_for`
3. Capture network requests with `mcp__playwright__browser_network_requests`

### Phase 3: Diagnose
1. Take screenshot on failure: `mcp__playwright__browser_take_screenshot`
2. Check console for errors: `mcp__playwright__browser_console_messages` with `onlyErrors: true`
3. Evaluate JS expressions: `mcp__playwright__browser_evaluate`

### Phase 4: Verify Fix
1. Apply code changes
2. Refresh and re-test the flow
3. Confirm no console errors
4. Take "after" screenshot for comparison

## Key Commands

```
# Navigate to page
mcp__playwright__browser_navigate(url: "http://localhost:3000/page")

# Get accessibility snapshot (better than screenshot for understanding structure)
mcp__playwright__browser_snapshot()

# Click element by ref from snapshot
mcp__playwright__browser_click(element: "Login button", ref: "button[0]")

# Type into input
mcp__playwright__browser_type(element: "Email input", ref: "input[0]", text: "test@example.com")

# Check console errors
mcp__playwright__browser_console_messages(onlyErrors: true)

# Screenshot for debugging
mcp__playwright__browser_take_screenshot(filename: "debug-screenshot.png")

# Wait for element/text
mcp__playwright__browser_wait_for(text: "Welcome")
```

## Best Practices

- Always get snapshot before interacting (refs change after interactions)
- Check console errors after each navigation
- Use `wait_for` before assertions
- Screenshot failures for evidence
- Close browser when done: `mcp__playwright__browser_close`

## Integration with Evidence-Based Debugging

This skill follows the anti-hallucination protocol:
1. INVESTIGATE: Navigate, snapshot, check console
2. ANALYZE: Document findings from console/network
3. HYPOTHESIZE: Form theory based on evidence
4. IMPLEMENT: Fix code
5. VERIFY: Re-test with Playwright, confirm fix
