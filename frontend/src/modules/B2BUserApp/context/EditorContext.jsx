import React, { createContext, useContext, useState } from 'react';

const EditorContext = createContext();

export const EditorProvider = ({ children }) => {
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [initialEditorTab, setInitialEditorTab] = useState('branding');
  const [viewingDetail, setViewingDetail] = useState(null);
  const [userData, setUserData] = useState({
    business_name: 'Sheetal',
    phone_number: '6261265704', 
    website: 'www.sheetal.com',
    email: 'sheetal@example.com',
    gst_number: '27AAAAA0000A1Z5',
    logo: 'https://ui-avatars.com/api/?name=S&background=ef4444&color=fff',
    userPhoto: null,
    enabledFields: {
      phone: true,
      website: true,
      email: true,
      gst: false
    }
  });

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
