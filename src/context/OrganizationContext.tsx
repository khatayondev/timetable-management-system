import React, { createContext, useContext, useState, ReactNode } from 'react';

/**
 * Organizational hierarchy for multi-level timetable generation
 * Faculty > Department > Class
 */

export interface Department {
  id: string;
  name: string; // e.g., "Computer Science"
  code: string; // e.g., "CS"
  facultyId: string;
  facultyName: string;
  head?: string; // Lecturer ID
  contactEmail?: string;
}

export interface Faculty {
  id: string;
  name: string; // e.g., "Faculty of Applied Sciences"
  code: string; // e.g., "FAS"
  dean?: string; // Lecturer ID
  contactEmail?: string;
  departments: string[]; // Department IDs
}

interface OrganizationContextType {
  departments: Department[];
  faculties: Faculty[];
  
  // Department operations
  addDepartment: (department: Omit<Department, 'id'>) => void;
  updateDepartment: (id: string, department: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;
  getDepartment: (id: string) => Department | undefined;
  getDepartmentsByFaculty: (facultyId: string) => Department[];
  
  // Faculty operations
  addFaculty: (faculty: Omit<Faculty, 'id'>) => void;
  updateFaculty: (id: string, faculty: Partial<Faculty>) => void;
  deleteFaculty: (id: string) => void;
  getFaculty: (id: string) => Faculty | undefined;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

// Mock data
const mockFaculties: Faculty[] = [
  {
    id: 'fac-1',
    name: 'Faculty of Applied Sciences',
    code: 'FAS',
    dean: 'lec-1',
    contactEmail: 'dean.fas@university.edu',
    departments: ['dept-1', 'dept-2'],
  },
  {
    id: 'fac-2',
    name: 'Faculty of Engineering',
    code: 'FOE',
    dean: 'lec-2',
    contactEmail: 'dean.foe@university.edu',
    departments: ['dept-3', 'dept-4'],
  },
  {
    id: 'fac-3',
    name: 'Faculty of Computer Science',
    code: 'FCS',
    dean: 'lec-7',
    contactEmail: 'dean.fcs@university.edu',
    departments: ['dept-5'],
  },
  {
    id: 'fac-4',
    name: 'Faculty of Electrical Engineering',
    code: 'FEE',
    dean: 'lec-8',
    contactEmail: 'dean.fee@university.edu',
    departments: ['dept-6'],
  },
  {
    id: 'fac-5',
    name: 'Faculty of Mechanical Engineering',
    code: 'FME',
    dean: 'lec-9',
    contactEmail: 'dean.fme@university.edu',
    departments: ['dept-7'],
  },
  {
    id: 'fac-6',
    name: 'Faculty of Mathematics',
    code: 'FMATH',
    dean: 'lec-10',
    contactEmail: 'dean.fmath@university.edu',
    departments: ['dept-8'],
  },
];

const mockDepartments: Department[] = [
  {
    id: 'dept-1',
    name: 'Computer Science',
    code: 'CS',
    facultyId: 'fac-1',
    facultyName: 'Faculty of Applied Sciences',
    head: 'lec-3',
    contactEmail: 'cs.head@university.edu',
  },
  {
    id: 'dept-2',
    name: 'Mathematics',
    code: 'MATH',
    facultyId: 'fac-1',
    facultyName: 'Faculty of Applied Sciences',
    head: 'lec-4',
    contactEmail: 'math.head@university.edu',
  },
  {
    id: 'dept-3',
    name: 'Electrical Engineering',
    code: 'EE',
    facultyId: 'fac-2',
    facultyName: 'Faculty of Engineering',
    head: 'lec-5',
    contactEmail: 'ee.head@university.edu',
  },
  {
    id: 'dept-4',
    name: 'Mechanical Engineering',
    code: 'ME',
    facultyId: 'fac-2',
    facultyName: 'Faculty of Engineering',
    head: 'lec-6',
    contactEmail: 'me.head@university.edu',
  },
  {
    id: 'dept-5',
    name: 'Computer Science',
    code: 'CS',
    facultyId: 'fac-3',
    facultyName: 'Faculty of Computer Science',
    head: 'lec-3',
    contactEmail: 'cs.dept@university.edu',
  },
  {
    id: 'dept-6',
    name: 'Electrical Engineering',
    code: 'EE',
    facultyId: 'fac-4',
    facultyName: 'Faculty of Electrical Engineering',
    head: 'lec-5',
    contactEmail: 'ee.dept@university.edu',
  },
  {
    id: 'dept-7',
    name: 'Mechanical Engineering',
    code: 'ME',
    facultyId: 'fac-5',
    facultyName: 'Faculty of Mechanical Engineering',
    head: 'lec-6',
    contactEmail: 'me.dept@university.edu',
  },
  {
    id: 'dept-8',
    name: 'Mathematics',
    code: 'MATH',
    facultyId: 'fac-6',
    facultyName: 'Faculty of Mathematics',
    head: 'lec-4',
    contactEmail: 'math.dept@university.edu',
  },
];

export const OrganizationProvider = ({ children }: { children: ReactNode }) => {
  const [faculties, setFaculties] = useState<Faculty[]>(mockFaculties);
  const [departments, setDepartments] = useState<Department[]>(mockDepartments);

  // Department operations
  const addDepartment = (department: Omit<Department, 'id'>) => {
    const newDept: Department = {
      ...department,
      id: `dept-${Date.now()}`,
    };
    setDepartments([...departments, newDept]);
    
    // Add to faculty's department list
    setFaculties(faculties.map(f => 
      f.id === department.facultyId 
        ? { ...f, departments: [...f.departments, newDept.id] }
        : f
    ));
  };

  const updateDepartment = (id: string, department: Partial<Department>) => {
    setDepartments(departments.map(d => (d.id === id ? { ...d, ...department } : d)));
  };

  const deleteDepartment = (id: string) => {
    setDepartments(departments.filter(d => d.id !== id));
    
    // Remove from faculty's department list
    setFaculties(faculties.map(f => ({
      ...f,
      departments: f.departments.filter(deptId => deptId !== id),
    })));
  };

  const getDepartment = (id: string) => {
    return departments.find(d => d.id === id);
  };

  const getDepartmentsByFaculty = (facultyId: string) => {
    return departments.filter(d => d.facultyId === facultyId);
  };

  // Faculty operations
  const addFaculty = (faculty: Omit<Faculty, 'id'>) => {
    const newFaculty: Faculty = {
      ...faculty,
      id: `fac-${Date.now()}`,
    };
    setFaculties([...faculties, newFaculty]);
  };

  const updateFaculty = (id: string, faculty: Partial<Faculty>) => {
    setFaculties(faculties.map(f => (f.id === id ? { ...f, ...faculty } : f)));
  };

  const deleteFaculty = (id: string) => {
    setFaculties(faculties.filter(f => f.id !== id));
  };

  const getFaculty = (id: string) => {
    return faculties.find(f => f.id === id);
  };

  return (
    <OrganizationContext.Provider
      value={{
        departments,
        faculties,
        addDepartment,
        updateDepartment,
        deleteDepartment,
        getDepartment,
        getDepartmentsByFaculty,
        addFaculty,
        updateFaculty,
        deleteFaculty,
        getFaculty,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization must be used within OrganizationProvider');
  }
  return context;
};