import React, { useState, useMemo, useCallback, useRef } from 'react';
import { 
  Layers, Plus, Trash2, Edit2, GripVertical, 
  ChevronRight, Image as ImageIcon, Search, 
  Tag, Settings, Save, MoreHorizontal, Layout, 
  Eye, Archive, RotateCcw, Zap
} from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const CategoryManager = () => {
  const [activeTab, setActiveTab] = useState('categories');
  const [expandedCat, setExpandedCat] = useState(null);
  const containerRef = useRef();

  // Entrance animations removed for immediate visibility

  // Mock categories data
  const categories = useMemo(() => [
    { 
      id: 1, 
      title: 'Business Promotion', 
      image: 'https://images.unsplash.com/photo-1460925895911-dfc9f9573f0f', 
      count: 120, 
      status: 'active',
      subcategories: [
        { id: 101, title: 'Shop Opening', count: 40 },
        { id: 102, title: 'Sale & Offers', count: 45 },
        { id: 103, title: 'New Launch', count: 35 }
      ]
    },
    { 
      id: 2, 
      title: 'Festivals', 
      image: 'https://images.unsplash.com/photo-1541336032412-2048a678540d', 
      count: 245, 
      status: 'active',
      subcategories: [
        { id: 201, title: 'Diwali', count: 120 },
        { id: 202, title: 'Holi', count: 85 },
        { id: 203, title: 'Eid', count: 40 }
      ]
    },
    { 
      id: 3, 
      title: 'Greetings', 
      image: 'https://images.unsplash.com/photo-1530103862676-fa8c9d34bb34', 
      count: 180, 
      status: 'active',
      subcategories: [
        { id: 301, title: 'Birthday', count: 100 },
        { id: 302, title: 'Anniversary', count: 45 },
        { id: 303, title: 'Wedding', count: 35 }
      ]
    }
  ], []);

  const toggleExpand = (id) => {
    setExpandedCat(prev => prev === id ? null : id);
  };

  return (
    <div ref={containerRef} className="space-y-10 pb-12">
      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div>
           <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 leading-none">Catalog Strategy</p>
           <h1 className="text-3xl font-black text-[var(--admin-text-main)] tracking-tight">Taxonomy Engine</h1>
           <p className="text-slate-400 text-xs font-semibold mt-1">Structure and regulate global content classifications</p>
        </div>
        <Button className="rounded-xl shadow-lg shadow-red-500/20 px-6 h-12">
           <Plus size={18} className="mr-2" strokeWidth={3} /> Define Category
        </Button>
      </div>

      {/* Tabs Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-6 bg-white px-6 py-3 rounded-[1.5rem] border border-slate-200 shadow-sm transition-all">
        <div className="flex gap-2 p-1 bg-white rounded-xl border border-slate-100">
          {[
            { id: 'categories', label: 'Primary Layers', icon: Layers },
            { id: 'archived', label: 'Cold Storage', icon: Archive }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.1em] transition-all border-none cursor-pointer ${activeTab === tab.id ? 'bg-white dark:bg-slate-900 shadow-sm text-[#ef4444]' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
            >
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>
        
        <div className="relative group w-[280px]">
           <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#ef4444] transition-colors" />
           <Input 
              placeholder="Search registry..." 
              className="pl-11 h-10 bg-[var(--admin-input-bg)] border-none rounded-xl text-xs"
           />
        </div>
      </div>

      {/* Category List */}
      <div className="space-y-4 max-w-5xl">
        {categories.map(cat => (
          <div key={cat.id} className="category-card group">
            <Card className={`border-none transition-all duration-300 ${expandedCat === cat.id ? 'ring-2 ring-red-500/20 shadow-xl' : 'hover:shadow-lg'}`}>
              <div 
                className="p-5 flex items-center gap-6 cursor-pointer hover:bg-[var(--admin-row-hover)] transition-colors"
                onClick={() => toggleExpand(cat.id)}
              >
                <div className="text-slate-300 group-hover:text-[#ef4444] transition-colors">
                  <GripVertical size={20} />
                </div>
                
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md ring-2 ring-white dark:ring-slate-800 shrink-0">
                     <img src={cat.image + '?q=100&w=200'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Cat" />
                  </div>
                  <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-white dark:bg-slate-900 rounded-lg flex items-center justify-center text-[#ef4444] shadow-sm">
                     <ImageIcon size={12} fill="currentColor" className="opacity-20" />
                  </div>
                </div>

                <div className="flex-1">
                   <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 tracking-tight">{cat.title}</h3>
                      <Badge variant="success" className="text-[8px] px-2 py-0.5 rounded uppercase font-black tracking-widest">{cat.status}</Badge>
                   </div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{cat.count} CONTENT ASSETS</p>
                </div>
                
                <div className="flex items-center gap-2 px-4 border-l border-slate-200">
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-[#ef4444] shadow-sm bg-white">
                    <Edit2 size={16} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-rose-50 text-slate-600 hover:text-rose-500 shadow-sm bg-white">
                    <Trash2 size={16} />
                  </Button>
                </div>

                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${expandedCat === cat.id ? 'bg-red-500 text-white rotate-90 shadow-lg shadow-red-500/20' : 'bg-slate-50 dark:bg-slate-950 text-slate-300'}`}>
                   <ChevronRight size={18} strokeWidth={3} />
                </div>
              </div>

              {/* Subcategories Expanding Section */}
              {expandedCat === cat.id && (
                <CardContent className="bg-slate-50/50 dark:bg-slate-950/20 border-t border-[var(--admin-border)] p-8 animate-in fade-in slide-in-from-top-4 duration-500">
                   <div className="flex justify-between items-center mb-6">
                      <h4 className="text-[10px] font-black text-[var(--admin-text-subtle)] uppercase tracking-[0.2em] flex items-center gap-2">
                         <Tag size={12} className="text-[#ef4444]" /> Layered Architecture: {cat.title}
                      </h4>
                      <Button variant="outline" size="sm" className="h-8 rounded-lg text-[9px] font-black uppercase tracking-widest border-slate-200 bg-white">
                         Add Extension
                      </Button>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                       {cat.subcategories.map(sub => (
                          <div key={sub.id} className="bg-[var(--admin-bg)] border border-[var(--admin-border)] p-4 rounded-2xl flex items-center justify-between group/sub transition-all hover:ring-2 hover:ring-[#ef4444]/10">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-[#ef4444] font-black text-xs group-hover/sub:bg-red-500 group-hover/sub:text-white transition-colors">
                                  {sub.title.slice(0, 2).toUpperCase()}
                               </div>
                               <div>
                                  <p className="text-xs font-black text-slate-700 dark:text-slate-300 mb-0.5">{sub.title}</p>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{sub.count} ASSETS</p>
                               </div>
                            </div>
                            <div className="flex items-center gap-2 transition-opacity">
                               <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-blue-500 transition-colors border-none bg-transparent cursor-pointer">
                                 <Edit2 size={14} />
                               </button>
                               <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-red-500 transition-colors border-none bg-transparent cursor-pointer">
                                 <Trash2 size={14} />
                               </button>
                            </div>
                         </div>
                      ))}
                   </div>
                </CardContent>
              )}
            </Card>
          </div>
        ))}
      </div>

      {/* Global Engine Settings */}
      <Card className="border-none max-w-5xl overflow-hidden detail-card">
         <CardHeader className="bg-white dark:bg-slate-900/50 border-b border-[var(--admin-border)] px-8 py-6">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-[#ef4444] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-red-500/20">
                  <Settings size={24} />
               </div>
               <div>
                  <CardTitle>System Configuration</CardTitle>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-0.5">Engine Global Rules</p>
               </div>
            </div>
         </CardHeader>

          <CardContent className="p-8 space-y-6">
            <div className="flex items-center justify-between p-6 bg-[var(--admin-bg)] rounded-[2rem] border border-[var(--admin-border)] group hover:ring-2 hover:ring-red-500/20 transition-all">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-950 flex items-center justify-center text-emerald-500 shadow-sm group-hover:scale-110 transition-transform"><Layout size={18} /></div>
                  <div>
                     <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 mb-0.5">Automated Content Auditing</h4>
                     <p className="text-xs text-slate-400 font-bold">Synchronize database registries with real-time asset counts.</p>
                  </div>
               </div>
               <div className="w-14 h-7 bg-[#ef4444] rounded-full relative shadow-inner p-1">
                  <div className="absolute right-1 top-0.5 w-6 h-6 bg-white rounded-full shadow-lg"></div>
               </div>
            </div>

            <div className="flex items-center justify-between p-6 bg-[var(--admin-bg)] rounded-[2rem] border border-[var(--admin-border)] group hover:ring-2 hover:ring-red-500/20 transition-all">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-950 flex items-center justify-center text-amber-500 shadow-sm group-hover:scale-110 transition-transform"><Zap size={18} /></div>
                  <div>
                     <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 mb-0.5">Cognitive Categorization</h4>
                     <p className="text-xs text-slate-400 font-bold">Heuristic-based subcategory suggestions for new templates.</p>
                  </div>
               </div>
                <div className="w-14 h-7 bg-slate-200 dark:bg-slate-800 rounded-full relative shadow-inner p-1 transition-colors">
                  <div className="absolute left-1 top-0.5 w-6 h-6 bg-white rounded-full shadow-lg"></div>
               </div>
            </div>
            
            <div className="pt-4 flex justify-end">
               <Button className="h-14 px-10 rounded-2xl shadow-2xl shadow-red-500/20 font-black text-xs uppercase tracking-[0.2em] gap-3">
                  <Save size={18} /> Commit Configuration
               </Button>
            </div>
         </CardContent>
      </Card>
    </div>
  );
};

export default CategoryManager;
