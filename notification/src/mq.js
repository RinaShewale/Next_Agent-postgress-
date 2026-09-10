import amqplib from "amqplib";

const QUEUE = "auth-notification-queue";

const connection = await amqplib.connect(
  process.env.RABBITMQ_URL
);

const channel = await connection.createChannel();

await channel.assertQueue(QUEUE, {
  durable: true,
});

export default channel;