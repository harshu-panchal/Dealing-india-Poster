import React, { useState, useEffect } from 'react';
import { Heart, ChevronRight, Video, User, MessageCircle } from 'lucide-react';
import SectionHeader from '../components/common/SectionHeader';
import HorizontalScrollList from '../components/common/HorizontalScrollList';
import TemplateCard from '../components/posters/TemplateCard';
import ShimmerLoader from '../components/common/ShimmerLoader';
import SearchBar from '../components/common/SearchBar';
import { TEMPLATES, CATEGORIES } from '../utils/mockData';
import { useEditor } from '../context/EditorContext';

const ForYou = () => {
  const { openDetail, userData } = useEditor();
  const [activeCategory, setActiveCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [visibleSections, setVisibleSections] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  // Infinite Scroll Hook
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 800) {
        if (visibleSections < TEMPLATES.length) setVisibleSections(prev => prev + 2);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [visibleSections]);

  const renderPOTDCard = (tpl, idx) => {
    if (!tpl) return null;
    return (
      <div className="potd-card-wrapper mb-2 lg:mb-0 lg:max-w-full lg:m-0" key={tpl.id}>
        <section className="bg-white py-2 mb-1 lg:p-0 lg:m-0 lg:bg-transparent">
          <SectionHeader 
            title="Poster of the Day" 
            rightContent={
          <div className="flex items-center gap-1.5 text-text-secondary text-[0.85rem] lg:text-base font-bold">
             <Heart size={18} className="lg:w-5 lg:h-5" /> <span>{200 + idx * 45}</span>
             <ChevronRight size={18} className="ml-2 lg:w-6 lg:h-6" />
          </div>
            } 
          />
          <div className="px-2 lg:p-0 relative group">
             <TemplateCard template={tpl} variant="regular" onClick={() => openDetail(tpl)} />
             
             {/* Unified Branding Overlay (Perfect Fit - Matches Ref Image 2) */}
             <div className="absolute bottom-[72px] lg:bottom-[92px] left-0 right-0 pointer-events-none z-20 w-full px-2">
                <div className="bg-black/85 backdrop-blur-md rounded-b-xl flex h-[58px] lg:h-[76px] shadow-2xl overflow-visible border-t border-white/10">
                   {/* Left Details */}
                   <div className="flex-1 flex flex-col justify-center px-4 lg:px-8">
                      <div className="text-white text-[0.85rem] lg:text-xl font-black leading-tight truncate uppercase tracking-wide">
                         {userData.business_name || 'SHEETAL'}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                         <div className="w-[18px] h-[18px] lg:w-6 lg:h-6 bg-[#25D366] rounded-full flex items-center justify-center">
                           <MessageCircle size={10} className="text-white fill-white lg:w-4 lg:h-4" />
                         </div>
                         <span className="text-white text-[0.8rem] lg:text-base font-bold tracking-wider">{userData.phone_number || '6261265704'}</span>
                      </div>
                   </div>

                   {/* Right Cutout Area */}
                   <div className="w-[105px] lg:w-[155px] bg-[#f8fafc] relative rounded-tl-[2rem] lg:rounded-tl-[3.5rem] flex flex-col items-center justify-center border-l border-white/10 overflow-visible pt-1">
                      <div className="absolute -top-7 lg:-top-11 w-20 lg:w-32 h-20 lg:h-32 flex flex-col items-center pointer-events-none z-30">
                         {userData.userPhoto ? (
                           <img src={userData.userPhoto} className="w-full h-full object-contain mb-0.5 drop-shadow-md" alt="u" />
                         ) : (
                           <div className="flex flex-col items-center">
                              <User size={36} className="text-gray-300 lg:w-20 lg:h-20 opacity-60 drop-shadow-sm" />
                              <div className="text-[0.45rem] lg:text-[0.7rem] font-black text-red-600 text-center leading-[0.85] mb-1 -mt-2 drop-shadow-sm bg-white/40 px-1 rounded uppercase">
                                YOUR PHOTO<br/>HERE
                              </div>
                           </div>
                         )}
                      </div>
                      <div className="mt-auto pb-1.5 lg:pb-3 text-[0.45rem] lg:text-xs font-black tracking-tight whitespace-nowrap px-2">
                         <span className="text-gray-800">Click on </span> 
                         <span className="text-blue-600">Edit Poster</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </section>
        <div className="h-2 bg-[#f1f5f9] lg:hidden"></div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <ShimmerLoader type="special" count={4} />
        <div className="h-6"></div>
        <ShimmerLoader type="potd" count={2} />
      </div>
    );
  }

  // Filter sequences
  const whatsappPosters = TEMPLATES.filter(t => t.category === 'Good Morning');
  const businessPosters = TEMPLATES.filter(t => t.category === 'Business Promotion' || t.category === 'Offer & Discounts');
  const greetingPosters = TEMPLATES.filter(t => t.category === 'Holi Greetings' || t.category === 'Birthday Cards');
  const videoPosters = TEMPLATES.filter(t => t.isVideo);

  return (
    <div className="bg-bg min-h-screen">
        {/* Sticky Sub-Header (Rating + Search + Categories) */}
        <div className="sticky top-0 z-[50] shadow-sm">
          {/* Rating Banner - Now inside sticky */}
          <div className="bg-white p-1 px-4 text-center border-b border-[#f1f5f9]">
            <p className="text-[0.75rem] font-bold text-[#c2410c] m-0">🙏 Support us & give 5* rating - click here! 🙏</p>
          </div>

          {/* Search & Voice */}
          <section className="p-3 px-2 bg-white flex justify-center">
            <div className="w-full lg:max-w-4xl">
              <SearchBar 
                value={searchQuery}
                onChange={setSearchQuery}
              />
            </div>
          </section>

          {/* Top Category Chips - Horizontal Sticky Video */}
          <section className="bg-white pt-1 pb-4 relative border-b border-[#f1f5f9] flex justify-center">
            <div className="flex px-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth transition-all lg:max-w-6xl w-full">
              {/* Sticky Video Button Wrapper with Background Mask */}
              <div 
                className="sticky left-0 z-[60] bg-white pr-2 -ml-2 pl-2"
                onClick={() => setActiveCategory('Video')}
              >
                <button className={`px-5 py-2.5 rounded-full text-[0.85rem] lg:text-base font-bold whitespace-nowrap flex items-center gap-1.5 shadow-md active:scale-95 transition-all shrink-0 ${activeCategory === 'Video' ? 'bg-[#b91c1c] text-white' : 'bg-[#ef4444] text-white'}`}>
                  <Video size={18} fill="white" /> Video
                </button>
              </div>
              
              <button 
                onClick={() => setActiveCategory('All')}
                className={`px-5 py-2.5 rounded-full text-[0.85rem] lg:text-base font-bold whitespace-nowrap shadow-sm shrink-0 ml-1 transition-colors ${activeCategory === 'All' ? 'bg-[#1e1e1e] text-white' : 'bg-[#f1f5f9] text-[#475569]'}`}
              >
                All
              </button>
              
              <button 
                onClick={() => setActiveCategory('Poster of the Day')}
                className={`px-5 py-2.5 rounded-full text-[0.85rem] lg:text-base font-bold whitespace-nowrap shrink-0 ml-1 transition-colors ${activeCategory === 'Poster of the Day' ? 'bg-[#1e1e1e] text-white' : 'bg-[#f1f5f9] text-[#475569]'}`}
              >
                 Poster of the Day
              </button>

              {['Festivals', 'Motivation', 'Good Morning', 'Quotes', 'Business', 'Special'].map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2.5 rounded-full text-[0.85rem] lg:text-base font-bold whitespace-nowrap shrink-0 ml-1 transition-colors ${activeCategory === cat ? 'bg-[#1e1e1e] text-white' : 'bg-[#f1f5f9] text-[#475569]'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </section>
        </div>

        {activeCategory === 'Video' ? (
          <div className="p-2 pt-4">
             <div className="px-2 mb-4">
                <h2 className="text-xl font-bold text-[#0f172a]">Video Templates</h2>
                <p className="text-sm text-[#64748b]">Found {videoPosters.length} trending videos</p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {videoPosters.map(tpl => (
                  <TemplateCard key={tpl.id} template={tpl} variant="regular" onClick={() => openDetail(tpl)} />
                ))}
             </div>
          </div>
        ) : activeCategory !== 'All' ? (
          <div className="p-2 pt-4">
             <div className="px-2 mb-4">
                <h2 className="text-xl font-bold text-[#0f172a]">{activeCategory}</h2>
                <p className="text-sm text-[#64748b]">Showing results for {activeCategory}</p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {TEMPLATES.filter(t => t.category.includes(activeCategory) || activeCategory === 'All').map(tpl => (
                  <TemplateCard key={tpl.id} template={tpl} variant="regular" onClick={() => openDetail(tpl)} />
                ))}
             </div>
          </div>
        ) : (
          <>
        {/* 1. Today's Special */}
        <section className="bg-white py-4 mb-1">
          <div className="w-full lg:px-4">
            <SectionHeader title="Today's Special" showViewAll={true} />
            <HorizontalScrollList>
              {TEMPLATES.slice(0, 8).map(tpl => (
                <TemplateCard 
                  key={tpl.id} 
                  template={tpl} 
                  variant="compact" 
                  onClick={() => openDetail(tpl)} 
                />
              ))}
            </HorizontalScrollList>
          </div>
        </section>

        {/* 2. Top Hero POTD Grid - 3 Cards on Desktop */}
        <div className="lg:py-6 lg:px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10 transition-all">
            <div className="bg-white lg:rounded-2xl lg:shadow-md lg:p-4 lg:border lg:border-gray-100 transition-all hover:shadow-xl">
               {renderPOTDCard(TEMPLATES[0], 0)}
            </div>
            <div className="bg-white lg:rounded-2xl lg:shadow-md lg:p-4 lg:border lg:border-gray-100 transition-all hover:shadow-xl hidden md:block">
               {renderPOTDCard(TEMPLATES[1], 1)}
            </div>
            <div className="bg-white lg:rounded-2xl lg:shadow-md lg:p-4 lg:border lg:border-gray-100 transition-all hover:shadow-xl hidden lg:block">
               {renderPOTDCard(TEMPLATES[2], 2)}
            </div>
          </div>
        </div>



        <div className="lg:py-6 lg:px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10">
            {[3, 4, 5].map(idx => (
              <div key={idx} className="bg-white lg:rounded-2xl lg:shadow-md lg:p-4 lg:border lg:border-gray-100 transition-all hover:shadow-xl hidden md:first:block lg:block">
                {renderPOTDCard(TEMPLATES[idx], idx)}
              </div>
            ))}
          </div>
        </div>

        {/* 4. Daily Whatsapp Status */}
        <section className="bg-white py-4 mb-1">
          <div className="w-full lg:px-4">
            <SectionHeader title="Daily Whatsapp status" showViewAll={true} />
            <HorizontalScrollList>
              {whatsappPosters.length > 0 ? (
                whatsappPosters.map(tpl => (
                  <TemplateCard 
                    key={tpl.id} 
                    template={tpl} 
                    variant="compact" 
                    onClick={() => openDetail(tpl)} 
                  />
                ))
              ) : (
                <div className="px-4 text-[#64748b]">Loading more status...</div>
              )}
            </HorizontalScrollList>
          </div>
        </section>



        {/* 5. Business Boost Posters */}
        <section className="bg-white py-4 mb-1">
          <div className="w-full lg:px-4">
            <SectionHeader title="Business Boost Posters" showViewAll={true} />
            <HorizontalScrollList>
              {businessPosters.map(tpl => (
                <TemplateCard 
                  key={tpl.id} 
                  template={tpl} 
                  variant="compact" 
                  onClick={() => openDetail(tpl)} 
                />
              ))}
            </HorizontalScrollList>
          </div>
        </section>

        {/* 6. Daily Greetings */}
        <section className="bg-white py-4 mb-1">
          <div className="w-full lg:px-4">
            <SectionHeader title="Daily Greetings" showViewAll={true} />
            <HorizontalScrollList>
              {greetingPosters.map(tpl => (
                <TemplateCard 
                  key={tpl.id} 
                  template={tpl} 
                  variant="compact" 
                  onClick={() => openDetail(tpl)} 
                />
              ))}
            </HorizontalScrollList>
          </div>
        </section>

        {/* 7. Final POTD Loop (Everything else) */}
        <div className="lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-10 lg:p-6 lg:w-full">
           {TEMPLATES.slice(6, visibleSections).map((tpl, idx) => (
             <div key={tpl.id} className="mb-8 bg-white lg:rounded-2xl lg:shadow-md lg:p-4 lg:border lg:border-gray-100 transition-all hover:shadow-xl">
                {renderPOTDCard(tpl, idx + 6)}
             </div>
           ))}
        </div>
         </>
        )}

        {/* Infinite Scroll Loader */}
        {visibleSections < TEMPLATES.length && (
          <div className="p-4">
             <ShimmerLoader type="potd" count={1} />
          </div>
        )}
    </div>
  );
};

export default ForYou;
