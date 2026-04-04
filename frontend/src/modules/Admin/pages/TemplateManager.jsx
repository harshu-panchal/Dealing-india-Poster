import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Layout, Plus, Search, Filter, Image as ImageIcon, 
  Video, Star, Trash2, Edit2, CheckCircle, Clock, 
  ChevronRight, Sparkles, Eye, BarChart3, Layers,
  RotateCcw, X, AlertCircle, Save, Trash, Archive,
  Info, ArrowLeft
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { AnimatePresence, motion } from 'framer-motion';
import AdminModal from '../components/ui/AdminModal';

const INITIAL_TEMPLATES = [
  { id: 1, title: 'Holi Dhamaka', category: 'Festivals', type: 'video', status: 'published', trending: true, usage: 1250, preview: 'https://images.unsplash.com/photo-1590076215667-873d3148f323', deleted: false },
  { id: 2, title: 'Business Growth', category: 'Business Promotion', type: 'image', status: 'published', trending: false, usage: 980, preview: 'https://images.unsplash.com/photo-1460925895911-dfc9f9573f0f', deleted: false },
  { id: 3, title: 'Morning Vibes', category: 'Greetings', type: 'image', status: 'draft', trending: false, usage: 450, preview: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9', deleted: false },
  { id: 4, title: 'Success Shayari', category: 'Motivation', type: 'video', status: 'published', trending: true, usage: 2100, preview: 'https://images.unsplash.com/photo-1552664730-d307ca884978', deleted: false },
];

const CATEGORIES = ['Business Promotion', 'Festivals', 'Greetings', 'Motivation', 'Sports', 'Education'];

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
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const fileInputRef = useRef();
  const containerRef = useRef();
  const location = useLocation();
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const initialCategory = queryParams.get('category');

  useEffect(() => {
    if (initialCategory) {
      setSearchQuery(initialCategory);
    }
  }, [initialCategory]);

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
      preview: previewUrl || formData.get('preview') || 'https://images.unsplash.com/photo-1502082553048-f009c37129b9',
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
    setSelectedFile(null);
    setPreviewUrl('');
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
    <div ref={containerRef} className="space-y-10 pb-12 overflow-x-hidden">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-4">
        <div>
           {!isTrashView ? (
              <>
                 <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 leading-none font-inter">Global Content Registry</p>
                 <h1 className="text-2xl md:text-3xl font-black text-[var(--admin-text-main)] tracking-tight">Template Marketplace</h1>
                 <p className="text-slate-400 text-xs font-semibold mt-1">Regulate and deploy digital assets across the network</p>
              </>
           ) : (
              <>
                 <button onClick={() => setIsTrashView(false)} className="flex items-center gap-2 text-red-500 font-black text-[10px] uppercase tracking-widest mb-4 hover:gap-3 transition-all border-none bg-transparent cursor-pointer">
                    <ArrowLeft size={14} strokeWidth={3} /> Return to Registry
                 </button>
                 <h1 className="text-2xl md:text-3xl font-black text-[var(--admin-text-main)] tracking-tight italic opacity-60 flex items-center gap-4">
                    Deleted Assets <Trash size={28} className="text-slate-300" />
                 </h1>
              </>
           )}
        </div>
        {!isTrashView ? (
           <div className="flex gap-4 w-full sm:w-auto">
              <Button 
                variant="ghost" 
                onClick={() => setIsTrashView(true)}
                className="flex-1 sm:flex-none rounded-xl border border-slate-200 bg-white text-slate-500 font-extrabold text-[10px] uppercase tracking-widest h-11 md:h-12 px-6"
              >
                 Trash ({stats.trash})
              </Button>
              <Button 
                onClick={() => {
                  setEditingTemplate(null);
                  setShowModal(true);
                }}
                className="flex-[1.5] sm:flex-none rounded-xl shadow-lg shadow-red-500/20 px-6 h-11 md:h-12 border-none bg-[#ef4444] text-white text-[10px] md:text-xs font-black uppercase tracking-widest"
              >
                <Plus size={16} className="mr-2" strokeWidth={3} /> Define Layout
              </Button>
           </div>
        ) : (
           <Button 
             variant="ghost" 
             onClick={() => alert('Wiping global content archive...')}
             className="rounded-xl border-2 border-rose-100 text-rose-500 font-black text-[10px] uppercase tracking-widest px-8"
           >
              Empty Global Trash
           </Button>
        )}
      </div>

      {/* Stats Quickbar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
         {[
            { label: 'Total Nodes', val: stats.total, icon: Layers, col: 'slate' },
            { label: 'Static Payloads', val: stats.image, icon: ImageIcon, col: 'blue' },
            { label: 'Motion Streams', val: stats.video, icon: Sparkles, col: 'purple' },
            { label: 'Archived Nodes', val: stats.trash, icon: Trash, col: 'rose' },
         ].map((s, i) => (
            <Card key={i} className="border-none shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 overflow-hidden group p-6">
               <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-50 flex items-center justify-center text-${s.col}-500 group-hover:bg-${s.col}-500 group-hover:text-white transition-all duration-500`}>
                     <s.icon size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                     <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest leading-none mb-1">{s.label}</p>
                     <p className="text-xl font-black text-slate-800 leading-none">{s.val}</p>
                  </div>
               </div>
            </Card>
         ))}
      </div>

      {/* Grid */}
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
                      <button 
                         onClick={(e) => { e.stopPropagation(); alert('Loading deep analytics for node...'); }}
                         className="text-[9px] font-black text-[#ef4444] uppercase tracking-widest flex items-center gap-1 border-none bg-transparent cursor-pointer hover:underline"
                       >
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
      <AdminModal
        isOpen={showModal}
        onClose={() => { 
          setShowModal(false); 
          setEditingTemplate(null); 
          setSelectedFile(null);
          setPreviewUrl('');
        }}
        title={editingTemplate ? 'Modify Component' : 'Provision Layout'}
        subtitle="Design Architecture Node"
        icon={editingTemplate ? Edit2 : Plus}
      >
        <form onSubmit={handleCreateOrUpdate} className="space-y-8">
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
             <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Asset Identity</label>
                 <Input name="title" defaultValue={editingTemplate?.title} placeholder="e.g. Premium Festive Layout" required className="h-14 rounded-xl bg-slate-50 border-none px-6 font-bold" />
             </div>
              <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Category Registry</label>
                  <div className="relative group">
                    <select 
                      name="category" 
                      defaultValue={editingTemplate?.category || CATEGORIES[0]} 
                      required 
                      className="w-full h-14 rounded-xl bg-slate-50 border-none px-6 font-bold text-sm appearance-none outline-none focus:ring-2 focus:ring-red-500/10 cursor-pointer"
                    >
                       {CATEGORIES.map(cat => (
                         <option key={cat} value={cat}>{cat}</option>
                       ))}
                    </select>
                    <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" />
                  </div>
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

           <div className="space-y-4">
               <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Layout Assets</label>
               <div 
                 className="p-10 border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/50 hover:bg-slate-100 transition-all text-center group cursor-pointer relative overflow-hidden flex flex-col items-center justify-center min-h-[160px]"
                 onClick={() => fileInputRef.current.click()}
               >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*,video/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setSelectedFile(file);
                        setPreviewUrl(URL.createObjectURL(file));
                      }
                    }}
                  />
                  
                  {(previewUrl || editingTemplate?.preview) ? (
                    <div className="absolute inset-0 group/preview">
                       <img src={previewUrl || editingTemplate?.preview} className="w-full h-full object-cover" alt="Node" />
                       <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover/preview:opacity-100 transition-opacity flex flex-col items-center justify-center">
                          <ImageIcon size={24} className="text-white mb-2" />
                          <p className="text-[10px] font-black text-white uppercase tracking-widest">Swap Interface Asset</p>
                       </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                       <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-300 mb-4 shadow-sm border border-slate-50 group-hover:scale-110 transition-transform">
                          <Plus size={32} />
                       </div>
                       <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1">Upload Interface File</p>
                       <p className="text-[9px] font-bold text-slate-400">High Res Static/Motion Graphics</p>
                    </div>
                  )}
               </div>
               
               <div className="pt-2">
                 <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] text-center mb-3">OR REMOTE PAYLOAD LINK</p>
                 <Input 
                   name="preview" 
                   defaultValue={editingTemplate?.preview} 
                   onChange={(e) => {
                     setPreviewUrl(e.target.value);
                     setSelectedFile(null);
                   }}
                   placeholder="https://unsplash.com/..." 
                   className="h-14 rounded-xl bg-slate-50 border-none px-6 font-bold text-xs" 
                 />
               </div>
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
              <Button type="button" onClick={() => setShowModal(false)} variant="ghost" className="flex-1 h-14 md:h-16 rounded-2xl bg-slate-50 font-extrabold text-[10px] uppercase tracking-[0.2em] text-slate-500 border-none">
                 Discard
              </Button>
              <Button type="submit" className="flex-[1.5] h-14 md:h-16 rounded-2xl bg-[#ef4444] text-white shadow-2xl shadow-red-500/30 font-extrabold text-[10px] uppercase tracking-[0.2em] gap-3 border-none">
                 <CheckCircle size={18} strokeWidth={3} /> {editingTemplate ? 'Commit Changes' : 'Provision Asset'}
              </Button>
           </div>
        </form>
      </AdminModal>

      {/* Delete Confirmation Modal */}
      <AdminModal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        title={isTrashView ? 'Confirm Purge?' : 'Move to Archive?'}
        subtitle="Irreversible Action"
        icon={AlertCircle}
        variant="danger"
        maxWidth="440px"
      >
        <div className="text-center">
           <p className="text-slate-400 text-xs md:text-sm font-semibold mb-8 px-2 md:px-0 font-inter">
             {isTrashView 
               ? `Are you sure you want to permanently delete "${showDeleteConfirm?.title}"? This protocol is IRREVERSIBLE.`
               : `Decommission "${showDeleteConfirm?.title}" and move to system archive?`}
           </p>

           <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={() => setShowDeleteConfirm(null)} variant="ghost" className="flex-1 h-12 rounded-xl bg-slate-100/50 font-black text-[10px] uppercase tracking-widest text-slate-500 border-none">
                Abort
              </Button>
              <Button 
                onClick={() => isTrashView ? hardDelete(showDeleteConfirm.id) : softDelete(showDeleteConfirm.id)}
                className="flex-1 h-12 rounded-xl bg-rose-600 text-white font-black text-[10px] uppercase tracking-widest border-none hover:bg-rose-700 transition-colors"
              >
                Confirm Action
              </Button>
           </div>
        </div>
      </AdminModal>
      
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
