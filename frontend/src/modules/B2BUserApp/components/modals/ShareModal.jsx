import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Copy, CheckCircle, MessageCircle, X, Facebook, Twitter, Linkedin } from 'lucide-react';

const ShareModal = ({ isOpen, onClose, shareLink, isVideo }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const message = `I created this ${isVideo ? 'video greeting' : 'greeting'} using Dealingindia Poster app. Download Dealingindia Poster now to create custom WhatsApp status -\n\n${shareLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`, '_blank');
  };

  const handleTwitter = () => {
    const text = `Check out this ${isVideo ? 'video greeting' : 'greeting'} I created on Dealingindia Poster app!`;
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareLink)}&text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleLinkedin = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareLink)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div 
        className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Share2 size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-800 leading-none">Share Design</h3>
              <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Spread the word</p>
            </div>
          </div>
          <button className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 border-none cursor-pointer" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="flex flex-col items-center gap-2 cursor-pointer group" onClick={handleWhatsApp}>
              <div className="w-12 h-12 rounded-full bg-[#25D366]/10 flex items-center justify-center text-[#25D366] group-hover:scale-110 transition-transform">
                <MessageCircle size={24} />
              </div>
              <span className="text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider">WhatsApp</span>
            </div>
            <div className="flex flex-col items-center gap-2 cursor-pointer group" onClick={handleFacebook}>
              <div className="w-12 h-12 rounded-full bg-[#1877F2]/10 flex items-center justify-center text-[#1877F2] group-hover:scale-110 transition-transform">
                <Facebook size={24} />
              </div>
              <span className="text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider">Facebook</span>
            </div>
            <div className="flex flex-col items-center gap-2 cursor-pointer group" onClick={handleTwitter}>
              <div className="w-12 h-12 rounded-full bg-[#1DA1F2]/10 flex items-center justify-center text-[#1DA1F2] group-hover:scale-110 transition-transform">
                <Twitter size={24} />
              </div>
              <span className="text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider">Twitter</span>
            </div>
            <div className="flex flex-col items-center gap-2 cursor-pointer group" onClick={handleLinkedin}>
              <div className="w-12 h-12 rounded-full bg-[#0A66C2]/10 flex items-center justify-center text-[#0A66C2] group-hover:scale-110 transition-transform">
                <Linkedin size={24} />
              </div>
              <span className="text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider">LinkedIn</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[0.7rem] font-black text-gray-400 uppercase tracking-widest pl-1">Or copy link</label>
            <div className="flex items-center gap-2 bg-gray-50 p-2 pl-4 rounded-2xl border border-gray-100">
              <input 
                type="text" 
                readOnly 
                value={shareLink} 
                className="flex-1 bg-transparent border-none outline-none text-xs font-bold text-gray-600 truncate"
              />
              <button 
                onClick={handleCopy}
                className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 border-none cursor-pointer transition-colors ${copied ? 'bg-green-500 text-white' : 'bg-white text-gray-700 shadow-sm'}`}
              >
                {copied ? <><CheckCircle size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ShareModal;
