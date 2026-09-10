import express from "express";
import morgan from "morgan";

import AgentRouter from "./routes/agent.routes.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Health Check
app.get("/api/ai", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AI API is working 🚀",
  });
});

// AI Routes
app.use("/api/ai", AgentRouter);

export default app;