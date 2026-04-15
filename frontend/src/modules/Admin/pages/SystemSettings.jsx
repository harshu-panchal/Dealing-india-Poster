import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ShieldCheck, Phone, Mail, Save, 
  HelpCircle, Globe, MessageSquare, 
  Settings as SettingsIcon, AlertCircle, Check,
  Instagram, Facebook, Youtube, Share2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

import { useAdminAuth } from '../context/AdminAuthContext';

const SystemSettings = () => {
  const { admin } = useAdminAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState(null);
  
  const [settings, setSettings] = useState({
    supportContact: {
      email: '',
      phone: '',
      whatsapp: '',
      helpUrl: ''
    },
    socialLinks: {
      instagram: '',
      facebook: '',
      youtube: ''
    },
    appConfig: {
      maintenanceMode: false,
      appVersion: '2.15.10'
    }
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5003/api';

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/admin/settings`, {
          headers: { Authorization: `Bearer ${admin?.accessToken}` }
        });
        
        if (Object.keys(data).length > 0) {
          setSettings(prev => ({
            ...prev,
            supportContact: data.supportContact || prev.supportContact,
            socialLinks: data.socialLinks || prev.socialLinks,
            appConfig: data.appConfig || prev.appConfig,
          }));
        }
      } catch (error) {
        console.error('Fetch settings error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, [API_URL]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await axios.post(`${API_URL}/admin/settings`, settings, {
        headers: { Authorization: `Bearer ${admin?.accessToken}` }
      });
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error('Save settings error:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleNestedChange = (category, field, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  if (isLoading) {
    return (
      <div className="p-10 text-center">
         <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
         <p className="text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Syncing System Config...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
             <div className="p-2 bg-red-50 rounded-lg"><SettingsIcon className="text-[#ef4444]" size={20} /></div> System Configuration
           </h1>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Manage global platform settings and support channels</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-[#ef4444] hover:bg-[#dc2626] text-white px-8 h-12 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-red-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 border-none"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : saveStatus === 'success' ? (
            <Check size={18} />
          ) : (
            <Save size={18} />
          )}
          {isSaving ? 'Processing...' : saveStatus === 'success' ? 'Changes Applied' : 'Update Platform Settings'}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Main Settings Body */}
        <div className="space-y-8">
          {/* Support Channels */}
          <Card className="p-8 border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] bg-white">
             <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-[#ef4444] shadow-sm">
                   <HelpCircle size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">Help & Support Center</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Contact info shown to end-users</p>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <SettingsField 
                  label="Support Email Address" 
                  value={settings.supportContact.email} 
                  onChange={(v) => handleNestedChange('supportContact', 'email', v)}
                  icon={<Mail size={18} />} 
                  placeholder="e.g. support@appzeto.com"
                />
                <SettingsField 
                  label="Support Phone Line" 
                  value={settings.supportContact.phone} 
                  onChange={(v) => handleNestedChange('supportContact', 'phone', v)}
                  icon={<Phone size={18} />} 
                  placeholder="+91 XXXXX XXXXX"
                />
                <SettingsField 
                  label="WhatsApp Business No." 
                  value={settings.supportContact.whatsapp} 
                  onChange={(v) => handleNestedChange('supportContact', 'whatsapp', v)}
                  icon={<MessageSquare size={18} />} 
                  placeholder="Include country code"
                />
                <SettingsField 
                  label="Help Center Portal Link" 
                  value={settings.supportContact.helpUrl} 
                  onChange={(v) => handleNestedChange('supportContact', 'helpUrl', v)}
                  icon={<Globe size={18} />} 
                  placeholder="https://help.yoursite.com"
                />
             </div>
          </Card>

          {/* Social Presence */}
          <Card className="p-8 border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] bg-white">
             <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
                   <Share2 size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">Social Presence</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Links for sidebar icons</p>
                </div>
             </div>

             <div className="space-y-6">
                <SettingsField 
                  label="Instagram Profile" 
                  value={settings.socialLinks.instagram} 
                  onChange={(v) => handleNestedChange('socialLinks', 'instagram', v)}
                  icon={<Instagram size={18} className="text-rose-500" />} 
                  placeholder="https://instagram.com/your-brand"
                />
                <SettingsField 
                  label="Facebook Page" 
                  value={settings.socialLinks.facebook} 
                  onChange={(v) => handleNestedChange('socialLinks', 'facebook', v)}
                  icon={<Facebook size={18} className="text-blue-600" />} 
                  placeholder="https://facebook.com/your-brand"
                />
                <SettingsField 
                  label="YouTube Channel" 
                  value={settings.socialLinks.youtube} 
                  onChange={(v) => handleNestedChange('socialLinks', 'youtube', v)}
                  icon={<Youtube size={18} className="text-red-600" />} 
                  placeholder="https://youtube.com/@your-brand"
                />
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const SettingsField = ({ label, value, onChange, icon, placeholder }) => (
  <div className="space-y-2.5">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">{label}</label>
    <div className="relative group">
      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#ef4444] transition-all transform group-focus-within:scale-110">{icon}</div>
      <input 
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-4 text-sm font-bold text-slate-700 outline-none focus:border-red-100 focus:bg-white focus:ring-8 focus:ring-red-500/5 transition-all shadow-sm group-hover:bg-slate-100/50"
      />
    </div>
  </div>
);

export default SystemSettings;
