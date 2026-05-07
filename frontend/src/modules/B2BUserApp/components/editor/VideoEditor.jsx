import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ArrowLeft, Video, Download, MessageCircle, Share2, Play, Pause, X, Sparkles, Layers, Sliders, Wand2, Zap, Music2, Search, Edit2, Check, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const VideoEditor = ({ template, userData, onClose, isBusinessCard = false }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [showMusicModal, setShowMusicModal] = useState(false);
  const [selectedEffect, setSelectedEffect] = useState('none');
  const [isPlaying, setIsPlaying] = useState(false);
  
  const [musicList, setMusicList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [previewingTrackId, setPreviewingTrackId] = useState(null);
  
  const previewAudioRef = useRef(null);
  const posterAudioRef = useRef(null);
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const mediaStreamDestRef = useRef(null);
  const audioSourceRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5003/api';

  useEffect(() => {
    // Initial loading simulation as per Image 1
    const timer = setTimeout(() => setIsLoading(false), 800);
    
    const fetchMusic = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/music/public`);
        setMusicList(data);
        if (data.length > 0) {
            // Default to first generic track if available
            const defaultTrack = data.find(m => m.category === 'Generic') || data[0];
            setSelectedMusic(defaultTrack);
            if (posterAudioRef.current) {
              posterAudioRef.current.src = defaultTrack.audioUrl;
            }
        }
      } catch (error) {
        console.error('Fetch music error:', error);
      }
    };
    fetchMusic();
    return () => clearTimeout(timer);
  }, [API_URL]);

  const categories = useMemo(() => {
    const cats = ['All', 'My Music', 'Generic', 'General', 'Festival', 'Maa', 'Bhakti', 'Motivation'];
    return cats;
  }, []);

  const filteredMusic = useMemo(() => {
    return musicList.filter(m => {
        const matchesTab = activeTab === 'All' ? true : (activeTab === 'My Music' ? m.isUserOwned : m.category === activeTab);
        const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             m.artist.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });
  }, [musicList, activeTab, searchQuery]);

  const togglePreview = async (track) => {
    if (!previewAudioRef.current) return;

    if (previewingTrackId === track._id) {
      previewAudioRef.current.pause();
      setPreviewingTrackId(null);
    } else {
      setPreviewingTrackId(track._id);
      previewAudioRef.current.pause(); // Pause any previous track
      previewAudioRef.current.src = track.audioUrl;
      try {
        await previewAudioRef.current.play();
      } catch (e) {
        console.log('Audio preview interrupted');
      }
    }
  };

  const handleApplyMusic = async (track) => {
    setSelectedMusic(track);
    if (posterAudioRef.current) {
      posterAudioRef.current.src = track.audioUrl;
      if (isPlaying) {
        try {
          await posterAudioRef.current.play();
        } catch (e) {
          console.log('Applied music play interrupted');
        }
      }
    }
    setShowMusicModal(false);
  };

  const effects = [
    { id: 'none', title: 'None', icon: <X size={24} /> },
    { id: 'blur', title: 'Blur', icon: <Layers size={24} />, filter: 'blur(10px)' },
    { id: 'zoom', title: 'Zoom', icon: <Sliders size={18} />, animation: 'zoom' },
    { id: 'tectonic', title: 'Tectonic', icon: <Zap size={24} />, animation: 'shake' },
    { id: 'arti', title: 'Arti', icon: <Sparkles size={24} />, filter: 'sepia(0.5) contrast(1.1) brightness(1.1)' },
    { id: 'smooth', title: 'Smooth', icon: <Wand2 size={24} />, filter: 'brightness(1.05) saturate(1.2) contrast(0.95)' }
  ];

  // ── Canvas Render Loop ────────────────────────────────────────────────
  useEffect(() => {
    if (!canvasRef.current || isLoading) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const posterImg = new Image();
    posterImg.crossOrigin = "anonymous";
    posterImg.src = template.image;
    
    const userImg = new Image();
    userImg.crossOrigin = "anonymous";
    userImg.src = userData.userPhoto || userData.logo || '';

    const diLogoImg = new Image();
    diLogoImg.crossOrigin = "anonymous";
    diLogoImg.src = "/dealing-india-logo.png";

    let animationId;
    let startTime = Date.now();

    const render = () => {
      const time = (Date.now() - startTime) / 1000;
      const w = 1080;
      // If business card, match image aspect ratio. Otherwise use fixed height for branding.
      const h = isBusinessCard && posterImg.width ? Math.round(1080 / (posterImg.width / posterImg.height)) : 1250;
      
      canvas.width = w;
      canvas.height = h;

      // Clear
      ctx.clearRect(0, 0, w, h);
      ctx.save();

      // Apply Effects
      let currentFilter = 'none';
      if (selectedEffect === 'blur') currentFilter = 'blur(12px)';
      if (selectedEffect === 'arti') currentFilter = 'sepia(0.6) contrast(1.1) brightness(1.2)';
      if (selectedEffect === 'smooth') currentFilter = 'brightness(1.1) saturate(1.3) contrast(0.9)';
      
      ctx.filter = currentFilter;

      // Motion Animations
      if (selectedEffect === 'zoom') {
        const scale = 1 + Math.sin(time * 2) * 0.05;
        ctx.translate(w/2, h/2);
        ctx.scale(scale, scale);
        ctx.translate(-w/2, -h/2);
      }
      if (selectedEffect === 'tectonic') {
        ctx.translate((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8);
      }

      // Draw Main Image
      if (isBusinessCard) {
        // Draw to fill the dynamic canvas
        ctx.drawImage(posterImg, 0, 0, w, h);
      } else {
        // Standard Square Poster in 1080x1080 area
        ctx.drawImage(posterImg, 0, 0, 1080, 1080);
      }
      ctx.restore();

      // Draw Noise for Arti
      if (selectedEffect === 'arti') {
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.05})`;
        for(let i=0; i<100; i++) ctx.fillRect(Math.random()*w, Math.random()*h, 2, 2);
      }

      // Draw Branding Overlays (Skip for Business Cards as they are already branded)
      if (!isBusinessCard && userImg.complete && (userData.userPhoto || userData.logo)) {
        // Branding Bar (Appended Bottom)
        ctx.save();
        ctx.fillStyle = '#0a0a0a';
        const barH = 170;
        const barY = 1080;
        const barRect = [0, barY, w, barH];
        
        ctx.fillRect(barRect[0], barRect[1], barRect[2], barRect[3]);
        // ctx.clip(); // No longer clipping as it's full width

        // Logo
        const logoSize = 120;
        const logoX = 900; // Right side
        const logoY = barY + (barH - logoSize)/2;
        
        // Circular clip for logo
        ctx.save();
        ctx.beginPath();
        ctx.arc(logoX + logoSize/2, logoY + logoSize/2, logoSize/2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(userImg, logoX, logoY, logoSize, logoSize);
        ctx.restore();

        // Text (Left Side of bar)
        ctx.fillStyle = 'white';
        ctx.font = `900 32px sans-serif`;
        ctx.fillText(userData.business_name?.toUpperCase() || '', 40, barY + 50);
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.font = `bold 24px sans-serif`;
        ctx.fillText(userData.phone_number || '', 40, barY + 90);
        ctx.fillText(userData.website || '', 40, barY + 125);
        ctx.restore();
      }

      // Draw Dealing India Badge (Top-Right)
      if (diLogoImg.complete) {
        const badgeW = 260;
        const badgeH = 70;
        const badgeX = w - badgeW - 40;
        const badgeY = 40;
        
        ctx.save();
        // White Background Capsule
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 35);
        } else {
          ctx.rect(badgeX, badgeY, badgeW, badgeH); // Fallback
        }
        ctx.fill();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Logo
        const diSize = 50;
        ctx.drawImage(diLogoImg, badgeX + 15, badgeY + (badgeH - diSize)/2, diSize, diSize);
        
        // Text (Black)
        ctx.fillStyle = '#000000';
        ctx.font = '900 24px sans-serif';
        ctx.fillText('Dealingindia', badgeX + 75, badgeY + 45);
        ctx.restore();
      }

      animationId = requestAnimationFrame(render);
    };

    posterImg.onload = () => {
      render();
    };

    return () => cancelAnimationFrame(animationId);
  }, [template.image, userData, selectedEffect, isLoading, isBusinessCard]);

  // ── Recording Functionality ──────────────────────────────────────────
  const handleDownloadVideo = async () => {
    if (!canvasRef.current || !selectedMusic) return;
    
    try {
      setIsProcessing(true);
      setDownloadProgress(0);

      // 1. Audio Setup
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        mediaStreamDestRef.current = audioContextRef.current.createMediaStreamDestination();
      }
      
      const audioCtx = audioContextRef.current;
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }

      // Create or reuse audio source with GainNode for better routing
      if (!audioSourceRef.current) {
        audioSourceRef.current = audioCtx.createMediaElementSource(posterAudioRef.current);
        const gainNode = audioCtx.createGain();
        gainNode.gain.value = 1.0;
        
        audioSourceRef.current.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        gainNode.connect(mediaStreamDestRef.current);
      }

      // 2. Stream Capture
      const canvasStream = canvasRef.current.captureStream(30);
      const audioTracks = mediaStreamDestRef.current.stream.getAudioTracks();
      const videoTracks = canvasStream.getVideoTracks();

      if (audioTracks.length === 0) {
        console.warn('No audio tracks found in destination stream');
      }

      const combinedStream = new MediaStream([
        ...videoTracks,
        ...audioTracks
      ]);

      // 3. Media Recorder
      // Try widely supported mimeTypes sequentially
      const supportedMimeTypes = [
        'video/webm;codecs=vp8,opus',
        'video/webm;codecs=vp9,opus',
        'video/webm',
        'video/mp4'
      ];
      
      let mimeType = supportedMimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || '';
        
      const recorder = new MediaRecorder(combinedStream, { 
        mimeType,
        audioBitsPerSecond: 128000,
        videoBitsPerSecond: 2500000
      });

      const chunks = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType.includes('mp4') ? 'video/mp4' : 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `poster-video-${Date.now()}.${mimeType.includes('mp4') ? 'mp4' : 'webm'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsProcessing(false);
      };

      // Ensure the audio is ready before starting recorder
      posterAudioRef.current.currentTime = 0;
      await new Promise((resolve) => {
        if (posterAudioRef.current.readyState >= 3) resolve();
        else {
          posterAudioRef.current.oncanplay = resolve;
          // Fallback if event doesn't fire
          setTimeout(resolve, 1000);
        }
      });

      // Start play and record
      await posterAudioRef.current.play();
      recorder.start(100); // 100ms time slices can help with data availability

      // Recording Duration (8 seconds)
      const duration = 8;
      const interval = setInterval(() => {
        setDownloadProgress(prev => {
           if (prev >= 100) {
             clearInterval(interval);
             return 100;
           }
           return prev + (100 / (duration * 10));
        });
      }, 100);

      setTimeout(() => {
        if (recorder.state !== 'inactive') {
          recorder.stop();
        }
        posterAudioRef.current.pause();
        clearInterval(interval);
      }, duration * 1000);

    } catch (err) {
      console.error('Recording failed:', err);
      setIsProcessing(false);
      alert('Video export failed: ' + (err.message || 'Unknown error'));
    }
  };

  const handleWhatsApp = () => {
    const platformLink = window.location.origin;
    const isVideo = template.isVideo || template.type === 'video';
    const posterLink = `${platformLink}/?templateId=${template._id}`;

    const message = isVideo 
      ? `Check out this professional video poster I created! 🎬✨\n\nPoster: ${posterLink}\nPlatform: ${platformLink}\n\nCreate your own with Dealingindia Poster!`
      : `Check out this professional poster I created! 🎨✨\n\nPoster: ${posterLink}\nPlatform: ${platformLink}\n\nCreate your own with Dealingindia Poster!`;
    
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleShare = async () => {
    const platformLink = window.location.origin;
    const isVideo = template.isVideo || template.type === 'video';
    const posterLink = `${platformLink}/?templateId=${template._id}`;
    
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
      handleWhatsApp();
    }
  };

  const currentEffect = effects.find(e => e.id === selectedEffect);

  return (
    <motion.div 
      className="fixed inset-0 bg-white z-[2500] flex flex-col overflow-hidden"
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <audio ref={previewAudioRef} crossOrigin="anonymous" onEnded={() => setPreviewingTrackId(null)} />
      <audio ref={posterAudioRef} crossOrigin="anonymous" loop />

      {/* ── Processing Overlay (New Phase 6) ── */}
      <AnimatePresence>
        {(isLoading || isProcessing) && (
          <motion.div 
            className="absolute inset-0 bg-white/95 backdrop-blur-2xl z-[5000] flex flex-col items-center justify-center p-10 text-center"
            exit={{ opacity: 0 }}
          >
            <div className="relative mb-8">
               <div className="w-24 h-24 border-4 border-rose-100 border-t-rose-500 rounded-full animate-spin" />
               {isProcessing && (
                 <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-rose-600">
                    {Math.round(downloadProgress)}%
                 </div>
               )}
            </div>
            <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight mb-2">
               {isProcessing ? 'Capturing Moments...' : 'Adding Your Audio...'}
            </h3>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
               {isProcessing ? 'Merging effects and music into your video' : 'This will just take a moment'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-[#b91c1c] p-3 px-4 flex items-center gap-4 text-white shadow-lg relative z-10">
        <button className="bg-transparent text-white p-0 flex items-center active:scale-95 transition-transform border-none cursor-pointer" onClick={onClose}>
          <ArrowLeft size={24} />
        </button>
        <h3 className="text-[1.1rem] font-black uppercase tracking-tight">Video Poster</h3>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 flex flex-col">
        {/* Poster Preview with Live Canvas (New Phase 1) */}
        <div className="p-6 pb-2 flex flex-col items-center">
          <div className={`relative w-full ${isBusinessCard ? 'max-w-[400px]' : 'max-w-[340px]'} rounded-[1.5rem] overflow-hidden shadow-2xl bg-white border-[6px] border-white transition-all duration-500`}>
             <canvas 
               ref={canvasRef} 
               width={1080} 
               height={isBusinessCard ? 617 : 1250}
               className="w-full h-auto object-contain"
             />
             
             {/* Play/Pause Overlay */}
             <div className="absolute inset-0 flex items-center justify-center bg-black/5 hover:bg-black/10 transition-colors">
                <button 
                   className="w-20 h-20 bg-white/40 backdrop-blur-2xl rounded-full flex items-center justify-center text-white border-2 border-white/50 shadow-2xl active:scale-90 transition-all border-none cursor-pointer group"
                   onClick={() => {
                     setIsPlaying(!isPlaying);
                     if (!isPlaying) posterAudioRef.current?.play().catch(e => console.log('Interrupted'));
                     else posterAudioRef.current?.pause();
                   }}
                >
                  {isPlaying ? <Pause size={40} fill="white" /> : <Play size={40} className="ml-1.5" fill="white" />}
                </button>
             </div>
          </div>
        </div>

        {/* ── Choose Audio & Music Section (Image 3) ── */}
        <div className="p-6 space-y-4">
           <h4 className="text-[0.7rem] font-black text-gray-400 uppercase tracking-[0.2em] pl-1">Choose Audio & Music</h4>
           
           <div className="space-y-3">
              {/* Background Music Slot */}
              <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between shadow-sm group hover:border-orange-100 transition-colors">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                       <Music2 size={20} />
                    </div>
                    <div>
                        <h5 className="text-[0.9rem] font-black text-gray-800 leading-tight">{selectedMusic?.title || 'Generic-1'}</h5>
                        <p className="text-[0.7rem] text-gray-400 font-bold uppercase tracking-widest">Background Music | {selectedMusic?.duration || '00:22'}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setShowMusicModal(true)}
                        className="flex items-center gap-2 h-9 px-4 bg-gray-50 text-gray-600 rounded-xl border border-gray-100 text-[0.75rem] font-black uppercase tracking-wider hover:bg-gray-100 transition-colors"
                    >
                       <Edit2 size={14} /> Edit
                    </button>
                    <div className="w-6 h-6 rounded-lg bg-blue-500 flex items-center justify-center text-white">
                       <Check size={14} strokeWidth={3} />
                    </div>
                 </div>
              </div>
           </div>

           {/* ── Direct Video Effects Scroller ── */}
           <div className="space-y-3 pt-2">
              <h4 className="text-[0.7rem] font-black text-gray-400 uppercase tracking-[0.2em] pl-1">Video Transitions</h4>
              <div className="flex items-center gap-6 overflow-x-auto pb-4 scrollbar-hide">
                 {effects.map(fx => (
                   <div 
                     key={fx.id} 
                     className="flex flex-col items-center gap-2 shrink-0 cursor-pointer group"
                     onClick={() => setSelectedEffect(fx.id)}
                   >
                      <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center transition-all ${selectedEffect === fx.id ? 'bg-[#b91c1c] text-white shadow-lg shadow-red-100 scale-105' : 'bg-white border border-gray-100 text-gray-400 group-hover:bg-gray-50'}`}>
                         {React.cloneElement(fx.icon, { size: 24, strokeWidth: selectedEffect === fx.id ? 2.5 : 2 })}
                      </div>
                      <span className={`text-[0.6rem] font-black uppercase tracking-widest transition-colors ${selectedEffect === fx.id ? 'text-[#b91c1c]' : 'text-gray-400'}`}>{fx.title}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* Floating Bottom Actions */}
      <div className="p-6 pt-2 pb-8 flex items-center justify-between gap-6 bg-white border-t border-gray-100 z-10">
         <div 
           className="flex flex-col items-center gap-1 cursor-pointer active:scale-90 transition-transform flex-1"
           onClick={handleDownloadVideo}
         >
            <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 shadow-sm border-none"><Download size={22} /></div>
            <span className="text-[0.65rem] font-black text-gray-400 uppercase tracking-widest">Download</span>
         </div>
         <div 
           className="flex flex-col items-center gap-1 cursor-pointer active:scale-90 transition-transform flex-1"
           onClick={handleWhatsApp}
         >
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm"><MessageCircle size={22} /></div>
            <span className="text-[0.65rem] font-black text-gray-400 uppercase tracking-widest">WhatsApp</span>
         </div>
         <div 
           className="flex flex-col items-center gap-1 cursor-pointer active:scale-90 transition-transform flex-1"
           onClick={handleShare}
         >
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 shadow-sm"><Share2 size={22} /></div>
            <span className="text-[0.65rem] font-black text-gray-400 uppercase tracking-widest">Share</span>
         </div>
      </div>

      {/* ── Music Modal (Image 2) ── */}
      <AnimatePresence>
        {showMusicModal && (
          <motion.div 
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[4000] flex items-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMusicModal(false)}
          >
            <motion.div 
              className="w-full bg-white rounded-t-[3rem] h-[85vh] flex flex-col shadow-2xl overflow-hidden"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              onClick={e => e.stopPropagation()}
            >
               {/* Modal Header */}
               <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 border-none cursor-pointer" onClick={() => setShowMusicModal(false)}>
                     <X size={20} />
                  </button>
                  <h3 className="text-[1.1rem] font-black uppercase tracking-tight">Background Music</h3>
                  <button className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 border-none cursor-pointer">
                     <Check size={20} />
                  </button>
               </div>

               <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                  {/* Search bar */}
                  <div className="relative mb-6">
                     <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                     <input 
                        type="text" 
                        placeholder="Search Audio" 
                        className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 text-[0.9rem] font-bold text-gray-800 outline-none focus:border-orange-500 transition-colors"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                     />
                     <button className="absolute right-3 top-1/2 -translate-y-1/2 h-9 px-4 bg-white text-gray-600 rounded-xl border border-gray-100 text-[0.7rem] font-black uppercase tracking-wider flex items-center gap-2 shadow-sm border-none cursor-pointer">
                        <Music2 size={14} /> Add Music
                     </button>
                  </div>

                  {/* Tabs */}
                  <div className="flex gap-3 overflow-x-auto pb-6 scrollbar-hide">
                     {categories.map(cat => (
                        <button 
                           key={cat} 
                           onClick={() => setActiveTab(cat)}
                           className={`h-11 px-6 rounded-full text-[0.8rem] font-black uppercase tracking-widest whitespace-nowrap transition-all border-none cursor-pointer ${activeTab === cat ? 'bg-black text-white shadow-xl shadow-black/20' : 'bg-gray-50 text-gray-400'}`}
                        >
                           {cat}
                        </button>
                     ))}
                  </div>

                  {/* Own Music Banner */}
                  {activeTab === 'Generic' && (
                    <div className="bg-orange-50/50 rounded-[2rem] p-6 mb-8 flex items-center justify-between relative overflow-hidden border border-orange-100/30">
                        <div className="relative z-10 flex-1">
                            <h4 className="text-[1.1rem] font-black text-gray-800 leading-tight mb-3">Want to use your own Music?</h4>
                            <button className="h-11 px-6 bg-rose-500 text-white rounded-2xl flex items-center gap-2 text-[0.8rem] font-black uppercase tracking-wider shadow-lg shadow-rose-200 border-none cursor-pointer">
                                Add Music <Music2 size={16} />
                            </button>
                        </div>
                        <div className="w-24 h-24 bg-white rounded-2xl shadow-xl flex items-center justify-center text-rose-500 relative z-10">
                            <Music2 size={40} strokeWidth={2.5} />
                        </div>
                        <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-orange-100 rounded-full blur-3xl opacity-50" />
                    </div>
                  )}

                  {/* Music Items */}
                  <div className="space-y-3">
                     {filteredMusic.map(track => (
                        <div 
                           key={track._id} 
                           className={`flex items-center justify-between p-4 rounded-[1.5rem] transition-all group ${selectedMusic?._id === track._id ? 'bg-orange-50/50' : 'bg-white'}`}
                        >
                           <div className="flex items-center gap-4 flex-1 min-w-0">
                               <div className="w-12 h-12 rounded-xl bg-gray-100 flex-shrink-0 relative group-hover:scale-105 transition-transform overflow-hidden">
                                  <img 
                                    src={track.thumbnailUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=200'} 
                                    className="w-full h-full object-cover rounded-xl" 
                                    alt={track.title} 
                                  />
                               </div>
                               <div className="flex-1 min-w-0">
                                  <h5 className={`text-[0.9rem] font-black leading-tight truncate ${selectedMusic?._id === track._id ? 'text-rose-500' : 'text-gray-800'}`}>{track.title}</h5>
                                  <p className="text-[0.65rem] text-gray-400 font-bold uppercase tracking-[0.15em] mt-0.5">{track.duration || '00:22'}</p>
                               </div>
                           </div>
                           <div className="flex items-center gap-3">
                              <button 
                                onClick={(e) => { e.stopPropagation(); togglePreview(track); }}
                                className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-800 shadow-sm border border-gray-100 cursor-pointer active:scale-90 transition-all border-none"
                              >
                                 {previewingTrackId === track._id ? <Pause size={18} fill="currentColor" /> : <Play size={18} className="ml-0.5" fill="currentColor" />}
                              </button>
                              <button 
                                onClick={() => handleApplyMusic(track)}
                                className={`h-11 px-6 rounded-2xl text-[0.75rem] font-black uppercase tracking-widest flex items-center gap-2 transition-all border-none cursor-pointer shadow-lg ${selectedMusic?._id === track._id ? 'bg-rose-500 text-white shadow-rose-200' : 'bg-rose-500 text-white shadow-rose-200'}`}
                              >
                                 Apply <ArrowLeft size={16} className="rotate-180" />
                              </button>
                           </div>
                        </div>
                     ))}
                     {filteredMusic.length === 0 && (
                        <div className="text-center py-20 opacity-20">
                           <Music2 size={60} className="mx-auto mb-4" />
                           <p className="font-black uppercase tracking-[0.2em] text-sm">No Tracks Found</p>
                        </div>
                     )}
                  </div>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default VideoEditor;
