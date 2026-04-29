import { useRef, useState, useCallback, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useDashboardStore } from '../store/dashboardStore';
import { DEFAULT_SIZES, GRID_SIZE } from '../store/dashboardStore';
import WidgetFrame from './WidgetFrame';
import type { WidgetType } from '../types';

interface Props {
  onDraggedPos: (pos: { x: number; y: number; width: number; height: number } | null) => void;
  draggingType: WidgetType | null;
  onBoundsChange: (bounds: { width: number; height: number } | null) => void;
}

export default function Canvas({ onDraggedPos, draggingType, onBoundsChange }: Props) {
  const { pages, activePageId, isEditing } = useDashboardStore();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [previewPos, setPreviewPos] = useState<{ x: number; y: number } | null>(null);

  const activePage = pages.find((p) => p.id === activePageId);
  const widgets = activePage?.widgets ?? [];

  // Make this element a drop target for dnd-kit
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas' });

  const combineRef = (el: HTMLDivElement | null) => {
    (canvasRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
    setNodeRef(el);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const publishBounds = () => {
      const rect = canvas.getBoundingClientRect();
      onBoundsChange({ width: rect.width, height: rect.height });
    };

    publishBounds();

    const observer = new ResizeObserver(() => publishBounds());
    observer.observe(canvas);

    return () => {
      observer.disconnect();
      onBoundsChange(null);
    };
  }, [onBoundsChange]);

  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isEditing || !draggingType || !isOver) {
        setPreviewPos(null);
        onDraggedPos(null);
        return;
      }

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Snap to grid
      const snappedX = Math.round(x / GRID_SIZE) * GRID_SIZE;
      const snappedY = Math.round(y / GRID_SIZE) * GRID_SIZE;

      setPreviewPos({ x: snappedX, y: snappedY });
      onDraggedPos({ x: snappedX, y: snappedY, width: rect.width, height: rect.height });
    },
    [isEditing, draggingType, isOver, onDraggedPos],
  );

  const size = draggingType ? DEFAULT_SIZES[draggingType] : null;

  return (
    <div
      ref={combineRef}
      className={`relative flex-1 overflow-auto transition-colors ${
        isOver && isEditing ? 'bg-indigo-50' : 'bg-[#f8f9fc]'
      }`}
      style={{
        backgroundImage: isOver && isEditing
          ? 'none'
          : `radial-gradient(circle, #d1d5db 1px, transparent 1px)`,
        backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
      }}
      onMouseMove={handleCanvasMouseMove}
      onMouseLeave={() => {
        setPreviewPos(null);
        onDraggedPos(null);
      }}
    >
      {/* Widget preview while dragging */}
      {previewPos && size && draggingType && isEditing && (
        <div
          className="absolute border-2 border-dashed border-indigo-400 bg-indigo-50/50 rounded-lg pointer-events-none transition-all"
          style={{
            left: previewPos.x,
            top: previewPos.y,
            width: size.width,
            height: size.height,
            zIndex: 10,
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-indigo-600 font-semibold text-sm bg-white/90 px-2 py-1 rounded">
              {draggingType.charAt(0).toUpperCase() + draggingType.slice(1)}
            </span>
          </div>
        </div>
      )}

      {/* Drop hint overlay */}
      {isOver && isEditing && !previewPos && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="border-2 border-dashed border-indigo-400 rounded-2xl px-8 py-4 bg-indigo-100/60">
            <p className="text-indigo-600 font-semibold text-sm">Move over canvas to place</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {widgets.length === 0 && !isOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center mb-4">
            <span className="text-3xl">🎓</span>
          </div>
          <p className="text-gray-500 font-medium text-sm">
            {isEditing ? 'Your canvas is empty' : 'No widgets on this page'}
          </p>
          <p className="text-gray-400 text-xs mt-1">
            {isEditing ? 'Drag widgets from the sidebar to get started' : 'Enable editing to add widgets'}
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
