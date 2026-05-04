import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Layers } from 'lucide-react';
import axios from 'axios';
import HorizontalScrollList from '../components/common/HorizontalScrollList';
import TemplateCard from '../components/posters/TemplateCard';
import SectionHeader from '../components/common/SectionHeader';
import SearchBar from '../components/common/SearchBar';
import { useEditor } from '../context/EditorContext';

const Trending = () => {
  const { openDetail } = useEditor();
  const [activeCategoryId, setActiveCategoryId] = useState('Trending');
  const [categories, setCategories] = useState([]);
  const [allTemplates, setAllTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5003/api';

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data: catData } = await axios.get(`${API_URL}/user/categories`);
      setCategories(catData);

      const preferredLanguage = localStorage.getItem('preferred_language') || 'English';
      const { data: tplData } = await axios.get(`${API_URL}/user/templates?limit=200&language=${preferredLanguage}`);
      setAllTemplates(tplData.templates);
    } catch (error) {
      console.error('Fetch data error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const categoryOptions = useMemo(() => {
    const defaultChips = [
      { id: 'My Designs', name: 'My Designs' },
      { id: 'Trending', name: 'Trending' }
    ];
    // Map categories to ensure they have the same structure
    const mappedCats = categories.map(c => ({ id: c._id, name: c.name }));
    return [...defaultChips, ...mappedCats];
  }, [categories]);

  const displaySections = useMemo(() => {
    if (activeCategoryId === 'Trending') {
      return categories.slice(0, 5).map(cat => ({
        id: cat._id,
        title: cat.name,
        items: allTemplates.filter(t => t.categoryId === cat._id || t.categoryId?._id === cat._id).slice(0, 10)
      })).filter(s => s.items.length > 0);
    }

    if (activeCategoryId === 'My Designs') {
      return [{ id: 'my-designs-sec', title: 'Your Creations', lastUpdated: Date.now(), items: [] }];
    }

    const activeCat = categories.find(c => c._id === activeCategoryId);
    if (!activeCat) return [];

    const subs = activeCat.subcategories || [];
    const sectionsFromSubs = subs.map(sub => ({
      id: sub._id,
      title: sub.name,
      items: allTemplates.filter(t => t.subcategoryId === sub._id || t.subcategoryId?._id === sub._id)
    })).filter(s => s.items.length > 0);

    if (sectionsFromSubs.length === 0) {
      return [{
        id: activeCat._id,
        title: `All in ${activeCat.name}`,
        items: allTemplates.filter(t => t.categoryId === activeCat._id || t.categoryId?._id === activeCat._id)
      }];
    }

    return sectionsFromSubs;
  }, [activeCategoryId, categories, allTemplates]);

  return (
    <div className="bg-[#f8fafc] pb-20 min-h-screen">
      {/* Search Bar Area */}
      <div className="bg-white p-3 px-4 pt-1 border-b border-[#f1f5f9]">
        <div className="bg-[#f1f5f9] -mx-4 px-4 py-2 mb-3 text-center text-[0.8rem] font-bold text-orange-700 border-b border-[#e2e8f0]">
           🙏 Support us & give 5* rating - click here! 🙏
        </div>
        <SearchBar 
          placeholder="Search Posters" 
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </div>

      {/* 3-Column Category Grid */}
      <div className="bg-white px-4 py-4 border-b border-[#f1f5f9]">
        <div className="grid grid-cols-3 gap-2 gap-y-3 mb-3">
           {categoryOptions.slice(0, 6).map((cat) => (
             <button 
               key={cat.id} 
               className={`py-2 px-1 rounded-full border text-[0.7rem] font-black transition-all shadow-sm active:scale-95 ${activeCategoryId === cat.id ? 'bg-[#1e1e1e] text-white border-transparent' : 'bg-white text-[#475569] border-[#e2e8f0]'}`}
               onClick={() => setActiveCategoryId(cat.id)}
             >
               {cat.name}
             </button>
           ))}
        </div>
        {categoryOptions.length > 6 && (
           <button className="w-[100px] py-1.5 rounded-full border border-[#e2e8f0] bg-white text-[#475569] text-[0.7rem] font-black shadow-sm active:scale-95 transition-transform">
              View More
           </button>
        )}
      </div>


      {/* Loader */}
      {isLoading && (
        <div className="p-4 space-y-4">
           {[1, 2].map(i => <div key={i} className="h-40 bg-slate-100 rounded-xl animate-pulse" />)}
        </div>
      )}

      {/* Display Sections */}
      <div className="flex flex-col gap-2">
        {displaySections.map((section) => (
          <div key={section.id} className="bg-white py-1 mb-1 shadow-sm">
            <SectionHeader 
               title={section.title} 
               showViewAll={true} 
            />
            <HorizontalScrollList>
              {section.items.map(tpl => (
                <TemplateCard 
                  key={tpl._id} 
                  template={tpl} 
                  variant="compact" 
                  onClick={() => openDetail(tpl)} 
                />
              ))}
            </HorizontalScrollList>
            {section.items.length === 0 && (
               <div className="p-10 text-center opacity-30 text-[0.7rem] font-bold text-slate-400">
                  Coming soon!
               </div>
            )}
          </div>
        ))}
        {!isLoading && displaySections.length === 0 && (
           <div className="text-center py-20 opacity-40">
              <Layers className="w-16 h-16 mx-auto mb-2 text-slate-300" />
              <p className="font-bold text-slate-400 uppercase tracking-widest text-[0.65rem]">Gallery Under Update</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default Trending;
