import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { 
  Music, Play, Pause, Trash2, Plus, Headphones, 
  Search, Filter, Tag, Check, Calendar, ArrowRight,
  Zap, MoreHorizontal, Download, Share2, ChevronDown,
  Upload, X, FileMusic, AlertCircle
} from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { AnimatePresence, motion } from 'framer-motion';

const INITIAL_MUSIC = [
  { id: 1, title: 'Holi Dhamaka Beat', category: 'Festivals', duration: '0:32', plays: 1240, added: 'Mar 18, 2026', tags: ['Energetic', 'Drum'], url: '#' },
  { id: 2, title: 'Corporate Success', category: 'Business', duration: '0:45', plays: 850, added: 'Mar 15, 2026', tags: ['Inspirational', 'Piano'], url: '#' },
  { id: 3, title: 'Emotional Morning', category: 'Good Morning', duration: '1:10', plays: 430, added: 'Mar 12, 2026', tags: ['Sitar', 'Traditional'], url: '#' },
  { id: 4, title: 'Night Sky Lullaby', category: 'Good Night', duration: '0:55', plays: 620, added: 'Mar 10, 2026', tags: ['Relaxing', 'Nature'], url: '#' },
  { id: 5, title: 'Motivational Speech Beat', category: 'Motivation', duration: '0:28', plays: 2100, added: 'Mar 08, 2026', tags: ['Fast', 'Modern'], url: '#' },
];

