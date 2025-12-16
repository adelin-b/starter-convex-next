#!/bin/bash

echo "🔄 DevContainer post-start hook..."

# Find the workspace directory (either /workspace or /workspaces/*)
if [ -d "/workspace" ] && [ -f "/workspace/package.json" ]; then
	cd /workspace || exit 1
elif [ -f "package.json" ]; then
	# Already in correct directory
	:
else
	echo "⚠️  Cannot find package.json, skipping setup"
	exit 0
fi

# Re-install deps if needed (handles new packages since last start)
if [ -f "package.json" ]; then
	echo "📦 Checking dependencies..."
	bun install --frozen-lockfile || bun install
fi

# Start Convex dev server in background
echo "🚀 Starting Convex dev server..."

# Kill any existing Convex processes
pkill -f "convex dev" 2>/dev/null || true

# Start Convex in background
nohup bunx convex dev --once >/tmp/convex-dev.log 2>&1 &
CONVEX_PID=$!

echo "⏳ Waiting for Convex to initialize..."

# Wait for Convex to write env vars (max 30s)
TIMEOUT=30
ELAPSED=0
while [ $ELAPSED -lt $TIMEOUT ]; do
	if [ -f "packages/backend/.env.local" ] && grep -q "^CONVEX_URL=" "packages/backend/.env.local"; then
		echo "✅ Convex initialized successfully"
		break
	fi
	sleep 1
	ELAPSED=$((ELAPSED + 1))
done

if [ $ELAPSED -ge $TIMEOUT ]; then
	echo "⚠️  Timeout waiting for Convex. Check /tmp/convex-dev.log"
else
	# Extract and propagate CONVEX_URL
	CONVEX_URL=$(grep "^CONVEX_URL=" packages/backend/.env.local | cut -d'=' -f2-)

	echo "📝 Propagating Convex env vars..."
	echo "   CONVEX_URL=$CONVEX_URL"

	# Update apps/web/.env.local
	if [ -f "apps/web/.env.local" ]; then
		sed -i.bak '/^NEXT_PUBLIC_CONVEX_URL=/d' apps/web/.env.local
		rm apps/web/.env.local.bak 2>/dev/null || true
		echo "NEXT_PUBLIC_CONVEX_URL=$CONVEX_URL" >>apps/web/.env.local
		echo "✅ Updated apps/web/.env.local"
	fi
fi

echo ""
echo "✅ DevContainer ready!"
echo ""
echo "📝 Quick commands:"
echo "  • View Convex logs: tail -f /tmp/convex-dev.log"
echo "  • Start dev server: bun dev"
echo "  • Start web only: bun dev:web"
echo "  • Start storybook: bun dev:storybook"
echo ""
