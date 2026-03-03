import React, { createContext, useContext, useState, ReactNode } from 'react';

export type TimetableType = 'teaching' | 'exam';
export type TimetableStatus = 'draft' | 'submitted' | 'reviewed' | 'approved' | 'published';
export type SessionType = 'lecture' | 'lab' | 'tutorial' | 'exam';

// Teaching Session (Weekly recurring)
export interface TeachingSession {
  id: string;
  courseId: string;
  courseName: string;
  classId: string;
  className: string;
  lecturerId: string;
  lecturerName: string;
  venueId: string;
  venueName: string;
  day: string; // monday, tuesday, etc.
  startTime: string;
  endTime: string;
  sessionType: 'lecture' | 'lab' | 'tutorial';
  weeklyRecurrence: boolean;
}

// Exam Session (One-time event with specific date)
export interface ExamSession {
  id: string;
  courseId: string;
  courseName: string;
  classId: string;
  className: string;
  studentCount: number;
  examType: 'theory' | 'practical';
  date: string; // Specific date for exam
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  venueAllocations: VenueAllocation[]; // May need multiple venues for large classes
  batchNumber?: number; // For practical exams split into batches
  totalBatches?: number;
  invigilators: string[]; // Lecturer IDs
}

export interface VenueAllocation {
  venueId: string;
  venueName: string;
  capacity: number;
  assignedStudents: number;
}

export interface Timetable {
  id: string;
  name: string;
  type: TimetableType;
  semester: number;
  academicYear: string;
  status: TimetableStatus;
  
  // Teaching timetable sessions
  teachingSessions: TeachingSession[];
  
  // Exam timetable sessions
  examSessions: ExamSession[];
  
  // Metadata
  version: number;
  createdBy: string;
  createdAt: string;
  lastModified: string;
  publishedAt?: string;
}

export interface Conflict {
  id: string;
  type: 'venue' | 'lecturer' | 'class' | 'student_fatigue' | 'capacity';
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  affectedSessions: string[];
  suggestions?: string[];
}

export interface SchedulingConstraints {
  // Teaching constraints
  noClassClash: boolean; // A class cannot have two courses at the same time
  noLabOverlapWithLecture: boolean; // Lab sessions for a class cannot overlap with their lectures
  respectLecturerAvailability: boolean;
  respectVenueAvailability: boolean;
  
  // Exam constraints
  noLecturerInvigilateOwnExam: boolean;
  minimizeSameDayExams: boolean; // Try to avoid two exams for same class on same day
  enforceSeatingCapacity: boolean;
  autoCreateExamBatches: boolean; // Auto-split large classes into multiple exam sessions
}

interface TimetableContextType {
  timetables: Timetable[];
  conflicts: Conflict[];
  constraints: SchedulingConstraints;
  
  // Timetable operations
  addTimetable: (timetable: Omit<Timetable, 'id'>) => void;
  updateTimetable: (id: string, timetable: Partial<Timetable>) => void;
  deleteTimetable: (id: string) => void;
  getTimetable: (id: string) => Timetable | undefined;
  
  // Session operations
  addTeachingSession: (timetableId: string, session: Omit<TeachingSession, 'id'>) => void;
  addExamSession: (timetableId: string, session: Omit<ExamSession, 'id'>) => void;
  removeSession: (timetableId: string, sessionId: string) => void;
  
  // Conflict detection
  detectConflicts: (timetableId: string) => Conflict[];
  resolveConflict: (conflictId: string) => void;
  
  // Auto-generation
  autoGenerateTeachingTimetable: (
    semester: number,
    academicYear: string,
    courseIds: string[]
  ) => void;
  autoGenerateExamTimetable: (
    semester: number,
    academicYear: string,
    courseIds: string[],
    startDate: string,
    endDate: string
  ) => void;
  
  // Status updates
  publishTimetable: (id: string) => void;
}

const TimetableContext = createContext<TimetableContextType | undefined>(undefined);

