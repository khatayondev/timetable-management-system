import React, { createContext, useContext, useState, ReactNode } from 'react';

// Extended role type for user management (includes more granular roles)
export type SystemUserRole = 'superadmin' | 'admin' | 'registry' | 'lecturer' | 'student';

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: SystemUserRole;
  department?: string;
  assignedBy?: string;
  assignedDate?: string;
  status: 'active' | 'inactive' | 'pending';
  permissions?: string[];
}

interface UserManagementContextType {
  users: SystemUser[];
  addUser: (user: Omit<SystemUser, 'id'>) => void;
  updateUser: (id: string, user: Partial<SystemUser>) => void;
  deleteUser: (id: string) => void;
  getUser: (id: string) => SystemUser | undefined;
  assignRole: (userId: string, role: SystemUserRole, assignedBy: string) => void;
  getUsersByRole: (role: SystemUserRole) => SystemUser[];
  getUsersByDepartment: (department: string) => SystemUser[];
}

const UserManagementContext = createContext<UserManagementContextType | undefined>(undefined);

// Mock data - system users with roles
const mockUsers: SystemUser[] = [
  {
    id: '1',
    name: 'Dr. John Smith',
    email: 'john.smith@university.edu',
    role: 'lecturer',
    department: 'Computer Science',
    assignedBy: 'Super Admin',
    assignedDate: '2024-01-15',
    status: 'active',
    permissions: ['view_timetable', 'submit_change_request'],
  },
  {
    id: '2',
    name: 'Prof. Sarah Johnson',
    email: 'sarah.johnson@university.edu',
    role: 'lecturer',
    department: 'Computer Science',
    assignedBy: 'Super Admin',
    assignedDate: '2024-01-10',
    status: 'active',
    permissions: ['view_timetable', 'submit_change_request'],
  },
  {
    id: '3',
    name: 'Dr. Michael Brown',
    email: 'michael.brown@university.edu',
    role: 'superadmin',
    department: 'Computer Science',
    assignedBy: 'System',
    assignedDate: '2024-02-01',
    status: 'active',
    permissions: ['manage_courses', 'manage_lecturers', 'view_timetable', 'approve_requests', 'manage_all'],
  },
  {
    id: '4',
    name: 'Jane Cooper',
    email: 'jane.cooper@university.edu',
    role: 'registry',
    department: 'Academic Affairs',
    assignedBy: 'Super Admin',
    assignedDate: '2024-01-05',
    status: 'active',
    permissions: ['manage_venues', 'manage_courses', 'manage_timetable', 'generate_reports'],
  },
  {
    id: '5',
    name: 'Robert Lee',
    email: 'robert.lee@university.edu',
    role: 'lecturer',
    department: 'Mathematics',
    assignedBy: 'Admin',
    assignedDate: '2024-01-20',
    status: 'active',
    permissions: ['view_timetable', 'submit_change_request'],
  },
  {
    id: '6',
    name: 'Emily Davis',
    email: 'emily.davis@university.edu',
    role: 'lecturer',
    department: 'Computer Science',
    assignedBy: 'Faculty',
    assignedDate: '2024-02-10',
    status: 'pending',
    permissions: ['view_timetable'],
  },
  {
    id: '7',
    name: 'David Wilson',
    email: 'david.wilson@university.edu',
    role: 'student',
    department: 'Computer Science',
    assignedBy: 'Registry',
    assignedDate: '2024-01-25',
    status: 'active',
    permissions: ['view_own_timetable', 'view_exam_schedule'],
  },
];

export const UserManagementProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<SystemUser[]>(mockUsers);

  const addUser = (user: Omit<SystemUser, 'id'>) => {
    const newUser: SystemUser = {
      ...user,
      id: Date.now().toString(),
    };
    setUsers([...users, newUser]);
  };

  const updateUser = (id: string, updatedUser: Partial<SystemUser>) => {
    setUsers(users.map(user => user.id === id ? { ...user, ...updatedUser } : user));
  };

  const deleteUser = (id: string) => {
    setUsers(users.filter(user => user.id !== id));
  };

  const getUser = (id: string) => {
    return users.find(user => user.id === id);
  };

  const assignRole = (userId: string, role: SystemUserRole, assignedBy: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { 
            ...user, 
            role, 
            assignedBy, 
            assignedDate: new Date().toISOString().split('T')[0],
            status: 'active'
          } 
        : user
    ));
  };

  const getUsersByRole = (role: SystemUserRole) => {
    return users.filter(user => user.role === role);
  };

  const getUsersByDepartment = (department: string) => {
    return users.filter(user => user.department === department);
  };

  return (
    <UserManagementContext.Provider
      value={{
        users,
        addUser,
        updateUser,
        deleteUser,
        getUser,
        assignRole,
        getUsersByRole,
        getUsersByDepartment,
      }}
    >
      {children}
    </UserManagementContext.Provider>
  );
};

export const useUserManagement = () => {
  const context = useContext(UserManagementContext);
  if (!context) {
    throw new Error('useUserManagement must be used within UserManagementProvider');
  }
  return context;
};