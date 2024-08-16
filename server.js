import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
// import { handleSocketEvents } from "./lib/socket-events";

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

  const rooms = {};

  const scores = {};

  io.on("connection", (socket) => {
    console.log("a user connected");

    socket.on("add-user", (data) => {
      const { roomCode, username } = data;

      socket.join(roomCode);

      if (rooms[roomCode]) {
        rooms[roomCode].forEach((drawEvent) => {
          socket.emit("drawing", drawEvent);
        });
      }

      if (!scores[username]) {
        scores[username] = 0;
      }

      io.to(roomCode).emit("newUserJoined", {
        newName: username,
      });
    });

    socket.on("get-scores", (data) => {
      const { roomCode } = data;

      console.log(roomCode, scores);

      io.to(roomCode).emit("receive-scores", scores);
    });

    socket.on("drawing", (data) => {
      const { roomCode, x0, y0, x1, y1 } = data;

      if (!rooms[roomCode]) {
        rooms[roomCode] = [];
      }

      rooms[roomCode].push({
        x0,
        y0,
        x1,
        y1,
      });

      socket.to(roomCode).emit("drawing", {
        x0,
        y0,
        x1,
        y1,
      });
    });

    socket.on("send-msg", (data) => {
      const { roomCode, username, message } = data;

      io.to(roomCode).emit("receive-msg", { username, message });
    });

    socket.on("remove-user", (data) => {
      const { roomCode, username } = data;

      if (scores[username]) {
        delete scores[username];
      }

      socket.leave(roomCode);

      io.to(roomCode).emit("userLeft", {
        message: `${username} has left the room`,
      });
    });

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
