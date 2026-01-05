#!/bin/bash

# Vercel Ignore Build Step Script
# Exit 1 = proceed with build
# Exit 0 = skip build

# Always build production
if [[ "$VERCEL_ENV" == "production" ]]; then
  echo "Production deployment - building"
  exit 1
fi

# Always build staging (develop branch)
if [[ "$VERCEL_GIT_COMMIT_REF" == "develop" ]]; then
  echo "Staging deployment (develop) - building"
  exit 1
fi

# Build if this is a pull request
if [[ -n "$VERCEL_GIT_PULL_REQUEST_ID" ]]; then
  echo "Pull request #$VERCEL_GIT_PULL_REQUEST_ID - building"
  exit 1
fi

# Skip all other preview builds (branch pushes without PR)
echo "Branch push without PR - skipping build"
exit 0
