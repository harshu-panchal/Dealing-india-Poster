import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const EditorContext = createContext();

export const EditorProvider = ({ children }) => {
  const { user: authUser } = useAuth();
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [initialEditorTab, setInitialEditorTab] = useState('branding');
  const [viewingDetail, setViewingDetail] = useState(null);
  const [userData, setUserData] = useState({
    business_name: 'Your Name',
    phone_number: '0000000000', 
    website: 'www.yourwebsite.com',
    email: 'user@example.com',
    gst_number: '',
    logo: 'https://ui-avatars.com/api/?name=U&background=ef4444&color=fff',
    userPhoto: null,
    enabledFields: {
      phone: true,
      website: true,
      email: true,
      gst: false
    }
  });

  // Sync with AuthContext user data
  useEffect(() => {
    if (authUser?.user) {
      const u = authUser.user;
      setUserData(prev => ({
        ...prev,
        business_name: u.name || prev.business_name,
        phone_number: u.mobileNumber || prev.phone_number,
        email: u.email || prev.email,
        logo: u.logo || prev.logo,
        userPhoto: u.profilePhoto || prev.userPhoto
      }));
    }
  }, [authUser]);

  const [frames] = useState(() => {
    const saved = localStorage.getItem('admin_frames');
    return saved ? JSON.parse(saved) : [
       { id: 1, title: 'Festive Orange', type: 'footer', priceType: 'free', preview: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=200&auto=format&fit=crop' },
       { id: 2, title: 'Deep Professional', type: 'footer', priceType: 'premium', preview: 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=200&auto=format&fit=crop' }
    ];
  });

  const [selectedFrame, setSelectedFrame] = useState(frames[0]);

  const injectUserData = (template) => {
    const templateWithUserData = JSON.parse(JSON.stringify(template));
    if (templateWithUserData.layout) {
      templateWithUserData.layout = templateWithUserData.layout.map(item => {
        if (item.placeholderKey === '{{business_name}}' && userData.business_name) {
          return { ...item, defaultValue: userData.business_name, text: userData.business_name };
        }
        if (item.placeholderKey === '{{phone_number}}' && userData.phone_number) {
          return { ...item, defaultValue: userData.phone_number, text: userData.phone_number };
        }
        if (item.placeholderKey === '{{logo}}' && userData.logo) {
          return { ...item, url: userData.logo };
        }
        if (item.placeholderKey === '{{gst_number}}') {
          const val = userData.enabledFields?.gst ? (userData.gst_number || '') : '';
          return { ...item, defaultValue: val, text: val };
        }
        return item;
      });
    }
    return templateWithUserData;
  };

  const openEditor = (template, initialTab = 'branding') => {
    setEditingTemplate(injectUserData(template));
    setInitialEditorTab(initialTab);
    // Keep viewingDetail open
  };

  const openDetail = (template) => {
    setViewingDetail(injectUserData(template));
  };

  const closeEditor = () => setEditingTemplate(null);
  const closeDetail = () => setViewingDetail(null);

  return (
    <EditorContext.Provider value={{ 
      editingTemplate, openEditor, closeEditor, 
      viewingDetail, openDetail, closeDetail,
      userData, setUserData,
      frames, selectedFrame, setSelectedFrame,
      initialEditorTab
    }}>
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => useContext(EditorContext);
