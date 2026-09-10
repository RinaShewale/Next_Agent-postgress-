// production-deployer.js

import {
    k8sBatchV1Api,
    k8sCoreV1Api,
} from "./config.js";

import Project from "../models/project.model.js";

import { deletePod } from "./pod.js";
import { deleteService } from "./service.js";


// ==================================================
// BUILD PRODUCTION URL
// ==================================================

function buildProductionUrl(projectId) {

    return `https://nexagent-${projectId}.netlify.app/`;
}


// ==================================================
// WAIT FOR BUILD JOB
// ==================================================

async function waitForBuildJob(jobName) {

    const MAX_RETRIES = 120;

    const INTERVAL = 3000;


    for (
        let attempt = 0;
        attempt < MAX_RETRIES;
        attempt++
    ) {

        try {

            const response =
                await k8sBatchV1Api.readNamespacedJob({
                    name: jobName,

                    namespace: "default",
                });


            const job = response;


            // ------------------------------------------
            // SUCCESS
            // ------------------------------------------

            if (
                job.status?.succeeded &&
                job.status.succeeded >= 1
            ) {

                console.log(
                    `✅ Production build completed: ${jobName}`
                );

                return "completed";
            }


            // ------------------------------------------
            // FAILED
            // ------------------------------------------

            const failedCondition =
                job.status?.conditions?.find(
                    (condition) =>
                        condition.type === "Failed" &&
                        condition.status === "True"
                );


            if (failedCondition) {

                console.error(
                    `❌ Production build failed: ${jobName}`
                );

                return "failed";
            }


            // ------------------------------------------
            // WAIT
            // ------------------------------------------

            console.log(
                `⏳ Waiting for production build: ${jobName}`
            );

        } catch (error) {

            console.error(
                `❌ Failed to check build Job ${jobName}:`,
                error.message
            );

            throw error;
        }


        await new Promise(
            (resolve) =>
                setTimeout(resolve, INTERVAL)
        );
    }


    throw new Error(
        `Production build timeout: ${jobName}`
    );
}


// ==================================================
// DELETE BUILD CONFIGMAP
// ==================================================

async function cleanupBuildConfigMap(projectId) {

    const configMapName =
        `production-build-scripts-${projectId}`;


    try {

        await k8sCoreV1Api.deleteNamespacedConfigMap({
            name: configMapName,

            namespace: "default",
        });


        console.log(
            `🧹 Deleted build ConfigMap: ${configMapName}`
        );

    } catch (error) {

        const statusCode =
            error?.code ||
            error?.statusCode ||
            error?.response?.statusCode;


        if (statusCode !== 404) {

            console.error(
                `❌ Failed to delete build ConfigMap ${configMapName}:`,
                error.message
            );
        }
    }
}


// ==================================================
// CLEANUP SANDBOX
// ==================================================

async function cleanupProjectSandbox(project) {

    const sandboxID =
        project.sandboxID;


    if (!sandboxID) {

        return;
    }


    console.log(
        `🧹 Cleaning sandbox: ${sandboxID}`
    );


    const results =
        await Promise.allSettled([

            deletePod(sandboxID),

            deleteService(sandboxID),

        ]);


    results.forEach(
        (result, index) => {

            if (
                result.status === "rejected"
            ) {

                console.error(
                    `❌ Sandbox cleanup step ${index} failed:`,
                    result.reason?.message ??
                    result.reason
                );
            }
        }
    );


    project.sandboxID = null;
}


// ==================================================
// DEPLOY PRODUCTION
// ==================================================

export async function deployProduction(
    projectId,
    jobName
) {

    try {

        console.log(
            `🚀 Starting production deployment: ${projectId}`
        );


        // ==========================================
        // WAIT FOR BUILD
        // ==========================================

        const buildStatus =
            await waitForBuildJob(jobName);


        if (
            buildStatus === "failed"
        ) {

            await cleanupBuildConfigMap(
                projectId
            );


            await Project.findByIdAndUpdate(
                projectId,

                {
                    deploymentStatus: "failed",
                }
            );


            return;
        }


        // ==========================================
        // BUILD SUCCESS
        // ==========================================

        await cleanupBuildConfigMap(
            projectId
        );


        // ==========================================
        // NETLIFY URL
        // ==========================================

        const productionUrl =
            buildProductionUrl(projectId);


        console.log(
            `🌍 Production URL: ${productionUrl}`
        );


        // ==========================================
        // LOAD PROJECT
        // ==========================================

        const project =
            await Project.findById(projectId);


        if (!project) {

            throw new Error(
                `Project not found: ${projectId}`
            );
        }


        // ==========================================
        // UPDATE PROJECT
        // ==========================================

        project.deploymentStatus =
            "deployed";


        project.productionUrl =
            productionUrl;


        project.deployedAt =
            new Date();


        // ==========================================
        // CLEAR OLD KUBERNETES PRODUCTION DATA
        // ==========================================

        project.deploymentName =
            null;


        project.serviceName =
            null;


        project.ingressName =
            null;


        // ==========================================
        // CLEAN SANDBOX
        // ==========================================

        await cleanupProjectSandbox(
            project
        );


        // ==========================================
        // SAVE
        // ==========================================

        await project.save();


        console.log(
            `🎉 Production deployed successfully: ${productionUrl}`
        );

    } catch (error) {

        console.error(
            `❌ Production deployment failed for ${projectId}:`,
            error.message
        );


        try {

            await cleanupBuildConfigMap(
                projectId
            );

        } catch (_) {}


        await Project.findByIdAndUpdate(
            projectId,

            {
                deploymentStatus: "failed",
            }
        );
    }
} 