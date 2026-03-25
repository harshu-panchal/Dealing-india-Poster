import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { TEMPLATES } from '../utils/mockData';
import HorizontalScrollList from '../components/common/HorizontalScrollList';
import TemplateCard from '../components/posters/TemplateCard';
import SectionHeader from '../components/common/SectionHeader';
import SearchBar from '../components/common/SearchBar';
import { useEditor } from '../context/EditorContext';

const Trending = () => {
  const { openDetail } = useEditor();
  const [activeCategory, setActiveCategory] = useState('Trending');
  
  const categoryChips = [
    'My Designs', 'Trending', 'Chaitra Navratri', 'Ramnavami', 
    'Religious', 'Quotes'
  ];

  const sections = [
    { title: "Today's Special - 25 Mar (11)", items: TEMPLATES.slice(0, 8) },
    { title: "माँ कालरात्रि - 7th Chaitra Navratri (...", items: TEMPLATES.filter(t => t.category === 'Chaitra Navratri' || t.category === 'Religious').slice(0, 8) },
    { title: "Business Cards (45)", items: TEMPLATES.filter(t => t.category === 'Business Promotion').slice(0, 8) },
    { title: "Suvichar & Motivational (427)", items: TEMPLATES.filter(t => t.category === 'Quotes' || t.trending).slice(0, 8) }
  ];

  return (
    <div className="bg-[#f8fafc] pb-20">
      {/* Search Bar Area */}
      <div className="bg-white p-3 px-4 pt-1 border-b border-[#f1f5f9]">
        <div className="bg-[#f1f5f9] -mx-4 px-4 py-2 mb-3 text-center text-[0.8rem] font-bold text-[#b45309] border-b border-[#e2e8f0]">
           🙏 Support us & give 5* rating - click here! 🙏
        </div>
        <SearchBar 
          placeholder="Search Posters" 
          value=""
          onChange={(val) => console.log('Search:', val)}
        />
      </div>

      {/* 3-Column Category Grid */}
      <div className="bg-white px-4 py-4 border-b border-[#f1f5f9]">
        <div className="grid grid-cols-3 gap-2 mb-3">
           {categoryChips.map((cat, idx) => (
             <button 
               key={idx} 
               className={`py-2 px-1 rounded-full border text-[0.7rem] font-black transition-all shadow-sm active:scale-95 ${activeCategory === cat ? 'bg-[#1e1e1e] text-white border-[#1e1e1e]' : 'bg-white text-[#475569] border-[#e2e8f0]'}`}
               onClick={() => setActiveCategory(cat)}
             >
               {cat}
             </button>
           ))}
        </div>
        <button className="w-[100px] py-1.5 rounded-full border border-[#e2e8f0] bg-white text-[#475569] text-[0.7rem] font-black shadow-sm active:scale-95 transition-transform">
           View More
        </button>
      </div>

      {/* AI Profile Banner - Reference style */}
      <div className="m-4 mx-3 bg-[#4d7c0f] rounded-xl p-4 flex justify-between items-center text-white relative shadow-md">
        <div className="flex-1">
          <button className="bg-white text-[#4d7c0f] px-4 py-2 rounded-lg text-[0.8rem] font-black flex items-center gap-1.5 shadow-lg active:scale-95 transition-transform border-none">
             Make Profile Photo ↗
          </button>
        </div>
        <div className="flex gap-2 relative">
           <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&h=120&fit=crop" className="w-[45px] h-[55px] object-cover rounded-md border-2 border-white/50 bg-gray-200" alt="p1" />
           <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=100&h=120&fit=crop" className="w-[45px] h-[55px] object-cover rounded-md border-2 border-white/50 bg-gray-200" alt="p2" />
           <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&h=120&fit=crop" className="w-[45px] h-[55px] object-cover rounded-md border-2 border-white/50 bg-gray-200" alt="p3" />
        </div>
      </div>

      {/* Feed Sections */}
      <div className="flex flex-col gap-2">
        {sections.map((section, idx) => (
          <div key={idx} className="bg-white py-1 mb-1 shadow-sm">
            <SectionHeader 
               title={section.title} 
               showViewAll={true} 
            />
            <HorizontalScrollList>
              {section.items.map(tpl => (
                <TemplateCard 
                  key={tpl.id} 
                  template={tpl} 
                  variant="compact" 
                  onClick={() => openDetail(tpl)} 
                />
              ))}
            </HorizontalScrollList>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Trending;
