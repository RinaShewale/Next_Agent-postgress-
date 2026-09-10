// production.ingress.js
//
// PATH-BASED routing for use with Cloudflare Quick Tunnel.
//
// Quick Tunnel only gives you ONE random hostname
// (https://random-words.trycloudflare.com) mapped to ONE local
// port — it does not support wildcard subdomains. So instead of
// routing by host (projectId.app.domain.com), every project shares
// the same Ingress host and is routed by URL PATH instead
// (/p/<projectId>/).
//
// PRODUCTION_DOMAIN is intentionally not used here — with Quick
// Tunnel there is nothing to set it to (the tunnel hostname is
// random and changes every time you restart cloudflared).

import { k8sNetworkingV1Api, PRODUCTION_NAMESPACE } from "./config.js";

export async function createProductionIngress(projectId) {
    const ingressName = `production-ingress-${projectId}`;
    const serviceName = `production-service-${projectId}`;

    // Every project shares this single Ingress path prefix instead
    // of a unique host. nginx's rewrite-target annotation strips
    // "/p/<projectId>" off the incoming path before forwarding to
    // the backend service, so the service itself still just serves
    // from "/".
    const pathPrefix = `/p/${projectId}`;

    const ingressManifest = {
        apiVersion: "networking.k8s.io/v1",
        kind: "Ingress",

        metadata: {
            name: ingressName,

            labels: {
                app: "production",
                projectId: projectId,
            },

            annotations: {
                "nginx.ingress.kubernetes.io/proxy-connect-timeout": "6000",
                "nginx.ingress.kubernetes.io/proxy-send-timeout": "6000",
                "nginx.ingress.kubernetes.io/proxy-read-timeout": "6000",
                "nginx.ingress.kubernetes.io/proxy-body-size": "100m",

                // Strips the "/p/<projectId>" prefix so the backend
                // nginx container (serving the built static files)
                // still sees requests starting at "/".
                "nginx.ingress.kubernetes.io/rewrite-target": "/$2",
                "nginx.ingress.kubernetes.io/use-regex": "true",
            },
        },

        spec: {
            ingressClassName: "nginx",

            rules: [
                {
                    // No "host" field at all — matches ANY hostname,
                    // including whatever random trycloudflare.com
                    // hostname Quick Tunnel is using right now.
                    http: {
                        paths: [
                            {
                                // Regex capture: everything after
                                // "/p/<projectId>" becomes group 2,
                                // used by rewrite-target above.
                                path: `${pathPrefix}(/|$)(.*)`,
                                pathType: "ImplementationSpecific",

                                backend: {
                                    service: {
                                        name: serviceName,

                                        port: {
                                            number: 80,
                                        },
                                    },
                                },
                            },
                        ],
                    },
                },
            ],
        },
    };

    await k8sNetworkingV1Api.createNamespacedIngress({
        namespace: PRODUCTION_NAMESPACE,
        body: ingressManifest,
    });

    console.log(
        `🌍 Production Ingress created: ${ingressName} -> path ${pathPrefix} (namespace: ${PRODUCTION_NAMESPACE})`
    );

    // NOTE: this returns only the PATH portion. The full URL depends
    // on whatever your current Quick Tunnel hostname happens to be
    // right now — see the limitation note below.
    return {
        ingressName,
        productionPath: pathPrefix,
    };
}