import React from 'react';
import { MessageCircle, User } from 'lucide-react';

const BrandingOverlay = ({ userData = {}, size = 'regular' }) => {
  const isCompact = size === 'compact';
  const defaultLogo = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23ef4444'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='40' fill='white' font-weight='black'%3EL%3C/text%3E%3C/svg%3E";
  const hasFrame = !!userData.selectedFrame;
  
  // Responsive sizing constants
  const heightClass = isCompact ? 'h-[32px]' : 'h-[46px] lg:h-[56px]';
  const nameSizeClass = isCompact ? 'text-[0.5rem]' : hasFrame ? 'text-[0.55rem] lg:text-[0.72rem]' : 'text-[0.65rem] lg:text-[0.8rem]';
  const phoneSizeClass = isCompact ? 'text-[0.45rem]' : hasFrame ? 'text-[0.38rem] lg:text-[0.5rem]' : 'text-[0.6rem] lg:text-[0.7rem]';
  const iconBoxSize = isCompact ? 'w-2.5 h-2.5' : 'w-3 h-3 lg:w-4 lg:h-4';
  const iconSize = isCompact ? 6 : 8;
  const photoSizeClass = isCompact ? 'w-[40px] h-[40px]' : hasFrame ? 'w-[44px] h-[44px] lg:w-[60px] lg:h-[60px]' : 'w-[56px] h-[56px] lg:w-[80px] lg:h-[80px]';
  const photoOffsetClass = isCompact ? '-top-[60%]' : hasFrame ? '-top-[24%]' : '-top-[40%]';
  const editBadgeClass = isCompact ? 'hidden' : 'absolute -bottom-1 left-1/2 -translate-x-1/2 text-[0.35rem] lg:text-[0.45rem] font-black tracking-tight bg-blue-600 text-white px-1.5 py-0.5 rounded-full shadow-md';
  const zIndex = hasFrame ? 'z-[80]' : 'z-20';

  return (
    <div className={`absolute bottom-0 left-0 right-0 pointer-events-none ${zIndex} w-full ${isCompact ? 'px-0.5 mb-0.5' : 'px-1 mb-1'}`}>
      <div 
        className={`rounded-b-xl flex ${heightClass} ${!hasFrame ? 'shadow-xl border-t border-white/10' : ''} mx-auto w-full`}
        style={{ backgroundColor: hasFrame ? 'transparent' : 'rgba(0, 0, 0, 0.85)' }}
      >
        {/* Left Details */}
        <div className={`flex-1 flex flex-col justify-center ${isCompact ? 'px-1.5' : 'px-2 lg:px-4'} min-w-0 relative`}>
          <div 
            className={`${nameSizeClass} font-black text-white leading-tight uppercase tracking-tight ${hasFrame ? 'absolute' : 'truncate'}`} 
            style={{ 
              textShadow: hasFrame ? '0 1px 3px rgba(0,0,0,0.8)' : 'none',
              left: hasFrame && userData.namePos ? userData.namePos.x : 'auto',
              top: hasFrame && userData.namePos ? userData.namePos.y : 'auto',
              whiteSpace: 'nowrap',
              zIndex: 95
            }}
          >
            {userData.business_name || ''}
          </div>
           <div className="flex flex-col mt-0.5 relative h-full">
             <span 
               className={`${phoneSizeClass} text-white font-bold tracking-tight ${hasFrame ? 'absolute' : 'truncate'}`} 
               style={{ 
                 textShadow: hasFrame ? '0 1px 2px rgba(0,0,0,0.8)' : 'none',
                 left: hasFrame && userData.phonePos ? userData.phonePos.x : 'auto',
                 top: hasFrame && userData.phonePos ? userData.phonePos.y : 'auto',
                 whiteSpace: 'nowrap',
                 zIndex: 95
               }}
             >
               {userData.phone_number || ''}
             </span>
             {userData.enabledFields?.website && userData.website && (
               <span 
                 className={`${phoneSizeClass} text-white font-bold tracking-tight ${hasFrame ? 'absolute' : 'truncate'}`} 
                 style={{ 
                   textShadow: hasFrame ? '0 1px 2px rgba(0,0,0,0.8)' : 'none',
                   left: hasFrame && userData.websitePos ? userData.websitePos.x : 'auto',
                   top: hasFrame && userData.websitePos ? userData.websitePos.y : 'auto',
                   whiteSpace: 'nowrap',
                   zIndex: 95
                 }}
               >
                 {userData.website}
               </span>
             )}
             {userData.enabledFields?.email && userData.email && (
               <span 
                 className={`${phoneSizeClass} text-white font-bold tracking-tight ${hasFrame ? 'absolute' : 'truncate'}`} 
                 style={{ 
                   textShadow: hasFrame ? '0 1px 2px rgba(0,0,0,0.8)' : 'none',
                   left: hasFrame && userData.emailPos ? userData.emailPos.x : 'auto',
                   top: hasFrame && userData.emailPos ? userData.emailPos.y : 'auto',
                   whiteSpace: 'nowrap',
                   zIndex: 95
                 }}
               >
                 {userData.email}
               </span>
             )}
             {userData.enabledFields?.address && userData.address && (
               <span 
                 className={`${phoneSizeClass} text-white font-bold tracking-tight ${hasFrame ? 'absolute' : 'truncate'}`} 
                 style={{ 
                   textShadow: hasFrame ? '0 1px 2px rgba(0,0,0,0.8)' : 'none',
                   left: hasFrame && userData.addressPos ? userData.addressPos.x : 'auto',
                   top: hasFrame && userData.addressPos ? userData.addressPos.y : 'auto',
                   whiteSpace: 'nowrap',
                   zIndex: 95
                 }}
               >
                 {userData.address}
               </span>
             )}
             {(userData.enabledFields?.gst || (userData.gst_number || '').trim()) && (
               <span 
                 className={`${phoneSizeClass} text-white font-bold tracking-tight ${hasFrame ? 'absolute' : 'truncate'}`} 
                 style={{ 
                   textShadow: hasFrame ? '0 1px 2px rgba(0,0,0,0.8)' : 'none',
                   left: hasFrame && userData.gstPos ? userData.gstPos.x : 'auto',
                   top: hasFrame && userData.gstPos ? userData.gstPos.y : 'auto',
                   whiteSpace: 'nowrap',
                   zIndex: 95
                 }}
               >
                 GST: {userData.gst_number}
               </span>
             )}
           </div>
        </div>

        {/* Floating Circular Profile Holder */}
        <div className={`relative ${isCompact ? 'w-10' : 'w-16 lg:w-24'} flex-shrink-0 flex items-center justify-center mr-1`}>
          <div className={`absolute ${photoOffsetClass} right-0 ${photoSizeClass} z-30`}>
            <div className="w-full h-full p-0.5 bg-white rounded-full shadow-lg border border-white/20 flex flex-col items-center justify-center overflow-hidden">
              <img 
                src={userData.userPhoto || userData.logo || defaultLogo} 
                className="w-full h-full object-cover rounded-full" 
                alt="u" 
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandingOverlay;
