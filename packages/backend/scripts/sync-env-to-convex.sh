#!/bin/bash
# Syncs environment variables from Vercel to Convex during deployment
# This allows all env vars to be managed in Vercel while Convex functions can access them

set -e

# Skip env sync for preview deployments (Convex integration issue)
if [ "$VERCEL_ENV" = "preview" ]; then
  echo "Skipping env sync for preview deployment"
  exit 0
fi

echo "Syncing environment variables to Convex..."

# Verify CONVEX_DEPLOY_KEY is available for authentication
if [ -z "$CONVEX_DEPLOY_KEY" ]; then
  echo "Error: CONVEX_DEPLOY_KEY is not set. Cannot sync env vars without deploy key."
  exit 1
fi

# Required env vars for Better Auth
declare -a REQUIRED_VARS=("BETTER_AUTH_SECRET" "SITE_URL")
declare -a OPTIONAL_VARS=("GOOGLE_CLIENT_ID" "GOOGLE_CLIENT_SECRET")

# Check and set required vars
for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    echo "Error: Required env var $var is not set"
    exit 1
  fi
  echo "Setting $var..."
  if ! bunx convex env set "$var" "${!var}"; then
    echo "Error: Failed to set $var"
    exit 1
  fi
done

# Set optional vars if present
for var in "${OPTIONAL_VARS[@]}"; do
  if [ -n "${!var}" ]; then
    echo "Setting $var..."
    if ! bunx convex env set "$var" "${!var}"; then
      echo "Error: Failed to set $var"
      exit 1
    fi
  else
    echo "Skipping $var (not set in Vercel environment)"
  fi
done

echo "Environment sync complete!"
