import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { Onboarding } from "./Onboarding"
import { Board } from "./Board"
import { StickyNote } from "./StickyNote"
import { AGE_TABS, AgeTab, StickyNoteData, STICKY_NOTE_COLORS, BRUSH_COLORS } from "./types";

const STORAGE_KEY_USER = "dream_board_user";
const STORAGE_KEY_NOTES = "dream_board_notes";

export default function App() {
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [userAge, setUserAge] = useState<number>(0);
  const [currentTab, setCurrentTab] = useState<AgeTab>("20s");
  const [notes, setNotes] = useState<StickyNoteData[]>([]);
  const [boardTitle, setBoardTitle] = useState("Dream Board");
  const [boardSubtitle, setBoardSubtitle] = useState("人生夢想清單");
  const [tabs, setTabs] = useState<AgeTab[]>(AGE_TABS);
  const [showAllNotes, setShowAllNotes] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEY_USER);
    if (savedUser) {
      const { age, onboardingComplete, title, subtitle, tabs: savedTabs } = JSON.parse(savedUser);
      setUserAge(age);
      setOnboardingComplete(onboardingComplete);
      if (title) setBoardTitle(title);
      if (subtitle) setBoardSubtitle(subtitle);

      const decade = Math.floor(age / 10) * 10;
      const initialTab = `${decade}s`;

      let combinedTabs = savedTabs || AGE_TABS;

      if (decade > 60 && !combinedTabs.includes(initialTab)) {
        combinedTabs = [...combinedTabs, initialTab];
      }

      setTabs(combinedTabs);

      // ✅ 確保 currentTab 存在於實際的分頁清單中
      const validTab = combinedTabs.includes(initialTab)
        ? initialTab
        : combinedTabs[0];
      setCurrentTab(validTab);
    } else {
      setCurrentTab("20s");
    }

    const savedNotes = localStorage.getItem(STORAGE_KEY_NOTES);
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }

    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized) return;
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify({
      age: userAge,
      onboardingComplete,
      title: boardTitle,
      subtitle: boardSubtitle,
      tabs
    }));
    localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(notes));
  }, [userAge, onboardingComplete, notes, boardTitle, boardSubtitle, tabs, initialized]);

  const handleOnboardingComplete = (age: number) => {
    setUserAge(age);
    setOnboardingComplete(true);

    const decade = Math.floor(age / 10) * 10;
    const initialTab = `${decade}s` as AgeTab;

    let newTabs = [...tabs];
    if (decade > 60 && !newTabs.includes(initialTab)) {
      newTabs = [...newTabs, initialTab];
      setTabs(newTabs);
    }

    // ✅ 確保 currentTab 存在於分頁清單中
    const validTab = newTabs.includes(initialTab) ? initialTab : newTabs[0];
    setCurrentTab(validTab);
  };

  const handleAddTab = (newTab: AgeTab) => {
    if (tabs.length >= 10) return;
    setTabs([...tabs, newTab]);
  };

  const handleUpdateTab = (oldTab: AgeTab, newLabel: string) => {
    if (!newLabel.trim()) return;
    const newTabs = tabs.map(t => t === oldTab ? newLabel : t);
    setTabs(newTabs);
    if (currentTab === oldTab) {
      setCurrentTab(newLabel);
    }
    setNotes(notes.map(n => n.ageTab === oldTab ? { ...n, ageTab: newLabel } : n));
  };

  const handleReorderTabs = (newTabs: AgeTab[]) => {
    setTabs(newTabs);
  };

  const handleDeleteTab = (tabToDelete: AgeTab) => {
    if (tabs.length <= 1) return;
    const newTabs = tabs.filter(t => t !== tabToDelete);
    setTabs(newTabs);

    // ✅ 刪除分頁後確保 currentTab 切換到有效分頁
    if (currentTab === tabToDelete || !newTabs.includes(currentTab)) {
      setCurrentTab(newTabs[0]);
    }

    setNotes(notes.filter(n => n.ageTab !== tabToDelete));
  };

  const handleAddNote = () => {
    const offset = (notes.length % 10) * 20;
    const newNote: StickyNoteData = {
      id: Math.random().toString(36).substring(2, 9),
      userId: "local-user",
      ageTab: currentTab,
      x: 100 + offset,
      y: 100 + offset,
      width: 280,
      height: 320,
      title: "",
      titleCompleted: false,
      items: [
        { text: "", completed: false },
        { text: "", completed: false },
        { text: "", completed: false },
      ],
      color: STICKY_NOTE_COLORS[Math.floor(Math.random() * STICKY_NOTE_COLORS.length)],
      textColor: BRUSH_COLORS[0],
      updatedAt: Date.now(),
    };
    setNotes([...notes, newNote]);
  };

  const handleUpdateNote = (id: string, updates: Partial<StickyNoteData>) => {
    setNotes((prev) => {
      const updated = prev.map((n) => {
        if (n.id === id) {
          const newNote = { ...n, ...updates, updatedAt: Date.now() };

          const wasAllCompleted = n.titleCompleted && n.items.every(i => i.completed);
          const isAllCompletedNow = newNote.titleCompleted && newNote.items.every(i => i.completed);

          if (isAllCompletedNow && !wasAllCompleted) {
            confetti({
              particleCount: 150,
              spread: 70,
              origin: { y: 0.6 },
              colors: STICKY_NOTE_COLORS
            });
          }

          return newNote;
        }
        return n;
      });

      if (updates.updatedAt) {
        const index = updated.findIndex(n => n.id === id);
        if (index > -1) {
          const [note] = updated.splice(index, 1);
          updated.push(note);
        }
      }
      return updated;
    });
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id));
  };

  if (!initialized) return null;

  if (!onboardingComplete) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <Board
      userAge={userAge}
      currentTab={currentTab}
      onTabChange={setCurrentTab}
      notes={notes}
      boardTitle={boardTitle}
      boardSubtitle={boardSubtitle}
      showAllNotes={showAllNotes}
      tabs={tabs}
      onUpdateBoardTitle={setBoardTitle}
      onUpdateBoardSubtitle={setBoardSubtitle}
      onToggleShowAll={() => setShowAllNotes(!showAllNotes)}
      onAddTab={handleAddTab}
      onUpdateTab={handleUpdateTab}
      onReorderTabs={handleReorderTabs}
      onDeleteTab={handleDeleteTab}
      onAddNote={handleAddNote}
      onUpdateNote={handleUpdateNote}
      onDeleteNote={handleDeleteNote}
    />
  );
}
