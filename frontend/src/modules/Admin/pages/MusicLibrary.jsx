import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Music, Plus, Search, Trash2, Play, Pause, Music2, Upload, X, CheckCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const MusicLibrary = () => {
  const [tracks, setTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    category: 'General',
    audioUrl: '',
    thumbnailUrl: ''
  });
  
  const [isUploading, setIsUploading] = useState({ audio: false, thumb: false });
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const audioRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';
  const adminInfo = useMemo(() => JSON.parse(localStorage.getItem('adminInfo')), []);

  const fetchTracks = useCallback(async () => {
    if (!adminInfo?.accessToken) return;
    try {
      setIsLoading(true);
      const { data } = await axios.get(`${API_URL}/music`, {
        headers: { Authorization: `Bearer ${adminInfo?.accessToken}` }
      });
      setTracks(data);
    } catch (error) {
      console.error('Fetch tracks error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [API_URL, adminInfo]);

  useEffect(() => {
    fetchTracks();
  }, [fetchTracks]);

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(prev => ({ ...prev, [type]: true }));
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      const { data } = await axios.post(`${API_URL}/admin/upload`, formDataUpload, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${adminInfo?.accessToken}`
        }
      });
      
      setFormData(prev => ({ 
        ...prev, 
        [type === 'audio' ? 'audioUrl' : 'thumbnailUrl']: data.url 
      }));
    } catch (error) {
      alert('Upload failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.audioUrl) return alert('Please upload an audio file first');

    try {
      await axios.post(`${API_URL}/music`, formData, {
        headers: { Authorization: `Bearer ${adminInfo?.accessToken}` }
      });
      setIsModalOpen(false);
      setFormData({ title: '', artist: '', category: 'General', audioUrl: '', thumbnailUrl: '' });
      fetchTracks();
    } catch (error) {
      alert('Save failed: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this track?')) return;
    try {
      await axios.delete(`${API_URL}/music/${id}`, {
        headers: { Authorization: `Bearer ${adminInfo?.accessToken}` }
      });
      fetchTracks();
    } catch (error) {
      alert('Delete failed');
    }
  };

  const togglePlayback = (track) => {
    if (currentlyPlaying?.id === track._id) {
      setCurrentlyPlaying(null);
      audioRef.current.pause();
    } else {
      setCurrentlyPlaying({ id: track._id, url: track.audioUrl });
      if (audioRef.current) {
        audioRef.current.src = track.audioUrl;
        audioRef.current.play();
      }
    }
  };

  const filteredTracks = tracks.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 pb-32 bg-[var(--admin-bg)] min-h-screen">
      <audio ref={audioRef} onEnded={() => setCurrentlyPlaying(null)} />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 leading-none">Catalog Hub</p>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
             <Music className="text-orange-600" size={32} /> Music Library
          </h1>
          <p className="text-slate-400 text-xs font-semibold mt-1 italic">Audio assets deployed to the video editing engine</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full md:w-auto bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-2xl shadow-orange-500/20 transition-all border-none cursor-pointer active:scale-95"
        >
          <Plus size={20} strokeWidth={3} /> Add Track to Registry
        </button>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
         <div className="relative group flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-600 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Search by title, artist or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 rounded-2xl border-none bg-white shadow-sm font-bold text-sm text-slate-700 outline-none ring-2 ring-transparent focus:ring-orange-500/10 transition-all"
            />
         </div>
         <div className="px-8 py-4 bg-white rounded-2xl flex items-center gap-4 shadow-sm border border-slate-50">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
               <Music2 size={20} />
            </div>
            <div className="flex flex-col">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Assets</span>
               <span className="text-lg font-black text-slate-800 leading-none">{tracks.length}</span>
            </div>
         </div>
      </div>

      {/* Grid Layout */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
           {[...Array(8)].map((_, i) => (
             <div key={i} className="h-80 bg-white rounded-[2.5rem] border border-slate-100 p-4 animate-pulse">
                <div className="aspect-square bg-slate-50 rounded-[2rem] mb-4" />
                <div className="space-y-2 px-2">
                   <div className="h-4 bg-slate-50 w-2/3 rounded" />
                   <div className="h-3 bg-slate-50 w-1/2 rounded" />
                </div>
             </div>
           ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTracks.map(track => (
            <motion.div 
              layout 
              key={track._id} 
              className="group bg-white rounded-[2.5rem] border border-slate-50 overflow-hidden hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 p-4"
            >
               <div className="aspect-square relative rounded-[2rem] overflow-hidden bg-slate-50 mb-5 shadow-inner">
                  <img src={track.thumbnailUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={track.title} />
                  
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-4 backdrop-blur-[4px]">
                     <button 
                        onClick={() => togglePlayback(track)}
                        className="w-16 h-16 rounded-full bg-white text-orange-600 flex items-center justify-center shadow-2xl active:scale-90 transition-all border-none cursor-pointer"
                     >
                        {currentlyPlaying?.id === track._id ? <Pause fill="currentColor" size={28} /> : <Play fill="currentColor" size={28} className="ml-1" />}
                     </button>
                     <button 
                        onClick={() => handleDelete(track._id)}
                        className="w-16 h-16 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-2xl active:scale-90 transition-all border-none cursor-pointer"
                     >
                        <Trash2 size={28} />
                     </button>
                  </div>

                  {currentlyPlaying?.id === track._id && (
                    <div className="absolute bottom-4 left-4 right-4 bg-white/20 backdrop-blur-xl p-3 rounded-2xl flex items-center gap-3 border border-white/20">
                       <div className="flex gap-1 items-end h-5">
                          {[...Array(4)].map((_, i) => (
                            <div key={i} className="w-1 bg-white rounded-full animate-bounce" style={{ height: '100%', animationDelay: `${i*0.15}s` }} />
                          ))}
                       </div>
                       <span className="text-[0.6rem] font-black text-white uppercase tracking-[0.2em]">Master Preview</span>
                    </div>
                  )}
               </div>
               
               <div className="px-2">
                  <div className="flex items-center gap-2 mb-2">
                     <span className="text-[9px] font-black text-orange-600 uppercase tracking-widest bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-100">
                        {track.category || 'General'}
                     </span>
                  </div>
                  <h3 className="font-black text-slate-800 text-lg leading-tight truncate tracking-tight">{track.title}</h3>
                  <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{track.artist || 'Unknown Artist'}</p>
               </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Music Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-0 sm:p-4 overflow-y-auto bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-2xl sm:rounded-[3rem] shadow-2xl relative flex flex-col min-h-screen sm:min-h-0"
            >
               {/* Modal Header */}
               {/* Modal Header */}
               <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 sticky top-0 z-10 sm:static sm:bg-transparent">
                  <div>
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">Audio Registry</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">MP3 Marketplace Node</p>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(false)} 
                    className="w-10 h-10 rounded-xl bg-white shadow-lg flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors border-none cursor-pointer"
                  >
                    <X size={20} strokeWidth={3} />
                  </button>
               </div>
               
               <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6 flex-1 overflow-y-auto max-h-[75vh]">
                  {/* Title & Artist Input Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Song Title</label>
                        <input 
                          required
                          className="w-full px-5 py-3 rounded-xl border-none bg-slate-50 font-bold text-sm text-slate-800 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none" 
                          placeholder="e.g. Summer"
                          value={formData.title}
                          onChange={(e) => setFormData({...formData, title: e.target.value})}
                        />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Artist</label>
                        <input 
                          className="w-full px-5 py-3 rounded-xl border-none bg-slate-50 font-bold text-sm text-slate-800 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none" 
                          placeholder="e.g. DJ"
                          value={formData.artist}
                          onChange={(e) => setFormData({...formData, artist: e.target.value})}
                        />
                     </div>
                  </div>

                  {/* Audio File Upload */}
                  <div className="space-y-1.5">
                     <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">MP3 Source</label>
                     <div className="relative">
                        <input type="file" accept="audio/*" onChange={(e) => handleFileUpload(e, 'audio')} className="hidden" id="audio-input" />
                        <label 
                          htmlFor="audio-input" 
                          className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-[1.5rem] cursor-pointer transition-all duration-300 ${formData.audioUrl ? 'border-green-400 bg-green-50/10' : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-orange-400'}`}
                        >
                           {isUploading.audio ? (
                              <div className="flex flex-col items-center gap-2">
                                 <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
                                 <span className="text-[9px] font-black text-orange-600 uppercase tracking-widest">Uploading...</span>
                              </div>
                           ) : formData.audioUrl ? (
                              <div className="flex flex-col items-center gap-2">
                                 <CheckCircle size={24} className="text-green-500" strokeWidth={3} />
                                 <span className="text-[9px] font-black text-green-700 uppercase tracking-widest">Ready</span>
                              </div>
                           ) : (
                              <>
                                 <Music2 size={24} className="text-slate-200 mb-2" />
                                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Pick MP3</span>
                              </>
                           )}
                        </label>
                     </div>
                  </div>

                  {/* Artwork Upload */}
                  <div className="space-y-1.5">
                     <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Artwork</label>
                     <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="w-16 h-16 rounded-xl bg-white shadow-inner flex-shrink-0 relative overflow-hidden flex items-center justify-center">
                           {isUploading.thumb ? (
                              <Loader2 className="w-6 h-6 text-orange-600 animate-spin" />
                           ) : formData.thumbnailUrl ? (
                              <img src={formData.thumbnailUrl} className="w-full h-full object-cover" alt="thumb" />
                           ) : (
                              <Upload size={24} className="text-slate-100" />
                           )}
                        </div>
                        <div className="flex-1 space-y-2">
                           <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'thumb')} className="hidden" id="thumb-input" />
                           <label htmlFor="thumb-input" className="inline-block px-5 py-2 bg-white text-slate-800 font-black text-[10px] uppercase tracking-widest rounded-lg shadow-sm cursor-pointer hover:bg-slate-50 transition-all">Upload Art</label>
                           <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Square Ratio Suggested</p>
                        </div>
                     </div>
                  </div>

                  {/* Submission Actions */}
                  <div className="flex gap-3 pt-2">
                     <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-500 bg-slate-100 hover:bg-slate-200 border-none cursor-pointer">Cancel</button>
                     <button type="submit" disabled={isUploading.audio} className="flex-[2] py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest text-white bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-500/20 disabled:opacity-50 border-none cursor-pointer">Add Track</button>
                  </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MusicLibrary;
