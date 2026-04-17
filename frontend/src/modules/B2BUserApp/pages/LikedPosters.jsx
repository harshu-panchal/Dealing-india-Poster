import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TemplateCard from '../components/posters/TemplateCard';
import { useEditor } from '../context/EditorContext';
import { useAuth } from '../context/AuthContext';
import { Heart, Sparkles, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LikedPosters = () => {
  const { openDetail } = useEditor();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [likedPosters, setLikedPosters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

  useEffect(() => {
    const fetchLikedPosters = async () => {
      try {
        setIsLoading(true);
        if (user?.accessToken) {
          const { data } = await axios.get(`${API_URL}/user/templates/liked`, {
            headers: { Authorization: `Bearer ${user.accessToken}` }
          });
          // Ensure we mark them as liked for the TemplateCard UI
          const markedPosters = data.map(p => ({ ...p, isLiked: true }));
          setLikedPosters(markedPosters);
        }
      } catch (error) {
        console.error('Fetch liked posters error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLikedPosters();
  }, [user, API_URL]);

  if (isLoading) {
    return (
      <div className="p-4 space-y-6 bg-white min-h-screen">
        <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-100 rounded w-1/4"></div>
            <div className="h-4 bg-gray-50 rounded w-2/3"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
            {[1,2,3,4].map(i => <div key={i} className="aspect-square bg-gray-50 rounded-2xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 min-h-screen bg-[#f8fafc] lg:px-6 pb-24">
      <div className="mb-8 px-4 flex items-center justify-between">
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
                <button 
                  onClick={() => navigate(-1)}
                  className="p-2 hover:bg-white rounded-full transition-colors lg:hidden"
                >
                  <ChevronLeft size={24} />
                </button>
                <div className="flex items-center gap-2">
                  <Heart className="text-red-500 fill-red-500 animate-pulse" size={24} />
                  <h1 className="text-2xl font-black text-slate-800 tracking-tight">Liked Collection</h1>
                </div>
            </div>
            <p className="text-slate-400 font-bold text-[0.85rem] ml-0 lg:ml-0">
              {likedPosters.length} {likedPosters.length === 1 ? 'poster' : 'posters'} saved to your wishlist
            </p>
        </div>
      </div>

      {likedPosters.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
          {likedPosters.map(tpl => (
            <TemplateCard 
              key={tpl._id} 
              template={tpl} 
              onClick={() => openDetail(tpl)} 
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-10 text-center">
            <div className="w-24 h-24 bg-white shadow-xl shadow-slate-200/50 rounded-[32px] flex items-center justify-center mb-8 rotate-3">
                <Heart size={44} className="text-slate-100 fill-slate-50" />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2 uppercase tracking-widest leading-none">Your list is empty</h3>
            <p className="text-slate-400 max-w-[280px] text-sm font-bold mb-10 leading-relaxed">
              Find designs you love in the main gallery and click the heart icon to save them here!
            </p>
            <button 
                onClick={() => navigate('/')}
                className="bg-[#1e1e1e] text-white font-black px-10 py-5 rounded-3xl shadow-2xl active:scale-95 transition-all uppercase tracking-[0.2em] text-[0.7rem] border-none"
            >
                Explore Gallery
            </button>
        </div>
      )}
    </div>
  );
};

export default LikedPosters;
