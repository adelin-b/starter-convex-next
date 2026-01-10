#!/bin/bash

echo "🚀 Setting up Starter SaaS development environment..."

# Detect workspace directory (DevPod uses /workspaces/<name>, others use /workspace)
if [ -d "/workspaces" ] && [ "$(ls -A /workspaces 2>/dev/null)" ]; then
	WORKSPACE_DIR=$(find /workspaces -mindepth 1 -maxdepth 1 -type d | head -1)
elif [ -d "/workspace" ]; then
	WORKSPACE_DIR="/workspace"
else
	WORKSPACE_DIR="$(pwd)"
fi

echo "📁 Workspace directory: $WORKSPACE_DIR"
cd "$WORKSPACE_DIR" || exit 1

# Configure git - .gitconfig is mounted from host
echo "🔧 Configuring Git..."

# Fix git worktree paths if this is a worktree
if [ -f ".git" ] && ! [ -d ".git" ]; then
	echo "📝 Detected git worktree, mounting main repo .git..."

	# Read the gitdir path from .git file
	GITDIR_PATH=$(cat .git | sed 's/gitdir: //')

	# Check if it's an absolute host path that needs to be made available
	if [[ "$GITDIR_PATH" == /Users/* ]] || [[ "$GITDIR_PATH" == /home/* ]]; then
		echo "📍 Git worktree points to: $GITDIR_PATH"

		# Extract the main repo .git path from gitdir
		MAIN_REPO_GIT=$(dirname "$(dirname "$GITDIR_PATH")")

		echo "🔧 Creating directory structure for: $MAIN_REPO_GIT"

		# Symlink the mounted main repo .git to the expected path
		if [ -d "/main-repo-git" ]; then
			# Create parent directory structure only (not the .git itself)
			PARENT_DIR=$(dirname "$MAIN_REPO_GIT")
			sudo mkdir -p "$PARENT_DIR"

			# Remove existing directory or symlink if it exists
			if [ -L "$MAIN_REPO_GIT" ] || [ -d "$MAIN_REPO_GIT" ] || [ -f "$MAIN_REPO_GIT" ]; then
				sudo rm -rf "$MAIN_REPO_GIT"
			fi

			# Create symlink from expected path to mounted git
			sudo ln -sf /main-repo-git "$MAIN_REPO_GIT"
			echo "🔗 Linked $MAIN_REPO_GIT -> /main-repo-git"

			# Verify git works
			if git status >/dev/null 2>&1; then
				echo "✅ Git worktree configured successfully"
			else
				echo "⚠️  Git status check failed, but continuing..."
			fi
		else
			echo "⚠️  Warning: /main-repo-git mount not found"
			echo "    Make sure the devcontainer.json mount is configured correctly"
		fi
	fi
fi

if [ -f "/home/node/.config/git/config" ]; then
	GIT_NAME=$(git config --global user.name 2>/dev/null || echo "")
	GIT_EMAIL=$(git config --global user.email 2>/dev/null || echo "")
	if [ ! -z "$GIT_NAME" ] && [ ! -z "$GIT_EMAIL" ]; then
		echo "✅ Git configured: $GIT_NAME <$GIT_EMAIL> (from host)"
	else
		echo "⚠️  Warning: git config mounted but user not configured"
	fi
else
	echo "⚠️  Warning: git config not found. Git commits may fail."
	echo "    Run: git config --global user.name 'Your Name'"
	echo "    Run: git config --global user.email 'your@email.com'"
fi

# Ensure bun and bunx are available system-wide
if [ ! -L /usr/local/bin/bun ]; then
	echo "Creating bun symlink..."
	sudo ln -sf /home/node/.bun/bin/bun /usr/local/bin/bun
fi
if [ ! -f /usr/local/bin/bunx ]; then
	echo "Creating bunx wrapper..."
	echo '#!/bin/bash' | sudo tee /usr/local/bin/bunx >/dev/null
	echo 'exec bun x "$@"' | sudo tee -a /usr/local/bin/bunx >/dev/null
	sudo chmod +x /usr/local/bin/bunx
fi

# Set up Convex authentication
echo "🔧 Setting up Convex..."
if [ -f "/home/node/.convex/config.json" ]; then
	echo "✅ Convex authentication already configured (shared from host)"
else
	echo "ℹ️  Convex credentials will be saved to host on first login"
	echo "    Run 'convex dev' and follow the authentication flow"
fi

# Set proper permissions
sudo chown -R node:node /workspace 2>/dev/null || true

echo "✅ Development environment setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Make sure your .env.local files are properly configured"
echo "2. Run 'bun dev' to start all services"
echo "3. Or run 'bun dev:web' for just the web app"
echo ""
echo "Happy coding! 🎉"
