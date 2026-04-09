import React from 'react';
import axios from 'axios';
import { Edit2, Download, MessageCircle, Share2, Sparkles, Video, PlayCircle, Volume2 } from 'lucide-react';
import { useEditor } from '../../context/EditorContext';
import { useAuth } from '../../context/AuthContext';
import BrandingOverlay from './BrandingOverlay';

const TemplateCard = ({ template, onClick, variant = 'regular', overlay, showActions = true }) => {
  const { openEditor, userData } = useEditor();
  const { user } = useAuth();
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

  const handleImageError = (e) => {
    e.target.src = 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=400';
  };

  const recordActivity = async () => {
    try {
      if (user?.accessToken && template?._id) {
        await axios.post(`${API_URL}/user/save-template`, 
          { templateId: template._id },
          { headers: { Authorization: `Bearer ${user.accessToken}` } }
        );
      }
    } catch (err) {
      console.error('Failed to record activity:', err);
    }
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    recordActivity();
    try {
      const response = await fetch(template.image);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `poster-${template._id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      // Fallback: Open in new tab if blob fetch fails
      window.open(template.image, '_blank');
    }
  };

  const handleWhatsApp = (e) => {
    e.stopPropagation();
    recordActivity();
    const text = encodeURIComponent(`Check out this professional poster: ${template.image}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    recordActivity();
    if (navigator.share) {
      try {
        await navigator.share({
          title: template.name || 'Professional Poster',
          text: 'Check out this design from Dealing India Poster',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share failed');
      }
    } else {
      // Fallback
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
          src={template.image} 
          alt={template.title} 
          className="w-full h-full object-cover" 
          onError={handleImageError}
        />
        {overlay || <BrandingOverlay userData={userData} size="compact" />}
      </div>
    );
  }

  return (
    <div className="bg-white mb-1 overflow-hidden">
      <div 
        className="w-full aspect-square overflow-hidden rounded-xl relative bg-[#f8fafc] cursor-pointer" 
        onClick={() => handleAction(new Event('click'), onClick)}
      >
        <img 
          src={template.image} 
          alt={template.title} 
          loading="lazy" 
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
        {overlay || <BrandingOverlay userData={userData} size="regular" />}
        {template.isVideo && (
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

