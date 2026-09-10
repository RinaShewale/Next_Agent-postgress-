import express from "express";
import morgan from "morgan";
import fs from "fs";
import path from "path";
import http from "http";
import { Server } from "socket.io";
import pty from "node-pty";
import os from "os";

const WORKING_DIR = "/workspace";

const app = express();
const httpServer = http.createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH"],
  },
});

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Sandbox Agent API",
    status: "success",
    // Hit this route after deploying to confirm the new code is actually
    // running on this pod. If you don't see "ansi-fix-v2" here, the
    // terminal fix below has NOT been deployed yet — restart/rebuild
    // the sandbox before testing further.
    buildTag: "ansi-fix-v2",
  });
});

// -------------------------------
// PTY (terminal) setup
// -------------------------------
const shell = process.env.SHELL || (os.platform() === "win32" ? "powershell.exe" : "bash");

// Disable bracketed-paste mode at the source. This is what actually emits
// the [?2004h / [?2004l codes around every prompt in bash >= 5.1 — it's a
// readline default, independent of TERM. Pointing INPUTRC at a file that
// turns it off stops the codes from being generated in the first place.
const INPUTRC_PATH = path.join(os.tmpdir(), "sandbox-agent.inputrc");
fs.writeFileSync(INPUTRC_PATH, "set enable-bracketed-paste off\n");

const ptyProcess = pty.spawn(shell, [], {
  name: "xterm-color",
  cols: 80,
  rows: 30,
  cwd: WORKING_DIR,
  env: { ...process.env, INPUTRC: INPUTRC_PATH },
});

// -------------------------------
// ANSI stripping, buffered across chunks
// -------------------------------
// node-pty's onData fires per raw OS chunk, so an escape sequence can be
// split across two events (e.g. the ESC byte in one chunk, "[?2004l" in
// the next). Stripping per-chunk with a plain regex misses that split
// half and lets it leak straight to the client. This buffers any
// trailing, not-yet-complete sequence and prepends it to the next chunk
// before stripping, so split sequences are always caught whole.
const ANSI_PATTERN = new RegExp(
  [
    "[\\u001B\\u009B](?:",
    "\\][^\\u0007\\u001B]*(?:\\u0007|\\u001B\\\\)", // OSC ... BEL or ST
    "|",
    "\\[[0-?]*[ -/]*[@-~]", // CSI ... final byte
    "|",
    "[@-Z\\\\-_]", // simple two-byte escape
    ")",
  ].join(""),
  "g"
);

const COMPLETE_SEQ_AT_START = new RegExp(
  "^[\\u001B\\u009B](?:" +
  "\\][^\\u0007\\u001B]*(?:\\u0007|\\u001B\\\\)" +
  "|" +
  "\\[[0-?]*[ -/]*[@-~]" +
  "|" +
  "[@-Z\\\\-_]" +
  ")"
);

let pendingData = "";
function cleanTerminalData(chunk) {
  let buffer = pendingData + chunk;

  const lastEscIndex = Math.max(
    buffer.lastIndexOf("\u001b"),
    buffer.lastIndexOf("\u009b")
  );

  let safeEnd = buffer.length;
  if (lastEscIndex !== -1) {
    const tail = buffer.slice(lastEscIndex);
    if (!COMPLETE_SEQ_AT_START.test(tail) && tail.length < 64) {
      safeEnd = lastEscIndex;
    }
  }

  const readyChunk = buffer.slice(0, safeEnd);
  pendingData = buffer.slice(safeEnd);

  return readyChunk.replace(ANSI_PATTERN, "");
}

ptyProcess.onData((data) => {
  const cleanData = cleanTerminalData(data);
  if (cleanData.length > 0) {
    io.emit("terminal-output", cleanData);
  }
});

ptyProcess.onExit(({ exitCode, signal }) => {
  console.log(`pty process exited with code ${exitCode}, signal ${signal}`);
});

io.on("connection", (socket) => {
  console.log("client connected " + socket.id);

  // These listeners must be registered on the socket, not on `io`,
  // otherwise they never fire per-client.
  socket.on("terminal-input", (data) => {
    ptyProcess.write(data);
  });

  socket.on("disconnect", () => {
    console.log("client disconnected " + socket.id);
  });
});

/*
 * @route GET /list-files
 * @description List all files in the working directory
 */

