# Timetable Management System - Routing Structure

## Overview
This document outlines the complete routing structure of the Timetable Management System, organized by functionality and role-based access.

---

## Route Structure

### 🔐 Authentication Routes
| Route | Component | Access | Description |
|-------|-----------|--------|-------------|
| `/login` | Login | Public | User authentication page |

---

### 🏠 Dashboard Routes
| Route | Component | Roles | Description |
|-------|-----------|-------|-------------|
| `/` | DashboardLayout | All authenticated | Root redirect to dashboard |
| `/dashboard` | DashboardRouter | All authenticated | Role-based dashboard (auto-routes based on user role) |

**Dashboard Routing Logic:**
- `superadmin` → DepartmentDashboard (UnifiedDashboard)
- `admin` → AdminDashboard (UnifiedDashboard)
- `registry` → AdminDashboard (UnifiedDashboard)
- `lecturer` → LecturerDashboard
- `student` → StudentDashboard

---

### 🏢 Venue Management Routes
| Route | Component | Roles | Description |
|-------|-----------|-------|-------------|
| `/venues` | VenueList | superadmin, admin | List all venues |
| `/venues/create` | VenueCreate | superadmin, admin | Create new venue |
| `/venues/edit/:id` | VenueEdit | superadmin, admin | Edit existing venue |

---

### 📚 Course Management Routes
| Route | Component | Roles | Description |
|-------|-----------|-------|-------------|
| `/courses` | CourseManagement | superadmin, admin | Course management dashboard (with Add & Upload) |
| `/courses/create` | CourseCreate | superadmin, admin | Create new course |
| `/courses/edit/:id` | CourseEdit | superadmin, admin | Edit existing course |

**Legacy Redirects:**
- `/courses/management` → `/courses`
- `/courses/management/*` → `/courses`

---

### 👨‍🏫 Lecturer Management Routes
| Route | Component | Roles | Description |
|-------|-----------|-------|-------------|
| `/lecturers` | LecturerList | superadmin, admin | List all lecturers |
| `/lecturers/create` | LecturerCreate | superadmin, admin | Create new lecturer |
| `/lecturers/edit/:id` | LecturerEdit | superadmin, admin | Edit existing lecturer |
| `/lecturers/availability/:id` | LecturerAvailability | superadmin, admin, lecturer | Manage lecturer availability |
| `/lecturers/change-requests` | LecturerChangeRequests | superadmin, admin, lecturer | View/manage change requests |

---

### 🎓 Class Management Routes
| Route | Component | Roles | Description |
|-------|-----------|-------|-------------|
| `/classes` | ClassList | superadmin, admin | List all classes |
| `/classes/create` | ClassForm | superadmin, admin | Create new class |
| `/classes/edit/:id` | ClassForm | superadmin, admin | Edit existing class |

---

### 📅 Timetable Routes
| Route | Component | Roles | Description |
|-------|-----------|-------|-------------|
| `/timetable/teaching` | EnhancedTimetableViewer | All authenticated | Teaching timetable calendar view |
| `/timetable/exam` | EnhancedExamViewer | All authenticated | Exam timetable calendar view |
| `/timetable/conflicts` | ConflictView | All authenticated | View timetable conflicts |
| `/timetable/invigilator-scheduling` | InvigilatorScheduling | superadmin, admin, registry | Schedule invigilators |

---

### 📋 Management Routes
| Route | Component | Roles | Description |
|-------|-----------|-------|-------------|
| `/management/classes-and-lecturers` | ClassesAndLecturers | superadmin, admin | Combined management interface |

---

### ✅ Approval & Request Routes
| Route | Component | Roles | Description |
|-------|-----------|-------|-------------|
| `/approvals` | ApprovalsAndRequests | superadmin, admin | View all approvals and requests |
| `/approvals/:id` | ApprovalDetail | superadmin, admin | View specific approval details |
| `/admin/change-requests` | ChangeRequestDashboard | superadmin, admin | Admin change request dashboard |

---

