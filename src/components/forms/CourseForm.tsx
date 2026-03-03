import React, { useState } from 'react';
import { useForm } from 'react-hook-form@7.55.0';
import { Course } from '../../context/CourseContext';
import { useLecturers } from '../../context/LecturerContext';
import { useOrganization } from '../../context/OrganizationContext';
import Button from '../common/Button';

interface CourseFormProps {
  initialData?: Course;
  onSubmit: (data: Omit<Course, 'id'>) => void;
  onCancel: () => void;
}

const CourseForm = ({ initialData, onSubmit, onCancel }: CourseFormProps) => {
  const { lecturers } = useLecturers();
  const { faculties, departments } = useOrganization();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: initialData || {
      code: '',
      title: '',
      departmentId: '',
      facultyId: '',
      program: '',
      semester: 1,
      creditHours: 3,
      level: 100,
      courseType: 'lecture',
      lectureDuration: 120,
      labDuration: 0,
      tutorialDuration: 0,
      examType: 'theory',
      examDuration: 180,
      lecturerId: '',
      assignedLecturerIds: [],
      assignedClasses: [],
      requiresSpecializedLab: false,
      requiredSoftware: [],
      requiredEquipment: [],
      prerequisites: [],
    },
  });

  const [studentGroups, setStudentGroups] = useState<string[]>(
    initialData?.assignedClasses?.map(c => c.className) || []
  );
  const [newGroup, setNewGroup] = useState('');
  
  // Watch faculty selection to filter departments
  const selectedFacultyId = watch('facultyId');
  const selectedDepartmentId = watch('departmentId');

  // Filter departments based on selected faculty
  const filteredDepartments = selectedFacultyId 
    ? departments.filter(d => d.facultyId === selectedFacultyId)
    : [];

  // Update department name when department changes
  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const deptId = e.target.value;
    const dept = departments.find(d => d.id === deptId);
    setValue('departmentId', deptId);
    if (dept) {
      setValue('departmentName' as any, dept.name);
    }
  };

  // Update faculty when faculty changes
  const handleFacultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const facId = e.target.value;
    const fac = faculties.find(f => f.id === facId);
    setValue('facultyId', facId);
    if (fac) {
      setValue('facultyName' as any, fac.name);
    }
    // Reset department when faculty changes
    setValue('departmentId', '');
  };

  const handleFormSubmit = (data: any) => {
    // Get selected lecturer name
    const lecturer = lecturers.find(l => l.id === data.lecturerId);
    
    onSubmit({
      ...data,
      semester: parseInt(data.semester),
      creditHours: parseInt(data.creditHours),
      level: parseInt(data.level),
      lectureDuration: parseInt(data.lectureDuration),
      labDuration: parseInt(data.labDuration),
      tutorialDuration: parseInt(data.tutorialDuration),
      examDuration: parseInt(data.examDuration),
      lecturerName: lecturer?.name || '',
      assignedLecturerIds: data.lecturerId ? [data.lecturerId] : [],
      assignedClasses: [],
      requiredSoftware: [],
      requiredEquipment: [],
      prerequisites: [],
    });
  };

  const addGroup = () => {
    if (newGroup.trim() && !studentGroups.includes(newGroup.trim())) {
      setStudentGroups([...studentGroups, newGroup.trim()]);
      setNewGroup('');
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Organizational Hierarchy */}
      <div>
        <h3 className="text-sm font-semibold text-[#4F4F4F] mb-4">Organizational Structure</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#4F4F4F] mb-2">
              Faculty *
            </label>
            <select
              {...register('facultyId', { required: 'Faculty is required' })}
              onChange={handleFacultyChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5B7EFF] focus:ring-opacity-50 focus:border-[#5B7EFF] bg-white"
            >
              <option value="">Select Faculty</option>
              {faculties.map(faculty => (
                <option key={faculty.id} value={faculty.id}>
                  {faculty.name}
                </option>
              ))}
            </select>
            {errors.facultyId && (
              <p className="mt-1 text-sm text-red-600">{errors.facultyId.message as string}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4F4F4F] mb-2">
              Department *
            </label>
            <select
              {...register('departmentId', { required: 'Department is required' })}
              onChange={handleDepartmentChange}
              disabled={!selectedFacultyId}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5B7EFF] focus:ring-opacity-50 focus:border-[#5B7EFF] bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Select Department</option>
              {filteredDepartments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
            {errors.departmentId && (
              <p className="mt-1 text-sm text-red-600">{errors.departmentId.message as string}</p>
            )}
            {!selectedFacultyId && (
              <p className="mt-1 text-xs text-[#828282]">Please select a faculty first</p>
            )}
          </div>
        </div>
      </div>

      {/* Course Basic Information */}
      <div className="border-t pt-6">
        <h3 className="text-sm font-semibold text-[#4F4F4F] mb-4">Course Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#4F4F4F] mb-2">
              Course Code *
            </label>
            <input
              {...register('code', { required: 'Course code is required' })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5B7EFF] focus:ring-opacity-50 focus:border-[#5B7EFF]"
              placeholder="e.g., CS301"
            />
            {errors.code && (
              <p className="mt-1 text-sm text-red-600">{errors.code.message as string}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4F4F4F] mb-2">
              Course Title *
            </label>
            <input
              {...register('title', { required: 'Course title is required' })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5B7EFF] focus:ring-opacity-50 focus:border-[#5B7EFF]"
              placeholder="e.g., Data Structures and Algorithms"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message as string}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4F4F4F] mb-2">
              Program *
            </label>
            <input
              {...register('program', { required: 'Program is required' })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5B7EFF] focus:ring-opacity-50 focus:border-[#5B7EFF]"
              placeholder="e.g., Computer Science"
            />
            {errors.program && (
              <p className="mt-1 text-sm text-red-600">{errors.program.message as string}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4F4F4F] mb-2">
              Level *
            </label>
            <select
              {...register('level', { required: 'Level is required' })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5B7EFF] focus:ring-opacity-50 focus:border-[#5B7EFF] bg-white"
            >
              <option value="">Select Level</option>
              <option value="100">Level 100</option>
              <option value="200">Level 200</option>
              <option value="300">Level 300</option>
              <option value="400">Level 400</option>
            </select>
            {errors.level && (
              <p className="mt-1 text-sm text-red-600">{errors.level.message as string}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4F4F4F] mb-2">
              Semester *
            </label>
            <select
              {...register('semester', { required: 'Semester is required' })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5B7EFF] focus:ring-opacity-50 focus:border-[#5B7EFF] bg-white"
            >
              <option value="">Select Semester</option>
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
            </select>
            {errors.semester && (
              <p className="mt-1 text-sm text-red-600">{errors.semester.message as string}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4F4F4F] mb-2">
              Credit Hours *
            </label>
            <input
              type="number"
              {...register('creditHours', { required: 'Credit hours is required', min: 1 })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5B7EFF] focus:ring-opacity-50 focus:border-[#5B7EFF]"
              placeholder="e.g., 3"
            />
            {errors.creditHours && (
              <p className="mt-1 text-sm text-red-600">{errors.creditHours.message as string}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[#4F4F4F] mb-2">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5B7EFF] focus:ring-opacity-50 focus:border-[#5B7EFF]"
              placeholder="Brief description of the course..."
            />
          </div>
        </div>
      </div>

      {/* Course Type and Durations */}
      <div className="border-t pt-6">
        <h3 className="text-sm font-semibold text-[#4F4F4F] mb-4">Course Type & Session Durations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#4F4F4F] mb-2">
              Course Type *
            </label>
            <select
              {...register('courseType', { required: 'Course type is required' })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5B7EFF] focus:ring-opacity-50 focus:border-[#5B7EFF] bg-white"
            >
              <option value="lecture">Lecture Only</option>
              <option value="lab">Lab Only</option>
              <option value="tutorial">Tutorial Only</option>
              <option value="mixed">Mixed (Lecture + Lab/Tutorial)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4F4F4F] mb-2">
              Lecturer *
            </label>
            <select
              {...register('lecturerId', { required: 'Lecturer is required' })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5B7EFF] focus:ring-opacity-50 focus:border-[#5B7EFF] bg-white"
            >
              <option value="">Select Lecturer</option>
              {lecturers.map(lecturer => (
                <option key={lecturer.id} value={lecturer.id}>{lecturer.name}</option>
              ))}
            </select>
            {errors.lecturerId && (
              <p className="mt-1 text-sm text-red-600">{errors.lecturerId.message as string}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <div>
            <label className="block text-sm font-medium text-[#4F4F4F] mb-2">
              Lecture Duration (min)
            </label>
            <input
              type="number"
              {...register('lectureDuration', { min: 0 })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5B7EFF] focus:ring-opacity-50 focus:border-[#5B7EFF]"
              placeholder="120"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4F4F4F] mb-2">
              Lab Duration (min)
            </label>
            <input
              type="number"
              {...register('labDuration', { min: 0 })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5B7EFF] focus:ring-opacity-50 focus:border-[#5B7EFF]"
              placeholder="180"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4F4F4F] mb-2">
              Tutorial Duration (min)
            </label>
            <input
              type="number"
              {...register('tutorialDuration', { min: 0 })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5B7EFF] focus:ring-opacity-50 focus:border-[#5B7EFF]"
              placeholder="60"
            />
          </div>
        </div>
      </div>

      {/* Exam Configuration */}
      <div className="border-t pt-6">
        <h3 className="text-sm font-semibold text-[#4F4F4F] mb-4">Exam Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#4F4F4F] mb-2">
              Exam Type *
            </label>
            <select
              {...register('examType', { required: 'Exam type is required' })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5B7EFF] focus:ring-opacity-50 focus:border-[#5B7EFF] bg-white"
            >
              <option value="theory">Theory Only</option>
              <option value="practical">Practical Only</option>
              <option value="both">Both Theory & Practical</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4F4F4F] mb-2">
              Exam Duration (min) *
            </label>
            <input
              type="number"
              {...register('examDuration', { required: 'Exam duration is required', min: 30 })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5B7EFF] focus:ring-opacity-50 focus:border-[#5B7EFF]"
              placeholder="180"
            />
            {errors.examDuration && (
              <p className="mt-1 text-sm text-red-600">{errors.examDuration.message as string}</p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register('requiresSpecializedLab')}
              className="rounded border-gray-300 text-[#5B7EFF] focus:ring-[#5B7EFF]"
            />
            <span className="text-sm text-[#4F4F4F]">Requires Specialized Lab</span>
          </label>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialData ? 'Update Course' : 'Create Course'}
        </Button>
      </div>
    </form>
  );
};

export default CourseForm;
