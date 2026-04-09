import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Layers, Plus, Trash2, Edit2, GripVertical, 
  ChevronRight, Image as ImageIcon, Search, 
  Tag, Save, MoreHorizontal, Layout, 
  X, CheckSquare, 
  AlertCircle, Loader2
} from 'lucide-react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { motion, AnimatePresence } from 'framer-motion';
import AdminModal from '../components/ui/AdminModal';
import { useAdminAuth } from '../context/AdminAuthContext';

const CategoryManager = () => {
  const { admin } = useAdminAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCat, setExpandedCat] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [newCatData, setNewCatData] = useState({ name: '', image: '', type: 'all' });
  const [newSubData, setNewSubData] = useState({ name: '', image: '' });
  
  const fileInputRef = useRef();
  const subFileInputRef = useRef();
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${admin?.accessToken}` }
      };
      const { data } = await axios.get(`${API_URL}/admin/categories`, config);
      setCategories(data);
    } catch (error) {
      console.error('Fetch categories error:', error);
    } finally {
      setLoading(false);
    }
  }, [admin, API_URL]);

  useEffect(() => {
    if (admin) {
      fetchCategories();
    } else {
      setLoading(false);
    }
  }, [admin, fetchCategories]);

  const handleCreateCategory = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${admin?.accessToken}` }
      };
      if (isEditMode) {
        await axios.put(`${API_URL}/admin/categories/${editingId}`, newCatData, config);
      } else {
        await axios.post(`${API_URL}/admin/categories`, newCatData, config);
      }
      setShowAddModal(false);
      fetchCategories();
    } catch (error) {
      alert(error.response?.data?.message || 'Action failed');
    }
  };

  const handleDeleteCategory = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${admin?.accessToken}` }
      };
      await axios.delete(`${API_URL}/admin/categories/${deletingItem.id}`, config);
      setShowDeleteModal(false);
      fetchCategories();
    } catch (error) {
      alert(error.response?.data?.message || 'Delete failed');
    }
  };

  const handleCreateSubcategory = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${admin?.accessToken}` }
      };
      if (isEditMode) {
        await axios.put(`${API_URL}/admin/subcategories/${editingId}`, newSubData, config);
      } else {
        await axios.post(`${API_URL}/admin/subcategories`, { ...newSubData, parentId: activeCategoryId }, config);
      }
      setShowSubModal(false);
      fetchCategories();
    } catch (error) {
      alert(error.response?.data?.message || 'Subcategory action failed');
    }
  };

  const handleDeleteSubcategory = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${admin?.accessToken}` }
      };
      await axios.delete(`${API_URL}/admin/subcategories/${deletingItem.id}`, config);
      setShowDeleteModal(false);
      fetchCategories();
    } catch (error) {
      alert(error.response?.data?.message || 'Delete failed');
    }
  };

  const filteredCategories = useMemo(() => {
    return categories.filter(cat => 
      cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  const toggleExpand = (id) => {
    setExpandedCat(prev => prev === id ? null : id);
  };

  if (loading && categories.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-12 overflow-x-hidden">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-4">
        <div>
           <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 leading-none">Management</p>
           <h1 className="text-2xl md:text-3xl font-black text-[var(--admin-text-main)] tracking-tight">Category Manager</h1>
           <p className="text-slate-400 text-xs font-semibold mt-1">Organize and manage template categories for the marketplace</p>
        </div>
        <Button 
          onClick={() => {
            setIsEditMode(false);
            setNewCatData({ name: '', image: '', type: 'all' });
            setShowAddModal(true);
          }}
          className="w-full sm:w-auto rounded-xl shadow-lg shadow-red-500/20 px-6 h-11 md:h-12 border-none bg-[#ef4444] text-white text-[10px] md:text-xs tracking-widest uppercase font-black"
        >
           <Plus size={16} className="mr-2" strokeWidth={3} /> Add New Category
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-6 bg-white p-4 md:p-6 rounded-[1.5rem] border border-slate-200 shadow-sm transition-all lg:max-w-5xl">
        <div className="relative group w-full flex-1">
           <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#ef4444] transition-colors" />
           <Input 
              placeholder="Filter categories by name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 h-11 md:h-12 bg-slate-50 border-none rounded-xl text-xs font-semibold"
           />
        </div>
        <div className="flex items-center gap-3 text-slate-400 text-[10px] uppercase font-black tracking-widest px-4 border-l border-slate-100 hidden md:flex">
          <Layers size={14} /> {categories.length} Nodes
        </div>
      </div>

      {/* Category List */}
      <div className="space-y-4 max-w-5xl">
        <div className="flex items-center gap-2 mb-2 ml-1">
           <Layers size={14} className="text-[#ef4444]" />
           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Registry Categories</h4>
        </div>
        
        {filteredCategories.map(cat => (
          <div key={cat._id} className="category-card group">
            <Card className={`border-none transition-all duration-300 ${expandedCat === cat._id ? 'ring-2 ring-red-500/20 shadow-xl' : 'hover:shadow-lg'}`}>
              <div 
                className="p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => toggleExpand(cat._id)}
              >
                <div className="flex items-center w-full sm:w-auto gap-4">
                  <div className="text-slate-300 group-hover:text-[#ef4444] transition-colors shrink-0">
                    <GripVertical size={20} />
                  </div>
                  
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl overflow-hidden shadow-md ring-2 ring-white shrink-0 bg-slate-100">
                       <img src={cat.image || 'https://via.placeholder.com/150'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={cat.name} />
                    </div>
                  </div>

                  <div className="flex-1">
                     <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-sm font-black text-slate-900 tracking-tight leading-none">{cat.name}</h3>
                        <Badge variant="success" className="hidden sm:inline-flex text-[8px] px-2 py-0.5 rounded uppercase font-black tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">
                          {cat.isActive ? 'active' : 'inactive'}
                        </Badge>
                     </div>
                      <p className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">
                        {cat.count || 0} TEMPLATES
                      </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between w-full sm:w-auto gap-2 sm:px-4 sm:border-l border-slate-200 ml-auto">
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setIsEditMode(true);
                        setEditingId(cat._id);
                        setNewCatData({ name: cat.name, image: cat.image, type: cat.type });
                        setShowAddModal(true);
                      }}
                      className="h-10 w-10 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-[#ef4444] shadow-sm bg-white border border-slate-100"
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setDeletingItem({ type: 'category', title: cat.name, id: cat._id });
                        setShowDeleteModal(true);
                      }}
                      className="h-10 w-10 rounded-xl hover:bg-rose-50 text-slate-600 hover:text-rose-500 shadow-sm bg-white border border-slate-100"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>

                  <div className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${expandedCat === cat._id ? 'bg-[#ef4444] text-white rotate-90 shadow-lg shadow-red-500/20' : 'bg-slate-50 text-slate-400'}`}>
                     <ChevronRight size={18} strokeWidth={3} />
                  </div>
                </div>
              </div>

              {expandedCat === cat._id && (
                <CardContent className="bg-white border-t border-slate-100 p-5 md:p-8">
                   <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                         <Tag size={12} className="text-[#ef4444]" /> Layer: {cat.name}
                      </h4>
                      <Button 
                        onClick={(e) => { 
                           e.stopPropagation(); 
                           setIsEditMode(false);
                           setNewSubData({ name: '', image: '' });
                           setActiveCategoryId(cat._id);
                           setShowSubModal(true); 
                        }}
                        variant="outline" 
                        size="sm" 
                        className="w-full sm:w-auto h-8 rounded-lg text-[9px] font-black uppercase tracking-widest border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                      >
                         Add Subcategory
                      </Button>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                       {cat.subcategories?.map(sub => (
                          <div key={sub._id} className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center justify-between group/sub transition-all hover:ring-2 hover:ring-[#ef4444]/10 hover:shadow-md">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#ef4444] font-black text-xs group-hover/sub:bg-[#ef4444] group-hover/sub:text-white transition-colors overflow-hidden">
                                  {sub.image ? (
                                     <img src={sub.image} className="w-full h-full object-cover" alt="" />
                                  ) : (
                                     sub.name.slice(0, 2).toUpperCase()
                                  )}
                               </div>
                               <div>
                                  <p className="text-xs font-black text-slate-800 mb-0.5">{sub.name}</p>
                               </div>
                            </div>
                            <div className="flex items-center gap-2">
                               <button 
                                 onClick={() => { 
                                    setIsEditMode(true);
                                    setEditingId(sub._id);
                                    setNewSubData({ name: sub.name, image: sub.image || '' });
                                    setShowSubModal(true);
                                 }}
                                 className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-blue-500 transition-colors border-none bg-transparent cursor-pointer"
                               >
                                 <Edit2 size={14} />
                               </button>
                               <button 
                                 onClick={() => {
                                   setDeletingItem({ type: 'subcategory', title: sub.name, id: sub._id });
                                   setShowDeleteModal(true);
                                 }}
                                 className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-red-500 transition-colors border-none bg-transparent cursor-pointer"
                               >
                                 <Trash2 size={14} />
                               </button>
                            </div>
                         </div>
                      ))}
                   </div>
                </CardContent>
              )}
            </Card>
          </div>
        ))}
      </div>

      {/* Save Action - Optional but keeping UI for feedback */}
      <div className="flex justify-end max-w-5xl">
         <Button 
            disabled={loading}
            onClick={fetchCategories}
            className="w-full sm:w-auto h-14 md:px-10 rounded-2xl shadow-xl shadow-red-500/20 font-black text-[10px] md:text-xs uppercase tracking-[0.2em] gap-3 border-none bg-[#ef4444] text-white hover:bg-red-600 transition-all"
         >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Refresh Registry
         </Button>
      </div>

      {/* Add/Edit Category Modal */}
      <AdminModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={isEditMode ? "Modify Category" : "Add New Category"}
        subtitle={isEditMode ? "Update registry details" : "Setup category metadata"}
        icon={isEditMode ? Edit2 : Plus}
      >
        <div className="space-y-8">
           <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Category Title</label>
              <Input 
                placeholder="e.g. Political Campaigning" 
                className="h-14 md:h-16 rounded-xl bg-slate-50 border-none px-6 font-bold"
                value={newCatData.name}
                onChange={(e) => setNewCatData({...newCatData, name: e.target.value})}
              />
           </div>

           <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Cover Image</label>
              <div className="flex items-center gap-4">
                 <div className="w-16 h-16 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                    {newCatData.image ? (
                       <img src={newCatData.image} className="w-full h-full object-cover" alt="prev" />
                    ) : (
                       <ImageIcon size={20} className="text-slate-300" />
                    )}
                 </div>
                 <div className="flex-1">
                    <input 
                       type="file" 
                       ref={fileInputRef} 
                       className="hidden" 
                       accept="image/*"
                       onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          
                          try {
                             setLoading(true); // Re-use loading for upload feedback
                             const formData = new FormData();
                             formData.append('file', file);
                             const config = {
                                headers: { 
                                   'Content-Type': 'multipart/form-data',
                                   Authorization: `Bearer ${admin?.accessToken}` 
                                }
                             };
                             const { data } = await axios.post(`${API_URL}/admin/upload`, formData, config);
                             setNewCatData({ ...newCatData, image: data.url });
                          } catch (err) {
                             alert('Image upload failed');
                          } finally {
                             setLoading(false);
                          }
                       }}
                    />
                    <Button 
                       variant="outline" 
                       type="button"
                       disabled={loading}
                       onClick={() => fileInputRef.current.click()}
                       className="w-full h-14 rounded-xl border-slate-200 text-[10px] font-black uppercase tracking-widest bg-white"
                    >
                       {loading ? <Loader2 className="animate-spin mr-2" size={14} /> : <Plus size={14} className="mr-2" />}
                       Change Cover Image
                    </Button>
                    {newCatData.image && <p className="text-[9px] text-slate-400 mt-2 truncate font-medium">Remote ID: {newCatData.image.split('/').pop()}</p>}
                 </div>
              </div>
           </div>

           <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">ContentType Scope</label>
              <div className="grid grid-cols-3 gap-3">
                 {['image', 'video', 'all'].map(type => (
                    <button
                       key={type}
                       onClick={() => setNewCatData({...newCatData, type})}
                       className={`h-14 md:h-16 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border-none cursor-pointer flex items-center justify-center gap-2 ${newCatData.type === type ? 'bg-[#ef4444] text-white shadow-lg shadow-red-500/20' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                    >
                       {newCatData.type === type && <CheckSquare size={12} />}
                       {type}
                    </button>
                 ))}
              </div>
           </div>

           <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                 variant="ghost"
                 onClick={() => setShowAddModal(false)}
                 className="flex-1 h-14 md:h-16 rounded-2xl bg-slate-50 font-extrabold text-[10px] uppercase tracking-[0.2em] text-slate-500 border-none"
              >
                 Discard
              </Button>
              <Button 
                onClick={handleCreateCategory}
                className="flex-[1.5] h-14 md:h-16 rounded-2xl bg-[#ef4444] text-white shadow-2xl shadow-red-500/30 font-extrabold text-[10px] uppercase tracking-[0.2em] gap-3 border-none"
              >
                 {isEditMode ? <Save size={18} /> : <Plus size={18} />} {isEditMode ? "Commit Changes" : "Create Category"}
              </Button>
           </div>
        </div>
      </AdminModal>

      {/* Add/Edit Subcategory Modal */}
      <AdminModal
        isOpen={showSubModal}
        onClose={() => setShowSubModal(false)}
        title={isEditMode ? "Modify Subcategory" : "Add Subcategory"}
        subtitle="Manage layer specificity"
        icon={Tag}
      >
        <div className="space-y-8">
           <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Subcategory Title</label>
              <Input 
                placeholder="e.g. Flash Sales" 
                className="h-14 md:h-16 rounded-xl bg-slate-50 border-none px-6 font-bold"
                value={newSubData.name}
                onChange={(e) => setNewSubData({...newSubData, name: e.target.value})}
              />
           </div>

           <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Cover Image</label>
              <div className="flex items-center gap-4">
                 <div className="w-16 h-16 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                    {newSubData.image ? (
                       <img src={newSubData.image} className="w-full h-full object-cover" alt="prev" />
                    ) : (
                       <ImageIcon size={20} className="text-slate-300" />
                    )}
                 </div>
                 <div className="flex-1">
                    <input 
                       type="file" 
                       ref={subFileInputRef} 
                       className="hidden" 
                       accept="image/*"
                       onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          
                          try {
                             setLoading(true);
                             const formData = new FormData();
                             formData.append('file', file);
                             const config = {
                                headers: { 
                                   'Content-Type': 'multipart/form-data',
                                   Authorization: `Bearer ${admin?.accessToken}` 
                                }
                             };
                             const { data } = await axios.post(`${API_URL}/admin/upload`, formData, config);
                             setNewSubData({ ...newSubData, image: data.url });
                          } catch (err) {
                             alert('Image upload failed');
                          } finally {
                             setLoading(false);
                          }
                       }}
                    />
                    <Button 
                       variant="outline" 
                       type="button"
                       disabled={loading}
                       onClick={() => subFileInputRef.current.click()}
                       className="w-full h-14 rounded-xl border-slate-200 text-[10px] font-black uppercase tracking-widest bg-white"
                    >
                       {loading ? <Loader2 className="animate-spin mr-2" size={14} /> : <Plus size={14} className="mr-2" />}
                       Change Cover Image
                    </Button>
                 </div>
              </div>
           </div>

           <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                 variant="ghost"
                 onClick={() => setShowSubModal(false)}
                 className="flex-1 h-14 md:h-16 rounded-2xl bg-slate-50 font-extrabold text-[10px] uppercase tracking-[0.2em] text-slate-500 border-none"
              >
                 Cancel
              </Button>
              <Button 
                onClick={handleCreateSubcategory}
                className="flex-[1.5] h-14 md:h-16 rounded-2xl bg-[#ef4444] text-white shadow-2xl shadow-red-500/30 font-extrabold text-[10px] uppercase tracking-[0.2em] gap-3 border-none"
              >
                 {isEditMode ? "Update Subcategory" : "Add to Registry"}
              </Button>
           </div>
        </div>
      </AdminModal>

      {/* Delete Confirmation Modal */}
      <AdminModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={`Delete ${deletingItem?.type === 'category' ? 'Category' : 'Subcategory'}?`}
        subtitle="Permanent Action"
        icon={Trash2}
        variant="danger"
        maxWidth="450px"
      >
        <div className="text-center">
           <div className="flex gap-3">
              <Button 
                variant="ghost" 
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 h-14 rounded-2xl bg-slate-50 font-black text-[10px] uppercase tracking-widest text-slate-500 border-none"
              >
                Cancel
              </Button>
              <Button 
                onClick={deletingItem?.type === 'category' ? handleDeleteCategory : handleDeleteSubcategory}
                className="flex-1 h-14 rounded-2xl bg-rose-500 text-white shadow-lg shadow-rose-500/20 font-black text-[10px] uppercase tracking-widest border-none"
              >
                Confirm Delete
              </Button>
           </div>
        </div>
      </AdminModal>
    </div>
  );
};

export default CategoryManager;
