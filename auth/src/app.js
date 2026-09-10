import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";

import authRoute from "./routes/auth.route.js";

// Passport config load
import "./config/passport.js";


const app = express();


// =======================
// CORS
// =======================

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost",
  "http://127.0.0.1:5173"
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps or curl requests)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive origin check for local dev
    },
    credentials: true
  })
);




// =======================
// Body Parser
// =======================

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true
  })
);



// =======================
// Cookies + Logger
// =======================

app.use(cookieParser());

app.use(morgan("dev"));



// =======================
// Session
// =======================

app.use(
  session({

    secret: "nexxagent-google-auth-secret",

    resave: false,

    saveUninitialized: false,


    cookie: {

      httpOnly: true,

      secure: false,

      sameSite: "lax",

      maxAge: 24 * 60 * 60 * 1000

    }

  })
);



// =======================
// Passport
// =======================

app.use(passport.initialize());

app.use(passport.session());




// =======================
// Routes
// =======================

app.use(
  "/api/auth",
  authRoute
);


// =======================
// Health Check
// =======================

app.get("/", (req, res) => {

  res.status(200).json({

    message: "Auth Server Running 🚀",

    user: req.user || null

  });

});



export default app;