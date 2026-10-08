
import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
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
import { getSupabase, isSupabaseConfigured } from './src/supabase';
import Verify from './pages/Verify';

const SITE_NAME = 'Agro Aerial Precision';

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
  return PAGE_TITLES['/'];
};

// Scroll to top and update the page title on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = getPageTitle(pathname);
  }, [pathname]);
  return null;
};

// Email confirmation and password-reset links come back as "<site>/?code=...#/route".
// Load Supabase so it can exchange the code for a session, then tidy the URL.
const AuthLinkHandler = () => {
  const navigate = useNavigate();
  useEffect(() => {
    if (!isSupabaseConfigured || !new URLSearchParams(window.location.search).has('code')) return;

    getSupabase()
      .then((supabase) => supabase.auth.getSession())
      .finally(() => {
        const cleanUrl = `${window.location.origin}${window.location.pathname}${window.location.hash}`;
        window.history.replaceState(window.history.state, '', cleanUrl);
        // If the link lost its route, send the user to their portal
        if (!window.location.hash || window.location.hash === '#/') {
          navigate('/student', { replace: true });
        }
      });
  }, []);
  return null;
};

const App: React.FC = () => {

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <ScrollToTop />
        <AuthLinkHandler />
        <Header />
        
        <main className="grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/academy" element={<Academy />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/services/:category" element={<ServiceDetail />} />
            <Route path="/services" element={<Home />} /> {/* Fallback or Services overview */}
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
          </Routes>
        </main>
        
        <Footer />
        <WhatsAppWidget />
      </div>
    </Router>
       
  );
};

export default App;
