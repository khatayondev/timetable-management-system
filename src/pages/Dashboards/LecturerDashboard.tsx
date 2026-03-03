import React from 'react';
import { useNavigate } from 'react-router';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Calendar, Clock, BookOpen } from 'lucide-react';
import { useTimetables } from '../../context/TimetableContext';
import { useCourses } from '../../context/CourseContext';

const LecturerDashboard = () => {
  const navigate = useNavigate();
  const { timetables } = useTimetables();
  const { courses } = useCourses();

  // In real app, would filter by current lecturer ID
  const myCourses = courses.slice(0, 2);
  const myTimetable = timetables.find(t => t.type === 'teaching' && t.status === 'published');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Lecturer Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back, Dr. John Smith</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-md" onClick={() => navigate('/timetable/teaching')}>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">My Classes This Week</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">8</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Teaching Hours/Week</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">12</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <Clock className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Courses</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{myCourses.length}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <BookOpen className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">My Courses</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {myCourses.map((course) => (
                <div
                  key={course.id}
                  className="p-4 bg-gray-50 rounded-lg"
                >
                  <p className="font-medium text-gray-900">{course.code} - {course.name}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Semester {course.semester} • {course.studentGroups?.join(', ') || 'No groups assigned'}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      Lecture: {course.lectureDuration} min
                    </span>
                    {course.labDuration > 0 && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        Lab: {course.labDuration} min
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">This Week's Schedule</h2>
          </CardHeader>
          <CardBody>
            {myTimetable && myTimetable.teachingSessions ? (
              <div className="space-y-3">
                {myTimetable.teachingSessions.slice(0, 5).map((session) => (
                  <div key={session.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 capitalize">{session.day}</p>
                        <p className="text-sm text-gray-600">{session.startTime} - {session.endTime}</p>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded capitalize">
                        {session.sessionType}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No schedule available</p>
            )}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/lecturers/availability/1')}
              className="p-4 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <p className="font-medium text-blue-900">Update Availability</p>
              <p className="text-sm text-blue-700 mt-1">Manage your weekly schedule</p>
            </button>
            <button
              onClick={() => navigate('/timetable/teaching')}
              className="p-4 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <p className="font-medium text-green-900">View Full Timetable</p>
              <p className="text-sm text-green-700 mt-1">See all your classes</p>
            </button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default LecturerDashboard;