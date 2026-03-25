import React from 'react';
import { Search, Mic } from 'lucide-react';

const SearchBar = ({ value, onChange, placeholder = "Search Posters", className = "" }) => {
  return (
    <div className={`bg-[#f1f5f9] rounded-full px-4 py-2.5 flex items-center gap-3 ${className}`}>
      <Search className="text-[#64748b]" size={18} />
      <input 
        type="text" 
        placeholder={placeholder} 
        className="flex-1 border-none bg-transparent outline-none text-[0.95rem]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button className="text-[#ef4444] bg-none font-bold">
        <Mic size={18} />
      </button>
    </div>
  );
};

export default SearchBar;
