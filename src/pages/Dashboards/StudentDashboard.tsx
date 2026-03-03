import React from 'react';
import { useNavigate } from 'react-router';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Calendar, BookOpen, AlertCircle, CalendarDays } from 'lucide-react';

const StudentDashboard = () => {
  const navigate = useNavigate();

  // Mock data - in real app would be fetched for logged-in student
  const upcomingClasses = [
    { id: 1, course: 'CS101', name: 'Introduction to Programming', day: 'Monday', time: '09:00 - 10:00', venue: 'LH-A' },
    { id: 2, course: 'CS101', name: 'Programming Lab', day: 'Tuesday', time: '14:00 - 16:00', venue: 'CL-01' },
    { id: 3, course: 'MATH101', name: 'Calculus I', day: 'Wednesday', time: '10:00 - 11:00', venue: 'LH-B' },
  ];

  const upcomingExams = [
    { id: 1, course: 'CS101', name: 'Introduction to Programming', date: '2026-02-15', time: '09:00', venue: 'EH-01', seat: 'A-25' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
        <p className="text-gray-600 mt-1">CS-1A • Semester 1</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-md" onClick={() => navigate('/student/timetable')}>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Classes This Week</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{upcomingClasses.length}</p>
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
                <p className="text-sm text-gray-600">Enrolled Courses</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">5</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <BookOpen className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="cursor-pointer hover:shadow-md" onClick={() => navigate('/student/exams')}>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Upcoming Exams</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{upcomingExams.length}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">This Week's Classes</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {upcomingClasses.map((cls) => (
                <div key={cls.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{cls.course} - {cls.name}</p>
                      <p className="text-sm text-gray-600 mt-1">{cls.day} • {cls.time}</p>
                      <p className="text-sm text-gray-600">Venue: {cls.venue}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate('/student/timetable')}
              className="mt-4 w-full text-center text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View Full Timetable →
            </button>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Exams</h2>
          </CardHeader>
          <CardBody>
            {upcomingExams.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No upcoming exams</p>
            ) : (
              <div className="space-y-3">
                {upcomingExams.map((exam) => (
                  <div key={exam.id} className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="font-medium text-gray-900">{exam.course} - {exam.name}</p>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <p>Date: {new Date(exam.date).toLocaleDateString()}</p>
                      <p>Time: {exam.time}</p>
                      <p>Venue: {exam.venue}</p>
                      <p className="font-medium text-red-700">Seat: {exam.seat}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => navigate('/student/exams')}
              className="mt-4 w-full text-center text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View All Exams →
            </button>
          </CardBody>
        </Card>
      </div>

      <Card className="border-l-4 border-blue-500">
        <CardBody>
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900">Important Notice</h3>
              <p className="text-sm text-gray-600 mt-1">
                Exam timetable for Semester 1 has been published. Please check your exam schedule and seating arrangements.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Personal Study Planner CTA */}
      <Card className="bg-gradient-to-r from-[#5B5FFF]/10 to-[#7C8FFF]/10 border-2 border-[#5B5FFF]/20 cursor-pointer hover:shadow-lg transition-all" onClick={() => navigate('/student/study-planner')}>
        <CardBody>
          <div className="flex items-start gap-4">
            <div className="bg-gradient-to-br from-[#5B5FFF] to-[#7C8FFF] p-3 rounded-xl">
              <CalendarDays className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">Personal Study Timetable</h3>
              <p className="text-sm text-gray-600 mb-3">
                Create your own personalized study schedule. Drag and drop courses into your weekly planner to organize your study time effectively.
              </p>
              <button className="px-4 py-2 bg-gradient-to-r from-[#5B5FFF] to-[#7C8FFF] text-white rounded-lg text-sm font-medium hover:shadow-md transition-all">
                Create Study Plan →
              </button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default StudentDashboard;