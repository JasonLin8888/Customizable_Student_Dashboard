import { useDashboardStore } from '../../store/dashboardStore';
import { Mail, MailOpen, ListTodo } from 'lucide-react';

export default function InboxWidget() {
  const { emails, markEmailRead, addTaskFromEmail } = useDashboardStore();

  return (
    <div className="flex flex-col h-full text-sm overflow-hidden">
      <div className="flex items-center justify-between mb-2 shrink-0">
        <span className="text-xs text-gray-500">
          {emails.filter((e) => !e.read).length} unread
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 pr-1">
        {emails.map((email) => (
          <div
            key={email.id}
            className={`rounded border p-2 cursor-pointer hover:border-indigo-300 transition-colors ${
              email.read ? 'border-gray-100 bg-gray-50 opacity-80' : 'border-indigo-200 bg-white'
            }`}
            onClick={() => markEmailRead(email.id)}
          >
            <div className="flex items-center gap-2">
              {email.read ? (
                <MailOpen size={14} className="text-gray-400 shrink-0" />
              ) : (
                <Mail size={14} className="text-indigo-500 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className={`truncate text-xs font-medium ${email.read ? 'text-gray-500' : 'text-gray-800'}`}>
                  {email.subject}
                </p>
                <p className="text-[10px] text-gray-400 truncate">{email.from}</p>
              </div>
              <span className="text-[10px] text-gray-400 shrink-0">{email.date}</span>
              <button
                title="Convert to task"
                onClick={(e) => { e.stopPropagation(); addTaskFromEmail(email.id); }}
                className="shrink-0 text-indigo-400 hover:text-indigo-600"
              >
                <ListTodo size={14} />
              </button>
            </div>
            {!email.read && (
              <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">{email.body}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
