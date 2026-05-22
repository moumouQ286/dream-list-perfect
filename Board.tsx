import React from "react";
import { Plus, Layout, GripVertical } from "lucide-react";
import { motion, AnimatePresence, Reorder } from "motion/react";
import { StickyNote } from "./StickyNote";
import { StickyNoteData, AgeTab, AGE_TABS, STICKY_NOTE_COLORS } from "../types";
import { ... } from "./utils";

interface BoardProps {
  userAge: number;
  currentTab: AgeTab;
  onTabChange: (tab: AgeTab) => void;
  notes: StickyNoteData[];
  boardTitle: string;
  boardSubtitle: string;
  showAllNotes: boolean;
  tabs: AgeTab[];
  onUpdateBoardTitle: (title: string) => void;
  onUpdateBoardSubtitle: (subtitle: string) => void;
  onToggleShowAll: () => void;
  onAddTab: (tab: AgeTab) => void;
  onUpdateTab: (oldTab: AgeTab, newLabel: string) => void;
  onReorderTabs: (newTabs: AgeTab[]) => void;
  onDeleteTab: (tab: AgeTab) => void;
  onAddNote: () => void;
  onUpdateNote: (id: string, updates: Partial<StickyNoteData>) => void;
  onDeleteNote: (id: string) => void;
}

