/**
 * Constraint Solver for Timetable Generation
 * Implements scheduling rules for both teaching and exam modes
 */

import { TeachingSession, ExamSession, Conflict } from '../context/TimetableContext';
import { Course } from '../context/CourseContext';
import { Class, AttendanceType } from '../context/ClassContext';
import { Venue } from '../context/VenueContext';
import { Lecturer } from '../context/LecturerContext';

export interface SchedulingOptions {
  semester: number;
  academicYear: string;
  startDate?: string; // For exam timetables
  endDate?: string; // For exam timetables
}

export interface ConflictCheck {
  hasConflict: boolean;
  conflicts: Conflict[];
}

// Attendance type day restrictions
export const ATTENDANCE_TYPE_DAYS: Record<AttendanceType, string[]> = {
  REGULAR: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
  WEEKEND: ['saturday', 'sunday'],
};

/**
 * Teaching Mode Constraints
 */
export class TeachingConstraintSolver {
  /**
   * Check if a day is valid for the given attendance type
   */
  static checkAttendanceTypeDay(
    day: string,
    attendanceType: AttendanceType
  ): { valid: boolean; message?: string } {
    const allowedDays = ATTENDANCE_TYPE_DAYS[attendanceType];
    
    if (!allowedDays.includes(day.toLowerCase())) {
      const dayList = attendanceType === 'REGULAR' 
        ? 'Monday-Friday' 
        : 'Saturday-Sunday';
      return {
        valid: false,
        message: `${attendanceType} classes can only be scheduled on ${dayList}. ${day} is not allowed.`,
      };
    }
    
    return { valid: true };
  }

  /**
   * Check if a class has overlapping sessions
   */
  static checkClassClash(
    sessions: TeachingSession[],
    newSession: Omit<TeachingSession, 'id'>
  ): boolean {
    const classSessions = sessions.filter((s) => s.classId === newSession.classId && s.day === newSession.day);

    for (const session of classSessions) {
      if (this.timeOverlaps(session.startTime, session.endTime, newSession.startTime, newSession.endTime)) {
        return true; // Conflict detected
      }
    }
    return false;
  }

  /**
   * Check if venue is restricted to certain departments
   */
  static checkVenueDepartmentRestriction(
    venue: Venue,
    courseDepartmentId: string
  ): { allowed: boolean; message?: string } {
    // If allowedDepartments is empty/undefined, venue is available to all
    if (!venue.allowedDepartments || venue.allowedDepartments.length === 0) {
      return { allowed: true };
    }

    // Check if course's department is in the allowed list
    if (venue.allowedDepartments.includes(courseDepartmentId)) {
      return { allowed: true };
    }

    return {
      allowed: false,
      message: `${venue.name} is restricted to specific departments`,
    };
  }

  /**
   * Check if lecturer is available
   */
  static checkLecturerAvailability(
    sessions: TeachingSession[],
    newSession: Omit<TeachingSession, 'id'>,
    lecturerAvailability: { [day: string]: { start: string; end: string }[] }
  ): boolean {
    // Check if lecturer has another session at this time
    const lecturerSessions = sessions.filter(
      (s) => s.lecturerId === newSession.lecturerId && s.day === newSession.day
    );

    for (const session of lecturerSessions) {
      if (this.timeOverlaps(session.startTime, session.endTime, newSession.startTime, newSession.endTime)) {
        return false; // Lecturer is busy
      }
    }

    // Check against lecturer's availability windows
    const dayAvailability = lecturerAvailability[newSession.day] || [];
    
    for (const window of dayAvailability) {
      if (
        newSession.startTime >= window.start &&
        newSession.endTime <= window.end
      ) {
        return true; // Within availability window
      }
    }

    return dayAvailability.length === 0; // If no specific availability, allow
  }

