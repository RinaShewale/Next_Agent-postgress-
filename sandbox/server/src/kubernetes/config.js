//config.js

import * as k8sAPI from "@kubernetes/client-node";

const kc = new k8sAPI.KubeConfig();

kc.loadFromDefault();

export const k8sCoreV1Api =
    kc.makeApiClient(k8sAPI.CoreV1Api);

export const k8sAppsV1Api =
    kc.makeApiClient(k8sAPI.AppsV1Api);

export const k8sBatchV1Api =
    kc.makeApiClient(k8sAPI.BatchV1Api);

export const k8sNetworkingV1Api =
    kc.makeApiClient(k8sAPI.NetworkingV1Api);


// --------------------------------
// Production namespace name
// --------------------------------
//
// All production Deployments/Services/Ingresses live here — kept
// completely separate from "default" (sandbox + core services).
// This means:
//   - Skaffold (which only watches "default") never sees production
//     resources, so it can never prune/adopt them.
//   - `kubectl get pods -n default` stays clean even with hundreds
//     of deployed projects; production pods live in their own view
//     (`kubectl get pods -n production`).
//
export const PRODUCTION_NAMESPACE = "production";


// --------------------------------
// Ensure the production namespace exists
// --------------------------------
//
// Namespaces are not auto-created. Call this once before creating
// any production Deployment/Service/Ingress. Safe to call repeatedly —
// no-ops if the namespace already exists.
//
export async function ensureProductionNamespace() {
    try {

        await k8sCoreV1Api.readNamespace({
            name: PRODUCTION_NAMESPACE,
        });

    } catch (error) {

        const statusCode =
            error?.code ||
            error?.statusCode ||
            error?.response?.statusCode;

        if (statusCode === 404) {

            await k8sCoreV1Api.createNamespace({
                body: {
                    metadata: {
                        name: PRODUCTION_NAMESPACE,
                    },
                },
            });

            console.log(
                `✅ Created '${PRODUCTION_NAMESPACE}' namespace`
            );

        } else {

            throw error;
        }
    }
}


// --------------------------------
// Ensure the "aws" secret exists in the production namespace
// --------------------------------
//
// Secrets are namespace-scoped. Production pods reference a secret
// named "aws" (AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY / AWS_REGION).
// This copies it from "default" into "production" the first time,
// so production pods don't fail with CreateContainerConfigError.
// Safe to call repeatedly.
//
export async function ensureProductionAwsSecret() {

    // Already exists in production? nothing to do.
    try {

        await k8sCoreV1Api.readNamespacedSecret({
            name: "aws",
            namespace: PRODUCTION_NAMESPACE,
        });

        return;

    } catch (error) {

        const statusCode =
            error?.code ||
            error?.statusCode ||
            error?.response?.statusCode;

        if (statusCode !== 404) {
            throw error;
        }

        // fall through — need to create it
    }


    // Read the source secret from "default"
    const sourceResponse =
        await k8sCoreV1Api.readNamespacedSecret({
            name: "aws",
            namespace: "default",
        });

    const sourceSecret = sourceResponse;


    await k8sCoreV1Api.createNamespacedSecret({
        namespace: PRODUCTION_NAMESPACE,
        body: {
            apiVersion: "v1",
            kind: "Secret",
            metadata: {
                name: "aws",
            },
            type: sourceSecret.type || "Opaque",
            data: sourceSecret.data,
        },
    });

    console.log(
        `✅ Copied 'aws' secret into '${PRODUCTION_NAMESPACE}' namespace`
    );
}


// --------------------------------
// Convenience: run both setup steps together
// --------------------------------

export async function ensureProductionEnvironment() {
    await ensureProductionNamespace();
    await ensureProductionAwsSecret();
}