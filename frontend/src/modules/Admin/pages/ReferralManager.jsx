import React, { useMemo, useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Share2, Plus, TrendingUp, Users, Award, Settings, 
  ArrowUpRight, DollarSign, Calendar, Sliders, CheckCircle, 
  Smartphone, UserPlus, Zap, Target, ShieldCheck,
  ChevronRight, ArrowDownRight, MoreHorizontal, Loader2, X
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
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalReferrals: 0, totalPointsIssued: 0 });
  const [leaderboard, setLeaderboard] = useState([]);
  const [referralPoints, setReferralPoints] = useState(10);
  const [isUpdatingPoints, setIsUpdatingPoints] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [newPointsPlan, setNewPointsPlan] = useState(10);
  const [viewingReferredUsers, setViewingReferredUsers] = useState(null);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

  const fetchReferralData = async () => {
    try {
      const adminInfo = localStorage.getItem('adminInfo');
      const token = adminInfo ? JSON.parse(adminInfo).accessToken : null;

      if (!token) return;

      const [pointsRes, leaderboardRes] = await Promise.all([
        axios.get(`${API_URL}/admin/settings/referral-points`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/admin/referrals/leaderboard`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setReferralPoints(pointsRes.data.value);
      setNewPointsPlan(pointsRes.data.value);
      setStats(leaderboardRes.data.stats);
      setLeaderboard(leaderboardRes.data.leaderboard);
    } catch (error) {
      console.error('Error fetching referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferralData();
  }, []);

  const handleUpdatePoints = async () => {
    setIsUpdatingPoints(true);
    try {
      const adminInfo = localStorage.getItem('adminInfo');
      const token = adminInfo ? JSON.parse(adminInfo).accessToken : null;
      await axios.post(`${API_URL}/admin/settings/referral-points`, { value: newPointsPlan }, { headers: { Authorization: `Bearer ${token}` } });
      setReferralPoints(newPointsPlan);
      setShowConfigModal(false);
      alert('Referral points updated successfully!');
    } catch (error) {
      console.error('Error updating points:', error);
      alert('Failed to update points');
    } finally {
      setIsUpdatingPoints(false);
    }
  };

  const referralStats = useMemo(() => [
    { id: 'points', label: 'Network Points Issued', value: stats.totalPointsIssued.toLocaleString(), icon: Award, color: '#ef4444', trend: '+15.2%', isUp: true },
    { id: 'total', label: 'Total Referrals', value: stats.totalReferrals.toLocaleString(), icon: UserPlus, color: '#10b981', trend: '+8.4%', isUp: true },
    { id: 'conversion', label: 'Active Plan', value: `${referralPoints} PTS`, icon: Zap, color: '#f59e0b', trend: 'STABLE', isUp: true }
  ], [stats, referralPoints]);

  if (loading) return (
    <div className="flex items-center justify-center py-40">
       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
    </div>
  );

  return (
    <div ref={containerRef} className="space-y-10 pb-12">
      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div>
           <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 leading-none">Incentive Architecture</p>
           <h1 className="text-3xl font-black text-[var(--admin-text-main)] tracking-tight">Referral Engine</h1>
           <p className="text-slate-400 text-xs font-semibold mt-1">Regulate organic propagation and reward distribution</p>
        </div>
        <Button onClick={() => setShowConfigModal(true)} className="rounded-xl shadow-lg shadow-red-500/20 px-6 h-12 border-none">
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
               </CardHeader>
               <div className="overflow-x-auto">
                  <table className="w-full">
                      <thead>
                         <tr className="border-b border-slate-100 bg-white">
                            <th className="px-8 py-4 text-left text-[11px] font-black text-slate-900 uppercase tracking-wider">Advocate</th>
                            <th className="px-8 py-4 text-left text-[11px] font-black text-slate-900 uppercase tracking-wider">Referral Code</th>
                            <th className="px-8 py-4 text-left text-[11px] font-black text-slate-900 uppercase tracking-wider">Referrals</th>
                            <th className="px-8 py-4 text-left text-[11px] font-black text-slate-900 uppercase tracking-wider">Points Earned</th>
                         </tr>
                      </thead>
                     <tbody className="divide-y divide-[var(--admin-border)]">
                         {leaderboard.map(ref => (
                            <tr key={ref._id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-all">
                              <td className="px-8 py-5">
                                  <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-black text-xs">
                                       {ref.name?.slice(0, 2).toUpperCase() || 'U'}
                                    </div>
                                    <span className="text-sm font-black text-slate-700 ">{ref.name || 'Anonymous'}</span>
                                 </div>
                              </td>
                              <td className="px-8 py-5">
                                 <code className="text-[10px] font-black text-[#ef4444] bg-red-50  py-1.5 px-3 rounded-lg border border-red-500/10 tracking-widest uppercase">{ref.referralCode}</code>
                              </td>
                              <td className="px-8 py-5">
                                 <div 
                                    onClick={() => setViewingReferredUsers(ref)}
                                    className="text-sm font-black text-slate-700 cursor-pointer hover:text-[#ef4444] transition-colors flex items-center gap-2 group"
                                 >
                                    {ref.referralCount}
                                    <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                 </div>
                              </td>
                              <td className="px-8 py-5">
                                  <div className="flex items-baseline gap-1">
                                    <span className="text-sm font-black text-[#ef4444]">{ref.points.toLocaleString()}</span>
                                    <span className="text-[9px] font-black text-[var(--admin-text-subtle)] uppercase">PTS</span>
                                 </div>
                              </td>
                           </tr>
                        ))}
                        {leaderboard.length === 0 && (
                          <tr>
                            <td colSpan="4" className="px-8 py-10 text-center text-slate-400 font-bold uppercase tracking-widest text-xs italic opacity-50">
                               No referral data available yet
                            </td>
                          </tr>
                        )}
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
                  <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-10">Current Live Settings</p>
                  
                  <div className="space-y-6">
                     <div className="flex items-center gap-5 p-4 bg-white/5 dark:bg-white/10 rounded-2xl border border-white/10 group-hover/policy:bg-white/10 transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
                           <Award size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                           <p className="text-[9px] font-black uppercase text-white/50 tracking-widest mb-0.5">Primary Incentive</p>
                           <p className="text-lg font-black tracking-tight">{referralPoints} Credits</p>
                        </div>
                     </div>
                  </div>

                  <Button onClick={() => setShowConfigModal(true)} className="w-full h-16 mt-10 bg-white text-indigo-600 hover:bg-slate-50 shadow-xl shadow-black/10 font-black text-[10px] uppercase tracking-[0.2em] border-none group/edit">
                     Update Governance <ChevronRight size={14} className="ml-2 group-hover/edit:translate-x-1 transition-transform" strokeWidth={3} />
                  </Button>
               </div>
            </Card>
         </div>
      </div>

      {/* Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
           <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowConfigModal(false)}></div>
           <Card className="relative z-10 w-full max-w-[400px] border-none p-6 sm:p-10 rounded-[2.5rem] shadow-2xl bg-white mx-auto my-auto">
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight mb-2">Protocol Configuration</h2>
              <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Adjust reward distribution parameters</p>
              
              <div className="space-y-6">
                 <div>
                    <label className="text-[10px] sm:text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1 block mb-3">Credits per Referral</label>
                    <div className="relative group">
                       <Award size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors" />
                       <Input 
                         type="number" 
                         value={newPointsPlan}
                         onChange={(e) => setNewPointsPlan(e.target.value)}
                         className="w-full pl-12 h-14 bg-slate-50 border-slate-100 rounded-2xl font-black text-slate-700 focus:bg-white transition-all shadow-inner"
                       />
                    </div>
                 </div>
                 
                 <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowConfigModal(false)}
                      className="flex-1 rounded-2xl h-14 border-slate-200 text-slate-400 font-black uppercase tracking-widest order-2 sm:order-1"
                    >
                       Cancel
                    </Button>
                    <Button 
                      onClick={handleUpdatePoints}
                      disabled={isUpdatingPoints}
                      className="flex-1 rounded-2xl h-14 shadow-lg shadow-red-500/20 font-black uppercase tracking-widest border-none order-1 sm:order-2"
                    >
                       {isUpdatingPoints ? <Loader2 className="animate-spin" /> : 'Apply Logic'}
                    </Button>
                 </div>
              </div>
           </Card>
        </div>
      )}
      {/* Referred Users Modal */}
      {viewingReferredUsers && (
        <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
           <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setViewingReferredUsers(null)}></div>
           <Card className="relative z-11 w-full max-w-[480px] border-none overflow-hidden bg-white rounded-[2.5rem] shadow-2xl mx-auto my-auto animate-in fade-in zoom-in duration-300">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-6">
                 <div className="flex items-center justify-between">
                    <div>
                       <CardTitle className="text-xl">Referred by {viewingReferredUsers.name}</CardTitle>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Total {viewingReferredUsers.referralCount} organic connections</p>
                    </div>
                    <Button variant="ghost" onClick={() => setViewingReferredUsers(null)} className="rounded-full w-10 h-10 p-0 flex items-center justify-center border-none hover:bg-slate-100 transition-all">
                       <X size={20} />
                    </Button>
                 </div>
              </CardHeader>
              <div className="max-h-[450px] overflow-y-auto px-4 py-4 space-y-1">
                 {viewingReferredUsers.referredUsers?.map((referred, i) => (
                    <div 
                      key={referred._id}
                      onClick={() => navigate(`/admin/users/${referred._id}`)}
                      className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl cursor-pointer group transition-all border border-transparent hover:border-slate-100"
                    >
                       <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-xl bg-red-50 text-[#ef4444] flex items-center justify-center font-black text-sm shadow-sm group-hover:scale-105 transition-transform">
                             {referred.name?.slice(0, 2).toUpperCase() || 'U'}
                          </div>
                          <div>
                             <h4 className="text-sm font-black text-slate-800">{referred.name || 'Anonymous'}</h4>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{referred.mobileNumber || referred.email || 'No Identity'}</p>
                          </div>
                       </div>
                       <ChevronRight size={16} className="text-slate-300 group-hover:text-[#ef4444] group-hover:translate-x-1 transition-all" />
                    </div>
                 ))}
                 {(!viewingReferredUsers.referredUsers || viewingReferredUsers.referredUsers.length === 0) && (
                    <div className="py-20 text-center opacity-40">
                       <Users size={40} className="mx-auto mb-3 text-slate-200" />
                       <p className="text-[10px] font-black uppercase tracking-widest text-[#ef4444]">No detailed record available</p>
                    </div>
                 )}
              </div>
              <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-center">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">End of registry</p>
              </div>
           </Card>
        </div>
      )}
    </div>
  );
};

export default ReferralManager;

