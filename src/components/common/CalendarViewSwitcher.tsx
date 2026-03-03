import React from 'react';
import { Calendar, List, Grid, Clock } from 'lucide-react';

export type CalendarView = 'day' | 'week' | 'month' | 'agenda';

interface CalendarViewSwitcherProps {
  currentView: CalendarView;
  onViewChange: (view: CalendarView) => void;
  className?: string;
}

const CalendarViewSwitcher: React.FC<CalendarViewSwitcherProps> = ({
  currentView,
  onViewChange,
  className = '',
}) => {
  const views: Array<{ id: CalendarView; label: string; icon: React.ReactNode }> = [
    { id: 'day', label: 'Day', icon: <Clock className="w-4 h-4" /> },
    { id: 'week', label: 'Week', icon: <Grid className="w-4 h-4" /> },
    { id: 'month', label: 'Month', icon: <Calendar className="w-4 h-4" /> },
    { id: 'agenda', label: 'Agenda', icon: <List className="w-4 h-4" /> },
  ];

  return (
    <div className={`inline-flex bg-gray-100 rounded-xl p-1 ${className}`}>
      {views.map(view => (
        <button
          key={view.id}
          onClick={() => onViewChange(view.id)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
            ${
              currentView === view.id
                ? 'bg-white text-[#5B7EFF] shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }
          `}
        >
          {view.icon}
          <span className="hidden sm:inline">{view.label}</span>
        </button>
      ))}
    </div>
  );
};

export default CalendarViewSwitcher;
