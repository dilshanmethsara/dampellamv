import React, { ReactNode } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { cn } from '../lib/utils';

type SidebarNavItem = {
  path: string;
  icon: string;
  label: string;
};

const studentNav: SidebarNavItem[] = [
  { path: '/dashboard/student', icon: 'dashboard', label: 'Dashboard' },
  { path: '/dashboard/student/courses', icon: 'school', label: 'My Courses' },
  { path: '/dashboard/student/assignments', icon: 'assignment', label: 'Assignments' },
  { path: '/dashboard/student/schedule', icon: 'calendar_today', label: 'Schedule' },
  { path: '/dashboard/student/reports', icon: 'analytics', label: 'Reports' },
];

const teacherNav: SidebarNavItem[] = [
  { path: '/dashboard/teacher', icon: 'dashboard', label: 'Dashboard' },
  { path: '/dashboard/teacher/courses', icon: 'school', label: 'My Courses' },
  { path: '/dashboard/teacher/assignments', icon: 'assignment', label: 'Assignments' },
  { path: '/dashboard/teacher/schedule', icon: 'calendar_today', label: 'Schedule' },
  { path: '/dashboard/teacher/reports', icon: 'analytics', label: 'Reports' },
];

interface DashboardLayoutProps {
  children: ReactNode;
  role: 'student' | 'teacher' | 'admin';
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const nav = role === 'student' ? studentNav : role === 'teacher' ? teacherNav : studentNav;

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface">
      {/* Sidebar Navigation Shell */}
      <aside className="fixed h-screen left-0 top-0 w-64 bg-slate-50 hidden md:flex flex-col p-4 gap-2 z-50">
        <div className="flex items-center gap-3 px-4 py-6 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
          </div>
          <div>
            <h1 className="text-lg font-black text-indigo-950 leading-none font-headline">Atelier LMS</h1>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Management Suite</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {nav.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                isActive 
                  ? "bg-indigo-50 text-indigo-700 shadow-[0_0_15px_rgba(49,46,129,0.1)] font-bold font-headline" 
                  : "text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50"
              )}
            >
              <span 
                className="material-symbols-outlined" 
                style={{ fontVariationSettings: "'FILL' 0" }}
              >
                {item.icon}
              </span>
              <span className="text-sm font-medium tracking-tight">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-1 pt-4 border-t border-slate-100">
          <button className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-br from-primary to-primary-container text-white rounded-xl font-bold text-sm shadow-md active:scale-95 transition-all mb-4">
            <span className="material-symbols-outlined text-sm">add</span>
            New {role === 'teacher' ? 'Course' : 'Application'}
          </button>
          
          <button className="flex items-center gap-3 px-4 py-3 w-full text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-xl transition-all">
            <span className="material-symbols-outlined">settings</span>
            <span className="text-sm font-medium tracking-tight">Settings</span>
          </button>
          <Link to="/" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-xl transition-all">
            <span className="material-symbols-outlined">help</span>
            <span className="text-sm font-medium tracking-tight">Support</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <main className="md:ml-64 min-h-screen flex flex-col">
        {/* Top Bar Shell */}
        <header className="sticky top-0 z-40 w-full h-16 flex justify-between items-center px-8 bg-white/70 backdrop-blur-xl shadow-sm">
          <div className="flex items-center gap-4 flex-1">
            <div className="max-w-md w-full relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
              <input 
                placeholder="Search students, courses, or files..." 
                className="w-full pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-xl text-sm focus:ring-2 focus:ring-secondary/20 transition-all placeholder:text-slate-400 outline-none"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-slate-600 hover:bg-slate-100/50 rounded-lg transition-colors">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full border-2 border-white" />
            </button>
            
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-indigo-950 leading-none">Alexander Pierce</p>
                <p className="text-[10px] text-slate-500 font-medium font-headline uppercase tracking-wider">Level 4 Student</p>
              </div>
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${role}`} 
                className="w-10 h-10 rounded-xl object-cover shadow-sm ring-2 ring-transparent group-hover:ring-indigo-100 transition-all"
                alt="User"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </header>

        {/* Dashboard Canvas */}
        <div className="flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation (Responsive Pivot) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-xl border-t border-slate-100 flex items-center justify-around px-6 z-50">
        {nav.slice(0, 4).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex flex-col items-center gap-1",
              isActive ? "text-indigo-600" : "text-slate-400"
            )}
          >
            {({ isActive }) => (
              <>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : undefined }}>{item.icon}</span>
                <span className="text-[10px] font-bold">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
