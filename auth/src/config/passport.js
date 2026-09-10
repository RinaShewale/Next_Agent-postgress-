import dotenv from "dotenv";
dotenv.config();

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.model.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },

    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({
          googleId: profile.id,
        });

        // Ensure Google photo URL has a stable high-res parameter (=s192-c) instead of stripping with split('=')[0]
        let avatar = profile.photos?.[0]?.value || null;
        if (avatar && avatar.includes("googleusercontent.com")) {
          avatar = avatar.includes("=")
            ? avatar.replace(/=s\d+(-c)?.*$/, "=s192-c")
            : `${avatar}=s192-c`;
        }

        if (!user) {
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            avatar,
          });
        } else {
          // keep name in sync on every login
          user.name = profile.displayName;
          // only overwrite avatar if Google actually returned one this time —
          // prevents wiping a previously-good avatar on a login where
          // profile.photos comes back empty
          if (avatar) {
            user.avatar = avatar;
          }
          await user.save();
        }

        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;