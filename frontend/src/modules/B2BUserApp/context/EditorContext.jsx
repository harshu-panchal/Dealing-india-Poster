import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const EditorContext = createContext();

export const EditorProvider = ({ children }) => {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [initialEditorTab, setInitialEditorTab] = useState('branding');
  const [viewingDetail, setViewingDetail] = useState(null);
  const [customPosterEditorOpen, setCustomPosterEditorOpen] = useState(false);
  const [likedTemplates, setLikedTemplates] = useState(new Set());

  const [userData, setUserData] = useState({
    name: 'Your Name',
    business_name: 'Your Business',
    phone_number: '0000000000', 
    website: 'www.yourwebsite.com',
    email: 'user@example.com',
    gst_number: '',
    designation: 'Your Designation',
    address: 'Your Business Address',
    extraTexts: [],
    extraPhotos: [],
    stickers: [],
    logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23ef4444'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='40' fill='white' font-weight='black'%3EL%3C/text%3E%3C/svg%3E",
    userPhoto: null,
    enabledFields: {
      name: true,
      business_name: false,
      phone: true,
      website: false,
      email: false,
      address: false,
      gst: false,
      userPhoto: false,
      logo: false,
      designation: false
    }
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5003/api';

  // Sync with AuthContext user data
  useEffect(() => {
    if (authUser?.user) {
      const u = authUser.user;
      // Filter out stale broken default logo URL
      const cleanLogo = (u.logo && !u.logo.includes('default_logo.png')) ? u.logo : null;
      
      setUserData(prev => ({
        ...prev,
        name: u.name || prev.name,
        business_name: u.businessName || prev.business_name,
        phone_number: u.mobileNumber || prev.phone_number,
        email: u.email || prev.email,
        website: u.website || prev.website,
        address: u.address || prev.address,
        gst_number: u.gstNumber || prev.gst_number,
        logo: cleanLogo || prev.logo,
        userPhoto: u.profilePhoto || prev.userPhoto,
        designation: u.designation || prev.designation
      }));

      // Fetch Likes
      const fetchLikes = async () => {
        try {
          const { data } = await axios.get(`${API_URL}/user/templates/liked`, {
            headers: { Authorization: `Bearer ${authUser.accessToken}` }
          });
          setLikedTemplates(new Set(data.map(t => t._id)));
        } catch (e) {
          console.error('Failed to fetch likes:', e);
        }
      };
      fetchLikes();
    } else {
      setLikedTemplates(new Set());
    }
  }, [authUser, API_URL]);

  const [frames, setFrames] = useState([]);
  const [selectedFrame, setSelectedFrame] = useState(null);

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
        if (item.placeholderKey === '{{name}}' && userData.name) {
          return { ...item, defaultValue: userData.name, text: userData.name };
        }
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
    let normalizedFrame = normalizeFrameValue(template?.customData?.selectedFrame);
    // If template has no saved frame, fallback to the first available frame (matching home page defaults)
    if (!normalizedFrame && frames && frames.length > 0) {
      normalizedFrame = normalizeFrameValue(frames[0].image || frames[0].url);
    }
    
    setEditingTemplate(injectUserData(template));
    setInitialEditorTab(initialTab);
    setSelectedFrame(normalizedFrame || null);
  };

  const openDetail = (template) => {
    // Thorough check for business card templates (including nested history objects)
    const tplData = template?.templateId && typeof template.templateId === 'object' ? template.templateId : template;
    const subcatName = tplData?.subcategoryId?.name?.toLowerCase() || '';
    const catName = tplData?.categoryId?.name?.toLowerCase() || '';
    
    const isBusinessCard = 
      subcatName.includes('business card') || 
      subcatName.includes('business-card') ||
      catName.includes('business card') ||
      catName.includes('business-card');

    if (isBusinessCard) {
      const tplId = getTemplateId(template);
      navigate(`/business-card/editor/${tplId}`);
      return;
    }

    let normalizedFrame = normalizeFrameValue(template?.customData?.selectedFrame);
    // If template has no saved frame, fallback to the first available frame
    if (!normalizedFrame && frames && frames.length > 0) {
      normalizedFrame = normalizeFrameValue(frames[0].image || frames[0].url);
    }

    setViewingDetail(injectUserData(template));
    setSelectedFrame(normalizedFrame || null);
  };

  const closeEditor = () => { setEditingTemplate(null); setSelectedFrame(null); };
  const closeDetail = () => { setViewingDetail(null); setSelectedFrame(null); };

  const openCustomPosterEditor = () => setCustomPosterEditorOpen(true);
  const closeCustomPosterEditor = () => setCustomPosterEditorOpen(false);


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

  const toggleLike = async (templateId, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!authUser?.accessToken) {
      navigate('/login');
      return;
    }

    // Optimistic UI update
    setLikedTemplates(prev => {
      const next = new Set(prev);
      if (next.has(templateId)) next.delete(templateId);
      else next.add(templateId);
      return next;
    });

    try {
      await axios.post(`${API_URL}/user/templates/${templateId}/like`, {}, {
        headers: { Authorization: `Bearer ${authUser.accessToken}` }
      });
    } catch (error) {
      console.error('Like toggle failed:', error);
      // Rollback on failure
      setLikedTemplates(prev => {
        const next = new Set(prev);
        if (next.has(templateId)) next.delete(templateId);
        else next.add(templateId);
        return next;
      });
    }
  };

  return (
    <EditorContext.Provider value={{ 
      editingTemplate, openEditor, closeEditor, 
      viewingDetail, openDetail, closeDetail,
      syncSavedEditsToDetail,
      userData, setUserData,
      frames, selectedFrame, setSelectedFrame,
      initialEditorTab,
      likedTemplates, toggleLike,
      customPosterEditorOpen, openCustomPosterEditor, closeCustomPosterEditor
    }}>

      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => useContext(EditorContext);
