import React, { createContext, useContext, useState, ReactNode } from 'react';

export type CourseType = 'lecture' | 'lab' | 'tutorial' | 'mixed';
export type ExamType = 'theory' | 'practical' | 'both';

export interface CourseAssignment {
  classId: string;
  className: string;
  studentCount: number;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  departmentId: string; // Link to department
  departmentName?: string; // For display
  facultyId?: string; // For filtering
  facultyName?: string; // For display
  departmentId: string; // Link to department
  departmentName?: string; // For display
  facultyId?: string; // For filtering
  facultyName?: string; // For display
  program: string;
  semester: number;
  creditHours: number;
  level?: number; // e.g., 100, 200, 300, 400
  level?: number; // e.g., 100, 200, 300, 400
  
  // Course Type and Duration
  courseType: CourseType;
  lectureDuration: number; // in minutes (typically 120)
  labDuration: number; // in minutes (typically 180)
  tutorialDuration: number; // in minutes
  
  // Exam Configuration
  examType: ExamType;
  examDuration: number; // in minutes
  
  // Assignments
  assignedClasses: CourseAssignment[]; // Classes taking this course
  assignedLecturerIds: string[]; // Multiple lecturers can teach
  assignedLecturerIds: string[]; // Multiple lecturers can teach
  lecturerId: string;
  lecturerName: string;
  
  // Lab requirements
  requiresSpecializedLab: boolean;
  requiredSoftware: string[];
  requiredEquipment: string[];
  
  // Metadata
  description?: string;
  prerequisites: string[];
}

