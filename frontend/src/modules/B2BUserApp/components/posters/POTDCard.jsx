import React, { useState } from 'react';
import axios from 'axios';
import { Edit2, Download, MessageCircle, Share2, Flame, Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const POTDCard = ({ poster, onEdit }) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(poster.isLiked || false);
  const [likeCount, setLikeCount] = useState(poster.likeCount || 0);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user?.accessToken) return;

    try {
      const { data } = await axios.post(`${API_URL}/user/templates/${poster._id}/like`, {}, {
        headers: { Authorization: `Bearer ${user.accessToken}` }
      });
      setIsLiked(data.liked);
      setLikeCount(prev => data.liked ? prev + 1 : prev - 1);
    } catch (err) {
      console.error('Like failed:', err);
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <div 
        className="relative aspect-square lg:aspect-[4/5] rounded-[32px] overflow-hidden cursor-pointer shadow-2xl group border border-white/20" 
        onClick={() => onEdit(poster)}
      >
        <img src={poster.image} alt={poster.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        
        {/* Banner Overlays */}
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-[#ef4444] text-white px-4 py-1.5 rounded-full text-[0.7rem] font-black flex items-center gap-2 shadow-lg backdrop-blur-md uppercase tracking-widest">
            <Flame size={14} fill="white" className="animate-pulse" /> Trending Now
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      <div className="flex justify-around items-center px-2 py-4 bg-white rounded-[24px] shadow-sm border border-slate-50">
        <div className="flex flex-col items-center gap-1.5 cursor-pointer group" onClick={(e) => { e.stopPropagation(); onEdit(poster); }}>
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-slate-50 group-hover:bg-red-50 group-hover:text-red-500 transition-all text-slate-400 shadow-inner">
            <Edit2 size={20} />
          </div>
          <span className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">Edit</span>
        </div>
        
        <div className="flex flex-col items-center gap-1.5 cursor-pointer group">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-slate-50 group-hover:bg-green-50 group-hover:text-green-500 transition-all text-slate-400 shadow-inner">
            <MessageCircle size={20} />
          </div>
          <span className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">Wa</span>
        </div>
        
        <div className="flex flex-col items-center gap-1.5 cursor-pointer group">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-slate-50 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all text-slate-400 shadow-inner">
            <Share2 size={20} />
          </div>
          <span className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">Share</span>
        </div>
      </div>
    </div>
  );
};

export default POTDCard;
