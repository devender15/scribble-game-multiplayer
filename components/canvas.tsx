import { useRef, useEffect, useState } from "react";

import { useSocket } from "@/providers/socket-provider";
import { useUserStore } from "@/stores/user-store";
import { useRoomStore } from "@/stores/room-store";

type DrawingCanvasProps = {
  roomCode: string;
};

export default function DrawingCanvas({ roomCode }: DrawingCanvasProps) {
  const { socket } = useSocket();
  const { canDraw, timeLeft, setCanDraw, setTimeLeft } = useRoomStore();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  // const [canDraw, setCanDraw] = useState(false);
  // const [timeLeft, setTimeLeft] = useState(60);

  const drawingQueue = useRef<
    { x0: number; y0: number; x1: number; y1: number }[]
  >([]);

  useEffect(() => {
    if (!socket) return;

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      const ratio = window.devicePixelRatio || 1;

      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      canvas.style.width = "100%";
      canvas.style.height = "100%";

      if (ctx) {
        ctx.scale(ratio, ratio);
        setContext(ctx);
      }

      drawingQueue.current.forEach(({ x0, y0, x1, y1 }) => {
        drawLine(x0, y0, x1, y1, false);
      });
      drawingQueue.current = [];
    }

    socket.on("currentDrawer", ({ username: drawer }: { username: string }) => {
      setCanDraw(drawer === socket.id);
    });

    socket.on("countdown", ({ timeLeft }: { timeLeft: number }) => {
      setTimeLeft(timeLeft);
    });

    socket.on("clearBoard", () => {
      if (context) {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
      } else {
        console.warn("Context not ready, queuing clear board");
        drawingQueue.current.push({ x0: 0, y0: 0, x1: 0, y1: 0 });
      }
    })

    socket.on(
      "drawing",
      ({
        x0,
        y0,
        x1,
        y1,
      }: {
        x0: number;
        y0: number;
        x1: number;
        y1: number;
      }) => {
        if (context) {
          drawLine(x0, y0, x1, y1, false);
        } else {
          console.warn("Context not ready, queuing drawing data");
          drawingQueue.current.push({ x0, y0, x1, y1 });
        }
      }
    );

    return () => {
      socket.off("drawing");
      socket.off("countdown");
      socket.off("currentDrawer");
      socket.off("clearBoard");

    };
  }, [socket, context]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    setIsDrawing(true);
    draw(e);
  };

  const endDrawing = () => {
    setIsDrawing(false);
    if (context) {
      context.beginPath();
    } else {
      console.warn("Context not available when ending drawing");
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (!isDrawing || !context || !canDraw) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      drawLine(x, y, x, y);

      socket.emit("drawing", {
        roomCode,
        x0: x,
        y0: y,
        x1: x,
        y1: y,
      });
    } else {
      console.error("Canvas rect not available");
    }
  };

  const drawLine = (
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    emit = true
  ) => {
    if (!context) {
      console.error("Context is not available when drawing line");
      return;
    }

    context.strokeStyle = "black";
    context.lineWidth = 2;
    context.lineCap = "round";

    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.stroke();
    context.closePath();

    if (emit) {
      socket.emit("drawing", { roomCode, x0, y0, x1, y1 });
    }
  };
  return (
    <div className="relative w-full h-full border">
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseUp={endDrawing}
        onMouseOut={endDrawing}
        onMouseMove={draw}
        className="w-full h-full block"
      />
      <div className="absolute top-0 right-0 bg-white bg-opacity-60 p-2 rounded-lg border">
        <span>{timeLeft}</span>
      </div>
    </div>
  );
}