const MusicLibrary = () => {
  const [isPlaying, setIsPlaying] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [musicList, setMusicList] = useState(() => {
    const saved = localStorage.getItem('admin_music');
    return saved ? JSON.parse(saved) : INITIAL_MUSIC;
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [newTrackData, setNewTrackData] = useState({ title: '', category: 'Festivals' });
  const fileInputRef = useRef();
  const containerRef = useRef();

  useEffect(() => {
    localStorage.setItem('admin_music', JSON.stringify(musicList));
  }, [musicList]);

  const togglePlayback = (id) => {
    setIsPlaying(prev => prev === id ? null : id);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (!newTrackData.title) {
        setNewTrackData(prev => ({ ...prev, title: file.name.split('.')[0] }));
      }
    }
  };

  const handleCommitAsset = () => {
    if (!selectedFile || !newTrackData.title) return;

    const newTrack = {
      id: Date.now(),
      title: newTrackData.title,
      category: newTrackData.category,
      duration: '0:00', 
      plays: 0,
      added: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      tags: ['New', selectedFile.type.split('/')[1].toUpperCase()],
      url: URL.createObjectURL(selectedFile)
    };

    setMusicList(prev => [newTrack, ...prev]);
    setShowAddModal(false);
    setSelectedFile(null);
    setNewTrackData({ title: '', category: 'Festivals' });
  };

  const handleDeleteTrack = (id) => {
    setMusicList(prev => prev.filter(m => m.id !== id));
  };

  const filteredMusic = useMemo(() => {
    return musicList.filter(m => 
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      m.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [musicList, searchQuery]);

  return (
    <div ref={containerRef} className="space-y-10 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-4">
        <div>
           <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 leading-none">Audio Assets</p>
           <h1 className="text-2xl md:text-3xl font-black text-[var(--admin-text-main)] tracking-tight">Music Library</h1>
           <p className="text-slate-400 text-xs font-semibold mt-1">Audit and regulate background audio orchestration</p>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="w-full sm:w-auto rounded-xl shadow-lg shadow-red-500/20 px-6 h-11 md:h-12 border-none bg-[#ef4444] text-white text-[10px] md:text-xs font-black uppercase tracking-widest"
        >
          <Plus size={16} className="mr-2" strokeWidth={3} /> Ingress Track
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { label: 'Primary Category', value: 'Festivals', icon: Headphones, color: '#ef4444' },
          { label: 'Network Playback', value: (musicList.reduce((acc, curr) => acc + curr.plays, 0)).toLocaleString(), icon: Play, color: '#10b981' },
          { label: 'Asset Count', value: musicList.length, icon: Music, color: '#f59e0b' }
        ].map((stat, i) => (
          <Card key={i} className="border-none group overflow-hidden bg-white">
             <div className="relative z-10 flex items-center gap-5 p-6">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3 group-hover:rotate-0 transition-all duration-500"
                  style={{ backgroundColor: stat.color }}
                >
                   <stat.icon size={22} />
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                   <h3 className="text-xl font-black text-slate-800 tracking-tight">{stat.value}</h3>
                </div>
             </div>
          </Card>
        ))}
      </div>

      <Card className="border-none overflow-hidden pb-2 bg-white">
        <div className="p-5 border-b border-[var(--admin-border)] flex flex-wrap gap-4 items-center">
           <div className="flex-1 min-w-[280px] relative group">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#ef4444] transition-colors" />
              <Input 
                 placeholder="Filter by Soundscape or Genre..." 
                 className="pl-12 h-12 bg-[var(--admin-input-bg)] border-none rounded-2xl"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
           <Button variant="outline" className="h-12 px-6 rounded-2xl border-slate-200 group">
              <Filter size={16} className="mr-2 text-slate-400 group-hover:text-[#ef4444]" /> 
              Advanced Filter
           </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
             <thead>
               <tr className="border-b border-slate-100">
                 <th className="px-8 py-4 text-left text-[11px] font-black text-slate-900 uppercase tracking-wider w-[45%]">Track</th>
                 <th className="px-8 py-4 text-left text-[11px] font-black text-slate-900 uppercase tracking-wider">Category</th>
                 <th className="px-8 py-4 text-left text-[11px] font-black text-slate-900 uppercase tracking-wider">Plays</th>
                 <th className="px-8 py-4 text-left text-[11px] font-black text-slate-900 uppercase tracking-wider">Date Added</th>
                 <th className="px-8 py-4 text-right text-[11px] font-black text-slate-900 uppercase tracking-wider">Actions</th>
               </tr>
             </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredMusic.map(track => (
                <tr key={track.id} className="audio-row group hover:bg-slate-50 transition-all">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-5">
                       <button 
                          onClick={() => togglePlayback(track.id)}
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all border-none cursor-pointer shadow-sm relative overflow-hidden group/btn ${isPlaying === track.id ? 'bg-[#ef4444] text-white shadow-red-500/20' : 'bg-slate-50 text-[#ef4444] border border-slate-100'}`}
                       >
                          {isPlaying === track.id ? <Pause size={20} fill="white" /> : <Play size={20} fill="currentColor" />}
                       </button>
                       <div className="flex flex-col min-w-0">
                          <span className="text-sm font-black text-slate-700 leading-tight truncate mb-1">{track.title}</span>
                          <div className="flex items-center gap-3">
                             <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <Calendar size={10} className="text-red-500" /> {track.duration}
                             </div>
                             <div className="h-3 w-[1px] bg-slate-200" />
                             <div className="flex gap-1">
                                {track.tags.map(t => <span key={t} className="text-[9px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-tighter">{t}</span>)}
                             </div>
                          </div>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                     <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest px-3 border-slate-200 bg-white">
                        <Tag size={10} className="mr-2 text-red-500" /> {track.category}
                     </Badge>
                  </td>
                  <td className="px-8 py-5">
                     <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-700">{track.plays.toLocaleString()}</span>
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">GLOBAL REPRODUCTION</span>
                     </div>
                  </td>
                  <td className="px-8 py-5">
                     <span className="text-xs font-black text-slate-400 italic">{track.added}</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-end gap-1 transition-all">
                      <Button 
                        onClick={() => handleDeleteTrack(track.id)}
                        variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600">
                        <Download size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Music Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" 
              onClick={() => setShowAddModal(false)}
            />
            <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 30 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 30 }}
               className="relative w-full max-w-[560px] max-h-[90vh] bg-white rounded-[2rem] md:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col"
            >
               <div className="flex items-center justify-between p-8 md:p-12 pb-6 md:pb-8 border-b border-slate-50 relative z-10 bg-white">
                  <div className="flex items-center gap-4 md:gap-6">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-red-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-red-500/30 text-white shrink-0">
                       <Music size={24} className="md:size-7" strokeWidth={2.5} />
                    </div>
                    <div>
                       <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Audio Ingress</h2>
                       <p className="text-slate-400 text-[9px] md:text-[10px] font-bold uppercase tracking-widest mt-1">Strategic Audio Assets</p>
                    </div>
                  </div>
                  <button onClick={() => setShowAddModal(false)} className="w-10 h-10 md:w-12 md:h-12 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-400 border-none bg-transparent cursor-pointer transition-colors">
                    <X size={20} className="md:size-6" />
                  </button>
               </div>

               <div className="flex-1 overflow-y-auto p-8 md:p-12 pt-6 md:pt-8 custom-scrollbar">
                 <div className="space-y-8 relative z-10">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="audio/*" 
                      onChange={handleFileChange}
                    />
                    
                    <div 
                      onClick={() => fileInputRef.current.click()}
                      className={`relative border-2 border-dashed ${selectedFile ? 'border-emerald-500/40 bg-emerald-100/10' : 'border-slate-200 bg-slate-50/50'} rounded-[2rem] p-10 flex flex-col items-center justify-center group/drop hover:border-red-500/40 transition-all cursor-pointer`}
                    >
                        {selectedFile ? (
                          <>
                            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-emerald-500 shadow-lg mb-4">
                               <FileMusic size={24} strokeWidth={3} />
                            </div>
                            <p className="text-sm font-black text-slate-700 text-center px-4 break-all">{selectedFile.name}</p>
                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-2">Ready for Commitment</p>
                          </>
                        ) : (
                          <>
                            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-slate-300 group-hover/drop:text-red-500 group-hover/drop:scale-110 shadow-lg transition-all mb-4">
                               <Upload size={24} strokeWidth={3} />
                            </div>
                            <p className="text-sm font-black text-slate-700">Synchronize Sound Asset</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">MP3 / WAV NODE • MAX 10.0 MB</p>
                          </>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Asset Identity</label>
                          <Input 
                            placeholder="e.g. Cinematic Flow" 
                            value={newTrackData.title}
                            onChange={(e) => setNewTrackData(prev => ({ ...prev, title: e.target.value }))}
                            className="h-14 rounded-xl bg-slate-50 border-none px-6 font-bold" 
                          />
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Modal Classification</label>
                          <div className="relative group">
                            <select 
                              value={newTrackData.category}
                              onChange={(e) => setNewTrackData(prev => ({ ...prev, category: e.target.value }))}
                              className="flex h-14 w-full rounded-xl border-none bg-slate-50 px-6 py-2 text-sm font-black text-slate-500 outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-red-500/10"
                            >
                               <option value="Festivals">Festivals</option>
                               <option value="Business">Business</option>
                               <option value="Good Morning">Good Morning</option>
                               <option value="Good Night">Good Night</option>
                               <option value="Motivation">Motivation</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                          </div>
                       </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                       <Button 
                          variant="ghost"
                          onClick={() => { setShowAddModal(false); setSelectedFile(null); }}
                          className="flex-1 h-14 md:h-16 rounded-2xl bg-slate-50 font-extrabold text-[10px] uppercase tracking-[0.2em] text-slate-500"
                       >
                          Discard
                       </Button>
                       <Button 
                          onClick={handleCommitAsset}
                          disabled={!selectedFile || !newTrackData.title}
                          className="flex-[1.5] h-14 md:h-16 rounded-2xl bg-[#ef4444] text-white shadow-2xl shadow-red-500/30 font-extrabold text-[10px] uppercase tracking-[0.2em] gap-3 border-none disabled:opacity-50 disabled:cursor-not-allowed"
                       >
                           <Check size={18} strokeWidth={3} /> Commit Asset
                       </Button>
                    </div>
                 </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MusicLibrary;

