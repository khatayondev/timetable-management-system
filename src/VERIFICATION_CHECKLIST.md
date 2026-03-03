# System Verification Checklist

## 🔍 Pre-Deployment Verification

Use this checklist to verify all features are working correctly before deploying to production.

---

## ✅ Build & Compile

- [ ] `npm install` completes without errors
- [ ] `npm run dev` starts development server successfully
- [ ] No TypeScript compilation errors
- [ ] No console errors on initial load
- [ ] All routes load without 404 errors

---

## ✅ Authentication & Routing

### Login
- [ ] Login page loads at `/login`
- [ ] Can log in as Admin
- [ ] Can log in as Registry
- [ ] Can log in as Faculty
- [ ] Can log in as Lecturer
- [ ] Can log in as Student
- [ ] Invalid credentials show error message

### Dashboard Routing
- [ ] Admin redirects to Admin Dashboard
- [ ] Registry redirects to Registry Dashboard
- [ ] Faculty redirects to Faculty Dashboard
- [ ] Lecturer redirects to Lecturer Dashboard
- [ ] Student redirects to Student Dashboard

### Protected Routes
- [ ] Unauthenticated users redirect to /login
- [ ] Unauthorized roles redirect to /dashboard
- [ ] Direct URL access is properly protected

---

## ✅ Multi-Level Generation

### Class Level
- [ ] Can select "Class" level in auto-gen modal
- [ ] Dropdown shows all available classes
- [ ] Generates timetable for single class
- [ ] Sessions include all class courses
- [ ] No critical conflicts in simple scenarios

### Department Level
- [ ] Can select "Department" level
- [ ] Dropdown shows all departments
- [ ] Generates timetable for all department classes
- [ ] Resolves conflicts between classes
- [ ] Shows combined schedule

### Faculty Level
- [ ] Can select "Faculty" level
- [ ] Dropdown shows all faculties
- [ ] Generates timetable for entire faculty
- [ ] Aggregates all departments
- [ ] Handles complex conflict resolution

---

## ✅ Teaching Timetable Auto-Generation

### Modal Behavior
- [ ] "Auto-Generate Timetable" button visible (Admin/Registry/Faculty only)
- [ ] Button NOT visible for Lecturer/Student
- [ ] Modal opens when button clicked
- [ ] Can close modal with X button
- [ ] Can close modal with Cancel button
- [ ] Modal prevents generation with empty selections

### Generation Process
- [ ] Select generation level works
- [ ] Entity dropdown populates correctly
- [ ] "Generate Timetable" button enables when valid
- [ ] Shows loading state during generation
- [ ] Generation completes within 5 seconds
- [ ] Generated timetable appears in dropdown
- [ ] Timetable status is "draft"

### Post-Generation
- [ ] Can select generated timetable
- [ ] Calendar views display sessions correctly
- [ ] Conflict detection runs automatically
- [ ] Can export generated timetable
- [ ] Can edit sessions in generated timetable

---

## ✅ Exam Timetable Auto-Generation

### Additional Exam Features
- [ ] Date range selectors work
- [ ] Start date must be before end date
- [ ] Exam period validation works
- [ ] Generates linear schedule (not weekly)
- [ ] Creates exam sessions on specific dates

### Batch Creation
- [ ] Large classes (>lab capacity) create batches
- [ ] Batch numbers assigned correctly (1/3, 2/3, 3/3)
- [ ] Each batch has separate time slot
- [ ] Venue capacity respected per batch

### Venue Allocation
- [ ] Theory exams allocated to large halls
- [ ] Practical exams allocated to labs
- [ ] Multiple venues used if needed
- [ ] Capacity tracking accurate

### Invigilation
- [ ] Invigilators assigned to each exam
- [ ] Lecturers don't invigilate own exams
- [ ] Invigilation load balanced

---

## ✅ Calendar Views

### Daily View
- [ ] Shows sessions for selected date
- [ ] Date picker works
- [ ] Teaching mode: Filters by day name (Monday, Tuesday, etc.)
- [ ] Exam mode: Filters by specific date (YYYY-MM-DD)
- [ ] Timeline layout displays correctly
- [ ] Session cards show all details
- [ ] Mobile layout works

