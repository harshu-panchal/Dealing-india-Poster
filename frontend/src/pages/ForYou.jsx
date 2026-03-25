import React, { useState, useEffect } from 'react';
import { Heart, ChevronRight, Video, User } from 'lucide-react';
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
              <div className="flex items-center gap-1.5 text-text-secondary text-[0.85rem] font-bold">
                 <Heart size={18} /> <span>{200 + idx * 45}</span>
                 <ChevronRight size={18} className="ml-2" />
              </div>
            } 
          />
          <div className="px-2 lg:p-0 relative group">
             <TemplateCard template={tpl} variant="regular" onClick={() => openDetail(tpl)} />
             
             {/* Dynamic Branding Feedback in Feed (Matches Detail View Ref Image 3) */}
             <div className="absolute bottom-2 left-2 right-2 pointer-events-none z-10">
                <div className="bg-white/95 backdrop-blur-sm p-1.5 px-2.5 rounded-lg flex items-center justify-between border border-gray-100/50 shadow-lg">
                   <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center p-0.5 bg-white shadow-sm overflow-hidden">
                         <img src={userData.logo} className="w-full h-full object-contain" alt="logo" />
                      </div>
                      <div className="min-w-0">
                         <div className="text-[0.7rem] font-black text-gray-900 leading-tight truncate px-0.5">{userData.business_name}</div>
                         <div className="text-[0.55rem] font-bold text-gray-500">{userData.phone_number}</div>
                      </div>
                   </div>
                   {/* 'Click on Edit' Pill integrated into bar */}
                   <div className="bg-gray-800/80 px-1.5 py-0.5 rounded-full text-[0.45rem] font-black text-white border border-white/20 whitespace-nowrap hidden sm:block">
                      Click on <span className="text-red-400">Edit Poster</span>
                   </div>
                </div>
             </div>

             {/* Cutout Overlay (Lowered to sit better) */}
             <div className="absolute bottom-14 right-4 pointer-events-none flex flex-col items-center gap-0.5 z-20">
                <div className="w-12 h-12 rounded-full border-2 border-white shadow-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                   {userData.userPhoto ? (
                     <img src={userData.userPhoto} className="w-full h-full object-cover" alt="u" />
                   ) : (
                     <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-100">
                        <User size={20} />
                        <span className="text-[4px] font-black text-center px-1">YOUR PHOTO</span>
                     </div>
                   )}
                </div>
                <div className="bg-gray-800/90 backdrop-blur-md px-2 py-0.5 rounded-full text-[0.5rem] font-black text-white border border-white/20 whitespace-nowrap shadow-md">
                   Click on <span className="text-red-400">Edit Poster</span>
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
          <section className="p-3 px-2 bg-white">
            <SearchBar 
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </section>

          {/* Top Category Chips - Horizontal Sticky Video */}
          <section className="bg-white pt-1 pb-4 relative border-b border-[#f1f5f9]">
            <div className="flex px-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth transition-all">
              {/* Sticky Video Button Wrapper with Background Mask */}
              <div 
                className="sticky left-0 z-[60] bg-white pr-2 -ml-2 pl-2"
                onClick={() => setActiveCategory('Video')}
              >
                <button className={`px-5 py-2 rounded-full text-[0.85rem] font-bold whitespace-nowrap flex items-center gap-1.5 shadow-sm active:scale-95 transition-transform shrink-0 ${activeCategory === 'Video' ? 'bg-[#b91c1c] text-white' : 'bg-[#ef4444] text-white'}`}>
                  <Video size={16} fill="white" /> Video
                </button>
              </div>
              
              <button 
                onClick={() => setActiveCategory('All')}
                className={`px-5 py-2 rounded-full text-[0.85rem] font-bold whitespace-nowrap shadow-sm shrink-0 ml-1 transition-colors ${activeCategory === 'All' ? 'bg-[#1e1e1e] text-white' : 'bg-[#f1f5f9] text-[#475569]'}`}
              >
                All
              </button>
              
              <button 
                onClick={() => setActiveCategory('Poster of the Day')}
                className={`px-5 py-2 rounded-full text-[0.85rem] font-bold whitespace-nowrap shrink-0 ml-1 transition-colors ${activeCategory === 'Poster of the Day' ? 'bg-[#1e1e1e] text-white' : 'bg-[#f1f5f9] text-[#475569]'}`}
              >
                 Poster of the Day
              </button>

              {['Festivals', 'Motivation', 'Good Morning', 'Quotes', 'Business', 'Special'].map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2 rounded-full text-[0.85rem] font-bold whitespace-nowrap shrink-0 ml-1 transition-colors ${activeCategory === cat ? 'bg-[#1e1e1e] text-white' : 'bg-[#f1f5f9] text-[#475569]'}`}
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
            <section className="bg-white py-2 mb-1">
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
        </section>

        {/* 2. Interspersed POTD Cards 1 & 2 */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-6 lg:px-2 lg:max-w-[1400px] lg:mx-auto">
          <div className="lg:max-w-full">
            {renderPOTDCard(TEMPLATES[0], 0)}
          </div>
          <div className="lg:max-w-full">
            {renderPOTDCard(TEMPLATES[1], 1)}
          </div>
        </div>

        {/* 3. CATEGORIES GRID */}
        <section className="bg-white py-2 mb-1">
          <SectionHeader title="Categories" showViewAll={true} />
          <div className="grid grid-cols-4 gap-y-6 gap-x-2 px-2 pb-2">
            {CATEGORIES.slice(0, 8).map(cat => (
              <div key={cat.id} className="flex flex-col items-center gap-2 cursor-pointer transition-transform active:scale-95">
                <div className="w-[64px] h-[64px] rounded-xl overflow-hidden border border-[#f1f5f9] bg-bg shadow-sm">
                  <img src={cat.image} alt={cat.title} className="w-full h-full object-cover" />
                </div>
                <span className="text-[0.7rem] font-bold text-[#334155] text-center leading-tight line-clamp-1">{cat.title.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </section>

        {/* New POTD Card 3 */}
        <div className="lg:max-w-sm lg:mx-auto">
          {renderPOTDCard(TEMPLATES[2], 2)}
        </div>

        {/* 4. Daily Whatsapp Status */}
        <section className="bg-white py-2 mb-1">
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
        </section>

        {/* New POTD Card 4 */}
        <div className="lg:max-w-sm lg:mx-auto">
          {renderPOTDCard(TEMPLATES[3], 3)}
        </div>

        {/* 5. Business Boost Posters */}
        <section className="bg-white py-2 mb-1">
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
        </section>

        {/* 6. Daily Greetings */}
        <section className="bg-white py-2 mb-1">
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
        </section>

        {/* 7. Final POTD Loop (Everything else) */}
        <div className="lg:grid lg:grid-cols-4 lg:gap-6 lg:p-6 lg:max-w-[1400px] lg:mx-auto">
           {TEMPLATES.slice(4, visibleSections).map((tpl, idx) => renderPOTDCard(tpl, idx + 4))}
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
