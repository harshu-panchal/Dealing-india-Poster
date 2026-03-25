import React from 'react';
import { useNavigate } from 'react-router-dom';

const CategoryCard = ({ category, variant = 'default' }) => {
  const navigate = useNavigate();
  const isCompact = variant === 'compact';

  const handleImageError = (e) => {
    e.target.src = 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=400';
  };

  return (
    <div 
      className={`bg-card rounded-md overflow-hidden cursor-pointer transition-all duration-300 border border-border hover:-translate-y-1 hover:shadow-lg hover:border-primary ${isCompact ? 'min-w-[140px]' : 'min-w-[160px]'} group`}
      onClick={() => navigate(`/category/${category.id}`)}
    >
      <div className="relative aspect-square overflow-hidden">
        <img 
          src={category.image} 
          alt={category.title} 
          loading="lazy" 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
          onError={handleImageError}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-sm opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="text-white text-[0.75rem] font-medium">{category.count}+ Templates</span>
        </div>
      </div>
      <div className="p-sm text-center">
        <h3 className="text-[0.95rem] font-semibold">{category.title}</h3>
        {variant === 'default' && <p className="text-[0.75rem] text-text-secondary mt-1">Browse latest {category.title} designs</p>}
      </div>
    </div>
  );
};

export default CategoryCard;