app.get("/list-files", async (req, res) => {
  const listFiles = async (dir, baseDir) => {
    const entries = await fs.promises.readdir(dir, {
      withFileTypes: true,
    });

    const files = await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(dir, entry.name);

        // Ignore common folders
        if (
          entry.isDirectory() &&
          (entry.name === "node_modules" ||
            entry.name === ".git" ||
            entry.name === "dist" ||
            entry.name === "build" ||
            entry.name === ".next" ||
            entry.name === ".vite" ||
            entry.name === ".cache")
        ) {
          return [];
        }

        if (entry.isDirectory()) {
          return await listFiles(fullPath, baseDir);
        }

        return path.relative(baseDir, fullPath);
      })
    );

    return files.flat();
  };

  try {
    const files = await listFiles(WORKING_DIR, WORKING_DIR);

    res.status(200).json({
      message: "Files in working directory",
      files,
    });
  } catch (error) {
    res.status(500).json({
      message: `Error listing files: ${error.message}`,
      status: "error",
    });
  }
});

/*
 * @route GET /read-file
 * @description Read the content of specified files
 */

app.get("/read-file", async (req, res) => {
  const { files } = req.query;

  if (!files) {
    return res.status(400).json({
      message: "No files provided",
      status: "error",
    });
  }

  const fileList = files.split(",");

  const result = await Promise.all(
    fileList.map(async (file) => {
      const filePath = path.join(WORKING_DIR, file);

      try {
        const content = await fs.promises.readFile(filePath, "utf-8");

        return {
          [filePath.replace(WORKING_DIR, "")]: content,
        };
      } catch (error) {
        return {
          [filePath.replace(WORKING_DIR, "")]: `Error reading file: ${error.message}`,
        };
      }
    })
  );

  res.status(200).json({
    message: "Files read successfully",
    files: result,
  });
});

/*
 * @route PATCH /update-files
 * @description Update the content of specified files
 */

app.patch("/update-files", async (req, res) => {
  const updates = req.body.updates;

  if (!updates || !Array.isArray(updates)) {
    return res.status(400).json({
      message:
        "Invalid request body. 'updates' should be an array of objects with 'file' and 'content' properties.",
      status: "error",
    });
  }

  const result = await Promise.all(
    updates.map(async (update) => {
      const { oldFile, file, content } = update;

      const filePath = path.join(WORKING_DIR, file);

      try {
        // Create destination folder if missing
        await fs.promises.mkdir(path.dirname(filePath), {
          recursive: true,
        });

        // -------------------------------
        // Rename support
        // -------------------------------
        if (oldFile && oldFile !== file) {
          const oldFilePath = path.join(WORKING_DIR, oldFile);

          try {
            await fs.promises.access(oldFilePath);

            // Create parent folder of new path
            await fs.promises.mkdir(path.dirname(filePath), {
              recursive: true,
            });

            await fs.promises.rename(oldFilePath, filePath);
          } catch (err) {
            // If old file doesn't exist, continue.
            // This allows creating a new file.
            if (err.code !== "ENOENT") {
              throw err;
            }
          }
        }

        // Write latest content
        await fs.promises.writeFile(filePath, content, "utf-8");

        return {
          [filePath.replace(WORKING_DIR, "")]:
            oldFile && oldFile !== file
              ? "Renamed and updated successfully"
              : "Updated successfully",
        };
      } catch (error) {
        return {
          [filePath.replace(WORKING_DIR, "")]: `Error updating file: ${error.message}`,
        };
      }
    })
  );

  res.status(200).json({
    message: "File update result",
    result,
  });
});

/*
 * @route POST /create-files
 * @description Create specified files
 */

app.post("/create-files", async (req, res) => {
  const files = req.body.files;

  if (!files || !Array.isArray(files)) {
    return res.status(400).json({
      message:
        "Invalid request body. 'files' should be an array of objects with 'file' and 'content' properties.",
      status: "error",
    });
  }

  const result = await Promise.all(
    files.map(async (fileObj) => {
      const { file, content } = fileObj;
      const filePath = path.join(WORKING_DIR, file);

      try {
        // Create folder automatically if missing
        await fs.promises.mkdir(path.dirname(filePath), {
          recursive: true,
        });

        await fs.promises.writeFile(filePath, content, "utf-8");

        return {
          [filePath.replace(WORKING_DIR, "")]: "Created successfully",
        };
      } catch (error) {
        return {
          [filePath.replace(WORKING_DIR, "")]: `Error creating file: ${error.message}`,
        };
      }
    })
  );

  res.status(200).json({
    message: "File create success result",
    result,
  });
});

export default httpServer;