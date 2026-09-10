import express from "express";
import passport from "passport";

import {
  googleCallback,
  logout,
  authFailed,
  getCurrentUser
} from "../controllers/auth.controller.js";


const router = express.Router();



// Continue With Google
router.get(
  "/google",
  passport.authenticate("google",{
    scope:[
      "profile",
      "email"
    ]
  })
);



// Google Callback
router.get(
  "/google/callback",

  passport.authenticate("google",{
    failureRedirect:"/api/auth/fail"
  }),

  googleCallback
);



// Get Current User Profile
router.get(
  "/me",
  getCurrentUser
);



// Logout
router.get(
  "/logout",
  logout
);



// Failed Auth
router.get(
  "/fail",
  authFailed
);



export default router;
