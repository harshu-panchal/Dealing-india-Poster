import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import TemplateCard from '../components/posters/TemplateCard';
import { useEditor } from '../context/EditorContext';
import { ArrowLeft } from 'lucide-react';

const CategoryDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { openDetail } = useEditor();
  const [templates, setTemplates] = useState([]);
  const [title, setTitle] = useState('Loading...');
  const [isLoading, setIsLoading] = useState(true);

  const isSubcategory = searchParams.get('type') === 'subcategory';
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch templates for this specific category/subcategory
        const queryParam = isSubcategory ? `subcategory=${id}` : `category=${id}`;
        const { data } = await axios.get(`${API_URL}/user/templates?${queryParam}&limit=100`);
        setTemplates(data.templates);

        // Fetch name for title
        const { data: catData } = await axios.get(`${API_URL}/user/categories`);
        if (isSubcategory) {
          // Find the subcategory name across all categories
          categories_loop: for (const cat of catData) {
            for (const sub of (cat.subcategories || [])) {
              if (sub._id === id) {
                setTitle(sub.name);
                break categories_loop;
              }
            }
          }
        } else {
          const cat = catData.find(c => c._id === id);
          if (cat) setTitle(cat.name);
        }
      } catch (error) {
        console.error('Fetch detail error:', error);
        setTitle('Error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, isSubcategory, API_URL]);

  return (
    <div className="py-md px-4 min-h-screen bg-bg">
      <div className="mb-md pt-4">
        <button 
          className="bg-gray-100 hover:bg-gray-200 border-none p-2 rounded-full flex items-center gap-2 text-gray-600 font-bold mb-6 transition-colors" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} /> Back
        </button>
        <h1 className="text-3xl font-black text-gray-800 lowercase first-letter:uppercase tracking-tight whitespace-nowrap overflow-hidden text-ellipsis mr-10">{title}</h1>
        <p className="text-gray-400 font-medium text-[0.85rem]">Choose a template to start creating your {title.toLowerCase()} poster</p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-30">
           <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4" />
           <span className="text-xs font-black uppercase tracking-widest">Gathering Templates...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
          {templates.map(tpl => (
            <TemplateCard 
               key={tpl._id} 
               template={tpl} 
               onClick={() => openDetail(tpl)} 
               showActions={true} 
            />
          ))}
          {templates.length === 0 && (
            <div className="col-span-full text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-[0.7rem]">No templates available yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryDetail;
