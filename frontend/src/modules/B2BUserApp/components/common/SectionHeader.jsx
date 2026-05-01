import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const SectionHeader = ({ title, subtitle, onViewAll, showViewAll = false, rightContent }) => {
  const { t } = useTranslation();
  return (
    <div className="flex justify-between items-center mb-sm px-[10px]">
      <div className="flex flex-col lg:gap-1">
        <h2 className="text-[1.1rem] sm:text-xl lg:text-2xl font-extrabold text-[#1e1e1e] m-0 leading-tight mobile:text-[1rem]">{title}</h2>
        {subtitle && <p className="text-[0.8rem] lg:text-sm text-text-secondary mt-[2px] mb-0">{subtitle}</p>}
      </div>
      
      <div className="flex items-center gap-md">
        {rightContent && <div className="flex items-center gap-3">{rightContent}</div>}
        {showViewAll && (
          <button className="flex items-center gap-xs bg-transparent text-primary font-bold text-[0.8rem]" onClick={onViewAll}>
            {t("viewAll")} <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default SectionHeader;
