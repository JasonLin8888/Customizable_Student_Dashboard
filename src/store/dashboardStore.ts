import { create } from 'zustand';
import type {
  DashboardPage,
  Widget,
  WidgetType,
  Task,
  CalendarEvent,
  Email,
  Course,
} from '../types';

// ─── Unique ID helper ───────────────────────────────────────────────────────
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

// ─── Default seed data ──────────────────────────────────────────────────────
const seedTasks: Task[] = [
  { id: uid(), text: 'Read Chapter 4 – Linear Algebra', done: false, dueDate: '2026-04-18', course: 'MATH 201' },
  { id: uid(), text: 'Submit lab report', done: false, dueDate: '2026-04-20', course: 'CHEM 110' },
  { id: uid(), text: 'Review lecture slides', done: true, course: 'CS 301' },
];

const seedEvents: CalendarEvent[] = [
  { id: uid(), title: 'MATH 201 Midterm', date: '2026-04-22', type: 'exam', course: 'MATH 201' },
  { id: uid(), title: 'Lab Report Due', date: '2026-04-20', type: 'assignment', course: 'CHEM 110' },
  { id: uid(), title: 'Study Group', date: '2026-04-17', type: 'event' },
  { id: uid(), title: 'CS 301 Project Demo', date: '2026-04-25', type: 'assignment', course: 'CS 301' },
];

const seedEmails: Email[] = [
  {
    id: uid(),
    from: 'prof.smith@university.edu',
    subject: 'MATH 201 – Office Hours Update',
    body: 'Hi class, office hours this week will be moved to Thursday 3–5 PM.',
    date: '2026-04-15',
    read: false,
  },
  {
    id: uid(),
    from: 'noreply@canvas.university.edu',
    subject: '[Canvas] New Assignment: Lab Report',
    body: 'A new assignment "Lab Report" has been posted in CHEM 110. Due: Apr 20.',
    date: '2026-04-14',
    read: true,
  },
  {
    id: uid(),
    from: 'registrar@university.edu',
    subject: 'Fall 2026 Registration Opens',
    body: 'Registration for Fall 2026 opens on May 1. Please consult your advisor.',
    date: '2026-04-13',
    read: false,
  },
];

const seedCourses: Course[] = [
  { id: uid(), name: 'Linear Algebra', code: 'MATH 201', instructor: 'Dr. Smith', color: '#6366f1' },
  { id: uid(), name: 'General Chemistry', code: 'CHEM 110', instructor: 'Dr. Lee', color: '#10b981' },
  { id: uid(), name: 'Data Structures', code: 'CS 301', instructor: 'Prof. Chen', color: '#f59e0b' },
  { id: uid(), name: 'Technical Writing', code: 'ENG 201', instructor: 'Prof. Rivera', color: '#ef4444' },
];

const defaultPage: DashboardPage = {
  id: uid(),
  name: 'My Dashboard',
  widgets: [],
};

// ─── Store shape ────────────────────────────────────────────────────────────
interface DashboardStore {
  // Pages
  pages: DashboardPage[];
  activePageId: string;
  addPage: (name: string) => void;
  removePage: (id: string) => void;
  renamePage: (id: string, name: string) => void;
  setActivePage: (id: string) => void;

  // Widgets
  addWidget: (type: WidgetType) => void;
  removeWidget: (id: string) => void;
  updateWidget: (id: string, patch: Partial<Widget>) => void;
  bringToFront: (id: string) => void;

  // Shared data
  tasks: Task[];
  addTask: (text: string, dueDate?: string, course?: string) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;

  events: CalendarEvent[];
  addEvent: (ev: Omit<CalendarEvent, 'id'>) => void;
  removeEvent: (id: string) => void;

  emails: Email[];
  markEmailRead: (id: string) => void;
  addTaskFromEmail: (emailId: string) => void;

  courses: Course[];
}

// ─── Widget default sizes per type ─────────────────────────────────────────
const DEFAULT_SIZES: Record<WidgetType, { width: number; height: number }> = {
  calendar:    { width: 380, height: 340 },
  todo:        { width: 320, height: 380 },
  inbox:       { width: 400, height: 360 },
  classview:   { width: 340, height: 320 },
  notes:       { width: 420, height: 360 },
  latex:       { width: 480, height: 400 },
  handwriting: { width: 440, height: 380 },
  mindmap:     { width: 500, height: 400 },
  pomodoro:    { width: 280, height: 300 },
  fileviewer:  { width: 420, height: 380 },
};

