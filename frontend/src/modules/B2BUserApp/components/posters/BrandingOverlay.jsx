import React from 'react';

const BrandingOverlay = ({ userData = {}, size = 'regular', isOverlay = false, activeFrame = null, framePos = null }) => {
  const isCompact = size === 'compact';
  const defaultLogo = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23ef4444'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='40' fill='white' font-weight='black'%3EL%3C/text%3E%3C/svg%3E";
  const hasFrame = !!(userData.selectedFrame || activeFrame);

  const bgStyle = activeFrame ? {
    backgroundImage: `url(${activeFrame})`,
    backgroundSize: '100% 100%',
    backgroundPosition: 'center center',
    backgroundRepeat: 'no-repeat'
  } : { backgroundColor: '#0a0a0a' };

  // Sizing scales
  const heightClass = isCompact ? 'h-[40px]' : 'h-[90px] lg:h-[110px]';
  const photoSizeClass = isCompact ? 'w-[28px] h-[28px]' : 'w-[55px] h-[55px] lg:w-[70px] lg:h-[70px]';
  const nameSizeClass = isCompact ? 'text-[0.6rem]' : 'text-[0.7rem] lg:text-[0.8rem]';
  const detailSizeClass = isCompact ? 'text-[0.45rem]' : 'text-[0.5rem] lg:text-[0.55rem]';
  const paddingClass = isCompact ? 'px-2' : 'px-4 lg:px-6';
  const gapClass = isCompact ? 'gap-2' : 'gap-3 lg:gap-4';

  // ── Custom frame applied: use absolute-position coords from editor ──────
  if (hasFrame) {
    return (
      <div className={`w-full h-full overflow-hidden absolute inset-0 z-[80]`}>
        {/* Frame Background Image with CORS support */}
        <img 
          src={activeFrame} 
          className="absolute inset-0 w-full h-full object-fill pointer-events-none" 
          crossOrigin="anonymous"
          alt="Frame"
        />
        <div
          className={`w-full h-full absolute inset-0 ${paddingClass} ${gapClass} flex items-center`}
        >
          {/* Internal wrapper to ensure admin percentages map correctly to the frame */}
          <div className="absolute left-0 right-0 top-0 bottom-0 w-full h-full pointer-events-none">
            {/* Field Data using Admin Positions */}
            <div className="absolute inset-0">
              
              {/* Profile Photo / Logo */}
              <div 
                className={`absolute flex-shrink-0 ${photoSizeClass} rounded-full overflow-hidden border-2 border-white/30 shadow-lg`}
                style={{ 
                  left: userData.userPhotoPos?.x || userData.logoPos?.x || framePos?.userPhoto?.x || framePos?.logo?.x || '70%', 
                  top: userData.userPhotoPos?.y || userData.logoPos?.y || framePos?.userPhoto?.y || framePos?.logo?.y || '74%',
                  display: (userData.userPhoto || userData.logo || defaultLogo) ? 'block' : 'none'
                }}
              >
                <img
                  src={userData.userPhoto || userData.logo || defaultLogo}
                  className="w-full h-full object-cover"
                  alt="profile"
                  crossOrigin="anonymous"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>

              {/* Primary Identity */}
              {userData.enabledFields?.name !== false && userData.name && (
                <span
                  className={`absolute ${nameSizeClass} font-black text-white uppercase tracking-tight whitespace-nowrap`}
                  style={{ 
                    left: userData.namePos?.x || framePos?.name?.x || '5%', 
                    top: userData.namePos?.y || framePos?.name?.y || '82%', 
                    textShadow: '0 1px 3px rgba(0,0,0,0.8)', 
                    zIndex: 95 
                  }}
                >
                  {userData.name}
                </span>
              )}

              {userData.enabledFields?.business_name !== false && userData.business_name && (
                <span
                  className={`absolute ${nameSizeClass} font-black text-white uppercase tracking-tight whitespace-nowrap`}
                  style={{ 
                    left: userData.businessNamePos?.x || framePos?.businessName?.x || '5%', 
                    top: userData.businessNamePos?.y || framePos?.businessName?.y || '84%', 
                    textShadow: '0 1px 3px rgba(0,0,0,0.8)', 
                    zIndex: 94 
                  }}
                >
                  {userData.business_name}
                </span>
              )}

              {/* Professional Details */}
              {userData.enabledFields?.designation !== false && userData.designation && (
                <span
                  className={`absolute ${detailSizeClass} font-bold text-[#ef4444] uppercase tracking-wider whitespace-nowrap`}
                  style={{ 
                    left: userData.designationPos?.x || framePos?.designation?.x || '5%', 
                    top: userData.designationPos?.y || framePos?.designation?.y || '96%', 
                    textShadow: '0 1px 2px rgba(0,0,0,0.8)', 
                    zIndex: 93 
                  }}
                >
                  {userData.designation}
                </span>
              )}

              {/* Contact Info */}
              {userData.enabledFields?.phone !== false && userData.phone_number && (
                <span
                  className={`absolute ${detailSizeClass} font-medium text-white/90 tracking-widest whitespace-nowrap`}
                  style={{ 
                    left: userData.phonePos?.x || framePos?.phone?.x || '5%', 
                    top: userData.phonePos?.y || framePos?.phone?.y || '86%', 
                    textShadow: '0 1px 2px rgba(0,0,0,0.8)', 
                    zIndex: 92 
                  }}
                >
                  {userData.phone_number}
                </span>
              )}

              {userData.enabledFields?.email !== false && userData.email && (
                <span
                  className={`absolute ${detailSizeClass} font-medium text-white/90 whitespace-nowrap`}
                  style={{ 
                    left: userData.emailPos?.x || framePos?.email?.x || '5%', 
                    top: userData.emailPos?.y || framePos?.email?.y || '90%', 
                    textShadow: '0 1px 2px rgba(0,0,0,0.8)', 
                    zIndex: 91 
                  }}
                >
                  {userData.email}
                </span>
              )}

              {userData.enabledFields?.website !== false && userData.website && (
                <span
                  className={`absolute ${detailSizeClass} font-medium text-white/90 whitespace-nowrap`}
                  style={{ 
                    left: userData.websitePos?.x || framePos?.website?.x || '5%', 
                    top: userData.websitePos?.y || framePos?.website?.y || '88%', 
                    textShadow: '0 1px 2px rgba(0,0,0,0.8)', 
                    zIndex: 90 
                  }}
                >
                  {userData.website}
                </span>
              )}

              {userData.enabledFields?.address !== false && (userData.address || userData.businessAddress) && (
                <span
                  className={`absolute ${detailSizeClass} font-medium text-white/80 whitespace-nowrap`}
                  style={{ 
                    left: userData.addressPos?.x || framePos?.address?.x || '5%', 
                    top: userData.addressPos?.y || framePos?.address?.y || '92%', 
                    textShadow: '0 1px 2px rgba(0,0,0,0.8)', 
                    zIndex: 89 
                  }}
                >
                  {userData.address || userData.businessAddress}
                </span>
              )}

              {userData.enabledFields?.gst !== false && userData.gst_number && (
                <span
                  className={`absolute ${detailSizeClass} font-medium text-white/80 whitespace-nowrap`}
                  style={{ 
                    left: userData.gstPos?.x || framePos?.gst?.x || '5%', 
                    top: userData.gstPos?.y || framePos?.gst?.y || '94%', 
                    textShadow: '0 1px 2px rgba(0,0,0,0.8)', 
                    zIndex: 88 
                  }}
                >
                  GST: {userData.gst_number}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Default frame (no frame selected) ──────────────────────────────────
  // Alignment: photo LEFT → name / business / contact stacked on RIGHT
  return (
    <div className={`w-full ${isOverlay ? 'absolute bottom-0 left-0 right-0 z-20' : 'relative'} ${heightClass}`}>
      <div
        className={`w-full h-full absolute inset-0 flex items-center ${paddingClass} ${gapClass}`}
        style={bgStyle}
      >
        {/* Left: circular photo / logo */}
        <div className={`flex-shrink-0 ${photoSizeClass} rounded-full overflow-hidden border-2 border-white/20 shadow-lg`}>
          <img
            src={userData.userPhoto || userData.logo || defaultLogo}
            className="w-full h-full object-cover"
            alt="profile"
            crossOrigin="anonymous"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>

        {/* Right: name, business, phone — stacked vertically, left-aligned */}
        <div className="flex-1 flex flex-col justify-center min-w-0 overflow-hidden py-1">
          {userData.enabledFields?.name !== false && (
            <span className={`${nameSizeClass} font-black text-white uppercase tracking-tight truncate leading-[1.1]`}>
              {userData.name || ''}
            </span>
          )}
          {userData.enabledFields?.business_name !== false && (
            <span className={`${nameSizeClass} font-black text-white/90 uppercase tracking-tight truncate leading-[1.1]`}>
              {userData.business_name || ''}
            </span>
          )}
          {userData.enabledFields?.designation && userData.designation && (
            <span className={`${detailSizeClass} text-red-500 font-black uppercase tracking-tight truncate leading-[1.1]`}>
              {userData.designation}
            </span>
          )}
          {userData.phone_number && (
            <span className={`${detailSizeClass} text-white/70 font-semibold truncate leading-tight mt-0.5`}>
              {userData.phone_number}
            </span>
          )}
          {(userData.enabledFields?.gst || (userData.gst_number || '').trim()) && userData.gst_number && (
            <span className={`${detailSizeClass} text-white/60 font-semibold truncate leading-tight`}>
              GST: {userData.gst_number}
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
