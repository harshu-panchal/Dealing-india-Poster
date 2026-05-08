import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { 
  MessageSquare, Star, Trash2, CheckCircle2, 
  Clock, User as UserIcon, Mail, Phone, ExternalLink,
  Search, Filter
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useAdminAuth } from '../context/AdminAuthContext';

const FeedbackManager = () => {
  const { admin: adminInfo } = useAdminAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const tableRef = useRef();

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${adminInfo?.accessToken}`,
        }
      };

      const { data } = await axios.get(`${API_URL}/admin/feedbacks`, config);
      setFeedbacks(data.data);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminInfo?.accessToken) {
      fetchFeedbacks();
    }
  }, [adminInfo]);

  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter(item => {
      const name = (item.user?.name || item.name || '').toLowerCase();
      const message = (item.message || '').toLowerCase();
      const searchMatch = name.includes(searchTerm.toLowerCase()) || message.includes(searchTerm.toLowerCase());
      const ratingMatch = ratingFilter === 'all' || item.rating === parseInt(ratingFilter);
      return searchMatch && ratingMatch;
    });
  }, [feedbacks, searchTerm, ratingFilter]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) return;
    
    try {
      const config = {
        headers: { Authorization: `Bearer ${adminInfo?.accessToken}` }
      };
      await axios.delete(`${API_URL}/admin/feedbacks/${id}`, config);
      setFeedbacks(feedbacks.filter(f => f._id !== id));
    } catch (error) {
      console.error('Error deleting feedback:', error);
      alert('Failed to delete feedback');
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${adminInfo?.accessToken}` }
      };
      await axios.put(`${API_URL}/admin/feedbacks/${id}/status`, { status }, config);
      setFeedbacks(feedbacks.map(f => f._id === id ? { ...f, status } : f));
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star 
            key={s} 
            size={12} 
            className={s <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
           <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 leading-none">Support System</p>
           <h1 className="text-2xl md:text-3xl font-black text-[var(--admin-text-main)] tracking-tight">User Feedback</h1>
           <p className="text-slate-400 text-xs font-semibold mt-1 max-w-[280px] sm:max-w-none">Review and manage user suggestions and experience reports</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search name or message..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-red-100 outline-none transition-all placeholder:text-slate-300"
            />
          </div>

          {/* Rating Filter */}
          <div className="relative w-full sm:w-48">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select 
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-red-100 outline-none appearance-none cursor-pointer"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>
      </div>

      <Card className="border-none overflow-hidden pb-2 bg-white">
        <div className="w-full overflow-x-auto scrollbar-hide" ref={tableRef}>
          <div className="min-w-[1000px]">
            <table className="w-full">
               <thead>
                 <tr className="border-b border-slate-100 bg-white">
                   <th className="px-8 py-4 text-left text-[11px] font-black text-slate-900 uppercase tracking-wider">User / Contact</th>
                   <th className="px-8 py-4 text-left text-[11px] font-black text-slate-900 uppercase tracking-wider">Feedback & Rating</th>
                   <th className="px-8 py-4 text-left text-[11px] font-black text-slate-900 uppercase tracking-wider">Status</th>
                   <th className="px-8 py-4 text-left text-[11px] font-black text-slate-900 uppercase tracking-wider">Submitted</th>
                   <th className="px-8 py-4 text-right text-[11px] font-black text-slate-900 uppercase tracking-wider">Actions</th>
                 </tr>
               </thead>
              <tbody className="divide-y divide-[var(--admin-border)]">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-8 py-10 text-center text-slate-400 font-bold">
                      Loading feedback records...
                    </td>
                  </tr>
                ) : filteredFeedbacks.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-8 py-10 text-center text-slate-400 font-bold italic opacity-60">
                      No feedback records match your current filters.
                    </td>
                  </tr>
                ) : (
                  filteredFeedbacks.map(item => (
                    <tr 
                      key={item._id} 
                      className="group hover:bg-[var(--admin-row-hover)] transition-all"
                    >
                      <td className="px-8 py-5">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center font-black text-sm text-slate-400 border border-slate-100 shadow-sm">
                               {item.user?.name ? item.user.name.charAt(0) : <UserIcon size={18} />}
                            </div>
                            <div>
                               <p className="text-sm font-black text-slate-700 mb-0.5">{item.user?.name || item.name || 'Anonymous'}</p>
                               <div className="flex flex-col gap-0.5">
                                 {item.user?.email || item.email ? (
                                   <div className="flex items-center gap-1 text-[0.65rem] font-bold text-slate-400">
                                     <Mail size={10} /> {item.user?.email || item.email}
                                   </div>
                                 ) : null}
                                 {item.user?.phone ? (
                                   <div className="flex items-center gap-1 text-[0.65rem] font-bold text-slate-400">
                                     <Phone size={10} /> {item.user?.phone}
                                   </div>
                                 ) : null}
                               </div>
                            </div>
                         </div>
                      </td>
                      <td className="px-8 py-5 max-w-md">
                         <div className="space-y-2">
                            {renderStars(item.rating)}
                            <p className="text-sm font-bold text-slate-600 leading-relaxed italic">
                               "{item.message}"
                            </p>
                         </div>
                      </td>
                      <td className="px-8 py-5">
                         <select 
                           value={item.status} 
                           onChange={(e) => handleStatusUpdate(item._id, e.target.value)}
                           className={`text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-lg border-2 outline-none transition-all cursor-pointer ${
                             item.status === 'resolved' ? 'border-emerald-100 text-emerald-600 bg-emerald-50' :
                             item.status === 'reviewed' ? 'border-blue-100 text-blue-600 bg-blue-50' :
                             'border-amber-100 text-amber-600 bg-amber-50'
                           }`}
                         >
                            <option value="pending">Pending</option>
                            <option value="reviewed">Reviewed</option>
                            <option value="resolved">Resolved</option>
                         </select>
                      </td>
                      <td className="px-8 py-5">
                         <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            <Clock size={12} /> {formatDate(item.createdAt)}
                         </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDelete(item._id)}
                            className="h-10 w-10 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-red-500 border border-slate-100 shadow-sm bg-white"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FeedbackManager;
