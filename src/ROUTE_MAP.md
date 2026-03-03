# Route Map - Visual Structure

```
📱 Timetable Management System
│
├── 🔐 /login (Public)
│
└── 🏠 / (Protected - DashboardLayout)
    │
    ├── 📊 /dashboard (Role-based routing)
    │   ├── superadmin → DepartmentDashboard
    │   ├── admin → AdminDashboard
    │   ├── registry → AdminDashboard
    │   ├── lecturer → LecturerDashboard
    │   └── student → StudentDashboard
    │
    ├── 🏢 VENUE MANAGEMENT (superadmin, admin)
    │   ├── /venues
    │   ├── /venues/create
    │   └── /venues/edit/:id
    │
    ├── 📚 COURSE MANAGEMENT (superadmin, admin)
    │   ├── /courses (with Add & Upload functionality)
    │   ├── /courses/create
    │   ├── /courses/edit/:id
    │   └── /courses/management → redirects to /courses
    │
    ├── 👨‍🏫 LECTURER MANAGEMENT
    │   ├── /lecturers (superadmin, admin)
    │   ├── /lecturers/create (superadmin, admin)
    │   ├── /lecturers/edit/:id (superadmin, admin)
    │   ├── /lecturers/availability/:id (superadmin, admin, lecturer)
    │   └── /lecturers/change-requests (superadmin, admin, lecturer)
    │
    ├── 🎓 CLASS MANAGEMENT (superadmin, admin)
    │   ├── /classes
    │   ├── /classes/create
    │   └── /classes/edit/:id
    │
    ├── 📅 TIMETABLE SYSTEM
    │   ├── /timetable/teaching (All authenticated)
    │   ├── /timetable/exam (All authenticated)
    │   ├── /timetable/conflicts (All authenticated)
    │   └── /timetable/invigilator-scheduling (superadmin, admin, registry)
    │
    ├── 📋 MANAGEMENT
    │   └── /management/classes-and-lecturers (superadmin, admin)
    │
    ├── ✅ APPROVALS & REQUESTS
    │   ├── /approvals (superadmin, admin)
    │   ├── /approvals/:id (superadmin, admin)
    │   └── /admin/change-requests (superadmin, admin)
    │
    ├── 👥 ROLE MANAGEMENT (superadmin, admin)
    │   ├── /roles
    │   └── /roles/assign
    │
    ├── 👨‍🎓 STUDENT PORTAL (student)
    │   ├── /student/timetable
    │   ├── /student/exams
    │   └── /student/study-planner
    │
    ├── 👁️ INVIGILATION (superadmin, admin, lecturer)
    │   ├── /invigilation → redirects to /invigilation/roster
    │   └── /invigilation/roster
    │
    ├── 📊 REPORTS (superadmin, admin)
    │   └── /reports
    │
    └── ⚙️ SETTINGS (superadmin, admin)
        ├── /settings
        └── /settings/reminders
```

---

## Quick Access Routes by Role

### 🔴 Super Admin
```
/dashboard
/roles
/venues
/courses
/management/classes-and-lecturers
/lecturers
/classes
/approvals
/timetable/teaching
/timetable/exam
/timetable/invigilator-scheduling
/invigilation/roster
/reports
/settings
/admin/change-requests
```

### 🟠 Admin
```
/dashboard
/roles
/venues
/courses
/management/classes-and-lecturers
/lecturers
/classes
/approvals
/timetable/teaching
/timetable/exam
/timetable/invigilator-scheduling
/invigilation/roster
/reports
/settings
/admin/change-requests
```

### 🟡 Registry
```
/dashboard
/venues (view only)
/courses (view only)
/management/classes-and-lecturers (view only)
/approvals (view only)
/timetable/exam
/timetable/invigilator-scheduling
```

### 🟢 Lecturer
```
/dashboard
/lecturers/availability/:id
/lecturers/change-requests
/timetable/teaching
/timetable/exam
/invigilation/roster
```

### 🔵 Student
```
/dashboard
/student/timetable
/student/exams
/student/study-planner
```

---

## Route Patterns

### Resource Management Pattern
Most management routes follow CRUD pattern:
```
/resource          → List view
/resource/create   → Create new
/resource/edit/:id → Edit existing
```

Examples:
- `/venues`, `/venues/create`, `/venues/edit/:id`
- `/courses`, `/courses/create`, `/courses/edit/:id`
- `/lecturers`, `/lecturers/create`, `/lecturers/edit/:id`
- `/classes`, `/classes/create`, `/classes/edit/:id`

### Nested Resources
Some routes are nested for better organization:
```
/parent/child
/parent/child/:id
```

Examples:
- `/timetable/teaching`
- `/timetable/exam`
- `/timetable/conflicts`
- `/student/timetable`
- `/student/exams`
- `/invigilation/roster`
- `/settings/reminders`

---

## Navigation Flow Examples

### Creating a Course
```
Dashboard → Courses → Add Course Button → Course Create Form → Submit → Back to Courses
```

### Uploading Multiple Courses
```
Dashboard → Courses → Upload Button → Upload Modal → Select CSV → Upload → Courses Updated
```

### Managing Timetables
```
Dashboard → Teaching Timetable → View Calendar → Schedule/Auto-generate → Conflicts Check
```

### Student Checking Exam
```
Dashboard → My Exams → View Exam Schedule → Check Venue Details
```

### Lecturer Change Request
```
Dashboard → My Requests → Create New Request → Submit → Wait for Admin Approval
```
