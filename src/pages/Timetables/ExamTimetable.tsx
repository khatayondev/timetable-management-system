import React, { useState } from 'react';
import { useTimetables } from '../../context/TimetableContext';
import { useCourses } from '../../context/CourseContext';
import { useVenues } from '../../context/VenueContext';
import { useClasses } from '../../context/ClassContext';
import { useOrganization } from '../../context/OrganizationContext';
import { useLecturers } from '../../context/LecturerContext';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import AutoGenerateModal, { GenerationScope } from '../../components/modals/AutoGenerateModal';
import { Calendar, Download, Eye, Sparkles } from 'lucide-react';
import { autoGenerateTimetable } from '../../utils/autoGenerationEngine';
import { toast } from 'sonner@2.0.3';

const ExamTimetable = () => {
  const { user } = useAuth();
  const { timetables } = useTimetables();
  const { courses } = useCourses();
  const { venues } = useVenues();
  const { classes } = useClasses();
  const { departments, faculties } = useOrganization();
  const { lecturers } = useLecturers();
  const [showAutoGenerateModal, setShowAutoGenerateModal] = useState(false);

  const examTimetables = timetables.filter(t => t.type === 'exam');
  const activeTimetable = examTimetables.find(t => t.status === 'published') || examTimetables[0];

  // Check if user can auto-generate
  const canAutoGenerate = user?.role === 'admin' || user?.role === 'registry' || user?.role === 'superadmin';

  const handleAutoGenerate = (scope: GenerationScope, targetId?: string) => {
    toast.loading('Generating exam timetable...', { id: 'generate' });

    try {
      const result = autoGenerateTimetable(
        scope,
        targetId,
        courses,
        classes,
        venues,
        lecturers,
        departments,
        faculties,
        {
          mode: 'exam',
          academicYear: activeTimetable?.academicYear || '2023/2024',
          semester: 1,
        }
      );

      if (result.success) {
        toast.success(
          `Successfully generated ${result.sessions.length} exam sessions!`,
          { id: 'generate' }
        );
        
        if (result.warnings.length > 0) {
          toast.info(`${result.warnings.length} warnings - check console for details`);
          console.log('Warnings:', result.warnings);
        }

        // In a real app, you would save these sessions to the timetable
      } else {
        toast.error(
          `Generation failed: ${result.conflicts.length} conflicts found`,
          { id: 'generate' }
        );
        console.log('Conflicts:', result.conflicts);
      }
    } catch (error) {
      toast.error('Generation failed. Please try again.', { id: 'generate' });
      console.error('Generation error:', error);
    }
  };

  const getCourseInfo = (courseId: string) => courses.find(c => c.id === courseId);
  const getVenueInfo = (venueId: string) => venues.find(v => v.id === venueId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exam Timetable</h1>
          <p className="text-gray-600 mt-1">View and manage exam schedules</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          {canAutoGenerate && (
            <Button
              onClick={() => setShowAutoGenerateModal(true)}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md hover:opacity-90"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Auto-Generate
            </Button>
          )}
        </div>
      </div>

      {activeTimetable && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{activeTimetable.name}</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {activeTimetable.academicYear} • Version {activeTimetable.version}
                </p>
              </div>
              <StatusBadge status={activeTimetable.status} />
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {activeTimetable.examSessions?.map((session) => {
                const course = getCourseInfo(session.courseId);
                const venue = getVenueInfo(session.venueId);

                return (
                  <div key={session.id} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {course?.code} - {course?.name}
                        </h3>
                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          <p>
                            <span className="font-medium">Date:</span> {session.date}
                          </p>
                          <p>
                            <span className="font-medium">Time:</span> {session.startTime} - {session.endTime}
                          </p>
                          <p>
                            <span className="font-medium">Venue:</span> {venue?.name} ({venue?.code})
                          </p>
                          <p>
                            <span className="font-medium">Exam Capacity:</span> {venue?.examCapacity} students
                          </p>
                          <p>
                            <span className="font-medium">Groups:</span> {session.studentGroups?.join(', ') || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                        Exam
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      )}

      {examTimetables.length === 0 && (
        <Card>
          <CardBody className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No exam timetables available</h3>
            <p className="text-gray-600">Exam timetables will appear here once created.</p>
          </CardBody>
        </Card>
      )}

      {showAutoGenerateModal && (
        <AutoGenerateModal
          isOpen={showAutoGenerateModal}
          onClose={() => setShowAutoGenerateModal(false)}
          onGenerate={handleAutoGenerate}
          mode="exam"
        />
      )}
    </div>
  );
};

export default ExamTimetable;