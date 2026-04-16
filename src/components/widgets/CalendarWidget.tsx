import { useState } from 'react';
import { useDashboardStore } from '../../store/dashboardStore';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const EVENT_COLORS: Record<string, string> = {
  assignment: 'bg-orange-400',
  exam: 'bg-red-500',
  event: 'bg-indigo-400',
};

export default function CalendarWidget() {
  const { events, addEvent } = useDashboardStore();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newType, setNewType] = useState<'assignment' | 'exam' | 'event'>('event');

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const eventsThisMonth = events.filter((e) => {
    const d = new Date(e.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const eventsOnDay = (day: number) =>
    eventsThisMonth.filter((e) => new Date(e.date).getDate() === day);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const handleAdd = () => {
    if (!newTitle.trim() || !newDate) return;
    addEvent({ title: newTitle.trim(), date: newDate, type: newType });
    setNewTitle('');
    setNewDate('');
    setShowAddForm(false);
  };

  // Build grid cells
  const cells: (number | null)[] = [
    ...Array<null>(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="flex flex-col h-full text-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 shrink-0">
        <button onClick={prevMonth} className="p-0.5 rounded hover:bg-gray-100"><ChevronLeft size={16} /></button>
        <span className="font-semibold text-gray-700">{MONTHS[month]} {year}</span>
        <button onClick={nextMonth} className="p-0.5 rounded hover:bg-gray-100"><ChevronRight size={16} /></button>
        <button
          onClick={() => setShowAddForm(v => !v)}
          className="ml-2 text-indigo-500 hover:text-indigo-700"
          title="Add event"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Add event form */}
      {showAddForm && (
        <div className="mb-2 p-2 bg-gray-50 rounded border border-gray-200 text-xs space-y-1 shrink-0">
          <input
            className="w-full border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            placeholder="Event title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <div className="flex gap-1">
            <input
              type="date"
              className="flex-1 border rounded px-2 py-1 focus:outline-none"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
            />
            <select
              className="border rounded px-1 focus:outline-none"
              value={newType}
              onChange={(e) => setNewType(e.target.value as 'assignment' | 'exam' | 'event')}
            >
              <option value="event">Event</option>
              <option value="assignment">Assignment</option>
              <option value="exam">Exam</option>
            </select>
          </div>
          <button
            onClick={handleAdd}
            className="w-full bg-indigo-500 text-white rounded py-1 hover:bg-indigo-600"
          >
            Add
          </button>
        </div>
      )}

      {/* Day headers */}
      <div className="grid grid-cols-7 shrink-0">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-medium text-gray-400 py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 flex-1 overflow-y-auto">
        {cells.map((day, i) => {
          const isToday =
            day !== null &&
            year === today.getFullYear() &&
            month === today.getMonth() &&
            day === today.getDate();
          const dayEvents = day !== null ? eventsOnDay(day) : [];

          return (
            <div
              key={i}
              className={`min-h-[36px] border-t border-gray-100 p-0.5 ${day ? 'hover:bg-gray-50' : ''}`}
            >
              {day !== null && (
                <>
                  <span
                    className={`inline-flex items-center justify-center w-5 h-5 text-[11px] rounded-full ${
                      isToday ? 'bg-indigo-500 text-white font-bold' : 'text-gray-600'
                    }`}
                  >
                    {day}
                  </span>
                  <div className="flex flex-col gap-px mt-px">
                    {dayEvents.map((ev) => (
                      <span
                        key={ev.id}
                        title={ev.title}
                        className={`text-[9px] text-white rounded px-0.5 truncate ${EVENT_COLORS[ev.type]}`}
                      >
                        {ev.title}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