### Weekly View
- [ ] Shows full week grid (Teaching mode only)
- [ ] Days across top (Mon-Sun or Mon-Fri)
- [ ] Time slots down left side
- [ ] Sessions appear in correct cells
- [ ] Multiple sessions in same slot stack
- [ ] Desktop table layout works
- [ ] Mobile accordion layout works

### Monthly View
- [ ] Calendar grid displays
- [ ] Shows current month
- [ ] Can navigate previous/next month
- [ ] Event counts shown on dates with sessions
- [ ] Click date to see sessions
- [ ] Teaching: Recurring sessions shown
- [ ] Exam: Specific date sessions shown

### List View
- [ ] All sessions listed chronologically
- [ ] Sessions grouped by day/date
- [ ] Session cards show all info
- [ ] Sortable columns work
- [ ] Scrollable list
- [ ] Mobile-friendly

### View Switching
- [ ] Can switch between views
- [ ] Active view highlighted
- [ ] View state persists during session
- [ ] Smooth transitions
- [ ] No data loss on switch

---

## ✅ Conflict Detection

### Automatic Detection
- [ ] Conflicts detected on timetable load
- [ ] Conflicts detected after auto-generation
- [ ] Conflicts detected after manual edit
- [ ] Conflict count updates in real-time

### Conflict Types
- [ ] Class clashes detected (same class, two sessions)
- [ ] Lecturer clashes detected (same lecturer, two sessions)
- [ ] Venue clashes detected (same venue, two sessions)
- [ ] Capacity violations detected (students > capacity)
- [ ] Student fatigue detected (exam mode)

### Conflict Display
- [ ] Red alert banner appears when conflicts exist
- [ ] Banner shows conflict count
- [ ] "Show Conflicts" button toggles list
- [ ] Each conflict shows:
  - [ ] Type
  - [ ] Severity (color-coded icon)
  - [ ] Message
  - [ ] Affected sessions
  - [ ] Suggestions

### Conflict Resolution
- [ ] Can edit conflicting sessions
- [ ] Conflicts auto-update after edit
- [ ] Resolved conflicts disappear
- [ ] Remaining conflicts still shown
- [ ] Can resolve all conflicts

---

## ✅ Role-Based Access Control

### Admin Access
- [ ] Can view all timetables (draft, published)
- [ ] Can auto-generate at all levels
- [ ] Can edit any timetable
- [ ] Can publish timetables
- [ ] Can view conflicts
- [ ] Can approve change requests

### Registry Access
- [ ] Can view all timetables
- [ ] Can auto-generate at all levels
- [ ] Can edit timetables
- [ ] Can publish timetables
- [ ] Can view conflicts
- [ ] Can approve change requests

### Faculty Access
- [ ] Can view department timetables
- [ ] Can auto-generate (class/department)
- [ ] Can edit own department timetables
- [ ] Cannot publish (submit for approval)
- [ ] Can view conflicts
- [ ] Can approve department changes

### Lecturer Access
- [ ] Can ONLY view published timetables
- [ ] Auto-generate button NOT visible
- [ ] Cannot edit timetables
- [ ] Can submit change requests
- [ ] Cannot view conflicts
- [ ] Can export personal schedule

### Student Access
- [ ] Can ONLY view published timetables
- [ ] Auto-generate button NOT visible
- [ ] Cannot edit anything
- [ ] Cannot submit change requests
- [ ] Cannot view conflicts
- [ ] Can export personal schedule

---

## ✅ Export Functionality

### PDF Export
- [ ] PDF button appears when timetable selected
- [ ] Click opens print dialog
- [ ] HTML template renders correctly:
  - [ ] Gradient header (purple/lavender)
  - [ ] Grouped by day/date
  - [ ] Session cards with all details
  - [ ] Color-coded session types
  - [ ] Page breaks work
- [ ] Can print to PDF
- [ ] Can print to paper
- [ ] Layout looks professional

