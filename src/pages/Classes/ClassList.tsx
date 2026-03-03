import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useClasses } from '../../context/ClassContext';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import { Plus, Edit2, Trash2, Users, Search } from 'lucide-react';

const ClassList = () => {
  const { classes, deleteClass } = useClasses();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProgram, setFilterProgram] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');

  // Get unique programs and levels for filters
  const programs = Array.from(new Set(classes.map((c) => c.program)));
  const levels = Array.from(new Set(classes.map((c) => c.level))).sort((a, b) => a - b);

  // Filter classes
  const filteredClasses = classes.filter((classItem) => {
    const matchesSearch =
      classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProgram = filterProgram === 'all' || classItem.program === filterProgram;
    const matchesLevel = filterLevel === 'all' || classItem.level.toString() === filterLevel;

    return matchesSearch && matchesProgram && matchesLevel;
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      deleteClass(id);
    }
  };

  const columns = [
    {
      key: 'code',
      header: 'Class Code',
      render: (row: any) => (
        <span className="font-semibold text-[#2F80ED]">{row.code}</span>
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
        <span className="px-3 py-1 bg-[#2F80ED]/10 text-[#2F80ED] rounded-xl text-sm font-medium">
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
            className="p-2 hover:bg-[#2F80ED]/10 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit2 className="w-4 h-4 text-[#2F80ED]" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row.id);
            }}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-[#4F4F4F]">Class Management</h1>
          <p className="text-[#828282] mt-1">Manage student classes and groups</p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/classes/create')}
          icon={<Plus className="w-4 h-4" />}
        >
          Add New Class
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#828282]" />
              <input
                type="text"
                placeholder="Search classes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2F80ED]/20 focus:border-[#2F80ED]"
              />
            </div>

            {/* Program Filter */}
            <select
              value={filterProgram}
              onChange={(e) => setFilterProgram(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2F80ED]/20 focus:border-[#2F80ED]"
            >
              <option value="all">All Programs</option>
              {programs.map((program) => (
                <option key={program} value={program}>
                  {program}
                </option>
              ))}
            </select>

            {/* Level Filter */}
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2F80ED]/20 focus:border-[#2F80ED]"
            >
              <option value="all">All Levels</option>
              {levels.map((level) => (
                <option key={level} value={level.toString()}>
                  Level {level}
                </option>
              ))}
            </select>
          </div>
        </CardBody>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-[#2F80ED] to-[#56CCF2] text-white">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Total Classes</p>
                <p className="text-3xl font-bold mt-1">{classes.length}</p>
              </div>
              <Users className="w-12 h-12 text-white/30" />
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-[#6FCF97] to-[#27AE60] text-white">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Total Students</p>
                <p className="text-3xl font-bold mt-1">
                  {classes.reduce((sum, c) => sum + c.studentCount, 0)}
                </p>
              </div>
              <Users className="w-12 h-12 text-white/30" />
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-[#F2C94C] to-[#F2994A] text-white">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Programs</p>
                <p className="text-3xl font-bold mt-1">{programs.length}</p>
              </div>
              <Users className="w-12 h-12 text-white/30" />
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-[#9B51E0] to-[#BB6BD9] text-white">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Avg Class Size</p>
                <p className="text-3xl font-bold mt-1">
                  {classes.length > 0
                    ? Math.round(classes.reduce((sum, c) => sum + c.studentCount, 0) / classes.length)
                    : 0}
                </p>
              </div>
              <Users className="w-12 h-12 text-white/30" />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Classes Table */}
      <Card>
        {filteredClasses.length > 0 ? (
          <DataTable columns={columns} data={filteredClasses} />
        ) : (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No classes found</p>
            <Button
              variant="primary"
              onClick={() => navigate('/classes/create')}
              className="mt-4"
            >
              Create Your First Class
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ClassList;