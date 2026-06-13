import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import OfflineIndicator from './components/OfflineIndicator';
import ThemeProvider from './context/ThemeProvider';
import LoginView from './views/auth/LoginView';
import RegisterView from './views/auth/RegisterView';

// Lazy loading para optimizar el bundle inicial
const TeacherLayout = lazy(() => import('./layouts/TeacherLayout'));
const TeacherDashboard = lazy(() => import('./views/teacher/TeacherDashboard'));
const TeacherClasses = lazy(() => import('./views/teacher/TeacherClasses'));
const TeacherLibrary = lazy(() => import('./views/teacher/TeacherLibrary'));
const TeacherReports = lazy(() => import('./views/teacher/TeacherReports'));
const TeacherConfig = lazy(() => import('./views/teacher/TeacherConfig'));

const StudentLayout = lazy(() => import('./layouts/StudentLayout'));
const StudentDashboard = lazy(() => import('./views/student/StudentDashboard'));
const StudentLibrary = lazy(() => import('./views/student/StudentLibrary'));
const StudentReadingWrapper = lazy(() => import('./views/student/StudentReadingWrapper'));

// Componente para proteger rutas
const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && role !== allowedRole) {
    // Si intenta entrar a una zona no permitida, redirigir a su zona correcta
    return <Navigate to={role === 'teacher' ? '/docente' : '/estudiante'} replace />;
  }

  return children;
};

const App = () => {
  return (
    <ThemeProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
          <Routes>
            {/* Rutas Públicas */}
          <Route path="/login" element={<LoginView />} />
          <Route path="/register" element={<RegisterView />} />

          {/* Redirección raíz */}
          <Route path="/" element={<ProtectedRoute><Navigate to="/estudiante" replace /></ProtectedRoute>} />

          {/* Teacher Portal (Protegido) */}
          <Route path="/docente" element={
            <ProtectedRoute allowedRole="teacher">
              <TeacherLayout />
            </ProtectedRoute>
          }>
            <Route index element={<TeacherDashboard />} />
            <Route path="clases" element={<TeacherClasses />} />
            <Route path="biblioteca" element={<TeacherLibrary />} />
            <Route path="reportes" element={<TeacherReports />} />
            <Route path="configuracion" element={<TeacherConfig />} />
          </Route>

          {/* Student Portal (Protegido) */}
          <Route path="/estudiante" element={
            <ProtectedRoute allowedRole="student">
              <StudentLayout />
            </ProtectedRoute>
          }>
            <Route index element={<StudentDashboard />} />
            <Route path="biblioteca" element={<StudentLibrary />} />
            <Route path="lectura/:id" element={<StudentReadingWrapper />} />
          </Route>

          {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
        <OfflineIndicator />
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;