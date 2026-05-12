import React, { Suspense, lazy, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import CommonHeader from './modules/B2BUserApp/components/layout/CommonHeader';
import TabNavigation from './modules/B2BUserApp/components/layout/TabNavigation';
import ShimmerLayout from './modules/B2BUserApp/components/common/ShimmerLayout';
import { AnimatePresence } from 'framer-motion';
import Sidebar from './modules/B2BUserApp/components/layout/Sidebar';

// Lazy loading User pages
const Home = lazy(() => import('./modules/B2BUserApp/pages/ForYou'));
const Categories = lazy(() => import('./modules/B2BUserApp/pages/Categories'));
const CategoryDetail = lazy(() => import('./modules/B2BUserApp/pages/CategoryDetail'));
const EventCalendar = lazy(() => import('./modules/B2BUserApp/pages/EventCalendar'));
const WhatsNew = lazy(() => import('./modules/B2BUserApp/pages/WhatsNew'));
const MyPosters = lazy(() => import('./modules/B2BUserApp/pages/MyPosters'));
const Profile = lazy(() => import('./modules/B2BUserApp/pages/Profile'));
const Dashboard = lazy(() => import('./modules/B2BUserApp/pages/Dashboard'));
const Login = lazy(() => import('./modules/B2BUserApp/pages/Login'));
const Trending = lazy(() => import('./modules/B2BUserApp/pages/Trending'));
const Referral = lazy(() => import('./modules/B2BUserApp/pages/Referral'));
const HelpCenter = lazy(() => import('./modules/B2BUserApp/pages/HelpCenter'));
const EventTemplates = lazy(() => import('./modules/B2BUserApp/pages/EventTemplates'));
const BusinessCardEditor = lazy(() => import('./modules/B2BUserApp/components/editor/BusinessCardEditor'));
const TermsAndConditions = lazy(() => import('./modules/B2BUserApp/pages/TermsAndConditions'));
const PrivacyPolicy = lazy(() => import('./modules/B2BUserApp/pages/PrivacyPolicy'));
const LikedPosters = lazy(() => import('./modules/B2BUserApp/pages/LikedPosters'));
const AboutUs = lazy(() => import('./modules/B2BUserApp/pages/AboutUs'));
const Business = lazy(() => import('./modules/B2BUserApp/pages/Business'));
const ViewAll = lazy(() => import('./modules/B2BUserApp/pages/ViewAll'));

// Lazy loading Admin pages
const AdminLayout = lazy(() => import('./modules/Admin/components/AdminLayout'));
const AdminLogin = lazy(() => import('./modules/Admin/pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./modules/Admin/pages/AdminDashboard'));
const UserManager = lazy(() => import('./modules/Admin/pages/UserManager'));
const MusicLibrary = lazy(() => import('./modules/Admin/pages/MusicLibrary'));
const CategoryManager = lazy(() => import('./modules/Admin/pages/CategoryManager'));
const TemplateManager = lazy(() => import('./modules/Admin/pages/TemplateManager'));
const ReferralManager = lazy(() => import('./modules/Admin/pages/ReferralManager'));
const EventManager = lazy(() => import('./modules/Admin/pages/EventManager'));
const UserDetail = lazy(() => import('./modules/Admin/pages/UserDetail'));
const FrameManager = lazy(() => import('./modules/Admin/pages/FrameManager'));
const SystemSettings = lazy(() => import('./modules/Admin/pages/SystemSettings'));
const StickerManager = lazy(() => import('./modules/Admin/pages/StickerManager'));
const BackgroundManager = lazy(() => import('./modules/Admin/pages/BackgroundManager'));
const FeedbackManager = lazy(() => import('./modules/Admin/pages/FeedbackManager'));


import { AuthProvider, useAuth } from './modules/B2BUserApp/context/AuthContext';
import { EditorProvider, useEditor } from './modules/B2BUserApp/context/EditorContext';
import PosterEditor from './modules/B2BUserApp/components/editor/PosterEditor';
import CustomPosterEditor from './modules/B2BUserApp/components/editor/CustomPosterEditor';
import PosterDetail from './modules/B2BUserApp/components/posters/PosterDetail';

import OnboardingModal from './modules/B2BUserApp/components/modals/OnboardingModal';
import { AdminAuthProvider } from './modules/Admin/context/AdminAuthContext';

// Protected Route for Admin
const ProtectedAdminRoute = ({ children }) => {
  const isAdmin = localStorage.getItem('isAdminAuthenticated') === 'true';
  return isAdmin ? children : <Navigate to="/admin/login" replace />;
};

// Protected Route for User
const UserPrivateRoute = ({ children, isAuthenticated }) => {
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { initializePushNotifications, setupForegroundNotificationHandler } from './services/pushNotificationService';
import { useEffect } from 'react';

function AppContent() {
  const { i18n } = useTranslation();
  const [showSidebar, setShowSidebar] = useState(false);
  const { user, loading } = useAuth();

  const isAuthenticated = !!user; 
  const isProfileIncomplete = isAuthenticated && (!user.user?.name || !user.user?.email || !user.user?.mobileNumber);

  const { 
    editingTemplate, closeEditor, 
    viewingDetail, closeDetail, openEditor,
    customPosterEditorOpen, closeCustomPosterEditor
  } = useEditor();

  const location = useLocation();

  useEffect(() => {
    // Initialize push notifications
    initializePushNotifications();
    
    // Setup foreground handler
    setupForegroundNotificationHandler((payload) => {
      console.log('Notification received in foreground:', payload);
      // You could show a custom UI toast here if needed
    });
  }, []);

  if (loading) return <ShimmerLayout />;

  const isAdminPath = location.pathname.startsWith('/admin');
  const showSearchInHeaderPages = ['/', '/trending', '/categories'];
  const showSearch = showSearchInHeaderPages.includes(location.pathname);
  const isBusinessCardEditor = location.pathname.startsWith('/business-card/editor');
  const hideBarsPaths = ['/login', '/register', '/terms', '/privacy'];
  const showBars = !hideBarsPaths.includes(location.pathname) && !isAdminPath && !isBusinessCardEditor;

  // Handle routing for Admin Panel separately
  if (isAdminPath) {
    return (
      <AdminAuthProvider>
        <Suspense fallback={<ShimmerLayout />}>
          <Routes>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<ProtectedAdminRoute><AdminLayout /></ProtectedAdminRoute>}>
               <Route index element={<Navigate to="/admin/dashboard" replace />} />
               <Route path="dashboard" element={<AdminDashboard />} />
               <Route path="users" element={<UserManager />} />
               <Route path="users/:id" element={<UserDetail />} />
               <Route path="music" element={<MusicLibrary />} />
               <Route path="categories" element={<CategoryManager />} />
               <Route path="templates" element={<TemplateManager />} />
               <Route path="referrals" element={<ReferralManager />} />
               <Route path="events" element={<EventManager />} />
               <Route path="frames" element={<FrameManager />} />
               <Route path="stickers" element={<StickerManager />} />
               <Route path="backgrounds" element={<BackgroundManager />} />
               <Route path="feedback" element={<FeedbackManager />} />
               <Route path="settings" element={<SystemSettings />} />

            </Route>
          </Routes>
        </Suspense>
      </AdminAuthProvider>
    );
  }

  return (
    <div className="flex bg-bg h-full w-full overflow-hidden">
      {/* Onboarding Modal - Mandatory for incomplete profiles */}
      <OnboardingModal isOpen={isProfileIncomplete} />
      
      {/* User Sidebar - Only shown if Not Admin Route and Not in Hidden Paths */}
      {showBars && !isAdminPath && (
        <>
          <div className="hidden lg:block h-screen border-r border-gray-100 shrink-0">
            <Sidebar isOpen={true} isPersistent={true} />
          </div>
          <div className="lg:hidden">
            <Sidebar isOpen={showSidebar} onClose={() => setShowSidebar(false)} />
          </div>
        </>
      )}

      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Scrollable Content Area */}
        <main className="flex-1 w-full overflow-y-auto overflow-x-hidden scroll-smooth relative">
          <div className="w-full">
            {isAuthenticated && showBars && (
              <CommonHeader 
                showSearch={showSearch} 
                onSearchChange={(val) => console.log('Search:', val)} 
                onOpenSidebar={() => setShowSidebar(true)}
              />
            )}
            
            <Suspense fallback={<ShimmerLayout />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
                <Route path="/terms" element={<TermsAndConditions />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />

                {/* Private User Routes */}
                <Route path="/" element={<UserPrivateRoute isAuthenticated={isAuthenticated}><Home /></UserPrivateRoute>} />
                <Route path="/home" element={<Navigate to="/" replace />} />
                <Route path="/trending" element={<UserPrivateRoute isAuthenticated={isAuthenticated}><Trending /></UserPrivateRoute>} />
                <Route path="/categories" element={<UserPrivateRoute isAuthenticated={isAuthenticated}><Categories /></UserPrivateRoute>} />
                <Route path="/category/:id" element={<UserPrivateRoute isAuthenticated={isAuthenticated}><CategoryDetail /></UserPrivateRoute>} />
                <Route path="/calendar" element={<UserPrivateRoute isAuthenticated={isAuthenticated}><EventCalendar /></UserPrivateRoute>} />
                <Route path="/whats-new" element={<UserPrivateRoute isAuthenticated={isAuthenticated}><WhatsNew /></UserPrivateRoute>} />
                <Route path="/my-posters" element={<UserPrivateRoute isAuthenticated={isAuthenticated}><MyPosters /></UserPrivateRoute>} />
                <Route path="/profile" element={<UserPrivateRoute isAuthenticated={isAuthenticated}><Profile /></UserPrivateRoute>} />
                <Route path="/referral" element={<UserPrivateRoute isAuthenticated={isAuthenticated}><Referral /></UserPrivateRoute>} />
                <Route path="/dashboard" element={<UserPrivateRoute isAuthenticated={isAuthenticated}><Dashboard /></UserPrivateRoute>} />
                <Route path="/help" element={<UserPrivateRoute isAuthenticated={isAuthenticated}><HelpCenter /></UserPrivateRoute>} />
                <Route path="/liked-posters" element={<UserPrivateRoute isAuthenticated={isAuthenticated}><LikedPosters /></UserPrivateRoute>} />
                <Route path="/business" element={<UserPrivateRoute isAuthenticated={isAuthenticated}><Business /></UserPrivateRoute>} />
                <Route path="/view-all/:type/:id" element={<UserPrivateRoute isAuthenticated={isAuthenticated}><ViewAll /></UserPrivateRoute>} />
                <Route path="/event/:id/templates" element={<UserPrivateRoute isAuthenticated={isAuthenticated}><EventTemplates /></UserPrivateRoute>} />
                <Route path="/business-card/editor/:id" element={<UserPrivateRoute isAuthenticated={isAuthenticated}><BusinessCardEditor /></UserPrivateRoute>} />
                <Route path="/about" element={<UserPrivateRoute isAuthenticated={isAuthenticated}><AboutUs /></UserPrivateRoute>} />
                
                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </div>
        </main>

        {/* Bottom Navigation - Hidden on Desktop and Admin */}
        {isAuthenticated && showBars && (
          <div className="lg:hidden">
            <TabNavigation />
          </div>
        )}

        <AnimatePresence>
          {viewingDetail && (
            <PosterDetail 
              template={viewingDetail} 
              onClose={closeDetail}
              onEdit={openEditor}
            />
          )}
        </AnimatePresence>

        {editingTemplate && (
          <PosterEditor 
            template={editingTemplate} 
            onClose={closeEditor} 
          />
        )}

        {customPosterEditorOpen && (
          <CustomPosterEditor 
            onClose={closeCustomPosterEditor} 
          />
        )}
      </div>

    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <EditorProvider>
          <AppContent />
        </EditorProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

