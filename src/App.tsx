import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';
import { AuthProvider, useAuth } from './context/AuthContext';
import { VenueProvider } from './context/VenueContext';
import { CourseProvider } from './context/CourseContext';
import { ClassProvider } from './context/ClassContext';
import { LecturerProvider } from './context/LecturerContext';
import { TimetableProvider } from './context/TimetableContext';
import { ApprovalProvider } from './context/ApprovalContext';
import { InvigilationProvider } from './context/InvigilationContext';
import { ChangeRequestProvider } from './context/ChangeRequestContext';
import { OrganizationProvider } from './context/OrganizationContext';
import { ReminderProvider } from './context/ReminderContext';
import { UserManagementProvider } from './context/UserManagementContext';
import './styles/globals.css';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Auth Pages
import Login from './pages/Auth/Login';

// Dashboard Pages
import AdminDashboard from './pages/Dashboards/AdminDashboard';
import DepartmentDashboard from './pages/Dashboards/DepartmentDashboard';
import LecturerDashboard from './pages/Dashboards/LecturerDashboard';
import StudentDashboard from './pages/Dashboards/StudentDashboard';

// Venue Pages
import VenueList from './pages/Venues/VenueList';
import VenueCreate from './pages/Venues/VenueCreate';
import VenueEdit from './pages/Venues/VenueEdit';

// Course Pages
import CourseList from './pages/Courses/CourseList';
import CourseManagement from './pages/Courses/CourseManagement';
import CourseCreate from './pages/Courses/CourseCreate';
import CourseEdit from './pages/Courses/CourseEdit';

// Lecturer Pages
import LecturerList from './pages/Lecturers/LecturerList';
import LecturerCreate from './pages/Lecturers/LecturerCreate';
import LecturerEdit from './pages/Lecturers/LecturerEdit';
import LecturerAvailability from './pages/Lecturers/LecturerAvailability';
import LecturerChangeRequests from './pages/Lecturer/ChangeRequests';

// Class Pages
import ClassList from './pages/Classes/ClassList';
import ClassForm from './pages/Classes/ClassForm';

// Timetable Pages
import EnhancedTimetableViewer from './pages/Timetables/EnhancedTimetableViewer';
import EnhancedExamViewer from './pages/Timetables/EnhancedExamViewer';
import ConflictView from './pages/Timetables/ConflictView';
import InvigilatorScheduling from './pages/Timetables/InvigilatorScheduling';

// Admin Pages
import ChangeRequestDashboard from './pages/Admin/ChangeRequestDashboard';

// Approval Pages
import ApprovalsAndRequests from './pages/Approvals/ApprovalsAndRequests';
import ApprovalDetail from './pages/Approvals/ApprovalDetail';

// Report Pages
import Reports from './pages/Reports/Reports';

// Student Pages
import StudentTimetable from './pages/Student/StudentTimetable';
import ExamVenues from './pages/Student/ExamVenues';
import PersonalStudyTimetable from './pages/Student/PersonalStudyTimetable';

// Invigilation Pages
import InvigilationRoster from './pages/Invigilation/InvigilationRoster';

// Management Pages
import ClassesAndLecturers from './pages/Management/ClassesAndLecturers';

// Role Management Pages
import RoleManagement from './pages/Roles/RoleManagement';
import AssignRole from './pages/Roles/AssignRole';

