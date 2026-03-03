import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface InvigilationAssignment {
  id: string;
  examSessionId: string;
  lecturerId: string;
  lecturerName: string;
  venueId: string;
  venueName: string;
  date: string;
  startTime: string;
  endTime: string;
  role: 'chief' | 'assistant';
  status: 'pending' | 'confirmed' | 'declined';
}

export interface InvigilationRoster {
  id: string;
  examPeriod: string;
  academicYear: string;
  semester: number;
  assignments: InvigilationAssignment[];
  generatedDate: string;
  approvedBy?: string;
  approvalDate?: string;
}

interface InvigilationContextType {
  rosters: InvigilationRoster[];
  assignments: InvigilationAssignment[];
  createRoster: (roster: Omit<InvigilationRoster, 'id' | 'generatedDate'>) => void;
  addAssignment: (assignment: Omit<InvigilationAssignment, 'id'>) => void;
  updateAssignment: (id: string, assignment: Partial<InvigilationAssignment>) => void;
  deleteAssignment: (id: string) => void;
  getAssignmentsByLecturer: (lecturerId: string) => InvigilationAssignment[];
  getAssignmentsByDate: (date: string) => InvigilationAssignment[];
  approveRoster: (rosterId: string, approvedBy: string) => void;
  autoGenerateInvigilationRoster: (examSessionIds: string[]) => void;
}

const InvigilationContext = createContext<InvigilationContextType | undefined>(undefined);

// Mock data
const mockAssignments: InvigilationAssignment[] = [
  {
    id: '1',
    examSessionId: 'exam-1',
    lecturerId: '2',
    lecturerName: 'Prof. Ama Mensah',
    venueId: '5',
    venueName: 'Exam Hall EH-01',
    date: '2024-12-10',
    startTime: '09:00',
    endTime: '12:00',
    role: 'chief',
    status: 'confirmed',
  },
  {
    id: '2',
    examSessionId: 'exam-1',
    lecturerId: '3',
    lecturerName: 'Dr. Kwame Asante',
    venueId: '5',
    venueName: 'Exam Hall EH-01',
    date: '2024-12-10',
    startTime: '09:00',
    endTime: '12:00',
    role: 'assistant',
    status: 'confirmed',
  },
  {
    id: '3',
    examSessionId: 'exam-2',
    lecturerId: '4',
    lecturerName: 'Eng. Joseph Osei',
    venueId: '2',
    venueName: 'Computer Lab V12',
    date: '2024-12-12',
    startTime: '14:00',
    endTime: '17:00',
    role: 'chief',
    status: 'pending',
  },
];

const mockRosters: InvigilationRoster[] = [
  {
    id: '1',
    examPeriod: 'End of Semester 1 Exams',
    academicYear: '2023/2024',
    semester: 1,
    assignments: mockAssignments,
    generatedDate: '2024-11-15',
    approvedBy: 'Dr. Registry Head',
    approvalDate: '2024-11-16',
  },
];

export const InvigilationProvider = ({ children }: { children: ReactNode }) => {
  const [rosters, setRosters] = useState<InvigilationRoster[]>(mockRosters);
  const [assignments, setAssignments] = useState<InvigilationAssignment[]>(mockAssignments);

  const createRoster = (roster: Omit<InvigilationRoster, 'id' | 'generatedDate'>) => {
    const newRoster: InvigilationRoster = {
      ...roster,
      id: Date.now().toString(),
      generatedDate: new Date().toISOString().split('T')[0],
    };
    setRosters([...rosters, newRoster]);
  };

  const addAssignment = (assignment: Omit<InvigilationAssignment, 'id'>) => {
    const newAssignment: InvigilationAssignment = {
      ...assignment,
      id: Date.now().toString(),
    };
    setAssignments([...assignments, newAssignment]);
  };

  const updateAssignment = (id: string, updatedAssignment: Partial<InvigilationAssignment>) => {
    setAssignments(assignments.map((a) => (a.id === id ? { ...a, ...updatedAssignment } : a)));
  };

  const deleteAssignment = (id: string) => {
    setAssignments(assignments.filter((a) => a.id !== id));
  };

  const getAssignmentsByLecturer = (lecturerId: string) => {
    return assignments.filter((a) => a.lecturerId === lecturerId);
  };

  const getAssignmentsByDate = (date: string) => {
    return assignments.filter((a) => a.date === date);
  };

  const approveRoster = (rosterId: string, approvedBy: string) => {
    setRosters(
      rosters.map((r) =>
        r.id === rosterId
          ? {
              ...r,
              approvedBy,
              approvalDate: new Date().toISOString().split('T')[0],
            }
          : r
      )
    );
  };

  const autoGenerateInvigilationRoster = (examSessionIds: string[]) => {
    // This is a placeholder for the auto-generation logic
    // In a real system, this would use the constraint solver
    console.log('Auto-generating invigilation roster for sessions:', examSessionIds);
    
    // Mock implementation: assign random lecturers
    const newAssignments: InvigilationAssignment[] = [];
    examSessionIds.forEach((sessionId, index) => {
      newAssignments.push({
        id: `auto-${Date.now()}-${index}`,
        examSessionId: sessionId,
        lecturerId: `${index + 1}`,
        lecturerName: `Lecturer ${index + 1}`,
        venueId: `${index + 1}`,
        venueName: `Venue ${index + 1}`,
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '12:00',
        role: index % 2 === 0 ? 'chief' : 'assistant',
        status: 'pending',
      });
    });
    
    setAssignments([...assignments, ...newAssignments]);
  };

  return (
    <InvigilationContext.Provider
      value={{
        rosters,
        assignments,
        createRoster,
        addAssignment,
        updateAssignment,
        deleteAssignment,
        getAssignmentsByLecturer,
        getAssignmentsByDate,
        approveRoster,
        autoGenerateInvigilationRoster,
      }}
    >
      {children}
    </InvigilationContext.Provider>
  );
};

export const useInvigilation = () => {
  const context = useContext(InvigilationContext);
  if (!context) {
    throw new Error('useInvigilation must be used within InvigilationProvider');
  }
  return context;
};
