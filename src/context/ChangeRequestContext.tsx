import React, { createContext, useContext, useState, ReactNode } from 'react';
import { TeachingSession, ExamSession } from './TimetableContext';
import { TeachingConstraintSolver, ExamConstraintSolver } from '../utils/constraintSolver';

export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'auto_rejected';
export type ConflictResult = 'no_conflict' | 'soft_conflict' | 'hard_conflict';

export interface TimetableChangeRequest {
  id: string;
  requestType: 'teaching' | 'exam';
  sessionId: string;
  lecturerId: string;
  lecturerName: string;
  timetableId: string;
  
  // Original session data
  originalSession: TeachingSession | ExamSession;
  
  // Requested changes
  requestedChanges: Partial<TeachingSession> | Partial<ExamSession>;
  
  justification: string;
  attachments?: string[]; // URLs to supporting documents
  
  // Status tracking
  status: RequestStatus;
  solverResult: ConflictResult;
  conflictDetails?: string[];
  
  // Timestamps
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  adminNotes?: string;
}

interface ChangeRequestContextType {
  changeRequests: TimetableChangeRequest[];
  
  // CRUD operations
  submitChangeRequest: (request: Omit<TimetableChangeRequest, 'id' | 'status' | 'solverResult' | 'createdAt'>) => Promise<{
    success: boolean;
    requestId?: string;
    solverResult: ConflictResult;
    conflictDetails?: string[];
  }>;
  
  approveChangeRequest: (requestId: string, adminId: string, notes?: string) => void;
  rejectChangeRequest: (requestId: string, adminId: string, notes?: string) => void;
  
  // Queries
  getChangeRequest: (id: string) => TimetableChangeRequest | undefined;
  getPendingRequests: () => TimetableChangeRequest[];
  getLecturerRequests: (lecturerId: string) => TimetableChangeRequest[];
  
  // Statistics
  getRequestStats: () => {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    autoRejected: number;
  };
}

const ChangeRequestContext = createContext<ChangeRequestContextType | undefined>(undefined);

// Mock data
const mockChangeRequests: TimetableChangeRequest[] = [
  {
    id: 'cr-1',
    requestType: 'teaching',
    sessionId: 'ts-1',
    lecturerId: '1',
    lecturerName: 'Dr. Samuel Owusu',
    timetableId: '1',
    originalSession: {
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
    } as TeachingSession,
    requestedChanges: {
      day: 'tuesday',
      startTime: '14:00',
      endTime: '16:00',
    },
    justification: 'I have a medical appointment on Monday mornings. Would like to shift this lecture to Tuesday afternoon.',
    status: 'pending',
    solverResult: 'no_conflict',
    createdAt: '2024-01-15T09:30:00Z',
  },
  {
    id: 'cr-2',
    requestType: 'teaching',
    sessionId: 'ts-3',
    lecturerId: '2',
    lecturerName: 'Prof. Ama Mensah',
    timetableId: '1',
    originalSession: {
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
    } as TeachingSession,
    requestedChanges: {
      venueId: '3',
      venueName: 'Auditorium B',
    },
    justification: 'The class size has grown. Need a larger venue with better audio equipment.',
    status: 'approved',
    solverResult: 'no_conflict',
    createdAt: '2024-01-10T14:20:00Z',
    resolvedAt: '2024-01-12T10:15:00Z',
    resolvedBy: 'Admin User',
    adminNotes: 'Approved. Venue change confirmed with facilities.',
  },
];

