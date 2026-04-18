import React from 'react';
import axios from 'axios';
import { Edit2, Download, MessageCircle, Share2, Sparkles, Video, PlayCircle, Volume2, Heart } from 'lucide-react';
import { useEditor } from '../../context/EditorContext';
import { useAuth } from '../../context/AuthContext';
import BrandingOverlay from './BrandingOverlay';

const TemplateCard = ({ template, onClick, variant = 'regular', overlay, showActions = true }) => {
  const { openEditor, userData } = useEditor();
  const { user } = useAuth();
  const [isLiked, setIsLiked] = React.useState(false);
  const [localLikeCount, setLocalLikeCount] = React.useState(template.likeCount || 0);

  React.useEffect(() => {
    if (template.isLiked !== undefined) {
      setIsLiked(template.isLiked);
    }
  }, [template]);
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5003/api';

  const cleanUrl = (url) => {
    if (!url || url.includes('default_logo.png')) return null;
    return url;
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
  const rawUserData = template.customData || userData;
  const effectiveUserData = {
    ...rawUserData,
    logo: cleanUrl(rawUserData.logo),
    userPhoto: cleanUrl(rawUserData.userPhoto)
  };
  const activeFrame = normalizeFrameValue(effectiveUserData.selectedFrame);

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

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user?.accessToken) return;
    try {
      const { data } = await axios.post(`${API_URL}/user/templates/${currentTemplate._id}/like`, {}, {
        headers: { Authorization: `Bearer ${user.accessToken}` }
      });
      setIsLiked(data.liked);
      setLocalLikeCount(prev => data.liked ? prev + 1 : prev - 1);
    } catch (err) {
      console.error('Like failed:', err);
    }
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
    const text = encodeURIComponent(`Check out this professional poster: ${currentTemplate.image}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    recordActivity();
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentTemplate.name || 'Professional Poster',
          text: 'Check out this design from Dealing India Poster',
          url: window.location.href,
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

  return (
    <div className="bg-white mb-1 overflow-hidden">
      {/* Poster Heading with Like Button */}
      <div className="flex items-center justify-between px-3 py-2 bg-white">
        <h3 className="text-[0.75rem] font-black text-slate-800 uppercase tracking-wider truncate max-w-[70%]">
          {currentTemplate.title || currentTemplate.name || 'New Design'}
        </h3>
        <button 
          onClick={handleLike}
          className="flex items-center gap-1 hover:scale-105 active:scale-95 transition-all"
        >
          <Heart size={16} className={isLiked ? 'fill-red-500 text-red-500' : 'text-slate-300'} />
          {localLikeCount > 0 && (
            <span className={`text-[10px] font-black ${isLiked ? 'text-red-500' : 'text-slate-400'}`}>{localLikeCount}</span>
          )}
        </button>
      </div>
      <div 
        ref={cardRef}
        className="w-full aspect-square overflow-hidden rounded-xl relative cursor-pointer" 
        style={{ backgroundColor: '#f8fafc' }}
        onClick={() => handleAction(new Event('click'), onClick)}
      >
        <img 
          src={currentTemplate.image} 
          alt={currentTemplate.title} 
          loading="lazy" 
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
        {overlay || <BrandingOverlay userData={effectiveUserData} size="regular" />}

        {currentTemplate.isVideo && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
            <PlayCircle size={48} className="text-white fill-white/20 opacity-80" />
            <div className="absolute bottom-3 right-3 p-1.5 rounded-full bg-black/40 backdrop-blur-sm">
              <Volume2 size={16} className="text-white" />
            </div>
          </div>
        )}
      </div>
      
      {(variant === 'regular' && showActions) && (
        <div className="flex justify-around py-3 lg:py-4 border-t border-[#f1f5f9] bg-white rounded-b-xl shadow-sm">
          <div className="flex flex-col items-center gap-1.5 flex-1 cursor-pointer hover:scale-105 active:scale-90 transition-all group" onClick={(e) => handleAction(e, onClick)}>
            <div className="w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center text-[#334155] group-hover:text-primary"><Edit2 size={20} className="lg:w-6 lg:h-6" /></div>
            <span className="text-[0.75rem] lg:text-sm font-bold text-[#64748b] group-hover:text-primary">Edit</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 flex-1 cursor-pointer hover:scale-105 active:scale-90 transition-all group" onClick={(e) => handleAction(e, () => openEditor(template, 'video'))}>
            <div className="w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center text-[#ef4444] group-hover:text-red-600"><Video size={20} className="lg:w-6 lg:h-6" /></div>
            <span className="text-[0.75rem] lg:text-sm font-bold text-[#64748b] group-hover:text-red-600">Video</span>
          </div>
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
