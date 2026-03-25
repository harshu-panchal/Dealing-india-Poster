import React, { useState } from 'react';
import { Camera, User, Phone, MapPin, Globe, CreditCard, Share2, LogOut } from 'lucide-react';

const Profile = () => {
  const [profile, setProfile] = useState({
    businessName: 'Appzeto Tech Solutions',
    ownerName: 'Admin User',
    phone: '+91 9876543210',
    email: 'contact@appzeto.com',
    address: '123 Tech Park, Silicon Valley, IND',
    website: 'www.appzeto.com',
    gstNumber: '22AAAAA0000A1Z5'
  });

  return (
    <div className="pb-xl">
      <div className="bg-gradient-primary p-xl rounded-lg -mb-10 text-white">
        <div className="flex items-center gap-lg">
          <div className="relative w-[100px] h-[100px] border-4 border-white rounded-md bg-white overflow-visible">
            <img src="https://ui-avatars.com/api/?name=Appzeto&background=6366f1&color=fff" alt="Business Logo" className="w-full h-full object-contain" />
            <button className="absolute -bottom-2.5 -right-2.5 bg-white text-primary w-8 h-8 rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform"><Camera size={16} /></button>
          </div>
          <div className="profile-title">
            <h1 className="text-[1.75rem] font-bold mb-1">{profile.businessName}</h1>
            <span className="bg-white/20 px-3 py-1 rounded-full text-[0.8rem] font-semibold border border-white/40">Premium Member</span>
          </div>
        </div>
      </div>

      <div className="px-md">
        <div className="flex flex-col gap-md mt-[60px]">
          {/* Points Wallet */}
          <section className="bg-card rounded-md p-lg border border-border shadow-sm flex items-center gap-md">
            <div className="w-[50px] h-[50px] bg-bg rounded-md flex items-center justify-center text-primary"><CreditCard size={24} /></div>
            <div className="flex-1">
              <h3 className="text-[1rem] font-bold mb-0.5">Points Wallet</h3>
              <p className="text-[1.5rem] font-extrabold text-primary">2,500 <span className="text-[0.9rem] font-medium text-text-secondary">pts</span></p>
              <p className="text-[0.85rem] text-text-secondary">15 days remaining in trial</p>
            </div>
            <button className="ml-auto bg-bg border border-border px-3 py-1.5 rounded-sm font-semibold text-[0.85rem] active:scale-95 transition-transform">Buy Points</button>
          </section>

          {/* Referral Section */}
          <section className="bg-card rounded-md p-lg border border-border shadow-sm flex items-center gap-md">
            <div className="w-[50px] h-[50px] bg-bg rounded-md flex items-center justify-center text-primary"><Share2 size={24} /></div>
            <div className="flex-1">
              <h3 className="text-[1rem] font-bold mb-0.5">Refer & Earn</h3>
              <p className="text-[0.85rem] text-text-secondary">Share link with friends to get 500 points.</p>
              <div className="flex items-center gap-2 mt-2 bg-bg p-1 pl-3 rounded-sm border border-dashed border-border">
                <code className="font-bold text-primary">DI-REF-12345</code>
                <button className="bg-primary text-white px-2.5 py-1 rounded-sm text-[0.75rem] active:scale-95 transition-transform focus:ring-2 focus:ring-primary/50">Copy</button>
              </div>
            </div>
          </section>

          {/* Business Details Form */}
          <section className="bg-card rounded-md p-lg border border-border shadow-sm">
            <div className="flex items-center gap-2 mb-lg text-primary">
              <User size={20} />
              <h2 className="text-[1.25rem] font-bold text-text-primary">Business Information</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.85rem] font-semibold text-text-secondary">Business Name</label>
                <input type="text" value={profile.businessName} readOnly className="p-3 rounded-sm border border-border bg-bg outline-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.85rem] font-semibold text-text-secondary">Owner Name</label>
                <input type="text" value={profile.ownerName} readOnly className="p-3 rounded-sm border border-border bg-bg outline-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.85rem] font-semibold text-text-secondary">Phone Number</label>
                <div className="relative flex items-center">
                  <Phone size={16} className="absolute left-3 text-text-secondary" />
                  <input type="text" value={profile.phone} readOnly className="pl-9 p-3 w-full rounded-sm border border-border bg-bg outline-none" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.85rem] font-semibold text-text-secondary">Email Address</label>
                <input type="email" value={profile.email} readOnly className="p-3 rounded-sm border border-border bg-bg outline-none" />
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-[0.85rem] font-semibold text-text-secondary">Address</label>
                <div className="relative flex items-center">
                  <MapPin size={16} className="absolute left-3 text-text-secondary" />
                  <input type="text" value={profile.address} readOnly className="pl-9 p-3 w-full rounded-sm border border-border bg-bg outline-none" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.85rem] font-semibold text-text-secondary">Website (Optional)</label>
                <div className="relative flex items-center">
                  <Globe size={16} className="absolute left-3 text-text-secondary" />
                  <input type="text" value={profile.website} readOnly className="pl-9 p-3 w-full rounded-sm border border-border bg-bg outline-none" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[0.85rem] font-semibold text-text-secondary">GST Number</label>
                <input type="text" value={profile.gstNumber} readOnly className="p-3 rounded-sm border border-border bg-bg outline-none" />
              </div>
            </div>
            <button className="mt-lg w-full bg-primary text-white p-3 rounded-sm font-semibold active:scale-[0.98] transition-transform">Edit Profile</button>
          </section>

          <button className="w-full mt-md p-3 bg-transparent border border-error text-error rounded-sm font-semibold flex items-center justify-center gap-2 active:bg-error/5 transition-colors">
            <LogOut size={18} /> Logout Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
