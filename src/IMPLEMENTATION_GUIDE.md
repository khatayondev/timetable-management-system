# Timetable Management System - Implementation Documentation

## Overview

This document explains the complete implementation of the timetable management system with constraint solving, role-based access control, and change request workflows.

## System Architecture

### Role-Based Access Control (RBAC)

The system supports five user roles with distinct permissions:

| Role | Permissions |
|------|------------|
| **Admin** | Full CRUD access, Approve requests, Publish timetables, Manage all resources |
| **Registry** | Similar to Admin, Manage timetables and approve requests |
| **Faculty** | View timetables, Manage courses and classes |
| **Lecturer** | View timetables, Submit change requests, View personal schedule |
| **Student** | View published timetables and exam schedules (Read-only) |

### Data Models

#### Teaching Session
```typescript
{
  id: string;
  courseId: string;
  classId: string;
  lecturerId: string;
  venueId: string;
  day: string;           // monday, tuesday, etc.
  startTime: string;
  endTime: string;
  sessionType: 'lecture' | 'lab' | 'tutorial';
  weeklyRecurrence: boolean;
}
```

#### Exam Session
```typescript
{
  id: string;
  courseId: string;
  classId: string;
  studentCount: number;
  examType: 'theory' | 'practical';
  date: string;          // Specific date (non-recurring)
  startTime: string;
  endTime: string;
  duration: number;      // in minutes
  venueAllocations: VenueAllocation[];
  batchNumber?: number;  // For batched exams
  totalBatches?: number;
  invigilators: string[]; // Lecturer IDs
}
```

#### Change Request
```typescript
{
  id: string;
  requestType: 'teaching' | 'exam';
  sessionId: string;
  lecturerId: string;
  originalSession: TeachingSession | ExamSession;
  requestedChanges: Partial<TeachingSession | ExamSession>;
  justification: string;
  status: 'pending' | 'approved' | 'rejected' | 'auto_rejected';
  solverResult: 'no_conflict' | 'soft_conflict' | 'hard_conflict';
  conflictDetails?: string[];
}
```

## Constraint Solver Logic

### Teaching Mode Constraints

#### 1. Lecturer Availability
- Checks if lecturer has defined availability windows
- Rejects sessions outside defined hours
- Prevents double-booking of lecturers

```typescript
TeachingConstraintSolver.checkLecturerAvailability(sessions, newSession, availability)
```

#### 2. Class Clash Prevention
- Ensures a class doesn't have overlapping sessions
- Checks day and time conflicts
- Returns true if conflict detected

```typescript
TeachingConstraintSolver.checkClassClash(sessions, newSession)
```

#### 3. Venue & Capacity Rules
- Validates venue is available at requested time
- Checks teaching capacity >= class size
- Verifies lab sessions use laboratory venues

```typescript
TeachingConstraintSolver.checkVenueAvailability(sessions, newSession)
```

### Exam Mode Constraints

#### 1. Invigilation Assignment
- Auto-assigns invigilators to exam sessions
- **Rule**: Lecturers cannot invigilate their own course exams
- Filters available invigilators automatically

```typescript
ExamConstraintSolver.checkLecturerNotInvigilatingOwnExam(session, courseId, lecturerId)
```

#### 2. Student Fatigue Control
- Detects when a class has multiple exams on same day
- Flags as soft conflict for admin review
- Returns conflict count

```typescript
ExamConstraintSolver.checkStudentFatigue(sessions, newSession)
```

#### 3. Automatic Batching
- Calculates required batches when class size exceeds venue capacity
- Suggests venue allocations
- Creates multiple sessions if needed

```typescript
ExamConstraintSolver.calculateExamBatches(studentCount, venues, examType)
```

Example: 
- Class with 100 students
- Lab capacity: 30 students
- Result: 4 batches (30, 30, 30, 10)

## Admin Workflows

### Creating Teaching Timetable

1. Navigate to **Teaching Schedule** (Admin/Registry only)
2. Select timetable (semester/year)
3. Click **Add Session**
4. Fill session details:
   - Select Lecturer
   - Select Course
   - Select Class
   - Choose Session Type (Lecture/Lab/Tutorial)
   - Select Venue
   - Choose Day and Time
