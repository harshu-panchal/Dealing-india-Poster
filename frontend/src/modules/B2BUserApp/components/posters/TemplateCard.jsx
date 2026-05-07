import React from 'react';
import axios from 'axios';
import { Edit2, Download, MessageCircle, Share2, Sparkles, Video, PlayCircle, Volume2, Heart, X } from 'lucide-react';
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
  const activeFrame = template.customData ? normalizeFrameValue(effectiveUserData.selectedFrame) : null;

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

  const fixUnsupportedColors = (rootElement) => {
    if (!rootElement) return;
    const elements = [rootElement, ...rootElement.querySelectorAll('*')];
    elements.forEach((el) => {
      const computedStyle = window.getComputedStyle(el);
      const color = computedStyle.color;
      const bgColor = computedStyle.backgroundColor;
      if (color && (color.includes('oklab') || color.includes('oklch'))) el.style.color = '#000000';
      if (bgColor && (bgColor.includes('oklab') || bgColor.includes('oklch'))) el.style.backgroundColor = '#ffffff';
    });
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    if (!cardRef.current || !window.html2canvas) {
      window.open(currentTemplate.image, '_blank');
      return;
    }
    recordActivity();
    try {
      fixUnsupportedColors(cardRef.current);
      const canvas = await window.html2canvas(cardRef.current, {
        useCORS: true,
        scale: 3,
        backgroundColor: '#ffffff',
        logging: false
      });
      const link = document.createElement('a');
      link.download = `my-design-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Card download failed:', err);
      window.open(currentTemplate.image, '_blank');
    }
  };

  const handleWhatsApp = (e) => {
    e.stopPropagation();
    recordActivity();
    const platformLink = window.location.origin;
    const isVideo = currentTemplate.isVideo || currentTemplate.type === 'video';
    const posterLink = `${platformLink}/?templateId=${currentTemplate._id}`;

    const message = isVideo
      ? `Check out this professional video poster I created! 🎬✨\n\nPoster: ${posterLink}\nPlatform: ${platformLink}\n\nCreate your own with Dealingindia Poster!`
      : `Check out this professional poster I created! 🎨✨\n\nPoster: ${posterLink}\nPlatform: ${platformLink}\n\nCreate your own with Dealingindia Poster!`;

    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    recordActivity();
    const platformLink = window.location.origin;
    const isVideo = currentTemplate.isVideo || currentTemplate.type === 'video';
    const posterLink = `${platformLink}/?templateId=${currentTemplate._id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: isVideo ? 'Professional Video Poster' : 'Professional Poster',
          text: `Check out this ${isVideo ? 'video poster' : 'poster'} from Dealingindia Poster!`,
          url: posterLink,
        });
      } catch (err) {
        console.log('Share failed');
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
        className="min-w-[130px] w-[130px] aspect-square rounded-md overflow-hidden bg-[#f1f5f9] relative cursor-pointer transition-transform active:scale-95 shadow-sm"
        onClick={() => handleAction(new Event('click'), onClick)}
      >
        <img
          src={currentTemplate.image}
          alt={currentTemplate.title}
          className="w-full h-full object-cover relative z-[1]"
          onError={handleImageError}
        />
        {activeFrame && (
          <img
            src={activeFrame}
            className="absolute inset-0 w-full h-full object-fill pointer-events-none z-[60]"
            alt="Frame Overlay"
            crossOrigin="anonymous"
          />
        )}
        {overlay || <BrandingOverlay userData={effectiveUserData} size="compact" />}
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
    <div className="bg-white rounded-xl shadow-sm border border-[#f1f5f9] overflow-hidden group transition-all hover:shadow-md hover:-translate-y-1 mb-4" ref={cardRef}>
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
      <div
        className="w-full aspect-square overflow-hidden relative cursor-pointer group"
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
            className="w-full h-full object-cover relative z-[1]"
            onError={handleImageError}
          />
        )}

        {!currentTemplate.videoUrl && currentTemplate.audioUrl && isPlaying && (
          <audio src={currentTemplate.audioUrl} autoPlay loop />
        )}

        {/* Dealing India Branding Badge removed from here as per request */}

        {activeFrame && (
          <>
            <img
              src={activeFrame}
              className="absolute inset-0 w-full h-full object-fill pointer-events-none z-[60]"
              alt="Frame Overlay"
              crossOrigin="anonymous"
            />
            {/* ── DESIGN FRAME TEXT LAYER (Only for Saved/Edited Posters) ── */}
            {template.customData && (
              <div className="absolute inset-0 z-[70] pointer-events-none">
                {effectiveUserData.enabledFields?.name !== false && (
                  <span
                    className="absolute font-black text-white uppercase tracking-tight whitespace-nowrap"
                    style={{
                      left: effectiveUserData.namePos?.x || framePos.name?.x || '5%',
                      top: effectiveUserData.namePos?.y || framePos.name?.y || '80%',
                      fontSize: '4.5cqw',
                      textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                      lineHeight: 1
                    }}
                  >
                    {effectiveUserData.name || ''}
                  </span>
                )}

                {/* Logo */}
                {effectiveUserData.enabledFields?.logo !== false && effectiveUserData.logo && (
                  <div
                    className="absolute overflow-hidden"
                    style={{
                      left: effectiveUserData.logoPos?.x || framePos.logo?.x || '75%',
                      top: effectiveUserData.logoPos?.y || framePos.logo?.y || '10%',
                      width: '12cqw',
                      height: '12cqw',
                      zIndex: 72
                    }}
                  >
                    <img src={effectiveUserData.logo} className="w-full h-full object-contain" alt="" />
                  </div>
                )}

                {/* User Photo */}
                {effectiveUserData.enabledFields?.userPhoto !== false && effectiveUserData.userPhoto && (
                  <div
                    className="absolute overflow-hidden rounded-full border border-white/20 shadow-sm"
                    style={{
                      left: effectiveUserData.userPhotoPos?.x || effectiveUserData.photoPos?.x || framePos.userPhoto?.x || '10%',
                      top: effectiveUserData.userPhotoPos?.y || effectiveUserData.photoPos?.y || framePos.userPhoto?.y || '10%',
                      width: '12cqw',
                      height: '12cqw',
                      zIndex: 72
                    }}
                  >
                    <img src={effectiveUserData.userPhoto} className="w-full h-full object-cover" alt="" />
                  </div>
                )}

                {effectiveUserData.enabledFields?.business_name !== false && (
                  <span
                    className="absolute font-black text-white/90 uppercase tracking-tight whitespace-nowrap"
                    style={{
                      left: effectiveUserData.businessNamePos?.x || framePos.business_name?.x || '5%',
                      top: effectiveUserData.businessNamePos?.y || framePos.business_name?.y || '85%',
                      fontSize: '3.8cqw',
                      textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                      lineHeight: 1
                    }}
                  >
                    {effectiveUserData.business_name || ''}
                  </span>
                )}
                {effectiveUserData.phone_number && (
                  <span
                    className="absolute font-black text-white/90 whitespace-nowrap"
                    style={{
                      left: effectiveUserData.phonePos?.x || framePos.phone?.x || '5%',
                      top: effectiveUserData.phonePos?.y || framePos.phone?.y || '90%',
                      fontSize: '3.2cqw',
                      textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                      lineHeight: 1
                    }}
                  >
                    {effectiveUserData.phone_number}
                  </span>
                )}

                {/* Website */}
                {effectiveUserData.website && (
                  <span
                    className="absolute font-bold text-white/90 whitespace-nowrap text-right"
                    style={{
                      right: '5%',
                      left: effectiveUserData.websitePos?.x || framePos.website?.x || 'auto',
                      top: effectiveUserData.websitePos?.y || framePos.website?.y || '88%',
                      fontSize: '2.8cqw',
                      textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                      lineHeight: 1
                    }}
                  >
                    {effectiveUserData.website}
                  </span>
                )}

                {/* Email */}
                {effectiveUserData.email && (
                  <span
                    className="absolute font-bold text-white/80 whitespace-nowrap text-right"
                    style={{
                      right: '5%',
                      left: effectiveUserData.emailPos?.x || framePos.email?.x || 'auto',
                      top: effectiveUserData.emailPos?.y || framePos.email?.y || '91.5%',
                      fontSize: '2.5cqw',
                      textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                      lineHeight: 1
                    }}
                  >
                    {effectiveUserData.email}
                  </span>
                )}

                {/* Address */}
                {effectiveUserData.businessAddress && (
                  <span
                    className="absolute font-bold text-white/90 whitespace-nowrap text-right"
                    style={{
                      right: '5%',
                      left: effectiveUserData.addressPos?.x || framePos.address?.x || 'auto',
                      top: effectiveUserData.addressPos?.y || framePos.address?.y || '84%',
                      fontSize: '2.8cqw',
                      textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                      lineHeight: 1
                    }}
                  >
                    {effectiveUserData.businessAddress}
                  </span>
                )}

                {/* GST */}
                {(effectiveUserData.enabledFields?.gst || (effectiveUserData.gst_number || '').trim()) && (
                  <span
                    className="absolute font-black text-white/90 uppercase tracking-tight whitespace-nowrap"
                    style={{
                      left: effectiveUserData.gstPos?.x || framePos.gst?.x || '5%',
                      top: effectiveUserData.gstPos?.y || framePos.gst?.y || '93%',
                      fontSize: '3cqw',
                      textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                      lineHeight: 1
                    }}
                  >
                    {effectiveUserData.gst_number}
                  </span>
                )}
                {/* Extra Texts */}
                {effectiveUserData.extraTexts?.map(t => (
                  <div 
                    key={t.id} 
                    className="absolute font-black pointer-events-none" 
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
                    className="absolute pointer-events-none" 
                    style={{ 
                      left: p.x ?? '50%', 
                      top: p.y ?? '30%', 
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
                    className="absolute pointer-events-none" 
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
            )}
          </>
        )}

        {isVideoTemplate && !isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-[65]">
            <button
              onClick={handlePlayClick}
              className="p-3 bg-white/20 backdrop-blur-md rounded-full hover:scale-110 active:scale-95 transition-all"
            >
              <PlayCircle size={48} className="text-white fill-white/20" />
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
      </div>

      {/* Branding Info - Restored Home Page logic */}
      {(template.customData ? !activeFrame : true) && (overlay || <BrandingOverlay userData={effectiveUserData} size="regular" isOverlay={false} />)}

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
