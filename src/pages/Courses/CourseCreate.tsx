import React from 'react';
import { useNavigate } from 'react-router';
import { useCourses, Course } from '../../context/CourseContext';
import CourseForm from '../../components/forms/CourseForm';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { ArrowLeft } from 'lucide-react';

const CourseCreate = () => {
  const navigate = useNavigate();
  const { addCourse } = useCourses();

  const handleSubmit = (data: Omit<Course, 'id'>) => {
    addCourse(data);
    navigate('/courses');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/courses')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Course</h1>
          <p className="text-gray-600 mt-1">Add a new course to the system</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Course Details</h2>
        </CardHeader>
        <CardBody>
          <CourseForm onSubmit={handleSubmit} onCancel={() => navigate('/courses')} />
        </CardBody>
      </Card>
    </div>
  );
};

export default CourseCreate;