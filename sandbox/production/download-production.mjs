import fs from "fs";
import path from "path";

import {
    S3Client,
    ListObjectsV2Command,
    GetObjectCommand
} from "@aws-sdk/client-s3";

const projectId = process.env.PROJECT_ID;
const bucketName = "nexagent-bucket";
const localDirectory = "/usr/share/nginx/html";
const prefix = `${projectId}/production/`;

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

async function downloadProductionBuild() {

    console.log("☁️ Downloading production build:", projectId);

    const listCommand = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: prefix
    });

    const response = await s3Client.send(listCommand);
    const files = response.Contents || [];

    if (files.length === 0) {
        throw new Error("No production build files found in S3");
    }

    fs.mkdirSync(localDirectory, { recursive: true });

    for (const file of files) {

        const key = file.Key;

        if (!key || key.endsWith("/")) {
            continue;
        }

        const relativePath = key.replace(prefix, "");
        const localFilePath = path.join(localDirectory, relativePath);

        fs.mkdirSync(path.dirname(localFilePath), { recursive: true });

        const getCommand = new GetObjectCommand({
            Bucket: bucketName,
            Key: key
        });

        const result = await s3Client.send(getCommand);
        const writeStream = fs.createWriteStream(localFilePath);

        result.Body.pipe(writeStream);

        await new Promise((resolve, reject) => {
            writeStream.on("finish", resolve);
            writeStream.on("error", reject);
        });

        console.log(`Downloaded: ${relativePath}`);
    }

    console.log("✅ Production build downloaded successfully");
}

downloadProductionBuild().catch((error) => {
    console.error("❌ Production download failed:", error);
    process.exit(1);
});