import React from 'react';
import { motion } from 'framer-motion';

const BannerCard = ({ title, image, onClick }) => {
  return (
    <motion.div 
      className="relative rounded-md overflow-hidden cursor-pointer"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <div className="relative aspect-[21/9] sm:aspect-[24/7] w-full">
        <img src={image} alt={title} loading="lazy" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-4 md:p-6">
          <h3 className="text-white text-lg md:text-xl font-bold mb-2">{title}</h3>
          <button className="bg-white text-primary w-fit px-4 py-1.5 rounded-sm text-sm font-bold active:scale-95 transition-transform">Explore Deals</button>
        </div>
      </div>
    </motion.div>
  );
};

export default BannerCard;
