import React from 'react';
import { Link } from 'react-router-dom';

const Register = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4 py-8">
      <div className="bg-white p-lg rounded-md border border-border w-full max-w-[400px] shadow-sm">
        <div className="text-center mb-lg">
          <div className="w-16 h-16 bg-primary text-white flex items-center justify-center rounded-md font-bold text-2xl mx-auto mb-4">P</div>
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="text-text-secondary text-sm">Join 10,000+ businesses using PosterMaker</p>
        </div>
        
        <form className="flex flex-col gap-4" onSubmit={e => e.preventDefault()}>
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.85rem] font-semibold text-text-secondary">Full Name</label>
            <input type="text" placeholder="John Doe" className="p-3 rounded-sm border border-border bg-bg outline-none" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.85rem] font-semibold text-text-secondary">Business Name</label>
            <input type="text" placeholder="Your Business" className="p-3 rounded-sm border border-border bg-bg outline-none" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.85rem] font-semibold text-text-secondary">Email Address</label>
            <input type="email" placeholder="name@company.com" className="p-3 rounded-sm border border-border bg-bg outline-none" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.85rem] font-semibold text-text-secondary">Password</label>
            <input type="password" placeholder="••••••••" className="p-3 rounded-sm border border-border bg-bg outline-none" />
          </div>
          <p className="text-[0.8rem] text-text-secondary">
            By signing up, you agree to our <strong className="text-text-primary">Terms of Service</strong> and <strong className="text-text-primary">Privacy Policy</strong>.
          </p>
          <button type="submit" className="w-full bg-primary text-white p-3 rounded-sm font-semibold mt-2 active:scale-[0.98] transition-all">Start 30-Day Free Trial</button>
        </form>
        
        <div className="text-center mt-lg pt-lg border-t border-border">
          <p className="text-text-secondary text-sm">Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Sign In</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
