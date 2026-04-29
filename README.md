# Customizable Student Dashboard

A redesign of Notion focused on usability and inspired by Wix.com and Canva, with a focus on quickly assembling a personal academic dashboard from modular widgets.

A customizable, drag-and-drop student workspace built with React, TypeScript, Vite, Tailwind CSS, and Zustand.

## Overview

This project provides a canvas-based dashboard where users can:

- Drag widgets from a sidebar onto a canvas
- Move, resize, collapse, rename, and remove widgets
- Organize multiple pages of dashboards
- Work with course-related data (tasks, events, inbox items, and classes)

All state is currently in-memory (Zustand store), seeded with sample academic data.

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS v4 via @tailwindcss/vite
- Zustand (global state)
- dnd-kit (drag and drop)
- lucide-react (icons)

## Features

### Dashboard and Layout

- Sidebar with draggable widget palette
- Collapsible sidebar
- Multi-page dashboard support:
  - Create pages
  - Rename pages (double-click)
  - Remove pages
  - Switch active page
- Dot-grid canvas with empty-state and drag-over feedback
- Widget layering with automatic bring-to-front behavior

### Widget Frame Behavior

Each placed widget supports:

- Drag to move within canvas bounds
- Resize from bottom-right corner
- Collapse/expand
- Title rename (double-click)
- Remove widget

### Available Widgets

1. Calendar
	- Month navigation
	- Add event form (title, date, type)
	- Event display by day with type color coding

2. To-Do List
	- Add task with optional due date
	- Toggle completion
	- Remove tasks
	- Separate pending/completed sections

3. Inbox
	- Read/unread email list
	- Mark email as read
	- Convert email into follow-up task

4. Class View
	- Course cards with instructor info
	- Upcoming course events
	- Pending task count per course

5. Notes
	- Markdown-style editor
	- Lightweight preview mode
	- Basic formatting shortcuts (heading, bold, italic, list)

6. LaTeX Editor
	- Editable starter .tex content
	- Copy source to clipboard
	- Download as .tex file

7. Handwriting
	- Canvas drawing with pen/eraser
	- Color and brush-size controls
	- Clear canvas and download PNG

8. Mind Map
	- Add draggable nodes
	- Connect nodes with directional links
	- Rename node labels
	- Delete selected nodes (except root)

9. Pomodoro Timer
	- Work, short break, and long break modes
	- Circular progress visualization
	- Start/pause/reset controls
	- Completed session counter

10. File Viewer
	 - Drag-and-drop or click upload
	 - File list with remove action
	 - Preview PDFs and images
	 - Download fallback for unsupported types

## Project Structure

```
.
├── src/
│   ├── components/
│   │   ├── Canvas.tsx
│   │   ├── Sidebar.tsx
│   │   ├── WidgetFrame.tsx
│   │   └── widgets/
│   │       ├── CalendarWidget.tsx
│   │       ├── ClassViewWidget.tsx
│   │       ├── FileViewerWidget.tsx
│   │       ├── HandwritingWidget.tsx
│   │       ├── InboxWidget.tsx
│   │       ├── LatexWidget.tsx
│   │       ├── MindMapWidget.tsx
│   │       ├── NotesWidget.tsx
│   │       ├── PomodoroWidget.tsx
│   │       └── TodoWidget.tsx
│   ├── store/
│   │   └── dashboardStore.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## NPM Scripts

- npm run dev: Start Vite development server
- npm run build: Type-check/build and create production bundle
- npm run preview: Preview production build locally
- npm test: Placeholder script (currently not implemented)

## Current Limitations

- No persistence layer yet (no localStorage/database sync)
- No authentication or multi-user support
- Notes markdown renderer is intentionally lightweight
- File previews are limited to browser-supported formats
- No automated tests configured yet

## Possible Next Improvements

- Persist dashboard/pages/widget state to localStorage or backend
- Add real markdown/LaTeX rendering pipelines
- Add widget settings panels and theming
- Add keyboard shortcuts and accessibility improvements
- Introduce unit/integration tests

## License

ISC
