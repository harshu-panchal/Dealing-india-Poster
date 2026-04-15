import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Search, Loader2, Sparkles, Filter, LayoutGrid } from 'lucide-react';
import { useEditor } from '../context/EditorContext';
import { motion } from 'framer-motion';

const EventTemplates = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { openEditor } = useEditor();
  const [templates, setTemplates] = useState([]);
  const [event, setEvent] = useState(null);
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5003/api';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [eventRes, templatesRes] = await Promise.all([
          axios.get(`${API_URL}/user/events`),
          axios.get(`${API_URL}/user/events/${id}/templates`)
        ]);
        
        setAllEvents(eventRes.data);
        const currentEvent = eventRes.data.find(e => e._id === id);
        setEvent(currentEvent);
        setTemplates(templatesRes.data);
      } catch (error) {
        console.error('Failed to fetch event templates:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, API_URL]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-red-500" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Event Navigation Pills */}
      <div className="flex gap-2 px-4 pb-6 pt-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden bg-white">
        {allEvents.map(evt => (
          <button
            key={evt._id}
            onClick={() => navigate(`/event/${evt._id}/templates`)}
            className={`flex-shrink-0 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border-none cursor-pointer ${
              id === evt._id 
                ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' 
                : 'bg-white text-slate-500 border border-slate-100'
            }`}
          >
            {evt.name}
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="px-5 mb-4 mt-4 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <LayoutGrid size={16} className="text-slate-400" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Layout</span>
         </div>
         <button className="flex items-center gap-2 text-blue-600 text-[10px] font-black uppercase tracking-widest border-none bg-transparent cursor-pointer">
            <Filter size={14} /> Filter
         </button>
      </div>

      {/* Grid: 2 columns on mobile */}
      <div className="px-4 pb-10">
         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {templates.map((tpl) => (
               <motion.div 
                key={tpl._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileTap={{ scale: 0.95 }}
                className="group cursor-pointer"
                onClick={() => openEditor(tpl)}
              >
                <div className="bg-white rounded-3xl overflow-hidden shadow-md border border-slate-100 hover:shadow-xl transition-all duration-300">
                   <div className="aspect-[4/5] relative bg-slate-50">
                      <img src={tpl.image} className="w-full h-full object-cover" alt={tpl.name} />
                      {tpl.isPremium && (
                         <div className="absolute top-3 right-3 w-8 h-8 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-amber-400">
                            <Sparkles size={14} />
                         </div>
                      )}
                      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <div className="bg-white/90 backdrop-blur p-4 rounded-3xl shadow-xl">
                            <LayoutGrid size={28} className="text-slate-900" />
                         </div>
                      </div>
                   </div>
                </div>
              </motion.div>
            ))}
         </div>

         {templates.length === 0 && (
            <div className="py-20 text-center flex flex-col items-center gap-4">
               <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-slate-200 border border-slate-100">
                  <LayoutGrid size={40} />
               </div>
               <div>
                  <h3 className="text-lg font-black text-slate-400 uppercase tracking-tight">No Templates</h3>
                  <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Available for this event yet</p>
               </div>
            </div>
         )}
      </div>
    </div>
  );
};

export default EventTemplates;
