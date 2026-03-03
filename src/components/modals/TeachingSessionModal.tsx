import React, { useState } from 'react';
import { useCourses } from '../../context/CourseContext';
import { useClasses } from '../../context/ClassContext';
import { useVenues } from '../../context/VenueContext';
import { useLecturers } from '../../context/LecturerContext';
import { TeachingSession } from '../../context/TimetableContext';
import { TeachingConstraintSolver, ATTENDANCE_TYPE_DAYS } from '../../utils/constraintSolver';
import Button from '../common/Button';
import { X, AlertTriangle, CheckCircle } from 'lucide-react';

interface TeachingSessionModalProps {
  onClose: () => void;
  onSubmit: (session: Omit<TeachingSession, 'id'>) => void;
  timetableId: string;
  existingSessions: TeachingSession[];
  editSession?: TeachingSession;
}

const TeachingSessionModal = ({ 
  onClose, 
  onSubmit, 
  timetableId, 
  existingSessions,
  editSession 
}: TeachingSessionModalProps) => {
  const { courses } = useCourses();
  const { classes } = useClasses();
  const { venues } = useVenues();
  const { lecturers } = useLecturers();
  
  const [formData, setFormData] = useState({
    courseId: editSession?.courseId || '',
    classId: editSession?.classId || '',
    lecturerId: editSession?.lecturerId || '',
    venueId: editSession?.venueId || '',
    day: editSession?.day || 'monday',
    startTime: editSession?.startTime || '09:00',
    endTime: editSession?.endTime || '11:00',
    sessionType: editSession?.sessionType || 'lecture' as 'lecture' | 'lab' | 'tutorial',
  });
  
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } | null>(null);
  
  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
    setValidationResult(null); // Reset validation when form changes
  };
  
  const validateSession = () => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Basic validation
    if (!formData.courseId) errors.push('Please select a course');
    if (!formData.classId) errors.push('Please select a class');
    if (!formData.lecturerId) errors.push('Please select a lecturer');
    if (!formData.venueId) errors.push('Please select a venue');
    
    if (errors.length > 0) {
      setValidationResult({ isValid: false, errors, warnings });
      return false;
    }
    
    // Get selected entities
    const selectedCourse = courses.find(c => c.id === formData.courseId);
    const selectedClass = classes.find(c => c.id === formData.classId);
    const selectedVenue = venues.find(v => v.id === formData.venueId);
    const selectedLecturer = lecturers.find(l => l.id === formData.lecturerId);
    
    if (!selectedCourse || !selectedClass || !selectedVenue || !selectedLecturer) {
      errors.push('Invalid selection');
      setValidationResult({ isValid: false, errors, warnings });
      return false;
    }
    
    // Build session object
    const sessionData: Omit<TeachingSession, 'id'> = {
      courseId: formData.courseId,
      courseName: selectedCourse.title,
      classId: formData.classId,
      className: selectedClass.name,
      lecturerId: formData.lecturerId,
      lecturerName: selectedLecturer.name,
      venueId: formData.venueId,
      venueName: selectedVenue.name,
      day: formData.day,
      startTime: formData.startTime,
      endTime: formData.endTime,
      sessionType: formData.sessionType,
      weeklyRecurrence: true,
    };
    
    // Run constraint checks
    const sessionsToCheck = editSession 
      ? existingSessions.filter(s => s.id !== editSession.id)
      : existingSessions;
    
    // Check 0: Attendance type day validation
    const dayCheck = TeachingConstraintSolver.checkAttendanceTypeDay(
      formData.day,
      selectedClass.attendanceType
    );
    if (!dayCheck.valid) {
      errors.push(dayCheck.message || 'Invalid day for this class attendance type');
    }
    
    // Check 1: Class clash
    if (TeachingConstraintSolver.checkClassClash(sessionsToCheck, sessionData)) {
      errors.push('Class clash detected: This class already has a session at this time on this day');
    }
    
    // Check 2: Venue availability
    if (!TeachingConstraintSolver.checkVenueAvailability(sessionsToCheck, sessionData)) {
      errors.push('Venue conflict: The selected venue is already occupied at this time');
    }
    
    // Check 3: Venue capacity
    if (selectedVenue.teachingCapacity < selectedClass.studentCount) {
      errors.push(`Venue capacity (${selectedVenue.teachingCapacity}) is less than class size (${selectedClass.studentCount})`);
    }
    
    // Check 4: Lab venue type
    if (formData.sessionType === 'lab' && selectedVenue.type !== 'laboratory') {
      warnings.push('Lab session scheduled in a non-laboratory venue');
    }
    
    // Check 5: Lecturer availability (simplified check)
    const lecturerSessions = sessionsToCheck.filter(
      s => s.lecturerId === formData.lecturerId && s.day === formData.day
    );
    
    for (const session of lecturerSessions) {
      const overlap = TeachingConstraintSolver['timeOverlaps'](
        session.startTime, session.endTime,
        formData.startTime, formData.endTime
      );
      if (overlap) {
        errors.push('Lecturer conflict: The lecturer has another session at this time');
        break;
      }
    }
    
    const isValid = errors.length === 0;
    setValidationResult({ isValid, errors, warnings });
    return isValid;
  };
  
  const handleSubmit = () => {
    if (!validateSession()) {
      return;
    }
    
    const selectedCourse = courses.find(c => c.id === formData.courseId)!;
    const selectedClass = classes.find(c => c.id === formData.classId)!;
    const selectedVenue = venues.find(v => v.id === formData.venueId)!;
    const selectedLecturer = lecturers.find(l => l.id === formData.lecturerId)!;
    
    const sessionData: Omit<TeachingSession, 'id'> = {
      courseId: formData.courseId,
      courseName: selectedCourse.title,
      classId: formData.classId,
      className: selectedClass.name,
      lecturerId: formData.lecturerId,
      lecturerName: selectedLecturer.name,
      venueId: formData.venueId,
      venueName: selectedVenue.name,
      day: formData.day,
      startTime: formData.startTime,
      endTime: formData.endTime,
      sessionType: formData.sessionType,
      weeklyRecurrence: true,
    };
    
    onSubmit(sessionData);
  };
  
  // Filter courses by selected lecturer
  const availableCourses = formData.lecturerId 
    ? courses.filter(c => c.lecturerId === formData.lecturerId)
    : courses;
  
  // Get allowed days based on selected class's attendance type
  const selectedClass = classes.find(c => c.id === formData.classId);
  const allowedDays = selectedClass 
    ? ATTENDANCE_TYPE_DAYS[selectedClass.attendanceType]
    : ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-[#4F4F4F]">
            {editSession ? 'Edit Teaching Session' : 'Add Teaching Session'}
          </h2>
          <button
            onClick={onClose}
            className="text-[#828282] hover:text-[#4F4F4F] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Body */}
        <div className="px-6 py-6 space-y-6">
          {/* Validation Results */}
          {validationResult && (
            <div className={`p-4 rounded-xl border ${
              validationResult.isValid 
                ? 'bg-[#6FCF97]/10 border-[#6FCF97]/20' 
                : 'bg-[#EB5757]/10 border-[#EB5757]/20'
            }`}>
              <div className="flex items-start gap-3">
                {validationResult.isValid ? (
                  <CheckCircle className="w-5 h-5 text-[#6FCF97] flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-[#EB5757] flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <h4 className={`font-semibold ${
                    validationResult.isValid ? 'text-[#6FCF97]' : 'text-[#EB5757]'
                  }`}>
                    {validationResult.isValid ? 'Validation Passed' : 'Validation Errors'}
                  </h4>
                  {validationResult.errors.length > 0 && (
                    <ul className="mt-2 space-y-1 text-sm text-[#EB5757]">
                      {validationResult.errors.map((error, idx) => (
                        <li key={idx}>• {error}</li>
                      ))}
                    </ul>
                  )}
                  {validationResult.warnings.length > 0 && (
                    <ul className="mt-2 space-y-1 text-sm text-[#F2C94C]">
                      {validationResult.warnings.map((warning, idx) => (
                        <li key={idx}>⚠ {warning}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Lecturer */}
            <div>
              <label className="block text-sm font-semibold text-[#4F4F4F] mb-2">
                Lecturer *
              </label>
              <select
                value={formData.lecturerId}
                onChange={(e) => handleChange('lecturerId', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B7EFF]/50 focus:border-[#5B7EFF] bg-[#FAFBFD]"
              >
                <option value="">Select Lecturer</option>
                {lecturers.map(lecturer => (
                  <option key={lecturer.id} value={lecturer.id}>
                    {lecturer.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Course */}
            <div>
              <label className="block text-sm font-semibold text-[#4F4F4F] mb-2">
                Course *
              </label>
              <select
                value={formData.courseId}
                onChange={(e) => handleChange('courseId', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B7EFF]/50 focus:border-[#5B7EFF] bg-[#FAFBFD]"
                disabled={!formData.lecturerId}
              >
                <option value="">Select Course</option>
                {availableCourses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.code} - {course.title}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Class */}
            <div>
              <label className="block text-sm font-semibold text-[#4F4F4F] mb-2">
                Class *
              </label>
              <select
                value={formData.classId}
                onChange={(e) => handleChange('classId', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B7EFF]/50 focus:border-[#5B7EFF] bg-[#FAFBFD]"
              >
                <option value="">Select Class</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({cls.studentCount} students)
                  </option>
                ))}
              </select>
            </div>
            
            {/* Session Type */}
            <div>
              <label className="block text-sm font-semibold text-[#4F4F4F] mb-2">
                Session Type *
              </label>
              <select
                value={formData.sessionType}
                onChange={(e) => handleChange('sessionType', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B7EFF]/50 focus:border-[#5B7EFF] bg-[#FAFBFD]"
              >
                <option value="lecture">Lecture</option>
                <option value="lab">Lab</option>
                <option value="tutorial">Tutorial</option>
              </select>
            </div>
            
            {/* Venue */}
            <div>
              <label className="block text-sm font-semibold text-[#4F4F4F] mb-2">
                Venue *
              </label>
              <select
                value={formData.venueId}
                onChange={(e) => handleChange('venueId', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B7EFF]/50 focus:border-[#5B7EFF] bg-[#FAFBFD]"
              >
                <option value="">Select Venue</option>
                {venues.map(venue => (
                  <option key={venue.id} value={venue.id}>
                    {venue.name} (🏫 {venue.teachingCapacity})
                  </option>
                ))}
              </select>
              {formData.venueId && selectedClass && venues.find(v => v.id === formData.venueId) && (
                <p className="text-xs text-gray-600 mt-1.5">
                  Teaching: {venues.find(v => v.id === formData.venueId)!.teachingCapacity} | 
                  Exam: {venues.find(v => v.id === formData.venueId)!.examCapacity}
                </p>
              )}
            </div>
            
            {/* Day */}
            <div>
              <label className="block text-sm font-semibold text-[#4F4F4F] mb-2">
                Day *
              </label>
              <select
                value={formData.day}
                onChange={(e) => handleChange('day', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B7EFF]/50 focus:border-[#5B7EFF] bg-[#FAFBFD]"
              >
                {allowedDays.map(day => (
                  <option key={day} value={day}>
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Start Time */}
            <div>
              <label className="block text-sm font-semibold text-[#4F4F4F] mb-2">
                Start Time *
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => handleChange('startTime', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B7EFF]/50 focus:border-[#5B7EFF] bg-[#FAFBFD]"
              />
            </div>
            
            {/* End Time */}
            <div>
              <label className="block text-sm font-semibold text-[#4F4F4F] mb-2">
                End Time *
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => handleChange('endTime', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B7EFF]/50 focus:border-[#5B7EFF] bg-[#FAFBFD]"
              />
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <Button
            variant="secondary"
            onClick={validateSession}
          >
            Validate Constraints
          </Button>
          
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              {editSession ? 'Update Session' : 'Add Session'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeachingSessionModal;
