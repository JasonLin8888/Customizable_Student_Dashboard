import { useState } from 'react';
import { useDashboardStore } from '../../store/dashboardStore';
import { CheckSquare, Square, Plus, Trash2 } from 'lucide-react';

export default function TodoWidget() {
  const { tasks, addTask, toggleTask, removeTask } = useDashboardStore();
  const [input, setInput] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleAdd = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    addTask(trimmed, dueDate || undefined);
    setInput('');
    setDueDate('');
  };

  const pending = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);

  return (
    <div className="flex flex-col h-full text-sm overflow-hidden">
      {/* Add task row */}
      <div className="flex gap-1 mb-2 shrink-0">
        <input
          className="flex-1 border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
          placeholder="New task…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <input
          type="date"
          className="border border-gray-200 rounded px-1 py-1 text-xs focus:outline-none"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <button
          onClick={handleAdd}
          className="bg-indigo-500 text-white rounded px-2 py-1 hover:bg-indigo-600 transition-colors"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-1">
        {pending.map((task) => (
          <TaskRow key={task.id} task={task} onToggle={toggleTask} onRemove={removeTask} />
        ))}
        {done.length > 0 && (
          <>
            <p className="text-xs text-gray-400 mt-2 mb-1 font-medium">Completed</p>
            {done.map((task) => (
              <TaskRow key={task.id} task={task} onToggle={toggleTask} onRemove={removeTask} dimmed />
            ))}
          </>
        )}
        {tasks.length === 0 && (
          <p className="text-gray-400 text-xs text-center mt-4">No tasks yet. Add one above!</p>
        )}
      </div>

      <div className="shrink-0 text-xs text-gray-400 mt-1 border-t pt-1">
        {pending.length} remaining · {done.length} done
      </div>
    </div>
  );
}

interface TaskRowProps {
  task: import('../../types').Task;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  dimmed?: boolean;
}

function TaskRow({ task, onToggle, onRemove, dimmed }: TaskRowProps) {
  return (
    <div
      className={`flex items-center gap-2 rounded p-1 hover:bg-gray-50 group ${dimmed ? 'opacity-50' : ''}`}
    >
      <button onClick={() => onToggle(task.id)} className="shrink-0 text-indigo-500">
        {task.done ? <CheckSquare size={16} /> : <Square size={16} />}
      </button>
      <span className={`flex-1 leading-tight ${task.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>
        {task.text}
      </span>
      {task.course && (
        <span className="text-[10px] bg-indigo-100 text-indigo-600 rounded px-1">{task.course}</span>
      )}
      {task.dueDate && (
        <span className="text-[10px] text-gray-400">{task.dueDate}</span>
      )}
      <button
        onClick={() => onRemove(task.id)}
        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}
