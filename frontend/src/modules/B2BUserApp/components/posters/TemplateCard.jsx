import React from 'react';
import axios from 'axios';
import { Edit2, Download, MessageCircle, Share2, Sparkles, Video, PlayCircle, Play, Pause, Volume2, Heart, X } from 'lucide-react';
import { useEditor } from '../../context/EditorContext';
import { useAuth } from '../../context/AuthContext';
import BrandingOverlay from './BrandingOverlay';

const TemplateCard = ({ template, onClick, variant = 'regular', overlay, showActions = true }) => {
  const { openEditor, userData, likedTemplates, toggleLike, frames } = useEditor();
  const { user } = useAuth();
  const [localLikeCount, setLocalLikeCount] = React.useState(template.likeCount || 0);
  const [isPlaying, setIsPlaying] = React.useState(false);

  React.useEffect(() => {
    setLocalLikeCount(template.likeCount || 0);
  }, [template]);

  // Stop playback on unmount
  React.useEffect(() => {
    return () => setIsPlaying(false);
  }, []);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5003/api';

  const cleanUrl = (url) => {
    if (!url || url.includes('default_logo.png')) return null;
    return url;
  };

  const isVideoUrl = (url) => {
    if (!url) return false;
    return url.match(/\.(mp4|webm|mov|ogg)$/i) || url.includes('/video/upload/') || url.includes('/video/upload/');
  };
  const normalizeFrameValue = (frame) => {
    if (!frame) return null;
    if (typeof frame === 'string') return frame;
    if (typeof frame === 'object') return frame.image || frame.url || null;
    return null;
  };

  const getTemplateData = () => {
    if (template.templateId && typeof template.templateId === 'object') return template.templateId;
    return template;
  };

  const currentTemplate = getTemplateData();
  const isLiked = likedTemplates.has(currentTemplate?._id);
  const rawUserData = template.customData || userData;
  const effectiveUserData = {
    ...rawUserData,
    logo: cleanUrl(rawUserData.logo),
    userPhoto: cleanUrl(rawUserData.userPhoto)
  };
  // Only read selectedFrame from THIS template's own saved customData.
  // NEVER fall back to global userData.selectedFrame — that would pollute all cards.
  const defaultFrame = (frames && frames.length > 0) ? (frames[0].image || frames[0].url) : null;
  const activeFrame = (template.customData ? normalizeFrameValue(effectiveUserData.selectedFrame) : null) || defaultFrame;

  // Dynamic position fallbacks from the frame object itself (for Saved Posters)
  const activeFrameObj = (frames || []).find(f => normalizeFrameValue(f) === activeFrame);
  const framePos = activeFrameObj?.textStyle?.positions || {};

  const handleImageError = (e) => {
    e.target.src = 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=400';
  };

  const recordActivity = async () => {
    try {
      if (user?.accessToken && currentTemplate?._id) {
        await axios.post(`${API_URL}/user/save-template`,
          {
            templateId: currentTemplate._id,
            customData: effectiveUserData
          },
          { headers: { Authorization: `Bearer ${user.accessToken}` } }
        );
      }
    } catch (err) {
      console.error('Failed to record activity:', err);
    }
  };

  const onLikeClick = async (e) => {
    const wasLiked = isLiked;
    await toggleLike(currentTemplate._id, e);
    // Adjust local count conservatively
    setLocalLikeCount(prev => wasLiked ? Math.max(0, prev - 1) : prev + 1);
  };

  const cardRef = React.useRef(null);

  const inlineSafeColorsForHtml2Canvas = (rootElement) => {
    if (!rootElement) return () => { };
    const elements = [rootElement, ...rootElement.querySelectorAll('*')];
    const updated = [];
    const colorProps = ['color', 'background-color', 'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color', 'fill', 'stroke'];
    const shadowProps = ['box-shadow', 'text-shadow'];
    const containerWidth = rootElement.getBoundingClientRect().width;

    elements.forEach((el) => {
      const computed = window.getComputedStyle(el);
      const previous = {};
      
      // Fix colors
      colorProps.forEach((prop) => {
        const value = computed.getPropertyValue(prop);
        if (!value) return;
        previous[prop] = el.style.getPropertyValue(prop);
        if (value.includes('oklab') || value.includes('oklch')) {
          const lMatch = value.match(/okl?ch\(([\d\.]+)/);
          const L = lMatch ? parseFloat(lMatch[1]) : (prop === 'background-color' ? 0 : 1);
          const fallback = (prop === 'background-color') ? (L < 0.4 ? '#000000' : '#ffffff') : (L > 0.6 ? '#ffffff' : '#000000');
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
          if (value) el.style.setProperty(prop, value);
          else el.style.removeProperty(prop);
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
    // Also wait for decode to be safe
    await Promise.all(imgs.map(img => img.decode().catch(() => {})));
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    const isVideoTemplate = currentTemplate.isVideo || currentTemplate.type === 'video';

    // If it's a video template, open the detail view so the user can generate it with branding
    if (isVideoTemplate && currentTemplate.videoUrl) {
      onClick();
      return;
    }

    // If no html2canvas or card ref available, fallback to raw URL
    if (!cardRef.current || !window.html2canvas) {
      let downloadUrl = currentTemplate.image;
      if (downloadUrl.includes('cloudinary.com') && downloadUrl.includes('/upload/')) {
        downloadUrl = downloadUrl.replace('/upload/', '/upload/fl_attachment/');
      }
      window.open(downloadUrl, '_blank');
      return;
    }
    recordActivity();
    await waitForImages(cardRef.current);
    const restoreStyles = inlineSafeColorsForHtml2Canvas(cardRef.current);
    try {
      const canvas = await window.html2canvas(cardRef.current, {
        useCORS: true,
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 15000,
      });
      const link = document.createElement('a');
      link.download = `my-design-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Card download failed:', err);
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
    const restoreStyles = inlineSafeColorsForHtml2Canvas(cardRef.current);
    try {
      const canvas = await window.html2canvas(cardRef.current, {
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

  const handleWhatsApp = async (e) => {
    e.stopPropagation();
    recordActivity();
    const isVideo = currentTemplate.isVideo || currentTemplate.type === 'video';
    const shareLink = `${API_URL}/share/poster/${currentTemplate._id}`;
    const userName = effectiveUserData.name || userData?.name || 'Dealingindia User';
    
    const message = `${userName}\n\nI created this ${isVideo ? 'video greeting' : 'greeting'} using Dealingindia Poster app. Download Dealingindia Poster now to create custom WhatsApp status -\n\n${shareLink}`;

    // If it's a video, we usually want them to go to the detail view to generate it
    if (isVideo) {
      onClick();
      return;
    }

    // Directly open WhatsApp share
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };


  const handleShare = async (e) => {
    e.stopPropagation();
    recordActivity();
    const isVideo = currentTemplate.isVideo || currentTemplate.type === 'video';
    const shareLink = `${API_URL}/share/poster/${currentTemplate._id}`;
    const userName = effectiveUserData.name || userData?.name || 'Dealingindia User';
    
    const message = `${userName}\n\nI created this ${isVideo ? 'video greeting' : 'greeting'} using Dealingindia Poster app. Download Dealingindia Poster now to create custom WhatsApp status -\n\n${shareLink}`;

    if (navigator.share) {
      try {
        const shareData = {
          title: isVideo ? 'Professional Video Poster' : 'Professional Poster',
          text: message,
        };

        if (isVideo) {
           shareData.url = shareLink;
        } else if (navigator.canShare) {
          const file = await getPosterFile();
          if (file && navigator.canShare({ files: [file] })) {
            shareData.files = [file];
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
      handleWhatsApp(e);
    }
  };

  const handleAction = (e, callback) => {
    e.stopPropagation();
    recordActivity();
    if (callback) callback();
  };

  if (variant === 'compact') {
    return (
      <div
        className="min-w-[130px] w-[130px] rounded-md overflow-hidden bg-white relative cursor-pointer transition-transform active:scale-95 shadow-sm flex flex-col"
        onClick={() => handleAction(new Event('click'), onClick)}
      >
        <div className="w-full aspect-square relative overflow-hidden bg-[#f1f5f9]">
          <img
            src={currentTemplate.image}
            alt={currentTemplate.title}
            className="w-full h-full object-cover relative z-[1]"
            onError={handleImageError}
          />
          {activeFrame && (
            overlay || <BrandingOverlay userData={effectiveUserData} size="compact" activeFrame={activeFrame} isOverlay={true} frameStyle={activeFrameObj?.textStyle} />
          )}
        </div>
        {!activeFrame && (
          overlay || <BrandingOverlay userData={effectiveUserData} size="compact" activeFrame={activeFrame} isOverlay={false} frameStyle={activeFrameObj?.textStyle} />
        )}
      </div>
    );
  }

  const isVideoTemplate = currentTemplate.isVideo || currentTemplate.type === 'video';

  const handlePlayClick = (e) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
  };

  const renderTitle = (title, name) => {
    const val = title || name;
    if (!val) return 'New Design';
    if (typeof val === 'string') return val;
    if (typeof val === 'object') {
      return val.en || val.hi || val.gu || val.mr || Object.values(val)[0] || 'New Design';
    }
    return 'New Design';
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-[#f1f5f9] overflow-hidden group transition-all hover:shadow-lg hover:-translate-y-1 mb-4">
      {/* Poster Heading with Like Button */}
      <div className="flex items-center justify-between px-3 py-2 bg-white">
        <h3 className="text-[0.75rem] font-black text-slate-800 uppercase tracking-wider truncate max-w-[70%]">
          {renderTitle(currentTemplate.title, currentTemplate.name)}
        </h3>
        <button
          onClick={onLikeClick}
          className="flex items-center gap-1 hover:scale-105 active:scale-95 transition-all bg-transparent border-none cursor-pointer"
        >
          <Heart size={16} className={isLiked ? 'fill-red-500 text-red-500' : 'text-slate-300'} />
          {localLikeCount > 0 && (
            <span className={`text-[10px] font-black ${isLiked ? 'text-red-500' : 'text-slate-400'}`}>{localLikeCount}</span>
          )}
        </button>
      </div>
      <div ref={cardRef} className="relative bg-white flex flex-col">
        <div
          className="w-full aspect-square overflow-hidden relative cursor-pointer group flex-shrink-0"
          style={{ backgroundColor: '#f8fafc', containerType: 'inline-size' }}
          onClick={() => handleAction(new Event('click'), onClick)}
        >
        {(isVideoTemplate && (currentTemplate.videoUrl || isVideoUrl(currentTemplate.image))) ? (
          <div className="w-full h-full relative">
            <video
              src={currentTemplate.videoUrl || currentTemplate.image}
              className="w-full h-full object-cover relative z-[1]"
              autoPlay
              loop
              muted
              playsInline
            />
            {isPlaying && (
              <>
                <video
                  src={currentTemplate.videoUrl || currentTemplate.image}
                  className="absolute inset-0 w-full h-full object-cover z-[2]"
                  autoPlay
                  loop
                  muted={false}
                  playsInline
                />
                <div className="absolute inset-0 flex items-center justify-center z-[10]">
                  <button
                    onClick={(e) => { e.stopPropagation(); setIsPlaying(false); }}
                    className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={32} />
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <img
            src={currentTemplate.image}
            alt={currentTemplate.title}
            loading="lazy"
            crossOrigin="anonymous"
            className="w-full h-full object-cover relative z-[1]"
            onError={handleImageError}
          />
        )}

        {!currentTemplate.videoUrl && currentTemplate.audioUrl && isPlaying && (
          <audio src={currentTemplate.audioUrl} autoPlay loop />
        )}

        {/* Dealing India Branding Badge */}
        <div
          className="absolute top-[3%] right-[3%] z-[95] flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-full border border-black/10 shadow-lg pointer-events-none"
        >
          <img src="/dealing-india-logo.png" className="w-6 h-6 object-contain" alt="DI" crossOrigin="anonymous" />
          <span className="text-black font-black tracking-tighter text-[10px] uppercase whitespace-nowrap">Dealingindia</span>
        </div>

        {/* Frame Layer removed from here as per request - now used as footer bg */}
        {/* ── Extra Content Layer (Stickers, Photos, Extra Texts) ── */}
        <div className="absolute inset-0 z-[70] pointer-events-none">
          {/* Extra Texts */}
          {effectiveUserData.extraTexts?.map(t => (
            <div
              key={t.id}
              className="absolute font-black"
              style={{
                left: t.x ?? '40%',
                top: t.y ?? '40%',
                color: t.color,
                fontSize: `calc(${t.size}px * 0.25)`, // Scale for card size
                textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                zIndex: 90,
                whiteSpace: 'nowrap'
              }}
            >
              {t.text}
            </div>
          ))}

          {/* Extra Photos */}
          {effectiveUserData.extraPhotos?.map(p => (
            <div
              key={p.id}
              className="absolute overflow-hidden"
              style={{
                left: p.x || '40%',
                top: p.y || '40%',
                width: `${p.size || 20}cqw`,
                height: `${p.size || 20}cqw`,
                zIndex: 82
              }}
            >
              <img src={p.url} className="w-full h-full object-cover rounded shadow-xl border-2 border-white" crossOrigin="anonymous" />
            </div>
          ))}

          {/* Stickers */}
          {effectiveUserData.stickers?.map(s => (
            <div
              key={s.id}
              className="absolute"
              style={{
                left: s.x ?? '20%',
                top: s.y ?? '20%',
                width: `${s.size || 15}cqw`,
                height: `${s.size || 15}cqw`,
                zIndex: 80
              }}
            >
              <img src={s.url} className="w-full h-full object-contain" crossOrigin="anonymous" />
            </div>
          ))}
        </div>
        
        {isVideoTemplate && !isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-[65]">
            <button
              onClick={handlePlayClick}
              className="p-3 bg-white/20 backdrop-blur-md rounded-full hover:scale-110 active:scale-95 transition-all"
            >
              <Play size={32} fill="white" className="ml-1 text-white" />
            </button>
            <div className="absolute bottom-3 right-3 p-1.5 rounded-full bg-black/40 backdrop-blur-sm">
              <Volume2 size={16} className="text-white" />
            </div>
          </div>
        )}

        {isVideoTemplate && isPlaying && (
          <div className="absolute top-3 right-3 z-[65]">
            <button
              onClick={handlePlayClick}
              className="p-1.5 bg-black/40 backdrop-blur-sm rounded-full text-white"
            >
              <Volume2 size={16} />
            </button>
          </div>
        )}
        
        {/* Branding Overlay (when frame applied) */}
        {activeFrame && (
           overlay || <BrandingOverlay userData={effectiveUserData} size="regular" isOverlay={true} activeFrame={activeFrame} frameStyle={activeFrameObj?.textStyle} />
        )}
      </div>

        {/* Branding Info (footer mode when no frame) */}
        {!activeFrame && (
           overlay || <BrandingOverlay userData={effectiveUserData} size="regular" isOverlay={false} activeFrame={activeFrame} frameStyle={activeFrameObj?.textStyle} />
        )}
      </div>

      {(variant === 'regular' && showActions) && (
        <div className="flex justify-around py-3 lg:py-4 border-t border-[#f1f5f9] bg-white rounded-b-xl shadow-sm">
          <div className="flex flex-col items-center gap-1.5 flex-1 cursor-pointer hover:scale-105 active:scale-90 transition-all group" onClick={(e) => handleAction(e, onClick)}>
            <div className="w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center text-[#334155] group-hover:text-primary"><Edit2 size={20} className="lg:w-6 lg:h-6" /></div>
            <span className="text-[0.75rem] lg:text-sm font-bold text-[#64748b] group-hover:text-primary">Edit</span>
          </div>

          {!isVideoTemplate && (
            <div className="flex flex-col items-center gap-1.5 flex-1 cursor-pointer hover:scale-105 active:scale-90 transition-all group" onClick={(e) => handleAction(e, () => openEditor(template, 'video'))}>
              <div className="w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center text-[#ef4444] group-hover:text-red-600"><Video size={20} className="lg:w-6 lg:h-6" /></div>
              <span className="text-[0.75rem] lg:text-sm font-bold text-[#64748b] group-hover:text-red-600">Video</span>
            </div>
          )}

          <div className="flex flex-col items-center gap-1.5 flex-1 cursor-pointer hover:scale-105 active:scale-90 transition-all group" onClick={handleDownload}>
            <div className="w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center text-[#334155] group-hover:text-primary"><Download size={20} className="lg:w-6 lg:h-6" /></div>
            <span className="text-[0.75rem] lg:text-sm font-bold text-[#64748b] group-hover:text-primary">Save</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 flex-1 cursor-pointer hover:scale-105 active:scale-90 transition-all group" onClick={handleWhatsApp}>
            <div className="w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center text-[#22c55e] group-hover:text-green-600"><MessageCircle size={20} className="lg:w-6 lg:h-6" /></div>
            <span className="text-[0.75rem] lg:text-sm font-bold text-[#64748b] group-hover:text-green-600">WhatsApp</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 flex-1 cursor-pointer hover:scale-105 active:scale-90 transition-all group" onClick={handleShare}>
            <div className="w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center text-[#334155] group-hover:text-primary"><Share2 size={20} className="lg:w-6 lg:h-6" /></div>
            <span className="text-[0.75rem] lg:text-sm font-bold text-[#64748b] group-hover:text-primary">Share</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateCard;
