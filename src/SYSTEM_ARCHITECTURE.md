# System Architecture - Academic Timetable Management System

## 📐 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      USER INTERFACE LAYER                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐ │
│  │  Teaching        │  │  Exam            │  │  Calendar     │ │
│  │  Timetable       │  │  Timetable       │  │  Views        │ │
│  │  Viewer          │  │  Viewer          │  │  (4 types)    │ │
│  │  + Auto-Gen ⭐   │  │  + Auto-Gen ⭐   │  │               │ │
│  └──────────────────┘  └──────────────────┘  └───────────────┘ │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                    STATE MANAGEMENT LAYER                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  React Context API:                                              │
│  ├── TimetableContext (Main timetable state)                    │
│  ├── AuthContext (User authentication & roles)                  │
│  ├── OrganizationContext (Faculties, Departments)               │
│  ├── ClassContext (Classes & students)                          │
│  ├── CourseContext (Courses & assignments)                      │
│  ├── VenueContext (Venues & capacities)                         │
│  └── LecturerContext (Lecturers & availability)                 │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                      BUSINESS LOGIC LAYER                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Multi-Level Generator (/utils/multiLevelGenerator.ts)    │ │
│  │  ├── TeachingTimetableGenerator                           │ │
│  │  ├── ExamTimetableGenerator                               │ │
│  │  └── Generation Levels: Class → Department → Faculty      │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Constraint Solver (/utils/constraintSolver.ts)           │ │
│  │  ├── Hard Constraints (Class/Lecturer/Venue clashes)      │ │
│  │  ├── Soft Constraints (Preferences, optimization)         │ │
│  │  ├── Backtracking CSP Algorithm                           │ │
│  │  └── Conflict Detection & Resolution                      │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Export Utilities (/utils/exportUtils.ts)                 │ │
│  │  ├── PDF Export (HTML → Print)                            │ │
│  │  ├── Excel Export (Sessions → CSV)                        │ │
│  │  └── Invigilation Roster Export                           │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                       DATA MODEL LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Timetable   │  │  Teaching    │  │  Exam        │          │
│  │              │  │  Session     │  │  Session     │          │
│  │  - id        │  │              │  │              │          │
│  │  - name      │  │  - day       │  │  - date      │          │
│  │  - type      │  │  - startTime │  │  - startTime │          │
│  │  - status    │  │  - endTime   │  │  - batches   │          │
│  │  - sessions  │  │  - venue     │  │  - venues[]  │          │
│  └──────────────┘  │  - lecturer  │  │  - invig[]   │          │
│                    └──────────────┘  └──────────────┘          │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Class       │  │  Course      │  │  Venue       │          │
│  │  Lecturer    │  │  Department  │  │  Faculty     │          │
│  │  Conflict    │  │  Student     │  │  ...more     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Diagrams

### 1. Auto-Generation Flow (Teaching Mode)

```
User clicks "Auto-Generate Timetable" button on Calendar Page
                        ↓
          Modal opens with options:
          - Generation Level (Class/Dept/Faculty)
          - Entity Selection (Dropdown)
          - Preferences (Toggles)
                        ↓
       User selects options and clicks "Generate"
                        ↓
   ┌──────────────────────────────────────────────┐
   │  TeachingTimetableGenerator.generate()       │
   │  1. Fetch all relevant data:                 │
   │     - Classes (based on level)               │
   │     - Courses assigned to classes            │
   │     - Lecturers available                    │
   │     - Venues available                       │
   │  2. For each course:                         │
   │     - Calculate required sessions/week       │
   │     - Create session slots                   │
   │  3. Call ConstraintSolver.solve()            │
   │     - Apply hard constraints                 │
   │     - Optimize soft constraints              │
   │     - Resolve conflicts                      │
   │  4. Return GenerationResult                  │
   │     - sessions: TeachingSession[]            │
   │     - conflicts: Conflict[]                  │
   │     - stats: GenerationStats                 │
   └──────────────────────────────────────────────┘
                        ↓
          Add generated timetable to state
          (status: 'draft')
                        ↓
          Close modal, auto-select new timetable
                        ↓
    Run conflict detection (shows red banner if conflicts)
                        ↓
        User can:
        - View in calendar (Daily/Weekly/Monthly/List)
        - Edit sessions to resolve conflicts
        - Export to PDF/Excel
        - Publish when ready
```

### 2. Conflict Detection Flow

