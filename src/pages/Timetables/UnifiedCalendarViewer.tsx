import React, { useState, useEffect } from 'react';
import { useTimetables, TeachingSession, ExamSession } from '../../context/TimetableContext';
import { useClasses, AttendanceType } from '../../context/ClassContext';
import { useCourses } from '../../context/CourseContext';
import { useVenues } from '../../context/VenueContext';
import { useLecturers } from '../../context/LecturerContext';
import { useAuth } from '../../context/AuthContext';
import CalendarViewSwitcher, { CalendarView } from '../../components/common/CalendarViewSwitcher';
import DailyView from '../../components/calendar/DailyView';
import WeeklyView from '../../components/calendar/WeeklyView';
import MonthlyView from '../../components/calendar/MonthlyView';
import ListView from '../../components/calendar/ListView';
import { Filter, Download, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface UnifiedCalendarViewerProps {
  type: 'teaching' | 'exam';
  defaultView?: CalendarView;
}

const UnifiedCalendarViewer: React.FC<UnifiedCalendarViewerProps> = ({
  type,
  defaultView = 'week'
}) => {
  const { user } = useAuth();
  const { getTimetableByType } = useTimetables();
  const { classes } = useClasses();
  const { courses } = useCourses();
  const { venues } = useVenues();
  const { lecturers } = useLecturers();

  // View state
  const [currentView, setCurrentView] = useState<CalendarView>(defaultView);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    classId: '',
    courseId: '',
    venueId: '',
    lecturerId: '',
    attendanceType: '' as AttendanceType | '',
  });

  // Load timetable
  const timetable = getTimetableByType(type);
  const sessions = timetable?.sessions || [];

  // Apply filters
  const filteredSessions = sessions.filter(session => {
    if (filters.classId && session.classId !== filters.classId) return false;
    if (filters.courseId && session.courseId !== filters.courseId) return false;
    
    if (type === 'teaching') {
      const teachingSession = session as TeachingSession;
      if (filters.venueId && teachingSession.venueId !== filters.venueId) return false;
      if (filters.lecturerId && teachingSession.lecturerId !== filters.lecturerId) return false;
    }
    
    if (filters.attendanceType) {
      const sessionClass = classes.find(c => c.id === session.classId);
      if (sessionClass?.attendanceType !== filters.attendanceType) return false;
    }
    
    return true;
  });

  // Persist view preference
  useEffect(() => {
    const savedView = localStorage.getItem(`calendar-view-${type}`);
    if (savedView) {
      setCurrentView(savedView as CalendarView);
    }
  }, [type]);

  const handleViewChange = (view: CalendarView) => {
    setCurrentView(view);
    localStorage.setItem(`calendar-view-${type}`, view);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      classId: '',
      courseId: '',
      venueId: '',
      lecturerId: '',
      attendanceType: '',
    });
  };

  const handleDateNavigation = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    switch (currentView) {
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const activeFilterCount = Object.values(filters).filter(v => v !== '').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#4F4F4F]">
            {type === 'teaching' ? 'Teaching' : 'Exam'} Timetable
          </h1>
          <p className="text-[#828282] mt-1">
            {filteredSessions.length} {type === 'teaching' ? 'sessions' : 'exams'} scheduled
            {activeFilterCount > 0 && ` (${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} applied)`}
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-3 flex-wrap">
          <CalendarViewSwitcher
            currentView={currentView}
            onViewChange={handleViewChange}
          />
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Date Navigation */}
          {currentView !== 'agenda' && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg">
                <button
                  onClick={() => handleDateNavigation('prev')}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={goToToday}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={() => handleDateNavigation('next')}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="flex items-center gap-2 text-[#4F4F4F]">
                <Calendar className="w-5 h-5 text-gray-500" />
                <span className="font-semibold">
                  {currentView === 'day' && currentDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                  {currentView === 'week' && `Week of ${currentDate.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}`}
                  {currentView === 'month' && currentDate.toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </span>
              </div>
            </div>
          )}

          {/* Filter & Export */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showFilters || activeFilterCount > 0
                  ? 'bg-[#5B7EFF] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filters</span>
              {activeFilterCount > 0 && (
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors">
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Class Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                <select
                  value={filters.classId}
                  onChange={(e) => handleFilterChange('classId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5B7EFF]/50 focus:border-[#5B7EFF]"
                >
                  <option value="">All Classes</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              </div>

              {/* Course Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                <select
                  value={filters.courseId}
                  onChange={(e) => handleFilterChange('courseId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5B7EFF]/50 focus:border-[#5B7EFF]"
                >
                  <option value="">All Courses</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.code} - {course.title}</option>
                  ))}
                </select>
              </div>

              {/* Attendance Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Attendance Type</label>
                <select
                  value={filters.attendanceType}
                  onChange={(e) => handleFilterChange('attendanceType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5B7EFF]/50 focus:border-[#5B7EFF]"
                >
                  <option value="">All Types</option>
                  <option value="REGULAR">REGULAR (Mon-Fri)</option>
                  <option value="WEEKEND">WEEKEND (Sat-Sun)</option>
                </select>
              </div>

              {type === 'teaching' && (
                <>
                  {/* Venue Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Venue</label>
                    <select
                      value={filters.venueId}
                      onChange={(e) => handleFilterChange('venueId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5B7EFF]/50 focus:border-[#5B7EFF]"
                    >
                      <option value="">All Venues</option>
                      {venues.map(venue => (
                        <option key={venue.id} value={venue.id}>{venue.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Lecturer Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Lecturer</label>
                    <select
                      value={filters.lecturerId}
                      onChange={(e) => handleFilterChange('lecturerId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5B7EFF]/50 focus:border-[#5B7EFF]"
                    >
                      <option value="">All Lecturers</option>
                      {lecturers.map(lecturer => (
                        <option key={lecturer.id} value={lecturer.id}>{lecturer.name}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>

            {activeFilterCount > 0 && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="text-sm text-[#5B7EFF] hover:text-[#4A4EEE] font-medium"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Calendar View */}
      <div>
        {currentView === 'day' && (
          <DailyView
            date={currentDate}
            sessions={filteredSessions}
            type={type}
          />
        )}

        {currentView === 'week' && type === 'teaching' && (
          <WeeklyView
            sessions={filteredSessions as TeachingSession[]}
            attendanceType={filters.attendanceType || undefined}
            showAllDays={user?.role === 'admin' || user?.role === 'registry'}
          />
        )}

        {currentView === 'week' && type === 'exam' && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-[#828282]">Weekly view is not available for exam timetables. Please use Day, Month, or Agenda view.</p>
          </div>
        )}

        {currentView === 'month' && (
          <MonthlyView
            sessions={filteredSessions}
            type={type}
            initialDate={currentDate}
          />
        )}

        {currentView === 'agenda' && (
          <ListView
            sessions={filteredSessions}
            type={type}
          />
        )}
      </div>
    </div>
  );
};

export default UnifiedCalendarViewer;
