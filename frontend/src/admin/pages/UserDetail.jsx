import React, { useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Phone, MapPin, Calendar, 
  Award, Heart, Layout, Zap, 
  ShieldCheck, Smartphone, Mail, MoreHorizontal,
  Star, Clock, ChevronRight, Download, Share2, Music, Search
} from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const containerRef = useRef();

  // Entrance animations removed for immediate visibility

  // Mock user fetching
  const user = useMemo(() => ({
    id: id,
    name: 'Rahul Sharma',
    phone: '+91 98765 43210',
    email: 'rahul.sharma@example.com',
    plan: 'Premium',
    status: 'active',
    joined: 'March 15, 2026',
    likes: 24,
    downloads: 156,
    points: 2500,
    business: 'Rahul Prints & Graphics',
    location: 'Jaipur, Rajasthan',
    lastLogin: '2 hours ago',
    device: 'iPhone 15 Pro'
  }), [id]);

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
              <h1 className="text-3xl font-black tracking-tight text-[var(--admin-text-main)]">{user.name}</h1>
              <Badge variant="success" className="text-[10px] font-black uppercase tracking-[0.1em]">
                {user.plan} MEMBER
              </Badge>
            </div>
            <p className="text-[var(--admin-text-subtle)] text-[11px] font-black uppercase tracking-[0.2em] mt-1 opacity-70">REGISTRY ID: {user.id}</p>
          </div>
        </div>

        <div className="flex gap-3">
           <Button variant="outline" className="rounded-xl border-slate-200 px-6 font-bold text-slate-600">
             Deactivate Network
           </Button>
           <Button className="rounded-xl shadow-lg shadow-red-500/20 px-6">
             Update Profile
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Column (Info Sidebar) */}
        <div className="xl:col-span-4 space-y-8 detail-card">
          <Card className="border-none">
             <div className="p-8 flex flex-col items-center">
                <div className="relative mb-8">
                  <div className="w-40 h-40 rounded-[3rem] bg-red-50 dark:bg-red-500/15 flex items-center justify-center text-[#ef4444] text-6xl font-black border-4 border-[var(--admin-bg)] shadow-2xl shadow-slate-200/50 dark:shadow-none">
                    {user.name.charAt(0)}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-emerald-500 border-4 border-white dark:border-slate-800 rounded-2xl flex items-center justify-center text-white shadow-xl">
                    <ShieldCheck size={24} />
                  </div>
                </div>
                
                <h2 className="text-2xl font-black text-slate-800 dark:text-slate-200 mb-1 tracking-tight">{user.name}</h2>
                <div className="flex items-center gap-2 text-[var(--admin-text-subtle)] font-black text-[10px] uppercase tracking-[0.2em] mb-8">
                  <Smartphone size={12} className="text-red-500" /> {user.device}
                </div>

                <div className="grid grid-cols-2 gap-4 w-full mb-10">
                  <div className="bg-[var(--admin-bg)] p-5 rounded-3xl text-center border border-[var(--admin-border)] transition-colors">
                    <p className="text-[10px] font-black text-[var(--admin-text-subtle)] uppercase tracking-widest mb-1.5">Engagement</p>
                    <p className="text-2xl font-black text-[#ef4444] leading-none">{user.likes}</p>
                  </div>
                  <div className="bg-[var(--admin-bg)] p-5 rounded-3xl text-center border border-[var(--admin-border)] transition-colors">
                    <p className="text-[10px] font-black text-[var(--admin-text-subtle)] uppercase tracking-widest mb-1.5">Total Points</p>
                    <p className="text-2xl font-black text-[#ef4444] leading-none">{user.points}</p>
                  </div>
                </div>

                <div className="w-full space-y-4 pt-4 border-t border-slate-50 dark:border-slate-800/50">
                  <div className="flex items-start gap-5 p-4 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group">
                    <div className="w-11 h-11 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-[#ef4444] shrink-0 shadow-sm group-hover:scale-110 transition-transform"><Phone size={20} /></div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Authenticated Phone</p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">{user.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-5 p-4 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group">
                    <div className="w-11 h-11 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-[#ef4444] shrink-0 shadow-sm group-hover:scale-110 transition-transform"><Mail size={20} /></div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Email Connection</p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-5 p-4 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group">
                    <div className="w-11 h-11 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-[#ef4444] shrink-0 shadow-sm group-hover:scale-110 transition-transform"><MapPin size={20} /></div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Origin City</p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">{user.location}</p>
                    </div>
                  </div>
                </div>
             </div>
          </Card>

          <div className="bg-slate-900 dark:bg-red-950/20 rounded-[2.5rem] p-8 text-white shadow-xl shadow-slate-200 dark:shadow-none relative overflow-hidden group">
             <div className="flex items-center justify-between mb-4 relative z-10">
                 <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/60">Subscriber Intelligence</h3>
                <Zap size={18} className="text-amber-400 group-hover:scale-125 transition-transform" />
             </div>
             <p className="text-xs text-slate-400 font-semibold mb-8 leading-relaxed relative z-10">
                This user has been a <span className="text-white font-black uppercase tracking-widest text-[10px]">Premium Subscriber</span> for 120 days with consistent weekly activity.
             </p>
             <Button className="w-full h-12 bg-white/10 dark:bg-white/5 text-white rounded-2xl h-12 text-[10px] font-black uppercase tracking-[0.2em] border-none hover:bg-white/20 transition-all relative z-10">
                Review Lifecycle
             </Button>
             <Zap size={140} className="absolute -bottom-10 -right-10 text-white/5 pointer-events-none group-hover:rotate-12 transition-transform duration-700" />
          </div>
        </div>

        {/* Right Column (Content) */}
        <div className="xl:col-span-8 space-y-8">
           <Card className="border-none detail-card overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b border-[var(--admin-border)] bg-white px-8 py-6">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-500/15 flex items-center justify-center text-[#ef4444]">
                       <Layout size={20} />
                    </div>
                    <CardTitle>Creative Log Summary</CardTitle>
                 </div>
                 <Button variant="outline" size="sm" className="rounded-xl font-black text-[10px] uppercase tracking-widest h-9 bg-white">
                    Download Full Audit
                 </Button>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                   {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                      <div key={i} className="aspect-[3/4] rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 overflow-hidden group relative cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500">
                         <img 
                          src={`https://images.unsplash.com/photo-${1500000000000 + (i * 100000000)}?q=80&w=400&fit=crop`} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                          alt="Poster" 
                          onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=400";
                          }}
                         />
                         <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-[#ef4444] shadow-lg translate-y-4 group-hover:translate-y-0 transition-transform duration-500 font-black"><Search size={18} /></div>
                            <span className="text-[10px] font-black text-white uppercase tracking-widest translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">Aug 24, 2024</span>
                         </div>
                      </div>
                   ))}
                </div>
              </CardContent>
           </Card>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 detail-card">
              <Card className="border-none">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-500">
                         <Heart size={20} fill="currentColor" />
                      </div>
                      <CardTitle>Interaction Metrics</CardTitle>
                   </div>
                </CardHeader>
                <CardContent className="space-y-1">
                   {[
                      { label: 'Asset Favorites', value: '42 items', icon: Heart },
                      { label: 'Group Engagement', value: '78% High', icon: Star },
                      { label: 'Audio Tracks Used', value: '15 tracks', icon: Music },
                      { label: 'Distribution Share', value: '128 times', icon: Share2 },
                   ].map((s, i) => (
                      <div key={i} className="flex justify-between items-center py-4 border-b border-slate-50 dark:border-slate-800 last:border-0 last:pb-0 group">
                         <span className="text-xs font-bold text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors">{s.label}</span>
                         <span className="text-sm font-black text-slate-700 dark:text-slate-300">{s.value}</span>
                      </div>
                   ))}
                </CardContent>
              </Card>

              <Card className="border-none">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center text-sky-500">
                         <Clock size={20} />
                      </div>
                      <CardTitle>Lifecycle Audit</CardTitle>
                   </div>
                </CardHeader>
                <CardContent className="space-y-1">
                   {[
                      { label: 'Network Ingress', value: user.joined },
                      { label: 'Inbound Channel', value: 'Direct Search' },
                      { label: 'Verification Tier', value: 'Lvl 4 Secure' },
                      { label: 'Terminal Access', value: user.lastLogin },
                   ].map((s, i) => (
                      <div key={i} className="flex justify-between items-center py-4 border-b border-slate-50 dark:border-slate-800 last:border-0 last:pb-0 group">
                         <span className="text-xs font-bold text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors">{s.label}</span>
                         <span className="text-sm font-black text-slate-700 dark:text-slate-300">{s.value}</span>
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
