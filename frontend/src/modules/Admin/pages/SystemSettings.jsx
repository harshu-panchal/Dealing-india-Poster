import React, { useState } from 'react';
import { 
  ShieldCheck, Phone, Mail, Save, 
  HelpCircle, Globe, MessageSquare, 
  Settings as SettingsIcon, AlertCircle, Check
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

const SystemSettings = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  
  const [settings, setSettings] = useState({
    supportEmail: 'support@dealingindiaposter.com',
    supportPhone: '+91 98765 43210',
    whatsappSupport: '+91 98765 43210',
    helpCenterUrl: 'https://help.dealingindiaposter.com',
    businessAddress: '123 Business Hub, New Delhi, India',
    maintenanceMode: false
  });

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    }, 1500);
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
             <SettingsIcon className="text-[#ef4444]" /> System Configuration
           </h1>
           <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Manage global platform settings and support channels</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-[#ef4444] hover:bg-[#dc2626] text-white px-8 h-12 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-red-500/20 active:scale-95 transition-all flex items-center gap-2"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : saveStatus === 'success' ? (
            <Check size={18} />
          ) : (
            <Save size={18} />
          )}
          {isSaving ? 'Saving Changes...' : saveStatus === 'success' ? 'Settings Saved' : 'Save All Settings'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Support Channels Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 overflow-hidden border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl">
             <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-[#ef4444]">
                   <HelpCircle size={20} />
                </div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight">Help & Support Center</h3>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SettingsField 
                  label="Support Email Address" 
                  value={settings.supportEmail} 
                  onChange={(v) => handleChange('supportEmail', v)}
                  icon={<Mail size={18} />} 
                  placeholder="e.g. support@app.com"
                />
                <SettingsField 
                  label="Support Phone Line" 
                  value={settings.supportPhone} 
                  onChange={(v) => handleChange('supportPhone', v)}
                  icon={<Phone size={18} />} 
                  placeholder="+91 XXXXX XXXXX"
                />
                <SettingsField 
                  label="WhatsApp Business No." 
                  value={settings.whatsappSupport} 
                  onChange={(v) => handleChange('whatsappSupport', v)}
                  icon={<MessageSquare size={18} />} 
                  placeholder="International format (+91...)"
                />
                <SettingsField 
                  label="Help Center Portal Link" 
                  value={settings.helpCenterUrl} 
                  onChange={(v) => handleChange('helpCenterUrl', v)}
                  icon={<Globe size={18} />} 
                  placeholder="https://..."
                />
             </div>
          </Card>

          <Card className="p-6 overflow-hidden border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl">
             <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                   <ShieldCheck size={20} />
                </div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight">Security & Compliance</h3>
             </div>
             
             <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:border-red-100 transition-all cursor-pointer" onClick={() => handleChange('maintenanceMode', !settings.maintenanceMode)}>
                   <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${settings.maintenanceMode ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-400'} rounded-xl flex items-center justify-center transition-colors`}>
                        <AlertCircle size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-700">Maintenance Mode</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Disable app access for users</p>
                      </div>
                   </div>
                   <div className={`w-12 h-6 rounded-full relative transition-colors ${settings.maintenanceMode ? 'bg-[#ef4444]' : 'bg-slate-300'}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.maintenanceMode ? 'left-7' : 'left-1'}`}></div>
                   </div>
                </div>
             </div>
          </Card>
        </div>

        {/* Info/Quick Settings Sidebar */}
        <div className="space-y-6">
           <Card className="p-6 bg-slate-900 border-none shadow-xl rounded-3xl text-white overflow-hidden relative">
              <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-[#ef4444]/20 rounded-full blur-3xl"></div>
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-4 relative z-10">System Info</h3>
              <div className="space-y-4 relative z-10">
                 <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-xs font-bold text-white/50 uppercase tracking-widest">App Version</span>
                    <span className="text-xs font-black">2.4.0-PRO</span>
                 </div>
                 <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Server Status</span>
                    <span className="flex items-center gap-1.5 text-xs font-black text-emerald-400">
                       <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                       OPERATIONAL
                    </span>
                 </div>
                 <div className="flex justify-between items-center py-2">
                    <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Last Backup</span>
                    <span className="text-xs font-black">2 Hours Ago</span>
                 </div>
              </div>
           </Card>

           <div className="bg-amber-50 border border-amber-200 p-5 rounded-3xl">
              <div className="flex gap-3">
                 <AlertCircle className="text-amber-600 shrink-0" size={20} />
                 <div>
                    <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight">Administrator Note</h4>
                    <p className="text-xs font-bold text-amber-700/80 leading-relaxed mt-1">
                      Changes made here will reflect globally across all user applications. Ensure contact details are verified before saving.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const SettingsField = ({ label, value, onChange, icon, placeholder }) => (
  <div className="space-y-2">
    <label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">{label}</label>
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#ef4444] transition-colors">{icon}</div>
      <input 
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-slate-700 outline-none focus:border-red-100 focus:bg-white focus:ring-4 focus:ring-red-500/5 transition-all shadow-inner"
      />
    </div>
  </div>
);

export default SystemSettings;
