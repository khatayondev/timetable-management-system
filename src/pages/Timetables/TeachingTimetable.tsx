import React, { useState } from 'react';
import { useTimetables } from '../../context/TimetableContext';
import { useCourses } from '../../context/CourseContext';
import { useLecturers } from '../../context/LecturerContext';
import { useVenues } from '../../context/VenueContext';
import { useClasses } from '../../context/ClassContext';
import { useOrganization } from '../../context/OrganizationContext';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import AutoGenerateModal, { GenerationScope } from '../../components/modals/AutoGenerateModal';
import { Calendar, Download, Eye, BookOpen, User as UserIcon, MapPin, Plus, Sparkles } from 'lucide-react';
import { autoGenerateTimetable } from '../../utils/autoGenerationEngine';
import { toast } from 'sonner@2.0.3';

const TeachingTimetable = () => {
  const { user } = useAuth();
  const { timetables, addTimetableEntry } = useTimetables();
  const { courses } = useCourses();
  const { lecturers } = useLecturers();
  const { venues } = useVenues();
  const { classes } = useClasses();
  const { departments, faculties } = useOrganization();
  const [viewMode, setViewMode] = useState<'program' | 'lecturer' | 'room'>('program');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [showAutoGenerateModal, setShowAutoGenerateModal] = useState(false);

  const teachingTimetables = timetables.filter(t => t.type === 'teaching');
  const activeTimetable = teachingTimetables.find(t => t.status === 'published') || teachingTimetables[0];

  // Check if user can auto-generate
  const canAutoGenerate = user?.role === 'admin' || user?.role === 'registry' || user?.role === 'superadmin';

  const handleAutoGenerate = (scope: GenerationScope, targetId?: string) => {
    toast.loading('Generating timetable...', { id: 'generate' });

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
          mode: 'teaching',
          academicYear: activeTimetable?.academicYear || '2023/2024',
          semester: 1,
        }
      );

      if (result.success) {
        toast.success(
          `Successfully generated ${result.sessions.length} sessions!`,
          { id: 'generate' }
        );
        
        if (result.warnings.length > 0) {
          toast.info(`${result.warnings.length} warnings - check console for details`);
          console.log('Warnings:', result.warnings);
        }

        // In a real app, you would save these sessions to the timetable
        // For now, we'll just show success
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

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const timeSlots = [
    '08:00 - 09:00',
    '09:00 - 10:00',
    '10:00 - 11:00',
    '11:00 - 12:00',
    '12:00 - 13:00',
    '13:00 - 14:00',
    '14:00 - 15:00',
    '15:00 - 16:00',
    '16:00 - 17:00',
  ];

  const getCourseInfo = (courseId: string) => courses.find(c => c.id === courseId);
  const getLecturerInfo = (lecturerId: string) => lecturers.find(l => l.id === lecturerId);
  const getVenueInfo = (venueId: string) => venues.find(v => v.id === venueId);

  return (
    <div className="space-y-4 md:space-y-6 pb-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="px-1">
            <h1 className="text-xl md:text-2xl font-semibold text-[#2F2E41]">Teaching Timetable</h1>
            <p className="text-gray-500 mt-1 text-xs md:text-sm">Weekly schedule for courses and classes</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {canAutoGenerate && (
              <Button
                onClick={() => setShowAutoGenerateModal(true)}
                className="flex-1 sm:flex-none bg-gradient-to-r from-[#5B5FFF] to-[#7C8FFF]"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Auto-Generate</span>
                <span className="sm:hidden">Generate</span>
              </Button>
            )}
            <Button variant="secondary" className="flex-1 sm:flex-none">
              <Download className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Export</span>
              <span className="sm:hidden">Export</span>
            </Button>
          </div>
        </div>

        {/* View Mode Tabs - Mobile Friendly */}
        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
          <button
            onClick={() => setViewMode('program')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex-shrink-0 ${
              viewMode === 'program'
                ? 'bg-[#5B5FFF] text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">By Program</span>
          </button>
          <button
            onClick={() => setViewMode('lecturer')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex-shrink-0 ${
              viewMode === 'lecturer'
                ? 'bg-[#5B5FFF] text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span className="text-sm font-medium">By Lecturer</span>
          </button>
          <button
            onClick={() => setViewMode('room')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex-shrink-0 ${
              viewMode === 'room'
                ? 'bg-[#5B5FFF] text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium">By Room</span>
          </button>
        </div>
      </div>

      {activeTimetable && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#4F4F4F]">{activeTimetable.name}</h2>
                <p className="text-sm text-[#828282] mt-1">
                  {activeTimetable.academicYear} • Version {activeTimetable.version}
                </p>
              </div>
              <StatusBadge status={activeTimetable.status} />
            </div>
          </CardHeader>
          <CardBody>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-4 md:mb-6">
              <div className="flex overflow-x-auto gap-2 scrollbar-hide">
                <button
                  onClick={() => setViewMode('program')}
                  className={`px-4 md:px-5 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                    viewMode === 'program'
                      ? 'bg-[#2F80ED] text-white shadow-md'
                      : 'bg-white text-[#828282] border border-gray-200 hover:border-[#2F80ED] hover:text-[#2F80ED]'
                  }`}
                >
                  By Program
                </button>
                <button
                  onClick={() => setViewMode('lecturer')}
                  className={`px-4 md:px-5 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                    viewMode === 'lecturer'
                      ? 'bg-[#2F80ED] text-white shadow-md'
                      : 'bg-white text-[#828282] border border-gray-200 hover:border-[#2F80ED] hover:text-[#2F80ED]'
                  }`}
                >
                  By Lecturer
                </button>
                <button
                  onClick={() => setViewMode('room')}
                  className={`px-4 md:px-5 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                    viewMode === 'room'
                      ? 'bg-[#2F80ED] text-white shadow-md'
                      : 'bg-white text-[#828282] border border-gray-200 hover:border-[#2F80ED] hover:text-[#2F80ED]'
                  }`}
                >
                  By Room
                </button>
              </div>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="w-full sm:w-auto min-w-[200px] px-3 md:px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2F80ED] focus:border-transparent text-xs md:text-sm bg-white"
              >
                <option value="all">All</option>
                {viewMode === 'program' && courses.map(c => (
                  <option key={c.id} value={c.program}>{c.program}</option>
                ))}
                {viewMode === 'lecturer' && lecturers.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
                {viewMode === 'room' && venues.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>

            <div className="overflow-x-auto scrollbar-thin -mx-4 md:mx-0 px-4 md:px-0">
              <table className="min-w-full border border-gray-100 rounded-xl overflow-hidden">
                <thead>
                  <tr>
                    <th className="px-2 md:px-4 py-3 bg-[#F8FBFF] text-left text-xs font-semibold text-[#828282] uppercase border-b border-gray-100 sticky left-0 z-10 min-w-[90px]">
                      Time
                    </th>
                    {days.map(day => (
                      <th key={day} className="px-2 md:px-4 py-3 bg-[#F8FBFF] text-center text-xs font-semibold text-[#828282] uppercase border-b border-l border-gray-100 min-w-[150px] md:min-w-[180px]">
                        <span className="hidden sm:inline">{day.charAt(0).toUpperCase() + day.slice(1)}</span>
                        <span className="sm:hidden">{day.charAt(0).toUpperCase() + day.slice(1, 3)}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((slot, slotIndex) => (
                    <tr key={slot}>
                      <td className="px-2 md:px-4 py-2 md:py-3 text-[10px] md:text-xs font-semibold text-[#828282] whitespace-nowrap border-b border-gray-100 bg-[#F8FBFF] sticky left-0 z-10">
                        <div className="hidden sm:block">{slot}</div>
                        <div className="sm:hidden">
                          <div>{slot.split(' - ')[0]}</div>
                          <div className="text-[8px]">{slot.split(' - ')[1]}</div>
                        </div>
                      </td>
                      {days.map(day => {
                        const session = activeTimetable?.teachingSessions?.find(s => 
                          s.day === day && s.startTime === slot.split(' - ')[0]
                        );
                        const course = session ? getCourseInfo(session.courseId) : null;
                        const lecturer = session ? getLecturerInfo(session.lecturerId) : null;
                        const venue = session ? getVenueInfo(session.venueId) : null;

                        return (
                          <td key={day} className="px-2 py-2 border-b border-l border-gray-100 bg-white">
                            {session && course && lecturer && venue ? (
                              <div className={`p-3 rounded-xl text-xs shadow-md border transition-all duration-200 hover:shadow-lg cursor-pointer ${
                                session.sessionType === 'lecture' ? 'bg-gradient-to-br from-[#6FCF97]/10 to-[#6FCF97]/5 border-[#6FCF97]/30' :
                                session.sessionType === 'lab' ? 'bg-gradient-to-br from-[#F2C94C]/10 to-[#F2C94C]/5 border-[#F2C94C]/30' :
                                'bg-gradient-to-br from-[#56CCF2]/10 to-[#56CCF2]/5 border-[#56CCF2]/30'
                              }`}>
                                <div className="flex items-start gap-2 mb-2">
                                  <div className={`p-1.5 rounded-lg ${
                                    session.sessionType === 'lecture' ? 'bg-[#6FCF97]/20' :
                                    session.sessionType === 'lab' ? 'bg-[#F2C94C]/20' :
                                    'bg-[#56CCF2]/20'
                                  }`}>
                                    <BookOpen className={`w-3 h-3 ${
                                      session.sessionType === 'lecture' ? 'text-[#6FCF97]' :
                                      session.sessionType === 'lab' ? 'text-[#F2C94C]' :
                                      'text-[#56CCF2]'
                                    }`} />
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-semibold text-[#4F4F4F]">{course.code}</p>
                                    <p className="text-[#828282] text-[10px] mt-0.5 line-clamp-1">{course.name}</p>
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5">
                                    <UserIcon className="w-3 h-3 text-[#828282]" />
                                    <p className="text-[#828282] text-[10px] line-clamp-1">{lecturer.name}</p>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <MapPin className="w-3 h-3 text-[#828282]" />
                                    <p className="text-[#828282] text-[10px]">{venue.code}</p>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="h-28"></div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}

      {teachingTimetables.length === 0 && (
        <Card>
          <CardBody className="text-center py-12">
            <Calendar className="w-16 h-16 text-[#828282] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#4F4F4F] mb-2">No timetables available</h3>
            <p className="text-[#828282]">Teaching timetables will appear here once created.</p>
          </CardBody>
        </Card>
      )}

      {showAutoGenerateModal && (
        <AutoGenerateModal
          isOpen={showAutoGenerateModal}
          onClose={() => setShowAutoGenerateModal(false)}
          onGenerate={handleAutoGenerate}
          mode="teaching"
        />
      )}
    </div>
  );
};

export default TeachingTimetable;