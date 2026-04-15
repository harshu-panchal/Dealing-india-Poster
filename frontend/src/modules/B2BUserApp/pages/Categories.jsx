import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import HorizontalScrollList from '../components/common/HorizontalScrollList';
import TemplateCard from '../components/posters/TemplateCard';
import SectionHeader from '../components/common/SectionHeader';
import SearchBar from '../components/common/SearchBar';
import { useEditor } from '../context/EditorContext';

const Categories = () => {
  const { openDetail } = useEditor();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [allTemplates, setAllTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data: catData } = await axios.get(`${API_URL}/user/categories`);
      setCategories(catData);

      const { data: tplData } = await axios.get(`${API_URL}/user/templates?limit=1000`);
      setAllTemplates(tplData.templates);
    } catch (error) {
      console.error('Fetch categories error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Find the Business category (handle typos like "Bussiness")
  const businessCategory = useMemo(() => {
    return categories.find(cat => 
      cat.name.toLowerCase().includes('business') || 
      cat.name.toLowerCase().includes('bussiness')
    );
  }, [categories]);

  const dynamicSections = useMemo(() => {
    if (!businessCategory || !businessCategory.subcategories) return [];
    
    return businessCategory.subcategories.map(sub => ({
      id: sub._id,
      title: sub.name,
      count: allTemplates.filter(t => (t.subcategoryId === sub._id || t.subcategoryId?._id === sub._id)).length,
      items: allTemplates.filter(t => (t.subcategoryId === sub._id || t.subcategoryId?._id === sub._id))
    })).filter(section => section.items.length > 0);
  }, [businessCategory, allTemplates]);

  const filteredSections = useMemo(() => {
    if (!searchQuery) return dynamicSections;
    return dynamicSections.filter(s => 
      s.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [dynamicSections, searchQuery]);

  return (
    <div className="bg-bg min-h-screen">
      {/* Search & Header */}
      <div className="p-3 px-4 bg-white sticky top-0 z-[10] shadow-sm">
        <SearchBar 
          placeholder="Search Business Posters" 
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </div>

      <div className="pt-2">
        {isLoading ? (
          <div className="p-10 text-center">
             <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
             <p className="text-gray-400 text-sm font-bold animate-pulse uppercase tracking-widest">Loading Business Content...</p>
          </div>
        ) : !businessCategory ? (
          <div className="py-20 text-center px-10">
             <div className="text-4xl mb-4">🏬</div>
             <p className="text-gray-500 font-bold">No 'Business' category found.</p>
             <p className="text-gray-400 text-xs mt-1">Please ensure a category containing "Business" in its name exists in the Admin panel.</p>
          </div>
        ) : filteredSections.length > 0 ? (
          filteredSections.map((section, index) => {
            // Pick 1-2 random templates from this section to showcase as full cards after the slider
            const featureTemplates = section.items.slice(0, 2);

            return (
              <React.Fragment key={section.id}>
                <div className="bg-white py-1 mb-1 shadow-sm">
                  <SectionHeader 
                     title={`${section.title} (${section.count})`} 
                     showViewAll={true} 
                     onViewAll={() => navigate(`/category/${section.id}?type=subcategory`)}
                  />
                  {/* Tablet & Desktop Grid View */}
                  <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6 px-6 py-6 pb-10">
                    {section.items.map(tpl => (
                      <TemplateCard 
                        key={tpl._id} 
                        template={tpl} 
                        variant="regular" 
                        onClick={() => openDetail(tpl)} 
                      />
                    ))}
                  </div>

                  {/* Mobile Slider View */}
                  <div className="md:hidden">
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
                  </div>
                </div>

                {/* Standalone cards between sliders - Mobile Only */}
                {featureTemplates.length > 0 && (
                  <div className="bg-white p-4 mb-1 space-y-4 md:hidden">
                    {featureTemplates.map((tpl, i) => (
                      <div key={`feat-${tpl._id}-${i}`} className="relative">
                        <div className="flex items-center gap-2 mb-2">
                           <div className="w-1 h-4 bg-red-500 rounded-full" />
                           <span className="text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest">Recommended {section.title}</span>
                        </div>
                        <TemplateCard 
                          template={tpl} 
                          variant="regular" 
                          onClick={() => openDetail(tpl)} 
                        />
                      </div>
                    ))}
                  </div>
                )}
              </React.Fragment>
            );
          })
        ) : (
          <div className="py-20 text-center opacity-40">
             <div className="text-4xl mb-4">🏗️</div>
             <p className="text-gray-500 font-black uppercase tracking-widest text-xs">No matching subcategories found</p>
          </div>
        )}
      </div>

      {!isLoading && businessCategory && (
        <div className="py-10 px-5 text-center">
          <h3 className="text-[1.2rem] text-[#1e293b] mb-2 font-bold">Grow Your {businessCategory.name}</h3>
          <p className="text-[0.9rem] text-[#64748b]">Check back every week for new professional business templates.</p>
        </div>
      )}
    </div>
  );
};

export default Categories;
