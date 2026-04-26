"use client"

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, getInitials, getNameColor } from '@/lib/utils';
import { User, useAuth } from '@/lib/portal/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, limit, getDocs, doc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogClose, DialogTitle } from '@/components/ui/dialog';

interface StudentDashboardProps {
  user: User
  onLogout: () => void
  onBackToWebsite: () => void
}


// --- Student Quiz View Component ---

function StudentQuizView({ 
  quiz, 
  user, 
  onExit, 
  initialViewMode = 'QUIZ',
  initialAnswers = {},
  initialResultData = null
}: { 
  quiz: any, 
  user: User, 
  onExit: () => void,
  initialViewMode?: 'QUIZ' | 'RESULT' | 'REVIEW',
  initialAnswers?: Record<number, number>,
  initialResultData?: any
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes
  const [streak, setStreak] = useState(3);
  const [answers, setAnswers] = useState<Record<number, number>>(initialAnswers);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<'QUIZ' | 'RESULT' | 'REVIEW'>(initialViewMode);
  const [resultData, setResultData] = useState<any>(initialResultData);

  const questions = quiz?.questions || quiz?.mcqs || [];
  const currentQ = questions[currentIdx];

  // Timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentOptions = currentQ?.options || [];
  
  const handleOptionSelect = (idx: number) => {
    setSelectedOption(idx);
    setAnswers(prev => ({ ...prev, [currentIdx]: idx }));
  };

  const handleFinish = async () => {
    const answeredCount = Object.keys(answers).length;
    console.log("Finishing quiz. Answered:", answeredCount, "Total:", questions.length);

    if (answeredCount < questions.length) {
      if (!confirm(`You have only answered ${answeredCount} out of ${questions.length} questions. Do you want to finish anyway?`)) return;
    }

    setIsSubmitting(true);
    try {
      console.log("Checking for existing submission...");
      // Final safety check: ensure no existing submission before writing
      const existingQuery = query(
        collection(db, "quiz_submissions"),
        where("quizId", "==", quiz.id),
        where("studentId", "==", user.studentId || user.email),
        limit(1)
      );
      const existingSnap = await getDocs(existingQuery);
      
      if (!existingSnap.empty) {
        alert("You have already submitted this quiz. Your new result will not be saved.");
        onExit();
        return;
      }

      let correctCount = 0;
      questions.forEach((q: any, idx: number) => {
        if (answers[idx] === q.correct_option_index) {
          correctCount++;
        }
      });

      const percentage = (correctCount / questions.length) * 100;
      const timeSpentSecs = 900 - timeLeft;
      const timeSpentStr = formatTime(timeSpentSecs);

      const submissionData: any = {
        quizId: quiz.id || "unknown_id",
        quizTitle: quiz.title || "Untitled Quiz",
        subject: quiz.subject || "General",
        teacherEmail: quiz.teacher_email || quiz.teacherId || "unknown_teacher",
        grade: user.gradeClass || user.grade || "Grade 10",
        studentId: user.studentId || user.email || "unknown_student",
        studentName: user.fullName || "Anonymous",
        studentEmail: user.email || "no-email@example.com",
        score: correctCount,
        totalQuestions: questions.length,
        percentage: percentage,
        timeSpent: timeSpentStr,
        timeSpentSeconds: timeSpentSecs,
        status: 'GRADED',
        createdAt: serverTimestamp(),
        answers: { ...answers } // Ensure it's a plain object
      };

      // Sanitize: ensure no undefined values are passed to Firestore
      Object.keys(submissionData).forEach(key => {
        if (submissionData[key] === undefined) {
          submissionData[key] = null;
        }
      });

      await addDoc(collection(db, "quiz_submissions"), submissionData);

      setResultData({
        score: correctCount,
        total: questions.length,
        percentage: Math.round(percentage),
        timeSpent: timeSpentStr
      });
      setViewMode('RESULT');
    } catch (e: any) {
      console.error("Error saving quiz submission:", e);
      alert("Failed to save result: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOption(answers[currentIdx + 1] ?? null);
    } else {
       handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
      setSelectedOption(answers[currentIdx - 1] ?? null);
    }
  };

  if (viewMode === 'RESULT' && resultData) {
    return (
      <QuizResultModal 
        data={resultData} 
        onExit={onExit} 
        onReview={() => setViewMode('REVIEW')} 
      />
    );
  }

  if (viewMode === 'REVIEW' && resultData) {
    return (
      <QuizPerformanceReview 
        quiz={quiz} 
        answers={answers} 
        data={resultData} 
        onBack={() => setViewMode('RESULT')} 
        onExit={onExit}
      />
    );
  }

  if (questions.length === 0) {
    return (
      <div className="fixed inset-0 bg-[#f8f9fc] z-[100] flex flex-col items-center justify-center p-10 text-center gap-6">
         <div className="w-20 h-20 rounded-3xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <span className="material-symbols-outlined text-4xl">warning</span>
         </div>
         <div>
            <h3 className="text-xl font-extrabold text-slate-900">Assessment Data Missing</h3>
            <p className="text-sm font-medium text-slate-400 mt-2">This quiz document does not contain any valid questions.</p>
         </div>
         <button onClick={onExit} className="px-10 py-4 bg-indigo-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-105 transition-all">Return to Lab</button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-[#f8f9fc] z-[100] flex flex-col overflow-y-auto custom-scrollbar"
    >
      {/* Quiz Header */}
      <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 lg:px-10 flex items-center justify-between shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-900 flex items-center justify-center text-white shadow-lg">
            <span className="material-symbols-outlined text-xl">architecture</span>
          </div>
          <div>
            <h1 className="font-extrabold text-[13px] tracking-tight text-slate-900 leading-none">The Intellectual LMS</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{quiz.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-full flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-600 text-lg">schedule</span>
            <span className="text-[13px] font-black text-indigo-950 tabular-nums">{formatTime(timeLeft)}</span>
          </div>
          <button 
            onClick={onExit}
            className="w-10 h-10 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-400 transition-all active:scale-90"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1400px] mx-auto p-6 lg:p-10">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* Question Engine */}
          <div className="xl:col-span-8 space-y-10 lg:pr-10">
            <div className="space-y-6">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">QUESTION {String(currentIdx + 1).padStart(2, '0')} OF {String(questions.length).padStart(2, '0')}</p>
                <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  {currentQ.question_text || currentQ.question}
                </h2>
              </div>

              <div className="space-y-4 pt-4">
                {currentOptions.map((option: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => handleOptionSelect(idx)}
                    className={cn(
                      "w-full p-6 lg:p-8 rounded-[2rem] border-2 text-left transition-all group relative flex items-center gap-6",
                      selectedOption === idx
                        ? "bg-indigo-50/50 border-indigo-600 shadow-lg shadow-indigo-100"
                        : "bg-white border-white shadow-sm hover:border-slate-100"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-black transition-all",
                      selectedOption === idx
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-50 text-slate-400 group-hover:bg-slate-100"
                    )}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className={cn(
                      "text-[14px] lg:text-[15px] font-bold leading-relaxed",
                      selectedOption === idx ? "text-indigo-950" : "text-slate-600"
                    )}>
                      {option}
                    </span>
                    {selectedOption === idx && (
                      <div className="ml-auto w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white scale-110">
                        <span className="material-symbols-outlined text-[16px] font-bold text-white">check</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation Cockpit */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-10 border-t border-slate-100">
              <button 
                onClick={handlePrev}
                disabled={currentIdx === 0}
                className="px-10 py-4 border-2 border-dashed border-indigo-200 rounded-2xl text-[11px] font-black uppercase tracking-widest text-indigo-400 hover:border-indigo-600 hover:text-indigo-600 transition-all flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-lg">west</span>
                Previous
              </button>
              <div className="flex items-center gap-10">
                <button 
                  onClick={handleNext}
                  className="text-[11px] font-black uppercase tracking-widest text-slate-300 hover:text-slate-600 transition-all"
                >
                  Skip
                </button>
                <button 
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="px-10 py-4 bg-indigo-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-900/20 flex items-center gap-2 font-sans font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : (currentIdx === questions.length - 1 ? 'Finish Quiz' : 'Next Question')}
                  {!isSubmitting && <span className="material-symbols-outlined text-lg font-bold">east</span>}
                </button>
              </div>
            </div>
          </div>

          {/* Focus Sidebar */}
          <div className="xl:col-span-4 space-y-8">
            {/* Historical Reference - Dynamic if available */}
            <section className="bg-white rounded-[2.5rem] overflow-hidden border border-white shadow-sm group">
              <div className="aspect-[4/3] w-full bg-slate-100 relative">
                <img 
                  src={quiz.imageUrl || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800"} 
                  alt="Reference"
                  className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6">
                   <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Historical Reference</p>
                </div>
              </div>
            </section>

            {/* Quiz Pulse */}
            <section className="bg-indigo-950 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-900/20 space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Quiz Pulse</p>
                  <h3 className="text-xl font-extrabold tracking-tight mt-1">Completion</h3>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-indigo-400">{Math.round(((currentIdx + 1) / questions.length) * 100)}%</span>
                </div>
              </div>
              
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-400 rounded-full shadow-[0_0_15px_rgba(129,140,248,0.5)] transition-all duration-500" 
                  style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                   <p className="text-[9px] font-black text-white/30 uppercase tracking-widest leading-none">Answered</p>
                   <p className="text-2xl font-black mt-1">{Object.keys(answers).length.toString().padStart(2, '0')}</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-8 h-8 bg-orange-400/10 rounded-full -mr-4 -mt-4 blur-xl group-hover:scale-150 transition-transform" />
                   <p className="text-[9px] font-black text-white/30 uppercase tracking-widest flex items-center justify-center gap-1">Streak <span className="material-symbols-outlined text-orange-400 text-[12px]">local_fire_department</span></p>
                   <p className="text-2xl font-black mt-1 flex items-center justify-center gap-1">{streak} <span className="text-orange-400 text-[18px]">🔥</span></p>
                </div>
              </div>

              <button 
                onClick={onExit}
                className="w-full h-14 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white transition-all shadow-inner"
              >
                Quit Quiz
              </button>
            </section>
          </div>
        </div>
      </main>
    </motion.div>
  );
}

// --- Student Assignment View Component ---



function StudentAssignmentView({ assignments, selectedId, onSelect }: { assignments: any[], selectedId: string | null, onSelect: (id: string | null) => void }) {
  const selected = assignments.find(a => a.id === selectedId);

  if (!selectedId || !selected) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900">Academic Missions</h2>
            <p className="text-[12px] lg:text-[13px] font-semibold text-slate-500">Select an active objective to begin your submission sequence.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
          {assignments.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
               <span className="material-symbols-outlined text-4xl text-slate-200">inbox</span>
               <p className="text-[11px] font-black uppercase text-slate-300 mt-4 tracking-widest">No Active Missions Found</p>
            </div>
          ) : assignments.map((assignment) => (
            <motion.div
              key={assignment.id}
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-[2.5rem] border border-white shadow-sm hover:shadow-xl transition-all cursor-pointer group"
              onClick={() => onSelect(assignment.id)}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 transition-colors group-hover:bg-indigo-900 group-hover:text-white">
                  <span className="material-symbols-outlined text-2xl">rocket_launch</span>
                </div>
                <Badge className="bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest px-2 py-1">ACTIVE</Badge>
              </div>
              <div className="space-y-4">
                <div>
                   <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest leading-none">{assignment.subject}</p>
                                      <div className="flex items-center justify-between gap-2">
                      <h3 className="text-[16px] font-extrabold text-slate-900 mt-2 leading-tight group-hover:text-indigo-900 transition-colors">{assignment.title}</h3>
                      {assignment.attachmentUrl && (
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-400 flex items-center justify-center shrink-0 mt-2">
                          <span className="material-symbols-outlined text-sm font-variation-fill">attachment</span>
                        </div>
                      )}
                   </div>
                </div>
                <p className="text-[11px] font-medium text-slate-400 line-clamp-2 leading-relaxed">{assignment.description || assignment.desc}</p>
                
                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm text-slate-300">event</span>
                      <span className="text-[10px] font-bold text-slate-500">{assignment.due_date || assignment.dueDate}</span>
                   </div>
                   <span className="material-symbols-outlined text-slate-300 group-hover:translate-x-1 transition-transform">east</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-8 lg:space-y-10"
    >
      {/* Header Breadcrumbs & Action */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]">
          <button onClick={() => onSelect(null)} className="text-slate-300 hover:text-indigo-600 transition-colors">Curriculum</button>
          <span className="material-symbols-outlined text-[12px] text-slate-200">chevron_right</span>
          <span className="text-slate-300">{selected.subject}</span>
          <span className="material-symbols-outlined text-[12px] text-slate-200">chevron_right</span>
          <span className="text-indigo-900">{selected.title}</span>
        </nav>
        <button 
          onClick={() => onSelect(null)}
          className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-10">
        
        {/* Main Content Area */}
        <div className="xl:col-span-8 space-y-8">
           
           {/* Hero Header */}
           <section className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                 <div className="space-y-4 max-w-2xl">
                    <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tighter text-slate-900 leading-[1.1]">
                       {selected.title}
                    </h2>
                    <p className="text-[14px] lg:text-[15px] font-medium text-slate-500 leading-relaxed max-w-xl">
                       {selected.description || selected.desc || 'Proceed with the instructions provided below for this academic mission.'}
                    </p>
                 </div>
                 <div className="shrink-0 flex flex-col items-end gap-3 pt-2">
                    <div className="text-right">
                       <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none">Deadline</p>
                       <p className="text-[14px] font-extrabold text-slate-900 mt-1">{selected.due_date || selected.dueDate}</p>
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-lg">{selected.points || 100} Points</div>
                       <div className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-lg">In Progress</div>
                    </div>
                 </div>
              </div>
           </section>

           {/* Instructions */}
           <section className="bg-white rounded-[2.5rem] p-8 lg:p-10 shadow-sm border border-white space-y-8">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm">
                    <span className="material-symbols-outlined text-[20px]">description</span>
                 </div>
                 <h3 className="text-md lg:text-lg font-extrabold text-slate-900 tracking-tight">Instructions</h3>
              </div>

              <div className="space-y-6 text-[13px] lg:text-[14px] font-medium text-slate-500 leading-relaxed">
                 <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-50 whitespace-pre-wrap">
                    {selected.instructions || selected.description || 'No specific instructions were provided by the instructor.'}
                 </div>
                 
                 {selected.subject === 'Geography' && (
                    <div className="space-y-3">
                       <p className="font-extrabold text-slate-900">Key pillars to include in your response:</p>
                       <ul className="space-y-2 list-disc pl-5 uppercase text-[10px] font-black tracking-widest text-slate-400">
                          <li>Regional Topography Analysis</li>
                          <li>Climate Impact Assessment</li>
                          <li>Human Settlement Patterns</li>
                       </ul>
                    </div>
                 )}
              </div>
           </section>

           {/* Attached Resources */}
           <section className="space-y-6">
              <div className="flex items-center gap-3">
                 <span className="material-symbols-outlined text-indigo-300 text-xl">link</span>
                 <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Attached Resources</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                 {selected.attachmentUrl && selected.attachmentUrl.startsWith('http') ? (
                    <div className="bg-white p-5 rounded-3xl border border-white shadow-sm flex items-center justify-between group hover:border-indigo-100 transition-all">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                             <span className="material-symbols-outlined text-[22px]">picture_as_pdf</span>
                          </div>
                          <div>
                             <h4 className="text-[12px] font-extrabold text-slate-900 truncate max-w-[120px] lg:max-w-none">Reference_Material.pdf</h4>
                             <p className="text-[10px] font-bold text-slate-400 mt-0.5">Academic Resource</p>
                          </div>
                       </div>
                       <a 
                         href={selected.attachmentUrl} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="material-symbols-outlined text-slate-200 hover:text-indigo-600 transition-all no-underline"
                       >
                         download
                       </a>
                    </div>
                 ) : (
                    <div className="col-span-full p-8 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                       <p className="text-[10px] font-black uppercase text-slate-300 tracking-widest">No attachments provided</p>
                    </div>
                 )}
              </div>
           </section>

        </div>

        {/* Right Sidebar - Submission Panel */}
        <div className="xl:col-span-4 space-y-8">
            <section className="bg-indigo-950 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-900/20 space-y-8 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-400/10 rounded-full -mr-16 -mt-16 blur-3xl" />
               <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                     <span className="material-symbols-outlined">upload_file</span>
                  </div>
                  <h3 className="text-xl font-extrabold tracking-tight">Submit Work</h3>
               </div>

               <div className="space-y-6 relative z-10">
                  <div>
                     <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Upload Documents</p>
                     <div className="h-40 rounded-[2rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-3 hover:bg-white/5 hover:border-white/20 transition-all cursor-pointer">
                        <span className="material-symbols-outlined text-3xl text-indigo-400">cloud_upload</span>
                        <p className="text-[11px] font-black uppercase tracking-widest">Drag and drop files here</p>
                        <p className="text-[9px] font-bold text-white/30 uppercase tracking-tight">Supports PDF, DOCX (Max 50MB)</p>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Submission Notes</p>
                     <textarea 
                       placeholder="Enter any specific comments for the evaluator..."
                       className="w-full h-32 bg-white/5 rounded-2xl p-5 text-[12px] font-medium placeholder:text-white/20 border border-white/5 focus:border-indigo-400 outline-none transition-all resize-none"
                     />
                  </div>

                  <button className="w-full h-16 bg-white text-indigo-950 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                     <span className="material-symbols-outlined text-lg">send</span>
                     Submit Assignment
                  </button>

                  <p className="text-[9px] font-medium text-white/30 text-center leading-relaxed">
                     By submitting, you confirm this work is your own and adheres to the institutional honor code.
                  </p>
               </div>
            </section>
        </div>
      </div>
    </motion.div>
  );
}

// --- Premium Result Modal ---

function QuizResultModal({ data, onExit, onReview }: { data: any, onExit: () => void, onReview: () => void }) {
  const masteryLabel = data.percentage >= 80 ? "Excellent Mastery" : data.percentage >= 50 ? "Good Progress" : "Needs Review";
  const masteryColor = data.percentage >= 80 ? "text-emerald-400" : data.percentage >= 50 ? "text-amber-400" : "text-rose-400";
  
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center lg:justify-center overflow-y-auto custom-scrollbar bg-slate-900/80 backdrop-blur-md p-0 lg:p-10">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 pointer-events-none"
        onClick={onExit}
      />
      
      <motion.div 
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-white rounded-t-[2.5rem] lg:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row max-w-4xl w-full mt-12 lg:my-auto shrink-0"
      >
        {/* Left Side: Score Indicator (Indigo) */}
        <div className="lg:w-[40%] bg-primary p-6 lg:p-12 flex flex-col items-center justify-center text-center relative overflow-hidden shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 to-transparent pointer-events-none" />
          
          <div className="relative z-10 space-y-8 w-full">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.3em]">Evaluation Complete</p>
              <h3 className="text-xl lg:text-2xl font-black text-white font-jakarta uppercase tracking-tight">Performance Score</h3>
            </div>
            
            <div className="relative w-36 h-36 lg:w-48 lg:h-48 mx-auto flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle cx="72" cy="72" r="66" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" className="lg:hidden" />
                <circle cx="96" cy="96" r="88" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" className="hidden lg:block" />
                
                {/* Mobile Path */}
                <motion.circle 
                  cx="72" cy="72" r="66" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round"
                  className={cn("transition-all duration-1000 lg:hidden", masteryColor)}
                  initial={{ strokeDasharray: "0 415" }}
                  animate={{ strokeDasharray: `${(data.percentage / 100) * 415} 415` }}
                />
                
                {/* Desktop Path */}
                <motion.circle 
                  cx="96" cy="96" r="88" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round"
                  className={cn("transition-all duration-1000 hidden lg:block", masteryColor)}
                  initial={{ strokeDasharray: "0 553" }}
                  animate={{ strokeDasharray: `${(data.percentage / 100) * 553} 553` }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-0.5">
                <span className="text-2xl lg:text-3xl font-black text-white tracking-tighter">{data.score}/{data.total}</span>
                <span className="text-[9px] lg:text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Points</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-5xl font-black text-white tracking-tighter">{data.percentage}%</div>
              <p className={cn("text-[13px] font-bold uppercase tracking-widest", masteryColor)}>{masteryLabel}</p>
            </div>
            
            <div className="pt-4 border-t border-white/10">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                <span className="material-symbols-outlined text-[14px] text-amber-400 font-variation-fill">workspace_premium</span>
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Top 5% of cohort</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Side: Summary (White) */}
        <div className="lg:w-[60%] p-6 lg:p-14 space-y-6 lg:space-y-10 bg-white">
          <div className="space-y-2">
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">Performance Summary</h4>
            <div className="h-1 w-10 bg-indigo-600 rounded-full" />
          </div>
          
          <div className="space-y-6">
            {/* Analytical Strength */}
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-[1.5rem] p-6 flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-500 shadow-sm shrink-0">
                <span className="material-symbols-outlined font-variation-fill">check_circle</span>
              </div>
              <div className="space-y-1">
                <h5 className="text-[13px] font-black text-slate-900">Analytical Strength</h5>
                <p className="text-[12px] font-semibold text-slate-500 leading-relaxed">
                  You excel at identifying core concepts and logic-based reasoning. Consistency in your performance indicates deep subject understanding.
                </p>
              </div>
            </div>
            
            {/* Growth Opportunity */}
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-[1.5rem] p-6 flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-500 shadow-sm shrink-0">
                <span className="material-symbols-outlined font-variation-fill">lightbulb</span>
              </div>
              <div className="space-y-1">
                <h5 className="text-[13px] font-black text-slate-900">Growth Opportunity</h5>
                <p className="text-[12px] font-semibold text-slate-500 leading-relaxed">
                   Consider reviewing complex historical contexts or demographic shifts discussed in the latter modules for perfect retention.
                </p>
              </div>
            </div>
          </div>
          
          <div className="pt-6 space-y-4">
            <button 
              onClick={onExit}
              className="w-full h-14 bg-indigo-950 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Back to Dashboard
            </button>
            <button 
              onClick={onReview}
              className="w-full h-14 bg-white text-slate-400 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] border border-slate-100 hover:text-slate-600 hover:border-slate-300 transition-all font-sans"
            >
              Review Detailed Breakdown
            </button>
          </div>
          
          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
             <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?u=${i+10}`} alt="avatar" className="w-full h-full object-cover" />
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-white bg-indigo-50 flex items-center justify-center text-[10px] font-black text-indigo-600">
                  +12
                </div>
             </div>
             <p className="text-[11px] font-bold text-slate-400">12 other students completed this today</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// --- Premium AI Tutor Component ---

// --- Simple Markdown Processor (Zero Dependency) ---
function SimpleMarkdown({ text }: { text: string }) {
  if (!text) return null;
  const lines = text.split('\n');
  return (
    <div className="space-y-4">
      {lines.map((line, i) => {
        if (line.trim().startsWith('### ')) return <h3 key={i} className="text-lg font-black text-slate-900 mt-6 mb-2">{line.replace('### ', '')}</h3>;
        if (line.trim().startsWith('## ')) return <h2 key={i} className="text-xl font-black text-slate-900 mt-8 mb-3">{line.replace('## ', '')}</h2>;
        if (line.trim().startsWith('- ')) return <li key={i} className="ml-4 text-slate-600 font-semibold list-disc list-outside ml-6">{line.replace('- ', '')}</li>;
        if (line.includes('**')) {
           const parts = line.split('**');
           return <p key={i} className="text-slate-600 font-semibold">{parts.map((p, j) => j % 2 === 1 ? <strong key={j} className="text-indigo-900 font-black">{p}</strong> : p)}</p>;
        }
        return <p key={i} className="text-slate-600 font-semibold leading-relaxed">{line}</p>;
      })}
    </div>
  );
}

function AITutorView({ user }: { user: User }) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Fetch Session History
  useEffect(() => {
    if (!user?.uid) return;
    const q = query(
      collection(db, "chat_history"),
      where("uid", "==", user.uid),
      orderBy("lastActive", "desc"),
      limit(10)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSessions(data);
      
      // Auto-load most recent session if nothing selected
      if (data.length > 0 && !currentSessionId) {
        loadSession(data[0]);
      }
    }, (error) => {
      console.error("Firestore Snapshot Error:", error);
    });

    return unsub;
  }, [user]);

  const loadSession = (session: any) => {
    setCurrentSessionId(session.id);
    setMessages(session.messages || []);
  };

  const startNewSession = () => {
    setCurrentSessionId(null);
    setMessages([]);
    setInput('');
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg = { role: 'user', content: input, timestamp: new Date() };
    const newMessages = [...messages, userMsg];
    
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    try {
      // Call Gemini API
      const apiMessages = newMessages.map(m => ({ 
        role: m.role, 
        text: m.content 
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages })
      });

      const data = await response.json();
      
      if (data.error) throw new Error(data.error);

      const aiMsg = { 
        role: 'model', 
        content: data.text, 
        timestamp: new Date() 
      };
      
      const finalMessages = [...newMessages, aiMsg];
      setMessages(finalMessages);

      // Persist to Firestore
      if (currentSessionId) {
        await updateDoc(doc(db, "chat_history", currentSessionId), {
          messages: finalMessages,
          lastActive: serverTimestamp(),
          title: newMessages[0].content.slice(0, 40) + "..."
        });
      } else {
        const docRef = await addDoc(collection(db, "chat_history"), {
          uid: user.uid,
          studentId: user.studentId || user.email,
          studentName: user.fullName,
          messages: finalMessages,
          lastActive: serverTimestamp(),
          title: newMessages[0].content.slice(0, 40) + "...",
          createdAt: serverTimestamp()
        });
        setCurrentSessionId(docRef.id);
      }
    } catch (e: any) {
      console.error("Chat Error:", e);
      alert("AI Tutor is currently occupied: " + e.message);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] lg:h-[calc(100vh-160px)]">
      {/* Session Header */}
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="bg-white/50 text-indigo-900 border-none font-black tracking-widest text-[10px] py-1 px-4">DAMPELLA LMS</Badge>
          <div className="h-4 w-[1px] bg-slate-200" />
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            {currentSessionId ? 'Ongoing Inquiry' : 'Initiate New Session'} 
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={startNewSession}
            className="px-6 py-2.5 bg-indigo-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-indigo-100"
          >
            New Inquiry
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-8 lg:gap-10 overflow-hidden">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar space-y-8 pb-10">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-40">
                 <div className="w-20 h-20 rounded-[2rem] bg-indigo-50 flex items-center justify-center text-indigo-900">
                    <span className="material-symbols-outlined text-4xl">architecture</span>
                 </div>
                 <div className="space-y-1">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Awaiting Scholarly Inquiry</h3>
                    <p className="text-[11px] font-bold text-slate-400 max-w-xs mx-auto">Deepen your understanding by posing a question to the LMS Mentor.</p>
                 </div>
              </div>
            )}
            {messages.map((msg, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "relative",
                  msg.role === 'user' ? "flex justify-end" : "flex justify-start"
                )}
              >
                {msg.role === 'model' || msg.role === 'tutor' ? (
                  <div className="w-full max-w-3xl bg-white rounded-[2.5rem] p-8 lg:p-12 shadow-sm border border-slate-50 space-y-8">
                     <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                           <div className="w-9 h-9 rounded-xl bg-indigo-900 flex items-center justify-center text-white">
                              <span className="material-symbols-outlined text-[18px]">architecture</span>
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">LMS Tutor</p>
                              <Badge variant="outline" className="mt-1 border-indigo-100 text-indigo-400 text-[8px] font-black tracking-widest">GEMINI ACADEMIC</Badge>
                           </div>
                        </div>
                        <Badge className="bg-emerald-50 text-emerald-600 border-none text-[8px] font-black tracking-widest flex items-center gap-1">
                          <span className="material-symbols-outlined text-[10px] font-variation-fill">verified</span>
                          Standardized Guidance
                        </Badge>
                     </div>

                     <div className="space-y-6">
                        <div className="prose prose-slate max-w-none prose-sm leading-relaxed">
                           <SimpleMarkdown text={msg.content} />
                        </div>
                     </div>
                  </div>
                ) : (
                  <div className="relative group">
                     <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest text-right mb-3 mr-4">Your Inquiry</p>
                     <div className="bg-indigo-900 rounded-[2rem] p-8 lg:p-10 text-white shadow-xl shadow-indigo-100 max-w-xl">
                        <p className="text-[15px] font-bold leading-relaxed tracking-tight">{msg.content}</p>
                     </div>
                     <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-indigo-500 rounded-full border-4 border-white flex items-center justify-center text-white">
                        <span className="material-symbols-outlined text-[12px] font-black">person</span>
                     </div>
                  </div>
                )}
              </motion.div>
            ))}
            {isTyping && (
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="flex items-center gap-4 text-slate-300"
               >
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                    <div className="flex gap-1">
                       {[0, 1, 2].map(i => (
                         <motion.div 
                           key={i}
                           animate={{ scale: [1, 1.5, 1] }}
                           transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                           className="w-1 h-1 rounded-full bg-indigo-400"
                         />
                       ))}
                    </div>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest">Mentor is formulating insights...</p>
               </motion.div>
            )}
          </div>

          {/* Input Area */}
          <div className="pt-6 pb-2">
             <div className="bg-white rounded-[2rem] p-2 pr-4 shadow-xl shadow-slate-100 border border-slate-50 flex items-center gap-4 focus-within:shadow-indigo-100 transition-all">
                <button className="w-12 h-12 rounded-2xl flex items-center justify-center text-slate-300 hover:text-indigo-900 hover:bg-slate-50 transition-all">
                   <span className="material-symbols-outlined">attach_file</span>
                </button>
                <input 
                  type="text"
                  placeholder="Deepen the inquiry..."
                  className="flex-1 bg-transparent border-none outline-none text-[13px] font-bold text-slate-700 placeholder:text-slate-300 ml-2"
                  value={input}
                  disabled={isTyping}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleSendMessage();
                  }}
                />
                <button 
                  disabled={isTyping}
                  className="w-12 h-12 bg-indigo-900 rounded-2xl flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
                  onClick={handleSendMessage}
                >
                   <span className="material-symbols-outlined text-[20px]">{isTyping ? 'hourglass_bottom' : 'arrow_upward'}</span>
                </button>
             </div>
             <div className="flex items-center justify-between px-6 mt-4">
                <p className="text-[9px] font-black text-slate-200 uppercase tracking-widest">LMS Engine v2.5 Active</p>
                <div className="flex items-center gap-4">
                   <button className="flex items-center gap-2 text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] hover:text-indigo-900 transition-all">
                      <span className="material-symbols-outlined text-[14px]">mic</span> Voice
                   </button>
                   <button className="flex items-center gap-2 text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] hover:text-indigo-900 transition-all">
                      <span className="material-symbols-outlined text-[14px]">language</span> Language
                   </button>
                </div>
             </div>
          </div>
        </div>

        {/* Right Sidecar - Insights */}
        <div className="w-[320px] hidden xl:flex flex-col gap-8 overflow-y-auto pr-2 custom-scrollbar">
           
           {/* Active Goals */}
           <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Academic Mastery</h3>
                <span className="text-[10px] font-black text-indigo-400 tracking-tighter">Live</span>
              </div>
              <div className="space-y-6">
                 {[
                   { label: 'Conceptual Depth', progress: messages.length * 20 > 100 ? 100 : messages.length * 20 },
                   { label: 'Analytical Criticality', progress: messages.length > 3 ? 90 : 40 }
                 ].map((goal, i) => (
                   <div key={i} className="space-y-2">
                      <div className="flex items-center justify-between">
                         <p className="text-[11px] font-bold text-slate-500">{goal.label}</p>
                         <p className="text-[10px] font-black text-indigo-900">{goal.progress}%</p>
                      </div>
                      <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${goal.progress}%` }}
                           className="h-full bg-indigo-900 rounded-full"
                         />
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           {/* Inquiry History */}
           <div className="flex-1 space-y-4 min-h-0">
              <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Inquiry History</h3>
              <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
                 {sessions.map((sess, i) => (
                   <div 
                     key={sess.id} 
                     onClick={() => loadSession(sess)}
                     className={cn(
                       "p-4 rounded-2xl transition-all cursor-pointer group border",
                       currentSessionId === sess.id 
                         ? "bg-indigo-50 border-indigo-100" 
                         : "hover:bg-white hover:shadow-sm border-transparent hover:border-slate-100"
                     )}
                   >
                      <h4 className="text-[12px] font-black text-slate-900 leading-tight group-hover:text-indigo-900 line-clamp-2">{sess.title || 'Untitled Session'}</h4>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                        {sess.lastActive?.toDate?.() ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(sess.lastActive.toDate()) : 'Active Now'}
                         • {sess.messages?.length || 0} stages
                      </p>
                   </div>
                 ))}
                 {sessions.length === 0 && (
                   <p className="text-[10px] font-bold text-slate-300 italic text-center py-10 uppercase tracking-widest">No previous inquiries</p>
                 )}
              </div>
           </div>

           {/* Quick Reference Quote */}
           <div className="bg-indigo-950 rounded-[1.5rem] p-6 text-white space-y-4 shadow-xl shadow-indigo-900/10">
              <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Quick Reference</p>
              <p className="text-[12px] font-bold italic leading-relaxed text-indigo-100">
                "The limit of my language means the limit of my world."
              </p>
              <button className="w-full py-2.5 bg-indigo-800 hover:bg-indigo-700 text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all">
                Save Excerpt
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}

// --- Detailed Performance Review Component ---

function QuizPerformanceReview({ quiz, answers, data, onBack, onExit }: { 
  quiz: any, 
  answers: Record<number, number>, 
  data: any, 
  onBack: () => void,
  onExit: () => void 
}) {
  const [globalAverage, setGlobalAverage] = useState(74); // Fallback
  const questions = quiz?.questions || quiz?.mcqs || [];

  useEffect(() => {
    // Fetch global average for this quiz
    const q = query(
      collection(db, "quiz_submissions"),
      where("quizId", "==", quiz.id)
    );
    getDocs(q).then(snapshot => {
      if (!snapshot.empty) {
        const scores = snapshot.docs.map(doc => doc.data().percentage || 0);
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        setGlobalAverage(Math.round(avg));
      }
    });
  }, [quiz.id]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed inset-0 bg-[#f8f9fc] z-[100] flex flex-col overflow-y-auto custom-scrollbar"
    >
      {/* Top Navigation Bar */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between z-50">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-xl transition-all">
            <span className="material-symbols-outlined text-slate-400">arrow_back</span>
          </button>
          <div>
            <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-widest">{quiz.title}</h2>
            <p className="text-[10px] font-bold text-slate-400">Reviewing Attempt Results</p>
          </div>
        </div>
        <button 
          onClick={onExit}
          className="px-6 py-2 bg-indigo-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
        >
          Exit Review
        </button>
      </div>

      <div className="max-w-6xl mx-auto w-full p-6 lg:p-10 space-y-10">
        
        {/* Hero Section & Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          
          <div className="lg:col-span-8">
            <div className="bg-indigo-950 rounded-[2.5rem] p-10 lg:p-14 text-white relative overflow-hidden shadow-2xl shadow-indigo-900/20">
               <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 to-transparent pointer-events-none" />
               <div className="relative z-10 space-y-8">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] font-sans">Review Session</p>
                    <h1 className="text-4xl lg:text-5xl font-black tracking-tighter leading-tight max-w-2xl">{quiz.title}</h1>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-10 lg:gap-16 pt-6 border-t border-white/10">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest font-sans">Final Score</p>
                      <div className="text-3xl font-black tracking-tight">{data.score}/{data.total}</div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest font-sans">Time Invested</p>
                      <div className="text-3xl font-black tracking-tight">{data.timeSpent}</div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest font-sans">Proficiency</p>
                      <div className="text-3xl font-black tracking-tight text-emerald-400 uppercase">{data.percentage >= 80 ? 'Mastery' : 'Advancing'}</div>
                    </div>
                  </div>
               </div>
            </div>
          </div>

          <div className="lg:col-span-4 lg:pt-6">
             <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm space-y-8">
                <div className="space-y-2">
                  <h3 className="text-[13px] font-black text-slate-900 tracking-tight">Performance Insights</h3>
                  <p className="text-[12px] font-semibold text-slate-400 leading-relaxed">
                    Your understanding of "{quiz.subject}" is exceptional. Focus on consistency to maintain this proficiency level.
                  </p>
                </div>
                
                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                     <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest font-sans">Global Average</p>
                     <p className="text-[12px] font-black text-indigo-600">{globalAverage}%</p>
                   </div>
                   <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${globalAverage}%` }}
                        className="h-full bg-indigo-500 rounded-full"
                      />
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Question Breakdown */}
        <div className="space-y-10">
           <div className="flex items-center justify-between border-b border-slate-200 pb-6">
              <h3 className="text-[18px] font-black text-slate-900 tracking-tight">Question Breakdown</h3>
              <div className="flex items-center gap-3">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filter:</span>
                 <button className="px-4 py-1.5 bg-slate-100 text-[10px] font-black text-indigo-900 rounded-full uppercase tracking-widest">All</button>
              </div>
           </div>

           <div className="space-y-8 pb-20">
              {questions.map((q: any, idx: number) => {
                const studentAnswer = answers[idx];
                const isCorrect = studentAnswer === q.correct_option_index;
                const options = q.options || [];

                return (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-white rounded-[2.5rem] p-8 lg:p-12 shadow-sm border border-slate-100 space-y-8"
                  >
                     <div className="flex flex-col lg:flex-row lg:items-start gap-6 lg:justify-between">
                        <div className="space-y-4 flex-1">
                           <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center relative",
                                isCorrect ? "bg-emerald-50 text-emerald-500" : "bg-rose-50 text-rose-500"
                              )}>
                                 <span className="material-symbols-outlined font-variation-fill">
                                   {isCorrect ? 'check_circle' : 'cancel'}
                                 </span>
                              </div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-sans">Question {String(idx + 1).padStart(2, '0')}</p>
                           </div>
                           <h4 className="text-[16px] lg:text-[18px] font-extrabold text-slate-900 leading-snug">
                             {q.question || q.text}
                           </h4>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {options.map((opt: string, optIdx: number) => {
                          const isOptCorrect = optIdx === q.correct_option_index;
                          const isStudentChoice = optIdx === studentAnswer;
                          
                          let cardState = "border-slate-100 bg-slate-50/50 text-slate-500";
                          if (isOptCorrect) {
                            cardState = "border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-900/5";
                          } else if (isStudentChoice && !isCorrect) {
                            cardState = "border-rose-200 bg-rose-50 text-rose-700 shadow-sm shadow-rose-900/5";
                          }

                          return (
                            <div 
                              key={optIdx}
                              className={cn(
                                "p-6 rounded-2xl border-2 flex items-center justify-between transition-all group relative overflow-hidden",
                                cardState
                              )}
                            >
                               <div className="flex items-center gap-4 relative z-10">
                                  <div className={cn(
                                    "w-3 h-3 rounded-full border-2",
                                    isOptCorrect ? "bg-emerald-500 border-emerald-500" : (isStudentChoice ? "bg-rose-500 border-rose-500" : "border-slate-300")
                                  )} />
                                  <p className="text-[13px] font-bold">{opt}</p>
                               </div>
                               {isStudentChoice && (
                                 <span className="text-[8px] font-black uppercase tracking-widest mr-2 relative z-10 px-2 py-0.5 bg-white/50 rounded-full border border-current">Your Choice</span>
                               )}
                            </div>
                          );
                        })}
                     </div>

                     {(q.explanation || q.context) && (
                       <div className="bg-slate-50/80 rounded-[1.5rem] p-6 lg:p-8 space-y-4">
                          <div className="flex items-center gap-3">
                             <span className="material-symbols-outlined text-indigo-400 text-xl font-variation-fill">menu_book</span>
                             <p className="text-[10px] font-black text-indigo-900 uppercase tracking-widest font-sans">Pedagogical Context</p>
                          </div>
                          <p className="text-[13px] font-semibold text-slate-600 leading-relaxed">
                            {q.explanation || q.context}
                          </p>
                       </div>
                     )}
                  </motion.div>
                );
              })}
           </div>
        </div>
      </div>
    </motion.div>
  );
}

// --- Student Grades View Component ---
function StudentGradesView({ academicRecords, quizRecords }: { academicRecords: any[], quizRecords: any[] }) {
  const gpa = academicRecords.length > 0 
    ? (academicRecords.reduce((acc, r) => acc + (parseFloat(r.mark) || 0), 0) / academicRecords.length).toFixed(2)
    : '0.00';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10"
    >
      {/* Performance Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-2">
          <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 leading-none">Academic Transcript</h2>
          <p className="text-[13px] font-semibold text-slate-500">Official marks and assessment results verified by faculty.</p>
        </div>
        <div className="flex items-center gap-6">
           <div className="text-right">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">Aggregated GPA</p>
              <p className="text-3xl font-black text-indigo-900 mt-2">{gpa}</p>
           </div>
           <div className="w-14 h-14 rounded-[1.5rem] bg-indigo-900 text-white flex items-center justify-center shadow-lg shadow-indigo-100">
              <span className="material-symbols-outlined text-2xl">workspace_premium</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        {/* Official Marks List */}
        <div className="xl:col-span-8 space-y-8">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400">
                <span className="material-symbols-outlined">description</span>
             </div>
             <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Faculty Submissions</h3>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-white shadow-sm overflow-hidden">
             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-500">
                         <th className="px-8 py-5">Subject</th>
                         <th className="px-8 py-5">Term</th>
                         <th className="px-8 py-5 text-center">Score</th>
                         <th className="px-8 py-5 text-right">Date</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {academicRecords.length === 0 ? (
                        <tr>
                           <td colSpan={4} className="px-8 py-20 text-center">
                              <div className="space-y-3">
                                 <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 mx-auto">
                                    <span className="material-symbols-outlined text-3xl">inbox</span>
                                 </div>
                                 <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest leading-none">No official marks published yet</p>
                              </div>
                           </td>
                        </tr>
                      ) : academicRecords.map((record) => (
                        <tr key={record.id} className="group hover:bg-slate-50/50 transition-colors">
                           <td className="px-8 py-6">
                              <div className="space-y-1">
                                 <p className="text-[14px] font-extrabold text-slate-900">{record.subject}</p>
                                 <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">{record.teacherName || 'Faculty Member'}</p>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <Badge variant="outline" className="text-[8px] font-black tracking-widest border-indigo-100 text-indigo-400 uppercase">
                                 {record.assessment || 'General'}
                              </Badge>
                           </td>
                           <td className="px-8 py-6 text-center">
                              <p className="text-2xl font-black text-indigo-600">{record.mark}</p>
                              {record.comment && <p className="text-[10px] font-bold text-slate-400 mt-1 italic">"{record.comment}"</p>}
                           </td>
                           <td className="px-8 py-6 text-right">
                              <span className="text-[11px] font-extrabold text-slate-400 uppercase">
                                 {record.updatedAt?.toDate ? new Date(record.updatedAt.toDate()).toLocaleDateString() : 'Pending'}
                              </span>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        </div>

        {/* Quiz History Sidebar */}
        <div className="xl:col-span-4 space-y-8">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400">
                <span className="material-symbols-outlined">analytics</span>
             </div>
             <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Lab Sessions</h3>
          </div>

          <div className="space-y-4">
             {quizRecords.slice(0, 10).map((quiz) => (
               <div key={quiz.id} className="bg-white p-6 rounded-[2rem] border border-white shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
                  <div className="space-y-1.5">
                     <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{quiz.subject}</p>
                     <p className="text-[14px] font-extrabold text-slate-900 leading-tight group-hover:text-indigo-900 transition-colors line-clamp-1">{quiz.quizTitle}</p>
                  </div>
                  <div className="text-right">
                     <p className="text-[18px] font-black text-primary leading-none">{Math.round(quiz.percentage)}%</p>
                     <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1">{quiz.timeSpent}</p>
                  </div>
               </div>
             ))}
             {quizRecords.length === 0 && (
               <div className="py-12 bg-white rounded-[2rem] border border-dashed border-slate-100 text-center">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No lab results found</p>
               </div>
             )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// --- Student Settings View Component ---
function StudentSettingsView({ user }: { user: any }) {
  const { updateProfile, updatePassword } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('Profile');
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Profile State
  const [fullName, setFullName] = useState(user.fullName || '');
  const [whatsapp, setWhatsapp] = useState(user.whatsappNumber || '');
  
  // Security State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    const success = await updateProfile({
      fullName,
      whatsappNumber: whatsapp
    });
    setIsUpdating(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return alert("Passwords do not match");
    }
    if (newPassword.length < 6) {
      return alert("Password must be at least 6 characters");
    }
    setIsUpdating(true);
    const success = await updatePassword(user.email, newPassword);
    if (success) {
      setNewPassword('');
      setConfirmPassword('');
    }
    setIsUpdating(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl space-y-10"
    >
      <div className="space-y-2">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 leading-none">Settings</h2>
        <p className="text-[13px] font-semibold text-slate-500">Manage your profile, security, and preferences.</p>
      </div>

      <div className="flex items-center gap-2 p-1 bg-slate-100/50 rounded-2xl w-fit">
        {['Profile', 'Security'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={cn(
              "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              activeSubTab === tab ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeSubTab === 'Profile' && (
        <form onSubmit={handleUpdateProfile} className="bg-white rounded-[2.5rem] border border-white shadow-sm p-8 lg:p-12 space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Full Name</label>
                 <input 
                   type="text" 
                   value={fullName}
                   onChange={(e) => setFullName(e.target.value)}
                   className="w-full h-14 px-6 bg-slate-50 border-none rounded-2xl text-[13px] font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                 />
              </div>
              <div className="space-y-3">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">WhatsApp Number</label>
                 <input 
                   type="text" 
                   value={user.whatsappNumber || 'Not Provided'}
                   disabled
                   className="w-full h-14 px-6 bg-slate-50 border-none rounded-2xl text-[13px] font-bold text-slate-300 outline-none cursor-not-allowed"
                 />
                 <p className="text-[9px] font-bold text-slate-400 ml-1 italic">* Contact faculty to change your number. <a href="https://wa.me/94771234567" target="_blank" className="text-primary hover:underline ml-1">Request Change</a></p>
              </div>
              <div className="space-y-3">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Grade Class</label>
                 <input 
                   type="text" 
                   value={user.gradeClass || 'Grade 10'} 
                   disabled
                   className="w-full h-14 px-6 bg-slate-50 border-none rounded-2xl text-[13px] font-bold text-slate-300 outline-none cursor-not-allowed"
                 />
                 <p className="text-[9px] font-bold text-slate-400 ml-1 italic">* Contact faculty to change your grade.</p>
              </div>
              <div className="space-y-3">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Student ID</label>
                 <input 
                   type="text" 
                   value={user.studentId || 'D-0001'} 
                   disabled
                   className="w-full h-14 px-6 bg-slate-50 border-none rounded-2xl text-[13px] font-bold text-slate-300 outline-none cursor-not-allowed"
                 />
              </div>
           </div>
           
           <div className="pt-4">
              <button 
                type="submit"
                disabled={isUpdating}
                className="px-10 py-4 bg-primary text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isUpdating ? 'Saving...' : 'Update Profile'}
              </button>
           </div>
        </form>
      )}

      {activeSubTab === 'Security' && (
        <form onSubmit={handleUpdatePassword} className="bg-white rounded-[2.5rem] border border-white shadow-sm p-8 lg:p-12 space-y-8">
           <div className="max-w-md space-y-8">
              <div className="space-y-3">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">New Password</label>
                 <input 
                   type="password" 
                   value={newPassword}
                   onChange={(e) => setNewPassword(e.target.value)}
                   className="w-full h-14 px-6 bg-slate-50 border-none rounded-2xl text-[13px] font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                   placeholder="Enter new password"
                 />
              </div>
              <div className="space-y-3">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Confirm Password</label>
                 <input 
                   type="password" 
                   value={confirmPassword}
                   onChange={(e) => setConfirmPassword(e.target.value)}
                   className="w-full h-14 px-6 bg-slate-50 border-none rounded-2xl text-[13px] font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                   placeholder="Verify new password"
                 />
              </div>
           </div>
           
           <div className="pt-4">
              <button 
                type="submit"
                disabled={isUpdating}
                className="px-10 py-4 bg-primary text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isUpdating ? 'Updating...' : 'Change Password'}
              </button>
           </div>
        </form>
      )}
    </motion.div>
  );
}

// --- Student Notifications View Component ---
function StudentNotificationsView({ notifications }: { notifications: any[] }) {
  const handleMarkAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, "notifications", id), { isRead: true });
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl space-y-8"
    >
      <div className="space-y-1">
         <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">Center of Alerts</h2>
         <p className="text-sm font-medium text-slate-400">Stay updated with your academic journey and LMS events.</p>
      </div>

      <div className="space-y-4">
         {notifications.length > 0 ? notifications.map((note) => (
           <div key={note.id} className={cn(
             "bg-white p-6 rounded-[2rem] border transition-all flex items-start gap-6 group",
             note.isRead ? "border-white opacity-80" : "border-indigo-100 shadow-sm shadow-indigo-100/50"
           )}>
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all",
                note.isRead ? "bg-slate-50 text-slate-400" : "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-900 group-hover:text-white"
              )}>
                 <span className="material-symbols-outlined text-[22px]">{note.icon || 'notifications'}</span>
              </div>
              <div className="flex-1 space-y-1">
                 <div className="flex items-center justify-between">
                    <h4 className="text-[15px] font-extrabold text-slate-900">{note.title}</h4>
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                      {note.createdAt?.toDate ? note.createdAt.toDate().toLocaleDateString() : 'Just now'}
                    </span>
                 </div>
                 <p className="text-[13px] font-medium text-slate-500 leading-relaxed max-w-2xl">{note.message || note.desc}</p>
                 {!note.isRead && (
                    <button 
                      onClick={() => handleMarkAsRead(note.id)}
                      className="text-[10px] font-black text-indigo-400 uppercase tracking-widest pt-2 hover:text-indigo-600 transition-colors"
                    >
                      Mark as Read
                    </button>
                 )}
              </div>
           </div>
         )) : (
           <div className="bg-white/50 border border-dashed border-slate-200 rounded-[2.5rem] p-12 text-center">
              <p className="text-slate-400 text-xs font-bold font-sans">You're all caught up! No new alerts.</p>
           </div>
         )}
      </div>
    </motion.div>
  );
}

// --- Student Past Papers View Component ---
function StudentPastPapersView({ papers }: { papers: any[] }) {

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl space-y-8"
    >
      <div className="space-y-1">
         <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">Past Paper Library</h2>
         <p className="text-sm font-medium text-slate-400">Access exclusive past papers, model papers, and comprehensive marking schemes.</p>
      </div>

      {papers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {papers.map((paper, i) => (
             <div key={i} className="bg-white p-6 rounded-[2rem] border border-white shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-bl-[100px] -mr-10 -mt-10 group-hover:scale-110 transition-transform pointer-events-none" />
                <div className="relative z-10 flex items-start gap-5">
                   <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                      <span className="material-symbols-outlined text-[24px]">menu_book</span>
                   </div>
                   <div className="space-y-2">
                      <div className="space-y-1">
                         <h4 className="text-[14px] font-extrabold text-slate-900 leading-tight pr-4">{paper.title}</h4>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{paper.subject} • {paper.year}</p>
                      </div>
                      <div className="flex items-center gap-2 pt-2">
                         <span className="px-2.5 py-1 bg-slate-50 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-widest">{paper.type}</span>
                         <button 
                           onClick={() => window.open(paper.url, '_blank')}
                           className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all ml-auto"
                         >
                           Open PDF
                         </button>
                      </div>
                   </div>
                </div>
             </div>
           ))}
        </div>
      ) : (
        <div className="bg-white/50 border border-dashed border-slate-200 rounded-[2.5rem] p-12 text-center space-y-4">
           <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center text-slate-200 mx-auto">
              <span className="material-symbols-outlined text-3xl">auto_stories</span>
           </div>
           <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-slate-900">No Papers Available</h4>
              <p className="text-[12px] font-medium text-slate-400 max-w-md mx-auto">The faculty hasn't uploaded any past papers yet. Check back later or request one below.</p>
           </div>
        </div>
      )}
      
      <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 rounded-[2.5rem] p-8 text-white flex items-center gap-6 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
         <div className="w-16 h-16 rounded-3xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
            <span className="material-symbols-outlined text-3xl">upload_file</span>
         </div>
         <div>
            <h3 className="text-lg font-extrabold">Need a specific paper?</h3>
            <p className="text-indigo-200 text-sm mt-1 mb-4 max-w-md">Our library is continually expanding. If you're looking for a specific regional or national past paper, send a request to the faculty.</p>
            <button className="px-6 py-2 bg-white text-indigo-950 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-50 transition-all">Request Paper</button>
         </div>
      </div>
    </motion.div>
  );
}

export function StudentDashboard({ user, onLogout, onBackToWebsite }: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Add dynamic time greeting
  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };
  const greeting = getTimeGreeting();
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ gpa: 0, attendance: 0 });
  const [activeAssignments, setActiveAssignments] = useState<any[]>([]);
  const [academicRecords, setAcademicRecords] = useState<any[]>([]);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [availableQuizzes, setAvailableQuizzes] = useState<any[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
  const [mySubmissions, setMySubmissions] = useState<any[]>([]);
  const [loadedSubmission, setLoadedSubmission] = useState<any>(null);
  const [pastPapers, setPastPapers] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  const availableQuizCount = availableQuizzes.filter(quiz => 
    !mySubmissions.some((s: any) => s.quizId === quiz.id)
  ).length;

  const navItems = [
    { name: 'Dashboard', icon: 'dashboard', id: 'Dashboard' },
    { name: 'Assignments', icon: 'assignment', id: 'Assignments', badge: activeAssignments.length },
    { name: 'Video Library', icon: 'smart_display', id: 'Videos' },
    { name: 'Quizzes', icon: 'quiz', id: 'Quizzes' },
    { name: 'Quiz Lab', icon: 'biotech', id: 'Lab', badge: availableQuizCount },
    { name: 'AI Tutor', icon: 'smart_toy', id: 'Tutor' },
    { name: 'Past Papers', icon: 'menu_book', id: 'PastPapers' },
    { name: 'Notifications', icon: 'notifications', id: 'Notifications', badge: notifications.filter(n => !n.isRead).length },
    { name: 'Settings', icon: 'settings', id: 'Settings' },
  ];

  // Fetch Real Data from Firebase
  useEffect(() => {
    if (!user) return;

    // Fetch student's own quiz submissions
    const submissionsQuery = query(
      collection(db, "quiz_submissions"),
      where("studentEmail", "==", user.email.toLowerCase())
    );

    const unsubSubmissions = onSnapshot(submissionsQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMySubmissions(data);
    });

    // Fetch Assignments based on Grade Class
    const assignmentsQuery = query(
      collection(db, "assignments"),
      where("grade", "==", user.gradeClass || user.grade || "Grade 10")
    );

    const unsubAssignments = onSnapshot(assignmentsQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setActiveAssignments(data);
      setIsLoading(false);
    });

    // Fetch Official Marks from Teacher Portals
    const marksQuery = query(
      collection(db, "manual_grades"),
      where("studentId", "==", user.uid)
    );

    const unsubMarks = onSnapshot(marksQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAcademicRecords(data);
    });

    // Fetch Student Stats from Profile
    const unsubProfile = onSnapshot(doc(db, "profiles", user.studentId || "0001"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setStats({
          gpa: data.gpa || 0,
          attendance: data.attendance || 0
        });
      }
    });

    // Fetch available Quizzes
    const quizzesQuery = query(
      collection(db, "quizzes"),
      limit(20)
    );

    const unsubQuizzes = onSnapshot(quizzesQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAvailableQuizzes(data);
    });

    // Fetch Past Papers
    const papersQuery = query(collection(db, "past_papers"), orderBy("publishedAt", "desc"));
    const unsubPapers = onSnapshot(papersQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPastPapers(data);
    });

    // Fetch Notifications
    const notificationsQuery = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(30)
    );
    const unsubNotifications = onSnapshot(notificationsQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotifications(data);
    });

    return () => {
      unsubSubmissions();
      unsubAssignments();
      unsubMarks();
      unsubProfile();
      unsubQuizzes();
      unsubPapers();
      unsubNotifications();
    };
  }, [user]);

  if (isQuizActive && selectedQuiz) {
    return (
      <StudentQuizView 
        quiz={selectedQuiz} 
        user={user} 
        onExit={() => setIsQuizActive(false)}
        initialViewMode={loadedSubmission ? 'REVIEW' : 'QUIZ'}
        initialAnswers={loadedSubmission?.answers || {}}
        initialResultData={loadedSubmission ? {
          score: loadedSubmission.score,
          total: loadedSubmission.totalQuestions,
          percentage: loadedSubmission.percentage,
          timeSpent: loadedSubmission.timeSpent
        } : null}
      />
    );
  }

  return (
    <div className="flex h-screen bg-[#f8f9fc] font-sans selection:bg-primary/10 overflow-hidden portal-theme flex-col lg:flex-row relative">
      
      {/* Mobile Toolbar */}
      <div className="lg:hidden h-16 bg-white border-b border-slate-100 px-6 flex items-center justify-between shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-900 flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-xl">architecture</span>
          </div>
          <span className="font-extrabold text-sm tracking-tight text-slate-900 leading-none">Dampella LMS</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-primary transition-all active:scale-95"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[60]"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <motion.aside 
        initial={false}
        animate={{ 
          x: typeof window !== 'undefined' && window.innerWidth < 1024 
            ? (isSidebarOpen ? 0 : -260) 
            : 0 
        }}
        className={cn(
          "bg-primary text-white border-r border-white/5 flex flex-col shrink-0 transition-transform lg:transition-none duration-300 ease-in-out",
          "fixed inset-y-0 left-0 w-64 z-[70] lg:static lg:w-64 lg:translate-x-0 overflow-y-auto custom-scrollbar shadow-2xl shadow-primary/20"
        )}
      >
        {/* Sidebar Close Button */}
        <div className="lg:hidden absolute top-4 right-4">
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white transition-all"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Logo Section */}
        <div className="p-8 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/10 shadow-lg">
              <span className="material-symbols-outlined text-xl">architecture</span>
            </div>
            <div>
              <h1 className="font-extrabold text-sm tracking-tight text-white leading-none">Dampella</h1>
              <p className="text-[8px] font-black text-indigo-300 uppercase tracking-widest mt-1 font-jakarta">Zenith Edition</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1.5 mt-6">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (window.innerWidth < 1024) setIsSidebarOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative",
                activeTab === item.id 
                  ? "bg-white/10 text-white shadow-inner" 
                  : "text-white/40 hover:text-white hover:bg-white/5"
              )}
            >
              <span className={cn(
                "material-symbols-outlined text-[20px] transition-colors",
                activeTab === item.id ? "text-indigo-400 font-variation-fill" : "text-white/20 group-hover:text-white/40"
              )}>
                {item.icon}
              </span>
              <span className="text-[11px] font-black uppercase tracking-widest text-inherit font-jakarta flex-1 text-left">{item.name}</span>
              {item.badge > 0 && (
                <span className="bg-orange-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-lg min-w-[18px] text-center shadow-lg shadow-orange-950/20">
                  {item.badge}
                </span>
              )}
              {activeTab === item.id && (
                <motion.div 
                  layoutId="active-nav-indicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]"
                />
              )}
            </button>
          ))}
        </nav>

        {/* Global Support Action */}
        <div className="px-5 mt-4">
           <button className="w-full h-12 bg-white text-primary rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-black/10 hover:scale-[1.02] transition-all group overflow-hidden">
              <span className="material-symbols-outlined text-[20px] font-black">support_agent</span>
              <span className="text-[11px] font-black uppercase tracking-widest">Support</span>
           </button>
        </div>

        {/* Support Card in Sidebar */}
        <div className="px-5 mb-6">
           <div className="bg-indigo-900 rounded-3xl p-5 text-white space-y-3 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform" />
              <p className="text-[9px] font-black uppercase tracking-widest text-indigo-300">Explore Resources</p>
              <h4 className="text-[13px] font-bold leading-tight">Past Paper <br />Library</h4>
              <button onClick={() => setActiveTab('PastPapers')} className="text-[10px] font-black uppercase tracking-widest bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-all">Access Now</button>
           </div>
        </div>

        {/* Bottom Actions */}
        <div className="px-4 py-6 border-t border-white/5 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all group">
            <span className="material-symbols-outlined text-[20px] text-white/20 group-hover:text-white/40">help</span>
            <span className="text-[11px] font-black uppercase tracking-widest">Help</span>
          </button>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/30 hover:text-error hover:bg-error/10 transition-all group border border-transparent"
          >
            <span className="material-symbols-outlined text-[20px] text-white/20 group-hover:text-error/60">logout</span>
            <span className="text-[11px] font-black uppercase tracking-widest">Logout</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar relative">
        
        {/* FAB */}
        <button className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-indigo-900 text-white shadow-2xl shadow-indigo-900/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50">
           <span className="material-symbols-outlined text-2xl font-bold">add</span>
        </button>

        {/* Header */}
        <header className="px-4 lg:px-10 py-4 lg:py-6 bg-white/50 backdrop-blur-md lg:static top-0 z-40 flex items-center justify-between border-b border-slate-100/50">
          <div className="flex-1 max-w-xs md:max-w-md relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors text-lg">search</span>
            <input 
              type="text" 
              placeholder="Search courses, files, grades..."
              className="w-full h-10 lg:h-11 pl-12 pr-4 bg-white rounded-2xl text-[12px] lg:text-[13px] font-semibold text-slate-600 placeholder:text-slate-300 outline-none border border-transparent focus:border-indigo-100 transition-all shadow-sm"
            />
          </div>

          <div className="flex items-center gap-4 lg:gap-6 ml-4">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setActiveTab('Notifications')}
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all relative",
                  activeTab === 'Notifications' ? "bg-indigo-900 text-white shadow-lg" : "bg-white text-slate-400 hover:text-indigo-700"
                )}
              >
                <span className="material-symbols-outlined text-[22px]">notifications</span>
                {notifications.some(n => !n.isRead) && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-emerald-400 border-2 border-white animate-pulse" />
                )}
              </button>
              <button 
                onClick={() => setActiveTab('Settings')}
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                  activeTab === 'Settings' ? "bg-indigo-900 text-white shadow-lg" : "bg-white text-slate-400 hover:text-indigo-700"
                )}
              >
                <span className="material-symbols-outlined text-[22px]">settings</span>
              </button>
            </div>

            <div 
              onClick={() => setActiveTab('Settings')}
              className="flex items-center gap-3 pl-2 border-l border-slate-100 cursor-pointer group hover:bg-slate-50/50 p-2 rounded-2xl transition-all"
            >
              <div className="text-right hidden sm:block">
                <p className="text-[12px] lg:text-[13px] font-extrabold text-slate-900 leading-none group-hover:text-indigo-900 transition-colors">{user.fullName || 'Student'}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{user.gradeClass || user.grade || 'Junior Sophomore'}</p>
              </div>
              <div className="w-9 h-9 lg:w-11 lg:h-11 rounded-xl bg-indigo-50 overflow-hidden border-2 border-white shadow-sm group-hover:border-indigo-100 transition-all">
                 {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      className="w-full h-full object-cover" 
                      alt="Profile" 
                    />
                 ) : (
                    <div className={cn("w-full h-full flex items-center justify-center text-white font-black text-sm lg:text-base", getNameColor(user.fullName || 'Student'))}>
                       {getInitials(user.fullName || 'Student')}
                    </div>
                 )}
              </div>
            </div>
          </div>
        </header>

        <main className="p-6 lg:p-10 space-y-8 lg:space-y-10 max-w-[1400px]">
           
          {activeTab === 'Dashboard' && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-10">
              
              {/* Left/Middle Column */}
              <div className="xl:col-span-8 space-y-8 lg:space-y-10">
                 
                  {/* Welcome Hero */}
                  <section className="bg-primary rounded-[2rem] lg:rounded-[3rem] p-6 lg:p-12 text-white relative overflow-hidden group shadow-2xl shadow-primary/20 border border-white/5">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-40 -mt-40 blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-700" />
                    <div className="relative z-10 space-y-8">
                       <div className="space-y-3">
                          <h2 className="text-4xl lg:text-5xl font-black tracking-tighter font-jakarta">{greeting}, {user?.fullName?.split(' ')[0] || 'Student'}.</h2>
                          <p className="text-indigo-200/80 text-[14px] lg:text-[16px] font-bold max-w-sm uppercase tracking-wide">
                             You have <span className="text-white font-black">{activeAssignments.length} assignments</span> due this week.
                          </p>
                       </div>
                       <div className="flex flex-wrap items-center gap-4">
                          <button 
                            onClick={() => setActiveTab('Assignments')}
                            className="px-8 py-3.5 bg-emerald-400 hover:bg-emerald-500 text-indigo-950 text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-emerald-400/20 active:scale-95"
                          >
                            View Assignments
                          </button>
                          <button 
                            onClick={() => setActiveTab('Lab')}
                            className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all border border-white/5 active:scale-95"
                          >
                            Enter Quiz Lab
                          </button>
                       </div>
                    </div>
                  </section>

                 {/* Active Assignments */}
                 <section className="space-y-6">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary border border-primary/10">
                            <span className="material-symbols-outlined text-[20px] font-black">assignment_turned_in</span>
                          </div>
                          <h3 className="text-xl font-black text-slate-900 tracking-tight font-jakarta uppercase tracking-wider">Mission Objectives</h3>
                       </div>
                       <button 
                        onClick={() => setActiveTab('Assignments')}
                        className="text-[11px] font-black uppercase tracking-widest text-indigo-600 hover:underline"
                       >
                         View All
                       </button>
                    </div>

                    <div className="space-y-4">
                       {activeAssignments.length > 0 ? activeAssignments.slice(0, 3).map((task, i) => (
                         <div key={i} className="bg-white p-6 rounded-[2rem] flex items-center justify-between shadow-sm hover:shadow-zenith transition-all border border-slate-200/60 group">
                            <div className="flex items-center gap-6 text-left">
                               <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-slate-50 text-slate-400 group-hover:bg-primary group-hover:text-white transition-all border border-slate-100")}>
                                  <span className="material-symbols-outlined text-2xl">{task.icon || 'menu_book'}</span>
                               </div>
                               <div>
                                  <div className="flex items-center gap-2">
                                     <h4 className="text-[15px] font-black text-slate-900 font-jakarta group-hover:text-primary transition-colors">{task.title || task.name}</h4>
                                      {task.attachmentUrl && (
                                        <span className="material-symbols-outlined text-[14px] text-indigo-400 font-variation-fill">attachment</span>
                                      )}
                                   </div>
                                  <p className="text-[12px] font-semibold text-slate-400 mt-0.5 max-w-xs">{task.description || task.desc || task.instructions}</p>
                               </div>
                            </div>
                            <div className="flex items-center gap-10 text-right">
                               <div className="hidden sm:block text-right pr-4">
                                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none">Due Date</p>
                                  <p className="text-[12px] font-extrabold text-slate-600 mt-1">{task.due_date || task.dueDate || task.due || 'No date'}</p>
                                </div>
                               <div className="hidden md:block">
                                  <p className="text-[11px] font-extrabold text-indigo-400">{task.status || 'Active'}</p>
                               </div>
                               <button onClick={() => setActiveTab('Assignments')} className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 hover:bg-indigo-900 hover:text-white transition-all">
                                  <span className="material-symbols-outlined">chevron_right</span>
                                </button>
                            </div>
                         </div>
                       )) : (
                         <div className="bg-white/50 border border-dashed border-slate-200 rounded-[2.5rem] p-12 text-center space-y-4">
                            <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center text-slate-200 mx-auto">
                               <span className="material-symbols-outlined text-3xl">task</span>
                            </div>
                            <div className="space-y-1">
                               <h4 className="text-sm font-extrabold text-slate-900">Zero Pending Assignments</h4>
                               <p className="text-[12px] font-medium text-slate-400">You're all caught up! Enjoy your free time.</p>
                            </div>
                         </div>
                       )}
                    </div>
                 </section>

                 {/* Learning Tools */}
                 <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-indigo-300 text-xl">extension</span>
                        <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Learning Tools</h3>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div onClick={() => setActiveTab('Tutor')} className="h-40 rounded-[2rem] bg-gradient-to-br from-indigo-100 to-indigo-50 border border-white shadow-sm overflow-hidden relative group cursor-pointer hover:shadow-md transition-all hover:scale-[1.02]">
                           <div className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm">
                              <span className="material-symbols-outlined">smart_toy</span>
                           </div>
                           <div className="absolute bottom-6 left-6 right-6">
                              <h4 className="font-extrabold text-indigo-950">AI Study Tutor</h4>
                              <p className="text-[11px] font-medium text-indigo-400 mt-1">Personalized guidance for all subjects.</p>
                           </div>
                        </div>
                        <div onClick={() => setActiveTab('Lab')} className="h-40 rounded-[2rem] bg-gradient-to-br from-emerald-100 to-emerald-50 border border-white shadow-sm overflow-hidden relative group cursor-pointer hover:shadow-md transition-all hover:scale-[1.02]">
                            <div className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm">
                              <span className="material-symbols-outlined">quiz</span>
                           </div>
                           <div className="absolute bottom-6 left-6 right-6">
                              <h4 className="font-extrabold text-emerald-950">Quiz Lab</h4>
                              <p className="text-[11px] font-medium text-emerald-400 mt-1">Access AI-curated assessments.</p>
                           </div>
                        </div>
                     </div>
                 </section>
              </div>

              {/* Right Column */}
              <div className="xl:col-span-4 space-y-8 lg:space-y-10">
                 
                 {/* Overall GPA */}
                 <section className="p-6 lg:p-8 bg-white rounded-[2rem] lg:rounded-[2.5rem] shadow-sm border border-slate-200/60 flex flex-col justify-between h-[140px] lg:h-[160px] relative overflow-hidden group hover:shadow-zenith transition-all">
                    <div className="relative z-10 flex justify-between items-start">
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none font-jakarta">Overall GPA</p>
                          <h3 className="text-4xl lg:text-5xl font-black text-slate-900 mt-2 tracking-tighter tabular-nums">{stats.gpa.toFixed(2)}</h3>
                       </div>
                       <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary shadow-sm">
                          <span className="material-symbols-outlined font-black">trending_up</span>
                       </div>
                    </div>
                    <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden mt-4 border border-slate-100">
                       <div className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(26,20,107,0.3)] transition-all duration-1000" style={{ width: `${(stats.gpa / 4) * 100}%` }} />
                    </div>
                 </section>

                 {/* Attendance */}
                 <section className="p-6 lg:p-8 bg-white rounded-[2rem] lg:rounded-[2.5rem] shadow-sm border border-slate-200/60 flex flex-col justify-between h-[140px] lg:h-[160px] relative overflow-hidden group hover:shadow-zenith transition-all">
                    <div className="relative z-10 flex justify-between items-start">
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none font-jakarta">Attendance Rate</p>
                          <h3 className="text-4xl lg:text-5xl font-black text-slate-900 mt-2 tracking-tighter tabular-nums">{stats.attendance}%</h3>
                       </div>
                       <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-emerald-600 shadow-sm">
                          <span className="material-symbols-outlined font-black">verified_user</span>
                       </div>
                    </div>
                    <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden mt-4 border border-slate-100">
                       <div className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all duration-1000" style={{ width: `${stats.attendance}%` }} />
                    </div>
                 </section>

                 {/* My Marks */}
                 <section className="space-y-6">
                    <div className="flex items-center gap-3">
                       <div className="w-7 h-7 rounded-lg bg-primary/5 flex items-center justify-center text-primary border border-primary/10">
                          <span className="material-symbols-outlined text-[18px] font-black">analytics</span>
                       </div>
                       <h3 className="text-lg font-black text-slate-900 tracking-tight font-jakarta uppercase">Performance Radar</h3>
                    </div>
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60 space-y-7 text-left hover:shadow-zenith transition-all">
                        {academicRecords.length > 0 ? academicRecords.slice(0, 4).map((record, i) => (
                          <div key={i} className="flex items-center justify-between group">
                             <div className="space-y-1">
                                <h4 className="text-[13px] font-black text-slate-900 leading-none font-jakarta group-hover:text-primary transition-colors">{record.subject}</h4>
                                <p className="text-[9px] font-bold text-slate-400 tracking-widest uppercase mt-1">Faculty: {record.teacherId || 'STAFF'}</p>
                             </div>
                             <span className="text-xl font-black text-primary tabular-nums">
                                {record.mark}
                             </span>
                          </div>
                        )) : (
                          <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest py-4">Status: Pending Deployment</p>
                        )}
                     </div>
                 </section>

                 {/* Semester Progress */}
                 <section className="space-y-6">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest text-center">Semester Progress</p>
                    <div className="flex items-end justify-between h-40 px-4">
                       {[60, 45, 80, 55, 95, 70, 85].map((h, i) => (
                         <div key={i} className="w-3 rounded-full bg-indigo-900 transition-all hover:bg-emerald-400 cursor-help relative group" style={{ height: `${h}%` }}>
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-indigo-900 text-white text-[8px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity">
                               {h}%
                            </div>
                         </div>
                       ))}
                    </div>
                 </section>

              </div>
            </div>
          )}

          {activeTab === 'Assignments' && (
            <StudentAssignmentView 
              assignments={activeAssignments} 
              selectedId={selectedAssignmentId} 
              onSelect={setSelectedAssignmentId} 
            />
          )}

          {activeTab === 'Videos' && (
            <VideoLibrary user={user} />
          )}

          {activeTab === 'Quizzes' && (
            <AITutorView user={user} />
          )}

          {activeTab === 'Lab' && (
            <div className="space-y-8 lg:space-y-10">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900">Intellectual Lab</h2>
                  <p className="text-[12px] lg:text-[13px] font-semibold text-slate-500">Access the repository of academic assessments and interactive drills.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                {availableQuizzes.length === 0 ? (
                  <div className="col-span-full py-24 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                    <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-200 mx-auto mb-4">
                      <span className="material-symbols-outlined text-3xl">biotech</span>
                    </div>
                    <p className="text-[11px] font-black uppercase text-slate-300 tracking-widest">No Assessments Available</p>
                  </div>
                ) : (
                  availableQuizzes.map((quiz) => {
                    const submission = mySubmissions.find((s: any) => s.quizId === quiz.id);
                    const isCompleted = !!submission;
                    return (
                      <motion.div
                        key={quiz.id}
                        whileHover={!isCompleted ? { y: -5 } : {}}
                        onClick={() => {
                          if (isCompleted) return;
                          setSelectedQuiz(quiz);
                          setIsQuizActive(true);
                        }}
                        className={cn(
                          "bg-white p-8 rounded-[2.5rem] border border-white shadow-sm transition-all relative overflow-hidden group",
                          isCompleted ? "opacity-75 cursor-not-allowed" : "hover:shadow-xl cursor-pointer"
                        )}
                      >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/50 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform" />
                        
                        <div className="flex justify-between items-start mb-6 relative z-10">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-sm",
                            isCompleted ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-900 group-hover:text-white"
                          )}>
                            <span className="material-symbols-outlined text-2xl">{isCompleted ? 'workspace_premium' : 'quiz'}</span>
                          </div>
                          <Badge variant="outline" className={cn(
                            "text-[8px] font-black tracking-widest",
                            isCompleted ? "border-emerald-100 text-emerald-500" : "border-indigo-100 text-indigo-400"
                          )}>
                            {isCompleted ? 'COMPLETED' : 'STUDIO'}
                          </Badge>
                        </div>

                        <div className="space-y-4 relative z-10">
                          <div>
                            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest leading-none">{quiz.subject || 'General'}</p>
                            <h3 className="text-[16px] font-extrabold text-slate-900 mt-2 leading-tight group-hover:text-indigo-900 transition-colors">{quiz.title}</h3>
                          </div>
                          
                          <div className="flex items-center gap-6 pt-4 border-t border-slate-50">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm text-slate-300">list_alt</span>
                                <span className="text-[10px] font-bold text-slate-500">{quiz.questions?.length || 0} Questions</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm text-slate-300">timer</span>
                                <span className="text-[10px] font-bold text-slate-500">15 MIN</span>
                            </div>
                          </div>

                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isCompleted) {
                                setSelectedQuiz(quiz);
                                setLoadedSubmission(submission);
                                setIsQuizActive(true);
                              } else {
                                setSelectedQuiz(quiz);
                                setLoadedSubmission(null);
                                setIsQuizActive(true);
                              }
                            }}
                            className={cn(
                              "w-full mt-4 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all",
                              isCompleted 
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100" 
                                : "bg-slate-50 text-slate-400 group-hover:bg-indigo-900 group-hover:text-white"
                            )}
                          >
                            {isCompleted ? 'View Results' : 'Launch Session'}
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {activeTab === 'Tutor' && (
            <AITutorView user={user} />
          )}

          {activeTab === 'PastPapers' && (
            <StudentPastPapersView papers={pastPapers} />
          )}

          {activeTab === 'Notifications' && (
            <StudentNotificationsView notifications={notifications} />
          )}

          {activeTab === 'Marks' && (
            <StudentGradesView 
              academicRecords={academicRecords} 
              quizRecords={mySubmissions}
            />
          )}

          {activeTab === 'Settings' && (
            <StudentSettingsView user={user} />
          )}

          {activeTab !== 'Dashboard' && activeTab !== 'Assignments' && activeTab !== 'Lab' && activeTab !== 'Tutor' && activeTab !== 'PastPapers' && activeTab !== 'Marks' && activeTab !== 'Settings' && (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
              <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-200">
                <span className="material-symbols-outlined text-4xl">architecture</span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">{activeTab} Section</h3>
              <p className="text-sm font-medium text-slate-400 max-w-xs">We are currently building this view in the LMS design system.</p>
              <button 
                onClick={() => setActiveTab('Dashboard')}
                className="px-6 py-2 bg-indigo-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all"
              >
                Return to Dashboard
              </button>
            </div>
          )}

        </main>
      </div>


    </div>
  );
}
function VideoLibrary({ user }: { user: User }) {
  const [videos, setVideos] = useState<any[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "educational_videos"),
      where("grade", "==", user.gradeClass || user.grade || "Grade 10"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setVideos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [user]);

  const filteredVideos = videos.filter(v => 
    v.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    v.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl lg:text-3xl font-black text-slate-900 font-jakarta tracking-tight">Video Library</h2>
          <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wide">Explore curated lessons for {user.gradeClass || user.grade}.</p>
        </div>
        <div className="relative group w-full md:w-80">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
          <input 
            type="text" 
            placeholder="Search lessons..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-white rounded-2xl border border-slate-100 outline-none focus:border-primary/30 shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredVideos.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-400 text-xs font-bold uppercase tracking-widest bg-white rounded-[2.5rem] border border-white">
            No lessons found in the library yet.
          </div>
        ) : filteredVideos.map(video => (
          <motion.div 
            key={video.id} 
            whileHover={{ y: -5 }}
            className="bg-white rounded-[2rem] overflow-hidden border border-white shadow-sm hover:shadow-xl transition-all cursor-pointer group"
            onClick={() => setSelectedVideo(video)}
          >
            <div className="aspect-video relative overflow-hidden">
              <img src={`https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <div className="size-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-3xl">play_arrow</span>
                 </div>
              </div>
              <div className="absolute top-4 left-4">
                 <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-primary text-[9px] font-black rounded-lg uppercase shadow-sm">
                   {video.subject}
                 </span>
              </div>
            </div>
            <div className="p-6 space-y-3">
              <h3 className="font-bold text-slate-900 text-[14px] leading-tight line-clamp-2">{video.title}</h3>
              <div className="flex items-center gap-3">
                 <div className="size-6 rounded-full bg-indigo-50 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[14px]">person</span>
                 </div>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight truncate">Inst. {video.teacherName}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedVideo && (
          <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
            <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-[2.5rem] border-none">
              <div className="aspect-video w-full bg-black">
                <iframe 
                  src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                  className="w-full h-full border-none"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="p-8 bg-white">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{selectedVideo.subject}</span>
                    <DialogTitle className="text-2xl font-black text-slate-900 mt-2 font-jakarta leading-tight">{selectedVideo.title}</DialogTitle>
                  </div>
                  <DialogClose asChild>
                    <button className="size-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </DialogClose>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
