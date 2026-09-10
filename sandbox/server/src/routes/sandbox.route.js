import express from "express";

import {
    createProject,
    createSandbox,
    getProjects,
    healthCheck,
} from "../controllers/sandbox.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";




const router = express.Router();


// Sandbox routes
router.post(
    "/start",
    authMiddleware,
    createSandbox
);

router.get(
    "/health",
    healthCheck
);


// Project routes
router.post(
    "/project",
    authMiddleware,
    createProject
);

router.get(
    "/projects",
    authMiddleware,
    getProjects
);


export default router;