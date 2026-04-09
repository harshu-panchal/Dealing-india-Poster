import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TemplateCard from '../components/posters/TemplateCard';
import { useEditor } from '../context/EditorContext';
import { useAuth } from '../context/AuthContext';
import ShimmerLoader from '../components/common/ShimmerLoader';
import { Sparkles, History } from 'lucide-react';

const MyPosters = () => {
  const { openEditor } = useEditor();
  const { user } = useAuth();
  const [myPosters, setMyPosters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

  useEffect(() => {
    const fetchMyPosters = async () => {
      try {
        setIsLoading(true);
        if (user?.accessToken) {
          const { data } = await axios.get(`${API_URL}/user/my-posters`, {
            headers: { Authorization: `Bearer ${user.accessToken}` }
          });
          setMyPosters(data);
        }
      } catch (error) {
        console.error('Fetch my posters error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyPosters();
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
    <div className="py-md min-h-screen bg-bg lg:px-6">
      <div className="mb-md px-4 pt-4">
        <div className="flex items-center gap-3 mb-1">
            <History className="text-red-500" size={24} />
            <h1 className="text-2xl font-black text-gray-800 tracking-tight">My Created Posters</h1>
        </div>
        <p className="text-gray-400 font-medium text-[0.85rem]">Manage and download your previously created designs</p>
      </div>

      {myPosters.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md lg:px-4 pb-20">
          {myPosters.map(poster => (
            <TemplateCard 
              key={poster._id} 
              template={poster} 
              onClick={() => openEditor(poster)} 
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-10 text-center">
            <div className="w-20 h-20 bg-white shadow-sm rounded-full flex items-center justify-center mb-6">
                <Sparkles size={40} className="text-gray-200" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Posters Found</h3>
            <p className="text-gray-400 max-w-[300px] text-sm mb-8">You haven't saved or shared any posters yet. Start creating now!</p>
            <button 
                onClick={() => window.location.href = '/'}
                className="bg-red-500 text-white font-black px-8 py-4 rounded-2xl shadow-lg shadow-red-200 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-xs"
            >
                Start Creating
            </button>
        </div>
      )}
    </div>
  );
};

export default MyPosters;


