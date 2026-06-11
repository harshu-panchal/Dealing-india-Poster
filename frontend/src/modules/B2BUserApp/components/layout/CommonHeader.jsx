import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, User, HelpCircle, Search, Mic, CalendarCheck, Plus, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEditor } from '../../context/EditorContext';
import { getReturnUrl, hasReturnUrl } from '../../hooks/useReturnUrl';


const CommonHeader = ({ showSearch = false, onSearchChange, searchQuery, onOpenSidebar }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openCustomPosterEditor } = useEditor();
  const [hasNewUpdates, setHasNewUpdates] = React.useState(() => {
    return localStorage.getItem('has_read_updates') !== 'true';
  });
  const [showConfirmModal, setShowConfirmModal] = React.useState(false);

  const handleNotificationClick = () => {
    localStorage.setItem('has_read_updates', 'true');
    setHasNewUpdates(false);
    navigate('/whats-new');
  };

  const handleSwitchToVendor = () => {
    window.location.href = getReturnUrl();
  };

  return (
    <>
      <nav 
        className="bg-[#b91c1c] px-3 z-[1000] shadow-[0_2px_8px_rgba(0,0,0,0.1)] w-full flex-shrink-0"
        style={{ 
          paddingTop: '0.75rem',
          paddingBottom: '0.75rem'
        }}
      >
        <div className="flex items-center justify-between max-w-[1200px] mx-auto">
          <div className="flex items-center gap-1.5 md:gap-3">
            <div 
              className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#b91c1c] cursor-pointer flex-shrink-0 overflow-hidden shadow-inner border border-white/20"
              onClick={onOpenSidebar}
            >
               {user?.user?.profilePhoto ? (
                  <img src={user.user.profilePhoto} className="w-full h-full object-cover" alt="" />
               ) : (
                  <User size={18} />
               )}
            </div>
            <span className="text-white text-[1rem] md:text-[1.15rem] font-bold whitespace-nowrap">Posters</span>
            <button 
              onClick={() => setShowConfirmModal(true)}
              className="bg-[#fde047] text-[#854d0e] px-1.5 md:px-2.5 py-1 rounded-sm text-[0.6rem] md:text-[0.7rem] font-extrabold flex items-center gap-1 ml-0.5 md:ml-1 flex-shrink-0 cursor-pointer border-none outline-none shadow-sm hover:bg-[#facc15] transition-colors"
            >
              {hasReturnUrl() && <ArrowLeft size={10} strokeWidth={3} className="shrink-0" />}
               Dealingindia <span className="text-[0.8rem] md:text-[1rem] leading-none">›</span>
            </button>
          </div>



          <div className="flex items-center gap-2.5 md:gap-4">
            <button 
              onClick={openCustomPosterEditor}
              className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-[0.7rem] font-black uppercase tracking-widest transition-all border border-white/20 hidden sm:flex items-center gap-2 cursor-pointer"
            >
              <Plus size={14} /> Create Custom
            </button>

            <div 
              className="relative text-white flex items-center justify-center cursor-pointer p-1 w-8 h-8 rounded-full hover:bg-white/10 transition-colors"
              onClick={handleNotificationClick}
            >
               <Bell size={20} />
               {hasNewUpdates && (
                 <span className="absolute -top-1 -right-1 bg-[#3b82f6] text-white px-1 rounded-[10px] text-[0.55rem] font-bold border-[1.2px] border-[#b91c1c]">9+</span>
               )}
            </div>
            
            <div 
              className="relative text-white flex items-center justify-center cursor-pointer p-1 w-8 h-8 rounded-full hover:bg-white/10 transition-colors group"
              onClick={() => navigate('/calendar')}
            >
               <CalendarCheck size={20} />
               <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#3b82f6] text-white px-1.5 py-[1px] rounded-sm text-[0.45rem] font-bold uppercase whitespace-nowrap border-[1px] border-[#b91c1c]">New</div>
            </div>
            
            <div className="relative group">
               <div onClick={() => navigate('/help')} className="relative text-white flex items-center justify-center cursor-pointer p-1 w-8 h-8 rounded-full hover:bg-white/10 transition-colors">
                  <HelpCircle size={20} />
               </div>
               
               {/* Header Help Dropdown */}
               <div className="absolute top-[120%] right-0 w-[200px] bg-white rounded-2xl shadow-2xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[1001] translate-y-2 group-hover:translate-y-0 border border-slate-100">
                  <button 
                    onClick={() => navigate('/help')}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 text-slate-600 hover:text-red-600 border-none transition-colors cursor-pointer"
                  >
                     <div className="w-8 h-8 bg-slate-100 group-hover:bg-red-100 rounded-lg flex items-center justify-center">
                        <HelpCircle size={16} />
                     </div>
                     <div className="text-left">
                        <p className="text-[10px] font-black uppercase tracking-tight">Help Center</p>
                        <p className="text-[8px] font-bold opacity-60">Guides & Tutorials</p>
                     </div>
                  </button>

                  <button 
                    onClick={() => navigate('/help')}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 text-slate-600 hover:text-blue-600 border-none transition-colors cursor-pointer"
                  >
                     <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                        <Mic size={16} />
                     </div>
                     <div className="text-left">
                        <p className="text-[10px] font-black uppercase tracking-tight">Support</p>
                        <p className="text-[8px] font-bold opacity-60">Connect with us</p>
                     </div>
                  </button>

                  <div className="h-[1px] bg-slate-100 my-1 mx-2" />

                  <button 
                    onClick={() => navigate('/terms')}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-600 border-none transition-colors cursor-pointer"
                  >
                     <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                        <CalendarCheck size={16} />
                     </div>
                     <div className="text-left">
                        <p className="text-[10px] font-black uppercase tracking-tight">Terms</p>
                     </div>
                  </button>
               </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1e1e1e] rounded-2xl p-6 w-[90vw] min-w-[280px] max-w-[340px] shadow-2xl border border-white/10 animate-in fade-in zoom-in duration-200 flex flex-col">
            <h3 className="text-white text-lg font-bold mb-2 break-words">Switch to Vendor Screen</h3>
            <p className="text-slate-300 text-sm mb-6 break-words">
              Do you want to switch back to the vendor screen?
            </p>
            <div className="flex justify-end gap-3 mt-auto">
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-lg text-sm font-bold text-slate-300 hover:bg-white/10 transition-colors border-none cursor-pointer outline-none"
              >
                Cancel
              </button>
              <button 
                onClick={handleSwitchToVendor}
                className="px-4 py-2 rounded-lg text-sm font-bold text-[#1e1e1e] bg-white hover:bg-slate-200 transition-colors border-none cursor-pointer outline-none"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CommonHeader;

