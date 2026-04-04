import React from 'react';
import { CreditCard, Image, Users, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="py-md">
      <div className="mb-md">
        <h1 className="text-2xl font-bold">Member Dashboard</h1>
        <p className="text-text-secondary">Overview of your account and activities</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md mb-xl">
        <div className="bg-card p-lg rounded-md border border-border flex items-center gap-md">
          <div className="w-[50px] h-[50px] rounded-sm flex items-center justify-center bg-[#f3e8ff] text-[#a855f7]"><CreditCard size={24} /></div>
          <div className="flex flex-col">
            <span className="text-[0.85rem] text-text-secondary">Wallet Balance</span>
            <span className="text-[1.25rem] font-bold">2,500 Pts</span>
          </div>
        </div>
        <div className="bg-card p-lg rounded-md border border-border flex items-center gap-md">
          <div className="w-[50px] h-[50px] rounded-sm flex items-center justify-center bg-[#e0f2fe] text-[#0ea5e9]"><Image size={24} /></div>
          <div className="flex flex-col">
            <span className="text-[0.85rem] text-text-secondary">Posters Created</span>
            <span className="text-[1.25rem] font-bold">45</span>
          </div>
        </div>
        <div className="bg-card p-lg rounded-md border border-border flex items-center gap-md">
          <div className="w-[50px] h-[50px] rounded-sm flex items-center justify-center bg-[#dcfce7] text-[#22c55e]"><Users size={24} /></div>
          <div className="flex flex-col">
            <span className="text-[0.85rem] text-text-secondary">Referrals</span>
            <span className="text-[1.25rem] font-bold">12</span>
          </div>
        </div>
        <div className="bg-card p-lg rounded-md border border-border flex items-center gap-md">
          <div className="w-[50px] h-[50px] rounded-sm flex items-center justify-center bg-[#ffedd5] text-[#f97316]"><TrendingUp size={24} /></div>
          <div className="flex flex-col">
            <span className="text-[0.85rem] text-text-secondary">Free Days Left</span>
            <span className="text-[1.25rem] font-bold">15 Days</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-lg">
        <div className="bg-card p-lg rounded-md border border-border">
          <h3 className="text-lg font-bold mb-lg">Recent Activity</h3>
          <div className="flex flex-col gap-md">
            {[1, 2, 3].map((i, idx) => (
              <div key={i} className="flex gap-md relative">
                <div className="w-3 h-3 rounded-full bg-primary mt-1.5 relative z-10">
                  {idx !== 2 && <div className="absolute top-3 left-[5px] w-[2px] h-10 bg-border"></div>}
                </div>
                <div className="flex-1">
                  <p className="text-[0.95rem]">Created <strong>"Holi Greeting"</strong> poster</p>
                  <span className="text-[0.8rem] text-text-secondary">2 hours ago</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-card p-lg rounded-md border border-border">
          <h3 className="text-lg font-bold mb-lg">Invite your friends</h3>
          <p className="text-text-secondary text-[0.95rem]">Get 500 points for every friend who joins using your link.</p>
          <div className="flex gap-2 mt-md">
            <code className="flex-1 bg-bg p-2.5 rounded-sm font-bold text-primary text-center">POSTER-500-REF</code>
            <button className="bg-primary text-white px-5 rounded-sm font-semibold active:scale-95 transition-transform">Copy Link</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
