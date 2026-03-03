import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useCourses } from '../../context/CourseContext';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import DataTable from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import { Plus, Edit, Trash2 } from 'lucide-react';

const CourseList = () => {
  const navigate = useNavigate();
  const { courses, deleteCourse } = useCourses();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProgram, setFilterProgram] = useState<string>('all');

  const programs = Array.from(new Set(courses.map(c => c.program)));

  const filteredCourses = courses.filter(course => {
    const matchesSearch = (course.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (course.code?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesProgram = filterProgram === 'all' || course.program === filterProgram;
    return matchesSearch && matchesProgram;
  });

  const columns = [
    { key: 'code', header: 'Code' },
    { key: 'name', header: 'Course Name' },
    { key: 'program', header: 'Program' },
    { key: 'semester', header: 'Semester' },
    { key: 'credits', header: 'Credits' },
    {
      key: 'studentGroups',
      header: 'Groups',
      render: (course: any) => (
        <span className="text-sm text-gray-600">
          {course.studentGroups?.join(', ') || 'N/A'}
        </span>
      ),
    },
    {
      key: 'examType',
      header: 'Exam Type',
      render: (course: any) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          course.examType === 'theory' ? 'bg-blue-100 text-blue-700' :
          course.examType === 'practical' ? 'bg-green-100 text-green-700' :
          'bg-purple-100 text-purple-700'
        }`}>
          {course.examType.charAt(0).toUpperCase() + course.examType.slice(1)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (course: any) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/courses/edit/${course.id}`);
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4 text-blue-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Are you sure you want to delete this course?')) {
                deleteCourse(course.id);
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
          <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
          <p className="text-gray-600 mt-1">Manage courses and class schedules</p>
        </div>
        <Button onClick={() => navigate('/courses/create')}>
          <Plus className="w-4 h-4 mr-2" />
          Add Course
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterProgram}
              onChange={(e) => setFilterProgram(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Programs</option>
              {programs.map(program => (
                <option key={program} value={program}>{program}</option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <DataTable
            data={filteredCourses}
            columns={columns}
            onRowClick={(course) => navigate(`/courses/edit/${course.id}`)}
          />
        </CardBody>
      </Card>
    </div>
  );
};

export default CourseList;