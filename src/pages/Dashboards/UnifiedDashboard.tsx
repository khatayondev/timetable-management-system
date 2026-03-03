import React from 'react';
import { useNavigate } from 'react-router';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { 
  BookOpen, 
  Users, 
  Calendar, 
  Building2, 
  CalendarCheck, 
  GraduationCap, 
  UserCog,
  Settings,
  Check,
  Plus,
  Upload,
  X
} from 'lucide-react';
import { useCourses } from '../../context/CourseContext';
import { useLecturers } from '../../context/LecturerContext';
import { useTimetables } from '../../context/TimetableContext';
import { useClasses } from '../../context/ClassContext';
import { useVenues } from '../../context/VenueContext';
import { useApprovals } from '../../context/ApprovalContext';
import { useAuth } from '../../context/AuthContext';
import { useUserManagement } from '../../context/UserManagementContext';
import { useOrganization } from '../../context/OrganizationContext';

const UnifiedDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { courses, addCourse } = useCourses();
  const { lecturers } = useLecturers();
  const { timetables } = useTimetables();
  const { classes } = useClasses();
  const { venues } = useVenues();
  const { approvals } = useApprovals();
  const { users } = useUserManagement();
  const { departments } = useOrganization();

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = React.useState(false);
  const [uploadFile, setUploadFile] = React.useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = React.useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = React.useState('');

  // Role-based data filtering
  const getDashboardData = () => {
    switch (user?.role) {
      case 'admin':
        return {
          title: 'Admin Dashboard',
          subtitle: 'System-wide Timetable Management',
          courses: [],
          lecturers: [],
          classes: [],
          venues: [],
          stats: [],
          quickActions: [],
          coursesLabel: 'Recent Courses',
          lecturersLabel: 'All Lecturers',
        };

      case 'registry':
        return {
          title: 'Registry Dashboard',
          subtitle: 'Academic Records & Timetable Management',
          courses: [],
          lecturers: [],
          classes: [],
          venues: [],
          stats: [],
          quickActions: [],
          coursesLabel: 'Courses',
          lecturersLabel: 'Lecturers',
        };

      case 'superadmin':
        const deptCourses = courses.filter(c => c.program === user?.department || c.program === 'Computer Science');
        const deptLecturers = lecturers.filter(l => l.department === user?.department || l.department === 'Computer Science');
        const deptClasses = classes.filter(c => c.program === user?.department || c.program === 'Computer Science');
        return {
          title: 'Super Admin Dashboard',
          subtitle: `${user?.department || 'Department'} Management & System Control`,
          courses: deptCourses,
          lecturers: deptLecturers,
          classes: deptClasses,
          venues: venues,
          stats: [
            {
              label: 'Total Users',
              value: users.length,
              icon: <Users className="w-8 h-8 text-blue-600" />,
              bgColor: 'bg-blue-50',
              link: '/roles',
              change: '+12%',
            },
            {
              label: 'Departments',
              value: departments.length,
              icon: <Building2 className="w-8 h-8 text-purple-600" />,
              bgColor: 'bg-purple-50',
              link: '#',
              change: '+2',
            },
            {
              label: 'Active Courses',
              value: courses.length,
              icon: <BookOpen className="w-8 h-8 text-green-600" />,
              bgColor: 'bg-green-50',
              link: '/courses',
              change: '+18%',
            },
            {
              label: 'Timetables',
              value: timetables.length,
              icon: <Calendar className="w-8 h-8 text-orange-600" />,
              bgColor: 'bg-orange-50',
              link: '/timetable/teaching',
              change: '+5',
            },
          ],
          quickActions: [
            {
              title: 'Manage Roles',
              description: 'Assign and manage user permissions',
              icon: <UserCog className="w-6 h-6 text-white" />,
              link: '/roles',
              color: 'from-[#667eea] to-[#764ba2]',
            },
            {
              title: 'Manage Teaching Schedule',
              description: 'View and edit department teaching timetables',
              icon: <Calendar className="w-6 h-6 text-white" />,
              link: '/timetable/teaching',
              color: 'from-[#2F80ED] to-[#56CCF2]',
            },
            {
              title: 'Manage Exam Schedule',
              description: 'Schedule department exams and allocate venues',
              icon: <CalendarCheck className="w-6 h-6 text-white" />,
              link: '/timetable/exam',
              color: 'from-[#EB5757] to-[#F2994A]',
            },
            {
              title: 'System Settings',
              description: 'Configure system-wide preferences',
              icon: <Settings className="w-6 h-6 text-white" />,
              link: '/settings',
              color: 'from-[#56ab2f] to-[#a8e063]',
            },
          ],
          coursesLabel: 'Department Courses',
          lecturersLabel: 'Department Lecturers',
        };

      case 'exam-coordinator':
        return {
          title: 'Exam Coordinator Dashboard',
          subtitle: 'Exam Scheduling & Invigilation Management',
          courses: courses,
          lecturers: lecturers,
          classes: classes,
          venues: venues,
          stats: [
            {
              label: 'Total Courses',
              value: courses.length,
              icon: <BookOpen className="w-8 h-8 text-blue-600" />,
              bgColor: 'bg-blue-50',
              link: '/courses',
            },
            {
              label: 'Available Venues',
              value: venues.length,
              icon: <Building2 className="w-8 h-8 text-green-600" />,
              bgColor: 'bg-green-50',
              link: '/venues',
            },
            {
              label: 'Total Classes',
              value: classes.length,
              icon: <Users className="w-8 h-8 text-purple-600" />,
              bgColor: 'bg-purple-50',
              link: '/classes',
            },
            {
              label: 'Exam Schedules',
              value: timetables.length,
              icon: <CalendarCheck className="w-8 h-8 text-orange-600" />,
              bgColor: 'bg-orange-50',
              link: '/timetable/exam',
            },
          ],
          quickActions: [
            {
              title: 'Manage Exam Schedule',
              description: 'Schedule exams and allocate venues',
              icon: <CalendarCheck className="w-6 h-6 text-white" />,
              link: '/admin/timetable/exam',
              color: 'from-[#EB5757] to-[#F2994A]',
            },
            {
              title: 'Manage Invigilation Roster',
              description: 'Assign invigilators to exam sessions',
              icon: <UserCog className="w-6 h-6 text-white" />,
              link: '/invigilation/roster',
              color: 'from-[#9B51E0] to-[#BB6BD9]',
            },
          ],
          coursesLabel: 'Courses with Exams',
          lecturersLabel: 'Available Invigilators',
        };

      case 'lecturer':
        const lecturerCourses = courses.filter(c => c.lecturer === user?.name);
        return {
          title: 'Lecturer Dashboard',
          subtitle: `Welcome, ${user?.name}`,
          courses: lecturerCourses,
          lecturers: [],
          classes: [],
          venues: [],
          stats: [
            {
              label: 'My Courses',
              value: lecturerCourses.length,
              icon: <BookOpen className="w-8 h-8 text-blue-600" />,
              bgColor: 'bg-blue-50',
              link: '/courses',
            },
            {
              label: 'Teaching Hours',
              value: lecturerCourses.reduce((sum, c) => sum + (c.duration || 0), 0),
              icon: <Calendar className="w-8 h-8 text-green-600" />,
              bgColor: 'bg-green-50',
              link: '/timetable/teaching',
            },
            {
              label: 'Pending Requests',
              value: approvals.filter(a => a.status === 'pending').length,
              icon: <CalendarCheck className="w-8 h-8 text-purple-600" />,
              bgColor: 'bg-purple-50',
              link: '/lecturers/change-requests',
            },
            {
              label: 'Invigilation Duties',
              value: 0,
              icon: <UserCog className="w-8 h-8 text-orange-600" />,
              bgColor: 'bg-orange-50',
              link: '/invigilation/roster',
            },
          ],
          quickActions: [
            {
              title: 'View My Timetable',
              description: 'Check your teaching schedule and availability',
              icon: <Calendar className="w-6 h-6 text-white" />,
              link: '/timetable/teaching',
              color: 'from-[#2F80ED] to-[#56CCF2]',
            },
            {
              title: 'Request Schedule Change',
              description: 'Submit a timetable change request',
              icon: <CalendarCheck className="w-6 h-6 text-white" />,
              link: '/lecturers/change-requests',
              color: 'from-[#EB5757] to-[#F2994A]',
            },
          ],
          coursesLabel: 'My Courses',
          lecturersLabel: null,
        };

      case 'student':
        return {
          title: 'Student Dashboard',
          subtitle: `Welcome, ${user?.name}`,
          courses: courses.slice(0, 5),
          lecturers: [],
          classes: [],
          venues: [],
          stats: [
            {
              label: 'Enrolled Courses',
              value: 6,
              icon: <BookOpen className="w-8 h-8 text-blue-600" />,
              bgColor: 'bg-blue-50',
              link: '/student/timetable',
            },
            {
              label: 'This Week Classes',
              value: 15,
              icon: <Calendar className="w-8 h-8 text-green-600" />,
              bgColor: 'bg-green-50',
              link: '/student/timetable',
            },
            {
              label: 'Upcoming Exams',
              value: 3,
              icon: <CalendarCheck className="w-8 h-8 text-purple-600" />,
              bgColor: 'bg-purple-50',
              link: '/student/exams',
            },
            {
              label: 'Study Sessions',
              value: 8,
              icon: <GraduationCap className="w-8 h-8 text-orange-600" />,
              bgColor: 'bg-orange-50',
              link: '/student/study-planner',
            },
          ],
          quickActions: [
            {
              title: 'View Class Timetable',
              description: 'Check your weekly class schedule',
              icon: <Calendar className="w-6 h-6 text-white" />,
              link: '/student/timetable',
              color: 'from-[#2F80ED] to-[#56CCF2]',
            },
            {
              title: 'View Exam Schedule',
              description: 'Check exam dates and venues',
              icon: <CalendarCheck className="w-6 h-6 text-white" />,
              link: '/student/exams',
              color: 'from-[#EB5757] to-[#F2994A]',
            },
          ],
          coursesLabel: 'My Courses',
          lecturersLabel: null,
        };

      default:
        return {
          title: 'Dashboard',
          subtitle: 'Welcome',
          courses: [],
          lecturers: [],
          classes: [],
          venues: [],
          stats: [],
          quickActions: [],
          coursesLabel: 'Courses',
          lecturersLabel: 'Lecturers',
        };
    }
  };

  const dashboardData = getDashboardData();

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        setUploadMessage('Please upload a CSV file');
        setUploadStatus('error');
        return;
      }
      setUploadFile(file);
      setUploadStatus('idle');
      setUploadMessage('');
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) {
      setUploadMessage('Please select a file');
      setUploadStatus('error');
      return;
    }

    setUploadStatus('uploading');
    setUploadMessage('Uploading and processing courses...');

    try {
      // Simulate file reading and processing
      const text = await uploadFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('CSV file is empty or has no data rows');
      }

      // Parse CSV header
      const headers = lines[0].split(',').map(h => h.trim());
      const requiredHeaders = ['code', 'name', 'credits', 'semester', 'program'];
      const hasRequiredHeaders = requiredHeaders.every(h => headers.includes(h));

      if (!hasRequiredHeaders) {
        throw new Error(`CSV must include headers: ${requiredHeaders.join(', ')}`);
      }

      // Parse and add courses
      let successCount = 0;
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length === headers.length) {
          const courseData: any = {};
          headers.forEach((header, index) => {
            courseData[header] = values[index];
          });

          // Add course using context
          const newCourse = {
            id: `course-${Date.now()}-${i}`,
            code: courseData.code || '',
            name: courseData.name || '',
            credits: parseInt(courseData.credits) || 0,
            semester: parseInt(courseData.semester) || 1,
            program: courseData.program || '',
            duration: parseInt(courseData.duration) || 60,
            lecturer: courseData.lecturer || '',
            department: user?.department || '',
          };

          addCourse(newCourse);
          successCount++;
        }
      }

      setUploadStatus('success');
      setUploadMessage(`Successfully uploaded ${successCount} course(s)!`);
      setTimeout(() => {
        setShowUploadModal(false);
        setUploadFile(null);
        setUploadStatus('idle');
        setUploadMessage('');
      }, 2000);
    } catch (error: any) {
      setUploadStatus('error');
      setUploadMessage(error.message || 'Failed to upload courses');
    }
  };

  const handleAddCourse = () => {
    navigate('/courses/create');
  };

  // Super Admin Dashboard - Overview Only
  if (user?.role === 'superadmin') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#4F4F4F]">{dashboardData.title}</h1>
            <p className="text-[#828282] mt-2">{dashboardData.subtitle}</p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardData.stats.map((stat, index) => (
            <div 
              key={index} 
              className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => stat.link !== '#' && navigate(stat.link)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  {stat.icon}
                </div>
                {stat.change && <span className="text-sm text-green-600 font-medium">{stat.change}</span>}
              </div>
              <h3 className="text-2xl font-bold text-[#4F4F4F] mb-1">{stat.value}</h3>
              <p className="text-sm text-[#828282]">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-bold text-[#4F4F4F] mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dashboardData.quickActions.map((action) => (
              <button
                key={action.title}
                onClick={() => navigate(action.link)}
                className="p-4 border-2 border-gray-200 rounded-xl hover:border-[#5B7EFF] hover:bg-blue-50 transition-all text-left"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center mb-3`}>
                  {action.icon}
                </div>
                <h3 className="font-semibold text-[#4F4F4F] mb-1">{action.title}</h3>
                <p className="text-sm text-[#828282]">{action.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-bold text-[#4F4F4F] mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Check className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-[#4F4F4F]">New user registered</p>
                <p className="text-xs text-[#828282]">John Doe added as Lecturer • 2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-[#4F4F4F]">Timetable published</p>
                <p className="text-xs text-[#828282]">Spring 2026 Teaching Timetable • 5 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <BookOpen className="w-5 h-5 text-purple-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-[#4F4F4F]">Course updated</p>
                <p className="text-xs text-[#828282]">CS301 - Database Systems modified • 1 day ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Regular Dashboard for other roles
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{dashboardData.title}</h1>
        <p className="text-gray-600 mt-1">{dashboardData.subtitle}</p>
      </div>

      {/* KPI Cards Grid - 4 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardData.stats.map((stat) => (
          <Card 
            key={stat.label}
            className="cursor-pointer hover:shadow-md transition-shadow duration-200" 
            onClick={() => stat.link && stat.link !== '#' && navigate(stat.link)}
          >
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} p-4 rounded-lg`}>
                  {stat.icon}
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Main Content Grid - 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Courses Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">{dashboardData.coursesLabel}</h2>
              {(user?.role === 'superadmin' || user?.role === 'admin' || user?.role === 'registry') && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAddCourse}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#5B5FFF] to-[#7C8FFF] text-white text-sm rounded-lg hover:shadow-md transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Add Course
                  </button>
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-all"
                  >
                    <Upload className="w-4 h-4" />
                    Upload
                  </button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardBody>
            {dashboardData.courses.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No courses found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dashboardData.courses.slice(0, 5).map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors duration-200"
                    onClick={() => navigate(`/courses/edit/${course.id}`)}
                  >
                    <div>
                      <p className="font-medium text-gray-900">{course.code} - {course.name}</p>
                      <p className="text-sm text-gray-600">Semester {course.semester} • {course.credits} Credits</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Lecturers Card - Only for roles that see lecturers */}
        {dashboardData.lecturersLabel && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">{dashboardData.lecturersLabel}</h2>
            </CardHeader>
            <CardBody>
              {dashboardData.lecturers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No lecturers found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dashboardData.lecturers.slice(0, 5).map((lecturer) => (
                    <div
                      key={lecturer.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors duration-200"
                      onClick={() => navigate(`/lecturers/edit/${lecturer.id}`)}
                    >
                      <div>
                        <p className="font-medium text-gray-900">{lecturer.name}</p>
                        <p className="text-sm text-gray-600">{lecturer.specialization?.join(', ') || 'No specialization'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        )}

        {/* For Lecturer and Student - show a different second card */}
        {!dashboardData.lecturersLabel && user?.role !== 'exam-coordinator' && (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">
                {user?.role === 'lecturer' ? 'Upcoming Sessions' : 'Upcoming Classes'}
              </h2>
            </CardHeader>
            <CardBody>
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No upcoming sessions</p>
                <button
                  onClick={() => navigate(user?.role === 'lecturer' ? '/timetable/teaching' : '/student/timetable')}
                  className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View Full Schedule →
                </button>
              </div>
            </CardBody>
          </Card>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Upload Courses (CSV)</h2>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadFile(null);
                  setUploadStatus('idle');
                  setUploadMessage('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* File Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select CSV File
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  disabled={uploadStatus === 'uploading'}
                />
                {uploadFile && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected: <span className="font-medium">{uploadFile.name}</span>
                  </p>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">CSV Format Instructions:</h3>
                <p className="text-xs text-blue-800 mb-2">Required headers (in order):</p>
                <code className="text-xs bg-white px-2 py-1 rounded border border-blue-200 block mb-2">
                  code, name, credits, semester, program
                </code>
                <p className="text-xs text-blue-800">Example:</p>
                <code className="text-xs bg-white px-2 py-1 rounded border border-blue-200 block">
                  CS101,Introduction to Programming,3,1,Computer Science
                </code>
              </div>

              {/* Status Message */}
              {uploadMessage && (
                <div className={`p-4 rounded-lg ${uploadStatus === 'success' ? 'bg-green-50 border border-green-200' : uploadStatus === 'error' ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'}`}>
                  <p className={`text-sm ${uploadStatus === 'success' ? 'text-green-800' : uploadStatus === 'error' ? 'text-red-800' : 'text-blue-800'}`}>
                    {uploadMessage}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadFile(null);
                  setUploadStatus('idle');
                  setUploadMessage('');
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
                disabled={uploadStatus === 'uploading'}
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!uploadFile || uploadStatus === 'uploading' || uploadStatus === 'success'}
                className="px-4 py-2 bg-gradient-to-r from-[#5B5FFF] to-[#7C8FFF] text-white rounded-lg hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {uploadStatus === 'uploading' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload Courses
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions Section */}
      <div className="pt-6 border-t border-gray-200">
        <h2 className="text-lg font-semibold text-[#4F4F4F] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dashboardData.quickActions.map((action) => (
            <button
              key={action.title}
              onClick={() => navigate(action.link)}
              className="text-left p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-transparent hover:border-[#5B7EFF]/20"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center mb-4`}>
                {action.icon}
              </div>
              <h3 className="font-semibold text-[#4F4F4F] mb-2">{action.title}</h3>
              <p className="text-sm text-[#828282]">{action.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UnifiedDashboard;