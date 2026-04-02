import React, { useMemo, useRef } from 'react';
import { 
  TrendingUp, Users, ImageIcon, Layers, 
  Award, ArrowUpRight, ArrowDownRight, 
  MoreHorizontal, Calendar, Zap, Target
} from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

const AdminDashboard = () => {
  const containerRef = useRef();

  // Entrance animations removed for immediate visibility

  const stats = useMemo(() => [
    { label: 'Total Users', value: '12,540', icon: Users, color: '#ef4444', trend: '+12.5%', isUp: true },
    { label: 'Active Templates', value: '450', icon: Zap, color: '#10b981', trend: '+5.2%', isUp: true },
    { label: 'Cloud Exports', value: '2,840', icon: Layers, color: '#f59e0b', trend: '-2.1%', isUp: false },
    { label: 'Growth Target', value: '85%', icon: Target, color: '#6366f1', trend: '+18.7%', isUp: true }
  ], []);

  const recentUsers = useMemo(() => [
    { id: 1, name: 'Rahul Sharma', phone: '+91 98765 43210', plan: 'Premium', joined: '2 mins ago', status: 'active' },
    { id: 2, name: 'Priya Verma', phone: '+91 87654 32109', plan: 'Free', joined: '15 mins ago', status: 'active' },
    { id: 3, name: 'Amit Singh', phone: '+91 76543 21098', plan: 'Premium', joined: '1 hour ago', status: 'inactive' },
    { id: 4, name: 'Surbhi Gupta', phone: '+91 65432 10987', plan: 'Free', joined: '3 hours ago', status: 'active' },
  ], []);

  return (
    <div ref={containerRef} className="space-y-10">
      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div>
           <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 leading-none">Operations Control</p>
           <h1 className="text-3xl font-black text-[var(--admin-text-main)] tracking-tight">System Insights</h1>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" className="rounded-xl border-slate-200">
              <Calendar size={16} className="mr-2" /> Last 30 Days
           </Button>
           <Button className="rounded-xl shadow-lg shadow-red-500/20">
              Generate Audit
           </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <Card key={idx} className="stat-card border-none group hover:shadow-xl transition-all duration-500 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--admin-border)] rounded-bl-[4rem] group-hover:scale-110 transition-transform duration-500 -z-0" />
            <div className="relative z-10 p-6">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg rotate-3 group-hover:rotate-0 transition-transform duration-500"
                style={{ backgroundColor: stat.color }}
              >
                <stat.icon size={22} />
              </div>
              <p className="text-[10px] font-black text-[var(--admin-text-subtle)] uppercase tracking-[0.2em] mb-1">{stat.label}</p>
              <div className="flex items-baseline gap-3">
                <h3 className="text-2xl font-black text-[var(--admin-text-main)] tracking-tighter">{stat.value}</h3>
                <div className={`flex items-center text-[10px] font-black ${stat.isUp ? 'text-emerald-500 bg-emerald-50/80 ' : 'text-rose-500 bg-rose-50/80 '} px-2 py-0.5 rounded-full`}>
                   {stat.isUp ? <ArrowUpRight size={10} className="mr-0.5" /> : <ArrowDownRight size={10} className="mr-0.5" />}
                   {stat.trend}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Popular Content */}
        <div className="lg:col-span-4 dashboard-section">
           <Card className="h-full border-none">
              <CardHeader className="flex flex-row items-center justify-between">
                 <CardTitle>Popular Categories</CardTitle>
                 <TrendingUp size={16} className="text-red-500" />
              </CardHeader>
              <CardContent className="space-y-6">
                 {[
                   { name: 'Festival Greetings', count: 1250, pct: 85, color: '#ef4444' },
                   { name: 'Business Marketing', count: 980, pct: 65, color: '#10b981' },
                   { name: 'Daily Motivations', count: 850, pct: 55, color: '#f59e0b' },
                   { name: 'Special Occasions', count: 620, pct: 40, color: '#6366f1' }
                 ].map((cat, i) => (
                   <div key={i} className="group">
                      <div className="flex justify-between items-center mb-2">
                         <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{cat.name}</span>
                         <span className="text-[10px] font-black text-slate-400 uppercase">{cat.count} uses</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                         <div 
                           className="h-full rounded-full transition-all duration-1000 group-hover:brightness-110" 
                           style={{ width: `${cat.pct}%`, backgroundColor: cat.color }}
                         />
                      </div>
                   </div>
                 ))}
                 
                 <div className="pt-4">
                    <Button variant="outline" className="w-full rounded-xl border-dashed border-2 text-slate-400 text-xs font-black uppercase tracking-widest h-12">
                       Explore Detailed Analytics
                    </Button>
                 </div>
              </CardContent>
           </Card>
        </div>

        {/* Right: New Registrations */}
        <div className="lg:col-span-8 dashboard-section">
           <Card className="border-none">
              <CardHeader className="flex flex-row items-center justify-between">
                 <CardTitle>Fresh Registrations</CardTitle>
                 <Button variant="ghost" size="icon" className="rounded-xl">
                    <MoreHorizontal size={20} className="text-slate-400" />
                 </Button>
              </CardHeader>
              <div className="overflow-x-auto">
                 <table className="w-full">
                     <thead>
                        <tr className="border-b border-slate-100 bg-white">
                           <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">User</th>
                           <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Subscription</th>
                           <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Joined</th>
                           <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                        </tr>
                     </thead>
                    <tbody className="divide-y divide-[var(--admin-border)]">
                       {recentUsers.map(user => (
                         <tr key={user.id} className="group hover:bg-[var(--admin-row-hover)] transition-colors">
                            <td className="px-6 py-5">
                               <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-2xl bg-slate-100  flex items-center justify-center font-black text-xs text-[#ef4444] border-2 border-white dark:border-slate-800 shadow-sm group-hover:scale-110 transition-transform">
                                     {user.name.charAt(0)}
                                  </div>
                                  <div>
                                     <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-none mb-1">{user.name}</p>
                                     <p className="text-[0.65rem] font-medium text-slate-400">{user.phone}</p>
                                  </div>
                               </div>
                            </td>
                            <td className="px-6 py-5">
                               <Badge variant={user.plan === 'Premium' ? 'success' : 'warning'} className="rounded-lg text-[10px] font-black uppercase tracking-widest">
                                  {user.plan}
                               </Badge>
                            </td>
                            <td className="px-6 py-5">
                               <span className="text-xs font-semibold text-slate-500 italic">{user.joined}</span>
                            </td>
                            <td className="px-6 py-5">
                               <div className="flex items-center gap-2">
                                  <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{user.status}</span>
                               </div>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
              <div className="p-4 border-t border-[var(--admin-border)] flex justify-center">
                 <Button variant="link" className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 hover:text-red-500">
                    View Entire Ledger
                 </Button>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
