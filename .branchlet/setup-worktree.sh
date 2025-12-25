#!/bin/bash
set -e

# Worktree Setup Script for better-starter-saas
# Configures port offsets and ISOLATED Convex local backend for each worktree
# Port scheme: Base 10001 + (worktree_index * 1000)
#   Worktree 1: Web=10001, Storybook=10006, Convex=10210/10211
#   Worktree 2: Web=11001, Storybook=11006, Convex=11210/11211

WORKTREE_PATH="$1"
BRANCH_NAME="$2"
SOURCE_BRANCH="${3:-main}"

if [ -z "$WORKTREE_PATH" ] || [ -z "$BRANCH_NAME" ]; then
	echo "❌ Error: Missing required arguments"
	echo "Usage: setup-worktree.sh <worktree_path> <branch_name> <source_branch>"
	exit 1
fi

echo "🔧 Setting up worktree: $BRANCH_NAME"
echo "📁 Path: $WORKTREE_PATH"

MAIN_REPO=$(git rev-parse --show-toplevel)

# Find next available port slot by scanning existing worktrees
# Each worktree gets base 10001 + (slot * 1000)
get_next_port_slot() {
	local used_slots=""
	local worktree_dirs=$(git worktree list --porcelain | grep "^worktree " | cut -d' ' -f2-)

	for wt in $worktree_dirs; do
		# Skip main repo
		if [ "$wt" = "$MAIN_REPO" ]; then
			continue
		fi

		# Check for PORT in root .env.local
		if [ -f "$wt/.env.local" ]; then
			local port=$(grep "^PORT=" "$wt/.env.local" 2>/dev/null | cut -d'=' -f2)
			if [ -n "$port" ] && [ "$port" -ge 10001 ]; then
				local slot=$(( (port - 10001) / 1000 ))
				used_slots="$used_slots $slot"
			fi
		fi
	done

	# Find first unused slot
	local slot=0
	while echo "$used_slots" | grep -qw "$slot"; do
		slot=$((slot + 1))
	done

	echo "$slot"
}

PORT_SLOT=$(get_next_port_slot)
PORT_BASE=$((10001 + (PORT_SLOT * 1000)))

# Port assignments
WEB_PORT=$PORT_BASE
STORYBOOK_PORT=$((PORT_BASE + 5))         # 10006, 11006, etc
E2E_PORT=$((PORT_BASE + 100))             # 10101, 11101, etc (for e2e server)
CONVEX_PORT=$((PORT_BASE + 209))          # 10210, 11210, etc
CONVEX_SITE_PORT=$((CONVEX_PORT + 1))     # 10211, 11211, etc

echo "🔢 Port slot: #$PORT_SLOT (base: $PORT_BASE)"
echo ""
echo "📊 Port allocation:"
echo "  • Web:           $WEB_PORT"
echo "  • Storybook:     $STORYBOOK_PORT"
echo "  • E2E Server:    $E2E_PORT"
echo "  • Convex:        $CONVEX_PORT"
echo "  • Convex Site:   $CONVEX_SITE_PORT"
echo ""

# Create necessary directories
mkdir -p "$WORKTREE_PATH/apps/web"
mkdir -p "$WORKTREE_PATH/packages/backend"
mkdir -p "$WORKTREE_PATH/.branchlet"
mkdir -p "$WORKTREE_PATH/.convex-local"

# Copy .chrome-profile for isolated browser sessions (if exists in main)
if [ -d "$MAIN_REPO/.chrome-profile" ]; then
	if [ ! -d "$WORKTREE_PATH/.chrome-profile" ]; then
		cp -r "$MAIN_REPO/.chrome-profile" "$WORKTREE_PATH/.chrome-profile"
		echo "✓ Copied .chrome-profile for isolated browser"
	fi
fi

echo "📝 Creating environment configuration..."

# Create root .env.local with port config
cat >"$WORKTREE_PATH/.env.local" <<EOF
# Worktree Configuration - Isolated Instance
# Branch: $BRANCH_NAME
# Port Slot: #$PORT_SLOT (base: $PORT_BASE)
# Created: $(date -Iseconds)

PORT=$WEB_PORT
STORYBOOK_PORT=$STORYBOOK_PORT
E2E_PORT=$E2E_PORT
CONVEX_PORT=$CONVEX_PORT
CONVEX_SITE_PORT=$CONVEX_SITE_PORT
EOF
echo "  ✓ Created root .env.local"

# Create apps/web/.env.local with ISOLATED local Convex backend
cat >"$WORKTREE_PATH/apps/web/.env.local" <<EOF
# Web App Configuration - ISOLATED Convex Backend
# Branch: $BRANCH_NAME
# Uses local Convex backend, NOT cloud

