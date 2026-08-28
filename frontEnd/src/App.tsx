import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoginPage from './pages/LoginPage';
import { CourseDataProvider } from './contextAPI/courseAPI.tsx';
import { CreditsProvider } from './contextAPI/CreditsContext';
import AdminLayout from './layout/AdminLayout';
import { useTheme } from './contextAPI/ThemeContext';
import { hasAdminSession } from './utils/adminAuth';
const RegistrationPage = lazy(() => import('./pages/RegistrationPage'));
const HeroPage = lazy(() => import('./pages/HeroPages').then((m) => ({ default: m.HeroPage })));
const CourseCreatorForm = lazy(() => import('./components/CourseCreator/CourseCreateForm'));
const AppLayout = lazy(() => import('./layout/AppLayout'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const AddCreditsPage = lazy(() => import('./pages/AddCreditsPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const AdminPricingPage = lazy(() => import('./pages/AdminPricingPage'));
const AdminUsersPage = lazy(() => import('./pages/AdminUsersPage'));
const AdminTransactionsPage = lazy(() => import('./pages/AdminTransactionsPage'));
const AdminCoursesPage = lazy(() => import('./pages/AdminCoursesPage'));
const AdminAnalyticsPage = lazy(() => import('./pages/AdminAnalyticsPage'));
const AdminRechargePlanPage = lazy(() => import('./pages/AdminRechargePlanPage'));
const AdminSettingsPage = lazy(() => import('./pages/AdminSettingsPage'));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));
const PageFallback = () => (<div className="flex min-h-screen items-center justify-center bg-[#09090b]">
    <div className="h-10 w-10 animate-spin rounded-full border-2 border-lime-400 border-t-transparent"/>
  </div>);
const ProtectedRoute = ({ children }: {
    children: React.ReactNode;
}) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token)
        return <Navigate to="/login" replace/>;
    return <>{children}</>;
};
const AdminProtectedRoute = ({ children }: {
    children: React.ReactNode;
}) => {
    if (!hasAdminSession())
        return <Navigate to="/admin/login" replace/>;
    return <>{children}</>;
};
const AnimatedRoutes = () => {
    const location = useLocation();
    const isAuthPage = [
        '/',
        '/login',
        '/register',
        '/registration',
        '/create-course',
        '/course-basic-info',
        '/admin/login',
    ].includes(location.pathname);
    const isAdminPage = location.pathname.startsWith('/admin');
    const routes = (<Suspense fallback={<PageFallback />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<LoginPage />}/>
          <Route path="/login" element={<LoginPage />}/>
          <Route path="/register" element={<RegistrationPage />}/>
          <Route path="/registration" element={<RegistrationPage />}/>

          <Route path="/admin/login" element={<AdminLoginPage />}/>
          <Route path="/admin" element={<AdminProtectedRoute><AdminLayout><AdminPage /></AdminLayout></AdminProtectedRoute>}/>
          <Route path="/admin/pricing" element={<AdminProtectedRoute><AdminLayout><AdminPricingPage /></AdminLayout></AdminProtectedRoute>}/>
          <Route path="/admin/users" element={<AdminProtectedRoute><AdminLayout><AdminUsersPage /></AdminLayout></AdminProtectedRoute>}/>
          <Route path="/admin/customers" element={<AdminProtectedRoute><AdminLayout><AdminUsersPage /></AdminLayout></AdminProtectedRoute>}/>
          <Route path="/admin/recharges" element={<AdminProtectedRoute><AdminLayout><AdminRechargePlanPage /></AdminLayout></AdminProtectedRoute>}/>
          <Route path="/admin/subscriptions" element={<AdminProtectedRoute><AdminLayout><AdminRechargePlanPage /></AdminLayout></AdminProtectedRoute>}/>
          <Route path="/admin/transactions" element={<AdminProtectedRoute><AdminLayout><AdminTransactionsPage /></AdminLayout></AdminProtectedRoute>}/>
          <Route path="/admin/courses" element={<AdminProtectedRoute><AdminLayout><AdminCoursesPage /></AdminLayout></AdminProtectedRoute>}/>
          <Route path="/admin/products" element={<AdminProtectedRoute><AdminLayout><AdminCoursesPage /></AdminLayout></AdminProtectedRoute>}/>
          <Route path="/admin/analytics" element={<AdminProtectedRoute><AdminLayout><AdminAnalyticsPage /></AdminLayout></AdminProtectedRoute>}/>
          <Route path="/admin/settings" element={<AdminProtectedRoute><AdminLayout><AdminSettingsPage /></AdminLayout></AdminProtectedRoute>}/>


          <Route path="/course-creator" element={<ProtectedRoute><HomePage /></ProtectedRoute>}/>
          <Route path="/course-details" element={<ProtectedRoute><HeroPage /></ProtectedRoute>}/>
          <Route path="/dashboard" element={<ProtectedRoute><HeroPage /></ProtectedRoute>}/>
          <Route path="/course-dashboard" element={<ProtectedRoute><HeroPage /></ProtectedRoute>}/>
          <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>}/>
          <Route path="/add-credits" element={<ProtectedRoute><AddCreditsPage /></ProtectedRoute>}/>

          <Route path="/create-course" element={<ProtectedRoute><CourseCreatorForm /></ProtectedRoute>}/>
          <Route path="/course-basic-info" element={<ProtectedRoute><CourseCreatorForm /></ProtectedRoute>}/>

          <Route path="*" element={<Navigate to="/" replace/>}/>
        </Routes>
      </AnimatePresence>
    </Suspense>);
    if (isAuthPage || isAdminPage) {
        return routes;
    }
    return <AppLayout>{routes}</AppLayout>;
};
const ThemedToasts = () => {
    const { isDark } = useTheme();
    return <ToastContainer position="top-right" autoClose={3000} limit={3} theme={isDark ? 'dark' : 'light'}/>;
};
const App: React.FC = () => {
    React.useEffect(() => {
        localStorage.removeItem('currentCourseId');
        localStorage.removeItem('courseStatus');
    }, []);
    return (<CourseDataProvider>
      <CreditsProvider>
        <ThemedToasts />
        <Router>
          <AnimatedRoutes />
        </Router>
      </CreditsProvider>
    </CourseDataProvider>);
};
export default App;
