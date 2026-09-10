import "dotenv/config";
import chokidar from 'chokidar';
import { S3Client, PutObjectCommand, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import fs from 'fs';
import path from 'path';

// Log the reason if the process ever exits unexpectedly (debugging aid)
process.on("exit", (code) => {
    console.log(`⚠️ Process exiting with code ${code}`);
});

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const projectId = process.env.PROJECT_ID;
const bucketName = "nexagent-bucket";
const localDirectory = '/workspace';

async function checkS3ForFiles() {
    console.log(`Checking S3 for existing files in project: ${projectId}`);
    const listCommand = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: `${projectId}/`
    });
    const listResponse = await s3Client.send(listCommand);
    return listResponse.Contents || [];
}

async function downloadFilesFromS3(s3Objects) {
    console.log("Found existing files in S3. Syncing to local directory...");
    for (const file of s3Objects) {
        // Skip if it is a directory placeholder
        if (file.Key.endsWith('/')) continue;

        const getCommand = new GetObjectCommand({
            Bucket: bucketName,
            Key: file.Key
        });
        const getResponse = await s3Client.send(getCommand);

        const relativePath = file.Key.replace(`${projectId}/`, '');
        const localFilePath = path.join(localDirectory, relativePath);

        // Ensure the local directory structure exists
        fs.mkdirSync(path.dirname(localFilePath), { recursive: true });

        const writeStream = fs.createWriteStream(localFilePath);
        getResponse.Body.pipe(writeStream);

        await new Promise((resolve, reject) => {
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });

        console.log(`Downloaded ${file.Key} to ${localFilePath}`);
    }
}

async function uploadFileToS3(filePath) {
    try {
        const fileContent = fs.readFileSync(filePath);
        const relativePath = path.relative(localDirectory, filePath);

        if (filePath.includes('node_modules') || filePath.includes('.env')) {
            return; // Skip syncing node_modules and .env files
        }

        console.log(filePath)
        // Files will have the prefix of projectId
        const s3Key = `${projectId}/${relativePath}`;

        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: s3Key,
            Body: fileContent
        });

        await s3Client.send(command);
        console.log(`Successfully synced ${filePath} to s3://${bucketName}/${s3Key}`);
    } catch (err) {
        console.error(`Error syncing ${filePath} to S3:`, err);
    }
}

function startWatcher(hasFiles) {
    console.log("Starting chokidar watch...");

    const watcher = chokidar.watch(localDirectory, {
        ignored: [
            /(^|[\/\\])\../, // ignore dotfiles
            /node_modules/,  // ignore node_modules completely
            /\.env/          // ignore .env files
        ],
        persistent: true,
        ignoreInitial: hasFiles, // if S3 is empty (hasFiles is false), upload all existing local files

        // IMPORTANT — force polling instead of relying on native
        // inotify, which is unreliable on Docker Desktop / k8s
        // EmptyDir / overlay volumes and can silently attach to
        // nothing, letting the event loop drain and the process
        // exit cleanly with code 0 even though nothing "failed".
        usePolling: true,
        interval: 300,
    });

    watcher.on('all', async (event, filePath) => {
        if (event === 'add' || event === 'change') {
            if (filePath.includes('node_modules') || filePath.includes('.env')) {
                return; // Skip syncing node_modules and .env files
            }
            await uploadFileToS3(filePath);
        }
    });

    watcher.on('error', (error) => {
        console.error("❌ Chokidar error:", error);
    });

    watcher.on('ready', () => {
        console.log("🚀 Watcher ready — sync is running.");
    });

    return watcher;
}

async function init() {
    try {
        const s3Objects = await checkS3ForFiles();
        const hasFiles = s3Objects.length > 0;

        if (hasFiles) {
            await downloadFilesFromS3(s3Objects);
        } else {
            console.log("No files found in S3. Local files will be synced to S3 automatically.");
        }

        startWatcher(hasFiles);
    } catch (error) {
        console.error("Error during initialization:", error);
        process.exit(1);
    }
}

init();