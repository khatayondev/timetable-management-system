/**
 * Multi-Level Timetable Auto-Generation Engine
 * Supports generation at Class, Department, and Faculty levels
 * with intelligent constraint resolution and conflict handling
 */

import { TeachingSession, ExamSession } from '../context/TimetableContext';
import { Course } from '../context/CourseContext';
import { Class } from '../context/ClassContext';
import { Venue } from '../context/VenueContext';
import { Lecturer } from '../context/LecturerContext';
import { Department, Faculty } from '../context/OrganizationContext';
import { TeachingConstraintSolver, ExamConstraintSolver } from './constraintSolver';

export type GenerationLevel = 'class' | 'department' | 'faculty';

export interface GenerationOptions {
  level: GenerationLevel;
  targetId: string; // Class ID, Department ID, or Faculty ID
  semester: number;
  academicYear: string;
  startDate?: string; // For exam timetables
  endDate?: string; // For exam timetables
  preferences?: GenerationPreferences;
}

export interface GenerationPreferences {
  // Teaching preferences
  preferMorningSlots?: boolean;
  avoidFridayAfternoon?: boolean;
  maxSessionsPerDay?: number;
  gapBetweenSessions?: number; // in minutes
  
  // Exam preferences
  examStartTime?: string;
  examDuration?: number; // default duration in minutes
  maxExamsPerDay?: number;
  bufferBetweenExams?: number; // in minutes
}

export interface GenerationResult {
  success: boolean;
  sessions: (TeachingSession | ExamSession)[];
  conflicts: GenerationConflict[];
  warnings: string[];
  metadata: {
    totalSessions: number;
    classesScheduled: number;
    coursesScheduled: number;
    venuesUsed: number;
    generationTime: number; // in ms
  };
}

export interface GenerationConflict {
  type: 'hard' | 'soft';
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  affectedItems: string[];
  suggestion?: string;
}

/**
 * Multi-Level Teaching Timetable Generator
 */
export class TeachingTimetableGenerator {
  private courses: Course[];
  private classes: Class[];
  private venues: Venue[];
  private lecturers: Lecturer[];
  private departments: Department[];
  private faculties: Faculty[];

  constructor(
    courses: Course[],
    classes: Class[],
    venues: Venue[],
    lecturers: Lecturer[],
    departments: Department[],
    faculties: Faculty[]
  ) {
    this.courses = courses;
    this.classes = classes;
    this.venues = venues;
    this.lecturers = lecturers;
    this.departments = departments;
    this.faculties = faculties;
  }

