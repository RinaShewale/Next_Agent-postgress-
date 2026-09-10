import { Router } from "express";
import { agent } from "../agents/code.agent.js";

const AgentRouter = Router();

AgentRouter.post("/invoke", async (req, res) => {
  try {
    const { message, projectId } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required.",
      });
    }

    // Get the stream FIRST (await it), so any setup errors
    // (bad config, auth failure, etc.) are caught before
    // we commit to sending SSE headers.
    const stream = await agent.stream(
      {
        messages: [
          {
            role: "user",
            content: message,
          },
        ],
      },
      {
        context: {
          projectId,
        },
        streamMode: "custom",
      }
    );

    // Only now do we know streaming will actually happen,
    // so it's safe to write the SSE headers.
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    for await (const chunk of stream) {
      console.log(chunk);
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    }

    res.write("event: end\n");
    res.write("data: done\n\n");
    res.end();
  } catch (error) {
    console.error(error);

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    res.write(`event: error\n`);
    res.write(`data: ${JSON.stringify({ message: error.message })}\n\n`);
    res.end();
  }
});

export default AgentRouter;