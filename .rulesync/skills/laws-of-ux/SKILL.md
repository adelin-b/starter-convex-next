---
name: laws-of-ux
description: >-
  Review UI/UX implementations against 30 established design principles from
  lawsofux.com
targets:
  - '*'
---
# Laws of UX - Design Review Skill

Use this skill to review UI/UX implementations against established design principles.

**Source**: [Laws of UX](https://lawsofux.com/) by Jon Yablonski

## How to Use This Skill

When reviewing a feature's UX:
1. Read the relevant component files
2. Check against each applicable law below
3. Report violations with severity (Critical/Important/Minor)
4. Suggest specific improvements

---

## The 30 Laws

### 1. Aesthetic-Usability Effect
> Users perceive aesthetically pleasing design as more usable.

**Review checklist:**
- [ ] Visual hierarchy is clear and professional
- [ ] Consistent spacing, colors, and typography
- [ ] No jarring or amateur visual elements
- [ ] Loading/error states maintain visual quality

### 2. Choice Overload (Paradox of Choice)
> Too many options overwhelm users and reduce satisfaction.

**Review checklist:**
- [ ] Forms have ≤7 visible options per group
- [ ] Dropdown menus aren't excessively long
- [ ] Primary actions are clearly distinguished
- [ ] Progressive disclosure hides advanced options

### 3. Chunking
> Break information into meaningful groups.

**Review checklist:**
- [ ] Related fields are visually grouped
- [ ] Long forms use sections/steps
- [ ] Lists are organized logically
- [ ] Phone numbers, IDs formatted in chunks

### 4. Cognitive Bias
> Systematic thinking errors affect user decisions.

**Review checklist:**
- [ ] Default options are user-beneficial
- [ ] Social proof used ethically
- [ ] Anchoring isn't manipulative
- [ ] Loss framing is appropriate

### 5. Cognitive Load
> Minimize mental effort required to use the interface.

**Review checklist:**
- [ ] Labels are clear and concise
- [ ] Actions are self-explanatory
- [ ] No unnecessary steps or decisions
- [ ] Complex operations have guidance

### 6. Doherty Threshold
> System response should be <400ms to maintain engagement.

**Review checklist:**
- [ ] Actions provide immediate feedback
- [ ] Loading states appear for operations >100ms
- [ ] Skeleton loaders for content loading
- [ ] Optimistic updates where appropriate

### 7. Fitts's Law
> Target acquisition time = f(distance, size).

**Review checklist:**
- [ ] Buttons are large enough (min 44×44px touch)
- [ ] Important actions are easily reachable
- [ ] Related actions are positioned close together
- [ ] Destructive actions aren't too close to primary

### 8. Flow
> Maintain engagement without frustration or boredom.

**Review checklist:**
- [ ] Tasks feel completable
- [ ] Challenge matches user skill level
- [ ] Feedback is immediate and relevant
- [ ] Interruptions are minimized

### 9. Goal-Gradient Effect
> Motivation increases as users approach completion.

**Review checklist:**
- [ ] Progress indicators for multi-step flows
- [ ] Completed steps are visually marked
- [ ] Remaining effort is clear
- [ ] Celebrate completion appropriately

### 10. Hick's Law
> Decision time increases with number/complexity of choices.

**Review checklist:**
- [ ] Limited options per screen (aim for ≤7)
- [ ] Most important actions most prominent
- [ ] Complex choices broken into steps
- [ ] Smart defaults reduce decisions

### 11. Jakob's Law
> Users expect your site to work like others they know.

**Review checklist:**
- [ ] Standard UI patterns used (nav, forms, buttons)
- [ ] Familiar icons and symbols
- [ ] Expected behaviors (links, buttons, inputs)
- [ ] No "creative" reinvention of solved problems

### 12. Law of Common Region
> Elements in defined boundaries are perceived as grouped.

**Review checklist:**
- [ ] Cards contain related information
- [ ] Sections have clear boundaries
- [ ] Modal content is contained
- [ ] Form sections use visual containers

### 13. Law of Proximity
> Close objects are perceived as related.

**Review checklist:**
- [ ] Related elements are positioned together
- [ ] Unrelated elements have clear separation
- [ ] Labels are close to their inputs
- [ ] Button groups have appropriate spacing

### 14. Law of Prägnanz (Simplicity)
> Users interpret interfaces in the simplest way possible.

**Review checklist:**
- [ ] Visual elements are unambiguous
- [ ] Icons are universally understood
- [ ] No dual interpretations possible
- [ ] Simplest design achieves the goal

### 15. Law of Similarity
> Similar elements are perceived as related.

**Review checklist:**
- [ ] Same-function elements look identical
- [ ] Different-function elements look different
- [ ] Color coding is consistent
- [ ] Interactive elements are visually consistent

### 16. Law of Uniform Connectedness
> Connected elements are perceived as more related.

**Review checklist:**
- [ ] Lines/arrows show relationships
- [ ] Shared backgrounds group elements
- [ ] Borders connect related items
- [ ] Visual connections are meaningful

### 17. Mental Model
> Interfaces should match user expectations.

**Review checklist:**
- [ ] Terminology matches user vocabulary
- [ ] Workflows match real-world processes
- [ ] Metaphors are appropriate
- [ ] No expert jargon for novice users

### 18. Miller's Law
> Working memory holds 7±2 items.

**Review checklist:**
- [ ] Navigation has ≤7 main items
- [ ] Form sections have ≤7 fields visible
- [ ] Tabs/steps limited appropriately
- [ ] Critical info doesn't exceed memory

### 19. Occam's Razor
> Simpler solutions are preferred.

**Review checklist:**
- [ ] No unnecessary features
- [ ] Minimal steps to complete tasks
- [ ] UI elements serve clear purposes
- [ ] Complexity justified by clear benefit

### 20. Paradox of the Active User
> Users don't read instructions; they just start.

**Review checklist:**
- [ ] Interface is self-explanatory
- [ ] Empty states guide first actions
- [ ] Inline help, not manuals
- [ ] Errors include recovery guidance

### 21. Pareto Principle (80/20 Rule)
> 80% of usage comes from 20% of features.

**Review checklist:**
- [ ] Core features are most prominent
- [ ] Rarely-used features are accessible but not cluttering
- [ ] Primary paths are optimized
- [ ] Analytics guide feature priority

### 22. Parkinson's Law
> Tasks expand to fill available time.

**Review checklist:**
- [ ] Clear deadlines/timeouts shown
- [ ] Auto-save prevents data loss
- [ ] Session expiry is communicated
- [ ] Urgency cues where appropriate

### 23. Peak-End Rule
> Experience judged by peak moments and ending.

**Review checklist:**
- [ ] Success states are satisfying
- [ ] Completion messages are positive
- [ ] Error recovery is supportive
- [ ] Last impression is memorable

### 24. Postel's Law (Robustness Principle)
> Be liberal in input, conservative in output.

**Review checklist:**
- [ ] Flexible input formats accepted
- [ ] Validation is helpful, not punitive
- [ ] Edge cases handled gracefully
- [ ] Output is consistent and predictable

### 25. Selective Attention
> Users focus on what's relevant to their goal.

**Review checklist:**
- [ ] Critical elements stand out
- [ ] Distractions are minimized
- [ ] Important info isn't buried
- [ ] Visual hierarchy guides attention

### 26. Serial Position Effect
> Users remember first and last items best.

**Review checklist:**
- [ ] Most important items first/last
- [ ] Navigation puts key items at ends
- [ ] Lists front-load critical info
- [ ] Conclusions reinforce key points

### 27. Tesler's Law (Conservation of Complexity)
> Every system has irreducible complexity.

**Review checklist:**
- [ ] Complexity handled by system, not user
- [ ] Smart defaults reduce user burden
- [ ] Automation where possible
- [ ] Necessary complexity is well-documented

### 28. Von Restorff Effect (Isolation Effect)
> Distinctive items are remembered.

**Review checklist:**
- [ ] CTAs are visually distinct
- [ ] Warnings stand out appropriately
- [ ] Key information is highlighted
- [ ] Contrast used strategically

### 29. Working Memory
> Support users' limited cognitive capacity.

**Review checklist:**
- [ ] Context preserved across screens
- [ ] Preview before destructive actions
- [ ] Undo available for mistakes
- [ ] No need to memorize previous screens

### 30. Zeigarnik Effect
> Incomplete tasks are remembered better.

**Review checklist:**
- [ ] Drafts auto-save
- [ ] Progress is resumable
- [ ] Incomplete states are clear
- [ ] Motivation to complete is maintained

---

## Review Output Format

When reviewing a feature, report findings as:

```markdown
## UX Review: [Feature Name]

### Critical Issues
- **[Law Name]**: [Specific violation and location]
  - Impact: [Why this matters]
  - Fix: [Specific recommendation]

### Important Issues
- **[Law Name]**: [Specific violation and location]
  - Impact: [Why this matters]
  - Fix: [Specific recommendation]

### Minor Issues
- **[Law Name]**: [Specific violation and location]
  - Fix: [Specific recommendation]

### Strengths
- **[Law Name]**: [What's done well]
```

## Common Patterns to Watch

### Forms
- Fitts's Law: Button sizes and placement
- Chunking: Field grouping
- Cognitive Load: Number of required fields
- Postel's Law: Input validation flexibility

### Modals/Dialogs
- Choice Overload: Action button count
- Law of Proximity: Content organization
- Von Restorff: Primary action distinction
- Peak-End Rule: Confirmation messages

### Lists/Tables
- Miller's Law: Items per page
- Serial Position Effect: Column ordering
- Chunking: Pagination and grouping
- Selective Attention: Row highlighting

### Navigation
- Hick's Law: Menu item count
- Jakob's Law: Standard patterns
- Law of Common Region: Grouping
- Serial Position Effect: Item ordering

### Error States
- Cognitive Load: Error message clarity
- Peak-End Rule: Recovery experience
- Postel's Law: Graceful handling
- Paradox of Active User: Self-recovery guidance
