import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, Phone, MapPin, Calendar, 
  Heart, Layout, Zap, 
  ShieldCheck, Smartphone, Mail,
  Star, Clock, Download, Share2, Music, Search
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useAdminAuth } from '../context/AdminAuthContext';

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { admin: adminInfo } = useAdminAuth();
  const containerRef = useRef();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${adminInfo?.accessToken}`,
        },
      };

      const { data } = await axios.get(`${API_URL}/admin/users/${id}`, config);
      setUser(data);
    } catch (error) {
      console.error('Error fetching user detail:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminInfo?.accessToken && id) {
      fetchUserDetails();
    }
  }, [id, adminInfo]);

  const formatDate = (dateString, options = {}) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      ...options
    });
  };

  if (loading) {
     return (
       <div className="flex items-center justify-center h-[60vh]">
         <p className="text-xl font-black text-slate-300 animate-pulse uppercase tracking-[0.2em]">Retreiving Participant Profile...</p>
       </div>
     );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-black text-slate-400">PARTICIPANT NOT FOUND</h2>
        <Button onClick={() => navigate('/admin/users')} className="mt-4 rounded-xl">Back to Registry</Button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-8 pb-12">
      {/* Top Navigation & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigate('/admin/users')}
            className="rounded-2xl border-slate-200 bg-white"
          >
            <ArrowLeft size={18} />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black tracking-tight text-[var(--admin-text-main)]">{user.name || 'Anonymous User'}</h1>
              <Badge variant={user.isVerified ? 'success' : 'warning'} className="text-[10px] font-black uppercase tracking-[0.1em]">
                {user.isVerified ? 'VERIFIED' : 'UNVERIFIED'} MEMBER
              </Badge>
            </div>
            <p className="text-[var(--admin-text-subtle)] text-[11px] font-black uppercase tracking-[0.2em] mt-1 opacity-70">REGISTRY ID: {user._id}</p>
          </div>
        </div>

        <div className="flex gap-3">
           <Button variant="outline" className="rounded-xl border-slate-200 px-6 font-bold text-slate-600">
             Deactivate Network
           </Button>
           <Button className="rounded-xl shadow-lg shadow-red-500/20 px-6 bg-[#ef4444] text-white border-none font-bold">
             Update Profile
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Column (Info Sidebar) */}
        <div className="xl:col-span-4 space-y-8 detail-card">
          <Card className="border-none shadow-sm bg-white">
             <div className="p-8 flex flex-col items-center">
                <div className="relative mb-8">
                  {user.profilePhoto ? (
                    <img src={user.profilePhoto} alt="" className="w-40 h-40 rounded-[3rem] object-cover border-4 border-[var(--admin-bg)] shadow-2xl shadow-slate-200/50" />
                  ) : (
                    <div className="w-40 h-40 rounded-[3rem] bg-red-50 flex items-center justify-center text-[#ef4444] text-6xl font-black border-4 border-[var(--admin-bg)] shadow-2xl shadow-slate-200/50">
                      {user.name ? user.name.charAt(0) : '?'}
                    </div>
                  )}
                  {user.isVerified && (
                    <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-emerald-500 border-4 border-white rounded-2xl flex items-center justify-center text-white shadow-xl">
                      <ShieldCheck size={24} />
                    </div>
                  )}
                </div>
                
                <h2 className="text-2xl font-black text-slate-800 mb-1 tracking-tight">{user.name || 'Anonymous User'}</h2>
                <div className="flex items-center gap-2 text-[var(--admin-text-subtle)] font-black text-[10px] uppercase tracking-[0.2em] mb-8">
                  <Smartphone size={12} className="text-red-500" /> TERMINAL: {user.contentLanguage || 'English'}
                </div>

                <div className="grid grid-cols-2 gap-4 w-full mb-10">
                  <div className="bg-slate-50 p-5 rounded-3xl text-center border border-slate-100 transition-colors">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Engagement</p>
                    <p className="text-2xl font-black text-[#ef4444] leading-none">{user.likes || 0}</p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-3xl text-center border border-slate-100 transition-colors">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Total Points</p>
                    <p className="text-2xl font-black text-[#ef4444] leading-none">{user.points || 0}</p>
                  </div>
                </div>

                <div className="w-full space-y-4 pt-4 border-t border-slate-50">
                  <div className="flex items-start gap-5 p-4 rounded-3xl hover:bg-slate-50 transition-colors group text-left w-full">
                    <div className="w-11 h-11 rounded-2xl bg-red-50 flex items-center justify-center text-[#ef4444] shrink-0 shadow-sm group-hover:scale-110 transition-transform"><Phone size={20} /></div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Authenticated Phone</p>
                      <p className="text-sm font-bold text-slate-700 truncate">{user.mobileNumber || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-5 p-4 rounded-3xl hover:bg-slate-50 transition-colors group text-left w-full">
                    <div className="w-11 h-11 rounded-2xl bg-red-50 flex items-center justify-center text-[#ef4444] shrink-0 shadow-sm group-hover:scale-110 transition-transform"><Mail size={20} /></div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Email Connection</p>
                      <p className="text-sm font-bold text-slate-700 truncate">{user.email || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-5 p-4 rounded-3xl hover:bg-slate-50 transition-colors group text-left w-full">
                    <div className="w-11 h-11 rounded-2xl bg-red-50 flex items-center justify-center text-[#ef4444] shrink-0 shadow-sm group-hover:scale-110 transition-transform"><MapPin size={20} /></div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Origin City</p>
                      <p className="text-sm font-bold text-slate-700 truncate">{user.location || 'Unknown'}</p>
                    </div>
                  </div>
                </div>
             </div>
          </Card>

          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 relative overflow-hidden group">
             <div className="flex items-center justify-between mb-4 relative z-10">
                 <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Subscriber Intelligence</h3>
                <Zap size={18} className="text-amber-400 group-hover:scale-125 transition-transform" />
             </div>
             <p className="text-xs text-slate-500 font-semibold mb-8 leading-relaxed relative z-10">
                This participant has been part of the network for {Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24))} days with a {user.isVerified ? 'Verified' : 'Pending'} status.
             </p>
             <Button className="w-full h-12 bg-slate-50 text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border-none hover:bg-slate-100 transition-all relative z-10">
                Review Lifecycle
             </Button>
             <Zap size={140} className="absolute -bottom-10 -right-10 text-slate-50 pointer-events-none group-hover:rotate-12 transition-transform duration-700 opacity-50" />
          </div>
        </div>

        {/* Right Column (Content) */}
        <div className="xl:col-span-8 space-y-8">
           <Card className="border-none shadow-sm overflow-hidden bg-white">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 bg-white px-8 py-6">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-[#ef4444]">
                       <Layout size={20} />
                    </div>
                    <CardTitle className="text-lg font-black tracking-tight">Creative Log Summary</CardTitle>
                 </div>
                 <Button variant="outline" size="sm" className="rounded-xl font-black text-[10px] uppercase tracking-widest h-9 bg-white border-slate-200">
                    Download Full Audit
                 </Button>
              </CardHeader>
              <CardContent className="p-8">
                 <div className="text-center py-12 bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
                    <p className="text-sm font-bold text-slate-400">Creative log data acquisition in progress...</p>
                 </div>
              </CardContent>
           </Card>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 detail-card">
              <Card className="border-none shadow-sm bg-white">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500">
                         <Heart size={20} fill="currentColor" />
                      </div>
                      <CardTitle className="text-base font-black tracking-tight">Interaction Metrics</CardTitle>
                   </div>
                </CardHeader>
                <CardContent className="space-y-1">
                   {[
                      { label: 'Asset Favorites', value: `${user.likes || 0} items`, icon: Heart },
                      { label: 'Group Engagement', value: user.isVerified ? '78% High' : 'Low Access', icon: Star },
                      { label: 'Audio Tracks Used', value: '0 tracks', icon: Music },
                      { label: 'Distribution Share', value: '0 times', icon: Share2 },
                   ].map((s, i) => (
                      <div key={i} className="flex justify-between items-center py-4 border-b border-slate-50 last:border-0 last:pb-0 group">
                         <span className="text-xs font-bold text-slate-400 group-hover:text-slate-600 transition-colors">{s.label}</span>
                         <span className="text-sm font-black text-slate-700">{s.value}</span>
                      </div>
                   ))}
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-white">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-500">
                         <Clock size={20} />
                      </div>
                      <CardTitle className="text-base font-black tracking-tight">Lifecycle Audit</CardTitle>
                   </div>
                </CardHeader>
                <CardContent className="space-y-1">
                   {[
                      { label: 'Network Ingress', value: formatDate(user.createdAt) },
                      { label: 'Inbound Channel', value: 'Authenticated Link' },
                      { label: 'Verification Tier', value: user.isVerified ? 'Lvl 4 Secure' : 'Lvl 1 Guest' },
                      { label: 'Terminal Refresh', value: formatDate(user.updatedAt, { month: 'short' }) },
                   ].map((s, i) => (
                      <div key={i} className="flex justify-between items-center py-4 border-b border-slate-50 last:border-0 last:pb-0 group">
                         <span className="text-xs font-bold text-slate-400 group-hover:text-slate-600 transition-colors">{s.label}</span>
                         <span className="text-sm font-black text-slate-700">{s.value}</span>
                      </div>
                   ))}
                </CardContent>
              </Card>
           </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