export const Board: React.FC<BoardProps> = ({
  userAge,
  currentTab,
  onTabChange,
  notes,
  boardTitle,
  boardSubtitle,
  showAllNotes,
  tabs,
  onUpdateBoardTitle,
  onUpdateBoardSubtitle,
  onToggleShowAll,
  onAddTab,
  onUpdateTab,
  onReorderTabs,
  onDeleteTab,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
}) => {
  const constraintsRef = React.useRef<HTMLDivElement>(null);
  const [editingTab, setEditingTab] = React.useState<string | null>(null);
  const [editValue, setEditValue] = React.useState("");

  // Filter tabs - users now have manual control over all tabs
  const filteredTabs = tabs;

  const lastTab = filteredTabs[filteredTabs.length - 1];

  return (
    <div className="flex flex-col h-screen bg-[#F2F2F7]">
      {/* Header Navigation */}
      <header className="h-16 bg-white border-b border-[#D1D1D6] flex items-center justify-between px-8 z-50 shrink-0">
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 bg-[#FFD60A] rounded-xl shadow-inner flex items-center justify-center shrink-0">
            <Layout className="text-black/40 w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <input 
              value={boardTitle}
              onChange={(e) => onUpdateBoardTitle(e.target.value)}
              className="text-xl font-bold tracking-tight text-[#1C1C1E] bg-transparent border-none focus:ring-0 p-0 leading-tight w-48"
              placeholder="Board Title..."
            />
            <input 
              value={boardSubtitle}
              onChange={(e) => onUpdateBoardSubtitle(e.target.value)}
              className="text-[10px] text-[#8E8E93] uppercase tracking-widest leading-none font-bold bg-transparent border-none focus:ring-0 p-0 w-48"
              placeholder="SUBTITLE..."
            />
          </div>
        </div>

        {/* Age Segmented Control */}
        <div className="flex-1 mx-6 flex justify-center min-w-0">
          <div className={cn("bg-[#E3E3E6] p-1 rounded-xl flex gap-1 transition-all overflow-x-auto max-w-full no-scrollbar", showAllNotes && "opacity-30 pointer-events-none")}>
            <Reorder.Group 
              axis="x" 
              values={tabs} 
              onReorder={onReorderTabs} 
              className="flex gap-1"
            >
              {filteredTabs.map((tab, idx) => {
                const isEditing = editingTab === tab;
                
                return (
                  <Reorder.Item 
                    key={tab} 
                    value={tab}
                    className="relative group/tab flex items-center shrink-0"
                    dragListener={!isEditing}
                  >
                    {isEditing ? (
                      <input
                        autoFocus
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => {
                          onUpdateTab(tab, editValue);
                          setEditingTab(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            onUpdateTab(tab, editValue);
                            setEditingTab(null);
                          }
                        }}
                        className="px-6 py-1.5 rounded-lg text-sm font-bold bg-white shadow-sm text-[#1C1C1E] border-none focus:ring-2 focus:ring-blue-500 w-24 outline-none"
                      />
                    ) : (
                      <div className="relative">
                        <button
                          onClick={() => onTabChange(tab)}
                          onDoubleClick={() => {
                            setEditingTab(tab);
                            setEditValue(tab);
                          }}
                          className={cn(
                            "px-6 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2",
                            currentTab === tab 
                              ? "bg-white shadow-sm font-bold text-[#1C1C1E]" 
                              : "text-[#8E8E93] hover:text-[#1C1C1E] hover:bg-white/40"
                          )}
                        >
                          {tab}
                        </button>

                        {/* Drag Handle & Delete */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover/tab:opacity-100 transition-opacity z-20 pointer-events-none group-hover/tab:pointer-events-auto">
                          <div className="w-5 h-5 bg-white border border-black/5 rounded-full flex items-center justify-center text-[10px] shadow-sm cursor-grab active:cursor-grabbing">
                            <GripVertical size={10} className="text-gray-400" />
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteTab(tab);
                            }}
                            className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] shadow-sm hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    )}
                  </Reorder.Item>
                );
              })}
            </Reorder.Group>
            
            {/* Add Tab Button - Allowed up to 10 tabs */}
            {tabs.length < 10 && (
               <button
                 onClick={() => {
                   const absoluteLastTab = tabs[tabs.length - 1];
                   const lastNum = parseInt(absoluteLastTab);
                   const newTab = isNaN(lastNum) ? "New" : `${lastNum + 10}s`;
                   onAddTab(newTab);
                   onTabChange(newTab);
                 }}
                 className="px-4 py-1.5 rounded-lg text-sm font-bold text-[#007AFF] hover:bg-white/40 transition-all flex items-center gap-1 shrink-0"
               >
                 <Plus size={14} />
               </button>
            )}
          </div>
        </div>

        <button
          onClick={onAddNote}
          className="bg-[#007AFF] text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[#0066D6] transition-all shadow-md active:scale-95 shrink-0"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Add Note / 新增筆記</span>
        </button>
      </header>

      {/* Main Board Area */}
      <main 
        ref={constraintsRef}
        className="flex-1 relative overflow-hidden bg-[radial-gradient(#D1D1D6_1px,transparent_1px)] [background-size:32px_32px]"
      >
        <AnimatePresence>
          {notes
            .filter((n) => showAllNotes || n.ageTab === currentTab)
            .map((note, index, filtered) => {
              // Only filter for overlap if they match age tab (or if showAll is active)
              // Detect if fully or mostly covered by notes processed later (higher z-order)
              const hiddenNotes = filtered.filter((n, i) => 
                i < index && 
                n.x >= note.x - 30 &&
                n.y >= note.y - 30 &&
                n.x + n.width <= note.x + note.width + 30 &&
                n.y + n.height <= note.y + note.height + 30
              );
              
              return (
                <StickyNote
                  key={note.id}
                  data={note}
                  onUpdate={(updates) => onUpdateNote(note.id, updates)}
                  onDelete={() => onDeleteNote(note.id)}
                  dragConstraints={constraintsRef}
                  hiddenNotesUnderneath={hiddenNotes}
                  onBringNoteToFront={(id) => onUpdateNote(id, { updatedAt: Date.now() })}
                />
              );
            })}
        </AnimatePresence>

        {/* Empty State */}
        {!showAllNotes && notes.filter(n => n.ageTab.toString().trim() === currentTab.toString().trim()).length === 0 && (
          <div 
            key={`empty-${currentTab}`}
            className="absolute inset-0 flex flex-col items-center justify-center p-8 z-10"
          >
             <button
               onClick={onAddNote}
               className="flex flex-col items-center justify-center group cursor-pointer transition-transform hover:scale-105 active:scale-95"
             >
                <div className="w-56 h-56 border-4 border-dashed border-[#8E8E93]/30 rounded-[64px] flex items-center justify-center mb-10 shadow-sm bg-white/5 backdrop-blur-sm group-hover:border-[#007AFF] transition-colors">
                   <Plus size={80} className="text-[#8E8E93]/30 group-hover:text-[#007AFF] transition-colors" />
                </div>
                <div className="text-center">
                  <h2 className="text-4xl font-black uppercase tracking-[0.3em] text-[#1C1C1E] opacity-20 group-hover:opacity-40 transition-opacity mb-4">
                    Start Your Dreams for {currentTab}
                  </h2>
                  <p className="text-2xl italic text-[#8E8E93] opacity-20 group-hover:opacity-40 transition-opacity">
                    開啟你 {currentTab} 的夢想行程
                  </p>
                </div>
             </button>
             
             <div className="mt-16 text-[10px] uppercase tracking-[0.5em] font-black text-[#1C1C1E] opacity-20 pointer-events-none">
               Every great journey begins with a single note
             </div>
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="h-12 bg-white/50 backdrop-blur-sm px-8 flex items-center justify-between text-[11px] text-[#8E8E93] font-medium border-t border-[#D1D1D6] z-50">
        <div className="flex gap-6 uppercase tracking-wider items-center">
          <button 
            onClick={onToggleShowAll}
            className={cn(
              "flex items-center gap-2 px-3 py-1 rounded-full border transition-all",
              showAllNotes 
                ? "bg-[#007AFF] border-[#007AFF] text-white shadow-sm" 
                : "bg-white border-[#D1D1D6] text-[#8E8E93] hover:text-[#1C1C1E]"
            )}
          >
            <div className={cn("w-1.5 h-1.5 rounded-full", showAllNotes ? "bg-white animate-pulse" : "bg-[#8E8E93]")} />
            Active Notes: {showAllNotes ? notes.length : notes.filter(n => n.ageTab === currentTab).length} 
            {showAllNotes && " (Showing All / 全部顯示)"}
          </button>
          <span className="hidden sm:inline">Last Sync: Just Now</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
          <span className="uppercase tracking-widest">Local Storage Active / 已本地儲存</span>
        </div>
      </footer>
    </div>
  );
};
