import "dotenv/config";
import { Redis } from "ioredis";

import { deletePod } from "../kubernetes/pod.js";
import { deleteService } from "../kubernetes/service.js";

// ---- Redis clients ----
// Explicit retry/backoff settings so failed requests don't hang forever
const redisOptions = {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => Math.min(times * 200, 2000), // capped exponential backoff
};

const redis = new Redis(process.env.REDIS_URL, redisOptions);
const subscribe = new Redis(process.env.REDIS_URL, redisOptions);

// ---- Redis connection logs ----
redis.on("connect", () => {
  console.log("🔌 Redis connection established");
});

redis.on("ready", () => {
  console.log("✅ Redis is ready to use");
});

redis.on("error", (err) => {
  console.error("❌ Redis error:", err.message);
});

redis.on("reconnecting", () => {
  console.log("🔄 Redis reconnecting...");
});

// ---- Subscriber Redis logs ----
subscribe.on("connect", () => {
  console.log("🔌 Redis subscriber connected");
});

subscribe.on("ready", () => {
  console.log("✅ Redis subscriber ready");
});

subscribe.on("error", (err) => {
  console.error("❌ Redis subscriber error:", err.message);
});

subscribe.on("reconnecting", () => {
  console.log("🔄 Redis subscriber reconnecting...");
});

// ---- Create sandbox key with 2-minute expiry ----
export async function createSandboxKey(sandboxId) {
  try {
    await redis.set(
      `sandbox:${sandboxId}`,
      JSON.stringify({
        status: "active",
        createdAt: Date.now(),
      }),
      "EX",
      60 * 20
    );
  } catch (err) {
    console.error(
      `❌ Failed to create sandbox key for ${sandboxId}:`,
      err.message
    );
    throw err; // let the caller decide how to handle this
  }
}

// ---- Cleanup logic (shared by expiry event + reconciliation sweep) ----
async function cleanupSandbox(sandboxId, source = "event") {
  console.log(`Cleaning up sandbox ${sandboxId} (source: ${source})`);
  try {
    await Promise.all([deletePod(sandboxId), deleteService(sandboxId)]);
    console.log(`🗑️ Sandbox ${sandboxId} resources deleted (${source})`);
  } catch (error) {
    console.error(
      `❌ Cleanup failed for sandbox ${sandboxId} (${source}):`,
      error.message
    );
  }
}

// ---- Enable keyspace notifications (with verification) ----
async function setupKeyspaceNotifications() {
  try {
    await subscribe.config("SET", "notify-keyspace-events", "Ex");

    // Verify it actually applied — Redis Cloud sometimes restricts/ignores CONFIG SET
    const [, value] = await redis.config("GET", "notify-keyspace-events");
    if (!value || !value.includes("x")) {
      console.warn(
        "⚠️ notify-keyspace-events does not appear to include expiry events.",
        "Current value:",
        value,
        "— expired-key cleanup may not fire.",
        "If this is a managed Redis instance, you may need to set this",
        "from the provider's dashboard/CLI instead of via CONFIG SET."
      );
    } else {
      console.log("✅ Keyspace notifications confirmed active:", value);
    }
  } catch (err) {
    console.error(
      "⚠️ Failed to set notify-keyspace-events — check Redis permissions:",
      err.message,
      "\nFalling back to the periodic reconciliation sweep only."
    );
  }
}

// ---- Subscribe to expired events ----
async function setupExpirySubscription() {
  try {
    await subscribe.subscribe("__keyevent@0__:expired");
    console.log("📡 Subscribed to expired key events");
  } catch (err) {
    console.error(
      "❌ Failed to subscribe to expired key events:",
      err.message
    );
  }
}

subscribe.on("message", async (channel, key) => {
  console.log(`Key expired: ${key}`);

  if (!key.startsWith("sandbox:")) return;

  const sandboxId = key.split(":")[1];
  console.log("Expired Sandbox ID:", sandboxId);

  await cleanupSandbox(sandboxId, "keyspace-event");
});

// ---- Reconciliation safety net ----
// Keyspace notification events can occasionally be delayed or missed
// (e.g. under memory pressure, failover, or provider restrictions).
// This periodic sweep catches anything the event-based path missed.
//
// NOTE: this assumes you have a way to list currently-provisioned
// sandbox pods/services from Kubernetes. Wire `listActiveSandboxIds()`
// up to your k8s client (e.g. list pods with a `sandboxId` label).
async function reconciliationSweep(listActiveSandboxIds) {
  if (typeof listActiveSandboxIds !== "function") return;

  try {
    const activeIds = await listActiveSandboxIds(); // e.g. from k8s labels
    for (const sandboxId of activeIds) {
      const exists = await redis.exists(`sandbox:${sandboxId}`);
      if (!exists) {
        console.log(
          `🔎 Reconciliation found orphaned sandbox ${sandboxId} (no Redis key) — cleaning up`
        );
        await cleanupSandbox(sandboxId, "reconciliation");
      }
    }
  } catch (err) {
    console.error("❌ Reconciliation sweep failed:", err.message);
  }
}

// Call this once from your server startup, passing your k8s listing function:
//   startReconciliationLoop(listActiveSandboxIdsFromK8s);
export function startReconciliationLoop(
  listActiveSandboxIds,
  intervalMs = 5 * 60 * 1000
) {
  setInterval(() => reconciliationSweep(listActiveSandboxIds), intervalMs);
  console.log(
    `🔁 Reconciliation sweep scheduled every ${intervalMs / 1000}s`
  );
}

// ---- Initialize ----
await setupKeyspaceNotifications();
await setupExpirySubscription();

export { redis, subscribe };