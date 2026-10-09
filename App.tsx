
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import WhatsAppWidget from './components/WhatsAppWidget';
import Home from './pages/Home';
import About from './pages/About';
import Academy from './pages/Academy';
import Contact from './pages/Contact';
import ServiceDetail from './pages/ServiceDetail';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

import QRGenerator from './pages/QRGenerator';
import DroneExam from './pages/DroneExam';
import StudentLogin from './pages/StudentLogin';
import AdminDashboard from './pages/AdminDashboard';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import StudentDashboard from './pages/StudentDashboard';
import CourseDetail from './pages/CourseDetail';
import TeamMember from './pages/TeamMember';
import Services from './pages/Services';
import { TEAM } from './constants';
import { findCourse } from './src/data/courses';
import { getSupabase, isSupabaseConfigured } from './src/supabase';
import Verify from './pages/Verify';

const SITE_NAME = 'Agro Aerial Precision';

// "/" on Hostinger, "/Agro-Aerial-Precision" on GitHub Pages
const ROUTER_BASENAME = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

const PAGE_TITLES: Record<string, string> = {
  '/': `${SITE_NAME} - Drone Solutions`,
  '/about': `About Us | ${SITE_NAME}`,
  '/academy': `Drone Academy | ${SITE_NAME}`,
  '/contact': `Contact Us | ${SITE_NAME}`,
  '/privacy-policy': `Privacy Policy | ${SITE_NAME}`,
  '/terms-of-service': `Terms of Service | ${SITE_NAME}`,
  '/student-login': `Student Sign In | ${SITE_NAME}`,
  '/register': `Create Student Account | ${SITE_NAME}`,
  '/forgot-password': `Reset Password | ${SITE_NAME}`,
  '/reset-password': `Choose New Password | ${SITE_NAME}`,
  '/student': `Student Portal | ${SITE_NAME}`,
  '/drone-exam': `Certification Exam | ${SITE_NAME}`,
  '/admin': `Exam Admin | ${SITE_NAME}`,
  '/services': `Our Services | ${SITE_NAME}`,
};

const getPageTitle = (pathname: string) => {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith('/services/')) {
    const category = decodeURIComponent(pathname.split('/')[2] || '')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    return `${category} Services | ${SITE_NAME}`;
  }
  if (pathname.startsWith('/verify')) return `Certificate Verification | ${SITE_NAME}`;
  if (pathname.startsWith('/team/')) {
    const member = TEAM.find((m) => m.slug === pathname.split('/')[2]);
    if (member) return `${member.name} | ${SITE_NAME}`;
  }
  if (pathname.startsWith('/academy/')) {
    const course = findCourse(pathname.split('/')[2]);
    if (course) return `${course.title} | ${SITE_NAME}`;
  }
  return PAGE_TITLES['/'];
};

// Scroll to top and update the page title on route change
// Links can point at a section of a page with "?section=<element id>"
const sectionFor = (search: string) => new URLSearchParams(search).get('section');

// Scroll to the top (or to the requested section) and update the page title on route change
const ScrollToTop = () => {
  const { pathname, search } = useLocation();
  useEffect(() => {
    document.title = getPageTitle(pathname);
    const sectionId = sectionFor(search);
    if (!sectionId) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }
    // Wait for the page to render before scrolling to the section
    const timer = window.setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
    return () => window.clearTimeout(timer);
  }, [pathname, search]);
  return null;
};

// Email confirmation and password-reset links come back as "<site>/<route>?code=...".
// Load Supabase so it can exchange the code for a session, then remove the code from the URL.
const AuthLinkHandler = () => {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(search);
    if (!isSupabaseConfigured || !params.has('code')) return;

    getSupabase()
      .then((supabase) => supabase.auth.getSession())
      .finally(() => {
        params.delete('code');
        const rest = params.toString();
        // If the link lost its route, send the user to their portal
        const target = pathname === '/' ? '/student' : pathname;
        navigate(`${target}${rest ? `?${rest}` : ''}`, { replace: true });
      });
  }, [search]);
  return null;
};

// Visitor-only widgets (e.g. WhatsApp chat) are hidden on the admin dashboard
const PublicOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname } = useLocation();
  return pathname.startsWith('/admin') ? null : <>{children}</>;
};

const App: React.FC = () => {

  return (
    <Router basename={ROUTER_BASENAME}>
      <div className="flex flex-col min-h-screen">
        <ScrollToTop />
        <AuthLinkHandler />
        <Header />
        
        <main className="grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="/about" element={<About />} />
            <Route path="/team/:slug" element={<TeamMember />} />
            <Route path="/academy" element={<Academy />} />
            <Route path="/academy/:courseId" element={<CourseDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/services/:category" element={<ServiceDetail />} />
            <Route path="/services" element={<Services />} />
            <Route path="/qr" element={<QRGenerator />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/verify/:id" element={<Verify />} />
            <Route path="/student-login" element={<StudentLogin />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/drone-exam" element={<DroneExam />} />
            <Route path="/admin" element={<AdminDashboard />} />
            {/* Old admin links from the Google Apps Script version */}
            <Route path="/admin-reset" element={<Navigate to="/admin" replace />} />
            <Route path="/exam-reset" element={<Navigate to="/admin" replace />} />
            {/* Unknown addresses go to the Home page */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        
        <Footer />
        <PublicOnly>
          <WhatsAppWidget />
        </PublicOnly>
      </div>
    </Router>
       
  );
};

export default App;
