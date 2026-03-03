import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useOrganization } from '../../context/OrganizationContext';
import { useClasses } from '../../context/ClassContext';
import { useCourses } from '../../context/CourseContext';
import { useVenues } from '../../context/VenueContext';
import { useLecturers } from '../../context/LecturerContext';
import { useTimetables } from '../../context/TimetableContext';
import { 
  TeachingTimetableGenerator, 
  ExamTimetableGenerator,
  GenerationLevel,
  GenerationOptions,
  GenerationPreferences 
} from '../../utils/multiLevelGenerator';
import { 
  Wand2, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  Building2,
  Users,
  GraduationCap,
  Settings,
  Download
} from 'lucide-react';
import { exportTeachingSessionsToExcel, exportExamSessionsToExcel } from '../../utils/exportUtils';

const AutoGenerateTimetable: React.FC = () => {
  const navigate = useNavigate();
  const { faculties, departments } = useOrganization();
  const { classes } = useClasses();
  const { courses } = useCourses();
  const { venues } = useVenues();
  const { lecturers } = useLecturers();
  const { addTimetable } = useTimetables();

  const [timetableType, setTimetableType] = useState<'teaching' | 'exam'>('teaching');
  const [generationLevel, setGenerationLevel] = useState<GenerationLevel>('class');
  const [targetId, setTargetId] = useState('');
  const [semester, setSemester] = useState(1);
  const [academicYear, setAcademicYear] = useState('2023/2024');
  
  // Exam-specific fields
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Generation preferences
  const [preferences, setPreferences] = useState<GenerationPreferences>({
    preferMorningSlots: false,
    avoidFridayAfternoon: true,
    maxSessionsPerDay: 5,
    gapBetweenSessions: 0,
    examStartTime: '09:00',
    examDuration: 180,
    maxExamsPerDay: 2,
    bufferBetweenExams: 60,
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<any>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Get target options based on level
  const getTargetOptions = () => {
    switch (generationLevel) {
      case 'class':
        return classes.map(c => ({ value: c.id, label: c.name }));
      case 'department':
        return departments.map(d => ({ value: d.id, label: d.name }));
      case 'faculty':
        return faculties.map(f => ({ value: f.id, label: f.name }));
      default:
        return [];
    }
  };

  const handleGenerate = async () => {
    if (!targetId) {
      alert('Please select a target for generation');
      return;
    }

    if (timetableType === 'exam' && (!startDate || !endDate)) {
      alert('Please specify exam period dates');
      return;
    }

    setIsGenerating(true);
    setGenerationResult(null);

    try {
      const options: GenerationOptions = {
        level: generationLevel,
        targetId,
        semester,
        academicYear,
        startDate: timetableType === 'exam' ? startDate : undefined,
        endDate: timetableType === 'exam' ? endDate : undefined,
        preferences,
      };

      let result;

      if (timetableType === 'teaching') {
        const generator = new TeachingTimetableGenerator(
          courses,
          classes,
          venues,
          lecturers,
          departments,
          faculties
        );
        result = await generator.generate(options);
      } else {
        const generator = new ExamTimetableGenerator(
          courses,
          classes,
          venues,
          lecturers,
          departments,
          faculties
        );
        result = await generator.generate(options);
      }

      setGenerationResult(result);
    } catch (error) {
      console.error('Generation failed:', error);
      alert('Timetable generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveTimetable = () => {
    if (!generationResult || !generationResult.success) return;

    const targetName = getTargetOptions().find(opt => opt.value === targetId)?.label || 'Unknown';
    
    const newTimetable = {
      name: `${timetableType === 'teaching' ? 'Teaching' : 'Exam'} Timetable - ${targetName} (${academicYear} S${semester})`,
      type: timetableType,
      semester,
      academicYear,
      status: 'draft' as const,
      teachingSessions: timetableType === 'teaching' ? generationResult.sessions : [],
      examSessions: timetableType === 'exam' ? generationResult.sessions : [],
      version: 1,
      createdBy: 'admin@university.edu',
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };

    addTimetable(newTimetable);
    alert('Timetable saved successfully!');
    navigate(timetableType === 'teaching' ? '/admin/timetable/teaching' : '/admin/timetable/exam');
  };

  const handleExport = () => {
    if (!generationResult) return;

    const targetName = getTargetOptions().find(opt => opt.value === targetId)?.label || 'Unknown';
    const filename = `${timetableType}_timetable_${targetName}_${academicYear}_S${semester}`;

    if (timetableType === 'teaching') {
      exportTeachingSessionsToExcel(generationResult.sessions, filename);
    } else {
      exportExamSessionsToExcel(generationResult.sessions, filename);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#4F4F4F]">Auto-Generate Timetable</h1>
          <p className="text-[#828282] mt-2">
            Automatically generate timetables at class, department, or faculty level with constraint solving
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Wand2 className="w-8 h-8 text-[#5B7EFF]" />
        </div>
      </div>

      {/* Configuration Card */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-[#4F4F4F] mb-6 flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#5B7EFF]" />
          Generation Configuration
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Timetable Type */}
          <div>
            <label className="block text-sm font-medium text-[#4F4F4F] mb-2">
              Timetable Type
            </label>
            <select
              value={timetableType}
              onChange={(e) => setTimetableType(e.target.value as 'teaching' | 'exam')}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5B7EFF] focus:border-transparent"
            >
              <option value="teaching">Teaching Timetable</option>
              <option value="exam">Exam Timetable</option>
            </select>
          </div>

          {/* Generation Level */}
          <div>
            <label className="block text-sm font-medium text-[#4F4F4F] mb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Generation Level
            </label>
            <select
              value={generationLevel}
              onChange={(e) => {
                setGenerationLevel(e.target.value as GenerationLevel);
                setTargetId('');
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5B7EFF] focus:border-transparent"
            >
              <option value="class">Single Class</option>
              <option value="department">Department</option>
              <option value="faculty">Faculty</option>
            </select>
          </div>

          {/* Target Selection */}
          <div>
            <label className="block text-sm font-medium text-[#4F4F4F] mb-2 flex items-center gap-2">
              {generationLevel === 'class' && <GraduationCap className="w-4 h-4" />}
              {generationLevel === 'department' && <Building2 className="w-4 h-4" />}
              {generationLevel === 'faculty' && <Users className="w-4 h-4" />}
              Select {generationLevel.charAt(0).toUpperCase() + generationLevel.slice(1)}
            </label>
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5B7EFF] focus:border-transparent"
            >
              <option value="">-- Select --</option>
              {getTargetOptions().map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Academic Year */}
          <div>
            <label className="block text-sm font-medium text-[#4F4F4F] mb-2">
              Academic Year
            </label>
            <input
              type="text"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              placeholder="2023/2024"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5B7EFF] focus:border-transparent"
            />
          </div>

          {/* Semester */}
          <div>
            <label className="block text-sm font-medium text-[#4F4F4F] mb-2">
              Semester
            </label>
            <select
              value={semester}
              onChange={(e) => setSemester(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5B7EFF] focus:border-transparent"
            >
              <option value={1}>Semester 1</option>
              <option value={2}>Semester 2</option>
            </select>
          </div>

          {/* Exam-specific fields */}
          {timetableType === 'exam' && (
            <>
              <div>
                <label className="block text-sm font-medium text-[#4F4F4F] mb-2">
                  Exam Period Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5B7EFF] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4F4F4F] mb-2">
                  Exam Period End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5B7EFF] focus:border-transparent"
                />
              </div>
            </>
          )}
        </div>

        {/* Advanced Preferences */}
        <div className="mt-6">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-[#5B7EFF] hover:text-[#4A6EEE] font-medium text-sm flex items-center gap-2"
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced Preferences
          </button>

          {showAdvanced && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl space-y-4">
              {timetableType === 'teaching' ? (
                <>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="preferMorning"
                      checked={preferences.preferMorningSlots}
                      onChange={(e) => setPreferences({ ...preferences, preferMorningSlots: e.target.checked })}
                      className="w-4 h-4 text-[#5B7EFF]"
                    />
                    <label htmlFor="preferMorning" className="text-sm text-[#4F4F4F]">
                      Prefer morning time slots
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="avoidFriday"
                      checked={preferences.avoidFridayAfternoon}
                      onChange={(e) => setPreferences({ ...preferences, avoidFridayAfternoon: e.target.checked })}
                      className="w-4 h-4 text-[#5B7EFF]"
                    />
                    <label htmlFor="avoidFriday" className="text-sm text-[#4F4F4F]">
                      Avoid Friday afternoons
                    </label>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-[#4F4F4F] mb-2">
                      Exam Start Time
                    </label>
                    <input
                      type="time"
                      value={preferences.examStartTime}
                      onChange={(e) => setPreferences({ ...preferences, examStartTime: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4F4F4F] mb-2">
                      Default Exam Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={preferences.examDuration}
                      onChange={(e) => setPreferences({ ...preferences, examDuration: Number(e.target.value) })}
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4F4F4F] mb-2">
                      Max Exams Per Day
                    </label>
                    <input
                      type="number"
                      value={preferences.maxExamsPerDay}
                      onChange={(e) => setPreferences({ ...preferences, maxExamsPerDay: Number(e.target.value) })}
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Generate Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !targetId}
            className="px-6 py-3 bg-gradient-to-r from-[#5B7EFF] to-[#6B88FF] text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
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

      {/* Generation Result */}
      {generationResult && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-[#4F4F4F] flex items-center gap-2">
              {generationResult.success ? (
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-500" />
              )}
              Generation Result
            </h3>
            {generationResult.success && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExport}
                  className="px-4 py-2 border border-[#5B7EFF] text-[#5B7EFF] rounded-lg hover:bg-[#5B7EFF] hover:text-white transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <button
                  onClick={handleSaveTimetable}
                  className="px-4 py-2 bg-[#5B7EFF] text-white rounded-lg hover:bg-[#4A6EEE] transition-all"
                >
                  Save Timetable
                </button>
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-[#828282]">Total Sessions</p>
              <p className="text-2xl font-bold text-[#4F4F4F]">{generationResult.metadata.totalSessions}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-[#828282]">Classes Scheduled</p>
              <p className="text-2xl font-bold text-[#4F4F4F]">{generationResult.metadata.classesScheduled}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-[#828282]">Courses</p>
              <p className="text-2xl font-bold text-[#4F4F4F]">{generationResult.metadata.coursesScheduled}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-[#828282]">Venues Used</p>
              <p className="text-2xl font-bold text-[#4F4F4F]">{generationResult.metadata.venuesUsed}</p>
            </div>
          </div>

          {/* Conflicts */}
          {generationResult.conflicts.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-[#4F4F4F] mb-3">Conflicts & Issues</h4>
              <div className="space-y-2">
                {generationResult.conflicts.map((conflict: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border-l-4 ${
                      conflict.type === 'hard'
                        ? 'bg-red-50 border-red-500'
                        : 'bg-yellow-50 border-yellow-500'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <AlertCircle className={`w-5 h-5 flex-shrink-0 ${
                        conflict.type === 'hard' ? 'text-red-500' : 'text-yellow-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#4F4F4F]">{conflict.message}</p>
                        {conflict.suggestion && (
                          <p className="text-xs text-[#828282] mt-1">Suggestion: {conflict.suggestion}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warnings */}
          {generationResult.warnings.length > 0 && (
            <div>
              <h4 className="font-semibold text-[#4F4F4F] mb-3">Warnings</h4>
              <div className="space-y-2">
                {generationResult.warnings.map((warning: string, idx: number) => (
                  <div key={idx} className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <p className="text-sm text-[#4F4F4F]">{warning}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AutoGenerateTimetable;