#!/bin/sh
set -e

echo "🚀 Production server starting"
echo "Project ID: $PROJECT_ID"

echo "☁️ Downloading production build from S3..."
node /app/download-production.mjs

echo "📁 Serving files:"
ls -la /usr/share/nginx/html

echo "🌐 Starting nginx..."
nginx -g "daemon off;"