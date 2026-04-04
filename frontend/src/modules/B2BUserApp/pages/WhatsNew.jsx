import React from 'react';
import { ArrowLeft, Search, ChevronRight, PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WhatsNew = () => {
  const navigate = useNavigate();

  const updates = [
    { 
      id: 1, 
      title: 'AI Profile Photo', 
      subtitle: '441 new posters uploaded', 
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop', 
      date: '25th Mar',
      isAI: true 
    },
    { 
      id: 2, 
      title: 'Ram Navami', 
      subtitle: '2 new videos uploaded', 
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop', 
      date: '25th Mar',
      isVideo: true
    },
    { 
      id: 3, 
      title: 'Jai Shri Ram', 
      subtitle: '2 new videos uploaded', 
      image: 'https://images.unsplash.com/photo-1561059591-3230ceb10c9d?q=80&w=200&auto=format&fit=crop', 
      date: '25th Mar',
      isVideo: true
    },
    { 
      id: 4, 
      title: 'PosterX', 
      subtitle: '324 new posters uploaded', 
      image: 'https://images.unsplash.com/photo-1563906267088-b029e7101114?q=80&w=200&auto=format&fit=crop', 
      date: '25th Mar'
    },
    { 
      id: 5, 
      title: 'Marketing Studio', 
      subtitle: '22 new posters uploaded', 
      image: 'https://images.unsplash.com/photo-1560174038-da43ac74f01b?q=80&w=200&auto=format&fit=crop', 
      date: '25th Mar'
    },
    { 
      id: 6, 
      title: 'Product Studio', 
      subtitle: '193 new posters uploaded', 
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=200&auto=format&fit=crop', 
      date: '25th Mar'
    },
  ];

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* Header */}
      <header className="bg-[#ef4444] text-white p-4 flex items-center gap-4 sticky top-0 z-50">
        <ArrowLeft className="cursor-pointer" onClick={() => navigate(-1)} />
        <h1 className="text-xl font-bold">What's New</h1>
      </header>

      <main className="pb-20">
        {/* Section divider */}
        <div className="flex items-center gap-4 px-6 py-8">
           <div className="h-[1px] bg-[#cbd5e1] flex-1"></div>
           <span className="text-[#ef4444] text-sm font-bold uppercase tracking-wider">New updates</span>
           <div className="h-[1px] bg-[#cbd5e1] flex-1"></div>
        </div>

        {/* Updates list */}
        <div className="px-4 flex flex-col gap-4">
          {updates.map((item) => (
            <div key={item.id} className="bg-white rounded-3xl p-4 shadow-sm border border-[#f1f5f9] flex gap-4 active:bg-gray-50 transition-colors">
              <div className="w-[80px] h-[80px] rounded-2xl overflow-hidden shadow-sm flex-shrink-0 relative">
                 <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                 {item.isVideo && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                       <PlayCircle size={24} className="text-white fill-white/20" />
                    </div>
                 )}
              </div>
              
              <div className="flex-1 flex flex-col justify-between py-1">
                <div className="flex items-center gap-2">
                   <h3 className="text-[1.05rem] font-bold text-[#0f172a]">{item.title}</h3>
                   <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]"></span>
                </div>
                <p className="text-[0.85rem] text-[#64748b] font-medium leading-tight">{item.subtitle}</p>
                <div className="flex justify-between items-end pt-2 border-t border-[#f1f5f9] mt-2">
                  <button 
                    className="text-[#3b82f6] text-[0.85rem] font-bold flex items-center gap-1 cursor-pointer hover:underline"
                    onClick={() => item.isAI ? navigate('/') : null}
                  >
                    Check out <ChevronRight size={16} />
                  </button>
                  <span className="text-[0.8rem] text-[#94a3b8] font-medium">{item.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default WhatsNew;
