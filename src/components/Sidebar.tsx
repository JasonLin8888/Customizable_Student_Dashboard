import { useState, useRef } from 'react';
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
  Edit2,
  Copy,
  GripVertical,
} from 'lucide-react';
import type { WidgetType } from '../types';
import type { DashboardPage } from '../types';
import { useDashboardStore, DEFAULT_SIZES } from '../store/dashboardStore';

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

function DraggableSidebarItem({
  item,
  onAddWidget,
}: {
  item: SidebarItem;
  onAddWidget: (type: WidgetType) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `sidebar-${item.type}`,
    data: { type: item.type },
  });
  const Icon = item.icon;
  const [showPreview, setShowPreview] = useState(false);
  const [previewPos, setPreviewPos] = useState({ x: 0, y: 0 });
  const itemRef = useRef<HTMLDivElement>(null);
  const WIDGET_HEADER_COLORS: Record<WidgetType, string> = {
    calendar:    'from-indigo-500 to-indigo-400',
    todo:        'from-violet-500 to-violet-400',
    inbox:       'from-blue-500 to-blue-400',
    classview:   'from-emerald-500 to-emerald-400',
    notes:       'from-amber-500 to-amber-400',
    latex:       'from-slate-600 to-slate-500',
    handwriting: 'from-pink-500 to-pink-400',
    mindmap:     'from-cyan-500 to-cyan-400',
    pomodoro:    'from-rose-500 to-rose-400',
    fileviewer:  'from-teal-500 to-teal-400',
  };

  const handleMouseEnter = () => {
    if (itemRef.current) {
      const rect = itemRef.current.getBoundingClientRect();
      setPreviewPos({ x: rect.right + 10, y: rect.top });
      setShowPreview(true);
    }
  };

  const size = DEFAULT_SIZES[item.type];
  const headerGradient = WIDGET_HEADER_COLORS[item.type];

  const handleRef = (el: HTMLDivElement | null) => {
    setNodeRef(el);
    if (el) itemRef.current = el;
  };

  return (
    <>
      <div
        ref={handleRef}
        className={`flex items-center gap-2.5 p-2 rounded-lg border border-gray-200/80 transition-all cursor-pointer
          hover:bg-white hover:shadow-sm hover:border-indigo-200
          ${isDragging ? 'opacity-40 scale-95' : 'opacity-100'}`}
        title={`Drag "${item.label}" onto the canvas`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShowPreview(false)}
        onClick={() => onAddWidget(item.type)}
      >
        <div
          {...listeners}
          {...attributes}
          className="text-gray-300 hover:text-indigo-500 flex items-center justify-center cursor-grab active:cursor-grabbing shrink-0"
          title="Drag widget"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={15} />
        </div>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
          style={{ backgroundColor: item.color + '22' }}
        >
          <Icon size={18} style={{ color: item.color }} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-700 leading-tight truncate">{item.label}</p>
          <p className="text-[11px] text-gray-400 leading-tight truncate">{item.description}</p>
        </div>
      </div>

      {/* Widget Preview Tooltip */}
      {showPreview && (
        <div
          className="fixed bg-white rounded-lg shadow-2xl border border-gray-200 p-3 pointer-events-none z-50"
          style={{
            left: previewPos.x,
            top: previewPos.y,
            width: Math.min(size.width, 280),
            height: Math.min(size.height, 200),
          }}
        >
          <div
            className={`flex items-center gap-1.5 px-2 py-1.5 bg-gradient-to-r ${headerGradient} rounded-t-lg mb-1`}
            style={{ margin: '-12px -12px 8px -12px', paddingBottom: '8px' }}
          >
            <span className="text-white text-xs font-semibold truncate">{item.label}</span>
          </div>
          <div className="text-[10px] text-gray-500 space-y-1">
            <div className="flex items-center gap-2">
              <Icon size={12} style={{ color: item.color }} />
              <span>{item.description}</span>
            </div>
            <div className="text-gray-400 text-[9px]">
              {size.width}×{size.height}px
            </div>
          </div>
        </div>
      )}
    </>
  );
}

interface PageRowProps {
  page: DashboardPage;
  active: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
  onRename: (name: string) => void;
}

function PageRow({ page, active, onSelect, onDuplicate, onRemove, onRename }: PageRowProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(page.name);

  const commit = () => { onRename(draft); setEditing(false); };

  return (
    <div
      onClick={onSelect}
      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer group transition-colors border ${
        active
          ? 'bg-indigo-100 text-indigo-700 border-indigo-300 shadow-sm'
          : 'text-gray-600 border-transparent hover:bg-gray-100 hover:border-gray-200'
      }`}
    >
      {editing ? (
        <input
          autoFocus
          className="flex-1 min-w-0 text-sm bg-transparent outline-none border-b border-indigo-400"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => { if (e.key === 'Enter') commit(); }}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span
          className="flex-1 min-w-0 text-sm font-medium truncate"
          onDoubleClick={(e) => { e.stopPropagation(); setEditing(true); }}
        >
          {page.name}
        </span>
      )}
      <button
        onClick={(e) => { e.stopPropagation(); setEditing(true); }}
        className="opacity-90 text-gray-400 hover:text-indigo-600 transition-colors p-1"
        title="Rename page"
      >
        <Edit2 size={13} />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
        className="opacity-90 text-gray-400 hover:text-indigo-600 transition-colors p-1"
        title="Duplicate page"
      >
        <Copy size={13} />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="opacity-90 text-gray-400 hover:text-red-500 transition-colors p-1"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

interface Props {
  collapsed: boolean;
  onToggle: () => void;
  onAddWidget: (type: WidgetType) => void;
  onDuplicatePage: (page: DashboardPage) => void;
}

export default function Sidebar({ collapsed, onToggle, onAddWidget, onDuplicatePage }: Props) {
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
        collapsed ? 'w-14' : 'w-72'
      }`}
    >
      {/* Logo / collapse toggle */}
      <div className="flex items-center gap-2 px-3 py-4 border-b border-gray-200 shrink-0">
        <button
          onClick={onToggle}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-indigo-500 text-white shadow-sm hover:bg-indigo-600 shrink-0 transition-colors font-bold text-sm"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          S
        </button>
        {!collapsed && (
          <span className="text-base font-bold text-gray-800 truncate">StudySpace</span>
        )}
      </div>

      {!collapsed && (
        <>
          {/* Widgets section */}
          <div className="px-3 pt-4 pb-2 shrink-0">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-2 px-1">
              Widgets
            </p>
            <p className="text-[11px] text-gray-500 px-1 mb-2">
              Drag from sidebar to canvas or click to add
            </p>
            {isDraggingAny && (
              <p className="text-[11px] text-indigo-500 bg-indigo-50 rounded-lg px-3 py-1.5 mb-2 text-center">
                ↓ Drop on the canvas
              </p>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-2 space-y-1.5 pb-3">
            {SIDEBAR_ITEMS.map((item) => (
              <DraggableSidebarItem key={item.type} item={item} onAddWidget={onAddWidget} />
            ))}
          </div>

          {/* Pages section */}
          <div className="border-t border-gray-200 px-3 py-3 shrink-0 bg-white/60">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Pages</p>
              <button
                onClick={() => addPage(`Page ${pages.length + 1}`)}
                className="text-indigo-500 hover:text-indigo-700 text-lg leading-none"
                title="Add page"
              >
                +
              </button>
            </div>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {pages.map((page) => (
                <PageRow
                  key={page.id}
                  page={page}
                  active={page.id === activePageId}
                  onSelect={() => setActivePage(page.id)}
                  onDuplicate={() => onDuplicatePage(page)}
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
