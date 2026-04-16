// ─── Widget type identifiers ───────────────────────────────────────────────
export type WidgetType =
  | 'calendar'
  | 'todo'
  | 'inbox'
  | 'classview'
  | 'notes'
  | 'latex'
  | 'handwriting'
  | 'mindmap'
  | 'pomodoro'
  | 'fileviewer';

// ─── Placed widget on the canvas ───────────────────────────────────────────
export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  x: number;     // left offset in pixels
  y: number;     // top offset in pixels
  width: number;
  height: number;
  collapsed: boolean;
  zIndex: number;
}

// ─── Dashboard page ────────────────────────────────────────────────────────
export interface DashboardPage {
  id: string;
  name: string;
  widgets: Widget[];
}

// ─── To-do task ────────────────────────────────────────────────────────────
export interface Task {
  id: string;
  text: string;
  done: boolean;
  dueDate?: string;  // ISO date string
  course?: string;
}

// ─── Calendar event ────────────────────────────────────────────────────────
export interface CalendarEvent {
  id: string;
  title: string;
  date: string;   // ISO date string
  type: 'assignment' | 'exam' | 'event';
  course?: string;
}

// ─── Inbox email ───────────────────────────────────────────────────────────
export interface Email {
  id: string;
  from: string;
  subject: string;
  body: string;
  date: string;
  read: boolean;
}

// ─── Course ────────────────────────────────────────────────────────────────
export interface Course {
  id: string;
  name: string;
  code: string;
  instructor: string;
  color: string;
}
