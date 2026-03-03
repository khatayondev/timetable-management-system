import React, { useState, useMemo } from 'react';
import { useTimetables } from '../../context/TimetableContext';
import { useCourses } from '../../context/CourseContext';
import { useClasses } from '../../context/ClassContext';
import { useVenues } from '../../context/VenueContext';
import { useLecturers } from '../../context/LecturerContext';
import { useInvigilation } from '../../context/InvigilationContext';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { 
  Plus, Calendar, Check, X, AlertTriangle, Play, Users, 
  Building2, ClipboardList, Download, Clock, User, CalendarCheck, BookOpen, Sparkles, ChevronDown 
} from 'lucide-react';
import TeachingSessionModal from '../../components/modals/TeachingSessionModal';
import ExamSessionModal from '../../components/modals/ExamSessionModal';

const TimetableManagement = () => {
  const { timetables, addTeachingSession, addExamSession, removeSession, detectConflicts, publishTimetable, conflicts } = useTimetables();
  const { courses } = useCourses();
  const { classes } = useClasses();
  const { venues } = useVenues();
  const { lecturers } = useLecturers();
  const { rosters, assignments, approveRoster, autoGenerateInvigilationRoster } = useInvigilation();
  
  const [activeTab, setActiveTab] = useState<'teaching' | 'exam' | 'invigilation'>('teaching');
  const [selectedTimetable, setSelectedTimetable] = useState<string>('1');
  const [selectedExamTimetable, setSelectedExamTimetable] = useState<string>('2');
  const [selectedRoster, setSelectedRoster] = useState<string | null>(null);
  const [showTeachingModal, setShowTeachingModal] = useState(false);
  const [showExamModal, setShowExamModal] = useState(false);
  const [conflictCheck, setConflictCheck] = useState<{ hasConflict: boolean; messages: string[] } | null>(null);
  const [showAutoGenDropdown, setShowAutoGenDropdown] = useState(false);
  const [showExamAutoGenDropdown, setShowExamAutoGenDropdown] = useState(false);
  const [examConflictCheck, setExamConflictCheck] = useState<{ hasConflict: boolean; messages: string[] } | null>(null);

  // Teaching Timetable Data
  const currentTeachingTimetable = timetables.find(t => t.id === selectedTimetable && t.type === 'teaching');
  const teachingSessions = currentTeachingTimetable?.teachingSessions || [];

  // Exam Timetable Data
  const currentExamTimetable = timetables.find(t => t.id === selectedExamTimetable && t.type === 'exam');
  const examSessions = currentExamTimetable?.examSessions || [];

  // Invigilation Data
  const getLecturerName = (lecturerId: string) => {
    const lecturer = lecturers.find(l => l.id === lecturerId);
    return lecturer ? `${lecturer.firstName} ${lecturer.lastName}` : 'Unknown';
  };

  const activeRoster = rosters.find(r => selectedRoster ? r.id === selectedRoster : r.status === 'approved') || rosters[0];
  const rosterAssignments = activeRoster ? assignments.filter(a => activeRoster.assignments.includes(a.id)) : [];

  // Get conflicts
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

  // Exam sessions grouped by date
  const sessionsByDate = examSessions.reduce((acc, session) => {
    if (!acc[session.date]) {
      acc[session.date] = [];
    }
    acc[session.date].push(session);
    return acc;
  }, {} as Record<string, typeof examSessions>);
  
  const dates = Object.keys(sessionsByDate).sort();

  // Calculate exam statistics
  const totalStudents = examSessions.reduce((sum, s) => sum + s.studentCount, 0);
  const uniqueClasses = new Set(examSessions.map(s => s.classId)).size;
  const totalBatches = examSessions.reduce((sum, s) => sum + (s.totalBatches || 1), 0);

  // Handlers
  const handleAddTeachingSession = (sessionData: any) => {
    if (!currentTeachingTimetable) return;
    addTeachingSession(currentTeachingTimetable.id, sessionData);
    setShowTeachingModal(false);
  };

  const handleAddExamSession = (sessionData: any) => {
    if (!currentExamTimetable) return;
    addExamSession(currentExamTimetable.id, sessionData);
    setShowExamModal(false);
  };

  const handleDeleteSession = (sessionId: string) => {
    const timetableId = activeTab === 'teaching' ? currentTeachingTimetable?.id : currentExamTimetable?.id;
    if (!timetableId) return;
    
    if (window.confirm('Are you sure you want to delete this session?')) {
      removeSession(timetableId, sessionId);
    }
  };

  const handleRunConstraintCheck = () => {
    if (!currentTeachingTimetable) return;
    const conflicts = detectConflicts(currentTeachingTimetable.id);
    
    setConflictCheck({
      hasConflict: conflicts.length > 0,
      messages: conflicts.map(c => c.message)
    });
  };

  const handleRunExamConstraintCheck = () => {
    if (!currentExamTimetable) return;
    const conflicts = detectConflicts(currentExamTimetable.id);
    
    setExamConflictCheck({
      hasConflict: conflicts.length > 0,
      messages: conflicts.map(c => c.message)
    });
  };

  const handlePublish = () => {
    const timetable = activeTab === 'teaching' ? currentTeachingTimetable : currentExamTimetable;
    if (!timetable) return;
    
    if (activeTab === 'teaching') {
      const conflicts = detectConflicts(timetable.id);
      if (conflicts.some(c => c.severity === 'critical')) {
        alert('Cannot publish timetable with critical conflicts. Please resolve all conflicts first.');
        return;
      }
    } else {
      const hasUnassignedInvigilators = examSessions.some(s => s.invigilators.length === 0);
      if (hasUnassignedInvigilators) {
        alert('Cannot publish: Some exam sessions do not have assigned invigilators.');
        return;
      }
    }
    
    if (window.confirm('Are you sure you want to publish this timetable? All users will see the updates.')) {
      publishTimetable(timetable.id);
      alert('Timetable published successfully!');
    }
  };

  // Get sessions for a specific day and time slot
  const getSessionsForSlot = (day: string, time: string) => {
    return teachingSessions.filter(s => {
      if (s.day !== day) return false;
      const sessionStart = s.startTime;
      const sessionEnd = s.endTime;
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
    <div className="space-y-4 md:space-y-6 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="px-1">
          <h1 className="text-xl md:text-2xl font-semibold text-[#2F2E41]">Timetable Management</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">Manage teaching schedules, exams, and invigilation rosters</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {activeTab === 'teaching' && (
            <>
              <Button
                variant="secondary"
                size="md"
                icon={<Play className="w-4 h-4" />}
                onClick={handleRunConstraintCheck}
                className="flex-1 sm:flex-none"
              >
                <span className="hidden sm:inline">Run Constraint Check</span>
                <span className="sm:hidden">Check</span>
              </Button>
              {currentTeachingTimetable?.status !== 'published' && (
                <Button
                  variant="success"
                  size="md"
                  icon={<Check className="w-4 h-4" />}
                  onClick={handlePublish}
                  className="flex-1 sm:flex-none"
                >
                  Publish
                </Button>
              )}
            </>
          )}
          
          {activeTab === 'exam' && (
            <>
              <Button
                variant="secondary"
                size="md"
                icon={<Play className="w-4 h-4" />}
                onClick={handleRunExamConstraintCheck}
                className="flex-1 sm:flex-none"
              >
                <span className="hidden sm:inline">Run Constraint Check</span>
                <span className="sm:hidden">Check</span>
              </Button>
              {currentExamTimetable?.status !== 'published' && (
                <Button
                  variant="success"
                  size="md"
                  icon={<Check className="w-4 h-4" />}
                  onClick={handlePublish}
                  className="flex-1 sm:flex-none"
                >
                  Publish
                </Button>
              )}
            </>
          )}

          {activeTab === 'invigilation' && (
            <>
              <Button 
                variant="secondary" 
                onClick={() => autoGenerateInvigilationRoster([])}
                icon={<ClipboardList className="w-4 h-4" />}
                className="flex-1 sm:flex-none"
              >
                <span className="hidden sm:inline">Auto-Generate</span>
                <span className="sm:hidden">Generate</span>
              </Button>
              <Button icon={<Download className="w-4 h-4" />} className="flex-1 sm:flex-none">
                Export
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 sm:gap-2 border-b border-gray-200 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setActiveTab('teaching')}
          className={`px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm md:text-base font-semibold transition-all duration-200 border-b-2 flex items-center gap-1 sm:gap-2 whitespace-nowrap flex-shrink-0 ${
            activeTab === 'teaching'
              ? 'border-[#5B7EFF] text-[#5B7EFF]'
              : 'border-transparent text-[#828282] hover:text-[#4F4F4F]'
          }`}
        >
          <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Teaching Schedule</span>
          <span className="sm:hidden">Teaching</span>
        </button>
        <button
          onClick={() => setActiveTab('exam')}
          className={`px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm md:text-base font-semibold transition-all duration-200 border-b-2 flex items-center gap-1 sm:gap-2 whitespace-nowrap flex-shrink-0 ${
            activeTab === 'exam'
              ? 'border-[#5B7EFF] text-[#5B7EFF]'
              : 'border-transparent text-[#828282] hover:text-[#4F4F4F]'
          }`}
        >
          <CalendarCheck className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Exam Schedule</span>
          <span className="sm:hidden">Exams</span>
        </button>
        <button
          onClick={() => setActiveTab('invigilation')}
          className={`px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm md:text-base font-semibold transition-all duration-200 border-b-2 flex items-center gap-1 sm:gap-2 whitespace-nowrap flex-shrink-0 ${
            activeTab === 'invigilation'
              ? 'border-[#5B7EFF] text-[#5B7EFF]'
              : 'border-transparent text-[#828282] hover:text-[#4F4F4F]'
          }`}
        >
          <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Invigilation Roster</span>
          <span className="sm:hidden">Roster</span>
        </button>
      </div>

      {/* Teaching Schedule Content */}
      {activeTab === 'teaching' && (
        <>
          {/* Timetable Selector */}
          <Card>
            <CardBody>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <label className="text-sm font-semibold text-[#4F4F4F] whitespace-nowrap">Select Timetable:</label>
                  <select
                    value={selectedTimetable}
                    onChange={(e) => setSelectedTimetable(e.target.value)}
                    className="w-full sm:w-auto px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B7EFF]/50 focus:border-[#5B7EFF] bg-[#FAFBFD] text-sm"
                  >
                    {timetables.filter(t => t.type === 'teaching').map(t => (
                      <option key={t.id} value={t.id}>
                        Teaching Timetable {t.academicYear} - {t.semester === 1 ? 'First' : 'Second'} Semester
                      </option>
                    ))}
                  </select>
                  
                  {currentTeachingTimetable && (
                    <StatusBadge status={currentTeachingTimetable.status} />
                  )}
                </div>
                
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Auto-Generate Button with Dropdown */}
                  <div className="relative flex-1 sm:flex-none">
                    <Button
                      variant="secondary"
                      size="md"
                      icon={<Sparkles className="w-4 h-4" />}
                      onClick={() => setShowAutoGenDropdown(!showAutoGenDropdown)}
                      className="w-full sm:w-auto"
                    >
                      <span className="hidden sm:inline">Auto-Generate</span>
                      <span className="sm:hidden">Generate</span>
                      <ChevronDown className="w-4 h-4 ml-1" />
                    </Button>
                    
                    {showAutoGenDropdown && (
                      <>
                        {/* Backdrop */}
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setShowAutoGenDropdown(false)}
                        />
                        
                        {/* Dropdown Menu */}
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-20">
                          <button
                            onClick={() => {
                              alert('Auto-generating timetable for all classes...');
                              setShowAutoGenDropdown(false);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-[#4F4F4F] hover:bg-[#5B7EFF]/10 hover:text-[#5B7EFF] transition-colors flex items-center gap-2"
                          >
                            <Users className="w-4 h-4" />
                            Class
                          </button>
                          <button
                            onClick={() => {
                              alert('Auto-generating timetable for all departments...');
                              setShowAutoGenDropdown(false);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-[#4F4F4F] hover:bg-[#5B7EFF]/10 hover:text-[#5B7EFF] transition-colors flex items-center gap-2"
                          >
                            <BookOpen className="w-4 h-4" />
                            Department
                          </button>
                          <button
                            onClick={() => {
                              alert('Auto-generating timetable for all faculties...');
                              setShowAutoGenDropdown(false);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-[#4F4F4F] hover:bg-[#5B7EFF]/10 hover:text-[#5B7EFF] transition-colors flex items-center gap-2"
                          >
                            <Building2 className="w-4 h-4" />
                            Faculty
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <Button
                    variant="primary"
                    size="md"
                    icon={<Plus className="w-4 h-4" />}
                    onClick={() => setShowTeachingModal(true)}
                    className="flex-1 sm:flex-none"
                  >
                    <span className="hidden sm:inline">Schedule Session</span>
                    <span className="sm:hidden">Schedule</span>
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Conflict Alert */}
          {conflictCheck && (
            <Card>
              <CardBody>
                <div className={`p-4 rounded-xl ${
                  conflictCheck.hasConflict 
                    ? 'bg-red-50 border border-red-200' 
                    : 'bg-green-50 border border-green-200'
                }`}>
                  <div className="flex items-center gap-3 mb-2">
                    {conflictCheck.hasConflict ? (
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    ) : (
                      <Check className="w-5 h-5 text-green-600" />
                    )}
                    <h3 className={`font-semibold ${
                      conflictCheck.hasConflict ? 'text-red-700' : 'text-green-700'
                    }`}>
                      {conflictCheck.hasConflict ? 'Conflicts Detected' : 'No Conflicts Found'}
                    </h3>
                  </div>
                  {conflictCheck.messages.length > 0 && (
                    <ul className="list-disc list-inside space-y-1 text-sm text-[#4F4F4F]">
                      {conflictCheck.messages.map((msg, idx) => (
                        <li key={idx}>{msg}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Calendar Grid */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-[#4F4F4F]">Weekly Schedule</h2>
            </CardHeader>
            <CardBody className="p-0 overflow-auto">
              <div className="min-w-[1000px]">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-[#5B7EFF] to-[#6B88FF]">
                      <th className="p-3 text-left text-white font-semibold border border-white/20">Time</th>
                      {days.map(day => (
                        <th key={day} className="p-3 text-center text-white font-semibold border border-white/20 capitalize">
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map((time, timeIndex) => (
                      <tr key={time} className="border-b border-gray-200">
                        <td className="p-3 font-medium text-[#4F4F4F] bg-gray-50 border-r border-gray-200">
                          {time}
                        </td>
                        {days.map(day => {
                          const sessions = getSessionsForSlot(day, time);
                          const firstSessionInSlot = sessions.find(s => s.startTime === time);
                          
                          if (firstSessionInSlot) {
                            const rowSpan = getRowSpan(firstSessionInSlot);
                            const course = courses.find(c => c.id === firstSessionInSlot.courseId);
                            const venue = venues.find(v => v.id === firstSessionInSlot.venueId);
                            const classData = classes.find(c => c.id === firstSessionInSlot.classId);
                            
                            return (
                              <td
                                key={day}
                                rowSpan={rowSpan}
                                className="p-2 border border-gray-200 align-top"
                              >
                                <div className="bg-gradient-to-br from-[#5B7EFF]/10 to-[#7C9FFF]/10 border-l-4 border-[#5B7EFF] rounded-lg p-3 hover:shadow-md transition-shadow">
                                  <div className="font-semibold text-[#4F4F4F] mb-1">
                                    {course?.code}
                                  </div>
                                  <div className="text-xs text-[#828282] space-y-1">
                                    <div className="flex items-center gap-1">
                                      <Building2 className="w-3 h-3" />
                                      <span>{venue?.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Users className="w-3 h-3" />
                                      <span>{classData?.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      <span>{firstSessionInSlot.startTime} - {firstSessionInSlot.endTime}</span>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleDeleteSession(firstSessionInSlot.id)}
                                    className="mt-2 text-xs text-red-600 hover:text-red-700 font-medium"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </td>
                            );
                          } else if (sessions.length === 0) {
                            return (
                              <td
                                key={day}
                                className="p-2 border border-gray-200 bg-white hover:bg-gray-50"
                              >
                                {/* Empty slot */}
                              </td>
                            );
                          }
                          
                          return null;
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </>
      )}

      {/* Exam Schedule Content */}
      {activeTab === 'exam' && (
        <>
          {/* Timetable Selector */}
          <Card>
            <CardBody>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <label className="text-sm font-semibold text-[#4F4F4F] whitespace-nowrap">Select Timetable:</label>
                  <select
                    value={selectedExamTimetable}
                    onChange={(e) => setSelectedExamTimetable(e.target.value)}
                    className="w-full sm:w-auto px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B7EFF]/50 focus:border-[#5B7EFF] bg-[#FAFBFD] text-sm"
                  >
                    {timetables.filter(t => t.type === 'exam').map(t => (
                      <option key={t.id} value={t.id}>
                        Exam Timetable {t.academicYear} - {t.semester === 1 ? 'First' : 'Second'} Semester
                      </option>
                    ))}
                  </select>
                  
                  {currentExamTimetable && (
                    <StatusBadge status={currentExamTimetable.status} />
                  )}
                </div>
                
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Auto-Generate Button with Dropdown */}
                  <div className="relative flex-1 sm:flex-none">
                    <Button
                      variant="secondary"
                      size="md"
                      icon={<Sparkles className="w-4 h-4" />}
                      onClick={() => setShowExamAutoGenDropdown(!showExamAutoGenDropdown)}
                      className="w-full sm:w-auto"
                    >
                      <span className="hidden sm:inline">Auto-Generate</span>
                      <span className="sm:hidden">Generate</span>
                      <ChevronDown className="w-4 h-4 ml-1" />
                    </Button>
                    
                    {showExamAutoGenDropdown && (
                      <>
                        {/* Backdrop */}
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setShowExamAutoGenDropdown(false)}
                        />
                        
                        {/* Dropdown Menu */}
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-20">
                          <button
                            onClick={() => {
                              alert('Auto-generating exam timetable for all classes...');
                              setShowExamAutoGenDropdown(false);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-[#4F4F4F] hover:bg-[#5B7EFF]/10 hover:text-[#5B7EFF] transition-colors flex items-center gap-2"
                          >
                            <Users className="w-4 h-4" />
                            Class
                          </button>
                          <button
                            onClick={() => {
                              alert('Auto-generating exam timetable for all departments...');
                              setShowExamAutoGenDropdown(false);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-[#4F4F4F] hover:bg-[#5B7EFF]/10 hover:text-[#5B7EFF] transition-colors flex items-center gap-2"
                          >
                            <BookOpen className="w-4 h-4" />
                            Department
                          </button>
                          <button
                            onClick={() => {
                              alert('Auto-generating exam timetable for all faculties...');
                              setShowExamAutoGenDropdown(false);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-[#4F4F4F] hover:bg-[#5B7EFF]/10 hover:text-[#5B7EFF] transition-colors flex items-center gap-2"
                          >
                            <Building2 className="w-4 h-4" />
                            Faculty
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <Button
                    variant="primary"
                    size="md"
                    icon={<Plus className="w-4 h-4" />}
                    onClick={() => setShowExamModal(true)}
                    className="flex-1 sm:flex-none"
                  >
                    <span className="hidden sm:inline">Schedule Exam</span>
                    <span className="sm:hidden">Schedule</span>
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Exam Conflict Alert */}
          {examConflictCheck && (
            <Card>
              <CardBody>
                <div className={`p-4 rounded-xl ${
                  examConflictCheck.hasConflict 
                    ? 'bg-red-50 border border-red-200' 
                    : 'bg-green-50 border border-green-200'
                }`}>
                  <div className="flex items-center gap-3 mb-2">
                    {examConflictCheck.hasConflict ? (
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    ) : (
                      <Check className="w-5 h-5 text-green-600" />
                    )}
                    <h3 className={`font-semibold ${
                      examConflictCheck.hasConflict ? 'text-red-700' : 'text-green-700'
                    }`}>
                      {examConflictCheck.hasConflict ? 'Conflicts Detected' : 'No Conflicts Found'}
                    </h3>
                  </div>
                  {examConflictCheck.messages.length > 0 && (
                    <ul className="list-disc list-inside space-y-1 text-sm text-[#4F4F4F]">
                      {examConflictCheck.messages.map((msg, idx) => (
                        <li key={idx}>{msg}</li>
                      ))}
                    </ul>
                  )}
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
                    <p className="text-sm text-[#828282]">Total Exams</p>
                    <p className="text-2xl font-semibold text-[#4F4F4F] mt-1">{examSessions.length}</p>
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
                    <p className="text-sm text-[#828282]">Total Students</p>
                    <p className="text-2xl font-semibold text-[#4F4F4F] mt-1">{totalStudents}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-[#56CCF2] to-[#2D9CDB] rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#828282]">Classes</p>
                    <p className="text-2xl font-semibold text-[#4F4F4F] mt-1">{uniqueClasses}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-[#6FCF97] to-[#27AE60] rounded-xl flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#828282]">Total Batches</p>
                    <p className="text-2xl font-semibold text-[#4F4F4F] mt-1">{totalBatches}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-[#BB6BD9] to-[#9B51E0] rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Exam Sessions by Date */}
          <div className="space-y-4">
            {dates.length === 0 ? (
              <Card>
                <CardBody>
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-[#828282] mx-auto mb-4" />
                    <p className="text-[#828282]">No exam sessions scheduled yet</p>
                    <Button
                      variant="primary"
                      size="md"
                      icon={<Plus className="w-4 h-4" />}
                      onClick={() => setShowExamModal(true)}
                      className="mt-4"
                    >
                      Schedule First Exam
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ) : (
              dates.map(date => (
                <Card key={date}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-[#5B7EFF]" />
                      <h3 className="text-lg font-semibold text-[#4F4F4F]">
                        {new Date(date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </h3>
                      <span className="px-3 py-1 bg-[#5B7EFF]/10 text-[#5B7EFF] rounded-full text-sm font-medium">
                        {sessionsByDate[date].length} {sessionsByDate[date].length === 1 ? 'exam' : 'exams'}
                      </span>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {sessionsByDate[date].map(session => {
                        const course = courses.find(c => c.id === session.courseId);
                        const venue = venues.find(v => v.id === session.venueId);
                        const classData = classes.find(c => c.id === session.classId);
                        
                        return (
                          <div
                            key={session.id}
                            className="bg-gradient-to-br from-[#5B7EFF]/5 to-[#7C9FFF]/5 border border-[#5B7EFF]/20 rounded-xl p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-semibold text-[#4F4F4F]">{course?.code}</h4>
                                <p className="text-sm text-[#828282]">{course?.name}</p>
                              </div>
                              <span className="px-2 py-1 bg-[#5B7EFF] text-white rounded-lg text-xs font-medium">
                                {session.sessionType}
                              </span>
                            </div>
                            
                            <div className="space-y-2 text-sm text-[#4F4F4F]">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-[#828282]" />
                                <span>{session.startTime} - {session.endTime}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-[#828282]" />
                                <span>{venue?.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-[#828282]" />
                                <span>{classData?.name} ({session.studentCount} students)</span>
                              </div>
                              {session.totalBatches && session.totalBatches > 1 && (
                                <div className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                                  Split into {session.totalBatches} batches
                                </div>
                              )}
                            </div>

                            <button
                              onClick={() => handleDeleteSession(session.id)}
                              className="mt-3 text-xs text-red-600 hover:text-red-700 font-medium"
                            >
                              Remove Session
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </CardBody>
                </Card>
              ))
            )}
          </div>
        </>
      )}

      {/* Invigilation Roster Content */}
      {activeTab === 'invigilation' && (
        <>
          {/* Roster Selector */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-[#5B7EFF]" />
                  <h2 className="text-lg font-semibold text-[#4F4F4F]">Select Roster</h2>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rosters.map(roster => (
                  <div
                    key={roster.id}
                    onClick={() => setSelectedRoster(roster.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      selectedRoster === roster.id || (!selectedRoster && roster.status === 'approved')
                        ? 'border-[#5B7EFF] bg-gradient-to-br from-[#5B7EFF]/5 to-[#7C9FFF]/5 shadow-md'
                        : 'border-gray-200 bg-white hover:border-[#5B7EFF]/50 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-[#4F4F4F]">{roster.examPeriod}</h3>
                        <p className="text-xs text-[#828282] mt-1">
                          {roster.academicYear} • Semester {roster.semester}
                        </p>
                      </div>
                      <StatusBadge status={roster.status} />
                    </div>
                    <div className="text-xs text-[#828282]">
                      <p>{roster.assignments.length} assignments</p>
                      <p className="mt-1">Generated: {new Date(roster.generatedDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Assignments Table */}
          {activeRoster && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-[#4F4F4F]">{activeRoster.examPeriod} - Assignments</h2>
                    <p className="text-sm text-[#828282] mt-1">
                      {rosterAssignments.length} total assignments
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="p-0 overflow-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#4F4F4F] uppercase tracking-wider">
                        Lecturer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#4F4F4F] uppercase tracking-wider">
                        Exam Session
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#4F4F4F] uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#4F4F4F] uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#4F4F4F] uppercase tracking-wider">
                        Venue
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#4F4F4F] uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#4F4F4F] uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {rosterAssignments.map(assignment => (
                      <tr key={assignment.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-[#828282]" />
                            <span className="font-medium text-[#4F4F4F]">{getLecturerName(assignment.lecturerId)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#4F4F4F]">
                          Session #{assignment.examSessionId}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#4F4F4F]">
                          {assignment.date}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#828282]" />
                            <span className="text-sm text-[#4F4F4F]">{assignment.startTime} - {assignment.endTime}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-[#4F4F4F]">
                          {assignment.venue}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            assignment.role === 'chief' 
                              ? 'bg-gradient-to-r from-[#5B7EFF]/20 to-[#7C9FFF]/20 text-[#5B7EFF] border border-[#5B7EFF]/30' 
                              : 'bg-gray-100 text-[#828282] border border-gray-200'
                          }`}>
                            {assignment.role.charAt(0).toUpperCase() + assignment.role.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={assignment.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardBody>
            </Card>
          )}
        </>
      )}

      {/* Modals */}
      {showTeachingModal && (
        <TeachingSessionModal
          isOpen={showTeachingModal}
          onClose={() => setShowTeachingModal(false)}
          onSubmit={handleAddTeachingSession}
        />
      )}

      {showExamModal && (
        <ExamSessionModal
          isOpen={showExamModal}
          onClose={() => setShowExamModal(false)}
          onSubmit={handleAddExamSession}
        />
      )}
    </div>
  );
};

export default TimetableManagement;