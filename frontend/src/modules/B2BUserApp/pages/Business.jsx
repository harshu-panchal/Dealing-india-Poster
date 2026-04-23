import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Layout, Search, Grid, List, ChevronRight, Briefcase, CreditCard, Sparkles, TrendingUp } from 'lucide-react';
import HorizontalScrollList from '../components/common/HorizontalScrollList';
import TemplateCard from '../components/posters/TemplateCard';
import SectionHeader from '../components/common/SectionHeader';
import SearchBar from '../components/common/SearchBar';
import { useEditor } from '../context/EditorContext';

const Business = () => {
  const { openDetail, openEditor } = useEditor();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [allTemplates, setAllTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [catRes, tplRes] = await Promise.all([
          axios.get(`${API_URL}/user/categories`),
          axios.get(`${API_URL}/user/templates?limit=500`)
        ]);
        setCategories(catRes.data);
        setAllTemplates(tplRes.data.templates);
      } catch (err) {
        console.error('Failed to fetch business data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [API_URL]);

  const businessCategory = useMemo(() => {
    const list = categories || [];
    // 1. Try exact match (including the common misspelling found in your data)
    const exactMatch = list.find(cat => 
      cat.name.toLowerCase() === 'business' || 
      cat.name.toLowerCase() === 'bussiness'
    );
    if (exactMatch) return exactMatch;

    // 2. Try match that contains 'business' but is NOT 'business card'
    const generalBusiness = list.find(cat => 
      cat.name.toLowerCase().includes('business') && 
      !cat.name.toLowerCase().includes('card')
    );
    if (generalBusiness) return generalBusiness;

    // 3. Fallback to any business match
    return list.find(cat => 
      cat.name.toLowerCase().includes('business') || 
      cat.name.toLowerCase().includes('bussiness')
    );
  }, [categories]);

  const businessCards = useMemo(() => {
    return allTemplates.filter(t => 
      // Strictly include only if it has fields defined OR is explicitly named as a business card
      (t.fields?.length > 0 || t.name?.toLowerCase().includes('business card')) && 
      (t.categoryId?._id === businessCategory?._id || t.categoryId === businessCategory?._id || !t.categoryId)
    );
  }, [allTemplates, businessCategory]);

  const businessSubsections = useMemo(() => {
    if (!businessCategory) return [];
    
    const nonCardBusinessTemplates = allTemplates.filter(t => 
      businessCategory && (t.categoryId?._id === businessCategory._id || t.categoryId === businessCategory._id) && 
      !businessCards.find(bc => bc._id === t._id)
    );

    const subcats = businessCategory.subcategories || [];
    return subcats.map(sub => ({
      id: sub._id,
      title: sub.name,
      items: nonCardBusinessTemplates.filter(t => (t.subcategoryId?._id === sub._id || t.subcategoryId === sub._id))
    })).filter(section => section.items.length > 0);
  }, [businessCategory, allTemplates, businessCards]);

  const otherCategories = useMemo(() => {
    return categories.filter(cat => 
       cat._id !== businessCategory?._id
    ).map(cat => ({
       ...cat,
       items: allTemplates.filter(t => t.categoryId?._id === cat._id)
    })).filter(cat => cat.items.length > 0);
  }, [categories, allTemplates, businessCategory]);

  const handleCardClick = (template) => {
    openDetail(template);
  };

  if (isLoading) {
    return (
      <div className="p-10 text-center">
        <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400 text-xs font-black uppercase tracking-widest animate-pulse">Synchronizing Business Assets...</p>
      </div>
    );
  }

  return (
    <div className="bg-bg min-h-screen pb-20">
      {/* Search Header */}
      <div className="p-3 px-4 bg-white sticky top-0 z-[50] shadow-sm">
        <SearchBar 
          placeholder="Search Business & Cards" 
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </div>

      <div className="pt-4">
        {/* Section 1: Business Cards */}
        {!searchQuery && businessCards.length > 0 && (
          <div className="bg-white py-4 mb-2 shadow-sm">
            <div className="px-5 mb-4 flex items-center justify-between">
               <div>
                  <h2 className="text-sm font-black text-slate-800 tracking-tight">
                    Business Cards ({businessCards.length})
                  </h2>
               </div>
                <button 
                  onClick={() => navigate(`/category/${businessCategory?._id}?type=business_card`)} 
                  className="text-xs font-bold text-[#ef4444] border-none bg-transparent cursor-pointer"
                >
                   View All
                </button>
            </div>

            <HorizontalScrollList snap={true}>
              {businessCards.map(tpl => (
                <div key={tpl._id} className="px-3 first:pl-5 last:pr-5 shrink-0">
                   <div 
                     onClick={() => openDetail(tpl)}
                     className="w-[240px] h-[137px] rounded-2xl overflow-hidden shadow-sm border border-slate-100 relative group cursor-pointer bg-slate-50"
                   >
                      <img src={tpl.image} className="w-full h-full object-cover" alt="" />
                      
                      {/* Like Count Overlay */}
                      <div className="absolute top-2 right-2 bg-black/30 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1">
                         <div className="w-2.5 h-2.5 bg-white/20 rounded-full flex items-center justify-center">
                            <span className="text-[6px] text-white">❤️</span>
                         </div>
                         <span className="text-[8px] font-black text-white">{(Math.random() * 10).toFixed(1)}K</span>
                      </div>

                      {/* Edit Badge */}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-xl">
                            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Edit Layout</span>
                         </div>
                      </div>
                   </div>
                </div>
              ))}
            </HorizontalScrollList>
          </div>
        )}

        {/* Section 2: Business Subcategories */}
        <div className="space-y-6">
           {businessSubsections.map(section => (
             <div key={section.id} className="bg-white py-4 mb-2 shadow-sm">
                <div className="px-5 mb-4 flex items-center justify-between">
                   <h2 className="text-sm font-black text-slate-800 tracking-tight">
                     {section.title} ({section.items.length})
                   </h2>
                   <button 
                     onClick={() => navigate(`/category/${section.id}?type=subcategory`)} 
                     className="text-xs font-bold text-[#ef4444] border-none bg-transparent cursor-pointer"
                   >
                     View All
                   </button>
                </div>
                <HorizontalScrollList snap={true}>
                   {section.items.map(tpl => (
                     <div key={tpl._id} className="px-3 first:pl-5 last:pr-5 shrink-0">
                        <div 
                          onClick={() => openDetail(tpl)}
                          className={`rounded-2xl overflow-hidden shadow-sm border border-slate-100 relative group cursor-pointer bg-slate-50 ${section.title?.toLowerCase().includes('card') ? 'w-[200px] h-[114px]' : 'w-[140px] h-[140px]'}`}
                        >
                           <img src={tpl.image} className="w-full h-full object-cover" alt="" />
                           <div className="absolute top-2 right-2 bg-black/30 backdrop-blur-md px-2 py-0.5 rounded-full flex items-center gap-1">
                              <span className="text-[8px] font-black text-white">{(Math.random() * 5).toFixed(1)}K</span>
                           </div>
                        </div>
                     </div>
                   ))}
                </HorizontalScrollList>
             </div>
           ))}
        </div>

        {/* Section 3: Other Categories */}
        <div className="space-y-4 mt-6">
           <div className="px-5">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Explore More</h3>
           </div>
           {otherCategories.map(cat => (
             <div key={cat._id} className="bg-white py-2 mb-1 shadow-sm">
                <SectionHeader 
                  title={cat.name} 
                  showViewAll={true} 
                  onViewAll={() => navigate(`/category/${cat._id}`)} 
                />
                <HorizontalScrollList>
                   {cat.items.map(tpl => (
                     <TemplateCard 
                       key={tpl._id} 
                       template={tpl} 
                       variant="compact" 
                       onClick={() => openDetail(tpl)} 
                     />
                   ))}
                </HorizontalScrollList>
             </div>
           ))}
        </div>

        {/* Branding Promotion */}
        <div className="mx-4 my-8 p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] text-white overflow-hidden relative shadow-2xl">
           <div className="absolute top-0 right-0 p-8 opacity-10"><Briefcase size={120} /></div>
           <div className="relative z-10">
              <h3 className="text-xl font-black tracking-tight mb-2">Build Your Identity</h3>
              <p className="text-slate-400 text-xs font-bold leading-relaxed max-w-[200px]">Create professional business cards and marketing posters in seconds.</p>
              <button className="mt-5 bg-white text-slate-900 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-none cursor-pointer">Explore Now</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Business;
