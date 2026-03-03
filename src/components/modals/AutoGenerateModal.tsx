import React, { useState } from 'react';
import { X, Sparkles, AlertCircle } from 'lucide-react';
import Button from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import { useOrganization } from '../../context/OrganizationContext';
import { useClasses } from '../../context/ClassContext';

export type GenerationScope = 'class' | 'department' | 'faculty' | 'school';

export interface AutoGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (scope: GenerationScope, targetId?: string) => void;
  mode: 'teaching' | 'exam';
}

const AutoGenerateModal: React.FC<AutoGenerateModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  mode,
}) => {
  const { user } = useAuth();
  const { faculties, departments } = useOrganization();
  const { classes } = useClasses();
  const [selectedScope, setSelectedScope] = useState<GenerationScope>('class');
  const [selectedTargetId, setSelectedTargetId] = useState<string>('');

  if (!isOpen) return null;

  // Determine what scopes are available based on user role
  const canGenerateSchool = user?.role === 'admin' || user?.role === 'registry';
  const canGenerateFaculty = canGenerateSchool || user?.role === 'superadmin';
  const canGenerateDepartment = canGenerateFaculty || user?.role === 'superadmin';
  const canGenerateClass = canGenerateDepartment;

  const handleGenerate = () => {
    if (selectedScope === 'school') {
      onGenerate('school');
    } else {
      onGenerate(selectedScope, selectedTargetId);
    }
    onClose();
  };

  // Get target options based on scope
  const getTargetOptions = () => {
    switch (selectedScope) {
      case 'class':
        return classes.map((c) => ({ id: c.id, name: c.name }));
      case 'department':
        return departments.map((d) => ({ id: d.id, name: d.name }));
      case 'faculty':
        return faculties.map((f) => ({ id: f.id, name: f.name }));
      default:
        return [];
    }
  };

  const targetOptions = getTargetOptions();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#5B7EFF] to-[#8B5CF6] p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Auto-Generate Timetable</h2>
                <p className="text-white/80 text-sm mt-0.5">
                  {mode === 'teaching' ? 'Teaching Schedule' : 'Exam Schedule'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Info Alert */}
          <div className="flex gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">Auto-generation will respect all constraints:</p>
              <ul className="list-disc list-inside space-y-0.5 text-blue-800">
                <li>Lecturer availability and non-clash</li>
                <li>Class schedule conflicts</li>
                <li>Venue capacity and availability</li>
                <li>Department-restricted rooms</li>
                {mode === 'exam' && (
                  <>
                    <li>Invigilation rules</li>
                    <li>Student exam fatigue prevention</li>
                  </>
                )}
              </ul>
            </div>
          </div>

          {/* Scope Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-[#4F4F4F]">
              Generation Scope
            </label>
            <div className="space-y-2">
              {canGenerateClass && (
                <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-[#5B7EFF] transition-colors">
                  <input
                    type="radio"
                    name="scope"
                    value="class"
                    checked={selectedScope === 'class'}
                    onChange={(e) => setSelectedScope(e.target.value as GenerationScope)}
                    className="w-4 h-4 text-[#5B7EFF] focus:ring-[#5B7EFF]"
                  />
                  <div className="ml-3">
                    <p className="font-medium text-[#4F4F4F]">Class-Level</p>
                    <p className="text-xs text-[#828282]">Generate for a specific class</p>
                  </div>
                </label>
              )}

              {canGenerateDepartment && (
                <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-[#5B7EFF] transition-colors">
                  <input
                    type="radio"
                    name="scope"
                    value="department"
                    checked={selectedScope === 'department'}
                    onChange={(e) => setSelectedScope(e.target.value as GenerationScope)}
                    className="w-4 h-4 text-[#5B7EFF] focus:ring-[#5B7EFF]"
                  />
                  <div className="ml-3">
                    <p className="font-medium text-[#4F4F4F]">Department-Level</p>
                    <p className="text-xs text-[#828282]">Generate for all classes in a department</p>
                  </div>
                </label>
              )}

              {canGenerateFaculty && (
                <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-[#5B7EFF] transition-colors">
                  <input
                    type="radio"
                    name="scope"
                    value="faculty"
                    checked={selectedScope === 'faculty'}
                    onChange={(e) => setSelectedScope(e.target.value as GenerationScope)}
                    className="w-4 h-4 text-[#5B7EFF] focus:ring-[#5B7EFF]"
                  />
                  <div className="ml-3">
                    <p className="font-medium text-[#4F4F4F]">Faculty-Level</p>
                    <p className="text-xs text-[#828282]">Generate for all departments in a faculty</p>
                  </div>
                </label>
              )}

              {canGenerateSchool && (
                <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-[#5B7EFF] transition-colors">
                  <input
                    type="radio"
                    name="scope"
                    value="school"
                    checked={selectedScope === 'school'}
                    onChange={(e) => setSelectedScope(e.target.value as GenerationScope)}
                    className="w-4 h-4 text-[#5B7EFF] focus:ring-[#5B7EFF]"
                  />
                  <div className="ml-3">
                    <p className="font-medium text-[#4F4F4F]">Entire School</p>
                    <p className="text-xs text-[#828282]">Generate for all faculties and departments</p>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Target Selection (for non-school scopes) */}
          {selectedScope !== 'school' && targetOptions.length > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-[#4F4F4F]">
                Select {selectedScope.charAt(0).toUpperCase() + selectedScope.slice(1)}
              </label>
              <select
                value={selectedTargetId}
                onChange={(e) => setSelectedTargetId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B7EFF] focus:border-transparent text-sm bg-white"
              >
                <option value="">-- Select {selectedScope} --</option>
                {targetOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-100">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={selectedScope !== 'school' && !selectedTargetId}
            className="bg-gradient-to-r from-[#5B7EFF] to-[#8B5CF6] hover:opacity-90"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Timetable
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AutoGenerateModal;