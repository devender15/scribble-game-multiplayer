import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";

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
  const selectedWordObj = {};
  let scores = {};
  let correctGuesses = {};
  let currentDrawer = {};
  let currentDrawerName = "";
  let countdowns = {};
  const playersPlayed = [];
  const totalLevels = 2;
  let currentLevel = 1;

  io.on("connection", (socket) => {
    console.log("a user connected");

    function startRound(roomCode) {
      let timeLeft = 60;
      io.to(roomCode).emit("countdown", { timeLeft });

      countdowns[roomCode] = setInterval(() => {
        timeLeft -= 1;
        io.to(roomCode).emit("countdown", { timeLeft });

        if (timeLeft <= 0) {
          clearInterval(countdowns[roomCode]);
          showRoundRecap(roomCode);
        }
      }, 1000);
    }

    function switchDrawer(roomCode) {
      if (rooms[roomCode]) {
        const usersSet = io.sockets.adapter.rooms.get(roomCode);
        if (!usersSet) return;

        const users = Array.from(usersSet);
        const currentIndex = users.indexOf(currentDrawer[roomCode]);

        let nextIndex = (currentIndex + 1) % users.length;
        while (playersPlayed.includes(users[nextIndex])) {
          nextIndex = (nextIndex + 1) % users.length;
        }

        currentDrawer[roomCode] = users[nextIndex];

        playersPlayed.push(currentDrawer[roomCode]);

        io.to(roomCode).emit("currentDrawer", {
          username: currentDrawer[roomCode],
        });
      }
    }

    function clearBoard(roomCode) {
      rooms[roomCode] = [];
      io.to(roomCode).emit("clearBoard");
    }

    function startNextLevel(roomCode) {
      if (currentLevel < totalLevels) {
        currentLevel += 1;
        io.to(roomCode).emit("nextLevel", { currentLevel });
        clearBoard(roomCode);

        // clear playersPlayed
        playersPlayed.length = 0;

        setTimeout(() => {
          switchDrawer(roomCode);
        }, 5000);
      } else {
        io.to(roomCode).emit("gameOver", scores);

        // clear all game data
        delete rooms[roomCode];
        delete selectedWordObj[roomCode];
        // scores = {};
        correctGuesses[roomCode] = {};
        currentDrawer[roomCode] = null;
        countdowns[roomCode] = null;
        playersPlayed.length = 0;
        currentLevel = 1;
      }
    }

    function showRoundRecap(roomCode) {
      io.to(roomCode).emit("roundRecap", {
        correctGuesses: correctGuesses[roomCode],
      });

      for (let username in correctGuesses[roomCode]) {
        scores[username] += correctGuesses[roomCode][username];
      }

      for (let username in correctGuesses[roomCode]) {
        correctGuesses[roomCode][username] = 0;
      }

      setTimeout(() => {
        // check if all players have played
        if (
          playersPlayed.length === io.sockets.adapter.rooms.get(roomCode).size
        ) {
          startNextLevel(roomCode);
        } else {
          switchDrawer(roomCode);
          clearBoard(roomCode);
        }
      }, 10000);
    }

    socket.on("currentDrawerName", (data) => {
      const { roomCode, drawerName } = data;

      currentDrawerName = drawerName;

      io.to(roomCode).emit("whoIsDrawing", drawerName);
    });

    socket.on("eraseBoard", (data) => {
      const { roomCode } = data;

      clearBoard(roomCode);
    })

    socket.on("selectedWord", (data) => {
      const { roomCode, selectedWord } = data;
      selectedWordObj[roomCode] = selectedWord;

      io.to(roomCode).emit("drawerSelectedWord", {
        drawerSelectedWord: selectedWord,
      });
    });

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

      if (!currentDrawer[roomCode]) {
        currentDrawer[roomCode] = socket.id;
      }

      if (!correctGuesses[roomCode]) {
        correctGuesses[roomCode] = {
          [username]: 0,
        };
      } else {
        correctGuesses[roomCode][username] = 0;
      }

      if (selectedWordObj[roomCode]) {
        io.to(roomCode).emit("drawerSelectedWord", {
          drawerSelectedWord: selectedWordObj[roomCode],
        });
      }

      if (playersPlayed.length === 0) {
        playersPlayed.push(currentDrawer[roomCode]);
      }

      if(!currentDrawerName) {
        currentDrawerName = username;
      }

      io.to(roomCode).emit("whoIsDrawing", currentDrawerName);

      io.to(roomCode).emit("newUserJoined", {
        newName: username,
      });

      io.to(roomCode).emit("currentDrawer", {
        username: currentDrawer[roomCode],
      });
    });

    socket.on("startRound", (data) => {
      const { roomCode } = data;
      startRound(roomCode);
    });

    socket.on("get-scores", (data) => {
      const { roomCode } = data;
      io.to(roomCode).emit("receive-scores", scores);
    });

    socket.on("drawing", (data) => {
      const { roomCode, x0, y0, x1, y1, brushcolor, brushSize } = data;

      if (!rooms[roomCode]) {
        rooms[roomCode] = [];
      }

      rooms[roomCode].push({
        x0,
        y0,
        x1,
        y1,
        brushcolor,
        brushSize,
      });

      socket.to(roomCode).emit("drawing", {
        x0,
        y0,
        x1,
        y1,
        brushcolor,
        brushSize,
      });
    });

    socket.on("send-msg", (data) => {
      const { roomCode, username, message, type } = data;

      if (type === "guess") {
        correctGuesses[roomCode][username] = 10;
      }

      io.to(roomCode).emit("receive-msg", { username, message, type });
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

      const roomsJoined = Object.keys(socket.rooms);

      roomsJoined.forEach((roomCode) => {
        if (currentDrawer[roomCode] === socket.id) {
          switchDrawer(roomCode);
        }

        // if (countdowns[roomCode]) {
        //   clearInterval(countdowns[roomCode]);
        // }

        // if (rooms[roomCode]) {
        //   rooms[roomCode] = [];
        // }

        // if (selectedWordObj[roomCode]) {
        //   delete selectedWordObj[roomCode];
        // }

        if (scores[socket.id]) {
          delete scores[socket.id];
        }

        if (correctGuesses[roomCode]) {
          delete correctGuesses[roomCode];
        }

        if (currentDrawer[roomCode]) {
          delete currentDrawer[roomCode];
        }

        if (countdowns[roomCode]) {
          delete countdowns[roomCode];
        }

        if (playersPlayed.includes(socket.id)) {
          const index = playersPlayed.indexOf(socket.id);
          playersPlayed.splice(index, 1);
        }

        if (currentLevel !== 1) {
          currentLevel = 1;
        }
      });
    });

    socket.on("error", (error) => {
      console.error("error", error);
    });
  });

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
