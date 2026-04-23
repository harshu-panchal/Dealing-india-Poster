import React, { useState, useRef, useEffect } from 'react';
import { Move, Type, ImageIcon, Save, X, Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '../components/ui/Button';

const FIELD_TYPES = [
  { key: 'name', label: 'Person Name', icon: Type },
  { key: 'designation', label: 'Designation', icon: Briefcase },
  { key: 'phone', label: 'Phone', icon: Phone },
  { key: 'email', label: 'Email', icon: Mail },
  { key: 'website', label: 'Website', icon: Globe },
  { key: 'address', label: 'Address', icon: MapPin },
  { key: 'business_name', label: 'Business Name', icon: Building },
  { key: 'logo', label: 'Logo', icon: ImageIcon, type: 'image' }
];

import { Briefcase, Phone, Mail, Globe, MapPin, Building } from 'lucide-react';

const BusinessCardFieldDesigner = ({ imageUrl, fields = [], onSave, onClose }) => {
  const [localFields, setLocalFields] = useState(fields);
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

  const addField = (fieldMeta) => {
    if (localFields.find(f => f.key === fieldMeta.key)) return;
    const newField = {
      key: fieldMeta.key,
      label: fieldMeta.label,
      type: fieldMeta.type || 'text',
      position: { x: '10%', y: '10%' },
      style: {
        fontSize: '12px',
        color: '#000000',
        fontWeight: 'bold'
      },
      size: fieldMeta.type === 'image' ? { width: '40px', height: '40px' } : { width: 'auto', height: 'auto' }
    };
    setLocalFields([...localFields, newField]);
  };

  const removeField = (key) => {
    setLocalFields(localFields.filter(f => f.key !== key));
  };

  const handlePointerDown = (e, key) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const field = localFields.find(f => f.key === key);
    dragRef.current = {
      key,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startX: parseFloat(field.position.x),
      startY: parseFloat(field.position.y)
    };
  };

  const handlePointerMove = (e) => {
    if (!dragRef.current || !containerRef.current) return;
    const { key, startClientX, startClientY, startX, startY } = dragRef.current;
    const { width, height } = containerRef.current.getBoundingClientRect();
    
    const dx = ((e.clientX - startClientX) / width) * 100;
    const dy = ((e.clientY - startClientY) / height) * 100;
    
    const newX = Math.max(0, Math.min(95, startX + dx));
    const newY = Math.max(0, Math.min(95, startY + dy));
    
    setLocalFields(prev => prev.map(f => 
      f.key === key ? { ...f, position: { x: `${newX.toFixed(1)}%`, y: `${newY.toFixed(1)}%` } } : f
    ));
  };

  const handlePointerUp = () => {
    dragRef.current = null;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 bg-white h-full overflow-hidden">
      {/* Left: Toolbar */}
      <div className="w-full lg:w-72 flex flex-col gap-6 shrink-0 h-full overflow-y-auto pr-2">
        <div className="space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Available Fields</h3>
          <div className="grid grid-cols-1 gap-2">
            {FIELD_TYPES.map(f => {
              const isActive = localFields.some(lf => lf.key === f.key);
              return (
                <button
                  key={f.key}
                  disabled={isActive}
                  onClick={() => addField(f)}
                  className={`flex items-center justify-between p-3 rounded-xl border-none text-left transition-all cursor-pointer ${isActive ? 'bg-slate-50 text-slate-300 opacity-50 cursor-not-allowed' : 'bg-white hover:bg-slate-50 text-slate-600 shadow-sm border border-slate-100'}`}
                >
                  <div className="flex items-center gap-3">
                    <f.icon size={16} />
                    <span className="text-[10px] font-black uppercase tracking-wider">{f.label}</span>
                  </div>
                  {!isActive && <Plus size={14} className="text-red-500" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Active Layers</h3>
          <div className="space-y-2">
            {localFields.map(f => (
               <div key={f.key} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-red-500" />
                     <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight">{f.key}</span>
                  </div>
                  <button onClick={() => removeField(f.key)} className="p-1 hover:bg-red-50 text-red-400 hover:text-red-500 rounded-lg border-none bg-transparent cursor-pointer">
                     <Trash2 size={14} />
                  </button>
               </div>
            ))}
          </div>
        </div>
      </div>

      {/* Center: Canvas Area */}
      <div className="flex-1 flex flex-col items-center gap-6">
        <div className="border-b border-slate-100 w-full pb-4 flex justify-between items-center">
           <div>
              <h2 className="text-sm font-black text-slate-800 tracking-tight">Placement Engine</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Drag elements to their fixed positions</p>
           </div>
           <div className="flex gap-2">
              <Button onClick={() => onSave(localFields)} className="bg-[#ef4444] text-white">Save Layout</Button>
           </div>
        </div>

        <div 
          ref={containerRef}
          className="w-full relative shadow-2xl overflow-hidden rounded-lg bg-slate-100"
          style={{ aspectRatio: '1.75/1' }}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* Background */}
          <img src={imageUrl} className="w-full h-full object-cover pointer-events-none" alt="" />

          {/* Draggable Fields */}
          {localFields.map(field => (
            <div
              key={field.key}
              onPointerDown={(e) => handlePointerDown(e, field.key)}
              className="absolute cursor-move select-none p-2 hover:ring-2 hover:ring-red-500/50 rounded-sm group transition-shadow shadow-sm bg-white/20 backdrop-blur-sm"
              style={{
                top: field.position.y,
                left: field.position.x,
                zIndex: 10,
                touchAction: 'none'
              }}
            >
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" />
                 <span className="text-[8px] font-black text-white uppercase tracking-tighter drop-shadow-md">{field.label}</span>
              </div>
              <div className="absolute -top-3 left-1/2 -translateX-1/2 opacity-0 group-hover:opacity-100 bg-slate-900 text-white text-[6px] px-1 rounded pointer-events-none">
                {field.position.x}, {field.position.y}
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex items-start gap-4">
           <Move size={20} className="text-amber-500 shrink-0" />
           <p className="text-[10px] font-bold text-amber-700 leading-relaxed">
             <span className="font-black uppercase tracking-widest block mb-1">Precision Tip:</span>
             Ensure all fields are within safe zones. These positions will be locked for the user, only their content will change. Use specialized fonts in the User Editor to enhance aesthetics.
           </p>
        </div>
      </div>
    </div>
  );
};

export default BusinessCardFieldDesigner;
