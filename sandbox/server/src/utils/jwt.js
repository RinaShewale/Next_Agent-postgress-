import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "nexxagent-google-auth-secret";

export function generateToken(payload) {
  try {
    return jwt.sign(
      payload,
      JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );
  } catch (err) {
    console.error("Token generation failed:", err);
    return null;
  }
}


export function verifyToken(token) {
  try {
    return jwt.verify(
      token,
      JWT_SECRET
    );
  } catch (err) {
    console.error("Token verification failed:", err.message);
    return null;
  }
}