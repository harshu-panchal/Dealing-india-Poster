import React from 'react';

const BrandingOverlay = ({ userData = {}, size = 'regular', isOverlay = false }) => {
  const isCompact = size === 'compact';
  const defaultLogo = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23ef4444'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='40' fill='white' font-weight='black'%3EL%3C/text%3E%3C/svg%3E";
  const hasFrame = !!userData.selectedFrame;

  // Sizing scales
  const heightClass    = isCompact ? 'h-[40px]' : 'h-[85px] lg:h-[110px]';
  const photoSizeClass = isCompact ? 'w-[28px] h-[28px]' : 'w-[52px] h-[52px] lg:w-[72px] lg:h-[72px]';
  const nameSizeClass  = isCompact ? 'text-[0.5rem]'  : 'text-[0.62rem] lg:text-[0.78rem]';
  const detailSizeClass = isCompact ? 'text-[0.42rem]' : 'text-[0.52rem] lg:text-[0.65rem]';
  const paddingClass   = isCompact ? 'px-2'  : 'px-3 lg:px-5';
  const gapClass       = isCompact ? 'gap-1.5' : 'gap-2 lg:gap-3';

  // ── Custom frame applied: use absolute-position coords from editor ──────
  if (hasFrame) {
    return (
      <div className={`w-full pointer-events-none ${isOverlay ? 'absolute bottom-0 left-0 right-0 z-[80]' : 'relative'}`}>
        <div
          className={`flex items-center ${heightClass} ${paddingClass} ${gapClass} w-full`}
          style={{ backgroundColor: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(4px)' }}
        >
          {/* Left: circular profile photo */}
          <div className={`flex-shrink-0 ${photoSizeClass} rounded-full overflow-hidden border-2 border-white/30 shadow-lg`}>
            <img
              src={userData.userPhoto || userData.logo || defaultLogo}
              className="w-full h-full object-cover"
              alt="profile"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>

          {/* Right: text details at absolute positions set by editor */}
          <div className="flex-1 relative overflow-hidden h-full">
            {userData.enabledFields?.name !== false && (
              <span
                className={`absolute ${nameSizeClass} font-black text-white uppercase tracking-tight whitespace-nowrap`}
                style={{ left: userData.namePos?.x || '2%', top: userData.namePos?.y || '20%', textShadow: '0 1px 3px rgba(0,0,0,0.8)', zIndex: 95 }}
              >
                {userData.name || ''}
              </span>
            )}
            {userData.enabledFields?.business_name !== false && (
              <span
                className={`absolute ${nameSizeClass} font-black text-white uppercase tracking-tight whitespace-nowrap`}
                style={{ left: userData.businessNamePos?.x || '2%', top: userData.businessNamePos?.y || '45%', textShadow: '0 1px 3px rgba(0,0,0,0.8)', zIndex: 95 }}
              >
                {userData.business_name || ''}
              </span>
            )}
            {userData.phone_number && (
              <span
                className={`absolute ${detailSizeClass} text-white/80 font-semibold whitespace-nowrap`}
                style={{ left: userData.phonePos?.x || '2%', top: userData.phonePos?.y || '68%', textShadow: '0 1px 2px rgba(0,0,0,0.8)', zIndex: 95 }}
              >
                {userData.phone_number}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Default frame (no frame selected) ──────────────────────────────────
  // Alignment: photo LEFT → name / business / contact stacked on RIGHT
  return (
    <div className={`w-full pointer-events-none ${isOverlay ? 'absolute bottom-0 left-0 right-0 z-20' : 'relative'}`}>
      <div
        className={`flex items-center ${heightClass} ${paddingClass} ${gapClass} w-full`}
        style={{ backgroundColor: '#0a0a0a' }}
      >
        {/* Left: circular photo / logo */}
        <div className={`flex-shrink-0 ${photoSizeClass} rounded-full overflow-hidden border-2 border-white/20 shadow-lg`}>
          <img
            src={userData.userPhoto || userData.logo || defaultLogo}
            className="w-full h-full object-cover"
            alt="profile"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>

        {/* Right: name, business, phone — stacked vertically, left-aligned */}
        <div className="flex-1 flex flex-col justify-center min-w-0 overflow-hidden">
          {userData.enabledFields?.name !== false && (
            <span className={`${nameSizeClass} font-black text-white uppercase tracking-tight truncate leading-tight`}>
              {userData.name || ''}
            </span>
          )}
          {userData.enabledFields?.business_name !== false && (
            <span className={`${nameSizeClass} font-black text-white/90 uppercase tracking-tight truncate leading-tight`}>
              {userData.business_name || ''}
            </span>
          )}
          {userData.phone_number && (
            <span className={`${detailSizeClass} text-white/70 font-semibold truncate leading-tight mt-0.5`}>
              {userData.phone_number}
            </span>
          )}
          {userData.enabledFields?.website && userData.website && (
            <span className={`${detailSizeClass} text-white/60 font-semibold truncate leading-tight`}>
              {userData.website}
            </span>
          )}
          {userData.enabledFields?.email && userData.email && (
            <span className={`${detailSizeClass} text-white/60 font-semibold truncate leading-tight`}>
              {userData.email}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrandingOverlay;
