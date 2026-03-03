import React from 'react';
import { useNavigate, useParams } from 'react-router';
import { useCourses, Course } from '../../context/CourseContext';
import CourseForm from '../../components/forms/CourseForm';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { ArrowLeft } from 'lucide-react';

const CourseEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getCourse, updateCourse } = useCourses();

  const course = id ? getCourse(id) : null;

  if (!course) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Course not found</h3>
        <button
          onClick={() => navigate('/courses')}
          className="text-blue-600 hover:text-blue-700"
        >
          Back to courses
        </button>
      </div>
    );
  }

  const handleSubmit = (data: Omit<Course, 'id'>) => {
    updateCourse(course.id, data);
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
          <h1 className="text-2xl font-bold text-gray-900">Edit Course</h1>
          <p className="text-gray-600 mt-1">{course.code} - {course.title}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Course Details</h2>
        </CardHeader>
        <CardBody>
          <CourseForm
            initialData={course}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/courses')}
          />
        </CardBody>
      </Card>
    </div>
  );
};

export default CourseEdit;