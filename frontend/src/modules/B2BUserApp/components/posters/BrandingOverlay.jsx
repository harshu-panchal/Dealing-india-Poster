import React from 'react';
import { MessageCircle, User } from 'lucide-react';

const BrandingOverlay = ({ userData = {}, size = 'regular' }) => {
  const isCompact = size === 'compact';
  
  // Responsive sizing constants
  const heightClass = isCompact ? 'h-[32px]' : 'h-[46px] lg:h-[56px]';
  const nameSizeClass = isCompact ? 'text-[0.5rem]' : 'text-[0.65rem] lg:text-[0.8rem]';
  const phoneSizeClass = isCompact ? 'text-[0.45rem]' : 'text-[0.6rem] lg:text-[0.7rem]';
  const iconBoxSize = isCompact ? 'w-2.5 h-2.5' : 'w-3 h-3 lg:w-4 lg:h-4';
  const iconSize = isCompact ? 6 : 8;
  const photoSizeClass = isCompact ? 'w-[40px] h-[40px]' : 'w-[56px] h-[56px] lg:w-[80px] lg:h-[80px]';
  const photoOffsetClass = isCompact ? '-top-[60%]' : '-top-[40%]';
  const editBadgeClass = isCompact ? 'hidden' : 'absolute -bottom-1 left-1/2 -translate-x-1/2 text-[0.35rem] lg:text-[0.45rem] font-black tracking-tight bg-blue-600 text-white px-1.5 py-0.5 rounded-full shadow-md';

  return (
    <div className={`absolute bottom-0 left-0 right-0 pointer-events-none z-20 w-full ${isCompact ? 'px-0.5 mb-0.5' : 'px-1 mb-1'}`}>
      <div className={`bg-black/80 backdrop-blur-md rounded-b-xl flex ${heightClass} shadow-xl overflow-visible border-t border-white/10 mx-auto w-full`}>
        {/* Left Details */}
        <div className={`flex-1 flex flex-col justify-center ${isCompact ? 'px-1.5' : 'px-2 lg:px-4'} min-w-0`}>
          <div className={`${nameSizeClass} font-black text-white leading-tight truncate uppercase tracking-tight`}>
            {userData.business_name || ''}
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <div className={`${iconBoxSize} bg-[#25D366] rounded-full flex items-center justify-center`}>
              <MessageCircle size={iconSize} className="text-white fill-white" />
            </div>
            <span className={`${phoneSizeClass} text-white font-bold tracking-tight truncate`}>
              {userData.phone_number || ''}
            </span>
          </div>
        </div>

        {/* Floating Circular Profile Holder */}
        <div className={`relative ${isCompact ? 'w-10' : 'w-16 lg:w-24'} flex-shrink-0 flex items-center justify-center mr-1`}>
          <div className={`absolute ${photoOffsetClass} right-0 ${photoSizeClass} z-30`}>
            <div className="w-full h-full p-0.5 bg-white rounded-full shadow-lg border border-white/20 flex flex-col items-center justify-center overflow-hidden">
              {userData.userPhoto ? (
                <img src={userData.userPhoto} className="w-full h-full object-cover rounded-full" alt="u" />
              ) : (
                <div className="w-full h-full bg-gray-50 rounded-full flex flex-col items-center justify-center border border-dashed border-gray-200">
                  <User size={isCompact ? 12 : 18} className="text-gray-300" />
                  <div className={`${isCompact ? 'text-[0.2rem]' : 'text-[0.3rem] lg:text-[0.35rem]'} font-black text-red-600 text-center leading-none uppercase`}>
                    PHOTO
                  </div>
                </div>
              )}
            </div>
            {!isCompact && (
              <div className={editBadgeClass}>
                Edit
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandingOverlay;
