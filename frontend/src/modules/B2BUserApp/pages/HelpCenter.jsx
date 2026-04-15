import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ArrowLeft, Mail, Phone, MessageSquare, 
  Instagram, Facebook, Youtube, Globe,
  Headphones, ShieldCheck, HelpCircle, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const HelpCenter = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/user/settings`);
        setSettings(data);
      } catch (error) {
        console.error('Failed to fetch help settings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, [API_URL]);

  const socialLinks = [
    { 
      id: 'instagram', 
      icon: <Instagram size={24} />, 
      label: 'Instagram', 
      color: 'text-rose-500', 
      bg: 'bg-rose-50',
      value: settings?.socialLinks?.instagram 
    },
    { 
      id: 'facebook', 
      icon: <Facebook size={24} />, 
      label: 'Facebook', 
      color: 'text-blue-600', 
      bg: 'bg-blue-50',
      value: settings?.socialLinks?.facebook 
    },
    { 
      id: 'youtube', 
      icon: <Youtube size={24} />, 
      label: 'YouTube', 
      color: 'text-red-600', 
      bg: 'bg-red-50',
      value: settings?.socialLinks?.youtube 
    }
  ];

  const contactMethods = [
    {
      icon: <Mail size={20} />,
      label: 'Email Support',
      value: settings?.supportContact?.email || 'support@appzeto.com',
      action: () => window.location.href = `mailto:${settings?.supportContact?.email || 'support@appzeto.com'}`
    },
    {
      icon: <Phone size={20} />,
      label: 'Call Us',
      value: settings?.supportContact?.phone || '+91 9111111111',
      action: () => window.location.href = `tel:${settings?.supportContact?.phone || '+91 9111111111'}`
    },
    {
      icon: <MessageSquare size={20} />,
      label: 'WhatsApp Chat',
      value: 'Instant Support',
      action: () => {
        const phone = settings?.supportContact?.whatsapp || '+919111111111';
        window.open(`https://wa.me/${phone.replace(/\D/g, '')}`, '_blank');
      }
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 relative pb-10">
      {/* Header */}
      <div className="bg-[#b91c1c] text-white px-6 py-8 relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <button 
          onClick={() => navigate(-1)}
          className="bg-white/20 p-2 rounded-full mb-6 active:scale-95 transition-transform border-none outline-none text-white cursor-pointer"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-3xl font-black tracking-tight">Help Center</h1>
        <p className="text-white/80 font-bold mt-2 uppercase tracking-widest text-xs">How can we assist you today?</p>
      </div>

      <div className="px-6 -mt-6 relative z-10 space-y-6">
        {/* Main Support Card */}
        <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
           <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-[#ef4444]">
                 <Headphones size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight">Direct Support</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Connect with our team</p>
              </div>
           </div>

           <div className="space-y-4">
              {contactMethods.map((method, idx) => (
                <button 
                  key={idx}
                  onClick={method.action}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-red-50 transition-colors border-none cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-slate-400 group-hover:text-[#ef4444] transition-colors">{method.icon}</div>
                    <div className="text-left">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{method.label}</p>
                       <p className="text-sm font-bold text-slate-700">{method.value}</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-[#ef4444]" />
                </button>
              ))}
           </div>
        </div>

        {/* Social Presence */}
        <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
           <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Connect with us</h3>
           <div className="grid grid-cols-3 gap-4">
              {socialLinks.map((social) => social.value && (
                <a 
                  key={social.id}
                  href={social.value}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col items-center gap-3 no-underline group"
                >
                  <div className={`w-14 h-14 ${social.bg} rounded-3xl flex items-center justify-center ${social.color} shadow-sm group-active:scale-95 transition-all transform hover:rotate-6`}>
                     {social.icon}
                  </div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{social.label}</span>
                </a>
              ))}
           </div>
        </div>

        {/* FAQ/Other Links */}
        <div className="space-y-4">
           {settings?.supportContact?.helpUrl && (
             <button 
              onClick={() => window.open(settings.supportContact.helpUrl, '_blank')}
              className="w-full flex items-center gap-4 p-5 bg-indigo-600 rounded-[2rem] text-white shadow-lg active:scale-[0.98] transition-all border-none cursor-pointer"
             >
                <Globe size={24} />
                <div className="text-left">
                   <p className="text-sm font-black uppercase tracking-tight">Visit Help Portal</p>
                   <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Tutorials and documentation</p>
                </div>
             </button>
           )}


        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
