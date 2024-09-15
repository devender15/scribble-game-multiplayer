import { useSocket } from "@/providers/socket-provider";
import { useUserStore } from "@/stores/user-store";
import { useRoomStore } from "@/stores/room-store";
import { useEffect, useState, useRef } from "react";

import { type chatMessages } from "@/types";

import { ScrollArea } from "@/components/ui/scroll-area";

type ChatbarProps = {
  roomCode: string;
  username: string;
};

export default function Chatbar({ roomCode, username }: ChatbarProps) {
  const { socket } = useSocket();
  const { message, setMessage } = useUserStore();
  const { drawerSelectedWord } = useRoomStore();

  const [chatMessages, setChatMessages] = useState<chatMessages>([]);
  const scrollDivRef = useRef<HTMLDivElement>(null);

  const handleSubmitForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!message) return;

    const messageType = message === drawerSelectedWord ? "guess" : "text";
    const newMessage =
      message === drawerSelectedWord
        ? `${username} guessed the correct word!`
        : message;

    socket.emit("send-msg", {
      roomCode,
      username,
      message: newMessage,
      type: messageType,
    });

    setMessage("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  useEffect(() => {
    if (!socket) return;

    socket.on(
      "receive-msg",
      ({
        username,
        message,
        type,
      }: {
        username: string;
        message: string;
        type: string;
      }) => {
        // @ts-ignore
        setChatMessages((prev: chatMessages) => {
          const newObj = {
            username,
            message,
            type,
          };

          return [...prev, newObj];
        });
      }
    );

    return () => {
      socket.off("receive-msg");
    };
  }, [socket]);

  useEffect(() => {
    scrollDivRef.current?.scrollTo({
      top: scrollDivRef.current?.scrollHeight,
      behavior: "smooth",
    });

    return () => {};
  }, [chatMessages]);

  return (
    <div className="chatbar w-full h-full max-h-full border flex flex-col gap-y-4 overflow-hidden bg-white rounded-lg">
      <ScrollArea
        ref={scrollDivRef}
        className="h-[calc(100vh-8rem)] max-h-[calc(100vh-10rem)] w-full"
      >
        <div className="flex flex-col gap-y-2 text-sm">
          {chatMessages?.map((msg, index) => (
            <p key={index} className="bg-gray-100 p-1">
              <span className={`font-bold text-blue-800`}>{msg.username}</span>{" "}
              :{" "}
              <span
                className={`${
                  msg.type === "guess" ? "text-green-600" : "text-black"
                }`}
              >
                {msg.message}
              </span>
            </p>
          ))}
        </div>
      </ScrollArea>
      <form onSubmit={handleSubmitForm} className="w-full px-1">
        <input
          type="text"
          value={message}
          onChange={handleInputChange}
          autoFocus={true}
          className="text-sm w-full h-7 border p-2 lowercase rounded-md"
          placeholder="type..."
        />
      </form>
    </div>
  );
}