export const ChangeRequestProvider = ({ children }: { children: ReactNode }) => {
  const [changeRequests, setChangeRequests] = useState<TimetableChangeRequest[]>(mockChangeRequests);

  const submitChangeRequest = async (
    request: Omit<TimetableChangeRequest, 'id' | 'status' | 'solverResult' | 'createdAt'>
  ): Promise<{
    success: boolean;
    requestId?: string;
    solverResult: ConflictResult;
    conflictDetails?: string[];
  }> => {
    // Run constraint solver on the requested changes
    const solverResult = runConstraintCheck(request);
    
    // Auto-reject if hard conflict
    if (solverResult.result === 'hard_conflict') {
      const autoRejectedRequest: TimetableChangeRequest = {
        ...request,
        id: `cr-${Date.now()}`,
        status: 'auto_rejected',
        solverResult: solverResult.result,
        conflictDetails: solverResult.conflicts,
        createdAt: new Date().toISOString(),
      };
      
      setChangeRequests([...changeRequests, autoRejectedRequest]);
      
      return {
        success: false,
        requestId: autoRejectedRequest.id,
        solverResult: solverResult.result,
        conflictDetails: solverResult.conflicts,
      };
    }
    
    // Create pending request for admin review
    const newRequest: TimetableChangeRequest = {
      ...request,
      id: `cr-${Date.now()}`,
      status: 'pending',
      solverResult: solverResult.result,
      conflictDetails: solverResult.conflicts,
      createdAt: new Date().toISOString(),
    };
    
    setChangeRequests([...changeRequests, newRequest]);
    
    return {
      success: true,
      requestId: newRequest.id,
      solverResult: solverResult.result,
      conflictDetails: solverResult.conflicts,
    };
  };

  const approveChangeRequest = (requestId: string, adminId: string, notes?: string) => {
    setChangeRequests(
      changeRequests.map((req) =>
        req.id === requestId
          ? {
              ...req,
              status: 'approved' as RequestStatus,
              resolvedAt: new Date().toISOString(),
              resolvedBy: adminId,
              adminNotes: notes,
            }
          : req
      )
    );
  };

  const rejectChangeRequest = (requestId: string, adminId: string, notes?: string) => {
    setChangeRequests(
      changeRequests.map((req) =>
        req.id === requestId
          ? {
              ...req,
              status: 'rejected' as RequestStatus,
              resolvedAt: new Date().toISOString(),
              resolvedBy: adminId,
              adminNotes: notes,
            }
          : req
      )
    );
  };

  const getChangeRequest = (id: string) => {
    return changeRequests.find((req) => req.id === id);
  };

  const getPendingRequests = () => {
    return changeRequests.filter((req) => req.status === 'pending');
  };

  const getLecturerRequests = (lecturerId: string) => {
    return changeRequests.filter((req) => req.lecturerId === lecturerId);
  };

  const getRequestStats = () => {
    return {
      total: changeRequests.length,
      pending: changeRequests.filter((r) => r.status === 'pending').length,
      approved: changeRequests.filter((r) => r.status === 'approved').length,
      rejected: changeRequests.filter((r) => r.status === 'rejected').length,
      autoRejected: changeRequests.filter((r) => r.status === 'auto_rejected').length,
    };
  };

  return (
    <ChangeRequestContext.Provider
      value={{
        changeRequests,
        submitChangeRequest,
        approveChangeRequest,
        rejectChangeRequest,
        getChangeRequest,
        getPendingRequests,
        getLecturerRequests,
        getRequestStats,
      }}
    >
      {children}
    </ChangeRequestContext.Provider>
  );
};

export const useChangeRequests = () => {
  const context = useContext(ChangeRequestContext);
  if (!context) {
    throw new Error('useChangeRequests must be used within ChangeRequestProvider');
  }
  return context;
};

/**
 * Run constraint check on proposed changes
 */
function runConstraintCheck(
  request: Omit<TimetableChangeRequest, 'id' | 'status' | 'solverResult' | 'createdAt'>
): { result: ConflictResult; conflicts: string[] } {
  const conflicts: string[] = [];
  
  // For teaching sessions
  if (request.requestType === 'teaching') {
    const original = request.originalSession as TeachingSession;
    const changes = request.requestedChanges as Partial<TeachingSession>;
    
    // Create merged session with changes
    const proposedSession = { ...original, ...changes };
    
    // Check day/time changes
    if (changes.day || changes.startTime || changes.endTime) {
      // In a real implementation, we would check against all other sessions
      // For now, simulate basic checks
      
      if (changes.day === 'friday' && changes.startTime && changes.startTime > '16:00') {
        conflicts.push('Friday evening slots (after 4 PM) are typically not preferred for lectures');
      }
    }
    
    // Check venue changes
    if (changes.venueId) {
      // Simulate venue capacity check
      // In real implementation, fetch venue details and compare capacity
      conflicts.push('Verify new venue has adequate capacity');
    }
  }
  
  // For exam sessions
  if (request.requestType === 'exam') {
    const changes = request.requestedChanges as Partial<ExamSession>;
    
    if (changes.date) {
      // Check for conflicts with other exams
      conflicts.push('Verify no conflict with other exams on the same date');
    }
    
    if (changes.venueAllocations) {
      conflicts.push('Verify new venue allocations have sufficient capacity');
    }
  }
  
  // Determine result based on conflicts
  if (conflicts.some(c => c.includes('HARD CONFLICT') || c.includes('cannot'))) {
    return { result: 'hard_conflict', conflicts };
  }
  
  if (conflicts.length > 0) {
    return { result: 'soft_conflict', conflicts };
  }
  
  return { result: 'no_conflict', conflicts: [] };
}
