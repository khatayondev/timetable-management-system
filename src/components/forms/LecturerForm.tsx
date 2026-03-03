import React, { useState } from 'react';
import { useForm } from 'react-hook-form@7.55.0';
import { Lecturer } from '../../context/LecturerContext';
import Button from '../common/Button';
import { X } from 'lucide-react';

interface LecturerFormProps {
  initialData?: Lecturer;
  onSubmit: (data: Omit<Lecturer, 'id'>) => void;
  onCancel: () => void;
}

const LecturerForm = ({ initialData, onSubmit, onCancel }: LecturerFormProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initialData || {
      name: '',
      email: '',
      department: '',
      specialization: [],
      maxHoursPerWeek: 20,
      canInvigilate: true,
      availability: {
        monday: [{ start: '08:00', end: '17:00', available: true }],
        tuesday: [{ start: '08:00', end: '17:00', available: true }],
        wednesday: [{ start: '08:00', end: '17:00', available: true }],
        thursday: [{ start: '08:00', end: '17:00', available: true }],
        friday: [{ start: '08:00', end: '17:00', available: true }],
      },
    },
  });

  const [specialization, setSpecialization] = useState<string[]>(initialData?.specialization || []);
  const [newSpecialization, setNewSpecialization] = useState('');

  const handleFormSubmit = (data: any) => {
    onSubmit({
      ...data,
      specialization,
      maxHoursPerWeek: parseInt(data.maxHoursPerWeek),
    });
  };

  const addSpecialization = () => {
    if (newSpecialization.trim() && !specialization.includes(newSpecialization.trim())) {
      setSpecialization([...specialization, newSpecialization.trim()]);
      setNewSpecialization('');
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            {...register('name', { required: 'Name is required' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Dr. John Smith"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message as string}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            {...register('email', { required: 'Email is required' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., john.smith@university.edu"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message as string}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Department *
          </label>
          <input
            {...register('department', { required: 'Department is required' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Computer Science"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Hours per Week *
          </label>
          <input
            type="number"
            {...register('maxHoursPerWeek', { required: 'Max hours is required', min: 1 })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., 20"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Specialization
        </label>
        <div className="flex gap-2 mb-2">
          <input
            value={newSpecialization}
            onChange={(e) => setNewSpecialization(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Add specialization..."
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialization())}
          />
          <Button type="button" onClick={addSpecialization} size="sm">
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {specialization.map((item, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
            >
              {item}
              <button
                type="button"
                onClick={() => setSpecialization(specialization.filter((_, i) => i !== index))}
                className="hover:bg-purple-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register('canInvigilate')}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">Available for exam invigilation</span>
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialData ? 'Update Lecturer' : 'Create Lecturer'}
        </Button>
      </div>
    </form>
  );
};

export default LecturerForm;
