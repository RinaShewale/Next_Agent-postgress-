import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";

import sandboxRouter from "./routes/sandbox.route.js";
import deploymentRouter from "./routes/deployment.route.js";

const app = express();


// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));


// Routes
app.use("/api/sandbox", sandboxRouter);
app.use("/api/deployment", deploymentRouter);


// Default route
app.get("/", (req, res) => {
  res.json({
    message: "API Running 🚀",
  });
});


export default app;