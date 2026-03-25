import React, { Suspense, lazy, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import CommonHeader from './components/layout/CommonHeader';
import TabNavigation from './components/layout/TabNavigation';
import ShimmerLayout from './components/common/ShimmerLayout';
import { AnimatePresence } from 'framer-motion';
import Sidebar from './components/layout/Sidebar';

// Lazy loading pages
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

import { EditorProvider, useEditor } from './context/EditorContext';
import PosterEditor from './components/editor/PosterEditor';
import PosterDetail from './components/posters/PosterDetail';

function AppContent() {
  const [showSidebar, setShowSidebar] = useState(false);
  const isAuthenticated = true; 
  const { 
    editingTemplate, closeEditor, 
    viewingDetail, closeDetail, openEditor 
  } = useEditor();
  const location = useLocation();

  const showSearchInHeaderPages = ['/', '/trending', '/categories'];
  const showSearch = showSearchInHeaderPages.includes(location.pathname);
  const hideBarsPaths = ['/calendar', '/whats-new'];
  const showBars = !hideBarsPaths.includes(location.pathname);

  return (
    <>
      <Sidebar isOpen={showSidebar} onClose={() => setShowSidebar(false)} />
      <div className="h-full w-full flex flex-col overflow-hidden bg-bg">
      {/* Scrollable Content Area */}
      <main className="flex-1 w-full overflow-y-auto overflow-x-hidden scroll-smooth relative">
        <div className="max-w-[1200px] mx-auto w-full">
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

      {/* Permanently Visible Bottom Navigation */}
      {isAuthenticated && showBars && <TabNavigation />}

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
    </>
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
