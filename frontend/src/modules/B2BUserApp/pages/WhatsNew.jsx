import React, { useEffect, useState } from 'react';
import { ArrowLeft, ChevronRight, PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useEditor } from '../context/EditorContext';
import ShimmerLayout from '../components/common/ShimmerLayout';

const WhatsNew = () => {
  const navigate = useNavigate();
  const { openDetail } = useEditor();
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/user/whats-new`);
        setUpdates(data);
      } catch (error) {
        console.error('Error fetching what\'s new content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUpdates();
  }, [API_URL]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    
    // Day suffix
    let suffix = 'th';
    if (day === 1 || day === 21 || day === 31) suffix = 'st';
    else if (day === 2 || day === 22) suffix = 'nd';
    else if (day === 3 || day === 23) suffix = 'rd';

    return `${day}${suffix} ${month}`;
  };

  const handleCheckOut = (item) => {
    if (item.type === 'template') {
      // Open on home page
      navigate('/');
      setTimeout(() => {
        openDetail(item.templateData);
      }, 100);
    } else if (item.type === 'category') {
      // Open category detail
      navigate(`/category/${item.id}`);
    } else if (item.type === 'event') {
      // Open event templates
      navigate(`/event/${item.id}/templates`);
    }
  };

  if (loading) return <ShimmerLayout />;

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
          {updates.length > 0 ? (
            updates.map((item) => (
              <div 
                key={`${item.type}-${item.id}`} 
                className="bg-white rounded-3xl p-4 shadow-sm border border-[#f1f5f9] flex gap-4 active:bg-gray-50 transition-colors"
              >
                <div className="w-[80px] h-[80px] rounded-2xl overflow-hidden shadow-sm flex-shrink-0 relative">
                   <img 
                     src={item.image.startsWith('http') ? item.image : `${import.meta.env.VITE_API_URL}/${item.image}`} 
                     alt={item.title} 
                     className="w-full h-full object-cover" 
                   />
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
                      onClick={() => handleCheckOut(item)}
                    >
                      Check out <ChevronRight size={16} />
                    </button>
                    <span className="text-[0.8rem] text-[#94a3b8] font-medium">{formatDate(item.date)}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-[#64748b]">
              No new updates available
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default WhatsNew;
