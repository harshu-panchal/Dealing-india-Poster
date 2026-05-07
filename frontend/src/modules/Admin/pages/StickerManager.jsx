import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Sparkles, Plus, Search, Trash2, Upload, X, CheckCircle, Loader2, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const StickerManager = () => {
  const [stickers, setStickers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    isActive: true
  });
  
  const [isUploading, setIsUploading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';
  const adminInfo = useMemo(() => JSON.parse(localStorage.getItem('adminInfo')), []);

  const fetchStickers = useCallback(async () => {
    if (!adminInfo?.accessToken) return;
    try {
      setIsLoading(true);
      const { data } = await axios.get(`${API_URL}/admin/stickers`, {
        headers: { Authorization: `Bearer ${adminInfo?.accessToken}` }
      });
      setStickers(data);
    } catch (error) {
      console.error('Fetch stickers error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [API_URL, adminInfo]);

  useEffect(() => {
    fetchStickers();
  }, [fetchStickers]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      const { data } = await axios.post(`${API_URL}/admin/upload`, formDataUpload, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${adminInfo?.accessToken}`
        }
      });
      
      setFormData(prev => ({ ...prev, image: data.url }));
    } catch (error) {
      alert('Upload failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.image) return alert('Please upload a sticker image first');

    try {
      await axios.post(`${API_URL}/admin/stickers`, formData, {
        headers: { Authorization: `Bearer ${adminInfo?.accessToken}` }
      });
      setIsModalOpen(false);
      setFormData({ name: '', image: '', isActive: true });
      fetchStickers();
    } catch (error) {
      alert('Save failed: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this sticker?')) return;
    try {
      await axios.delete(`${API_URL}/admin/stickers/${id}`, {
        headers: { Authorization: `Bearer ${adminInfo?.accessToken}` }
      });
      fetchStickers();
    } catch (error) {
      alert('Delete failed');
    }
  };

  const filteredStickers = stickers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 pb-32 bg-[var(--admin-bg)] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 leading-none">Creative Assets</p>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
             <Sparkles className="text-blue-600" size={32} /> Sticker Registry
          </h1>
          <p className="text-slate-400 text-xs font-semibold mt-1 italic">Manage stickers available for poster personalization</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-2xl shadow-blue-500/20 transition-all border-none cursor-pointer active:scale-95"
        >
          <Plus size={20} strokeWidth={3} /> Add New Sticker
        </button>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
         <div className="relative group flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Search by sticker name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 rounded-2xl border-none bg-white shadow-sm font-bold text-sm text-slate-700 outline-none ring-2 ring-transparent focus:ring-blue-500/10 transition-all"
            />
         </div>
         <div className="px-8 py-4 bg-white rounded-2xl flex items-center gap-4 shadow-sm border border-slate-50">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
               <ImageIcon size={20} />
            </div>
            <div className="flex flex-col">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Stickers</span>
               <span className="text-lg font-black text-slate-800 leading-none">{stickers.length}</span>
            </div>
         </div>
      </div>

      {/* Grid Layout */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
           {[...Array(12)].map((_, i) => (
             <div key={i} className="aspect-square bg-white rounded-[2.5rem] border border-slate-100 p-4 animate-pulse">
                <div className="w-full h-full bg-slate-50 rounded-[2rem]" />
             </div>
           ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {filteredStickers.map(sticker => (
            <motion.div 
              layout 
              key={sticker._id} 
              className="group bg-white rounded-[2.5rem] border border-slate-50 overflow-hidden hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 p-4"
            >
               <div className="aspect-square relative rounded-[2rem] overflow-hidden bg-slate-50 shadow-inner flex items-center justify-center p-4">
                  <img src={sticker.image} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-700" alt={sticker.name} />
                  
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-4 backdrop-blur-[4px]">
                     <button 
                        onClick={() => handleDelete(sticker._id)}
                        className="w-12 h-12 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-2xl active:scale-90 transition-all border-none cursor-pointer"
                     >
                        <Trash2 size={24} />
                     </button>
                  </div>
               </div>
               
               <div className="px-2 text-center">
                  <h3 className="font-black text-slate-800 text-sm leading-tight truncate tracking-tight uppercase">{sticker.name}</h3>
               </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Sticker Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl relative flex flex-col overflow-hidden"
              style={{ minWidth: '320px', margin: 'auto' }}
            >
               {/* Modal Header */}
               <div className="px-6 py-5 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-10">
                  <div>
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">Sticker Registry</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Add new creative asset</p>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(false)} 
                    className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors border-none cursor-pointer"
                  >
                    <X size={20} strokeWidth={3} />
                  </button>
               </div>
               
               <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6 overflow-y-auto max-h-[70vh]">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Sticker Name</label>
                    <input 
                      required
                      className="w-full px-5 py-4 rounded-xl border-none bg-slate-50 font-bold text-sm text-slate-800 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none" 
                      placeholder="e.g. Sale Banner"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>

                  <div className="space-y-1.5">
                     <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Sticker Image (PNG/SVG Preferred)</label>
                     <div className="relative">
                        <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id="sticker-input" />
                        <label 
                          htmlFor="sticker-input" 
                          className={`flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-[2rem] cursor-pointer transition-all duration-300 ${formData.image ? 'border-green-400 bg-green-50/10' : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-blue-400'}`}
                        >
                           {isUploading ? (
                              <div className="flex flex-col items-center gap-2">
                                 <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                                 <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Uploading...</span>
                              </div>
                           ) : formData.image ? (
                              <div className="flex flex-col items-center gap-4">
                                 <img src={formData.image} className="w-24 h-24 object-contain" alt="preview" />
                                 <div className="flex flex-col items-center">
                                    <CheckCircle size={24} className="text-green-500 mb-1" strokeWidth={3} />
                                    <span className="text-[9px] font-black text-green-700 uppercase tracking-widest">Ready to Save</span>
                                 </div>
                              </div>
                           ) : (
                              <>
                                 <Upload size={32} className="text-slate-200 mb-3" />
                                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Select Image File</span>
                                 <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest mt-1 text-center">Transparent backgrounds look best</p>
                              </>
                           )}
                        </label>
                     </div>
                  </div>

                  <div className="flex gap-3 pt-4 sticky bottom-0 bg-white">
                     <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-500 bg-slate-100 hover:bg-slate-200 border-none cursor-pointer">Cancel</button>
                     <button type="submit" disabled={isUploading || !formData.image} className="flex-[2] py-4 rounded-xl font-black text-[10px] uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 disabled:opacity-50 border-none cursor-pointer">Register Sticker</button>
                  </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StickerManager;
