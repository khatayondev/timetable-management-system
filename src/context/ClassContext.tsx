import React, { createContext, useContext, useState, ReactNode } from 'react';

export type AttendanceType = 'REGULAR' | 'WEEKEND';

export interface Student {
  id: string;
  studentId: string; // e.g., "2024001"
  name: string;
  email: string;
  phone?: string;
  attendanceType: AttendanceType; // REGULAR (Mon-Fri) or WEEKEND (Sat-Sun)
}

export interface Class {
  id: string;
  name: string; // e.g., "Level 300 CS Class A"
  code: string; // e.g., "CS-300-A"
  program: string; // e.g., "Computer Science"
  level: number; // 100, 200, 300, 400
  academicYear: string; // e.g., "2023/2024"
  semester: number; // 1 or 2
  studentCount: number;
  students: Student[];
  classRepId?: string; // Student ID of class representative
  attendanceType: AttendanceType; // REGULAR (Mon-Fri) or WEEKEND (Sat-Sun)
}

interface ClassContextType {
  classes: Class[];
  addClass: (classData: Omit<Class, 'id'>) => void;
  updateClass: (id: string, classData: Partial<Class>) => void;
  deleteClass: (id: string) => void;
  getClass: (id: string) => Class | undefined;
  getClassesByLevel: (level: number) => Class[];
  getClassesByProgram: (program: string) => Class[];
  addStudentToClass: (classId: string, student: Omit<Student, 'id'>) => void;
  removeStudentFromClass: (classId: string, studentId: string) => void;
}

const ClassContext = createContext<ClassContextType | undefined>(undefined);

// Mock data
const mockClasses: Class[] = [
  {
    id: '1',
    name: 'Level 300 CS Class A',
    code: 'CS-300-A',
    program: 'Computer Science',
    level: 300,
    academicYear: '2023/2024',
    semester: 1,
    studentCount: 85,
    students: [
      {
        id: '1',
        studentId: '2021001',
        name: 'John Doe',
        email: 'john.doe@university.edu',
        phone: '+233200000001',
        attendanceType: 'REGULAR',
      },
      {
        id: '2',
        studentId: '2021002',
        name: 'Jane Smith',
        email: 'jane.smith@university.edu',
        phone: '+233200000002',
        attendanceType: 'REGULAR',
      },
      {
        id: '3',
        studentId: '2021003',
        name: 'Michael Johnson',
        email: 'michael.j@university.edu',
        attendanceType: 'REGULAR',
      },
    ],
    classRepId: '1',
    attendanceType: 'REGULAR',
  },
  {
    id: '2',
    name: 'Level 300 CS Class B',
    code: 'CS-300-B',
    program: 'Computer Science',
    level: 300,
    academicYear: '2023/2024',
    semester: 1,
    studentCount: 78,
    students: [
      {
        id: '4',
        studentId: '2021050',
        name: 'Sarah Williams',
        email: 'sarah.w@university.edu',
        attendanceType: 'REGULAR',
      },
      {
        id: '5',
        studentId: '2021051',
        name: 'David Brown',
        email: 'david.b@university.edu',
        attendanceType: 'REGULAR',
      },
    ],
    attendanceType: 'REGULAR',
  },
  {
    id: '3',
    name: 'Level 200 EE Class A',
    code: 'EE-200-A',
    program: 'Electrical Engineering',
    level: 200,
    academicYear: '2023/2024',
    semester: 1,
    studentCount: 92,
    students: [
      {
        id: '6',
        studentId: '2022100',
        name: 'Alice Cooper',
        email: 'alice.c@university.edu',
        attendanceType: 'REGULAR',
      },
      {
        id: '7',
        studentId: '2022101',
        name: 'Bob Martin',
        email: 'bob.m@university.edu',
        attendanceType: 'REGULAR',
      },
    ],
    attendanceType: 'REGULAR',
  },
  {
    id: '4',
    name: 'Level 100 ME Class A',
    code: 'ME-100-A',
    program: 'Mechanical Engineering',
    level: 100,
    academicYear: '2023/2024',
    semester: 1,
    studentCount: 105,
    students: [
      {
        id: '8',
        studentId: '2023200',
        name: 'Charlie Davis',
        email: 'charlie.d@university.edu',
        attendanceType: 'REGULAR',
      },
    ],
    attendanceType: 'REGULAR',
  },
];

export const ClassProvider = ({ children }: { children: ReactNode }) => {
  const [classes, setClasses] = useState<Class[]>(mockClasses);

  const addClass = (classData: Omit<Class, 'id'>) => {
    const newClass: Class = {
      ...classData,
      id: Date.now().toString(),
    };
    setClasses([...classes, newClass]);
  };

  const updateClass = (id: string, classData: Partial<Class>) => {
    setClasses(classes.map((c) => (c.id === id ? { ...c, ...classData } : c)));
  };

  const deleteClass = (id: string) => {
    setClasses(classes.filter((c) => c.id !== id));
  };

  const getClass = (id: string) => {
    return classes.find((c) => c.id === id);
  };

  const getClassesByLevel = (level: number) => {
    return classes.filter((c) => c.level === level);
  };

  const getClassesByProgram = (program: string) => {
    return classes.filter((c) => c.program === program);
  };

  const addStudentToClass = (classId: string, student: Omit<Student, 'id'>) => {
    setClasses(
      classes.map((c) => {
        if (c.id === classId) {
          const newStudent: Student = {
            ...student,
            id: Date.now().toString(),
          };
          return {
            ...c,
            students: [...c.students, newStudent],
            studentCount: c.studentCount + 1,
          };
        }
        return c;
      })
    );
  };

  const removeStudentFromClass = (classId: string, studentId: string) => {
    setClasses(
      classes.map((c) => {
        if (c.id === classId) {
          return {
            ...c,
            students: c.students.filter((s) => s.id !== studentId),
            studentCount: Math.max(0, c.studentCount - 1),
          };
        }
        return c;
      })
    );
  };

  return (
    <ClassContext.Provider
      value={{
        classes,
        addClass,
        updateClass,
        deleteClass,
        getClass,
        getClassesByLevel,
        getClassesByProgram,
        addStudentToClass,
        removeStudentFromClass,
      }}
    >
      {children}
    </ClassContext.Provider>
  );
};

export const useClasses = () => {
  const context = useContext(ClassContext);
  if (!context) {
    throw new Error('useClasses must be used within ClassProvider');
  }
  return context;
};