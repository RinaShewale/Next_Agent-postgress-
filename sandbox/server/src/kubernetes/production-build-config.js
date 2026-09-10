//production-build-config.js

import { k8sCoreV1Api } from "./config.js";

export async function createProductionBuildConfig(projectId) {
    const configMapName =
        `production-build-scripts-${projectId}`;

    const downloadScript = `
import fs from "fs";
import path from "path";

import {
    S3Client,
    ListObjectsV2Command,
    GetObjectCommand
} from "@aws-sdk/client-s3";

const projectId = process.env.PROJECT_ID;
const bucketName = "nexagent-bucket";
const localDirectory = "/workspace";

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

async function downloadProject() {

    console.log("☁️ Downloading project:", projectId);

    const listCommand = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: \`\${projectId}/\`
    });

    const response = await s3Client.send(listCommand);

    const files = response.Contents || [];

    if (files.length === 0) {
        throw new Error("No project files found in S3");
    }

    for (const file of files) {

        const key = file.Key;

        if (!key || key.endsWith("/")) {
            continue;
        }

        // Never download previous production output
        if (key.startsWith(\`\${projectId}/production/\`)) {
            continue;
        }

        const relativePath =
            key.replace(\`\${projectId}/\`, "");

        const localFilePath =
            path.join(localDirectory, relativePath);

        fs.mkdirSync(
            path.dirname(localFilePath),
            { recursive: true }
        );

        const getCommand =
            new GetObjectCommand({
                Bucket: bucketName,
                Key: key
            });

        const result =
            await s3Client.send(getCommand);

        const writeStream =
            fs.createWriteStream(localFilePath);

        result.Body.pipe(writeStream);

        await new Promise((resolve, reject) => {

            writeStream.on("finish", resolve);

            writeStream.on("error", reject);

        });

        console.log(
            \`Downloaded: \${relativePath}\`
        );
    }

    console.log("✅ Project downloaded successfully");
}

downloadProject().catch((error) => {

    console.error(
        "❌ S3 download failed:",
        error
    );

    process.exit(1);

});
`;


    const uploadScript = `
import fs from "fs";
import path from "path";

import {
    S3Client,
    PutObjectCommand
} from "@aws-sdk/client-s3";

const projectId = process.env.PROJECT_ID;
const bucketName = "nexagent-bucket";

const distDirectory =
    "/workspace/dist";

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

// --------------------------------
// Content-Type lookup by file extension
// --------------------------------
//
// S3's PutObjectCommand does NOT infer Content-Type automatically.
// Without this, every uploaded file defaults to
// "application/octet-stream", which makes browsers download
// index.html instead of rendering it, and JS/CSS files fail to
// execute/apply correctly even if the browser does render the HTML.

const CONTENT_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".mjs": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
    ".eot": "application/vnd.ms-fontobject",
    ".txt": "text/plain; charset=utf-8",
    ".map": "application/json; charset=utf-8",
};

function getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return CONTENT_TYPES[ext] || "application/octet-stream";
}

function getFiles(directory) {

    const result = [];

    const entries =
        fs.readdirSync(directory, {
            withFileTypes: true
        });

    for (const entry of entries) {

        const fullPath =
            path.join(directory, entry.name);

        if (entry.isDirectory()) {

            result.push(
                ...getFiles(fullPath)
            );

        } else {

            result.push(fullPath);
        }
    }

    return result;
}

async function uploadProduction() {

    console.log(
        "☁️ Uploading production files..."
    );

    if (!fs.existsSync(distDirectory)) {

        throw new Error(
            "dist directory does not exist"
        );
    }

    const files =
        getFiles(distDirectory);

    for (const filePath of files) {

        const relativePath =
            path.relative(
                distDirectory,
                filePath
            );

        const s3Key =
            \`\${projectId}/production/\${relativePath}\`;

        const fileContent =
            fs.readFileSync(filePath);

        const contentType =
            getContentType(filePath);

        const command =
            new PutObjectCommand({
                Bucket: bucketName,
                Key: s3Key,
                Body: fileContent,
                ContentType: contentType,
            });

        await s3Client.send(command);

        console.log(
            \`Uploaded: \${s3Key} (\${contentType})\`
        );
    }

    console.log(
        "✅ Production files uploaded successfully"
    );
}

uploadProduction().catch((error) => {

    console.error(
        "❌ Production upload failed:",
        error
    );

    process.exit(1);

});
`;


    const manifest = {
        apiVersion: "v1",

        kind: "ConfigMap",

        metadata: {
            name: configMapName,
        },

        data: {
            "download-project.mjs":
                downloadScript,

            "upload-production.mjs":
                uploadScript,
        },
    };


    await k8sCoreV1Api.createNamespacedConfigMap({
        namespace: "default",
        body: manifest,
    });


    console.log(
        `📦 Production build ConfigMap created: ${configMapName}`
    );


    return configMapName;
}