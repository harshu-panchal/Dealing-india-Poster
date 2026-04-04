import React from 'react';
import { Search, Mic } from 'lucide-react';

const SearchBar = ({ value, onChange, placeholder = "Search Posters", className = "" }) => {
  return (
    <div className={`bg-[#f1f5f9] rounded-full px-4 py-2.5 lg:px-6 lg:py-3 flex items-center gap-3 transition-all focus-within:ring-2 focus-within:ring-primary/20 ${className}`}>
      <Search className="text-[#64748b] lg:w-5 lg:h-5" size={18} />
      <input 
        type="text" 
        placeholder={placeholder} 
        className="flex-1 border-none bg-transparent outline-none text-[0.95rem] lg:text-base"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button className="text-[#ef4444] bg-none font-bold hover:scale-110 transition-transform">
        <Mic size={18} className="lg:w-5 lg:h-5" />
      </button>
    </div>
  );
};

export default SearchBar;
