import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function TeacherDashboard() {
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
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-12"
    >
      {/* Hero Header Section */}
      <motion.section variants={item} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold tracking-tighter text-indigo-950 font-headline">Welcome back, Atelier Mentor.</h2>
          <p className="text-slate-500 font-medium font-body">You have 12 assignments pending review and 2 upcoming lectures today.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-3 bg-surface-container-lowest text-primary font-bold text-sm rounded-xl shadow-sm hover:bg-surface-container-low transition-colors border border-outline-variant/10 active:scale-95 font-body">
            View Schedule
          </button>
          <button className="px-6 py-3 bg-gradient-to-r from-primary to-primary-container text-white font-bold text-sm rounded-xl shadow-lg active:scale-95 transition-all flex items-center gap-2 font-body">
            <span className="material-symbols-outlined text-sm">add_circle</span>
            Create Assignment
          </button>
        </div>
      </motion.section>

      {/* Performance Metrics (Asymmetric Bento) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Large Analytics Card */}
        <motion.div variants={item} className="md:col-span-2 bg-surface-container-low p-6 rounded-[2rem] flex flex-col justify-between relative overflow-hidden group min-h-[180px]">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-indigo-400 mb-1 font-headline">Average Completion Rate</p>
                <h3 className="text-4xl font-extrabold text-indigo-950 font-headline">94.2%</h3>
              </div>
              <div className="bg-tertiary-fixed text-tertiary px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">trending_up</span>
                +2.4%
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-xs font-medium text-slate-600 font-body">
                <span>Curriculum Progress</span>
                <span>78% Year Total</span>
              </div>
              <div className="h-2 w-full bg-slate-200/50 rounded-full overflow-hidden">
                <div className="h-full bg-tertiary w-[78%] rounded-full"></div>
              </div>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-200/20 rounded-full blur-3xl group-hover:bg-indigo-300/30 transition-all duration-700"></div>
        </motion.div>

        {/* Active Classes Card */}
        <motion.div variants={item} className="bg-surface-container-lowest p-6 rounded-[2rem] shadow-sm border border-outline-variant/10 flex flex-col justify-between min-h-[180px]">
          <span className="material-symbols-outlined text-secondary text-3xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
          <div>
            <h4 className="text-sm font-bold text-slate-500 font-body">Active Classes</h4>
            <p className="text-3xl font-extrabold text-indigo-950 font-headline">08</p>
          </div>
          <div className="mt-4 flex -space-x-2">
            {[1, 2, 3].map(i => (
              <img 
                key={i}
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=student${i}`} 
                className="w-8 h-8 rounded-full border-2 border-white object-cover"
                alt="Student"
                referrerPolicy="no-referrer"
              />
            ))}
            <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 font-body">+142</div>
          </div>
        </motion.div>

        {/* Time to Grade Card */}
        <motion.div variants={item} className="bg-surface-container-lowest p-6 rounded-[2rem] shadow-sm border border-outline-variant/10 flex flex-col justify-between min-h-[180px]">
          <span className="material-symbols-outlined text-tertiary text-3xl mb-4">timer</span>
          <div>
            <h4 className="text-sm font-bold text-slate-500 font-body">Pending Review</h4>
            <p className="text-3xl font-extrabold text-indigo-950 font-headline">12</p>
          </div>
          <p className="mt-4 text-xs font-medium text-slate-400 font-body">Next deadline in 4 hours</p>
        </motion.div>
      </div>

      {/* Content Grid: Submissions & Course Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Submissions List */}
        <motion.section variants={item} className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-extrabold text-indigo-950 font-headline tracking-tight">Recent Submissions</h3>
            <button className="text-sm font-bold text-secondary hover:underline font-body">View All</button>
          </div>
          <div className="space-y-3">
            {[
              { name: 'Julianne Moore', task: 'Adv. Typography — Project 02: Brand Identity', time: '2h ago', seed: 'julianne' },
              { name: 'Marcus Wright', task: 'Interaction Design — User Research Analysis', time: '5h ago', seed: 'marcus' },
              { name: 'Lana Del Rey', task: 'Visual Rhetoric — Semester Case Study', time: '1d ago', seed: 'lana' },
            ].map((sub, idx) => (
              <div key={idx} className="group bg-surface-container-lowest p-5 rounded-2xl flex items-center gap-4 transition-all hover:bg-indigo-50/30 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${sub.seed}`} className="w-full h-full object-cover" alt={sub.name} referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-indigo-950 truncate font-headline">{sub.name}</h4>
                  <p className="text-xs text-slate-500 truncate font-body">{sub.task}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-slate-400 mb-1 font-body">Submitted {sub.time}</p>
                  <button className="px-4 py-1.5 bg-secondary/10 text-secondary text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-secondary hover:text-white transition-all font-headline">Grade Now</button>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* My Classes section */}
        <motion.section variants={item} className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-extrabold text-indigo-950 font-headline tracking-tight">My Classes</h3>
            <span className="material-symbols-outlined text-slate-400 cursor-pointer hover:text-primary">more_horiz</span>
          </div>
          <div className="space-y-4">
            <div className="p-6 rounded-[2rem] bg-indigo-950 text-white relative overflow-hidden group shadow-lg">
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase font-headline">Batch A-01</div>
                  <span className="material-symbols-outlined text-indigo-300">draw</span>
                </div>
                <h4 className="text-lg font-bold leading-tight mb-2 font-headline">Advanced Typography & Layout</h4>
                <p className="text-xs text-indigo-200 mb-6 font-medium font-body">32 Students • Mon, Wed 10:00 AM</p>
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-1">
                    <div className="w-6 h-6 rounded-full border border-indigo-900 bg-indigo-800 flex items-center justify-center text-[8px] font-bold">+28</div>
                  </div>
                  <button className="w-8 h-8 rounded-full bg-tertiary-fixed text-tertiary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/30 blur-3xl -mr-10 -mt-10"></div>
            </div>

            <div className="p-6 rounded-[2rem] bg-surface-container-high border border-outline-variant/20 relative overflow-hidden group shadow-sm">
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="bg-indigo-950/5 px-3 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase text-indigo-950/40 font-headline">Batch B-04</div>
                  <span className="material-symbols-outlined text-indigo-950/30">dvr</span>
                </div>
                <h4 className="text-lg font-bold text-indigo-950 leading-tight mb-2 font-headline">Interface Theory & Interaction</h4>
                <p className="text-xs text-slate-500 mb-6 font-medium font-body">24 Students • Tue, Thu 02:00 PM</p>
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-1">
                    <div className="w-6 h-6 rounded-full border border-white bg-slate-200 flex items-center justify-center text-[8px] font-bold">+20</div>
                  </div>
                  <button className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      </div>

      {/* Task Management / Weekly Agenda */}
      <motion.section variants={item} className="bg-surface-container-low p-8 rounded-[2.5rem]">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-full md:w-1/3 space-y-4">
            <h3 className="text-2xl font-extrabold text-indigo-950 font-headline leading-tight">Weekly <br/>Agenda</h3>
            <p className="text-sm text-slate-500 font-medium font-body">You have 4 primary goals to complete this academic week.</p>
            <div className="pt-4 flex gap-4">
              <div className="text-center font-body">
                <div className="text-2xl font-black text-indigo-950">24</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Done</div>
              </div>
              <div className="w-px h-10 bg-slate-200"></div>
              <div className="text-center font-body">
                <div className="text-2xl font-black text-secondary">04</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active</div>
              </div>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            {[
              { title: 'Finalize Quiz Structure', desc: 'Adv. Typography — Module 4', status: 'Due tomorrow', icon: 'schedule' },
              { title: 'Grade Portfolio Submissions', desc: 'Visual Rhetoric — 12 pending', status: 'High Priority', icon: 'priority_high', urgent: true },
              { title: 'Update Syllabus Docs', desc: 'Inter-disciplinary Studies' },
              { title: 'Department Sync Meeting', desc: 'Friday, 11:30 AM — Zoom' },
            ].map((agenda, idx) => (
              <div key={idx} className="bg-surface-container-lowest p-6 rounded-3xl flex items-start gap-4 shadow-sm border border-outline-variant/10">
                <div className={cn(
                  "mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                  agenda.urgent ? "border-error/20 bg-error/5" : "border-slate-200"
                )}>
                  {agenda.status && <div className={cn("w-2.5 h-2.5 rounded-full", agenda.urgent ? "bg-error" : "bg-tertiary")} />}
                </div>
                <div>
                  <h5 className="text-sm font-bold text-indigo-950 font-headline">{agenda.title}</h5>
                  <p className="text-xs text-slate-400 mt-1 font-body">{agenda.desc}</p>
                  {agenda.status && (
                    <div className={cn(
                      "mt-3 flex items-center gap-2 text-[10px] font-bold px-2 py-1 rounded w-fit uppercase tracking-tighter font-headline",
                      agenda.urgent ? "text-error bg-error-container/30" : "text-indigo-400 bg-indigo-50"
                    )}>
                      <span className="material-symbols-outlined text-[12px]">{agenda.icon}</span> 
                      {agenda.status}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
