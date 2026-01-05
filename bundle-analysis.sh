#!/bin/bash
set -e

echo "=== Starting bundle analysis ==="

# Navigate to project root
cd "/Users/adelinb/Documents/Projects/vroom/better-vroommarket"

# Run build
echo "Building Next.js app..."
/opt/homebrew/bin/bun run build

# Check if build succeeded
if [ $? -eq 0 ]; then
    echo "Build successful!"

    # Find production bundles
    echo ""
    echo "=== Production bundle files ==="
    find apps/web/.next/static/chunks -name "*.js" -type f 2>/dev/null | head -20

    echo ""
    echo "=== Searching for backend code leakage ==="

    # Search for backend-specific patterns
    echo "Searching for 'mutation' handlers..."
    grep -r "mutation" apps/web/.next/static/chunks/*.js 2>/dev/null | head -5 || echo "None found"

    echo ""
    echo "Searching for 'query' handlers..."
    grep -r "query" apps/web/.next/static/chunks/*.js 2>/dev/null | head -5 || echo "None found"

    echo ""
    echo "Searching for 'convex/server' imports..."
    grep -r "convex/server" apps/web/.next/static/chunks/*.js 2>/dev/null | head -5 || echo "None found"

    echo ""
    echo "Searching for '.table' property (zodTable internals)..."
    grep -r "\.table" apps/web/.next/static/chunks/*.js 2>/dev/null | head -5 || echo "None found"

    echo ""
    echo "Searching for 'defineSchema'..."
    grep -r "defineSchema" apps/web/.next/static/chunks/*.js 2>/dev/null | head -5 || echo "None found"

    echo ""
    echo "=== Bundle analysis complete ==="
else
    echo "Build failed!"
    exit 1
fi
