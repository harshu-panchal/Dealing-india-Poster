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
import AdminModal from '../components/ui/AdminModal';

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
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
      added: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }), 
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
           <Button 
             variant="outline" 
             onClick={() => alert('Opening sonic attribute filtering...')}
             className="h-12 px-6 rounded-2xl border-slate-200 group"
           >
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
                        onClick={() => setShowDeleteConfirm(track)}
                        variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => alert('Initiating secure asset download...')}
                        className="h-10 w-10 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                      >
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

      {/* Ingress Modal */}
      <AdminModal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setSelectedFile(null); }}
        title="Ingress Audio Track"
        subtitle="Provision new background layer"
        icon={Music}
      >
        <div className="space-y-8">
           <div className="p-8 border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/50 hover:bg-slate-50 transition-all text-center group cursor-pointer" onClick={() => fileInputRef.current.click()}>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="audio/*" className="hidden" />
              {selectedFile ? (
                <div className="flex flex-col items-center">
                   <div className="w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-emerald-500/20">
                      <Check size={32} strokeWidth={3} />
                   </div>
                   <p className="text-xs font-black text-slate-800 uppercase tracking-widest truncate max-w-xs">{selectedFile.name}</p>
                   <p className="text-[10px] font-bold text-slate-400 mt-1">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • READY FOR COMMIT</p>
                </div>
              ) : (
                <div className="flex flex-col items-center py-6">
                   <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-300 mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-sm border border-slate-50">
                      <Music size={32} />
                   </div>
                   <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1">Select Audio Payload</p>
                   <p className="text-[10px] font-bold text-slate-400">MP3, WAV, or AAC (Max 10MB)</p>
                </div>
              )}
           </div>

           <div className="space-y-6">
              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Asset Identity</label>
                 <Input 
                   value={newTrackData.title}
                   onChange={(e) => setNewTrackData({...newTrackData, title: e.target.value})}
                   placeholder="e.g. Cinematic Uplifting Hook" 
                   className="h-14 md:h-16 rounded-xl bg-slate-50 border-none px-6 font-bold"
                 />
              </div>

              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Registry Category</label>
                 <select 
                    value={newTrackData.category}
                    onChange={(e) => setNewTrackData({...newTrackData, category: e.target.value})}
                    className="w-full h-14 md:h-16 rounded-xl bg-slate-50 border-none px-6 font-bold text-sm outline-none focus:ring-2 focus:ring-red-500/10"
                 >
                    <option value="Festivals">Festivals</option>
                    <option value="Business">Business</option>
                    <option value="Greetings">Greetings</option>
                    <option value="Motivation">Motivation</option>
                 </select>
              </div>
           </div>

           <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                 variant="ghost" 
                 onClick={() => { setShowAddModal(false); setSelectedFile(null); }}
                 className="flex-1 h-14 md:h-16 rounded-2xl bg-slate-50 font-extrabold text-[10px] uppercase tracking-[0.2em] text-slate-500 border-none hover:bg-slate-100"
              >
                 Abort Changes
              </Button>
              <Button 
                onClick={handleCommitAsset}
                disabled={!selectedFile || !newTrackData.title}
                className="flex-[1.5] h-14 md:h-16 rounded-2xl bg-[#ef4444] text-white shadow-2xl shadow-red-500/30 font-extrabold text-[10px] uppercase tracking-[0.2em] gap-3 border-none disabled:opacity-50"
              >
                 <Check size={18} strokeWidth={3} /> Commit Asset
              </Button>
           </div>
        </div>
      </AdminModal>

      {/* Delete Confirmation Modal */}
      <AdminModal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        title="Wipe Track Metadata?"
        subtitle="Permanent Action"
        icon={Trash2}
        variant="danger"
        maxWidth="450px"
      >
        <div className="text-center">
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed mb-8 px-4 font-inter">
              Are you sure you want to remove <span className="text-slate-800 font-extrabold">"{showDeleteConfirm?.title}"</span>? This track will be purged from the global audio registry.
           </p>

           <div className="flex gap-3">
              <Button 
                variant="ghost" 
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 h-14 rounded-2xl bg-slate-50 font-black text-[10px] uppercase tracking-widest text-slate-500 border-none"
              >
                Abort
              </Button>
              <Button 
                onClick={() => {
                  handleDeleteTrack(showDeleteConfirm.id);
                  setShowDeleteConfirm(null);
                }}
                className="flex-1 h-14 rounded-2xl bg-rose-500 text-white shadow-lg shadow-rose-500/20 font-black text-[10px] uppercase tracking-widest border-none"
              >
                Confirm Delete
              </Button>
           </div>
        </div>
      </AdminModal>
    </div>
  );
};

export default MusicLibrary;
