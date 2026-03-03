import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Lecturer {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  department: string;
  specialization: string[];
  availability: {
    [day: string]: { start: string; end: string; available: boolean }[];
  };
  maxHoursPerWeek: number;
  canInvigilate: boolean;
}

interface LecturerContextType {
  lecturers: Lecturer[];
  addLecturer: (lecturer: Omit<Lecturer, 'id'>) => void;
  updateLecturer: (id: string, lecturer: Partial<Lecturer>) => void;
  deleteLecturer: (id: string) => void;
  getLecturer: (id: string) => Lecturer | undefined;
}

const LecturerContext = createContext<LecturerContextType | undefined>(undefined);

// Mock data
const mockLecturers: Lecturer[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Smith',
    name: 'Dr. John Smith',
    email: 'john.smith@university.edu',
    department: 'Computer Science',
    specialization: ['Programming', 'Algorithms'],
    availability: {
      monday: [{ start: '08:00', end: '17:00', available: true }],
      tuesday: [{ start: '08:00', end: '17:00', available: true }],
      wednesday: [{ start: '08:00', end: '12:00', available: true }],
      thursday: [{ start: '08:00', end: '17:00', available: true }],
      friday: [{ start: '08:00', end: '17:00', available: true }],
    },
    maxHoursPerWeek: 20,
    canInvigilate: true,
  },
  {
    id: '2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    name: 'Prof. Sarah Johnson',
    email: 'sarah.johnson@university.edu',
    department: 'Computer Science',
    specialization: ['Data Structures', 'Machine Learning'],
    availability: {
      monday: [{ start: '08:00', end: '17:00', available: true }],
      tuesday: [{ start: '08:00', end: '17:00', available: true }],
      wednesday: [{ start: '08:00', end: '17:00', available: true }],
      thursday: [{ start: '08:00', end: '17:00', available: true }],
      friday: [{ start: '08:00', end: '15:00', available: true }],
    },
    maxHoursPerWeek: 18,
    canInvigilate: true,
  },
  {
    id: '3',
    firstName: 'Michael',
    lastName: 'Chen',
    name: 'Dr. Michael Chen',
    email: 'michael.chen@university.edu',
    department: 'Mathematics',
    specialization: ['Calculus', 'Linear Algebra'],
    availability: {
      monday: [{ start: '09:00', end: '17:00', available: true }],
      tuesday: [{ start: '09:00', end: '17:00', available: true }],
      wednesday: [{ start: '09:00', end: '17:00', available: true }],
      thursday: [{ start: '09:00', end: '17:00', available: true }],
      friday: [{ start: '09:00', end: '17:00', available: true }],
    },
    maxHoursPerWeek: 16,
    canInvigilate: false,
  },
];

export const LecturerProvider = ({ children }: { children: ReactNode }) => {
  const [lecturers, setLecturers] = useState<Lecturer[]>(mockLecturers);

  const addLecturer = (lecturer: Omit<Lecturer, 'id'>) => {
    const newLecturer: Lecturer = {
      ...lecturer,
      id: Date.now().toString(),
    };
    setLecturers([...lecturers, newLecturer]);
  };

  const updateLecturer = (id: string, updatedLecturer: Partial<Lecturer>) => {
    setLecturers(lecturers.map((l) => (l.id === id ? { ...l, ...updatedLecturer } : l)));
  };

  const deleteLecturer = (id: string) => {
    setLecturers(lecturers.filter((l) => l.id !== id));
  };

  const getLecturer = (id: string) => {
    return lecturers.find((l) => l.id === id);
  };

  return (
    <LecturerContext.Provider value={{ lecturers, addLecturer, updateLecturer, deleteLecturer, getLecturer }}>
      {children}
    </LecturerContext.Provider>
  );
};

export const useLecturers = () => {
  const context = useContext(LecturerContext);
  if (!context) {
    throw new Error('useLecturers must be used within LecturerProvider');
  }
  return context;
};