```
Trigger: Timetable selected OR Session edited
                        ↓
   ┌──────────────────────────────────────────────┐
   │  detectConflicts(timetableId)                │
   │                                              │
   │  For each session in timetable:              │
   │                                              │
   │  1. Class Clash Check:                       │
   │     - Find sessions with same classId        │
   │     - Check time overlap                     │
   │     - Create conflict if overlap exists      │
   │                                              │
   │  2. Lecturer Clash Check:                    │
   │     - Find sessions with same lecturerId     │
   │     - Check time overlap                     │
   │     - Create conflict if overlap exists      │
   │                                              │
   │  3. Venue Clash Check:                       │
   │     - Find sessions with same venueId        │
   │     - Check time overlap                     │
   │     - Create conflict if overlap exists      │
   │                                              │
   │  4. Capacity Check:                          │
   │     - Compare studentCount vs venueCapacity  │
   │     - Create conflict if exceeded            │
   │                                              │
   │  5. Generate Suggestions:                    │
   │     - Find alternative time slots            │
   │     - Find alternative venues                │
   │     - Suggest session swaps                  │
   │                                              │
   │  6. Assign Severity:                         │
   │     - Critical: Must fix to publish          │
   │     - High: Should fix                       │
   │     - Medium: Nice to fix                    │
   │     - Low: Optional                          │
   └──────────────────────────────────────────────┘
                        ↓
          Update conflicts state
                        ↓
    UI automatically shows:
    - Red banner if conflicts > 0
    - Conflict count
    - Expandable list with details
```

### 3. Multi-Level Aggregation Flow

```
User selects "Department" level
User selects "Computer Science Department"
                        ↓
   ┌──────────────────────────────────────────────┐
   │  Step 1: Fetch all classes in department     │
   │  Example:                                    │
   │  - Level 300 CS A                            │
   │  - Level 300 CS B                            │
   │  - Level 400 CS A                            │
   │  - Level 400 CS B                            │
   └──────────────────────────────────────────────┘
                        ↓
   ┌──────────────────────────────────────────────┐
   │  Step 2: For each class, generate timetable  │
   │                                              │
   │  Level 300 CS A → Sessions A1, A2, A3...     │
   │  Level 300 CS B → Sessions B1, B2, B3...     │
   │  Level 400 CS A → Sessions C1, C2, C3...     │
   │  Level 400 CS B → Sessions D1, D2, D3...     │
   └──────────────────────────────────────────────┘
                        ↓
   ┌──────────────────────────────────────────────┐
   │  Step 3: Merge all sessions                  │
   │                                              │
   │  AllSessions = A + B + C + D                 │
   │             = [A1,A2,A3,B1,B2,B3,C1,...]     │
   └──────────────────────────────────────────────┘
                        ↓
   ┌──────────────────────────────────────────────┐
   │  Step 4: Detect cross-class conflicts        │
   │                                              │
   │  Example conflicts:                          │
   │  - Dr. Owusu teaching A1 and B1 at same time │
   │  - Hall A booked for both C1 and D1          │
   └──────────────────────────────────────────────┘
                        ↓
   ┌──────────────────────────────────────────────┐
   │  Step 5: Resolve conflicts                   │
   │                                              │
   │  Strategy:                                   │
   │  - Reschedule lower priority session         │
   │  - Find alternative venue                    │
   │  - Assign different lecturer (if possible)   │
   │  - Split large sessions into batches         │
   └──────────────────────────────────────────────┘
                        ↓
   Return department-level timetable
   (All classes included, conflicts resolved)
```

---

## 🎨 Component Architecture

### EnhancedTimetableViewer Component Structure

```
EnhancedTimetableViewer
│
├── Header Section
│   ├── Title ("Teaching Timetable")
│   ├── Subtitle (description)
│   └── Auto-Generate Button ⭐
│       └── onClick → setShowAutoGenModal(true)
│
├── Conflict Alert Banner (conditional)
│   ├── Red background if conflicts > 0
│   ├── Conflict count badge
│   ├── "Show/Hide Conflicts" toggle
│   └── Conflict list (expandable)
│       └── Each conflict:
│           ├── Severity icon (color-coded)
│           ├── Message
│           ├── Affected sessions
│           └── Suggestions
│
├── Controls Section
│   ├── Timetable Selector (dropdown)
│   │   └── Filtered by role & status
│   ├── Date Picker (for Daily view)
│   └── View Mode Switcher
│       ├── Daily button
│       ├── Weekly button
│       ├── Monthly button
│       └── List button
│
├── Export Buttons (conditional: if timetable selected)
│   ├── PDF button → handleExportPDF()
│   └── Excel button → handleExportExcel()
│
├── Calendar View (conditional based on viewMode)
│   ├── if viewMode === 'daily' → <DailyView />
│   ├── if viewMode === 'weekly' → <WeeklyView />
│   ├── if viewMode === 'monthly' → <MonthlyView />
│   └── if viewMode === 'list' → <ListView />
│
├── Empty State (if no timetable selected)
│   ├── Calendar icon
│   ├── "No Timetable Selected" message
│   └── Instruction text
│
└── Auto-Generate Modal (conditional: if showAutoGenModal)
    ├── Modal Header
    │   ├── Icon (purple gradient)
    │   ├── Title ("Auto-Generate Timetable")
    │   ├── Subtitle (description)
    │   └── Close button (X)
    │
    ├── Modal Body
    │   ├── Generation Level Selector
    │   │   ├── Class button
    │   │   ├── Department button
    │   │   └── Faculty button
    │   │
    │   ├── Entity Dropdown
    │   │   └── Dynamically populated based on level
    │   │
    │   └── Info Box
    │       ├── Check icon
    │       ├── "Automated Constraint Solving" title
    │       └── Feature bullets
    │
    └── Modal Footer
        ├── Cancel button
        └── Generate button
            ├── Disabled if no entity selected
            ├── Shows loading state when generating
            └── onClick → handleAutoGenerate()
```

