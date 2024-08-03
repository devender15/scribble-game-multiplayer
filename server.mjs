import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import { handleSocketEvents } from "./lib/socket-events";

const dev = process.env.NODE_ENV !== "production";

const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server(server);

  io.on("connection", (socket) => {
    console.log("a user connected");

    handleSocketEvents(socket, io);

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });

    socket.on("error", (error) => {
      console.error("error", error);
    });
  });

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
