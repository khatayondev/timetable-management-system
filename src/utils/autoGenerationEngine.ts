/**
 * Multi-Level Auto-Generation Utility
 * Handles class, department, faculty, and school-wide timetable generation
 */

import { Course } from '../context/CourseContext';
import { Class, AttendanceType } from '../context/ClassContext';
import { Venue } from '../context/VenueContext';
import { Lecturer } from '../context/LecturerContext';
import { Department, Faculty } from '../context/OrganizationContext';
import { TeachingSession, ExamSession } from '../context/TimetableContext';
import { TeachingConstraintSolver, ATTENDANCE_TYPE_DAYS } from './constraintSolver';

export type GenerationScope = 'class' | 'department' | 'faculty' | 'school';

export interface GenerationOptions {
  mode: 'teaching' | 'exam';
  academicYear: string;
  semester: number;
  startDate?: string; // For exams
  endDate?: string; // For exams
}

export interface GenerationResult {
  success: boolean;
  sessions: TeachingSession[] | ExamSession[];
  conflicts: string[];
  warnings: string[];
}

/**
 * Get suggested alternative venues when department restriction fails
 */
export function getSuggestedAlternativeVenues(
  courseDepartmentId: string,
  requiredCapacity: number,
  venues: Venue[],
  isExam: boolean = false
): Venue[] {
  return venues
    .filter((v) => {
      // Check department restriction
      const restrictionCheck = TeachingConstraintSolver.checkVenueDepartmentRestriction(v, courseDepartmentId);
      if (!restrictionCheck.allowed) return false;

      // Check capacity
      const capacity = isExam ? v.examCapacity : v.teachingCapacity;
      return capacity >= requiredCapacity;
    })
    .sort((a, b) => {
      const capacityA = isExam ? a.examCapacity : a.teachingCapacity;
      const capacityB = isExam ? b.examCapacity : b.teachingCapacity;
      return capacityA - capacityB; // Smallest suitable venue first
    });
}

/**
 * Generate teaching timetable for a specific class
 */
export function generateForClass(
  classId: string,
  courses: Course[],
  classes: Class[],
  venues: Venue[],
  lecturers: Lecturer[],
  options: GenerationOptions
): GenerationResult {
  const targetClass = classes.find((c) => c.id === classId);
  if (!targetClass) {
    return {
      success: false,
      sessions: [],
      conflicts: ['Class not found'],
      warnings: [],
    };
  }

  const sessions: TeachingSession[] = [];
  const conflicts: string[] = [];
  const warnings: string[] = [];

  // Get allowed days based on class attendance type
  const allowedDays = ATTENDANCE_TYPE_DAYS[targetClass.attendanceType];
  
  warnings.push(
    `Generating ${targetClass.attendanceType} class timetable - sessions will be scheduled on ${
      targetClass.attendanceType === 'REGULAR' ? 'Monday-Friday' : 'Saturday-Sunday'
    }`
  );

  const timeSlots = [
    { start: '08:00', end: '10:00', duration: 2 },
    { start: '10:00', end: '12:00', duration: 2 },
    { start: '13:00', end: '15:00', duration: 2 },
    { start: '15:00', end: '17:00', duration: 2 },
  ];

  // Get courses for this class
  const classCourses = courses.filter((course) =>
    course.assignedClasses.some((ac) => ac.classId === classId)
  );

  classCourses.forEach((course) => {
    const assignment = course.assignedClasses.find((ac) => ac.classId === classId);
    if (!assignment) return;

    const lecturer = lecturers.find((l) => l.id === course.lecturerId);
    if (!lecturer) {
      warnings.push(`Lecturer not found for course ${course.code}`);
      return;
    }

    // Find suitable venues - consider department restrictions
    const suitableVenues = venues.filter((v) => {
      // Check capacity
      if (v.teachingCapacity < assignment.studentCount) return false;

      // Check department restriction
      if (course.departmentId) {
        const restrictionCheck = TeachingConstraintSolver.checkVenueDepartmentRestriction(v, course.departmentId);
        if (!restrictionCheck.allowed) return false;
      }

      // Check specialized requirements
      if (course.requiresSpecializedLab && course.courseType === 'lab') {
        return v.type === 'laboratory';
      }

      return true;
    });

    if (suitableVenues.length === 0) {
      conflicts.push(`No suitable venue found for ${course.code} - ${course.title}`);
      
      // Suggest alternatives
      if (course.departmentId) {
        const alternatives = getSuggestedAlternativeVenues(
          course.departmentId,
          assignment.studentCount,
          venues,
          false
        );
        if (alternatives.length > 0) {
          warnings.push(
            `Consider using: ${alternatives.slice(0, 3).map((v) => v.name).join(', ')}`
          );
        }
      }
      return;
    }

    // Try to schedule sessions - only use allowed days for this attendance type
    let scheduled = false;
    for (const day of allowedDays) {
      for (const slot of timeSlots) {
        const venue = suitableVenues[0]; // Use first suitable venue

        const newSession: Omit<TeachingSession, 'id'> = {
          courseId: course.id,
          courseName: course.title,
          classId: targetClass.id,
          className: targetClass.name,
          lecturerId: course.lecturerId,
          lecturerName: lecturer.name,
          venueId: venue.id,
          venueName: venue.name,
          day,
          startTime: slot.start,
          endTime: slot.end,
          sessionType: course.courseType === 'lab' ? 'lab' : 'lecture',
          weeklyRecurrence: true,
        };

        // Validate attendance type constraint
        const dayCheck = TeachingConstraintSolver.checkAttendanceTypeDay(day, targetClass.attendanceType);
        if (!dayCheck.valid) {
          conflicts.push(`Invalid day ${day} for ${targetClass.attendanceType} class: ${dayCheck.message}`);
          continue;
        }

        // Check constraints
        const hasClassClash = TeachingConstraintSolver.checkClassClash(sessions, newSession);
        const isVenueAvailable = TeachingConstraintSolver.checkVenueAvailability(sessions, newSession);
        const isLecturerAvailable = TeachingConstraintSolver.checkLecturerAvailability(
          sessions,
          newSession,
          lecturer.availability || {}
        );

        if (!hasClassClash && isVenueAvailable && isLecturerAvailable) {
          sessions.push({ ...newSession, id: `ts-${Date.now()}-${sessions.length}` });
          scheduled = true;
          break;
        }
      }
      if (scheduled) break;
    }

    if (!scheduled) {
      conflicts.push(`Could not schedule ${course.code} - ${course.title} due to conflicts`);
    }
  });

  return {
    success: conflicts.length === 0,
    sessions,
    conflicts,
    warnings,
  };
}

