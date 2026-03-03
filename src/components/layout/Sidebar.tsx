import React from 'react';
import { NavLink } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  BookOpen,
  Users,
  UsersRound,
  Calendar,
  CalendarCheck,
  CheckCircle,
  FileText,
  GraduationCap,
  Settings,
  Info,
  ClipboardList,
  X,
  ChevronDown,
  ChevronRight,
  CalendarDays,
  Shield,
  UserCog,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  roles: string[];
}

const Sidebar = ({ isOpen, onToggle }: SidebarProps) => {
  const { user } = useAuth();
  const [expandedSections, setExpandedSections] = React.useState<string[]>(['main']);

  const navItems: NavItem[] = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      roles: ['superadmin', 'admin', 'registry', 'lecturer', 'student'],
    },
    {
      name: 'Roles & Permissions',
      path: '/roles',
      icon: <UserCog className="w-5 h-5" />,
      roles: ['superadmin', 'admin'],
    },
    {
      name: 'Venues',
      path: '/venues',
      icon: <Building2 className="w-5 h-5" />,
      roles: ['superadmin', 'admin', 'registry'],
    },
    {
      name: 'Courses',
      path: '/courses',
      icon: <BookOpen className="w-5 h-5" />,
      roles: ['superadmin', 'admin', 'registry'],
    },
    {
      name: 'Classes & Lecturers',
      path: '/management/classes-and-lecturers',
      icon: <UsersRound className="w-5 h-5" />,
      roles: ['superadmin', 'admin', 'registry'],
    },
    {
      name: 'Approvals & Requests',
      path: '/approvals',
      icon: <CheckCircle className="w-5 h-5" />,
      roles: ['superadmin', 'admin', 'registry'],
    },
    {
      name: 'Teaching Timetable',
      path: '/timetable/teaching',
      icon: <Calendar className="w-5 h-5" />,
      roles: ['superadmin', 'lecturer'],
    },
    {
      name: 'Exam Timetable',
      path: '/timetable/exam',
      icon: <CalendarCheck className="w-5 h-5" />,
      roles: ['superadmin', 'lecturer', 'admin', 'registry'],
    },
    {
      name: 'Invigilator Scheduling',
      path: '/timetable/invigilator-scheduling',
      icon: <Users className="w-5 h-5" />,
      roles: ['superadmin', 'admin', 'registry'],
    },
    {
      name: 'My Requests',
      path: '/lecturers/change-requests',
      icon: <FileText className="w-5 h-5" />,
      roles: ['lecturer'],
    },
    {
      name: 'Reports',
      path: '/reports',
      icon: <FileText className="w-5 h-5" />,
      roles: ['superadmin', 'admin', 'registry'],
    },
    {
      name: 'My Timetable',
      path: '/student/timetable',
      icon: <GraduationCap className="w-5 h-5" />,
      roles: ['student'],
    },
    {
      name: 'Personal Study Timetable',
      path: '/student/study-planner',
      icon: <CalendarDays className="w-5 h-5" />,
      roles: ['student'],
    },
    {
      name: 'My Exams',
      path: '/student/exams',
      icon: <GraduationCap className="w-5 h-5" />,
      roles: ['student'],
    },
  ];

  const filteredNavItems = navItems.filter((item) => user && item.roles.includes(user.role));

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen bg-[#2F2E41] flex flex-col shadow-2xl z-40 transition-all duration-300 ease-in-out ${
          isOpen ? 'w-64' : 'w-20'
        } ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo Section */}
        <div className={`h-[72px] border-b border-white/10 flex items-center ${isOpen ? 'px-6' : 'justify-center px-4'} transition-all duration-300`}>
          <div className="w-10 h-10 bg-gradient-to-br from-[#5B5FFF] to-[#7C8FFF] rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          {isOpen && (
            <div className="ml-3 flex-1 min-w-0">
              <h1 className="text-white font-bold text-lg whitespace-nowrap overflow-hidden">
                TimeTable
              </h1>
              <p className="text-gray-400 text-xs whitespace-nowrap overflow-hidden">
                Management System
              </p>
            </div>
          )}
          {/* Mobile Close Button */}
          {isOpen && (
            <button
              onClick={onToggle}
              className="ml-auto lg:hidden w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all duration-200"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className={`flex-1 flex flex-col space-y-1 w-full overflow-y-auto ${isOpen ? 'px-3 py-4' : 'px-2 py-4'}`}>
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              title={item.name}
              onClick={() => {
                // Close sidebar on mobile when clicking a link
                if (window.innerWidth < 1024) {
                  onToggle();
                }
              }}
              className={({ isActive }) =>
                `flex items-center ${isOpen ? 'px-4 gap-3' : 'justify-center'} h-12 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-[#5B5FFF] text-white shadow-lg shadow-[#5B5FFF]/20'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {isOpen && (
                <span className="text-sm font-normal whitespace-nowrap overflow-hidden text-ellipsis">
                  {item.name}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Profile Card at Bottom */}
        <div className={`${isOpen ? 'p-4' : 'p-3'}`}>
          {isOpen ? (
            <div className="bg-[#3E3D52] rounded-xl p-4 flex items-center gap-3 hover:bg-[#4A4960] transition-all cursor-pointer group">
              <div className="w-10 h-10 bg-gradient-to-br from-[#5B5FFF] to-[#7C8FFF] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-sm">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email || user?.role}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </div>
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-[#5B5FFF] to-[#7C8FFF] rounded-full flex items-center justify-center mx-auto cursor-pointer">
              <span className="text-white font-semibold text-sm">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
