import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import AdminModal from '../components/ui/AdminModal';

const BackgroundManager = () => {
  const { admin } = useAdminAuth();
  const [backgrounds, setBackgrounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  
  const API_URL = import.meta.env.VITE_API_URL;
  const fileInputRef = useRef();

  const fetchBackgrounds = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/admin/backgrounds`, {
        headers: { Authorization: `Bearer ${admin.accessToken}` }
      });
      setBackgrounds(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (admin) fetchBackgrounds();
  }, [admin]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const { data } = await axios.post(`${API_URL}/admin/upload`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${admin.accessToken}` 
        }
      });
      setPreviewUrl(data.url);
    } catch (err) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async () => {
    if (!previewUrl) return;
    try {
      await axios.post(`${API_URL}/admin/backgrounds`, { image: previewUrl }, {
        headers: { Authorization: `Bearer ${admin.accessToken}` }
      });
      setShowModal(false);
      setPreviewUrl('');
      fetchBackgrounds();
    } catch (err) {
      alert('Failed to save');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this background?')) return;
    try {
      await axios.delete(`${API_URL}/admin/backgrounds/${id}`, {
        headers: { Authorization: `Bearer ${admin.accessToken}` }
      });
      fetchBackgrounds();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Custom Editor Assets</p>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Poster Backgrounds</h1>
          <p className="text-slate-400 text-xs font-semibold mt-1">Manage backgrounds available for users in the custom editor</p>
        </div>
        <Button onClick={() => { setPreviewUrl(''); setShowModal(true); }} className="bg-red-500 text-white font-black uppercase text-[10px] tracking-widest px-6 h-11 border-none shadow-lg shadow-red-500/20">
          <Plus size={16} className="mr-2" /> Add Background
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {loading ? (
          <div className="col-span-full py-20 flex justify-center"><Loader2 className="animate-spin text-red-500" size={40} /></div>
        ) : backgrounds.map(bg => (
          <Card key={bg._id} className="relative aspect-square overflow-hidden group border-none shadow-md hover:shadow-xl transition-all duration-300">
            <img src={bg.image} className="w-full h-full object-cover" alt="BG" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
              <Button onClick={() => handleDelete(bg._id)} variant="outline" size="icon" className="h-10 w-10 bg-white text-red-500 border-none shadow-lg">
                <Trash2 size={18} />
              </Button>
            </div>
          </Card>
        ))}
        {!loading && backgrounds.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100">
            <ImageIcon size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-bold">No backgrounds uploaded yet</p>
          </div>
        )}
      </div>

      <AdminModal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Background" icon={Plus}>
        <div className="space-y-6 p-2">
          <div 
            className="h-64 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-all relative overflow-hidden group"
            onClick={() => fileInputRef.current.click()}
          >
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="animate-spin text-red-500" size={32} />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Processing...</span>
              </div>
            ) : previewUrl ? (
              <img src={previewUrl} className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-red-50 group-hover:text-red-500 transition-colors">
                  <Upload size={24} />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Click to upload image</span>
              </div>
            )}
          </div>
          <div className="flex gap-4">
            <Button onClick={() => setShowModal(false)} className="flex-1 h-12 bg-slate-100 text-slate-500 border-none uppercase text-[10px] font-black tracking-widest">Cancel</Button>
            <Button onClick={handleCreate} disabled={!previewUrl || uploading} className="flex-1 h-12 bg-red-500 text-white font-black uppercase text-[10px] tracking-widest border-none shadow-lg shadow-red-500/20 disabled:opacity-50">Save Background</Button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
};

export default BackgroundManager;
