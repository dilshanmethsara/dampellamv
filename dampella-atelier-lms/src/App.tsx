import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import RegisterVerify from './pages/RegisterVerify';
import DashboardLayout from './components/DashboardLayout';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Placeholder components for other views
const Placeholder = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-12 bg-white rounded-[3rem] border border-surface-container shadow-sm">
    <div className="w-24 h-24 bg-surface-container rounded-full mb-6 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
    <h1 className="text-2xl font-bold text-primary mb-2">{title}</h1>
    <p className="text-outline max-w-sm">This space is currently being curated by our artisan developers. Check back soon for the full experience.</p>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register/verify" element={<RegisterVerify />} />
        
        {/* Student Routes */}
        <Route path="/dashboard/student" element={
          <DashboardLayout role="student">
            <StudentDashboard />
          </DashboardLayout>
        } />
        <Route path="/dashboard/student/courses" element={
          <DashboardLayout role="student">
            <Placeholder title="Your Courses" />
          </DashboardLayout>
        } />
        <Route path="/dashboard/student/sessions" element={
          <DashboardLayout role="student">
            <Placeholder title="Live Learning" />
          </DashboardLayout>
        } />
        <Route path="/dashboard/student/history" element={
          <DashboardLayout role="student">
            <Placeholder title="Learning History" />
          </DashboardLayout>
        } />
        <Route path="/dashboard/student/achievements" element={
          <DashboardLayout role="student">
            <Placeholder title="Your Awards" />
          </DashboardLayout>
        } />

        {/* Teacher Routes */}
        <Route path="/dashboard/teacher" element={
          <DashboardLayout role="teacher">
            <TeacherDashboard />
          </DashboardLayout>
        } />
        <Route path="/dashboard/teacher/courses" element={
          <DashboardLayout role="teacher">
            <Placeholder title="Course Management" />
          </DashboardLayout>
        } />
        <Route path="/dashboard/teacher/students" element={
          <DashboardLayout role="teacher">
            <Placeholder title="Student Insights" />
          </DashboardLayout>
        } />
        <Route path="/dashboard/teacher/revenue" element={
          <DashboardLayout role="teacher">
            <Placeholder title="Performance Analytics" />
          </DashboardLayout>
        } />

        {/* Admin Routes */}
        <Route path="/dashboard/admin" element={
          <DashboardLayout role="admin">
            <AdminDashboard />
          </DashboardLayout>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
