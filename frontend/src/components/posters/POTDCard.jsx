import React from 'react';
import { Edit2, Download, MessageCircle, Share2, Flame } from 'lucide-react';

const POTDCard = ({ poster, onEdit }) => {
  return (
    <div className="flex flex-col gap-3 min-w-[200px]">
      <div 
        className="relative aspect-[4/5] rounded-md overflow-hidden cursor-pointer shadow-md group border border-border" 
        onClick={() => onEdit(poster)}
      >
        <img src={poster.image} alt={poster.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
        <div className="absolute top-2 left-2 bg-error text-white px-2 py-0.5 rounded-sm text-[0.6rem] font-bold flex items-center gap-1 shadow-sm">
          <Flame size={12} fill="white" /> FEATURED
        </div>
      </div>
      
      <div className="flex justify-between items-center px-1">
        <div className="flex flex-col items-center gap-1 cursor-pointer group" onClick={(e) => { e.stopPropagation(); onEdit(poster); }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-bg group-hover:bg-primary/5 transition-colors"><Edit2 size={18} className="text-primary group-hover:scale-110 transition-transform" /></div>
          <span className="text-[0.7rem] font-bold text-text-secondary">Edit</span>
        </div>
        <div className="flex flex-col items-center gap-1 cursor-pointer group">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-bg group-hover:bg-primary/5 transition-colors"><Download size={18} className="text-text-secondary group-hover:scale-110 transition-transform" /></div>
          <span className="text-[0.7rem] font-bold text-text-secondary">Download</span>
        </div>
        <div className="flex flex-col items-center gap-1 cursor-pointer group">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-bg group-hover:bg-green-50 transition-colors"><MessageCircle size={18} className="text-green-500 group-hover:scale-110 transition-transform" /></div>
          <span className="text-[0.7rem] font-bold text-text-secondary">Whatsapp</span>
        </div>
        <div className="flex flex-col items-center gap-1 cursor-pointer group">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-bg group-hover:bg-blue-50 transition-colors"><Share2 size={18} className="text-blue-500 group-hover:scale-110 transition-transform" /></div>
          <span className="text-[0.7rem] font-bold text-text-secondary">Share</span>
        </div>
      </div>
    </div>
  );
};

export default POTDCard;
