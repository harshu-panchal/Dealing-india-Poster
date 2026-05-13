import { ArrowLeft, Heart, Video, Download, MessageCircle, Share2, User, Phone, Globe, X, Star, Mail, MapPin, Hash, Palette, Move, Save, CheckCircle, Edit2, PlayCircle, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEditor } from '../../context/EditorContext';
import { useAuth } from '../../context/AuthContext';
import VideoEditor from '../editor/VideoEditor';
import BrandingOverlay from './BrandingOverlay';
import { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';

const ActionIcon = ({ icon: Icon, label, color, onClick }) => (
  <div
    className="flex flex-col items-center gap-1.5 flex-1 cursor-pointer group transition-all"
    onClick={onClick}
  >
    <div className="w-10 h-10 transition-colors flex items-center justify-center text-slate-600 group-hover:text-indigo-600 group-active:scale-90">
      <Icon size={24} style={{ color }} />
    </div>
    <span className="text-[0.75rem] font-bold text-slate-600 group-hover:text-indigo-600">{label}</span>
  </div>
);

const PosterDetail = ({ template, onEdit, onClose }) => {
  const { userData: globalUserData, frames, selectedFrame, setSelectedFrame, initialEditorTab, closeEditor } = useEditor();
  const { user } = useAuth();
  const [showVideoEditor, setShowVideoEditor] = useState(false);
  const [autoVideoDownload, setAutoVideoDownload] = useState(false);

  useEffect(() => {
    if (initialEditorTab === 'video') {
      setShowVideoEditor(true);
      closeEditor(); // Prevent PosterEditor from also opening behind it
    }
  }, [initialEditorTab, closeEditor]);
  const posterRef = useRef(null);         // for html2canvas
  const posterContainerRef = useRef(null); // for drag coordinate system
  const dragRef = useRef(null);           // active drag tracking
  const [containerWidth, setContainerWidth] = useState(500);

  useEffect(() => {
    if (!posterContainerRef.current) return;
    const obs = new ResizeObserver(entries => {
      for (let entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    obs.observe(posterContainerRef.current);
    return () => obs.disconnect();
  }, []);

  // Tracks positions the user has manually dragged in this view
  const [localPos, setLocalPos] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const hasDragged = Object.keys(localPos).length > 0;

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5003/api';

  // ── Pointer-based drag handlers (no framer-motion, no snapping) ──────────
  const onPointerDown = useCallback((e, field, currentPos) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      field,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startXPct: parseFloat(currentPos.x) || 0,
      startYPct: parseFloat(currentPos.y) || 0,
    };
  }, []);

  const onPointerMove = useCallback((e, field) => {
    const d = dragRef.current;
    if (!d || d.field !== field || !posterContainerRef.current) return;
    e.preventDefault();
    const { width, height } = posterContainerRef.current.getBoundingClientRect();
    const dx = ((e.clientX - d.startClientX) / width) * 100;
    const dy = ((e.clientY - d.startClientY) / height) * 100;
    const newX = Math.max(0, Math.min(92, d.startXPct + dx));
    const newY = Math.max(0, Math.min(96, d.startYPct + dy));
    setLocalPos(prev => ({ ...prev, [field]: { x: `${newX.toFixed(1)}%`, y: `${newY.toFixed(1)}%` } }));
  }, []);

  const onPointerUp = useCallback(() => { dragRef.current = null; }, []);

  // Merge user-dragged positions into customData and persist
  const saveLayout = async () => {
    if (!user?.accessToken) { alert('Please log in to save'); return; }
    const currentTemplate = template.templateId && typeof template.templateId === 'object' ? template.templateId : template;
    const existingCustom = template.customData || {};
    const merged = {
      ...existingCustom,
      selectedFrame: normalizeFrameValue(selectedFrame) || normalizeFrameValue(existingCustom.selectedFrame) || null,
      ...(localPos.name && { namePos: localPos.name }),
      ...(localPos.business_name && { businessNamePos: localPos.business_name }),
      ...(localPos.phone && { phonePos: localPos.phone }),
      ...(localPos.website && { websitePos: localPos.website }),
      ...(localPos.email && { emailPos: localPos.email }),
      ...(localPos.address && { addressPos: localPos.address }),
      ...(localPos.gst && { gstPos: localPos.gst }),
      ...(localPos.photo && { userPhotoPos: localPos.photo }),
      ...(localPos.logo && { logoPos: localPos.logo }),
    };
    try {
      setIsSaving(true);
      await axios.post(`${API_URL}/user/save-template`, {
        templateId: currentTemplate._id,
        customData: merged,
      }, { headers: { Authorization: `Bearer ${user.accessToken}` } });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert('Save failed. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const cleanUrl = (url) => {
    if (!url || url.includes('default_logo.png')) return null;
    return url;
  };

  const isVideoUrl = (url) => {
    if (!url) return false;
    return url.match(/\.(mp4|webm|mov|ogg)$/i) || url.includes('/video/upload/');
  };

  const [isPlaying, setIsPlaying] = useState(false);

  // Stop playback on unmount
  useEffect(() => {
    return () => setIsPlaying(false);
  }, []);

  // Determine effective template data and user data
  const currentTemplate = template.templateId && typeof template.templateId === 'object' ? template.templateId : template;
  const rawUserData = template.customData || globalUserData;

  const userData = {
    ...rawUserData,
    logo: cleanUrl(rawUserData.logo),
    userPhoto: cleanUrl(rawUserData.userPhoto)
  };

  const formatCount = (count) => {
    if (!count) return '0';
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count.toString();
  };
  const normalizeFrameValue = (frame) => {
    if (!frame) return null;
    if (typeof frame === 'string') return frame;
    if (typeof frame === 'object') return frame.image || frame.url || null;
    return null;
  };
  const defaultFrame = (frames && frames.length > 0) ? (frames[0].image || frames[0].url) : null;
  const activeFrame = normalizeFrameValue(userData.selectedFrame) || normalizeFrameValue(selectedFrame) || defaultFrame;
  const hasFrameApplied = !!activeFrame;

  // Find the full frame object to get text styles
  const activeFrameObj = frames.find(f => normalizeFrameValue(f) === activeFrame);
  const frameStyle = activeFrameObj?.textStyle || {};
  const framePos = frameStyle.positions || {};

  const getStyle = (type) => {
    const isName = type === 'name';
    const scale = containerWidth / 500;
    const baseSize = isName ? (frameStyle.nameSize || '0.8rem') : (frameStyle.detailSize || '0.6rem');

    return {
      color: frameStyle.color || '#ffffff',
      fontSize: `calc(${baseSize} * ${scale})`,
      fontWeight: frameStyle.fontWeight || (isName ? '900' : '700'),
      textShadow: frameStyle.textShadow || '0 2px 4px rgba(0,0,0,0.8)',
      textTransform: frameStyle.textTransform || 'uppercase',
      letterSpacing: frameStyle.letterSpacing === 'tight' ? '-0.02em' : frameStyle.letterSpacing === 'wide' ? '0.05em' : frameStyle.letterSpacing === 'widest' ? '0.1em' : 'normal',
      whiteSpace: 'nowrap'
    };
  };

  const nameFontClass = ''; // Managed via inline style now
  const detailFontClass = ''; // Managed via inline style now

  // Frame-defined per-field positions (admin set via drag)

  // Poster-relative defaults — frame positions take priority over hardcoded fallbacks
  const nameDefault = { x: framePos.name?.x || '5%', y: framePos.name?.y || (hasFrameApplied ? '80%' : '78%') };
  const businessNameDefault = { x: framePos.businessName?.x || '5%', y: framePos.businessName?.y || (hasFrameApplied ? '84%' : '82%') };
  const phoneDefault = { x: framePos.phone?.x || '5%', y: framePos.phone?.y || (hasFrameApplied ? '86%' : '85%') };
  const websiteDefault = { x: framePos.website?.x || '5%', y: framePos.website?.y || (hasFrameApplied ? '88%' : '88%') };
  const emailDefault = { x: framePos.email?.x || '5%', y: framePos.email?.y || (hasFrameApplied ? '90%' : '91%') };
  const addressDefault = { x: framePos.address?.x || '5%', y: framePos.address?.y || (hasFrameApplied ? '92%' : '94%') };
  const designationDefault = { x: framePos.designation?.x || '5%', y: framePos.designation?.y || (hasFrameApplied ? '96%' : '90%') };
  const gstDefault = { x: framePos.gst?.x || '5%', y: framePos.gst?.y || (hasFrameApplied ? '93%' : '96%') };
  const userPhotoDefault = { x: framePos.userPhoto?.x || '70%', y: framePos.userPhoto?.y || (hasFrameApplied ? '74%' : '70%') };
  const logoDefault = { x: framePos.logo?.x || '10%', y: framePos.logo?.y || (hasFrameApplied ? '80%' : '75%') };

  // Migration helper for old pixel-based data
  const migratePos = (val, defaultVal) => {
    if (!val) return defaultVal;
    if (typeof val === 'object') {
      const x = (!val.x || (typeof val.x === 'string' && !val.x.endsWith('%'))) ? '5%' : val.x;
      const y = (!val.y || (typeof val.y === 'string' && !val.y.endsWith('%'))) ? defaultVal : val.y;
      return { x, y };
    }
    return val;
  };

  const effectiveNamePos = migratePos(userData.namePos, nameDefault);
  const effectiveBusinessNamePos = migratePos(userData.businessNamePos, businessNameDefault);
  const effectivePhonePos = migratePos(userData.phonePos, phoneDefault);
  const effectiveWebsitePos = migratePos(userData.websitePos, websiteDefault);
  const effectiveEmailPos = migratePos(userData.emailPos, emailDefault);
  const effectiveAddressPos = migratePos(userData.addressPos, addressDefault);
  const effectiveGstPos = migratePos(userData.gstPos, gstDefault);

  const inlineSafeColorsForHtml2Canvas = (rootElement) => {
    if (!rootElement) return () => { };

    const elements = [rootElement, ...rootElement.querySelectorAll('*')];
    const updated = [];

    const colorProps = [
      'color',
      'background-color',
      'border-top-color',
      'border-right-color',
      'border-bottom-color',
      'border-left-color',
      'outline-color',
      'text-decoration-color',
      'caret-color',
      'fill',
      'stroke'
    ];

    const shadowProps = ['box-shadow', 'text-shadow'];

    elements.forEach((el) => {
      const computed = window.getComputedStyle(el);
      const previous = {};

      colorProps.forEach((prop) => {
        const value = computed.getPropertyValue(prop);
        if (!value) return;

        previous[prop] = el.style.getPropertyValue(prop);

        if (value.includes('oklab') || value.includes('oklch')) {
          const isBg = prop === 'background-color';
          // Check for lightness (first value in oklch)
          const lightnessMatch = value.match(/okl?ch\(([\d\.]+)/);
          const L = lightnessMatch ? parseFloat(lightnessMatch[1]) : (isBg ? 0 : 1);
          
          let fallback = '#000000';
          if (L > 0.6) fallback = '#ffffff';
          if (isBg) fallback = (L < 0.4) ? '#000000' : '#ffffff';
          
          el.style.setProperty(prop, fallback, 'important');
        } else {
          el.style.setProperty(prop, value, 'important');
        }
      });

      // Fix shadows
      shadowProps.forEach((prop) => {
        const value = computed.getPropertyValue(prop);
        if (!value) return;
        previous[prop] = el.style.getPropertyValue(prop);
        if (value.includes('oklab') || value.includes('oklch')) el.style.setProperty(prop, 'none', 'important');
        else el.style.setProperty(prop, value, 'important');
      });

      // Fix cqw units for html2canvas
      const containerWidth = rootElement.getBoundingClientRect().width;
      if (el.style.fontSize && el.style.fontSize.includes('cqw')) {
        previous.fontSize = el.style.fontSize;
        const val = parseFloat(el.style.fontSize);
        el.style.fontSize = `${(val * containerWidth) / 100}px`;
      }
      if (el.style.width && el.style.width.includes('cqw')) {
        previous.width = el.style.width;
        const val = parseFloat(el.style.width);
        el.style.width = `${(val * containerWidth) / 100}px`;
      }
      if (el.style.height && el.style.height.includes('cqw')) {
        previous.height = el.style.height;
        const val = parseFloat(el.style.height);
        el.style.height = `${(val * containerWidth) / 100}px`;
      }

      updated.push({ el, previous });
    });

    return () => {
      updated.forEach(({ el, previous }) => {
        Object.entries(previous).forEach(([prop, value]) => {
          if (value) {
            el.style.setProperty(prop, value);
          } else {
            el.style.removeProperty(prop);
          }
        });
      });
    };
  };

  const waitForImages = async (el) => {
    const imgs = Array.from(el.querySelectorAll('img'));
    await Promise.all(imgs.map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    }));
    await Promise.all(imgs.map(img => img.decode().catch(() => {})));
  };

  const handleDownload = async () => {
    const isVideo = currentTemplate.isVideo || currentTemplate.type === 'video' || isVideoUrl(currentTemplate.image);

    // If it's a video, redirect to the VideoEditor to ensure branding/frames are included
    if (isVideo && currentTemplate.videoUrl) {
      setAutoVideoDownload(true);
      setShowVideoEditor(true);
      return;
    }

    if (!posterRef.current || !window.html2canvas) {
      let downloadUrl = currentTemplate.image;
      if (downloadUrl.includes('cloudinary.com') && downloadUrl.includes('/upload/')) {
        downloadUrl = downloadUrl.replace('/upload/', '/upload/fl_attachment/');
      }
      window.open(downloadUrl, '_blank');
      return;
    }

    const currentTemplateId = currentTemplate._id;
    const recordDownload = async () => {
      try {
        if (user?.accessToken && currentTemplateId) {
          await axios.post(`${API_URL}/user/save-template`, 
            { templateId: currentTemplateId, customData: userData },
            { headers: { Authorization: `Bearer ${user.accessToken}` } }
          );
        }
      } catch (err) { console.error('Activity record failed'); }
    };

    recordDownload();
    await waitForImages(posterRef.current);
    const restoreStyles = inlineSafeColorsForHtml2Canvas(posterRef.current);

    try {
      const canvas = await window.html2canvas(posterRef.current, {
        useCORS: true,
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 15000
      });

      const link = document.createElement('a');
      const stamp = new Date().getTime();
      link.download = `my-design-${stamp}.png`;
      link.href = canvas.toDataURL('image/png'); 
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      let downloadUrl = currentTemplate.image;
      if (downloadUrl.includes('cloudinary.com') && downloadUrl.includes('/upload/')) {
        downloadUrl = downloadUrl.replace('/upload/', '/upload/fl_attachment/');
      }
      window.open(downloadUrl, '_blank');
    } finally {
      restoreStyles();
    }
  };

  const getPosterFile = async () => {
    if (!posterRef.current || !window.html2canvas) return null;
    const restoreStyles = inlineSafeColorsForHtml2Canvas(posterRef.current);
    try {
      const canvas = await window.html2canvas(posterRef.current, {
        useCORS: true,
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false
      });
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (!blob) {
            resolve(null);
            return;
          }
          const file = new File([blob], `poster-${Date.now()}.png`, { type: 'image/png' });
          resolve(file);
        }, 'image/png', 0.9);
      });
    } catch (error) {
      console.error('Error generating share file:', error);
      return null;
    } finally {
      restoreStyles();
    }
  };

  const handleWhatsApp = async () => {
    const isVideo = currentTemplate.isVideo || currentTemplate.type === 'video';
    const shareLink = `${API_URL}/share/poster/${currentTemplate._id}`;
    const userName = userData.name || globalUserData?.name || 'Dealingindia User';
    
    const message = `${userName}\n\nI created this ${isVideo ? 'video greeting' : 'greeting'} using Dealingindia Poster app. Download Dealingindia Poster now to create custom WhatsApp status -\n\n${shareLink}`;

    // On mobile, try sharing the file if it's an image
    // REMOVED navigator.share here to ensure WhatsApp button goes DIRECTLY to WhatsApp
    // The 'Share' button handles the native share dialog with multiple options.

    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };


  const handleShare = async () => {
    const isVideo = currentTemplate.isVideo || currentTemplate.type === 'video';
    const shareLink = `${API_URL}/share/poster/${currentTemplate._id}`;
    const userName = userData.name || globalUserData?.name || 'Dealingindia User';
    
    const message = `${userName}\n\nI created this ${isVideo ? 'video greeting' : 'greeting'} using Dealingindia Poster app. Download Dealingindia Poster now to create custom WhatsApp status -\n\n${shareLink}`;

    if (navigator.share) {
      try {
        const shareData = {
          title: isVideo ? 'Professional Video Poster' : 'Professional Poster',
          text: message,
        };

        // Try sharing file if image
        if (!isVideo && navigator.canShare) {
          const file = await getPosterFile();
          if (file && navigator.canShare({ files: [file] })) {
            shareData.files = [file];
            // When sharing files, some platforms ignore the 'url' field, so we include it in 'text'
          } else {
            shareData.url = shareLink;
          }
        } else {
          shareData.url = shareLink;
        }

        await navigator.share(shareData);
      } catch (err) {
        console.log('Share failed', err);
      }
    } else {
      handleWhatsApp();
    }
  };


  const renderSafeTitle = (val, fallback = 'Design') => {
    if (!val) return fallback;
    if (typeof val === 'string') return val;
    if (typeof val === 'object') {
      return val.en || val.hi || val.gu || val.mr || Object.values(val)[0] || fallback;
    }
    return fallback;
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-0 md:p-4 lg:p-8 overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        className="w-full h-[100dvh] md:h-auto md:max-h-[90dvh] md:max-w-[480px] md:rounded-[2.5rem] bg-white shadow-2xl overflow-hidden relative flex flex-col"
        initial={{ opacity: 0, y: '50%' }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        <div className="bg-[#b91c1c] px-4 flex items-center gap-4 text-white shrink-0" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))', paddingBottom: '0.75rem' }}>
          <button className="bg-transparent text-white p-2 -ml-2 flex items-center active:scale-95 transition-transform border-none outline-none cursor-pointer" onClick={onClose}>
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1 flex items-center gap-2 overflow-hidden">
            <h3 className="text-[1.1rem] font-bold truncate">{renderSafeTitle(currentTemplate.categoryId?.name || currentTemplate.category, 'Custom Poster')} 🌙</h3>
            <span className="text-[0.95rem] opacity-80 font-black tracking-tighter">({currentTemplate.categoryId?.templateCount || 0})</span>
          </div>
          <button
            onClick={() => window.open('https://www.dealingindia.com/landing', '_blank')}
            className="bg-[#fde047] text-[#854d0e] px-4 py-1.5 rounded-[4px] text-[0.7rem] font-black active:scale-95 transition-transform shadow-sm border-none uppercase tracking-tighter cursor-pointer"
          >
            Dealingindia
          </button>
        </div>

        <div className="bg-[#fff7ed] text-[#c2410c] p-2.5 px-4 text-center text-[0.8rem] font-bold border-b border-[#ffedd5] shrink-0">
          Premium Category Access. <strong className="cursor-pointer underline ml-1" onClick={() => window.open('https://www.dealingindia.com/landing', '_blank')}>Dealingindia</strong>
        </div>

        <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden bg-slate-50">
          <div className="bg-[#f1f5f9] flex items-center justify-center p-2 sm:p-3 lg:p-4 min-h-[400px]">
            {/* Captured Area — dual refs: posterRef for canvas export, posterContainerRef for drag math */}
            <div
              ref={(el) => { posterRef.current = el; posterContainerRef.current = el; }}
              className="relative w-full rounded-lg overflow-hidden shadow-2xl border border-[#e2e8f0] flex flex-col"
              style={{ backgroundColor: '#ffffff' }}
            >
              {/* Inner square image area */}
              <div className="relative w-full aspect-square overflow-hidden">
                {/* Dealing India Branding Badge */}
                <div
                  className="absolute top-[3%] right-[3%] z-[95] flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-black/10 shadow-lg pointer-events-none"
                >
                  <img src="/dealing-india-logo.png" className="w-8 h-8 object-contain" alt="DI" crossOrigin="anonymous" />
                  <span className="text-black font-black tracking-tighter text-sm uppercase whitespace-nowrap">Dealingindia</span>

                </div>
                {/* Poster Background */}
                {(currentTemplate.type === 'video' || currentTemplate.isVideo || isVideoUrl(currentTemplate.image)) ? (
                  <div className="w-full h-full relative z-[1]">
                    <video
                      src={currentTemplate.videoUrl || currentTemplate.image}
                      className="w-full h-full object-cover"
                      autoPlay={isPlaying}
                      loop
                      muted={false}
                      playsInline
                    />
                    {!isPlaying && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-[5]">
                        <button
                          onClick={() => setIsPlaying(true)}
                          className="p-4 bg-white/20 backdrop-blur-md rounded-full text-white shadow-2xl scale-110 active:scale-95 transition-transform"
                        >
                          <Play size={48} fill="white" className="ml-2" />
                        </button>
                      </div>
                    )}
                    {isPlaying && (
                      <button
                        onClick={() => setIsPlaying(false)}
                        className="absolute bottom-4 right-4 z-[85] p-2 bg-black/40 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={20} />
                      </button>
                    )}

                    {/* Audio for image+music */}
                    {!currentTemplate.videoUrl && currentTemplate.audioUrl && isPlaying && (
                      <audio src={currentTemplate.audioUrl} autoPlay loop />
                    )}
                  </div>
                ) : (
                  <img
                    src={currentTemplate.image}
                    alt={currentTemplate.title}
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover relative z-[1]"
                  />
                )}

                {/* Frame Layer removed from here as per request - now used as footer bg */}

                {/* ── Draggable Text Layer ── */}
                <div className="text-layer absolute inset-0 z-[75]">
                  {/* Branding fields removed from image layer as they are now in the footer */}

                  {/* Extra Texts (non-draggable, managed via editor) */}
                  {userData.extraTexts?.map(t => (
                    <div key={t.id} className="absolute font-black pointer-events-none" style={{ left: t.x || '40%', top: t.y || '40%', color: t.color, fontSize: `${t.size}px`, textShadow: '0 2px 4px rgba(0,0,0,0.8)', zIndex: 90, whiteSpace: 'nowrap' }}>
                      {t.text}
                    </div>
                  ))}
                </div>

                {/* ── Draggable Photos Layer ── */}
                <div className="absolute inset-0 z-[80]">

                  {/* Branding photos removed from image layer */}

                  {/* Extra Photos (non-draggable here) */}
                  {userData.extraPhotos?.map(p => (
                    <div key={p.id} className="absolute pointer-events-none" style={{ left: p.x ?? '50%', top: p.y ?? '30%', width: `${p.size || 20}%`, height: 'auto', aspectRatio: '1/1', zIndex: 82 }}>
                      <img src={p.url} className="w-full h-full object-cover rounded shadow-xl border-2 border-white" crossOrigin="anonymous" />
                    </div>
                  ))}
                  {userData.stickers?.map(s => (
                    <div key={s.id} className="absolute pointer-events-none" style={{ left: s.x ?? '20%', top: s.y ?? '20%', width: `${s.size || 15}%`, height: 'auto', aspectRatio: '1/1', zIndex: 80 }}>
                      <img src={s.url} className="w-full h-full object-contain" crossOrigin="anonymous" />
                    </div>
                  ))}
                </div>


                {/* Branding Overlay (when frame applied) */}
                {activeFrame && (
                  <BrandingOverlay
                    userData={userData}
                    size="regular"
                    isOverlay={true}
                    activeFrame={activeFrame}
                    frameStyle={frameStyle}
                  />
                )}
              </div>
              
              {/* Branding Info (footer mode when no frame) */}
              {!activeFrame && (
                <BrandingOverlay
                  userData={userData}
                  size="regular"
                  isOverlay={false}
                  activeFrame={activeFrame}
                  frameStyle={frameStyle}
                />
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons - Repositioned just after image end */}
        <div className="flex justify-around items-center py-4 px-2 bg-white border-b border-slate-100 shadow-sm">
          <ActionIcon
            icon={Edit2}
            label="Edit"
            color="#6366f1"
            onClick={() =>
              onEdit({
                ...template,
                customData: {
                  ...(template.customData || {}),
                  selectedFrame: activeFrame || null
                }
              })
            }
          />
          <ActionIcon icon={Video} label="Video" color="#f43f5e" onClick={() => setShowVideoEditor(true)} />
          <ActionIcon icon={Download} label="Save" color="#475569" onClick={handleDownload} />
          <ActionIcon icon={MessageCircle} label="WhatsApp" color="#22c55e" onClick={handleWhatsApp} />
          <ActionIcon icon={Share2} label="Share" color="#f59e0b" onClick={handleShare} />
        </div>

        {/* Frame Selection - Moved below actions */}
        <div className="px-5 py-6">
          <h4 className="text-[0.7rem] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Select Frame Overlay</h4>
          <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-1">
            <div className={`min-w-[70px] h-[70px] rounded-2xl flex items-center justify-center border-2 cursor-pointer transition-all ${!selectedFrame ? 'border-primary bg-indigo-50/50 shadow-md' : 'border-slate-100 bg-slate-50/50'}`} onClick={() => setSelectedFrame(null)}>
              <div className="w-8 h-8 rounded-full border-2 border-slate-300 relative flex items-center justify-center"><div className="w-10 h-[2px] bg-slate-300 rotate-45 absolute" /></div>
            </div>
            {frames.map(frame => (
              <div key={frame._id} className={`min-w-[70px] h-[70px] rounded-2xl overflow-hidden border-2 cursor-pointer transition-all ${activeFrame === frame.image ? 'border-primary scale-95 shadow-md shadow-indigo-100' : 'border-slate-100 opacity-80'}`} onClick={() => setSelectedFrame(frame.image)}>
                <img src={frame.image} className="w-full h-full object-fill" />
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showVideoEditor && (
          <VideoEditor
            template={template}
            userData={{
              ...userData,
              selectedFrame: activeFrame,
              namePos: localPos.name || userData.namePos,
              businessNamePos: localPos.business_name || userData.businessNamePos,
              phonePos: localPos.phone || userData.phonePos,
              websitePos: localPos.website || userData.websitePos,
              emailPos: localPos.email || userData.emailPos,
              addressPos: localPos.address || userData.addressPos,
              gstPos: localPos.gst || userData.gstPos,
              userPhotoPos: localPos.photo || userData.userPhotoPos,
              logoPos: localPos.logo || userData.logoPos
            }}
            autoStartDownload={autoVideoDownload}
            onClose={() => {
              setShowVideoEditor(false);
              setAutoVideoDownload(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
export default PosterDetail;
