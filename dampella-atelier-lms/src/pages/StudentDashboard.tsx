import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function StudentDashboard() {
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
      {/* Header Section */}
      <motion.div variants={item} className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-headline font-extrabold text-indigo-950 tracking-tighter mb-2">Academic Overview</h2>
          <p className="text-slate-500 font-medium">Welcome back, Alex. You have 3 assignments due this week.</p>
        </div>
        <div className="flex items-center gap-2 bg-tertiary-fixed/30 px-4 py-2 rounded-xl text-tertiary font-bold text-sm">
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
          AI Tutor Online
        </div>
      </motion.div>

      {/* Bento Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* GPA Card */}
        <motion.div variants={item} className="md:col-span-1 bg-surface-container-lowest p-6 rounded-[2rem] flex flex-col justify-between shadow-sm border-none relative overflow-hidden group min-h-[180px]">
          <div className="relative z-10">
            <span className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-1 block">Cumulative GPA</span>
            <h3 className="text-5xl font-headline font-black text-indigo-950">3.88</h3>
          </div>
          <div className="mt-4 flex items-center gap-2 text-on-tertiary-fixed-variant font-bold text-sm">
            <span className="material-symbols-outlined text-lg">trending_up</span>
            <span>+0.2 this term</span>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-9xl">auto_awesome</span>
          </div>
        </motion.div>

        {/* Attendance Card */}
        <motion.div variants={item} className="md:col-span-1 bg-indigo-50 p-6 rounded-[2rem] flex flex-col justify-between min-h-[180px]">
          <div>
            <span className="text-xs font-bold text-indigo-400 tracking-widest uppercase mb-1 block font-headline">Attendance</span>
            <h3 className="text-5xl font-headline font-black text-indigo-900">94%</h3>
          </div>
          <div className="w-full bg-indigo-100 h-2 rounded-full mt-6 overflow-hidden">
            <div className="bg-indigo-600 h-full w-[94%]"></div>
          </div>
        </motion.div>

        {/* Marks Section (Bento wide) */}
        <motion.div variants={item} className="md:col-span-2 bg-surface-container-low p-6 rounded-[2rem] relative overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-headline font-bold text-lg text-indigo-950">My Marks</h4>
            <button className="text-xs font-bold text-indigo-600 uppercase tracking-widest hover:underline">View Transcript</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { subject: 'Computer Science', grade: 'A', score: 96, active: true },
              { subject: 'Modern Lit', grade: 'B+', score: 88, active: false },
              { subject: 'Calculus II', grade: 'A-', score: 91, active: true },
              { subject: 'Microeconomics', grade: 'A', score: 94, active: true },
            ].map((mark, idx) => (
              <div key={idx} className="bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-xs font-bold text-slate-400">{mark.subject}</p>
                  <p className="text-lg font-bold text-indigo-900 leading-tight">{mark.grade}</p>
                </div>
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                  mark.active ? "bg-tertiary-fixed text-tertiary" : "bg-indigo-100 text-indigo-600"
                )}>
                  {mark.score}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Dashboard Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Assignments List */}
        <motion.div variants={item} className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-headline font-extrabold text-indigo-950 tracking-tight">Active Assignments</h3>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-full">All</span>
              <span className="px-3 py-1 bg-surface-container text-indigo-400 text-[10px] font-bold rounded-full">Due Soon</span>
            </div>
          </div>
          
          <div className="space-y-3">
            {[
              { title: 'Advanced React Patterns', due: '2 days', weight: '25%', icon: 'terminal', target: 'A', color: 'bg-indigo-50 text-indigo-600' },
              { title: 'Economic Crisis Analysis Paper', due: 'tomorrow', weight: '40%', icon: 'menu_book', target: 'A-', color: 'bg-tertiary-fixed/30 text-tertiary', warning: true },
              { title: 'Differential Equations Problem Set', due: '5 days', weight: '10%', icon: 'functions', target: 'B+', color: 'bg-indigo-50 text-indigo-600' },
            ].map((task, idx) => (
              <div key={idx} className="group bg-surface-container-lowest p-6 rounded-[2rem] transition-all hover:translate-x-2 border border-transparent hover:border-indigo-100 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", task.color)}>
                      <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>{task.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-headline font-bold text-indigo-950 mb-1">{task.title}</h4>
                      <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                        <span className="flex items-center gap-1">
                          <span className={cn("material-symbols-outlined text-sm", task.warning && "text-error")}>
                            {task.warning ? 'event' : 'schedule'}
                          </span> 
                          Due in {task.due}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">auto_graph</span> 
                          Weight: {task.weight}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-indigo-600 block mb-1">Target</span>
                    <span className="text-xl font-black text-indigo-950">{task.target}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* AI Chatbot Entry Point & Side Profile */}
        <motion.div variants={item} className="space-y-8">
          {/* AI Tutoring Prompt */}
          <div className="bg-gradient-to-br from-indigo-950 to-primary-container p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-tertiary-fixed">smart_toy</span>
              </div>
              <h3 className="text-2xl font-headline font-bold mb-3">Stuck on a problem?</h3>
              <p className="text-indigo-200 text-sm leading-relaxed mb-6">Dampella AI is ready to help you analyze your assignments or explain complex theories in simple terms.</p>
              <button className="w-full py-4 bg-tertiary-fixed text-tertiary font-black rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform">
                <span>Start AI Session</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
            {/* Background decoration */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/20 blur-[60px] rounded-full"></div>
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-teal-500/10 blur-[80px] rounded-full"></div>
          </div>

          {/* Upcoming Schedule */}
          <div className="bg-surface-container-low p-8 rounded-[2.5rem]">
            <h4 className="font-headline font-bold text-indigo-950 mb-6">Today's Schedule</h4>
            <div className="space-y-6">
              {[
                { time: '09:00', title: 'Computer Science IV', location: 'Hall B, Main Campus', active: true },
                { time: '11:30', title: 'Macroeconomics Lab', location: 'Virtual Session - Room 4', active: false },
                { time: '14:00', title: 'Student Union Meet', location: 'Atrium Plaza', active: false },
              ].map((slot, idx, arr) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className={cn("text-xs font-black", slot.active ? "text-indigo-600" : "text-slate-400")}>{slot.time}</span>
                    {idx < arr.length - 1 && <div className="w-px h-full bg-indigo-200 my-2"></div>}
                  </div>
                  <div>
                    <p className="font-bold text-indigo-950 text-sm">{slot.title}</p>
                    <p className="text-xs text-slate-500">{slot.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Progress Insight Banner */}
      <motion.div variants={item} className="p-1 bg-white rounded-[2.5rem] shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-6 p-6 md:p-8 bg-surface-container-low/50 rounded-[2.2rem]">
          <div className="w-20 h-20 rounded-full border-[6px] border-tertiary-fixed border-t-tertiary flex items-center justify-center">
            <span className="text-lg font-black text-indigo-950">84%</span>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h4 className="font-headline font-bold text-indigo-950 text-xl">Curriculum Progress</h4>
            <p className="text-slate-500 text-sm">You are on track to graduate with honors. Only 4 more modules to complete Level 4.</p>
          </div>
          <button className="px-8 py-4 bg-white border border-indigo-100 text-indigo-600 font-bold rounded-2xl hover:bg-indigo-50 transition-colors">
            Expand Curriculum
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
