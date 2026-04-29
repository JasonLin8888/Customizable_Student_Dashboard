import { useState, useRef } from 'react';
import { useDraggable } from '@dnd-kit/core';
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
  GripHorizontal,
} from 'lucide-react';
import type { WidgetType } from '../types';
import { DEFAULT_SIZES } from '../store/dashboardStore';

interface SidebarItem {
  type: WidgetType;
  label: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  color: string;
}

const WIDGET_ITEMS: SidebarItem[] = [
  { type: 'calendar',    label: 'Calendar',       icon: Calendar,    color: '#6366f1' },
  { type: 'todo',        label: 'To-Do',          icon: CheckSquare, color: '#8b5cf6' },
  { type: 'inbox',       label: 'Inbox',          icon: Mail,        color: '#3b82f6' },
  { type: 'classview',   label: 'Class',          icon: BookOpen,    color: '#10b981' },
  { type: 'notes',       label: 'Notes',          icon: FileText,    color: '#f59e0b' },
  { type: 'latex',       label: 'LaTeX',          icon: Code2,       color: '#475569' },
  { type: 'handwriting', label: 'Draw',           icon: PenLine,     color: '#ec4899' },
  { type: 'mindmap',     label: 'MindMap',        icon: Network,     color: '#06b6d4' },
  { type: 'pomodoro',    label: 'Pomodoro',       icon: Timer,       color: '#f43f5e' },
  { type: 'fileviewer',  label: 'Files',          icon: File,        color: '#14b8a6' },
];

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

function DraggableWidgetButton({
  item,
  onAddWidget,
}: {
  item: SidebarItem;
  onAddWidget: (type: WidgetType) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `bottombar-${item.type}`,
    data: { type: item.type },
  });
  const Icon = item.icon;
  const [showPreview, setShowPreview] = useState(false);
  const [previewPos, setPreviewPos] = useState({ x: 0, y: 0 });
  const itemRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (itemRef.current) {
      const rect = itemRef.current.getBoundingClientRect();
      setPreviewPos({ x: rect.left + rect.width / 2, y: rect.top - 10 });
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
        className={`flex flex-col items-center gap-1 p-2 rounded-lg border border-gray-200/80 transition-all cursor-pointer flex-1
          hover:bg-white hover:shadow-md hover:border-indigo-300
          ${isDragging ? 'opacity-40 scale-95' : 'opacity-100'}`}
        title={`Drag "${item.label}" onto the canvas`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShowPreview(false)}
        onClick={() => onAddWidget(item.type)}
      >
        <div
          {...listeners}
          {...attributes}
          className="text-gray-300 hover:text-indigo-500 flex items-center justify-center cursor-grab active:cursor-grabbing"
          title="Drag widget"
          onClick={(e) => e.stopPropagation()}
        >
          <GripHorizontal size={14} />
        </div>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm"
          style={{ backgroundColor: item.color + '22' }}
        >
          <Icon size={16} style={{ color: item.color }} />
        </div>
        <span className="text-xs font-medium text-gray-700 text-center truncate">{item.label}</span>
      </div>

      {/* Widget Preview Tooltip */}
      {showPreview && (
        <div
          className="fixed bg-white rounded-lg shadow-2xl border border-gray-200 p-3 pointer-events-none z-50"
          style={{
            left: previewPos.x,
            top: previewPos.y,
            transform: 'translate(-50%, -100%)',
            width: Math.min(size.width, 280),
            height: Math.min(size.height, 200),
          }}
        >
          <div
            className={`flex items-center gap-1.5 px-2 py-1.5 bg-gradient-to-r ${headerGradient} rounded-t-lg`}
            style={{ margin: '-12px -12px 8px -12px', paddingBottom: '8px' }}
          >
            <span className="text-white text-xs font-semibold truncate">{item.label}</span>
          </div>
          <div className="text-[10px] text-gray-500 space-y-1">
            <div className="flex items-center gap-2">
              <Icon size={12} style={{ color: item.color }} />
              <span>Drag to canvas</span>
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

interface Props {
  onAddWidget: (type: WidgetType) => void;
}

export default function BottomBar({ onAddWidget }: Props) {
  return (
    <div className="bg-white border-t border-gray-200 px-3 py-2 shrink-0">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
        Widgets
      </p>
      <div className="flex gap-2 w-full">
        {WIDGET_ITEMS.map((item) => (
          <DraggableWidgetButton key={item.type} item={item} onAddWidget={onAddWidget} />
        ))}
      </div>
    </div>
  );
}
