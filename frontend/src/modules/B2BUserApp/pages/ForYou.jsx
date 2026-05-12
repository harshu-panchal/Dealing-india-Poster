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
import { useTranslation } from 'react-i18next';

const ForYou = () => {
  const { t } = useTranslation();
  const { openDetail, openCustomPosterEditor } = useEditor();

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

  const [activeType, setActiveType] = useState('image'); // 'image' or 'video'
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5003/api';

  const filterByType = useCallback((t) => {
    if (!t) return false;
    const isVideo = t.type === 'video' || t.isVideo;
    return activeType === 'video' ? isVideo : !isVideo;
  }, [activeType]);

  const [isSearchMode, setIsSearchMode] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      setDebouncedQuery(transcript); // Execute search immediately after voice input
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const isBusinessCardTemplate = useCallback((t) => {
    if (!t) return false;
    const subName = t.subcategoryId?.name?.toLowerCase() || '';
    const catName = t.categoryId?.name?.toLowerCase() || '';
    const tplCategory = t.category?.toLowerCase() || '';
    
    return subName.includes('business card') || 
           subName.includes('business-card') ||
           catName.includes('business card') || 
           catName.includes('business-card') ||
           tplCategory.includes('business card') ||
           tplCategory.includes('business-card');
  }, []);

  // Handle Dynamic Search
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery.trim()) {
        setSearchData({ templates: [], categories: [], subcategories: [] });
        setIsSearching(false);
        return;
      }

      try {
        setIsSearching(true);
        const params = { 
          search: debouncedQuery, 
          limit: 50, 
          type: activeType,
          language: 'English'
        };
        if (activeCategory !== 'All') {
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
  }, [debouncedQuery, activeCategory, activeType, API_URL]);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      // Fetch Categories with Subcategories
      const { data: catData } = await axios.get(`${API_URL}/user/categories`);
      setCategories(catData);

      // Flatten subcategories for Today's Special (Filter out business cards)
      const mixedSubcategories = [];
      catData.forEach(cat => {
        if (cat.name.toLowerCase().includes('business card')) return;
        cat.subcategories?.forEach(sub => {
          if (sub.name.toLowerCase().includes('business card')) return;
          mixedSubcategories.push({ ...sub, parentName: cat.name });
        });
      });
      setSpecialItems(mixedSubcategories.sort(() => 0.5 - Math.random()));

      // Fetch Templates
      const { data: tplData } = await axios.get(`${API_URL}/user/templates?limit=400&language=English`);
      const templates = (tplData.templates || []).filter(t => !isBusinessCardTemplate(t));
      setAllTemplates(templates);
      

      setVideoPosters(templates.filter(t => t.type === 'video' || t.isVideo));
      
      // Fetch Poster of the Day
      try {
        const { data: potdData } = await axios.get(`${API_URL}/user/templates?potd=true&limit=20`);
        const potdTpls = (potdData.templates || []).filter(t => !isBusinessCardTemplate(t));
        
        if (potdTpls.length > 0) {
          setPotdTemplates(potdTpls.slice(0, 3));
        } else {
          setPotdTemplates(templates.slice(0, 3));
        }
      } catch (e) {
        setPotdTemplates(templates.slice(0, 3));
      }

      // Organize Sections — use string comparison to handle ObjectId vs string mismatch
      const organizedSections = catData
        .filter(cat => !cat.name.toLowerCase().includes('business card'))
        .map(cat => ({
          id: cat._id,
          title: cat.name,
          subcategories: cat.subcategories?.filter(sub => !sub.name.toLowerCase().includes('business card')),
          templates: templates.filter(t => {
             const catIdStr = t.categoryId?._id?.toString() || t.categoryId?.toString() || '';
             const matchesCategory = catIdStr === cat._id?.toString();
             const matchesType = filterByType(t);
             return matchesCategory && matchesType && !isBusinessCardTemplate(t);
          })
        })).filter(s => s.templates.length > 0 || (s.subcategories && s.subcategories.length > 0 && activeType === 'image'));

      setSections(organizedSections);
    } catch (error) {
      console.error('Initial data fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [API_URL, activeType]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle shared template link auto-open
  useEffect(() => {
    const handleAutoOpen = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const templateId = urlParams.get('templateId');
      if (!templateId) return;

      // 1. Try to find in already loaded templates
      let template = allTemplates.find(t => t._id === templateId);

      // 2. If not found (e.g. older template or different category), fetch it directly
      if (!template) {
        try {
          const { data } = await axios.get(`${API_URL}/user/templates/${templateId}`);
          if (data) {
            template = data;
          }
        } catch (err) {
          console.error('Failed to fetch shared template:', err);
        }
      }

      if (template) {
        openDetail(template);
        // Clear param from URL to keep it clean
        const newurl = window.location.origin + window.location.pathname;
        window.history.replaceState({ path: newurl }, '', newurl);
      }
    };

    if (allTemplates.length > 0 || window.location.search.includes('templateId')) {
      handleAutoOpen();
    }
  }, [allTemplates, openDetail, API_URL]);

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
                <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em] leading-none mb-2">{t("featuredCollection")}</p>
                <h2 className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">{t("posterOfTheDay")}</h2>
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

  // The main return handles the conditional UI
  const renderSearchHome = () => (
    <div className="p-4 space-y-8 bg-white min-h-[calc(100vh-64px)]">
      {/* Trending Searches */}
      <section>
        <h3 className="text-slate-500 text-[0.8rem] font-bold mb-4 uppercase tracking-wider">Trending Searches</h3>
        <div className="flex flex-wrap gap-2">
          {["Today's Special", "Birthday Wishes", "Anniversary Wishes", "Invitation", "Religious Posters"].map(term => (
            <button 
              key={term}
              onClick={() => setSearchQuery(term)}
              className="px-4 py-2 rounded-lg border border-[#ef4444]/30 text-[#ef4444] text-xs font-bold bg-white shadow-sm hover:bg-red-50 transition-colors"
            >
              {term}
            </button>
          ))}
        </div>
      </section>

      {/* Suggested Categories */}
      <section>
        <h3 className="text-slate-500 text-[0.8rem] font-bold mb-4 uppercase tracking-wider">Suggested Categories</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {categories.slice(0, 6).map(cat => (
            <div 
              key={cat._id}
              onClick={() => { 
                setActiveCategory(cat._id); 
                setIsSearchMode(false); 
              }}
              className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col cursor-pointer active:scale-95 transition-all hover:shadow-md"
            >
              <div className="aspect-[4/3] bg-slate-50 relative">
                <img src={cat.image} className="w-full h-full object-cover" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2 right-2">
                  <span className="text-[0.7rem] font-bold text-white drop-shadow-md">{cat.name}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-20">
      {/* Sticky Top Header */}
      {isSearchMode ? (
        <div className="sticky top-0 z-[1000] bg-[#ef4444] p-3 flex items-center gap-3 shadow-md">
          <button 
            onClick={() => {
              if (searchQuery) {
                setSearchQuery('');
              } else {
                setIsSearchMode(false);
              }
            }} 
            className="text-white p-1"
          >
            <ChevronRight className="rotate-180" size={24} />
          </button>
          <div className="flex-1 bg-white rounded-md flex items-center px-3 py-1.5 gap-2">
            <Search className="text-slate-400" size={18} />
            <input 
              autoFocus
              type="text" 
              placeholder="Search P..." 
              className="flex-1 border-none outline-none text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button 
              onClick={startListening} 
              className={`p-1 transition-all duration-300 ${isListening ? 'text-blue-500 scale-125 animate-pulse' : 'text-[#ef4444]'}`}
            >
              <Mic size={18} />
            </button>
          </div>
          <button 
            onClick={() => {
              if (searchQuery.trim()) {
                setDebouncedQuery(searchQuery);
              }
            }}
            className="bg-white/20 text-white px-4 py-1.5 rounded-md text-sm font-bold border border-white/30 active:scale-95 transition-all"
          >
            Search
          </button>
        </div>
      ) : (
        <div className="sticky top-0 z-[1000] shadow-sm bg-white">
          <div className="bg-white p-1 px-4 text-center border-b border-[#f1f5f9]">
            <p className="text-[0.75rem] font-bold text-[#c2410c] m-0">{t("supportRating")}</p>
          </div>

          <section className="p-3 px-4 bg-white flex justify-center overflow-hidden">
            <div className="w-full lg:max-w-4xl flex items-center gap-2">
              <div className="flex-1 min-w-0" onClick={() => setIsSearchMode(true)}>
                <SearchBar value={searchQuery} onChange={setSearchQuery} />
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); openCustomPosterEditor(); }}
                className="shrink-0 bg-emerald-500 text-white px-3.5 py-2.5 rounded-full flex items-center gap-1.5 shadow-lg active:scale-95 transition-all border-none cursor-pointer"
              >
                <Layers size={18} />
                <span className="text-[0.7rem] font-black uppercase tracking-widest whitespace-nowrap">Create</span>
              </button>
            </div>
          </section>



          <section className="bg-white pt-1 pb-4 relative border-b border-[#f1f5f9] flex justify-center">
            <div className="flex px-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth lg:max-w-6xl w-full gap-1.5 px-4 items-center">
              <button 
                onClick={() => setActiveType(prev => prev === 'video' ? 'image' : 'video')}
                className={`px-5 py-2.5 rounded-full text-[0.85rem] lg:text-base font-bold whitespace-nowrap flex items-center gap-1.5 transition-all shrink-0 shadow-sm ${activeType === 'video' ? 'bg-[#b91c1c] text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
              >
                <Video size={18} fill={activeType === 'video' ? 'white' : 'none'} className={activeType === 'video' ? 'text-white' : 'text-slate-400'} /> {t("video")}
              </button>

              <div className="w-[1px] h-8 bg-slate-200 mx-1.5 self-center shrink-0" />

              <button
                 onClick={() => { setActiveCategory('All'); setActiveSubcategory(null); }}
                 className={`px-6 py-2.5 rounded-full text-[0.85rem] lg:text-base font-bold whitespace-nowrap shrink-0 transition-colors ${activeCategory === 'All' ? 'bg-[#1e1e1e] text-white' : 'bg-slate-100 text-slate-500'}`}
              >
                {t("all")}
              </button>

              {categories.filter(cat => !cat.name.toLowerCase().includes('business card')).map(cat => (
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
      )}

      <div className="pt-2">
        {isSearchMode && !searchQuery.trim() ? (
          renderSearchHome()
        ) : searchQuery.trim() !== '' ? (
          <div className="p-4">
            <div className="mb-6">
               <h2 className="text-xl font-bold text-slate-800 tracking-tight">{t("searchResults")}</h2>
               <p className="text-[0.7rem] font-bold text-slate-400 uppercase tracking-widest mt-1">
                 {isSearching ? t("loading") : t("foundMatches", { count: searchData.templates.length + searchData.categories.length + searchData.subcategories.length })}
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
                 {searchData.templates.filter(filterByType).length > 0 && (
                   <div className="space-y-4">
                     <h3 className="text-[0.7rem] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">{activeType === 'video' ? 'Videos' : 'Posters'}</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                       {searchData.templates.filter(filterByType).map(tpl => (
                         <TemplateCard key={tpl._id} template={tpl} variant="regular" onClick={() => openDetail(tpl)} />
                       ))}
                     </div>
                   </div>
                 )}
               </div>
            ) : (
               <div className="text-center py-20 bg-white rounded-[2rem] border border-slate-50">
                  <Search size={48} className="text-slate-200 mx-auto mb-4" />
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">{t("noMatchesFound")}</h3>
                  <p className="text-[0.65rem] font-bold text-slate-400 mt-2 max-w-[200px] mx-auto">Try searching for keywords like "Festival", "Business" or "Video"</p>
               </div>
            )}
          </div>
        ) : (activeCategory === 'All' && activeType === 'video') ? (
          <div className="p-2">
            <div className="px-2 mb-4">
              <h2 className="text-xl font-bold text-[#0f172a]">{t("videoTemplates")}</h2>
              <p className="text-sm text-[#64748b]">Found {videoPosters.length} trending videos</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allTemplates.filter(filterByType).map(tpl => (
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
                    {activeSubcategory && ` > ${categories.find(c => c._id === activeCategory)?.subcategories?.find(s => s._id === activeSubcategory)?.name}`}
                    {activeType === 'video' && ' (Videos)'}
                 </h2>
                 <p className="text-sm text-[#64748b]">Showing {activeType}s for your selection</p>
              </div>
              <button 
                 onClick={() => { 
                   if (activeSubcategory) {
                     setActiveSubcategory(null);
                   } else {
                     setActiveCategory('All');
                   }
                 }}
                 className="text-[0.7rem] font-bold text-orange-500 bg-orange-50 px-3 py-1.5 rounded-lg border-none"
              >
                 Reset
              </button>
            </div>

            {/* Subcategories List for Active Category */}
            {!activeSubcategory && categories.find(c => c._id === activeCategory)?.subcategories?.length > 0 && (
              <div className="mb-8 px-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[0.7rem] font-black text-slate-400 uppercase tracking-[0.2em]">Subcategories</h3>
                </div>
                <div className="flex gap-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-1">
                  {categories.find(c => c._id === activeCategory).subcategories.map(sub => (
                    <div 
                      key={sub._id} 
                      onClick={() => setActiveSubcategory(sub._id)}
                      className="min-w-[120px] w-[120px] group cursor-pointer"
                    >
                      <div className="aspect-square bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-2 relative">
                        <img src={sub.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={sub.name} />
                        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                      </div>
                      <span className="text-[0.7rem] font-black text-slate-700 text-center block truncate uppercase tracking-tighter">{sub.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allTemplates
                .filter(t => {
                   const matchesCat = t.categoryId === activeCategory || t.categoryId?._id === activeCategory;
                   const matchesSub = !activeSubcategory || t.subcategoryId === activeSubcategory || t.subcategoryId?._id === activeSubcategory;
                   const matchesType = filterByType(t);
                   return matchesCat && matchesSub && matchesType;
                })
                .map(tpl => (
                <TemplateCard key={tpl._id} template={tpl} variant="regular" onClick={() => openDetail(tpl)} />
              ))}
            </div>
            
            {allTemplates.filter(t => {
                const matchesCat = t.categoryId === activeCategory || t.categoryId?._id === activeCategory;
                const matchesSub = !activeSubcategory || t.subcategoryId === activeSubcategory || t.subcategoryId?._id === activeSubcategory;
                const matchesType = filterByType(t);
                return matchesCat && matchesSub && matchesType;
            }).length === 0 && (
              <div className="text-center py-20 bg-white rounded-[2rem] border border-slate-50 mt-4">
                <Layers size={48} className="text-slate-100 mx-auto mb-4" />
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">No Posters Found</h3>
                <p className="text-[0.65rem] font-bold text-slate-400 mt-2">Check back later for new designs in this section.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-0.5">
             {/* 1. Today's Special (Mixed subcategories with Category Name overlay) */}
             <section className="bg-white py-6 mb-0 border-b border-slate-50">
                <div className="w-full lg:px-4">
                  <SectionHeader 
                    title={t("todaysSpecial")} 
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
                <SectionHeader title={`${t("recommended")} ${activeType === 'video' ? t("video") : t("myPosters")}`} showViewAll={true} />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2 lg:px-0">
                   {allTemplates.filter(filterByType).slice(0, 6).map((tpl, i) => (
                      <TemplateCard key={`init-grid-${tpl._id}`} template={tpl} variant="regular" onClick={() => openDetail(tpl)} />
                   ))}
                </div>
             </div>



             {/* 4. Categorized Discovery Modules (No names on slides as requested) */}
             {sections.map((section, index) => {
                const typeFilteredTemplates = section.templates.filter(filterByType);
                if (typeFilteredTemplates.length === 0 && (!section.subcategories || section.subcategories.length === 0)) return null;

                return (
                  <React.Fragment key={section.id}>
                    <section className="bg-white py-6 mb-2">
                       <div className="w-full lg:px-4">
                         <div className="flex items-center justify-between px-4 mb-4">
                            <div className="flex flex-col">
                               <p className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] leading-none mb-1">{t("discoverNow")}</p>
                               <h3 className="text-lg font-black text-slate-800 tracking-tight">{section.title}</h3>
                            </div>
                            <button onClick={() => setActiveCategory(section.id)} className="text-[0.65rem] font-black text-slate-400 bg-slate-50 px-4 py-2 rounded-full uppercase tracking-widest border-none">{t("viewAll")}</button>
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
                              typeFilteredTemplates.map(tpl => (
                                 <TemplateCard key={tpl._id} template={tpl} variant="compact" onClick={() => openDetail(tpl)} />
                              ))
                           )}
                         </HorizontalScrollList>
                       </div>
                    </section>
                    
                    {/* Interspersed cards for continuous scroll variety - 3 in a row on desktop */}
                    {allTemplates.filter(filterByType).length > 0 && (
                      <div className="bg-white py-6 mb-2 lg:px-4 border-b border-slate-50">
                        <SectionHeader title={t("staffPicks")} showViewAll={false} />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2 lg:px-0">
                          {[0, 1, 2].map(offset => {
                            const filteredList = allTemplates.filter(filterByType);
                            const tplIndex = (index * 3 + offset) % filteredList.length;
                            const tpl = filteredList[tplIndex];
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
