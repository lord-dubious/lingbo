import React, { useRef, useState, useEffect } from 'react';
import { Eraser, RefreshCcw } from 'lucide-react';

interface TracingCanvasProps {
    letter: string;
    onComplete?: () => void;
}

const TracingCanvas: React.FC<TracingCanvasProps> = ({ letter, onComplete }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size for high DPI
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        // Initial setup
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 12;
        ctx.strokeStyle = '#FF7F50'; // Primary color

        setContext(ctx);
        drawGuide(ctx, rect.width, rect.height);
    }, [letter]);

    const drawGuide = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        ctx.clearRect(0, 0, width, height);

        // Draw the letter outline/guide
        ctx.save();
        ctx.font = 'bold 200px "Fredoka", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#f3f4f6'; // Light gray fill
        ctx.strokeStyle = '#d1d5db'; // Gray border
        ctx.lineWidth = 2;

        const x = width / 2;
        const y = height / 2 + 20; // Adjust for baseline

        ctx.fillText(letter, x, y);
        ctx.strokeText(letter, x, y);

        // Dashed center line
        ctx.setLineDash([10, 10]);
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#e5e7eb';
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();

        ctx.restore();
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true);
        const { x, y } = getPos(e);
        context?.beginPath();
        context?.moveTo(x, y);
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || !context) return;
        const { x, y } = getPos(e);
        context.lineTo(x, y);
        context.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        context?.closePath();
    };

    const getPos = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();

        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const clearCanvas = () => {
        if (!canvasRef.current || !context) return;
        const rect = canvasRef.current.getBoundingClientRect();
        drawGuide(context, rect.width, rect.height);
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative bg-white rounded-3xl shadow-lg border-4 border-purple-100 overflow-hidden touch-none">
                <canvas
                    ref={canvasRef}
                    className="w-[300px] h-[300px] cursor-crosshair"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                />
            </div>
            <div className="flex gap-4">
                <button
                    onClick={clearCanvas}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-full font-bold hover:bg-gray-200 transition-colors"
                >
                    <Eraser size={20} /> Clear
                </button>
            </div>
        </div>
    );
};

export default TracingCanvas;
