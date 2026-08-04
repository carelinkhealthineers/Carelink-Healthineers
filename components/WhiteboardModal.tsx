import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Pencil, 
  Square, 
  Circle as CircleIcon, 
  Eraser, 
  Trash2, 
  Download, 
  X, 
  Undo, 
  Palette,
  Sparkles
} from 'lucide-react';

interface WhiteboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomTitle?: string;
}

export const WhiteboardModal: React.FC<WhiteboardModalProps> = ({ isOpen, onClose, roomTitle = "Meeting Whiteboard" }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'rectangle' | 'circle' | 'eraser'>('pen');
  const [color, setColor] = useState('#3b82f6');
  const [lineWidth, setLineWidth] = useState(4);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [history, setHistory] = useState<ImageData[]>([]);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx && history.length === 0) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Save initial state
        setHistory([ctx.getImageData(0, 0, canvas.width, canvas.height)]);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const currentData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory(prev => [...prev.slice(-15), currentData]);
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newHistory = [...history];
    newHistory.pop(); // Remove current state
    const previousState = newHistory[newHistory.length - 1];
    if (previousState) {
      ctx.putImageData(previousState, 0, 0);
      setHistory(newHistory);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState();
  };

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getPos(e);
    setIsDrawing(true);
    setStartPos(pos);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.lineWidth = tool === 'eraser' ? lineWidth * 3 : lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const pos = getPos(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (tool === 'pen' || tool === 'eraser') {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
  };

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const pos = getPos(e);
    const canvas = canvasRef.current;
    if (!canvas || !startPos) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (tool === 'rectangle') {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.strokeRect(startPos.x, startPos.y, pos.x - startPos.x, pos.y - startPos.y);
    } else if (tool === 'circle') {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      const radius = Math.sqrt(Math.pow(pos.x - startPos.x, 2) + Math.pow(pos.y - startPos.y, 2));
      ctx.beginPath();
      ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
      ctx.stroke();
    }

    saveState();
  };

  const downloadWhiteboard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `Whiteboard_${roomTitle.replace(/[^a-z0-9]/gi, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#09090b'];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header Bar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight">{roomTitle} - Interactive Whiteboard</h3>
              <p className="text-[10px] text-slate-400 font-mono">Real-time collaborative canvas & diagramming suite</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={downloadWhiteboard}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md shadow-blue-500/20"
            >
              <Download size={14} /> Download Image
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tools Palette Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {[
              { id: 'pen', label: 'Pen', icon: <Pencil size={16} /> },
              { id: 'rectangle', label: 'Rectangle', icon: <Square size={16} /> },
              { id: 'circle', label: 'Circle', icon: <CircleIcon size={16} /> },
              { id: 'eraser', label: 'Eraser', icon: <Eraser size={16} /> },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTool(t.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  tool === t.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* Color Palette */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
              <Palette size={14} /> Palette
            </span>
            <div className="flex items-center gap-1.5">
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => { setColor(c); if (tool === 'eraser') setTool('pen'); }}
                  className={`w-6 h-6 rounded-full transition-transform ${color === c && tool !== 'eraser' ? 'ring-2 ring-blue-600 ring-offset-2 scale-110' : 'hover:scale-105'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>

            <div className="h-6 w-px bg-slate-200 mx-1" />

            {/* Line width slider */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase font-mono">Size:</span>
              <input
                type="range"
                min="2"
                max="20"
                value={lineWidth}
                onChange={(e) => setLineWidth(Number(e.target.value))}
                className="w-20 accent-blue-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Undo and Clear */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleUndo}
              disabled={history.length <= 1}
              className="px-3 py-2 bg-white text-slate-700 border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-100 disabled:opacity-40 flex items-center gap-1"
            >
              <Undo size={14} /> Undo
            </button>
            <button
              onClick={clearCanvas}
              className="px-3 py-2 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold hover:bg-rose-100 flex items-center gap-1"
            >
              <Trash2 size={14} /> Clear
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 bg-slate-200 p-4 flex items-center justify-center overflow-auto">
          <canvas
            ref={canvasRef}
            width={1000}
            height={600}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="bg-white rounded-2xl shadow-xl cursor-crosshair border border-slate-300 max-w-full"
          />
        </div>
      </motion.div>
    </div>
  );
};