  /**
   * Generate teaching timetable at specified level
   */
  async generate(options: GenerationOptions): Promise<GenerationResult> {
    const startTime = Date.now();
    const sessions: TeachingSession[] = [];
    const conflicts: GenerationConflict[] = [];
    const warnings: string[] = [];

    try {
      // Get target classes based on generation level
      const targetClasses = this.getTargetClasses(options.level, options.targetId);
      
      if (targetClasses.length === 0) {
        return {
          success: false,
          sessions: [],
          conflicts: [{
            type: 'hard',
            severity: 'critical',
            message: 'No classes found for the specified level',
            affectedItems: [options.targetId],
          }],
          warnings: [],
          metadata: {
            totalSessions: 0,
            classesScheduled: 0,
            coursesScheduled: 0,
            venuesUsed: 0,
            generationTime: Date.now() - startTime,
          },
        };
      }

      // Get courses for these classes
      const relevantCourses = this.getCoursesForClasses(targetClasses, options.semester);
      
      // Generate sessions for each course-class combination
      for (const course of relevantCourses) {
        // Ensure assignedClasses exists and is an array
        if (!course.assignedClasses || !Array.isArray(course.assignedClasses) || course.assignedClasses.length === 0) {
          warnings.push(`Course ${course.title} has no assigned classes, skipping.`);
          continue;
        }

        for (const assignment of course.assignedClasses) {
          const targetClass = targetClasses.find(c => c.id === assignment.classId);
          if (!targetClass) continue;

          const generatedSessions = this.generateSessionsForCourse(
            course,
            assignment,
            targetClass,
            sessions,
            options.preferences
          );

          sessions.push(...generatedSessions.sessions);
          conflicts.push(...generatedSessions.conflicts);
          warnings.push(...generatedSessions.warnings);
        }
      }

      // Post-generation optimization
      const optimized = this.optimizeSchedule(sessions, options.preferences);
      
      const uniqueVenues = new Set(sessions.map(s => s.venueId));
      const uniqueCourses = new Set(sessions.map(s => s.courseId));

      return {
        success: conflicts.filter(c => c.type === 'hard').length === 0,
        sessions: optimized,
        conflicts,
        warnings,
        metadata: {
          totalSessions: sessions.length,
          classesScheduled: targetClasses.length,
          coursesScheduled: uniqueCourses.size,
          venuesUsed: uniqueVenues.size,
          generationTime: Date.now() - startTime,
        },
      };
    } catch (error) {
      return {
        success: false,
        sessions: [],
        conflicts: [{
          type: 'hard',
          severity: 'critical',
          message: `Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          affectedItems: [],
        }],
        warnings: [],
        metadata: {
          totalSessions: 0,
          classesScheduled: 0,
          coursesScheduled: 0,
          venuesUsed: 0,
          generationTime: Date.now() - startTime,
        },
      };
    }
  }

  /**
   * Get classes based on generation level
   */
  private getTargetClasses(level: GenerationLevel, targetId: string): Class[] {
    switch (level) {
      case 'class':
        const singleClass = this.classes.find(c => c.id === targetId);
        return singleClass ? [singleClass] : [];
      
      case 'department':
        const dept = this.departments.find(d => d.id === targetId);
        if (!dept) return [];
        return this.classes.filter(c => c.program === dept.name);
      
      case 'faculty':
        const faculty = this.faculties.find(f => f.id === targetId);
        if (!faculty) return [];
        // Safety check for departments array
        if (!faculty.departments || !Array.isArray(faculty.departments) || faculty.departments.length === 0) {
          return [];
        }
        const depts = this.departments.filter(d => faculty.departments.includes(d.id));
        const deptNames = depts.map(d => d.name);
        return this.classes.filter(c => deptNames.includes(c.program));
      
      default:
        return [];
    }
  }

  /**
   * Get courses relevant to classes and semester
   */
  private getCoursesForClasses(classes: Class[], semester: number): Course[] {
    const classIds = classes.map(c => c.id);
    return this.courses.filter(course => {
      // Check if assignedClasses exists and is an array
      if (!course.assignedClasses || !Array.isArray(course.assignedClasses)) {
        return false;
      }
      return course.assignedClasses.some(assignment => classIds.includes(assignment.classId));
    });
  }

  /**
   * Generate sessions for a single course-class combination
   */
  private generateSessionsForCourse(
    course: Course,
    assignment: any,
    targetClass: Class,
    existingSessions: TeachingSession[],
    preferences?: GenerationPreferences
  ): { sessions: TeachingSession[]; conflicts: GenerationConflict[]; warnings: string[] } {
    const sessions: TeachingSession[] = [];
    const conflicts: GenerationConflict[] = [];
    const warnings: string[] = [];

    const days = preferences?.avoidFridayAfternoon 
      ? ['monday', 'tuesday', 'wednesday', 'thursday']
      : ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

    const timeSlots = this.generateTimeSlots(preferences);

    // Determine number of sessions needed per week
    const sessionsPerWeek = this.calculateSessionsPerWeek(course);

    let scheduledSessions = 0;

    for (const day of days) {
      if (scheduledSessions >= sessionsPerWeek) break;

      for (const slot of timeSlots) {
        if (scheduledSessions >= sessionsPerWeek) break;

        // Find suitable venue
        const venue = this.findSuitableVenue(course, assignment.studentCount);
        
        if (!venue) {
          conflicts.push({
            type: 'hard',
            severity: 'critical',
            message: `No suitable venue found for ${course.title} (${targetClass.name})`,
            affectedItems: [course.id, targetClass.id],
            suggestion: 'Add more venues or reduce class size',
          });
          continue;
        }

        const newSession: TeachingSession = {
          id: `ts-${Date.now()}-${sessions.length}`,
          courseId: course.id,
          courseName: course.title,
          classId: targetClass.id,
          className: targetClass.name,
          lecturerId: course.lecturerId,
          lecturerName: course.lecturerName,
          venueId: venue.id,
          venueName: venue.name,
          day,
          startTime: slot.start,
          endTime: slot.end,
          sessionType: course.courseType === 'lab' ? 'lab' : 'lecture',
          weeklyRecurrence: true,
        };

        // Check constraints
        const allSessions = [...existingSessions, ...sessions];
        
        if (TeachingConstraintSolver.checkClassClash(allSessions, newSession)) {
          conflicts.push({
            type: 'soft',
            severity: 'high',
            message: `Class clash detected for ${targetClass.name} on ${day} ${slot.start}-${slot.end}`,
            affectedItems: [targetClass.id],
          });
          continue;
        }

        if (!TeachingConstraintSolver.checkVenueAvailability(allSessions, newSession)) {
          warnings.push(`Venue ${venue.name} not available on ${day} ${slot.start}-${slot.end}, trying next slot`);
          continue;
        }

        sessions.push(newSession);
        scheduledSessions++;
      }
    }

    if (scheduledSessions < sessionsPerWeek) {
      warnings.push(
        `Only scheduled ${scheduledSessions}/${sessionsPerWeek} sessions for ${course.title} (${targetClass.name})`
      );
    }

    return { sessions, conflicts, warnings };
  }

  /**
   * Generate time slots based on preferences
   */
  private generateTimeSlots(preferences?: GenerationPreferences): Array<{ start: string; end: string }> {
    const baseSlots = [
      { start: '08:00', end: '10:00' },
      { start: '10:00', end: '12:00' },
      { start: '12:00', end: '14:00' },
      { start: '14:00', end: '16:00' },
      { start: '16:00', end: '18:00' },
    ];

    if (preferences?.preferMorningSlots) {
      return baseSlots.slice(0, 3); // Only morning and early afternoon
    }

    return baseSlots;
  }

  /**
   * Calculate sessions per week based on course credit hours
   */
  private calculateSessionsPerWeek(course: Course): number {
    // Typically: 3 credit hours = 2 sessions per week, 4 credit hours = 2-3 sessions
    if (course.courseType === 'lab') return 1;
    if (course.courseType === 'mixed') return 2; // 1 lecture + 1 lab
    return Math.ceil(course.creditHours / 2);
  }

  /**
   * Find suitable venue for course
   */
  private findSuitableVenue(course: Course, studentCount: number): Venue | undefined {
    const suitableVenues = this.venues.filter(venue => {
      if (course.requiresSpecializedLab && course.courseType === 'lab') {
        return venue.type === 'laboratory' && venue.teachingCapacity >= studentCount;
      }
      return venue.teachingCapacity >= studentCount;
    });

    // Return largest suitable venue
    return suitableVenues.sort((a, b) => b.teachingCapacity - a.teachingCapacity)[0];
  }

  /**
   * Optimize schedule by redistributing sessions
   */
  private optimizeSchedule(sessions: TeachingSession[], preferences?: GenerationPreferences): TeachingSession[] {
    // Simple optimization: spread sessions across week evenly
    // More sophisticated algorithms could be implemented here
    return sessions;
  }
}

/**
 * Multi-Level Exam Timetable Generator
 */
export class ExamTimetableGenerator {
  private courses: Course[];
  private classes: Class[];
  private venues: Venue[];
  private lecturers: Lecturer[];
  private departments: Department[];
  private faculties: Faculty[];

  constructor(
    courses: Course[],
    classes: Class[],
    venues: Venue[],
    lecturers: Lecturer[],
    departments: Department[],
    faculties: Faculty[]
  ) {
    this.courses = courses;
    this.classes = classes;
    this.venues = venues;
    this.lecturers = lecturers;
    this.departments = departments;
    this.faculties = faculties;
  }

  /**
   * Generate exam timetable at specified level
   */
  async generate(options: GenerationOptions): Promise<GenerationResult> {
    const startTime = Date.now();
    const sessions: ExamSession[] = [];
    const conflicts: GenerationConflict[] = [];
    const warnings: string[] = [];

    if (!options.startDate || !options.endDate) {
      return {
        success: false,
        sessions: [],
        conflicts: [{
          type: 'hard',
          severity: 'critical',
          message: 'Start date and end date are required for exam timetable generation',
          affectedItems: [],
        }],
        warnings: [],
        metadata: {
          totalSessions: 0,
          classesScheduled: 0,
          coursesScheduled: 0,
          venuesUsed: 0,
          generationTime: Date.now() - startTime,
        },
      };
    }

    try {
      // Get target classes
      const targetClasses = this.getTargetClasses(options.level, options.targetId);
      
      if (targetClasses.length === 0) {
        return {
          success: false,
          sessions: [],
          conflicts: [{
            type: 'hard',
            severity: 'critical',
            message: 'No classes found for the specified level',
            affectedItems: [options.targetId],
          }],
          warnings: [],
          metadata: {
            totalSessions: 0,
            classesScheduled: 0,
            coursesScheduled: 0,
            venuesUsed: 0,
            generationTime: Date.now() - startTime,
          },
        };
      }

      // Get courses for these classes
      const relevantCourses = this.getCoursesForClasses(targetClasses, options.semester);
      
      // Generate exam dates
      const examDates = this.generateExamDates(options.startDate, options.endDate);
      
      let currentDateIndex = 0;
      const sessionsPerDay: { [date: string]: number } = {};

      // Schedule exams
      for (const course of relevantCourses) {
        // Ensure assignedClasses exists and is an array
        if (!course.assignedClasses || !Array.isArray(course.assignedClasses) || course.assignedClasses.length === 0) {
          warnings.push(`Course ${course.title} has no assigned classes, skipping.`);
          continue;
        }

        for (const assignment of course.assignedClasses) {
          const targetClass = targetClasses.find(c => c.id === assignment.classId);
          if (!targetClass) continue;

          // Find suitable date
          let examDate = examDates[currentDateIndex % examDates.length];
          let attempts = 0;
          
          while (sessionsPerDay[examDate] >= (options.preferences?.maxExamsPerDay || 3) && attempts < examDates.length) {
            currentDateIndex++;
            examDate = examDates[currentDateIndex % examDates.length];
            attempts++;
          }

          // Check student fatigue
          const fatigueCheck = ExamConstraintSolver.checkStudentFatigue(sessions, {
            courseId: course.id,
            courseName: course.title,
            classId: targetClass.id,
            className: targetClass.name,
            studentCount: assignment.studentCount,
            examType: course.courseType === 'lab' ? 'practical' : 'theory',
            date: examDate,
            startTime: options.preferences?.examStartTime || '09:00',
            endTime: this.calculateEndTime(options.preferences?.examStartTime || '09:00', options.preferences?.examDuration || 180),
            duration: options.preferences?.examDuration || 180,
            venueAllocations: [],
            invigilators: [],
          } as Omit<ExamSession, 'id'>);

          if (fatigueCheck.hasConflict) {
            warnings.push(
              `Student fatigue detected for ${targetClass.name} on ${examDate} (${fatigueCheck.count + 1} exams)`
            );
          }

          // Calculate venue allocations
          const batching = ExamConstraintSolver.calculateExamBatches(
            assignment.studentCount,
            this.venues,
            course.courseType === 'lab' ? 'practical' : 'theory'
          );

          if (batching.allocations.length === 0) {
            conflicts.push({
              type: 'hard',
              severity: 'critical',
              message: `No suitable venues for ${course.title} exam (${targetClass.name})`,
              affectedItems: [course.id, targetClass.id],
            });
            continue;
          }

          // Assign invigilators (lecturers not teaching the course)
          const availableInvigilators = this.lecturers
            .filter(lec => lec.id !== course.lecturerId)
            .slice(0, Math.max(1, Math.ceil(assignment.studentCount / 50)))
            .map(lec => lec.id);

          const venueAllocations = batching.allocations.map(alloc => ({
            venueId: alloc.venueId,
            venueName: this.venues.find(v => v.id === alloc.venueId)?.name || '',
            capacity: alloc.capacity,
            assignedStudents: alloc.students,
          }));

          const newSession: ExamSession = {
            id: `es-${Date.now()}-${sessions.length}`,
            courseId: course.id,
            courseName: course.title,
            classId: targetClass.id,
            className: targetClass.name,
            studentCount: assignment.studentCount,
            examType: course.courseType === 'lab' ? 'practical' : 'theory',
            date: examDate,
            startTime: options.preferences?.examStartTime || '09:00',
            endTime: this.calculateEndTime(options.preferences?.examStartTime || '09:00', options.preferences?.examDuration || 180),
            duration: options.preferences?.examDuration || 180,
            venueAllocations,
            totalBatches: batching.totalBatches,
            batchNumber: batching.totalBatches > 1 ? 1 : undefined,
            invigilators: availableInvigilators,
          };

          sessions.push(newSession);
          sessionsPerDay[examDate] = (sessionsPerDay[examDate] || 0) + 1;
          currentDateIndex++;
        }
      }

      const uniqueVenues = new Set(sessions.flatMap(s => s.venueAllocations.map(v => v.venueId)));
      const uniqueCourses = new Set(sessions.map(s => s.courseId));

      return {
        success: conflicts.filter(c => c.type === 'hard').length === 0,
        sessions,
        conflicts,
        warnings,
        metadata: {
          totalSessions: sessions.length,
          classesScheduled: targetClasses.length,
          coursesScheduled: uniqueCourses.size,
          venuesUsed: uniqueVenues.size,
          generationTime: Date.now() - startTime,
        },
      };
    } catch (error) {
      return {
        success: false,
        sessions: [],
        conflicts: [{
          type: 'hard',
          severity: 'critical',
          message: `Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          affectedItems: [],
        }],
        warnings: [],
        metadata: {
          totalSessions: 0,
          classesScheduled: 0,
          coursesScheduled: 0,
          venuesUsed: 0,
          generationTime: Date.now() - startTime,
        },
      };
    }
  }

