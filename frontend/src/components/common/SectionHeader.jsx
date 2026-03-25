import React from 'react';
import { ArrowRight } from 'lucide-react';

const SectionHeader = ({ title, subtitle, onViewAll, showViewAll = false, rightContent }) => {
  return (
    <div className="flex justify-between items-center mb-sm px-[10px]">
      <div className="flex flex-col">
        <h2 className="text-[1.05rem] font-extrabold text-[#1e1e1e] m-0 leading-tight mobile:text-[1rem]">{title}</h2>
        {subtitle && <p className="text-[0.8rem] text-text-secondary mt-[2px] mb-0">{subtitle}</p>}
      </div>
      
      <div className="flex items-center gap-md">
        {rightContent && <div className="flex items-center gap-3">{rightContent}</div>}
        {showViewAll && (
          <button className="flex items-center gap-xs bg-transparent text-primary font-bold text-[0.8rem]" onClick={onViewAll}>
            View All <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default SectionHeader;