### Excel Export
- [ ] Excel button appears when timetable selected
- [ ] Click downloads CSV file
- [ ] File opens in Excel/Sheets
- [ ] All columns present:
  - Teaching: Day, Start, End, Course, Class, Lecturer, Venue, Type
  - Exam: Date, Start, End, Duration, Course, Class, Students, Type, Venues, Batch
- [ ] Data properly formatted
- [ ] Special characters escaped
- [ ] No corrupted data

### Export Access
- [ ] Admin can export all timetables
- [ ] Registry can export all timetables
- [ ] Faculty can export department timetables
- [ ] Lecturer can export personal schedule
- [ ] Student can export class timetable
- [ ] Export works on mobile

---

## ✅ Mobile Responsiveness

### Sidebar Navigation
- [ ] Hamburger menu visible on mobile
- [ ] Sidebar opens/closes smoothly
- [ ] Menu items accessible
- [ ] Logout button works
- [ ] No rounded corners on sidebar
- [ ] Extends to top of screen

### Calendar Views
- [ ] Daily view mobile layout works
- [ ] Weekly view collapses to accordion
- [ ] Monthly view adapts to small screen
- [ ] List view remains readable
- [ ] View switcher compacts on mobile
- [ ] Session cards remain tappable

### Modals
- [ ] Auto-gen modal fits mobile screen
- [ ] Scrollable if too tall
- [ ] Form fields accessible
- [ ] Buttons remain tappable
- [ ] Can close modal on mobile

### Tables
- [ ] Wide tables scroll horizontally
- [ ] Sticky headers work
- [ ] Touch scrolling smooth
- [ ] No overlapping elements

### Touch Interactions
- [ ] All buttons >44px touch target
- [ ] No hover-only interactions
- [ ] Dropdowns work with touch
- [ ] Modals dismissible by tap outside

---

## ✅ Data Integrity

### Timetable CRUD
- [ ] Create timetable works
- [ ] Update timetable works
- [ ] Delete timetable works
- [ ] Timetable list refreshes

### Session CRUD
- [ ] Add teaching session works
- [ ] Add exam session works
- [ ] Edit session updates correctly
- [ ] Delete session removes it
- [ ] Session changes trigger conflict re-detection

### Status Workflow
- [ ] Draft → Submitted transition works
- [ ] Submitted → Reviewed transition works
- [ ] Reviewed → Approved transition works
- [ ] Approved → Published transition works
- [ ] Cannot edit published timetables (or version increments)

### Version Control
- [ ] Version number increments on edit
- [ ] Last modified timestamp updates
- [ ] Created by tracked
- [ ] Published timestamp set on publish

---

## ✅ Error Handling

### User Input Validation
- [ ] Required fields enforced
- [ ] Time ranges validated (start < end)
- [ ] Date ranges validated (start < end)
- [ ] Capacity validation (number > 0)
- [ ] Email format validation

### API Error Handling
- [ ] Network errors show user-friendly message
- [ ] Timeout errors handled
- [ ] Invalid data errors shown
- [ ] Retry mechanism available

### Edge Cases
- [ ] Empty timetable displays placeholder
- [ ] No courses shows message
- [ ] No venues shows message
- [ ] No lecturers shows message
- [ ] Invalid IDs handled gracefully

---

## ✅ Performance

### Load Times
- [ ] Initial page load < 2 seconds
- [ ] Route transitions < 500ms
- [ ] Auto-generation < 5 seconds (class level)
- [ ] Auto-generation < 10 seconds (department level)
- [ ] Auto-generation < 20 seconds (faculty level)
- [ ] Conflict detection < 500ms
- [ ] Export generation < 2 seconds

### Rendering
- [ ] No layout shifts
- [ ] Smooth scrolling
- [ ] No jank on interactions
- [ ] Animations smooth (60fps)

### Memory
- [ ] No memory leaks after route changes
- [ ] Large timetables don't crash browser
- [ ] Can generate multiple timetables

---

## ✅ Browser Compatibility

