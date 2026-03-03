import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useLecturers } from '../../context/LecturerContext';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import { Plus, Edit, Trash2, Calendar } from 'lucide-react';

const LecturerList = () => {
  const navigate = useNavigate();
  const { lecturers, deleteLecturer } = useLecturers();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');

  const departments = Array.from(new Set(lecturers.map(l => l.department)));

  const filteredLecturers = lecturers.filter(lecturer => {
    const matchesSearch = lecturer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lecturer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || lecturer.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'department', header: 'Department' },
    {
      key: 'specialization',
      header: 'Specialization',
      render: (lecturer: any) => (
        <span className="text-sm text-gray-600">
          {lecturer.specialization.join(', ')}
        </span>
      ),
    },
    { key: 'maxHoursPerWeek', header: 'Max Hours/Week' },
    {
      key: 'canInvigilate',
      header: 'Can Invigilate',
      render: (lecturer: any) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          lecturer.canInvigilate ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
        }`}>
          {lecturer.canInvigilate ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (lecturer: any) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/lecturers/availability/${lecturer.id}`);
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Manage Availability"
          >
            <Calendar className="w-4 h-4 text-green-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/lecturers/edit/${lecturer.id}`);
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4 text-blue-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Are you sure you want to delete this lecturer?')) {
                deleteLecturer(lecturer.id);
              }
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lecturer Management</h1>
          <p className="text-gray-600 mt-1">Manage lecturers and their availability</p>
        </div>
        <Button onClick={() => navigate('/lecturers/create')}>
          <Plus className="w-4 h-4 mr-2" />
          Add Lecturer
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search lecturers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <DataTable
            data={filteredLecturers}
            columns={columns}
            onRowClick={(lecturer) => navigate(`/lecturers/edit/${lecturer.id}`)}
          />
        </CardBody>
      </Card>
    </div>
  );
};

export default LecturerList;