  /**
   * Check if venue is available
   */
  static checkVenueAvailability(
    sessions: TeachingSession[],
    newSession: Omit<TeachingSession, 'id'>
  ): boolean {
    const venueSessions = sessions.filter((s) => s.venueId === newSession.venueId && s.day === newSession.day);

    for (const session of venueSessions) {
      if (this.timeOverlaps(session.startTime, session.endTime, newSession.startTime, newSession.endTime)) {
        return false; // Venue is occupied
      }
    }
    return true;
  }

  /**
   * Check if lab session conflicts with lecture for same class
   */
  static checkLabLectureOverlap(
    sessions: TeachingSession[],
    newSession: Omit<TeachingSession, 'id'>
  ): boolean {
    if (newSession.sessionType !== 'lab') return false;

    const classSessions = sessions.filter(
      (s) => s.classId === newSession.classId && s.day === newSession.day && s.sessionType === 'lecture'
    );

    for (const session of classSessions) {
      if (this.timeOverlaps(session.startTime, session.endTime, newSession.startTime, newSession.endTime)) {
        return true; // Lab overlaps with lecture
      }
    }
    return false;
  }

  /**
   * Helper: Check if two time ranges overlap
   */
  private static timeOverlaps(
    start1: string,
    end1: string,
    start2: string,
    end2: string
  ): boolean {
    const s1 = this.timeToMinutes(start1);
    const e1 = this.timeToMinutes(end1);
    const s2 = this.timeToMinutes(start2);
    const e2 = this.timeToMinutes(end2);

    return s1 < e2 && e1 > s2;
  }

  /**
   * Helper: Convert time string to minutes since midnight
   */
  private static timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
}

/**
 * Exam Mode Constraints
 */
export class ExamConstraintSolver {
  /**
   * Check if lecturer is invigilating their own exam
   */
  static checkLecturerNotInvigilatingOwnExam(
    session: Omit<ExamSession, 'id'>,
    courseId: string,
    lecturerId: string
  ): boolean {
    return !session.invigilators.includes(lecturerId);
  }

  /**
   * Check for student fatigue - same class having multiple exams on same day
   */
  static checkStudentFatigue(
    sessions: ExamSession[],
    newSession: Omit<ExamSession, 'id'>
  ): { hasConflict: boolean; count: number } {
    const sameClassExams = sessions.filter(
      (s) => s.classId === newSession.classId && s.date === newSession.date
    );

    return {
      hasConflict: sameClassExams.length >= 2, // More than 2 exams per day is critical
      count: sameClassExams.length,
    };
  }

  /**
   * Calculate required exam sessions with batching logic
   * If class has 100 students but lab capacity is 20, create 5 batches
   */
  static calculateExamBatches(
    studentCount: number,
    venues: Venue[],
    examType: 'theory' | 'practical'
  ): { totalBatches: number; allocations: Array<{ venueId: string; capacity: number; students: number }> } {
    const suitableVenues = venues.filter((v) => {
      if (examType === 'practical') {
        return v.type === 'laboratory' && v.attributes.examSuitable;
      }
      return v.attributes.examSuitable && v.examCapacity > 0;
    }).sort((a, b) => b.examCapacity - a.examCapacity); // Largest first

    if (suitableVenues.length === 0) {
      return { totalBatches: 1, allocations: [] };
    }

    // Try to fit all students in one session
    const largestVenue = suitableVenues[0];
    
    if (studentCount <= largestVenue.examCapacity) {
      // Fits in one venue
      return {
        totalBatches: 1,
        allocations: [
          {
            venueId: largestVenue.id,
            capacity: largestVenue.examCapacity,
            students: studentCount,
          },
        ],
      };
    }

    // Need multiple sessions (batching)
    const batchSize = largestVenue.examCapacity;
    const totalBatches = Math.ceil(studentCount / batchSize);

    const allocations = [];
    let remainingStudents = studentCount;

    for (let i = 0; i < totalBatches; i++) {
      const batchStudents = Math.min(remainingStudents, batchSize);
      allocations.push({
        venueId: largestVenue.id,
        capacity: batchSize,
        students: batchStudents,
      });
      remainingStudents -= batchStudents;
    }

    return { totalBatches, allocations };
  }