### Desktop
- [ ] Chrome (latest) works
- [ ] Firefox (latest) works
- [ ] Safari (latest) works
- [ ] Edge (latest) works

### Mobile
- [ ] Chrome Mobile (Android) works
- [ ] Safari Mobile (iOS) works
- [ ] Responsive at all breakpoints

---

## ✅ Documentation

### Technical Docs
- [ ] IMPLEMENTATION_GUIDE.md exists and accurate
- [ ] MULTI_LEVEL_FEATURES.md explains generation
- [ ] FINAL_IMPLEMENTATION_SUMMARY.md complete
- [ ] FEATURE_SUMMARY.md comprehensive
- [ ] Code comments helpful

### User Docs
- [ ] QUICK_START_GUIDE.md user-friendly
- [ ] Screenshots/examples provided
- [ ] Troubleshooting section helpful
- [ ] Role-specific instructions clear

### Inline Help
- [ ] Tooltips on complex features
- [ ] Placeholder text helpful
- [ ] Error messages actionable
- [ ] Success messages confirming

---

## ✅ Security

### Authentication
- [ ] Passwords not logged
- [ ] Session timeout works
- [ ] Logout clears session
- [ ] Re-authentication required after logout

### Authorization
- [ ] Routes properly protected
- [ ] API calls check permissions
- [ ] Data filtered by role
- [ ] No leaked admin data to students

### Data Protection
- [ ] No PII in URLs
- [ ] No sensitive data in localStorage
- [ ] HTTPS enforced (in production)
- [ ] CSRF protection (if using forms)

---

## 🎯 Final Sign-Off

### Before Production Deployment

- [ ] All tests above pass
- [ ] No critical bugs
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Documentation complete
- [ ] User training completed
- [ ] Backup plan in place
- [ ] Rollback procedure documented

### Post-Deployment

- [ ] Monitor error logs
- [ ] Track user feedback
- [ ] Monitor performance metrics
- [ ] Schedule maintenance window
- [ ] Plan iterative improvements

---

## 📋 Test Scenarios

### Scenario 1: New Administrator Setup
1. Login as Admin
2. Navigate to Teaching Timetable
3. Click Auto-Generate Timetable
4. Select Department level
5. Choose Computer Science
6. Generate timetable
7. Review conflicts
8. Resolve all critical conflicts
9. Export to PDF
10. Publish timetable

**Expected:** All steps complete without errors, PDF looks professional

### Scenario 2: Lecturer Change Request
1. Login as Lecturer
2. Navigate to Teaching Timetable
3. See only published timetables
4. Verify auto-generate button NOT visible
5. Navigate to Change Requests
6. Submit new change request
7. Logout
8. Login as Faculty
9. Approve change request
10. Verify timetable updated

**Expected:** Workflow completes, timetable reflects change

### Scenario 3: Student Exam View
1. Login as Student
2. Navigate to Exam Timetable
3. Select published exam timetable
4. Switch to List view
5. See all personal exams
6. Check batch numbers
7. Export to PDF
8. Verify PDF shows only student's exams

**Expected:** Student sees only relevant data, export works

### Scenario 4: Multi-Level Generation
1. Login as Admin
2. Generate Class level for "Level 300 CS A"
3. Note session count
4. Generate Department level for "Computer Science"
5. Note session count (should be more)
6. Generate Faculty level for "Faculty of Science"
7. Note session count (should be most)
8. Verify no duplicate sessions
9. Verify conflicts resolved across levels

**Expected:** Each level generates correctly, no duplicates

---

## ✅ Sign-Off

**Tester Name:** _____________________

**Date:** _____________________

**Signature:** _____________________

**Status:** 
- [ ] ✅ APPROVED - Ready for Production
- [ ] ⚠️ APPROVED WITH NOTES - Deploy with caution
- [ ] ❌ NOT APPROVED - Issues must be resolved

**Notes:**
```
_________________________________________________________________________
_________________________________________________________________________
_________________________________________________________________________
```

---

*Checklist Version: 1.0*
*Last Updated: January 16, 2026*