5. Click **Validate Constraints**
6. System runs constraint checks:
   - ✓ Lecturer availability
   - ✓ Class clash detection
   - ✓ Venue availability
   - ✓ Venue capacity
7. If validation passes, click **Add Session**
8. Repeat for all sessions
9. Click **Run Constraint Check** to validate entire timetable
10. Click **Publish Timetable** when ready

### Creating Exam Timetable

1. Navigate to **Exam Schedule** (Admin/Registry only)
2. Select exam timetable
3. Click **Schedule Exam**
4. Fill exam details:
   - Select Course
   - Select Class
   - Choose Exam Type (Theory/Practical)
   - Set Date and Time
   - System auto-calculates duration
5. **Automatic Batching**:
   - System calculates if class needs multiple sessions
   - Shows venue allocations
   - Displays batch information
6. **Assign Invigilators**:
   - System filters out course lecturer
   - Select multiple invigilators
7. Click **Schedule Exam**
8. Repeat for all exams
9. Click **Publish Timetable**

### Managing Change Requests

1. Navigate to **Change Requests** (Admin/Registry only)
2. View pending requests with:
   - Lecturer name
   - Original session details
   - Requested changes
   - Justification
   - Constraint solver results
3. For each request:
   - Review constraint check results:
     - ✓ **No Conflict**: Safe to approve
     - ⚠ **Soft Conflict**: Requires admin judgment
     - ✗ **Hard Conflict**: Auto-rejected
   - Add admin notes
   - Click **Approve** or **Reject**
4. Upon approval, timetable updates automatically

## Lecturer Workflows

### Viewing Personal Timetable

1. Navigate to **Teaching Timetable** or **Exam Timetable**
2. View read-only schedule filtered to personal sessions
3. See invigilation assignments

### Submitting Change Requests

1. Navigate to **My Requests**
2. Click **New Request**
3. Select session to modify
4. Specify changes:
   - Change day
   - Change time
   - Change venue (if needed)
5. Provide justification (required)
6. Submit request
7. **Constraint Solver runs automatically**:
   - **No Conflict**: Request goes to admin for approval
   - **Soft Conflict**: Request flagged but submitted
   - **Hard Conflict**: Request auto-rejected with explanation
8. Track status:
   - Pending
   - Approved
   - Rejected

### Request Status Flow

```
Lecturer Submits Request
    ↓
Constraint Solver Analysis
    ↓
┌───────────────┬────────────────┬──────────────────┐
No Conflict     Soft Conflict     Hard Conflict
    ↓               ↓                  ↓
Pending         Pending          Auto-Rejected
    ↓               ↓
Admin Reviews   Admin Reviews
    ↓               ↓
Approved/Rejected   Approved/Rejected
    ↓
Timetable Updates
```

## Student Workflows

### Viewing Timetables

1. Navigate to **My Timetable**
2. View class teaching schedule
3. Filter by day
4. Navigate to **My Exams**
5. View exam schedule with:
   - Exam date and time
   - Venue allocation
   - Exam duration

## Invigilation Workflows

1. Navigate to **Invigilation**
2. View assigned exam sessions
3. Filter by date
4. See venue and student count

## Publication Model

### Timetable States

| State | Visibility | Actions Available |
|-------|-----------|-------------------|
| **DRAFT** | Admin only | Edit, Delete, Run checks |
| **PUBLISHED** | All users | View only (Admin can unpublish) |
| **ARCHIVED** | Read-only | Historical reference |

### Publishing Requirements

#### Teaching Timetable
- All critical conflicts resolved
- No class clashes
- All venues allocated
- Lecturer availability respected

#### Exam Timetable
- All sessions have assigned invigilators
- Venue capacity validated
- No hard conflicts
- Student fatigue warnings reviewed

## Constraint Validation Examples

### Example 1: Class Clash Detection

