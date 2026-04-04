import React from 'react';
import { TEMPLATES } from '../utils/mockData';
import TemplateCard from '../components/posters/TemplateCard';
import { useEditor } from '../context/EditorContext';

const MyPosters = () => {
  const { openEditor } = useEditor();
  // Mock previously created posters
  const myPosters = TEMPLATES.slice(0, 6); // Showing more for grid consistency

  return (
    <div className="py-md">
      <div className="mb-md">
        <h1 className="text-2xl font-bold">My Posters</h1>
        <p className="text-text-secondary">Manage and download your previously created designs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md px-[10px]">
        {myPosters.map(poster => (
          <TemplateCard 
            key={poster.id} 
            template={poster} 
            onClick={() => openEditor(poster)} 
          />
        ))}
      </div>
    </div>
  );
};

export default MyPosters;

