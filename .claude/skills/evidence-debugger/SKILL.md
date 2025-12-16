---
name: evidence-debugger
description: >-
  This skill should be used when debugging any issue. It enforces the
  anti-hallucination protocol by requiring evidence gathering before proposing
  solutions. Use this for bugs, errors, performance issues, or unexpected
  behavior.
targets:
  - '*'
---
# Evidence-Based Debugger Skill

Enforces systematic debugging workflow to prevent hallucinated solutions.

## Core Principle

```
NEVER generate solutions before gathering evidence.
The AI predicts tokens based on patterns, not truth.
Force verification FIRST.
```

## Forbidden Patterns

These phrases signal premature conclusions - STOP if you catch yourself saying:
- "I got it! Here is the fix..."
- "The problem is clearly X..."
- "This should work..."
- "Obviously..." / "Clearly..." / "Simply..." / "Just..."

## Required Workflow

### Phase 1: INVESTIGATE (Gather Evidence)

```markdown
## INVESTIGATION

### Evidence Collection
1. [Read relevant files]
2. [Execute diagnostic commands]
3. [Check logs/console]
4. [Inspect actual behavior]
5. [Review recent git changes]
```

Tools to use:
- `Read` - Read source files
- `Grep` - Search for patterns
- `Bash` - Run diagnostic commands
- `mcp__playwright__*` - UI inspection
- `git log`, `git diff` - Recent changes

### Phase 2: ANALYZE (Reason from Evidence)

```markdown
## ANALYSIS

### Findings
1. File X shows: [actual content]
2. Command Y output: [actual output]
3. Logs show: [actual errors]
4. Behavior: [observed vs expected]

### Root Cause Determination
Evidence A: [specific evidence]
→ Indicates: [interpretation]

Evidence B: [specific evidence]
→ Contradicts hypothesis: [rejected idea]

**Conclusion**: Root cause is [X] because [evidence proves it]
```

### Phase 3: HYPOTHESIZE (Connect Evidence)

```markdown
## HYPOTHESIS

Based on evidence:
- Evidence A indicates X
- Evidence B rules out Y
- Evidence C confirms Z

Therefore: [root cause statement]
```

### Phase 4: IMPLEMENT (Only Now!)

```markdown
## SOLUTION

### Proposed Fix
Based on confirmed root cause [X]:
[implementation]

### Verification Plan
1. [Test command]
2. [Expected output]
```

### Phase 5: VERIFY (Confirm Fix)

```markdown
## VERIFICATION

✓ Test passes: [output]
✓ Behavior correct: [evidence]
✓ No regressions: [test results]
```

## Verification Checklist

Before claiming solution is correct:
- [ ] Executed tool calls to gather evidence
- [ ] Stated specific facts from outputs
- [ ] Cross-referenced multiple sources
- [ ] Tested hypothesis against evidence
- [ ] Ruled out alternatives
- [ ] Can cite evidence for each claim
- [ ] Verified fix works

**If cannot check all boxes → DO NOT GENERATE SOLUTION YET**

## Red Flags

Stop and investigate more if about to say:
- "Obviously..."
- "Clearly..."
- "It must be..."
- "Simply..."
- "Just..."
- "Should..."

## Template

```markdown
## INVESTIGATION

### Evidence Collection
[Tool calls here]

### Findings
1.
2.
3.

## ANALYSIS

### Root Cause Determination
Evidence:
→ Indicates:

**Conclusion**:

## SOLUTION

### Proposed Fix


### Verification Plan
1.
2.

## VERIFICATION
✓
```
