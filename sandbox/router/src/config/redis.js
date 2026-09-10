import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL);


redis.on("connect", () => {
  console.log("✅ Connected to Redis");
});


redis.on("error", (error) => {
  console.error("❌ Redis connection error:", error.message);
});


export async function RefreshTTL(sandboxId) {
  try {
    const result = await redis.expire(
      `sandbox:${sandboxId}`,
      60 * 20
    );

    console.log(
      `TTL refreshed for sandbox:${sandboxId}`,
      result
    );

    return result;

  } catch (error) {
    console.error(
      "Refresh TTL error:",
      error.message
    );

    throw error;
  }
}


export default redis;