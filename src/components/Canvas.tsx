import { useRef } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useDashboardStore } from '../store/dashboardStore';
import WidgetFrame from './WidgetFrame';

export default function Canvas() {
  const { pages, activePageId } = useDashboardStore();
  const canvasRef = useRef<HTMLDivElement>(null);

  const activePage = pages.find((p) => p.id === activePageId);
  const widgets = activePage?.widgets ?? [];

  // Make this element a drop target for dnd-kit
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas' });

  const combineRef = (el: HTMLDivElement | null) => {
    (canvasRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
    setNodeRef(el);
  };

  return (
    <div
      ref={combineRef}
      className={`relative flex-1 overflow-auto transition-colors ${
        isOver ? 'bg-indigo-50' : 'bg-[#f8f9fc]'
      }`}
      style={{
        backgroundImage: isOver
          ? 'none'
          : `radial-gradient(circle, #d1d5db 1px, transparent 1px)`,
        backgroundSize: '24px 24px',
      }}
    >
      {/* Drop hint overlay */}
      {isOver && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="border-2 border-dashed border-indigo-400 rounded-2xl px-8 py-4 bg-indigo-100/60">
            <p className="text-indigo-600 font-semibold text-sm">Release to add widget</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {widgets.length === 0 && !isOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center mb-4">
            <span className="text-3xl">🎓</span>
          </div>
          <p className="text-gray-500 font-medium text-sm">Your canvas is empty</p>
          <p className="text-gray-400 text-xs mt-1">
            Drag components from the sidebar to get started
          </p>
        </div>
      )}

      {/* Widgets */}
      {widgets.map((widget) => (
        <WidgetFrame key={widget.id} widget={widget} canvasRef={canvasRef} />
      ))}
    </div>
  );
}
