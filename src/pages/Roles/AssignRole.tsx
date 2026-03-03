import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { useUserManagement, SystemUserRole } from '../../context/UserManagementContext';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Shield, Users, Save, X } from 'lucide-react';

const AssignRole = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { addUser } = useUserManagement();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'lecturer' as SystemUserRole,
    department: '',
    status: 'active' as 'active' | 'inactive' | 'pending',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Role descriptions
  const roleDescriptions: Record<SystemUserRole, string> = {
    superadmin: 'Full system access with elevated privileges. Can manage all aspects of the system including users, departments, and system settings.',
    admin: 'Full system access. Can manage all users, courses, venues, and timetables.',
    registry: 'Manages academic records, venues, and overall timetable coordination.',
    lecturer: 'Can view personal timetable, submit change requests, and manage invigilation duties.',
    student: 'Can view personal class and exam timetables. Read-only access.',
  };

  // Permissions by role
  const rolePermissions: Record<SystemUserRole, string[]> = {
    superadmin: [
      'Full system control',
      'Manage all users and roles',
      'Manage all departments',
      'Configure system settings',
      'Generate all reports',
      'Approve all requests',
      'Full timetable control'
    ],
    admin: [
      'Manage all users and roles',
      'Manage all departments',
      'Manage system settings',
      'Generate all reports',
      'Full timetable control',
      'Approve all requests'
    ],
    registry: [
      'Manage venues',
      'Coordinate timetables',
      'Generate reports',
      'Manage academic records',
      'Approve venue requests'
    ],
    lecturer: [
      'View personal timetable',
      'Submit change requests',
      'Update availability',
      'View invigilation duties',
      'Access course materials'
    ],
    student: [
      'View class timetable',
      'View exam schedule',
      'View exam venues',
      'Create study planner',
      'Download schedules'
    ],
  };

  // Departments list
  const departments = [
    'Computer Science',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Engineering',
    'Business Administration',
    'Economics',
    'Psychology',
    'English Literature',
    'History',
    'Philosophy',
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.department.trim() && formData.role !== 'admin') {
      newErrors.department = 'Department is required for this role';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    addUser({
      ...formData,
      assignedBy: currentUser?.name,
      assignedDate: new Date().toISOString().split('T')[0],
      permissions: rolePermissions[formData.role],
    });

    navigate('/roles');
  };

  const handleCancel = () => {
    navigate('/roles');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleCancel}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assign New Role</h1>
          <p className="text-gray-600 mt-1">Create a new user and assign them a role</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - User Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">User Information</h2>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter full name"
                    />
                    {errors.name && (
                      <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="user@university.edu"
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                    )}
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department {formData.role !== 'admin' && <span className="text-red-500">*</span>}
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.department ? 'border-red-500' : 'border-gray-300'
                      }`}
                      disabled={formData.role === 'admin'}
                    >
                      <option value="">Select department</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                    {errors.department && (
                      <p className="text-sm text-red-600 mt-1">{errors.department}</p>
                    )}
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="active">Active</option>
                      <option value="pending">Pending Approval</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    <p className="text-sm text-gray-600 mt-1">
                      Active users can immediately access the system
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Role Selection */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Role Assignment</h2>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {/* Role Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Select Role <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(Object.keys(roleDescriptions) as SystemUserRole[]).map((role) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => setFormData({ ...formData, role })}
                          className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                            formData.role === role
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <p className="font-semibold text-gray-900 capitalize">{role}</p>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {roleDescriptions[role]}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Role Description */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2 capitalize">
                      {formData.role} Role
                    </h3>
                    <p className="text-sm text-blue-800 mb-3">
                      {roleDescriptions[formData.role]}
                    </p>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-blue-900">Permissions:</p>
                      <ul className="space-y-1">
                        {rolePermissions[formData.role].map((permission, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm text-blue-800">
                            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                            {permission}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            <Card className="sticky top-6">
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">Summary</h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium text-gray-900">
                      {formData.name || 'Not specified'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">
                      {formData.email || 'Not specified'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Role</p>
                    <p className="font-medium text-gray-900 capitalize">
                      {formData.role}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Department</p>
                    <p className="font-medium text-gray-900">
                      {formData.department || 'Not specified'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="font-medium text-gray-900 capitalize">
                      {formData.status}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">Assigned By</p>
                    <p className="font-medium text-gray-900">
                      {currentUser?.name}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    <Save className="w-5 h-5" />
                    Assign Role
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    <X className="w-5 h-5" />
                    Cancel
                  </button>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AssignRole;