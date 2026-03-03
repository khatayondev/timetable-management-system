import React, { useState } from 'react';
import { TeachingSession, ExamSession } from '../../context/TimetableContext';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface MonthlyViewProps {
  sessions: (TeachingSession | ExamSession)[];
  type: 'teaching' | 'exam';
  onSessionClick?: (session: TeachingSession | ExamSession) => void;
  initialDate?: Date;
}

const MonthlyView: React.FC<MonthlyViewProps> = ({ 
  sessions, 
  type, 
  onSessionClick,
  initialDate = new Date() 
}) => {
  const [currentDate, setCurrentDate] = useState(initialDate);

  // Handle undefined sessions
  if (!sessions || !Array.isArray(sessions)) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-[#4F4F4F] mb-2">No Sessions Available</h3>
        <p className="text-[#828282]">No sessions found for the selected month.</p>
      </div>
    );
  }

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startingDayOfWeek = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Generate calendar days
  const calendarDays: Array<{ date: number | null; sessions: (TeachingSession | ExamSession)[] }> = [];
  
  // Add empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push({ date: null, sessions: [] });
  }

  // Add days of month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateStr = date.toISOString().split('T')[0];
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

    let daySessions: (TeachingSession | ExamSession)[] = [];

    if (type === 'teaching') {
      // For teaching, show sessions that recur on this day of week
      daySessions = (sessions as TeachingSession[]).filter(s => s.day === dayName);
    } else {
      // For exams, show sessions on this specific date
      daySessions = (sessions as ExamSession[]).filter(s => s.date === dateStr);
    }

    calendarDays.push({ date: day, sessions: daySessions });
  }

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#5B7EFF] to-[#6B88FF] px-6 py-4 flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">{monthName}</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4 md:p-6">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center py-2">
              <span className="text-sm font-semibold text-[#828282]">{day}</span>
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, index) => (
            <CalendarDay
              key={index}
              date={day.date}
              sessions={day.sessions}
              type={type}
              onClick={onSessionClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const CalendarDay: React.FC<{
  date: number | null;
  sessions: (TeachingSession | ExamSession)[];
  type: 'teaching' | 'exam';
  onClick?: (session: TeachingSession | ExamSession) => void;
}> = ({ date, sessions, type, onClick }) => {
  if (date === null) {
    return <div className="aspect-square" />;
  }

  const isToday = false; // Could implement actual today check

  return (
    <div
      className={`aspect-square border border-gray-200 rounded-lg p-1 md:p-2 hover:border-[#5B7EFF] transition-all ${
        isToday ? 'bg-[#E8EAF6] border-[#5B7EFF]' : 'bg-white'
      }`}
    >
      <div className="h-full flex flex-col">
        <div className={`text-sm md:text-base font-semibold mb-1 ${
          isToday ? 'text-[#5B7EFF]' : 'text-[#4F4F4F]'
        }`}>
          {date}
        </div>
        
        <div className="flex-1 overflow-hidden">
          {sessions.length > 0 && (
            <div className="space-y-0.5">
              {sessions.slice(0, 3).map((session, idx) => (
                <div
                  key={session.id}
                  onClick={() => onClick?.(session)}
                  className={`text-xs px-1.5 py-0.5 rounded cursor-pointer truncate ${
                    type === 'exam'
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                  title={session.courseName}
                >
                  {session.courseName.substring(0, 15)}...
                </div>
              ))}
              {sessions.length > 3 && (
                <div className="text-xs text-[#828282] px-1.5">
                  +{sessions.length - 3} more
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MonthlyView;