import { useRef, useEffect, useState } from "react";
import { useSocket } from "@/providers/socket-provider";

type DrawingCanvasProps = {
  roomCode: string;
};

export default function DrawingCanvas({ roomCode }: DrawingCanvasProps) {
  const { socket } = useSocket();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  
  const drawingQueue = useRef<{ x0: number; y0: number; x1: number; y1: number }[]>([]);
  

  useEffect(() => {
    if (!socket) return;

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const ctx = canvas.getContext("2d");
      setContext(ctx);

      drawingQueue.current.forEach(({ x0, y0, x1, y1 }) => {
        drawLine(x0, y0, x1, y1, false);
      });
      drawingQueue.current = []; 
    }

    socket.on("drawing", ({ x0, y0, x1, y1 }: { x0: number; y0: number; x1: number; y1: number }) => {
      console.log("Received drawing data:", { x0, y0, x1, y1 });
      if (context) {
        drawLine(x0, y0, x1, y1, false);
      } else {
        console.warn("Context not ready, queuing drawing data");
        drawingQueue.current.push({ x0, y0, x1, y1 });
      }
    });

    return () => {
      socket.off("drawing");
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
    if (!isDrawing || !context) return;

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

  const drawLine = (x0: number, y0: number, x1: number, y1: number, emit = true) => {
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
    <canvas
      ref={canvasRef}
      onMouseDown={startDrawing}
      onMouseUp={endDrawing}
      onMouseOut={endDrawing}
      onMouseMove={draw}
    />
  );
}
