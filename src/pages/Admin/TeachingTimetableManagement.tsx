import React, { useState, useMemo } from 'react';
import { useTimetables } from '../../context/TimetableContext';
import { useCourses } from '../../context/CourseContext';
import { useClasses } from '../../context/ClassContext';
import { useVenues } from '../../context/VenueContext';
import { useLecturers } from '../../context/LecturerContext';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Plus, Calendar, Check, X, AlertTriangle, Play, Wand2 } from 'lucide-react';
import TeachingSessionModal from '../../components/modals/TeachingSessionModal';
import { TeachingConstraintSolver } from '../../utils/constraintSolver';
import { StatusBadge } from '../../components/common/StatusBadge';

const AdminTeachingTimetable = () => {
  const { timetables, addTeachingSession, removeSession, detectConflicts, publishTimetable, conflicts } = useTimetables();
  const { courses } = useCourses();
  const { classes } = useClasses();
  const { venues } = useVenues();
  const { lecturers } = useLecturers();
  
  const [selectedTimetable, setSelectedTimetable] = useState<string>('1');
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>('monday');
  const [conflictCheck, setConflictCheck] = useState<{ hasConflict: boolean; messages: string[] } | null>(null);
  
  // Auto-generate states
  const [showAutoGenModal, setShowAutoGenModal] = useState(false);
  
  const currentTimetable = timetables.find(t => t.id === selectedTimetable && t.type === 'teaching');
  const teachingSessions = currentTimetable?.teachingSessions || [];
  
  // Get conflicts from context instead of calling detectConflicts during render
  const timetableConflicts = useMemo(() => {
    return conflicts.filter(c => 
      c.affectedSessions?.some(sessionId => 
        teachingSessions.some(s => s.id === sessionId)
      )
    );
  }, [conflicts, teachingSessions]);
  
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];
  
  const handleAddSession = (sessionData: any) => {
    if (!currentTimetable) return;
    
    addTeachingSession(currentTimetable.id, sessionData);
    setShowSessionModal(false);
  };
  
  const handleDeleteSession = (sessionId: string) => {
    if (!currentTimetable) return;
    
    if (window.confirm('Are you sure you want to delete this session?')) {
      removeSession(currentTimetable.id, sessionId);
    }
  };
  
  const handleRunConstraintCheck = () => {
    if (!currentTimetable) return;
    
    const conflicts = detectConflicts(currentTimetable.id);
    
    setConflictCheck({
      hasConflict: conflicts.length > 0,
      messages: conflicts.map(c => c.message)
    });
  };
  
  const handlePublish = () => {
    if (!currentTimetable) return;
    
    const conflicts = detectConflicts(currentTimetable.id);
    
    if (conflicts.some(c => c.severity === 'critical')) {
      alert('Cannot publish timetable with critical conflicts. Please resolve all conflicts first.');
      return;
    }
    
    if (window.confirm('Are you sure you want to publish this timetable? All users will see the updates.')) {
      publishTimetable(currentTimetable.id);
      alert('Timetable published successfully!');
    }
  };
  
  // Get sessions for a specific day and time slot
  const getSessionsForSlot = (day: string, time: string) => {
    return teachingSessions.filter(s => {
      if (s.day !== day) return false;
      
      const sessionStart = s.startTime;
      const sessionEnd = s.endTime;
      
      // Check if this time falls within the session
      return time >= sessionStart && time < sessionEnd;
    });
  };
  
  // Calculate row span for a session
  const getRowSpan = (session: any) => {
    const start = timeSlots.indexOf(session.startTime);
    const end = timeSlots.indexOf(session.endTime);
    return end - start;
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#4F4F4F]">Teaching Timetable Management</h1>
          <p className="text-[#828282] mt-1">Create and manage weekly teaching schedules</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="md"
            icon={<Play className="w-4 h-4" />}
            onClick={handleRunConstraintCheck}
          >
            Run Constraint Check
          </Button>
          
          {currentTimetable?.status !== 'published' && (
            <Button
              variant="success"
              size="md"
              icon={<Check className="w-4 h-4" />}
              onClick={handlePublish}
            >
              Publish Timetable
            </Button>
          )}
        </div>
      </div>
      
      {/* Timetable Selector */}
      <Card>
        <CardBody>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="text-sm font-semibold text-[#4F4F4F]">Select Timetable:</label>
              <select
                value={selectedTimetable}
                onChange={(e) => setSelectedTimetable(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B7EFF]/50 focus:border-[#5B7EFF] bg-[#FAFBFD]"
              >
                {timetables.filter(t => t.type === 'teaching').map(t => (
                  <option key={t.id} value={t.id}>
                    Teaching Timetable {t.academicYear} - {t.semester === 1 ? 'First' : 'Second'} Semester
                  </option>
                ))}
              </select>
              
              {currentTimetable && (
                <StatusBadge status={currentTimetable.status} />
              )}
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="md"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => setShowSessionModal(true)}
              >
                Schedule Session
              </Button>
              
              <Button
                variant="secondary"
                size="md"
                icon={<Wand2 className="w-4 h-4" />}
                onClick={() => setShowAutoGenModal(true)}
                className="bg-gradient-to-r from-[#5B7EFF] to-[#6B88FF] text-white hover:shadow-lg"
              >
                Auto-Generate
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
      
      {/* Conflict Check Results */}
      {conflictCheck && (
        <Card>
          <CardBody>
            <div className={`flex items-start gap-3 ${conflictCheck.hasConflict ? 'text-[#EB5757]' : 'text-[#6FCF97]'}`}>
              {conflictCheck.hasConflict ? (
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              ) : (
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <h3 className="font-semibold">
                  {conflictCheck.hasConflict ? 'Conflicts Detected' : 'No Conflicts'}
                </h3>
                {conflictCheck.hasConflict && (
                  <ul className="mt-2 space-y-1">
                    {conflictCheck.messages.map((msg, idx) => (
                      <li key={idx} className="text-sm">{msg}</li>
                    ))}
                  </ul>
                )}
                {!conflictCheck.hasConflict && (
                  <p className="text-sm mt-1">All sessions pass constraint validation. Ready to publish.</p>
                )}
              </div>
            </div>
          </CardBody>
        </Card>
      )}
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#828282]">Total Sessions</p>
                <p className="text-2xl font-semibold text-[#4F4F4F] mt-1">{teachingSessions.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-[#5B7EFF] to-[#7C9FFF] rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#828282]">Lectures</p>
                <p className="text-2xl font-semibold text-[#4F4F4F] mt-1">
                  {teachingSessions.filter(s => s.sessionType === 'lecture').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-[#56CCF2] to-[#2D9CDB] rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#828282]">Labs</p>
                <p className="text-2xl font-semibold text-[#4F4F4F] mt-1">
                  {teachingSessions.filter(s => s.sessionType === 'lab').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-[#6FCF97] to-[#27AE60] rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#828282]">Classes</p>
                <p className="text-2xl font-semibold text-[#4F4F4F] mt-1">
                  {new Set(teachingSessions.map(s => s.classId)).size}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-[#BB6BD9] to-[#9B51E0] rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
      
      {/* Day Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {days.map(day => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-6 py-3 font-semibold capitalize transition-all duration-200 border-b-2 ${
              selectedDay === day
                ? 'border-[#5B7EFF] text-[#5B7EFF]'
                : 'border-transparent text-[#828282] hover:text-[#4F4F4F]'
            }`}
          >
            {day}
          </button>
        ))}
      </div>
      
      {/* Timetable Grid */}
      <Card>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#4F4F4F] w-24">Time</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[#4F4F4F]">Sessions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {timeSlots.map((time, idx) => {
                  const sessions = getSessionsForSlot(selectedDay, time);
                  const isStartOfSession = sessions.some(s => s.startTime === time);
                  
                  if (!isStartOfSession && sessions.length > 0) {
                    return null; // Skip rows that are part of a multi-row session
                  }
                  
                  return (
                    <tr key={time} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-[#828282]">{time}</td>
                      <td className="px-4 py-3">
                        {isStartOfSession && sessions.length > 0 ? (
                          <div className="space-y-2">
                            {sessions.filter(s => s.startTime === time).map(session => (
                              <div
                                key={session.id}
                                className="p-4 rounded-xl border border-gray-200 bg-gradient-to-r from-[#5B7EFF]/10 to-[#7C9FFF]/10 hover:shadow-md transition-all"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-[#4F4F4F]">{session.courseName}</h4>
                                    <p className="text-sm text-[#828282] mt-1">{session.className}</p>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-[#828282]">
                                      <span>🎓 {session.lecturerName}</span>
                                      <span>📍 {session.venueName}</span>
                                      <span>⏰ {session.startTime} - {session.endTime}</span>
                                      <span className={`px-2 py-1 rounded-lg ${
                                        session.sessionType === 'lecture' 
                                          ? 'bg-blue-100 text-blue-700' 
                                          : 'bg-green-100 text-green-700'
                                      }`}>
                                        {session.sessionType}
                                      </span>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleDeleteSession(session.id)}
                                    className="text-[#EB5757] hover:bg-[#EB5757]/10 p-2 rounded-lg transition-all"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-[#828282] italic">No sessions</div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
      
      {/* Session Modal */}
      {showSessionModal && (
        <TeachingSessionModal
          onClose={() => setShowSessionModal(false)}
          onSubmit={handleAddSession}
          timetableId={currentTimetable?.id || ''}
          existingSessions={teachingSessions}
        />
      )}
    </div>
  );
};

export default AdminTeachingTimetable;