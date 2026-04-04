import React from 'react';
import { ArrowLeft, Search, Heart, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EventCalendar = () => {
  const navigate = useNavigate();

  const featuredPosters = [
    { id: 1, title: 'Navratri', image: 'https://images.unsplash.com/photo-1561059591-3230ceb10c9d?q=80&w=200&auto=format&fit=crop', tag: 'माँ कालरात्रि' },
    { id: 2, title: 'Ramnavami', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop', tag: 'रामनवमी' },
    { id: 3, title: 'AI Profile', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop', tag: 'SHRI RAM AI PROFILE', isAI: true },
  ];

  const events = [
    { day: '25', month: 'Mar', title: 'International Day of the Unborn Child' },
    { day: '', month: '', title: 'Chaitra Navratri Saptami' },
    { day: '', month: '', title: 'Bhai Subheg Singh & Bhai Shabaz Singh Shaheedi' },
    { day: '26', month: 'Mar', title: 'Purple Day for Epilepsy' },
    { day: '', month: '', title: 'Chaitra Navratri Ashtami' },
    { day: '', month: '', title: 'Annapurna Ashtami', tag: 'COMING SOON' },
    { day: '', month: '', title: 'Sandhi Puja' },
  ];

  return (
    <div className="bg-bg min-h-screen">
      {/* Header */}
      <header className="bg-[#ef4444] text-white p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <ArrowLeft className="cursor-pointer" onClick={() => navigate(-1)} />
          <h1 className="text-xl font-bold">Event Calendar</h1>
        </div>
        <Search size={22} className="cursor-pointer" />
      </header>

      <main className="pb-20">
        {/* Featured Posters Horizontal Scroll */}
        <div className="flex gap-3 px-4 py-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {featuredPosters.map(poster => (
            <div 
              key={poster.id} 
              className="flex-shrink-0 w-[140px] cursor-pointer active:scale-95 transition-transform"
              onClick={() => poster.isAI ? navigate('/') : null}
            >
              <div className="rounded-xl overflow-hidden shadow-md border-2 border-white aspect-[3/4] relative">
                <img src={poster.image} alt={poster.title} className="w-full h-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-sm p-1 text-center">
                  <span className="text-white text-[0.65rem] font-bold line-clamp-1">{poster.tag}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Date Banner */}
        <div className="mx-4 mb-6 rounded-2xl bg-gradient-to-r from-[#22c55e] to-[#4ade80] p-6 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold">March</h2>
            <p className="text-lg opacity-90">Year 2026</p>
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
          {events.map((event, idx) => (
            <div key={idx} className="flex gap-4">
              <div className="w-12 pt-2 flex flex-col items-center">
                 {event.day && (
                   <>
                     <span className="text-lg font-bold text-[#3b82f6]">{event.day}</span>
                     <span className="text-xs font-bold text-[#64748b]">{event.month}</span>
                   </>
                 )}
                 {!event.day && idx > 0 && <div className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] opacity-30 mt-4"></div>}
              </div>
              
              <div className="flex-1 flex items-center gap-3">
                <div className="flex-1 bg-white border border-[#bfdbfe] rounded-2xl p-4 shadow-sm active:bg-blue-50 transition-colors cursor-pointer group flex justify-between items-center">
                  <div className="flex flex-col gap-1">
                    <span className="text-[0.9rem] font-bold text-[#1e40af] leading-tight">{event.title}</span>
                    {event.tag && (
                       <span className="text-[0.55rem] font-extrabold text-[#92400e] bg-[#fef3c7] px-2 py-0.5 rounded-full w-fit">{event.tag}</span>
                    )}
                  </div>
                </div>
                <Heart size={20} className="text-[#64748b] cursor-pointer hover:text-red-500 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default EventCalendar;
