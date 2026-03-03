import React from 'react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Calendar, Clock, MapPin, User } from 'lucide-react';

const StudentTimetable = () => {
  // Mock student timetable data
  const schedule = {
    monday: [
      { time: '09:00 - 10:00', course: 'CS101', name: 'Introduction to Programming', lecturer: 'Dr. John Smith', venue: 'LH-A' },
      { time: '14:00 - 16:00', course: 'CS101', name: 'Programming Lab', lecturer: 'Dr. John Smith', venue: 'CL-01' },
    ],
    tuesday: [
      { time: '10:00 - 11:00', course: 'MATH101', name: 'Calculus I', lecturer: 'Dr. Michael Chen', venue: 'LH-B' },
    ],
    wednesday: [
      { time: '09:00 - 10:00', course: 'CS101', name: 'Introduction to Programming', lecturer: 'Dr. John Smith', venue: 'LH-A' },
    ],
    thursday: [
      { time: '10:00 - 11:00', course: 'MATH101', name: 'Calculus I', lecturer: 'Dr. Michael Chen', venue: 'LH-B' },
    ],
    friday: [
      { time: '11:00 - 12:00', course: 'CS101', name: 'Tutorial', lecturer: 'Dr. John Smith', venue: 'TR-01' },
    ],
  };

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Timetable</h1>
        <p className="text-gray-600 mt-1">CS-1A • Semester 1 • 2025/2026</p>
      </div>

      <div className="space-y-4">
        {days.map((day) => (
          <Card key={day}>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900 capitalize">{day}</h2>
            </CardHeader>
            <CardBody>
              {schedule[day as keyof typeof schedule].length === 0 ? (
                <p className="text-gray-500 text-center py-4">No classes scheduled</p>
              ) : (
                <div className="space-y-3">
                  {schedule[day as keyof typeof schedule].map((cls, index) => (
                    <div key={index} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {cls.course} - {cls.name}
                          </h3>
                        </div>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {cls.time}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{cls.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{cls.venue}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>{cls.lecturer}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        ))}
      </div>

      <Card className="border-l-4 border-blue-500">
        <CardBody>
          <div className="flex items-start gap-4">
            <Calendar className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900">Timetable Information</h3>
              <p className="text-sm text-gray-600 mt-1">
                This is your personal timetable for Semester 1, 2025/2026. 
                If you notice any conflicts or errors, please contact the registry office.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default StudentTimetable;
