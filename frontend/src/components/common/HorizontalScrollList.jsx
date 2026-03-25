import React from 'react';

const HorizontalScrollList = ({ children, className = '' }) => {
  return (
    <div className={`w-full overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-lg pt-sm ${className}`}>
      <div className="flex gap-md px-md w-max after:content-[''] after:pr-md">
        {children}
      </div>
    </div>
  );
};

export default HorizontalScrollList;
