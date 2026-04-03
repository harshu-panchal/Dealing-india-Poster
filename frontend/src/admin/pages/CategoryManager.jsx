import React, { useState, useMemo, useCallback, useRef } from 'react';
import { 
  Layers, Plus, Trash2, Edit2, GripVertical, 
  ChevronRight, Image as ImageIcon, Search, 
  Tag, Settings, Save, MoreHorizontal, Layout, 
  Eye, Archive, RotateCcw, Zap, X, CheckSquare, 
  AlertCircle
} from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { motion, AnimatePresence } from 'framer-motion';

const CategoryManager = () => {
  const [expandedCat, setExpandedCat] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCatData, setNewCatData] = useState({ title: '', image: '', type: 'all' });
  const containerRef = useRef();

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
    <div ref={containerRef} className="space-y-10 pb-12 overflow-x-hidden">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-4">
        <div>
           <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 leading-none">Management</p>
           <h1 className="text-2xl md:text-3xl font-black text-[var(--admin-text-main)] tracking-tight">Category Manager</h1>
           <p className="text-slate-400 text-xs font-semibold mt-1">Organize and manage template categories for the marketplace</p>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="w-full sm:w-auto rounded-xl shadow-lg shadow-red-500/20 px-6 h-11 md:h-12 border-none bg-[#ef4444] text-white text-[10px] md:text-xs tracking-widest uppercase font-black"
        >
           <Plus size={16} className="mr-2" strokeWidth={3} /> Add New Category
        </Button>
      </div>

      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-6 bg-white p-4 md:p-6 rounded-[1.5rem] border border-slate-200 shadow-sm transition-all lg:max-w-5xl">
        <div className="relative group w-full flex-1">
           <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#ef4444] transition-colors" />
           <Input 
              placeholder="Filter categories by name..." 
              className="pl-11 h-11 md:h-12 bg-slate-50 border-none rounded-xl text-xs font-semibold"
           />
        </div>
        <div className="flex items-center gap-3 text-slate-400 text-[10px] uppercase font-black tracking-widest px-4 border-l border-slate-100 hidden md:flex">
          <Layers size={14} /> {categories.length} Nodes
        </div>
      </div>

      {/* Category List */}
      <div className="space-y-4 max-w-5xl">
        <div className="flex items-center gap-2 mb-2 ml-1">
           <Layers size={14} className="text-[#ef4444]" />
           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Registry Categories</h4>
        </div>
        {categories.map(cat => (
          <div key={cat.id} className="category-card group">
            <Card className={`border-none transition-all duration-300 ${expandedCat === cat.id ? 'ring-2 ring-red-500/20 shadow-xl' : 'hover:shadow-lg'}`}>
              <div 
                className="p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => toggleExpand(cat.id)}
              >
                <div className="flex items-center w-full sm:w-auto gap-4">
                  <div className="text-slate-300 group-hover:text-[#ef4444] transition-colors shrink-0">
                    <GripVertical size={20} />
                  </div>
                  
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl overflow-hidden shadow-md ring-2 ring-white shrink-0 bg-slate-100">
                       <img src={cat.image + '?q=80&w=200'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={cat.title} />
                    </div>
                    <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-white rounded-lg flex items-center justify-center text-[#ef4444] shadow-sm border border-slate-50">
                       <ImageIcon size={12} fill="currentColor" className="opacity-20" />
                    </div>
                  </div>

                  <div className="flex-1">
                     <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-sm font-black text-slate-900 tracking-tight leading-none">{cat.title}</h3>
                        <Badge variant="success" className="hidden sm:inline-flex text-[8px] px-2 py-0.5 rounded uppercase font-black tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">{cat.status}</Badge>
                     </div>
                     <p className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">{cat.count} TEMPLATES</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between w-full sm:w-auto gap-2 sm:px-4 sm:border-l border-slate-200 ml-auto">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-[#ef4444] shadow-sm bg-white border border-slate-100">
                      <Edit2 size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-rose-50 text-slate-600 hover:text-rose-500 shadow-sm bg-white border border-slate-100">
                      <Trash2 size={16} />
                    </Button>
                  </div>

                  <div className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${expandedCat === cat.id ? 'bg-[#ef4444] text-white rotate-90 shadow-lg shadow-red-500/20' : 'bg-slate-50 text-slate-400'}`}>
                     <ChevronRight size={18} strokeWidth={3} />
                  </div>
                </div>
              </div>

              {/* Subcategories Expanding Section */}
              {expandedCat === cat.id && (
                <CardContent className="bg-white border-t border-slate-100 p-5 md:p-8 animate-in fade-in slide-in-from-top-4 duration-500">
                   <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                         <Tag size={12} className="text-[#ef4444]" /> Layer: {cat.title}
                      </h4>
                      <Button 
                        onClick={(e) => { e.stopPropagation(); setShowAddModal(true); }}
                        variant="outline" 
                        size="sm" 
                        className="w-full sm:w-auto h-8 rounded-lg text-[9px] font-black uppercase tracking-widest border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                      >
                         Add Subcategory
                      </Button>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                       {cat.subcategories.map(sub => (
                          <div key={sub.id} className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center justify-between group/sub transition-all hover:ring-2 hover:ring-[#ef4444]/10 hover:shadow-md">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#ef4444] font-black text-xs group-hover/sub:bg-[#ef4444] group-hover/sub:text-white transition-colors">
                                  {sub.title.slice(0, 2).toUpperCase()}
                               </div>
                               <div>
                                  <p className="text-xs font-black text-slate-800 mb-0.5">{sub.title}</p>
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

      {/* Save Action */}
      <div className="flex justify-end max-w-5xl">
         <Button 
            className="w-full sm:w-auto h-14 md:px-10 rounded-2xl shadow-xl shadow-red-500/20 font-black text-[10px] md:text-xs uppercase tracking-[0.2em] gap-3 border-none bg-[#ef4444] text-white hover:bg-red-600 transition-all font-inter"
         >
            <Save size={18} /> Save Registry Changes
         </Button>
      </div>

      {/* Add Category Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" 
              onClick={() => setShowAddModal(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="relative w-full max-w-[600px] max-h-[90vh] bg-white rounded-[2rem] md:rounded-[3.5rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col"
            >
               <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                  <Layers size={210} className="text-[#ef4444]" />
               </div>

               <div className="flex items-center justify-between p-8 md:p-12 pb-6 md:pb-8 border-b border-slate-50 relative z-10 bg-white">
                  <div className="flex items-center gap-4 md:gap-6">
                     <div className="w-12 h-12 md:w-16 md:h-16 bg-[#ef4444] rounded-[1.25rem] md:rounded-2xl flex items-center justify-center shadow-2xl shadow-red-500/30 text-white shrink-0">
                        <Plus size={24} className="md:size-7" strokeWidth={3} />
                     </div>
                     <div>
                        <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Add New Category</h2>
                        <p className="text-slate-400 text-[9px] md:text-[10px] font-bold uppercase tracking-widest mt-1">Setup category metadata</p>
                     </div>
                  </div>
                  <button onClick={() => setShowAddModal(false)} className="w-10 h-10 md:w-12 md:h-12 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-400 border-none bg-transparent cursor-pointer transition-colors relative z-20">
                    <X size={20} className="md:size-6" />
                  </button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-8 md:p-12 pt-6 md:pt-8 custom-scrollbar relative z-10">
                  <div className="space-y-8">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Category Title</label>
                        <Input 
                          placeholder="e.g. Political Campaigning" 
                          className="h-14 md:h-16 rounded-xl bg-slate-50 border-none px-6 font-bold"
                          value={newCatData.title}
                          onChange={(e) => setNewCatData({...newCatData, title: e.target.value})}
                        />
                     </div>

                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Cover Image URL</label>
                        <Input 
                          placeholder="https://images.unsplash.com/..." 
                          className="h-14 md:h-16 rounded-xl bg-slate-50 border-none px-6 font-bold"
                          value={newCatData.image}
                          onChange={(e) => setNewCatData({...newCatData, image: e.target.value})}
                        />
                     </div>

                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">ContentType Scope</label>
                        <div className="grid grid-cols-3 gap-3">
                           {['post', 'reel', 'all'].map(type => (
                              <button
                                 key={type}
                                 onClick={() => setNewCatData({...newCatData, type})}
                                 className={`h-14 md:h-16 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border-none cursor-pointer flex items-center justify-center gap-2 ${newCatData.type === type ? 'bg-[#ef4444] text-white shadow-lg shadow-red-500/20' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                              >
                                 {newCatData.type === type && <CheckSquare size={12} />}
                                 {type}
                              </button>
                           ))}
                        </div>
                     </div>

                     <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
                        <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
                        <div>
                           <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1">Warning</p>
                           <p className="text-[0.65rem] font-bold text-amber-600 leading-relaxed uppercase">Creating a new category will make it visible to all app users immediately.</p>
                        </div>
                     </div>

                     <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Button 
                           variant="ghost"
                           onClick={() => setShowAddModal(false)}
                           className="flex-1 h-14 md:h-16 rounded-2xl bg-slate-50 font-extrabold text-[10px] uppercase tracking-[0.2em] text-slate-500 border-none"
                        >
                           Discard
                        </Button>
                        <Button 
                          onClick={() => {
                            // In a real app, this would hit the API
                            setShowAddModal(false);
                            setNewCatData({ title: '', image: '', type: 'all' });
                          }}
                          className="flex-[1.5] h-14 md:h-16 rounded-2xl bg-[#ef4444] text-white shadow-2xl shadow-red-500/30 font-extrabold text-[10px] uppercase tracking-[0.2em] gap-3 border-none"
                        >
                           Create Category
                        </Button>
                     </div>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CategoryManager;
