import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Send, Loader2, MessageSquare, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const FeedbackModal = ({ isOpen, onClose, user }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }
    if (!message.trim()) {
      alert('Please enter your feedback message');
      return;
    }

    setLoading(true);
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.accessToken}` }
      };
      
      await axios.post(`${API_URL}/user/feedback`, { message, rating }, config);
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        // Reset state after closing
        setRating(0);
        setMessage('');
        setSubmitted(false);
      }, 2000);
    } catch (error) {
      console.error('Feedback error:', error);
      alert(error.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          {/* Backdrop with higher blur for better focus */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-[8px] cursor-pointer"
          />

          {/* Modal Content - Fixed Centering for stability */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            style={{ width: 'min(500px, 92vw)', minHeight: '300px' }}
            className="relative bg-white rounded-[40px] shadow-[0_25px_70px_rgba(0,0,0,0.3)] overflow-hidden z-[10000] flex flex-col mx-auto"
          >
            {/* Header / Pull bar area */}
            <div className="w-full h-8 flex items-center justify-center shrink-0">
               <div className="w-12 h-1.5 bg-slate-100 rounded-full mt-2" />
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-10 pt-4 sm:px-12 sm:pb-12 sm:pt-6 custom-scrollbar">
              {/* Close Button */}
              <button 
                onClick={onClose}
                className="absolute top-8 right-8 p-3 text-slate-400 hover:text-[#ef4444] hover:bg-red-50 rounded-2xl transition-all active:scale-90 z-20"
              >
                <X size={20} />
              </button>

              {!submitted ? (
                <div className="w-full">
                  <div className="flex flex-col items-center sm:items-start gap-5 mb-10 text-center sm:text-left">
                    <div className="w-16 h-16 bg-indigo-50 rounded-[24px] flex items-center justify-center text-indigo-600 shrink-0 shadow-sm border border-indigo-100/50">
                      <MessageSquare size={32} />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-tight">Share Feedback</h2>
                      <p className="text-[0.7rem] font-black text-slate-400 uppercase tracking-[0.2em] mt-1.5">Improve Dealingindia experience</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-8 w-full">
                    {/* Rating Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between px-1">
                        <label className="text-[0.7rem] font-black text-slate-400 uppercase tracking-widest">Experience Rating</label>
                        <span className="text-[0.7rem] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">
                          {rating > 0 ? `${rating} / 5` : 'Rate Us'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between bg-slate-50/50 p-5 rounded-[24px] border border-slate-100">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHover(star)}
                            onMouseLeave={() => setHover(0)}
                            className="p-1 focus:outline-none transition-all active:scale-75 hover:scale-125"
                          >
                            <Star
                              size={38}
                              className={`transition-all duration-300 ${
                                star <= (hover || rating)
                                  ? 'fill-amber-400 text-amber-400 filter drop-shadow-md'
                                  : 'text-slate-200'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Message Section */}
                    <div className="space-y-4">
                      <label className="text-[0.7rem] font-black text-slate-400 uppercase tracking-widest ml-1">Your detailed thoughts</label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Suggestions, bugs, or praise..."
                        className="w-full bg-slate-50 border border-slate-100 rounded-[28px] p-7 h-44 text-[1rem] font-bold text-slate-700 outline-none focus:border-indigo-200 focus:bg-white focus:ring-8 focus:ring-indigo-500/5 transition-all resize-none shadow-inner placeholder:text-slate-300"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-slate-950 text-white py-5 rounded-[28px] font-black text-[0.8rem] tracking-[0.2em] uppercase flex items-center justify-center gap-4 shadow-2xl shadow-slate-300 hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50 border-none cursor-pointer mt-4"
                    >
                      {loading ? (
                        <Loader2 size={24} className="animate-spin" />
                      ) : (
                        <>
                          SUBMIT <Send size={20} className="rotate-[-10deg]" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="py-20 flex flex-col items-center text-center space-y-8 w-full">
                  <motion.div
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="w-24 h-24 bg-emerald-50 rounded-[32px] flex items-center justify-center text-emerald-500 border border-emerald-100 shadow-sm"
                  >
                    <CheckCircle2 size={48} />
                  </motion.div>
                  <div className="space-y-3">
                    <h2 className="text-4xl font-black text-slate-800 tracking-tight">Sent!</h2>
                    <p className="text-slate-400 font-bold max-w-[280px] mx-auto text-base leading-relaxed">Your feedback is being reviewed by our team. Thank you!</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default FeedbackModal;
