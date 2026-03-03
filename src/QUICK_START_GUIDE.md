# Quick Start Guide - Timetable Management System

## 🚀 Getting Started

### For Administrators & Registry Staff

#### 1. Auto-Generate a Teaching Timetable

1. Navigate to **"Teaching Timetable"** from the sidebar
2. Click the **"Auto-Generate Timetable"** button (top right, purple gradient)
3. In the modal:
   - Select **Generation Level**: Class, Department, or Faculty
   - Choose the **specific entity** (e.g., "Computer Science Department")
   - Click **"Generate Timetable"**
4. The system will create an optimized timetable in **DRAFT** status
5. Review any conflicts shown in the red alert banner
6. Edit sessions as needed to resolve conflicts
7. Export to PDF or Excel if desired
8. Publish when ready

#### 2. Auto-Generate an Exam Timetable

1. Navigate to **"Exam Timetable"** from the sidebar
2. Click the **"Auto-Generate Exam Timetable"** button
3. In the modal:
   - Set **Exam Start Date** and **Exam End Date**
   - Select **Generation Level**: Class, Department, or Faculty
   - Choose the **specific entity**
   - Click **"Generate Exam Timetable"**
4. The system will:
   - Schedule exams across the date range
   - Create batches for large practical exams
   - Allocate venues based on capacity
   - Generate invigilation rosters
5. Review and resolve any conflicts
6. Publish when ready

#### 3. View and Switch Calendar Views

**Available Views:**
- **Daily**: See all sessions for a specific day
- **Weekly**: Full week grid layout (Teaching mode)
- **Monthly**: Month overview with event counts
- **List**: Chronological list of all sessions

**To Switch Views:**
- Click the view mode buttons below the timetable selector
- Use the date picker for Daily view to change dates

#### 4. Handle Conflicts

When the red conflict alert appears:

1. Click **"Show Conflicts"** to expand
2. Each conflict shows:
   - Type (Class clash, Lecturer clash, Venue clash, etc.)
   - Severity (Critical, High, Medium, Low)
   - Affected sessions
   - Suggested resolutions
3. Click on the session to edit it
4. Move the session to a different time/venue/day
5. Conflicts auto-update after each change
6. When all critical conflicts are resolved, publish the timetable

#### 5. Export Timetables

1. Select a timetable from the dropdown
2. Click the **PDF** or **Excel** button (top right)
3. **PDF Export**: Opens print dialog, includes beautiful formatting
4. **Excel Export**: Downloads CSV file with all session data

---

### For Faculty/Department Heads

#### Your Permissions:
✅ Auto-generate timetables for your department/classes
✅ View and edit department timetables
✅ Submit timetables for approval
✅ Export department schedules

#### Workflow:

1. **Generate Department Timetable**:
   - Click "Auto-Generate Timetable"
   - Select "Department" level
   - Choose your department
   - Generate and review

2. **Submit for Approval**:
   - Resolve all critical conflicts
   - Submit to Registry for approval
   - Track status in Approvals section

3. **Monitor Change Requests**:
   - View requests from your department lecturers
   - Approve or deny requests
   - Changes automatically update timetable

---

### For Lecturers

#### Your Permissions:
✅ View published timetables
✅ Submit change requests
✅ View personal schedule
✅ Export personal timetable
❌ Cannot edit timetables directly
❌ Cannot auto-generate

#### How to Submit a Change Request:

1. Navigate to **"Change Requests"** from sidebar
2. Click **"New Request"**
3. Fill in:
   - Session to change
   - Type of change (Reschedule, Cancel, Swap)
   - Reason/justification
4. Submit for approval
5. Track status in your requests dashboard

#### View Your Schedule:

1. Go to **"Teaching Timetable"**
2. Select the published timetable
3. Use List view to see your sessions chronologically
4. Export your personal schedule as PDF

---

### For Students

#### Your Permissions:
✅ View published timetables
✅ View exam schedules and venues
✅ Export your timetable
❌ Cannot make any edits

#### View Your Class Timetable:

1. Navigate to **"Student Timetable"** (or "Teaching Timetable")
2. Select your class timetable
3. Use different views:
   - **Weekly**: See your week at a glance
   - **Daily**: Focus on a specific day
   - **List**: See all your classes in order

#### View Exam Schedule:

1. Go to **"Exam Venues"** (or "Exam Timetable")
2. See all your exams with:
   - Date and time
   - Venue location
   - Batch number (for practical exams)
   - Duration
3. Export to PDF to keep a copy

---

## 🎯 Common Tasks

### Create a Multi-Level Timetable

**Class Level** (Single class):
- Best for: Individual class schedules
- Generates: All sessions for one class

**Department Level** (All classes in a department):
- Best for: Department-wide planning
- Generates: Combined schedule for all department classes
- Automatically resolves conflicts between classes

**Faculty Level** (All departments in a faculty):
- Best for: Faculty-wide coordination
- Generates: Complete faculty schedule
- Handles conflicts across departments

### Resolve Scheduling Conflicts

**Critical Conflicts** (Must fix):
- Class double-booked (same class, two sessions at once)
- Lecturer clash (lecturer in two places)
- Venue clash (venue double-booked)

