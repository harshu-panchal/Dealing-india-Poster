// Refresh
// Refresh
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Search, Trash2, ChevronLeft, ChevronRight, User as UserIcon
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAdminAuth } from '../context/AdminAuthContext';

const UserManager = () => {
  const navigate = useNavigate();
  const { admin: adminInfo } = useAdminAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const tableRef = useRef();

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${adminInfo?.accessToken}`,
        },
        params: {
          page,
          limit: 10,
          search: searchQuery,
        },
      };

      const { data } = await axios.get(`${API_URL}/admin/users`, config);
      setUsers(data.users);
      setTotalPages(data.pages);
      setTotalUsers(data.totalUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminInfo?.accessToken) {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [page, adminInfo, searchQuery]);

  const handleUserClick = (userId) => {
    navigate(`/admin/users/${userId}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-4">
        <div>
           <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 leading-none">Management</p>
           <h1 className="text-2xl md:text-3xl font-black text-[var(--admin-text-main)] tracking-tight">Access Control</h1>
           <p className="text-slate-400 text-xs font-semibold mt-1 max-w-[280px] sm:max-w-none">Audit and regulate community membership profiles</p>
        </div>
      </div>

      <Card className="border-none overflow-hidden pb-2 bg-white">
        <div className="p-5 border-b border-[var(--admin-border)] flex flex-wrap gap-4 items-center bg-white">
           <div className="flex-1 min-w-[280px] relative group">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#ef4444] transition-colors" />
              <Input 
                 placeholder="Filter by Identity or Contact..." 
                 className="pl-12 h-12 bg-[var(--admin-input-bg)]"
                 value={searchQuery}
                 onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1); // Reset to first page on search
                 }}
              />
           </div>
        </div>

        <div className="w-full overflow-x-auto scrollbar-hide" ref={tableRef}>
          <div className="min-w-[800px]">
            <table className="w-full">
               <thead>
                 <tr className="border-b border-slate-100 bg-white">
                   <th className="px-8 py-4 text-left text-[11px] font-black text-slate-900 uppercase tracking-wider">Network Participant</th>
                   <th className="px-8 py-4 text-left text-[11px] font-black text-slate-900 uppercase tracking-wider">Status</th>
                   <th className="px-8 py-4 text-left text-[11px] font-black text-slate-900 uppercase tracking-wider">Verification</th>
                   <th className="px-8 py-4 text-left text-[11px] font-black text-slate-900 uppercase tracking-wider">Joined</th>
                   <th className="px-8 py-4 text-right text-[11px] font-black text-slate-900 uppercase tracking-wider">Actions</th>
                 </tr>
               </thead>
              <tbody className="divide-y divide-[var(--admin-border)]">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-8 py-10 text-center text-slate-400 font-bold">
                      Loading participant registry...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-8 py-10 text-center text-slate-400 font-bold">
                      No matching participants found.
                    </td>
                  </tr>
                ) : (
                  users.map(user => (
                    <tr 
                      key={user._id} 
                      className="user-row group hover:bg-[var(--admin-row-hover)] transition-all cursor-pointer"
                      onClick={() => handleUserClick(user._id)}
                    >
                      <td className="px-8 py-5">
                         <div className="flex items-center gap-4">
                            <div className="relative group-hover:scale-105 transition-transform">
                              {user.profilePhoto ? (
                                <img src={user.profilePhoto} alt="" className="w-11 h-11 rounded-2xl object-cover border-2 border-[var(--admin-bg)] shadow-sm" />
                              ) : (
                                <div className="w-11 h-11 rounded-2xl bg-red-50 flex items-center justify-center font-black text-sm text-[#ef4444] border-2 border-[var(--admin-bg)] shadow-sm relative z-10">
                                  {user.name ? user.name.charAt(0) : <UserIcon size={18} />}
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-700 mb-0.5">{user.name || 'Anonymous User'}</p>
                              <p className="text-[0.7rem] font-bold text-[var(--admin-text-subtle)]">{user.mobileNumber || user.email || 'No Contact Info'}</p>
                            </div>
                         </div>
                      </td>
                      <td className="px-8 py-5">
                         <div className="flex flex-col gap-1.5">
                            <Badge variant={user.isVerified ? 'success' : 'warning'} className="w-fit text-[10px] font-black tracking-widest uppercase">
                               {user.contentLanguage || 'English'}
                            </Badge>
                            <span className="text-[10px] font-black text-[var(--admin-text-subtle)] uppercase tracking-tighter">ID: {user._id.slice(-6)}</span>
                         </div>
                      </td>
                      <td className="px-8 py-5">
                         <Badge variant={user.isVerified ? 'success' : 'danger'} className="bg-transparent border-2 border-current px-3 py-1 flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${user.isVerified ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            {user.isVerified ? 'Verified' : 'Unverified'}
                         </Badge>
                      </td>
                      <td className="px-8 py-5">
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                           {formatDate(user.createdAt)}
                         </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={(e) => { e.stopPropagation(); alert('Requesting node decommission...'); }}
                            className="h-10 w-10 rounded-xl hover:bg-rose-50 text-slate-500 hover:text-red-500 border border-slate-100 shadow-sm bg-white"
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

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="p-6 border-t border-[var(--admin-border)] flex items-center justify-between bg-slate-50/50">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
               Showing Page {page} of {totalPages} <span className="mx-2">|</span> Total {totalUsers} Participants
             </p>
             <div className="flex items-center gap-2">
                <Button 
                  variant="outline"
                  size="icon"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="h-9 w-9 rounded-xl border-slate-200"
                >
                  <ChevronLeft size={16} />
                </Button>
                {[...Array(totalPages)].map((_, i) => (
                  <Button
                    key={i + 1}
                    variant={page === i + 1 ? 'default' : 'outline'}
                    onClick={() => setPage(i + 1)}
                    className={`h-9 w-9 rounded-xl text-[10px] font-black ${page === i + 1 ? 'bg-[#ef4444] text-white border-none' : 'border-slate-200 text-slate-600'}`}
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button 
                  variant="outline"
                  size="icon"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="h-9 w-9 rounded-xl border-slate-200"
                >
                  <ChevronRight size={16} />
                </Button>
             </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default UserManager;