PORT=$WEB_PORT
SITE_URL=http://localhost:$WEB_PORT

# Isolated Convex backend (local, not cloud)
NEXT_PUBLIC_CONVEX_URL=http://127.0.0.1:$CONVEX_PORT
NEXT_PUBLIC_CONVEX_SITE_URL=http://127.0.0.1:$CONVEX_SITE_PORT
EOF
echo "  ✓ Created apps/web/.env.local (isolated Convex)"

# Copy BETTER_AUTH_SECRET from main backend config (needed for auth)
MAIN_AUTH_SECRET=""
if [ -f "$MAIN_REPO/packages/backend/.env.local" ]; then
	MAIN_AUTH_SECRET=$(grep "^BETTER_AUTH_SECRET=" "$MAIN_REPO/packages/backend/.env.local" 2>/dev/null | cut -d'=' -f2)
fi

if [ -z "$MAIN_AUTH_SECRET" ]; then
	# Generate a new secret if main doesn't have one
	MAIN_AUTH_SECRET=$(openssl rand -base64 32)
fi

# Create packages/backend/.env.local for ISOLATED local backend
cat >"$WORKTREE_PATH/packages/backend/.env.local" <<EOF
# Backend Configuration - ISOLATED Convex Local Backend
# Branch: $BRANCH_NAME
# This worktree uses its own local Convex instance

# Better Auth
BETTER_AUTH_SECRET=$MAIN_AUTH_SECRET
SITE_URL=http://localhost:$WEB_PORT

# Local Convex backend (isolated per worktree)
# CONVEX_SELF_HOSTED_URL tells convex CLI to use local backend instead of cloud
CONVEX_SELF_HOSTED_URL=http://127.0.0.1:$CONVEX_PORT
CONVEX_SELF_HOSTED_ADMIN_KEY=0135d8598650f8f5cb0f30c34ec2e2bb62793bc28717c8eb6fb577996d50be5f4281b59181095065c5d0f86a2c31ddbe9b597ec62b47ded69782cd

CONVEX_URL=http://127.0.0.1:$CONVEX_PORT
CONVEX_SITE_URL=http://127.0.0.1:$CONVEX_SITE_PORT
CONVEX_CLOUD_URL=http://127.0.0.1:$CONVEX_PORT

# NO CONVEX_DEPLOYMENT - we use local backend, not cloud
EOF
echo "  ✓ Created packages/backend/.env.local (isolated Convex)"

# Patch packages/backend/package.json for local Convex
echo "🔧 Patching backend package.json for local Convex..."
BACKEND_PKG="$WORKTREE_PATH/packages/backend/package.json"
if [ -f "$BACKEND_PKG" ]; then
	# Remove env upload watch (not needed for local)
	sed -i.bak "s|bun scripts/upload-env-to-convex-watch.ts .env.local \& ||g" "$BACKEND_PKG"
	# Add --env-file flag to convex dev
	sed -i.bak "s|convex dev --tail-logs|convex dev --env-file .env.local --tail-logs|g" "$BACKEND_PKG"
	# Replace dev:setup to warn about local backend
	sed -i.bak "s|convex dev --configure --until-success|echo 'Worktree uses local backend - run start-isolated.sh first'|g" "$BACKEND_PKG"
	rm -f "$BACKEND_PKG.bak"
	echo "  ✓ Patched backend package.json (uses --env-file .env.local)"
fi

# Patch root package.json to use dotenv -c (cascade to load .env.local)
echo "🔧 Patching root package.json for dotenv cascade..."
ROOT_PKG="$WORKTREE_PATH/package.json"
if [ -f "$ROOT_PKG" ]; then
	sed -i.bak "s|dotenv -- dotenv -- turbo|dotenv -c -- turbo|g" "$ROOT_PKG"
	rm -f "$ROOT_PKG.bak"
	echo "  ✓ Patched root package.json (dotenv -c for .env.local)"
fi

# Create start script for isolated environment
cat >"$WORKTREE_PATH/.branchlet/start-isolated.sh" <<'SCRIPT'
#!/bin/bash
set -e

# Start Isolated Development Environment
# Starts local Convex backend + deploys functions

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKTREE_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$WORKTREE_ROOT"

# Read port configuration
source "$WORKTREE_ROOT/.env.local"

echo "🚀 Starting Isolated Development Environment"
echo ""
echo "📊 Port Configuration:"
echo "  • Web:         http://localhost:$PORT"
echo "  • Storybook:   http://localhost:$STORYBOOK_PORT"
echo "  • Convex:      http://127.0.0.1:$CONVEX_PORT"
echo "  • Convex Site: http://127.0.0.1:$CONVEX_SITE_PORT"
echo ""

