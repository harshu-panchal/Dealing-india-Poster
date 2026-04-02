import { Edit2, Download, MessageCircle, Share2, Sparkles, Video, PlayCircle, Volume2 } from 'lucide-react';
import { useEditor } from '../../context/EditorContext';

const TemplateCard = ({ template, onClick, variant = 'regular' }) => {
  const { openEditor } = useEditor();
  const handleImageError = (e) => {
    e.target.src = 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=400';
  };

  if (variant === 'compact') {
    return (
      <div 
        className="min-w-[130px] w-[130px] aspect-square rounded-md overflow-hidden bg-[#f1f5f9] relative cursor-pointer transition-transform active:scale-95 shadow-sm" 
        onClick={onClick}
      >
        <img 
          src={template.image} 
          alt={template.title} 
          className="w-full h-full object-cover" 
          onError={handleImageError}
        />
      </div>
    );
  }

  return (
    <div className="bg-white mb-1">
      <div 
        className="w-full aspect-square overflow-hidden rounded-xl relative bg-[#f8fafc] cursor-pointer" 
        onClick={onClick}
      >
        <img 
          src={template.image} 
          alt={template.title} 
          loading="lazy" 
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
        {template.isVideo && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
            <PlayCircle size={48} className="text-white fill-white/20 opacity-80" />
            <div className="absolute bottom-3 right-3 p-1.5 rounded-full bg-black/40 backdrop-blur-sm">
              <Volume2 size={16} className="text-white" />
            </div>
          </div>
        )}
      </div>
      
      <div className="flex justify-around py-3 lg:py-4 border-t border-[#f1f5f9] bg-white rounded-b-xl shadow-sm">
        <div className="flex flex-col items-center gap-1.5 flex-1 cursor-pointer hover:scale-105 active:scale-90 transition-all group" onClick={onClick}>
          <div className="w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center text-[#334155] group-hover:text-primary"><Edit2 size={20} className="lg:w-6 lg:h-6" /></div>
          <span className="text-[0.75rem] lg:text-sm font-bold text-[#64748b] group-hover:text-primary">Edit</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 flex-1 cursor-pointer hover:scale-105 active:scale-90 transition-all group" onClick={() => openEditor(template, 'video')}>
          <div className="w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center text-[#ef4444] group-hover:text-red-600"><Video size={20} className="lg:w-6 lg:h-6" /></div>
          <span className="text-[0.75rem] lg:text-sm font-bold text-[#64748b] group-hover:text-red-600">Video</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 flex-1 cursor-pointer hover:scale-105 active:scale-90 transition-all group">
          <div className="w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center text-[#334155] group-hover:text-primary"><Download size={20} className="lg:w-6 lg:h-6" /></div>
          <span className="text-[0.75rem] lg:text-sm font-bold text-[#64748b] group-hover:text-primary">Save</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 flex-1 cursor-pointer hover:scale-105 active:scale-90 transition-all group">
          <div className="w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center text-[#22c55e] group-hover:text-green-600"><MessageCircle size={20} className="lg:w-6 lg:h-6" /></div>
          <span className="text-[0.75rem] lg:text-sm font-bold text-[#64748b] group-hover:text-green-600">WhatsApp</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 flex-1 cursor-pointer hover:scale-105 active:scale-90 transition-all group">
          <div className="w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center text-[#334155] group-hover:text-primary"><Share2 size={20} className="lg:w-6 lg:h-6" /></div>
          <span className="text-[0.75rem] lg:text-sm font-bold text-[#64748b] group-hover:text-primary">Share</span>
        </div>
      </div>
    </div>
  );
};

export default TemplateCard;

