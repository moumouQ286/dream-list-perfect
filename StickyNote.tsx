import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Trash2, 
  Palette, 
  Pencil, 
  Type, 
  CheckCircle2, 
  Circle,
  Eraser,
  Plus,
  Layout,
  Paintbrush
} from "lucide-react";
import { StickyNoteData, STICKY_NOTE_COLORS, BRUSH_COLORS } from "../types";
import { cn } from "../utils";

interface StickyNoteProps {
  data: StickyNoteData;
  onUpdate: (data: Partial<StickyNoteData>) => void;
  onDelete: () => void;
  dragConstraints?: React.RefObject<HTMLDivElement>;
  hiddenNotesUnderneath?: StickyNoteData[];
  onBringNoteToFront?: (id: string) => void;
}

export const StickyNote: React.FC<StickyNoteProps> = ({ 
  data, 
  onUpdate, 
  onDelete, 
  dragConstraints,
  hiddenNotesUnderneath = [],
  onBringNoteToFront
}) => {
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [brushColor, setBrushColor] = useState(BRUSH_COLORS[0]);
  const [brushWidth, setBrushWidth] = useState(3);
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const brushToolbarRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Close color picker / drawing mode when clicking outside the toolbars
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // If clicking outside the active toolbar, close it
      if (showColorPicker && colorPickerRef.current && !colorPickerRef.current.contains(target)) {
        // Also check if clicking the toggle button to avoid double-toggle
        const isToggleButton = (target as HTMLElement).closest('[title="Colors / 顏色選擇"]');
        if (!isToggleButton) {
          setShowColorPicker(false);
        }
      }
      
      if (isDrawingMode && brushToolbarRef.current && !brushToolbarRef.current.contains(target)) {
        const isToggleButton = (target as HTMLElement).closest('[title="Drawing Mode / 繪圖模式"]');
        if (!isToggleButton) {
          setIsDrawingMode(false);
        }
      }
    };

    if (showColorPicker || isDrawingMode) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showColorPicker, isDrawingMode]);

  // Initialize Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to container size
    canvas.width = data.width;
    canvas.height = data.height;

    // Load drawData if exists
    if (data.drawData) {
      const img = new Image();
      img.src = data.drawData;
      img.onload = () => ctx.drawImage(img, 0, 0, data.width, data.height);
    }
  }, [data.width, data.height, data.drawData]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawingMode) return;
    e.stopPropagation(); // Prevent drag when drawing
    setIsDrawing(true);
    const pos = getPos(e);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !isDrawingMode) return;
    e.stopPropagation();
    const pos = getPos(e);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      onUpdate({ drawData: canvas.toDataURL() });
    }
  };

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      onUpdate({ drawData: "" });
    }
  };

  return (
    <motion.div
      ref={containerRef}
      drag={!isDrawingMode}
      dragConstraints={dragConstraints}
      dragMomentum={false}
      onPointerDown={() => {
        // Update updatedAt to bring this note to front in the parent state
        onUpdate({ updatedAt: Date.now() });
      }}
      onDragEnd={(_, info) => {
        // Calculate new absolute position based on start position + offset
        const newX = data.x + info.offset.x;
        const newY = data.y + info.offset.y;
        onUpdate({ x: newX, y: newY, updatedAt: Date.now() });
      }}
      dragElastic={0}
      animate={{ x: data.x, y: data.y }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: data.width,
        height: data.height,
        backgroundColor: data.color,
        borderTop: "4px solid rgba(0,0,0,0.1)"
      }}
      className={cn(
        "rounded-sm shadow-xl flex flex-col p-5 ring-1 ring-black/5",
        isDrawingMode ? "cursor-crosshair" : "cursor-grab active:cursor-grabbing",
        "before:absolute before:top-0 before:right-0 before:w-8 before:h-8 before:bg-gradient-to-bl before:from-black/10 before:to-transparent before:pointer-events-none"
      )}
    >
      {/* Background stack decoration (Visual cue for multiple notes) */}
      <div className="absolute top-1 right-1 w-full h-full bg-black/5 -z-10 rounded-sm translate-x-1 -translate-y-1 rotate-1 pointer-events-none" />
      
      {/* Overlap Indicators (Hidden Notes) */}
      {hiddenNotesUnderneath.length > 0 && (
        <div className="absolute -top-4 -left-4 flex flex-col items-start z-[70]" onPointerDown={e => e.stopPropagation()}>
          <div className="relative group/stack">
             {/* Stacked Paper Effect */}
             <div className="absolute top-2 left-2 w-12 h-12 bg-black/10 rounded-lg -z-10 translate-x-2 translate-y-2 blur-[1px]" />
             <div className="absolute top-2 left-2 w-12 h-12 bg-white/40 border border-black/5 rounded-lg -z-10 translate-x-1 translate-y-1 rotate-2" />
             
             <button 
               onClick={() => onBringNoteToFront?.(hiddenNotesUnderneath[0].id)}
               className="w-14 h-14 bg-white rounded-xl shadow-2xl border border-black/10 flex items-center justify-center flex-col gap-0.5 hover:scale-110 active:scale-95 transition-all text-[#007AFF] hover:bg-blue-50"
             >
                <Layout size={20} />
                <span className="text-[10px] font-black leading-none">{hiddenNotesUnderneath.length}</span>
             </button>
             
             {/* Popover on hover showing colors */}
             <div className="absolute top-0 left-16 bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-2xl border border-black/5 opacity-0 group-hover/stack:opacity-100 transition-all pointer-events-none flex gap-1 min-w-max translate-x-4 group-hover:translate-x-0">
                {hiddenNotesUnderneath.slice(0, 5).map(note => (
                  <div key={note.id} className="w-4 h-4 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: note.color }} />
                ))}
                {hiddenNotesUnderneath.length > 5 && <span className="text-[10px] font-bold text-[#8E8E93] ml-1">+{hiddenNotesUnderneath.length - 5}</span>}
             </div>
          </div>
          <div className="mt-2 ml-1 text-[10px] font-black text-white px-3 py-1 rounded-full bg-[#FF3B30] shadow-lg shadow-red-500/40 uppercase tracking-[0.1em] animate-bounce select-none border-2 border-white ring-2 ring-red-500/20">
             Note Stack Below / 下方有重疊
          </div>
        </div>
      )}

      {/* Header / Controls */}
      <div className="flex items-center justify-between mb-4 relative z-50">
        <div className="flex gap-1" onPointerDown={e => e.stopPropagation()}>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowColorPicker(!showColorPicker);
            }}
            title="Colors / 顏色選擇"
            className={cn(
              "p-2 rounded-lg transition-all flex items-center gap-1 shadow-sm",
              showColorPicker ? "bg-white ring-1 ring-black/10" : "bg-black/5 hover:bg-black/10"
            )}
           >
            {isDrawingMode ? <Pencil size={14} style={{ color: brushColor }} /> : <Type size={14} style={{ color: data.textColor }} />}
            <div className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: data.color }} />
          </button>
        </div>

        <div className="flex gap-1 flex-wrap justify-end" onPointerDown={e => e.stopPropagation()}>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsDrawingMode(!isDrawingMode);
            }}
            title="Drawing Mode / 繪圖模式"
            className={cn("p-1.5 rounded-lg hover:bg-black/5 transition-colors", isDrawingMode ? "text-blue-600 bg-white shadow-sm" : "text-[#8E8E93]")}
          >
            <Paintbrush size={14} />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="Delete / 刪除"
            className="p-1.5 rounded-lg hover:bg-red-500/10 text-[#8E8E93] hover:text-red-500 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Color Picker Popover */}
      {showColorPicker && (
        <div 
          ref={colorPickerRef}
          className="absolute top-14 left-4 bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-2xl z-[100] border border-[#D1D1D6] flex flex-col gap-4 min-w-[220px]"
          onPointerDown={e => e.stopPropagation()}
        >
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-2">Note / 貼紙顏色</p>
            <div className="flex flex-wrap gap-1.5">
              {STICKY_NOTE_COLORS.map(c => (
                <button 
                  key={c}
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdate({ color: c });
                  }}
                  className="w-7 h-7 rounded-lg border border-black/5 shadow-inner transition-transform hover:scale-110 active:scale-95"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-1.5 flex items-center gap-1">
                <Type size={10} /> Title / 主題主題
              </p>
              <div className="flex flex-wrap gap-1">
                {BRUSH_COLORS.map(c => (
                  <button 
                    key={c}
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdate({ textColor: c });
                    }}
                    className={cn(
                      "w-6 h-6 rounded-md border border-black/10 transition-all hover:scale-110 flex items-center justify-center",
                      data.textColor === c ? "ring-2 ring-blue-500 scale-105" : "opacity-60 hover:opacity-100"
                    )}
                    style={{ backgroundColor: c }}
                  >
                    <div className={cn("w-1 h-1 rounded-full", c === '#000000' || c === '#800080' ? "bg-white" : "bg-black")} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-black/30 mb-1.5 flex items-center gap-1">
                <Layout size={10} /> Details / 細節顏色
              </p>
              <div className="flex flex-wrap gap-1">
                {BRUSH_COLORS.map(c => (
                  <button 
                    key={c}
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdate({ itemTextColor: c });
                    }}
                    className={cn(
                      "w-6 h-6 rounded-md border border-black/10 transition-all hover:scale-110 flex items-center justify-center",
                      data.itemTextColor === c ? "ring-2 ring-blue-500 scale-105" : "opacity-60 hover:opacity-100"
                    )}
                    style={{ backgroundColor: c }}
                  >
                    <div className={cn("w-1 h-1 rounded-full", c === '#000000' || c === '#800080' ? "bg-white" : "bg-black")} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drawing Toolbar (Improved visibility) */}
      {isDrawingMode && (
        <div 
          ref={brushToolbarRef}
          className="absolute top-14 left-4 right-4 bg-white/95 backdrop-blur p-2 rounded-xl shadow-lg z-[110] border border-[#D1D1D6] flex flex-wrap items-center gap-2"
          onPointerDown={e => e.stopPropagation()}
        >
          <div className="flex gap-1 shrink-0">
            {BRUSH_COLORS.map(c => (
              <button 
                key={c}
                onClick={() => setBrushColor(c)}
                className={cn("w-5 h-5 rounded-md border border-white transition-transform active:scale-90", brushColor === c ? "ring-2 ring-[#007AFF] ring-offset-1" : "")}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <div className="flex-1 min-w-[60px] flex items-center">
            <input 
              type="range" 
              min="1" 
              max="12" 
              value={brushWidth}
              onChange={(e) => setBrushWidth(parseInt(e.target.value))}
              className="w-full h-1 bg-[#E3E3E6] rounded-lg appearance-none cursor-pointer accent-[#007AFF]"
            />
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              clearCanvas();
            }}
            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-black/5 transition-colors"
            title="Clear Drawing / 清除畫布"
          >
            <Eraser size={14} />
          </button>
        </div>
      )}

      {/* Content Area - Added overflow-hidden here specifically */}
      <div className="flex-1 flex flex-col relative overflow-hidden rounded-b-sm">
        {/* Canvas Layer - Moved behind text layer (z-10) */}
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className={cn(
            "absolute inset-0 z-10 transition-opacity",
            isDrawingMode ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-80"
          )}
        />

        {/* Text Layer - Scales with note size */}
        <div 
          className={cn("relative z-20 transition-opacity flex flex-col h-full overflow-hidden p-1", isDrawingMode ? "opacity-30 pointer-events-none" : "opacity-100")}
          style={{ 
             transform: `scale(${data.width / 280})`, 
             transformOrigin: 'top left',
             width: '280px',
             height: `${data.height / (data.width / 280)}px`,
             color: data.textColor || "#1C1C1E"
          }}
        >
          <div className="flex items-start gap-3 mb-1 group" onPointerDown={e => e.stopPropagation()}>
            <h3 className="flex items-start gap-3 w-full border-b border-black/10 pb-2">
              <button 
                onClick={() => onUpdate({ titleCompleted: !data.titleCompleted })}
                className="shrink-0 mt-1"
              >
                {data.titleCompleted 
                  ? <div className="w-5 h-5 rounded border border-black/20 bg-white/50 flex items-center justify-center" style={{ color: data.textColor || "#1C1C1E" }}><CheckCircle2 size={12} strokeWidth={3} /></div>
                  : <div className="w-5 h-5 rounded border border-black/20 bg-white/50" />
                }
              </button>
              <textarea
                value={data.title}
                onChange={(e) => onUpdate({ title: e.target.value })}
                placeholder="Topic / 主題..."
                rows={1}
                style={{ color: "inherit" }}
                className={cn(
                  "w-full bg-transparent border-none focus:ring-0 outline-none font-bold text-lg p-0 h-auto resize-none placeholder:text-black/10 leading-tight",
                  data.titleCompleted && "line-through opacity-30"
                )}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = target.scrollHeight + 'px';
                }}
              />
            </h3>
          </div>

          <ul className="mt-4 space-y-3 flex-1 overflow-y-auto pr-1 no-scrollbar" onPointerDown={e => e.stopPropagation()}>
            {data.items.map((item, i) => (
              <li key={i} className="flex items-start gap-3 group/item">
                <button 
                   onClick={() => {
                     const newItems = [...data.items];
                     newItems[i].completed = !newItems[i].completed;
                     onUpdate({ items: newItems });
                   }}
                   className="shrink-0 mt-0.5"
                >
                  {item.completed 
                    ? <div className="w-5 h-5 rounded border border-black/20 bg-white/50 flex items-center justify-center" style={{ color: data.textColor || "#1C1C1E" }}><CheckCircle2 size={12} strokeWidth={3} /></div>
                    : <div className="w-5 h-5 rounded border border-black/20 bg-white/50 transition-colors group-hover:border-black/30" />
                  }
                </button>
                <textarea
                  value={item.text}
                  onChange={(e) => {
                    const newItems = [...data.items];
                    newItems[i].text = e.target.value;
                    onUpdate({ items: newItems });
                  }}
                  rows={1}
                  placeholder={`Detail ${i + 1}...`}
                  style={{ color: data.itemTextColor || "inherit" }}
                  className={cn(
                    "w-full bg-transparent border-none focus:ring-0 outline-none p-0 text-sm leading-snug placeholder:text-black/10 resize-none font-medium",
                    item.completed && "line-through opacity-30"
                  )}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = target.scrollHeight + 'px';
                  }}
                />
                
                {data.items.length > 1 && (
                  <button 
                    onClick={() => {
                      const newItems = data.items.filter((_, idx) => idx !== i);
                      onUpdate({ items: newItems });
                    }}
                    className="opacity-0 group-hover/item:opacity-30 hover:!opacity-100 transition-opacity p-1 text-red-500"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </li>
            ))}
            
            {data.items.length < 10 && (
              <button 
                onClick={() => {
                  const newItems = [...data.items, { text: "", completed: false }];
                  onUpdate({ items: newItems });
                }}
                className="flex items-center gap-2 text-[10px] font-bold text-black/20 hover:text-black/40 uppercase tracking-widest pl-8 transition-colors mt-2"
              >
                <Plus size={10} strokeWidth={3} /> Add Item / 新增項目
              </button>
            )}
          </ul>
          
          {isDrawingMode && (
             <div className="h-10 mt-4 border border-dashed border-black/10 rounded-lg flex items-center justify-center text-[10px] text-black/30 uppercase tracking-widest italic font-bold shrink-0">
               Draw Here / 手繪區域
             </div>
          )}
        </div>
      </div>

      {/* Resize Handle */}
      <div 
        className="absolute bottom-2 right-2 w-6 h-6 cursor-nwse-resize z-40 bg-transparent flex items-end justify-end opacity-20 hover:opacity-50 transition-opacity"
        onPointerDown={(e) => {
          e.stopPropagation();
          const startX = e.clientX;
          const startY = e.clientY;
          const startW = data.width;
          const startH = data.height;

          const onMove = (moveEvent: PointerEvent) => {
            onUpdate({
              width: Math.max(220, startW + (moveEvent.clientX - startX)),
              height: Math.max(220, startH + (moveEvent.clientY - startY))
            });
          };

          const onUp = () => {
             window.removeEventListener("pointermove", onMove);
             window.removeEventListener("pointerup", onUp);
          };

          window.addEventListener("pointermove", onMove);
          window.addEventListener("pointerup", onUp);
        }}
      >
        ◢
      </div>

    </motion.div>
  );
};
