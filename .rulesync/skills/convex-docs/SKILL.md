---
name: convex-docs
description: >-
  This skill should be used when working with Convex backend, answering
  questions about Convex features, or when documentation references are needed.
  It provides accurate Convex documentation lookup and generates text-fragment
  URLs for citations.
targets:
  - '*'
---
# Convex Documentation Skill

Provides Convex documentation lookup and proper citation with text-fragment URLs.

## When to Use

- Answering questions about Convex features
- Implementing Convex functions (queries, mutations, actions)
- Configuring Convex (schema, auth, HTTP)
- Citing Convex behavior with documentation links

## Documentation Lookup

Use Context7 MCP to fetch Convex docs:

```
mcp__context7__resolve-library-id(libraryName: "convex")
mcp__context7__get-library-docs(context7CompatibleLibraryID: "/convex/convex", topic: "queries")
```

## Text Fragment URLs

When citing Convex documentation, use text-fragments format:

```
https://docs.convex.dev/PAGE#:~:text=EXACT_TEXT
```

### Examples

**Environment Variables:**
```
https://docs.convex.dev/production/environment-variables#:~:text=CONVEX_SITE_URL
```

**Function Types:**
```
https://docs.convex.dev/functions/query-functions#:~:text=Queries%20are%20the%20bread%20and%20butter
```

**Schema Definition:**
```
https://docs.convex.dev/database/schemas#:~:text=defineSchema
```

## Key Convex Concepts

### Built-in Environment Variables
Convex automatically provides in functions:
- `CONVEX_SITE_URL` - HTTP Actions base URL
  - [Docs](https://docs.convex.dev/functions/http-actions#:~:text=CONVEX_SITE_URL)
- `CONVEX_CLOUD_URL` - Client connection URL
  - [Docs](https://docs.convex.dev/production/hosting#:~:text=CONVEX_CLOUD_URL)

### Function Types
- **Queries** - Read-only, cached, reactive
  - [Docs](https://docs.convex.dev/functions/query-functions#:~:text=Queries%20are%20the%20bread%20and%20butter)
- **Mutations** - Write operations, transactional
  - [Docs](https://docs.convex.dev/functions/mutation-functions#:~:text=Mutations%20are%20used%20to%20modify)
- **Actions** - Side effects, external APIs
  - [Docs](https://docs.convex.dev/functions/actions#:~:text=Actions%20can%20call%20third-party)
- **HTTP Actions** - REST endpoints
  - [Docs](https://docs.convex.dev/functions/http-actions#:~:text=HTTP%20actions%20allow)

### Schema
```typescript
// packages/backend/convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  vehicles: defineTable({
    make: v.string(),
    model: v.string(),
    year: v.number(),
  }),
});
```
[Schema Docs](https://docs.convex.dev/database/schemas#:~:text=defineSchema)

### Better-Auth Integration
This project uses Better-Auth with Convex adapter:
- Auth config in `packages/backend/convex/auth.ts`
- HTTP routes in `packages/backend/convex/http.ts`

## Common Documentation Topics

| Topic            | URL                                                        |
|------------------|------------------------------------------------------------|
| Queries          | <https://docs.convex.dev/functions/query-functions>        |
| Mutations        | <https://docs.convex.dev/functions/mutation-functions>     |
| Actions          | <https://docs.convex.dev/functions/actions>                |
| HTTP Actions     | <https://docs.convex.dev/functions/http-actions>           |
| Schema           | <https://docs.convex.dev/database/schemas>                 |
| Indexes          | <https://docs.convex.dev/database/indexes>                 |
| File Storage     | <https://docs.convex.dev/file-storage>                     |
| Authentication   | <https://docs.convex.dev/auth>                             |
| Environment Vars | <https://docs.convex.dev/production/environment-variables> |
| Deployment       | <https://docs.convex.dev/production>                       |

## Best Practices

1. Always cite documentation with URLs
2. Use text-fragments for specific quotes
3. Verify claims against actual docs via Context7
4. Check Convex version compatibility
5. Reference project schema at `packages/backend/convex/schema.ts`
