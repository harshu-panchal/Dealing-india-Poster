import React, { useMemo, useState, useRef, useEffect } from 'react';
import { 
  Layout, Plus, Search, Filter, Image as ImageIcon, 
  Video, Star, Trash2, Edit2, CheckCircle, Clock, 
  ChevronRight, Sparkles, Eye, BarChart3, Layers,
  RotateCcw, X, AlertCircle, Save, Trash, Archive,
  Info, ArrowLeft
} from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { AnimatePresence, motion } from 'framer-motion';

const INITIAL_TEMPLATES = [
  { id: 1, title: 'Holi Dhamaka', category: 'Festivals', type: 'video', status: 'published', trending: true, usage: 1250, preview: 'https://images.unsplash.com/photo-1590076215667-873d3148f323', deleted: false },
  { id: 2, title: 'Business Growth', category: 'Business', type: 'image', status: 'published', trending: false, usage: 980, preview: 'https://images.unsplash.com/photo-1460925895911-dfc9f9573f0f', deleted: false },
  { id: 3, title: 'Morning Vibes', category: 'Greetings', type: 'image', status: 'draft', trending: false, usage: 450, preview: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9', deleted: false },
  { id: 4, title: 'Success Shayari', category: 'Motivation', type: 'video', status: 'published', trending: true, usage: 2100, preview: 'https://images.unsplash.com/photo-1552664730-d307ca884978', deleted: false },
];

const TemplateManager = () => {
  const [templates, setTemplates] = useState(() => {
    const saved = localStorage.getItem('admin_templates');
    return saved ? JSON.parse(saved) : INITIAL_TEMPLATES;
  });
  const [activeType, setActiveType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTrashView, setIsTrashView] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const containerRef = useRef();

  useEffect(() => {
    localStorage.setItem('admin_templates', JSON.stringify(templates));
  }, [templates]);

  const filteredTemplates = useMemo(() => {
    return templates.filter(t => 
       t.deleted === isTrashView &&
       (activeType === 'all' || t.type === activeType) &&
       (t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        t.category.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [templates, activeType, searchQuery, isTrashView]);

  const stats = useMemo(() => {
    const active = templates.filter(t => !t.deleted);
    return {
      total: active.length,
      image: active.filter(t => t.type === 'image').length,
      video: active.filter(t => t.type === 'video').length,
      trash: templates.filter(t => t.deleted).length
    };
  }, [templates]);

  const handleCreateOrUpdate = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      title: formData.get('title'),
      category: formData.get('category'),
      type: formData.get('type'),
      status: formData.get('status'),
      preview: formData.get('preview') || 'https://images.unsplash.com/photo-1502082553048-f009c37129b9',
      trending: formData.get('trending') === 'true',
    };

    if (editingTemplate) {
      setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? { ...t, ...data } : t));
    } else {
      const newTemplate = {
        ...data,
        id: Date.now(),
        usage: 0,
        deleted: false
      };
      setTemplates(prev => [newTemplate, ...prev]);
    }
    setShowModal(false);
    setEditingTemplate(null);
  };

  const softDelete = (id) => {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, deleted: true, deletedAt: new Date().toISOString() } : t));
    setShowDeleteConfirm(null);
  };

  const hardDelete = (id) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    setShowDeleteConfirm(null);
  };

  const restore = (id) => {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, deleted: false, deletedAt: null } : t));
  };

  return (
    <div ref={containerRef} className="space-y-10 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-4">
        <div>
           <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 leading-none">Creative Assets</p>
           <h1 className="text-2xl md:text-3xl font-black text-[var(--admin-text-main)] tracking-tight">
             {isTrashView ? 'Template Archive' : 'Template Engine'}
           </h1>
           <p className="text-slate-400 text-[10px] md:text-xs font-semibold mt-1 max-w-[280px] sm:max-w-none">
             {isTrashView ? 'Review and restore decommissioned design assets' : 'Provision and refine scalable design architecture'}
           </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={() => setIsTrashView(!isTrashView)}
            className={`w-full sm:w-auto rounded-xl px-4 md:px-6 h-11 md:h-12 transition-all gap-2 border-slate-200 text-[10px] md:text-xs font-black uppercase tracking-widest ${isTrashView ? 'bg-slate-900 text-white border-slate-900' : ''}`}
          >
             {isTrashView ? <ArrowLeft size={16} /> : <Trash2 size={16} />}
             {isTrashView ? 'Active Assets' : `Archive (${stats.trash})`}
          </Button>
          {!isTrashView && (
            <Button 
              onClick={() => { setEditingTemplate(null); setShowModal(true); }}
              className="w-full sm:w-auto rounded-xl shadow-lg shadow-red-500/20 px-4 md:px-6 h-11 md:h-12 bg-[#ef4444] hover:bg-[#d93434] text-white border-none text-[10px] md:text-xs font-black uppercase tracking-widest"
            >
               <Plus size={16} className="mr-1 md:mr-2" strokeWidth={3} /> Define Layout
            </Button>
          )}
        </div>
      </div>

      {/* Stats Quick Grid */}
      {!isTrashView && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Synchronized Nodes', value: stats.total, icon: Layers, color: 'text-blue-500', bg: 'bg-blue-50' },
            { label: 'Raster Assets', value: stats.image, icon: ImageIcon, color: 'text-emerald-500', bg: 'bg-emerald-50' },
            { label: 'Motion Proxies', value: stats.video, icon: Video, color: 'text-[#ef4444]', bg: 'bg-red-50' }
          ].map((stat, i) => (
            <Card key={i} className="border-none group overflow-hidden bg-white">
              <div className="p-6 flex items-center gap-5">
                <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center shadow-sm`}>
                   <stat.icon size={24} />
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                   <h3 className="text-2xl font-black text-slate-800 tracking-tight">{stat.value}</h3>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-6 bg-white dark:bg-slate-900/50 px-6 py-3 rounded-[1.5rem] border border-[var(--admin-border)] shadow-sm">
         <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl">
          {['all', 'image', 'video'].map(type => (
            <button 
              key={type}
              onClick={() => setActiveType(type)}
              className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.1em] transition-all border-none cursor-pointer ${activeType === type ? 'bg-white dark:bg-slate-900 shadow-sm text-[#ef4444]' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
            >
              {type}
            </button>
          ))}
        </div>
        
        <div className="flex-1 max-w-[400px] relative group">
           <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#ef4444] transition-colors" />
            <Input 
               placeholder="Search registry..." 
               className="pl-11 h-10 bg-[var(--admin-input-bg)] border-none rounded-xl text-xs"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
           />
        </div>
      </div>

      {/* Template Grid */}
      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTemplates.map(tpl => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              key={tpl.id} 
              className="template-card group"
            >
              <Card className="border-none overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group-hover:ring-2 group-hover:ring-red-500/20 bg-white">
                <div className="aspect-[4/5] relative overflow-hidden bg-slate-100 dark:bg-slate-950">
                   <img src={tpl.preview + '?q=100&w=600'} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Tpl" />
                   
                   <div className="absolute top-4 left-4 flex flex-col gap-2">
                      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur rounded-xl p-2 shadow-xl ring-1 ring-white/20">
                         {tpl.type === 'video' ? <Video size={16} className="text-[#ef4444]" /> : <ImageIcon size={16} className="text-blue-500" />}
                      </div>
                      {tpl.trending && (
                         <div className="bg-amber-400 text-white p-2 rounded-xl shadow-xl ring-1 ring-amber-500/20 animate-pulse">
                            <Sparkles size={16} fill="currentColor" />
                         </div>
                      )}
                   </div>

                   <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-[2px] flex items-center justify-center gap-3">
                      {isTrashView ? (
                        <>
                          <Button 
                            onClick={() => restore(tpl.id)}
                            variant="outline" size="icon" className="h-12 w-12 rounded-[1.25rem] bg-emerald-500 text-white border-none shadow-2xl hover:scale-110 transition-transform"
                          >
                             <RotateCcw size={20} />
                          </Button>
                          <Button 
                            onClick={() => setShowDeleteConfirm(tpl)}
                            variant="outline" size="icon" className="h-12 w-12 rounded-[1.25rem] bg-rose-600 text-white border-none shadow-2xl hover:scale-110 transition-transform"
                          >
                             <Trash size={20} />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button 
                            onClick={() => { setEditingTemplate(tpl); setShowModal(true); }}
                            variant="outline" size="icon" className="h-12 w-12 rounded-[1.25rem] bg-white text-[#ef4444] border-none shadow-2xl hover:scale-110 transition-transform"
                          >
                             <Edit2 size={20} />
                          </Button>
                          <Button 
                            onClick={() => setShowDeleteConfirm(tpl)}
                            variant="outline" size="icon" className="h-12 w-12 rounded-[1.25rem] bg-white text-rose-500 border-none shadow-2xl hover:scale-110 transition-transform"
                          >
                             <Trash2 size={20} />
                          </Button>
                        </>
                      )}
                   </div>
                </div>

                <div className="p-6 space-y-4">
                   <div className="flex justify-between items-start">
                      <div>
                          <h4 className="font-black text-sm text-slate-800 tracking-tight mb-1">{tpl.title}</h4>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{tpl.category}</p>
                       </div>
                      <Badge variant={tpl.status === 'published' ? 'success' : 'secondary'} className="text-[8px] font-black tracking-widest px-2 py-0.5 uppercase">
                         {tpl.status}
                      </Badge>
                   </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                       <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <BarChart3 size={12} className="text-[#ef4444]" /> {tpl.usage.toLocaleString()} NODES
                       </div>
                      <button className="text-[9px] font-black text-[#ef4444] uppercase tracking-widest flex items-center gap-1 border-none bg-transparent cursor-pointer hover:underline">
                         ANALYTICS <ChevronRight size={10} />
                      </button>
                   </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="border-none bg-white p-20 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-300 mb-6">
               {isTrashView ? <Archive size={40} /> : <Search size={40} />}
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">
              {isTrashView ? 'Archive Registry Empty' : 'No Results Found'}
            </h3>
            <p className="text-slate-400 text-sm font-semibold max-w-xs">
              {isTrashView ? 'No decommissioned assets currently registered in the system.' : 'Try adjusting your search or filters to find specific assets.'}
            </p>
            {isTrashView && (
              <Button 
                onClick={() => setIsTrashView(false)}
                variant="ghost" className="mt-8 text-[10px] font-black uppercase tracking-widest text-[#ef4444]"
              >
                Return to Active Registry
              </Button>
            )}
        </Card>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" 
              onClick={() => setShowModal(false)}
            />
            <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 30 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 30 }}
               className="relative w-full max-w-[640px] max-h-[90vh] bg-white rounded-[2rem] md:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col"
            >
               <div className="flex items-center justify-between p-8 md:p-12 pb-6 md:pb-8 border-b border-slate-50">
                  <div className="flex items-center gap-4 md:gap-6">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-red-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-red-500/30 text-white shrink-0">
                       {editingTemplate ? <Edit2 size={24} className="md:size-7" /> : <Plus size={24} className="md:size-7" strokeWidth={2.5} />}
                    </div>
                    <div>
                       <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
                         {editingTemplate ? 'Modify Component' : 'Provision Layout'}
                       </h2>
                       <p className="text-slate-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest mt-1">Design Architecture Node</p>
                    </div>
                  </div>
                  <button onClick={() => setShowModal(false)} className="w-10 h-10 md:w-12 md:h-12 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-400 border-none bg-transparent cursor-pointer transition-colors">
                    <X size={20} className="md:size-6" />
                  </button>
               </div>

               <div className="flex-1 overflow-y-auto p-8 md:p-12 pt-6 md:pt-8 custom-scrollbar">
                 <form onSubmit={handleCreateOrUpdate} className="space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                      <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Asset Identity</label>
                          <Input name="title" defaultValue={editingTemplate?.title} placeholder="e.g. Premium Festive Layout" required className="h-14 rounded-xl bg-slate-50 border-none px-6 font-bold" />
                      </div>
                      <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Category Registry</label>
                          <Input name="category" defaultValue={editingTemplate?.category} placeholder="e.g. Festivals, Business" required className="h-14 rounded-xl bg-slate-50 border-none px-6 font-bold" />
                      </div>
                      <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Asset Type</label>
                          <div className="relative group">
                            <select name="type" defaultValue={editingTemplate?.type || 'image'} className="w-full h-14 rounded-xl bg-slate-50 border-none px-6 font-bold text-sm appearance-none outline-none focus:ring-2 focus:ring-red-500/10 cursor-pointer">
                               <option value="image">Static Image</option>
                               <option value="video">Motion Graphics</option>
                            </select>
                            <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" />
                          </div>
                      </div>
                      <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Production Status</label>
                          <div className="relative group">
                            <select name="status" defaultValue={editingTemplate?.status || 'published'} className="w-full h-14 rounded-xl bg-slate-50 border-none px-6 font-bold text-sm appearance-none outline-none focus:ring-2 focus:ring-red-500/10 cursor-pointer">
                               <option value="published">Deployed (Published)</option>
                               <option value="draft">Staging (Draft)</option>
                            </select>
                            <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" />
                          </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Preview Interface URL</label>
                        <Input name="preview" defaultValue={editingTemplate?.preview} placeholder="https://unsplash.com/..." className="h-14 rounded-xl bg-slate-50 border-none px-6 font-bold text-xs" />
                    </div>

                    <div className="flex items-center gap-4 bg-slate-50 p-6 rounded-[1.5rem]">
                        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
                           <Sparkles size={20} />
                        </div>
                        <div className="flex-1">
                           <h4 className="text-xs font-black text-slate-800">Priority Propagation</h4>
                           <p className="text-[10px] text-slate-400 font-bold">Inject into trending global feeds</p>
                        </div>
                        <select name="trending" defaultValue={String(editingTemplate?.trending || false)} className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase outline-none cursor-pointer">
                           <option value="false">Standard</option>
                           <option value="true">Trending</option>
                        </select>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                       <Button type="button" onClick={() => setShowModal(false)} variant="ghost" className="flex-1 h-14 md:h-16 rounded-2xl bg-slate-50 font-extrabold text-[10px] uppercase tracking-[0.2em] text-slate-500">
                          Discard
                       </Button>
                       <Button type="submit" className="flex-[1.5] h-14 md:h-16 rounded-2xl bg-[#ef4444] text-white shadow-2xl shadow-red-500/30 font-extrabold text-[10px] uppercase tracking-[0.2em] gap-3 border-none">
                          <CheckCircle size={18} strokeWidth={3} /> {editingTemplate ? 'Commit Changes' : 'Provision Asset'}
                       </Button>
                    </div>
                 </form>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" 
               onClick={() => setShowDeleteConfirm(null)}
            />
            <motion.div 
               initial={{ scale: 1.1, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.1, opacity: 0 }}
               className="relative w-full max-w-[440px] bg-white rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-10 text-center shadow-2xl overflow-hidden"
            >
               <div className="w-16 h-16 md:w-20 md:h-20 bg-rose-50 text-rose-500 rounded-2xl md:rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                  <AlertCircle size={32} className="md:size-10" />
               </div>
               <h3 className="text-lg md:text-xl font-black text-slate-800 mb-2">Confirm Action</h3>
               <p className="text-slate-400 text-xs md:text-sm font-semibold mb-8 px-2 md:px-0">
                 {isTrashView 
                   ? `Are you sure you want to permanently delete "${showDeleteConfirm.title}"? This protocol is IRREVERSIBLE.`
                   : `Decommission "${showDeleteConfirm.title}" and move to system archive?`}
               </p>
               <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={() => setShowDeleteConfirm(null)} variant="ghost" className="flex-1 h-12 rounded-xl bg-slate-100/50 font-black text-[10px] uppercase tracking-widest text-slate-500">
                    Abort
                  </Button>
                  <Button 
                    onClick={() => isTrashView ? hardDelete(showDeleteConfirm.id) : softDelete(showDeleteConfirm.id)}
                    className="flex-1 h-12 rounded-xl bg-rose-600 text-white font-black text-[10px] uppercase tracking-widest border-none hover:bg-rose-700 transition-colors"
                  >
                    Confirm Action
                  </Button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Designer Call to Action */}
      {!isTrashView && stats.total > 0 && (
        <Card className="border-none max-w-4xl mx-auto bg-white rounded-[3rem] p-16 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none translate-x-12 -translate-y-12 rotate-12 transition-transform duration-700 group-hover:scale-110">
              <Layers size={320} className="text-[#ef4444]" />
           </div>
           
           <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-red-50 rounded-[2.5rem] flex items-center justify-center text-[#ef4444] mb-10 shadow-sm border border-red-100/50 transition-all duration-500 group-hover:rotate-6">
                 <Layout size={44} strokeWidth={2.5} />
              </div>
              
              <h2 className="text-4xl font-black text-slate-800 tracking-tight mb-4">Architect Dynamic Systems</h2>
              <p className="text-slate-500 text-sm font-semibold mb-12 max-w-[460px] leading-relaxed">
                 Propagate your engineered layouts across the global Dealing India Poster network with real-time asset synchronization.
              </p>
              
              <Button 
                onClick={() => { setEditingTemplate(null); setShowModal(true); }}
                className="h-20 px-16 rounded-[2.5rem] shadow-2xl shadow-red-500/30 font-black text-[11px] uppercase tracking-[0.25em] w-full max-w-md gap-4 bg-[#ef4444] hover:bg-[#d93434] transition-all hover:scale-[1.02] active:scale-[0.98] border-none"
              >
                 <Sparkles size={20} strokeWidth={3} /> Provision Designer
              </Button>
              
              <p className="mt-8 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Authorized Ops Node Access Required</p>
           </div>
        </Card>
      )}
    </div>
  );
};

export default TemplateManager;

