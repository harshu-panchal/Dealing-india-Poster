import React, { useState, useMemo, useCallback, useRef } from 'react';
import { 
  Music, Play, Pause, Trash2, Plus, Headphones, 
  Search, Filter, Tag, Check, Calendar, ArrowRight,
  Zap, MoreHorizontal, Download, Share2, ChevronDown
} from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { AnimatePresence, motion } from 'framer-motion';

const MusicLibrary = () => {
  const [isPlaying, setIsPlaying] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const containerRef = useRef();

  // Entrance animations removed for immediate visibility

  // Mock music library data
  const musicList = useMemo(() => [
    { id: 1, title: 'Holi Dhamaka Beat', category: 'Festivals', duration: '0:32', plays: 1240, added: 'Mar 18, 2026', tags: ['Energetic', 'Drum'], url: '#' },
    { id: 2, title: 'Corporate Success', category: 'Business', duration: '0:45', plays: 850, added: 'Mar 15, 2026', tags: ['Inspirational', 'Piano'], url: '#' },
    { id: 3, title: 'Emotional Morning', category: 'Good Morning', duration: '1:10', plays: 430, added: 'Mar 12, 2026', tags: ['Sitar', 'Traditional'], url: '#' },
    { id: 4, title: 'Night Sky Lullaby', category: 'Good Night', duration: '0:55', plays: 620, added: 'Mar 10, 2026', tags: ['Relaxing', 'Nature'], url: '#' },
    { id: 5, title: 'Motivational Speech Beat', category: 'Motivation', duration: '0:28', plays: 2100, added: 'Mar 08, 2026', tags: ['Fast', 'Modern'], url: '#' },
  ], []);

  const togglePlayback = (id) => {
    setIsPlaying(prev => prev === id ? null : id);
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
      <div className="flex justify-between items-end">
        <div>
           <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 leading-none">Audio Assets</p>
           <h1 className="text-3xl font-black text-[var(--admin-text-main)] tracking-tight">Music Library</h1>
           <p className="text-slate-400 text-xs font-semibold mt-1">Audit and regulate background audio orchestration</p>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="rounded-xl shadow-lg shadow-red-500/20 px-6 h-12"
        >
          <Plus size={18} className="mr-2" strokeWidth={3} /> Ingress Track
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { label: 'Primary Category', value: 'Festivals', icon: Headphones, color: '#ef4444' },
          { label: 'Network Playback', value: '4,850', icon: Play, color: '#10b981' },
          { label: 'Storage Ingress', value: '1.2 GB', icon: Zap, color: '#f59e0b' }
        ].map((stat, i) => (
          <Card key={i} className="border-none group overflow-hidden relative">
             <div className="absolute top-0 right-0 w-20 h-20 bg-slate-50  rounded-bl-[3rem] group-hover:scale-110 transition-transform duration-500 -z-0" />
             <div className="relative z-10 flex items-center gap-5 p-6">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3 group-hover:rotate-0 transition-all duration-500"
                  style={{ backgroundColor: stat.color }}
                >
                   <stat.icon size={22} />
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                   <h3 className="text-xl font-black text-slate-800 dark:text-slate-200 tracking-tight">{stat.value}</h3>
                </div>
             </div>
          </Card>
        ))}
      </div>

      <Card className="border-none overflow-hidden pb-2">
        <div className="p-5 border-b border-[var(--admin-border)] flex flex-wrap gap-4 items-center bg-white ">
           <div className="flex-1 min-w-[280px] relative group">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#ef4444] transition-colors" />
              <Input 
                 placeholder="Filter by Soundscape or Genre..." 
                 className="pl-12 h-12 bg-[var(--admin-input-bg)]"
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
               <tr className="border-b border-slate-100 bg-white">
                 <th className="px-8 py-4 text-left text-[11px] font-black text-slate-900 uppercase tracking-wider w-[45%]">Track</th>
                 <th className="px-8 py-4 text-left text-[11px] font-black text-slate-900 uppercase tracking-wider">Category</th>
                 <th className="px-8 py-4 text-left text-[11px] font-black text-slate-900 uppercase tracking-wider">Plays</th>
                 <th className="px-8 py-4 text-left text-[11px] font-black text-slate-900 uppercase tracking-wider">Date Added</th>
                 <th className="px-8 py-4 text-right text-[11px] font-black text-slate-900 uppercase tracking-wider">Actions</th>
               </tr>
             </thead>
            <tbody className="divide-y divide-[var(--admin-border)]">
              {filteredMusic.map(track => (
                <tr key={track.id} className="audio-row group hover:bg-[var(--admin-row-hover)] transition-all">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-5">
                       <button 
                          onClick={() => togglePlayback(track.id)}
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all border-none cursor-pointer shadow-sm relative overflow-hidden group/btn ${isPlaying === track.id ? 'bg-[#ef4444] text-white shadow-red-500/20' : 'bg-slate-50  text-[#ef4444] border border-[var(--admin-border)]'}`}
                       >
                          <div className={`absolute inset-0 bg-red-500 opacity-0 group-hover/btn:opacity-10 transition-opacity ${isPlaying === track.id ? 'hidden' : ''}`} />
                          {isPlaying === track.id ? <Pause size={20} fill="white" /> : <Play size={20} fill="currentColor" />}
                       </button>
                       <div className="flex flex-col min-w-0">
                          <span className="text-sm font-black text-slate-700  leading-tight truncate mb-1">{track.title}</span>
                          <div className="flex items-center gap-3">
                             <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <Calendar size={10} className="text-red-500" /> {track.duration}
                             </div>
                             <div className="h-3 w-[1px] bg-slate-200 " />
                             <div className="flex gap-1">
                                {track.tags.map(t => <span key={t} className="text-[9px] font-black text-[var(--admin-text-subtle)] bg-white/50  px-2 py-0.5 rounded uppercase tracking-tighter">{t}</span>)}
                             </div>
                          </div>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                     <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest px-3 border-slate-200 bg-white  ">
                        <Tag size={10} className="mr-2 text-red-500" /> {track.category}
                     </Badge>
                  </td>
                  <td className="px-8 py-5">
                     <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-700 ">{track.plays.toLocaleString()}</span>
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">GLOBAL REPRODUCTION</span>
                     </div>
                  </td>
                  <td className="px-8 py-5">
                     <span className="text-xs font-black text-slate-400 italic">{track.added}</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-end gap-1 transition-all">
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-red-500">
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" 
              onClick={() => setShowAddModal(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="relative w-full max-w-[560px] bg-white  rounded-[3rem] p-12 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] overflow-hidden"
            >
               <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                  <Music size={160} className="text-[#ef4444]" />
               </div>

               <div className="flex items-center gap-6 mb-12 relative z-10">
                  <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-red-500/30 text-white">
                     <Music size={28} strokeWidth={2.5} />
                  </div>
                  <div>
                     <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Audio Ingress</h2>
                     <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Strategic Audio Assets</p>
                  </div>
               </div>

               <div className="space-y-8 relative z-10">
                  <div className="relative border-2 border-dashed border-slate-200  rounded-[2rem] p-10 flex flex-col items-center justify-center group/drop hover:border-red-500/40 transition-all bg-slate-50/50 dark:bg-slate-950/50 hover:bg-red-50/10 cursor-pointer">
                      <div className="w-14 h-14 bg-white  rounded-xl flex items-center justify-center text-slate-300 group-hover/drop:text-red-500 group-hover/drop:scale-110 shadow-lg transition-all mb-4">
                         <Plus size={24} strokeWidth={3} />
                      </div>
                      <p className="text-sm font-black text-slate-700 dark:text-slate-200">Synchronize Sound Asset</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">MP3 / WAV NODE â€¢ MAX 10.0 MB</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Asset Identity</label>
                        <Input placeholder="e.g. Cinematic Flow" className="h-14 rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-100  px-6 font-bold" />
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Modal Classification</label>
                        <div className="relative group">
                          <select className="flex h-14 w-full rounded-xl border-slate-100  bg-slate-50 dark:bg-slate-950 px-6 py-2 text-sm font-black text-slate-500 outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-red-500/10">
                             <option>Select Mood</option>
                             <option>Festivals</option>
                             <option>Corporate Hierarchy</option>
                             <option>High Motivation</option>
                          </select>
                          <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                     </div>
                  </div>

                  <div className="flex gap-4 pt-6">
                     <Button 
                        variant="ghost"
                        onClick={() => setShowAddModal(false)}
                        className="flex-1 h-16 rounded-2xl bg-slate-50  font-extrabold text-[10px] uppercase tracking-[0.2em] text-slate-500"
                     >
                        Discard
                     </Button>
                     <Button className="flex-[1.5] h-16 rounded-2xl bg-[#ef4444] text-white shadow-2xl shadow-red-500/30 font-extrabold text-[10px] uppercase tracking-[0.2em] gap-3">
                         <Check size={18} strokeWidth={3} /> Commit Asset
                     </Button>
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
