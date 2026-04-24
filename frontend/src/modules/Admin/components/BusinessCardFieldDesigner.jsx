import React, { useState, useRef, useEffect } from 'react';
import {
  Move, Type, ImageIcon, Plus, Trash2,
  Briefcase, Phone, Mail, Globe, MapPin, Building, Save, X
} from 'lucide-react';

const FIELD_TYPES = [
  { key: 'name',          label: 'Full Name',      icon: Type,      type: 'text'  },
  { key: 'designation',   label: 'Designation',    icon: Briefcase, type: 'text'  },
  { key: 'phone',         label: 'Phone',          icon: Phone,     type: 'text'  },
  { key: 'email',         label: 'Email',          icon: Mail,      type: 'text'  },
  { key: 'website',       label: 'Website',        icon: Globe,     type: 'text'  },
  { key: 'address',       label: 'Address',        icon: MapPin,    type: 'text'  },
  { key: 'business_name', label: 'Business Name',  icon: Building,  type: 'text'  },
  { key: 'logo',          label: 'Logo',           icon: ImageIcon, type: 'image' },
];

const BusinessCardFieldDesigner = ({ imageUrl, fields = [], onSave, onClose }) => {
  const [localFields, setLocalFields] = useState(fields || []);
  const containerRef = useRef(null);
  const dragRef = useRef(null);

  // Sync state when props change
  useEffect(() => {
    setLocalFields(fields || []);
  }, [fields]);

  const addField = (fieldMeta) => {
    if (localFields.find(f => f.key === fieldMeta.key)) return;
    setLocalFields(prev => [
      ...prev,
      {
        key:   fieldMeta.key,
        label: fieldMeta.label,
        type:  fieldMeta.type || 'text',
        position: { x: '10%', y: '10%' },
        style:    { fontSize: '14px', color: '#000000', fontWeight: 'bold' },
        size:     fieldMeta.type === 'image'
                    ? { width: '50px', height: '50px' }
                    : { width: 'auto', height: 'auto' },
      }
    ]);
  };

  const removeField = (key) =>
    setLocalFields(prev => prev.filter(f => f.key !== key));

  const handlePointerDown = (e, key) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const field = localFields.find(f => f.key === key);
    dragRef.current = {
      key,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startX: parseFloat(field.position.x),
      startY: parseFloat(field.position.y),
    };
  };

  const handlePointerMove = (e) => {
    if (!dragRef.current || !containerRef.current) return;
    const { key, startClientX, startClientY, startX, startY } = dragRef.current;
    const { width, height } = containerRef.current.getBoundingClientRect();
    const dx = ((e.clientX - startClientX) / width)  * 100;
    const dy = ((e.clientY - startClientY) / height) * 100;
    const newX = Math.max(0, Math.min(90, startX + dx));
    const newY = Math.max(0, Math.min(90, startY + dy));
    setLocalFields(prev =>
      prev.map(f =>
        f.key === key
          ? { ...f, position: { x: `${newX.toFixed(1)}%`, y: `${newY.toFixed(1)}%` } }
          : f
      )
    );
  };

  const handlePointerUp = () => { dragRef.current = null; };

  const updateStyle = (key, patch) =>
    setLocalFields(prev =>
      prev.map(f =>
        f.key === key ? { ...f, style: { ...f.style, ...patch } } : f
      )
    );

  return (
    <div className="flex flex-col lg:flex-row gap-6 bg-white h-full overflow-hidden min-h-[500px]">
      <div className="w-full lg:w-64 flex flex-col gap-5 shrink-0 overflow-y-auto border-r border-slate-100 pr-4">
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Available Fields</p>
          <div className="flex flex-col gap-1.5">
            {FIELD_TYPES.map(f => {
              const isActive = localFields.some(lf => lf.key === f.key);
              return (
                <button
                  key={f.key}
                  disabled={isActive}
                  onClick={() => addField(f)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all border-none cursor-pointer ${isActive ? 'bg-slate-50 text-slate-300 cursor-not-allowed opacity-50' : 'bg-white hover:bg-slate-50 text-slate-700 shadow-sm border border-slate-100'}`}
                >
                  <div className="flex items-center gap-2">
                    <f.icon size={13} />
                    <span className="text-[10px] font-black uppercase tracking-wider">{f.label}</span>
                  </div>
                  {!isActive && <Plus size={12} className="text-red-500" />}
                </button>
              );
            })}
          </div>
        </div>

        {localFields.length > 0 && (
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Active Layers</p>
            <div className="flex flex-col gap-1.5">
              {localFields.map(f => (
                <div key={f.key} className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                      <span className="text-[9px] font-black text-slate-700 uppercase tracking-tight">{f.label}</span>
                    </div>
                    <button onClick={() => removeField(f.key)} className="p-1 hover:bg-red-50 text-red-400 hover:text-red-500 rounded-lg border-none bg-transparent cursor-pointer">
                      <Trash2 size={11} />
                    </button>
                  </div>
                  {f.type === 'text' && (
                    <div className="flex items-center gap-2 pl-4">
                      <input type="color" value={f.style?.color || '#000000'} onChange={e => updateStyle(f.key, { color: e.target.value })} className="w-6 h-6 rounded border-none cursor-pointer bg-transparent" title="Color" />
                      <input type="number" value={parseInt(f.style?.fontSize || '14')} min={8} max={40} onChange={e => updateStyle(f.key, { fontSize: `${e.target.value}px` })} className="w-12 text-[9px] font-black border border-slate-200 rounded-lg px-1.5 py-1 text-center" title="Font Size" />
                      <span className="text-[8px] text-slate-400 font-bold">px</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <p className="text-xs font-black text-slate-800 tracking-tight">Placement Engine</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Drag fields to define their fixed positions</p>
          </div>
          <div className="flex gap-2">
            {onClose && <button onClick={onClose} className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 text-[9px] font-black uppercase tracking-widest border-none cursor-pointer flex items-center gap-1"><X size={12} /> Cancel</button>}
            <button onClick={() => onSave(localFields)} className="px-4 py-1.5 rounded-xl bg-[#ef4444] text-white text-[9px] font-black uppercase tracking-widest border-none cursor-pointer flex items-center gap-1 shadow-md shadow-red-500/20 hover:bg-red-600 transition-colors"><Save size={12} /> Save Layout</button>
          </div>
        </div>

        <div ref={containerRef} className="w-full relative rounded-xl overflow-hidden shadow-2xl bg-slate-200" style={{ aspectRatio: '1.75/1' }} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp}>
          {imageUrl ? <img src={imageUrl} className="w-full h-full object-cover pointer-events-none select-none" alt="" /> : <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Upload Template First</p></div>}
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(148,163,184,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.15) 1px, transparent 1px)', backgroundSize: '10% 10%' }} />
          {localFields.map(field => (
            <div key={field.key} onPointerDown={e => handlePointerDown(e, field.key)} className="absolute cursor-move select-none group" style={{ top: field.position.y, left: field.position.x, zIndex: 10, touchAction: 'none' }}>
              <div className="flex items-center gap-1.5 bg-[#ef4444]/90 backdrop-blur-sm px-2 py-1 rounded-md shadow-lg hover:bg-[#ef4444] transition-colors">
                <Move size={9} className="text-white" />
                <span className="text-[8px] font-black text-white uppercase tracking-tighter whitespace-nowrap">{field.label}</span>
              </div>
              <div className="absolute -top-5 left-0 opacity-0 group-hover:opacity-100 bg-slate-900 text-white text-[7px] px-1.5 py-0.5 rounded pointer-events-none whitespace-nowrap">x:{field.position.x} y:{field.position.y}</div>
              {field.type === 'text' && <div className="mt-0.5 pointer-events-none" style={{ fontSize: field.style?.fontSize || '14px', color: field.style?.color || '#000000', fontWeight: field.style?.fontWeight || 'bold', opacity: 0.85, lineHeight: 1.2, maxWidth: '120px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}>{field.label}</div>}
              {field.type === 'image' && <div className="bg-white/60 rounded border border-white/80 flex items-center justify-center" style={{ width: field.size?.width || '50px', height: field.size?.height || '50px' }}><ImageIcon size={16} className="text-slate-400" /></div>}
            </div>
          ))}
        </div>

        <div className="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3 flex items-start gap-3">
          <Move size={16} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[9px] font-bold text-amber-700 leading-relaxed">
            <span className="font-black uppercase tracking-widest block mb-0.5">Precision Tip:</span>
            Positions are percentages so they scale correctly on all screen sizes. Place every field within the safe zone. The user will only be able to edit the content, not move fields.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BusinessCardFieldDesigner;
