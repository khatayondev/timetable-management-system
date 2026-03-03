import React, { useState } from 'react';
import { TeachingSession, ExamSession } from '../../context/TimetableContext';
import { Calendar, Clock, MapPin, User, BookOpen, Filter } from 'lucide-react';

interface ListViewProps {
  sessions: (TeachingSession | ExamSession)[];
  type: 'teaching' | 'exam';
  onSessionClick?: (session: TeachingSession | ExamSession) => void;
  dateRange?: { start: Date; end: Date };
}

const ListView: React.FC<ListViewProps> = ({ 
  sessions, 
  type, 
  onSessionClick,
  dateRange 
}) => {
  const [groupBy, setGroupBy] = useState<'date' | 'course' | 'venue'>('date');
  
  // Handle undefined sessions
  if (!sessions || !Array.isArray(sessions)) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-[#4F4F4F] mb-2">No Sessions Available</h3>
        <p className="text-[#828282]">No sessions found.</p>
      </div>
    );
  }

  // Generate chronological list
  const getSessionsList = () => {
    if (type === 'teaching') {
      return generateTeachingList(sessions as TeachingSession[], dateRange);
    } else {
      return generateExamList(sessions as ExamSession[], dateRange);
    }
  };

  const sessionsList = getSessionsList();
  const groupedSessions = groupSessions(sessionsList, groupBy, type);

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#5B7EFF] to-[#6B88FF] px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">Agenda View</h3>
          
          {/* Group By Selector */}
          <div className="flex items-center gap-2 bg-white/20 rounded-lg p-1">
            <button
              onClick={() => setGroupBy('date')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                groupBy === 'date' ? 'bg-white text-[#5B7EFF]' : 'text-white'
              }`}
            >
              By Date
            </button>
            <button
              onClick={() => setGroupBy('course')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                groupBy === 'course' ? 'bg-white text-[#5B7EFF]' : 'text-white'
              }`}
            >
              By Course
            </button>
            <button
              onClick={() => setGroupBy('venue')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                groupBy === 'venue' ? 'bg-white text-[#5B7EFF]' : 'text-white'
              }`}
            >
              By Venue
            </button>
          </div>
        </div>
      </div>

      {/* Agenda List */}
      <div className="max-h-[700px] overflow-y-auto">
        {Object.entries(groupedSessions).length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-[#828282]">No {type === 'teaching' ? 'sessions' : 'exams'} scheduled</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {Object.entries(groupedSessions).map(([groupKey, groupSessions]) => (
              <div key={groupKey} className="p-6">
                {/* Group Header */}
                <h4 className="font-semibold text-[#4F4F4F] mb-4 flex items-center gap-2">
                  {groupBy === 'date' && <Calendar className="w-5 h-5 text-[#5B7EFF]" />}
                  {groupBy === 'course' && <BookOpen className="w-5 h-5 text-[#5B7EFF]" />}
                  {groupBy === 'venue' && <MapPin className="w-5 h-5 text-[#5B7EFF]" />}
                  {groupKey}
                </h4>

                {/* Sessions in Group */}
                <div className="space-y-3">
                  {groupSessions.map((session) => (
                    <AgendaSessionCard
                      key={session.id}
                      session={session}
                      type={type}
                      onClick={() => onSessionClick?.(session)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const AgendaSessionCard: React.FC<{
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
      className={`p-4 rounded-xl border-l-4 cursor-pointer hover:shadow-md transition-all duration-200 ${
        isExam 
          ? 'bg-gradient-to-r from-red-50 to-orange-50 border-[#EB5757] hover:border-[#D44545]'
          : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-[#5B7EFF] hover:border-[#4A4EEE]'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Course Name */}
          <h5 className="font-semibold text-[#4F4F4F] text-lg mb-2">
            {session.courseName}
          </h5>

          {/* Class */}
          <p className="text-sm text-[#828282] mb-3">{session.className}</p>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {/* Time */}
            <div className="flex items-center gap-2 text-[#4F4F4F]">
              <Clock className="w-4 h-4 text-[#828282]" />
              <span>{session.startTime} - {session.endTime}</span>
            </div>

            {/* Date/Day */}
            {isExam && examSession ? (
              <div className="flex items-center gap-2 text-[#4F4F4F]">
                <Calendar className="w-4 h-4 text-[#828282]" />
                <span>{new Date(examSession.date).toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}</span>
              </div>
            ) : teachingSession && (
              <div className="flex items-center gap-2 text-[#4F4F4F]">
                <Calendar className="w-4 h-4 text-[#828282]" />
                <span className="capitalize">{teachingSession.day}</span>
              </div>
            )}

            {/* Venue */}
            {!isExam && teachingSession && (
              <div className="flex items-center gap-2 text-[#4F4F4F]">
                <MapPin className="w-4 h-4 text-[#828282]" />
                <span>{teachingSession.venueName}</span>
              </div>
            )}

            {isExam && examSession && (
              <div className="flex items-center gap-2 text-[#4F4F4F]">
                <MapPin className="w-4 h-4 text-[#828282]" />
                <span>{examSession.venueAllocations.length} venue(s)</span>
              </div>
            )}

            {/* Lecturer/Students */}
            {!isExam && teachingSession && (
              <div className="flex items-center gap-2 text-[#4F4F4F]">
                <User className="w-4 h-4 text-[#828282]" />
                <span>{teachingSession.lecturerName}</span>
              </div>
            )}

            {isExam && examSession && (
              <div className="flex items-center gap-2 text-[#4F4F4F]">
                <User className="w-4 h-4 text-[#828282]" />
                <span>{examSession.studentCount} students</span>
              </div>
            )}
          </div>
        </div>

        {/* Badge */}
        <div>
          {!isExam && teachingSession && (
            <span className="px-3 py-1.5 bg-white rounded-lg text-xs font-medium text-[#5B7EFF] capitalize shadow-sm">
              {teachingSession.sessionType}
            </span>
          )}
          
          {isExam && examSession && (
            <span className="px-3 py-1.5 bg-white rounded-lg text-xs font-medium text-[#EB5757] capitalize shadow-sm">
              {examSession.examType}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper functions
function generateTeachingList(
  sessions: TeachingSession[], 
  dateRange?: { start: Date; end: Date }
): TeachingSession[] {
  // For teaching sessions, generate instances for the next 30 days
  const days = 30;
  const instances: TeachingSession[] = [];
  const today = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    const daySessions = sessions.filter(s => s.day === dayName);
    instances.push(...daySessions);
  }
  
  return instances.sort((a, b) => a.startTime.localeCompare(b.startTime));
}

function generateExamList(
  sessions: ExamSession[], 
  dateRange?: { start: Date; end: Date }
): ExamSession[] {
  return sessions.sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.startTime.localeCompare(b.startTime);
  });
}

function groupSessions(
  sessions: (TeachingSession | ExamSession)[],
  groupBy: 'date' | 'course' | 'venue',
  type: 'teaching' | 'exam'
): Record<string, (TeachingSession | ExamSession)[]> {
  const grouped: Record<string, (TeachingSession | ExamSession)[]> = {};

  sessions.forEach(session => {
    let key: string;
    
    if (groupBy === 'date') {
      if (type === 'exam') {
        const examSession = session as ExamSession;
        key = new Date(examSession.date).toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'long', 
          day: 'numeric', 
          year: 'numeric' 
        });
      } else {
        const teachingSession = session as TeachingSession;
        key = teachingSession.day.charAt(0).toUpperCase() + teachingSession.day.slice(1);
      }
    } else if (groupBy === 'course') {
      key = session.courseName;
    } else { // venue
      if (type === 'exam') {
        const examSession = session as ExamSession;
        key = examSession.venueAllocations.map(v => v.venueName).join(', ') || 'No Venue';
      } else {
        const teachingSession = session as TeachingSession;
        key = teachingSession.venueName;
      }
    }

    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(session);
  });

  return grouped;
}

export default ListView;