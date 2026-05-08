import React from 'react';
import axios from 'axios';
import { Edit2, Download, MessageCircle, Share2, Flame, Heart, Video, PlayCircle, Play, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEditor } from '../../context/EditorContext';
import BrandingOverlay from './BrandingOverlay';

const POTDCard = ({ poster, onEdit }) => {
  const { user } = useAuth();
  const { openEditor, userData } = useEditor();
  const [isLiked, setIsLiked] = React.useState(poster.isLiked || false);
  const [likeCount, setLikeCount] = React.useState(poster.likeCount || 0);
  const [isPlaying, setIsPlaying] = React.useState(false);

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

  const rawUserData = poster.customData || userData;
  const effectiveUserData = {
    ...rawUserData,
    logo: cleanUrl(rawUserData.logo),
    userPhoto: cleanUrl(rawUserData.userPhoto)
  };
  const activeFrame = normalizeFrameValue(effectiveUserData.selectedFrame);

  React.useEffect(() => {
     return () => setIsPlaying(false);
  }, []);

  const isVideoUrl = (url) => {
    if (!url) return false;
    return url.match(/\.(mp4|webm|mov|ogg)$/i) || url.includes('/video/upload/');
  };

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

  const recordActivity = async () => {
    try {
      if (user?.accessToken && poster?._id) {
        await axios.post(`${API_URL}/user/save-template`, 
          { templateId: poster._id },
          { headers: { Authorization: `Bearer ${user.accessToken}` } }
        );
      }
    } catch (err) {
      console.error('Failed to record activity:', err);
    }
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    
    const isVideo = poster.type === 'video' || poster.isVideo;
    
    // Redirect video templates to the detail/edit view so branding can be applied
    if (isVideo && poster.videoUrl) {
      onEdit(poster);
      return;
    }

    recordActivity();
    let downloadUrl = poster.image;

    // Use Cloudinary attachment flag to force download
    if (downloadUrl.includes('cloudinary.com') && downloadUrl.includes('/upload/')) {
      downloadUrl = downloadUrl.replace('/upload/', '/upload/fl_attachment/');
    }
    
    window.open(downloadUrl, '_blank');
  };

  const handleWhatsApp = (e) => {
    e.stopPropagation();
    recordActivity();
    const platformLink = window.location.origin;
    // Use backend share URL for better social media previews
    const shareLink = `${API_URL}/share/poster/${poster._id}`;
    
    const message = `Check out this Poster of the Day! 🎨✨\n\nPoster: ${shareLink}\nPlatform: ${platformLink}\n\nCreate your own with Dealingindia Poster!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };



  const handleShare = async (e) => {
    e.stopPropagation();
    recordActivity();
    if (navigator.share) {
      // Use backend share URL for better social media previews
      const shareLink = `${API_URL}/share/poster/${poster._id}`;
      try {
        await navigator.share({
          title: 'Poster of the Day',
          text: 'Check out this design from Dealingindia Poster',
          url: shareLink,
        });
      } catch (err) { }
    } else {
      handleWhatsApp(e);
    }
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user?.accessToken) return;

    try {
      const { data } = await axios.post(`${API_URL}/user/templates/${poster._id}/like`, {}, {
        headers: { Authorization: `Bearer ${user.accessToken}` }
      });
      setIsLiked(data.liked);
      setLikeCount(prev => data.liked ? prev + 1 : prev - 1);
    } catch (err) {
      console.error('Like failed:', err);
    }
  };

  return (
    <div className="flex flex-col w-full bg-white rounded-xl shadow-xl overflow-hidden border border-slate-100">
      <div 
        className="relative aspect-square overflow-hidden cursor-pointer group bg-slate-50" 
        onClick={() => onEdit(poster)}
      >
        {(poster.type === 'video' || poster.isVideo) && (poster.videoUrl || isVideoUrl(poster.image)) ? (
           <div className="w-full h-full relative">
              <video 
                src={poster.videoUrl || poster.image} 
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
              />
              {isPlaying && (
                 <>
                   <video 
                     src={poster.videoUrl || poster.image} 
                     className="absolute inset-0 w-full h-full object-cover z-[5]"
                     autoPlay
                     loop
                     muted={false}
                     playsInline
                   />
                   <div className="absolute inset-0 flex items-center justify-center z-[20]">
                     <button 
                       onClick={(e) => { e.stopPropagation(); setIsPlaying(false); }}
                       className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                     >
                        <X size={32} />
                     </button>
                   </div>
                 </>
              )}
              <div className="absolute inset-0 bg-black/10 z-[2]" />
           </div>
        ) : (
          <img src={poster.image} alt={poster.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        )}

        {/* Audio support for image+music */}
        {!(poster.videoUrl) && poster.audioUrl && isPlaying && (
           <audio src={poster.audioUrl} autoPlay loop />
        )}
        
        {/* Banner Overlays */}
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-[#ef4444] text-white px-4 py-1.5 rounded-full text-[0.7rem] font-black flex items-center gap-2 shadow-lg backdrop-blur-md uppercase tracking-widest">
            <Flame size={14} fill="white" className="animate-pulse" /> Trending Now
          </div>
        </div>

        {(poster.type === 'video' || poster.isVideo) && !isPlaying && (
           <div className="absolute inset-0 flex items-center justify-center z-[15]">
              <button 
                onClick={(e) => { e.stopPropagation(); setIsPlaying(true); }}
                className="p-3 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-white shadow-xl hover:scale-110 transition-transform"
              >
                  <Play size={32} fill="white" className="ml-1" />
              </button>
           </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {activeFrame && (
          <img 
            src={activeFrame} 
            className="absolute inset-0 w-full h-full object-fill pointer-events-none z-[60]" 
            alt="Frame Overlay"
            crossOrigin="anonymous"
          />
        )}
      </div>

      {/* Branding Info - Appended below as requested */}
      <BrandingOverlay 
        userData={effectiveUserData} 
        size="regular" 
        isOverlay={false} 
      />
      
      <div className="flex justify-around py-3 lg:py-4 border-t border-slate-50 bg-white">
        <div className="flex flex-col items-center gap-1.5 flex-1 cursor-pointer hover:scale-105 active:scale-90 transition-all group" onClick={(e) => { e.stopPropagation(); onEdit(poster); }}>
          <div className="w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center text-slate-400 group-hover:text-primary"><Edit2 size={20} /></div>
          <span className="text-[0.65rem] font-bold text-slate-400 group-hover:text-primary uppercase tracking-widest">Edit</span>
        </div>

        <div className="flex flex-col items-center gap-1.5 flex-1 cursor-pointer hover:scale-105 active:scale-90 transition-all group" onClick={(e) => { e.stopPropagation(); openEditor(poster, 'video'); }}>
          <div className="w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center text-[#ef4444] group-hover:text-red-600"><Video size={20} /></div>
          <span className="text-[0.65rem] font-bold text-slate-400 group-hover:text-red-600 uppercase tracking-widest">Video</span>
        </div>

        <div className="flex flex-col items-center gap-1.5 flex-1 cursor-pointer hover:scale-105 active:scale-90 transition-all group" onClick={handleDownload}>
          <div className="w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center text-slate-400 group-hover:text-primary"><Download size={20} /></div>
          <span className="text-[0.65rem] font-bold text-slate-400 group-hover:text-primary uppercase tracking-widest">Save</span>
        </div>
        
        <div className="flex flex-col items-center gap-1.5 flex-1 cursor-pointer hover:scale-105 active:scale-90 transition-all group" onClick={handleWhatsApp}>
          <div className="w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center text-slate-400 group-hover:text-green-500"><MessageCircle size={20} /></div>
          <span className="text-[0.65rem] font-bold text-slate-400 group-hover:text-green-500 uppercase tracking-widest">WhatsApp</span>
        </div>
        
        <div className="flex flex-col items-center gap-1.5 flex-1 cursor-pointer hover:scale-105 active:scale-90 transition-all group" onClick={handleShare}>
          <div className="w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center text-slate-400 group-hover:text-blue-500"><Share2 size={20} /></div>
          <span className="text-[0.65rem] font-bold text-slate-400 group-hover:text-blue-500 uppercase tracking-widest">Share</span>
        </div>
      </div>
    </div>
  );
};

export default POTDCard;
