import { useEffect, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { Edit2, Eye } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Canvas from './components/Canvas';
import { useDashboardStore } from './store/dashboardStore';
import type { WidgetType } from './types';

export default function App() {
  const { addWidgetAtPosition, duplicatePage, renamePage, pages, activePageId, isEditing, setIsEditing } = useDashboardStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [draggingType, setDraggingType] = useState<WidgetType | null>(null);
  const [draggedPos, setDraggedPos] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [canvasBounds, setCanvasBounds] = useState<{ width: number; height: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const [duplicateDialog, setDuplicateDialog] = useState<{ id: string; sourceName: string } | null>(null);
  const [duplicateNameDraft, setDuplicateNameDraft] = useState('');

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
    setDraggedPos(null);
    const { over, active } = event;
    if (!over || over.id !== 'canvas') return;

    const type = active.data.current?.type as WidgetType | undefined;
    if (!type) return;

    // Try to add widget at the last known dragged position
    if (draggedPos) {
      const success = addWidgetAtPosition(type, draggedPos.x, draggedPos.y, {
        width: draggedPos.width,
        height: draggedPos.height,
      });
      if (!success) {
        setError("⚠️ Widget doesn't fit here. Try a different position.");
        setTimeout(() => setError(null), 3000);
      }
    }
  };

  const handleSidebarAddWidget = (type: WidgetType) => {
    if (!canvasBounds) {
      setError("⚠️ Canvas isn't ready yet. Try again in a moment.");
      setTimeout(() => setError(null), 3000);
      return;
    }

    const success = addWidgetAtPosition(type, canvasBounds.width / 2, canvasBounds.height / 2, canvasBounds);
    if (!success) {
      setError("⚠️ Widget doesn't fit here. Try a different position.");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDuplicatePage = (page: { id: string; name: string }) => {
    const defaultName = `copy of ${page.name}`;
    setDuplicateNameDraft(defaultName);
    setDuplicateDialog({ id: page.id, sourceName: page.name });
  };

  const confirmDuplicatePage = () => {
    if (!duplicateDialog) return;
    const fallbackName = `copy of ${duplicateDialog.sourceName}`;
    const finalName = duplicateNameDraft.trim() || fallbackName;
    duplicatePage(duplicateDialog.id, finalName);
    setDuplicateDialog(null);
    setDuplicateNameDraft('');
  };

  const activePage = pages.find((p) => p.id === activePageId);

  useEffect(() => {
    setTitleDraft(activePage?.name ?? 'Dashboard');
    setIsEditingTitle(false);
  }, [activePageId, activePage?.name]);

  const commitTopbarTitle = () => {
    if (!activePage) return;
    const nextName = titleDraft.trim() || activePage.name;
    renamePage(activePage.id, nextName);
    setIsEditingTitle(false);
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex h-screen overflow-hidden bg-white">
        {isEditing && !sidebarCollapsed && (
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed((c) => !c)}
            onAddWidget={handleSidebarAddWidget}
            onDuplicatePage={handleDuplicatePage}
          />
        )}

        <main className="flex flex-col flex-1 overflow-hidden">
          {/* Top bar */}
          <header className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200 shrink-0">
            <div className="flex items-center gap-2">
              {isEditingTitle ? (
                <input
                  autoFocus
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  onBlur={commitTopbarTitle}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitTopbarTitle();
                    if (e.key === 'Escape') {
                      setTitleDraft(activePage?.name ?? 'Dashboard');
                      setIsEditingTitle(false);
                    }
                  }}
                  className="text-sm font-bold text-gray-800 bg-transparent border-b border-indigo-400 outline-none"
                />
              ) : (
                <h1
                  className="text-sm font-bold text-gray-800 cursor-text"
                  onDoubleClick={() => setIsEditingTitle(true)}
                  title="Double-click to rename page"
                >
                  {activePage?.name ?? 'Dashboard'}
                </h1>
              )}
              <span className="text-xs text-gray-400">
                {activePage?.widgets.length ?? 0} widget{(activePage?.widgets.length ?? 0) !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium text-sm transition-all ${
                  isEditing
                    ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title={isEditing ? 'Exit edit mode' : 'Enter edit mode'}
              >
                {isEditing ? (
                  <>
                    <Edit2 size={16} />
                    <span>Confirm Edits</span>
                  </>
                ) : (
                  <>
                    <Eye size={16} />
                    <span>Go to Editing Mode</span>
                  </>
                )}
              </button>
              <span className="text-xs bg-indigo-100 text-indigo-700 rounded-full px-2 py-0.5 font-medium">
                StudySpace
              </span>
            </div>
          </header>

          <Canvas
            onDraggedPos={setDraggedPos}
            draggingType={draggingType}
            onBoundsChange={setCanvasBounds}
          />
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

      {/* Error toast */}
      {error && (
        <div className="fixed bottom-4 left-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-pulse">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-3 font-semibold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {duplicateDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4">
          <div className="w-full max-w-md rounded-xl bg-white border border-gray-200 shadow-2xl p-4">
            <h2 className="text-sm font-semibold text-gray-800">Duplicate Page</h2>
            <p className="text-xs text-gray-500 mt-1">Name the duplicated page</p>

            <input
              autoFocus
              value={duplicateNameDraft}
              onChange={(e) => setDuplicateNameDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') confirmDuplicatePage();
                if (e.key === 'Escape') {
                  setDuplicateDialog(null);
                  setDuplicateNameDraft('');
                }
              }}
              className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setDuplicateDialog(null);
                  setDuplicateNameDraft('');
                }}
                className="px-3 py-1.5 rounded-lg text-sm text-gray-600 bg-gray-100 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDuplicatePage}
                className="px-3 py-1.5 rounded-lg text-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Duplicate
              </button>
            </div>
          </div>
        </div>
      )}
    </DndContext>
  );
}
