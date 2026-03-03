import React, { useState, useEffect } from 'react';
import { useTimetables } from '../../context/TimetableContext';
import { useAuth } from '../../context/AuthContext';
import { useOrganization } from '../../context/OrganizationContext';
import { useClasses } from '../../context/ClassContext';
import { useCourses } from '../../context/CourseContext';
import { useVenues } from '../../context/VenueContext';
import { useLecturers } from '../../context/LecturerContext';
import DailyView from '../../components/calendar/DailyView';
import WeeklyView from '../../components/calendar/WeeklyView';
import MonthlyView from '../../components/calendar/MonthlyView';
import ListView from '../../components/calendar/ListView';
import TeachingSessionModal from '../../components/modals/TeachingSessionModal';
import { 
  Calendar, 
  List, 
  Grid, 
  Eye,
  Download,
  FileText,
  Wand2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Settings,
  Layers,
  Plus,
  Search,
  X
} from 'lucide-react';
import { 
  exportTeachingSessionsToExcel,
  createTeachingTimetableHTML,
  exportToPDF 
} from '../../utils/exportUtils';
import { 
  TeachingTimetableGenerator,
  GenerationLevel,
  GenerationOptions 
} from '../../utils/multiLevelGenerator';

type ViewMode = 'daily' | 'weekly' | 'monthly' | 'list';

