import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Briefcase, Heart, ChevronRight, Layers } from 'lucide-react';
import HorizontalScrollList from '../components/common/HorizontalScrollList';
import TemplateCard from '../components/posters/TemplateCard';
import SectionHeader from '../components/common/SectionHeader';
import SearchBar from '../components/common/SearchBar';
import { useEditor } from '../context/EditorContext';

const Business = () => {
  const { openDetail, likedTemplates, toggleLike: globalToggleLike } = useEditor();
  const [categories, setCategories] = useState([]);
  const [allTemplates, setAllTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

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

  // "Business Cards" is a SUBCATEGORY — search inside category.subcategories arrays
  const businessCardSubcategory = useMemo(() => {
    for (const cat of categories) {
      for (const sub of (cat.subcategories || [])) {
        const n = sub.name.toLowerCase();
        if (n.includes('business card') || n.includes('businesscard') || n.includes('visiting card')) {
          return sub;
        }
      }
    }
    return null;
  }, [categories]);

  // Find the generic "business" category (not business card)
  const businessCategory = useMemo(() => {
    const list = categories || [];
    return list.find(cat =>
      (cat.name.toLowerCase() === 'business' || cat.name.toLowerCase() === 'bussiness') &&
      !cat.name.toLowerCase().includes('card')
    ) || list.find(cat =>
      cat.name.toLowerCase().includes('business') &&
      !cat.name.toLowerCase().includes('card')
    );
  }, [categories]);

  // Business card templates: matched by subcategoryId (since Business Cards is a subcategory) OR by fields
  const businessCards = useMemo(() => {
    const bcSubId = businessCardSubcategory?._id;
    return allTemplates.filter(t => {
      const subMatch = bcSubId && (t.subcategoryId?._id === bcSubId || t.subcategoryId === bcSubId);
      const hasFields = t.fields?.length > 0 || t.name?.toLowerCase().includes('business card');
      return subMatch || hasFields;
    });
  }, [allTemplates, businessCardSubcategory]);

  // Reliable "View All" for Business Cards — use subcategory type + subcategory _id
  const businessCardViewAllId = useMemo(() => {
    if (businessCardSubcategory?._id) return { type: 'subcategory', id: businessCardSubcategory._id };
    // Fallback: read subcategoryId from first visible business card template
    const firstCard = businessCards[0];
    if (!firstCard) return null;
    const subId = firstCard.subcategoryId?._id || firstCard.subcategoryId;
    if (subId) return { type: 'subcategory', id: subId };
    const catId = firstCard.categoryId?._id || firstCard.categoryId;
    if (catId) return { type: 'category', id: catId };
    return null;
  }, [businessCardSubcategory, businessCards]);

  // Only show subcategories of the business category (e.g. Visiting Cards, Letterheads, etc.)
  // Do NOT show unrelated categories like Festivals, WhatsApp Status, etc.
  const businessSubcategoryRows = useMemo(() => {
    const bcIds = new Set(businessCards.map(b => b._id));

    // Only the generic business category is a top-level source for subcategory rows
    const sourceCats = [businessCategory].filter(Boolean);

    const rows = [];

    sourceCats.forEach(cat => {
      const subcats = cat.subcategories || [];

      if (subcats.length > 0) {
        // Show each subcategory as its own row
        subcats.forEach(sub => {
          const items = allTemplates.filter(
            t => (t.subcategoryId?._id === sub._id || t.subcategoryId === sub._id) && !bcIds.has(t._id)
          );
          if (items.length > 0) {
            rows.push({ id: sub._id, title: sub.name, catId: cat._id, items });
          }
        });
      } else {
        // No subcategories — show all templates in this category as one row
        const items = allTemplates.filter(
          t => (t.categoryId?._id === cat._id || t.categoryId === cat._id) && !bcIds.has(t._id)
        );
        if (items.length > 0) {
          rows.push({ id: cat._id, title: cat.name, catId: cat._id, items });
        }
      }
    });

    return rows;
  }, [categories, allTemplates, businessCards, businessCategory]);

  // Search filter across all templates
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return allTemplates.filter(t =>
      t.title?.toLowerCase().includes(q) ||
      t.name?.toLowerCase().includes(q) ||
      t.tags?.some(tag => tag.toLowerCase().includes(q))
    );
  }, [searchQuery, allTemplates]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-10 bg-slate-100 rounded-2xl animate-pulse" />
        <div className="h-[160px] bg-slate-100 rounded-2xl animate-pulse" />
        {[1, 2, 3].map(i => (
          <div key={i} className="space-y-2">
            <div className="h-5 w-32 bg-slate-100 rounded-lg animate-pulse" />
            <div className="flex gap-3">
              {[1, 2, 3].map(j => <div key={j} className="w-28 h-28 bg-slate-100 rounded-xl animate-pulse shrink-0" />)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-24">
      {/* Sticky Search */}
      <div className="bg-white px-4 py-3 sticky top-0 z-[50] shadow-sm border-b border-slate-100">
        <SearchBar
          placeholder="Search business cards & posters"
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </div>

      {/* ── SEARCH RESULTS ── */}
      {searchQuery.trim() && (
        <div className="bg-white mt-2 py-4 shadow-sm">
          <div className="px-4 mb-3 flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-800 tracking-tight">
              Results for "{searchQuery}"
              <span className="ml-2 text-slate-400 font-bold text-xs">({searchResults.length})</span>
            </h2>
          </div>
          {searchResults.length === 0 ? (
            <div className="text-center py-10 opacity-40">
              <Layers className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No results found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 px-4">
              {searchResults.map(tpl => (
                <TemplateCard
                  key={tpl._id}
                  template={tpl}
                  variant="compact"
                  onClick={() => openDetail(tpl)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {!searchQuery.trim() && (
        <div className="pt-3 space-y-2">

          {/* 🎁 Digital Business Cards Studio Section */}
          {categories.find(c => c.name.toLowerCase().includes('business card')) && (
            <div className="bg-white py-6 mb-1 shadow-sm">
               <div className="w-full">
                 <div className="flex items-center justify-between px-4 mb-4">
                    <div className="flex flex-col">
                       <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] leading-none mb-1">Premium Studio</p>
                       <h3 className="text-xl font-black text-slate-800 tracking-tight">Digital Business Cards</h3>
                    </div>
                 </div>
                 <div className="px-4">
                   <div className="flex gap-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-2">
                     {categories.find(c => c.name.toLowerCase().includes('business card')).subcategories?.map((sub, i) => (
                        <div 
                          key={`bc-${sub._id}-${i}`} 
                          onClick={() => {
                            navigate(`/view-all/subcategory/${sub._id}`);
                          }}
                          className="min-w-[160px] w-[160px] h-[100px] rounded-2xl overflow-hidden bg-slate-900 relative cursor-pointer group shadow-lg active:scale-95 transition-all"
                        >
                           <img src={sub.image} className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" alt={sub.name} />
                           <div className="absolute inset-0 flex flex-col justify-center items-center p-3 text-center">
                              <h4 className="text-[0.8rem] font-black text-white uppercase tracking-wider">{sub.name}</h4>
                              <div className="h-0.5 w-8 bg-blue-500 mt-2 group-hover:w-12 transition-all" />
                           </div>
                        </div>
                     ))}
                   </div>
                 </div>
               </div>
            </div>
          )}

          {/* ── SECTION 1: BUSINESS CARDS (horizontal landscape scroller) ── */}
          {businessCards.length > 0 && (
            <div className="bg-white py-4 shadow-sm">
              <div className="px-4 mb-3 flex items-center justify-between">
                <div>
                  <p className="text-[0.6rem] font-black text-[#ef4444] uppercase tracking-widest mb-0.5">Featured</p>
                  <h2 className="text-[1rem] font-black text-slate-800 tracking-tight leading-none">Business Cards</h2>
                </div>
                <button
                  onClick={() => {
                    if (businessCardViewAllId) {
                      navigate(`/view-all/${businessCardViewAllId.type}/${businessCardViewAllId.id}`);
                    }
                  }}
                  className="flex items-center gap-1 text-xs font-bold text-[#ef4444] border-none bg-transparent cursor-pointer"
                >
                  View All <ChevronRight size={14} />
                </button>
              </div>

              {/* Landscape card scroller */}
              <div className="flex gap-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-4 pb-2">
                {businessCards.map(tpl => (
                  <div
                    key={tpl._id}
                    onClick={() => openDetail(tpl)}
                    className="shrink-0 w-[240px] rounded-2xl overflow-hidden shadow-md border border-slate-100 relative group cursor-pointer bg-slate-50"
                  >
                    {/* Landscape image */}
                    <div className="w-full h-[140px] relative overflow-hidden">
                      <img
                        src={tpl.image}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        alt={tpl.title || tpl.name}
                      />
                      {/* Like button */}
                      <button
                        onClick={(e) => globalToggleLike(tpl._id, e)}
                        className="absolute top-2 right-2 w-7 h-7 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow border-none cursor-pointer transition-transform active:scale-90"
                      >
                        <Heart
                          size={14}
                          className={likedTemplates.has(tpl._id) ? 'fill-red-500 text-red-500' : 'text-slate-400'}
                        />
                      </button>
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-white/90 px-3 py-1.5 rounded-xl text-[10px] font-black text-red-500 uppercase tracking-widest shadow">
                          Edit Card
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── SECTIONS 2+: Business subcategories only ── */}
          {businessSubcategoryRows.map(section => (
            <div key={section.id} className="bg-white py-4 shadow-sm">
              <div className="px-4 mb-1 flex items-center justify-between">
                <h2 className="text-[1rem] font-black text-slate-800 tracking-tight">{section.title}</h2>
                <button
                  onClick={() => navigate(`/view-all/subcategory/${section.id}`)}
                  className="flex items-center gap-1 text-xs font-bold text-[#ef4444] border-none bg-transparent cursor-pointer"
                >
                  View All <ChevronRight size={14} />
                </button>
              </div>

              {/* Horizontal compact poster scroller */}
              <HorizontalScrollList>
                {section.items.slice(0, 12).map(tpl => (
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

          {/* Empty state */}
          {businessSubcategoryRows.length === 0 && businessCards.length === 0 && (
            <div className="text-center py-24 opacity-40">
              <Briefcase className="w-16 h-16 mx-auto mb-3 text-slate-300" />
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No content yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Business;
