import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'superadmin' | 'admin' | 'lecturer' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    // Mock login - in real app, this would call an API
    // Determine role based on email for demo purposes
    let role: UserRole = 'student';
    if (email.includes('superadmin')) role = 'superadmin';
    else if (email.includes('admin')) role = 'admin';
    else if (email.includes('department') || email.includes('registry') || email.includes('faculty')) role = 'superadmin';
    else if (email.includes('lecturer')) role = 'lecturer';

    const mockUser: User = {
      id: '1',
      name: email.split('@')[0],
      email,
      role,
      department: role === 'superadmin' || role === 'lecturer' ? 'Computer Science' : undefined,
    };

    setUser(mockUser);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};