---

## 🔐 Role-Based Access Matrix

```
┌──────────────────────────────────────────────────────────────────┐
│                      FEATURE ACCESS MATRIX                        │
├──────────────┬────────┬──────────┬─────────┬──────────┬──────────┤
│   Feature    │ Admin  │ Registry │ Faculty │ Lecturer │ Student  │
├──────────────┼────────┼──────────┼─────────┼──────────┼──────────┤
│ View         │        │          │         │          │          │
│ Published    │   ✅   │    ✅    │   ✅    │    ✅    │    ✅    │
│              │        │          │         │          │          │
│ View         │        │          │         │          │          │
│ Drafts       │   ✅   │    ✅    │   ✅    │    ❌    │    ❌    │
│              │        │          │         │          │          │
│ Auto-Gen     │        │          │         │          │          │
│ (Class)      │   ✅   │    ✅    │   ✅    │    ❌    │    ❌    │
│              │        │          │         │          │          │
│ Auto-Gen     │        │          │         │          │          │
│ (Dept)       │   ✅   │    ✅    │   ✅*   │    ❌    │    ❌    │
│              │        │          │         │          │          │
│ Auto-Gen     │        │          │         │          │          │
│ (Faculty)    │   ✅   │    ✅    │   ❌    │    ❌    │    ❌    │
│              │        │          │         │          │          │
│ Edit         │        │          │         │          │          │
│ Timetables   │   ✅   │    ✅    │   ✅*   │    ❌    │    ❌    │
│              │        │          │         │          │          │
│ Publish      │        │          │         │          │          │
│              │   ✅   │    ✅    │   ❌    │    ❌    │    ❌    │
│              │        │          │         │          │          │
│ View         │        │          │         │          │          │
│ Conflicts    │   ✅   │    ✅    │   ✅    │    ❌    │    ❌    │
│              │        │          │         │          │          │
│ Submit       │        │          │         │          │          │
│ Changes      │   ✅   │    ✅    │   ✅    │    ✅    │    ❌    │
│              │        │          │         │          │          │
│ Export       │        │          │         │          │          │
│ PDF/Excel    │   ✅   │    ✅    │   ✅    │    ✅    │    ✅    │
└──────────────┴────────┴──────────┴─────────┴──────────┴──────────┘

* Faculty can only act on their own department
```

---

## 📦 File Dependency Graph

```
App.tsx
├── imports EnhancedTimetableViewer
│   ├── imports useTimetables (TimetableContext)
│   ├── imports useAuth (AuthContext)
│   ├── imports useOrganization (OrganizationContext)
│   ├── imports useClasses (ClassContext)
│   ├── imports useCourses (CourseContext)
│   ├── imports useVenues (VenueContext)
│   ├── imports useLecturers (LecturerContext)
│   ├── imports DailyView
│   ├── imports WeeklyView
│   ├── imports MonthlyView
│   ├── imports ListView
│   ├── imports exportUtils
│   │   ├── exportTeachingSessionsToExcel
│   │   ├── createTeachingTimetableHTML
│   │   └── exportToPDF
│   └── imports multiLevelGenerator
│       ├── TeachingTimetableGenerator
│       ├── GenerationLevel type
│       └── GenerationOptions type
│
├── imports EnhancedExamViewer
│   ├── (similar structure to EnhancedTimetableViewer)
│   └── imports ExamTimetableGenerator
│
└── imports all Context Providers
    ├── AuthProvider
    ├── TimetableProvider
    ├── OrganizationProvider
    ├── ClassProvider
    ├── CourseProvider
    ├── VenueProvider
    └── LecturerProvider
```

