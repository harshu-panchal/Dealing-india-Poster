import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Layout, Plus, Search, Filter, Image as ImageIcon, 
  Video, Star, Trash2, Edit2, CheckCircle, Clock, 
  ChevronRight, Sparkles, Eye, BarChart3, Layers,
  RotateCcw, X, AlertCircle, Save, Trash, Archive,
  Info, ArrowLeft, Maximize, Palette
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { AnimatePresence, motion } from 'framer-motion';
import AdminModal from '../components/ui/AdminModal';

const INITIAL_FRAMES = [
  { id: 1, title: 'Festive Orange', type: 'footer', status: 'published', usage: 4500, preview: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=200&auto=format&fit=crop', priceType: 'free' },
  { id: 2, title: 'Deep Professional', type: 'footer', status: 'published', usage: 2800, preview: 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=200&auto=format&fit=crop', priceType: 'premium' },
  { id: 3, title: 'Glassmorphism', type: 'footer', status: 'published', usage: 2100, preview: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop', priceType: 'free' },
  { id: 4, title: 'Modern Indigo', type: 'footer', status: 'published', usage: 1200, preview: 'https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?q=80&w=200&auto=format&fit=crop', priceType: 'premium' },
];

const FrameManager = () => {
  const [frames, setFrames] = useState(() => {
    const saved = localStorage.getItem('admin_frames');
    return saved ? JSON.parse(saved) : INITIAL_FRAMES;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingFrame, setEditingFrame] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const fileInputRef = useRef();
  
  useEffect(() => {
    localStorage.setItem('admin_frames', JSON.stringify(frames));
  }, [frames]);

  const filteredFrames = useMemo(() => {
    return frames.filter(f => 
       f.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
       f.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [frames, searchQuery]);

  const handleCreateOrUpdate = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      title: formData.get('title'),
      type: formData.get('type'),
      status: formData.get('status'),
      priceType: formData.get('priceType'),
      preview: previewUrl || formData.get('preview') || 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400',
    };

    if (editingFrame) {
      setFrames(prev => prev.map(f => f.id === editingFrame.id ? { ...f, ...data } : f));
    } else {
      const newFrame = {
        ...data,
        id: Date.now(),
        usage: 0,
        deleted: false
      };
      setFrames(prev => [newFrame, ...prev]);
    }
    setShowModal(false);
    setEditingFrame(null);
    setSelectedFile(null);
    setPreviewUrl('');
  };

  const handleDelete = (id) => {
    setFrames(prev => prev.filter(f => f.id !== id));
    setShowDeleteConfirm(null);
  };

  return (
    <div className="space-y-10 pb-12 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
           <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 leading-none">Aesthetic Layout System</p>
           <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Frame Registry</h1>
           <p className="text-slate-400 text-xs font-semibold mt-1">Manage global user-detail overlays and footer architectures</p>
        </div>
        <Button 
          onClick={() => {
            setEditingFrame(null);
            setShowModal(true);
          }}
          className="rounded-xl shadow-lg shadow-red-500/20 px-6 h-12 border-none bg-[#ef4444] text-white text-xs font-black uppercase tracking-widest"
        >
          <Plus size={16} className="mr-2" strokeWidth={3} /> Define Frame
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredFrames.map(frame => (
          <Card key={frame.id} className="border-none group hover:shadow-2xl transition-all duration-500 bg-white overflow-hidden rounded-3xl">
             <div className="aspect-video relative overflow-hidden bg-slate-100">
                <img src={frame.preview} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Frame" />
                <div className="absolute top-4 left-4 flex gap-2">
                   <Badge className={`text-[8px] font-black tracking-widest uppercase ${frame.priceType === 'premium' ? 'bg-amber-400 text-white' : 'bg-emerald-500 text-white'}`}>
                      {frame.priceType}
                   </Badge>
                   <Badge className="text-[8px] font-black tracking-widest uppercase bg-white/90 text-slate-800 backdrop-blur">
                      {frame.type}
                   </Badge>
                </div>
                
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center gap-3">
                   <Button 
                     onClick={() => { setEditingFrame(frame); setShowModal(true); }}
                     variant="outline" size="icon" className="h-12 w-12 rounded-2xl bg-white text-[#ef4444] border-none shadow-2xl hover:scale-110 transition-transform"
                   >
                      <Edit2 size={20} />
                   </Button>
                   <Button 
                     onClick={() => setShowDeleteConfirm(frame)}
                     variant="outline" size="icon" className="h-12 w-12 rounded-2xl bg-white text-rose-500 border-none shadow-2xl hover:scale-110 transition-transform"
                   >
                      <Trash2 size={20} />
                   </Button>
                </div>
             </div>
             <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                   <div>
                      <h3 className="font-black text-sm text-slate-800 tracking-tight">{frame.title}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">NODE ID: {frame.id}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-black text-[#ef4444] uppercase tracking-widest">{frame.usage.toLocaleString()}</p>
                      <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">PROPAGATIONS</p>
                   </div>
                </div>
                <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                   <div className={`w-2 h-2 rounded-full ${frame.status === 'published' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{frame.status}</span>
                </div>
             </div>
          </Card>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <AdminModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingFrame(null); setPreviewUrl(''); }}
        title={editingFrame ? 'Modify Frame Architecture' : 'Provision New Frame'}
        subtitle="Global Layout Registry"
        icon={Palette}
      >
        <form onSubmit={handleCreateOrUpdate} className="space-y-8">
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Frame Identity</label>
                 <Input name="title" defaultValue={editingFrame?.title} placeholder="e.g. Modern Minimalist Footer" required className="h-14 bg-slate-50 border-none rounded-xl font-bold" />
              </div>
              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Layout Type</label>
                 <select name="type" defaultValue={editingFrame?.type || 'footer'} className="w-full h-14 bg-slate-50 border-none rounded-xl px-6 font-bold text-sm outline-none focus:ring-2 focus:ring-red-100 appearance-none">
                    <option value="footer">Bottom Footer</option>
                    <option value="header">Top Header</option>
                    <option value="sidebar">Floating Sidebar</option>
                    <option value="full">Full Overlay</option>
                 </select>
              </div>
              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pricing Logic</label>
                 <select name="priceType" defaultValue={editingFrame?.priceType || 'free'} className="w-full h-14 bg-slate-50 border-none rounded-xl px-6 font-bold text-sm outline-none focus:ring-2 focus:ring-red-100 appearance-none">
                    <option value="free">Free Access</option>
                    <option value="premium">Premium Only</option>
                 </select>
              </div>
              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Stage Status</label>
                 <select name="status" defaultValue={editingFrame?.status || 'published'} className="w-full h-14 bg-slate-50 border-none rounded-xl px-6 font-bold text-sm outline-none focus:ring-2 focus:ring-red-100 appearance-none">
                    <option value="published">Deployed</option>
                    <option value="draft">Drafting Mode</option>
                 </select>
              </div>
           </div>

           <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Interface Payload (Frame Image)</label>
              <div 
                className="h-40 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer"
                onClick={() => fileInputRef.current.click()}
              >
                 <input 
                   type="file" 
                   ref={fileInputRef} 
                   className="hidden" 
                   accept="image/png"
                   onChange={(e) => {
                     const file = e.target.files[0];
                     if (file) {
                        setSelectedFile(file);
                        setPreviewUrl(URL.createObjectURL(file));
                     }
                   }}
                 />
                 {previewUrl || editingFrame?.preview ? (
                   <>
                     <img src={previewUrl || editingFrame?.preview} className="w-full h-full object-contain" alt="P" />
                     <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ImageIcon size={24} className="text-white" />
                     </div>
                   </>
                 ) : (
                   <div className="text-center">
                      <ImageIcon size={32} className="text-slate-300 mx-auto mb-2" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Upload PNG (Transparent)</p>
                   </div>
                 )}
              </div>
           </div>

           <div className="flex gap-4 pt-4">
              <Button type="button" onClick={() => setShowModal(false)} variant="ghost" className="flex-1 h-16 bg-slate-50 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 border-none">
                 Discard
              </Button>
              <Button type="submit" className="flex-2 h-16 bg-[#ef4444] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-red-500/20 border-none">
                 <CheckCircle size={18} className="mr-2" /> {editingFrame ? 'Update Architecture' : 'Provision Layout'}
              </Button>
           </div>
        </form>
      </AdminModal>

      {/* Delete Confirm */}
      <AdminModal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        title="Dismantle Frame?"
        subtitle="Irreversible Node Purge"
        variant="danger"
        icon={AlertCircle}
        maxWidth="400px"
      >
         <div className="text-center py-4">
            <p className="text-slate-500 text-sm font-semibold mb-8">
              Are you sure you want to permanently decompose the "{showDeleteConfirm?.title}" layout? This action will impact all users currently utilizing this frame.
            </p>
            <div className="flex gap-3">
              <Button onClick={() => setShowDeleteConfirm(null)} variant="ghost" className="flex-1 h-12 bg-slate-50 font-black text-[10px] uppercase tracking-widest text-slate-500 border-none">Abort</Button>
              <Button onClick={() => handleDelete(showDeleteConfirm.id)} className="flex-1 h-12 bg-rose-600 text-white font-black text-[10px] uppercase tracking-widest border-none">Confirm Purge</Button>
            </div>
         </div>
      </AdminModal>
    </div>
  );
};

export default FrameManager;
