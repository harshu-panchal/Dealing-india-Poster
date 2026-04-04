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

    const BrandingOverlay = (
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-20 w-full px-1 mb-1">
        <div className="bg-black/85 backdrop-blur-md rounded-b-lg flex h-[46px] lg:h-[60px] shadow-2xl overflow-visible border-t border-white/10 mx-auto w-full">
          {/* Left Details */}
          <div className="flex-1 flex flex-col justify-center px-2 lg:px-4 min-w-0">
            <div className="text-white text-[0.65rem] lg:text-[0.85rem] font-extrabold leading-tight truncate uppercase tracking-tight">
              {userData.business_name || 'SHEETAL'}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <div className="w-[12px] h-[12px] lg:w-4 lg:h-4 bg-[#25D366] rounded-full flex items-center justify-center">
                <MessageCircle size={8} className="text-white fill-white lg:w-3 lg:h-3" />
              </div>
              <span className="text-white text-[0.6rem] lg:text-[0.75rem] font-bold tracking-tight truncate">{userData.phone_number || '6261265704'}</span>
            </div>
          </div>

          {/* Floating Circular Profile Holder (Relative sizing) */}
          <div className="relative w-[28%] max-w-[65px] lg:max-w-[95px] flex-shrink-0 flex items-center justify-center mr-1">
            <div className="absolute -top-[45%] right-0 w-full aspect-square z-30">
              <div className="w-full h-full p-1 bg-white rounded-full shadow-xl border-2 border-white flex flex-col items-center justify-center overflow-hidden">
                {userData.userPhoto ? (
                  <img src={userData.userPhoto} className="w-full h-full object-cover rounded-full" alt="u" />
                ) : (
                  <div className="w-full h-full bg-gray-50 rounded-full flex flex-col items-center justify-center border border-dashed border-gray-200">
                    <User size={14} className="text-gray-300 lg:w-9 lg:h-9" />
                    <div className="text-[0.3rem] lg:text-[0.4rem] font-black text-red-600 text-center leading-[0.85] uppercase">
                      PHOTO
                    </div>
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[0.35rem] lg:text-[0.5rem] font-black tracking-tight whitespace-nowrap bg-blue-600 text-white px-1.5 py-0.5 rounded-full shadow-md pointer-events-auto cursor-pointer active:scale-95 transition-transform" onClick={(e) => {
                e.stopPropagation();
                openDetail(tpl);
              }}>
                Edit
              </div>
            </div>
          </div>
        </div>
      </div>
    );

    return (
      <div className="potd-card-wrapper mb-2 lg:mb-0 lg:max-w-full lg:m-0 overflow-hidden" key={tpl.id}>
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
            <TemplateCard template={tpl} variant="regular" onClick={() => openDetail(tpl)} overlay={BrandingOverlay} />
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
            {/* Sticky Video Button Wrapper with Solid Background to mask scrolling chips */}
            <div
              className="sticky left-0 z-[60] bg-white pr-3  pl-2 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)]"
              onClick={() => setActiveCategory('Video')}
            >
              <button className={`px-5 py-2.5 rounded-full text-[0.85rem] lg:text-base font-bold whitespace-nowrap flex items-center gap-1.5 active:scale-95 transition-all shrink-0 ${activeCategory === 'Video' ? 'bg-[#b91c1c] text-white' : 'bg-[#ef4444] text-white'}`}>
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-10">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8 lg:gap-10">
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

          {/* 2. Top Hero POTD Grid - 3 Cards (Updated for responsiveness) */}
          <div className="lg:py-6 lg:px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-10 transition-all">
              <div className="bg-white lg:rounded-2xl lg:shadow-md lg:p-4 lg:border lg:border-gray-100 transition-all hover:shadow-xl">
                {renderPOTDCard(TEMPLATES[0], 0)}
              </div>
              <div className="bg-white lg:rounded-2xl lg:shadow-md lg:p-4 lg:border lg:border-gray-100 transition-all hover:shadow-xl">
                {renderPOTDCard(TEMPLATES[1], 1)}
              </div>
              <div className="bg-white lg:rounded-2xl lg:shadow-md lg:p-4 lg:border lg:border-gray-100 transition-all hover:shadow-xl xl:block hidden">
                {renderPOTDCard(TEMPLATES[2], 2)}
              </div>
            </div>
          </div>



          <div className="lg:py-6 lg:px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-10">
              {[3, 4].map(idx => (
                <div key={idx} className="bg-white lg:rounded-2xl lg:shadow-md lg:p-4 lg:border lg:border-gray-100 transition-all hover:shadow-xl">
                  {renderPOTDCard(TEMPLATES[idx], idx)}
                </div>
              ))}
              <div className="bg-white lg:rounded-2xl lg:shadow-md lg:p-4 lg:border lg:border-gray-100 transition-all hover:shadow-xl xl:block hidden">
                 {renderPOTDCard(TEMPLATES[5], 5)}
              </div>
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
          {/* INTERSPERSED POTD GRID 1 */}
          <div className="lg:py-6 lg:px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-10">
              {[6, 7].map(idx => (
                <div key={idx} className="bg-white lg:rounded-2xl lg:shadow-md lg:p-4 lg:border lg:border-gray-100 transition-all hover:shadow-xl">
                  {renderPOTDCard(TEMPLATES[idx], idx)}
                </div>
              ))}
              <div className="bg-white lg:rounded-2xl lg:shadow-md lg:p-4 lg:border lg:border-gray-100 transition-all hover:shadow-xl xl:block hidden">
                {renderPOTDCard(TEMPLATES[8], 8)}
              </div>
            </div>
          </div>

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

          {/* INTERSPERSED POTD GRID 2 */}
          <div className="lg:py-6 lg:px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-10">
              {[9, 10].map(idx => (
                <div key={idx} className="bg-white lg:rounded-2xl lg:shadow-md lg:p-4 lg:border lg:border-gray-100 transition-all hover:shadow-xl">
                  {renderPOTDCard(TEMPLATES[idx], idx)}
                </div>
              ))}
              <div className="bg-white lg:rounded-2xl lg:shadow-md lg:p-4 lg:border lg:border-gray-100 transition-all hover:shadow-xl xl:block hidden">
                 {renderPOTDCard(TEMPLATES[11], 11)}
              </div>
            </div>
          </div>


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
            {TEMPLATES.slice(12, visibleSections).map((tpl, idx) => (
              <div key={tpl.id} className="mb-8 bg-white lg:rounded-2xl lg:shadow-md lg:p-4 lg:border lg:border-gray-100 transition-all hover:shadow-xl">
                {renderPOTDCard(tpl, idx + 12)}
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