const WIDGET_TITLES: Record<WidgetType, string> = {
  calendar:    'Calendar',
  todo:        'To-Do List',
  inbox:       'Inbox',
  classview:   'Class View',
  notes:       'Notes',
  latex:       'LaTeX Editor',
  handwriting: 'Handwriting',
  mindmap:     'Mind Map',
  pomodoro:    'Pomodoro Timer',
  fileviewer:  'File Viewer',
};

// ─── Store implementation ───────────────────────────────────────────────────
export const useDashboardStore = create<DashboardStore>((set, get) => ({
  // ── Pages ──
  pages: [defaultPage],
  activePageId: defaultPage.id,

  addPage: (name) => {
    const page: DashboardPage = { id: uid(), name, widgets: [] };
    set((s) => ({ pages: [...s.pages, page], activePageId: page.id }));
  },

  removePage: (id) =>
    set((s) => {
      const remaining = s.pages.filter((p) => p.id !== id);
      return {
        pages: remaining.length ? remaining : [{ id: uid(), name: 'New Page', widgets: [] }],
        activePageId: remaining.length ? remaining[0].id : s.activePageId,
      };
    }),

  renamePage: (id, name) =>
    set((s) => ({
      pages: s.pages.map((p) => (p.id === id ? { ...p, name } : p)),
    })),

  setActivePage: (id) => set({ activePageId: id }),

  // ── Widgets ──
  addWidget: (type) => {
    const { pages, activePageId } = get();
    const page = pages.find((p) => p.id === activePageId);
    if (!page) return;

    // Stagger new widgets so they don't all pile up at (0,0)
    const offset = page.widgets.length * 24;
    const sizes = DEFAULT_SIZES[type];
    const maxZ = page.widgets.reduce((m, w) => Math.max(m, w.zIndex), 0);

    const widget: Widget = {
      id: uid(),
      type,
      title: WIDGET_TITLES[type],
      x: 40 + offset,
      y: 40 + offset,
      ...sizes,
      collapsed: false,
      zIndex: maxZ + 1,
    };

    set((s) => ({
      pages: s.pages.map((p) =>
        p.id === activePageId ? { ...p, widgets: [...p.widgets, widget] } : p,
      ),
    }));
  },

  removeWidget: (id) =>
    set((s) => ({
      pages: s.pages.map((p) => ({
        ...p,
        widgets: p.widgets.filter((w) => w.id !== id),
      })),
    })),

  updateWidget: (id, patch) =>
    set((s) => ({
      pages: s.pages.map((p) => ({
        ...p,
        widgets: p.widgets.map((w) => (w.id === id ? { ...w, ...patch } : w)),
      })),
    })),

  bringToFront: (id) => {
    const { pages, activePageId } = get();
    const page = pages.find((p) => p.id === activePageId);
    if (!page) return;
    const maxZ = page.widgets.reduce((m, w) => Math.max(m, w.zIndex), 0);
    set((s) => ({
      pages: s.pages.map((p) => ({
        ...p,
        widgets: p.widgets.map((w) => (w.id === id ? { ...w, zIndex: maxZ + 1 } : w)),
      })),
    }));
  },

  // ── Tasks ──
  tasks: seedTasks,

  addTask: (text, dueDate, course) =>
    set((s) => ({
      tasks: [...s.tasks, { id: uid(), text, done: false, dueDate, course }],
    })),

  toggleTask: (id) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    })),

  removeTask: (id) =>
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

  // ── Events ──
  events: seedEvents,

  addEvent: (ev) =>
    set((s) => ({ events: [...s.events, { ...ev, id: uid() }] })),

  removeEvent: (id) =>
    set((s) => ({ events: s.events.filter((e) => e.id !== id) })),

  // ── Emails ──
  emails: seedEmails,

  markEmailRead: (id) =>
    set((s) => ({
      emails: s.emails.map((e) => (e.id === id ? { ...e, read: true } : e)),
    })),

  addTaskFromEmail: (emailId) => {
    const { emails, tasks } = get();
    const email = emails.find((e) => e.id === emailId);
    if (!email) return;
    const alreadyExists = tasks.some((t) => t.text === `Follow up: ${email.subject}`);
    if (alreadyExists) return;
    set((s) => ({
      tasks: [
        ...s.tasks,
        { id: uid(), text: `Follow up: ${email.subject}`, done: false },
      ],
      emails: s.emails.map((e) => (e.id === emailId ? { ...e, read: true } : e)),
    }));
  },

  // ── Courses ──
  courses: seedCourses,
}));

export { WIDGET_TITLES, DEFAULT_SIZES };
