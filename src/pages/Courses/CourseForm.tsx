import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useForm } from 'react-hook-form@7.55.0';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useTimetable, Course } from '../../context/TimetableContext';
import { Save, X, Plus, Trash2 } from 'lucide-react';

type CourseFormData = Omit<Course, 'id'>;

export default function CourseForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { courses, lecturers, addCourse, updateCourse } = useTimetable();
  const isEditing = !!id;

  const [studentGroups, setStudentGroups] = useState<string[]>([]);
  const [newGroup, setNewGroup] = useState('');

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<CourseFormData>({
    defaultValues: {
      code: '',
      name: '',
      program: '',
      semester: 1,
      lectureDuration: 2,
      labDuration: 0,
      practicalDuration: 0,
      studentGroups: [],
      examType: 'theory',
      lecturerId: '',
    },
  });

  // Load existing course data if editing
  useEffect(() => {
    if (isEditing) {
      const course = courses.find(c => c.id === id);
      if (course) {
        setValue('code', course.code);
        setValue('name', course.name);
        setValue('program', course.program);
        setValue('semester', course.semester);
        setValue('lectureDuration', course.lectureDuration);
        setValue('labDuration', course.labDuration);
        setValue('practicalDuration', course.practicalDuration);
        setValue('examType', course.examType);
        setValue('lecturerId', course.lecturerId);
        setStudentGroups(course.studentGroups);
      }
    }
  }, [id, isEditing, courses, setValue]);

  const onSubmit = (data: CourseFormData) => {
    const courseData = {
      ...data,
      studentGroups,
    };

    if (isEditing) {
      updateCourse(id!, courseData);
    } else {
      addCourse(courseData);
    }
    navigate('/courses');
  };

  const addGroupItem = () => {
    if (newGroup.trim() && !studentGroups.includes(newGroup.trim())) {
      setStudentGroups([...studentGroups, newGroup.trim()]);
      setNewGroup('');
    }
  };

  const removeGroup = (index: number) => {
    setStudentGroups(studentGroups.filter((_, i) => i !== index));
  };

  const lectureDuration = watch('lectureDuration');
  const labDuration = watch('labDuration');
  const practicalDuration = watch('practicalDuration');
  const totalHours = (lectureDuration || 0) + (labDuration || 0) + (practicalDuration || 0);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Edit Course' : 'Add New Course'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditing ? 'Update course information' : 'Create a new course for scheduling'}
            </p>
          </div>
          <button
            onClick={() => navigate('/courses')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <X size={20} />
            <span>Cancel</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h2 className="font-semibold text-lg text-gray-900 pb-2 border-b border-gray-200">
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Code <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('code', { required: 'Course code is required' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., CS101"
                />
                {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('name', { required: 'Course name is required' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Introduction to Programming"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Program <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('program', { required: 'Program is required' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Computer Science"
                />
                {errors.program && <p className="text-red-500 text-sm mt-1">{errors.program.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Semester <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('semester', { required: 'Semester is required' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                    <option key={sem} value={sem}>
                      Semester {sem}
                    </option>
                  ))}
                </select>
                {errors.semester && <p className="text-red-500 text-sm mt-1">{errors.semester.message}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned Lecturer <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('lecturerId', { required: 'Lecturer is required' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a lecturer</option>
                  {lecturers.map(lecturer => (
                    <option key={lecturer.id} value={lecturer.id}>
                      {lecturer.name} - {lecturer.department}
                    </option>
                  ))}
                </select>
                {errors.lecturerId && <p className="text-red-500 text-sm mt-1">{errors.lecturerId.message}</p>}
              </div>
            </div>
          </div>

          {/* Class Durations */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
              <h2 className="font-semibold text-lg text-gray-900">Class Durations</h2>
              <span className="text-sm text-gray-600">Total: {totalHours} hours/week</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lecture Hours</label>
                <input
                  type="number"
                  {...register('lectureDuration', { min: 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">Hours per week</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lab Hours</label>
                <input
                  type="number"
                  {...register('labDuration', { min: 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">Hours per week</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Practical Hours</label>
                <input
                  type="number"
                  {...register('practicalDuration', { min: 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">Hours per week</p>
              </div>
            </div>
          </div>

          {/* Student Groups */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h2 className="font-semibold text-lg text-gray-900 pb-2 border-b border-gray-200">
              Student Groups
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Student Groups (e.g., Group A, Group B)
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newGroup}
                  onChange={e => setNewGroup(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addGroupItem())}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Group A"
                />
                <button
                  type="button"
                  onClick={addGroupItem}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={20} />
                  <span>Add</span>
                </button>
              </div>

              {studentGroups.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {studentGroups.map((group, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg"
                    >
                      <span className="font-medium">{group}</span>
                      <button
                        type="button"
                        onClick={() => removeGroup(index)}
                        className="hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  No groups added yet. Add groups if this course requires splitting students.
                </p>
              )}
            </div>

            {studentGroups.length > 1 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Auto-split scheduling:</strong> Classes will be automatically scheduled separately for each group.
                </p>
              </div>
            )}
          </div>

          {/* Exam Configuration */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h2 className="font-semibold text-lg text-gray-900 pb-2 border-b border-gray-200">
              Exam Configuration
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exam Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                  <input
                    type="radio"
                    {...register('examType')}
                    value="theory"
                    className="mr-3"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Theory Only</p>
                    <p className="text-xs text-gray-500">Written examination</p>
                  </div>
                </label>
                <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                  <input
                    type="radio"
                    {...register('examType')}
                    value="practical"
                    className="mr-3"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Practical Only</p>
                    <p className="text-xs text-gray-500">Lab/practical exam</p>
                  </div>
                </label>
                <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                  <input
                    type="radio"
                    {...register('examType')}
                    value="both"
                    className="mr-3"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Both</p>
                    <p className="text-xs text-gray-500">Theory + Practical</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => navigate('/courses')}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save size={20} />
              <span>{isEditing ? 'Update Course' : 'Create Course'}</span>
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}