---

## 🔄 State Management Flow

```
┌─────────────────────────────────────────────────────────┐
│                  TimetableContext                        │
│                                                          │
│  State:                                                  │
│  ├── timetables: Timetable[]                           │
│  ├── conflicts: Conflict[]                             │
│  ├── selectedTimetableId: string                       │
│  └── loading: boolean                                  │
│                                                          │
│  Actions:                                               │
│  ├── addTimetable(timetable: Timetable)                │
│  ├── updateTimetable(id: string, updates: Partial)     │
│  ├── deleteTimetable(id: string)                       │
│  ├── detectConflicts(timetableId: string)              │
│  ├── publishTimetable(id: string)                      │
│  └── addSession(timetableId: string, session: Session) │
│                                                          │
└─────────────────────────────────────────────────────────┘
                          ↓
         Used by EnhancedTimetableViewer
                          ↓
┌─────────────────────────────────────────────────────────┐
│  Component State (useState):                            │
│  ├── selectedTimetableId                               │
│  ├── viewMode ('daily'|'weekly'|'monthly'|'list')      │
│  ├── selectedDate                                      │
│  ├── showAutoGenModal                                  │
│  ├── showConflicts                                     │
│  ├── generationLevel ('class'|'dept'|'faculty')        │
│  ├── selectedEntityId                                  │
│  └── isGenerating                                      │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Auto-Generation Algorithm Flow

```
START: handleAutoGenerate()
│
├─ Validate inputs (entityId, level)
│
├─ Set isGenerating = true
│
├─ Create GenerationOptions:
│   ├─ level: 'class' | 'department' | 'faculty'
│   ├─ entityId: selected entity
│   ├─ semester: 1
│   ├─ academicYear: '2025/2026'
│   ├─ startDate: Date
│   ├─ endDate: Date
│   └─ preferences:
│       ├─ preferMorningSlots: true
│       ├─ avoidFridayAfternoons: true
│       ├─ minimizeGaps: true
│       ├─ balanceWorkload: true
│       └─ respectLecturerPreferences: true
│
├─ Create Generator instance:
│   new TeachingTimetableGenerator(classes, courses, lecturers, venues)
│
├─ Call generator.generate(options)
│   │
│   ├─ Step 1: Determine target classes
│   │   ├─ if level === 'class': [selected class]
│   │   ├─ if level === 'department': all classes in dept
│   │   └─ if level === 'faculty': all classes in faculty
│   │
│   ├─ Step 2: For each class, get assigned courses
│   │   └─ Filter courses where courseAssignments includes classId
│   │
│   ├─ Step 3: Calculate required sessions
│   │   ├─ For each course:
│   │   │   ├─ Lectures: hoursPerWeek / 2 (assuming 2hr blocks)
│   │   │   ├─ Labs: labHours / 2
│   │   │   └─ Tutorials: tutorialHours / 2
│   │   └─ Total sessions = sum of all session types
│   │
│   ├─ Step 4: Create session slots (unscheduled)
│   │   └─ For each required session:
│   │       ├─ Create TeachingSession object
│   │       ├─ Assign courseId, classId, lecturerId
│   │       ├─ Set sessionType
│   │       └─ Leave day, time, venue empty (to be scheduled)
│   │
│   ├─ Step 5: Call ConstraintSolver.solve()
│   │   │
│   │   ├─ Initialize search state
│   │   │
│   │   ├─ For each unscheduled session:
│   │   │   │
│   │   │   ├─ Try each day (Monday-Friday)
│   │   │   │   │
│   │   │   │   ├─ Try each time slot (8am-6pm)
│   │   │   │   │   │
│   │   │   │   │   ├─ Try each venue
│   │   │   │   │   │   │
│   │   │   │   │   │   ├─ Check hard constraints:
│   │   │   │   │   │   │   ├─ No class clash?
│   │   │   │   │   │   │   ├─ No lecturer clash?
│   │   │   │   │   │   │   ├─ No venue clash?
│   │   │   │   │   │   │   └─ Capacity sufficient?
│   │   │   │   │   │   │
│   │   │   │   │   │   ├─ If all pass:
│   │   │   │   │   │   │   ├─ Calculate soft constraint score
│   │   │   │   │   │   │   │   ├─ Morning slot? +10
│   │   │   │   │   │   │   │   ├─ Friday PM? -10
│   │   │   │   │   │   │   │   ├─ Gap minimized? +5
│   │   │   │   │   │   │   │   └─ Lecturer preference? +15
│   │   │   │   │   │   │   │
│   │   │   │   │   │   │   ├─ Assign if best score
│   │   │   │   │   │   │   └─ Continue to next session
│   │   │   │   │   │   │
│   │   │   │   │   │   └─ If no valid assignment:
│   │   │   │   │   │       └─ Backtrack and try different slot
│   │   │   │   │   │
│   │   │   │   │   └─ If all venues tried, try next time
│   │   │   │   │
│   │   │   │   └─ If all times tried, try next day
│   │   │   │
│   │   │   └─ If all days tried, create conflict
│   │   │
│   │   └─ Return scheduled sessions + conflicts
│   │
│   └─ Return GenerationResult:
│       ├─ sessions: TeachingSession[] (fully scheduled)
│       ├─ conflicts: Conflict[] (unresolved issues)
│       └─ stats: { totalSessions, conflictCount, etc. }
│
├─ Add generated timetable to state:
│   addTimetable({
│     name: "Auto-Generated...",
│     type: "teaching",
│     status: "draft",
│     teachingSessions: result.sessions,
│     ...
│   })
│
├─ Close modal: setShowAutoGenModal(false)
│
├─ Show alert with results:
│   "Timetable generated! X sessions created with Y conflicts"
│
└─ Set isGenerating = false