# Storage directory for isolated Convex data
STORAGE_DIR="$WORKTREE_ROOT/.convex-local"
mkdir -p "$STORAGE_DIR"

# Find Convex binary
CONVEX_BIN_DIR="$HOME/.convex-e2e/releases"
CONVEX_BIN=$(ls -t "$CONVEX_BIN_DIR"/*/convex-local-backend 2>/dev/null | head -n1)

if [ -z "$CONVEX_BIN" ] || [ ! -f "$CONVEX_BIN" ]; then
	echo "📥 Downloading Convex local backend..."
	cd "$WORKTREE_ROOT/packages/backend"
	bunx convex backend download
	CONVEX_BIN=$(ls -t "$CONVEX_BIN_DIR"/*/convex-local-backend 2>/dev/null | head -n1)
fi

if [ -z "$CONVEX_BIN" ]; then
	echo "❌ Could not find Convex local backend binary"
	exit 1
fi

# Use Convex default dev credentials (these work together)
# The admin key is pre-generated to work with this instance name/secret
INSTANCE_NAME="carnitas"
INSTANCE_SECRET="4361726e697461732c206c69746572616c6c79206d65616e696e6720226c6974"

echo "🗄️ Starting Convex local backend..."
"$CONVEX_BIN" \
	--port "$CONVEX_PORT" \
	--site-proxy-port "$CONVEX_SITE_PORT" \
	--instance-name "$INSTANCE_NAME" \
	--instance-secret "$INSTANCE_SECRET" \
	--local-storage "$STORAGE_DIR" \
	"$STORAGE_DIR/convex_local_backend.sqlite3" &

CONVEX_PID=$!
echo "  ✓ Convex backend started (PID: $CONVEX_PID)"

# Wait for backend to be healthy
echo "⏳ Waiting for Convex backend..."
for i in {1..30}; do
	if curl -s "http://127.0.0.1:$CONVEX_PORT/version" >/dev/null 2>&1; then
		echo "  ✓ Convex backend is healthy"
		break
	fi
	sleep 1
done

# Deploy functions to isolated backend
echo "📦 Deploying Convex functions..."
cd "$WORKTREE_ROOT/packages/backend"
ADMIN_KEY="0135d8598650f8f5cb0f30c34ec2e2bb62793bc28717c8eb6fb577996d50be5f4281b59181095065c5d0f86a2c31ddbe9b597ec62b47ded69782cd"
bunx convex deploy --admin-key "$ADMIN_KEY" --url "http://127.0.0.1:$CONVEX_PORT" || {
	echo "❌ Failed to deploy Convex functions"
	kill $CONVEX_PID 2>/dev/null
	exit 1
}

# Set environment variables on isolated backend
curl -s -X POST "http://127.0.0.1:$CONVEX_PORT/api/v1/update_environment_variables" \
	-H "Content-Type: application/json" \
	-H "Authorization: Convex $ADMIN_KEY" \
	-d "{\"changes\": [{\"name\": \"SITE_URL\", \"value\": \"http://localhost:$PORT\"}, {\"name\": \"BETTER_AUTH_SECRET\", \"value\": \"$(grep BETTER_AUTH_SECRET "$WORKTREE_ROOT/packages/backend/.env.local" | cut -d'=' -f2)\"}]}" >/dev/null

echo ""
echo "✅ Isolated backend ready!"
echo "   PID: $CONVEX_PID"
echo ""
echo "🚀 In another terminal, run:"
echo "   cd $WORKTREE_ROOT && bun run dev"
echo ""

# Keep running
wait $CONVEX_PID
SCRIPT

chmod +x "$WORKTREE_PATH/.branchlet/start-isolated.sh"
echo "  ✓ Created start-isolated.sh"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
cd "$WORKTREE_PATH"
if command -v bun >/dev/null 2>&1; then
	bun install
	echo "  ✓ Dependencies installed"
else
	echo "  ⚠️ bun not found, run 'bun install' manually"
fi

echo ""
echo "✅ Worktree setup complete!"
echo ""
echo "📋 Summary:"
echo "  • Branch: $BRANCH_NAME"
echo "  • Ports: $WEB_PORT (web), $STORYBOOK_PORT (storybook), $CONVEX_PORT (convex)"
echo "  • Mode: ISOLATED (local Convex backend)"
echo ""
echo "🚀 To start development:"
echo ""
echo "  # Terminal 1: Start isolated Convex backend"
echo "  cd $WORKTREE_PATH && bash .branchlet/start-isolated.sh"
echo ""
echo "  # Terminal 2: Start dev server"
echo "  cd $WORKTREE_PATH && bun run dev"
echo ""
