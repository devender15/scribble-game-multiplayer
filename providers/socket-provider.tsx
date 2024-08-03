"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io as ClientIO } from "socket.io-client";

type SocketProviderProps = {
  children: React.ReactNode;
};

type SocketContextType = {
  socket: any | null;
  isConnected: boolean;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const SocketContextProvider = ({ children }: SocketProviderProps) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    const clientSocket = new (ClientIO as any)("http://localhost:3000");

    clientSocket.on("connect", () => {
      setIsConnected(true);
    });

    clientSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    setSocket(clientSocket);

    return () => {
      clientSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const context = useContext(SocketContext);

  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }

  return context;
};
