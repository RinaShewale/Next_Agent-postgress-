//production.service.js

import { k8sCoreV1Api, PRODUCTION_NAMESPACE } from "./config.js";

export async function createProductionService(projectId) {
    const serviceName = `production-service-${projectId}`;

    const serviceManifest = {
        apiVersion: "v1",
        kind: "Service",

        metadata: {
            name: serviceName,

            labels: {
                app: "production",
                projectId: projectId,
            },
        },

        spec: {
            type: "ClusterIP",

            selector: {
                app: "production",
                projectId: projectId,
            },

            ports: [
                {
                    name: "http",
                    protocol: "TCP",
                    port: 80,
                    targetPort: 80,
                },
            ],
        },
    };

    await k8sCoreV1Api.createNamespacedService({
        namespace: PRODUCTION_NAMESPACE,
        body: serviceManifest,
    });

    console.log(
        `🌐 Production service created: ${serviceName} (namespace: ${PRODUCTION_NAMESPACE})`
    );

    return serviceName;
}