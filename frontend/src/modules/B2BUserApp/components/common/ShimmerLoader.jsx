import React from 'react';

const ShimmerLoader = ({ type = 'card', count = 1 }) => {
  const items = Array.from({ length: count });
  const shimmerClass = "bg-shimmer bg-[length:200%_100%] animate-shimmer";

  if (type === 'special') {
    return (
      <div className="flex gap-md px-md overflow-hidden">
        {items.map((_, i) => (
          <div key={i} className={`min-w-[110px] h-[110px] rounded-md flex-shrink-0 ${shimmerClass}`}></div>
        ))}
      </div>
    );
  }

  if (type === 'potd') {
    return (
      <div className="flex flex-col gap-lg px-md">
        {items.map((_, i) => (
          <div key={i} className="w-full bg-white rounded-lg border border-border overflow-hidden">
            <div className={`w-full aspect-square ${shimmerClass}`}></div>
            <div className="flex justify-around py-3 bg-white">
              <div className={`w-8 h-8 rounded-full ${shimmerClass}`}></div>
              <div className={`w-8 h-8 rounded-full ${shimmerClass}`}></div>
              <div className={`w-8 h-8 rounded-full ${shimmerClass}`}></div>
              <div className={`w-8 h-8 rounded-full ${shimmerClass}`}></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className="flex gap-md px-md overflow-hidden">
        {items.map((_, i) => (
          <div key={i} className="min-w-[140px] bg-card rounded-lg border border-border overflow-hidden">
            <div className={`aspect-square ${shimmerClass}`}></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'banner') {
    return (
      <div className="flex gap-md px-md overflow-hidden">
        {items.map((_, i) => (
          <div key={i} className={`min-w-[280px] h-[160px] rounded-lg mobile:min-w-[240px] mobile:h-[140px] ${shimmerClass}`}></div>
        ))}
      </div>
    );
  }

  return (
    <div className={`h-8 w-full ${shimmerClass}`}></div>
  );
};

export default ShimmerLoader;
