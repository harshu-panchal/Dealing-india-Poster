import React, { useState, useEffect, useCallback } from 'react';
import { Heart, ChevronRight, Video, User, MessageCircle, Search, Mic, Layers } from 'lucide-react';
import SectionHeader from '../components/common/SectionHeader';
import HorizontalScrollList from '../components/common/HorizontalScrollList';
import TemplateCard from '../components/posters/TemplateCard';
import ShimmerLoader from '../components/common/ShimmerLoader';
import SearchBar from '../components/common/SearchBar';
import axios from 'axios';
import { useEditor } from '../context/EditorContext';
import SubcategoryCard from '../components/posters/SubcategoryCard';

const ForYou = () => {
  const { openDetail } = useEditor();
  const [categories, setCategories] = useState([]);
  const [sections, setSections] = useState([]);
  const [specialItems, setSpecialItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeSubcategory, setActiveSubcategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [videoPosters, setVideoPosters] = useState([]);
  const [allTemplates, setAllTemplates] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      // Fetch Categories with Subcategories
      const { data: catData } = await axios.get(`${API_URL}/user/categories`);
      setCategories(catData);

      // Flatten subcategories for Today's Special
      const mixedSubcategories = [];
      catData.forEach(cat => {
        cat.subcategories?.forEach(sub => {
          mixedSubcategories.push({ ...sub, parentName: cat.name });
        });
      });
      setSpecialItems(mixedSubcategories.sort(() => 0.5 - Math.random()));

      // Fetch Templates
      const { data: tplData } = await axios.get(`${API_URL}/user/templates?limit=100`);
      const templates = tplData.templates;
      setAllTemplates(templates);
      setVideoPosters(templates.filter(t => t.isVideo));
      
      // Organize Sections
      const organizedSections = catData.map(cat => ({
        id: cat._id,
        title: cat.name,
        subcategories: cat.subcategories,
        templates: templates.filter(t => t.categoryId === cat._id || t.categoryId?._id === cat._id)
      })).filter(s => s.templates.length > 0 || (s.subcategories && s.subcategories.length > 0));

      setSections(organizedSections);
    } catch (error) {
      console.error('Initial data fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const renderPOTDCard = (tpl, index) => {
    if (!tpl) return null;
    return (
      <div className="potd-card-wrapper mb-2 lg:mb-0 lg:max-w-full lg:m-0 overflow-hidden" key={`potd-${tpl._id}-${index}`}>
        <section className="bg-white py-2 mb-1 lg:p-0 lg:m-0 lg:bg-transparent">
          <SectionHeader
            title="Poster of the Day"
            rightContent={
              <div className="flex items-center gap-1.5 text-slate-500 text-[0.85rem] lg:text-base font-bold">
                <Heart size={18} className="lg:w-5 lg:h-5" /> <span>{Math.floor(Math.random() * 500) + 200}</span>
                <ChevronRight size={18} className="ml-2 lg:w-6 lg:h-6" />
              </div>
            }
          />
          <div className="px-2 lg:p-0 relative group">
            <TemplateCard template={tpl} variant="regular" onClick={() => openDetail(tpl)} />
          </div>
        </section>
        <div className="h-2 bg-[#f1f5f9] lg:hidden"></div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-6 bg-white min-h-screen">
        <ShimmerLoader type="special" count={4} />
        <div className="h-4"></div>
        <ShimmerLoader type="potd" count={1} />
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-20">
      {/* Sticky Top Header */}
      <div className="sticky top-0 z-[50] shadow-sm bg-white">
        <div className="bg-white p-1 px-4 text-center border-b border-[#f1f5f9]">
          <p className="text-[0.75rem] font-bold text-[#c2410c] m-0">🙏 Support us & give 5* rating - click here! 🙏</p>
        </div>

        <section className="p-3 px-2 bg-white flex justify-center">
          <div className="w-full lg:max-w-4xl">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>
        </section>

        <section className="bg-white pt-1 pb-4 relative border-b border-[#f1f5f9] flex justify-center">
          <div className="flex px-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth lg:max-w-6xl w-full gap-1.5">
            <button
               onClick={() => { setActiveCategory('All'); setActiveSubcategory(null); }}
               className={`px-6 py-2.5 rounded-full text-[0.85rem] lg:text-base font-bold whitespace-nowrap shrink-0 transition-colors ${activeCategory === 'All' ? 'bg-[#1e1e1e] text-white' : 'bg-slate-100 text-slate-500'}`}
            >
              All
            </button>

            <button 
              onClick={() => { setActiveCategory('Video'); setActiveSubcategory(null); }}
              className={`px-5 py-2.5 rounded-full text-[0.85rem] lg:text-base font-bold whitespace-nowrap flex items-center gap-1.5 transition-all shrink-0 ${activeCategory === 'Video' ? 'bg-[#b91c1c] text-white' : 'bg-[#ef4444] text-white'}`}
            >
              <Video size={18} fill="white" /> Video
            </button>

            {categories.map(cat => (
              <button
                key={cat._id}
                onClick={() => { 
                   setActiveCategory(cat._id === activeCategory ? 'All' : cat._id);
                   setActiveSubcategory(null);
                }}
                className={`px-5 py-2.5 rounded-full text-[0.85rem] lg:text-base font-bold whitespace-nowrap shrink-0 transition-colors ${activeCategory === cat._id ? 'bg-[#1e1e1e] text-white' : 'bg-slate-100 text-slate-500'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="pt-2">
        {activeCategory === 'Video' ? (
          <div className="p-2">
            <div className="px-2 mb-4">
              <h2 className="text-xl font-bold text-[#0f172a]">Video Templates</h2>
              <p className="text-sm text-[#64748b]">Found {videoPosters.length} trending videos</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videoPosters.map(tpl => (
                <TemplateCard key={tpl._id} template={tpl} variant="regular" onClick={() => openDetail(tpl)} />
              ))}
            </div>
          </div>
        ) : activeCategory !== 'All' ? (
          <div className="p-2">
            <div className="px-2 mb-4 flex items-center justify-between">
              <div>
                 <h2 className="text-xl font-bold text-[#0f172a]">
                    {categories.find(c => c._id === activeCategory)?.name || activeCategory}
                    {activeSubcategory && ` > ${specialItems.find(s => s._id === activeSubcategory)?.name}`}
                 </h2>
                 <p className="text-sm text-[#64748b]">Showing posters for your selection</p>
              </div>
              <button 
                 onClick={() => { setActiveCategory('All'); setActiveSubcategory(null); }}
                 className="text-[0.7rem] font-bold text-orange-500 bg-orange-50 px-3 py-1.5 rounded-lg"
              >
                 Reset
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allTemplates
                .filter(t => {
                   const matchesCat = t.categoryId === activeCategory || t.categoryId?._id === activeCategory;
                   const matchesSub = !activeSubcategory || t.subcategoryId === activeSubcategory || t.subcategoryId?._id === activeSubcategory;
                   return matchesCat && matchesSub;
                })
                .map(tpl => (
                <TemplateCard key={tpl._id} template={tpl} variant="regular" onClick={() => openDetail(tpl)} />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-0.5">
             {/* 1. Today's Special (Mixed subcategories with Category Name overlay) */}
             <section className="bg-white py-6 mb-2 border-b border-slate-50">
                <div className="w-full lg:px-4">
                  <SectionHeader title="Today's Special" showViewAll={true} />
                  <HorizontalScrollList className="pt-2">
                     {specialItems.length > 0 ? specialItems.map((sub, i) => (
                        <div 
                          key={`${sub._id}-${i}`} 
                          onClick={() => {
                             setActiveCategory(sub.parentId);
                             setActiveSubcategory(sub._id);
                          }}
                          className="min-w-[140px] w-[140px] aspect-square rounded-2xl overflow-hidden bg-slate-100 relative cursor-pointer group shadow-sm active:scale-95 transition-all"
                        >
                           <img src={sub.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={sub.name} />
                           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3">
                              <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none mb-1 opacity-70">{sub.parentName}</p>
                              <h4 className="text-[0.7rem] font-bold text-white truncate">{sub.name}</h4>
                           </div>
                        </div>
                     )) : (
                        <div className="flex flex-col items-center justify-center w-full py-10 opacity-40">
                           <p className="text-[0.6rem] font-black uppercase tracking-widest">No Features Today</p>
                        </div>
                     )}
                  </HorizontalScrollList>
                </div>
             </section>

             {/* 2. Initial High-Impact Posters (Grid of 3 on desktop) */}
             <div className="bg-white py-4 lg:px-4 mb-2 border-b border-slate-50">
                <SectionHeader title="Recommended Posters" showViewAll={true} />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2 lg:px-0">
                   {allTemplates.slice(0, 6).map((tpl, i) => (
                      <TemplateCard key={`init-grid-${tpl._id}`} template={tpl} variant="regular" onClick={() => openDetail(tpl)} />
                   ))}
                </div>
             </div>

             {/* 3. Trending Posters Slider (Shifted after 5 posters) */}
             <section className="bg-white py-6 mt-4 mb-2">
                <div className="w-full lg:px-4">
                  <SectionHeader title="Trending This Week" showViewAll={true} />
                  <HorizontalScrollList className="pt-2">
                    {allTemplates.length > 5 ? allTemplates.slice(5, 15).map(tpl => (
                      <TemplateCard key={tpl._id} template={tpl} variant="compact" onClick={() => openDetail(tpl)} />
                    )) : (
                       <div className="flex flex-col items-center justify-center w-full py-10 opacity-40">
                          <p className="text-[0.6rem] font-black uppercase tracking-widest">More coming soon</p>
                       </div>
                    )}
                  </HorizontalScrollList>
                </div>
             </section>

             {/* 4. Categorized Discovery Modules (No names on slides as requested) */}
             {sections.map((section, index) => {
                // Pick 1 high-impact template to show between sliders
                // Using modulo to ensure we always have a template even if list is short
                const interTemplate = allTemplates.length > 0 ? allTemplates[index % allTemplates.length] : null;

                return (
                  <React.Fragment key={section.id}>
                    <section className="bg-white py-6 mb-2">
                       <div className="w-full lg:px-4">
                         <div className="flex items-center justify-between px-4 mb-4">
                            <div className="flex flex-col">
                               <p className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] leading-none mb-1">Discover Now</p>
                               <h3 className="text-lg font-black text-slate-800 tracking-tight">{section.title}</h3>
                            </div>
                            <button onClick={() => setActiveCategory(section.id)} className="text-[0.65rem] font-black text-slate-400 bg-slate-50 px-4 py-2 rounded-full uppercase tracking-widest border-none">View All</button>
                         </div>
                         <HorizontalScrollList className="pt-2">
                           {section.subcategories?.length > 0 ? (
                              section.subcategories.map(sub => (
                                 <SubcategoryCard 
                                   key={sub._id} 
                                   subcategory={sub} 
                                   onClick={() => {
                                      setActiveCategory(section.id);
                                      setActiveSubcategory(sub._id);
                                   }} 
                                 />
                              ))
                           ) : (
                              section.templates.map(tpl => (
                                 <TemplateCard key={tpl._id} template={tpl} variant="compact" onClick={() => openDetail(tpl)} />
                              ))
                           )}
                         </HorizontalScrollList>
                       </div>
                    </section>
                    
                    {/* Interspersed cards for continuous scroll variety - 3 in a row on desktop */}
                    {allTemplates.length > 0 && (
                      <div className="bg-white py-6 mb-2 lg:px-4 border-b border-slate-50">
                        <SectionHeader title="Staff Picks" showViewAll={false} />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2 lg:px-0">
                          {[0, 1, 2].map(offset => {
                            const tplIndex = (index * 3 + offset) % allTemplates.length;
                            const tpl = allTemplates[tplIndex];
                            return <TemplateCard key={`inter-${index}-${offset}`} template={tpl} variant="regular" onClick={() => openDetail(tpl)} />;
                          })}
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
             })}
             
             {sections.length === 0 && (
               <div className="text-center py-24 px-4 bg-white rounded-3xl border border-slate-50 mx-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                     <Layers className="text-slate-200" size={32} />
                  </div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">No Content Found</h3>
                  <p className="text-[0.65rem] font-bold text-slate-400 mt-1 max-w-[200px] mx-auto">We're currently updating our catalog with new posters for you.</p>
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ForYou;
