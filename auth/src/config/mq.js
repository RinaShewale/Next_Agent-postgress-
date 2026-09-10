import amqplib from "amqplib";

const QUEUE = "auth-notification-queue";

const MAX_RETRIES = 10;
const INITIAL_DELAY_MS = 1000; // 1s
const MAX_DELAY_MS = 30000; // 30s cap

let channel = null;
let connectingPromise = null;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function connectWithRetry() {
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      console.log(
        `[RabbitMQ] Connecting... (attempt ${attempt + 1}/${MAX_RETRIES})`
      );

      const connection = await amqplib.connect(process.env.RABBITMQ_URL);

      connection.on("error", (err) => {
        console.error("[RabbitMQ] Connection error:", err.message);
        channel = null;
        connectingPromise = null;
      });

      connection.on("close", () => {
        console.warn("[RabbitMQ] Connection closed. Will reconnect on next use.");
        channel = null;
        connectingPromise = null;
      });

      const ch = await connection.createChannel();

      await ch.assertQueue(QUEUE, {
        durable: true,
      });

      console.log("[RabbitMQ] Connected and channel ready.");

      channel = ch;
      return ch;
    } catch (error) {
      attempt++;

      const backoff = Math.min(
        INITIAL_DELAY_MS * 2 ** (attempt - 1),
        MAX_DELAY_MS
      );

      console.error(
        `[RabbitMQ] Connection failed: ${error.message}. Retrying in ${backoff}ms...`
      );

      if (attempt >= MAX_RETRIES) {
        console.error(
          "[RabbitMQ] Max retries reached. Giving up for now — will retry on next send attempt."
        );
        connectingPromise = null;
        throw error;
      }

      await delay(backoff);
    }
  }
}

async function getChannel() {
  if (channel) {
    return channel;
  }

  // Avoid multiple concurrent connection attempts
  if (!connectingPromise) {
    connectingPromise = connectWithRetry();
  }

  return connectingPromise;
}

export async function SendAuthNotification(message) {
  try {
    const ch = await getChannel();

    ch.sendToQueue(QUEUE, Buffer.from(JSON.stringify(message)), {
      persistent: true,
    });
  } catch (error) {
    // Don't crash the request/app if RabbitMQ is temporarily unavailable.
    // Log it so it's visible, but let the calling flow (e.g. Google login)
    // continue without blocking the user.
    console.error(
      "[RabbitMQ] Failed to send auth notification:",
      error.message
    );
  }
}


