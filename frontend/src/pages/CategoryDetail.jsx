import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CATEGORIES, TEMPLATES } from '../utils/mockData';
import TemplateCard from '../components/posters/TemplateCard';
import { useEditor } from '../context/EditorContext';
import { ArrowLeft } from 'lucide-react';

const CategoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { openEditor } = useEditor();
  const category = CATEGORIES.find(c => c.id === parseInt(id));

  const categoryTemplates = TEMPLATES.filter(t => t.category === category?.title);

  return (
    <div className="py-md">
      <div className="mb-md">
        <button className="bg-transparent flex items-center gap-2 text-primary font-semibold mb-md" onClick={() => navigate('/categories')}>
          <ArrowLeft size={18} /> Back to Categories
        </button>
        <h1 className="text-2xl font-bold">{category ? `${category.title} Templates` : 'Category Not Found'}</h1>
        <p className="text-text-secondary">Choose a template to start creating your {category?.title.toLowerCase()} poster</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md">
        {categoryTemplates.map(tpl => (
          <TemplateCard key={tpl.id} template={tpl} onClick={() => openEditor(tpl)} />
        ))}
        {categoryTemplates.length === 0 && (
          <div className="col-span-full text-center py-xl bg-card rounded-md text-text-secondary">
            <p>No templates found in this category yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryDetail;
