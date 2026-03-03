import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useClasses } from '../../context/ClassContext';
import { useLecturers } from '../../context/LecturerContext';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import { Plus, Edit2, Trash2, Users, Search, Calendar, Edit, UserPlus } from 'lucide-react';

const ClassesAndLecturers = () => {
  const navigate = useNavigate();
  const { classes, deleteClass } = useClasses();
  const { lecturers, deleteLecturer } = useLecturers();
  
  const [activeTab, setActiveTab] = useState<'classes' | 'lecturers'>('classes');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProgram, setFilterProgram] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');

  // Get unique programs, levels, and departments for filters
  const programs = Array.from(new Set(classes.map((c) => c.program)));
  const levels = Array.from(new Set(classes.map((c) => c.level))).sort((a, b) => a - b);
  const departments = Array.from(new Set(lecturers.map(l => l.department)));

  // Filter classes
  const filteredClasses = classes.filter((classItem) => {
    const matchesSearch =
      classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProgram = filterProgram === 'all' || classItem.program === filterProgram;
    const matchesLevel = filterLevel === 'all' || classItem.level.toString() === filterLevel;

    return matchesSearch && matchesProgram && matchesLevel;
  });

  // Filter lecturers
  const filteredLecturers = lecturers.filter(lecturer => {
    const matchesSearch = lecturer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lecturer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || lecturer.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  const handleDeleteClass = (id: string) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      deleteClass(id);
    }
  };

  // Class columns
  const classColumns = [
    {
      key: 'code',
      header: 'Class Code',
      render: (row: any) => (
        <span className="font-semibold text-[#5B7EFF]">{row.code}</span>
      ),
    },
    {
      key: 'name',
      header: 'Class Name',
      render: (row: any) => (
        <div>
          <div className="font-medium text-[#4F4F4F]">{row.name}</div>
          <div className="text-xs text-[#828282]">{row.program}</div>
        </div>
      ),
    },
    {
      key: 'level',
      header: 'Level',
      render: (row: any) => (
        <span className="px-3 py-1 bg-[#5B7EFF]/10 text-[#5B7EFF] rounded-xl text-sm font-medium">
          Level {row.level}
        </span>
      ),
    },
    {
      key: 'studentCount',
      header: 'Students',
      render: (row: any) => (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-[#828282]" />
          <span className="font-medium">{row.studentCount}</span>
        </div>
      ),
    },
    {
      key: 'academicYear',
      header: 'Academic Year',
      render: (row: any) => (
        <div>
          <div className="text-sm">{row.academicYear}</div>
          <div className="text-xs text-[#828282]">Semester {row.semester}</div>
        </div>
      ),
    },
    {
      key: 'id',
      header: 'Actions',
      render: (row: any) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/classes/edit/${row.id}`);
            }}
            className="p-2 hover:bg-[#5B7EFF]/10 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit2 className="w-4 h-4 text-[#5B7EFF]" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClass(row.id);
            }}
            className="p-2 hover:bg-[#EB5757]/10 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4 text-[#EB5757]" />
          </button>
        </div>
      ),
    },
  ];

  // Lecturer columns
  const lecturerColumns = [
    {
      key: 'name',
      header: 'Name',
      render: (lecturer: any) => (
        <div>
          <div className="font-medium text-[#4F4F4F]">{lecturer.name}</div>
          <div className="text-xs text-[#828282]">{lecturer.email}</div>
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Department',
    },
    {
      key: 'specialization',
      header: 'Specialization',
      render: (lecturer: any) => (
        <span className="text-sm text-[#828282]">
          {lecturer.specialization.join(', ')}
        </span>
      ),
    },
    {
      key: 'maxHoursPerWeek',
      header: 'Max Hours/Week',
      render: (lecturer: any) => (
        <span className="font-medium text-[#4F4F4F]">{lecturer.maxHoursPerWeek}h</span>
      ),
    },
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
            className="p-2 hover:bg-green-50 rounded-lg transition-colors"
            title="Manage Availability"
          >
            <Calendar className="w-4 h-4 text-green-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/lecturers/edit/${lecturer.id}`);
            }}
            className="p-2 hover:bg-[#5B7EFF]/10 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4 text-[#5B7EFF]" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Are you sure you want to delete this lecturer?')) {
                deleteLecturer(lecturer.id);
              }
            }}
            className="p-2 hover:bg-[#EB5757]/10 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4 text-[#EB5757]" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#4F4F4F]">Classes & Lecturers Management</h1>
          <p className="text-[#828282] mt-1">Manage classes and lecturers in one place</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'classes' ? (
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/classes/create')}
              icon={<Plus className="w-4 h-4" />}
            >
              Add Class
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/lecturers/create')}
              icon={<UserPlus className="w-4 h-4" />}
            >
              Add Lecturer
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#828282]">Total Classes</p>
                <p className="text-2xl font-semibold text-[#4F4F4F] mt-1">{classes.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-[#5B7EFF] to-[#7C9FFF] rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#828282]">Total Students</p>
                <p className="text-2xl font-semibold text-[#4F4F4F] mt-1">
                  {classes.reduce((sum, c) => sum + c.studentCount, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-[#56CCF2] to-[#2D9CDB] rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#828282]">Total Lecturers</p>
                <p className="text-2xl font-semibold text-[#4F4F4F] mt-1">{lecturers.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-[#6FCF97] to-[#27AE60] rounded-xl flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#828282]">Can Invigilate</p>
                <p className="text-2xl font-semibold text-[#4F4F4F] mt-1">
                  {lecturers.filter(l => l.canInvigilate).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-[#BB6BD9] to-[#9B51E0] rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => {
            setActiveTab('classes');
            setSearchTerm('');
          }}
          className={`px-6 py-3 font-semibold transition-all duration-200 border-b-2 ${
            activeTab === 'classes'
              ? 'border-[#5B7EFF] text-[#5B7EFF]'
              : 'border-transparent text-[#828282] hover:text-[#4F4F4F]'
          }`}
        >
          Classes ({classes.length})
        </button>
        <button
          onClick={() => {
            setActiveTab('lecturers');
            setSearchTerm('');
          }}
          className={`px-6 py-3 font-semibold transition-all duration-200 border-b-2 ${
            activeTab === 'lecturers'
              ? 'border-[#5B7EFF] text-[#5B7EFF]'
              : 'border-transparent text-[#828282] hover:text-[#4F4F4F]'
          }`}
        >
          Lecturers ({lecturers.length})
        </button>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#828282] w-5 h-5" />
                <input
                  type="text"
                  placeholder={activeTab === 'classes' ? 'Search classes...' : 'Search lecturers...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B7EFF]/50 focus:border-[#5B7EFF] bg-[#FAFBFD]"
                />
              </div>
            </div>
            
            {activeTab === 'classes' ? (
              <>
                <select
                  value={filterProgram}
                  onChange={(e) => setFilterProgram(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B7EFF]/50 focus:border-[#5B7EFF] bg-[#FAFBFD]"
                >
                  <option value="all">All Programs</option>
                  {programs.map((program) => (
                    <option key={program} value={program}>
                      {program}
                    </option>
                  ))}
                </select>
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B7EFF]/50 focus:border-[#5B7EFF] bg-[#FAFBFD]"
                >
                  <option value="all">All Levels</option>
                  {levels.map((level) => (
                    <option key={level} value={level}>
                      Level {level}
                    </option>
                  ))}
                </select>
              </>
            ) : (
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B7EFF]/50 focus:border-[#5B7EFF] bg-[#FAFBFD]"
              >
                <option value="all">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Data Table */}
      <Card>
        <CardBody className="p-0">
          {activeTab === 'classes' ? (
            <DataTable
              data={filteredClasses}
              columns={classColumns}
            />
          ) : (
            <DataTable
              data={filteredLecturers}
              columns={lecturerColumns}
            />
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default ClassesAndLecturers;
