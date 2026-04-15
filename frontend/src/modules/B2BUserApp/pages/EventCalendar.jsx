import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, Search, Heart, ChevronRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EventCalendar = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [featuredSubcategories, setFeaturedSubcategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5003/api';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [eventsRes, categoriesRes] = await Promise.all([
          axios.get(`${API_URL}/user/events`),
          axios.get(`${API_URL}/user/categories`)
        ]);
        
        setEvents(eventsRes.data);
        
        // Flatten all subcategories from all categories
        const allSubcats = categoriesRes.data.reduce((acc, cat) => {
          return [...acc, ...(cat.subcategories || [])];
        }, []);
        
        // Filter subcategories that have an image and shuffle/limit them
        const withImages = allSubcats.filter(s => s.image);
        setFeaturedSubcategories(withImages.slice(0, 10)); // Top 10 for the scroll
        
      } catch (error) {
        console.error('Failed to fetch calendar data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [API_URL]);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const fullMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentMonthName = fullMonths[new Date().getMonth()];
  const currentYear = new Date().getFullYear();

  if (isLoading) {
    return (
      <div className="bg-bg min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-red-500" size={40} />
      </div>
    );
  }

  return (
    <div className="bg-bg min-h-screen">
      <main className="pb-20">
        {/* Featured Subcategories Horizontal Scroll */}
        <div className="flex gap-3 px-4 py-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {featuredSubcategories.map(sub => (
            <div 
              key={sub._id} 
              className="flex-shrink-0 w-[140px] cursor-pointer active:scale-95 transition-transform"
              onClick={() => navigate(`/category/${sub._id}?type=subcategory`)}
            >
              <div className="rounded-xl overflow-hidden shadow-md border-2 border-white aspect-[3/4] relative bg-slate-100">
                <img src={sub.image} alt={sub.name} className="w-full h-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-sm p-1 text-center">
                  <span className="text-white text-[0.65rem] font-bold line-clamp-1 uppercase tracking-tight">{sub.name}</span>
                </div>
              </div>
            </div>
          ))}
          {featuredSubcategories.length === 0 && (
            <div className="flex-shrink-0 w-full text-center py-4 bg-white rounded-xl border border-dashed border-slate-200">
               <p className="text-[10px] font-bold text-slate-400">Add subcategory images to see them here</p>
            </div>
          )}
        </div>

        {/* Date Banner */}
        <div className="mx-4 mb-6 rounded-2xl bg-gradient-to-r from-[#22c55e] to-[#4ade80] p-6 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold">{currentMonthName}</h2>
            <p className="text-lg opacity-90">Year {currentYear}</p>
          </div>
          {/* Abstract background shapes */}
          <div className="absolute -right-4 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute right-4 bottom-4 flex gap-1 opacity-40">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-1 h-8 bg-white rounded-full transform rotate-12"></div>
            ))}
          </div>
        </div>

        {/* Events List */}
        <div className="px-4 flex flex-col gap-4">
          {events.map((event, idx) => {
            const date = new Date(event.date);
            const day = date.getDate();
            const month = months[date.getMonth()];
            
            return (
              <div 
                key={event._id} 
                className="flex gap-4 cursor-pointer active:opacity-70 transition-opacity"
                onClick={() => navigate(`/event/${event._id}/templates`)}
              >
                <div className="w-12 pt-2 flex flex-col items-center">
                   <span className="text-lg font-bold text-[#3b82f6]">{day}</span>
                   <span className="text-xs font-bold text-[#64748b]">{month}</span>
                </div>
                
                <div className="flex-1 flex items-center gap-3">
                  <div className="flex-1 bg-white border border-[#bfdbfe] rounded-2xl p-4 shadow-sm active:bg-blue-50 transition-colors group flex justify-between items-center">
                    <div className="flex flex-col gap-1">
                      <span className="text-[0.9rem] font-bold text-[#1e40af] leading-tight uppercase tracking-tight">{event.name}</span>
                      <span className="text-[0.55rem] font-extrabold text-[#92400e] bg-[#fef3c7] px-2 py-0.5 rounded-full w-fit">{event.type}</span>
                    </div>
                    <ChevronRight size={18} className="text-slate-300" />
                  </div>
                  <Heart size={20} className="text-[#64748b] hover:text-red-500 transition-colors" />
                </div>
              </div>
            );
          })}
          
          {events.length === 0 && (
             <div className="text-center py-10">
                <p className="text-slate-400 font-bold">No events scheduled for this month.</p>
             </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EventCalendar;
