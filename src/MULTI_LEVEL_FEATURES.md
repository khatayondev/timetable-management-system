# Multi-Level Timetable Generation - Feature Documentation

## Overview
This document describes the multi-level timetable generation system with enhanced calendar views and auto-generation capabilities.

## New Features Implemented

### 1. Multi-Level Timetable Generation
The system now supports generating timetables at three organizational levels:

#### Class Level
- Generate timetable for a single class (e.g., L100 CS Class)
- Independent scheduling for that specific class

#### Department Level
- Generate consolidated timetable for an entire department (e.g., Computer Science Department)
- Automatically includes all classes within the department
- Intelligent conflict resolution across classes

#### Faculty Level
- Generate master timetable for an entire faculty (e.g., Faculty of Applied Sciences)
- Includes all departments and their classes
- Advanced constraint solving for large-scale scheduling

**Access:** Admin → Auto-Generate page (`/admin/timetable/generate`)

### 2. Enhanced Calendar Views
Multiple view modes for better visualization:

#### Teaching Timetable Views
- **Daily View:** Detailed day-by-day schedule with time slots
- **Weekly View:** Traditional grid showing all weekdays
- **Monthly View:** Calendar grid showing recurring sessions
- **List View:** Filterable and sortable list format

#### Exam Timetable Views
- **Daily View:** Exam sessions for specific dates
- **Monthly View:** Calendar overview of exam period
- **List View:** Chronological list with filters

**Access:** 
- Teaching: `/timetable/teaching`
- Exams: `/timetable/exam`

### 3. Auto-Generation Engine
Intelligent timetable generation with constraint solving:

#### Teaching Mode Features
- ✅ Respect lecturer availability
- ✅ Prevent student class clashes
- ✅ Match venue capacities
- ✅ Consider lab/lecture requirements
- ✅ Distribute sessions across the week
- ✅ Optional morning slot preference
- ✅ Avoid Friday afternoons option

#### Exam Mode Features
- ✅ Assign invigilators (not teaching the course)
- ✅ Prevent student fatigue (max 2-3 exams/day)
- ✅ Auto-batch large classes
- ✅ Allocate multiple venues when needed
- ✅ Sequential date scheduling
- ✅ Configurable exam duration and timing

### 4. Export Capabilities
All timetables support multiple export formats:

#### PDF Export
- Browser-based print dialog
- Formatted for A4 paper
- Professional styling
- Includes headers and metadata

#### Excel Export
- CSV format
- All session details
- Import-friendly format
- Filterable data

**Available on:** All timetable viewer pages

### 5. Organization Hierarchy
New organizational structure support:

#### Faculty
- Top-level organizational unit
- Contains multiple departments
- Has dean and contact info

#### Department
- Mid-level unit
- Belongs to a faculty
- Contains multiple classes
- Has head and contact info

**Management:** Context-based (OrganizationProvider)

## User Roles & Permissions

### Admin / Registry
- ✅ Full access to all features
- ✅ Can auto-generate at all levels
- ✅ Manage change requests
- ✅ Override constraints
- ✅ Publish timetables
- ✅ Export all formats

### Faculty
- ✅ View department timetables
- ✅ Submit change requests (via lecturers)
- ✅ Export departmental schedules
- ❌ Cannot auto-generate

### Lecturer
- ✅ View assigned teaching schedule
- ✅ Submit change requests
- ✅ View invigilation roster
- ✅ Export personal schedule
- ❌ Cannot modify timetables directly

### Student
- ✅ View class timetable
- ✅ View exam schedule
- ✅ Check exam venues
- ✅ Export personal schedule
- ❌ Read-only access

## Constraint Validation

### Teaching Constraints
1. **No Class Clash:** A class cannot have two sessions at the same time
2. **Lecturer Availability:** Sessions only scheduled when lecturer is available
3. **Venue Capacity:** Student count must not exceed venue capacity
4. **Venue Type Matching:** Labs must be scheduled in laboratory venues
5. **Weekly Distribution:** Sessions spread across the week

### Exam Constraints
1. **Invigilation Rules:** Invigilators cannot supervise their own exams
2. **Student Fatigue:** Maximum 2-3 exams per student per day
3. **Venue Capacity:** Seating capacity enforced for exam mode
4. **Batch Creation:** Large classes automatically split into batches
5. **Date Sequencing:** Exams scheduled linearly across period

## Change Request Workflow

### Lecturer Submission
1. Lecturer navigates to "My Requests"
2. Selects session to modify
3. Proposes change (time/venue/date)
4. System validates constraints
5. Request submitted for approval

### Admin Review
1. View all pending requests
2. See constraint validation results
3. Approve or reject with reason
4. Auto-reject if hard conflicts exist
5. Notify lecturer of decision

### Status Types
- **Pending:** Awaiting admin review
- **Approved:** Change accepted and applied
- **Rejected:** Change denied by admin
- **Auto-Rejected:** Failed constraint validation

## API / Context Integration

### OrganizationContext
```typescript
- faculties: Faculty[]
- departments: Department[]
- addDepartment() / updateDepartment() / deleteDepartment()
- addFaculty() / updateFaculty() / deleteFaculty()
```

### Multi-Level Generator
```typescript
TeachingTimetableGenerator.generate(options)
ExamTimetableGenerator.generate(options)
- Supports class/department/faculty levels
- Returns GenerationResult with metadata and conflicts
```

### Export Utilities
```typescript
exportTeachingSessionsToExcel(sessions, filename)
exportExamSessionsToExcel(sessions, filename)
exportToPDF(content, filename)
```

## Responsive Design
- ✅ Mobile-friendly sidebar (overlay mode)
- ✅ Responsive calendar views
- ✅ Touch-friendly controls
- ✅ Adaptive layouts for all screen sizes

## Success Criteria Met
✅ Admin can auto-generate at class/department/faculty levels  
✅ Multiple calendar views implemented  
✅ Constraint validation enforced  
✅ Change request workflow operational  
✅ Role-based filtering works correctly  
✅ PDF and Excel export functional  
✅ Mobile responsive design complete  

## Navigation Guide

### For Administrators
1. **Auto-Generate:** Sidebar → Auto-Generate
2. **Manage Teaching:** Sidebar → Teaching Schedule
3. **Manage Exams:** Sidebar → Exam Schedule
4. **Review Requests:** Sidebar → Change Requests

### For Lecturers
1. **View Schedule:** Sidebar → Teaching Timetable
2. **Submit Request:** Sidebar → My Requests
3. **Check Invigilation:** Sidebar → Invigilation

### For Students
1. **View Timetable:** Sidebar → My Timetable
2. **Check Exams:** Sidebar → My Exams

## Technical Notes
- All calendar components are in `/components/calendar/`
- Generator logic in `/utils/multiLevelGenerator.ts`
- Export utilities in `/utils/exportUtils.ts`
- Organization context in `/context/OrganizationContext.tsx`
- Enhanced viewers in `/pages/Timetables/`

## Future Enhancements
- Real-time conflict detection
- Drag-and-drop timetable editing
- Email notifications for changes
- Advanced analytics and reporting
- Integration with student information system
- Bulk import from Excel
