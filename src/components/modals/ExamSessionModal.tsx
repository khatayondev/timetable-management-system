import React, { useState, useEffect } from 'react';
import { useCourses } from '../../context/CourseContext';
import { useClasses } from '../../context/ClassContext';
import { useVenues } from '../../context/VenueContext';
import { useLecturers } from '../../context/LecturerContext';
import { ExamSession } from '../../context/TimetableContext';
import { ExamConstraintSolver } from '../../utils/constraintSolver';
import Button from '../common/Button';
import { X, AlertTriangle, CheckCircle, Users } from 'lucide-react';

interface ExamSessionModalProps {
  onClose: () => void;
  onSubmit: (session: Omit<ExamSession, 'id'>) => void;
  timetableId: string;
}

const ExamSessionModal = ({ onClose, onSubmit, timetableId }: ExamSessionModalProps) => {
  const { courses } = useCourses();
  const { classes } = useClasses();
  const { venues } = useVenues();
  const { lecturers } = useLecturers();
  
  const [formData, setFormData] = useState({
    courseId: '',
    classId: '',
    examType: 'theory' as 'theory' | 'practical',
    date: '',
    startTime: '09:00',
    endTime: '12:00',
    duration: 180,
    invigilators: [] as string[],
  });
  
  const [batchInfo, setBatchInfo] = useState<{
    totalBatches: number;
    allocations: Array<{ venueId: string; venueName: string; capacity: number; students: number }>;
  } | null>(null);
  
  const [availableInvigilators, setAvailableInvigilators] = useState<typeof lecturers>([]);
  
  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
    
    // Auto-calculate duration when times change
    if (field === 'startTime' || field === 'endTime') {
      const start = field === 'startTime' ? value : formData.startTime;
      const end = field === 'endTime' ? value : formData.endTime;
      const duration = calculateDuration(start, end);
      setFormData(prev => ({ ...prev, duration, [field]: value }));
    }
  };
  
  const calculateDuration = (start: string, end: string): number => {
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    return (endHour * 60 + endMin) - (startHour * 60 + startMin);
  };
  
  // Calculate batching when class or exam type changes
  useEffect(() => {
    if (formData.classId && formData.examType) {
      const selectedClass = classes.find(c => c.id === formData.classId);
      if (selectedClass) {
        const result = ExamConstraintSolver.calculateExamBatches(
          selectedClass.studentCount,
          venues,
          formData.examType
        );
        
        setBatchInfo({
          totalBatches: result.totalBatches,
          allocations: result.allocations.map(a => {
            const venue = venues.find(v => v.id === a.venueId)!;
            return {
              venueId: a.venueId,
              venueName: venue.name,
              capacity: a.capacity,
              students: a.students,
            };
          }),
        });
      }
    }
  }, [formData.classId, formData.examType, classes, venues]);
  
  // Filter available invigilators (not teaching this course)
  useEffect(() => {
    if (formData.courseId) {
      const course = courses.find(c => c.id === formData.courseId);
      if (course) {
        // Exclude the course lecturer from invigilation
        const available = lecturers.filter(l => l.id !== course.lecturerId);
        setAvailableInvigilators(available);
      }
    } else {
      setAvailableInvigilators(lecturers);
    }
  }, [formData.courseId, courses, lecturers]);
  
  const handleSubmit = () => {
    // Validation
    if (!formData.courseId || !formData.classId || !formData.date) {
      alert('Please fill in all required fields');
      return;
    }
    
    if (formData.invigilators.length === 0) {
      alert('Please assign at least one invigilator');
      return;
    }
    
    if (!batchInfo || batchInfo.allocations.length === 0) {
      alert('No suitable venues found for this exam');
      return;
    }
    
    const selectedCourse = courses.find(c => c.id === formData.courseId)!;
    const selectedClass = classes.find(c => c.id === formData.classId)!;
    
    // Create sessions for each batch
    if (batchInfo.totalBatches === 1) {
      // Single session
      const sessionData: Omit<ExamSession, 'id'> = {
        courseId: formData.courseId,
        courseName: selectedCourse.title,
        classId: formData.classId,
        className: selectedClass.name,
        studentCount: selectedClass.studentCount,
        examType: formData.examType,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        duration: formData.duration,
        venueAllocations: batchInfo.allocations,
        invigilators: formData.invigilators,
      };
      
      onSubmit(sessionData);
    } else {
      // Multiple batches - create separate sessions
      // In a real implementation, this would create multiple sessions
      // For now, create the first batch and show a message
      alert(`This exam requires ${batchInfo.totalBatches} batches. Creating batch 1 of ${batchInfo.totalBatches}. You can create remaining batches separately.`);
      
      const sessionData: Omit<ExamSession, 'id'> = {
        courseId: formData.courseId,
        courseName: selectedCourse.title,
        classId: formData.classId,
        className: selectedClass.name,
        studentCount: batchInfo.allocations[0].students,
        examType: formData.examType,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        duration: formData.duration,
        venueAllocations: [batchInfo.allocations[0]],
        batchNumber: 1,
        totalBatches: batchInfo.totalBatches,
        invigilators: formData.invigilators,
      };
      
      onSubmit(sessionData);
    }
  };
  
  const selectedClass = classes.find(c => c.id === formData.classId);
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-[#4F4F4F]">Schedule Exam Session</h2>
          <button
            onClick={onClose}
            className="text-[#828282] hover:text-[#4F4F4F] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Body */}
        <div className="px-6 py-6 space-y-6">
          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Course */}
            <div>
              <label className="block text-sm font-semibold text-[#4F4F4F] mb-2">
                Course *
              </label>
              <select
                value={formData.courseId}
                onChange={(e) => handleChange('courseId', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B7EFF]/50 focus:border-[#5B7EFF] bg-[#FAFBFD]"
              >
                <option value="">Select Course</option>
                {courses.map(course => (
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
            
            {/* Exam Type */}
            <div>
              <label className="block text-sm font-semibold text-[#4F4F4F] mb-2">
                Exam Type *
              </label>
              <select
                value={formData.examType}
                onChange={(e) => handleChange('examType', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B7EFF]/50 focus:border-[#5B7EFF] bg-[#FAFBFD]"
              >
                <option value="theory">Theory</option>
                <option value="practical">Practical</option>
              </select>
            </div>
            
            {/* Date */}
            <div>
              <label className="block text-sm font-semibold text-[#4F4F4F] mb-2">
                Exam Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B7EFF]/50 focus:border-[#5B7EFF] bg-[#FAFBFD]"
              />
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
          
          {/* Duration Display */}
          <div className="p-4 bg-[#5B7EFF]/5 rounded-xl border border-[#5B7EFF]/20">
            <p className="text-sm text-[#4F4F4F]">
              <span className="font-semibold">Exam Duration:</span> {formData.duration} minutes ({Math.floor(formData.duration / 60)}h {formData.duration % 60}m)
            </p>
          </div>
          
          {/* Batching Information */}
          {batchInfo && selectedClass && (
            <div className="p-4 bg-gradient-to-r from-[#5B7EFF]/10 to-[#7C9FFF]/10 rounded-xl border border-[#5B7EFF]/20">
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-[#5B7EFF] flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-[#4F4F4F]">Venue Allocation</h4>
                  <p className="text-sm text-[#828282] mt-1">
                    {selectedClass.studentCount} students require {batchInfo.totalBatches} batch{batchInfo.totalBatches !== 1 ? 'es' : ''}
                  </p>
                  
                  <div className="mt-3 space-y-2">
                    {batchInfo.allocations.map((allocation, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                        <div>
                          <p className="font-medium text-[#4F4F4F]">{allocation.venueName}</p>
                          <p className="text-xs text-[#828282] mt-1">
                            Capacity: {allocation.capacity} | Assigned: {allocation.students} students
                          </p>
                        </div>
                        {batchInfo.totalBatches > 1 && (
                          <span className="px-2 py-1 bg-[#5B7EFF]/20 text-[#5B7EFF] text-xs font-medium rounded">
                            Batch {idx + 1}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {batchInfo.totalBatches > 1 && (
                    <p className="text-xs text-[#F2C94C] mt-3">
                      ⚠ Multiple batches required. You'll need to schedule {batchInfo.totalBatches} separate exam sessions.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Invigilators */}
          <div>
            <label className="block text-sm font-semibold text-[#4F4F4F] mb-2">
              Assign Invigilators * (Select multiple)
            </label>
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl bg-[#FAFBFD] p-4 space-y-2">
              {availableInvigilators.length === 0 ? (
                <p className="text-sm text-[#828282] italic">
                  {formData.courseId ? 'No available invigilators (course lecturer excluded)' : 'Select a course first'}
                </p>
              ) : (
                availableInvigilators.map(lecturer => (
                  <label key={lecturer.id} className="flex items-center gap-3 cursor-pointer hover:bg-white p-2 rounded-lg transition-all">
                    <input
                      type="checkbox"
                      checked={formData.invigilators.includes(lecturer.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleChange('invigilators', [...formData.invigilators, lecturer.id]);
                        } else {
                          handleChange('invigilators', formData.invigilators.filter(id => id !== lecturer.id));
                        }
                      }}
                      className="w-4 h-4 text-[#5B7EFF] border-gray-300 rounded focus:ring-[#5B7EFF]"
                    />
                    <span className="text-sm text-[#4F4F4F]">{lecturer.name}</span>
                  </label>
                ))
              )}
            </div>
            {formData.invigilators.length > 0 && (
              <p className="text-xs text-[#828282] mt-2">
                {formData.invigilators.length} invigilator{formData.invigilators.length !== 1 ? 's' : ''} selected
              </p>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Schedule Exam
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExamSessionModal;