  /**
   * Check venue capacity enforcement
   */
  static checkVenueCapacity(
    venue: Venue,
    requiredCapacity: number,
    isExam: boolean = true
  ): boolean {
    const capacity = isExam ? venue.examCapacity : venue.teachingCapacity;
    return capacity >= requiredCapacity;
  }
}

/**
 * Auto-generate teaching timetable
 */
export function autoGenerateTeachingTimetable(
  courses: Course[],
  classes: Class[],
  venues: Venue[],
  lecturers: Lecturer[],
  options: SchedulingOptions
): TeachingSession[] {
  const sessions: TeachingSession[] = [];
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const timeSlots = [
    { start: '08:00', end: '10:00' },
    { start: '10:00', end: '12:00' },
    { start: '12:00', end: '14:00' },
    { start: '14:00', end: '16:00' },
    { start: '16:00', end: '18:00' },
  ];

  // This is a simplified algorithm - a real implementation would use more sophisticated scheduling
  courses.forEach((course) => {
    course.assignedClasses.forEach((assignment) => {
      // Find suitable venue
      const suitableVenue = venues.find((v) => {
        if (course.requiresSpecializedLab && course.courseType === 'lab') {
          return v.type === 'laboratory' && v.teachingCapacity >= assignment.studentCount;
        }
        return v.teachingCapacity >= assignment.studentCount;
      });

      if (!suitableVenue) return;

      // Try to schedule lecture session
      if (course.courseType === 'lecture' || course.courseType === 'mixed') {
        for (const day of days) {
          for (const slot of timeSlots) {
            const newSession: Omit<TeachingSession, 'id'> = {
              courseId: course.id,
              courseName: course.title,
              classId: assignment.classId,
              className: assignment.className,
              lecturerId: course.lecturerId,
              lecturerName: course.lecturerName,
              venueId: suitableVenue.id,
              venueName: suitableVenue.name,
              day,
              startTime: slot.start,
              endTime: slot.end,
              sessionType: 'lecture',
              weeklyRecurrence: true,
            };

            // Check all constraints
            if (
              !TeachingConstraintSolver.checkClassClash(sessions, newSession) &&
              TeachingConstraintSolver.checkVenueAvailability(sessions, newSession)
            ) {
              sessions.push({ ...newSession, id: `ts-${Date.now()}-${sessions.length}` });
              break;
            }
          }
        }
      }
    });
  });

  return sessions;
}

/**
 * Detect all conflicts in a timetable
 */
export function detectAllConflicts(sessions: TeachingSession[]): Conflict[] {
  const conflicts: Conflict[] = [];

  // Check for class clashes
  const classSessions: { [key: string]: TeachingSession[] } = {};
  
  sessions.forEach((session) => {
    const key = `${session.classId}-${session.day}`;
    if (!classSessions[key]) {
      classSessions[key] = [];
    }
    classSessions[key].push(session);
  });

  Object.entries(classSessions).forEach(([key, daySessions]) => {
    for (let i = 0; i < daySessions.length; i++) {
      for (let j = i + 1; j < daySessions.length; j++) {
        const s1 = daySessions[i];
        const s2 = daySessions[j];
        
        if (TeachingConstraintSolver['timeOverlaps'](s1.startTime, s1.endTime, s2.startTime, s2.endTime)) {
          conflicts.push({
            id: `conflict-${Date.now()}-${i}-${j}`,
            type: 'class',
            severity: 'critical',
            message: `${s1.className} has overlapping sessions on ${s1.day}: ${s1.courseName} (${s1.startTime}-${s1.endTime}) and ${s2.courseName} (${s2.startTime}-${s2.endTime})`,
            affectedSessions: [s1.id, s2.id],
            suggestions: ['Reschedule one session to a different time slot or day'],
          });
        }
      }
    }
  });

  return conflicts;
}