import React from 'react';
import { Link } from 'react-router-dom';

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="bg-white p-lg rounded-md border border-border w-full max-w-[400px] shadow-sm">
        <div className="text-center mb-lg">
          <div className="w-16 h-16 bg-primary text-white flex items-center justify-center rounded-md font-bold text-2xl mx-auto mb-4">P</div>
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-text-secondary text-sm">Login to your account to continue</p>
        </div>
        
        <form className="flex flex-col gap-4" onSubmit={e => e.preventDefault()}>
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.85rem] font-semibold text-text-secondary">Email Address</label>
            <input type="email" placeholder="name@company.com" className="p-3 rounded-sm border border-border bg-bg outline-none" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.85rem] font-semibold text-text-secondary">Password</label>
            <input type="password" placeholder="••••••••" className="p-3 rounded-sm border border-border bg-bg outline-none" />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
              <input type="checkbox" className="w-4 h-4 accent-primary" /> Remember me
            </label>
            <button type="button" className="text-sm font-semibold text-primary bg-transparent hover:underline">Forgot password?</button>
          </div>
          <button type="submit" className="w-full bg-primary text-white p-3 rounded-sm font-semibold mt-2 active:scale-[0.98] transition-all">Sign In</button>
        </form>
        
        <div className="text-center mt-lg pt-lg border-t border-border">
          <p className="text-text-secondary text-sm">Don't have an account? <Link to="/register" className="text-primary font-bold hover:underline">Create Account</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
