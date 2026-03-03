import React from 'react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { MapPin, Calendar, Clock, AlertCircle } from 'lucide-react';

const ExamVenues = () => {
  // Mock exam data
  const exams = [
    {
      id: '1',
      course: 'CS101',
      name: 'Introduction to Programming',
      date: '2026-02-15',
      time: '09:00 - 12:00',
      venue: 'Exam Hall 1',
      venueCode: 'EH-01',
      seat: 'A-25',
      building: 'Academic Block 2',
      floor: 1,
      instructions: 'Bring your student ID and approved calculator',
    },
    {
      id: '2',
      course: 'MATH101',
      name: 'Calculus I',
      date: '2026-02-18',
      time: '14:00 - 17:00',
      venue: 'Exam Hall 1',
      venueCode: 'EH-01',
      seat: 'B-12',
      building: 'Academic Block 2',
      floor: 1,
      instructions: 'Calculators allowed. Bring your student ID',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Exam Schedule</h1>
        <p className="text-gray-600 mt-1">Semester 1 • 2025/2026</p>
      </div>

      <Card className="border-l-4 border-red-500">
        <CardBody>
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-600 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900">Important Exam Information</h3>
              <ul className="text-sm text-gray-600 mt-2 space-y-1 list-disc list-inside">
                <li>Arrive at least 15 minutes before the exam start time</li>
                <li>Bring your student ID card</li>
                <li>Note your assigned seat number</li>
                <li>Electronic devices must be switched off</li>
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="space-y-4">
        {exams.map((exam) => (
          <Card key={exam.id} className="border-l-4 border-blue-500">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {exam.course} - {exam.name}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(exam.date).toLocaleDateString('en-US', { 
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <span className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium">
                  Seat: {exam.seat}
                </span>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Time</p>
                      <p className="text-gray-900">{exam.time}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Venue</p>
                      <p className="text-gray-900">{exam.venue} ({exam.venueCode})</p>
                      <p className="text-sm text-gray-600">{exam.building}, Floor {exam.floor}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Instructions</p>
                    <p className="text-sm text-gray-600">{exam.instructions}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Your Seat:</strong> {exam.seat} - Please locate your seat upon arrival
                </p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {exams.length === 0 && (
        <Card>
          <CardBody className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Upcoming Exams</h3>
            <p className="text-gray-600">Your exam schedule will appear here once published.</p>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default ExamVenues;
