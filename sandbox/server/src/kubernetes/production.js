//production.js

import { k8sAppsV1Api, PRODUCTION_NAMESPACE } from "./config.js";

export async function createProductionDeployment(projectId) {

    const deploymentName =
        `production-${projectId}`;


    const deploymentManifest = {

        apiVersion: "apps/v1",

        kind: "Deployment",


        metadata: {

            name: deploymentName,

            labels: {
                app: "production",
                projectId: projectId,
            },

        },


        spec: {

            replicas: 1,


            selector: {

                matchLabels: {
                    app: "production",
                    projectId: projectId,
                },

            },


            template: {

                metadata: {

                    labels: {
                        app: "production",
                        projectId: projectId,
                    },

                },


                spec: {

                    initContainers: [

                        {

                            name: "fetch-production-files",

                            image: "amazon/aws-cli:2.15.0",

                            command: [
                                "sh",
                                "-c",
                                `aws s3 sync s3://nexagent-bucket/${projectId}/production/ /usr/share/nginx/html/`,
                            ],

                            env: [

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

                            ],


                            volumeMounts: [

                                {
                                    name: "html",
                                    mountPath: "/usr/share/nginx/html",
                                },

                            ],

                        },

                    ],


                    containers: [

                        {

                            name: "production-container",

                            image: "nginx:alpine",

                            imagePullPolicy: "IfNotPresent",


                            ports: [

                                {
                                    name: "http",
                                    containerPort: 80,
                                },

                            ],


                            resources: {

                                requests: {

                                    cpu: "100m",

                                    memory: "128Mi",

                                },


                                limits: {

                                    cpu: "300m",

                                    memory: "512Mi",

                                },

                            },


                            readinessProbe: {

                                httpGet: {

                                    path: "/",

                                    port: 80,

                                },

                                initialDelaySeconds: 3,

                                periodSeconds: 5,

                                timeoutSeconds: 3,

                                failureThreshold: 6,

                            },


                            livenessProbe: {

                                httpGet: {

                                    path: "/",

                                    port: 80,

                                },

                                initialDelaySeconds: 15,

                                periodSeconds: 10,

                                timeoutSeconds: 3,

                            },


                            volumeMounts: [

                                {
                                    name: "html",
                                    mountPath: "/usr/share/nginx/html",
                                },

                            ],

                        },

                    ],


                    volumes: [

                        {
                            name: "html",
                            emptyDir: {},
                        },

                    ],

                },

            },

        },

    };


    await k8sAppsV1Api.createNamespacedDeployment({

        namespace: PRODUCTION_NAMESPACE,

        body: deploymentManifest,

    });


    console.log(
        `🚀 Production Deployment created: ${deploymentName} (namespace: ${PRODUCTION_NAMESPACE})`
    );


    return deploymentName;
}