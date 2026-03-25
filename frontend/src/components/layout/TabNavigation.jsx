import React from 'react';
import { NavLink } from 'react-router-dom';
import { Gift, Flame, Briefcase, Sparkles } from 'lucide-react';

const TabNavigation = () => {
  return (
    <div className="bg-white border-t border-[#e2e8f0] pb-3 pt-2 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] w-full flex-shrink-0">
      <div className="flex justify-around items-center max-w-[500px] mx-auto">
        <NavLink to="/" className={({ isActive }) => `flex flex-col items-center gap-1 flex-1 no-underline text-[0.7rem] font-bold ${isActive ? 'text-[#ef4444]' : 'text-[#64748b]'}`}>
          {({ isActive }) => (
            <>
              <Gift size={22} className={`transition-transform ${isActive ? 'stroke-[2.5px]' : ''}`} />
              <span>For You</span>
            </>
          )}
        </NavLink>
        
        <NavLink to="/trending" className={({ isActive }) => `flex flex-col items-center gap-1 flex-1 no-underline text-[0.7rem] font-bold ${isActive ? 'text-[#ef4444]' : 'text-[#64748b]'}`}>
          {({ isActive }) => (
            <>
              <Flame size={22} className={`transition-transform ${isActive ? 'text-red-500 stroke-[2.5px]' : ''}`} />
              <span>Trending</span>
            </>
          )}
        </NavLink>
        
        <NavLink to="/categories" className={({ isActive }) => `flex flex-col items-center gap-1 flex-1 no-underline text-[0.7rem] font-bold ${isActive ? 'text-[#ef4444]' : 'text-[#64748b]'}`}>
          {({ isActive }) => (
            <>
              <Briefcase size={22} className={`transition-transform ${isActive ? 'stroke-[2.5px]' : ''}`} />
              <span>Business</span>
            </>
          )}
        </NavLink>

        <NavLink to="/my-posters" className={({ isActive }) => `flex flex-col items-center gap-1 flex-1 no-underline text-[0.7rem] font-bold ${isActive ? 'text-[#ef4444]' : 'text-[#64748b]'}`}>
          {({ isActive }) => (
            <>
              <Sparkles size={22} className={`transition-transform ${isActive ? 'stroke-[2.5px]' : ''}`} />
              <span>My Poster</span>
            </>
          )}
        </NavLink>
      </div>
    </div>
  );
};

export default TabNavigation;
