import server from "./src/app.js";

const PORT = 3000;

server.listen(PORT, () => {
  console.log(`Router running on port ${PORT}`);
});