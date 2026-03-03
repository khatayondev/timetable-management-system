import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useForm } from 'react-hook-form@7.55.0';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useTimetable, Lecturer } from '../../context/TimetableContext';
import { Save, X } from 'lucide-react';

type LecturerFormData = Omit<Lecturer, 'id'>;

export default function LecturerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lecturers, addLecturer, updateLecturer } = useTimetable();
  const isEditing = !!id;

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<LecturerFormData>({
    defaultValues: {
      name: '',
      email: '',
      department: '',
      availability: {},
      courses: [],
    },
  });

  // Load existing lecturer data if editing
  useEffect(() => {
    if (isEditing) {
      const lecturer = lecturers.find(l => l.id === id);
      if (lecturer) {
        setValue('name', lecturer.name);
        setValue('email', lecturer.email);
        setValue('department', lecturer.department);
      }
    }
  }, [id, isEditing, lecturers, setValue]);

  const onSubmit = (data: LecturerFormData) => {
    if (isEditing) {
      updateLecturer(id!, data);
    } else {
      addLecturer(data);
    }
    navigate('/lecturers');
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Edit Lecturer' : 'Add New Lecturer'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditing ? 'Update lecturer information' : 'Create a new lecturer profile'}
            </p>
          </div>
          <button
            onClick={() => navigate('/lecturers')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <X size={20} />
            <span>Cancel</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h2 className="font-semibold text-lg text-gray-900 pb-2 border-b border-gray-200">
              Personal Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('name', { required: 'Name is required' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Dr. Sarah Johnson"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="sarah.johnson@university.edu"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('department', { required: 'Department is required' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Computer Science"
                />
                {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department.message}</p>}
              </div>
            </div>
          </div>

          {/* Info Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              After creating the lecturer profile, you can set their availability schedule from the lecturers list
              page.
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/lecturers')}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save size={20} />
              <span>{isEditing ? 'Update Lecturer' : 'Create Lecturer'}</span>
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}