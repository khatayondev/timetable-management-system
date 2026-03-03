import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { useUserManagement, SystemUser, SystemUserRole } from '../../context/UserManagementContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Search, 
  Edit, 
  Trash2, 
  Check, 
  X,
  AlertCircle,
  Filter,
  Download
} from 'lucide-react';

const RoleManagement = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { users, updateUser, deleteUser, assignRole } = useUserManagement();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<SystemUserRole | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'pending'>('all');
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<SystemUserRole>('lecturer');

  // Role badges configuration
  const roleConfig: Record<SystemUserRole, { color: string; bgColor: string; label: string }> = {
    superadmin: { color: 'text-purple-700', bgColor: 'bg-purple-50', label: 'Super Admin' },
    admin: { color: 'text-red-700', bgColor: 'bg-red-50', label: 'Admin' },
    registry: { color: 'text-blue-700', bgColor: 'bg-blue-50', label: 'Registry' },
    lecturer: { color: 'text-green-700', bgColor: 'bg-green-50', label: 'Lecturer' },
    student: { color: 'text-gray-700', bgColor: 'bg-gray-50', label: 'Student' },
  };

  // Status badges configuration
  const statusConfig = {
    active: { color: 'text-green-700', bgColor: 'bg-green-50', icon: Check },
    inactive: { color: 'text-gray-700', bgColor: 'bg-gray-50', icon: X },
    pending: { color: 'text-yellow-700', bgColor: 'bg-yellow-50', icon: AlertCircle },
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.department?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Statistics
  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    pending: users.filter(u => u.status === 'pending').length,
    byRole: {
      admin: users.filter(u => u.role === 'admin').length,
      registry: users.filter(u => u.role === 'registry').length,
      lecturer: users.filter(u => u.role === 'lecturer').length,
      student: users.filter(u => u.role === 'student').length,
    }
  };

  const handleAssignRole = (userId: string) => {
    if (currentUser) {
      assignRole(userId, selectedRole, currentUser.name);
      setEditingUser(null);
    }
  };

  const handleStatusChange = (userId: string, status: 'active' | 'inactive' | 'pending') => {
    updateUser(userId, { status });
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Are you sure you want to remove this user?')) {
      deleteUser(userId);
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Role', 'Department', 'Status', 'Assigned By', 'Assigned Date'];
    const csvData = filteredUsers.map(u => [
      u.name,
      u.email,
      roleConfig[u.role].label,
      u.department || 'N/A',
      u.status,
      u.assignedBy || 'N/A',
      u.assignedDate || 'N/A'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-roles-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
          <p className="text-gray-600 mt-1">Assign and manage user roles and permissions</p>
        </div>
        <button
          onClick={() => navigate('/roles/assign')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <UserPlus className="w-5 h-5" />
          Assign New Role
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.active}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <Check className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Registry</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{stats.byRole.registry}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Lecturers</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.byRole.lecturer}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardBody>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, email, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Role Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value as SystemUserRole | 'all')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="registry">Registry</option>
                <option value="lecturer">Lecturer</option>
                <option value="student">Student</option>
              </select>
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* Export Button */}
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <Download className="w-5 h-5" />
              Export
            </button>
          </div>
        </CardBody>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">
            Users ({filteredUsers.length})
          </h2>
        </CardHeader>
        <CardBody>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">User</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Department</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Assigned By</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">
                      No users found matching your criteria
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-700">{user.department || 'N/A'}</span>
                      </td>
                      <td className="py-3 px-4">
                        {editingUser === user.id ? (
                          <div className="flex items-center gap-2">
                            <select
                              value={selectedRole}
                              onChange={(e) => setSelectedRole(e.target.value as SystemUserRole)}
                              className="px-2 py-1 border border-gray-300 rounded text-sm"
                            >
                              <option value="admin">Admin</option>
                              <option value="registry">Registry</option>
                              <option value="lecturer">Lecturer</option>
                              <option value="student">Student</option>
                            </select>
                            <button
                              onClick={() => handleAssignRole(user.id)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingUser(null)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleConfig[user.role].bgColor} ${roleConfig[user.role].color}`}>
                            {roleConfig[user.role].label}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[user.status].bgColor} ${statusConfig[user.status].color}`}>
                            {React.createElement(statusConfig[user.status].icon, { className: 'w-3 h-3' })}
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-700">{user.assignedBy || 'N/A'}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-700">{user.assignedDate || 'N/A'}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingUser(user.id);
                              setSelectedRole(user.role);
                            }}
                            className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors duration-200"
                            title="Edit role"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(
                              user.id, 
                              user.status === 'active' ? 'inactive' : 'active'
                            )}
                            className={`p-1 rounded transition-colors duration-200 ${
                              user.status === 'active'
                                ? 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50'
                                : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                            }`}
                            title={user.status === 'active' ? 'Deactivate' : 'Activate'}
                          >
                            {user.status === 'active' ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors duration-200"
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default RoleManagement;