import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Heart, Crown, Search, SlidersHorizontal, Layers } from 'lucide-react';
import { useEditor } from '../context/EditorContext';
import { useAuth } from '../context/AuthContext';

const ViewAll = () => {
  const { type, id } = useParams(); // type = 'category' | 'subcategory', id = mongo _id
  const navigate = useNavigate();
  const { openDetail } = useEditor();
  const { user } = useAuth();

  const [templates, setTemplates] = useState([]);
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [likedIds, setLikedIds] = useState({});
  const [sortBy, setSortBy] = useState('newest'); // newest | popular

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5003/api';

  const isSubcategory = type === 'subcategory';
  const isBusinessCard = title?.toLowerCase().includes('business card');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch templates
        const queryParam = isSubcategory ? `subcategory=${id}` : `category=${id}`;
        const { data } = await axios.get(`${API_URL}/user/templates?${queryParam}&limit=200`);
        setTemplates(data.templates || []);

        // Fetch category/subcategory name
        const { data: catData } = await axios.get(`${API_URL}/user/categories`);
        if (isSubcategory) {
          outer: for (const cat of catData) {
            for (const sub of (cat.subcategories || [])) {
              if (sub._id === id) {
                setTitle(sub.name);
                break outer;
              }
            }
          }
        } else {
          const cat = catData.find(c => c._id === id);
          if (cat) setTitle(cat.name);
        }
      } catch (err) {
        console.error('ViewAll fetch error:', err);
        setTitle('Templates');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, isSubcategory, API_URL]);

  // Sync liked state from templates
  useEffect(() => {
    const map = {};
    templates.forEach(t => {
      if (t.isLiked) map[t._id] = true;
    });
    setLikedIds(map);
  }, [templates]);

  const handleLike = async (e, tplId) => {
    e.stopPropagation();
    if (!user?.accessToken) return;
    try {
      const { data } = await axios.post(
        `${API_URL}/user/templates/${tplId}/like`,
        {},
        { headers: { Authorization: `Bearer ${user.accessToken}` } }
      );
      setLikedIds(prev => ({ ...prev, [tplId]: data.liked }));
    } catch (err) {
      console.error('Like failed:', err);
    }
  };

  const handleCardClick = (tpl) => {
    // Business card → open PosterDetail (which has the business card editor flow)
    // Regular poster → open PosterDetail
    // Both use openDetail from EditorContext — the detail sheet handles routing to editor
    openDetail(tpl);
  };

  // Filter + sort
  const displayTemplates = useMemo(() => {
    let list = [...templates];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(t =>
        t.title?.toLowerCase().includes(q) ||
        t.name?.toLowerCase().includes(q) ||
        t.tags?.some(tag => tag.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'popular') {
      list.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
    }

    return list;
  }, [templates, searchQuery, sortBy]);

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-24">

      {/* ── STICKY HEADER ── */}
      <div className="bg-white sticky top-0 z-[50] shadow-sm">
        {/* Top nav */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors border-none cursor-pointer shrink-0"
          >
            <ArrowLeft size={18} className="text-slate-600" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-[1rem] font-black text-slate-800 tracking-tight truncate">
              {isLoading ? 'Loading...' : title}
            </h1>
            {!isLoading && (
              <p className="text-[0.65rem] text-slate-400 font-bold uppercase tracking-widest">
                {displayTemplates.length} template{displayTemplates.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          {/* Sort toggle */}
          <button
            onClick={() => setSortBy(s => s === 'newest' ? 'popular' : 'newest')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors border-none cursor-pointer shrink-0"
          >
            <SlidersHorizontal size={14} className="text-slate-500" />
            <span className="text-[0.65rem] font-black text-slate-600 uppercase tracking-wide">
              {sortBy === 'newest' ? 'Newest' : 'Popular'}
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-2.5">
          <div className="flex items-center gap-2 bg-slate-100 rounded-2xl px-4 py-2.5">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder={`Search in ${title || 'templates'}...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm font-bold text-slate-700 placeholder:text-slate-400 outline-none border-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600 font-black text-lg leading-none border-none bg-transparent cursor-pointer"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── LOADER ── */}
      {isLoading && (
        <div className="p-4 grid grid-cols-2 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {/* ── GRID ── */}
      {!isLoading && (
        <>
          {displayTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-28 opacity-40">
              <Layers size={52} className="text-slate-300 mb-3" />
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                {searchQuery ? 'No results found' : 'No templates yet'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 p-3">
              {displayTemplates.map(tpl => (
                <TemplateGridCard
                  key={tpl._id}
                  tpl={tpl}
                  isLiked={!!likedIds[tpl._id]}
                  isBusinessCard={isBusinessCard}
                  onLike={(e) => handleLike(e, tpl._id)}
                  onClick={() => handleCardClick(tpl)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ── Individual card ──────────────────────────────────────────────────────────
const TemplateGridCard = ({ tpl, isLiked, isBusinessCard, onLike, onClick }) => {
  const isPremium = tpl.isPremium || false;
  const isVideoTemplate = tpl.isVideo || tpl.type === 'video';

  return (
    <div
      onClick={onClick}
      className="relative bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 cursor-pointer group active:scale-[0.97] transition-transform"
    >
      {/* Image */}
      <div className={`w-full overflow-hidden bg-slate-100 ${isBusinessCard ? 'aspect-[16/9]' : 'aspect-square'}`}>
        {isVideoTemplate ? (
          <video
            src={tpl.videoUrl || tpl.image}
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
          />
        ) : (
          <img
            src={tpl.image}
            alt={tpl.title || tpl.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={e => {
              e.target.src = 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=400';
            }}
          />
        )}
      </div>

      {/* Premium badge */}
      {isPremium && (
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-amber-400 px-2 py-0.5 rounded-full shadow">
          <Crown size={10} className="text-white" fill="white" />
          <span className="text-[0.55rem] font-black text-white uppercase tracking-widest">Pro</span>
        </div>
      )}

      {/* Like button */}
      <button
        onClick={onLike}
        className="absolute top-2 right-2 w-7 h-7 bg-white/85 backdrop-blur-sm rounded-full flex items-center justify-center shadow border-none cursor-pointer transition-transform active:scale-90"
      >
        <Heart
          size={13}
          className={isLiked ? 'fill-red-500 text-red-500' : 'text-slate-400'}
        />
      </button>

      {/* Video badge */}
      {isVideoTemplate && (
        <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full">
          <span className="text-[0.55rem] font-black text-white uppercase tracking-widest">Video</span>
        </div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3">
        <span className="bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-xl text-[0.65rem] font-black text-slate-800 uppercase tracking-widest shadow">
          {isBusinessCard ? 'Edit Card' : 'Use Template'}
        </span>
      </div>
    </div>
  );
};

export default ViewAll;