// Mock data
const mockTimetables: Timetable[] = [
  {
    id: '1',
    name: 'Semester 1 Teaching Timetable 2023/2024',
    type: 'teaching',
    semester: 1,
    academicYear: '2023/2024',
    status: 'published',
    version: 3,
    createdBy: 'registry@university.edu',
    createdAt: '2023-08-15T10:00:00Z',
    lastModified: '2023-09-05T14:30:00Z',
    publishedAt: '2023-09-10T08:00:00Z',
    teachingSessions: [
      {
        id: 'ts-1',
        courseId: '1',
        courseName: 'Data Structures and Algorithms',
        classId: '1',
        className: 'Level 300 CS Class A',
        lecturerId: '1',
        lecturerName: 'Dr. Samuel Owusu',
        venueId: '1',
        venueName: 'Main Lecture Hall A',
        day: 'monday',
        startTime: '09:00',
        endTime: '11:00',
        sessionType: 'lecture',
        weeklyRecurrence: true,
      },
      {
        id: 'ts-2',
        courseId: '1',
        courseName: 'Data Structures and Algorithms',
        classId: '1',
        className: 'Level 300 CS Class A',
        lecturerId: '1',
        lecturerName: 'Dr. Samuel Owusu',
        venueId: '2',
        venueName: 'Computer Lab V12',
        day: 'wednesday',
        startTime: '14:00',
        endTime: '17:00',
        sessionType: 'lab',
        weeklyRecurrence: true,
      },
      {
        id: 'ts-3',
        courseId: '2',
        courseName: 'Database Management Systems',
        classId: '1',
        className: 'Level 300 CS Class A',
        lecturerId: '2',
        lecturerName: 'Prof. Ama Mensah',
        venueId: '1',
        venueName: 'Main Lecture Hall A',
        day: 'tuesday',
        startTime: '11:00',
        endTime: '13:00',
        sessionType: 'lecture',
        weeklyRecurrence: true,
      },
    ],
    examSessions: [],
  },
  {
    id: '2',
    name: 'Semester 1 Exam Timetable 2023/2024',
    type: 'exam',
    semester: 1,
    academicYear: '2023/2024',
    status: 'approved',
    version: 2,
    createdBy: 'registry@university.edu',
    createdAt: '2023-11-01T09:00:00Z',
    lastModified: '2023-11-15T16:00:00Z',
    teachingSessions: [],
    examSessions: [
      {
        id: 'ex-1',
        courseId: '1',
        courseName: 'Data Structures and Algorithms',
        classId: '1',
        className: 'Level 300 CS Class A',
        studentCount: 85,
        examType: 'theory',
        date: '2024-12-10',
        startTime: '09:00',
        endTime: '12:00',
        duration: 180,
        venueAllocations: [
          {
            venueId: '5',
            venueName: 'Exam Hall EH-01',
            capacity: 120,
            assignedStudents: 85,
          },
        ],
        invigilators: ['2', '3'],
      },
      {
        id: 'ex-2',
        courseId: '1',
        courseName: 'Data Structures and Algorithms',
        classId: '1',
        className: 'Level 300 CS Class A',
        studentCount: 85,
        examType: 'practical',
        date: '2024-12-12',
        startTime: '09:00',
        endTime: '12:00',
        duration: 180,
        batchNumber: 1,
        totalBatches: 3,
        venueAllocations: [
          {
            venueId: '2',
            venueName: 'Computer Lab V12',
            capacity: 30,
            assignedStudents: 30,
          },
        ],
        invigilators: ['4'],
      },
      {
        id: 'ex-3',
        courseId: '1',
        courseName: 'Data Structures and Algorithms',
        classId: '1',
        className: 'Level 300 CS Class A',
        studentCount: 85,
        examType: 'practical',
        date: '2024-12-12',
        startTime: '14:00',
        endTime: '17:00',
        duration: 180,
        batchNumber: 2,
        totalBatches: 3,
        venueAllocations: [
          {
            venueId: '2',
            venueName: 'Computer Lab V12',
            capacity: 30,
            assignedStudents: 30,
          },
        ],
        invigilators: ['5'],
      },
    ],
  },
];

const mockConflicts: Conflict[] = [
  {
    id: 'c1',
    type: 'class',
    severity: 'critical',
    message: 'Level 300 CS Class A has overlapping sessions on Monday 09:00-11:00',
    affectedSessions: ['ts-1'],
    suggestions: ['Reschedule one session to a different time slot'],
  },
];

const defaultConstraints: SchedulingConstraints = {
  noClassClash: true,
  noLabOverlapWithLecture: true,
  respectLecturerAvailability: true,
  respectVenueAvailability: true,
  noLecturerInvigilateOwnExam: true,
  minimizeSameDayExams: true,
  enforceSeatingCapacity: true,
  autoCreateExamBatches: true,
};

