import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import Sidebar from './components/Sidebar';
import Canvas from './components/Canvas';
import { useDashboardStore } from './store/dashboardStore';
import type { WidgetType } from './types';

export default function App() {
  const { addWidget, pages, activePageId } = useDashboardStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [draggingType, setDraggingType] = useState<WidgetType | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const type = event.active.data.current?.type as WidgetType | undefined;
    if (type) setDraggingType(type);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setDraggingType(null);
    const { over, active } = event;
    if (!over || over.id !== 'canvas') return;

    const type = active.data.current?.type as WidgetType | undefined;
    if (!type) return;

    addWidget(type);
  };

  const activePage = pages.find((p) => p.id === activePageId);

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex h-screen overflow-hidden bg-white">
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((c) => !c)} />

        <main className="flex flex-col flex-1 overflow-hidden">
          {/* Top bar */}
          <header className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200 shrink-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-gray-800">
                {activePage?.name ?? 'Dashboard'}
              </h1>
              <span className="text-xs text-gray-400">
                {activePage?.widgets.length ?? 0} widget{(activePage?.widgets.length ?? 0) !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-xs text-gray-400 hidden sm:block">
                Drag components from the sidebar → drop on canvas → resize &amp; arrange
              </p>
              <span className="text-xs bg-indigo-100 text-indigo-700 rounded-full px-2 py-0.5 font-medium">
                StudySpace
              </span>
            </div>
          </header>

          <Canvas />
        </main>
      </div>

      {/* Drag overlay – ghost pill while dragging */}
      <DragOverlay>
        {draggingType && (
          <div className="bg-white border border-indigo-300 rounded-lg shadow-xl px-3 py-2 text-xs font-semibold text-indigo-600 opacity-90 pointer-events-none">
            + {draggingType.charAt(0).toUpperCase() + draggingType.slice(1)}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
