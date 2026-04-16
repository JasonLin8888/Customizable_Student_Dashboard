import { useState } from 'react';
import { useDndMonitor, useDraggable } from '@dnd-kit/core';
import {
  Calendar,
  CheckSquare,
  Mail,
  BookOpen,
  FileText,
  Code2,
  PenLine,
  Network,
  Timer,
  File,
  Trash2,
} from 'lucide-react';
import type { WidgetType } from '../types';
import type { DashboardPage } from '../types';
import { useDashboardStore } from '../store/dashboardStore';

interface SidebarItem {
  type: WidgetType;
  label: string;
  description: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  color: string;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { type: 'calendar',    label: 'Calendar',       description: 'Assignments & events',   icon: Calendar,    color: '#6366f1' },
  { type: 'todo',        label: 'To-Do List',     description: 'Tasks & deadlines',      icon: CheckSquare, color: '#8b5cf6' },
  { type: 'inbox',       label: 'Inbox',          description: 'Email & notifications',  icon: Mail,        color: '#3b82f6' },
  { type: 'classview',   label: 'Class View',     description: 'Per-course panel',       icon: BookOpen,    color: '#10b981' },
  { type: 'notes',       label: 'Notes',          description: 'Rich text editor',       icon: FileText,    color: '#f59e0b' },
  { type: 'latex',       label: 'LaTeX Editor',   description: 'Overleaf-style editor',  icon: Code2,       color: '#475569' },
  { type: 'handwriting', label: 'Handwriting',    description: 'GoodNotes-style canvas', icon: PenLine,     color: '#ec4899' },
  { type: 'mindmap',     label: 'Mind Map',       description: 'Visual idea mapping',    icon: Network,     color: '#06b6d4' },
  { type: 'pomodoro',    label: 'Pomodoro',       description: 'Focus timer',            icon: Timer,       color: '#f43f5e' },
  { type: 'fileviewer',  label: 'File Viewer',    description: 'PDFs & uploads',         icon: File,        color: '#14b8a6' },
];

function DraggableSidebarItem({ item }: { item: SidebarItem }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `sidebar-${item.type}`,
    data: { type: item.type },
  });
  const Icon = item.icon;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`flex items-center gap-2.5 p-2 rounded-lg cursor-grab active:cursor-grabbing
        hover:bg-white hover:shadow-sm transition-all
        ${isDragging ? 'opacity-40 scale-95' : 'opacity-100'}`}
      title={`Drag "${item.label}" onto the canvas`}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm"
        style={{ backgroundColor: item.color + '22' }}
      >
        <Icon size={16} style={{ color: item.color }} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-gray-700 leading-tight truncate">{item.label}</p>
        <p className="text-[10px] text-gray-400 leading-tight truncate">{item.description}</p>
      </div>
    </div>
  );
}

interface PageRowProps {
  page: DashboardPage;
  active: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onRename: (name: string) => void;
}

function PageRow({ page, active, onSelect, onRemove, onRename }: PageRowProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(page.name);

  const commit = () => { onRename(draft); setEditing(false); };

  return (
    <div
      onClick={onSelect}
      className={`flex items-center gap-1 px-2 py-1 rounded-md cursor-pointer group transition-colors ${
        active ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {editing ? (
        <input
          autoFocus
          className="flex-1 text-xs bg-transparent outline-none border-b border-indigo-400"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => { if (e.key === 'Enter') commit(); }}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span
          className="flex-1 text-xs truncate"
          onDoubleClick={(e) => { e.stopPropagation(); setEditing(true); }}
        >
          {page.name}
        </span>
      )}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
      >
        <Trash2 size={11} />
      </button>
    </div>
  );
}

interface Props {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: Props) {
  const { pages, activePageId, addPage, removePage, setActivePage, renamePage } = useDashboardStore();
  const [isDraggingAny, setIsDraggingAny] = useState(false);

  useDndMonitor({
    onDragStart: () => setIsDraggingAny(true),
    onDragEnd: () => setIsDraggingAny(false),
    onDragCancel: () => setIsDraggingAny(false),
  });

  return (
    <aside
      className={`flex flex-col bg-gray-50 border-r border-gray-200 transition-all duration-200 shrink-0 ${
        collapsed ? 'w-12' : 'w-56'
      }`}
    >
      {/* Logo / collapse toggle */}
      <div className="flex items-center gap-2 px-2 py-3 border-b border-gray-200 shrink-0">
        <button
          onClick={onToggle}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-500 text-white shadow-sm hover:bg-indigo-600 shrink-0 transition-colors font-bold text-sm"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          S
        </button>
        {!collapsed && (
          <span className="text-sm font-bold text-gray-800 truncate">StudySpace</span>
        )}
      </div>

      {!collapsed && (
        <>
          {/* Components section */}
          <div className="px-2 pt-3 pb-1 shrink-0">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1 px-1">
              Components
            </p>
            {isDraggingAny && (
              <p className="text-[10px] text-indigo-500 bg-indigo-50 rounded px-2 py-1 mb-1 text-center">
                ↓ Drop on the canvas
              </p>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-1 space-y-0.5 pb-2">
            {SIDEBAR_ITEMS.map((item) => (
              <DraggableSidebarItem key={item.type} item={item} />
            ))}
          </div>

          {/* Pages section */}
          <div className="border-t border-gray-200 px-2 py-2 shrink-0">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Pages</p>
              <button
                onClick={() => addPage(`Page ${pages.length + 1}`)}
                className="text-indigo-500 hover:text-indigo-700 text-lg leading-none"
                title="Add page"
              >
                +
              </button>
            </div>
            <div className="space-y-0.5 max-h-32 overflow-y-auto">
              {pages.map((page) => (
                <PageRow
                  key={page.id}
                  page={page}
                  active={page.id === activePageId}
                  onSelect={() => setActivePage(page.id)}
                  onRemove={() => removePage(page.id)}
                  onRename={(name) => renamePage(page.id, name)}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </aside>
  );
}