### 👥 Role Management Routes
| Route | Component | Roles | Description |
|-------|-----------|-------|-------------|
| `/roles` | RoleManagement | superadmin, admin | Manage user roles and permissions |
| `/roles/assign` | AssignRole | superadmin, admin | Assign roles to users |

---

### 👨‍🎓 Student Portal Routes
| Route | Component | Roles | Description |
|-------|-----------|-------|-------------|
| `/student/timetable` | StudentTimetable | student | View class timetable |
| `/student/exams` | ExamVenues | student | View exam schedule and venues |
| `/student/study-planner` | PersonalStudyTimetable | student | Personal study planner |

---

### 👁️ Invigilation Routes
| Route | Component | Roles | Description |
|-------|-----------|-------|-------------|
| `/invigilation` | Redirect | - | Redirects to `/invigilation/roster` |
| `/invigilation/roster` | InvigilationRoster | superadmin, admin, lecturer | Invigilation roster management |

---

### 📊 Reports Routes
| Route | Component | Roles | Description |
|-------|-----------|-------|-------------|
| `/reports` | Reports | superadmin, admin | Generate and view reports |

---

### ⚙️ Settings Routes
| Route | Component | Roles | Description |
|-------|-----------|-------|-------------|
| `/settings` | Settings | superadmin, admin | System settings |
| `/settings/reminders` | ReminderPreferences | superadmin, admin | Reminder preferences |

---

## Role-Based Access Summary

### Super Admin (superadmin)
**Full system access including:**
- All dashboards and management features
- Department-specific controls
- Venue, Course, Lecturer, Class management
- Timetable viewing and management
- Approvals and requests
- Role management
- Reports and settings
- Invigilation management

### Admin (admin)
**System-wide management access:**
- Administrative dashboard
- Venue, Course, Lecturer, Class management
- Timetable viewing and management
- Approvals and requests
- Role management
- Reports and settings
- Invigilation management

### Registry (registry)
**Academic records access:**
- Administrative dashboard
- View venues
- View courses
- View classes and lecturers
- Exam timetable management
- Invigilation scheduling
- Approvals viewing

### Lecturer (lecturer)
**Teaching-focused access:**
- Lecturer dashboard
- Personal availability management
- Submit change requests
- View teaching timetables
- View exam timetables
- Invigilation roster

### Student (student)
**Student portal access:**
- Student dashboard
- View class timetable
- View exam schedule and venues
- Personal study planner

---

## Protected Route Logic

All routes except `/login` are protected by authentication. The system implements two levels of protection:

1. **Authentication Check**: Ensures user is logged in
2. **Role-Based Access**: Restricts routes based on user role

```typescript
<ProtectedRoute allowedRoles={['superadmin', 'admin']}>
  <ComponentName />
</ProtectedRoute>
```

---

## Navigation Structure

The sidebar navigation automatically filters menu items based on user role:

- **Dashboard** - All roles
- **Roles & Permissions** - superadmin, admin
- **Venues** - superadmin, admin, registry
- **Courses** - superadmin, admin, registry
- **Classes & Lecturers** - superadmin, admin, registry
- **Approvals & Requests** - superadmin, admin, registry
- **Teaching Timetable** - superadmin, lecturer
- **Exam Timetable** - superadmin, lecturer, admin, registry
- **Invigilator Scheduling** - superadmin, admin, registry
- **My Requests** - lecturer
- **Reports** - superadmin, admin, registry
- **My Timetable** - student
- **Personal Study Timetable** - student
- **My Exams** - student

---

## Context Providers Structure

Routes are wrapped in the following context providers (in order):
1. AuthProvider
2. OrganizationProvider
3. VenueProvider
4. CourseProvider
5. ClassProvider
6. LecturerProvider
7. TimetableProvider
8. InvigilationProvider
9. ApprovalProvider
10. ChangeRequestProvider
11. ReminderProvider
12. UserManagementProvider

---

## Notes

- All routes are nested under the `DashboardLayout` which provides the sidebar and header
- The dashboard route automatically redirects users to their role-specific dashboard
- Legacy course management routes redirect to the new unified course management page
- Settings can be expanded with additional sub-routes as needed
