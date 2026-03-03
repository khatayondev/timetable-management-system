import React from 'react';
import { TeachingSession, ExamSession } from '../../context/TimetableContext';
import { Calendar, Clock, MapPin, User } from 'lucide-react';

interface DailyViewProps {
  date: Date;
  sessions: (TeachingSession | ExamSession)[];
  type: 'teaching' | 'exam';
  onSessionClick?: (session: TeachingSession | ExamSession) => void;
}

const DailyView: React.FC<DailyViewProps> = ({ date, sessions, type, onSessionClick }) => {
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  
  // Handle undefined sessions
  if (!sessions || !Array.isArray(sessions)) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-[#4F4F4F] mb-2">No Sessions Available</h3>
        <p className="text-[#828282]">No sessions found for the selected date.</p>
      </div>
    );
  }
  
  // Filter sessions for the selected day
  const daySessions = type === 'teaching'
    ? (sessions as TeachingSession[]).filter(s => s.day === dayName)
    : (sessions as ExamSession[]).filter(s => s.date === date.toISOString().split('T')[0]);

  // Sort by start time
  const sortedSessions = daySessions.sort((a, b) => 
    a.startTime.localeCompare(b.startTime)
  );

  const timeSlots = generateTimeSlots();

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#5B7EFF] to-[#6B88FF] rounded-xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-[#4F4F4F]">
              {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </h3>
            <p className="text-sm text-[#828282]">{sortedSessions.length} {type === 'teaching' ? 'sessions' : 'exams'} scheduled</p>
          </div>
        </div>
      </div>

      {/* Time grid */}
      <div className="space-y-1">
        {timeSlots.map((slot) => {
          const slotSessions = sortedSessions.filter(s => 
            s.startTime <= slot.time && s.endTime > slot.time
          );

          return (
            <div key={slot.time} className="flex gap-4 min-h-16 border-b border-gray-100 last:border-0">
              {/* Time column */}
              <div className="w-20 flex-shrink-0 pt-2">
                <span className="text-sm font-medium text-[#828282]">{slot.time}</span>
              </div>

              {/* Sessions column */}
              <div className="flex-1 py-2 space-y-2">
                {slotSessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    type={type}
                    onClick={() => onSessionClick?.(session)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {sortedSessions.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-[#828282]">No {type === 'teaching' ? 'sessions' : 'exams'} scheduled for this day</p>
        </div>
      )}
    </div>
  );
};

const SessionCard: React.FC<{
  session: TeachingSession | ExamSession;
  type: 'teaching' | 'exam';
  onClick?: () => void;
}> = ({ session, type, onClick }) => {
  const isExam = type === 'exam';
  const examSession = isExam ? session as ExamSession : null;
  const teachingSession = !isExam ? session as TeachingSession : null;

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-xl border-l-4 ${
        isExam 
          ? 'bg-gradient-to-r from-red-50 to-orange-50 border-[#EB5757]'
          : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-[#5B7EFF]'
      } hover:shadow-md transition-all duration-200 cursor-pointer`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-[#4F4F4F] truncate">
            {session.courseName}
          </h4>
          <p className="text-sm text-[#828282] mt-1">{session.className}</p>
          
          <div className="flex flex-wrap gap-4 mt-3 text-sm text-[#4F4F4F]">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#828282]" />
              <span>{session.startTime} - {session.endTime}</span>
            </div>
            
            {!isExam && teachingSession && (
              <>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#828282]" />
                  <span>{teachingSession.venueName}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#828282]" />
                  <span>{teachingSession.lecturerName}</span>
                </div>
              </>
            )}
            
            {isExam && examSession && (
              <>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#828282]" />
                  <span>{examSession.venueAllocations.map(v => v.venueName).join(', ')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#828282]" />
                  <span>{examSession.studentCount} students</span>
                </div>
              </>
            )}
          </div>
        </div>
        
        {!isExam && teachingSession && (
          <span className="px-3 py-1 bg-white rounded-lg text-xs font-medium text-[#5B7EFF] capitalize">
            {teachingSession.sessionType}
          </span>
        )}
        
        {isExam && examSession && (
          <span className="px-3 py-1 bg-white rounded-lg text-xs font-medium text-[#EB5757] capitalize">
            {examSession.examType}
          </span>
        )}
      </div>
    </div>
  );
};

function generateTimeSlots(): Array<{ time: string }> {
  const slots = [];
  for (let hour = 8; hour <= 18; hour++) {
    slots.push({ time: `${String(hour).padStart(2, '0')}:00` });
  }
  return slots;
}

export default DailyView;