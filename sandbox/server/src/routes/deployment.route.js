import express from "express";

import { deployProject } from "../controllers/deployment.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Deploy project
router.post(
    "/:projectId",
    authMiddleware,
    deployProject
);

export default router;