import React, { useState } from 'react';
import { useTimetables } from '../../context/TimetableContext';
import { useCourses } from '../../context/CourseContext';
import { useClasses } from '../../context/ClassContext';
import { useVenues } from '../../context/VenueContext';
import { useLecturers } from '../../context/LecturerContext';
import { Card, CardBody, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Plus, Calendar, Check, Play, Users, Building2 } from 'lucide-react';
import ExamSessionModal from '../../components/modals/ExamSessionModal';
import { ExamConstraintSolver } from '../../utils/constraintSolver';
import { StatusBadge } from '../../components/common/StatusBadge';

const AdminExamTimetable = () => {
  const { timetables, addExamSession, publishTimetable } = useTimetables();
  const { courses } = useCourses();
  const { classes } = useClasses();
  const { venues } = useVenues();
  const { lecturers } = useLecturers();
  
  const [selectedTimetable, setSelectedTimetable] = useState<string>('2');
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  
  const currentTimetable = timetables.find(t => t.id === selectedTimetable && t.type === 'exam');
  const examSessions = currentTimetable?.examSessions || [];
  
  // Group sessions by date
  const sessionsByDate = examSessions.reduce((acc, session) => {
    if (!acc[session.date]) {
      acc[session.date] = [];
    }
    acc[session.date].push(session);
    return acc;
  }, {} as Record<string, typeof examSessions>);
  
  const dates = Object.keys(sessionsByDate).sort();
  
  const handleAddSession = (sessionData: any) => {
    if (!currentTimetable) return;
    
    addExamSession(currentTimetable.id, sessionData);
    setShowSessionModal(false);
  };
  
  const handlePublish = () => {
    if (!currentTimetable) return;
    
    // Check for critical conflicts
    const hasUnassignedInvigilators = examSessions.some(s => s.invigilators.length === 0);
    
    if (hasUnassignedInvigilators) {
      alert('Cannot publish: Some exam sessions do not have assigned invigilators.');
      return;
    }
    
    if (window.confirm('Are you sure you want to publish this exam timetable? All users will see the updates.')) {
      publishTimetable(currentTimetable.id);
      alert('Exam timetable published successfully!');
    }
  };
  
  // Calculate statistics
  const totalStudents = examSessions.reduce((sum, s) => sum + s.studentCount, 0);
  const uniqueClasses = new Set(examSessions.map(s => s.classId)).size;
  const totalBatches = examSessions.reduce((sum, s) => sum + (s.totalBatches || 1), 0);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#4F4F4F]">Exam Timetable Management</h1>
          <p className="text-[#828282] mt-1">Schedule and manage end-of-semester examinations</p>
        </div>
        
        <div className="flex items-center gap-3">
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
                {timetables.filter(t => t.type === 'exam').map(t => (
                  <option key={t.id} value={t.id}>
                    Exam Timetable {t.academicYear} - {t.semester === 1 ? 'First' : 'Second'} Semester
                  </option>
                ))}
              </select>
              
              {currentTimetable && (
                <StatusBadge status={currentTimetable.status} />
              )}
            </div>
            
            <Button
              variant="primary"
              size="md"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setShowSessionModal(true)}
            >
              Schedule Exam
            </Button>
          </div>
        </CardBody>
      </Card>
      
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
                <p className="text-sm text-[#828282]">Exam Batches</p>
                <p className="text-2xl font-semibold text-[#4F4F4F] mt-1">{totalBatches}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-[#6FCF97] to-[#27AE60] rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
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
              <div className="w-12 h-12 bg-gradient-to-br from-[#BB6BD9] to-[#9B51E0] rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
      
      {/* Exam Sessions by Date */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-[#4F4F4F]">Exam Schedule</h2>
        
        {dates.length === 0 ? (
          <Card>
            <CardBody>
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-[#828282] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[#4F4F4F] mb-2">No Exams Scheduled</h3>
                <p className="text-[#828282] mb-6">Get started by scheduling your first exam session</p>
                <Button
                  variant="primary"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={() => setShowSessionModal(true)}
                >
                  Schedule First Exam
                </Button>
              </div>
            </CardBody>
          </Card>
        ) : (
          dates.map(date => {
            const dateSessions = sessionsByDate[date];
            const dateObj = new Date(date);
            const formattedDate = dateObj.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            });
            
            return (
              <Card key={date}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-[#4F4F4F]">{formattedDate}</h3>
                    <span className="text-sm text-[#828282]">
                      {dateSessions.length} exam{dateSessions.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    {dateSessions.map(session => (
                      <div
                        key={session.id}
                        className="p-4 rounded-xl border border-gray-200 bg-gradient-to-r from-[#5B7EFF]/5 to-[#7C9FFF]/5 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h4 className="font-semibold text-[#4F4F4F] text-lg">
                                {session.courseName}
                              </h4>
                              <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                                session.examType === 'theory' 
                                  ? 'bg-blue-100 text-blue-700' 
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {session.examType}
                              </span>
                              {session.batchNumber && (
                                <span className="px-3 py-1 rounded-lg text-xs font-medium bg-purple-100 text-purple-700">
                                  Batch {session.batchNumber}/{session.totalBatches}
                                </span>
                              )}
                            </div>
                            
                            <p className="text-sm text-[#828282] mt-2">{session.className}</p>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                              <div>
                                <p className="text-xs text-[#828282]">Time</p>
                                <p className="text-sm font-medium text-[#4F4F4F] mt-1">
                                  {session.startTime} - {session.endTime}
                                </p>
                              </div>
                              
                              <div>
                                <p className="text-xs text-[#828282]">Duration</p>
                                <p className="text-sm font-medium text-[#4F4F4F] mt-1">
                                  {session.duration} minutes
                                </p>
                              </div>
                              
                              <div>
                                <p className="text-xs text-[#828282]">Students</p>
                                <p className="text-sm font-medium text-[#4F4F4F] mt-1">
                                  {session.studentCount}
                                </p>
                              </div>
                              
                              <div>
                                <p className="text-xs text-[#828282]">Invigilators</p>
                                <p className="text-sm font-medium text-[#4F4F4F] mt-1">
                                  {session.invigilators.length || 'Not assigned'}
                                </p>
                              </div>
                            </div>
                            
                            {/* Venue Allocations */}
                            <div className="mt-4">
                              <p className="text-xs text-[#828282] mb-2">Venues:</p>
                              <div className="flex flex-wrap gap-2">
                                {session.venueAllocations.map((venue, idx) => (
                                  <div
                                    key={idx}
                                    className="px-3 py-2 bg-white rounded-lg border border-gray-200 text-sm"
                                  >
                                    <span className="font-medium text-[#4F4F4F]">{venue.venueName}</span>
                                    <span className="text-[#828282] ml-2">
                                      📝 {venue.assignedStudents}/{venue.capacity}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            );
          })
        )}
      </div>
      
      {/* Session Modal */}
      {showSessionModal && (
        <ExamSessionModal
          onClose={() => setShowSessionModal(false)}
          onSubmit={handleAddSession}
          timetableId={currentTimetable?.id || ''}
        />
      )}
    </div>
  );
};

export default AdminExamTimetable;