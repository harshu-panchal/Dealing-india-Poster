import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, Check, Type, Image as ImageIcon, Trash2, 
  AlignLeft, AlignCenter, AlignRight, Copy, 
  Plus, Download, Upload, Palette, Move, 
  Sparkles as ShadowIcon, Bold, ChevronRight, ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const FONTS = [
  { name: 'Inter', family: "'Inter', sans-serif" },
  { name: 'Roboto', family: "'Roboto', sans-serif" },
  { name: 'Oswald', family: "'Oswald', sans-serif" },
  { name: 'Playfair Display', family: "'Playfair Display', serif" },
  { name: 'Pacifico', family: "'Pacifico', cursive" },
  { name: 'Bebas Neue', family: "'Bebas Neue', cursive" },
  { name: 'Montserrat', family: "'Montserrat', sans-serif" },
  { name: 'Anton', family: "'Anton', sans-serif" },
  { name: 'Dancing Script', family: "'Dancing Script', cursive" },
  { name: 'Lobster', family: "'Lobster', cursive" },
];

const COLORS = [
  '#ffffff', '#000000', '#ef4444', '#f97316', '#f59e0b', '#eab308', 
  '#84cc16', '#22c55e', '#10b981', '#06b6d4', '#0ea5e9', '#3b82f6', 
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'
];

