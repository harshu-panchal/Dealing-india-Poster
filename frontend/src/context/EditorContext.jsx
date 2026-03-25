import React, { createContext, useContext, useState } from 'react';

const EditorContext = createContext();

export const EditorProvider = ({ children }) => {
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [viewingDetail, setViewingDetail] = useState(null);
  const [userData, setUserData] = useState({
    business_name: 'Sheetal',
    phone_number: '6261265704', 
    website: 'www.sheetal.com',
    email: 'sheetal@example.com',
    logo: 'https://ui-avatars.com/api/?name=S&background=ef4444&color=fff',
    userPhoto: null,
    enabledFields: {
      phone: true,
      website: true,
      email: true
    }
  });

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
        if (item.placeholderKey === '{{gst_number}}' && userData.gst_number) {
          return { ...item, defaultValue: userData.gst_number, text: userData.gst_number };
        }
        return item;
      });
    }
    return templateWithUserData;
  };

  const openEditor = (template) => {
    setEditingTemplate(injectUserData(template));
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
      userData, setUserData 
    }}>
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => useContext(EditorContext);
