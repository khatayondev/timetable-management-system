import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useTimetable } from '../../context/TimetableContext';
import { MapPin, BookOpen, Users, Calendar, CheckSquare, TrendingUp } from 'lucide-react';
import { Link } from 'react-router';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { venues, courses, lecturers, approvals } = useTimetable();

  const stats = [
    {
      label: 'Total Venues',
      value: venues.length,
      icon: MapPin,
      color: 'bg-blue-100 text-blue-700',
      link: '/venues',
    },
    {
      label: 'Active Courses',
      value: courses.length,
      icon: BookOpen,
      color: 'bg-green-100 text-green-700',
      link: '/courses',
    },
    {
      label: 'Lecturers',
      value: lecturers.length,
      icon: Users,
      color: 'bg-purple-100 text-purple-700',
      link: '/lecturers',
    },
    {
      label: 'Pending Approvals',
      value: approvals.filter(a => a.status === 'submitted').length,
      icon: CheckSquare,
      color: 'bg-orange-100 text-orange-700',
      link: '/approvals',
    },
  ];

  const recentActivity = [
    { action: 'New course added', detail: 'CS101 - Introduction to Programming', time: '2 hours ago' },
    { action: 'Timetable submitted', detail: 'Spring 2026 - Computer Science', time: '5 hours ago' },
    { action: 'Venue updated', detail: 'Lab-CS-02 equipment list modified', time: '1 day ago' },
    { action: 'Lecturer availability updated', detail: 'Dr. Sarah Johnson', time: '2 days ago' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
          <p className="text-gray-600 mt-1">Here's what's happening with your timetable system today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Link
                key={index}
                to={stat.link}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon size={24} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
              <TrendingUp size={20} className="text-gray-400" />
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-600 truncate">{activity.detail}</p>
                    <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/venues/new"
                className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-center"
              >
                <MapPin size={24} className="mx-auto mb-2 text-blue-600" />
                <p className="text-sm font-medium text-blue-900">Add Venue</p>
              </Link>
              <Link
                to="/courses/new"
                className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-center"
              >
                <BookOpen size={24} className="mx-auto mb-2 text-green-600" />
                <p className="text-sm font-medium text-green-900">Add Course</p>
              </Link>
              <Link
                to="/lecturers/new"
                className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-center"
              >
                <Users size={24} className="mx-auto mb-2 text-purple-600" />
                <p className="text-sm font-medium text-purple-900">Add Lecturer</p>
              </Link>
              <Link
                to="/timetables/teaching"
                className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-center"
              >
                <Calendar size={24} className="mx-auto mb-2 text-orange-600" />
                <p className="text-sm font-medium text-orange-900">View Timetable</p>
              </Link>
            </div>
          </div>
        </div>

        {/* Pending Approvals Summary */}
        {approvals.filter(a => a.status === 'submitted').length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <CheckSquare size={24} className="text-orange-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-orange-900 mb-1">Approvals Needed</h3>
                <p className="text-sm text-orange-700">
                  You have {approvals.filter(a => a.status === 'submitted').length} items waiting for your review.
                </p>
              </div>
              <Link
                to="/approvals"
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
              >
                Review Now
              </Link>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}