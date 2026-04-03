import React, { useMemo, useState, useRef } from 'react';
import { 
  Calendar, Plus, Trash2, Edit2, Search, Filter, 
  Clock, MapPin, CheckCircle, AlertCircle, 
  ChevronLeft, ChevronRight, Bookmark, Zap,
  Layers, Target, Bell, MoreHorizontal, ChevronDown, X
} from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { AnimatePresence, motion } from 'framer-motion';

const EventManager = () => {
  const [currentMonth, setCurrentMonth] = useState('March 2026');
  const [showAddEvent, setShowAddEvent] = useState(false);
  const containerRef = useRef();

  // Entrance animations removed for immediate visibility

  // Mock events data
  const events = useMemo(() => [
    { id: 1, title: 'Holi Festival', date: 'Mar 25, 2026', type: 'Festival', status: 'Upcoming', posters: 45, color: '#ef4444' },
    { id: 2, title: 'Ram Navami', date: 'Mar 28, 2026', type: 'Religious', status: 'Draft', posters: 12, color: '#f59e0b' },
    { id: 3, title: 'Good Friday', date: 'Apr 03, 2026', type: 'Holiday', status: 'Planned', posters: 20, color: '#3b82f6' },
    { id: 4, title: 'Ambedkar Jayanti', date: 'Apr 14, 2026', type: 'National', status: 'Planned', posters: 15, color: '#6366f1' },
  ], []);

  return (
    <div ref={containerRef} className="space-y-10 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-4">
        <div>
           <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 leading-none">Schedule Management</p>
           <h1 className="text-2xl md:text-3xl font-black text-[var(--admin-text-main)] tracking-tight">Event Calendar</h1>
           <p className="text-slate-400 text-xs font-semibold mt-1">Schedule and manage upcoming festivals and important dates</p>
        </div>
        <Button 
          onClick={() => setShowAddEvent(true)}
          className="w-full sm:w-auto rounded-xl shadow-lg shadow-red-500/20 px-6 h-11 md:h-12 border-none bg-[#ef4444] text-white text-[10px] md:text-xs font-black uppercase tracking-widest"
        >
          <Plus size={16} className="mr-2" strokeWidth={3} /> Add New Event
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-10">
         {/* Calendar View */}
         <div className="lg:col-span-2 xl:col-span-3 space-y-10">
            <Card className="calendar-item border-none overflow-hidden">
               <CardHeader className="bg-white border-b border-[var(--admin-border)] px-8 py-6 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-6">
                     <h2 className="text-xl font-black text-slate-900 tracking-tight">{currentMonth}</h2>
                     <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-white border border-slate-200 text-slate-400">
                           <ChevronLeft size={16} strokeWidth={3} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-white border border-slate-200 text-slate-400">
                           <ChevronRight size={16} strokeWidth={3} />
                        </Button>
                     </div>
                  </div>
                  <div className="flex gap-1 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
                     {['Day', 'Month', 'Year'].map(mode => (
                        <button key={mode} className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl border-none cursor-pointer transition-all ${mode === 'Month' ? 'bg-[#ef4444] text-white shadow-lg shadow-red-500/20' : 'text-slate-400 hover:text-slate-600'}`}>
                           {mode}
                        </button>
                     ))}
                  </div>
               </CardHeader>

               <div className="p-8">
                  <div className="grid grid-cols-7 gap-3 bg-white">
                     {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 text-center py-2">{day}</div>
                     ))}
                     {Array.from({ length: 31 }).map((_, i) => {
                        const day = i + 1;
                        const event = events.find(e => parseInt(e.date.split(',')[0].split(' ')[1]) === day);
                         return (
                            <div key={i} className="aspect-square rounded-[1.5rem] bg-white border border-slate-100 p-3 group cursor-pointer hover:bg-slate-50 transition-all flex flex-col items-center justify-between shadow-sm">
                              <span className={`text-xs font-black w-8 h-8 flex items-center justify-center rounded-xl transition-all ${day === 28 ? 'bg-[#ef4444] text-white shadow-lg shadow-red-500/20' : 'text-slate-400 group-hover:text-slate-900'}`}>
                                 {day}
                              </span>
                              {event && (
                                 <motion.div 
                                    initial={{ scale: 0 }} 
                                    animate={{ scale: 1 }}
                                    className="w-2 h-2 rounded-full" 
                                    style={{ backgroundColor: event.color }} 
                                 />
                              )}
                           </div>
                        );
                     })}
                  </div>
               </div>
            </Card>

            <Card className="calendar-item border-none overflow-hidden">
               <CardHeader className="bg-white border-b border-[var(--admin-border)] px-8 py-6 flex flex-row items-center justify-between">
                  <CardTitle className="text-slate-900">Upcoming Schedule</CardTitle>
                  <div className="relative group w-[240px]">
                     <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#ef4444] transition-colors" />
                     <Input 
                        placeholder="Search timeline..." 
                        className="pl-11 h-10 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                     />
                  </div>
               </CardHeader>
               <div className="overflow-x-auto">
                  <table className="w-full">
                       <thead>
                          <tr className="border-b border-slate-100 bg-white">
                             <th className="px-8 py-4 text-left text-[11px] font-black text-slate-900 uppercase tracking-wider w-[35%]">Primary Event</th>
                             <th className="px-8 py-4 text-left text-[11px] font-black text-slate-900 uppercase tracking-wider">Type</th>
                             <th className="px-8 py-4 text-left text-[11px] font-black text-slate-900 uppercase tracking-wider">Posters</th>
                             <th className="px-8 py-4 text-right text-[11px] font-black text-slate-900 uppercase tracking-wider">Actions</th>
                          </tr>
                       </thead>
                     <tbody className="divide-y divide-[var(--admin-border)]">
                        {events.map(event => (
                           <tr key={event.id} className="group hover:bg-[var(--admin-row-hover)] transition-all">
                              <td className="px-8 py-5">
                                 <div className="flex items-center gap-5">
                                    <div className="w-1.5 h-10 rounded-full" style={{ backgroundColor: event.color }}></div>
                                    <div>
                                       <p className="font-black text-sm text-slate-800 dark:text-slate-200 tracking-tight leading-none mb-2">{event.title}</p>
                                       <div className="flex items-center gap-2">
                                          <Badge variant={event.status === 'Upcoming' ? 'success' : 'secondary'} className="text-[8px] font-black uppercase tracking-widest px-2">{event.status}</Badge>
                                          <span className="text-[10px] font-bold text-[var(--admin-text-subtle)] flex items-center gap-1"><Calendar size={10} /> {event.date}</span>
                                       </div>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-8 py-5">
                                 <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    <Bookmark size={12} className="text-red-500" /> {event.type}
                                 </div>
                              </td>
                              <td className="px-8 py-5">
                                 <div className="flex items-center gap-2 text-sm font-black text-[#ef4444] tracking-tight">
                                    <div className="w-2 h-2 rounded-full bg-[#ef4444] animate-pulse" />
                                    {event.posters} PROVISIONED
                                 </div>
                              </td>
                              <td className="px-8 py-5 text-right">
                                 <div className="flex justify-end gap-1 transition-all">
                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-[#ef4444]">
                                       <Edit2 size={16} />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-500">
                                       <Trash2 size={16} />
                                    </Button>
                                 </div>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </Card>
         </div>

         {/* Stats & Activity */}
         <div className="calendar-item space-y-8">
            <Card className="border-none detail-card p-8">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                  <Target size={14} className="text-[#ef4444]" /> Efficiency Matrix
               </h3>
               <div className="space-y-6">
                  {[
                     { label: 'Event Coverage', value: '92%', pct: 92, color: '#ef4444' },
                     { label: 'Asset Completion', value: '45/60', pct: 75, color: '#10b981' },
                     { label: 'Network Relay', value: 'Scheduled', pct: 100, color: '#6366f1' }
                  ].map((s, i) => (
                     <div key={i} className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                           <span className="text-slate-500">{s.label}</span>
                           <span className="text-slate-800 dark:text-slate-200">{s.value}</span>
                        </div>
                        <div className="h-2 bg-slate-50 dark:bg-slate-950 rounded-full border border-slate-100 dark:border-slate-800 overflow-hidden p-0.5">
                           <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${s.pct}%`, backgroundColor: s.color }}></div>
                        </div>
                     </div>
                  ))}
               </div>
            </Card>

            <Card className="bg-white dark:bg-red-500/10 rounded-[3rem] p-10 text-slate-900 dark:text-white shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden group border border-[var(--admin-border)] dark:border-none">
               <div className="absolute top-0 right-0 p-10 opacity-20 translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform duration-700">
                  <Bell size={120} className="text-white dark:text-red-500" />
               </div>
               <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                     <div className="p-3 bg-white/10 rounded-2xl">
                        <AlertCircle size={22} className="text-amber-400" />
                     </div>
                     <h3 className="text-lg font-black tracking-tight">System Alert</h3>
                  </div>
                  <p className="text-[11px] text-slate-400 font-bold uppercase leading-relaxed tracking-widest mb-10">
                     THE <span className="text-[#ef4444] font-black">HOLI FESTIVAL</span> EVENT EXPIRES IN <span className="text-red-600">72 HOURS</span>. SETUP LOCALIZED POSTS.
                  </p>
                  <Button className="w-full h-16 bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-50 shadow-xl shadow-slate-200 font-black text-[10px] uppercase tracking-[0.2em] border-none group/btn cursor-pointer">
                     Check All Tasks <ChevronRight size={14} className="ml-2 group-hover/btn:translate-x-1 transition-transform" strokeWidth={3} />
                  </Button>
               </div>
            </Card>
         </div>
      </div>

      {/* Add Event Modal */}
        <AnimatePresence>
          {showAddEvent && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" 
                onClick={() => setShowAddEvent(false)}
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 30 }}
                className="relative w-full max-w-[640px] max-h-[90vh] bg-white rounded-[2rem] md:rounded-[3rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col"
              >
                 <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <Calendar size={200} className="text-[#ef4444]" />
                 </div>

                 <div className="flex items-center justify-between p-8 md:p-12 pb-6 md:pb-8 border-b border-slate-50 relative z-10 bg-white">
                    <div className="flex items-center gap-4 md:gap-6">
                       <div className="w-12 h-12 md:w-16 md:h-16 bg-[#ef4444] rounded-2xl flex items-center justify-center shadow-2xl shadow-red-500/30 text-white shrink-0">
                          <Calendar size={24} className="md:size-7" strokeWidth={2.5} />
                       </div>
                       <div>
                          <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">New Event Setup</h2>
                          <p className="text-slate-400 text-[9px] md:text-[10px] font-bold uppercase tracking-widest mt-1">Schedule important upcoming dates</p>
                       </div>
                    </div>
                    <button onClick={() => setShowAddEvent(false)} className="w-10 h-10 md:w-12 md:h-12 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-400 border-none bg-transparent cursor-pointer transition-colors relative z-20">
                      <X size={20} className="md:size-6" />
                    </button>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto p-8 md:p-12 pt-6 md:pt-8 custom-scrollbar relative z-10">
                    <div className="space-y-8">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Registry Identity</label>
                          <Input placeholder="e.g. Traditional New Year Cycle" className="h-14 md:h-16 rounded-xl bg-slate-50 border-none px-6 font-bold" />
                       </div>

                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                         <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Target Date</label>
                            <Input type="date" className="h-14 md:h-16 rounded-xl bg-slate-50 border-none px-6 font-bold text-slate-500" />
                         </div>
                         <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Classification</label>
                            <div className="relative">
                              <select className="flex h-14 md:h-16 w-full rounded-xl border-none bg-slate-50 px-6 py-2 text-sm font-black text-slate-500 outline-none appearance-none cursor-pointer">
                                 <option>Determine Type</option>
                                 <option>Festival Node</option>
                                 <option>National Holiday</option>
                                 <option>Religious Cycle</option>
                                 <option>Business Event</option>
                              </select>
                              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                         </div>
                       </div>

                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Internal Registry Notes</label>
                          <textarea className="flex min-h-[120px] w-full rounded-xl border-none bg-slate-50 px-6 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-red-500/10 transition-all" placeholder="Strategic annotations for content provision..."></textarea>
                       </div>

                       <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Button 
                           variant="ghost"
                           onClick={() => setShowAddEvent(false)}
                           className="flex-1 h-14 md:h-16 rounded-2xl bg-slate-50 font-extrabold text-[10px] uppercase tracking-[0.2em] text-slate-500 border-none cursor-pointer"
                        >
                           Discard
                        </Button>
                        <Button 
                          onClick={() => {
                            // In a real app, this would hit the API
                            setShowAddEvent(false);
                          }}
                          className="flex-[1.5] h-14 md:h-16 rounded-2xl bg-[#ef4444] text-white shadow-2xl shadow-red-500/30 font-extrabold text-[10px] uppercase tracking-[0.2em] gap-3 border-none cursor-pointer"
                        >
                           Create Event
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

export default EventManager;
