import { k8sCoreV1Api } from "./config.js";

export async function createPod(sandboxID, projectId) {

  const podManifest = {

    apiVersion: "v1",

    kind: "Pod",

    metadata: {

      name: `sandbox-pod-${sandboxID}`,

      labels: {
        app: "sandbox",
        sandboxID,
      },

    },


    spec: {

      restartPolicy: "Never",


      initContainers: [

        {

          name: "init-container",

          image: "template:latest",

          imagePullPolicy: "IfNotPresent",

          command: [
            "sh",
            "-c",
            "cp -r /workspace/. /seed/"
          ],

          volumeMounts: [

            {
              name: "workspace-volume",
              mountPath: "/seed"
            }

          ]

        }

      ],



      containers: [

        {

          name: "sandbox-container",

          image: "template:latest",

          imagePullPolicy: "IfNotPresent",


          ports: [

            {
              name: "http",
              containerPort: 5173
            }

          ],


          resources: {

            requests: {
              cpu: "250m",
              memory: "500Mi"
            },

            limits: {
              cpu: "300m",
              memory: "1Gi"
            }

          },


          // IMPORTANT FIX
          readinessProbe: {

            httpGet: {

              path: "/",

              port: 5173

            },


            initialDelaySeconds: 10,

            periodSeconds: 3,

            timeoutSeconds: 5,

            failureThreshold: 20

          },


          livenessProbe: {

            httpGet: {

              path: "/",

              port: 5173

            },


            initialDelaySeconds: 30,

            periodSeconds: 10,

            timeoutSeconds: 5

          },


          volumeMounts: [

            {

              name: "workspace-volume",

              mountPath: "/workspace"

            }

          ]

        },



        {

          name: "agent-container",

          image: "agent:latest",

          imagePullPolicy: "IfNotPresent",


          resources: {

            requests: {
              cpu: "250m",
              memory: "500Mi"
            },

            limits: {
              cpu: "300m",
              memory: "1Gi"
            }

          },


          volumeMounts: [

            {

              name: "workspace-volume",

              mountPath: "/workspace"

            }

          ]

        },


        {
          name: "sync-agent-container",

          image: "sync-agent",

          imagePullPolicy: "IfNotPresent",

          env: [
            {
              name: "PROJECT_ID",
              value: String(projectId)
            },
            {
              name: "AWS_ACCESS_KEY_ID",
              valueFrom: {
                secretKeyRef: {
                  name: "aws",
                  key: "AWS_ACCESS_KEY_ID"
                }
              }
            },
            {
              name: "AWS_SECRET_ACCESS_KEY",
              valueFrom: {
                secretKeyRef: {
                  name: "aws",
                  key: "AWS_SECRET_ACCESS_KEY"
                }
              }
            },
            {
              name: "AWS_REGION",
              valueFrom: {
                secretKeyRef:{
                  name: "aws",
                  key: "AWS_REGION"
                }
              }
            }
          ],

          resources: {

            requests: {
              cpu: "250m",
              memory: "500Mi"
            },

            limits: {
              cpu: "300m",
              memory: "1Gi"
            }

          },

          volumeMounts: [

            {
              name: "workspace-volume",
              mountPath: "/workspace"
            }

          ]

        }


      ],



      volumes: [

        {

          name: "workspace-volume",

          emptyDir: {}

        }

      ]


    }

  };


  await k8sCoreV1Api.createNamespacedPod({
    namespace: "default",
    body: podManifest
  });

  return `sandbox-pod-${sandboxID}`;


}



export async function deletePod(sandboxId) {
  try {
    const response = await k8sCoreV1Api.deleteNamespacedPod(
      {
        namespace: "default",
        name: `sandbox-pod-${sandboxId}`,
      },
      {
        gracePeriodSeconds: 0,
      }
    );

    console.log(`✅ Pod ${sandboxId} deleted`);

    return response;
  } catch (error) {
    console.error("Delete Pod Error:", error.message);
    throw error;
  }
}