```
❌ CONFLICT DETECTED

Class: Level 300 CS Class A
Day: Monday

Session 1: Data Structures (09:00 - 11:00)
Session 2: Database Systems (10:00 - 12:00)

Issue: Overlapping time slots
Suggestion: Reschedule one session to a different time
```

### Example 2: Lecturer Double Booking

```
❌ CONFLICT DETECTED

Lecturer: Dr. Samuel Owusu
Day: Tuesday
Time: 14:00 - 16:00

Session 1: Data Structures (Level 300 CS A)
Session 2: Algorithms (Level 400 CS B)

Issue: Lecturer scheduled for two sessions simultaneously
Suggestion: Assign different lecturer or change time
```

### Example 3: Venue Capacity

```
❌ CONSTRAINT VIOLATION

Venue: Computer Lab V12
Capacity: 30 students
Class: Level 300 CS Class A (85 students)

Issue: Class size exceeds venue capacity
Suggestion: Use larger venue or create lab groups
```

### Example 4: Exam Batching

```
✓ AUTO-BATCHING APPLIED

Class: Level 300 CS Class A (100 students)
Exam Type: Practical
Largest Lab: Computer Lab V12 (30 capacity)

Result:
- Batch 1: 30 students (09:00-12:00)
- Batch 2: 30 students (14:00-17:00)
- Batch 3: 30 students (Next day 09:00-12:00)
- Batch 4: 10 students (Next day 14:00-17:00)
```

## API Endpoints (Frontend Implementation)

All state management is handled through React Context APIs:

### TimetableContext
- `addTeachingSession(timetableId, session)`
- `addExamSession(timetableId, session)`
- `removeSession(timetableId, sessionId)`
- `detectConflicts(timetableId)`
- `publishTimetable(timetableId)`

### ChangeRequestContext
- `submitChangeRequest(request)` → Returns solver result
- `approveChangeRequest(requestId, adminId, notes)`
- `rejectChangeRequest(requestId, adminId, notes)`
- `getPendingRequests()`
- `getLecturerRequests(lecturerId)`

### Constraint Solver Utilities
- `TeachingConstraintSolver.checkClassClash()`
- `TeachingConstraintSolver.checkLecturerAvailability()`
- `TeachingConstraintSolver.checkVenueAvailability()`
- `ExamConstraintSolver.calculateExamBatches()`
- `ExamConstraintSolver.checkStudentFatigue()`

## Real-Time Updates

The system uses React Context with state management to provide instant updates:

1. Admin publishes timetable → Status changes to "published"
2. All users see updates immediately on next page load
3. Context providers trigger re-renders across components

For production, implement:
- WebSockets for push notifications
- Server-Sent Events (SSE) for live updates
- Polling with lastModified timestamps

## Routes Summary

### Admin/Registry Routes
- `/admin/timetable/teaching` - Teaching timetable management
- `/admin/timetable/exam` - Exam timetable management
- `/admin/change-requests` - Change request dashboard

### Lecturer Routes
- `/timetable/teaching` - View teaching timetable
- `/timetable/exam` - View exam timetable
- `/lecturers/change-requests` - Submit and track requests
- `/invigilation/roster` - View invigilation duties

### Student Routes
- `/student/timetable` - View class timetable
- `/student/exams` - View exam schedule

## Key Features Implemented

✅ Role-based access control (5 roles)
✅ Teaching timetable creation with constraints
✅ Exam timetable with automatic batching
✅ Constraint solver for both modes
✅ Change request workflow with auto-validation
✅ Admin approval dashboard
✅ Lecturer request submission
✅ Student read-only views
✅ Invigilation roster management
✅ Publishing workflow with states
✅ Conflict detection and resolution
✅ Venue capacity validation
✅ Soft clinical design aesthetic

## Future Enhancements

- Real-time WebSocket notifications
- Email notifications for status changes
- Advanced scheduling algorithms (genetic algorithms)
- Bulk import/export functionality
- Mobile responsive design
- Calendar integrations (Google Calendar, Outlook)
- PDF generation for personal schedules
- Analytics dashboard for utilization metrics
