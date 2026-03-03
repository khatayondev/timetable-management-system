import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useClasses, AttendanceType } from '../../context/ClassContext';
import { Card, CardBody } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { ArrowLeft, Save, Info } from 'lucide-react';

const ClassForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { classes, addClass, updateClass, getClassById } = useClasses();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    program: '',
    level: 1,
    semester: 1,
    academicYear: new Date().getFullYear().toString(),
    studentCount: 0,
    attendanceType: 'REGULAR' as AttendanceType,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (isEditMode && id) {
      const classData = getClassById(id);
      if (classData) {
        setFormData({
          name: classData.name,
          code: classData.code,
          program: classData.program,
          level: classData.level,
          semester: classData.semester,
          academicYear: classData.academicYear,
          studentCount: classData.studentCount,
          attendanceType: classData.attendanceType,
        });
      }
    }
  }, [isEditMode, id, getClassById]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'level' || name === 'semester' || name === 'studentCount' 
        ? parseInt(value) || 0 
        : value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Class name is required';
    }
    if (!formData.code.trim()) {
      newErrors.code = 'Class code is required';
    }
    if (!formData.program.trim()) {
      newErrors.program = 'Program is required';
    }
    if (formData.level < 1) {
      newErrors.level = 'Level must be at least 1';
    }
    if (formData.semester < 1 || formData.semester > 2) {
      newErrors.semester = 'Semester must be 1 or 2';
    }
    if (!formData.academicYear.trim()) {
      newErrors.academicYear = 'Academic year is required';
    }
    if (formData.studentCount < 0) {
      newErrors.studentCount = 'Student count cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    if (isEditMode && id) {
      updateClass(id, formData);
    } else {
      addClass({
        ...formData,
        students: [],
      });
    }

    navigate('/classes');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/classes')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-[#4F4F4F]">
            {isEditMode ? 'Edit Class' : 'Create New Class'}
          </h1>
          <p className="text-[#828282] mt-1">
            {isEditMode ? 'Update class information' : 'Add a new class to the system'}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-[#4F4F4F] mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Class Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2F80ED]/20 focus:border-[#2F80ED] ${
                      errors.name ? 'border-red-500' : 'border-gray-200'
                    }`}
                    placeholder="e.g., Computer Science A"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Class Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2F80ED]/20 focus:border-[#2F80ED] ${
                      errors.code ? 'border-red-500' : 'border-gray-200'
                    }`}
                    placeholder="e.g., CS-L4-A"
                  />
                  {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Program <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="program"
                    value={formData.program}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2F80ED]/20 focus:border-[#2F80ED] ${
                      errors.program ? 'border-red-500' : 'border-gray-200'
                    }`}
                  >
                    <option value="">Select Program</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="Business Administration">Business Administration</option>
                    <option value="Accounting">Accounting</option>
                    <option value="Economics">Economics</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                    <option value="Medicine">Medicine</option>
                    <option value="Nursing">Nursing</option>
                    <option value="Pharmacy">Pharmacy</option>
                  </select>
                  {errors.program && <p className="text-red-500 text-sm mt-1">{errors.program}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Level <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    min="1"
                    max="7"
                    className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2F80ED]/20 focus:border-[#2F80ED] ${
                      errors.level ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.level && <p className="text-red-500 text-sm mt-1">{errors.level}</p>}
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div>
              <h3 className="text-lg font-semibold text-[#4F4F4F] mb-4">Academic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Academic Year <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="academicYear"
                    value={formData.academicYear}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2F80ED]/20 focus:border-[#2F80ED] ${
                      errors.academicYear ? 'border-red-500' : 'border-gray-200'
                    }`}
                    placeholder="e.g., 2023/2024"
                  />
                  {errors.academicYear && (
                    <p className="text-red-500 text-sm mt-1">{errors.academicYear}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Semester <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2F80ED]/20 focus:border-[#2F80ED] ${
                      errors.semester ? 'border-red-500' : 'border-gray-200'
                    }`}
                  >
                    <option value="1">Semester 1</option>
                    <option value="2">Semester 2</option>
                  </select>
                  {errors.semester && <p className="text-red-500 text-sm mt-1">{errors.semester}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student Count <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="studentCount"
                    value={formData.studentCount}
                    onChange={handleChange}
                    min="0"
                    className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2F80ED]/20 focus:border-[#2F80ED] ${
                      errors.studentCount ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {errors.studentCount && (
                    <p className="text-red-500 text-sm mt-1">{errors.studentCount}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Attendance Type */}
            <div>
              <h3 className="text-lg font-semibold text-[#4F4F4F] mb-4">Attendance Schedule</h3>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg mb-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-blue-900 font-medium mb-1">
                      Student Attendance Type
                    </p>
                    <p className="text-xs text-blue-800">
                      REGULAR classes meet Monday-Friday. WEEKEND classes meet Saturday-Sunday. 
                      This determines when lectures can be scheduled for this class.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attendance Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="attendanceType"
                    value={formData.attendanceType}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2F80ED]/20 focus:border-[#2F80ED]"
                  >
                    <option value="REGULAR">REGULAR (Monday-Friday)</option>
                    <option value="WEEKEND">WEEKEND (Saturday-Sunday)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.attendanceType === 'REGULAR' 
                      ? 'Classes will be scheduled on weekdays only' 
                      : 'Classes will be scheduled on weekends only'}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                variant="primary"
                icon={<Save className="w-4 h-4" />}
              >
                {isEditMode ? 'Update Class' : 'Create Class'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/classes')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default ClassForm;