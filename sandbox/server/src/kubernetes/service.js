import { k8sCoreV1Api } from "./config.js";

export const createService = async (sandboxID) => {
  const serviceManifest = {
    apiVersion: "v1",
    kind: "Service",

    metadata: {
      name: `sandbox-service-${sandboxID}`,
      labels: {
        app: "sandbox",
        sandboxID: sandboxID,
      },
    },

    spec: {
      type: "ClusterIP",

      selector: {
        app: "sandbox",
        sandboxID: sandboxID,
      },

      ports: [
        {
          name: "http",
          protocol: "TCP",
          port: 5173,
          targetPort: 5173,
        },
        {
          name: "agent-http",
          protocol: "TCP",
          port: 3000,
          targetPort: 3000,
        },
      ],
    },
  };

  const response = await k8sCoreV1Api.createNamespacedService({
    namespace: "default",
    body: serviceManifest,
  });

  return response;
};



export async function deleteService(sandboxId) {
  try {
    const response = await k8sCoreV1Api.deleteNamespacedService({
      namespace: "default",
      name: `sandbox-service-${sandboxId}`,
    });

    console.log(`✅ Service ${sandboxId} deleted`);

    return response;
  } catch (error) {
    console.error("Delete Service Error:", error.message);
    throw error;
  }
}