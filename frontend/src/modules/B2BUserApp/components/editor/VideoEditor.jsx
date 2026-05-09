import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ArrowLeft, Video, Download, MessageCircle, Share2, Play, Pause, PlayCircle, PauseCircle, X, Sparkles, Layers, Sliders, Wand2, Zap, Music2, Search, Edit2, Check, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const VideoEditor = ({ template, userData, onClose, isBusinessCard = false, autoStartDownload = false }) => {
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
  const videoSourceRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5003/api';

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    const fetchMusic = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/music/public`);
        setMusicList(data);
        if (data.length > 0) {
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

  // Auto-start download if requested
  useEffect(() => {
    if (!isLoading && autoStartDownload && !isProcessing && selectedMusic) {
       handleDownloadVideo();
    }
  }, [isLoading, autoStartDownload, selectedMusic]);

  const categories = useMemo(() => ['All', 'My Music', 'Generic', 'General', 'Festival', 'Maa', 'Bhakti', 'Motivation'], []);

  const filteredMusic = useMemo(() => {
    return musicList.filter(m => {
        const matchesTab = activeTab === 'All' ? true : (activeTab === 'My Music' ? m.isUserOwned : m.category === activeTab);
        const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase());
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
      previewAudioRef.current.src = track.audioUrl;
      try { await previewAudioRef.current.play(); } catch (e) {}
    }
  };

  const handleApplyMusic = async (track) => {
    setSelectedMusic(track);
    if (posterAudioRef.current) {
      posterAudioRef.current.src = track.audioUrl;
      if (isPlaying) posterAudioRef.current.play().catch(e => {});
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

    const frameImg = new Image();
    frameImg.crossOrigin = "anonymous";
    frameImg.src = userData.selectedFrame?.image || userData.selectedFrame || '';

    const videoSource = document.createElement('video');
    videoSource.crossOrigin = "anonymous";
    videoSource.src = template.videoUrl || '';
    videoSource.muted = true;
    videoSource.loop = true;
    videoSource.playsInline = true;
    videoSourceRef.current = videoSource;

    let animationId;
    let startTime = Date.now();

    const getPixelPos = (pos, w, h, defaultX = '5%', defaultY = '80%') => {
      const xPct = parseFloat(pos?.x || defaultX);
      const yPct = parseFloat(pos?.y || defaultY);
      return { x: (xPct / 100) * w, y: (yPct / 100) * h };
    };

    const render = () => {
      const time = (Date.now() - startTime) / 1000;
      const w = 1080;
      const h = isBusinessCard && posterImg.width ? Math.round(1080 / (posterImg.width / posterImg.height)) : 1250;
      canvas.width = w;
      canvas.height = h;

      if (template.videoUrl) {
        if (isPlaying && videoSource.paused) videoSource.play().catch(e => {});
        else if (!isPlaying && !videoSource.paused) videoSource.pause();
      }

      ctx.clearRect(0, 0, w, h);
      ctx.save();
      
      let filter = 'none';
      if (selectedEffect === 'blur') filter = 'blur(12px)';
      if (selectedEffect === 'arti') filter = 'sepia(0.6) contrast(1.1) brightness(1.2)';
      if (selectedEffect === 'smooth') filter = 'brightness(1.1) saturate(1.3) contrast(0.9)';
      ctx.filter = filter;

      if (selectedEffect === 'zoom') {
        const s = 1 + Math.sin(time * 2) * 0.05;
        ctx.translate(w/2, h/2); ctx.scale(s, s); ctx.translate(-w/2, -h/2);
      }
      if (selectedEffect === 'tectonic') {
        ctx.translate((Math.random()-0.5)*8, (Math.random()-0.5)*8);
      }

      if (template.videoUrl && videoSource.readyState >= 2) {
        ctx.drawImage(videoSource, 0, 0, 1080, 1080);
      } else if (posterImg.complete) {
        ctx.drawImage(posterImg, 0, 0, 1080, 1080);
      }
      ctx.restore();

      if (frameImg.complete && frameImg.naturalWidth > 0) {
        ctx.drawImage(frameImg, 0, 0, 1080, 1080);
      }

      if (selectedEffect === 'arti') {
        ctx.fillStyle = `rgba(255,255,255,${Math.random()*0.05})`;
        for(let i=0; i<100; i++) ctx.fillRect(Math.random()*w, Math.random()*h, 2, 2);
      }

      const hasFrame = frameImg.complete && frameImg.naturalWidth > 0;
      if (hasFrame && !isBusinessCard) {
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = 4; ctx.shadowOffsetY = 2;
        ctx.fillStyle = 'white'; ctx.textBaseline = 'top';

        const drawText = (text, pos, size = 28) => {
          if (!text) return;
          const { x, y } = getPixelPos(pos, 1080, 1080);
          ctx.font = `900 ${size}px sans-serif`;
          ctx.fillText(text.toUpperCase(), x, y);
        };
        drawText(userData.name, userData.namePos, 34);
        drawText(userData.business_name, userData.businessNamePos, 30);
        drawText(userData.phone_number, userData.phonePos, 26);
        drawText(userData.website, userData.websitePos, 24);
        
        const drawImg = (img, pos, dim) => {
          if (!img.complete || img.naturalWidth === 0) return;
          const { x, y } = getPixelPos(pos, 1080, 1080);
          const s = (dim/100)*1080;
          ctx.drawImage(img, x, y, s, s);
        };
        drawImg(userImg, userData.userPhotoPos, 14);
        drawImg(userImg, userData.logoPos, 9);
        ctx.restore();
      }

      if (!hasFrame && !isBusinessCard) {
        ctx.save();
        ctx.fillStyle = '#0a0a0a'; ctx.fillRect(0, 1080, w, 170);
        
        if (userImg.complete && userImg.naturalWidth > 0) {
          const logoSize = 120; const logoX = 900; const logoY = 1080 + (170-logoSize)/2;
          ctx.save(); ctx.beginPath(); ctx.arc(logoX+logoSize/2, logoY+logoSize/2, logoSize/2, 0, Math.PI*2); ctx.clip();
          ctx.drawImage(userImg, logoX, logoY, logoSize, logoSize); ctx.restore();
        }

        ctx.fillStyle = 'white'; ctx.font = '900 32px sans-serif'; ctx.fillText(userData.business_name?.toUpperCase() || '', 40, 1080+50);
        ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.font = 'bold 24px sans-serif'; 
        ctx.fillText(userData.phone_number || '', 40, 1080+90);
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText(userData.website || '', 40, 1080+130);
        ctx.restore();
      }

      if (diLogoImg.complete) {
        const bW = 260; const bH = 70; const bX = w - bW - 40; const bY = 40;
        ctx.save(); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.roundRect?.(bX, bY, bW, bH, 35); ctx.fill();
        ctx.drawImage(diLogoImg, bX+15, bY+(bH-50)/2, 50, 50);
        ctx.fillStyle = '#000000'; ctx.font = '900 24px sans-serif'; ctx.fillText('Dealingindia', bX+75, bY+45);
        ctx.restore();
      }
      animationId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationId);
  }, [template, userData, selectedEffect, isLoading, isPlaying]);

  const handleDownloadVideo = async () => {
    if (!canvasRef.current || !selectedMusic || isProcessing) return;
    try {
      setIsProcessing(true); setDownloadProgress(0); setIsPlaying(true);
      
      // Ensure audio context is ready
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        mediaStreamDestRef.current = audioContextRef.current.createMediaStreamDestination();
      }
      const audioCtx = audioContextRef.current;
      if (audioCtx.state === 'suspended') await audioCtx.resume();

      // IMPORTANT: MediaElementSource must be recreated if the audio element changed (on remount)
      // or we can just always create a temporary one if we don't want to track it.
      // But creating it once per audio element is safer.
      // We'll create a local source for this download session to avoid Ref persistence issues.
      const source = audioCtx.createMediaElementSource(posterAudioRef.current);
      const gain = audioCtx.createGain(); gain.gain.value = 1.0;
      source.connect(gain); gain.connect(audioCtx.destination); gain.connect(mediaStreamDestRef.current);

      if (videoSourceRef.current) {
        videoSourceRef.current.currentTime = 0;
        await videoSourceRef.current.play().catch(e => console.log("Video play error:", e));
      }

      const stream = new MediaStream([
        ...canvasRef.current.captureStream(30).getVideoTracks(), 
        ...mediaStreamDestRef.current.stream.getAudioTracks()
      ]);

      const mime = ['video/webm;codecs=vp9,opus', 'video/webm', 'video/mp4'].find(t => MediaRecorder.isTypeSupported(t));
      const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 5000000 });
      const chunks = [];
      recorder.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mime.includes('mp4') ? 'video/mp4' : 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.body.appendChild(document.createElement('a'));
        a.href = url; a.download = `dealingindia-video-${Date.now()}.${mime.includes('mp4') ? 'mp4' : 'webm'}`;
        a.click(); URL.revokeObjectURL(url); document.body.removeChild(a);
        
        // Cleanup: disconnect source to allow garbage collection and reuse
        source.disconnect();
        gain.disconnect();
        
        setIsProcessing(false); 
        if (autoStartDownload) onClose();
      };

      posterAudioRef.current.currentTime = 0; 
      await new Promise(r => setTimeout(r, 500));
      await posterAudioRef.current.play(); 
      recorder.start(100);

      const dur = 8; 
      const int = setInterval(() => setDownloadProgress(p => p >= 100 ? 100 : p + (100/(dur*10))), 100);
      
      setTimeout(() => { 
        if (recorder.state !== 'inactive') recorder.stop(); 
        posterAudioRef.current.pause(); 
        clearInterval(int); 
      }, dur * 1000);

    } catch (err) { 
      console.error("Video generation error:", err); 
      setIsProcessing(false); 
      alert('Video generation failed. Please try again.'); 
    }
  };

  const handleWhatsApp = () => {
    const link = `${window.location.origin}/?templateId=${template._id}`;
    window.open(`https://wa.me/?text=${encodeURIComponent("Check this out! " + link)}`, '_blank');
  };

  const handleShare = async () => {
    const link = `${window.location.origin}/?templateId=${template._id}`;
    if (navigator.share) await navigator.share({ title: 'Dealingindia', url: link }).catch(() => {});
    else handleWhatsApp();
  };

  return (
    <motion.div className="fixed inset-0 bg-white z-[2500] flex flex-col overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <audio ref={previewAudioRef} crossOrigin="anonymous" onEnded={() => setPreviewingTrackId(null)} />
      <audio ref={posterAudioRef} crossOrigin="anonymous" loop />
      <AnimatePresence>
        {(isLoading || isProcessing) && (
          <motion.div className="absolute inset-0 bg-white/95 z-[5000] flex flex-col items-center justify-center p-10 text-center" exit={{ opacity: 0 }}>
            <div className="w-24 h-24 border-4 border-t-rose-500 rounded-full animate-spin mb-8" />
            <h3 className="text-xl font-black uppercase mb-2">{isProcessing ? 'Generating Video...' : 'Loading Editor...'}</h3>
            {isProcessing && <div className="text-rose-600 font-bold">{Math.round(downloadProgress)}%</div>}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="bg-[#b91c1c] p-3 px-4 flex items-center gap-4 text-white shadow-lg relative z-10">
        <button className="bg-transparent text-white border-none cursor-pointer" onClick={onClose}><ArrowLeft size={24} /></button>
        <h3 className="uppercase">Video Poster</h3>
      </div>
      <div className="flex-1 overflow-y-auto bg-gray-50 flex flex-col p-6 items-center">
        <div className="relative w-full max-w-[340px] rounded-[1.5rem] overflow-hidden shadow-2xl bg-white border-[6px] border-white">
          <canvas ref={canvasRef} className="w-full h-auto" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/5 hover:bg-black/10 transition-colors pointer-events-none">
            <button 
               className="w-16 h-16 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-white shadow-xl hover:scale-110 transition-transform cursor-pointer pointer-events-auto"
               onClick={(e) => {
                 e.stopPropagation();
                 setIsPlaying(!isPlaying);
                 if (!isPlaying) posterAudioRef.current?.play().catch(e => console.log('Interrupted'));
                 else posterAudioRef.current?.pause();
               }}
            >
              {isPlaying ? <Pause size={32} fill="white" /> : <Play size={32} fill="white" className="ml-1" />}
            </button>
          </div>
        </div>
        <div className="w-full max-w-[400px] mt-8 space-y-6">
          <div className="bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500"><Music2 /></div>
              <div><h5 className="font-black">{selectedMusic?.title || 'Default Audio'}</h5></div>
            </div>
            <button className="px-4 py-2 bg-gray-50 rounded-xl font-black text-xs uppercase" onClick={() => setShowMusicModal(true)}>Edit</button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {effects.map(fx => (
              <button key={fx.id} className={`flex flex-col items-center gap-2 border-none bg-transparent cursor-pointer ${selectedEffect === fx.id ? 'text-rose-600' : 'text-gray-400'}`} onClick={() => setSelectedEffect(fx.id)}>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${selectedEffect === fx.id ? 'bg-rose-600 text-white shadow-lg' : 'bg-white'}`}>{fx.icon}</div>
                <span className="text-[10px] font-black uppercase tracking-widest">{fx.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="p-6 flex justify-between gap-6 bg-white border-t border-gray-100">
        <button className="flex-1 flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer" onClick={handleDownloadVideo}><div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500"><Download /></div><span className="text-[10px] font-black text-gray-400 uppercase">Save</span></button>
        <button className="flex-1 flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer" onClick={handleWhatsApp}><div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500"><MessageCircle /></div><span className="text-[10px] font-black text-gray-400 uppercase">WhatsApp</span></button>
        <button className="flex-1 flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer" onClick={handleShare}><div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500"><Share2 /></div><span className="text-[10px] font-black text-gray-400 uppercase">Share</span></button>
      </div>
      <AnimatePresence>
        {showMusicModal && (
          <motion.div className="fixed inset-0 bg-black/60 z-[4000] flex items-end" onClick={() => setShowMusicModal(false)}>
            <motion.div className="w-full bg-white rounded-t-[3rem] h-[80vh] p-6 flex flex-col" onClick={e => e.stopPropagation()} initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}>
              <div className="flex justify-between items-center mb-6">
                <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border-none" onClick={() => setShowMusicModal(false)}><X /></button>
                <h3 className="uppercase font-black">Choose Music</h3>
                <div className="w-10" />
              </div>
              <div className="flex-1 overflow-y-auto space-y-3">
                {filteredMusic.map(m => (
                  <div key={m._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                    <div><h5 className="font-black">{m.title}</h5><p className="text-[10px] text-gray-400">{m.duration}</p></div>
                    <button className="px-6 py-2 bg-rose-500 text-white rounded-xl font-black uppercase text-xs border-none" onClick={() => handleApplyMusic(m)}>Apply</button>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default VideoEditor;
