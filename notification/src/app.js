import express from "express";
import morgan from "morgan";
import cors from "cors";

import { sendEmail } from "./email.js";
import channel from "./mq.js";


const app = express();

const QUEUE = "auth-notification-queue";


app.use(cors());
app.use(express.json());
app.use(morgan("dev"));


// Home Route
app.get("/", (req, res) => {
  res.send("Notification Service Running 🚀");
});


// Health Check
app.get("/_status/healthz", (req, res) => {
  res.status(200).json({
    status: "ok",
  });
});


// Ready Check
app.get("/_status/readyz", (req, res) => {
  res.status(200).json({
    status: "ready",
  });
});



// RabbitMQ Consumer
channel.consume(QUEUE, async (msg) => {

  if (msg !== null) {

    try {

      const messageContent = msg.content.toString();

      console.log(
        "Received notification:",
        messageContent
      );


      const {
        userId,
        action,
        timestamp,
        email,
        name,
        avatar
      } = JSON.parse(messageContent);



      const subject = "New Login Notification 🔐";


      const text = `
Hello ${name || "User"},

A new login was detected for your account at ${timestamp}.

If this was not you, please secure your account immediately.
`;



      const html = `
      <div style="
        font-family: Arial, sans-serif;
        max-width:600px;
        margin:auto;
        padding:20px;
        border:1px solid #ddd;
        border-radius:10px;
      ">

        <h2>
          🔐 New Login Detected
        </h2>


        <p>
          Hello <strong>${name || "User"}</strong>,
        </p>


        ${
          avatar
          ? `
          <img 
            src="${avatar}"
            width="80"
            height="80"
            style="border-radius:50%"
          />
          `
          : ""
        }


        <p>
          A new login was detected for your account.
        </p>


        <p>
          Time:
          <strong>${timestamp}</strong>
        </p>


        <p>
          If this was not you, please secure your account immediately.
        </p>


        <hr/>


        <p>
          Regards,<br/>
          <strong>Notification Service</strong>
        </p>


      </div>
      `;



      await sendEmail({
        to: email,
        subject,
        text,
        html,
      });


      console.log(
        "Notification email processed for:",
        email
      );


      channel.ack(msg);


    } catch (error) {

      console.log(
        "Notification processing error:",
        error
      );

      channel.ack(msg);

    }

  }

});



export default app;