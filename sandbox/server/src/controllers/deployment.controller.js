import Project from "../models/project.model.js";

import {
    createProductionBuildConfig,
} from "../kubernetes/production-build-config.js";

import {
    createProductionBuildJob,
} from "../kubernetes/production-build.js";

import {
    deployProduction,
} from "../kubernetes/production-deployer.js";


// ================================================
// Deploy Project
// ================================================

export async function deployProject(req, res) {

    try {

        const userId =
            req.user.userId ||
            req.user.id ||
            req.user._id;

        const { projectId } = req.params;


        // --------------------------------
        // Validate project ID
        // --------------------------------

        if (!projectId) {

            return res.status(400).json({
                success: false,
                message: "A valid projectId is required",
            });
        }


        // --------------------------------
        // Find user's project
        // --------------------------------

        const project =
            await Project.findOne({
                id: projectId,
                user: userId,
            });


        if (!project) {

            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }


        // --------------------------------
        // Already building
        // --------------------------------

        if (
            project.deploymentStatus ===
            "building"
        ) {

            return res.status(409).json({
                success: false,
                message:
                    "Project deployment is already in progress",
            });
        }


        // --------------------------------
        // Already deployed
        // --------------------------------

        if (
            project.deploymentStatus ===
            "deployed"
        ) {

            return res.status(200).json({
                success: true,
                message:
                    "Project is already deployed",

                productionUrl:
                    project.productionUrl,

                project,
            });
        }


        console.log(
            `🚀 Starting production deployment: ${projectId}`
        );


        // --------------------------------
        // Mark project as building
        // --------------------------------

        project.deploymentStatus =
            "building";

        project.productionUrl = null;

        project.deploymentName = null;

        project.serviceName = null;

        project.ingressName = null;

        project.buildJobName = null;

        project.buildConfigMapName = null;

        project.deployedAt = null;


        await project.save();


        // --------------------------------
        // Create Build ConfigMap
        // --------------------------------

        const configMapName =
            await createProductionBuildConfig(
                projectId
            );


        console.log(
            `📦 Production build ConfigMap created: ${configMapName}`
        );


        // --------------------------------
        // Create Build Job
        // --------------------------------

        const buildJobName =
            await createProductionBuildJob(
                projectId
            );


        console.log(
            `🏗️ Production build Job created: ${buildJobName}`
        );


        // --------------------------------
        // Save build resources
        // --------------------------------

        project.buildJobName =
            buildJobName;

        project.buildConfigMapName =
            configMapName;


        await project.save();


        // --------------------------------
        // Start background deployment
        // --------------------------------

        deployProduction(
            projectId,
            buildJobName
        ).catch(async (error) => {

            console.error(
                `❌ Background production deployment failed for ${projectId}:`,
                error
            );


            try {

                await Project.findByIdAndUpdate(
                    projectId,
                    {
                        deploymentStatus:
                            "failed",
                    }
                );

            } catch (updateError) {

                console.error(
                    "❌ Failed to update deployment status:",
                    updateError.message
                );

            }

        });


        // --------------------------------
        // Return immediately
        // --------------------------------

        return res.status(202).json({

            success: true,

            message:
                "Production build started",

            projectId:
                project.id,

            status:
                "building",

            buildJobName,

            configMapName,
        });


    } catch (error) {

        console.error(
            "❌ Production deployment failed:",
            error
        );


        // --------------------------------
        // Mark deployment as failed
        // --------------------------------

        try {

            const { projectId } =
                req.params;


            if (projectId) {

                await Project.findOneAndUpdate(
                    {
                        id: projectId,
                    },
                    {
                        deploymentStatus:
                            "failed",
                    }
                );

            }

        } catch (updateError) {

            console.error(
                "❌ Failed to update deployment status:",
                updateError.message
            );

        }


        return res.status(500).json({

            success: false,

            message:
                "Production deployment failed",

            error:
                error.message,
        });
    }
}
