import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ApprovalStatus = 'draft' | 'submitted' | 'reviewed' | 'approved' | 'rejected' | 'published';

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
}

export interface AuditLog {
  id: string;
  action: string;
  userId: string;
  userName: string;
  timestamp: string;
  details: string;
}

export interface Approval {
  id: string;
  timetableId: string;
  timetableName: string;
  type: 'teaching' | 'exam';
  status: ApprovalStatus;
  submittedBy: string;
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  comments: Comment[];
  auditLogs: AuditLog[];
}

interface ApprovalContextType {
  approvals: Approval[];
  addApproval: (approval: Omit<Approval, 'id'>) => void;
  updateApprovalStatus: (id: string, status: ApprovalStatus, userId: string, userName: string) => void;
  addComment: (approvalId: string, comment: Omit<Comment, 'id' | 'timestamp'>) => void;
  getApproval: (id: string) => Approval | undefined;
}

const ApprovalContext = createContext<ApprovalContextType | undefined>(undefined);

// Mock data
const mockApprovals: Approval[] = [
  {
    id: '1',
    timetableId: '1',
    timetableName: 'Semester 1 Teaching Timetable',
    type: 'teaching',
    status: 'approved',
    submittedBy: 'faculty@university.edu',
    submittedAt: '2026-01-08T10:00:00Z',
    reviewedBy: 'registry@university.edu',
    reviewedAt: '2026-01-09T14:00:00Z',
    approvedBy: 'admin@university.edu',
    approvedAt: '2026-01-10T09:00:00Z',
    comments: [
      {
        id: 'c1',
        userId: '1',
        userName: 'Registry Admin',
        message: 'Please review the conflict in LH-A on Monday morning',
        timestamp: '2026-01-09T10:30:00Z',
      },
      {
        id: 'c2',
        userId: '2',
        userName: 'Faculty Admin',
        message: 'Conflict resolved by moving CS101 to LH-B',
        timestamp: '2026-01-09T13:00:00Z',
      },
    ],
    auditLogs: [
      {
        id: 'a1',
        action: 'Created',
        userId: '2',
        userName: 'Faculty Admin',
        timestamp: '2026-01-08T09:00:00Z',
        details: 'Timetable draft created',
      },
      {
        id: 'a2',
        action: 'Submitted',
        userId: '2',
        userName: 'Faculty Admin',
        timestamp: '2026-01-08T10:00:00Z',
        details: 'Submitted for review',
      },
      {
        id: 'a3',
        action: 'Reviewed',
        userId: '1',
        userName: 'Registry Admin',
        timestamp: '2026-01-09T14:00:00Z',
        details: 'Reviewed and forwarded for approval',
      },
      {
        id: 'a4',
        action: 'Approved',
        userId: '0',
        userName: 'System Admin',
        timestamp: '2026-01-10T09:00:00Z',
        details: 'Timetable approved',
      },
    ],
  },
  {
    id: '2',
    timetableId: '2',
    timetableName: 'Semester 1 Exam Timetable',
    type: 'exam',
    status: 'submitted',
    submittedBy: 'faculty@university.edu',
    submittedAt: '2026-01-14T11:00:00Z',
    comments: [],
    auditLogs: [
      {
        id: 'a5',
        action: 'Created',
        userId: '2',
        userName: 'Faculty Admin',
        timestamp: '2026-01-13T15:00:00Z',
        details: 'Exam timetable draft created',
      },
      {
        id: 'a6',
        action: 'Submitted',
        userId: '2',
        userName: 'Faculty Admin',
        timestamp: '2026-01-14T11:00:00Z',
        details: 'Submitted for review',
      },
    ],
  },
];

export const ApprovalProvider = ({ children }: { children: ReactNode }) => {
  const [approvals, setApprovals] = useState<Approval[]>(mockApprovals);

  const addApproval = (approval: Omit<Approval, 'id'>) => {
    const newApproval: Approval = {
      ...approval,
      id: Date.now().toString(),
    };
    setApprovals([...approvals, newApproval]);
  };

  const updateApprovalStatus = (id: string, status: ApprovalStatus, userId: string, userName: string) => {
    setApprovals(
      approvals.map((a) => {
        if (a.id === id) {
          const timestamp = new Date().toISOString();
          const newAuditLog: AuditLog = {
            id: Date.now().toString(),
            action: status.charAt(0).toUpperCase() + status.slice(1),
            userId,
            userName,
            timestamp,
            details: `Status changed to ${status}`,
          };

          return {
            ...a,
            status,
            auditLogs: [...a.auditLogs, newAuditLog],
          };
        }
        return a;
      })
    );
  };

  const addComment = (approvalId: string, comment: Omit<Comment, 'id' | 'timestamp'>) => {
    setApprovals(
      approvals.map((a) => {
        if (a.id === approvalId) {
          const newComment: Comment = {
            ...comment,
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
          };
          return {
            ...a,
            comments: [...a.comments, newComment],
          };
        }
        return a;
      })
    );
  };

  const getApproval = (id: string) => {
    return approvals.find((a) => a.id === id);
  };

  return (
    <ApprovalContext.Provider value={{ approvals, addApproval, updateApprovalStatus, addComment, getApproval }}>
      {children}
    </ApprovalContext.Provider>
  );
};

export const useApprovals = () => {
  const context = useContext(ApprovalContext);
  if (!context) {
    throw new Error('useApprovals must be used within ApprovalProvider');
  }
  return context;
};
