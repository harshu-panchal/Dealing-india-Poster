import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ShieldCheck, Phone, Mail, Save, 
  HelpCircle, Globe, MessageSquare, 
  Settings as SettingsIcon, AlertCircle, Check,
  Instagram, Facebook, Youtube, Share2, Plus, Trash2
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
  
  const [newFaq, setNewFaq] = useState({ q: '', a: '' });
  
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
    },
    termsAndConditions: '',
    privacyPolicy: '',
    faqs: []
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchSettings = async () => {
      if (!admin?.accessToken) return;
      try {
        const { data } = await axios.get(`${API_URL}/admin/settings`, {
          headers: { Authorization: `Bearer ${admin?.accessToken}` }
        });
        
        if (data && Object.keys(data).length > 0) {
          setSettings(prev => ({
            ...prev,
            supportContact: data.supportContact || prev.supportContact,
            socialLinks: data.socialLinks || prev.socialLinks,
            appConfig: data.appConfig || prev.appConfig,
            termsAndConditions: data.termsAndConditions || prev.termsAndConditions || '',
            privacyPolicy: data.privacyPolicy || prev.privacyPolicy || '',
            faqs: (data.faqs && data.faqs.length > 0) ? data.faqs : prev.faqs
          }));
        }
      } catch (error) {
        console.error('Fetch settings error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const handleSave = async () => {
    setIsSaving(true);
    
    // Auto-add pending FAQ if user typed but forgot to click '+' button
    let finalSettings = { ...settings };
    if (newFaq.q.trim() && newFaq.a.trim()) {
      console.log('[SYSTEM-SETTINGS]: Auto-adding pending FAQ to save payload');
      finalSettings.faqs = [...settings.faqs, { ...newFaq }];
      // Update local state too so UI reflects it
      setSettings(finalSettings);
      setNewFaq({ q: '', a: '' });
    }

    console.log('[SYSTEM-SETTINGS]: Attempting to save:', finalSettings);
    
    try {
      const { data } = await axios.post(`${API_URL}/admin/settings`, finalSettings, {
        headers: { Authorization: `Bearer ${admin?.accessToken}` }
      });
      console.log('[SYSTEM-SETTINGS]: Save response success:', data);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error('[SYSTEM-SETTINGS]: Save error details:', error.response?.data || error.message);
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

          {/* FAQ Management */}
          <Card className="p-8 border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] bg-white">
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shadow-sm">
                       <HelpCircle size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800 tracking-tight">Platform FAQs</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Manage frequently asked questions</p>
                    </div>
                </div>
             </div>

             <div className="space-y-6">
                {/* Existing FAQs */}
                <div className="space-y-4">
                   {settings.faqs.map((faq, index) => (
                      <div key={index} className="p-5 bg-slate-50 rounded-3xl border border-slate-100 flex items-start justify-between group">
                         <div className="space-y-1">
                            <p className="text-xs font-black text-slate-800 uppercase tracking-tight">Q: {faq.q}</p>
                            <p className="text-[11px] font-bold text-slate-500 leading-relaxed italic">A: {faq.a}</p>
                         </div>
                         <button 
                           onClick={() => setSettings(prev => ({ ...prev, faqs: prev.faqs.filter((_, i) => i !== index) }))}
                           className="p-2 text-slate-300 hover:text-red-500 transition-colors border-none bg-transparent cursor-pointer"
                         >
                            <Trash2 size={16} />
                         </button>
                      </div>
                   ))}
                </div>

                {/* Add New FAQ */}
                <div className="p-6 border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/50 space-y-4">
                   <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">New Question</label>
                      <Input 
                        placeholder="Enter question text..." 
                        value={newFaq.q}
                        onChange={(e) => setNewFaq(prev => ({ ...prev, q: e.target.value }))}
                        className="rounded-2xl h-11 border-none bg-white shadow-sm font-bold text-xs"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Detailed Answer</label>
                      <textarea 
                        placeholder="Provide a clear, helpful answer..."
                        value={newFaq.a}
                        onChange={(e) => setNewFaq(prev => ({ ...prev, a: e.target.value }))}
                        className="w-full bg-white border-none rounded-2xl py-3 px-4 text-xs font-bold text-slate-700 h-24 outline-none focus:ring-4 focus:ring-red-500/5 transition-all shadow-sm"
                      />
                   </div>
                   <Button 
                     onClick={() => {
                        if (newFaq.q && newFaq.a) {
                           setSettings(prev => ({ ...prev, faqs: [...prev.faqs, newFaq] }));
                           setNewFaq({ q: '', a: '' });
                        }
                     }}
                     className="w-full h-11 rounded-2xl bg-white border border-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 flex items-center justify-center gap-2"
                   >
                      <Plus size={16} /> Add FAQ to List
                   </Button>
                </div>
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

          {/* Policy & Terms */}
          <Card className="p-8 border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] bg-white">
             <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">
                   <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">Legal & Privacy</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Platform terms and user agreements</p>
                </div>
             </div>

             <div className="space-y-6">
                <div className="space-y-2.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Terms & Conditions</label>
                  <textarea 
                    value={settings.termsAndConditions}
                    onChange={(e) => setSettings(prev => ({ ...prev, termsAndConditions: e.target.value }))}
                    placeholder="Enter your terms and conditions here..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold text-slate-700 outline-none focus:border-red-100 focus:bg-white focus:ring-8 focus:ring-red-500/5 transition-all shadow-sm min-h-[300px] font-sans"
                  />
                </div>

                <div className="space-y-2.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Privacy Policy</label>
                  <textarea 
                    value={settings.privacyPolicy}
                    onChange={(e) => setSettings(prev => ({ ...prev, privacyPolicy: e.target.value }))}
                    placeholder="Enter your privacy policy here..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-bold text-slate-700 outline-none focus:border-red-100 focus:bg-white focus:ring-8 focus:ring-red-500/5 transition-all shadow-sm min-h-[300px] font-sans"
                  />
                </div>
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
