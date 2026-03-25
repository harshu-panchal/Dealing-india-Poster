import React from 'react';

const Shimmer = ({ width, height, borderRadius, className = '' }) => {
  return (
    <div 
      className={`animate-shimmer bg-shimmer-gradient bg-[length:400%_100%] ${className}`} 
      style={{ 
        width: width || '100%', 
        height: height || '1rem', 
        borderRadius: borderRadius || '0.25rem' 
      }} 
    />
  );
};

export const TemplateShimmer = () => (
  <div className="bg-card rounded-md border border-border overflow-hidden p-3 flex flex-col gap-3">
    <Shimmer height="280px" borderRadius="0.375rem" />
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-col gap-1.5">
        <Shimmer width="30%" height="0.7rem" />
        <Shimmer width="80%" height="1.1rem" />
      </div>
      <Shimmer height="40px" borderRadius="0.25rem" />
    </div>
  </div>
);

export const CategoryShimmer = () => (
  <div className="flex flex-col gap-2 text-center">
    <Shimmer height="150px" borderRadius="0.375rem" />
    <Shimmer width="60%" height="0.9rem" className="mx-auto mt-2" />
  </div>
);

const ShimmerLayout = () => {
  return (
    <div className="flex flex-col gap-lg">
      <div className="mb-md">
        <Shimmer height="350px" borderRadius="0.5rem" />
      </div>
      <div className="flex flex-col gap-md">
        <Shimmer width="200px" height="1.8rem" className="mb-md" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
          {[1, 2, 3, 4].map(i => <TemplateShimmer key={i} />)}
        </div>
      </div>
    </div>
  );
};

export default ShimmerLayout;
