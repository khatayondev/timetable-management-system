import React, { useState } from 'react';
import { useForm } from 'react-hook-form@7.55.0';
import { Venue, VenueType, FurnitureType, NoiseLevel } from '../../context/VenueContext';
import Button from '../common/Button';
import { X, AlertCircle, Building2, Users, GraduationCap } from 'lucide-react';

interface VenueFormProps {
  initialData?: Venue;
  onSubmit: (data: Omit<Venue, 'id'>) => void;
  onCancel: () => void;
}

const VenueForm = ({ initialData, onSubmit, onCancel }: VenueFormProps) => {
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    defaultValues: initialData || {
      name: '',
      code: '',
      type: 'lecture_hall' as VenueType,
      teachingCapacity: 50,
      examCapacity: 25,
      building: '',
      floor: 1,
      attributes: {
        specializedSoftware: [],
        equipment: [],
        furnitureType: 'tablet_chair' as FurnitureType,
        noiseLevel: 'quiet' as NoiseLevel,
        examSuitable: true,
        hasProjector: true,
        hasAC: true,
        hasWhiteboard: true,
      },
      allowedDepartments: [],
      availability: {
        monday: [{ start: '08:00', end: '17:00' }],
        tuesday: [{ start: '08:00', end: '17:00' }],
        wednesday: [{ start: '08:00', end: '17:00' }],
        thursday: [{ start: '08:00', end: '17:00' }],
        friday: [{ start: '08:00', end: '17:00' }],
      },
      tags: [],
    },
  });

  const [equipment, setEquipment] = useState<string[]>(initialData?.attributes.equipment || []);
  const [software, setSoftware] = useState<string[]>(initialData?.attributes.specializedSoftware || []);
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [newEquipment, setNewEquipment] = useState('');
  const [newSoftware, setNewSoftware] = useState('');
  const [newTag, setNewTag] = useState('');

  const teachingCapacity = watch('teachingCapacity');
  const examCapacity = watch('examCapacity');
  const venueType = watch('type');
  const examSuitable = watch('attributes.examSuitable');

  // Validate that exam capacity doesn't exceed teaching capacity
  const capacityError = examCapacity && teachingCapacity && examCapacity > teachingCapacity
    ? 'Exam capacity cannot exceed teaching capacity'
    : null;

  const handleFormSubmit = (data: any) => {
    if (capacityError) {
      return;
    }

    onSubmit({
      ...data,
      teachingCapacity: parseInt(data.teachingCapacity),
      examCapacity: parseInt(data.examCapacity),
      floor: parseInt(data.floor),
      attributes: {
        ...data.attributes,
        equipment,
        specializedSoftware: software,
      },
      tags,
    });
  };

  const addEquipment = () => {
    if (newEquipment.trim()) {
      setEquipment([...equipment, newEquipment.trim()]);
      setNewEquipment('');
    }
  };

  const addSoftware = () => {
    if (newSoftware.trim()) {
      setSoftware([...software, newSoftware.trim()]);
      setNewSoftware('');
    }
  };

  const addTag = () => {
    if (newTag.trim()) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  // Auto-adjust exam capacity based on venue type
  const handleVenueTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value as VenueType;
    setValue('type', type);
    
    // Set default exam suitability based on venue type
    if (type === 'workshop') {
      setValue('attributes.examSuitable', false);
      setValue('examCapacity', 0);
    } else if (type === 'exam_hall') {
      setValue('attributes.examSuitable', true);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Information Section */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-600" />
          Basic Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Venue Name *
            </label>
            <input
              {...register('name', { required: 'Venue name is required' })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="e.g., Main Lecture Hall A"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.name.message as string}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Venue Code *
            </label>
            <input
              {...register('code', { required: 'Venue code is required' })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="e.g., LH-A"
            />
            {errors.code && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.code.message as string}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Venue Type *
            </label>
            <select
              {...register('type', { required: 'Venue type is required' })}
              onChange={handleVenueTypeChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="lecture_hall">Lecture Hall</option>
              <option value="laboratory">Laboratory</option>
              <option value="workshop">Workshop</option>
              <option value="tutorial_room">Tutorial Room</option>
              <option value="exam_hall">Exam Hall</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Building *
            </label>
            <input
              {...register('building', { required: 'Building is required' })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="e.g., Academic Block 1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Floor *
            </label>
            <input
              type="number"
              {...register('floor', { required: 'Floor is required', min: 0 })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="e.g., 1"
            />
          </div>
        </div>
      </div>

      {/* Capacity Configuration Section */}
      <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Capacity Configuration
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Teaching Capacity *
              </span>
            </label>
            <input
              type="number"
              {...register('teachingCapacity', { 
                required: 'Teaching capacity is required', 
                min: { value: 1, message: 'Capacity must be at least 1' }
              })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="e.g., 150"
            />
            <p className="mt-1 text-xs text-gray-500">
              Maximum students for teaching sessions
            </p>
            {errors.teachingCapacity && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.teachingCapacity.message as string}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Exam Capacity *
              </span>
            </label>
            <input
              type="number"
              {...register('examCapacity', { 
                required: 'Exam capacity is required', 
                min: { value: 0, message: 'Capacity cannot be negative' }
              })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="e.g., 75"
              disabled={!examSuitable}
            />
            <p className="mt-1 text-xs text-gray-500">
              Maximum students for exams (tighter seating). Set to 0 if not exam-suitable.
            </p>
            {capacityError && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {capacityError}
              </p>
            )}
            {errors.examCapacity && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.examCapacity.message as string}
              </p>
            )}
          </div>
        </div>

        {/* Capacity Info Banner */}
        {teachingCapacity && examCapacity && (
          <div className="bg-white border border-blue-300 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-gray-700">
                <p className="font-medium mb-1">Capacity Guidelines:</p>
                <ul className="list-disc list-inside space-y-0.5 text-gray-600">
                  <li>Teaching capacity is for normal lectures with standard seating</li>
                  <li>Exam capacity accounts for social distancing and exam regulations</li>
                  <li>Exam capacity is typically 40-60% of teaching capacity</li>
                  <li>Current ratio: {Math.round((examCapacity / teachingCapacity) * 100)}%</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Attributes Section */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-gray-900">Attributes & Facilities</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Furniture Type *
            </label>
            <select
              {...register('attributes.furnitureType', { required: 'Furniture type is required' })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="flat_table">Flat Tables</option>
              <option value="tablet_chair">Tablet Chairs</option>
              <option value="bench">Benches</option>
              <option value="lab_station">Lab Stations</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Noise Level *
            </label>
            <select
              {...register('attributes.noiseLevel', { required: 'Noise level is required' })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="quiet">Quiet</option>
              <option value="moderate">Moderate</option>
              <option value="workshop_zone">Workshop Zone</option>
            </select>
          </div>
        </div>

        {/* Facility Checkboxes */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register('attributes.examSuitable')}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Exam Suitable</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register('attributes.hasProjector')}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Projector</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register('attributes.hasAC')}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Air Conditioning</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register('attributes.hasWhiteboard')}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Whiteboard</span>
          </label>
        </div>
      </div>

      {/* Equipment Section */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">Equipment</label>
        <div className="flex gap-2">
          <input
            value={newEquipment}
            onChange={(e) => setNewEquipment(e.target.value)}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Add equipment..."
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEquipment())}
          />
          <Button type="button" onClick={addEquipment} size="sm">
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {equipment.map((item, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
            >
              {item}
              <button
                type="button"
                onClick={() => setEquipment(equipment.filter((_, i) => i !== index))}
                className="hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Software Section (for labs) */}
      {(venueType === 'laboratory' || venueType === 'workshop') && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Specialized Software</label>
          <div className="flex gap-2">
            <input
              value={newSoftware}
              onChange={(e) => setNewSoftware(e.target.value)}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Add software..."
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSoftware())}
            />
            <Button type="button" onClick={addSoftware} size="sm">
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {software.map((item, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
              >
                {item}
                <button
                  type="button"
                  onClick={() => setSoftware(software.filter((_, i) => i !== index))}
                  className="hover:bg-green-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tags Section */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">Tags</label>
        <div className="flex gap-2">
          <input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Add tag..."
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
          />
          <Button type="button" onClick={addTag} size="sm">
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
            >
              {tag}
              <button
                type="button"
                onClick={() => setTags(tags.filter((_, i) => i !== index))}
                className="hover:bg-purple-200 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!!capacityError}>
          {initialData ? 'Update Venue' : 'Create Venue'}
        </Button>
      </div>
    </form>
  );
};

export default VenueForm;
