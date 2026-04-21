import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export default function RegisterVerify() {
  const [phone, setPhone] = useState('');
  const [isSent, setIsSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSent(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface font-body text-on-surface antialiased">
      {/* Brand Header */}
      <header className="w-full py-8 px-8 md:px-12 flex justify-between items-center z-50">
        <div className="text-xl font-black text-primary italic tracking-tight font-headline cursor-pointer" onClick={() => navigate('/')}>
          Intellectual Atelier
        </div>
        <div className="hidden md:flex items-center gap-2">
          <span className="text-xs uppercase tracking-widest text-on-surface-variant font-bold">Step 1 of 3</span>
          <div className="h-1 w-24 bg-surface-container-high rounded-full overflow-hidden">
            <div className="h-full w-1/3 bg-tertiary transition-all duration-500"></div>
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center relative px-4 overflow-hidden">
        {/* Organic Background Elements (Asymmetric) */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-fixed-dim/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-48 w-[32rem] h-[32rem] bg-tertiary-fixed/10 rounded-full blur-[100px]"></div>
        
        <div className="w-full max-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center max-w-7xl relative z-10">
          {/* Left Side: Editorial Context */}
          <div className="lg:col-span-5 space-y-6 lg:pr-12">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-surface-container-high text-tertiary text-xs font-bold tracking-wider font-headline">
              SECURE VERIFICATION
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold font-headline text-primary leading-[1.1] tracking-tighter">
              Begin Your <span className="italic font-light">Academic</span> Journey.
            </h1>
            <p className="text-on-surface-variant text-lg leading-relaxed max-w-md">
              We prioritize the integrity of our student community. Verify your contact details to access the premium learning modules.
            </p>
            {/* Achievement/Trust Indicators */}
            <div className="pt-8 flex gap-8">
              <div className="flex flex-col">
                <span className="text-2xl font-bold font-headline text-primary">12k+</span>
                <span className="text-xs text-on-surface-variant font-medium tracking-wide uppercase">Students</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold font-headline text-primary">98%</span>
                <span className="text-xs text-on-surface-variant font-medium tracking-wide uppercase">Completion</span>
              </div>
            </div>
          </div>

          {/* Right Side: The Registration Card */}
          <div className="lg:col-span-7 flex justify-end">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-lg glass-panel p-8 lg:p-12 rounded-[2.5rem] shadow-2xl shadow-indigo-900/5 relative"
            >
              {/* Progress Bar for Mobile */}
              <div className="md:hidden flex flex-col gap-2 mb-8">
                <div className="flex justify-between items-center text-xs font-bold text-on-surface-variant">
                  <span>REGISTRATION</span>
                  <span>STEP 1 / 3</span>
                </div>
                <div className="h-1 w-full bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full w-1/3 bg-tertiary"></div>
                </div>
              </div>

              {!isSent ? (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold font-headline text-primary mb-2">Verification Detail</h2>
                    <p className="text-on-surface-variant text-sm">We will send a unique one-time passcode to your mobile device.</p>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Phone Input Group */}
                    <div className="group transition-all duration-300">
                      <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3 pl-1">
                        Phone Number
                      </label>
                      <div className="relative flex items-center">
                        <div className="absolute left-4 flex items-center gap-2 border-r border-outline-variant/30 pr-3 pointer-events-none">
                          <span className="material-symbols-outlined text-on-surface-variant text-lg">call</span>
                          <span className="text-on-surface-variant font-medium text-sm">+1</span>
                        </div>
                        <input 
                          className="w-full pl-20 pr-6 py-5 bg-surface-container-high rounded-2xl border-none focus:ring-2 focus:ring-secondary/20 focus:bg-surface-container-lowest transition-all duration-300 text-primary font-medium placeholder:text-outline-variant outline-none" 
                          placeholder="(555) 000-0000" 
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                    </div>
                    {/* WhatsApp Action */}
                    <button 
                      type="submit"
                      className="w-full group relative overflow-hidden bg-primary text-white py-5 px-6 rounded-2xl flex items-center justify-between transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-xl shadow-indigo-900/20"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-container opacity-100"></div>
                      <div className="relative flex items-center gap-4">
                        <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>chat_bubble</span>
                        <span className="font-bold font-headline tracking-tight">Send OTP via WhatsApp</span>
                      </div>
                      <span className="relative material-symbols-outlined transition-transform duration-300 group-hover:translate-x-1">arrow_forward</span>
                    </button>
                  </form>
                  {/* Secondary Verification Links */}
                  <div className="flex flex-col gap-4 pt-4">
                    <button className="text-sm font-semibold text-secondary hover:text-primary transition-colors flex items-center gap-2">
                      Use SMS instead
                      <span className="material-symbols-outlined text-base">chat</span>
                    </button>
                    <div className="flex items-center gap-3 py-4">
                      <div className="h-[1px] flex-grow bg-surface-container-high"></div>
                      <span className="text-[10px] font-bold text-outline-variant uppercase tracking-widest">or sign in with</span>
                      <div className="h-[1px] flex-grow bg-surface-container-high"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <button className="flex items-center justify-center gap-3 py-4 rounded-xl bg-surface-container-low hover:bg-surface-container-high transition-colors text-primary font-medium text-sm transition-all">
                        <img 
                          alt="Google" 
                          className="w-5 h-5 grayscale opacity-70 hover:opacity-100 transition-opacity" 
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLsSCa7aWguG9tr47z09qQZy6n2zCakIhi73euinSAMxROo-GWSW9puzuAi7KHz8nqZA-OmiO524VCoHVgzyCVf4hfEfdJmfmUwwTRumDvQuUYUzFDcmpwvdqrawNW7mhWlD3JSrPVX4Up_ohk0tikK7oqcuqyfErvEiIx433_iaHNwBoEFv32GXMb1eOEvRqY_hQ-gdnxQ4EBILKKjKInl6h4gMl8WK1Vvo2C2NyMun1O3rYlRvvkzhg-wzEaMqgqYQJtouWmSGs" 
                        />
                        Google
                      </button>
                      <button className="flex items-center justify-center gap-3 py-4 rounded-xl bg-surface-container-low hover:bg-surface-container-high transition-colors text-primary font-medium text-sm transition-all">
                        <span className="material-symbols-outlined text-xl">brand_family</span>
                        Apple
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-blue-50 text-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-outlined text-4xl">mail</span>
                  </div>
                  <h2 className="text-xl font-bold mb-3 font-headline">Check your device.</h2>
                  <p className="text-sm text-outline mb-8 leading-relaxed">
                    We've sent a one-time passcode to your phone. Enter the code to continue your Induction.
                  </p>
                  <button 
                    onClick={() => navigate('/')}
                    className="px-8 py-3 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-primary-container transition-all"
                  >
                    Return Home
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>

      <footer className="py-8 px-12 flex flex-col md:flex-row justify-between items-center gap-6 z-50">
        <div className="flex gap-8 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
          <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
          <a className="hover:text-primary transition-colors" href="#">Terms of Service</a>
          <a className="hover:text-primary transition-colors" href="#">Help Center</a>
        </div>
        <div className="text-xs text-on-surface-variant opacity-60">
          © 2024 Intellectual Atelier. All intellectual property reserved.
        </div>
      </footer>
    </div>
  );
}