export const TimetableProvider = ({ children }: { children: ReactNode }) => {
  const [timetables, setTimetables] = useState<Timetable[]>(mockTimetables);
  const [conflicts, setConflicts] = useState<Conflict[]>(mockConflicts);
  const [constraints] = useState<SchedulingConstraints>(defaultConstraints);

  const addTimetable = (timetable: Omit<Timetable, 'id'>) => {
    const newTimetable: Timetable = {
      ...timetable,
      id: Date.now().toString(),
    };
    setTimetables([...timetables, newTimetable]);
  };

  const updateTimetable = (id: string, updatedTimetable: Partial<Timetable>) => {
    setTimetables(
      timetables.map((t) =>
        t.id === id
          ? { ...t, ...updatedTimetable, lastModified: new Date().toISOString() }
          : t
      )
    );
  };

  const deleteTimetable = (id: string) => {
    setTimetables(timetables.filter((t) => t.id !== id));
  };

  const getTimetable = (id: string) => {
    return timetables.find((t) => t.id === id);
  };

  const addTeachingSession = (timetableId: string, session: Omit<TeachingSession, 'id'>) => {
    setTimetables(
      timetables.map((t) => {
        if (t.id === timetableId && t.type === 'teaching') {
          const newSession: TeachingSession = {
            ...session,
            id: `ts-${Date.now()}`,
          };
          return {
            ...t,
            teachingSessions: [...t.teachingSessions, newSession],
            lastModified: new Date().toISOString(),
          };
        }
        return t;
      })
    );
  };

  const addExamSession = (timetableId: string, session: Omit<ExamSession, 'id'>) => {
    setTimetables(
      timetables.map((t) => {
        if (t.id === timetableId && t.type === 'exam') {
          const newSession: ExamSession = {
            ...session,
            id: `ex-${Date.now()}`,
          };
          return {
            ...t,
            examSessions: [...t.examSessions, newSession],
            lastModified: new Date().toISOString(),
          };
        }
        return t;
      })
    );
  };

  const removeSession = (timetableId: string, sessionId: string) => {
    setTimetables(
      timetables.map((t) => {
        if (t.id === timetableId) {
          return {
            ...t,
            teachingSessions: t.teachingSessions.filter((s) => s.id !== sessionId),
            examSessions: t.examSessions.filter((s) => s.id !== sessionId),
            lastModified: new Date().toISOString(),
          };
        }
        return t;
      })
    );
  };

  const detectConflicts = (timetableId: string): Conflict[] => {
    const timetable = getTimetable(timetableId);
    if (!timetable) return [];

    const detectedConflicts: Conflict[] = [];

    if (timetable.type === 'teaching') {
      // Check for class clashes
      const sessionsByClass: { [classId: string]: TeachingSession[] } = {};
      
      timetable.teachingSessions.forEach((session) => {
        if (!sessionsByClass[session.classId]) {
          sessionsByClass[session.classId] = [];
        }
        sessionsByClass[session.classId].push(session);
      });

      Object.entries(sessionsByClass).forEach(([classId, sessions]) => {
        for (let i = 0; i < sessions.length; i++) {
          for (let j = i + 1; j < sessions.length; j++) {
            const s1 = sessions[i];
            const s2 = sessions[j];
            
            if (s1.day === s2.day) {
              const start1 = parseInt(s1.startTime.replace(':', ''));
              const end1 = parseInt(s1.endTime.replace(':', ''));
              const start2 = parseInt(s2.startTime.replace(':', ''));
              const end2 = parseInt(s2.endTime.replace(':', ''));
              
              if ((start1 < end2 && end1 > start2)) {
                detectedConflicts.push({
                  id: `conf-${Date.now()}-${i}-${j}`,
                  type: 'class',
                  severity: 'critical',
                  message: `${s1.className} has overlapping sessions on ${s1.day} (${s1.courseName} and ${s2.courseName})`,
                  affectedSessions: [s1.id, s2.id],
                  suggestions: ['Reschedule one of the sessions to a different time slot'],
                });
              }
            }
          }
        }
      });
    }

    setConflicts(detectedConflicts);
    return detectedConflicts;
  };

  const resolveConflict = (conflictId: string) => {
    setConflicts(conflicts.filter((c) => c.id !== conflictId));
  };

  const autoGenerateTeachingTimetable = (
    semester: number,
    academicYear: string,
    courseIds: string[]
  ) => {
    console.log('Auto-generating teaching timetable for:', { semester, academicYear, courseIds });
    // This would implement the constraint solver logic
    // For now, it's a placeholder
  };

  const autoGenerateExamTimetable = (
    semester: number,
    academicYear: string,
    courseIds: string[],
    startDate: string,
    endDate: string
  ) => {
    console.log('Auto-generating exam timetable for:', {
      semester,
      academicYear,
      courseIds,
      startDate,
      endDate,
    });
    // This would implement the exam scheduling logic with batching
  };

  const publishTimetable = (id: string) => {
    setTimetables(
      timetables.map((t) =>
        t.id === id
          ? {
              ...t,
              status: 'published',
              publishedAt: new Date().toISOString(),
            }
          : t
      )
    );
  };

  return (
    <TimetableContext.Provider
      value={{
        timetables,
        conflicts,
        constraints,
        addTimetable,
        updateTimetable,
        deleteTimetable,
        getTimetable,
        addTeachingSession,
        addExamSession,
        removeSession,
        detectConflicts,
        resolveConflict,
        autoGenerateTeachingTimetable,
        autoGenerateExamTimetable,
        publishTimetable,
      }}
    >
      {children}
    </TimetableContext.Provider>
  );
};

export const useTimetables = () => {
  const context = useContext(TimetableContext);
  if (!context) {
    throw new Error('useTimetables must be used within TimetableProvider');
  }
  return context;
};