interface CourseContextType {
  courses: Course[];
  addCourse: (course: Omit<Course, 'id'>) => void;
  updateCourse: (id: string, course: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  getCourse: (id: string) => Course | undefined;
  getCoursesByProgram: (program: string) => Course[];
  getCoursesByLecturer: (lecturerId: string) => Course[];
  assignClassToCourse: (courseId: string, assignment: CourseAssignment) => void;
  removeClassFromCourse: (courseId: string, classId: string) => void;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

// Mock data
const mockCourses: Course[] = [
  {
    id: '1',
    code: 'CS301',
    title: 'Data Structures and Algorithms',
    departmentId: 'CS',
    departmentName: 'Computer Science',
    facultyId: 'FCS',
    facultyName: 'Faculty of Computer Science',
    departmentId: 'CS',
    departmentName: 'Computer Science',
    facultyId: 'FCS',
    facultyName: 'Faculty of Computer Science',
    program: 'Computer Science',
    semester: 1,
    creditHours: 4,
    level: 300,
    level: 300,
    courseType: 'mixed',
    lectureDuration: 120,
    labDuration: 180,
    tutorialDuration: 60,
    examType: 'both',
    examDuration: 180,
    assignedClasses: [
      {
        classId: '1',
        className: 'Level 300 CS Class A',
        studentCount: 85,
      },
      {
        classId: '2',
        className: 'Level 300 CS Class B',
        studentCount: 78,
      },
    ],
    assignedLecturerIds: ['1'],
    assignedLecturerIds: ['1'],
    lecturerId: '1',
    lecturerName: 'Dr. Samuel Owusu',
    requiresSpecializedLab: true,
    requiredSoftware: ['Visual Studio', 'Python', 'Java'],
    requiredEquipment: ['High-spec Computers'],
    description: 'Introduction to fundamental data structures and algorithm design',
    prerequisites: ['CS201'],
  },
  {
    id: '2',
    code: 'CS302',
    title: 'Database Management Systems',
    departmentId: 'CS',
    departmentName: 'Computer Science',
    facultyId: 'FCS',
    facultyName: 'Faculty of Computer Science',
    departmentId: 'CS',
    departmentName: 'Computer Science',
    facultyId: 'FCS',
    facultyName: 'Faculty of Computer Science',
    program: 'Computer Science',
    semester: 1,
    creditHours: 3,
    level: 300,
    level: 300,
    courseType: 'mixed',
    lectureDuration: 120,
    labDuration: 180,
    tutorialDuration: 0,
    examType: 'both',
    examDuration: 180,
    assignedClasses: [
      {
        classId: '1',
        className: 'Level 300 CS Class A',
        studentCount: 85,
      },
    ],
    assignedLecturerIds: ['2'],
    assignedLecturerIds: ['2'],
    lecturerId: '2',
    lecturerName: 'Prof. Ama Mensah',
    requiresSpecializedLab: true,
    requiredSoftware: ['MySQL', 'PostgreSQL', 'MongoDB'],
    requiredEquipment: ['Database Servers'],
    description: 'Comprehensive study of database design and management',
    prerequisites: ['CS101'],
  },
  {
    id: '3',
    code: 'EE201',
    title: 'Circuit Analysis',
    departmentId: 'EE',
    departmentName: 'Electrical Engineering',
    facultyId: 'FEE',
    facultyName: 'Faculty of Electrical Engineering',
    departmentId: 'EE',
    departmentName: 'Electrical Engineering',
    facultyId: 'FEE',
    facultyName: 'Faculty of Electrical Engineering',
    program: 'Electrical Engineering',
    semester: 1,
    creditHours: 4,
    level: 200,
    level: 200,
    courseType: 'mixed',
    lectureDuration: 120,
    labDuration: 180,
    tutorialDuration: 60,
    examType: 'both',
    examDuration: 180,
    assignedClasses: [
      {
        classId: '3',
        className: 'Level 200 EE Class A',
        studentCount: 92,
      },
    ],
    assignedLecturerIds: ['3'],
    assignedLecturerIds: ['3'],
    lecturerId: '3',
    lecturerName: 'Dr. Kwame Asante',
    requiresSpecializedLab: true,
    requiredSoftware: ['MATLAB', 'LTSpice'],
    requiredEquipment: ['Oscilloscopes', 'Function Generators'],
    description: 'Fundamentals of electrical circuit theory and analysis',
    prerequisites: ['MATH101'],
  },
  {
    id: '4',
    code: 'ME101',
    title: 'Engineering Drawing',
    departmentId: 'ME',
    departmentName: 'Mechanical Engineering',
    facultyId: 'FME',
    facultyName: 'Faculty of Mechanical Engineering',
    departmentId: 'ME',
    departmentName: 'Mechanical Engineering',
    facultyId: 'FME',
    facultyName: 'Faculty of Mechanical Engineering',
    program: 'Mechanical Engineering',
    semester: 1,
    creditHours: 3,
    level: 100,
    level: 100,
    courseType: 'mixed',
    lectureDuration: 120,
    labDuration: 180,
    tutorialDuration: 0,
    examType: 'practical',
    examDuration: 180,
    assignedClasses: [
      {
        classId: '4',
        className: 'Level 100 ME Class A',
        studentCount: 105,
      },
    ],
    assignedLecturerIds: ['4'],
    assignedLecturerIds: ['4'],
    lecturerId: '4',
    lecturerName: 'Eng. Joseph Osei',
    requiresSpecializedLab: true,
    requiredSoftware: ['AutoCAD', 'SolidWorks'],
    requiredEquipment: ['Drawing Boards', 'CAD Workstations'],
    description: 'Technical drawing and CAD fundamentals for engineers',
    prerequisites: [],
  },
  {
    id: '5',
    code: 'MATH201',
    title: 'Linear Algebra',
    departmentId: 'MATH',
    departmentName: 'Mathematics',
    facultyId: 'FMATH',
    facultyName: 'Faculty of Mathematics',
    departmentId: 'MATH',
    departmentName: 'Mathematics',
    facultyId: 'FMATH',
    facultyName: 'Faculty of Mathematics',
    program: 'Mathematics',
    semester: 1,
    creditHours: 3,
    level: 200,
    level: 200,
    courseType: 'lecture',
    lectureDuration: 120,
    labDuration: 0,
    tutorialDuration: 60,
    examType: 'theory',
    examDuration: 180,
    assignedClasses: [
      {
        classId: '1',
        className: 'Level 300 CS Class A',
        studentCount: 85,
      },
      {
        classId: '3',
        className: 'Level 200 EE Class A',
        studentCount: 92,
      },
    ],
    assignedLecturerIds: ['5'],
    assignedLecturerIds: ['5'],
    lecturerId: '5',
    lecturerName: 'Dr. Abena Oforiwaa',
    requiresSpecializedLab: false,
    requiredSoftware: [],
    requiredEquipment: [],
    description: 'Vector spaces, matrices, and linear transformations',
    prerequisites: ['MATH101'],
  },
];

export const CourseProvider = ({ children }: { children: ReactNode }) => {
  const [courses, setCourses] = useState<Course[]>(mockCourses);

  const addCourse = (course: Omit<Course, 'id'>) => {
    const newCourse: Course = {
      ...course,
      id: Date.now().toString(),
    };
    setCourses([...courses, newCourse]);
  };

  const updateCourse = (id: string, updatedCourse: Partial<Course>) => {
    setCourses(courses.map((c) => (c.id === id ? { ...c, ...updatedCourse } : c)));
  };

  const deleteCourse = (id: string) => {
    setCourses(courses.filter((c) => c.id !== id));
  };

  const getCourse = (id: string) => {
    return courses.find((c) => c.id === id);
  };

  const getCoursesByProgram = (program: string) => {
    return courses.filter((c) => c.program === program);
  };

  const getCoursesByLecturer = (lecturerId: string) => {
    return courses.filter((c) => c.lecturerId === lecturerId);
  };

  const assignClassToCourse = (courseId: string, assignment: CourseAssignment) => {
    setCourses(
      courses.map((c) => {
        if (c.id === courseId) {
          // Check if class is already assigned
          const isAlreadyAssigned = c.assignedClasses.some((a) => a.classId === assignment.classId);
          if (!isAlreadyAssigned) {
            return {
              ...c,
              assignedClasses: [...c.assignedClasses, assignment],
            };
          }
        }
        return c;
      })
    );
  };

  const removeClassFromCourse = (courseId: string, classId: string) => {
    setCourses(
      courses.map((c) => {
        if (c.id === courseId) {
          return {
            ...c,
            assignedClasses: c.assignedClasses.filter((a) => a.classId !== classId),
          };
        }
        return c;
      })
    );
  };

  return (
    <CourseContext.Provider
      value={{
        courses,
        addCourse,
        updateCourse,
        deleteCourse,
        getCourse,
        getCoursesByProgram,
        getCoursesByLecturer,
        assignClassToCourse,
        removeClassFromCourse,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
};

export const useCourses = () => {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourses must be used within CourseProvider');
  }
  return context;
};