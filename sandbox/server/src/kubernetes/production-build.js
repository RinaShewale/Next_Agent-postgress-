// production-build.js

import { k8sBatchV1Api } from "./config.js";
export async function createProductionBuildJob(projectId) {
    const jobName = `production-build-${projectId}`;

    const jobManifest = {
        apiVersion: "batch/v1",
        kind: "Job",

        metadata: {
            name: jobName,

            labels: {
                app: "production-build",
                projectId,
            },
        },

        spec: {
            backoffLimit: 2,

            ttlSecondsAfterFinished: 300,

            template: {
                metadata: {
                    labels: {
                        app: "production-build",
                        projectId,
                    },
                },

                spec: {
                    restartPolicy: "Never",

                    containers: [
                        {
                            name: "build-container",

                            image: "node:20-alpine",

                            imagePullPolicy: "IfNotPresent",

                            env: [
                                // -----------------------------
                                // PROJECT
                                // -----------------------------

                                {
                                    name: "PROJECT_ID",

                                    value: String(projectId),
                                },

                                // -----------------------------
                                // AWS
                                // -----------------------------

                                {
                                    name: "AWS_ACCESS_KEY_ID",

                                    valueFrom: {
                                        secretKeyRef: {
                                            name: "aws",
                                            key: "AWS_ACCESS_KEY_ID",
                                        },
                                    },
                                },

                                {
                                    name: "AWS_SECRET_ACCESS_KEY",

                                    valueFrom: {
                                        secretKeyRef: {
                                            name: "aws",
                                            key: "AWS_SECRET_ACCESS_KEY",
                                        },
                                    },
                                },

                                {
                                    name: "AWS_REGION",

                                    valueFrom: {
                                        secretKeyRef: {
                                            name: "aws",
                                            key: "AWS_REGION",
                                        },
                                    },
                                },

                                // -----------------------------
                                // NETLIFY
                                // -----------------------------

                                {
                                    name: "NETLIFY_AUTH_TOKEN",

                                    valueFrom: {
                                        secretKeyRef: {
                                            name: "netlify",
                                            key: "NETLIFY_AUTH_TOKEN",
                                        },
                                    },
                                },

                                {
                                    name: "NETLIFY_ACCOUNT_SLUG",

                                    valueFrom: {
                                        secretKeyRef: {
                                            name: "netlify",
                                            key: "NETLIFY_ACCOUNT_SLUG",
                                        },
                                    },
                                },
                            ],

                            command: [
                                "sh",
                                "-c",
                                `
set -e

echo "=========================================="
echo "🚀 PRODUCTION BUILD STARTED"
echo "=========================================="

echo "📌 Project ID: $PROJECT_ID"
echo "📌 Netlify Account: $NETLIFY_ACCOUNT_SLUG"

# --------------------------------------------------
# INSTALL BUILD TOOLS
# --------------------------------------------------

echo ""
echo "📦 Installing AWS SDK..."

mkdir -p /build-tools

cp /scripts/*.mjs /build-tools/

cd /build-tools

npm init -y

npm install @aws-sdk/client-s3

# --------------------------------------------------
# DOWNLOAD PROJECT FROM S3
# --------------------------------------------------

echo ""
echo "☁️ Downloading project from S3..."

node /build-tools/download-project.mjs

echo ""
echo "📁 Project files:"

ls -la /workspace

# --------------------------------------------------
# INSTALL PROJECT DEPENDENCIES
# --------------------------------------------------

echo ""
echo "📦 Installing project dependencies..."

cd /workspace

npm install

# --------------------------------------------------
# BUILD
# --------------------------------------------------

echo ""
echo "🏗️ Running Vite production build..."

npm run build

echo ""
echo "✅ Production build completed"

echo ""
echo "📁 Build output:"

ls -la /workspace/dist

# --------------------------------------------------
# INSTALL NETLIFY DEPLOY TOOLS
# --------------------------------------------------

echo ""
echo "📦 Installing deployment tools..."

apk add --no-cache zip curl jq

# --------------------------------------------------
# NETLIFY SITE NAME
# --------------------------------------------------

SITE_NAME="nexagent-$PROJECT_ID"

echo ""
echo "=========================================="
echo "🌐 NETLIFY DEPLOYMENT"
echo "=========================================="

echo "🌐 Team/account: $NETLIFY_ACCOUNT_SLUG"
echo "🌐 Site name: $SITE_NAME"

# --------------------------------------------------
# CHECK AUTHENTICATION
# --------------------------------------------------

echo ""
echo "🔐 Checking Netlify authentication..."

USER_RESPONSE=$(curl -sS \
  -w "\\nHTTP_STATUS:%{http_code}" \
  -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN" \
  "https://api.netlify.com/api/v1/user")

USER_STATUS=$(echo "$USER_RESPONSE" | tail -n1 | sed 's/HTTP_STATUS://')

USER_BODY=$(echo "$USER_RESPONSE" | sed '$d')

echo "Netlify API status: $USER_STATUS"

if [ "$USER_STATUS" != "200" ]; then
    echo "❌ Netlify authentication failed"
    echo "$USER_BODY"
    exit 1
fi

echo "✅ Netlify authentication successful"

# --------------------------------------------------
# FIND EXISTING SITE
# --------------------------------------------------

echo ""
echo "🔎 Searching for existing Netlify site..."

SITES_RESPONSE=$(curl -sS \
  -w "\\nHTTP_STATUS:%{http_code}" \
  -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN" \
  "https://api.netlify.com/api/v1/sites?filter=all&per_page=100")

SITES_STATUS=$(echo "$SITES_RESPONSE" | tail -n1 | sed 's/HTTP_STATUS://')

SITES_BODY=$(echo "$SITES_RESPONSE" | sed '$d')

echo "📡 Sites API status: $SITES_STATUS"

if [ "$SITES_STATUS" != "200" ]; then
    echo "❌ Failed to fetch Netlify sites"
    echo "$SITES_BODY"
    exit 1
fi

# --------------------------------------------------
# FIND SITE BY NAME
# --------------------------------------------------

SITE_ID=$(echo "$SITES_BODY" | jq -r \
  --arg NAME "$SITE_NAME" \
  '.[] | select(.name == $NAME) | .id' \
  | head -n 1)

# --------------------------------------------------
# SITE ALREADY EXISTS
# --------------------------------------------------

if [ -n "$SITE_ID" ] && [ "$SITE_ID" != "null" ]; then

    echo ""
    echo "✅ Netlify site already exists"

    echo "📌 Site name: $SITE_NAME"
    echo "📌 Site ID: $SITE_ID"

else

    # --------------------------------------------------
    # CREATE SITE IN CORRECT TEAM
    # --------------------------------------------------

    echo ""
    echo "🆕 Netlify site does not exist"

    echo "🚀 Creating site inside team:"
    echo "   $NETLIFY_ACCOUNT_SLUG"

    CREATE_RESPONSE=$(curl -sS \
      -w "\\nHTTP_STATUS:%{http_code}" \
      -X POST \
      -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\\"name\\":\\"$SITE_NAME\\"}" \
      "https://api.netlify.com/api/v1/$NETLIFY_ACCOUNT_SLUG/sites")

    CREATE_STATUS=$(echo "$CREATE_RESPONSE" | tail -n1 | sed 's/HTTP_STATUS://')

    CREATE_BODY=$(echo "$CREATE_RESPONSE" | sed '$d')

    echo ""
    echo "📡 Create site HTTP status: $CREATE_STATUS"

    echo "$CREATE_BODY"

    # --------------------------------------------------
    # CREATE SUCCESS
    # --------------------------------------------------

    if [ "$CREATE_STATUS" = "201" ] || [ "$CREATE_STATUS" = "200" ]; then

        SITE_ID=$(echo "$CREATE_BODY" | jq -r '.id // empty')

    else

        echo ""
        echo "⚠️ Site creation did not return success."

        # --------------------------------------------------
        # MAYBE SITE WAS CREATED BUT RESPONSE WAS DIFFERENT
        # --------------------------------------------------

        echo "🔎 Checking sites again..."

        SITES_RESPONSE=$(curl -sS \
          -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN" \
          "https://api.netlify.com/api/v1/sites?filter=all&per_page=100")

        SITE_ID=$(echo "$SITES_RESPONSE" | jq -r \
          --arg NAME "$SITE_NAME" \
          '.[] | select(.name == $NAME) | .id' \
          | head -n 1)

    fi

fi

# --------------------------------------------------
# VERIFY SITE ID
# --------------------------------------------------

if [ -z "$SITE_ID" ] || [ "$SITE_ID" = "null" ]; then

    echo ""
    echo "❌ Could not determine Netlify Site ID"
    echo ""
    echo "Site name:"
    echo "$SITE_NAME"
    echo ""
    echo "Netlify account:"
    echo "$NETLIFY_ACCOUNT_SLUG"

    exit 1
fi

echo ""
echo "=========================================="
echo "✅ NETLIFY SITE READY"
echo "=========================================="

echo "📌 Site ID: $SITE_ID"
echo "📌 Site name: $SITE_NAME"

# --------------------------------------------------
# CREATE ZIP
# --------------------------------------------------

echo ""
echo "📦 Creating deployment ZIP..."

cd /workspace/dist

rm -f /workspace/site.zip

zip -r /workspace/site.zip . -x ".*"

cd /workspace

echo ""
echo "✅ ZIP created"

ls -lh /workspace/site.zip

# --------------------------------------------------
# DEPLOY TO NETLIFY
# --------------------------------------------------

echo ""
echo "📡 Uploading deployment to Netlify..."

DEPLOY_RESPONSE=$(curl -sS \
  -w "\\nHTTP_STATUS:%{http_code}" \
  -X POST \
  -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN" \
  -H "Content-Type: application/zip" \
  --data-binary "@/workspace/site.zip" \
  "https://api.netlify.com/api/v1/sites/$SITE_ID/deploys")

DEPLOY_STATUS=$(echo "$DEPLOY_RESPONSE" | tail -n1 | sed 's/HTTP_STATUS://')

DEPLOY_BODY=$(echo "$DEPLOY_RESPONSE" | sed '$d')

echo ""
echo "📡 Netlify deploy HTTP status: $DEPLOY_STATUS"

echo "$DEPLOY_BODY"

# --------------------------------------------------
# VERIFY DEPLOYMENT
# --------------------------------------------------

if [ "$DEPLOY_STATUS" != "200" ] && [ "$DEPLOY_STATUS" != "201" ]; then

    echo ""
    echo "❌ Netlify deployment failed"

    exit 1

fi

DEPLOY_ID=$(echo "$DEPLOY_BODY" | jq -r '.id // empty')

if [ -z "$DEPLOY_ID" ]; then

    echo ""
    echo "❌ Netlify did not return deploy ID"

    exit 1

fi

echo ""
echo "✅ Deployment uploaded"

echo "📌 Deploy ID: $DEPLOY_ID"

# --------------------------------------------------
# WAIT FOR DEPLOYMENT
# --------------------------------------------------

echo ""
echo "⏳ Waiting for Netlify deployment..."

DEPLOY_READY="false"

for i in $(seq 1 30); do

    DEPLOY_STATUS_RESPONSE=$(curl -sS \
      -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN" \
      "https://api.netlify.com/api/v1/deploys/$DEPLOY_ID")

    STATE=$(echo "$DEPLOY_STATUS_RESPONSE" | jq -r '.state // empty')

    echo "🔎 Deployment status ($i/30): $STATE"

    if [ "$STATE" = "ready" ]; then

        DEPLOY_READY="true"

        FINAL_URL=$(echo "$DEPLOY_STATUS_RESPONSE" | jq -r '.ssl_url // .url')

        echo ""
        echo "=========================================="
        echo "🎉 DEPLOYMENT SUCCESSFUL"
        echo "=========================================="

        echo "🌍 Live URL:"
        echo "$FINAL_URL"

        break

    fi

    if [ "$STATE" = "error" ]; then

        echo ""
        echo "❌ Netlify deployment entered ERROR state"

        echo "$DEPLOY_STATUS_RESPONSE"

        exit 1

    fi

    sleep 2

done

# --------------------------------------------------
# FINAL CHECK
# --------------------------------------------------

if [ "$DEPLOY_READY" != "true" ]; then

    echo ""
    echo "❌ Netlify deployment did not become ready"

    exit 1

fi

echo ""
echo "=========================================="
echo "🎉 PRODUCTION DEPLOY COMPLETE"
echo "=========================================="

echo "🌐 Project: $PROJECT_ID"
echo "🌐 Netlify site: $SITE_NAME"
echo "🌐 Live URL: https://$SITE_NAME.netlify.app/"
echo ""
`,
                            ],

                            resources: {
                                requests: {
                                    cpu: "250m",
                                    memory: "256Mi",
                                },

                                limits: {
                                    cpu: "500m",
                                    memory: "1Gi",
                                },
                            },

                            volumeMounts: [
                                {
                                    name: "build-workspace",

                                    mountPath: "/workspace",
                                },

                                {
                                    name: "build-scripts",

                                    mountPath: "/scripts",
                                },
                            ],
                        },
                    ],

                    volumes: [
                        {
                            name: "build-workspace",

                            emptyDir: {},
                        },

                        {
                            name: "build-scripts",

                            configMap: {
                                name: `production-build-scripts-${projectId}`,
                            },
                        },
                    ],
                },
            },
        },
    };

    await k8sBatchV1Api.createNamespacedJob({
        namespace: "default",

        body: jobManifest,
    });

    console.log(
        `🏗️ Production build Job created: ${jobName}`
    );

    return jobName;
}