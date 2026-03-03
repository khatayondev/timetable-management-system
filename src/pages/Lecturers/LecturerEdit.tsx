import React from 'react';
import { useNavigate, useParams } from 'react-router';
import { useLecturers, Lecturer } from '../../context/LecturerContext';
import LecturerForm from '../../components/forms/LecturerForm';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { ArrowLeft } from 'lucide-react';

const LecturerEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getLecturer, updateLecturer } = useLecturers();

  const lecturer = id ? getLecturer(id) : null;

  if (!lecturer) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Lecturer not found</h3>
        <button
          onClick={() => navigate('/lecturers')}
          className="text-blue-600 hover:text-blue-700"
        >
          Back to lecturers
        </button>
      </div>
    );
  }

  const handleSubmit = (data: Omit<Lecturer, 'id'>) => {
    updateLecturer(lecturer.id, data);
    navigate('/lecturers');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/lecturers')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Lecturer</h1>
          <p className="text-gray-600 mt-1">{lecturer.name}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Lecturer Details</h2>
        </CardHeader>
        <CardBody>
          <LecturerForm
            initialData={lecturer}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/lecturers')}
          />
        </CardBody>
      </Card>
    </div>
  );
};

export default LecturerEdit;