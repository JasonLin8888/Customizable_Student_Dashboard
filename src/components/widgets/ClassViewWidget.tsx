import { useDashboardStore } from '../../store/dashboardStore';
import { BookOpen, Calendar, User } from 'lucide-react';

export default function ClassViewWidget() {
  const { courses, events, tasks } = useDashboardStore();

  return (
    <div className="flex flex-col h-full text-sm overflow-y-auto gap-2">
      {courses.map((course) => {
        const upcomingEvents = events
          .filter((e) => e.course === course.code)
          .sort((a, b) => a.date.localeCompare(b.date))
          .slice(0, 2);
        const pendingTasks = tasks.filter((t) => t.course === course.code && !t.done);

        return (
          <div
            key={course.id}
            className="rounded-lg border border-gray-100 overflow-hidden shadow-sm"
          >
            {/* Course header */}
            <div
              className="px-3 py-2 flex items-center gap-2"
              style={{ backgroundColor: course.color + '22', borderLeft: `4px solid ${course.color}` }}
            >
              <BookOpen size={14} style={{ color: course.color }} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-xs">{course.code} – {course.name}</p>
                <p className="text-[10px] text-gray-500 flex items-center gap-1">
                  <User size={10} /> {course.instructor}
                </p>
              </div>
              {pendingTasks.length > 0 && (
                <span
                  className="text-[10px] text-white rounded-full px-1.5 py-0.5"
                  style={{ backgroundColor: course.color }}
                >
                  {pendingTasks.length} task{pendingTasks.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* Upcoming events */}
            {upcomingEvents.length > 0 && (
              <div className="px-3 py-1.5 space-y-0.5">
                {upcomingEvents.map((ev) => (
                  <div key={ev.id} className="flex items-center gap-1 text-[10px] text-gray-600">
                    <Calendar size={10} className="text-gray-400 shrink-0" />
                    <span className="truncate">{ev.title}</span>
                    <span className="ml-auto text-gray-400 shrink-0">{ev.date}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
