import React from 'react';
import { motion } from 'framer-motion';

const SubcategoryCard = ({ subcategory, onClick }) => {
  return (
    <motion.div 
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="min-w-[130px] w-[130px] aspect-square rounded-xl overflow-hidden bg-[#f1f5f9] relative cursor-pointer transition-all active:scale-95 shadow-sm group"
    >
      <img 
        src={subcategory.image || `https://ui-avatars.com/api/?name=${subcategory.name}&background=f1f5f9&color=64748b`} 
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
        alt={subcategory.name} 
      />
      {/* Decorative gradient overlay */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </motion.div>
  );
};

export default SubcategoryCard;
