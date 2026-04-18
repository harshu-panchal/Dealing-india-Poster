import React, { useState, useEffect, useCallback } from 'react';
import { Heart, ChevronRight, Video, User, MessageCircle, Search, Mic, Layers } from 'lucide-react';
import SectionHeader from '../components/common/SectionHeader';
import HorizontalScrollList from '../components/common/HorizontalScrollList';
import TemplateCard from '../components/posters/TemplateCard';
import POTDCard from '../components/posters/POTDCard';
import ShimmerLoader from '../components/common/ShimmerLoader';
import SearchBar from '../components/common/SearchBar';
import axios from 'axios';
import { useEditor } from '../context/EditorContext';
import { useAuth } from '../context/AuthContext';
import SubcategoryCard from '../components/posters/SubcategoryCard';

const ForYou = () => {
  const { openDetail } = useEditor();
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [sections, setSections] = useState([]);
  const [specialItems, setSpecialItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeSubcategory, setActiveSubcategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [videoPosters, setVideoPosters] = useState([]);
  const [allTemplates, setAllTemplates] = useState([]);
  const [potdTemplates, setPotdTemplates] = useState([]);
  const [showAllSpecials, setShowAllSpecials] = useState(false);
  const [searchData, setSearchData] = useState({ templates: [], categories: [], subcategories: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const API_URL = import.meta.env.VITE_API_URL;

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle Dynamic Search
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      try {
        setIsSearching(true);
        const params = { search: debouncedQuery, limit: 50 };
        if (activeCategory === 'Video') {
          params.type = 'video';
        } else if (activeCategory !== 'All') {
          params.category = activeCategory;
        }
        
        const { data } = await axios.get(`${API_URL}/user/templates`, { params });
        setSearchData({
          templates: data.templates || [],
          categories: data.categories || [],
          subcategories: data.subcategories || []
        });
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedQuery, API_URL]);

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
      
      // Fetch Poster of the Day
      try {
        const { data: potdData } = await axios.get(`${API_URL}/user/templates?potd=true&limit=3`);
        if (potdData.templates && potdData.templates.length > 0) {
          setPotdTemplates(potdData.templates);
        } else {
          // Fallback to first 3 templates
          setPotdTemplates(templates.slice(0, 3));
        }
      } catch (e) {
        setPotdTemplates(templates.slice(0, 3));
      }

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

  const handleLikePOTD = async (posterId) => {
    if (!user?.accessToken) return;

    try {
      const { data } = await axios.post(`${API_URL}/user/templates/${posterId}/like`, {}, {
        headers: { Authorization: `Bearer ${user.accessToken}` }
      });
      setPotdTemplates(prev => prev.map(t => 
        t._id === posterId 
          ? { ...t, isLiked: data.liked, likeCount: data.liked ? (t.likeCount || 0) + 1 : (t.likeCount || 0) - 1 }
          : t
      ));
    } catch (err) {
      console.error('POTD Like failed:', err);
    }
  };

  const renderPOTDCard = (templates) => {
    if (!templates || templates.length === 0) return null;
    return (
      <section className="bg-white pt-4 pb-10 lg:pt-6 lg:pb-12 mb-2 border-b border-slate-50">
        <div className="w-full lg:px-4 lg:max-w-6xl lg:mx-auto">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between px-4 lg:px-0">
              <div className="flex flex-col">
                <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em] leading-none mb-2">Featured Collection</p>
                <h2 className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">Poster of the Day</h2>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 lg:px-0">
              {templates.map(tpl => (
                <div key={tpl._id} className="relative group">
                  <div className="absolute top-4 right-4 z-[20]">
                    <button 
                       onClick={() => handleLikePOTD(tpl._id)}
                       className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-sm border border-slate-100 active:scale-95 transition-all"
                    >
                       <Heart size={16} className={tpl.isLiked ? 'fill-red-500 text-red-500' : 'text-slate-300'} />
                       <span className="text-[0.7rem] font-black text-slate-700">{tpl.likeCount || 0}</span>
                    </button>
                  </div>
                  <POTDCard poster={tpl} onEdit={openDetail} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
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
        {searchQuery.trim() !== '' ? (
          <div className="p-4">
            <div className="mb-6">
               <h2 className="text-xl font-bold text-slate-800 tracking-tight">Search Results</h2>
               <p className="text-[0.7rem] font-bold text-slate-400 uppercase tracking-widest mt-1">
                 {isSearching ? 'Searching...' : `Found ${searchData.templates.length + searchData.categories.length + searchData.subcategories.length} matches for "${searchQuery}"`}
               </p>
            </div>
            
            {isSearching ? (
               <ShimmerLoader type="regular" count={6} />
            ) : (searchData.templates.length > 0 || searchData.categories.length > 0 || searchData.subcategories.length > 0) ? (
               <div className="space-y-8">
                 {/* Categories & Subcategories Hits */}
                 {(searchData.categories.length > 0 || searchData.subcategories.length > 0) && (
                   <div className="space-y-4">
                     <h3 className="text-[0.7rem] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">Collections</h3>
                     <div className="flex gap-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-1">
                       {searchData.categories.map(cat => (
                         <div 
                           key={cat._id} 
                           onClick={() => { setActiveCategory(cat._id); setSearchQuery(''); }}
                           className="min-w-[120px] bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-all"
                         >
                           <img src={cat.image} className="w-10 h-10 rounded-full object-cover bg-slate-50" alt="" />
                           <span className="text-[0.65rem] font-bold text-slate-700 text-center truncate w-full">{cat.name}</span>
                         </div>
                       ))}
                       {searchData.subcategories.map(sub => (
                         <div 
                           key={sub._id} 
                           onClick={() => { setActiveCategory(sub.parentId); setActiveSubcategory(sub._id); setSearchQuery(''); }}
                           className="min-w-[120px] bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-all"
                         >
                           <img src={sub.image} className="w-10 h-10 rounded-full object-cover bg-slate-50" alt="" />
                           <span className="text-[0.65rem] font-bold text-slate-700 text-center truncate w-full">{sub.name}</span>
                         </div>
                       ))}
                     </div>
                   </div>
                 )}

                 {/* Template Hits */}
                 {searchData.templates.length > 0 && (
                   <div className="space-y-4">
                     <h3 className="text-[0.7rem] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">Posters & Videos</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                       {searchData.templates.map(tpl => (
                         <TemplateCard key={tpl._id} template={tpl} variant="regular" onClick={() => openDetail(tpl)} />
                       ))}
                     </div>
                   </div>
                 )}
               </div>
            ) : (
               <div className="text-center py-20 bg-white rounded-[2rem] border border-slate-50">
                  <Search size={48} className="text-slate-200 mx-auto mb-4" />
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">No Matches Found</h3>
                  <p className="text-[0.65rem] font-bold text-slate-400 mt-2 max-w-[200px] mx-auto">Try searching for keywords like "Festival", "Business" or "Video"</p>
               </div>
            )}
          </div>
        ) : activeCategory === 'Video' ? (
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
             <section className="bg-white py-6 mb-0 border-b border-slate-50">
                <div className="w-full lg:px-4">
                  <SectionHeader 
                    title="Today's Special" 
                    showViewAll={true} 
                    onViewAll={() => setShowAllSpecials(!showAllSpecials)}
                  />
                  <div className="px-4 lg:px-0">
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

                  {showAllSpecials && (
                    <div className="mt-6 px-4 lg:px-0 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {specialItems.map((sub, i) => (
                        <div 
                           key={`grid-${sub._id}-${i}`}
                           onClick={() => {
                              setActiveCategory(sub.parentId);
                              setActiveSubcategory(sub._id);
                           }}
                           className="flex flex-col gap-2 cursor-pointer group"
                        >
                           <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 shadow-sm border border-slate-50">
                              <img src={sub.image} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" alt="" />
                           </div>
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{sub.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
             </section>

             {/* 1.5 Poster of the Day */}
             {renderPOTDCard(potdTemplates)}

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
