# Starter Convex Next.js SaaS Template

A production-ready SaaS starter template built with Next.js, Convex, and Better-Auth.

## Features

- **🔐 Authentication** - Email/password, magic links, OAuth (Google, GitHub)
- **🏢 Multi-tenancy** - Organizations with member management and role-based access
- **📧 Email System** - React Email templates with Resend integration
- **🎨 UI Components** - shadcn/ui with Tailwind CSS
- **📝 TypeScript** - Full type safety with Zod validation
- **🧪 Testing** - Vitest unit tests + Playwright E2E tests
- **🔧 Developer Experience** - Biome linting, Husky hooks, Turborepo

## Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | Next.js 15, React 19, TailwindCSS |
| Backend | Convex (real-time database) |
| Auth | Better-Auth |
| Email | React Email, Resend |
| Testing | Vitest, Playwright |
| Tooling | Turborepo, Biome, TypeScript |

## Quick Start

### 1. Run the Setup Wizard

```bash
bun setup.ts
```

This interactive wizard will:
- Install dependencies
- Configure Convex backend
- Generate auth secrets
- Set up OAuth providers (optional)
- Configure email (optional)

### 2. Start Development

```bash
bun run dev
```

Open [http://localhost:3001](http://localhost:3001) to see your app.

## Manual Setup

If you prefer manual setup:

```bash
# Install dependencies
bun install

# Set up Convex
cd packages/backend && bunx convex dev --once

# Create .env.local with your secrets (see .env.example)
cp .env.example .env.local

# Start development
bun run dev
```

## Project Structure

```
├── apps/
│   ├── web/              # Next.js frontend
│   ├── e2e/              # Playwright E2E tests
│   └── storybook/        # Component documentation
├── packages/
│   ├── backend/          # Convex schema & functions
│   │   └── convex/
│   │       ├── schema.ts     # Database schema
│   │       ├── todos.ts      # Example CRUD
│   │       ├── organizations.ts
│   │       ├── invitations.ts
│   │       └── auth.ts
│   ├── ui/               # Shared UI components
│   ├── shared/           # Shared utilities
│   └── emails/           # React Email templates
└── setup.ts              # Setup wizard
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start all apps in development |
| `bun run dev:web` | Start web app only |
| `bun run dev:server` | Start Convex backend only |
| `bun run build` | Build all apps |
| `bun run test` | Run unit tests |
| `bun run test:e2e` | Run E2E tests |
| `bun run check` | Run linting & type checking |

## Schema Overview

The template includes these data models:

### Todos (Example Domain)
```typescript
{
  title: string
  description?: string
  status: "pending" | "in_progress" | "completed"
  priority?: "low" | "medium" | "high"
  userId: string
  organizationId?: Id<"organizations">
}
```

### Organizations (Multi-tenancy)
```typescript
{
  name: string
  description?: string
  status: "active" | "inactive"
}
```

### Organization Members
```typescript
{
  userId: string
  organizationId: Id<"organizations">
  roles: ("member" | "admin" | "owner")[]
}
```

## Environment Variables

See `.env.example` for all required variables:

```env
# Convex
CONVEX_URL=https://xxx.convex.cloud

# Better Auth
BETTER_AUTH_SECRET=your-secret-here
SITE_URL=http://localhost:3001

# OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Email (optional)
RESEND_API_KEY=
EMAIL_FROM=noreply@yourdomain.com
```

## Customization

### Replace "Todos" with Your Domain

1. Update `packages/backend/convex/schema.ts` with your models
2. Create CRUD functions in `packages/backend/convex/`
3. Update web app pages in `apps/web/src/app/`

### Add New Features

```bash
# Add more Better-T-Stack features
bunx create-better-t-stack add
```

Available addons: PWA, Tauri, Fumadocs, Starlight

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy!

### Manual

```bash
bun run build
# Deploy apps/web/.next to your hosting
```

## Documentation

- [Convex Docs](https://docs.convex.dev)
- [Better-Auth Docs](https://www.better-auth.com)
- [Next.js Docs](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com)

## License

MIT