// Settings Pages
import Settings from './pages/Settings/Settings';
import ReminderPreferences from './pages/Settings/ReminderPreferences';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Dashboard Router - routes to correct dashboard based on role
const DashboardRouter = () => {
  const { user } = useAuth();

  switch (user?.role) {
    case 'superadmin':
      return <DepartmentDashboard />;
    case 'admin':
      return <AdminDashboard />;
    case 'registry':
      return <AdminDashboard />;
    case 'lecturer':
      return <LecturerDashboard />;
    case 'student':
      return <StudentDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <OrganizationProvider>
          <VenueProvider>
            <CourseProvider>
              <ClassProvider>
                <LecturerProvider>
                  <TimetableProvider>
                    <InvigilationProvider>
                      <ApprovalProvider>
                        <ChangeRequestProvider>
                          <ReminderProvider>
                            <UserManagementProvider>
                              <Routes>
                                {/* Auth Routes */}
                                <Route path="/login" element={<Login />} />

                                {/* Protected Routes */}
                                <Route
                                  path="/"
                                  element={
                                    <ProtectedRoute>
                                      <DashboardLayout />
                                    </ProtectedRoute>
                                  }
                                >
                                  {/* Dashboard */}
                                  <Route path="dashboard" element={<DashboardRouter />} />

                                  {/* Venue Management */}
                                  <Route
                                    path="venues"
                                    element={
                                      <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                                        <VenueList />
                                      </ProtectedRoute>
                                    }
                                  />
                                  <Route
                                    path="venues/create"
                                    element={
                                      <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                                        <VenueCreate />
                                      </ProtectedRoute>
                                    }
                                  />
                                  <Route
                                    path="venues/edit/:id"
                                    element={
                                      <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                                        <VenueEdit />
                                      </ProtectedRoute>
                                    }
                                  />

                                  {/* Course Management - Updated routing */}
                                  <Route
                                    path="courses"
                                    element={
                                      <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                                        <CourseManagement />
                                      </ProtectedRoute>
                                    }
                                  />
                                  {/* Redirect old courses/management paths to courses */}
                                  <Route
                                    path="courses/management/*"
                                    element={<Navigate to="/courses" replace />}
                                  />
                                  <Route
                                    path="courses/management"
                                    element={<Navigate to="/courses" replace />}
                                  />
                                  <Route
                                    path="courses/create"
                                    element={
                                      <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                                        <CourseCreate />
                                      </ProtectedRoute>
                                    }
                                  />
                                  <Route
                                    path="courses/edit/:id"
                                    element={
                                      <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                                        <CourseEdit />
                                      </ProtectedRoute>
                                    }
                                  />

                                  {/* Lecturer Management */}
                                  <Route
                                    path="lecturers"
                                    element={
                                      <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                                        <LecturerList />
                                      </ProtectedRoute>
                                    }
                                  />
                                  <Route
                                    path="lecturers/create"
                                    element={
                                      <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                                        <LecturerCreate />
                                      </ProtectedRoute>
                                    }
                                  />
                                  <Route
                                    path="lecturers/edit/:id"
                                    element={
                                      <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                                        <LecturerEdit />
                                      </ProtectedRoute>
                                    }
                                  />
                                  <Route
                                    path="lecturers/availability/:id"
                                    element={
                                      <ProtectedRoute allowedRoles={['superadmin', 'admin', 'lecturer']}>
                                        <LecturerAvailability />
                                      </ProtectedRoute>
                                    }
                                  />
                                  <Route
                                    path="lecturers/change-requests"
                                    element={
                                      <ProtectedRoute allowedRoles={['superadmin', 'admin', 'lecturer']}>
                                        <LecturerChangeRequests />
                                      </ProtectedRoute>
                                    }
                                  />

                                  {/* Class Management */}
                                  <Route
                                    path="classes"
                                    element={
                                      <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                                        <ClassList />
                                      </ProtectedRoute>
                                    }
                                  />
                                  <Route
                                    path="classes/create"
                                    element={
                                      <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                                        <ClassForm />
                                      </ProtectedRoute>
                                    }
                                  />
                                  <Route
                                    path="classes/edit/:id"
                                    element={
                                      <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                                        <ClassForm />
                                      </ProtectedRoute>
                                    }
                                  />

                                  {/* Timetable Management */}
                                  <Route path="timetable/teaching" element={<EnhancedTimetableViewer />} />
                                  <Route path="timetable/exam" element={<EnhancedExamViewer />} />
                                  <Route path="timetable/conflicts" element={<ConflictView />} />
                                  <Route path="timetable/invigilator-scheduling" element={<InvigilatorScheduling />} />

                                  {/* Admin Change Requests */}
                                  <Route
                                    path="admin/change-requests"
                                    element={
                                      <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                                        <ChangeRequestDashboard />
                                      </ProtectedRoute>
                                    }
                                  />

                                  {/* Approvals */}
                                  <Route
                                    path="approvals"
                                    element={
                                      <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                                        <ApprovalsAndRequests />
                                      </ProtectedRoute>
                                    }
                                  />
                                  <Route
                                    path="approvals/:id"
                                    element={
                                      <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                                        <ApprovalDetail />
                                      </ProtectedRoute>
                                    }
                                  />

                                  {/* Reports */}
                                  <Route
                                    path="reports"
                                    element={
                                      <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                                        <Reports />
                                      </ProtectedRoute>
                                    }
                                  />

                                  {/* Student Portal */}
                                  <Route
                                    path="student/timetable"
                                    element={
                                      <ProtectedRoute allowedRoles={['student']}>
                                        <StudentTimetable />
                                      </ProtectedRoute>
                                    }
                                  />
                                  <Route
                                    path="student/exams"
                                    element={
                                      <ProtectedRoute allowedRoles={['student']}>
                                        <ExamVenues />
                                      </ProtectedRoute>
                                    }
                                  />
                                  <Route
                                    path="student/study-planner"
                                    element={
                                      <ProtectedRoute allowedRoles={['student']}>
                                        <PersonalStudyTimetable />
                                      </ProtectedRoute>
                                    }
                                  />

                                  {/* Invigilation Portal */}
                                  <Route
                                    path="invigilation/roster"
                                    element={
                                      <ProtectedRoute allowedRoles={['superadmin', 'admin', 'lecturer']}>
                                        <InvigilationRoster />
                                      </ProtectedRoute>
                                    }
                                  />
                                  <Route
                                    path="invigilation"
                                    element={<Navigate to="invigilation/roster" replace />}
                                  />

                                  {/* Management Pages */}
                                  <Route
                                    path="management/classes-and-lecturers"
                                    element={
                                      <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                                        <ClassesAndLecturers />
                                      </ProtectedRoute>
                                    }
                                  />

                                  {/* Role Management Pages */}
                                  <Route
                                    path="roles"
                                    element={
                                      <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                                        <RoleManagement />
                                      </ProtectedRoute>
                                    }
                                  />
                                  <Route
                                    path="roles/assign"
                                    element={
                                      <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                                        <AssignRole />
                                      </ProtectedRoute>
                                    }
                                  />

                                  {/* Settings */}
                                  <Route
                                    path="settings"
                                    element={
                                      <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                                        <Settings />
                                      </ProtectedRoute>
                                    }
                                  />
                                  <Route
                                    path="settings/reminders"
                                    element={
                                      <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                                        <ReminderPreferences />
                                      </ProtectedRoute>
                                    }
                                  />

                                  {/* Default redirect */}
                                  <Route index element={<Navigate to="dashboard" replace />} />
                                </Route>
                              </Routes>
                            </UserManagementProvider>
                          </ReminderProvider>
                        </ChangeRequestProvider>
                      </ApprovalProvider>
                    </InvigilationProvider>
                  </TimetableProvider>
                </LecturerProvider>
              </ClassProvider>
            </CourseProvider>
          </VenueProvider>
        </OrganizationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;