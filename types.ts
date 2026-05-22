export type AgeTab = string;

export interface StickyNoteItem {
  text: string;
  completed: boolean;
}

export interface StickyNoteData {
  id: string;
  userId: string;
  ageTab: AgeTab;
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  titleCompleted: boolean;
  items: StickyNoteItem[]; // Changed from tuple fixed at 3
  color: string;
  textColor?: string;
  itemTextColor?: string;
  drawData?: string; 
  updatedAt: number;
}

export interface UserSettings {
  userId: string;
  age: number;
  onboardingComplete: boolean;
}

export const STICKY_NOTE_COLORS = [
  "#FFF4B3", // Yellow
  "#D1F2EB", // Teal / Mint
  "#FADBD8", // Red / Rose
  "#E8DAEF", // Purple
  "#D4E6F1", // Light Blue
  "#E5E8E8", // Light Gray
];

export const BRUSH_COLORS = [
  "#000000",
  "#FF0000",
  "#0000FF",
  "#008000",
  "#800080",
  "#FFD60A", // Yellow
];

export const AGE_TABS: AgeTab[] = ["20s", "30s", "40s", "50s", "60s"];
