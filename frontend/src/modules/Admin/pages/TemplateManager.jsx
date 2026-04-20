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

  const [musicList, setMusicList] = useState([]);
  const [assetType, setAssetType] = useState('image'); // 'image' or 'video'
  const [videoMode, setVideoMode] = useState('direct'); // 'direct' or 'image-music'
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');

  const fetchMusic = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_URL}/music/public`);
      setMusicList(data);
    } catch (error) {
      console.error('Fetch music error:', error);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchMusic();
  }, [fetchMusic]);

  const getVideoThumbnail = (url) => {
    if (!url) return '';
    if (url.includes('/video/upload/')) {
       return url.replace(/\/video\/upload\/(v\d+\/)?(.+)\.(mp4|webm|mov|ogg)$/i, '/video/upload/$1$2.jpg');
    }
    return '';
  };

  useEffect(() => {
    if (editingTemplate) {
      setAssetType(editingTemplate.type || 'image');
      setPreviewUrl(editingTemplate.image || '');
      setVideoUrl(editingTemplate.videoUrl || '');
      setAudioUrl(editingTemplate.audioUrl || '');
      // If it has videoUrl it's direct, otherwise if it has audio it's image-music
      if (editingTemplate.videoUrl) setVideoMode('direct');
      else if (editingTemplate.audioUrl) setVideoMode('image-music');
    }
  }, [editingTemplate]);

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const videoSrc = assetType === 'video' ? videoUrl : '';
    const finalImageUrl = previewUrl || formData.get('image_url') || (assetType === 'video' ? getVideoThumbnail(videoSrc) : '');

    if (assetType === 'video' && videoMode === 'direct' && !videoSrc) {
       alert('Please upload a video or provide a video URL');
       return;
    }

    if (!finalImageUrl) {
       alert('Please upload a template image or thumbnail');
       return;
    }

    const data = {
      name: formData.get('title'),
      categoryId: formData.get('category'),
      subcategoryId: formData.get('subcategory') || undefined,
      eventId: formData.get('eventId') || undefined,
      type: assetType,
      image: finalImageUrl,
      videoUrl: videoSrc,
      audioUrl: assetType === 'video' && videoMode === 'image-music' ? audioUrl : '',
      duration: assetType === 'video' ? Number(formData.get('duration')) : 10,
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

  const handleVideoUpload = async (e) => {
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
      // For video, Cloudinary needs resource_type: video (handled by backend or we can append it)
      const { data } = await axios.post(`${API_URL}/admin/upload`, formData, config);
      setVideoUrl(data.url);
    } catch (error) {
      alert('Video upload failed');
    } finally {
      setUploading(false);
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

  const isVideoUrl = (url) => {
    if (!url) return false;
    return url.match(/\.(mp4|webm|mov|ogg)$/i) || url.includes('/video/upload/');
  };

  const videoInputRef = useRef();

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
            setVideoUrl('');
            setAudioUrl('');
            setAssetType('image');
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
                 {isVideoUrl(tpl.image) ? (
                   <video src={tpl.image} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                 ) : (
                   <img src={tpl.image} className="w-full h-full object-cover" alt="Tpl" />
                 )}
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3 z-10">
                    <Button 
                      onClick={() => { 
                          setEditingTemplate(tpl); 
                          setPreviewUrl(tpl.image); 
                          setVideoUrl(tpl.videoUrl || '');
                          setAudioUrl(tpl.audioUrl || '');
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
                 {tpl.type === 'video' && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white text-[8px] font-black px-2 py-1 rounded-full flex items-center gap-1 shadow-lg z-20">
                       <Video size={10} /> VIDEO
                    </div>
                 )}
                 {tpl.eventId && (
                    <div className="absolute top-3 left-3 bg-[#1e293b] text-white text-[8px] font-black px-2 py-1 rounded-full flex items-center gap-1 shadow-lg z-20">
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
               <div className="p-1.5 bg-slate-100 rounded-xl flex items-center h-12">
                  <button 
                    type="button" 
                    onClick={() => setAssetType('image')}
                    className={`flex-1 h-full rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${assetType === 'image' ? 'bg-white text-red-500 shadow-sm' : 'text-slate-400'}`}
                  >
                     Image
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setAssetType('video')}
                    className={`flex-1 h-full rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${assetType === 'video' ? 'bg-white text-red-500 shadow-sm' : 'text-slate-400'}`}
                  >
                     Video
                  </button>
               </div>

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

            {assetType === 'video' && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                 <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Video Production Mode</p>
                    <div className="flex gap-2">
                       <button 
                         type="button" 
                         onClick={() => setVideoMode('direct')}
                         className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter transition-all ${videoMode === 'direct' ? 'bg-red-500 text-white shadow-lg' : 'bg-slate-200 text-slate-500'}`}
                       >
                          Direct Upload
                       </button>
                       <button 
                         type="button" 
                         onClick={() => setVideoMode('image-music')}
                         className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter transition-all ${videoMode === 'image-music' ? 'bg-red-500 text-white shadow-lg' : 'bg-slate-200 text-slate-500'}`}
                       >
                          Image + Music
                       </button>
                    </div>
                 </div>

                 {videoMode === 'direct' ? (
                    <div className="space-y-4">
                       <input type="file" ref={videoInputRef} className="hidden" accept="video/*" onChange={handleVideoUpload} />
                       <div className="h-32 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-white transition-all relative overflow-hidden" onClick={() => videoInputRef.current.click()}>
                          {videoUrl ? (
                            <video src={videoUrl} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                          ) : (
                            <>
                              <Upload size={20} className="text-slate-300 mb-1" />
                              <span className="text-[9px] font-black text-slate-400 uppercase">Upload mp4/webm</span>
                            </>
                          )}
                          {uploading && <div className="absolute inset-0 bg-white/60 flex items-center justify-center"><Loader2 className="animate-spin text-red-500" /></div>}
                       </div>
                       <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="Video Source URL" className="h-10 text-xs" />
                    </div>
                 ) : (
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Select Soundtrack</p>
                          <select 
                            className="w-full h-10 rounded-xl bg-white border-slate-100 px-3 font-bold text-[10px]"
                            value={audioUrl}
                            onChange={(e) => setAudioUrl(e.target.value)}
                          >
                             <option value="">No Background Music</option>
                             {musicList.map(m => (
                                <option key={m._id} value={m.audioUrl}>{m.title}</option>
                             ))}
                          </select>
                       </div>
                       <div className="space-y-2">
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Set Duration (sec)</p>
                          <Input name="duration" type="number" defaultValue={editingTemplate?.duration || 10} min="5" max="30" className="h-10 text-xs" />
                       </div>
                    </div>
                 )}
              </div>
            )}

           <div className="space-y-2">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">
                 {assetType === 'video' && videoMode === 'direct' ? 'Thumbnail / Poster Image' : 'Template Background Image'}
              </p>
              <div 
                className="h-32 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 relative overflow-hidden"
                onClick={() => fileInputRef.current.click()}
              >
                 <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                 {uploading ? (
                   <Loader2 className="animate-spin text-red-500" />
                 ) : previewUrl ? (
                    isVideoUrl(previewUrl) ? (
                      <video src={previewUrl} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                    ) : (
                      <img src={previewUrl} className="w-full h-full object-cover" />
                    )
                 ) : (
                   <><Upload size={24} className="text-slate-300" /><span className="text-xs font-bold text-slate-400 mt-2">Upload Image</span></>
                 )}
              </div>
              <Input name="image_url" value={previewUrl} onChange={(e) => setPreviewUrl(e.target.value)} placeholder="Or Image URL" className="h-12" />
           </div>

           <div className="flex gap-4">
              <Button type="button" onClick={() => setShowModal(false)} variant="ghost" className="flex-1 h-12 bg-slate-50 text-slate-500">Cancel</Button>
              <Button type="submit" className="flex-[2] h-12 bg-red-500 text-white font-black uppercase tracking-widest">
                 {editingTemplate ? 'Update Content' : 'Deploy Template'}
              </Button>
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
