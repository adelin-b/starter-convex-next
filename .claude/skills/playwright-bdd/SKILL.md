---
name: playwright-bdd
description: >-
  Use when writing E2E tests with Gherkin/BDD. Covers feature file structure,
  declarative steps, scenario independence.
targets:
  - '*'
---
# Playwright BDD Patterns

This skill documents BDD/Gherkin patterns for VroomMarket E2E tests: feature file structure, scenario design, and step definitions.

## Core Principles

Feature files serve three purposes: **specifications**, **documentation**, **tests**. Write Gherkin so that people who don't know the feature will understand it. Declarative steps survive UI changes while imperative steps break with every refactor.

## Project Structure

```
apps/e2e/
├── tests/
│   ├── features/           # Gherkin feature files
│   │   ├── auth/           # Domain: authentication
│   │   ├── vehicles/       # Domain: vehicle management
│   │   ├── homepage/       # Domain: landing page
│   │   └── navigation/     # Domain: site navigation
│   └── steps/              # Step definitions (TypeScript)
├── playwright.config.ts
└── package.json
```

**Workflow**: Feature → `bunx bddgen` → Step stubs → Implement steps → `bun run test:e2e`

## Cardinal Rules

### Rule 1: One Scenario = One Behavior

Single When clause triggers single behavior. Multiple Whens should be split into separate scenarios.

```gherkin
# Improvement needed - two behaviors
Scenario: Search and filter
  When user searches "car"
  Then results appear
  When user clicks filter
  Then filtered results appear

# Recommended approach - independent scenarios
Scenario: Search returns results
  Given search page displayed
  When user searches "car"
  Then car-related results shown

Scenario: Filter narrows results
  Given search results for "car" displayed
  When user applies price filter
  Then filtered results shown
```

### Rule 2: Declarative > Imperative

Describe WHAT not HOW. Steps survive UI changes.

```gherkin
# Improvement needed - tied to UI mechanics
When I click username field
And I type "user@test.com"
And I click password field
And I type "pass123"
And I click login button

# Recommended approach - behavior focused
When I sign in with email "user@test.com" and password "pass123"
```

### Rule 3: Scenario Independence

Each scenario self-contained. No dependency on previous scenario state.

```gherkin
# Improvement needed - depends on previous scenario
Scenario: Create account
  When I create account "TestUser"
  Then account exists

Scenario: Login
  When I login as "TestUser"  # Assumes account from above
  Then I see dashboard

# Recommended approach - self-contained
Scenario: Login to existing account
  Given an account "TestUser" exists  # Own precondition
  When I login as "TestUser"
  Then I see dashboard
```

## Given-When-Then Separation

| Keyword     | Purpose             | Tense                        |
|-------------|---------------------|------------------------------|
| **Given**   | Preconditions/state | Present ("is", "has")        |
| **When**    | Action/trigger      | Active ("submits", "clicks") |
| **Then**    | Outcomes/assertions | Present ("is displayed")     |
| **And/But** | Continues previous  | Same as above                |

**Important**: Assertions belong ONLY in Then clauses.

## Feature File Structure

```gherkin
@domain-tag @smoke
Feature: Feature Name
  As a [role]
  I want [capability]
  So that [benefit]

  Background:
    Given common setup for ALL scenarios  # Max 4 lines
    And another shared precondition

  Scenario: Descriptive behavior title
    Given specific precondition
    When action performed
    Then expected outcome
```

## Quick Checks

- **Step count**: 3-5 steps ideal, max 10
- **Step length**: 80-120 chars per step
- **Background**: Max 4 lines, only Given steps
- **Titles**: Describe behavior, not test actions

```gherkin
# Good titles - describes behavior
Scenario: Free subscribers see only free articles
Scenario: Login fails after three incorrect attempts

# Improvement needed - vague/test-focused
Scenario: Test login
Scenario: TC001
Scenario: Happy path
```

## Test Data Guidelines

```gherkin
# Recommended - realistic, minimal
When I sign up with email "user@example.com" and password "SecurePass123"

# Improvement needed - fake-looking
When I sign up with email "a@b.c" and password "123"

# Improvement needed - sensitive
When I sign in as "admin@realcompany.com" with password "RealPassword!"
```

## Anti-Patterns Quick Reference

| Issue                                 | Confidence | Recommendation        |
|---------------------------------------|------------|-----------------------|
| Imperative steps (click, type, field) | 95         | Abstract to behavior  |
| Multiple When clauses                 | 90         | Split scenarios       |
| Missing feature description           | 85         | Add As/I want/So that |
| Assertions in Given/When              | 90         | Move to Then          |
| Scenario depends on previous          | 90         | Add own Given setup   |
| Generic title ("Test login")          | 80         | Describe behavior     |
| Background > 4 lines                  | 75         | Split or use Given    |
| > 10 steps in scenario                | 80         | Abstract or split     |

## Existing VroomMarket Steps

Common steps already defined in `apps/e2e/tests/steps/`:

```gherkin
# Navigation
Given I am on the {page} page
When I navigate to {page}

# Auth
Given I have an account with email {string} and password {string}
When I sign in with email {string} and password {string}
When I sign up with name {string}, email {string} and password {string}
Then I should be logged in
Then I should be logged out
And I log out

# Assertions
Then I should see {string}
Then I should see validation error {string}
Then I should see an authentication error
Then I should not see {string}
```

**Reference**: `apps/e2e/tests/features/auth/auth.feature` - Gold standard for this project.

## Debugging: type() vs fill() for Controlled Inputs

**Issue**: React controlled inputs (especially with react-hook-form) may not trigger `onChange` with Playwright's `fill()`.

**Symptom**: Form submits empty values even though `fill()` was called.

**Solution**: Use `page.type()` or `page.locator().type()` instead of `fill()` for inputs managed by react-hook-form or other controlled input libraries.

```typescript
// Correct: Use type() for controlled inputs
await page.locator("#email").type("user@example.com");
await page.locator("#password").type("password123");

// May not work with controlled inputs
await page.fill("#email", "user@example.com");
```

**Why?**
`fill()` directly sets `input.value` without triggering synthetic events. React controlled inputs rely on `onChange` events to update their state. `type()` simulates actual keyboard input, firing `onChange` for each character.

**When to use each**:
- **type()**: React-controlled inputs (react-hook-form, useState-managed inputs)
- **fill()**: Native HTML inputs, non-React forms, simple inputs
- **If unsure**: Use `type()` - it's slower but more reliable

**Related Playwright docs**: https://playwright.dev/docs/api/class-locator#locator-type

## Project Context

**Feature files**: `apps/e2e/tests/features/`
**Step definitions**: `apps/e2e/tests/steps/`
**Config**: `apps/e2e/playwright.config.ts`

**Commands**:
- `bunx bddgen` - Generate step stubs from features
- `bun run test:e2e` - Run all E2E tests
- `bun run test:e2e:ui` - Run with Playwright UI
