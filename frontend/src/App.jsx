import React, { Suspense, lazy, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import CommonHeader from './components/layout/CommonHeader';
import TabNavigation from './components/layout/TabNavigation';
import ShimmerLayout from './components/common/ShimmerLayout';
import { AnimatePresence } from 'framer-motion';
import Sidebar from './components/layout/Sidebar';

// Lazy loading User pages
const Home = lazy(() => import('./pages/ForYou'));
const Categories = lazy(() => import('./pages/Categories'));
const CategoryDetail = lazy(() => import('./pages/CategoryDetail'));
const EventCalendar = lazy(() => import('./pages/EventCalendar'));
const WhatsNew = lazy(() => import('./pages/WhatsNew'));
const MyPosters = lazy(() => import('./pages/MyPosters'));
const Profile = lazy(() => import('./pages/Profile'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Trending = lazy(() => import('./pages/Trending'));

// Lazy loading Admin pages
const AdminLayout = lazy(() => import('./admin/components/AdminLayout'));
const AdminLogin = lazy(() => import('./admin/pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./admin/pages/AdminDashboard'));
const UserManager = lazy(() => import('./admin/pages/UserManager'));
const MusicLibrary = lazy(() => import('./admin/pages/MusicLibrary'));
const CategoryManager = lazy(() => import('./admin/pages/CategoryManager'));
const TemplateManager = lazy(() => import('./admin/pages/TemplateManager'));
const ReferralManager = lazy(() => import('./admin/pages/ReferralManager'));
const EventManager = lazy(() => import('./admin/pages/EventManager'));
const UserDetail = lazy(() => import('./admin/pages/UserDetail'));

import { EditorProvider, useEditor } from './context/EditorContext';
import PosterEditor from './components/editor/PosterEditor';
import PosterDetail from './components/posters/PosterDetail';

// Protected Route for Admin
const ProtectedAdminRoute = ({ children }) => {
  const isAdmin = localStorage.getItem('isAdminAuthenticated') === 'true';
  return isAdmin ? children : <Navigate to="/admin/login" replace />;
};

function AppContent() {
  const [showSidebar, setShowSidebar] = useState(false);
  const isAuthenticated = true; 
  const { 
    editingTemplate, closeEditor, 
    viewingDetail, closeDetail, openEditor 
  } = useEditor();
  const location = useLocation();

  const isAdminPath = location.pathname.startsWith('/admin');
  const showSearchInHeaderPages = ['/', '/trending', '/categories'];
  const showSearch = showSearchInHeaderPages.includes(location.pathname);
  const hideBarsPaths = ['/calendar', '/whats-new', '/login', '/register'];
  const showBars = !hideBarsPaths.includes(location.pathname) && !isAdminPath;

  // Handle routing for Admin Panel separately
  if (isAdminPath) {
    return (
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
          </Route>
        </Routes>
      </Suspense>
    );
  }

  return (
    <div className="flex bg-bg h-full w-full overflow-hidden">
      {/* User Sidebar - Only shown if Not Admin Route */}
      {!isAdminPath && (
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
                <Route path="/" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />
                <Route path="/trending" element={<Trending />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/category/:id" element={<CategoryDetail />} />
                <Route path="/calendar" element={<EventCalendar />} />
                <Route path="/whats-new" element={<WhatsNew />} />
                <Route path="/my-posters" element={<MyPosters />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
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
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <EditorProvider>
        <AppContent />
      </EditorProvider>
    </Router>
  );
}

export default App;

