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

  useEffect(() => {
    if (!socket) return;

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth / 2;
      canvas.height = window.innerHeight / 2;
      const ctx = canvas.getContext("2d");
      setContext(ctx);
    }

    socket.on(
      "drawing",
      ({
        x0: x0,
        y0: y0,
        x1: x1,
        y1: y1,
      }: {
        x0: number;
        y0: number;
        x1: number;
        y1: number;
      }) => {
        drawLine(x0, y0, x1, y1, false);
        console.log("drawing");
      }
    );

    return () => {
      socket.off("drawing");
    };
  }, [socket]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    setIsDrawing(true);
    draw(e);
  };

  const endDrawing = () => {
    setIsDrawing(false);
    context?.beginPath();
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (!isDrawing || !context) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      drawLine(x, y, x, y);

      socket?.emit("drawing", {
        roomCode,
        x0: x,
        y0: y,
        x1: x,
        y1: y,
      });
    }
  };

  const drawLine = (
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    emit = true
  ) => {
    if (!context) return;

    context.strokeStyle = "black";
    context.lineWidth = 2;
    context.lineCap = "round";

    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.stroke();
    context.closePath();

    if (!emit) return;
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
