import React, { useState } from 'react';
import { TEMPLATES } from '../utils/mockData';
import HorizontalScrollList from '../components/common/HorizontalScrollList';
import TemplateCard from '../components/posters/TemplateCard';
import SectionHeader from '../components/common/SectionHeader';
import SearchBar from '../components/common/SearchBar';
import { useEditor } from '../context/EditorContext';

const Categories = () => {
  const { openDetail } = useEditor();
  const [searchQuery, setSearchQuery] = useState('');

  const businessSections = [
    { title: "Business Cards", count: 45, items: TEMPLATES.filter(t => t.category === 'Business Card') },
    { title: "Business Shayari", count: 32, items: TEMPLATES.filter(t => t.category === 'Business Shayari') },
    { title: "Editable Business", count: 120, items: TEMPLATES.filter(t => t.category === 'Business Promotion') },
    { title: "Udhari Reminder", count: 18, items: TEMPLATES.filter(t => t.category === 'Udhari Reminder') },
    { title: "Offer & Discounts", count: 85, items: TEMPLATES.filter(t => t.category === 'Offer & Discounts') },
    { title: "Shop Opening", count: 40, items: TEMPLATES.filter(t => t.category === 'Shop Opening') }
  ];

  return (
    <div className="bg-bg">
      {/* Search & Header */}
      <div className="p-3 px-4 bg-white sticky top-0 z-[10] shadow-sm">
        <SearchBar 
          placeholder="Search Business Posters" 
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </div>

      <div className="pt-2">
        {businessSections.map((section, idx) => (
          <div key={idx} className="bg-white py-1 mb-1 shadow-sm">
            <SectionHeader 
               title={`${section.title} (${section.count})`} 
               showViewAll={true} 
            />
            <HorizontalScrollList>
              {section.items.length > 0 ? (
                section.items.map(tpl => (
                  <TemplateCard 
                    key={tpl.id} 
                    template={tpl} 
                    variant="compact" 
                    onClick={() => openDetail(tpl)} 
                  />
                ))
              ) : (
                <div className="p-5 text-[#94a3b8] text-[0.8rem]">
                  Coming soon...
                </div>
              )}
            </HorizontalScrollList>
          </div>
        ))}
      </div>

      <div className="py-10 px-5 text-center">
        <h3 className="text-[1.2rem] text-[#1e293b] mb-2 font-bold">Grow Your Business</h3>
        <p className="text-[0.9rem] text-[#64748b]">Check back every week for new professional business templates.</p>
      </div>
    </div>
  );
};

export default Categories;
