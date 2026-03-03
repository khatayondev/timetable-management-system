import React from 'react';
import { TeachingSession } from '../../context/TimetableContext';
import { AttendanceType } from '../../context/ClassContext';
import { Clock, MapPin, User } from 'lucide-react';

interface WeeklyViewProps {
  sessions: TeachingSession[];
  onSessionClick?: (session: TeachingSession) => void;
  attendanceType?: AttendanceType; // Optional: filter days by attendance type
  showAllDays?: boolean; // Admin can see full week
}

const WeeklyView: React.FC<WeeklyViewProps> = ({ 
  sessions, 
  onSessionClick,
  attendanceType,
  showAllDays = false
}) => {
  // Determine which days to show
  const getWeekDays = (): string[] => {
    if (showAllDays) {
      return ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    }
    
    if (attendanceType === 'WEEKEND') {
      return ['saturday', 'sunday'];
    }
    
    // Default to REGULAR (weekdays)
    return ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  };

  const weekDays = getWeekDays();
  const timeSlots = generateTimeSlots();

  // Handle undefined sessions
  if (!sessions || !Array.isArray(sessions)) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-[#4F4F4F] mb-2">No Sessions Available</h3>
        <p className="text-[#828282]">No sessions found for the selected week.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#5B7EFF] to-[#6B88FF] px-6 py-4">
        <h3 className="text-xl font-semibold text-white">Weekly Teaching Schedule</h3>
      </div>

      {/* Desktop View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wide bg-white sticky left-0 z-10">
                Time
              </th>
              {weekDays.map((day) => (
                <th
                  key={day}
                  className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wide"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((slot, idx) => (
              <tr key={slot.start} className={idx % 2 === 0 ? 'bg-gray-50/30' : 'bg-white'}>
                <td className="p-3 border-b border-gray-200 sticky left-0 bg-inherit z-10">
                  <div className="text-sm font-medium text-[#828282]">
                    {slot.start}
                  </div>
                </td>
                {weekDays.map(day => {
                  const daySessions = sessions.filter(s => 
                    s.day === day &&
                    s.startTime === slot.start
                  );

                  return (
                    <td key={day} className="p-2 border-b border-gray-200 align-top">
                      {daySessions.map(session => (
                        <div
                          key={session.id}
                          onClick={() => onSessionClick?.(session)}
                          className="mb-2 last:mb-0 p-3 rounded-lg bg-gradient-to-br from-[#E8EAF6] to-[#E3F2FD] border border-[#5B7EFF]/20 hover:shadow-md transition-all duration-200 cursor-pointer"
                        >
                          <h4 className="font-semibold text-[#4F4F4F] text-sm mb-1 truncate">
                            {session.courseName}
                          </h4>
                          <p className="text-xs text-[#828282] mb-2 truncate">{session.className}</p>
                          
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs text-[#4F4F4F]">
                              <Clock className="w-3 h-3 text-[#828282] flex-shrink-0" />
                              <span className="truncate">{session.startTime}-{session.endTime}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-[#4F4F4F]">
                              <MapPin className="w-3 h-3 text-[#828282] flex-shrink-0" />
                              <span className="truncate">{session.venueName}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-[#4F4F4F]">
                              <User className="w-3 h-3 text-[#828282] flex-shrink-0" />
                              <span className="truncate">{session.lecturerName}</span>
                            </div>
                          </div>

                          <span className="inline-block mt-2 px-2 py-0.5 bg-white/60 rounded text-xs font-medium text-[#5B7EFF] capitalize">
                            {session.sessionType}
                          </span>
                        </div>
                      ))}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="lg:hidden p-4 space-y-4">
        {weekDays.map(day => {
          const daySessions = sessions.filter(s => s.day === day).sort((a, b) => 
            a.startTime.localeCompare(b.startTime)
          );

          return (
            <div key={day} className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-gradient-to-r from-[#5B7EFF] to-[#6B88FF] px-4 py-3">
                <h4 className="text-white font-semibold capitalize">{day}</h4>
              </div>
              <div className="p-4 space-y-3">
                {daySessions.length === 0 ? (
                  <p className="text-sm text-[#828282] text-center py-4">No sessions</p>
                ) : (
                  daySessions.map(session => (
                    <div
                      key={session.id}
                      onClick={() => onSessionClick?.(session)}
                      className="p-3 rounded-lg bg-gradient-to-br from-[#E8EAF6] to-[#E3F2FD] border border-[#5B7EFF]/20"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h5 className="font-semibold text-[#4F4F4F] text-sm flex-1">
                          {session.courseName}
                        </h5>
                        <span className="px-2 py-0.5 bg-white rounded text-xs font-medium text-[#5B7EFF] capitalize flex-shrink-0">
                          {session.sessionType}
                        </span>
                      </div>
                      <p className="text-xs text-[#828282] mb-2">{session.className}</p>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-[#4F4F4F]">
                          <Clock className="w-3 h-3 text-[#828282]" />
                          <span>{session.startTime} - {session.endTime}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-[#4F4F4F]">
                          <MapPin className="w-3 h-3 text-[#828282]" />
                          <span>{session.venueName}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-[#4F4F4F]">
                          <User className="w-3 h-3 text-[#828282]" />
                          <span>{session.lecturerName}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

function generateTimeSlots(): Array<{ start: string; end: string }> {
  return [
    { start: '08:00', end: '10:00' },
    { start: '10:00', end: '12:00' },
    { start: '12:00', end: '14:00' },
    { start: '14:00', end: '16:00' },
    { start: '16:00', end: '18:00' },
  ];
}

export default WeeklyView;