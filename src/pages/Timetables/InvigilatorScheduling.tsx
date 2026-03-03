import React, { useState } from 'react';
import { useTimetables, ExamSession } from '../../context/TimetableContext';
import { useLecturers } from '../../context/LecturerContext';
import { useVenues } from '../../context/VenueContext';
import { useCourses } from '../../context/CourseContext';
import { useClasses } from '../../context/ClassContext';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  Users,
  UserPlus,
  UserMinus,
  AlertCircle,
  CheckCircle2,
  Clock,
  MapPin,
  BookOpen,
  Search,
  Filter,
  Download,
  FileText,
  Wand2,
  RefreshCw,
  X
} from 'lucide-react';

const InvigilatorScheduling: React.FC = () => {
  const { user } = useAuth();
  const { timetables } = useTimetables();
  const { lecturers } = useLecturers();
  const { venues } = useVenues();
  const { courses } = useCourses();
  const { classes } = useClasses();

  const [selectedTimetableId, setSelectedTimetableId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAutoAssignModal, setShowAutoAssignModal] = useState(false);

  // Filter exam timetables
  const examTimetables = timetables.filter(t => t.type === 'exam');
  const selectedTimetable = examTimetables.find(t => t.id === selectedTimetableId);

  // Get unique exam dates
  const examDates = selectedTimetable && selectedTimetable.examSessions
    ? Array.from(new Set(selectedTimetable.examSessions.map(s => s.date))).sort()
    : [];

  // Filter sessions by date
  const filteredSessions = selectedTimetable?.examSessions?.filter(session => {
    const matchesDate = !selectedDate || session.date === selectedDate;
    if (!searchQuery) return matchesDate;

    const query = searchQuery.toLowerCase();
    const courseName = courses.find(c => c.id === session.courseId)?.name?.toLowerCase() || '';
    const className = classes.find(c => c.id === session.classId)?.name?.toLowerCase() || '';
    const venueName = venues.find(v => v.id === session.venueId)?.name?.toLowerCase() || '';

    return matchesDate && (courseName.includes(query) || className.includes(query) || venueName.includes(query));
  }) || [];

  // Calculate invigilator statistics
  const getInvigilatorStats = () => {
    if (!selectedTimetable || !selectedTimetable.examSessions) return { total: 0, assigned: 0, unassigned: 0 };
    
    const assigned = selectedTimetable.examSessions.filter(
      s => s.invigilators && s.invigilators.length > 0
    ).length;
    
    return {
      total: selectedTimetable.examSessions.length,
      assigned,
      unassigned: selectedTimetable.examSessions.length - assigned,
    };
  };

  const stats = getInvigilatorStats();

  // Get lecturer invigilation load
  const getLecturerLoad = () => {
    if (!selectedTimetable || !selectedTimetable.examSessions) return [];

    const loadMap = new Map<string, { count: number; sessions: ExamSession[] }>();

    selectedTimetable.examSessions.forEach(session => {
      session.invigilators?.forEach(lecId => {
        if (!loadMap.has(lecId)) {
          loadMap.set(lecId, { count: 0, sessions: [] });
        }
        const load = loadMap.get(lecId)!;
        load.count++;
        load.sessions.push(session);
      });
    });

    return Array.from(loadMap.entries()).map(([lecturerId, data]) => {
      const lecturer = lecturers.find(l => l.id === lecturerId);
      return {
        lecturerId,
        lecturerName: lecturer ? `${lecturer.firstName} ${lecturer.lastName}` : 'Unknown',
        count: data.count,
        sessions: data.sessions,
      };
    }).sort((a, b) => b.count - a.count);
  };

  const lecturerLoad = getLecturerLoad();

  // Check if user can manage invigilators
  const canManageInvigilators = ['admin', 'registry', 'superadmin'].includes(user?.role || '');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#4F4F4F]">Invigilator Scheduling</h1>
          <p className="text-[#828282] mt-2">
            Manage exam invigilation assignments and rosters
          </p>
        </div>
        {canManageInvigilators && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAutoAssignModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2 shadow-md font-semibold"
            >
              <Wand2 className="w-5 h-5" />
              Auto-Assign
            </button>
            <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2">
              <Download className="w-5 h-5" />
              Export Roster
            </button>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      {selectedTimetable && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm text-gray-500">Total</span>
            </div>
            <h3 className="text-3xl font-bold text-[#4F4F4F] mb-1">{stats.total}</h3>
            <p className="text-sm text-[#828282]">Exam Sessions</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm text-green-600 font-medium">
                {stats.total > 0 ? Math.round((stats.assigned / stats.total) * 100) : 0}%
              </span>
            </div>
            <h3 className="text-3xl font-bold text-[#4F4F4F] mb-1">{stats.assigned}</h3>
            <p className="text-sm text-[#828282]">Assigned Invigilators</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-sm text-orange-600 font-medium">Pending</span>
            </div>
            <h3 className="text-3xl font-bold text-[#4F4F4F] mb-1">{stats.unassigned}</h3>
            <p className="text-sm text-[#828282]">Unassigned Sessions</p>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Timetable Selection */}
          <div>
            <label className="block text-sm font-medium text-[#4F4F4F] mb-2">
              Select Exam Timetable
            </label>
            <select
              value={selectedTimetableId}
              onChange={(e) => {
                setSelectedTimetableId(e.target.value);
                setSelectedDate('');
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5B7EFF] focus:border-transparent"
            >
              <option value="">-- Select Timetable --</option>
              {examTimetables.map(tt => (
                <option key={tt.id} value={tt.id}>
                  {tt.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-sm font-medium text-[#4F4F4F] mb-2">
              Filter by Date
            </label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              disabled={!selectedTimetableId}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5B7EFF] focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">All Dates</option>
              {examDates.map(date => (
                <option key={date} value={date}>
                  {new Date(date).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-[#4F4F4F] mb-2">
              Search Sessions
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by course, class, venue..."
                disabled={!selectedTimetableId}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5B7EFF] focus:border-transparent disabled:bg-gray-100"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Sessions & Lecturer Load */}
      {selectedTimetable && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Exam Sessions List */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-bold text-[#4F4F4F] mb-4">
              Exam Sessions
              {filteredSessions.length > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({filteredSessions.length} sessions)
                </span>
              )}
            </h2>

            <div className="space-y-4">
              {filteredSessions.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No exam sessions found</p>
                </div>
              ) : (
                filteredSessions.map((session) => {
                  const course = courses.find(c => c.id === session.courseId);
                  const className = classes.find(c => c.id === session.classId)?.name;
                  const venue = venues.find(v => v.id === session.venueId);
                  const assignedInvigilators = session.invigilators?.map(invId => 
                    lecturers.find(l => l.id === invId)
                  ).filter(Boolean) || [];

                  return (
                    <div key={session.id} className="border-2 border-gray-200 rounded-xl p-4 hover:border-[#5B7EFF] transition-all">
                      {/* Session Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-[#4F4F4F] mb-1">
                            {course?.name || 'Unknown Course'}
                          </h3>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-[#828282]">
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {className}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {venue?.name || 'No venue'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(session.date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {session.startTime} - {session.endTime}
                            </span>
                          </div>
                        </div>
                        {assignedInvigilators.length === 0 && (
                          <span className="px-3 py-1 bg-orange-50 text-orange-700 text-xs font-medium rounded-full flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            No Invigilators
                          </span>
                        )}
                      </div>

                      {/* Assigned Invigilators */}
                      <div className="border-t border-gray-200 pt-3 mt-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-[#4F4F4F]">
                            Assigned Invigilators ({assignedInvigilators.length})
                          </span>
                          {canManageInvigilators && (
                            <button className="text-sm text-[#5B7EFF] hover:underline flex items-center gap-1">
                              <UserPlus className="w-4 h-4" />
                              Add
                            </button>
                          )}
                        </div>
                        {assignedInvigilators.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {assignedInvigilators.map((lecturer) => (
                              <div
                                key={lecturer?.id}
                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm"
                              >
                                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                  {lecturer?.firstName?.charAt(0)}{lecturer?.lastName?.charAt(0)}
                                </div>
                                <span>{lecturer?.firstName} {lecturer?.lastName}</span>
                                {canManageInvigilators && (
                                  <button className="ml-1 text-blue-500 hover:text-blue-700">
                                    <UserMinus className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 italic">No invigilators assigned yet</p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Lecturer Load Panel */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-bold text-[#4F4F4F] mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Lecturer Load
            </h2>

            <div className="space-y-3">
              {lecturerLoad.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No assignments yet</p>
                </div>
              ) : (
                lecturerLoad.map((load) => (
                  <div
                    key={load.lecturerId}
                    className="p-3 border border-gray-200 rounded-lg hover:border-[#5B7EFF] transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#5B7EFF] to-[#6B88FF] rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {load.lecturerName.split(' ').map(n => n.charAt(0)).join('')}
                        </div>
                        <span className="text-sm font-medium text-[#4F4F4F]">
                          {load.lecturerName}
                        </span>
                      </div>
                      <span className="text-lg font-bold text-[#5B7EFF]">{load.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-[#5B7EFF] to-[#6B88FF] h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min((load.count / Math.max(...lecturerLoad.map(l => l.count))) * 100, 100)}%`
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            {lecturerLoad.length > 0 && (
              <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Load Distribution</p>
                    <p className="text-xs">
                      Average: {(lecturerLoad.reduce((sum, l) => sum + l.count, 0) / lecturerLoad.length).toFixed(1)} sessions per lecturer
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!selectedTimetable && (
        <div className="bg-white rounded-2xl shadow-md p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[#4F4F4F] mb-2">
            No Exam Timetable Selected
          </h3>
          <p className="text-[#828282]">
            Select an exam timetable from the dropdown above to manage invigilator assignments
          </p>
        </div>
      )}

      {/* Auto-Assign Modal */}
      {showAutoAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-xl flex items-center justify-center">
                    <Wand2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[#4F4F4F]">
                      Auto-Assign Invigilators
                    </h2>
                    <p className="text-sm text-[#828282]">
                      Automatically distribute invigilation duties
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAutoAssignModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">
                      Automated Assignment Features
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>✓ Balanced workload distribution</li>
                      <li>✓ Respects lecturer availability</li>
                      <li>✓ Prevents scheduling conflicts</li>
                      <li>✓ Considers venue capacity requirements</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4F4F4F] mb-2">
                  Invigilators per Session
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  defaultValue="2"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5B7EFF] focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Number of invigilators to assign per exam session
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-[#5B7EFF] rounded" defaultChecked />
                  <span className="text-sm text-[#4F4F4F]">Balance workload across all lecturers</span>
                </label>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-[#5B7EFF] rounded" defaultChecked />
                  <span className="text-sm text-[#4F4F4F]">Respect lecturer availability preferences</span>
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowAutoAssignModal(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // TODO: Implement auto-assignment logic
                  alert('Auto-assignment feature coming soon!');
                  setShowAutoAssignModal(false);
                }}
                className="px-6 py-3 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Wand2 className="w-5 h-5" />
                Assign Invigilators
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvigilatorScheduling;