import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { 
  Plus, Image as ImageIcon, Trash2, Edit2, CheckCircle,
  AlertCircle, Palette, Loader2, Eye, Move
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import AdminModal from '../components/ui/AdminModal';
import { motion } from 'framer-motion';
import { useAdminAuth } from '../context/AdminAuthContext';
import axios from 'axios';

// ── Constants ──────────────────────────────────────────────────────────────

const DEFAULT_POSITIONS = {
  name:          { x: '5%',  y: '82%' },
  businessName:  { x: '5%',  y: '84%' },
  designation:   { x: '5%',  y: '96%' },
  phone:         { x: '5%',  y: '86%' },
  website:       { x: '5%',  y: '88%' },
  email:         { x: '5%',  y: '90%' },
  address:       { x: '5%',  y: '92%' },
  gst:           { x: '5%',  y: '94%' },
  userPhoto:     { x: '70%', y: '74%' },
  logo:          { x: '5%',  y: '74%' },
};

const DEFAULT_TEXT_STYLE = {
  color: '#ffffff',
  nameSize: '0.8rem',
  detailSize: '0.6rem',
  fontWeight: 'bold',
  textShadow: '0 2px 4px rgba(0,0,0,0.8)',
  letterSpacing: 'normal',
  textTransform: 'uppercase',
  positions: { ...DEFAULT_POSITIONS },
};

const FIELD_META = [
  { key: 'name',         sample: 'USER NAME',         isName: true,  dot: '#ef4444', type: 'text' },
  { key: 'businessName', sample: 'BUSINESS NAME',     isName: true,  dot: '#f59e0b', type: 'text' },
  { key: 'designation',  sample: 'USER DESIGNATION',  isName: false, dot: '#ef4444', type: 'text' },
  { key: 'phone',        sample: 'MOBILE NUMBER',     isName: false, dot: '#3b82f6', type: 'text' },
  { key: 'website',      sample: 'WEBSITE URL',       isName: false, dot: '#8b5cf6', type: 'text' },
  { key: 'email',        sample: 'EMAIL ADDRESS',     isName: false, dot: '#10b981', type: 'text' },
  { key: 'address',      sample: 'BUSINESS ADDRESS',  isName: false, dot: '#6366f1', type: 'text' },
  { key: 'gst',          sample: 'GST NUMBER',        isName: false, dot: '#ec4899', type: 'text' },
  { key: 'userPhoto',    sample: null,                isName: false, dot: '#06b6d4', type: 'photo', size: '12%' },
  { key: 'logo',         sample: null,                isName: false, dot: '#84cc16', type: 'logo',  size: '10%' },
];

// ── Helpers ────────────────────────────────────────────────────────────────

const fwToCss = (fw) => {
  if (fw === 'black') return '900';
  if (fw === 'bold') return '700';
  if (fw === 'semibold') return '600';
  return '400';
};

const lsToCss = (ls) => {
  if (ls === 'tight') return '-0.02em';
  if (ls === 'wide') return '0.05em';
  if (ls === 'widest') return '0.1em';
  return 'normal';
};


// ── DraggablePreview ───────────────────────────────────────────────────────

const DraggablePreview = ({ frameUrl, textStyle, onPositionChange }) => {
  const containerRef = useRef(null);
  const dragRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(500);

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver(entries => {
      for (let entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const positions = textStyle.positions || DEFAULT_POSITIONS;

  const getDynamicStyle = (isName) => {
    const scale = containerWidth / 500;
    const baseSize = isName ? (textStyle.nameSize || '0.8rem') : (textStyle.detailSize || '0.6rem');
    
    return {
      color: textStyle.color || '#ffffff',
      fontSize: `calc(${baseSize} * ${scale})`,
      fontWeight: fwToCss(textStyle.fontWeight),
      textShadow: textStyle.textShadow !== 'none' ? (textStyle.textShadow || '0 2px 4px rgba(0,0,0,0.8)') : 'none',
      textTransform: textStyle.textTransform || 'uppercase',
      letterSpacing: lsToCss(textStyle.letterSpacing),
      whiteSpace: 'nowrap',
      lineHeight: 1.2,
    };
  };

  const handlePointerDown = (e, key) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    
    const pos = positions[key] || DEFAULT_POSITIONS[key];
    dragRef.current = {
      key,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startXPct: parseFloat(pos.x) || 0,
      startYPct: parseFloat(pos.y) || 0,
    };
  };

  const handlePointerMove = (e, key) => {
    if (!dragRef.current || dragRef.current.key !== key || !containerRef.current) return;
    const { startClientX, startClientY, startXPct, startYPct } = dragRef.current;
    
    const { width, height } = containerRef.current.getBoundingClientRect();
    const dx = ((e.clientX - startClientX) / width) * 100;
    const dy = ((e.clientY - startClientY) / height) * 100;
    
    const newX = Math.max(0, Math.min(94, startXPct + dx));
    const newY = Math.max(0, Math.min(96, startYPct + dy));
    
    onPositionChange(key, { x: `${newX.toFixed(1)}%`, y: `${newY.toFixed(1)}%` });
  };

  const handlePointerUp = () => {
    dragRef.current = null;
  };

  return (
    <div className="space-y-4">
      {/* Canvas */}
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          aspectRatio: '1',
          borderRadius: 14,
          overflow: 'hidden',
          background: '#0f172a',
          userSelect: 'none',
          touchAction: 'none',
        }}
      >
        {/* Poster gradient background */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, #1e3a5f 0%, #7c3aed 50%, #be185d 100%)',
        }} />

        {/* Frame image overlay */}
        {frameUrl && (
          <img
            src={frameUrl}
            alt="frame"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'fill', zIndex: 5, pointerEvents: 'none' }}
          />
        )}

        {/* Empty state hint */}
        {!frameUrl && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 3,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: 6, pointerEvents: 'none',
          }}>
            <Move size={24} color="rgba(255,255,255,0.3)" />
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Upload frame to preview
            </span>
          </div>
        )}

        {/* Draggable Layer */}
        <div className="absolute inset-0 z-20">
          {FIELD_META.map(({ key, sample, isName, dot, type, size }) => {
            const pos = positions[key] || DEFAULT_POSITIONS[key];
            const style = getDynamicStyle(isName);
            const dragHandlers = { onPointerDown: (e) => handlePointerDown(e, key), onPointerMove: (e) => handlePointerMove(e, key), onPointerUp: handlePointerUp, onPointerCancel: handlePointerUp };

            if (type === 'photo' || type === 'logo') {
               return (
                  <div key={key} className="absolute cursor-grab active:cursor-grabbing group/it" style={{ left: pos.x, top: pos.y, width: size, aspectRatio: '1', zIndex: 30, touchAction: 'none', userSelect: 'none' }} {...dragHandlers}>
                    <div style={{ width: '100%', height: '100%', borderRadius: type === 'photo' ? '50%' : '20%', background: 'rgba(255,255,255,0.95)', border: `2px solid ${dot}`, display: 'flex', alignItems: 'center', justifyCenter: 'center', boxShadow: `0 8px 24px ${dot}40`, backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       <Move size={14} color={dot} strokeWidth={3} />
                    </div>
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 opacity-0 group-hover/it:opacity-100 transition-opacity bg-black text-white text-[7px] font-black px-1.5 py-0.5 rounded uppercase pointer-events-none">
                       {key}
                    </div>
                  </div>
               );
            }
            return (
              <div key={key} className="absolute cursor-grab active:cursor-grabbing hover:ring-1 hover:ring-white/30 rounded px-1 transition-all" style={{ left: pos.x, top: pos.y, zIndex: 30, ...style, touchAction: 'none', userSelect: 'none' }} {...dragHandlers}>
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: dot }} />
                   <span>{sample}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend / Tip Area */}
      <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
        <div className="grid grid-cols-4 gap-3 mb-4">
          {FIELD_META.map(({ key, dot }) => (
            <div key={key} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dot }} />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{key}</span>
            </div>
          ))}
        </div>
        <p className="text-center text-[10px] text-slate-400 font-bold flex items-center justify-center gap-2">
           <Move size={12} /> Drag labels freely to position them on the poster
        </p>
      </div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────


const FrameManager = () => {
  const { admin } = useAdminAuth();
  const [frames, setFrames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingFrame, setEditingFrame] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [textStyle, setTextStyle] = useState({ ...DEFAULT_TEXT_STYLE, positions: { ...DEFAULT_POSITIONS } });
  const fileInputRef = useRef();
  const API_URL = import.meta.env.VITE_API_URL;

  // ── API ──────────────────────────────────────────────────────────────────

  const fetchFrames = useCallback(async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${admin?.accessToken}` } };
      const { data } = await axios.get(`${API_URL}/admin/frames`, config);
      setFrames(data);
    } catch (err) {
      console.error('Fetch frames error:', err);
    } finally {
      setLoading(false);
    }
  }, [admin, API_URL]);

  useEffect(() => {
    if (admin) fetchFrames();
    else setLoading(false);
  }, [admin, fetchFrames]);

  // ── Modal helpers ────────────────────────────────────────────────────────

  const buildDefaultStyle = (savedStyle = {}) => ({
    color:         savedStyle.color         ?? DEFAULT_TEXT_STYLE.color,
    nameSize:      savedStyle.nameSize      ?? DEFAULT_TEXT_STYLE.nameSize,
    detailSize:    savedStyle.detailSize    ?? DEFAULT_TEXT_STYLE.detailSize,
    fontWeight:    savedStyle.fontWeight    ?? DEFAULT_TEXT_STYLE.fontWeight,
    textShadow:    savedStyle.textShadow    ?? DEFAULT_TEXT_STYLE.textShadow,
    letterSpacing: savedStyle.letterSpacing ?? DEFAULT_TEXT_STYLE.letterSpacing,
    textTransform: savedStyle.textTransform ?? DEFAULT_TEXT_STYLE.textTransform,
    positions: {
      name:         savedStyle.positions?.name         || DEFAULT_POSITIONS.name,
      businessName: savedStyle.positions?.businessName || DEFAULT_POSITIONS.businessName,
      designation:  savedStyle.positions?.designation  || DEFAULT_POSITIONS.designation,
      phone:        savedStyle.positions?.phone        || DEFAULT_POSITIONS.phone,
      website:      savedStyle.positions?.website      || DEFAULT_POSITIONS.website,
      email:        savedStyle.positions?.email        || DEFAULT_POSITIONS.email,
      address:      savedStyle.positions?.address      || DEFAULT_POSITIONS.address,
      gst:          savedStyle.positions?.gst          || DEFAULT_POSITIONS.gst,
      userPhoto:    savedStyle.positions?.userPhoto    || DEFAULT_POSITIONS.userPhoto,
      logo:         savedStyle.positions?.logo         || DEFAULT_POSITIONS.logo,
    },
  });

  const openCreate = () => {
    setEditingFrame(null);
    setPreviewUrl('');
    setTextStyle(buildDefaultStyle());
    setShowModal(true);
  };

  const openEdit = (frame) => {
    setEditingFrame(frame);
    setPreviewUrl(frame.image || '');
    setTextStyle(buildDefaultStyle(frame.textStyle));
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingFrame(null);
    setPreviewUrl('');
  };

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${admin.accessToken}` } };
      const { data } = await axios.post(`${API_URL}/admin/upload`, fd, config);
      setPreviewUrl(data.url);
    } catch { alert('Upload failed'); }
    finally { setUploading(false); }
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const payload = {
      name: fd.get('title'),
      category: fd.get('category') || 'General',
      image: previewUrl || fd.get('image_url'),
      textStyle,
    };
    setSaving(true);
    try {
      const config = { headers: { Authorization: `Bearer ${admin.accessToken}` } };
      if (editingFrame) {
        await axios.put(`${API_URL}/admin/frames/${editingFrame._id}`, payload, config);
      } else {
        await axios.post(`${API_URL}/admin/frames/create`, payload, config);
      }
      closeModal();
      fetchFrames();
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${admin.accessToken}` } };
      await axios.delete(`${API_URL}/admin/frames/${id}`, config);
      setShowDeleteConfirm(null);
      fetchFrames();
    } catch { alert('Delete failed'); }
  };

  const handlePositionChange = useCallback((field, pos) => {
    setTextStyle(prev => ({
      ...prev,
      positions: { ...prev.positions, [field]: pos },
    }));
  }, []);

  const setPreset = (preset) => {
    setTextStyle(prev => ({
      ...prev,
      ...(preset === 'classic'
        ? { color: '#ffffff', nameSize: '1rem',  detailSize: '0.7rem', fontWeight: 'black', textShadow: '0 2px 4px rgba(0,0,0,0.8)', letterSpacing: 'tight',  textTransform: 'uppercase'  }
        : { color: '#fde047', nameSize: '1.2rem', detailSize: '0.8rem', fontWeight: 'black', textShadow: '0 1px 2px rgba(0,0,0,0.5)', letterSpacing: 'normal', textTransform: 'capitalize' }),
      // preserve existing positions when switching presets
      positions: prev.positions,
    }));
  };

  const resetPositions = () => {
    setTextStyle(prev => ({ ...prev, positions: { ...DEFAULT_POSITIONS } }));
  };

  // ── Derived ───────────────────────────────────────────────────────────────

  const filteredFrames = useMemo(() =>
    frames.filter(f =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.category && f.category.toLowerCase().includes(searchQuery.toLowerCase()))
    ),
    [frames, searchQuery]
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-10 pb-12 overflow-x-hidden">

      {/* Size Guidelines Info Box */}
      <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-6 flex flex-col md:flex-row items-center gap-6 shadow-sm">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-rose-500 shadow-sm flex-shrink-0">
          <ImageIcon size={32} />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h4 className="font-black text-slate-800 uppercase tracking-wider mb-2">Ideal Image Proportions</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <div className="bg-white p-3 rounded-xl border border-slate-100">
              <span className="text-rose-500 block mb-1">Standard Posters</span>
              <span className="text-slate-800 text-xs">1080 x 1080 px (1:1)</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-100">
              <span className="text-rose-500 block mb-1">Business Cards</span>
              <span className="text-slate-800 text-xs">1050 x 600 px (1.75:1)</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-100">
              <span className="text-rose-500 block mb-1">Frame Overlays</span>
              <span className="text-slate-800 text-xs">Transparent PNG (1080x1080)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 leading-none">Aesthetic Layout System</p>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Frame Registry</h1>
          <p className="text-slate-400 text-xs font-semibold mt-1">Manage global user-detail overlays and footer architectures</p>
        </div>
        <Button onClick={openCreate} className="rounded-xl shadow-lg shadow-red-500/20 px-6 h-12 border-none bg-[#ef4444] text-white text-xs font-black uppercase tracking-widest">
          <Plus size={16} className="mr-2" strokeWidth={3} /> Define Frame
        </Button>
      </div>

      {/* Frame grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full h-40 flex items-center justify-center">
            <Loader2 className="animate-spin text-red-500" />
          </div>
        ) : filteredFrames.map(frame => (
          <div key={frame._id} className="bg-white rounded-3xl overflow-hidden group hover:shadow-2xl transition-all duration-500">
            <div className="aspect-square relative overflow-hidden bg-slate-100">
              <img src={frame.image} className="w-full h-full object-fill group-hover:scale-110 transition-transform duration-700" alt="Frame" />
              <div className="absolute top-4 left-4">
                <Badge className="text-[8px] font-black tracking-widest uppercase bg-emerald-500 text-white">
                  {frame.category || 'General'}
                </Badge>
              </div>
              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center gap-3">
                <Button onClick={() => openEdit(frame)} variant="outline" size="icon" className="h-12 w-12 rounded-2xl bg-white text-[#ef4444] border-none shadow-2xl hover:scale-110 transition-transform">
                  <Edit2 size={20} />
                </Button>
                <Button onClick={() => setShowDeleteConfirm(frame)} variant="outline" size="icon" className="h-12 w-12 rounded-2xl bg-white text-rose-500 border-none shadow-2xl hover:scale-110 transition-transform">
                  <Trash2 size={20} />
                </Button>
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-black text-sm text-slate-800 tracking-tight">{frame.name}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID: {frame._id?.slice(-6)}</p>
              {frame.textStyle && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: frame.textStyle.color || '#fff', border: '1px solid #e2e8f0', flexShrink: 0 }} />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                    {frame.textStyle.fontWeight} · {frame.textStyle.textTransform}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Add / Edit Modal ── */}
      <AdminModal
        isOpen={showModal}
        onClose={closeModal}
        title={editingFrame ? 'Modify Frame' : 'Define New Frame'}
        subtitle="Global Layout Registry"
        icon={Palette}
      >
        <form onSubmit={handleCreateOrUpdate} className="space-y-6">

          {/* Row 1 — identity + image upload */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Left: meta + upload */}
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Frame Name</label>
                  <Input name="title" defaultValue={editingFrame?.name} placeholder="e.g. Modern Footer" required className="h-11 bg-slate-50 border-none rounded-xl font-bold text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Category</label>
                  <Input name="category" defaultValue={editingFrame?.category} placeholder="e.g. Festival" className="h-11 bg-slate-50 border-none rounded-xl font-bold text-sm" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Frame Image (Transparent PNG)</label>
                <div
                  className="h-32 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer"
                  onClick={() => fileInputRef.current.click()}
                >
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/png" onChange={handleFileUpload} />
                  {uploading ? (
                    <div className="text-center">
                      <Loader2 className="animate-spin text-red-500 mx-auto mb-1" size={20} />
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Uploading...</p>
                    </div>
                  ) : previewUrl ? (
                    <>
                      <img src={previewUrl} className="w-full h-full object-fill" alt="preview" />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ImageIcon size={20} className="text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="text-center">
                      <ImageIcon size={28} className="text-slate-300 mx-auto mb-1" />
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Click to Upload PNG</p>
                    </div>
                  )}
                </div>
                <Input name="image_url" value={previewUrl} onChange={e => setPreviewUrl(e.target.value)} placeholder="Or paste image URL" className="h-9 text-xs" />
                <div className="flex justify-between items-center px-1 mt-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Recommended: 1080x1080px</p>
                  <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Must be PNG</p>
                </div>
              </div>
            </div>

            {/* Right: live drag preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Eye size={13} className="text-red-500" />
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Live Drag Preview</label>
                </div>
                <button
                  type="button"
                  onClick={resetPositions}
                  className="text-[9px] font-black uppercase tracking-widest text-slate-400 border-none bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-lg cursor-pointer transition-colors"
                >
                  Reset Positions
                </button>
              </div>
              <DraggablePreview
                frameUrl={previewUrl}
                textStyle={textStyle}
                onPositionChange={handlePositionChange}
              />
            </div>
          </div>

          {/* ── Typography controls ── */}
          <div className="space-y-5 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Palette size={15} className="text-red-500" /> Typography Style
              </label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setPreset('classic')}
                  className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest border-none cursor-pointer hover:bg-slate-700 transition-colors">
                  Classic Bold
                </button>
                <button type="button" onClick={() => setPreset('gold')}
                  className="px-3 py-1.5 bg-amber-400 text-amber-900 rounded-lg text-[9px] font-black uppercase tracking-widest border-none cursor-pointer hover:bg-amber-300 transition-colors">
                  Gold Center
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Text color */}
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Text Color</label>
                <div className="flex gap-2 items-center h-10">
                  <input
                    type="color"
                    value={textStyle.color}
                    onChange={e => setTextStyle(p => ({ ...p, color: e.target.value }))}
                    className="w-10 h-10 p-0.5 border border-slate-200 rounded-lg cursor-pointer bg-transparent"
                  />
                  <div className="flex-1 text-[10px] font-bold text-slate-600 font-mono bg-slate-50 px-2 py-1.5 rounded-lg">{textStyle.color}</div>
                </div>
              </div>

              {/* Name size — free text OR preset */}
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Name Size</label>
                <input
                  list="namesz-opts"
                  value={textStyle.nameSize}
                  onChange={e => setTextStyle(p => ({ ...p, nameSize: e.target.value }))}
                  placeholder="e.g. 14px, 1rem"
                  className="w-full h-10 bg-slate-50 border-none rounded-lg text-xs font-bold px-3 outline-none"
                />
                <datalist id="namesz-opts">
                  <option value="0.55rem">XX-Small</option>
                  <option value="0.7rem">X-Small</option>
                  <option value="0.85rem">Small</option>
                  <option value="1rem">Medium</option>
                  <option value="1.2rem">Large</option>
                  <option value="1.5rem">X-Large</option>
                  <option value="2rem">XX-Large</option>
                  <option value="10px">10 px</option>
                  <option value="12px">12 px</option>
                  <option value="14px">14 px</option>
                  <option value="16px">16 px</option>
                  <option value="20px">20 px</option>
                </datalist>
              </div>

              {/* Detail size — free text OR preset */}
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Detail Size</label>
                <input
                  list="detailsz-opts"
                  value={textStyle.detailSize}
                  onChange={e => setTextStyle(p => ({ ...p, detailSize: e.target.value }))}
                  placeholder="e.g. 10px, 0.7rem"
                  className="w-full h-10 bg-slate-50 border-none rounded-lg text-xs font-bold px-3 outline-none"
                />
                <datalist id="detailsz-opts">
                  <option value="0.45rem">XX-Small</option>
                  <option value="0.55rem">X-Small</option>
                  <option value="0.65rem">Small</option>
                  <option value="0.7rem">Medium</option>
                  <option value="0.8rem">Large</option>
                  <option value="1rem">X-Large</option>
                  <option value="8px">8 px</option>
                  <option value="10px">10 px</option>
                  <option value="11px">11 px</option>
                  <option value="12px">12 px</option>
                  <option value="14px">14 px</option>
                </datalist>
              </div>

              {/* Font weight */}
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Weight</label>
                <select value={textStyle.fontWeight} onChange={e => setTextStyle(p => ({ ...p, fontWeight: e.target.value }))}
                  className="w-full h-10 bg-slate-50 border-none rounded-lg text-xs font-bold px-2 outline-none cursor-pointer">
                  <option value="normal">Normal</option>
                  <option value="semibold">Semibold</option>
                  <option value="bold">Bold</option>
                  <option value="black">Black</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {/* Transform */}
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Transform</label>
                <select value={textStyle.textTransform} onChange={e => setTextStyle(p => ({ ...p, textTransform: e.target.value }))}
                  className="w-full h-10 bg-slate-50 border-none rounded-lg text-xs font-bold px-2 outline-none cursor-pointer">
                  <option value="none">None</option>
                  <option value="capitalize">Capitalize</option>
                  <option value="uppercase">Uppercase</option>
                </select>
              </div>

              {/* Letter spacing */}
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Letter Spacing</label>
                <select value={textStyle.letterSpacing} onChange={e => setTextStyle(p => ({ ...p, letterSpacing: e.target.value }))}
                  className="w-full h-10 bg-slate-50 border-none rounded-lg text-xs font-bold px-2 outline-none cursor-pointer">
                  <option value="tight">Tight</option>
                  <option value="normal">Normal</option>
                  <option value="wide">Wide</option>
                  <option value="widest">Widest</option>
                </select>
              </div>

              {/* Shadow */}
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Shadow</label>
                <select value={textStyle.textShadow} onChange={e => setTextStyle(p => ({ ...p, textShadow: e.target.value }))}
                  className="w-full h-10 bg-slate-50 border-none rounded-lg text-xs font-bold px-2 outline-none cursor-pointer">
                  <option value="none">None</option>
                  <option value="0 1px 2px rgba(0,0,0,0.5)">Soft</option>
                  <option value="0 2px 4px rgba(0,0,0,0.8)">Default</option>
                  <option value="0 4px 8px rgba(0,0,0,0.9)">Strong</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-2">
            <Button type="button" onClick={closeModal} variant="ghost"
              className="flex-1 h-14 bg-slate-50 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 border-none">
              Discard
            </Button>
            <Button type="submit" disabled={saving}
              className="flex-[2] h-14 bg-[#ef4444] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-red-500/20 border-none disabled:opacity-60">
              {saving ? <Loader2 size={18} className="animate-spin mr-2" /> : <CheckCircle size={18} className="mr-2" />}
              {editingFrame ? 'Save Changes' : 'Provision Frame'}
            </Button>
          </div>
        </form>
      </AdminModal>

      {/* Delete confirm */}
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
            Permanently remove <strong>"{showDeleteConfirm?.name}"</strong>? This will affect all users currently using this frame.
          </p>
          <div className="flex gap-3">
            <Button onClick={() => setShowDeleteConfirm(null)} variant="ghost" className="flex-1 h-12 bg-slate-50 font-black text-[10px] uppercase tracking-widest text-slate-500 border-none">Abort</Button>
            <Button onClick={() => handleDelete(showDeleteConfirm._id)} className="flex-1 h-12 bg-rose-600 text-white font-black text-[10px] uppercase tracking-widest border-none">Confirm Purge</Button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
};

export default FrameManager;
