import React from 'react';
import axios from 'axios';
import { Edit2, Download, MessageCircle, Share2, Flame, Heart, Video, PlayCircle, Play, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEditor } from '../../context/EditorContext';
import BrandingOverlay from './BrandingOverlay';

const POTDCard = ({ poster, onEdit }) => {
  const { user } = useAuth();
  const { openEditor, userData, frames } = useEditor();
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
  const defaultFrame = (frames && frames.length > 0) ? (frames[0].image || frames[0].url) : null;
  const activeFrame = normalizeFrameValue(effectiveUserData.selectedFrame) || defaultFrame;
  const activeFrameObj = (frames || []).find(f => normalizeFrameValue(f) === activeFrame);
  const framePos = activeFrameObj?.textStyle?.positions || {};

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

    // Redirect video templates to the asdkfjlksjsj detail/edit view so branding can be applied
    if (isVideo && poster.videoUrl) {
      onEdit(poster);
      return;
    }

    recordActivity();

    // If no html2canvas or card ref available, fallback to raw URL
    if (!cardRef.current || !window.html2canvas) {
      let downloadUrl = poster.image;
      if (downloadUrl.includes('cloudinary.com') && downloadUrl.includes('/upload/')) {
        downloadUrl = downloadUrl.replace('/upload/', '/upload/fl_attachment/');
      }
      window.open(downloadUrl, '_blank');
      return;
    }

    // Use html2canvas to capture full rendered card with BrandingOverlay
    await waitForImages(cardRef.current);
    const restoreStyles = inlineSafeColorsForHtml2Canvas(cardRef.current);
    try {
      const canvas = await window.html2canvas(cardRef.current, {
        useCORS: true,
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 15000
      });
      const link = document.createElement('a');
      link.download = `my-design-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Card download failed:', err);
      let downloadUrl = poster.image;
      if (downloadUrl.includes('cloudinary.com') && downloadUrl.includes('/upload/')) {
        downloadUrl = downloadUrl.replace('/upload/', '/upload/fl_attachment/');
      }
      window.open(downloadUrl, '_blank');
    } finally {
      restoreStyles();
    }
  };

  const cardRef = React.useRef(null);

  const inlineSafeColorsForHtml2Canvas = (rootElement) => {
    if (!rootElement) return () => { };
    const elements = [rootElement, ...rootElement.querySelectorAll('*')];
    const updated = [];
    const colorProps = ['color', 'background-color', 'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color', 'fill', 'stroke'];
    const shadowProps = ['box-shadow', 'text-shadow'];

    elements.forEach((el) => {
      const computed = window.getComputedStyle(el);
      const previous = {};
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
    await Promise.all(imgs.map(img => img.decode().catch(() => { })));
  };

  const getPosterFile = async () => {
    if (!cardRef.current || !window.html2canvas) return null;
    await waitForImages(cardRef.current);
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
    const isVideo = poster.type === 'video' || poster.isVideo;
    const shareLink = `${API_URL}/share/poster/${poster._id}`;
    const userName = effectiveUserData.name || userData?.name || 'Dealingindia User';

    const message = `${userName}\n\nI created this ${isVideo ? 'video greeting' : 'greeting'} using Dealingindia Poster app. Download Dealingindia Poster now to create custom WhatsApp status -\n\n${shareLink}`;

    if (isVideo) {
      onEdit(poster);
      return;
    }

    // Directly open WhatsApp share
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    recordActivity();
    const isVideo = poster.type === 'video' || poster.isVideo;
    const shareLink = `${API_URL}/share/poster/${poster._id}`;
    const userName = effectiveUserData.name || userData?.name || 'Dealingindia User';

    const message = `${userName}\n\nI created this ${isVideo ? 'video greeting' : 'greeting'} using Dealingindia Poster app. Download Dealingindia Poster now to create custom WhatsApp status -\n\n${shareLink}`;

    if (navigator.share) {
      try {
        const shareData = {
          title: 'Poster of the Day',
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
    <div className="flex flex-col w-full bg-white rounded-xl shadow-xl overflow-hidden border border-slate-100" ref={cardRef}>
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

        {/* Dealing India Branding Badge */}
        <div
          className="absolute top-[3%] right-[3%] z-[95] flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-full border border-black/10 shadow-lg pointer-events-none"
        >
          <img src="/dealing-india-logo.png" className="w-6 h-6 object-contain" alt="DI" crossOrigin="anonymous" />
          <span className="brand-gradient-text font-black tracking-tighter text-[10px] uppercase whitespace-nowrap">Dealingindia</span>
        </div>
        {activeFrame && (
          <BrandingOverlay
            userData={effectiveUserData}
            size="regular"
            isOverlay={true}
            activeFrame={activeFrame}
            frameStyle={activeFrameObj?.textStyle}
          />
        )}
      </div>

      {/* Branding Info - Appended below as footer when NO frame */}
      {!activeFrame && (
        <BrandingOverlay
          userData={effectiveUserData}
          size="regular"
          isOverlay={false}
          activeFrame={activeFrame}
          frameStyle={activeFrameObj?.textStyle}
        />
      )}

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
