import jwt from "jsonwebtoken";
import { SendAuthNotification } from "../config/mq.js";
import User from "../models/user.model.js";

// Cookie options — shared across set/clear so they always match.
// sameSite: "none" + secure: true is required so the cookie is sent
// on cross-origin fetch/axios calls (not just the OAuth redirect itself).
const COOKIE_OPTS = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

const CLEAR_COOKIE_OPTS = {
  httpOnly: true,
  secure: true,
  sameSite: "none"
};

// Helper function to generate JWT
const generateAuthToken = (user) => {
  const userId = user.id ?? user._id;

  return jwt.sign(
    {
      id: userId,
      userId,
      googleId: user.googleId,
      email: user.email,
      name: user.name,
      avatar: user.avatar
    },
    process.env.JWT_SECRET || "nexxagent-google-auth-secret",
    {
      expiresIn: "7d"
    }
  );
};

// Google OAuth Callback Controller
export const googleCallback = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        message: "Google authentication failed"
      });
    }

    // Generate JWT token for user session
    const token = generateAuthToken(user);

    // Set HTTP-only cookie with JWT token for cross-service authorization
    res.cookie("token", token, COOKIE_OPTS);

    // Attempt sending background auth notification without blocking login if MQ fails
    try {
      await SendAuthNotification({
        userId: user.id ?? user._id,
        action: "google_login",
        timestamp: new Date(),
        email: user.email,
        name: user.name,
        avatar: user.avatar
      });
    } catch (mqError) {
      console.warn("Auth notification error (non-fatal):", mqError.message);
    }

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const redirectTarget = `${clientUrl.replace(/\/$/, "")}/dashboard`;

    return res.redirect(redirectTarget);

  } catch (error) {
    console.log("Google Callback Error:", error);

    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

// Logout Controller
export const logout = async (req, res) => {
  try {
    // Clear JWT token cookie — options must match how it was originally set,
    // otherwise the browser silently ignores the clear.
    res.clearCookie("token", CLEAR_COOKIE_OPTS);

    req.logout((err) => {
      if (err) {
        return res.status(500).json({
          message: "Logout failed"
        });
      }

      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({
            message: "Session destroy failed"
          });
        }

        res.clearCookie("connect.sid", CLEAR_COOKIE_OPTS);

        return res.status(200).json({
          success: true,
          message: "Logged out successfully"
        });
      });
    });

  } catch (error) {
    console.log("Logout Error:", error);

    return res.status(500).json({
      message: "Server error"
    });
  }
};

// Authentication Failed Controller
export const authFailed = (req, res) => {
  res.status(401).json({
    success: false,
    message: "Google Authentication Failed"
  });
};

// Helper to ensure user avatar URLs remain valid across sessions
const sanitizeUser = (user) => {
  if (!user) return null;
  const userObj = user.toObject ? user.toObject() : { ...user };
  if (userObj.avatar && userObj.avatar.includes("googleusercontent.com") && !userObj.avatar.includes("=")) {
    userObj.avatar = `${userObj.avatar}=s192-c`;
  }
  return userObj;
};

// Get Current Authenticated User Controller
export const getCurrentUser = async (req, res) => {
  try {
    // 1. Check Passport session user first
    if (req.user) {
      // Re-issue / ensure token cookie is present
      const token = req.cookies?.token || generateAuthToken(req.user);
      if (!req.cookies?.token) {
        res.cookie("token", token, COOKIE_OPTS);
      }

      return res.status(200).json({
        success: true,
        user: sanitizeUser(req.user),
        token
      });
    }

    // 2. Fallback: check JWT token cookie
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
    if (token) {
      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || "nexxagent-google-auth-secret"
        );
        const user = await User.findById(decoded.id);

        if (user) {
          return res.status(200).json({
            success: true,
            user: sanitizeUser(user),
            token
          });
        }
      } catch (tokenErr) {
        console.warn("Invalid or expired JWT token:", tokenErr.message);
      }
    }

    return res.status(200).json({
      success: false,
      user: null
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user session",
      error: error.message
    });
  }
};