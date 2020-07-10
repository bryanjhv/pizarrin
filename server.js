const http = require("http");
const path = require("path");
const express = require("express");
const SocketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = SocketIO(server);

app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
  socket.on("dibujo", (puntos) => {
    socket.broadcast.emit("dibujo", puntos);
  });
});

const { PORT = 3000 } = process.env;
server.listen(PORT, () => {
  console.log(`Servidor listo en puerto ${PORT}`);

  function close() {
    server.close((err) => {
      if (err) console.error(err);
      process.exit(err ? 1 : 0);
    });
  }
  process.once("SIGINT", close).once("SIGTERM", close);
});
