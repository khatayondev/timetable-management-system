import React from 'react';
import { useNavigate, useParams } from 'react-router';
import { useLecturers } from '../../context/LecturerContext';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { ArrowLeft, Check, X } from 'lucide-react';

const LecturerAvailability = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getLecturer } = useLecturers();

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

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const timeSlots = [
    '08:00 - 09:00',
    '09:00 - 10:00',
    '10:00 - 11:00',
    '11:00 - 12:00',
    '12:00 - 13:00',
    '13:00 - 14:00',
    '14:00 - 15:00',
    '15:00 - 16:00',
    '16:00 - 17:00',
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/lecturers')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Lecturer Availability</h1>
          <p className="text-gray-600 mt-1">{lecturer.name}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Max Hours per Week</p>
          <p className="text-2xl font-bold text-gray-900">{lecturer.maxHoursPerWeek}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Weekly Availability Matrix</h2>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                <span className="text-gray-600">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                <span className="text-gray-600">Unavailable</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase bg-gray-50">
                    Time Slot
                  </th>
                  {days.map(day => (
                    <th key={day} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase bg-gray-50">
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {timeSlots.map((slot, slotIndex) => (
                  <tr key={slot}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {slot}
                    </td>
                    {days.map(day => {
                      const availability = lecturer.availability[day];
                      // Simple check - in real app would parse times properly
                      const isAvailable = availability && availability.length > 0;
                      
                      return (
                        <td key={day} className="px-4 py-3 text-center">
                          <button
                            className={`w-full h-10 rounded-lg border-2 transition-colors ${
                              isAvailable
                                ? 'bg-green-100 border-green-300 hover:bg-green-200'
                                : 'bg-red-100 border-red-300 hover:bg-red-200'
                            }`}
                          >
                            {isAvailable ? (
                              <Check className="w-5 h-5 text-green-700 mx-auto" />
                            ) : (
                              <X className="w-5 h-5 text-red-700 mx-auto" />
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Click on any time slot to toggle availability. Changes are saved automatically.
            </p>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => navigate('/lecturers')}>
              Done
            </Button>
          </div>
        </CardBody>
      </Card>

      {lecturer.canInvigilate && (
        <Card className="border-l-4 border-green-500">
          <CardBody>
            <div className="flex items-start gap-4">
              <Check className="w-6 h-6 text-green-600 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900">Available for Invigilation</h3>
                <p className="text-sm text-gray-600 mt-1">
                  This lecturer is available to invigilate exams.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default LecturerAvailability;