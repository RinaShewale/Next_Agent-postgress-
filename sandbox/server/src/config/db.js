import dotenv from "dotenv";
dotenv.config({ override: true });

import pkg from "pg";

const { Pool } = pkg;

export const pool = new Pool({
  connectionString: process.env.SANDBOX_DATABASE_URL,
});

export async function connectDB() {
  try {
    const client = await pool.connect();

    console.log("✅ PostgreSQL connected: sandboxdb");

    client.release();
  } catch (error) {
    console.error(
      "❌ PostgreSQL connection failed:",
      error.message
    );

    process.exit(1);
  }
}