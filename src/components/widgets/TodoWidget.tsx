import { useState } from 'react';
import { useDashboardStore } from '../../store/dashboardStore';
import { CheckCircle2, Circle, Plus, Trash2, Pencil, X } from 'lucide-react';
import type { Task } from '../../types';

export default function TodoWidget() {
  const { tasks, addTask, toggleTask, removeTask } = useDashboardStore();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addTask(newTaskTitle.trim());
    setNewTaskTitle('');
  };

  const filtered = tasks.filter((t) => {
    if (filter === 'active') return !t.done;
    if (filter === 'completed') return t.done;
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-gray-800 text-sm">To-Do List</h2>
          <span className="text-xs text-gray-400">{tasks.filter((t) => !t.done).length} remaining</span>
        </div>
        {/* Filter tabs */}
        <div className="flex gap-1">
          {(['all', 'active', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-0.5 text-xs rounded-full capitalize transition-colors ${
                filter === f ? 'bg-indigo-100 text-indigo-700 font-medium' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Add task form */}
      <form onSubmit={handleAdd} className="px-4 py-2 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
          <Plus className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Add a task..."
            className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400"
          />
        </div>
      </form>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {filtered.map((task) => (
          <TaskRow key={task.id} task={task} onToggle={toggleTask} onRemove={removeTask} />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            No tasks {filter !== 'all' ? `(${filter})` : ''}
          </div>
        )}
      </div>
    </div>
  );
}

interface TaskRowProps {
  task: Task;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}

function TaskRow({ task, onToggle, onRemove }: TaskRowProps) {
  const [editing, setEditing] = useState(false);
  const [titleDraft, setTitleDraft] = useState(task.text);
  const [showEditModal, setShowEditModal] = useState(false);
  const [modalTitleDraft, setModalTitleDraft] = useState(task.text);
  const [modalDeadlineDraft, setModalDeadlineDraft] = useState(task.dueDate ?? '');
  const [modalCourseDraft, setModalCourseDraft] = useState(task.course ?? '');

  const commitTitle = () => {
    setEditing(false);
    if (titleDraft.trim() && titleDraft !== task.text) {
      // We'd need to add an updateTask method to store for this
      // For now, we'll just update on blur
    }
  };

  const openEditModal = () => {
    setModalTitleDraft(task.text);
    setModalDeadlineDraft(task.dueDate ?? '');
    setModalCourseDraft(task.course ?? '');
    setShowEditModal(true);
  };

  const isDone = task.done;

  return (
    <>
      <div className="w-full rounded-xl border border-gray-200 bg-white p-3 shadow-sm hover:border-gray-300 transition-colors">
        <div className="flex items-start gap-2">
          {/* Status toggle */}
          <button
            onClick={() => onToggle(task.id)}
            className={`mt-0.5 shrink-0 transition-colors ${isDone ? 'text-green-500' : 'text-gray-300'} hover:opacity-80`}
            title={`Status: ${isDone ? 'done' : 'todo'}`}
          >
            {isDone ? <CheckCircle2 size={18} /> : <Circle size={18} />}
          </button>

          {/* Title */}
          <div className="min-w-0 flex-1">
            {editing ? (
              <input
                autoFocus
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onBlur={commitTitle}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitTitle();
                  if (e.key === 'Escape') setEditing(false);
                }}
                className="w-full text-sm border-b border-blue-400 outline-none bg-transparent text-gray-900 py-0.5"
              />
            ) : (
              <span
                onClick={() => {
                  setTitleDraft(task.text);
                  setEditing(true);
                }}
                className={`text-sm cursor-text block ${isDone ? 'line-through text-gray-400' : 'text-gray-800'}`}
              >
                {task.text || '(untitled)'}
              </span>
            )}

            {/* Metadata */}
            {(task.dueDate || task.course) && (
              <div className="flex items-center gap-2 mt-1">
                {task.course && <span className="text-xs bg-indigo-100 text-indigo-700 rounded px-1.5 py-0.5">{task.course}</span>}
                {task.dueDate && <span className="text-xs text-gray-400">Due {task.dueDate}</span>}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-3 flex items-center justify-between">
          <button
            onClick={openEditModal}
            className="p-1.5 rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            title="Edit task"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onRemove(task.id)}
            className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Delete task"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl border border-gray-200">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800">Edit Task</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                aria-label="Close"
              >
                <X size={14} />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Task Title</label>
                <input
                  type="text"
                  value={modalTitleDraft}
                  onChange={(e) => setModalTitleDraft(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded px-2 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Due Date</label>
                <input
                  type="date"
                  value={modalDeadlineDraft}
                  onChange={(e) => setModalDeadlineDraft(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded px-2 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Course</label>
                <input
                  type="text"
                  value={modalCourseDraft}
                  onChange={(e) => setModalCourseDraft(e.target.value)}
                  placeholder="e.g., MATH 201"
                  className="w-full text-sm border border-gray-300 rounded px-2 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <button
                onClick={() => setShowEditModal(false)}
                className="w-full text-sm font-medium rounded-md px-2 py-2 bg-gray-800 text-white hover:bg-gray-900 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
