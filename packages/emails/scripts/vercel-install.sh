#!/bin/bash
set -e

# Install monorepo dependencies
bun install --cwd ../..

# Build react-email preview
bun run build

# Remove lock files to avoid Next.js workspace detection issues
rm -f .react-email/package-lock.json .react-email/bun.lock
