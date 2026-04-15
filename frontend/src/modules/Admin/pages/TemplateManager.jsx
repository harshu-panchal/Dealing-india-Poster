import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useSearchParams, Link } from 'react-router-dom';
import { 
  Plus, Search, Image as ImageIcon, 
  Video, Star, Trash2, Edit2, CheckCircle,
  ChevronRight, Sparkles, Layers,
  X, AlertCircle, Save, Trash, Archive,
  Loader2, Upload, Calendar
} from 'lucide-react';
import axios from 'axios';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { AnimatePresence, motion } from 'framer-motion';
import AdminModal from '../components/ui/AdminModal';
import { useAdminAuth } from '../context/AdminAuthContext';

const TemplateManager = () => {
  const { admin } = useAdminAuth();
  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  
  const fileInputRef = useRef();
  const API_URL = import.meta.env.VITE_API_URL;
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const eventFilter = searchParams.get('event');

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${admin?.accessToken}` } };
      const { data } = await axios.get(`${API_URL}/admin/templates`, config);
      setTemplates(data.templates);
    } catch (error) {
      console.error('Fetch templates error:', error);
    } finally {
      setLoading(false);
    }
  }, [admin, API_URL]);

  const fetchCategories = useCallback(async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${admin?.accessToken}` } };
      const { data } = await axios.get(`${API_URL}/admin/categories`, config);
      setCategories(data);
    } catch (error) {
      console.error('Fetch categories error:', error);
    }
  }, [admin, API_URL]);

  const fetchEvents = useCallback(async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${admin?.accessToken}` } };
      const { data } = await axios.get(`${API_URL}/admin/events`, config);
      setEvents(data);
    } catch (error) {
      console.error('Fetch events error:', error);
    }
  }, [admin, API_URL]);

  useEffect(() => {
    if (admin) {
      fetchTemplates();
      fetchCategories();
      fetchEvents();
    } else {
      setLoading(false);
    }
  }, [admin, fetchTemplates, fetchCategories, fetchEvents]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const config = {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${admin.accessToken}` 
        }
      };
      const { data } = await axios.post(`${API_URL}/admin/upload`, formData, config);
      setPreviewUrl(data.url);
    } catch (error) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('title'),
      categoryId: formData.get('category'),
      subcategoryId: formData.get('subcategory') || undefined,
      eventId: formData.get('eventId') || undefined,
      type: formData.get('type'),
      image: previewUrl || formData.get('image_url'),
      isPremium: formData.get('isPremium') === 'true',
    };

    try {
      const config = { headers: { Authorization: `Bearer ${admin.accessToken}` } };
      if (editingTemplate) {
        await axios.put(`${API_URL}/admin/templates/${editingTemplate._id}`, data, config);
      } else {
        await axios.post(`${API_URL}/admin/templates`, data, config);
      }
      setShowModal(false);
      fetchTemplates();
    } catch (error) {
      alert(error.response?.data?.message || 'Save failed');
    }
  };

  const handleDelete = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${admin.accessToken}` } };
      await axios.delete(`${API_URL}/admin/templates/${showDeleteConfirm._id}`, config);
      setShowDeleteConfirm(null);
      fetchTemplates();
    } catch (error) {
      alert('Delete failed');
    }
  };

  const filteredTemplates = useMemo(() => {
    return templates.filter(t => 
       (activeType === 'all' || t.type === activeType) &&
       (!eventFilter || (t.eventId?._id === eventFilter || t.eventId === eventFilter)) &&
       (t.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [templates, activeType, searchQuery, eventFilter]);

  return (
    <div className="space-y-10 pb-12 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-4">
        <div>
           <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 leading-none font-inter">Global Content Registry</p>
           <h1 className="text-2xl md:text-3xl font-black text-[var(--admin-text-main)] tracking-tight">Template Marketplace</h1>
           <p className="text-slate-400 text-xs font-semibold mt-1">Regulate and deploy digital assets across the network</p>
        </div>
        <Button 
          onClick={() => {
            setEditingTemplate(null);
            setPreviewUrl('');
            setSelectedCategoryId('');
            setShowModal(true);
          }}
          className="rounded-xl shadow-lg shadow-red-500/20 px-6 h-11 md:h-12 border-none bg-[#ef4444] text-white text-[10px] md:text-xs font-black uppercase tracking-widest"
        >
          <Plus size={16} className="mr-2" strokeWidth={3} /> Define Layout
        </Button>
      </div>

      {eventFilter && (
        <div className="flex items-center gap-3 bg-red-50 p-4 rounded-2xl border border-red-100">
          <div className="p-2 bg-red-500 text-white rounded-lg"><Calendar size={14} /></div>
          <div>
            <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Active Event Filter</p>
            <p className="text-xs font-bold text-slate-700">Showing templates for: <span className="font-black">{events.find(e => e._id === eventFilter)?.name || 'Specified Event'}</span></p>
          </div>
          <Link to="/admin/templates" className="ml-auto text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline">Clear Filter</Link>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full h-64 flex items-center justify-center">
            <Loader2 className="animate-spin text-red-500" size={40} />
          </div>
        ) : filteredTemplates.map(tpl => (
          <motion.div layout key={tpl._id} className="group">
            <Card className="border-none overflow-hidden hover:shadow-2xl transition-all duration-500 bg-white">
              <div className="aspect-[4/5] relative overflow-hidden bg-slate-100">
                 <img src={tpl.image} className="w-full h-full object-cover" alt="Tpl" />
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3">
                    <Button 
                      onClick={() => { 
                          setEditingTemplate(tpl); 
                          setPreviewUrl(tpl.image); 
                          setSelectedCategoryId(tpl.categoryId?._id || '');
                          setShowModal(true); 
                       }}
                      variant="outline" size="icon" className="h-10 w-10 bg-white text-red-500 border-none"
                    >
                       <Edit2 size={18} />
                    </Button>
                    <Button 
                      onClick={() => setShowDeleteConfirm(tpl)}
                      variant="outline" size="icon" className="h-10 w-10 bg-white text-rose-500 border-none"
                    >
                       <Trash2 size={18} />
                    </Button>
                 </div>
                 {tpl.eventId && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white text-[8px] font-black px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                       <Calendar size={10} /> {tpl.eventId.name || 'EVENT'}
                    </div>
                 )}
              </div>
              <div className="p-4">
                  <h4 className="font-bold text-sm text-slate-800">{tpl.name}</h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                     <p className="text-[9px] font-black text-[#ef4444] uppercase tracking-tighter">{tpl.categoryId?.name || 'Uncategorized'}</p>
                     {tpl.subcategoryId && (
                        <>
                           <ChevronRight size={10} className="text-slate-300" />
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{tpl.subcategoryId?.name}</p>
                        </>
                     )}
                  </div>
              </div>
            </Card>
          </motion.div>
        ))}
        {filteredTemplates.length === 0 && !loading && (
           <div className="col-span-full py-20 text-center">
              <p className="text-slate-400 font-bold">No templates found matches your criteria.</p>
           </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AdminModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingTemplate ? 'Modify Template' : 'Add Template'}
        icon={editingTemplate ? Edit2 : Plus}
      >
        <form onSubmit={handleCreateOrUpdate} className="space-y-6">
           <Input name="title" defaultValue={editingTemplate?.name} placeholder="Template Title" required className="h-12" />
           
           <div className="grid grid-cols-2 gap-4">
              <select 
                name="category" 
                defaultValue={editingTemplate?.categoryId?._id || ''} 
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                required 
                className="h-12 rounded-xl bg-slate-50 border-none px-4 font-bold text-xs"
              >
                 <option value="">Select Category</option>
                 {categories.map(cat => (
                   <option key={cat._id} value={cat._id}>{cat.name}</option>
                 ))}
              </select>
              
              <select 
                name="subcategory" 
                defaultValue={editingTemplate?.subcategoryId?._id || ''} 
                className="h-12 rounded-xl bg-slate-50 border-none px-4 font-bold text-xs"
                disabled={!selectedCategoryId}
              >
                 <option value="">Select Subcategory (Optional)</option>
                 {categories.find(c => c._id === selectedCategoryId)?.subcategories?.map(sub => (
                   <option key={sub._id} value={sub._id}>{sub.name}</option>
                 ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <select name="type" defaultValue={editingTemplate?.type || 'image'} className="h-12 rounded-xl bg-slate-50 border-none px-4 font-bold text-xs">
                 <option value="image">Static Image</option>
                 <option value="video">Motion Graphics</option>
              </select>

              <select 
                name="eventId" 
                defaultValue={editingTemplate?.eventId?._id || ''} 
                className="h-12 rounded-xl bg-slate-50 border-none px-4 font-bold text-xs"
              >
                 <option value="">Link to Event (Optional)</option>
                 {events.map(event => (
                   <option key={event._id} value={event._id}>{event.name}</option>
                 ))}
              </select>
            </div>

           <div 
             className="h-32 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 relative overflow-hidden"
             onClick={() => fileInputRef.current.click()}
           >
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
              {uploading ? <Loader2 className="animate-spin text-red-500" /> : previewUrl ? <img src={previewUrl} className="w-full h-full object-cover" /> : <><Upload size={24} className="text-slate-300" /><span className="text-xs font-bold text-slate-400 mt-2">Upload Asset</span></>}
           </div>
           
           <Input name="image_url" value={previewUrl} onChange={(e) => setPreviewUrl(e.target.value)} placeholder="Or Image URL" className="h-12" />

           <div className="flex gap-4">
              <Button type="button" onClick={() => setShowModal(false)} variant="ghost" className="flex-1 h-12 bg-slate-50 text-slate-500">Cancel</Button>
              <Button type="submit" className="flex-[2] h-12 bg-red-500 text-white font-black uppercase">Save Template</Button>
           </div>
        </form>
      </AdminModal>

      {/* Delete Confirmation */}
      <AdminModal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        title="Confirm Delete"
        variant="danger"
      >
        <div className="text-center p-4">
          <p className="mb-6 font-bold text-slate-500 uppercase text-xs">Permanently remove "{showDeleteConfirm?.name}"?</p>
          <div className="flex gap-4">
            <Button onClick={() => setShowDeleteConfirm(null)} variant="ghost" className="flex-1">Cancel</Button>
            <Button onClick={handleDelete} className="flex-1 bg-red-500 text-white">Delete</Button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
};

export default TemplateManager;
