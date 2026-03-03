import React from 'react';
import { useNavigate } from 'react-router';
import { useLecturers, Lecturer } from '../../context/LecturerContext';
import LecturerForm from '../../components/forms/LecturerForm';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { ArrowLeft } from 'lucide-react';

const LecturerCreate = () => {
  const navigate = useNavigate();
  const { addLecturer } = useLecturers();

  const handleSubmit = (data: Omit<Lecturer, 'id'>) => {
    addLecturer(data);
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
          <h1 className="text-2xl font-bold text-gray-900">Create New Lecturer</h1>
          <p className="text-gray-600 mt-1">Add a new lecturer to the system</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Lecturer Details</h2>
        </CardHeader>
        <CardBody>
          <LecturerForm onSubmit={handleSubmit} onCancel={() => navigate('/lecturers')} />
        </CardBody>
      </Card>
    </div>
  );
};

export default LecturerCreate;