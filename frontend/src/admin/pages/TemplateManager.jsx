import React, { useMemo, useState, useRef } from 'react';
import { 
  Layout, Plus, Search, Filter, Image as ImageIcon, 
  Video, Star, Trash2, Edit2, CheckCircle, Clock, 
  ChevronRight, Sparkles, Eye, BarChart3, Layers
} from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const TemplateManager = () => {
  const [activeType, setActiveType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef();

  // Entrance animations removed for immediate visibility

  // Mock template data
  const templates = useMemo(() => [
    { id: 1, title: 'Holi Dhamaka', category: 'Festivals', type: 'video', status: 'published', trending: true, usage: 1250, preview: 'https://images.unsplash.com/photo-1590076215667-873d3148f323' },
    { id: 2, title: 'Business Growth', category: 'Business', type: 'image', status: 'published', trending: false, usage: 980, preview: 'https://images.unsplash.com/photo-1460925895911-dfc9f9573f0f' },
    { id: 3, title: 'Morning Vibes', category: 'Greetings', type: 'image', status: 'draft', trending: false, usage: 450, preview: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9' },
    { id: 4, title: 'Success Shayari', category: 'Motivation', type: 'video', status: 'published', trending: true, usage: 2100, preview: 'https://images.unsplash.com/photo-1552664730-d307ca884978' },
  ], []);

  const filteredTemplates = useMemo(() => {
    return templates.filter(t => 
       (activeType === 'all' || t.type === activeType) &&
       (t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        t.category.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [templates, activeType, searchQuery]);

  return (
    <div ref={containerRef} className="space-y-10 pb-12">
      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div>
           <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 leading-none">Creative Assets</p>
           <h1 className="text-3xl font-black text-[var(--admin-text-main)] tracking-tight">Template Engine</h1>
           <p className="text-slate-400 text-xs font-semibold mt-1">Provision and refine scalable design architecture</p>
        </div>
        <Button className="rounded-xl shadow-lg shadow-red-500/20 px-6 h-12">
           <Plus size={18} className="mr-2" strokeWidth={3} /> Define Layout
        </Button>
      </div>

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTemplates.map(tpl => (
          <div key={tpl.id} className="template-card group">
            <Card className="border-none overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group-hover:ring-2 group-hover:ring-red-500/20">
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
                    <Button variant="outline" size="icon" className="h-12 w-12 rounded-[1.25rem] bg-white text-[#ef4444] border-none shadow-2xl hover:scale-110 transition-transform">
                       <Edit2 size={20} />
                    </Button>
                    <Button variant="outline" size="icon" className="h-12 w-12 rounded-[1.25rem] bg-white text-rose-500 border-none shadow-2xl hover:scale-110 transition-transform">
                       <Trash2 size={20} />
                    </Button>
                 </div>
              </div>

              <div className="p-6 space-y-4">
                 <div className="flex justify-between items-start">
                    <div>
                        <h4 className="font-black text-sm text-[var(--admin-text-main)] tracking-tight mb-1">{tpl.title}</h4>
                        <p className="text-[10px] font-black text-[var(--admin-text-subtle)] uppercase tracking-widest leading-none">{tpl.category}</p>
                     </div>
                    <Badge variant={tpl.status === 'published' ? 'success' : 'secondary'} className="text-[8px] font-black tracking-widest px-2 py-0.5 uppercase">
                       {tpl.status}
                    </Badge>
                 </div>

                  <div className="flex items-center justify-between pt-4 border-t border-[var(--admin-border)]">
                     <div className="flex items-center gap-1.5 text-[10px] font-black text-[var(--admin-text-subtle)] uppercase tracking-widest">
                        <BarChart3 size={12} className="text-[#ef4444]" /> {tpl.usage.toLocaleString()} NODES
                     </div>
                    <button className="text-[9px] font-black text-[#ef4444] uppercase tracking-widest flex items-center gap-1 border-none bg-transparent cursor-pointer hover:underline">
                       ANALYTICS <ChevronRight size={10} />
                    </button>
                 </div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* Designer Call to Action */}
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
            
            <Button className="h-20 px-16 rounded-[2.5rem] shadow-2xl shadow-red-500/30 font-black text-[11px] uppercase tracking-[0.25em] w-full max-w-md gap-4 bg-[#ef4444] hover:bg-[#d93434] transition-all hover:scale-[1.02] active:scale-[0.98]">
               <Sparkles size={20} strokeWidth={3} /> Provision Designer
            </Button>
            
            <p className="mt-8 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Authorized Ops Node Access Required</p>
         </div>
      </Card>
    </div>
  );
};

export default TemplateManager;
