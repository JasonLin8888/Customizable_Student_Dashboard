import { useState, useRef, useCallback } from 'react';
import {
  X,
  ChevronDown,
  ChevronUp,
  GripVertical,
} from 'lucide-react';
import { useDashboardStore } from '../store/dashboardStore';
import type { Widget } from '../types';

// Widget content renderers
import CalendarWidget from './widgets/CalendarWidget';
import TodoWidget from './widgets/TodoWidget';
import InboxWidget from './widgets/InboxWidget';
import ClassViewWidget from './widgets/ClassViewWidget';
import NotesWidget from './widgets/NotesWidget';
import LatexWidget from './widgets/LatexWidget';
import HandwritingWidget from './widgets/HandwritingWidget';
import MindMapWidget from './widgets/MindMapWidget';
import PomodoroWidget from './widgets/PomodoroWidget';
import FileViewerWidget from './widgets/FileViewerWidget';

const WIDGET_COMPONENTS: Record<string, React.ComponentType> = {
  calendar: CalendarWidget,
  todo: TodoWidget,
  inbox: InboxWidget,
  classview: ClassViewWidget,
  notes: NotesWidget,
  latex: LatexWidget,
  handwriting: HandwritingWidget,
  mindmap: MindMapWidget,
  pomodoro: PomodoroWidget,
  fileviewer: FileViewerWidget,
};

const WIDGET_HEADER_COLORS: Record<string, string> = {
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

interface Props {
  widget: Widget;
  canvasRef: React.RefObject<HTMLDivElement | null>;
}

const MIN_W = 200;
const MIN_H = 120;

export default function WidgetFrame({ widget, canvasRef }: Props) {
  const { updateWidget, removeWidget, bringToFront } = useDashboardStore();
  const frameRef = useRef<HTMLDivElement>(null);

  // ── Drag to move ──────────────────────────────────────────────────────────
  const drag = useRef<{ startX: number; startY: number; wx: number; wy: number } | null>(null);

  const onHeaderMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest('button')) return;
      e.preventDefault();
      bringToFront(widget.id);
      drag.current = { startX: e.clientX, startY: e.clientY, wx: widget.x, wy: widget.y };

      const onMove = (mv: MouseEvent) => {
        if (!drag.current) return;
        const canvas = canvasRef.current;
        const canvasRect = canvas?.getBoundingClientRect();
        const dx = mv.clientX - drag.current.startX;
        const dy = mv.clientY - drag.current.startY;
        let nx = drag.current.wx + dx;
        let ny = drag.current.wy + dy;
        if (canvasRect) {
          nx = Math.max(0, Math.min(nx, canvasRect.width - widget.width));
          ny = Math.max(0, Math.min(ny, canvasRect.height - widget.height));
        }
        updateWidget(widget.id, { x: nx, y: ny });
      };
      const onUp = () => {
        drag.current = null;
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [widget, bringToFront, updateWidget, canvasRef],
  );

  // ── Resize via SE corner handle ───────────────────────────────────────────
  const resize = useRef<{ startX: number; startY: number; w: number; h: number } | null>(null);

  const onResizeMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      resize.current = { startX: e.clientX, startY: e.clientY, w: widget.width, h: widget.height };

      const onMove = (mv: MouseEvent) => {
        if (!resize.current) return;
        const nw = Math.max(MIN_W, resize.current.w + mv.clientX - resize.current.startX);
        const nh = Math.max(MIN_H, resize.current.h + mv.clientY - resize.current.startY);
        updateWidget(widget.id, { width: nw, height: nh });
      };
      const onUp = () => {
        resize.current = null;
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [widget, updateWidget],
  );

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(widget.title);

  const commitTitle = () => {
    updateWidget(widget.id, { title: titleDraft });
    setEditingTitle(false);
  };

  const WidgetContent = WIDGET_COMPONENTS[widget.type];
  const headerGradient = WIDGET_HEADER_COLORS[widget.type] ?? 'from-gray-500 to-gray-400';

  return (
    <div
      ref={frameRef}
      style={{
        position: 'absolute',
        left: widget.x,
        top: widget.y,
        width: widget.width,
        height: widget.collapsed ? 'auto' : widget.height,
        zIndex: widget.zIndex,
      }}
      className="flex flex-col rounded-xl shadow-lg bg-white border border-gray-100 overflow-hidden select-none"
      onMouseDown={() => bringToFront(widget.id)}
    >
      {/* ── Header ── */}
      <div
        className={`flex items-center gap-1.5 px-2 py-1.5 bg-gradient-to-r ${headerGradient} cursor-grab active:cursor-grabbing shrink-0`}
        onMouseDown={onHeaderMouseDown}
      >
        <GripVertical size={13} className="text-white/70 shrink-0" />
        {editingTitle ? (
          <input
            autoFocus
            className="flex-1 bg-transparent text-white text-xs font-semibold outline-none border-b border-white/50"
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => { if (e.key === 'Enter') commitTitle(); }}
            onMouseDown={(e) => e.stopPropagation()}
          />
        ) : (
          <span
            className="flex-1 text-white text-xs font-semibold truncate"
            onDoubleClick={() => setEditingTitle(true)}
            title="Double-click to rename"
          >
            {widget.title}
          </span>
        )}
        <button
          onClick={() => updateWidget(widget.id, { collapsed: !widget.collapsed })}
          className="text-white/80 hover:text-white transition-colors"
          title={widget.collapsed ? 'Expand' : 'Collapse'}
        >
          {widget.collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
        <button
          onClick={() => removeWidget(widget.id)}
          className="text-white/80 hover:text-white transition-colors"
          title="Remove widget"
        >
          <X size={14} />
        </button>
      </div>

      {/* ── Content ── */}
      {!widget.collapsed && (
        <div className="flex-1 overflow-hidden p-2.5 relative">
          <WidgetContent />

          {/* SE resize handle */}
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
            onMouseDown={onResizeMouseDown}
            style={{
              background: 'linear-gradient(135deg, transparent 50%, #d1d5db 50%)',
              borderRadius: '0 0 4px 0',
            }}
          />
        </div>
      )}
    </div>
  );
}