const CustomPosterEditor = ({ onClose }) => {
  const { user } = useAuth();
  const [backgrounds, setBackgrounds] = useState([]);
  const [selectedBackground, setSelectedBackground] = useState(null);
  const [texts, setTexts] = useState([]);
  const [selectedTextId, setSelectedTextId] = useState(null);
  const [activeTab, setActiveTab] = useState('background');
  const [textTab, setTextTab] = useState('font');
  const [isExporting, setIsExporting] = useState(false);

  
  const posterRef = useRef(null);
  const backgroundInputRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5003/api';
  const editRef = useRef(null);


  useEffect(() => {
    const fetchBackgrounds = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/user/backgrounds`);
        setBackgrounds(data);
        if (data.length > 0) setSelectedBackground(data[0].image);
      } catch (err) {
        console.error('Failed to fetch backgrounds:', err);
      }
    };
    fetchBackgrounds();
  }, [API_URL]);

  useEffect(() => {
    if (selectedTextId && editRef.current) {
      editRef.current.focus();
    }
  }, [selectedTextId]);

  const handleBackgroundUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setSelectedBackground(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const addText = () => {
    const newText = {
      id: Date.now(),
      text: '',
      font: FONTS[0].family,
      color: '#ffffff',

      bgColor: 'transparent',
      size: 24,
      align: 'center',
      shadow: { x: 2, y: 2, blur: 4, color: 'rgba(0,0,0,0.5)' },

      x: 50,
      y: 50,
    };
    setTexts([...texts, newText]);
    setSelectedTextId(newText.id);
  };

  const updateSelectedText = (updates) => {
    setTexts(texts.map(t => t.id === selectedTextId ? { ...t, ...updates } : t));
  };

  const copyText = () => {
    const textToCopy = texts.find(t => t.id === selectedTextId);
    if (textToCopy) {
      const newText = { ...textToCopy, id: Date.now(), x: textToCopy.x + 5, y: textToCopy.y + 5 };
      setTexts([...texts, newText]);
      setSelectedTextId(newText.id);
    }
  };

  const removeText = () => {
    setTexts(texts.filter(t => t.id !== selectedTextId));
    setSelectedTextId(null);
  };

  const inlineSafeColorsForHtml2Canvas = (rootElement) => {
    if (!rootElement) return () => {};
    const elements = [rootElement, ...rootElement.querySelectorAll('*')];
    const updated = [];
    const colorProps = ['color', 'background-color', 'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color', 'outline-color', 'text-decoration-color', 'caret-color', 'fill', 'stroke'];
    const shadowProps = ['box-shadow', 'text-shadow'];

    elements.forEach((el) => {
      const computed = window.getComputedStyle(el);
      const previous = {};
      colorProps.forEach((prop) => {
        const value = computed.getPropertyValue(prop);
        if (!value) return;
        previous[prop] = el.style.getPropertyValue(prop);
        if (value.includes('oklab') || value.includes('oklch')) {
          const fallback = prop === 'background-color' ? 'transparent' : (prop === 'color' ? el.style.color || '#000000' : '#000000');
          el.style.setProperty(prop, fallback, 'important');
        } else {
          el.style.setProperty(prop, value, 'important');
        }
      });
      shadowProps.forEach((prop) => {
        const value = computed.getPropertyValue(prop);
        if (!value) return;
        previous[prop] = el.style.getPropertyValue(prop);
        if (value.includes('oklab') || value.includes('oklch')) {
          el.style.setProperty(prop, 'none', 'important');
        } else {
          el.style.setProperty(prop, value, 'important');
        }
      });
      updated.push({ el, previous });
    });

    return () => {
      updated.forEach(({ el, previous }) => {
        Object.entries(previous).forEach(([prop, value]) => {
          if (value) el.style.setProperty(prop, value);
          else el.style.removeProperty(prop);
        });
      });
    };
  };

  const getNextPosition = (t, info) => {
    if (!posterRef.current) return { x: t.x, y: t.y };
    const rect = posterRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    if (!width || !height) return { x: t.x, y: t.y };

    const startX = parseFloat(t.x || 50);
    const startY = parseFloat(t.y || 50);
    const deltaX = (info.offset.x / width) * 100;
    const deltaY = (info.offset.y / height) * 100;

    return {
      x: (startX + deltaX).toFixed(2),
      y: (startY + deltaY).toFixed(2)
    };
  };

  const handleExport = async () => {

    if (!posterRef.current || !window.html2canvas) return;
    setSelectedTextId(null); // Deselect text before export
    setIsExporting(true);
    // Give state a moment to update
    await new Promise(r => setTimeout(r, 100));
    const restoreStyles = inlineSafeColorsForHtml2Canvas(posterRef.current);

    try {
      const canvas = await window.html2canvas(posterRef.current, {
        useCORS: true,
        scale: 3,
        backgroundColor: null
      });
      const link = document.createElement('a');
      link.download = `custom-poster-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      restoreStyles();
      setIsExporting(false);
    }
  };


  const selectedText = texts.find(t => t.id === selectedTextId);

  return (
    <div className="fixed inset-0 z-[3000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-0 md:p-6 lg:p-10 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full h-full md:h-[90vh] md:max-w-[1000px] bg-slate-50 flex flex-col overflow-hidden md:rounded-[2.5rem] shadow-2xl relative"
      >
        {/* Header */}
        <div className="h-14 md:h-16 px-4 md:px-8 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors border-none cursor-pointer">
              <X size={20} className="text-slate-600" />
            </button>
            <h2 className="text-sm md:text-lg font-bold text-slate-800">Custom Poster Editor</h2>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleExport}
              disabled={isExporting}
              className="px-4 md:px-6 py-2 bg-indigo-600 text-white rounded-xl text-[10px] md:text-sm font-black uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700 transition-all border-none cursor-pointer shadow-lg shadow-indigo-200 disabled:opacity-50"
            >
              {isExporting ? 'Exporting...' : <><Download size={16} /> Finish</>}
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-100">
          {/* Editor Preview Area */}
          <div className="flex-[1.2] flex flex-col items-center justify-center p-4 md:p-8 overflow-auto bg-slate-200/50 relative">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            
            <div 
              ref={posterRef}
              className={`relative bg-white shadow-2xl aspect-square w-full max-w-[500px] overflow-hidden ${isExporting ? '' : 'rounded-lg md:rounded-2xl'}`}
              onClick={(e) => {
                if (e.target === e.currentTarget) setSelectedTextId(null);
              }}
            >


            {selectedBackground && (
              <img src={selectedBackground} className="absolute inset-0 w-full h-full object-cover pointer-events-none" alt="BG" crossOrigin="anonymous" />
            )}

            {/* Dealing India Branding Badge */}
            <div className="absolute top-[3%] right-[3%] z-[95] flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-full border border-black/10 shadow-lg pointer-events-none">
              <img src="/dealing-india-logo.png" className="w-6 h-6 object-contain" alt="DI" crossOrigin="anonymous" />
              <span className="text-black font-black tracking-tighter text-[10px] uppercase whitespace-nowrap">Dealingindia</span>
            </div>

            
            {texts.map(t => (
              <motion.div
                key={t.id}
                drag
                dragMomentum={false}
                dragConstraints={posterRef}

                onDragEnd={(e, info) => {
                  const nextPos = getNextPosition(t, info);
                  setTexts(prev => prev.map(item => item.id === t.id ? { ...item, ...nextPos } : item));
                }}
                animate={{ x: 0, y: 0 }}
                transition={{ duration: 0 }}


                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedTextId(t.id);
                }}
                className={`absolute cursor-move select-none rounded-[20px] flex items-center justify-center`}
                style={{ 
                  left: `${t.x}%`, 
                  top: `${t.y}%`, 
                  color: t.color, 
                  backgroundColor: t.bgColor,
                  fontFamily: t.font,
                  fontSize: `${t.size}px`,
                  textAlign: t.align,
                  textShadow: `${t.shadow.x}px ${t.shadow.y}px ${t.shadow.blur}px ${t.shadow.color}`,
                  transform: 'translate(-50%, -50%)',
                  whiteSpace: 'pre-wrap',
                  overflowWrap: 'anywhere',
                  wordBreak: 'break-word',
                  zIndex: selectedTextId === t.id ? 100 : 10,
                  width: 'fit-content',
                  maxWidth: '85%',
                  padding: '12px 24px',

                  overflow: 'visible',
                  border: selectedTextId === t.id ? '2px solid rgba(99, 102, 241, 0.5)' : '2px solid rgba(0,0,0,0)'
                }}
              >
                {selectedTextId === t.id ? (
                  <div className="relative w-full h-full min-w-[30px]">
                    {/* Mirror element to drive container size */}
                    <div 
                      className="invisible whitespace-pre-wrap break-words min-h-[1em]"
                      style={{ 
                        fontFamily: 'inherit', 
                        fontSize: 'inherit', 
                        lineHeight: 'tight',
                        padding: '0',
                        maxWidth: '100%',
                        overflowWrap: 'anywhere'

                      }}
                    >
                      {t.text || ' '}
                    </div>
                    {/* Actual input */}
                    <textarea
                      autoFocus
                      value={t.text}
                      placeholder="Type..."
                      onChange={(e) => updateSelectedText({ text: e.target.value })}
                      className="absolute inset-0 w-full h-full bg-transparent border-none outline-none resize-none overflow-hidden text-center p-0 leading-tight"
                      style={{ 
                        color: 'inherit', 
                        fontFamily: 'inherit', 
                        fontSize: 'inherit', 
                        textAlign: 'inherit',
                        wordBreak: 'break-word'
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                ) : (
                  <span style={{ display: 'block', width: '100%', whiteSpace: 'pre-wrap' }}>
                    {t.text || <span className="opacity-40 italic">Type your text here</span>}
                  </span>
                )}




              </motion.div>
            ))}

            {/* Branding Overlay */}
            <div 
              className="absolute top-1 right-3 z-[90] flex items-center gap-1.5 px-2.5 py-1 rounded-full pointer-events-none"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center'
              }}
            >

              <img 
                src="/dealing-india-logo.png" 
                className="w-5 h-5 object-contain" 
                alt="DI" 
                crossOrigin="anonymous"
              />
              <span className="text-black font-black text-[10px] uppercase tracking-tight" style={{ color: '#000000' }}>Dealingindia</span>
            </div>

          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="flex-1 md:w-[400px] bg-white border-l border-slate-200 flex flex-col shrink-0 overflow-hidden">
          {/* Main Tabs */}
          <div className="flex border-b border-slate-100 bg-white shrink-0">
            <button 
              onClick={() => setActiveTab('background')}
              className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all border-none cursor-pointer ${activeTab === 'background' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}
            >
              Background
            </button>
            <button 
              onClick={() => setActiveTab('text')}
              className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all border-none cursor-pointer ${activeTab === 'text' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}
            >
              Edit Text
            </button>
          </div>

          <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {activeTab === 'background' && (
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Upload size={14} /> Global Assets
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div 
                      onClick={() => backgroundInputRef.current?.click()}
                      className="aspect-square border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1 hover:border-indigo-400 hover:bg-indigo-50 transition-all cursor-pointer group"
                    >
                      <Plus size={20} className="text-slate-300 group-hover:text-indigo-600" />
                      <span className="text-[8px] font-bold text-slate-400">Custom</span>
                      <input type="file" hidden ref={backgroundInputRef} accept="image/*" onChange={handleBackgroundUpload} />
                    </div>
                    {backgrounds.map(bg => (
                      <div 
                        key={bg._id}
                        onClick={() => setSelectedBackground(bg.image)}
                        className={`aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all hover:scale-105 ${selectedBackground === bg.image ? 'border-indigo-600 scale-95 shadow-lg' : 'border-slate-100'}`}
                      >
                        <img src={bg.image} className="w-full h-full object-cover" alt="BG" crossOrigin="anonymous" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'text' && (
              <div className="flex flex-col h-full">
                <div className="p-6 pb-2 shrink-0">
                  <button 
                    onClick={addText}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-black transition-all border-none cursor-pointer shadow-xl shadow-slate-200"
                  >
                    <Plus size={18} /> Add New Text
                  </button>
                </div>

                {selectedText ? (
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Sub Tabs for Text Styling */}
                    <div className="flex px-4 gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden shrink-0 py-2">
                      {[
                        { id: 'font', label: 'Fonts' },
                        { id: 'box', label: 'Box' },
                        { id: 'color', label: 'Color' },
                        { id: 'align', label: 'Align' },
                        { id: 'shadow', label: 'Shadow' }
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setTextTab(tab.id)}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter whitespace-nowrap transition-all border-none cursor-pointer ${textTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 pt-2">
                      <motion.div 
                        key={textTab}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                      >
                        <div className="flex items-center justify-between">
                           <div className="flex gap-1 ml-auto">
                            <button onClick={copyText} className="p-2 hover:bg-slate-100 rounded-lg transition-colors border-none cursor-pointer text-slate-400"><Copy size={16} /></button>
                            <button onClick={removeText} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors border-none cursor-pointer"><Trash2 size={16} /></button>
                          </div>
                        </div>

                        {textTab === 'font' && (
                          <div className="grid grid-cols-2 gap-2">
                            {FONTS.map(f => (
                              <button 
                                key={f.name}
                                onClick={() => updateSelectedText({ font: f.family })}
                                className={`p-3 rounded-xl border-2 text-sm transition-all cursor-pointer ${selectedText.font === f.family ? 'border-indigo-600 bg-white shadow-md' : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-100'}`}
                                style={{ fontFamily: f.family }}
                              >
                                {f.name}
                              </button>
                            ))}
                          </div>
                        )}

                        {textTab === 'color' && (
                          <div className="grid grid-cols-6 gap-3">
                            {COLORS.map(c => (
                              <button 
                                key={c}
                                onClick={() => updateSelectedText({ color: c })}
                                className={`aspect-square rounded-full border-2 transition-transform hover:scale-110 border-none cursor-pointer ${selectedText.color === c ? 'border-indigo-600 scale-110 shadow-md' : 'border-white'}`}
                                style={{ backgroundColor: c }}
                              />
                            ))}
                          </div>
                        )}

                        {textTab === 'box' && (
                          <div className="grid grid-cols-6 gap-3">
                            <button 
                              onClick={() => updateSelectedText({ bgColor: 'transparent' })}
                              className={`aspect-square rounded-full border-2 transition-transform hover:scale-110 border-none cursor-pointer flex items-center justify-center ${selectedText.bgColor === 'transparent' ? 'border-indigo-600 scale-110 shadow-md' : 'border-white bg-slate-100'}`}
                            >
                              <X size={14} className="text-slate-400" />
                            </button>
                            {COLORS.map(c => (
                              <button 
                                key={c}
                                onClick={() => updateSelectedText({ bgColor: c })}
                                className={`aspect-square rounded-full border-2 transition-transform hover:scale-110 border-none cursor-pointer ${selectedText.bgColor === c ? 'border-indigo-600 scale-110 shadow-md' : 'border-white'}`}
                                style={{ backgroundColor: c }}
                              />
                            ))}
                          </div>
                        )}

                        {textTab === 'align' && (
                          <div className="space-y-6">
                            <div className="flex gap-2">
                              <button onClick={() => updateSelectedText({ align: 'left' })} className={`flex-1 h-14 rounded-2xl transition-all border-none cursor-pointer flex items-center justify-center ${selectedText.align === 'left' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}><AlignLeft size={24} /></button>
                              <button onClick={() => updateSelectedText({ align: 'center' })} className={`flex-1 h-14 rounded-2xl transition-all border-none cursor-pointer flex items-center justify-center ${selectedText.align === 'center' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}><AlignCenter size={24} /></button>
                              <button onClick={() => updateSelectedText({ align: 'right' })} className={`flex-1 h-14 rounded-2xl transition-all border-none cursor-pointer flex items-center justify-center ${selectedText.align === 'right' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}><AlignRight size={24} /></button>
                            </div>
                            <div className="space-y-4">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Text Size</label>
                              <input 
                                type="range" min="10" max="150" 
                                value={selectedText.size} 
                                onChange={(e) => updateSelectedText({ size: parseInt(e.target.value) })}
                                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                              />
                            </div>
                          </div>
                        )}

                        {textTab === 'shadow' && (
                          <div className="space-y-6">
                            <div className="space-y-4">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Shadow Offset</label>
                              <input 
                                type="range" min="-20" max="20" 
                                value={selectedText.shadow.x} 
                                onChange={(e) => updateSelectedText({ shadow: { ...selectedText.shadow, x: parseInt(e.target.value), y: parseInt(e.target.value) } })}
                                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                              />
                            </div>
                            <div className="space-y-4">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Shadow Blur</label>
                              <input 
                                type="range" min="0" max="40" 
                                value={selectedText.shadow.blur} 
                                onChange={(e) => updateSelectedText({ shadow: { ...selectedText.shadow, blur: parseInt(e.target.value) } })}
                                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                              />
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <Type size={48} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-xs font-bold text-slate-400 leading-relaxed">Select a text block to customize<br/>or add a new one</p>
                  </div>
                )}
              </div>
            )}
          </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};


export default CustomPosterEditor;
