import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
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
import AdminModal from '../components/ui/AdminModal';
import { useAdminAuth } from '../context/AdminAuthContext';

const EventManager = () => {
  const { admin } = useAdminAuth();
  const [currentMonth, setCurrentMonth] = useState('March 2026');
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5003/api';

  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newEventData, setNewEventData] = useState({ 
    name: '', 
    date: '', 
    type: '', 
    categoryId: '',
    description: '' 
  });
  const [otherType, setOtherType] = useState('');

  const headers = useMemo(() => ({
    Authorization: `Bearer ${admin?.accessToken}`
  }), [admin]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [eventsRes, categoriesRes] = await Promise.all([
        axios.get(`${API_URL}/admin/events`, { headers }),
        axios.get(`${API_URL}/admin/categories`, { headers })
      ]);
      setEvents(eventsRes.data);
      setCategories(categoriesRes.data);
      if (categoriesRes.data.length > 0 && !newEventData.type) {
        setNewEventData(prev => ({ 
            ...prev, 
            type: categoriesRes.data[0].name,
            categoryId: categoriesRes.data[0]._id 
        }));
      }
    } catch (error) {
      console.error('Failed to fetch event manager data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (admin?.accessToken) {
      fetchData();
    }
  }, [admin, API_URL]);

  const handleAddEvent = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newEventData,
        type: newEventData.type === 'Other' ? otherType : newEventData.type,
      };
      
      await axios.post(`${API_URL}/admin/events`, payload, { headers });
      fetchData();
      setShowAddEvent(false);
      setNewEventData({ name: '', date: '', type: categories[0]?.name || '', categoryId: categories[0]?._id || '', description: '' });
      setOtherType('');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create event');
    }
  };

  const deleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event? Templates linked to it will be unlinked.')) return;
    try {
      await axios.delete(`${API_URL}/admin/events/${id}`, { headers });
      fetchData();
    } catch (error) {
      alert('Failed to delete event');
    }
  };

  const handleTypeChange = (e) => {
    const val = e.target.value;
    const selectedCat = categories.find(c => c.name === val);
    setNewEventData({
      ...newEventData,
      type: val,
      categoryId: selectedCat ? selectedCat._id : ''
    });
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
         {/* Upcoming Schedule List */}
         <div className="lg:col-span-3 xl:col-span-4 space-y-10">
            <Card className="calendar-item border-none overflow-hidden bg-white shadow-xl shadow-slate-200/50">
               <CardHeader className="bg-white border-b border-slate-100 px-8 py-6 flex flex-row items-center justify-between">
                  <CardTitle className="text-slate-900">Registered Events</CardTitle>
                  <div className="relative group w-[240px]">
                     <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#ef4444] transition-colors" />
                     <Input 
                        placeholder="Search events..." 
                        className="pl-11 h-10 bg-slate-50 border-none rounded-xl text-xs font-bold"
                     />
                  </div>
               </CardHeader>
               <div className="overflow-x-auto">
                  <table className="w-full">
                       <thead>
                          <tr className="border-b border-slate-50 bg-slate-50/50">
                             <th className="px-8 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-wider w-[35%]">Primary Event</th>
                             <th className="px-8 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-wider">Classification</th>
                             <th className="px-8 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-wider">Templates</th>
                             <th className="px-8 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-wider">Status</th>
                             <th className="px-8 py-4 text-right text-[11px] font-black text-slate-400 uppercase tracking-wider">Actions</th>
                          </tr>
                       </thead>
                     <tbody className="divide-y divide-slate-50">
                        {events.map(event => (
                           <tr key={event._id} className="group hover:bg-slate-50 transition-all">
                              <td className="px-8 py-5">
                                 <div className="flex items-center gap-5">
                                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-[#ef4444]">
                                       <Calendar size={20} />
                                    </div>
                                    <div>
                                       <p className="font-black text-sm text-slate-800 tracking-tight leading-none mb-2">{event.name}</p>
                                       <div className="flex items-center gap-2">
                                          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                             <Clock size={10} /> {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                          </span>
                                       </div>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-8 py-5">
                                 <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-none">{event.type}</Badge>
                                 </div>
                              </td>
                              <td className="px-8 py-5">
                                 <Link 
                                   to={`/admin/templates?event=${event._id}`}
                                   className="flex items-center gap-2 text-[10px] font-black text-[#ef4444] tracking-tight uppercase hover:bg-red-50 p-2 rounded-xl transition-colors cursor-pointer border-none"
                                 >
                                    <Clock size={12} className="opacity-50" /> {event.templateCount || 0} Posters
                                 </Link>
                              </td>
                              <td className="px-8 py-5">
                                 <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${event.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                       {event.status}
                                    </span>
                                 </div>
                              </td>
                              <td className="px-8 py-5 text-right">
                                 <div className="flex justify-end gap-1 transition-all">
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-10 w-10 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-[#ef4444]"
                                    >
                                       <Edit2 size={16} />
                                    </Button>
                                     <Button 
                                       variant="ghost" 
                                       size="icon" 
                                       onClick={() => deleteEvent(event._id)}
                                       className="h-10 w-10 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-500"
                                     >
                                        <Trash2 size={16} />
                                     </Button>
                                 </div>
                              </td>
                           </tr>
                        ))}
                        {events.length === 0 && (
                           <tr>
                              <td colSpan="4" className="px-8 py-20 text-center">
                                 <div className="flex flex-col items-center gap-3">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                                       <Calendar size={32} />
                                    </div>
                                    <p className="text-sm font-bold text-slate-400">No events scheduled yet. Create your first event!</p>
                                 </div>
                              </td>
                           </tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </Card>
         </div>
      </div>

      {/* Add Event Modal */}
      <AdminModal
        isOpen={showAddEvent}
        onClose={() => setShowAddEvent(false)}
        title="Create Scheduled Event"
        subtitle="Classification & Strategic Planning"
        icon={Calendar}
      >
        <form onSubmit={handleAddEvent} className="space-y-8">
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Event Name</label>
                 <Input 
                   required
                   value={newEventData.name}
                   onChange={(e) => setNewEventData({...newEventData, name: e.target.value})}
                   placeholder="e.g. Diwali Festival" 
                   className="h-14 md:h-16 rounded-xl bg-slate-50 border-none px-6 font-bold" 
                 />
              </div>
              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Scheduled Date</label>
                 <Input 
                   required
                   type="date" 
                   value={newEventData.date}
                   onChange={(e) => setNewEventData({...newEventData, date: e.target.value})}
                   className="h-14 md:h-16 rounded-xl bg-slate-50 border-none px-6 font-bold" 
                 />
              </div>
              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Classification Type</label>
                 <select 
                   value={newEventData.type}
                   onChange={handleTypeChange}
                   className="w-full h-14 md:h-16 rounded-xl bg-slate-50 border-none px-6 font-bold text-sm outline-none focus:ring-2 focus:ring-red-500/10 appearance-none cursor-pointer"
                 >
                    {categories.map(cat => (
                       <option key={cat._id} value={cat.name}>{cat.name}</option>
                    ))}
                    <option value="Other">Other (Custom)</option>
                 </select>
              </div>

              {newEventData.type === 'Other' && (
                <div className="space-y-3">
                   <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Custom Type Name</label>
                   <Input 
                     required
                     value={otherType}
                     onChange={(e) => setOtherType(e.target.value)}
                     placeholder="Enter event type..." 
                     className="h-14 md:h-16 rounded-xl bg-slate-50 border-none px-6 font-bold shadow-sm shadow-blue-100" 
                   />
                </div>
              )}

              <div className="space-y-3 sm:col-span-2">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Context / Description</label>
                 <Input 
                   value={newEventData.description}
                   onChange={(e) => setNewEventData({...newEventData, description: e.target.value})}
                   placeholder="Add a brief description about this event..." 
                   className="h-14 md:h-16 rounded-xl bg-slate-50 border-none px-6 font-bold" 
                 />
              </div>
           </div>

           <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button type="button" onClick={() => setShowAddEvent(false)} variant="ghost" className="flex-1 h-14 md:h-16 rounded-2xl bg-slate-50 font-extrabold text-[10px] uppercase tracking-[0.2em] text-slate-500 border-none">
                 Discard
              </Button>
              <Button type="submit" className="flex-[1.5] h-14 md:h-16 rounded-2xl bg-[#ef4444] text-white shadow-2xl shadow-red-500/30 font-extrabold text-[10px] uppercase tracking-[0.2em] gap-3 border-none">
                 <CheckCircle size={18} strokeWidth={3} /> Register Event
              </Button>
           </div>
        </form>
      </AdminModal>
    </div>
  );
};

export default EventManager;
