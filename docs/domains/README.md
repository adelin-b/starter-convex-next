# Domain Documentation

This directory contains business domain documentation organized by bounded context.

## Structure

Each domain folder contains:
- `README.md` - Domain overview and business value
- `GLOSSARY.md` - Business terminology definitions
- `DDD-MAPPING.md` - Domain model, entities, invariants
- `features/` - Gherkin BDD scenarios (symlinked to e2e tests)

## Domains

- **admin/** - Agency and member management
- **auth/** - User authentication
- **homepage/** - Landing page
- **navigation/** - App navigation

## Usage

Feature files in `features/` are symlinked from `apps/e2e/tests/features/`.
Edit features here; tests run from e2e app.

```bash
# Run tests for a domain
bun run test:e2e -- --tags "@auth"
```