/**
 * Generate teaching timetable for a department
 */
export function generateForDepartment(
  departmentId: string,
  courses: Course[],
  classes: Class[],
  venues: Venue[],
  lecturers: Lecturer[],
  departments: Department[],
  options: GenerationOptions
): GenerationResult {
  const department = departments.find((d) => d.id === departmentId);
  if (!department) {
    return {
      success: false,
      sessions: [],
      conflicts: ['Department not found'],
      warnings: [],
    };
  }

  // Get all classes in this department
  const departmentClasses = classes.filter((c) => c.program === department.name);

  let allSessions: TeachingSession[] = [];
  const allConflicts: string[] = [];
  const allWarnings: string[] = [];

  // Generate for each class
  departmentClasses.forEach((cls) => {
    const result = generateForClass(cls.id, courses, classes, venues, lecturers, options);
    allSessions = [...allSessions, ...(result.sessions as TeachingSession[])];
    allConflicts.push(...result.conflicts);
    allWarnings.push(...result.warnings);
  });

  return {
    success: allConflicts.length === 0,
    sessions: allSessions,
    conflicts: allConflicts,
    warnings: allWarnings,
  };
}

/**
 * Generate teaching timetable for a faculty
 */
export function generateForFaculty(
  facultyId: string,
  courses: Course[],
  classes: Class[],
  venues: Venue[],
  lecturers: Lecturer[],
  departments: Department[],
  faculties: Faculty[],
  options: GenerationOptions
): GenerationResult {
  const faculty = faculties.find((f) => f.id === facultyId);
  if (!faculty) {
    return {
      success: false,
      sessions: [],
      conflicts: ['Faculty not found'],
      warnings: [],
    };
  }

  // Get all departments in this faculty
  const facultyDepartments = departments.filter((d) => d.facultyId === facultyId);

  let allSessions: TeachingSession[] = [];
  const allConflicts: string[] = [];
  const allWarnings: string[] = [];

  // Generate for each department
  facultyDepartments.forEach((dept) => {
    const result = generateForDepartment(
      dept.id,
      courses,
      classes,
      venues,
      lecturers,
      departments,
      options
    );
    allSessions = [...allSessions, ...(result.sessions as TeachingSession[])];
    allConflicts.push(...result.conflicts);
    allWarnings.push(...result.warnings);
  });

  return {
    success: allConflicts.length === 0,
    sessions: allSessions,
    conflicts: allConflicts,
    warnings: allWarnings,
  };
}

/**
 * Generate teaching timetable for entire school
 */
export function generateForSchool(
  courses: Course[],
  classes: Class[],
  venues: Venue[],
  lecturers: Lecturer[],
  departments: Department[],
  faculties: Faculty[],
  options: GenerationOptions
): GenerationResult {
  let allSessions: TeachingSession[] = [];
  const allConflicts: string[] = [];
  const allWarnings: string[] = [];

  // Generate for each faculty
  faculties.forEach((faculty) => {
    const result = generateForFaculty(
      faculty.id,
      courses,
      classes,
      venues,
      lecturers,
      departments,
      faculties,
      options
    );
    allSessions = [...allSessions, ...(result.sessions as TeachingSession[])];
    allConflicts.push(...result.conflicts);
    allWarnings.push(...result.warnings);
  });

  return {
    success: allConflicts.length === 0,
    sessions: allSessions,
    conflicts: allConflicts,
    warnings: allWarnings,
  };
}

/**
 * Main auto-generation dispatcher
 */
export function autoGenerateTimetable(
  scope: GenerationScope,
  targetId: string | undefined,
  courses: Course[],
  classes: Class[],
  venues: Venue[],
  lecturers: Lecturer[],
  departments: Department[],
  faculties: Faculty[],
  options: GenerationOptions
): GenerationResult {
  switch (scope) {
    case 'class':
      if (!targetId) {
        return {
          success: false,
          sessions: [],
          conflicts: ['Class ID is required'],
          warnings: [],
        };
      }
      return generateForClass(targetId, courses, classes, venues, lecturers, options);

    case 'department':
      if (!targetId) {
        return {
          success: false,
          sessions: [],
          conflicts: ['Department ID is required'],
          warnings: [],
        };
      }
      return generateForDepartment(targetId, courses, classes, venues, lecturers, departments, options);

    case 'faculty':
      if (!targetId) {
        return {
          success: false,
          sessions: [],
          conflicts: ['Faculty ID is required'],
          warnings: [],
        };
      }
      return generateForFaculty(
        targetId,
        courses,
        classes,
        venues,
        lecturers,
        departments,
        faculties,
        options
      );

    case 'school':
      return generateForSchool(courses, classes, venues, lecturers, departments, faculties, options);

    default:
      return {
        success: false,
        sessions: [],
        conflicts: ['Invalid scope'],
        warnings: [],
      };
  }
}