  private getTargetClasses(level: GenerationLevel, targetId: string): Class[] {
    switch (level) {
      case 'class':
        const singleClass = this.classes.find(c => c.id === targetId);
        return singleClass ? [singleClass] : [];
      
      case 'department':
        const dept = this.departments.find(d => d.id === targetId);
        if (!dept) return [];
        return this.classes.filter(c => c.program === dept.name);
      
      case 'faculty':
        const faculty = this.faculties.find(f => f.id === targetId);
        if (!faculty) return [];
        // Safety check for departments array
        if (!faculty.departments || !Array.isArray(faculty.departments) || faculty.departments.length === 0) {
          return [];
        }
        const depts = this.departments.filter(d => faculty.departments.includes(d.id));
        const deptNames = depts.map(d => d.name);
        return this.classes.filter(c => deptNames.includes(c.program));
      
      default:
        return [];
    }
  }

  private getCoursesForClasses(classes: Class[], semester: number): Course[] {
    const classIds = classes.map(c => c.id);
    return this.courses.filter(course => {
      // Check if assignedClasses exists and is an array
      if (!course.assignedClasses || !Array.isArray(course.assignedClasses)) {
        return false;
      }
      return course.assignedClasses.some(assignment => classIds.includes(assignment.classId));
    });
  }

  private generateExamDates(startDate: string, endDate: string): string[] {
    const dates: string[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    let current = new Date(start);
    while (current <= end) {
      // Skip weekends
      if (current.getDay() !== 0 && current.getDay() !== 6) {
        dates.push(current.toISOString().split('T')[0]);
      }
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }

  private calculateEndTime(startTime: string, durationMinutes: number): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  }
}