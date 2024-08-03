import { Server as SocketIO, Socket } from "socket.io";
// import { db } from "@/lib/db";

export const handleSocketEvents = (socket: Socket, io: SocketIO) => {
  socket.on(
    "join-room",
    ({ name, roomKey }: { name: string; roomKey: string }) => {
      console.log("join-room", name, roomKey);
      socket.join(roomKey);
      io.to(roomKey).emit(name);
    }
  );
};
