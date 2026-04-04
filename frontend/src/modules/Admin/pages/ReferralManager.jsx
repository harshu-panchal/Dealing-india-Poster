import React, { useMemo, useState, useRef } from 'react';
import { 
  Share2, Plus, TrendingUp, Users, Award, Settings, 
  ArrowUpRight, DollarSign, Calendar, Sliders, CheckCircle, 
  Smartphone, UserPlus, Zap, Target, ShieldCheck,
  ChevronRight, ArrowDownRight, MoreHorizontal
} from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const ReferralManager = () => {
  const [activeRange, setActiveRange] = useState('Monthly');
  const containerRef = useRef();

  // Entrance animations removed for immediate visibility

  // Mock referral data
  const referralStats = useMemo(() => [
    { id: 'points', label: 'Network Points Issued', value: '42,500', icon: Award, color: '#ef4444', trend: '+15.2%', isUp: true },
    { id: 'total', label: 'Total Referrals', value: '840', icon: UserPlus, color: '#10b981', trend: '+8.4%', isUp: true },
    { id: 'conversion', label: 'Conversion Rate', value: '62.4%', icon: TrendingUp, color: '#f59e0b', trend: '-2.1%', isUp: false }
  ], []);

  const topReferrers = useMemo(() => [
    { id: 1, name: 'Anil K.', code: 'DI-REF-8822', referrals: 42, pointsEarned: 21000, status: 'Elite' },
    { id: 2, name: 'Megha S.', code: 'DI-REF-1144', referrals: 28, pointsEarned: 14000, status: 'Active' },
    { id: 3, name: 'Vikram P.', code: 'DI-REF-9090', referrals: 15, pointsEarned: 7500, status: 'Active' },
    { id: 4, name: 'Sonia R.', code: 'DI-REF-6754', referrals: 8, pointsEarned: 4000, status: 'Member' }
  ], []);

  return (
    <div ref={containerRef} className="space-y-10 pb-12">
      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div>
           <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 leading-none">Incentive Architecture</p>
           <h1 className="text-3xl font-black text-[var(--admin-text-main)] tracking-tight">Referral Engine</h1>
           <p className="text-slate-400 text-xs font-semibold mt-1">Regulate organic propagation and reward distribution</p>
        </div>
        <Button className="rounded-xl shadow-lg shadow-red-500/20 px-6 h-12">
           <Sliders size={18} className="mr-2" strokeWidth={3} /> Configure Logic
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {referralStats.map((stat, i) => (
          <Card key={i} className="referral-item border-none group overflow-hidden relative">
             <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--admin-border)] rounded-bl-[4rem] -z-0 group-hover:scale-110 transition-transform duration-500" />
             <div className="relative z-10 p-6 flex justify-between items-start">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3 group-hover:rotate-0 transition-all duration-500"
                  style={{ backgroundColor: stat.color }}
                >
                   <stat.icon size={24} />
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${stat.isUp ? 'bg-emerald-50 text-emerald-600 ' : 'bg-rose-50 text-rose-600 '}`}>
                   {stat.trend} {stat.isUp ? <ArrowUpRight size={10} strokeWidth={3} /> : <ArrowDownRight size={10} strokeWidth={3} />}
                </div>
             </div>
             <div className="px-6 pb-6 relative z-10">
                <p className="text-[10px] font-black text-[var(--admin-text-subtle)] uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                   <h3 className="text-2xl font-black text-[var(--admin-text-main)] tracking-tight">{stat.value}</h3>
                   {stat.id === 'conversion' && <span className="text-[10px] font-bold text-[var(--admin-text-subtle)]">AGGR: 58.1%</span>}
                </div>
             </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         <div className="lg:col-span-2 space-y-8">
            <Card className="referral-item border-none overflow-hidden">
               <CardHeader className="bg-white border-b border-[var(--admin-border)] px-8 py-6 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Advocate Registry</CardTitle>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-0.5">Top performing organic channels</p>
                  </div>
                  <div className="flex gap-1 bg-white  p-1 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                     {['Monthly', 'Yearly', 'Max'].map(range => (
                        <button 
                          key={range}
                          onClick={() => setActiveRange(range)}
                          className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg border-none cursor-pointer transition-all ${activeRange === range ? 'bg-red-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                           {range}
                        </button>
                     ))}
                  </div>
               </CardHeader>
               <div className="overflow-x-auto">
                  <table className="w-full">
                      <thead>
                         <tr className="border-b border-slate-100 bg-white">
                            <th className="px-8 py-4 text-left text-[11px] font-black text-slate-900 uppercase tracking-wider">Advocate</th>
                            <th className="px-8 py-4 text-left text-[11px] font-black text-slate-900 uppercase tracking-wider">Referral Code</th>
                            <th className="px-8 py-4 text-left text-[11px] font-black text-slate-900 uppercase tracking-wider">Referrals</th>
                            <th className="px-8 py-4 text-left text-[11px] font-black text-slate-900 uppercase tracking-wider">Points Earned</th>
                            <th className="px-8 py-4 text-right text-[11px] font-black text-slate-900 uppercase tracking-wider">Status</th>
                         </tr>
                      </thead>
                     <tbody className="divide-y divide-[var(--admin-border)]">
                         {topReferrers.map(ref => (
                            <tr key={ref.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-all">
                              <td className="px-8 py-5">
                                  <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-black text-xs">
                                       {ref.name.slice(0, 2).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-black text-slate-700 ">{ref.name}</span>
                                 </div>
                              </td>
                              <td className="px-8 py-5">
                                 <code className="text-[10px] font-black text-[#ef4444] bg-red-50  py-1.5 px-3 rounded-lg border border-red-500/10 tracking-widest uppercase">{ref.code}</code>
                              </td>
                              <td className="px-8 py-5">
                                 <span className="text-sm font-black text-slate-700 ">{ref.referrals}</span>
                              </td>
                              <td className="px-8 py-5">
                                  <div className="flex items-baseline gap-1">
                                    <span className="text-sm font-black text-[#ef4444]">{ref.pointsEarned.toLocaleString()}</span>
                                    <span className="text-[9px] font-black text-[var(--admin-text-subtle)] uppercase">PTS</span>
                                 </div>
                              </td>
                              <td className="px-8 py-5 text-right">
                                 <Badge variant={ref.status === 'Elite' ? 'success' : 'warning'} className="text-[9px] font-black uppercase tracking-widest px-3">
                                    {ref.status}
                                 </Badge>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </Card>

            <Card className="referral-item border-none detail-card p-8">
               <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 bg-[#ef4444] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-red-500/20">
                     <ShieldCheck size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-slate-200 tracking-tight">Access Control & Security</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-0.5">Integrity preservation mechanics</p>
                  </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-6 bg-white  rounded-[2rem] border border-slate-100 dark:border-slate-800 group hover:ring-2 hover:ring-red-500/20 transition-all flex flex-col justify-between h-[160px]">
                     <div className="flex justify-between items-start">
                        <div className="w-10 h-10 rounded-xl bg-slate-50  flex items-center justify-center text-blue-500 shadow-sm group-hover:scale-110 transition-transform"><Smartphone size={18} /></div>
                        <div className="w-14 h-7 bg-[#ef4444] rounded-full relative shadow-inner p-1">
                           <div className="absolute right-1 top-0.5 w-6 h-6 bg-white rounded-full shadow-lg"></div>
                        </div>
                     </div>
                     <div>
                        <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 mb-0.5">Device Registry Sync</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed">Prevent multi-instancing on equivalent nodes</p>
                     </div>
                  </div>

                  <div className="p-6 bg-white  rounded-[2rem] border border-slate-100 dark:border-slate-800 group hover:ring-2 hover:ring-red-500/20 transition-all flex flex-col justify-between h-[160px]">
                     <div className="flex justify-between items-start">
                        <div className="w-10 h-10 rounded-xl bg-slate-50  flex items-center justify-center text-emerald-500 shadow-sm group-hover:scale-110 transition-transform"><Target size={18} /></div>
                        <div className="w-14 h-7 bg-slate-200 dark:bg-slate-800 rounded-full relative shadow-inner p-1">
                           <div className="absolute left-1 top-0.5 w-6 h-6 bg-white rounded-full shadow-lg"></div>
                        </div>
                     </div>
                     <div>
                        <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 mb-0.5">Yield Modulation Cap</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed">Limit monthly reward accrual per unique ID</p>
                     </div>
                  </div>
               </div>
            </Card>
         </div>

         <div className="referral-item space-y-8">
            <Card className="bg-indigo-600 rounded-[3rem] p-8 text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden group/policy border-none">
               <div className="absolute top-0 right-0 p-12 opacity-10 translate-x-12 -translate-y-12 rotate-12 group-hover/policy:rotate-0 transition-transform duration-700">
                  <Share2 size={160} />
               </div>
               
               <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-8">
                     <div className="h-2 w-8 bg-white/40 rounded-full" />
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Active Governance</p>
                  </div>
                  
                  <h3 className="text-2xl font-black mb-1 tracking-tight">Reward Protocol</h3>
                  <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-10">REV: 2026.01.01V2</p>
                  
                  <div className="space-y-6">
                     <div className="flex items-center gap-5 p-4 bg-white/5 dark:bg-white/10 rounded-2xl border border-white/10 group-hover/policy:bg-white/10 transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
                           <Award size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                           <p className="text-[9px] font-black uppercase text-white/50 tracking-widest mb-0.5">Primary Incentive</p>
                           <p className="text-lg font-black tracking-tight">500 Credits</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-5 p-4 bg-white/5 dark:bg-white/10 rounded-2xl border border-white/10 group-hover/policy:bg-white/10 transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
                           <DollarSign size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                           <p className="text-[9px] font-black uppercase text-white/50 tracking-widest mb-0.5">Referee Bonus</p>
                           <p className="text-lg font-black tracking-tight">100 Credits</p>
                        </div>
                     </div>
                  </div>

                  <Button className="w-full h-16 mt-10 bg-white text-indigo-600 hover:bg-slate-50 shadow-xl shadow-black/10 font-black text-[10px] uppercase tracking-[0.2em] border-none group/edit">
                     Update Governance <ChevronRight size={14} className="ml-2 group-hover/edit:translate-x-1 transition-transform" strokeWidth={3} />
                  </Button>
               </div>
            </Card>

            <Card className="border-none detail-card p-8">
               <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--admin-text-subtle)] mb-6 flex items-center gap-2">
                  <ShieldCheck size={14} className="text-[#ef4444]" /> Protocol Rules
               </h3>
               <div className="space-y-4">
                  {[
                     { text: 'Single Identity Mapping', status: true },
                     { text: 'Mobile Handshake Required', status: true },
                     { text: '90-Day Credit Maturity', status: true },
                     { text: 'Dynamic Thresholding Active', status: true }
                  ].map((rule, idx) => (
                     <div key={idx} className="flex items-center gap-4 group/rule">
                        <div className="w-6 h-6 rounded-lg bg-emerald-50  flex items-center justify-center text-emerald-500 group-hover/rule:scale-110 transition-transform">
                           <CheckCircle size={14} strokeWidth={3} />
                        </div>
                        <span className="text-[11px] font-black text-[var(--admin-text-muted)] uppercase tracking-tighter">{rule.text}</span>
                     </div>
                  ))}
               </div>
            </Card>
         </div>
      </div>
    </div>
  );
};

export default ReferralManager;
