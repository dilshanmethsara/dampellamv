"use client"

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { User } from '@/lib/portal/auth-context';

interface AdminDashboardProps {
  user: User
  onLogout: () => void
  onBackToWebsite: () => void
}

export function AdminDashboard({ user, onLogout, onBackToWebsite }: AdminDashboardProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col font-body selection:bg-primary/10 selection:text-primary">
      <header className="px-10 py-6 flex items-center justify-between border-b border-outline-variant/10 bg-surface-lowest shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-white font-black text-xl">D</div>
          <div>
            <h1 className="font-extrabold tracking-tight text-lg leading-none text-indigo-950 font-headline">Dampella LMS</h1>
            <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mt-1">Oversight Suite</p>
          </div>
        </div>
        <button onClick={onLogout} className="text-xs font-bold text-slate-500 hover:text-error transition-colors flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">logout</span> Logout
        </button>
      </header>

      <main className="p-8 max-w-7xl mx-auto w-full">
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-8 pb-12"
        >
          <motion.header variants={item} className="mb-10 flex justify-between items-end">
            <div>
              <h3 className="text-4xl font-extrabold text-on-surface font-headline tracking-tight mb-2">School Overview</h3>
              <p className="text-on-surface-variant font-medium font-body">Welcome back, {user.fullName || 'Administrator'}. Here's your Dampella LMS status.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right mr-4 font-body">
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Global Status</p>
                <p className="text-tertiary font-bold flex items-center justify-end gap-1">
                  <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim"></span>
                  All Systems Operational
                </p>
              </div>
            </div>
          </motion.header>

          {/* Stats Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <motion.div variants={item} className="col-span-1 bg-surface-container-low p-6 rounded-3xl flex flex-col justify-between border-b-0 min-h-[160px]">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-primary shadow-sm">
                  <span className="material-symbols-outlined">group</span>
                </div>
                <span className="text-tertiary font-bold text-xs bg-tertiary-fixed px-2 py-1 rounded-full">+12%</span>
              </div>
              <div className="mt-6">
                <p className="text-3xl font-black text-on-surface font-headline italic">14,280</p>
                <p className="text-sm font-medium text-on-surface-variant uppercase tracking-wide font-body">Total Students</p>
              </div>
            </motion.div>

            <motion.div variants={item} className="col-span-1 bg-surface-container-high p-6 rounded-3xl flex flex-col justify-between border-b-0 min-h-[160px]">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-secondary shadow-sm">
                  <span className="material-symbols-outlined">how_to_reg</span>
                </div>
                <span className="text-on-error-container font-bold text-xs bg-error-container px-2 py-1 rounded-full font-body">High Priority</span>
              </div>
              <div className="mt-6">
                <p className="text-3xl font-black text-on-surface font-headline italic">24</p>
                <p className="text-sm font-medium text-on-surface-variant uppercase tracking-wide font-body">Pending Approvals</p>
              </div>
            </motion.div>

            <motion.div variants={item} className="col-span-2 relative overflow-hidden bg-primary-container p-6 rounded-3xl flex flex-col justify-center border-b-0 min-h-[160px]">
              <div className="relative z-10">
                <h4 className="text-primary-fixed font-bold text-sm uppercase tracking-widest mb-1 font-headline">Latest Global News</h4>
                <p className="text-white text-xl font-bold mb-4 leading-tight font-headline">Advanced AI Curriculum integration starting next semester across all departments.</p>
                <button className="text-tertiary-fixed text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all font-body">
                  Edit Announcement <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 opacity-20 -mr-8 -mt-8 bg-tertiary-fixed blur-3xl rounded-full"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 opacity-10 -ml-6 -mb-6 bg-secondary blur-2xl rounded-full"></div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Student Whitelist Control */}
            <motion.section variants={item} className="lg:col-span-2 space-y-6 text-body">
              <div className="flex items-center justify-between">
                <h4 className="text-2xl font-bold text-on-surface font-headline tracking-tight">Student Whitelist Control</h4>
                <button className="bg-surface-container-highest px-4 py-2 rounded-xl text-sm font-bold text-primary hover:bg-primary hover:text-white transition-all font-body">Export Roster</button>
              </div>
              <div className="bg-white rounded-[2rem] overflow-hidden shadow-2xl shadow-indigo-900/5">
                <div className="p-6 border-b border-surface-container flex items-center gap-4 bg-surface-container-lowest">
                  <div className="flex-1 relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">filter_list</span>
                    <input 
                      className="w-full pl-10 bg-surface-container-low border-none rounded-xl text-sm py-2.5 focus:ring-2 focus:ring-secondary/20 transition-all outline-none" 
                      placeholder="Filter by domain, email or institution..." 
                      type="text"
                    />
                  </div>
                  <button className="bg-secondary text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-secondary/20 flex items-center gap-2 font-body">
                    <span className="material-symbols-outlined text-sm">person_add</span> Add Domain
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-surface-container-low">
                      <tr>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant font-headline">Domain / Entity</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant font-headline">Access Tier</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant font-headline">Active Students</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant text-right font-headline">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container-low font-body">
                      {[
                        { domain: 'university-oxford.edu', type: 'Academic Partner', tier: 'Full Premium', count: '4,812', color: 'bg-tertiary-fixed text-on-tertiary-fixed-variant', initial: 'U' },
                        { domain: 'mit.edu.research', type: 'Research Node', tier: 'Curriculum Only', count: '1,240', color: 'bg-secondary-fixed text-on-secondary-fixed-variant', initial: 'M' },
                        { domain: 'global-talent.org', type: 'Scholarship Entity', tier: 'Restricted', count: '856', color: 'bg-surface-container-high text-on-surface-variant', initial: 'G' },
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">{row.initial}</div>
                              <div>
                                <p className="font-bold text-sm">{row.domain}</p>
                                <p className="text-xs text-on-surface-variant">{row.type}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className={cn("text-[10px] font-black uppercase px-2 py-1 rounded", row.color)}>{row.tier}</span>
                          </td>
                          <td className="px-6 py-5 font-medium text-sm">{row.count}</td>
                          <td className="px-6 py-5 text-right">
                            <button className="text-on-surface-variant hover:text-primary"><span className="material-symbols-outlined text-lg">more_horiz</span></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.section>

            {/* CMS Feed sidebar */}
            <motion.section variants={item} className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-2xl font-bold text-on-surface font-headline tracking-tight">CMS Feed</h4>
                <button className="text-primary font-bold text-xs uppercase tracking-widest font-headline">History</button>
              </div>
              <div className="space-y-4">
                <div className="glass-card p-5 rounded-[1.5rem] shadow-sm border border-white/40">
                  <div className="flex gap-4">
                    <img 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBIdjc2j2pbVbc9RysivCiJDN89Y7BinqBinqCISwnYz-W25MjBnvbncm-XfRPT_IW-Or1mIX_uaoe7j24rtPWtIjNr5Pw9QU9XP5E9N6Blp-X5tWA9e5hlHU07kfyhf6SJWZieGwcOy3CUe5TJO3w52bir1Yrr8LfGkCajoP8h-4tULwydG_w4EEeieTd9EqzXWb_aZXLRTaNhEf8vI9BCY2U_1TE3edeMsbMFiCn0jnshtimva2QhpR3PEnMbwD1ynxuDIu2A-jozub8" 
                      alt="News" className="w-20 h-20 rounded-2xl object-cover shrink-0" 
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <span className="text-[10px] font-black uppercase text-tertiary-container bg-tertiary-fixed px-2 py-0.5 rounded tracking-tighter font-headline">Academic</span>
                      <h5 className="text-sm font-bold text-on-surface mt-1 leading-snug font-headline">Spring Research Grants Open for Application</h5>
                      <p className="text-[11px] text-on-surface-variant mt-1 line-clamp-2 font-body">The Dampella LMS board has released $2M in specialized grants for AI-driven pedagogical research...</p>
                    </div>
                  </div>
                </div>

                <button className="w-full py-4 border-2 border-dashed border-outline-variant rounded-2xl flex items-center justify-center gap-2 text-on-surface-variant font-bold hover:border-secondary hover:text-secondary transition-all group font-body">
                  <span className="material-symbols-outlined group-hover:scale-110 transition-transform">add_circle</span>
                  Draft New Announcement
                </button>
              </div>

              {/* Global Controls */}
              <div className="bg-on-surface text-white p-8 rounded-[2rem] relative overflow-hidden">
                <h4 className="text-xl font-bold font-headline mb-6">Global Controls</h4>
                <div className="space-y-6 relative z-10 font-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold">Public Registration</p>
                      <p className="text-[10px] text-slate-400">Allow users without whitelisted domains</p>
                    </div>
                    <div className="w-10 h-5 bg-slate-700 rounded-full relative flex items-center px-1 cursor-pointer">
                      <div className="w-3 h-3 bg-slate-500 rounded-full"></div>
                    </div>
                  </div>
                  <button className="w-full bg-white text-on-surface py-3 rounded-xl font-black text-xs uppercase tracking-widest mt-4 shadow-xl shadow-black/40">Open Global Settings</button>
                </div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-secondary/20 blur-3xl rounded-full"></div>
              </div>
            </motion.section>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