**How to Resolve**:
1. Click on the conflicting session
2. Change time, venue, or day
3. System re-validates automatically
4. Repeat until all critical conflicts cleared

### Optimize a Timetable

**Use Preferences** in auto-generation:
- ✅ Prefer Morning Slots: Schedules more classes in the morning
- ✅ Avoid Friday Afternoons: Minimizes Friday afternoon sessions
- ✅ Minimize Gaps: Reduces breaks between sessions
- ✅ Balance Workload: Distributes classes evenly across days

### Export for Different Purposes

**PDF Export**:
- Beautiful formatted timetable
- Good for: Printing, posting on notice boards
- Includes: All session details, color-coded by type

**Excel Export**:
- Structured data in CSV format
- Good for: Data analysis, further processing
- Includes: All metadata (IDs, timestamps, etc.)

---

## 📱 Mobile Usage

All calendar views are optimized for mobile:

- **Sidebar**: Tap the hamburger menu (☰) to open/close
- **Calendar Views**: Automatically adapt to small screens
- **Tables**: Scroll horizontally if needed
- **Buttons**: Large touch targets for easy tapping
- **Modals**: Full-screen on mobile

---

## 🔔 Best Practices

### For Administrators:

1. **Generate Early**: Create draft timetables well before semester start
2. **Review Conflicts**: Always resolve all critical conflicts before publishing
3. **Communicate**: Notify stakeholders when timetables are published
4. **Version Control**: Keep backups of working timetables before major changes
5. **Test Scenarios**: Use different generation levels to compare outcomes

### For Department Heads:

1. **Check Resources**: Ensure sufficient venues and lecturers before generating
2. **Balance Workload**: Review lecturer distribution across sessions
3. **Plan Ahead**: Generate exam timetables early to allow for adjustments
4. **Coordinate**: Communicate with other departments for shared resources

### For Lecturers:

1. **Update Availability**: Keep your availability settings current
2. **Request Early**: Submit change requests as soon as issues arise
3. **Provide Reasons**: Detailed justifications improve approval chances
4. **Check Regularly**: Monitor published timetables for updates

### For Students:

1. **Save Copies**: Export and save your timetable and exam schedule
2. **Check Batches**: For practical exams, note your batch number
3. **Plan Ahead**: Use monthly view to plan your semester
4. **Set Reminders**: Add exam dates to your personal calendar

---

## ⚙️ Advanced Features

### Multi-Level Conflict Resolution

When generating at Department or Faculty level:
- System automatically resolves conflicts between classes
- Prioritizes critical constraints (no double-booking)
- Optimizes soft constraints (workload balance)
- You can manually adjust if needed

### Automatic Exam Batching

For large practical exams:
- System calculates: `batches = ⌈studentCount / labCapacity⌉`
- Automatically creates multiple exam sessions
- Assigns students to batches evenly
- Allocates different time slots or days

### Invigilation Roster Generation

For exam timetables:
- System assigns invigilators to each exam
- Ensures: Lecturers don't invigilate their own exams
- Balances: Invigilation workload across lecturers
- You can manually adjust assignments

---

## 🐛 Troubleshooting

### "No timetables available to select"
- **Cause**: No published timetables yet
- **Solution**: Admin/Registry needs to generate and publish timetables

### "Auto-Generate button not showing"
- **Cause**: You don't have permission (Lecturer/Student role)
- **Solution**: Contact admin or department head to generate timetables

### "Too many conflicts detected"
- **Cause**: Insufficient resources (venues/lecturers) or tight constraints
- **Solution**: 
  1. Adjust generation preferences
  2. Add more venues or lecturers
  3. Spread sessions across more days
  4. Generate at lower level (Class instead of Department)

### "Export not working"
- **Cause**: Browser blocking downloads
- **Solution**: Allow downloads/popups for this site in browser settings

### "Changes not saving"
- **Cause**: Network issue or session expired
- **Solution**: Refresh page and try again, ensure stable internet

---

## 📞 Support

### Need Help?

1. **Check Documentation**:
   - IMPLEMENTATION_GUIDE.md
   - MULTI_LEVEL_FEATURES.md
   - FINAL_IMPLEMENTATION_SUMMARY.md

2. **Contact Roles**:
   - **Technical Issues**: System Administrator
   - **Timetable Questions**: Registry Office
   - **Access Issues**: IT Support
   - **Change Requests**: Department Head

3. **Report Bugs**:
   - Describe what you were doing
   - Include error messages
   - Note your role and permissions

---

## 🎓 Training Resources

### Video Tutorials (Recommended):
1. "Auto-Generating Your First Timetable" (5 min)
2. "Resolving Timetable Conflicts" (8 min)
3. "Multi-Level Generation Explained" (6 min)
4. "Export and Share Timetables" (3 min)

### Hands-On Practice:
- Use the system with test data first
- Try all view modes
- Practice conflict resolution
- Experiment with different generation levels

---

*Last Updated: January 16, 2026*
*Version: 1.0.0*

**Ready to start? Navigate to "Teaching Timetable" or "Exam Timetable" from your sidebar!**
