import React, { useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Filter, MoreVertical, Heart, Layout, 
  Calendar, MapPin, Phone, User as UserIcon, X, 
  ChevronLeft, Award, UserCircle, Star, Download,
  Edit2, Trash2
} from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const UserManager = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const tableRef = useRef();

  // Entrance animations removed for immediate visibility

  // Mock users data
  const users = useMemo(() => [
    { id: 1, name: 'Rahul Sharma', phone: '+91 98765 43210', plan: 'Premium', status: 'active', joined: 'Mar 15, 2026', likes: 24, downloads: 156, points: 2500, business: 'Rahul Prints', location: 'Jaipur, Rajasthan' },
    { id: 2, name: 'Priya Verma', phone: '+91 87654 32109', plan: 'Free', status: 'active', joined: 'Mar 12, 2026', likes: 8, downloads: 42, points: 500, business: 'Priya Boutiques', location: 'Bhopal, MP' },
    { id: 3, name: 'Amit Singh', phone: '+91 76543 21098', plan: 'Premium', status: 'inactive', joined: 'Mar 10, 2026', likes: 45, downloads: 312, points: 4200, business: 'Amit Tech', location: 'Indore, MP' },
    { id: 4, name: 'Surbhi Gupta', phone: '+91 65432 10987', plan: 'Free', status: 'active', joined: 'Mar 08, 2026', likes: 12, downloads: 65, points: 750, business: 'Gupta Sweets', location: 'Gwalior, MP' },
  ], []);

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.phone.includes(searchQuery)
    );
  }, [users, searchQuery]);

  const handleUserClick = (userId) => {
    navigate(`/admin/users/${userId}`);
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
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
           <Button variant="outline" className="w-full sm:w-auto rounded-xl border-slate-200 h-11 md:h-12 text-[10px] md:text-xs font-black uppercase tracking-widest">
              Export Archive
           </Button>
           <Button className="w-full sm:w-auto rounded-xl shadow-lg shadow-red-500/20 h-11 md:h-12 border-none bg-[#ef4444] text-white text-[10px] md:text-xs font-black uppercase tracking-widest">
              Provision New UID
           </Button>
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
                 onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
           <Button variant="outline" className="h-12 px-6 rounded-2xl border-slate-200 group">
              <Filter size={16} className="mr-2 text-slate-400 group-hover:text-[#ef4444]" /> 
              Advanced Filters
           </Button>
        </div>

        <div className="overflow-x-auto" ref={tableRef}>
          <table className="w-full">
             <thead>
               <tr className="border-b border-slate-100 bg-white">
                 <th className="px-8 py-4 text-left text-[11px] font-black text-slate-900 uppercase tracking-wider">Network Participant</th>
                 <th className="px-8 py-4 text-left text-[11px] font-black text-slate-900 uppercase tracking-wider">Status</th>
                 <th className="px-8 py-4 text-left text-[11px] font-black text-slate-900 uppercase tracking-wider">Access Tier</th>
                 <th className="px-8 py-4 text-left text-[11px] font-black text-slate-900 uppercase tracking-wider">Joined</th>
                 <th className="px-8 py-4 text-right text-[11px] font-black text-slate-900 uppercase tracking-wider">Actions</th>
               </tr>
             </thead>
            <tbody className="divide-y divide-[var(--admin-border)]">
              {filteredUsers.map(user => (
                <tr 
                  key={user.id} 
                  className="user-row group hover:bg-[var(--admin-row-hover)] transition-all cursor-pointer"
                  onClick={() => handleUserClick(user.id)}
                >
                  <td className="px-8 py-5">
                     <div className="flex items-center gap-4">
                        <div className="relative group-hover:scale-105 transition-transform">
                          <div className="w-11 h-11 rounded-2xl bg-red-50 dark:bg-red-500/15 flex items-center justify-center font-black text-sm text-[#ef4444] border-2 border-[var(--admin-bg)] shadow-sm relative z-10">
                            {user.name.charAt(0)}
                          </div>
                          {user.plan === 'Premium' && (
                            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-400 rounded-lg border-2 border-white dark:border-slate-800 flex items-center justify-center text-[10px] text-white shadow-sm z-20">
                              <Star size={10} fill="currentColor" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-700 dark:text-slate-300 mb-0.5">{user.name}</p>
                          <p className="text-[0.7rem] font-bold text-[var(--admin-text-subtle)]">{user.phone}</p>
                        </div>
                     </div>
                  </td>
                  <td className="px-8 py-5">
                     <div className="flex flex-col gap-1.5">
                        <Badge variant={user.plan === 'Premium' ? 'success' : 'warning'} className="w-fit text-[10px] font-black tracking-widest uppercase">
                           {user.plan}
                        </Badge>
                        <span className="text-[10px] font-black text-[var(--admin-text-subtle)] uppercase tracking-tighter">EST. {user.joined}</span>
                     </div>
                  </td>
                  <td className="px-8 py-5">
                     <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                           <div className="flex items-center gap-1 text-[0.7rem] font-black text-slate-500 mb-1">
                              <Heart size={12} className="text-rose-500 fill-rose-500/20" /> {user.likes}
                           </div>
                           <div className="flex items-center gap-1 text-[0.7rem] font-black text-slate-500">
                              <Download size={12} className="text-sky-500" /> {user.downloads}
                           </div>
                        </div>
                        <div className="h-8 w-[1px] bg-slate-100 dark:bg-slate-800" />
                        <div className="flex flex-col">
                           <span className="text-[10px] font-black text-[var(--admin-text-subtle)] uppercase leading-none mb-1">Score</span>
                           <span className="text-sm font-black text-slate-600 dark:text-slate-400 leading-none">{user.points}</span>
                        </div>
                     </div>
                  </td>
                  <td className="px-8 py-5">
                     <Badge variant={user.status === 'active' ? 'success' : 'danger'} className="bg-transparent border-2 border-current px-3 py-1 flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        {user.status}
                     </Badge>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-[#ef4444] border border-slate-100 shadow-sm bg-white">
                        <Edit2 size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-rose-50 text-slate-500 hover:text-red-500 border border-slate-100 shadow-sm bg-white">
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default UserManager;
