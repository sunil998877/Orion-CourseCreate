import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoginPage from './pages/LoginPage';
import { CourseDataProvider } from './contextAPI/courseAPI.tsx';
import { CreditsProvider } from './contextAPI/CreditsContext';

const RegistrationPage = lazy(() => import('./pages/RegistrationPage'));
const HeroPage = lazy(() => import('./pages/HeroPages').then((m) => ({ default: m.HeroPage })));
const CourseCreatorForm = lazy(() => import('./components/CourseCreator/CourseCreateForm'));
const AppLayout = lazy(() => import('./layout/AppLayout'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const AddCreditsPage = lazy(() => import('./pages/AddCreditsPage'));

const PageFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-[#09090b]">
    <div className="h-10 w-10 animate-spin rounded-full border-2 border-lime-400 border-t-transparent" />
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AnimatedRoutes = () => {
  const location = useLocation();

  // Routes that should NOT have the AppLayout wrapper (like Login/Register)
  const isAuthPage = ['/', '/login', '/register', '/registration', '/create-course', '/course-basic-info'].includes(location.pathname);

  const routes = (
    <Suspense fallback={<PageFallback />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/registration" element={<RegistrationPage />} />

          {/* Pages with Persistent Layout */}
          <Route path="/course-creator" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/course-details" element={<ProtectedRoute><HeroPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><HeroPage /></ProtectedRoute>} />
          <Route path="/course-dashboard" element={<ProtectedRoute><HeroPage /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
          <Route path="/add-credits" element={<ProtectedRoute><AddCreditsPage /></ProtectedRoute>} />

          {/* Full Screen Pages */}
          <Route path="/create-course" element={<ProtectedRoute><CourseCreatorForm /></ProtectedRoute>} />
          <Route path="/course-basic-info" element={<ProtectedRoute><CourseCreatorForm /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );

  if (isAuthPage) {
    return routes;
  }

  return <AppLayout>{routes}</AppLayout>;
};

const App: React.FC = () => {
  React.useEffect(() => {
    localStorage.removeItem('currentCourseId');
    localStorage.removeItem('courseStatus');
  }, []);

  return (
    <CourseDataProvider>
      <CreditsProvider>
        <ToastContainer position="top-right" autoClose={3000} limit={3} theme="dark" />
        <Router>
          <AnimatedRoutes />
        </Router>
      </CreditsProvider>
    </CourseDataProvider>
  );
};

export default App;