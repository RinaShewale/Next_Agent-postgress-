import { v4 as uuid } from "uuid";

import Project from "../models/project.model.js";

import { createPod, deletePod } from "../kubernetes/pod.js";
import { createService, deleteService } from "../kubernetes/service.js";
import { k8sCoreV1Api } from "../kubernetes/config.js";
import { createSandboxKey, redis } from "../config/redis.js";

const sleep = (ms = 2000) =>
    new Promise((resolve) => setTimeout(resolve, ms));


// =================================================
// Wait for Pod Ready
// =================================================

async function waitForPodReady(podName) {
    let retries = 0;

    const MAX_RETRIES = 60;

    while (retries < MAX_RETRIES) {
        try {
            const response =
                await k8sCoreV1Api.readNamespacedPod({
                    name: podName,
                    namespace: "default",
                });

            const statuses =
                response.status?.containerStatuses;

            if (!statuses) {
                await sleep();
                retries++;
                continue;
            }

            const allReady =
                statuses.every(
                    (container) => container.ready
                );

            if (allReady) {
                console.log(
                    "✅ Pod Ready:",
                    podName
                );

                return true;
            }

        } catch (error) {

            const statusCode =
                error?.code ||
                error?.statusCode ||
                error?.response?.statusCode;

            if (statusCode !== 404) {
                throw new Error(
                    `Pod readiness check failed: ${error.message}`
                );
            }

            console.log(
                "Pod not found yet, retrying:",
                podName
            );
        }

        await sleep();
        retries++;
    }

    throw new Error(
        `Pod timeout waiting for ${podName} to become ready`
    );
}


// =================================================
// Cleanup Sandbox
// =================================================

async function cleanupSandbox(sandboxID) {

    const results =
        await Promise.allSettled([
            deletePod(sandboxID),
            deleteService(sandboxID),
            redis.del(`sandbox:${sandboxID}`),
        ]);

    results.forEach((result, index) => {

        if (result.status === "rejected") {

            console.error(
                `Cleanup step ${index} failed for sandbox ${sandboxID}:`,
                result.reason?.message ??
                    result.reason
            );
        }
    });
}


// =================================================
// Create Project
// =================================================

export async function createProject(req, res) {

    try {

        const userId =
            req.user.userId ||
            req.user.id ||
            req.user._id;

        const { title } = req.body;


        // -----------------------------------------
        // Validate title
        // -----------------------------------------

        if (
            !title ||
            typeof title !== "string" ||
            !title.trim()
        ) {

            return res.status(400).json({
                success: false,
                message: "Title is required",
            });
        }


        // -----------------------------------------
        // Create PostgreSQL Project
        // -----------------------------------------

        const project =
            await Project.create({
                user: userId,
                title: title.trim(),
            });


        return res.status(201).json({

            success: true,

            message:
                "Project created successfully",

            project,

        });

    } catch (error) {

        console.error(
            "Project creation failed:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Project creation failed",

            error:
                error.message,

        });
    }
}


// =================================================
// Get Projects
// =================================================

export async function getProjects(req, res) {

    try {

        const userId =
            req.user.userId ||
            req.user.id ||
            req.user._id;


        // PostgreSQL model uses findAll()
        const projects =
            await Project.findAll({
                user: userId,
            });


        return res.status(200).json({

            success: true,

            projects,

        });

    } catch (error) {

        console.error(
            "Failed to get projects:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to get projects",

            error:
                error.message,

        });
    }
}


// =================================================
// Create Sandbox
// =================================================

export async function createSandbox(req, res) {

    const { projectId, prompt } =
        req.body || {};

    const userId =
        req.user.userId ||
        req.user.id ||
        req.user._id;

    let sandboxID = null;


    // -----------------------------------------
    // Validate request body
    // -----------------------------------------

    if (
        !req.body ||
        typeof req.body !== "object"
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Request body is required and must be JSON.",

        });
    }


    try {

        let project = null;


        // =====================================
        // Existing Project
        // =====================================

        if (projectId) {

            /*
             * MongoDB ObjectId validation removed.
             *
             * PostgreSQL project IDs can be
             * integer / UUID depending on schema.
             */


            project =
                await Project.findOne({

                    id: projectId,

                    user: userId,

                });


            if (!project) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Project not found",

                });
            }

        }


        // =====================================
        // Create New Project
        // =====================================

        else {

            const title =
                prompt &&
                typeof prompt === "string" &&
                prompt.trim()

                    ? prompt
                        .trim()
                        .slice(0, 120)

                    : "New Sandbox Project";


            project =
                await Project.create({

                    user: userId,

                    title,

                });
        }


        // =====================================
        // Generate Sandbox ID
        // =====================================

        sandboxID = uuid();


        const podName =
            `sandbox-pod-${sandboxID}`;


        console.log(
            "Creating sandbox:",
            sandboxID
        );


        // =====================================
        // Create Kubernetes Resources
        // =====================================

        await Promise.all([

            createPod(
                sandboxID,
                project.id
            ),

            createService(
                sandboxID
            ),

        ]);


        // =====================================
        // Wait for Pod Ready
        // =====================================

        await waitForPodReady(
            podName
        );


        // =====================================
        // Start Redis TTL
        // =====================================

        await createSandboxKey(
            sandboxID
        );


        // =====================================
        // Save Sandbox ID
        // =====================================

        project.sandboxID =
            sandboxID;

        await project.save();


        // =====================================
        // Response
        // =====================================

        return res.status(201).json({

            success: true,

            message:
                "Sandbox created successfully",

            projectId:
                project.id,

            sandboxID,

            previewUrl:
                `http://${sandboxID}.preview.localhost`,

            agentUrl:
                `http://${sandboxID}.agent.localhost`,

        });

    } catch (error) {

        console.error(
            "Sandbox creation failed:",
            error.message
        );


        // -------------------------------------
        // Cleanup partially created resources
        // -------------------------------------

        if (sandboxID) {

            await cleanupSandbox(
                sandboxID
            );
        }


        return res.status(500).json({

            success: false,

            message:
                "Sandbox creation failed",

            error:
                error.message,

        });
    }
}


// =================================================
// Health Check
// =================================================

export function healthCheck(req, res) {

    return res.status(200).json({

        success: true,

        message:
            "Sandbox API Running",

    });
}