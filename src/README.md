# School Timetable Management System

A comprehensive web-based Timetable Management System built with React.js and Tailwind CSS for academic institutions. The system handles scheduling, venue management, course administration, and approval workflows with support for both weekly teaching timetables and end-of-semester exam scheduling.

## 🎯 Overview

This system generates both weekly teaching timetables and end-of-semester exam timetables while respecting academic rules, venue constraints, and institutional policies.

## 🧩 Core Feature Modules

### 1. Venue Management

A central module that stores and classifies available rooms with dual-mode capacity support.

**Teaching Mode Requirements:**
- Standard capacity (e.g., Lab V12 holds 60 students in teaching mode)
- Lab attributes: Specialized software, equipment suitability
- Room types: Lecture Hall, Laboratory, Workshop, Tutorial Room

**Exam Mode Requirements:**
- Reduced seating capacity due to spacing (e.g., 60 seats → 30 exam seats)
- Suitability tags: Furniture type (Flat Table vs Tablet Chair), Noise level
- Exam-specific constraints: Overflow handling, multi-room allocation

### 2. Course & Class Management

Module handling the academic structure with class-based organization.

**Structural Components:**
- **Course Management**: Code, title, credit hours, course type (Lecture/Lab/Tutorial), exam type (Theory/Practical)
- **Class Management**: Replaces "Student Groups" (e.g., "Level 300 CS Class A")
- **Duration Rules**: Lecture (2 hrs), Lab (3 hrs)
- **Exam Batching Logic**: Automatic splitting of large classes (e.g., 100 students with 20-capacity lab → 5 exam sessions)

### 3. Constraint Solver (AI/Logic Engine)

Responsible for conflict detection and automated scheduling.

**Teaching Mode Constraints:**
- Lecturer availability windows
- Room availability windows
- Class clash prevention
- Lab scheduling rules (no overlap with theoretical courses)

**Exam Mode Constraints:**
- Lecturer cannot invigilate their own exam
- Student fatigue minimization (avoid two exams same day for same class)
- Room suitability enforcement
- Seating capacity enforcement with auto-batching
- Auto-generation of invigilation roster

### 4. Reporting & Publishing

Final output generation for stakeholders.

**Teaching Mode Outputs:**
- Master Timetable (global view weekly)
- Lecturer Schedule (per lecturer)
- Class Schedule (per class)
- Export: PDF, Excel (.xlsx)

**Exam Mode Outputs:**
- Exam Master Timetable
- Room Allocation Sheets
- Class Exam Dockets
- Invigilation Roster
- Export: PDF, Excel (.xlsx)

## 🗂 Data Model

### Core Entities

- **Institution**: Top-level organization settings
- **AcademicYear**: Academic year configuration
- **Semester**: Semester periods (1 or 2)
- **Venue**: Physical rooms with teaching/exam capacities
- **VenueType**: Categorization (lecture_hall, laboratory, workshop, tutorial_room, exam_hall)
- **Class**: Student groups (replaces "Student Groups")
- **Student**: Individual student records
- **Course**: Academic courses with prerequisites
- **Lecturer**: Faculty members
- **TeachingSession**: Weekly recurring sessions
- **ExamSession**: One-time exam events
- **InvigilationAssignment**: Exam supervision assignments

### Key Relations

- Course ↔ Class (many-to-many)
- Class ↔ Student (one-to-many)
- Course ↔ Lecturer (many-to-many)
- Venue ↔ TeachingSession (one-to-many)
- Venue ↔ ExamSession (one-to-many)

## ⚙ System Modes

### Teaching Mode (Weekly Cycle)
Produces repeating weekly timetable with conflict detection for:
- Class scheduling clashes
- Lecturer availability
- Venue availability
- Lab-lecture overlap prevention

### Exam Mode (Linear Date Sequence)
Produces one-time event schedule across exam period with:
- Automatic batch generation for large classes
- Invigilation roster generation
- Capacity enforcement
- Student fatigue minimization

## 🎨 UI/UX Design System

### Style Guide

**Color Palette:**
- Primary Blues: #2F80ED, #56CCF2
- Teal: #6FCF97
- Yellow: #F2C94C
- Neutrals: #4F4F4F, #828282, #F8FBFF

**Components:**
- Card-based layouts with rounded corners (lg-2xl)
- Soft shadow elevation layers
- Dark blue gradient sidebar
- Highlighted accent colors for active items
- Clean typography hierarchy

### Component Library

- Dashboard metrics cards
- Action buttons (Add Course, Add Venue, Generate Timetable)
- Data tables with sorting and filtering
- Modal forms for CRUD operations
- Export buttons (PDF/Excel)

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn
- Modern web browser

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start
```

### Project Structure

```
/
├── components/
│   ├── common/          # Reusable UI components
│   ├── forms/           # Form components
│   ├── layout/          # Layout components (Sidebar, Navbar)
│   └── ui/              # UI library components
├── context/             # React Context providers
│   ├── AuthContext.tsx
│   ├── VenueContext.tsx
│   ├── CourseContext.tsx
│   ├── ClassContext.tsx
│   ├── LecturerContext.tsx
│   ├── TimetableContext.tsx
│   └── InvigilationContext.tsx
├── pages/               # Page components
│   ├── Dashboards/      # Role-specific dashboards
│   ├── Venues/
│   ├── Courses/
│   ├── Classes/
│   ├── Lecturers/
│   ├── Timetables/
│   └── Reports/
├── utils/               # Utility functions
│   ├── constraintSolver.ts   # Scheduling logic
│   └── exportUtils.ts        # PDF/Excel exports
├── layouts/             # Page layouts
└── styles/              # Global styles
```

## 👥 User Roles

### Admin
- Full system access
- User management
- System configuration

### Registry
- Venue management
- Course management
- Class management
- Timetable generation and approval
- Report generation

### Faculty/Department
- Course creation and management
- Timetable review
- Approval requests

### Lecturer
- View teaching schedules
- Manage availability
- View invigilation assignments

### Student
- View personal timetable
- View exam schedule and venues

## 🔐 Role-Based Access Control

Protected routes ensure users only access features appropriate to their role:

```typescript
<ProtectedRoute allowedRoles={['admin', 'registry']}>
  <VenueCreate />
</ProtectedRoute>
```

## 📦 Key Features Implemented

### ✅ Completed

- [x] Context providers for all data models
- [x] Venue management with dual-mode capacity
- [x] Course management with class assignments
- [x] Class management (replacing student groups)
- [x] Constraint solver utilities
- [x] Export utilities (PDF/Excel)
- [x] Collapsible sidebar navigation
- [x] Role-based routing
- [x] Modern UI with Tailwind CSS

### 🚧 In Progress

- [ ] Complete class management pages (Create/Edit)
- [ ] Enhanced dashboard with metrics
- [ ] Complete constraint solver implementation
- [ ] Auto-generation algorithms
- [ ] Invigilation roster management pages
- [ ] Advanced reporting features

## 🛠 Technology Stack

- **Frontend**: React 18+ with TypeScript
- **Routing**: React Router v6
- **Styling**: Tailwind CSS v4
- **State Management**: React Context API
- **Icons**: Lucide React
- **Charts**: Recharts (for dashboard metrics)

## 📝 License

This is a proprietary timetable management system for academic institutions.

## 📧 Support

For support and inquiries, contact your system administrator.

---

**Last Updated**: January 16, 2026
**Version**: 2.0.0