const EnhancedTimetableViewer: React.FC = () => {
  const { timetables, conflicts, detectConflicts, addTimetable } = useTimetables();
  const { user } = useAuth();
  const { departments, faculties } = useOrganization();
  const { classes } = useClasses();
  const { courses } = useCourses();
  const { venues } = useVenues();
  const { lecturers } = useLecturers();

  const [selectedTimetableId, setSelectedTimetableId] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('weekly');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showAutoGenModal, setShowAutoGenModal] = useState(false);
  const [showConflicts, setShowConflicts] = useState(false);
  const [generationLevel, setGenerationLevel] = useState<GenerationLevel>('class');
  const [selectedEntityId, setSelectedEntityId] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [showCreateTimetableModal, setShowCreateTimetableModal] = useState(false);
  const [newTimetableName, setNewTimetableName] = useState('');
  const [newTimetableSemester, setNewTimetableSemester] = useState<number>(1);
  const [newTimetableYear, setNewTimetableYear] = useState<string>('2025/2026');
  const [searchQuery, setSearchQuery] = useState('');

  // Check if user can auto-generate (Admin, Registry, Super Admin only)
  const canAutoGenerate = ['admin', 'registry', 'superadmin'].includes(user?.role || '');

  // Filter published teaching timetables based on role
  const getFilteredTimetables = () => {
    let filtered = timetables.filter(t => t.type === 'teaching');
    
    // Students and Lecturers only see published timetables
    if (user?.role === 'student' || user?.role === 'lecturer') {
      filtered = filtered.filter(t => t.status === 'published');
    }
    
    return filtered;
  };

  const publishedTimetables = getFilteredTimetables();
  const selectedTimetable = timetables.find(t => t.id === selectedTimetableId);

  // Filter teaching sessions based on search query
  const getFilteredSessions = () => {
    if (!selectedTimetable) return [];
    
    const sessions = selectedTimetable.teachingSessions;
    
    if (!searchQuery.trim()) return sessions;
    
    const query = searchQuery.toLowerCase().trim();
    
    return sessions.filter(session => {
      // Get class name
      const className = classes.find(c => c.id === session.classId)?.name?.toLowerCase() || '';
      
      // Get course name and code
      const course = courses.find(c => c.id === session.courseId);
      const courseName = course?.name?.toLowerCase() || '';
      const courseCode = course?.code?.toLowerCase() || '';
      
      // Get venue name
      const venueName = venues.find(v => v.id === session.venueId)?.name?.toLowerCase() || '';
      
      // Get lecturer name
      const lecturer = lecturers.find(l => l.id === session.lecturerId);
      const lecturerName = `${lecturer?.firstName} ${lecturer?.lastName}`.toLowerCase();
      
      // Search across all fields
      return (
        className.includes(query) ||
        courseName.includes(query) ||
        courseCode.includes(query) ||
        venueName.includes(query) ||
        lecturerName.includes(query)
      );
    });
  };

  const filteredSessions = getFilteredSessions();

  // Detect conflicts when timetable is selected
  useEffect(() => {
    if (selectedTimetableId) {
      detectConflicts(selectedTimetableId);
    }
  }, [selectedTimetableId]); // Remove detectConflicts from dependencies

  const timetableConflicts = conflicts.filter(c => 
    selectedTimetable?.teachingSessions.some(s => c.affectedSessions.includes(s.id))
  );

  const handleExportPDF = () => {
    if (!selectedTimetable) return;
    const html = createTeachingTimetableHTML(
      selectedTimetable.teachingSessions,
      selectedTimetable.name
    );
    exportToPDF(html, `${selectedTimetable.name}_timetable`);
  };

  const handleExportExcel = () => {
    if (!selectedTimetable) return;
    exportTeachingSessionsToExcel(
      selectedTimetable.teachingSessions,
      `${selectedTimetable.name}_timetable`
    );
  };

  const handleAutoGenerate = async () => {
    if (!selectedEntityId) return;
    
    setIsGenerating(true);
    
    try {
      const options: GenerationOptions = {
        level: generationLevel,
        targetId: selectedEntityId, // Changed from entityId to targetId
        semester: 1,
        academicYear: '2025/2026',
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        preferences: {
          preferMorningSlots: true,
          avoidFridayAfternoons: true,
          minimizeGaps: true,
          balanceWorkload: true,
          respectLecturerPreferences: true
        }
      };

      const generator = new TeachingTimetableGenerator(
        classes,
        courses,
        lecturers,
        venues
      );

      const generatedTimetable = generator.generate(options);

      // Add the generated timetable to the system
      addTimetable({
        name: `Auto-Generated ${generationLevel} Timetable - ${new Date().toLocaleDateString()}`,
        type: 'teaching',
        semester: 1,
        academicYear: '2025/2026',
        status: 'draft',
        teachingSessions: generatedTimetable.sessions,
        examSessions: [],
        version: 1,
        createdBy: user?.email || 'system',
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      });

      setShowAutoGenModal(false);
      alert(`Timetable generated successfully! ${generatedTimetable.sessions.length} sessions created with ${generatedTimetable.conflicts.length} conflicts to resolve.`);
    } catch (error) {
      console.error('Auto-generation failed:', error);
      alert('Failed to generate timetable. Please check console for details.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getEntitiesByLevel = () => {
    switch (generationLevel) {
      case 'class':
        return classes.map(c => ({ id: c.id, name: c.name }));
      case 'department':
        return departments.map(d => ({ id: d.id, name: d.name }));
      case 'faculty':
        return faculties.map(f => ({ id: f.id, name: f.name }));
      default:
        return [];
    }
  };

  const handleCreateTimetable = () => {
    if (!newTimetableName.trim()) {
      alert('Please enter a timetable name');
      return;
    }

    const newTimetable = {
      name: newTimetableName,
      type: 'teaching' as const,
      semester: newTimetableSemester,
      academicYear: newTimetableYear,
      status: 'draft' as const,
      teachingSessions: [],
      examSessions: [],
      version: 1,
      createdBy: user?.email || 'unknown',
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    addTimetable(newTimetable);
    setShowCreateTimetableModal(false);
    setNewTimetableName('');
    setNewTimetableSemester(1);
    setNewTimetableYear('2025/2026');
    alert('Teaching timetable created successfully! You can now add teaching sessions to it.');
  };

  return (
    <div className="space-y-4 md:space-y-6 pb-6">
      {/* Role Debug Info - Remove after testing */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4">
        <p className="text-xs md:text-sm text-blue-900">
          <strong>Current User:</strong> {user?.name} ({user?.email}) | 
          <strong> Role:</strong> {user?.role} | 
          <strong> Can Auto-Generate:</strong> {canAutoGenerate ? 'Yes ✓' : 'No ✗'}
        </p>
        {!canAutoGenerate && (
          <p className="text-xs text-blue-700 mt-2">
            Note: Auto-generate buttons are only visible to Admin, Registry, and Super Admin roles. 
            To see the button, log in with an email containing "admin", "registry", or "superadmin".
          </p>
        )}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="px-1">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold text-[#2F2E41]">Teaching Timetable</h1>
          <p className="text-gray-500 mt-1 text-xs md:text-sm">
            View and manage teaching schedules in multiple formats
          </p>
        </div>
        
        {/* Action Buttons (Admin/Registry/Super Admin only) */}
        {canAutoGenerate && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateTimetableModal(true)}
              className="w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-[#5B7EFF] to-[#6B88FF] text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 shadow-md font-semibold text-sm md:text-base"
            >
              <Plus className="w-4 md:w-5 h-4 md:h-5" />
              <span className="hidden sm:inline">Schedule Timetable</span>
              <span className="sm:hidden">Schedule</span>
            </button>
            <button
              onClick={() => setShowAutoGenModal(true)}
              className="w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 shadow-md font-semibold text-sm md:text-base"
            >
              <Wand2 className="w-4 md:w-5 h-4 md:h-5" />
              <span className="hidden sm:inline">Auto-Generate</span>
              <span className="sm:hidden">Generate</span>
            </button>
          </div>
        )}
      </div>

      {/* Conflict Alert */}
      {selectedTimetable && timetableConflicts.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-3 md:p-4 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="w-4 md:w-5 h-4 md:h-5 text-red-500 mt-0.5 mr-2 md:mr-3 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-red-800 mb-1 text-sm md:text-base">
                {timetableConflicts.length} Conflict{timetableConflicts.length > 1 ? 's' : ''} Detected
              </h3>
              <p className="text-xs md:text-sm text-red-700 mb-2">
                This timetable has scheduling conflicts that need to be resolved.
              </p>
              <button
                onClick={() => setShowConflicts(!showConflicts)}
                className="text-xs md:text-sm text-red-800 underline hover:text-red-900"
              >
                {showConflicts ? 'Hide' : 'Show'} Conflicts
              </button>
            </div>
          </div>
          
          {showConflicts && (
            <div className="mt-3 md:mt-4 space-y-2">
              {timetableConflicts.map(conflict => (
                <div key={conflict.id} className="bg-white p-2 md:p-3 rounded border border-red-200">
                  <div className="flex items-start gap-2">
                    <XCircle className={`w-3 md:w-4 h-3 md:h-4 mt-0.5 flex-shrink-0 ${
                      conflict.severity === 'critical' ? 'text-red-600' :
                      conflict.severity === 'high' ? 'text-orange-600' :
                      conflict.severity === 'medium' ? 'text-yellow-600' :
                      'text-blue-600'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs md:text-sm font-medium text-gray-900">{conflict.message}</p>
                      {conflict.suggestions && conflict.suggestions.length > 0 && (
                        <ul className="mt-1 text-xs text-gray-600 list-disc list-inside space-y-0.5">
                          {conflict.suggestions.map((suggestion, idx) => (
                            <li key={idx} className="break-words">{suggestion}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
        {/* Action Buttons - Only show for roles with permissions */}
        {canAutoGenerate && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 md:mb-6">
            {/* Buttons removed */}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
          {/* Timetable Selection */}
          <div>
            <label className="block text-xs md:text-sm font-medium text-[#4F4F4F] mb-2">
              Select Timetable
            </label>
            <select
              value={selectedTimetableId}
              onChange={(e) => setSelectedTimetableId(e.target.value)}
              className="w-full px-3 md:px-4 py-2.5 md:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5B7EFF] focus:border-transparent text-sm md:text-base"
            >
              <option value="">-- Select Timetable --</option>
              {publishedTimetables.map(tt => (
                <option key={tt.id} value={tt.id}>
                  {tt.name} ({tt.status})
                </option>
              ))}
            </select>
          </div>

          {/* Search Bar */}
          <div>
            <label className="block text-xs md:text-sm font-medium text-[#4F4F4F] mb-2">
              Search Classes
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 md:w-5 h-4 md:h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by class, course, venue, lecturer..."
                className="w-full pl-9 md:pl-10 pr-9 md:pr-10 py-2.5 md:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5B7EFF] focus:border-transparent text-sm md:text-base"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 md:w-5 h-4 md:h-5" />
                </button>
              )}
            </div>
            {searchQuery && selectedTimetable && (
              <p className="text-xs text-gray-500 mt-1">
                Showing {filteredSessions.length} of {selectedTimetable.teachingSessions.length} sessions
              </p>
            )}
          </div>
        </div>

        {/* Date Selection (for Daily view) - moved to its own row */}
        {viewMode === 'daily' && (
          <div className="mb-4 md:mb-6">
            <label className="block text-xs md:text-sm font-medium text-[#4F4F4F] mb-2">
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="w-full md:w-1/2 px-3 md:px-4 py-2.5 md:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5B7EFF] focus:border-transparent text-sm md:text-base"
            />
          </div>
        )}

        {/* View Mode Selector */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setViewMode('daily')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                viewMode === 'daily'
                  ? 'bg-[#5B7EFF] text-white'
                  : 'bg-gray-100 text-[#4F4F4F] hover:bg-gray-200'
              }`}
            >
              <Eye className="w-4 h-4" />
              Daily
            </button>
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                viewMode === 'weekly'
                  ? 'bg-[#5B7EFF] text-white'
                  : 'bg-gray-100 text-[#4F4F4F] hover:bg-gray-200'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Weekly
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                viewMode === 'monthly'
                  ? 'bg-[#5B7EFF] text-white'
                  : 'bg-gray-100 text-[#4F4F4F] hover:bg-gray-200'
              }`}
            >
              <Grid className="w-4 h-4" />
              Monthly
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                viewMode === 'list'
                  ? 'bg-[#5B7EFF] text-white'
                  : 'bg-gray-100 text-[#4F4F4F] hover:bg-gray-200'
              }`}
            >
              <List className="w-4 h-4" />
              List
            </button>
          </div>

          {/* Export Buttons */}
          {selectedTimetable && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportPDF}
                className="px-4 py-2 border border-[#5B7EFF] text-[#5B7EFF] rounded-lg hover:bg-[#5B7EFF] hover:text-white transition-all flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                PDF
              </button>
              <button
                onClick={handleExportExcel}
                className="px-4 py-2 border border-[#5B7EFF] text-[#5B7EFF] rounded-lg hover:bg-[#5B7EFF] hover:text-white transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Excel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Calendar View */}
      {selectedTimetable ? (
        <div>
          {viewMode === 'daily' && (
            <DailyView
              date={selectedDate}
              sessions={filteredSessions}
              type="teaching"
              onSessionClick={(sessionId) => {
                setSelectedSessionId(sessionId);
                setShowSessionModal(true);
              }}
            />
          )}
          {viewMode === 'weekly' && (
            <WeeklyView
              sessions={filteredSessions}
            />
          )}
          {viewMode === 'monthly' && (
            <MonthlyView
              sessions={filteredSessions}
              type="teaching"
            />
          )}
          {viewMode === 'list' && (
            <ListView
              sessions={filteredSessions}
              type="teaching"
            />
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[#4F4F4F] mb-2">
            No Timetable Selected
          </h3>
          <p className="text-[#828282]">
            Please select a timetable from the dropdown above to view the schedule
          </p>
        </div>
      )}

      {/* Auto-Generate Modal */}
      {showAutoGenModal && (
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
                      Auto-Generate Timetable
                    </h2>
                    <p className="text-sm text-[#828282]">
                      Generate optimized timetables with AI-powered constraint solving
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAutoGenModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Generation Level */}
              <div>
                <label className="block text-sm font-medium text-[#4F4F4F] mb-3">
                  <Layers className="w-4 h-4 inline mr-2" />
                  Generation Level
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => {
                      setGenerationLevel('class');
                      setSelectedEntityId('');
                    }}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      generationLevel === 'class'
                        ? 'border-[#5B7EFF] bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="font-semibold text-[#4F4F4F]">Class</div>
                      <div className="text-xs text-[#828282] mt-1">
                        Single class schedule
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setGenerationLevel('department');
                      setSelectedEntityId('');
                    }}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      generationLevel === 'department'
                        ? 'border-[#5B7EFF] bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="font-semibold text-[#4F4F4F]">Department</div>
                      <div className="text-xs text-[#828282] mt-1">
                        All department classes
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setGenerationLevel('faculty');
                      setSelectedEntityId('');
                    }}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      generationLevel === 'faculty'
                        ? 'border-[#5B7EFF] bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="font-semibold text-[#4F4F4F]">Faculty</div>
                      <div className="text-xs text-[#828282] mt-1">
                        Entire faculty schedule
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Entity Selection */}
              <div>
                <label className="block text-sm font-medium text-[#4F4F4F] mb-2">
                  Select {generationLevel.charAt(0).toUpperCase() + generationLevel.slice(1)}
                </label>
                <select
                  value={selectedEntityId}
                  onChange={(e) => setSelectedEntityId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5B7EFF] focus:border-transparent"
                >
                  <option value="">-- Select {generationLevel} --</option>
                  {getEntitiesByLevel().map(entity => (
                    <option key={entity.id} value={entity.id}>
                      {entity.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">
                      Automated Constraint Solving
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>✓ Prevents class and lecturer clashes</li>
                      <li>✓ Optimizes venue allocation</li>
                      <li>✓ Balances daily workload</li>
                      <li>✓ Respects lecturer availability</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowAutoGenModal(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
                disabled={isGenerating}
              >
                Cancel
              </button>
              <button
                onClick={handleAutoGenerate}
                disabled={!selectedEntityId || isGenerating}
                className="px-6 py-3 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Settings className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    Generate Timetable
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Teaching Session Modal */}
      {showSessionModal && selectedTimetable && (
        <TeachingSessionModal
          onClose={() => {
            setShowSessionModal(false);
            setSelectedSessionId('');
          }}
          onSubmit={(session) => {
            // Add or update session in timetable
            console.log('Session submitted:', session);
            setShowSessionModal(false);
            setSelectedSessionId('');
          }}
          timetableId={selectedTimetable.id}
          existingSessions={selectedTimetable.teachingSessions}
          editSession={selectedSessionId ? selectedTimetable.teachingSessions.find(s => s.id === selectedSessionId) : undefined}
        />
      )}

      {/* Create Timetable Modal */}
      {showCreateTimetableModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-xl flex items-center justify-center">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[#4F4F4F]">
                      Create Timetable
                    </h2>
                    <p className="text-sm text-[#828282]">
                      Set up a new teaching timetable
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateTimetableModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Timetable Name */}
              <div>
                <label className="block text-sm font-medium text-[#4F4F4F] mb-2">
                  Timetable Name
                </label>
                <input
                  type="text"
                  value={newTimetableName}
                  onChange={(e) => setNewTimetableName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5B7EFF] focus:border-transparent"
                />
              </div>

              {/* Semester */}
              <div>
                <label className="block text-sm font-medium text-[#4F4F4F] mb-2">
                  Semester
                </label>
                <select
                  value={newTimetableSemester}
                  onChange={(e) => setNewTimetableSemester(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5B7EFF] focus:border-transparent"
                >
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                </select>
              </div>

              {/* Academic Year */}
              <div>
                <label className="block text-sm font-medium text-[#4F4F4F] mb-2">
                  Academic Year
                </label>
                <input
                  type="text"
                  value={newTimetableYear}
                  onChange={(e) => setNewTimetableYear(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5B7EFF] focus:border-transparent"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateTimetableModal(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTimetable}
                className="px-6 py-3 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create Timetable
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedTimetableViewer;