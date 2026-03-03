import { TeachingSession, ExamSession } from '../context/TimetableContext';

interface InvigilationAssignment {
  examId: string;
  examName: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  lecturerId: string;
  lecturerName: string;
  role: string;
}

/**
 * Generic Excel export function using data objects
 */
function exportToExcel(data: any[], filename: string) {
  // Create CSV content
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  // Create download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export teaching sessions to Excel
 */
export function exportTeachingSessionsToExcel(sessions: TeachingSession[], filename: string) {
  const data = sessions.map((session) => ({
    Day: session.day.charAt(0).toUpperCase() + session.day.slice(1),
    'Start Time': session.startTime,
    'End Time': session.endTime,
    Course: session.courseName,
    Class: session.className,
    Lecturer: session.lecturerName,
    Venue: session.venueName,
    Type: session.sessionType.charAt(0).toUpperCase() + session.sessionType.slice(1),
  }));

  exportToExcel(data, filename);
}

/**
 * Export exam sessions to Excel
 */
export function exportExamSessionsToExcel(sessions: ExamSession[], filename: string) {
  const data = sessions.map((session) => ({
    Date: new Date(session.date).toLocaleDateString('en-GB'),
    'Start Time': session.startTime,
    'End Time': session.endTime,
    Duration: `${session.duration} mins`,
    Course: session.courseName,
    Class: session.className,
    'Student Count': session.studentCount,
    Type: session.examType.charAt(0).toUpperCase() + session.examType.slice(1),
    Venues: session.venueAllocations.map((v) => v.venueName).join(', '),
    Batch: session.batchNumber ? `${session.batchNumber}/${session.totalBatches}` : 'Full',
  }));

  exportToExcel(data, filename);
}

/**
 * Format invigilation roster for export
 */
function formatInvigilationRosterForExport(assignments: InvigilationAssignment[]) {
  return assignments.map((assignment) => ({
    Date: assignment.date,
    'Start Time': assignment.startTime,
    'End Time': assignment.endTime,
    Exam: assignment.examName,
    Venue: assignment.venue,
    Lecturer: assignment.lecturerName,
    Role: assignment.role,
  }));
}

/**
 * Export invigilation roster to Excel
 */
export function exportInvigilationRosterToExcel(assignments: InvigilationAssignment[], filename: string) {
  const data = formatInvigilationRosterForExport(assignments);
  exportToExcel(data, filename);
}

/**
 * Create HTML for teaching timetable (for PDF export)
 */
export function createTeachingTimetableHTML(sessions: TeachingSession[], title: string): string {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const sessionsByDay: { [key: string]: TeachingSession[] } = {};
  
  days.forEach(day => {
    sessionsByDay[day] = sessions.filter(s => s.day.toLowerCase() === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          color: #333;
        }
        h1 {
          color: #5B7EFF;
          text-align: center;
          margin-bottom: 30px;
        }
        .day-section {
          margin-bottom: 30px;
          page-break-inside: avoid;
        }
        .day-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 10px 15px;
          font-weight: bold;
          border-radius: 8px;
          margin-bottom: 10px;
        }
        .session-card {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 10px;
          background: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .session-time {
          font-weight: bold;
          color: #5B7EFF;
          margin-bottom: 8px;
        }
        .session-details {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 8px;
          font-size: 14px;
        }
        .session-label {
          font-weight: 600;
          color: #666;
        }
        .session-type {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
          background: #e3f2fd;
          color: #1976d2;
        }
        .no-sessions {
          color: #999;
          font-style: italic;
          padding: 10px;
        }
        @media print {
          .day-section {
            page-break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      ${days.map(day => {
        const daySessions = sessionsByDay[day];
        const dayName = day.charAt(0).toUpperCase() + day.slice(1);
        
        return `
          <div class="day-section">
            <div class="day-header">${dayName}</div>
            ${daySessions.length === 0 
              ? '<div class="no-sessions">No sessions scheduled</div>'
              : daySessions.map(session => `
                <div class="session-card">
                  <div class="session-time">${session.startTime} - ${session.endTime}</div>
                  <div class="session-details">
                    <span class="session-label">Course:</span>
                    <span>${session.courseName}</span>
                    
                    <span class="session-label">Class:</span>
                    <span>${session.className}</span>
                    
                    <span class="session-label">Lecturer:</span>
                    <span>${session.lecturerName}</span>
                    
                    <span class="session-label">Venue:</span>
                    <span>${session.venueName}</span>
                    
                    <span class="session-label">Type:</span>
                    <span><span class="session-type">${session.sessionType.toUpperCase()}</span></span>
                  </div>
                </div>
              `).join('')
            }
          </div>
        `;
      }).join('')}
    </body>
    </html>
  `;

  return html;
}

/**
 * Create HTML for exam timetable (for PDF export)
 */
export function createExamTimetableHTML(sessions: ExamSession[], title: string): string {
  const sessionsByDate: { [key: string]: ExamSession[] } = {};
  
  sessions.forEach(session => {
    const date = session.date;
    if (!sessionsByDate[date]) {
      sessionsByDate[date] = [];
    }
    sessionsByDate[date].push(session);
  });

  const sortedDates = Object.keys(sessionsByDate).sort();

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          color: #333;
        }
        h1 {
          color: #5B7EFF;
          text-align: center;
          margin-bottom: 30px;
        }
        .date-section {
          margin-bottom: 30px;
          page-break-inside: avoid;
        }
        .date-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 10px 15px;
          font-weight: bold;
          border-radius: 8px;
          margin-bottom: 10px;
        }
        .exam-card {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 10px;
          background: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .exam-time {
          font-weight: bold;
          color: #5B7EFF;
          margin-bottom: 8px;
        }
        .exam-details {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 8px;
          font-size: 14px;
        }
        .exam-label {
          font-weight: 600;
          color: #666;
        }
        .exam-type {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
          background: #fff3e0;
          color: #e65100;
        }
        .batch-info {
          background: #f3e5f5;
          color: #7b1fa2;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
        }
        @media print {
          .date-section {
            page-break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      ${sortedDates.map(date => {
        const dateSessions = sessionsByDate[date].sort((a, b) => 
          a.startTime.localeCompare(b.startTime)
        );
        const formattedDate = new Date(date).toLocaleDateString('en-GB', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
        
        return `
          <div class="date-section">
            <div class="date-header">${formattedDate}</div>
            ${dateSessions.map(session => `
              <div class="exam-card">
                <div class="exam-time">
                  ${session.startTime} - ${session.endTime} (${session.duration} mins)
                  ${session.batchNumber ? `<span class="batch-info">Batch ${session.batchNumber}/${session.totalBatches}</span>` : ''}
                </div>
                <div class="exam-details">
                  <span class="exam-label">Course:</span>
                  <span>${session.courseName}</span>
                  
                  <span class="exam-label">Class:</span>
                  <span>${session.className}</span>
                  
                  <span class="exam-label">Students:</span>
                  <span>${session.studentCount}</span>
                  
                  <span class="exam-label">Type:</span>
                  <span><span class="exam-type">${session.examType.toUpperCase()}</span></span>
                  
                  <span class="exam-label">Venues:</span>
                  <span>${session.venueAllocations.map(v => 
                    `${v.venueName} (${v.assignedStudents}/${v.capacity})`
                  ).join(', ')}</span>
                </div>
              </div>
            `).join('')}
          </div>
        `;
      }).join('')}
    </body>
    </html>
  `;

  return html;
}

/**
 * Export HTML to PDF using browser print
 */
export function exportToPDF(html: string, filename: string) {
  // Create a new window with the HTML content
  const printWindow = window.open('', '', 'width=800,height=600');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    
    // Wait for content to load then trigger print
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      // Don't close automatically - let user close after printing
    };
  }
}