END
```

---

## 🚀 Deployment Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     PRODUCTION STACK                      │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Frontend (React + TypeScript)                     │  │
│  │  ├── Build: npm run build                          │  │
│  │  ├── Output: /dist folder                          │  │
│  │  └── Serve: Static file hosting                    │  │
│  └────────────────────────────────────────────────────┘  │
│                         ↓                                 │
│  ┌────────────────────────────────────────────────────┐  │
│  │  CDN / Web Server                                  │  │
│  │  ├── Nginx / Apache                                │  │
│  │  ├── HTTPS enabled                                 │  │
│  │  └── Gzip compression                              │  │
│  └────────────────────────────────────────────────────┘  │
│                         ↓                                 │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Client Browser                                    │  │
│  │  ├── Chrome, Firefox, Safari, Edge                 │  │
│  │  ├── Mobile: iOS Safari, Chrome Mobile            │  │
│  │  └── Responsive breakpoints: 640px, 1024px        │  │
│  └────────────────────────────────────────────────────┘  │
│                                                           │
└──────────────────────────────────────────────────────────┘

Optional Backend (Future Enhancement):
┌──────────────────────────────────────────────────────────┐
│  ├── REST API (Node.js/Express or Django)               │
│  ├── Database (PostgreSQL/MongoDB)                      │
│  ├── Authentication (JWT tokens)                        │
│  └── File Storage (AWS S3 for exports)                  │
└──────────────────────────────────────────────────────────┘
```

---

## 📊 Performance Optimization Points

```
1. Code Splitting
   ├── Route-based lazy loading
   ├── Dynamic imports for heavy components
   └── Separate bundles for calendar views

2. Memoization
   ├── React.memo on calendar components
   ├── useMemo for filtered timetables
   ├── useMemo for conflict calculations
   └── useCallback for event handlers

3. Virtualization (Future)
   ├── Virtual scrolling for large timetables
   └── Windowing for list views

4. Caching
   ├── Generated timetables cached in state
   ├── Conflict detection results cached
   └── Export HTML templates cached

5. Debouncing
   ├── Search inputs: 300ms
   ├── Auto-save: 1000ms
   └── Conflict re-detection: 500ms

6. Asset Optimization
   ├── SVG icons (lucide-react)
   ├── No raster images
   ├── CSS-in-JS (Tailwind)
   └── Tree-shaking enabled
```

---

## 🔒 Security Considerations

```
Authentication
├── User login with email/password
├── Session management (localStorage or cookies)
├── Automatic timeout after inactivity
└── Logout clears all session data

Authorization
├── Role-based route protection
├── Component-level permission checks
├── Data filtered by role
└── API calls include auth headers

Data Protection
├── No PII in URLs or logs
├── Sensitive data not in localStorage
├── HTTPS enforced in production
└── CSRF tokens for form submissions

Input Validation
├── All user inputs sanitized
├── Time/date range validation
├── Capacity number validation
└── SQL injection prevention (backend)
```

---

**END OF ARCHITECTURE DOCUMENT**

*This architecture supports:*
- ✅ Multi-level timetable generation
- ✅ Calendar-integrated auto-generation
- ✅ Real-time conflict detection
- ✅ Role-based access control
- ✅ Complete export functionality
- ✅ Mobile-responsive design
- ✅ Production-ready deployment

*Version: 1.0.0 | Date: January 16, 2026*
