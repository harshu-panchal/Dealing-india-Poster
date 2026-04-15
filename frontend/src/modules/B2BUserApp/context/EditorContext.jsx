import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';

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
    address: 'Your Business Address',
    extraTexts: [],
    extraPhotos: [],
    stickers: [],
    logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23ef4444'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='40' fill='white' font-weight='black'%3EL%3C/text%3E%3C/svg%3E",
    userPhoto: null,
    enabledFields: {
      business_name: true,
      phone: true,
      website: true,
      email: true,
      address: true,
      gst: false,
      userPhoto: true,
      logo: true
    }
  });

  // Sync with AuthContext user data
  useEffect(() => {
    if (authUser?.user) {
      const u = authUser.user;
      // Filter out stale broken default logo URL
      const cleanLogo = (u.logo && !u.logo.includes('default_logo.png')) ? u.logo : null;
      
      setUserData(prev => ({
        ...prev,
        business_name: u.name || prev.business_name,
        phone_number: u.mobileNumber || prev.phone_number,
        email: u.email || prev.email,
        logo: cleanLogo || prev.logo,
        userPhoto: u.profilePhoto || prev.userPhoto
      }));
    }
  }, [authUser]);

  const [frames, setFrames] = useState([]);
  const [selectedFrame, setSelectedFrame] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

  useEffect(() => {
    const fetchFrames = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/user/frames`);
        setFrames(data);
        // Don't auto-select any frame by default for user
      } catch (error) {
        console.error('Fetch frames error:', error);
      }
    };
    fetchFrames();
  }, [API_URL]);

  const normalizeFrameValue = (frame) => {
    if (!frame) return null;
    if (typeof frame === 'string') return frame;
    if (typeof frame === 'object') return frame.image || frame.url || null;
    return null;
  };

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
    const normalizedFrame = normalizeFrameValue(template?.customData?.selectedFrame);
    setEditingTemplate(injectUserData(template));
    setInitialEditorTab(initialTab);
    if (normalizedFrame) {
      setSelectedFrame(normalizedFrame);
    }
    // Keep viewingDetail open
  };

  const openDetail = (template) => {
    const normalizedFrame = normalizeFrameValue(template?.customData?.selectedFrame);
    setViewingDetail(injectUserData(template));
    if (normalizedFrame) {
      setSelectedFrame(normalizedFrame);
    }
  };

  const closeEditor = () => setEditingTemplate(null);
  const closeDetail = () => setViewingDetail(null);

  const getTemplateId = (template) => {
    if (!template) return null;
    if (template.templateId && typeof template.templateId === 'object') return template.templateId._id;
    return template._id || template.templateId || null;
  };

  const syncSavedEditsToDetail = (sourceTemplate, customData) => {
    const sourceId = getTemplateId(sourceTemplate);
    if (!sourceId) return;

    setViewingDetail(prev => {
      if (!prev) return prev;
      const prevId = getTemplateId(prev);
      if (!prevId || String(prevId) !== String(sourceId)) return prev;
      return {
        ...prev,
        customData: { ...customData }
      };
    });
  };

  return (
    <EditorContext.Provider value={{ 
      editingTemplate, openEditor, closeEditor, 
      viewingDetail, openDetail, closeDetail,
      syncSavedEditsToDetail,
      userData, setUserData,
      frames, selectedFrame, setSelectedFrame,
      initialEditorTab
    }}>
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => useContext(EditorContext);
