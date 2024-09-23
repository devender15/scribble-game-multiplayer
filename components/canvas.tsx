import { useRef, useEffect, useState } from "react";

import { useSocket } from "@/providers/socket-provider";
import { useUserStore } from "@/stores/user-store";
import { useRoomStore } from "@/stores/room-store";

import { Button } from "./ui/button";
import { Slider } from "./ui/slider";

import { Eraser, Trash2, Circle } from "lucide-react";

type DrawingCanvasProps = {
  roomCode: string;
};

export default function DrawingCanvas({ roomCode }: DrawingCanvasProps) {
  const { socket } = useSocket();
  const { canDraw, setCanDraw, setTimeLeft, timeLeft } = useRoomStore();
  const { name } = useUserStore();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [brushSize, setBrushSize] = useState(5);
  const [eraserSize, setEraserSize] = useState(5);
  const [isErasing, setIsErasing] = useState(false);

  const brushColor = useRef("#000000");
  const lastPoint = useRef<{ x: number, y: number} | null>(null);

  const drawingQueue = useRef<
    {
      x0: number;
      y0: number;
      x1: number;
      y1: number;
      brushSize: number;
      brushcolor: string;
    }[]
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

      drawingQueue.current.forEach(
        ({ x0, y0, x1, y1, brushcolor, brushSize }) => {
          drawLine(x0, y0, x1, y1, brushSize, brushcolor, false);
        }
      );
      drawingQueue.current = [];
    }

    socket.on("currentDrawer", ({ username: drawer }: { username: string }) => {
      setCanDraw(drawer === socket.id);

      if (drawer === socket.id) {
        socket.emit("currentDrawerName", { roomCode, drawerName: name });
      }
    });

    socket.on("countdown", ({ timeLeft }: { timeLeft: number }) => {
      setTimeLeft(timeLeft);
    });

    socket.on("clearBoard", () => {
      if (context) {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
      } else {
        console.warn("Context not ready, queuing clear board");
        drawingQueue.current.push({
          x0: 0,
          y0: 0,
          x1: 0,
          y1: 0,
          brushcolor: "black",
          brushSize: 5,
        });
      }
    });

    socket.on(
      "drawing",
      ({
        x0,
        y0,
        x1,
        y1,
        brushcolor,
        brushSize,
      }: {
        x0: number;
        y0: number;
        x1: number;
        y1: number;
        brushcolor: string;
        brushSize: number;
      }) => {
        if (context) {
          if(brushcolor === 'eraser') {
            brushcolor = '#FFFFFF';
          }
          drawLine(x0, y0, x1, y1, brushSize, brushcolor, false);
        } else {
          console.warn("Context not ready, queuing drawing data");
          drawingQueue.current.push({ x0, y0, x1, y1, brushcolor, brushSize });
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
    const rect = canvasRef.current?.getBoundingClientRect();
    if(rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top - 15;
      lastPoint.current = {x,y};
    }
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

  const handleSelectColor = (color: string) => {
    brushColor.current = color;
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (!isDrawing || !context || !canDraw) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (isErasing) {
        erase(x, y);
      } else {
        if (lastPoint.current) {
          drawLine(lastPoint.current.x, lastPoint.current.y, x, y, brushSize, brushColor.current);
        }
      }

      if(lastPoint.current) {
        socket.emit("drawing", {
          roomCode,
          x0: lastPoint.current.x,
          y0: lastPoint.current.y,
          x1: x,
          y1: y,
          brushcolor: isErasing ? 'eraser' : brushColor.current,
          brushSize: isErasing ? eraserSize : brushSize,
        });
      }
      
      lastPoint.current = { x, y };
    } else {
      console.error("Canvas rect not available");
    }
  };

  const drawLine = (
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    brushSize: number,
    brushcolor: string,
    emit = true
  ) => {
    if (!context) {
      console.error("Context is not available when drawing line");
      return;
    }

    context.globalCompositeOperation = "source-over";
    context.strokeStyle = brushcolor;
    context.lineWidth = brushSize;
    context.lineCap = "round";

    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.stroke();
    context.closePath();

    if (emit) {
      socket.emit("drawing", {
        roomCode,
        x0,
        y0,
        x1,
        y1,
        brushcolor,
        brushSize,
      });
    }
  };

  const handleClearCanvas = () => {
    if (context) {
      context.clearRect(0, 0, context.canvas.width, context.canvas.height);
      socket.emit("eraseBoard", { roomCode });
    }
  };

  const erase = (x: number, y: number) => {
    if (!context) return;

    context.globalCompositeOperation = "destination-out";
    context.beginPath();
    if (lastPoint.current) {
      context.moveTo(lastPoint.current.x, lastPoint.current.y);
    }
    context.lineTo(x, y);
    context.lineWidth = eraserSize;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.stroke();
  };

  const toggleErasing = () => {
    setIsErasing(!isErasing);
  };

  const handleSizeChange = (value: number) => {
    if(isErasing) {
      setEraserSize(value);
    } else {
      setBrushSize(value);
    }
  }

  return (
    <div className="w-full h-full rounded-lg space-y-8 relative">
      <div className={`relative w-full bg-white h-[68%] rounded-lg ${isErasing ? "cursor-eraser" : "cursor-draw"}`}>
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseUp={endDrawing}
          onMouseOut={endDrawing}
          onMouseMove={draw}
          className="w-full h-full block"
        />

        <div className="absolute top-2 right-4 h-10 w-10 text-center rounded-full p-2 ring-4 ring-purple-700">
          {timeLeft}
        </div>
      </div>

      <div className="w-full bg-white shadow-lg p-4 rounded-lg absolute bottom-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold mb-4">Tools</h2>

          <div className="flex items-center space-x-4">
            <Button
              size="icon"
              variant={isErasing ? "default" : "ghost"}
              className="flex items-center space-x-2"
              onClick={toggleErasing}
            >
              <Eraser size={16} />
            </Button>
            <Button
              size="icon"
              variant={"ghost"}
              className="flex items-center space-x-2"
              onClick={handleClearCanvas}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brush Size
            </label>
            <Slider
              value={isErasing ? [eraserSize] : [brushSize]}
              onValueChange={(value) => handleSizeChange(value[0])}
              max={20}
              step={1}
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              "#000000",
              "#FF0000",
              "#00FF00",
              "#0000FF",
              "#FFFF00",
              "#FF00FF",
              "#00FFFF",
              "#FFFFFF",
            ].map((color) => (
              <button
                key={color}
                title={color}
                className={`${brushColor.current === color ? "ring-2 ring-black": "ring-0"} w-8 h-8 rounded-full transition-all duration-200`}
                onClick={() => handleSelectColor(color)}
              >
                <Circle
                  className="w-full h-full rounded-full"
                  style={{ backgroundColor: color }}
                  color={color}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
