import axios from "axios";
import { tool } from "langchain";
import * as z from "zod";

const getSandboxUrl = (projectId) =>
  `http://sandbox-service-${projectId}:3000`;

const formatFiles = (files) => files.join(",");

/**
 * @route GET /list-files
 * @description Get all available files from workspace
 */
export const listFiles = tool(
  async ({}, config) => {
    const writer = config.writer;
    const SANDBOX_URL = getSandboxUrl(config.context.projectId);

    writer("listing files in project direactory");

    const response = await axios.get(
      `${SANDBOX_URL}/list-files`
    );

    writer("listing successfull");

    return JSON.stringify(response.data.files);
  },
  {
    name: "list_files",

    description:
      "List all files available in the workspace before making any changes.",

    schema: z.object({})
  }
);

/**
 * @route GET /read-file
 * @description Read content of selected workspace files
 */
export const readFiles = tool(
  async ({ files }, config) => {
    const writer = config.writer;
    const SANDBOX_URL = getSandboxUrl(config.context.projectId);

    writer(
      "Reading files in project direactory " +
      formatFiles(files) +
      "\n"
    );

    const response = await axios.get(
      `${SANDBOX_URL}/read-file?files=${encodeURIComponent(
        formatFiles(files)
      )}`
    );

    writer("Read files suceessfull");

    return JSON.stringify(response.data);
  },
  {
    name: "read_files",

    description:
      "Read the contents of one or more existing workspace files before updating them.",

    schema: z.object({
      files: z
        .array(z.string())
        .describe(
          "List of absolute file paths to read from the workspace."
        )
    })
  }
);

/**
 * @route PATCH /update-files
 * @description Update or create workspace files
 */
export const updateFiles = tool(
  async ({ updates }, config) => {
    const writer = config.writer;
    const SANDBOX_URL = getSandboxUrl(config.context.projectId);

    writer("update files in project direactory");

    const response = await axios.patch(
      `${SANDBOX_URL}/update-files`,
      {
        updates
      }
    );

    writer("update files sucessfull");

    return JSON.stringify(response.data);
  },
  {
    name: "update_files",

    description: `
      Update existing files or create new files by providing file paths and content.
      Must read files before updating.
      Do not return code in chat response.
      Directly write changes into workspace.
    `,

    schema: z.object({
      updates: z
        .array(
          z.object({
            file: z
              .string()
              .describe(
                "Absolute path of the file to update or create."
              ),

            content: z
              .string()
              .describe(
                "New content that should be written into the file."
              )
          })
        )
        .describe(
          "List of files with their updated content."
        )
    })
  }
);