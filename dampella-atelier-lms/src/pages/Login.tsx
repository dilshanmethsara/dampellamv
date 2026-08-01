import React, { useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

const roles = [
  { id: 'student', label: 'Student', icon: 'school' },
  { id: 'teacher', label: 'Teacher', icon: 'co_present' },
  { id: 'admin', label: 'Admin', icon: 'admin_panel_settings' },
];

export default function Login() {
  const [selectedRole, setSelectedRole] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole === 'student') navigate('/dashboard/student');
    else if (selectedRole === 'teacher') navigate('/dashboard/teacher');
    else navigate('/dashboard/admin');
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface overflow-x-hidden font-body">
      {/* Hero Section: The Intellectual Atelier Branding */}
      <header className="relative overflow-hidden pt-12 pb-16 px-6 bg-primary text-white">
        <div className="organic-blob bg-tertiary-fixed w-64 h-64 -top-20 -left-20 rounded-full" />
        <div className="organic-blob bg-secondary-container w-72 h-72 -bottom-20 -right-10 rounded-full" />
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-4xl text-tertiary-fixed" style={{ fontVariationSettings: "'FILL' 1" }}>
              school
            </span>
            <h1 className="font-headline font-extrabold text-3xl tracking-tighter uppercase">Dampella</h1>
          </div>
          <h2 className="font-headline text-xl font-medium tracking-tight mb-3 text-secondary-fixed">
            Cultivating the Intellectual Atelier
          </h2>
          <p className="font-body text-sm text-white/80 leading-relaxed max-w-xs opacity-80">
            Enter your private sanctuary of focused creation and curated knowledge.
          </p>
        </div>

        {/* Decorative Background Image Overlay */}
        <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none">
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAyZhJq--J0-Ghp-OUzxmb5cE1BiFqhng3FNEeNUyuSzIN3nzcrukLJNN15oS6Zfx0wNgT6Bt0kSo2czOeUBKrc_bVvgb9d9CaXsGjpKa8wVPtiCh7UmOvJCwADSomx6mAocqP09YOUN_0OzLNMUm2j-DxZvyuKOgR4DHWsnNXF3l8157suL397RA1wRUPC_6IcrSP4e3bfDe4IdXmQQCcDp0baLPaIzzehFW2SIoW3HOehmuyRiWcqwLWryunRWxzFsITpwFgTfCI" 
            alt="Decoration" 
            className="w-full h-full object-cover" 
            referrerPolicy="no-referrer"
          />
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-grow -mt-8 relative z-20 px-6 pb-12">
        <div className="bg-surface-container-lowest rounded-[2.5rem] shadow-[0_8px_30px_rgba(26,20,107,0.06)] p-8 max-w-lg mx-auto">
          {/* Role Selection */}
          <section className="mb-10 text-center">
            <label className="font-headline text-[10px] font-bold tracking-[0.15em] uppercase text-outline mb-4 block">
              Identify Your Intent
            </label>
            <div className="grid grid-cols-3 gap-3 text-center">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={cn(
                    "flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300",
                    selectedRole === role.id
                      ? "bg-primary-container text-white ring-2 ring-primary"
                      : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
                  )}
                >
                  <span 
                    className="material-symbols-outlined mb-2" 
                    style={{ fontVariationSettings: selectedRole === role.id ? "'FILL' 1" : undefined }}
                  >
                    {role.icon}
                  </span>
                  <span className="font-headline text-xs font-bold">{role.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* LoginForm */}
          <form className="space-y-6" onSubmit={handleSignIn}>
            {/* Email Field */}
            <div className="space-y-2">
              <label className="font-headline text-xs font-bold text-primary ml-1" htmlFor="email">
                Universal Identifier
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline group-focus-within:text-secondary transition-colors">
                    alternate_email
                  </span>
                </div>
                <input
                  className="block w-full pl-12 pr-4 py-4 bg-surface-container-high border-none rounded-xl font-body text-sm focus:ring-2 focus:ring-secondary/20 focus:bg-surface-container-lowest transition-all placeholder:text-outline/60 outline-none"
                  id="email"
                  placeholder="your.name@atelier.edu"
                  type="email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="font-headline text-xs font-bold text-primary" htmlFor="access-key">
                  Access Key
                </label>
                <button type="button" className="font-label text-[10px] font-bold text-secondary uppercase tracking-wider hover:text-primary transition-colors">
                  Forgot Key?
                </button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline group-focus-within:text-secondary transition-colors">
                    lock
                  </span>
                </div>
                <input
                  className="block w-full pl-12 pr-12 py-4 bg-surface-container-high border-none rounded-xl font-body text-sm focus:ring-2 focus:ring-secondary/20 focus:bg-surface-container-lowest transition-all placeholder:text-outline/60 outline-none"
                  id="access-key"
                  placeholder="••••••••••••"
                  type={showPassword ? 'text' : 'password'}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-outline"
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              className="w-full py-4 mt-4 bg-gradient-to-br from-primary to-primary-container text-white font-headline font-bold rounded-xl shadow-[0_10px_25px_-5px_rgba(26,20,107,0.3)] hover:shadow-[0_15px_30px_-5px_rgba(26,20,107,0.4)] active:scale-[0.98] transition-all flex justify-center items-center gap-2"
            >
              Sign In
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </form>

          {/* Bottom Actions */}
          <div className="mt-10 text-center space-y-4">
            <div className="flex items-center justify-center gap-4 text-outline/30">
              <div className="h-[1px] w-12 bg-current" />
              <span className="font-label text-[10px] uppercase tracking-widest font-bold">New Scholar</span>
              <div className="h-[1px] w-12 bg-current" />
            </div>
            <button 
              onClick={() => navigate('/register/verify')}
              className="inline-flex items-center gap-2 font-headline text-sm font-bold text-tertiary hover:text-on-tertiary-container transition-colors group mx-auto"
            >
              Request Atelier Access
              <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1">east</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer Meta */}
      <footer className="mt-auto py-8 text-center px-6">
        <p className="font-label text-[10px] text-outline/50 tracking-widest uppercase mb-2">
          Version 4.2.0 • Deep Intelligence
        </p>
        <div className="flex justify-center gap-6">
          {['Privacy', 'Terms', 'Support'].map((link) => (
            <a key={link} href="#" className="font-label text-[10px] font-bold text-outline hover:text-primary uppercase tracking-widest transition-colors">
              {link}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}
