import dotenv from "dotenv";
dotenv.config({ override: true });

import pkg from "pg";

const { Pool } = pkg;

console.log("DATABASE URL EXISTS:", !!process.env.AUTH_DATABASE_URL);

export const pool = new Pool({
  connectionString: process.env.AUTH_DATABASE_URL,
});

const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log("PostgreSQL Connected ✅");
    client.release();
  } catch (error) {
    console.log("PostgreSQL Connection Error:", error.message);
    process.exit(1);
  }
};

export default connectDB;