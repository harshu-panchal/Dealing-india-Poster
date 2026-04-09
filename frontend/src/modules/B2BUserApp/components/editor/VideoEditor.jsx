import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Video, Download, MessageCircle, Share2, Play, Pause, X, Sparkles, Layers, Sliders, Wand2, Zap, Music2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const VideoEditor = ({ template, userData, onClose }) => {
  const [showEffects, setShowEffects] = useState(false);
  const [selectedEffect, setSelectedEffect] = useState('none');
  const [isPlaying, setIsPlaying] = useState(false);
  
  const [musicList, setMusicList] = useState([]);
  const [activeMusicId, setActiveMusicId] = useState(null);
  const [previewingTrackId, setPreviewingTrackId] = useState(null);
  const previewAudioRef = useRef(null);
  const posterAudioRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5003/api';

  useEffect(() => {
    const fetchMusic = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/music/public`);
        setMusicList(data);
        if (data.length > 0) setActiveMusicId(data[0]._id);
      } catch (error) {
        console.error('Fetch music error:', error);
      }
    };
    fetchMusic();
  }, [API_URL]);

  const togglePreview = (track) => {
    if (previewingTrackId === track._id) {
      previewAudioRef.current.pause();
      setPreviewingTrackId(null);
    } else {
      setPreviewingTrackId(track._id);
      previewAudioRef.current.src = track.audioUrl;
      previewAudioRef.current.play().catch(e => console.log('Audio play blocked'));
    }
  };

  const handleApplyMusic = (id) => {
    setActiveMusicId(id);
    const track = musicList.find(m => m._id === id);
    if (track && posterAudioRef.current) {
      posterAudioRef.current.src = track.audioUrl;
      if (isPlaying) posterAudioRef.current.play();
    }
  };

  const effects = [
    { id: 'none', title: 'None', icon: <X size={24} /> },
    { id: 'blur', title: 'Blur', icon: <Layers size={24} /> },
    { id: 'fade', title: 'Fade Out', icon: <Sliders size={24} /> },
    { id: 'tectonic', title: 'Tectonic', icon: <Zap size={24} /> },
    { id: 'arti', title: 'Arti', icon: <Sparkles size={24} /> },
    { id: 'color', title: 'Color', icon: <Wand2 size={24} /> }
  ];

  return (
    <motion.div 
      className="fixed inset-0 bg-white z-[2500] flex flex-col overflow-hidden"
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <audio ref={previewAudioRef} onEnded={() => setPreviewingTrackId(null)} />
      <audio ref={posterAudioRef} loop />

      {/* Header */}
      <div className="bg-[#b91c1c] p-3 px-4 flex items-center gap-4 text-white">
        <button className="bg-transparent text-white p-0 flex items-center active:scale-95 transition-transform border-none cursor-pointer" onClick={onClose}>
          <ArrowLeft size={24} />
        </button>
        <h3 className="text-[1.1rem] font-bold">Video Poster Editor</h3>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 flex flex-col">
        {/* Poster Preview */}
        <div className="p-6 flex flex-col items-center">
          <div className="relative w-full max-w-[340px] aspect-square rounded-[2rem] overflow-hidden shadow-2xl bg-white border-8 border-white">
             <img src={template.image} alt="Preview" className="w-full h-full object-cover" />
             
             {/* Play/Pause Overlay */}
             <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                <button 
                   className="w-20 h-20 bg-white/30 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/40 shadow-2xl active:scale-90 transition-transform border-none cursor-pointer"
                   onClick={() => {
                     setIsPlaying(!isPlaying);
                     if (!isPlaying) posterAudioRef.current?.play();
                     else posterAudioRef.current?.pause();
                   }}
                >
                  {isPlaying ? <Pause size={40} fill="white" /> : <Play size={40} className="ml-1" fill="white" />}
                </button>
             </div>

             {/* Branding Bar */}
             <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md p-3 px-4 flex items-center gap-3">
               <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-orange-500 shadow-sm">
                  <img src={userData.userPhoto || userData.logo} alt="logo" className="w-full h-full object-cover" />
               </div>
               <div className="flex-1 min-w-0">
                  <div className="text-[0.75rem] font-black text-gray-900 leading-tight truncate uppercase tracking-tighter">{userData.business_name}</div>
                  <div className="text-[0.6rem] font-bold text-gray-500 tracking-wider">📞 {userData.phone_number}</div>
               </div>
             </div>
          </div>
        </div>

        {/* Dynamic Music Content */}
        <div className="flex-1 bg-white rounded-t-[3rem] p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
           <div className="flex justify-between items-center mb-6">
              <h4 className="text-[1rem] font-black text-gray-800 tracking-tight uppercase">Select Background Music</h4>
              <span className="text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full">{musicList.length} Tracks</span>
           </div>
           
           <div className="space-y-3 pb-24">
              {musicList.map(track => (
                <div 
                  key={track._id} 
                  className={`relative group bg-gray-50 border-2 rounded-[1.5rem] p-3 flex items-center gap-4 transition-all cursor-pointer ${activeMusicId === track._id ? 'border-orange-500 bg-orange-50/30' : 'border-gray-100 hover:border-gray-200'}`}
                  onClick={() => handleApplyMusic(track._id)}
                >
                   <div className="w-14 h-14 rounded-2xl bg-white flex-shrink-0 relative overflow-hidden shadow-sm">
                      <img src={track.thumbnailUrl} className="w-full h-full object-cover" alt="t" />
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePreview(track);
                        }}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity border-none cursor-pointer"
                      >
                        {previewingTrackId === track._id ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" />}
                      </button>
                   </div>
                   <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                         <h5 className={`text-[0.95rem] font-black leading-tight truncate ${activeMusicId === track._id ? 'text-orange-600' : 'text-gray-800'}`}>{track.title}</h5>
                         {activeMusicId === track._id && <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />}
                      </div>
                      <p className="text-[0.7rem] text-gray-400 font-bold uppercase tracking-widest">{track.artist}</p>
                   </div>
                   <div className="flex items-center gap-2">
                       {activeMusicId === track._id ? (
                          <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white">
                             <Zap size={12} fill="white" />
                          </div>
                       ) : (
                          <div className="w-6 h-6 rounded-full bg-gray-200/50" />
                       )}
                   </div>
                </div>
              ))}
              {musicList.length === 0 && (
                 <div className="text-center py-10 opacity-30">
                    <Music2 size={40} className="mx-auto mb-2" />
                    <p className="font-bold text-sm">No music tracks available</p>
                 </div>
              )}
           </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 px-6 border-t border-gray-100 bg-white/80 backdrop-blur-xl flex items-center justify-between gap-2 pb-8 z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
         <button 
           className="bg-orange-600 text-white px-8 py-4 rounded-[1.5rem] font-black text-[1rem] flex items-center gap-2.5 active:scale-95 transition-all shadow-xl shadow-orange-100 border-none cursor-pointer"
           onClick={() => setShowEffects(true)}
         >
           <Sparkles size={20} /> FX Filters
         </button>

         <div className="flex-1 flex justify-around items-center">
            <div className="flex flex-col items-center gap-1 text-[0.65rem] text-gray-400 font-black uppercase cursor-pointer active:scale-95 transition-transform text-center">
               <Download size={24} strokeWidth={2.5} className="text-rose-500" />
               <span>Save</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-[0.65rem] text-gray-400 font-black uppercase cursor-pointer active:scale-95 transition-transform text-center">
               <MessageCircle size={24} strokeWidth={2.5} className="text-green-500" />
               <span>Post</span>
            </div>
         </div>
      </div>

      {/* Effects Slide Modal */}
      <AnimatePresence>
        {showEffects && (
          <motion.div 
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-[3000] flex items-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowEffects(false)}
          >
            <motion.div 
              className="w-full bg-white rounded-t-[3rem] p-8 pb-12 flex flex-col gap-8 shadow-2xl"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              onClick={e => e.stopPropagation()}
            >
               <div className="flex flex-col gap-1 text-center sm:text-left">
                  <h4 className="text-xl font-black text-gray-900 uppercase">Video Transitions</h4>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Select your motion style</p>
               </div>
               
               <div className="flex items-center overflow-x-auto gap-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-2 px-1">
                  {effects.map(fx => (
                    <div 
                      key={fx.id} 
                      className="flex flex-col items-center gap-3 shrink-0 cursor-pointer group"
                      onClick={() => setSelectedEffect(fx.id)}
                    >
                       <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center transition-all ${selectedEffect === fx.id ? 'bg-orange-600 text-white scale-110 shadow-2xl shadow-orange-200' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100'}`}>
                          {React.cloneElement(fx.icon, { size: 32 })}
                       </div>
                       <span className={`text-[0.7rem] font-black uppercase tracking-widest ${selectedEffect === fx.id ? 'text-orange-600' : 'text-gray-400'}`}>{fx.title}</span>
                    </div>
                  ))}
               </div>

               <button 
                 className="w-full py-5 bg-gray-900 text-white rounded-[1.5rem] font-black text-lg shadow-2xl active:scale-[0.98] transition-all border-none uppercase tracking-widest cursor-pointer"
                 onClick={() => setShowEffects(false)}
               >
                 Confirm Effect
               </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default VideoEditor;
