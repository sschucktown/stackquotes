#!/usr/bin/env bash
set -e

PROJECT="@stackquotes/api"
GOAL="Successfully deploy $PROJECT to Vercel using Node 22 runtime.
Fix any configuration or dependency issues (pnpm, tsup, vercel.json, workspace paths).
Stop only when the production URL returns HTTP 200."

echo "🌊 Starting Codex auto-deploy for $PROJECT"
echo "🎯 Goal: $GOAL"

while true; do
  echo "🧠 Running Codex fix cycle..."
  codex fix --context . --goal "$GOAL" || true

  echo "🔨 Building $PROJECT..."
  pnpm --filter $PROJECT run build || true

  echo "🚀 Deploying prebuilt build to Vercel..."
  DEPLOY_OUTPUT=$(vercel deploy --prebuilt --prod --yes 2>&1 || true)
  echo "$DEPLOY_OUTPUT"

  # Extract deployment URL
  DEPLOY_URL=$(echo "$DEPLOY_OUTPUT" | grep -Eo "https://[a-zA-Z0-9.-]+\.vercel\.app" | tail -1)

  if [ -n "$DEPLOY_URL" ]; then
    echo "🌐 Checking deployment URL: $DEPLOY_URL"
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOY_URL" || echo "000")
    if [ "$STATUS" = "200" ]; then
      echo "✅ Deployment successful! ($DEPLOY_URL)"
      break
    else
      echo "⚠️ Deployment not ready yet (HTTP $STATUS). Retrying..."
    fi
  else
    echo "❌ No deploy URL found in output. Codex will retry."
  fi

  echo "🔁 Waiting 15 seconds before next attempt..."
  sleep 15
done
