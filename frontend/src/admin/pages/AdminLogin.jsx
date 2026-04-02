import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, User, Eye, EyeOff, ChevronRight, 
  Command, Shield, Activity, Fingerprint,
  Layers
} from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const containerRef = useRef();

  // Entrance animations removed for immediate visibility

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Placeholder login logic for admin
    setTimeout(() => {
      if (formData.username === 'admin' && formData.password === 'admin123') {
        localStorage.setItem('isAdminAuthenticated', 'true');
        navigate('/admin/dashboard');
      } else {
        setError('Security Authentication Failed. Verify credentials.');
        setLoading(false);
        gsap.to(".login-card", {
           x: [-10, 10, -10, 10, 0],
           duration: 0.4,
           ease: "power2.inOut"
        });
      }
    }, 1500);
  };

  return (
    <div ref={containerRef} className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-red-100/20 via-transparent to-transparent">
      {/* Background Ornaments */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-500/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[40%] bg-[#ef4444]/5 blur-[100px] rounded-full" />
      
      <Card className="login-card w-full max-w-[480px] p-10 border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] dark:shadow-none dark:bg-slate-900 rounded-[3rem] relative z-10 overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Layers size={140} className="text-slate-950 dark:text-white" />
        </div>

        <div className="flex flex-col items-center mb-12 relative">
          <div className="w-20 h-20 bg-[#ef4444] rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-red-500/30 mb-8 transform rotate-3 group overflow-hidden">
             <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent,rgba(255,255,255,0.2),transparent)] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
             <Shield size={36} strokeWidth={2.5} />
          </div>
          <div className="text-center space-y-1">
             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 opacity-60 flex items-center justify-center gap-2">
                <Fingerprint size={12} className="text-red-500" /> Secure Registry Node
             </p>
             <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Admin Vault</h1>
             <p className="text-slate-400 text-xs font-semibold px-4 max-w-[280px]">Establish identity connection to Dealing-india-Poster engine</p>
          </div>
        </div>

        {error && (
          <div className="login-item bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-[10px] font-black tracking-widest uppercase p-4 rounded-2xl mb-8 flex items-center gap-3 animate-pulse">
            <Activity size={14} />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6 relative">
          <div className="login-item space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">
              Access Identifier
            </label>
            <div className="relative group">
              <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#ef4444] transition-colors" />
              <Input 
                type="text" 
                required
                className="h-16 pl-14 bg-white dark:bg-[var(--admin-input-bg)] border-none rounded-2xl text-sm font-bold shadow-inner"
                placeholder="Principal ID"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
              />
            </div>
          </div>

          <div className="login-item space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">
              Security Key
            </label>
            <div className="relative group">
              <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#ef4444] transition-colors" />
              <Input 
                type={showPassword ? 'text' : 'password'} 
                required
                className="h-16 pl-14 pr-14 bg-white dark:bg-[var(--admin-input-bg)] border-none rounded-2xl text-sm font-black shadow-inner"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#ef4444] transition-all border-none bg-transparent cursor-pointer"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="login-item pt-4">
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-16 rounded-2xl shadow-2xl shadow-red-500/20 text-xs font-black uppercase tracking-[0.2em] relative overflow-hidden group"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                   <div className="w-5 h-5 border-[3px] border-white/20 border-t-white rounded-full animate-spin" />
                   <span>Verifying Tier...</span>
                </div>
              ) : (
                <>
                   <span className="relative z-10">Handshake Connection</span>
                   <ChevronRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" strokeWidth={3} />
                   <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-rose-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </>
              )}
            </Button>
          </div>
        </form>

        <div className="login-item mt-12 flex flex-col items-center gap-4 border-t border-slate-100 dark:border-slate-800 pt-10">
           <div className="flex gap-4">
              <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-300"><Command size={14} /></div>
              <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-300"><Activity size={14} /></div>
              <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-300"><Fingerprint size={14} /></div>
           </div>
           <p className="text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] leading-relaxed opacity-40">
              Authorized Ops Node Access<br/>
              Network &copy; 2026 Registry Systems
           </p>
        </div>
      </Card>
    </div>
  );
};

export default AdminLogin;
