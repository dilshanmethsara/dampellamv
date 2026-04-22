"use client"

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, getInitials, getNameColor } from '@/lib/utils';
import { User, useAuth } from '@/lib/portal/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, limit, addDoc, serverTimestamp, doc, getDocs, deleteDoc, writeBatch, setDoc, updateDoc } from 'firebase/firestore';
import { createNotification } from "@/lib/portal/notifications";
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface TeacherDashboardProps {
  user: User
  onLogout: () => void
  onBackToWebsite: () => void
}

// --- Assignment Creation Form Component ---

function AssignmentForm({ user }: { user: User }) {
  const [grade, setGrade] = useState('Grade 10');
  const [isPublishing, setIsPublishing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [formData, setFormData] = useState({
    title: '',
    subject: user.subjectsTaught?.[0] || 'General',
    instructions: '',
    points: 100
  });

  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileRefInput = React.useRef<HTMLInputElement>(null);

  const handlePublish = async () => {
    if (!formData.title) return alert("Please enter a title");
    if (!selectedDate) return alert("Please select a due date");
    
    setIsPublishing(true);
    let attachmentUrl = '';

    try {
      // 1. Upload file if exists
      if (attachmentFile) {
        setUploadingFile(true);
        try {
          const uploadFormData = new FormData();
          uploadFormData.append('file', attachmentFile);

          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            body: uploadFormData
          });

          const uploadData = await uploadRes.json();
          if (!uploadRes.ok) {
            throw new Error(uploadData.error || "File hosting service is currently unavailable.");
          }
          
          if (!uploadData.url || !uploadData.url.startsWith('http')) {
            throw new Error("Invalid response received from storage provider.");
          }

          attachmentUrl = uploadData.url;
        } catch (uploadErr: any) {
          console.error("Upload process failed:", uploadErr);
          alert(`Reference Material Upload Failed: ${uploadErr.message}`);
          setIsPublishing(false);
          setUploadingFile(false);
          return; // Stop the entire publish process
        }
        setUploadingFile(false);
      }

      // 2. Save to Firestore
      await addDoc(collection(db, "assignments"), {
        ...formData,
        attachmentUrl,
        dueDate: selectedDate.toISOString(),
        due_date: format(selectedDate, "yyyy-MM-dd"), // Legacy compatibility
        gradeClass: grade,
        grade: grade, // Support both fields
        teacherId: user.teacherId || user.email,
        teacherEmail: user.email,
        teacher_email: user.email, // Legacy compatibility
        teacherName: user.fullName,
        createdAt: serverTimestamp(),
        created_at: new Date().toISOString(), // String fallback for legacy viewers
        status: 'ACTIVE'
      });

      alert("Assignment Published Successfully!");
      setFormData({ title: '', subject: user.subjectsTaught?.[0] || 'General', instructions: '', points: 100 });
      setSelectedDate(undefined);
      setAttachmentFile(null);
    } catch (e: any) {
      console.error("Error publishing assignment:", e);
      alert("Failed to publish: " + e.message);
    } finally {
      setIsPublishing(false);
      setUploadingFile(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900">Create New Assignment</h2>
          <p className="text-[12px] lg:text-[13px] font-semibold text-slate-500">Define the objectives and parameters for your students.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white text-slate-600 text-[10px] lg:text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all border border-slate-100 shadow-sm">Preview Mode</button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-10">
        
        {/* Main Form Area */}
        <div className="xl:col-span-8 space-y-8">
          
          {/* Basic Information */}
          <section className="bg-white rounded-[2.5rem] p-8 lg:p-10 shadow-sm border border-white space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[20px]">info</span>
              </div>
              <h3 className="text-md lg:text-lg font-extrabold text-slate-900 tracking-tight">Basic Information</h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] lg:text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Assignment Title</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. Advanced Thermodynamics - Final Research Project"
                  className="w-full h-12 lg:h-14 px-6 bg-slate-50/50 border border-slate-100 rounded-2xl text-[13px] font-semibold text-slate-600 placeholder:text-slate-300 outline-none focus:border-primary/30 focus:bg-white transition-all shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] lg:text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject</label>
                <div className="relative group">
                  <select 
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full h-12 lg:h-14 px-6 bg-slate-50/50 border border-slate-100 rounded-2xl text-[13px] font-semibold text-slate-600 outline-none focus:border-primary/30 focus:bg-white appearance-none transition-all shadow-sm"
                  >
                    {user.subjectsTaught && user.subjectsTaught.length > 0 ? (
                      user.subjectsTaught.map(s => <option key={s} value={s}>{s}</option>)
                    ) : (
                      <>
                        <option>General</option>
                        <option>Sinhala</option>
                        <option>English</option>
                        <option>Science</option>
                        <option>Mathematics</option>
                        <option>Geography</option>
                        <option>ICT</option>
                        <option>Agri</option>
                        <option>Home Science</option>
                        <option>History</option>
                        <option>Drama</option>
                        <option>Music</option>
                        <option>Civic Education</option>
                        <option>Buddhism</option>
                      </>
                    )}
                  </select>
                  <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-focus-within:rotate-180 transition-transform">expand_more</span>
                </div>
              </div>
            </div>
          </section>

          {/* Instructions & Resources */}
          <section className="bg-white rounded-[2.5rem] p-8 lg:p-10 shadow-sm border border-white space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[20px]">description</span>
              </div>
              <h3 className="text-md lg:text-lg font-extrabold text-slate-900 tracking-tight">Instructions & Resources</h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] lg:text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Instructions</label>
                <div className="bg-slate-50/50 border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                  <div className="h-10 border-b border-slate-100 bg-white/50 px-4 flex items-center gap-4">
                    <button className="text-slate-400 hover:text-primary transition-colors"><span className="material-symbols-outlined text-lg">format_bold</span></button>
                    <button className="text-slate-400 hover:text-primary transition-colors"><span className="material-symbols-outlined text-lg">format_italic</span></button>
                    <button className="text-slate-400 hover:text-primary transition-colors"><span className="material-symbols-outlined text-lg">link</span></button>
                    <div className="w-px h-4 bg-slate-100 mx-1" />
                    <button className="text-slate-400 hover:text-primary transition-colors"><span className="material-symbols-outlined text-lg">format_list_bulleted</span></button>
                  </div>
                  <textarea 
                    value={formData.instructions}
                    onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                    placeholder="Outline the learning objectives and task details here..."
                    className="w-full h-40 lg:h-48 px-6 py-4 bg-transparent text-[13px] font-medium text-slate-600 placeholder:text-slate-300 outline-none resize-none"
                  />
                </div>
              </div>

               <div className="space-y-2">
                <label className="text-[10px] lg:text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Reference Materials (PDF)</label>
                <div 
                  onClick={() => fileRefInput.current?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-[2rem] p-10 flex flex-col items-center justify-center text-center gap-4 group transition-all cursor-pointer relative overflow-hidden",
                    attachmentFile 
                      ? "border-emerald-200 bg-emerald-50/30" 
                      : "border-slate-100 hover:border-primary/20 hover:bg-slate-50/50"
                  )}
                >
                  <input 
                    type="file"
                    ref={fileRefInput}
                    onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
                    accept=".pdf"
                    className="hidden"
                  />
                  
                  {attachmentFile ? (
                    <>
                      <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <span className="material-symbols-outlined text-2xl">description</span>
                      </div>
                      <div>
                        <h4 className="text-[13px] font-extrabold text-emerald-950 font-sans truncate max-w-[200px]">{attachmentFile.name}</h4>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setAttachmentFile(null); }}
                          className="text-[9px] font-black text-rose-500 uppercase tracking-widest mt-2 hover:text-rose-600 transition-colors"
                        >
                          Remove File
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-300 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all">
                        <span className="material-symbols-outlined text-2xl">upload_file</span>
                      </div>
                      <div>
                        <h4 className="text-[13px] font-extrabold text-slate-400 font-sans px-4">Click to upload reference material</h4>
                        <p className="text-[10px] font-bold text-slate-300 mt-1 uppercase tracking-widest leading-none">
                          PDF files only (Max 200MB)
                        </p>
                      </div>
                    </>
                  )}
                  
                  {uploadingFile && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest">Encrypting & Uploading...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <div className="flex items-center justify-end gap-6 pt-4">
             <button className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all">Save as Draft</button>
             <button 
              onClick={handlePublish}
              disabled={isPublishing}
              className="px-10 py-4 bg-primary text-white text-[11px] font-black uppercase tracking-widest rounded-[1.25rem] shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 min-w-[200px]"
             >
               {isPublishing ? (
                 <>
                   <span className="material-symbols-outlined animate-spin text-lg">sync</span>
                   Publishing...
                 </>
               ) : (
                 'Publish Assignment'
               )}
             </button>
          </div>
        </div>

        {/* Sidebar Parameters */}
        <div className="xl:col-span-4 space-y-8">
          
          <section className="bg-indigo-950 rounded-[2.5rem] p-8 shadow-xl space-y-8">
            <div className="flex items-center gap-4 text-white">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-indigo-300 text-[20px]">settings_input_component</span>
              </div>
              <h3 className="text-md lg:text-lg font-extrabold tracking-tight">Parameters</h3>
            </div>

            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[9px] font-black text-indigo-300/50 uppercase tracking-widest">Grade Level</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'Grade 13'].map((g) => (
                    <button 
                      key={g}
                      onClick={() => setGrade(g)}
                      className={cn(
                        "h-10 rounded-xl text-[10px] font-black transition-all",
                        grade === g 
                          ? "bg-primary text-white shadow-lg shadow-primary/20" 
                          : "bg-white/5 text-indigo-100/40 hover:bg-white/10"
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[9px] font-black text-indigo-300/50 uppercase tracking-widest">Due Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="w-full h-12 px-6 bg-white/5 border border-white/5 rounded-2xl text-[13px] font-semibold text-white outline-none flex items-center justify-between transition-all hover:bg-white/10">
                      {selectedDate ? format(selectedDate, "PPP") : <span className="text-white/20">Select deadline</span>}
                      <span className="material-symbols-outlined text-white/20">calendar_month</span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 border-none shadow-2xl rounded-3xl overflow-hidden" align="end">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                      className="bg-indigo-950 text-white"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2 relative overflow-hidden group opacity-50">
                    <div className="flex items-center justify-between">
                       <p className="text-[8px] font-black text-indigo-300/30 uppercase tracking-widest">Marks</p>
                       <Badge variant="outline" className="bg-white/10 text-[7px] border-none text-indigo-200">SOON</Badge>
                    </div>
                    <p className="text-lg font-black text-white">100</p>
                 </div>
                 <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2 relative overflow-hidden group opacity-50">
                    <div className="flex items-center justify-between">
                       <p className="text-[8px] font-black text-indigo-300/30 uppercase tracking-widest">Late</p>
                       <Badge variant="outline" className="bg-white/10 text-[7px] border-none text-indigo-200">SOON</Badge>
                    </div>
                    <p className="text-[10px] font-bold text-white/20">DISABLED</p>
                 </div>
                 <div className="col-span-2 p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between group opacity-50">
                    <p className="text-[8px] font-black text-indigo-300/30 uppercase tracking-widest">Anonymous Grading</p>
                    <Badge variant="outline" className="bg-white/10 text-[7px] border-none text-indigo-200">SOON</Badge>
                 </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-white space-y-6">
             <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Premium Metadata</p>
             <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <span className="text-[12px] font-bold text-slate-600">Class Average</span>
                   <span className="text-[12px] font-black text-primary">82.5%</span>
                </div>
                <div className="flex items-center justify-between">
                   <span className="text-[12px] font-bold text-slate-600">Active Students</span>
                   <span className="text-[12px] font-black text-primary">28</span>
                </div>
                <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                   <div className="h-full w-2/3 bg-primary rounded-full shadow-[0_0_8px_rgba(79,70,229,0.3)]" />
                </div>
             </div>
          </section>

        </div>
      </div>
    </motion.div>
  );
}

// --- AI Question Studio Component ---

function AIQuestionStudio({ user }: { user: User }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [config, setConfig] = useState({
    title: '',
    subject: user.subjectsTaught?.[0] || 'General',
    count: 10,
    level: 'Medium',
    language: 'en',
    grade: user.gradeClass || 'Grade 10'
  });
  const [myQuizzes, setMyQuizzes] = useState<any[]>([]);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "quizzes"),
      where("teacherId", "==", user.teacherId || user.email || 'unknown'),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMyQuizzes(data);
    });

    return () => unsub();
  }, [user]);

  const handleDeleteQuiz = async (quizId: string) => {
    if (confirm("Are you sure you want to delete this assessment?")) {
      await deleteDoc(doc(db, "quizzes", quizId));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setPdfFile(file);
      // Auto-fill title from filename if empty
      if (!config.title) {
        setConfig(prev => ({ ...prev, title: file.name.replace('.pdf', '') }));
      }
    }
  };

  const handleGenerate = async () => {
    if (!pdfFile) return alert("Please upload a source material first.");
    
    setIsGenerating(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(pdfFile);
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        
        const response = await fetch('/api/quiz/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pdfBase64: base64,
            numQuestions: config.count,
            subject: config.subject,
            grade: config.grade,
            language: config.language
          })
        });

        const data = await response.json();
        if (data.questions) {
          setQuestions(data.questions);
        } else {
          alert(data.error || "Generation failed");
        }
        setIsGenerating(false);
      };
    } catch (e) {
      console.error("AIServer Error:", e);
      setIsGenerating(false);
    }
  };

  const handleSaveToLibrary = async () => {
    if (questions.length === 0) return;
    try {
      await addDoc(collection(db, "quizzes"), {
        title: config.title || `${pdfFile?.name.replace('.pdf', '')} Assessment`,
        questions: questions,
        teacherId: user.teacherId || user.email || 'unknown',
        teacherEmail: user.email,
        createdAt: serverTimestamp(),
        subject: config.subject,
        grade: config.grade,
        isPublished: true
      });
      alert("Quiz saved to library!");
    } catch (e) {
      console.error("Error saving quiz:", e);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 lg:space-y-10"
    >
      {/* Hero Header & Usage */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-indigo-900 flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
             </div>
             <p className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">Question Studio</p>
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900">AI Question Studio</h2>
          <p className="text-[13px] lg:text-[14px] font-semibold text-slate-500 leading-relaxed">
            Transform your lesson notes, PDFs, and textbooks into sophisticated assessments. 
            Curate high-quality MCQs with the power of The Intellectual LMS.
          </p>
        </div>
        <div className="shrink-0">
           <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 lg:p-5 flex items-center gap-4 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-100/50 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform" />
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm relative z-10">
                 <span className="material-symbols-outlined font-variation-fill">bolt</span>
              </div>
              <div className="relative z-10">
                 <p className="text-[9px] font-black text-emerald-900/50 uppercase tracking-widest leading-none">Usage Balance</p>
                 <p className="text-[13px] font-extrabold text-emerald-900 mt-1">Unlimited generations</p>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-10">
        
        {/* Source Material Sidecar */}
        <div className="xl:col-span-5 space-y-8">
           <section className="bg-white rounded-[2.5rem] p-8 lg:p-10 shadow-sm border border-white space-y-8">
              <div className="flex items-center gap-3">
                 <span className="material-symbols-outlined text-primary/40 text-xl">cloud_upload</span>
                 <h3 className="text-[11px] font-black text-primary uppercase tracking-widest ml-1">Source Material</h3>
              </div>

              <div className="space-y-8">
                 {/* Upload Area */}
                 <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".pdf" 
                  className="hidden" 
                 />
                 <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-3xl p-8 lg:p-12 transition-all group cursor-pointer text-center relative overflow-hidden",
                    pdfFile ? "border-emerald-200 bg-emerald-50/20" : "border-slate-100 hover:border-primary/20 hover:bg-slate-50/30"
                  )}
                 >
                    <div className="relative z-10 space-y-4">
                       <div className={cn(
                         "w-14 h-14 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform",
                         pdfFile ? "bg-emerald-100 text-emerald-600" : "bg-indigo-50 text-primary"
                       )}>
                          <span className="material-symbols-outlined text-3xl">{pdfFile ? 'check_circle' : 'picture_as_pdf'}</span>
                       </div>
                       <div>
                          <h4 className="text-[14px] font-extrabold text-slate-900">
                            {pdfFile ? pdfFile.name : 'Upload Lesson PDFs'}
                          </h4>
                          <p className="text-[11px] font-bold text-slate-400 mt-1 underline">
                            {pdfFile ? 'Click to change file' : 'Drag and drop or click to browse'}
                          </p>
                       </div>
                    </div>
                 </div>

                 {/* Configuration */}
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assessment Title</label>
                       <input 
                         type="text" 
                         value={config.title}
                         placeholder="e.g. Mathematics Midterm Quiz"
                         onChange={(e) => setConfig({...config, title: e.target.value})}
                         className="w-full h-12 lg:h-14 px-6 bg-slate-50/50 border border-slate-100 rounded-2xl text-[13px] font-semibold text-slate-600 outline-none focus:border-primary/30 transition-all shadow-sm focus:bg-white"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject Matter</label>
                       <div className="relative group">
                          <select 
                            value={config.subject}
                            onChange={(e) => setConfig({...config, subject: e.target.value})}
                            className="w-full h-12 lg:h-14 px-6 bg-slate-50/50 border border-slate-100 rounded-2xl text-[13px] font-semibold text-slate-600 outline-none focus:border-primary/30 focus:bg-white appearance-none transition-all shadow-sm"
                          >
                             {user.subjectsTaught && user.subjectsTaught.length > 0 ? (
                                user.subjectsTaught.map(sub => (
                                  <option key={sub}>{sub}</option>
                                ))
                              ) : (
                                <option>General</option>
                              )}
                          </select>
                          <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-focus-within:rotate-180 transition-transform">expand_more</span>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 lg:gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Count</label>
                          <input 
                            type="number" 
                            value={config.count}
                            onChange={(e) => setConfig({...config, count: parseInt(e.target.value)})}
                            className="w-full h-12 lg:h-14 px-6 bg-slate-50/50 border border-slate-100 rounded-2xl text-[13px] font-semibold text-slate-600 outline-none focus:border-primary/30 transition-all shadow-sm" 
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Level</label>
                          <div className="relative group">
                             <select 
                                value={config.level}
                                onChange={(e) => setConfig({...config, level: e.target.value})}
                                className="w-full h-12 lg:h-14 px-6 bg-slate-50/50 border border-slate-100 rounded-2xl text-[13px] font-semibold text-slate-600 outline-none focus:border-primary/30 appearance-none transition-all shadow-sm"
                             >
                                <option>Medium</option>
                                <option>Easy</option>
                                <option>Hard</option>
                                <option>Expert</option>
                             </select>
                             <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-focus-within:rotate-180 transition-transform">expand_more</span>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Output Language</label>
                       <div className="flex bg-slate-50/50 p-1 rounded-2xl border border-slate-100 shadow-sm">
                          <button 
                            onClick={() => setConfig({...config, language: 'en'})}
                            className={cn(
                              "flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all",
                              config.language === 'en' ? "bg-white text-indigo-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                            )}
                          >
                            English
                          </button>
                          <button 
                            onClick={() => setConfig({...config, language: 'si'})}
                            className={cn(
                              "flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all",
                              config.language === 'si' ? "bg-white text-indigo-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                            )}
                          >
                            සිංහල
                          </button>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Grade</label>
                       <div className="relative group">
                          <select 
                            value={config.grade}
                            onChange={(e) => setConfig({...config, grade: e.target.value})}
                            className="w-full h-12 lg:h-14 px-6 bg-slate-50/50 border border-slate-100 rounded-2xl text-[13px] font-semibold text-slate-600 outline-none focus:border-primary/30 focus:bg-white appearance-none transition-all shadow-sm"
                          >
                             {['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'Grade 13'].map(g => (
                               <option key={g}>{g}</option>
                             ))}
                          </select>
                          <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-focus-within:rotate-180 transition-transform">expand_more</span>
                       </div>
                    </div>
                 </div>

                 <button 
                  onClick={handleGenerate}
                  disabled={isGenerating || !pdfFile}
                  className="w-full h-14 bg-indigo-900 text-white rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-indigo-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all group overflow-hidden relative disabled:opacity-50"
                 >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/5 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <span className="material-symbols-outlined text-[20px]">{isGenerating ? 'refresh' : 'add'}</span>
                    <span className="text-[11px] font-black uppercase tracking-widest">
                      {isGenerating ? 'Generating mcqs...' : 'Generate Questions'}
                    </span>
                 </button>
              </div>
           </section>
        </div>

        {/* Generated Workspace Area */}
        <div className="xl:col-span-7 space-y-8">
           <section className="bg-slate-50/30 rounded-[2.5rem] p-8 lg:p-10 border border-white shadow-sm h-full flex flex-col justify-between relative overflow-hidden min-h-[500px]">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />
              
              <div className="relative z-10 flex items-center justify-between mb-8">
                 <h3 className="text-[13px] font-extrabold text-slate-900 tracking-tight">Generated Workspace</h3>
                 <div className="flex items-center gap-6">
                    <button 
                      onClick={() => setQuestions([])}
                      className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-error transition-all"
                    >
                      Clear All
                    </button>
                    <button 
                      onClick={handleSaveToLibrary}
                      className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline transition-all"
                    >
                      Save to Library
                    </button>
                 </div>
              </div>

              {/* Workspace Content */}
              <div className="flex-1 relative z-10 custom-scrollbar overflow-y-auto px-2">
                {isGenerating ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-4 animate-pulse">
                     <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-3xl rotating">auto_awesome</span>
                     </div>
                     <p className="text-xs font-bold text-slate-400">AI is analyzing your content...</p>
                  </div>
                ) : questions.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 max-w-sm mx-auto">
                    <div className="w-20 h-20 bg-white rounded-[2rem] shadow-xl shadow-indigo-900/5 flex items-center justify-center text-slate-200">
                        <span className="material-symbols-outlined text-4xl">question_mark</span>
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-[16px] font-extrabold text-slate-900">No Questions Generated</h4>
                        <p className="text-[12px] font-medium text-slate-400 leading-relaxed">
                          Upload your materials on the left to begin crafting your next assessment. Our AI will analyze your content to create balanced, pedagogically sound questions.
                        </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 pb-10">
                    {questions.map((q, idx) => (
                      <div key={idx} className="bg-white p-6 rounded-[2rem] border border-white shadow-sm space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Question {idx + 1}</p>
                          <span className="text-[10px] font-black text-slate-300">1 PT</span>
                        </div>
                        <h4 className="text-[14px] font-extrabold text-slate-900 leading-tight">{q.question_text}</h4>
                        <div className="grid grid-cols-1 gap-2">
                          {q.options.map((opt: string, i: number) => (
                            <div 
                              key={i} 
                              className={cn(
                                "p-3 px-5 rounded-2xl text-[12px] font-semibold border transition-all",
                                q.correct_option_index === i 
                                  ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
                                  : "bg-slate-50 border-transparent text-slate-500"
                              )}
                            >
                              {opt}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Browse Buttons */}
              {questions.length === 0 && !isGenerating && (
                <div className="grid grid-cols-2 gap-4 lg:gap-6 relative z-10 mt-8">
                  <button className="p-5 rounded-3xl bg-white border border-white shadow-sm flex items-center gap-4 text-left group hover:bg-slate-50 transition-all border-slate-100/50">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-[20px]">lightbulb</span>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">Try a Demo</p>
                        <p className="text-[9px] font-bold text-slate-400 mt-0.5">Generate from 'Photosynthesis'</p>
                      </div>
                  </button>
                  <button className="p-5 rounded-3xl bg-white border border-white shadow-sm flex items-center gap-4 text-left group hover:bg-slate-50 transition-all border-slate-100/50">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-[20px]">library_books</span>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">Browse Library</p>
                        <p className="text-[9px] font-bold text-slate-400 mt-0.5">Use existing question sets</p>
                      </div>
                  </button>
                </div>
              )}
           </section>
        </div>
      </div>

      <div className="pt-10 space-y-8">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <span className="material-symbols-outlined text-[18px]">library_books</span>
           </div>
           <div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">My Published Assessments</h3>
              <p className="text-[12px] font-semibold text-slate-400">Manage and preview quizzes currently live in the academic library.</p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
           {myQuizzes.length === 0 ? (
             <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                <p className="text-[11px] font-black uppercase text-slate-300 tracking-widest">No published assessments yet</p>
             </div>
           ) : (
             myQuizzes.map((quiz) => (
               <div key={quiz.id} className="bg-white p-6 rounded-[2.5rem] border border-white shadow-sm hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start mb-4">
                     <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <span className="material-symbols-outlined text-[20px]">quiz</span>
                     </div>
                     <button 
                       onClick={() => handleDeleteQuiz(quiz.id)}
                       className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-200 hover:text-rose-500 hover:bg-rose-50 transition-all"
                     >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                     </button>
                  </div>
                  <div className="space-y-4">
                     <div>
                        <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest leading-none">{quiz.subject}</p>
                        <h4 className="text-[14px] font-extrabold text-slate-800 mt-1.5 leading-tight">{quiz.title}</h4>
                     </div>
                     <div className="flex items-center gap-4 pt-4 border-t border-slate-50">
                        <div className="flex items-center gap-1.5">
                           <span className="material-symbols-outlined text-[14px] text-slate-300">list_alt</span>
                           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{quiz.questions?.length || 0} MCQS</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                           <span className="material-symbols-outlined text-[14px] text-slate-300">group</span>
                           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{quiz.grade}</span>
                        </div>
                     </div>
                  </div>
               </div>
             ))
           )}
        </div>
      </div>
    </motion.div>
  );
}

// --- MCQ Submission Review Component ---

function MCQSubmissionReview({ submissions, onBack }: { submissions: any[], onBack: () => void }) {
  const [viewedQuizId, setViewedQuizId] = useState<string | null>(null);
  
  // Group submissions by quizId
  const quizzes = submissions.reduce((acc: any, sub) => {
    if (!acc[sub.quizId]) {
      acc[sub.quizId] = {
        id: sub.quizId,
        title: sub.quizTitle,
        subject: sub.subject,
        grade: sub.grade,
        count: 0,
        totalScore: 0,
        submissions: []
      };
    }
    acc[sub.quizId].count++;
    acc[sub.quizId].totalScore += sub.percentage || 0;
    acc[sub.quizId].submissions.push(sub);
    return acc;
  }, {});

  const quizList = Object.values(quizzes);
  const selectedQuiz = viewedQuizId ? quizzes[viewedQuizId] : null;

  if (selectedQuiz) {
    const avgScore = Math.round(selectedQuiz.totalScore / selectedQuiz.count);
    const passRate = Math.round((selectedQuiz.submissions.filter((s: any) => s.percentage >= 50).length / selectedQuiz.count) * 100);

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]">
            <button onClick={() => setViewedQuizId(null)} className="text-slate-300 hover:text-primary transition-colors">SUBMISSIONS</button>
            <span className="material-symbols-outlined text-[12px] text-slate-200">chevron_right</span>
            <span className="text-primary">{selectedQuiz.title}</span>
          </nav>
          <button 
            onClick={() => setViewedQuizId(null)}
            className="px-4 py-2 bg-white text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-100 shadow-sm"
          >
            Back to List
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-10">
          <div className="xl:col-span-8 space-y-8">
            <header className="space-y-4">
               <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
                  MCQ Submission Review: <span className="text-primary">{selectedQuiz.title}</span>
               </h2>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-white p-8 rounded-[2.5rem] border border-white shadow-sm flex items-center justify-between relative overflow-hidden group">
                  <div className="relative z-10">
                     <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Average Score</p>
                     <h3 className="text-5xl font-black text-slate-900 mt-2">{avgScore}% <span className="text-emerald-400 text-sm font-bold">+4.2%</span></h3>
                  </div>
                  <div className="w-16 h-16 rounded-3xl bg-indigo-50 flex items-center justify-center text-primary relative z-10 transition-transform group-hover:scale-110">
                     <span className="material-symbols-outlined text-3xl">analytics</span>
                  </div>
               </div>
               <div className="bg-white p-8 rounded-[2.5rem] border border-white shadow-sm flex items-center justify-between relative overflow-hidden group">
                  <div className="relative z-10">
                     <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Pass Rate</p>
                     <h3 className="text-5xl font-black text-slate-900 mt-2">{passRate}%</h3>
                  </div>
                  <div className="w-16 h-16 rounded-3xl bg-emerald-50 flex items-center justify-center text-emerald-500 relative z-10 transition-transform group-hover:scale-110">
                     <span className="material-symbols-outlined text-3xl">verified</span>
                  </div>
               </div>
            </div>

            {/* Submissions Table */}
            <section className="bg-white rounded-[2.5rem] p-2 shadow-sm border border-white space-y-6">
               <div className="px-8 pt-6 flex items-center justify-between">
                  <h3 className="text-[15px] font-extrabold text-slate-900">Student Submissions</h3>
                  <button className="text-[10px] font-black text-primary uppercase tracking-widest">Global Export</button>
               </div>
               <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300 border-b border-slate-50">
                      <th className="px-8 py-6">Student Name</th>
                      <th className="px-8 py-6">Score</th>
                      <th className="px-8 py-6">Time Spent</th>
                      <th className="px-8 py-6 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {selectedQuiz.submissions.map((sub: any) => (
                      <tr key={sub.id} className="group hover:bg-slate-50/50 transition-all">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-sm relative overflow-hidden shadow-sm", getNameColor(sub.studentName))}>
                               {getInitials(sub.studentName)}
                            </div>
                            <div>
                              <p className="text-[13px] font-extrabold text-slate-900 leading-none">{sub.studentName}</p>
                              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">{sub.studentEmail}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <span className={cn(
                              "text-[14px] font-black",
                              sub.percentage >= 75 ? "text-emerald-600" : sub.percentage >= 50 ? "text-indigo-600" : "text-rose-500"
                            )}>
                              {sub.score}/{sub.totalQuestions}
                            </span>
                            <div className="w-20 h-1.5 bg-slate-50 rounded-full overflow-hidden hidden md:block">
                               <div className={cn("h-full rounded-full", sub.percentage >= 75 ? "bg-emerald-500" : "bg-indigo-500")} style={{ width: `${sub.percentage}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <p className="text-[12px] font-bold text-slate-500">{sub.timeSpent || '12m 40s'}</p>
                        </td>
                        <td className="px-8 py-5 text-right">
                           <Badge className="bg-slate-50 text-slate-400 text-[8px] font-black tracking-widest rounded-lg border-none">GRADED</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </section>
          </div>

          <div className="xl:col-span-4 space-y-8">
             <section className="bg-indigo-950 rounded-[2.5rem] p-8 text-white shadow-2xl space-y-8">
                <div>
                   <p className="text-[10px] font-black text-indigo-300/50 uppercase tracking-widest">Question Performance</p>
                   <h3 className="text-xl font-extrabold mt-1">Difficulty Insights</h3>
                </div>

                <div className="space-y-6">
                   <div className="bg-white/5 border border-white/5 rounded-3xl p-6 space-y-4">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[20px]">warning</span>
                         </div>
                         <p className="text-[10px] font-black uppercase tracking-widest">Most Missed Item</p>
                      </div>
                      <p className="text-[13px] font-bold text-indigo-100">Question 4: Steam engine mechanisms in late 18th century coal mining.</p>
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-bold text-indigo-300/40">SUCCESS RATE</span>
                         <span className="text-lg font-black text-rose-400">28%</span>
                      </div>
                      <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">Edit Content</button>
                   </div>

                   <div className="space-y-5">
                      <div className="flex items-center justify-between group cursor-help">
                         <span className="text-[10px] font-bold text-indigo-300/60 uppercase tracking-widest">Q1: Invention Dates</span>
                         <span className="text-[11px] font-black text-emerald-400">82% CORRECT</span>
                      </div>
                      <div className="flex items-center justify-between group cursor-help">
                         <span className="text-[10px] font-bold text-indigo-300/60 uppercase tracking-widest">Q2: Demographic Shifts</span>
                         <span className="text-[11px] font-black text-indigo-400">64% CORRECT</span>
                      </div>
                   </div>
                </div>
             </section>

             <section className="bg-white rounded-[2.5rem] p-8 border border-white shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                   <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Questions Flagged</p>
                   <span className="w-6 h-6 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center text-[10px] font-black">3</span>
                </div>
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl">flag</span>
                   </div>
                   <button className="flex-1 py-3 bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-500/20 hover:scale-[1.02] transition-all">Review Needed</button>
                </div>
             </section>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900">MCQ Submissions</h2>
          <p className="text-[12px] lg:text-[13px] font-semibold text-slate-500">Analyze performance metrics across all available assessments.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
        {quizList.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
             <p className="text-[11px] font-black uppercase text-slate-300 tracking-widest">No quiz submissions found</p>
          </div>
        ) : (
          quizList.map((quiz: any) => (
            <div 
              key={quiz.id} 
              onClick={() => setViewedQuizId(quiz.id)}
              className="bg-white p-8 rounded-[2.5rem] border border-white shadow-sm hover:shadow-xl transition-all group cursor-pointer"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-primary flex items-center justify-center group-hover:bg-indigo-900 group-hover:text-white transition-all">
                  <span className="material-symbols-outlined text-2xl">analytics</span>
                </div>
                <Badge className="bg-indigo-50 text-primary rounded-lg text-[9px] font-black uppercase tracking-widest px-2 py-1">
                   {quiz.count} SUBMISSIONS
                </Badge>
              </div>
              <div className="space-y-4">
                <div>
                   <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest leading-none">{quiz.subject}</p>
                   <h3 className="text-[16px] font-extrabold text-slate-900 mt-2 leading-tight group-hover:text-primary transition-colors">{quiz.title}</h3>
                </div>
                
                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                       <span className="material-symbols-outlined text-sm text-slate-300">verified</span>
                       <span className="text-[10px] font-bold text-slate-500">Avg: {Math.round(quiz.totalScore / quiz.count)}%</span>
                   </div>
                   <span className="material-symbols-outlined text-slate-300 group-hover:translate-x-1 transition-transform">east</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
    );
}

// --- Individual Grading Modal Helper ---
function IndividualGradingModal({ student, subject, allSubjects, assessment, onSave, onCancel, isSaving }: any) {
  const [mark, setMark] = useState('');
  const [comment, setComment] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(subject);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden"
      >
        <div className="p-8 lg:p-10 space-y-8">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-3xl bg-indigo-50 flex items-center justify-center text-primary text-xl font-black">
                {student.fullName.charAt(0)}
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{student.fullName}</h3>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Grading Record Entry</p>
              </div>
            </div>
            <button onClick={onCancel} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject</label>
              <select 
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full h-12 px-4 bg-slate-50 border-none rounded-2xl text-[12px] font-bold text-slate-700 focus:ring-4 ring-primary/10 transition-all"
              >
                {allSubjects.map((s: string) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="p-4 bg-slate-50 rounded-3xl space-y-1">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Assessment</p>
              <p className="text-[13px] font-bold text-slate-700 text-ellipsis overflow-hidden whitespace-nowrap">{assessment}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Score / 100</label>
              <input 
                type="number"
                value={mark}
                onChange={(e) => setMark(e.target.value)}
                placeholder="0-100"
                className="w-full h-16 px-6 bg-slate-50 border-none rounded-3xl text-2xl font-black text-primary focus:ring-4 ring-primary/10 transition-all placeholder:text-slate-200"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Qualitative Observations</label>
              <textarea 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write specific feedback for this student..."
                rows={4}
                className="w-full p-6 bg-slate-50 border-none rounded-3xl text-[14px] font-medium text-slate-600 focus:bg-white focus:ring-4 ring-slate-100 transition-all resize-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <button 
              onClick={onCancel}
              className="flex-1 h-16 rounded-3xl text-[12px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button 
              disabled={isSaving || !mark}
              onClick={() => onSave(student.id, mark, comment, selectedSubject)}
              className="group flex-[2] h-16 bg-indigo-950 text-white rounded-3xl text-[12px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-indigo-950/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <span className="material-symbols-outlined animate-spin">sync</span>
              ) : (
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">grade</span>
              )}
              {isSaving ? 'Submitting...' : 'Confirm Submission'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// --- Quick Add Student Modal ---
function AddStudentModal({ defaultGrade, onCancel, isSaving, onAdd }: any) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    grade: defaultGrade || 'Grade 10',
    studentId: ''
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden"
      >
        <div className="p-8 lg:p-10 space-y-8">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Quick Add Student</h3>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Register new student to roster</p>
            </div>
            <button onClick={onCancel} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
              <input 
                type="text" 
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                placeholder="Ex: Dilshan Methsara"
                className="w-full h-14 px-6 bg-slate-50 border-none rounded-2xl text-[14px] font-bold text-slate-700 focus:ring-4 ring-primary/10 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="student@dampella.lk"
                className="w-full h-14 px-6 bg-slate-50 border-none rounded-2xl text-[14px] font-bold text-slate-700 focus:ring-4 ring-primary/10 transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Grade</label>
                <select 
                  value={formData.grade}
                  onChange={(e) => setFormData({...formData, grade: e.target.value})}
                  className="w-full h-14 px-6 bg-slate-50 border-none rounded-2xl text-[14px] font-bold text-slate-700 focus:ring-4 ring-primary/10 transition-all"
                >
                  {['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'Grade 13'].map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Student ID (Optional)</label>
                <input 
                  type="text" 
                  value={formData.studentId}
                  onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                  placeholder="ID-001"
                  className="w-full h-14 px-6 bg-slate-50 border-none rounded-2xl text-[14px] font-bold text-slate-700 focus:ring-4 ring-primary/10 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <button onClick={onCancel} className="flex-1 h-14 text-[12px] font-black uppercase text-slate-400">Cancel</button>
            <button 
              disabled={isSaving || !formData.fullName || !formData.email}
              onClick={() => onAdd(formData)}
              className="flex-[2] h-14 bg-indigo-950 text-white rounded-2xl text-[12px] font-black uppercase shadow-xl shadow-indigo-950/20 disabled:opacity-50"
            >
              {isSaving ? 'Adding...' : 'Add Student'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// --- Student Grading (Mark Entry) Component ---
function StudentGradingView({ user, students }: { user: User, students: any[] }) {
  const [grade, setGrade] = useState('Grade 10');
  const [subject, setSubject] = useState(user.subjectsTaught?.[0] || 'Mathematics');
  const [assessment, setAssessment] = useState('Midterm Examination');
  const [marks, setMarks] = useState<Record<string, { mark: string, comment: string, status: 'SAVED' | 'PENDING' }>>({});
  const [recentMarks, setRecentMarks] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentForGrading, setSelectedStudentForGrading] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Filter students based on selected grade and search query
  const filteredStudents = students
    .filter(s => {
      if (!grade) return true;
      // Robust grade extraction from various potential fields
      const studentGradeRaw = s.grade || s.gradeClass || s.grade_class || s.Role_Class || '';
      const normalize = (g: any) => g?.toString().replace(/\D/g, '') || '';
      
      const studentGradeNorm = normalize(studentGradeRaw);
      const selectedGradeNorm = normalize(grade);
      
      // Matches if normalized digits match (e.g. "10" === "10") 
      // or if exact strings match (e.g. "Grade 10" === "Grade 10")
      return (studentGradeNorm !== '' && studentGradeNorm === selectedGradeNorm) || 
             studentGradeRaw.toString().toLowerCase() === grade.toString().toLowerCase();
    })
    .filter(s => s.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                 (s.studentId && s.studentId.toString().toLowerCase().includes(searchQuery.toLowerCase())));

  // Calculate statistics
  const totalStudents = filteredStudents.length;
  const gradedCount = filteredStudents.filter(s => marks[s.id]?.mark && marks[s.id]?.mark !== '').length;
  const classAvg = totalStudents > 0 
    ? Math.round(filteredStudents.reduce((acc, s) => acc + (parseFloat(marks[s.id]?.mark) || 0), 0) / (gradedCount || 1))
    : 0;

  const handleMarkChange = (studentId: string, value: string) => {
    setMarks(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], mark: value, status: 'PENDING' }
    }));
  };

  const handleCommentChange = (studentId: string, value: string) => {
    setMarks(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], comment: value, status: 'PENDING' }
    }));
  };

  // Load existing marks on filter change
  useEffect(() => {
    if (!grade || !subject || !assessment) return;

    const q = query(
      collection(db, "manual_grades"),
      where("grade", "==", grade),
      where("subject", "==", subject),
      where("assessment", "==", assessment)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data: Record<string, any> = {};
      snapshot.docs.forEach(doc => {
        const d = doc.data();
        data[d.studentId] = { 
          mark: d.mark.toString(), 
          comment: d.comment || '', 
          status: 'SAVED' 
        };
      });
      setMarks(data);
    }, (err) => {
      console.error("Grading loading error:", err);
    });

    return () => unsub();
  }, [grade, subject, assessment]);

  // Load recent submissions for this teacher
  useEffect(() => {
     if (!user) return;
     const q = query(
        collection(db, "manual_grades"),
        where("teacherId", "==", user.teacherId || user.email),
        orderBy("updatedAt", "desc"),
        limit(5)
     );

     const unsub = onSnapshot(q, (snapshot) => {
        setRecentMarks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
     }, (err) => {
        console.error("Recent history listener error:", err);
     });

     return () => unsub();
  }, [user]);

  // SAVE INDIVIDUAL MARK
  const handleSaveIndividualMark = async (studentId: string, markValue: string, commentValue: string, overrideSubject?: string) => {
    setIsSaving(true);
    const activeSubject = overrideSubject || subject;
    try {
      const docId = `${studentId}_${activeSubject}_${assessment}`.replace(/\s+/g, '_').toLowerCase();
      const markRef = doc(db, "manual_grades", docId);
      
      const student = filteredStudents.find(s => s.id === studentId || students.find(xs => xs.id === studentId));
      
      await setDoc(markRef, {
        studentId: studentId,
        studentName: student?.fullName || 'Unknown Student',
        grade: student?.grade || grade,
        subject: activeSubject,
        assessment: assessment,
        mark: parseFloat(markValue) || 0,
        comment: commentValue || '',
        teacherId: user.teacherId || user.email,
        updatedAt: serverTimestamp()
      }, { merge: true });

      // Trigger Student Notification
      await createNotification({
        userId: studentId,
        senderId: user.uid,
        senderName: user.fullName || 'Faculty',
        title: 'New Grade Published',
        message: `Your mark for ${assessment} (${activeSubject}) has been published.`,
        type: 'grade',
        icon: 'grade',
        link: 'Marks'
      });

      alert(`Mark saved for ${student?.fullName}!`);
      setSelectedStudentForGrading(null);
    } catch (e) {
      console.error("Save error:", e);
      alert("Failed to save mark.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 lg:space-y-10"
    >
      {/* Header & Stats Cards */}
      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900">Student Grading</h2>
            <p className="text-[13px] font-semibold text-slate-500">Batch processing for Academic Term 2024-25</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="space-y-2">
               <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Grade</label>
               <select 
                 value={grade}
                 onChange={(e) => setGrade(e.target.value)}
                 className="h-12 px-4 bg-white border border-slate-100 rounded-2xl text-[12px] font-bold text-slate-600 outline-none focus:border-primary/20 shadow-sm"
               >
                 {['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'Grade 13'].map(g => (
                   <option key={g} value={g}>{g}</option>
                 ))}
               </select>
            </div>
            <div className="space-y-2">
               <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject</label>
               <select 
                 value={subject}
                 onChange={(e) => setSubject(e.target.value)}
                 className="h-12 px-4 bg-white border border-slate-100 rounded-2xl text-[12px] font-bold text-slate-600 outline-none focus:border-primary/20 shadow-sm"
               >
                 {user.subjectsTaught?.map(s => <option key={s}>{s}</option>)}
               </select>
            </div>
            <div className="space-y-2">
               <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Assessment Term</label>
               <select 
                 value={assessment}
                 onChange={(e) => setAssessment(e.target.value)}
                 className="h-12 px-4 bg-white border border-slate-100 rounded-2xl text-[12px] font-bold text-slate-600 outline-none focus:border-primary/20 shadow-sm"
               >
                 <option>Midterm Examination</option>
                 <option>Final Examination</option>
                 <option>Monthly Assessment</option>
                 <option>Unit Test #1</option>
               </select>
            </div>
          </div>
          
          {/* Search Student */}
          <div className="flex-1 max-w-md w-full ml-auto group">
             <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Search Student</label>
             <div className="relative">
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Find student by name or ID..."
                  className="w-full h-12 pl-12 pr-4 bg-white border border-slate-100 rounded-2xl text-[12px] font-bold text-slate-600 outline-none focus:border-primary/20 shadow-sm transition-all group-hover:border-slate-200"
                />
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">search</span>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-white shadow-sm space-y-4">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Students</p>
             <h3 className="text-4xl font-black text-slate-900 tracking-tight">{totalStudents}</h3>
             <div className="pt-4 border-t border-slate-50 flex items-center gap-2 text-primary font-bold text-xs">
                <span className="material-symbols-outlined text-sm">group</span>
                Active Roster
             </div>
          </div>
          <div className="bg-indigo-50 p-8 rounded-[2.5rem] border border-white shadow-sm space-y-4">
             <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Class Average</p>
             <h3 className="text-4xl font-black text-primary tracking-tight">{classAvg}%</h3>
             <div className="pt-4 border-t border-indigo-100/50 flex items-center gap-2 text-primary/60 font-bold text-xs uppercase tracking-widest">
                Targeting 85%
             </div>
          </div>
          <div className="bg-emerald-50 p-8 rounded-[2.5rem] border border-white shadow-sm space-y-4 relative overflow-hidden group">
             <div className="relative z-10 space-y-4">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Grading Progress</p>
                <h3 className="text-4xl font-black text-emerald-900 tracking-tight">{gradedCount}/{totalStudents}</h3>
                <div className="w-full h-2 bg-emerald-100 rounded-full overflow-hidden">
                   <div 
                     className="h-full bg-emerald-500 transition-all duration-1000" 
                     style={{ width: `${(gradedCount/totalStudents)*100}%` }}
                   />
                </div>
             </div>
             <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100/50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
          </div>
        </div>
      </div>

      {/* Student Roster Table */}
      <div className="bg-white rounded-[2.5rem] p-2 lg:p-4 shadow-sm border border-white overflow-hidden">
        <div className="p-6 lg:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                <span className="material-symbols-outlined">list_alt</span>
             </div>
             <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Active Roster</h3>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 bg-slate-50/50">
                <th className="px-8 py-6 rounded-l-2xl">Student Details</th>
                <th className="px-8 py-6 text-center">Current Mark</th>
                <th className="px-8 py-6 text-center">Status</th>
                <th className="px-8 py-6 text-right rounded-r-2xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-200">
                        <span className="material-symbols-outlined text-4xl">person_search</span>
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No Students Found</p>
                        <p className="text-[10px] font-bold text-slate-300 mt-1 max-w-[240px] mx-auto">
                          {searchQuery 
                            ? "No matching results for your current search." 
                            : `Ensure your students are assigned to "${grade}" in their profiles.`}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : filteredStudents.map((student) => (
                <tr key={student.id} className="group hover:bg-slate-50/50 transition-all">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-primary text-xs font-black">
                         {student.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[13px] font-extrabold text-slate-900 leading-none">{student.fullName}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight lowercase">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="text-[18px] font-black text-primary">
                      {marks[student.id]?.mark || '--'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <Badge className={cn(
                      "text-[8px] font-black tracking-widest border-none px-3 py-1",
                      marks[student.id]?.status === 'SAVED' ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400"
                    )}>
                       {marks[student.id]?.status || 'PENDING'}
                    </Badge>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={() => setSelectedStudentForGrading(student)}
                      className="px-6 py-2 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all"
                    >
                      Enter Mark
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedStudentForGrading && (
          <IndividualGradingModal 
            student={selectedStudentForGrading}
            subject={subject}
            allSubjects={user.subjectsTaught || ['General']}
            assessment={assessment}
            isSaving={isSaving}
            onCancel={() => setSelectedStudentForGrading(null)}
            onSave={(id: string, m: string, c: string, s: string) => handleSaveIndividualMark(id, m, c, s)}
          />
        )}
      </AnimatePresence>

      {/* Recent Submissions Section */}
      <div className="space-y-6">
         <div className="flex items-center gap-3 pl-1">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
               <span className="material-symbols-outlined text-[18px]">history</span>
            </div>
            <div>
               <h3 className="text-[16px] font-extrabold text-slate-900 tracking-tight leading-none">Recent Submissions</h3>
               <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">Your latest activity feed</p>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6 pb-10">
            {recentMarks.length === 0 ? (
               <div className="col-span-full py-10 bg-white rounded-3xl border border-dashed border-slate-200 text-center">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No recent submissions found</p>
               </div>
            ) : recentMarks.map((m) => (
               <div key={m.id} className="bg-white p-5 rounded-3xl border border-white shadow-sm flex flex-col justify-between hover:shadow-md transition-all group">
                  <div className="space-y-3">
                     <div className="flex justify-between items-start">
                        <Badge className="bg-emerald-50 text-emerald-600 border-none text-[7px] font-black tracking-widest px-2 py-0.5">SAVED</Badge>
                        <span className="text-[8px] font-bold text-slate-300 uppercase">{m.updatedAt?.toDate ? new Date(m.updatedAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pending'}</span>
                     </div>
                     <div>
                        <p className="text-[11px] font-extrabold text-slate-900 leading-tight group-hover:text-primary transition-colors">{m.studentName}</p>
                        <p className="text-[9px] font-bold text-slate-400 mt-0.5">{m.subject}</p>
                     </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                     <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{m.assessment?.split(' ')[0]}</span>
                     <span className="text-[14px] font-black text-primary">{m.mark}</span>
                  </div>
               </div>
            ))}
         </div>
      </div>
    </motion.div>
  );
}

// --- Mark History View Component ---
function MarkHistoryView({ history }: { history: any[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredHistory = history.filter(h => 
    h.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.subject?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 lg:space-y-10"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900">Mark History</h2>
          <p className="text-[13px] font-semibold text-slate-500">Comprehensive audit of all marks ever submitted by you.</p>
        </div>
        
        <div className="flex-1 max-w-md w-full relative group">
           <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors text-lg">search</span>
           <input 
             type="text"
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             placeholder="Search by student or subject..."
             className="w-full h-11 pl-12 pr-4 bg-white border border-slate-100 rounded-2xl text-[12px] font-bold text-slate-600 outline-none focus:border-primary/20 shadow-sm transition-all"
           />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 bg-slate-50/50">
                <th className="px-8 py-6 rounded-l-2xl">Student</th>
                <th className="px-8 py-6">Subject</th>
                <th className="px-8 py-6">Term</th>
                <th className="px-8 py-6 text-center">Mark</th>
                <th className="px-8 py-6 text-right rounded-r-2xl">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-200">
                        <span className="material-symbols-outlined text-4xl">history</span>
                      </div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No history records found</p>
                    </div>
                  </td>
                </tr>
              ) : filteredHistory.map((entry) => (
                <tr key={entry.id} className="group hover:bg-slate-50/50 transition-all">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-primary text-xs font-black">
                         {entry.studentName?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <p className="text-[13px] font-extrabold text-slate-900 leading-none">{entry.studentName}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">ID: {entry.studentId?.slice(-6)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[13px] font-bold text-slate-700">{entry.subject}</span>
                  </td>
                  <td className="px-8 py-5">
                    <Badge variant="outline" className="text-[8px] font-black tracking-widest border-indigo-100 text-indigo-400">
                       {entry.assessment || 'Term Exam'}
                    </Badge>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="text-[18px] font-black text-primary">{entry.mark}</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <p className="text-[11px] font-extrabold text-slate-400 uppercase">
                      {entry.updatedAt?.toDate ? new Date(entry.updatedAt.toDate()).toLocaleDateString() : 'Recent'}
                    </p>
                    <p className="text-[9px] font-bold text-slate-300 uppercase mt-0.5">
                      {entry.updatedAt?.toDate ? new Date(entry.updatedAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

// --- Teacher Settings View Component ---
function TeacherSettingsView({ user }: { user: any }) {
  const { updateProfile, updatePassword } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('Profile');
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Profile State
  const [fullName, setFullName] = useState(user.fullName || '');
  const [whatsapp, setWhatsapp] = useState(user.whatsappNumber || '');
  
  // Subjects Selection State
  const [dbSubjects, setDbSubjects] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(user.subjectsTaught || []);
  
  // Security State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Fetch unique subjects from database
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const subjectsSet = new Set<string>();
        
        // 1. Add Institutional Core Subjects (from dashboards.tsx/auth-forms.tsx)
        const coreSubjects = [
          'Sinhala', 'English', 'Science', 'Mathematics', 'Geography', 
          'ICT', 'Agri', 'Home Science', 'History', 'Drama', 
          'Music', 'Civic Education', 'Buddhism'
        ];
        coreSubjects.forEach(s => subjectsSet.add(s));

        // 2. Aggregate subjects discovered in active modules
        const collectionsToScan = ["quizzes", "assignments", "past_papers"];
        
        await Promise.all(collectionsToScan.map(async (colName) => {
          try {
            const snap = await getDocs(collection(db, colName));
            snap.forEach(doc => {
              const data = doc.data();
              const s = data.subject || data.subject_name;
              if (s && typeof s === 'string') {
                // Capitalize first letter for consistency
                const formatted = s.trim().charAt(0).toUpperCase() + s.trim().slice(1);
                subjectsSet.add(formatted);
              }
            });
          } catch (err) {
            console.warn(`Discovery scan failed for collection: ${colName}`, err);
          }
        }));

        setDbSubjects(Array.from(subjectsSet).sort());
      } catch (e) {
        console.error("Critical error in subject discovery:", e);
      }
    };
    fetchSubjects();
  }, []);

  const toggleSubject = (s: string) => {
    setSelectedSubjects(prev => 
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    const success = await updateProfile({
      fullName,
      whatsappNumber: whatsapp,
      subjectsTaught: selectedSubjects
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
        <p className="text-[13px] font-semibold text-slate-500">Customize your professional profile and security settings.</p>
      </div>

      <div className="flex items-center gap-2 p-1 bg-slate-100/50 rounded-2xl w-fit">
        {['Profile', 'Professional', 'Security'].map(tab => (
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
                   value={whatsapp}
                   onChange={(e) => setWhatsapp(e.target.value)}
                   className="w-full h-14 px-6 bg-slate-50 border-none rounded-2xl text-[13px] font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                 />
              </div>
              <div className="space-y-3">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Faculty ID</label>
                 <input 
                   type="text" 
                   value={user.teacherId || 'T-1234'} 
                   disabled
                   className="w-full h-14 px-6 bg-slate-50 border-none rounded-2xl text-[13px] font-bold text-slate-300 outline-none cursor-not-allowed"
                 />
              </div>
              <div className="space-y-3">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
                 <input 
                   type="text" 
                   value={user.email} 
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

      {activeSubTab === 'Professional' && (
        <form onSubmit={handleUpdateProfile} className="bg-white rounded-[2.5rem] border border-white shadow-sm p-8 lg:p-12 space-y-8">
           <div className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Actual Subjects in Database</label>
                 <p className="text-[11px] font-medium text-slate-400 ml-1 mb-4">Select the subjects you are currently teaching from our validated list.</p>
                 
                 <div className="flex flex-wrap gap-2">
                    {dbSubjects.map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleSubject(s)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-[11px] font-bold transition-all border",
                          selectedSubjects.includes(s)
                            ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                            : "bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-200"
                        )}
                      >
                        {s}
                      </button>
                    ))}
                 </div>
              </div>
           </div>
           
           <div className="pt-4 border-t border-slate-50">
              <button 
                type="submit"
                disabled={isUpdating}
                className="px-10 py-4 bg-indigo-950 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isUpdating ? 'Saving...' : 'Update Expertise'}
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

// --- Teacher Notifications View Component ---
function TeacherNotificationsView({ notifications }: { notifications: any[] }) {
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
         <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">LMS Briefings</h2>
         <p className="text-sm font-medium text-slate-400">Keep track of your classes and institutional alerts.</p>
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
                 <div className="flex items-center gap-3 pt-2">
                    {!note.isRead && (
                       <button 
                         onClick={() => handleMarkAsRead(note.id)}
                         className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
                       >
                         Mark as Read
                       </button>
                    )}
                 </div>
              </div>
           </div>
         )) : (
            <div className="bg-white/50 border border-dashed border-slate-200 rounded-[2.5rem] p-12 text-center">
              <p className="text-slate-400 text-xs font-bold font-sans">No institutional alerts currently active.</p>
            </div>
         )}
      </div>
    </motion.div>
  );
}

// --- Teacher Past Paper Upload Component ---
function TeacherPastPaperUpload({ user }: { user: any }) {
  const [isPublishing, setIsPublishing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subject: user.subjectsTaught?.[0] || 'General',
    year: new Date().getFullYear().toString(),
    type: 'Official Past Paper'
  });
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const fileRefInput = React.useRef<HTMLInputElement>(null);
  // Load teacher's own past papers
  const [teacherPapers, setTeacherPapers] = useState<any[]>([]);
  useEffect(() => {
    if (!user?.uid) return;
    const papersQuery = query(collection(db, "past_papers"), where("publisherId", "==", user.uid), orderBy("publishedAt", "desc"));
    const unsub = onSnapshot(papersQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTeacherPapers(data);
    });
    return () => unsub();
  }, [user]);

  const handlePublish = async () => {
    if (!formData.title) return alert("Please enter a title");
    if (!attachmentFile) return alert("Please attach a PDF file");
    
    setIsPublishing(true);
    let attachmentUrl = '';

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', attachmentFile);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        throw new Error(uploadData.error || 'Failed to upload document');
      }
      attachmentUrl = uploadData.url;

      await addDoc(collection(db, 'past_papers'), {
        title: formData.title,
        subject: formData.subject,
        year: formData.year,
        type: formData.type,
        url: attachmentUrl,
        publisherId: user.uid,
        publishedAt: serverTimestamp()
      });

      // Trigger Global Notification
      await notifyAllStudents({
        senderId: user.uid,
        senderName: user.fullName || 'Faculty',
        title: 'New Resource in Library',
        message: `A new ${formData.subject} ${formData.type} (${formData.year}) has been published.`,
        type: 'assignment',
        icon: 'menu_book',
        link: 'PastPapers'
      });

      alert("Past paper published successfully!");
      setFormData({ ...formData, title: '' });
      setAttachmentFile(null);
    } catch (error: any) {
      console.error("Error publishing past paper:", error);
      alert("Failed to publish past paper: " + error.message);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl space-y-8"
    >
      <div className="space-y-1 text-center md:text-left">
         <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">Resource Library Setup</h2>
         <p className="text-sm font-medium text-slate-400">Upload official past papers and model papers for student access.</p>
         {/* Show teacher's selected subjects */}
         <div className="flex flex-wrap gap-2 mt-2">
           {user.subjectsTaught && user.subjectsTaught.length > 0 ? (
             user.subjectsTaught.map((sub: string, idx: number) => (
               <span key={idx} className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">{sub}</span>
             ))
           ) : (
             <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">No subjects assigned</span>
           )}
         </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 lg:p-12 shadow-sm border border-white space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/30 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Paper Title</label>
              <input 
                type="text" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="e.g. 2024 G.C.E. O/L Mathematics"
                className="w-full h-14 px-6 bg-slate-50 border-none rounded-2xl text-[13px] font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Subject</label>
              <select 
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                className="w-full h-14 px-6 bg-slate-50 border-none rounded-2xl text-[13px] font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/10 transition-all"
              >
                <option>Science</option>
                <option>Mathematics</option>
                <option>Physics</option>
                <option>Chemistry</option>
                <option>ICT</option>
                <option>English</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Year</label>
              <input 
                type="text" 
                value={formData.year}
                onChange={(e) => setFormData({...formData, year: e.target.value})}
                className="w-full h-14 px-6 bg-slate-50 border-none rounded-2xl text-[13px] font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Paper Type</label>
              <select 
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full h-14 px-6 bg-slate-50 border-none rounded-2xl text-[13px] font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/10 transition-all"
              >
                <option>Official Past Paper</option>
                <option>Model Paper</option>
                <option>School Term Test</option>
              </select>
            </div>
        </div>

        <div className="relative z-10 space-y-3 pt-4 border-t border-slate-50">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">PDF Document</label>
            <div 
              onClick={() => fileRefInput.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-[2rem] p-10 flex flex-col items-center justify-center text-center gap-4 group transition-all cursor-pointer relative overflow-hidden",
                attachmentFile 
                  ? "border-emerald-200 bg-emerald-50/30" 
                  : "border-slate-100 hover:border-primary/20 hover:bg-slate-50/50"
              )}
            >
              <input 
                type="file"
                ref={fileRefInput}
                onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
                accept=".pdf"
                className="hidden"
              />
              
              {attachmentFile ? (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 z-10">
                    <span className="material-symbols-outlined text-2xl">description</span>
                  </div>
                  <div className="z-10">
                    <h4 className="text-[13px] font-extrabold text-emerald-950 font-sans truncate max-w-[250px]">{attachmentFile.name}</h4>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setAttachmentFile(null); }}
                      className="text-[9px] font-black text-rose-500 uppercase tracking-widest mt-2 hover:text-rose-600 transition-colors"
                    >
                      Remove File
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all group-hover:scale-110 group-hover:shadow-lg z-10">
                    <span className="material-symbols-outlined text-2xl">cloud_upload</span>
                  </div>
                  <div className="z-10">
                    <h4 className="text-[13px] font-extrabold text-slate-700 font-sans">Click to browse or drag PDF here</h4>
                    <p className="text-[11px] font-medium text-slate-400 mt-1 max-w-xs mx-auto">Supports .pdf formats up to 25MB.</p>
                  </div>
                </>
              )}
            </div>
        </div>

        <div className="relative z-10 pt-6">
          <button 
            onClick={handlePublish}
            disabled={isPublishing}
            className="w-full py-5 bg-primary text-white text-[12px] font-black uppercase tracking-widest rounded-2xl hover:bg-blue-600 hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]"
          >
                      {isPublishing ? 'Uploading & Publishing...' : 'Publish to Student Library'}
          </button>
        </div>
        {/* Teacher's Uploaded Past Papers */}
        <div className="mt-6">
          {teacherPapers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {teacherPapers.map((paper) => (
                <div key={paper.id} className="bg-white p-6 rounded-[2rem] border border-white shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                  <div className="relative z-10 flex items-start gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                      <span className="material-symbols-outlined text-[24px]">menu_book</span>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-[14px] font-extrabold text-slate-900">{paper.title}</h4>
                      <p className="text-[10px] font-black text-slate-400 uppercase">{paper.subject} • {paper.year}</p>
                      <span className="px-2.5 py-1 bg-slate-50 text-slate-500 rounded-lg text-[9px] font-black uppercase">{paper.type}</span>
                      <button onClick={() => window.open(paper.url, '_blank')} className="mt-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">
                        Open PDF
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No past papers uploaded yet.</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function TeacherDashboard({ user, onLogout, onBackToWebsite }: TeacherDashboardProps) {
  const [activeTab, setActiveTab] = useState('Overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    avgGpa: 0,
    attendance: 0,
    pendingSubmissions: 0,
    totalGraded: 0,
    studentCount: 0
  });
  const [activeAssignments, setActiveAssignments] = useState<any[]>([]);
  const [gradingQueue, setGradingQueue] = useState<any[]>([]);
  const [quizSubmissions, setQuizSubmissions] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [fullHistory, setFullHistory] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedQuizForReview, setSelectedQuizForReview] = useState<any>(null);

  // --- Real-time Data Listeners ---
  useEffect(() => {
    if (!user) return;

    // 1. Fetch Students & Stats (Profiles)
    const studentsQuery = query(collection(db, "profiles"), where("role", "==", "student"));
    const unsubStudents = onSnapshot(studentsQuery, (snapshot) => {
      const studentData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudents(studentData);
      
      const gpas = studentData.map((s: any) => s.gpa || 0).filter(g => g > 0);
      const totalAttendance = studentData.reduce((acc: number, s: any) => acc + (s.attendance || 0), 0);
      
      setStats(prev => ({
        ...prev,
        studentCount: snapshot.size,
        avgGpa: gpas.length > 0 ? Number((gpas.reduce((a, b) => a + b, 0) / gpas.length).toFixed(2)) : 0,
        attendance: snapshot.size > 0 ? Math.round(totalAttendance / snapshot.size) : 0
      }));
    }, (err) => {
      console.error("Main dashboard listener error:", err);
    });

    // 2. Fetch Active Assignments
    const assignmentsQuery = query(
      collection(db, "assignments"), 
      where("teacher_email", "==", user.email),
      orderBy("created_at", "desc"),
      limit(10)
    );
    const unsubAssignments = onSnapshot(assignmentsQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setActiveAssignments(data);
    });

    // 3. Fetch Grading Queue (Submissions)
    const submissionsQuery = query(
      collection(db, "assignment_submissions"),
      where("status", "==", "pending"),
      limit(50)
    );
    const unsubSubmissions = onSnapshot(submissionsQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGradingQueue(data);
      setStats(prev => ({ ...prev, pendingSubmissions: snapshot.size }));
      setIsLoading(false);
    });

    // 4. Fetch Quiz Submissions
    const quizSubQuery = query(
      collection(db, "quiz_submissions"),
      orderBy("createdAt", "desc"),
      limit(100)
    );
    const unsubQuizSubs = onSnapshot(quizSubQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setQuizSubmissions(data);
    });

    // 5. Fetch Full Mark History
    const historyQuery = query(
      collection(db, "manual_grades"),
      where("teacherId", "==", user.teacherId || user.email),
      orderBy("updatedAt", "desc")
    );
    const unsubHistory = onSnapshot(historyQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFullHistory(data);
    });

    // 6. Fetch Notifications
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
      unsubStudents();
      unsubAssignments();
      unsubSubmissions();
      unsubQuizSubs();
      unsubHistory();
      unsubNotifications();
    };
  }, [user]);

  const navItems = [
    { name: 'Overview', icon: 'dashboard', id: 'Overview' },
    { name: 'Assignments', icon: 'assignment', id: 'Assignments' },
    { name: 'AI Generator', icon: 'auto_awesome', id: 'AI Generator' },
    { name: 'Student Grading', icon: 'fact_check', id: 'Grading' },
    { name: 'Mark History', icon: 'history_edu', id: 'History' },
    { name: 'Submissions', icon: 'how_to_reg', id: 'Submissions' },
    { name: 'Students', icon: 'group', id: 'Students' },
    { name: 'Resources', icon: 'folder', id: 'Resources' },
    { name: 'Notifications', icon: 'notifications', id: 'Notifications' },
    { name: 'Settings', icon: 'settings', id: 'Settings' },
  ];

  const bottomNavItems = [
    { name: 'Support', icon: 'help_outline', id: 'Support' },
  ];

  return (
    <div className="flex h-screen bg-[#f8f9fc] font-sans selection:bg-primary/10 overflow-hidden portal-theme flex-col lg:flex-row relative">
      
      {/* Mobile Toolbar */}
      <div className="lg:hidden h-16 bg-white border-b border-slate-100 px-6 flex items-center justify-between shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-xl">school</span>
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
            ? (isSidebarOpen ? 0 : -256) 
            : 0 
        }}
        className={cn(
          "bg-white border-r border-slate-100 flex flex-col shrink-0 transition-transform lg:transition-none duration-300 ease-in-out",
          "fixed inset-y-0 left-0 w-64 z-[70] lg:static lg:w-64 lg:translate-x-0 overflow-y-auto custom-scrollbar"
        )}
      >
        {/* Sidebar Close Button */}
        <div className="lg:hidden absolute top-4 right-4">
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-primary transition-all"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Logo */}
        <div className="p-8 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-xl">school</span>
            </div>
            <div>
              <h1 className="font-extrabold text-sm tracking-tight text-slate-900 leading-none">Dampella LMS</h1>
              <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mt-0.5">Teacher Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1 mt-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (window.innerWidth < 1024) setIsSidebarOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group",
                activeTab === item.id 
                  ? "bg-indigo-50 text-primary" 
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
              )}
            >
              <span className={cn(
                "material-symbols-outlined text-[20px] transition-colors",
                activeTab === item.id ? "text-primary" : "text-slate-300 group-hover:text-slate-400"
              )}>
                {item.icon}
              </span>
              <span className="text-xs font-bold tracking-tight">{item.name}</span>
              {activeTab === item.id && (
                <motion.div 
                  layoutId="active-nav-indicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                />
              )}
            </button>
          ))}
        </nav>

        {/* Bottom Nav */}
        <div className="px-4 py-8 space-y-1">
          <button 
            onClick={() => setActiveTab('Assignments')}
            className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all mb-4"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span className="text-xs font-black uppercase tracking-wider">New Assignment</span>
          </button>

          {bottomNavItems.map((item) => (
             <button
              key={item.id}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all group"
            >
              <span className="material-symbols-outlined text-[20px] text-slate-300 group-hover:text-slate-400">
                {item.icon}
              </span>
              <span className="text-xs font-bold tracking-tight">{item.name}</span>
            </button>
          ))}

          <button 
            onClick={onBackToWebsite}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-primary hover:bg-indigo-50 transition-all group mt-1"
          >
            <span className="material-symbols-outlined text-[20px] text-slate-300 group-hover:text-primary/60">language</span>
            <span className="text-xs font-bold tracking-tight">Public Website</span>
          </button>

          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-error hover:bg-error/5 transition-all group mt-1"
          >
            <span className="material-symbols-outlined text-[20px] text-slate-300 group-hover:text-error/60">logout</span>
            <span className="text-xs font-bold tracking-tight">Sign Out</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar">
        
        {/* Header */}
        <header className="px-6 lg:px-10 py-6 bg-white/50 backdrop-blur-md sticky lg:static top-0 z-40 flex items-center justify-between border-b border-white">
          <div className="flex-1 max-w-xs md:max-w-md relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors text-lg">search</span>
            <input 
              type="text" 
              placeholder="Search..."
              className="w-full h-10 lg:h-11 pl-12 pr-4 bg-white/80 rounded-2xl text-[12px] lg:text-[13px] font-semibold text-slate-600 placeholder:text-slate-300 outline-none border border-transparent focus:border-indigo-100 transition-all shadow-sm"
            />
          </div>

          <div className="flex items-center gap-3 lg:gap-6 ml-4 shrink-0">
            <div className="hidden md:flex items-center gap-2">
              <button 
                onClick={() => setActiveTab('Notifications')}
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm relative",
                  activeTab === 'Notifications' ? "bg-primary text-white" : "bg-white text-slate-400 hover:text-primary"
                )}
              >
                <span className="material-symbols-outlined text-[22px]">notifications</span>
                {notifications.some(n => !n.isRead) && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-emerald-400 border-2 border-white" />
                )}
              </button>
              <button 
                onClick={() => setActiveTab('Settings')}
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm relative",
                  activeTab === 'Settings' ? "bg-primary text-white" : "bg-white text-slate-400 hover:text-primary"
                )}
              >
                <span className="material-symbols-outlined text-[22px]">settings</span>
              </button>
            </div>

            <div className="hidden md:block h-8 w-px bg-slate-100 mx-1" />

            <div 
              onClick={() => setActiveTab('Settings')}
              className="flex items-center gap-3 cursor-pointer group hover:bg-slate-50 p-2 rounded-2xl transition-all"
            >
              <div className="text-right hidden sm:block">
                <p className="text-[12px] lg:text-[13px] font-extrabold text-slate-900 leading-none group-hover:text-primary transition-colors">
                  {user.fullName || 'Faculty'}
                </p>
                <p className="text-[8px] lg:text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Faculty Member</p>
              </div>
              <div className="w-9 h-9 lg:w-11 lg:h-11 rounded-xl lg:rounded-2xl overflow-hidden border-2 border-white shadow-sm group-hover:border-primary transition-all">
                 {user.photoURL ? (
                    <img src={user.photoURL} className="w-full h-full object-cover" alt="Profile" />
                 ) : (
                    <div className={cn("w-full h-full flex items-center justify-center text-white font-black text-xs lg:text-sm", getNameColor(user.fullName || 'Faculty'))}>
                       {getInitials(user.fullName || 'Faculty')}
                    </div>
                 )}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Grid */}
        <main className="p-6 lg:p-10 space-y-8 lg:space-y-10 max-w-[1400px]">
          
          {activeTab === 'Overview' && (
            <>
              {/* Hero Summary */}
              <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="space-y-2">
                  <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900">Morning, {user.fullName.split(' ')[0]}.</h2>
                  <p className="text-[12px] lg:text-[13px] font-semibold text-slate-500">
                    You have <span className="text-primary font-bold">{stats.pendingSubmissions} new submissions</span> to review.
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <div className="px-3 py-1.5 lg:px-4 lg:py-2 bg-white rounded-xl shadow-sm border border-slate-50 flex items-center gap-2">
                    <span className="text-[8px] lg:text-[9px] font-black tracking-widest uppercase text-slate-400">Term</span>
                    <span className="text-[11px] lg:text-xs font-extrabold text-primary">Fall 2024</span>
                  </div>
                </div>
              </section>

              {/* Stats Bento Grid */}
              <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
                {[
                  { label: 'AVERAGE GPA', value: stats.avgGpa.toString(), trend: '+0.12 vs LW', color: 'bg-indigo-50 text-indigo-600', icon: 'trending_up', iconColor: 'text-indigo-400' },
                  { label: 'ATTENDANCE RATE', value: `${stats.attendance}%`, trend: null, color: 'bg-emerald-50 text-emerald-600', icon: 'person_check', iconColor: 'text-emerald-400' },
                  { label: 'PENDING SUBMISSIONS', value: stats.pendingSubmissions.toString(), trend: null, color: 'bg-primary text-white shadow-xl shadow-primary/20', icon: 'pending_actions', iconColor: 'text-white/40', isDark: true },
                  { label: 'TOTAL STUDENTS', value: stats.studentCount.toString(), trend: null, color: 'bg-indigo-50 text-indigo-600', icon: 'group', iconColor: 'text-indigo-400' },
                ].map((stat, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={cn("p-5 lg:p-6 rounded-[1.75rem] lg:rounded-[2rem] flex flex-col justify-between h-[140px] lg:h-[160px] relative overflow-hidden group hover:scale-[1.01] transition-all", stat.color)}
                  >
                    <div className="relative z-10 flex justify-between items-start">
                      <div className="space-y-0.5 lg:space-y-1">
                        <p className={cn("text-[8px] lg:text-[9px] font-black tracking-widest uppercase", stat.isDark ? "text-white/60" : "text-slate-400")}>{stat.label}</p>
                        <h3 className="text-3xl lg:text-4xl font-black tracking-tight">{stat.value}</h3>
                      </div>
                      {stat.trend && (
                        <div className="bg-white/40 backdrop-blur-md px-2 py-1 rounded-lg text-[8px] lg:text-[9px] font-bold">
                          {stat.trend}
                        </div>
                      )}
                    </div>
                    <div className="relative z-10">
                      <div className={cn("w-9 h-9 lg:w-10 lg:h-10 rounded-xl flex items-center justify-center", stat.isDark ? "bg-white/10" : "bg-white shadow-sm")}>
                          <span className={cn("material-symbols-outlined text-lg lg:text-xl", stat.iconColor)}>{stat.icon}</span>
                      </div>
                    </div>
                    <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                  </motion.div>
                ))}
              </section>

              {/* Main sections grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
                
                {/* Left Content */}
                <div className="lg:col-span-12 xl:col-span-8 space-y-8 lg:space-y-10">
                  
                  {/* Active Assignments */}
                  <section className="space-y-4 lg:space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-md lg:text-lg font-extrabold text-slate-900 tracking-tight pl-1">Active Assignments</h3>
                      <button 
                        onClick={() => setActiveTab('Assignments')}
                        className="text-[10px] lg:text-[11px] font-black uppercase tracking-widest text-primary hover:underline"
                      >
                        View All
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-3">
                      {activeAssignments.length === 0 ? (
                        <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-200 text-center">
                          <p className="text-slate-400 text-xs font-bold font-sans">No active assignments found.</p>
                        </div>
                      ) : activeAssignments.map((item, idx) => (
                        <div key={idx} className="bg-white p-4 lg:p-5 rounded-2xl flex items-center justify-between shadow-sm border border-white hover:border-slate-100 transition-all group">
                          <div className="flex items-center gap-3 lg:gap-4">
                            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                              <span className="material-symbols-outlined text-primary text-xl">description</span>
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-[12px] lg:text-[13px] font-extrabold text-slate-900 truncate">{item.title}</h4>
                              <p className="text-[9px] lg:text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider truncate">
                                DUE {item.dueDate || 'NO DATE'} — <span className="text-primary">{item.gradeClass}</span>
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 lg:gap-4 ml-4">
                            <div className={cn(
                              "px-2 py-0.5 lg:px-3 lg:py-1 rounded text-[8px] lg:text-[9px] font-black tracking-widest",
                              "bg-emerald-50 text-emerald-600"
                            )}>
                              ACTIVE
                            </div>
                            {item.attachmentUrl && (
                               <a 
                                 href={item.attachmentUrl} 
                                 target="_blank" 
                                 rel="noopener noreferrer"
                                 className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 hover:bg-primary hover:text-white transition-all shadow-sm"
                                 title="View Reference Material"
                               >
                                  <span className="material-symbols-outlined text-[18px] font-variation-fill">attachment</span>
                               </a>
                            )}
                            <button className="hidden sm:flex w-8 h-8 rounded-lg bg-slate-50 text-slate-400 items-center justify-center hover:bg-primary hover:text-white transition-all shrink-0">
                              <span className="material-symbols-outlined text-lg">edit</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Grading Queue */}
                  <section className="space-y-4 lg:space-y-6">
                    <div className="flex items-center justify-between pl-1">
                      <h3 className="text-md lg:text-lg font-extrabold text-slate-900 tracking-tight">Grading Queue</h3>
                    </div>
                    <div className="bg-white rounded-3xl lg:rounded-[2.5rem] p-2 lg:p-4 shadow-sm border border-white overflow-hidden overflow-x-auto custom-scrollbar">
                      <table className="w-full min-w-[600px] text-left border-collapse">
                        <thead>
                          <tr className="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
                            <th className="px-6 py-4">Student</th>
                            <th className="px-6 py-4">Submission</th>
                            <th className="px-6 py-4">Time</th>
                            <th className="px-6 py-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {gradingQueue.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="px-6 py-10 text-center text-slate-400 text-xs font-bold">
                                No pending submissions to grade.
                              </td>
                            </tr>
                          ) : gradingQueue.map((sub, i) => (
                            <tr key={sub.id} className="group hover:bg-slate-50/50 transition-all">
                              <td className="px-6 py-5 whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                  <div className={cn("w-8 h-8 lg:w-9 lg:h-9 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-sm", getNameColor(sub.studentName))}>
                                     {getInitials(sub.studentName)}
                                  </div>
                                  <span className="text-[12px] lg:text-[13px] font-bold text-slate-900">{sub.studentName}</span>
                                </div>
                              </td>
                              <td className="px-6 py-5 text-[11px] lg:text-[12px] font-semibold text-slate-500 whitespace-nowrap">{sub.subject} - Assignment</td>
                              <td className="px-6 py-5 text-[11px] lg:text-[12px] font-semibold text-slate-400 whitespace-nowrap">
                                {sub.createdAt?.toDate ? new Date(sub.createdAt.toDate()).toLocaleDateString() : 'Just now'}
                              </td>
                              <td className="px-6 py-5 text-right whitespace-nowrap">
                                <button className="px-4 py-1.5 lg:px-5 lg:py-2 bg-indigo-50 text-primary text-[9px] lg:text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary hover:text-white transition-all">Grade Now</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </div>

                {/* Right Aside */}
                <div className="lg:col-span-12 xl:col-span-4 space-y-8 lg:space-y-10">
                  
                  {/* Recent Scores */}
                  <section className="space-y-4 lg:space-y-6">
                    <div className="flex items-center justify-between pl-1">
                      <h3 className="text-md lg:text-lg font-extrabold text-slate-900 tracking-tight">Recent Scores</h3>
                      <button className="text-slate-300 hover:text-primary transition-all">
                        <span className="material-symbols-outlined">more_horiz</span>
                      </button>
                    </div>
                    <div className="bg-white rounded-3xl lg:rounded-[2.5rem] p-6 lg:p-8 shadow-sm border border-white space-y-5 lg:space-y-6">
                      {fullHistory.length > 0 ? (
                        <>
                          {fullHistory.slice(0, 3).map((score, i) => (
                            <div key={i} className="flex items-center justify-between group">
                              <div className="space-y-0.5">
                                <p className="text-[8px] lg:text-[9px] font-black text-primary/40 uppercase tracking-widest leading-none">{score.subject || 'ACADEMIC'}</p>
                                <h4 className="text-[12px] lg:text-[13px] font-bold text-slate-800">{score.studentName || 'Student'}</h4>
                              </div>
                              <div className="text-right">
                                <p className="text-[12px] lg:text-[13px] font-black text-primary leading-none">
                                  {typeof score.score === 'number' ? `${score.score}%` : score.score}
                                </p>
                                <p className="text-[8px] lg:text-[9px] font-black text-slate-300 uppercase mt-0.5">{score.grade || '-'}</p>
                              </div>
                            </div>
                          ))}
                          <button 
                            onClick={() => setActiveTab('History')}
                            className="w-full py-3 rounded-xl bg-slate-50 text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-indigo-50 hover:text-primary transition-all"
                          >
                            Open Full Ledger
                          </button>
                        </>
                      ) : (
                        <div className="py-6 text-center">
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No recent scores</p>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Promotional Card */}
                  <section>
                    <div className="relative rounded-3xl lg:rounded-[2.5rem] bg-indigo-950 p-6 lg:p-8 overflow-hidden group shadow-xl">
                        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none"></div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/20 blur-3xl -mr-10 -mt-10 group-hover:bg-secondary/40 transition-all pointer-events-none"></div>
                        
                        <div className="relative z-10 space-y-4 lg:space-y-6">
                          <div className="w-fit px-2 py-0.5 lg:px-3 lg:py-1 bg-white/10 backdrop-blur-md rounded lg:rounded-lg text-[8px] lg:text-[9px] font-black tracking-widest uppercase text-indigo-200">Curated Resource</div>
                          <h3 className="text-lg lg:text-xl font-extrabold text-white leading-tight font-headline">Advanced <br />Pedagogy <br />Workshop</h3>
                          <p className="text-[10px] lg:text-[11px] font-medium text-indigo-300/80 leading-relaxed">Explore new methodologies for digital classroom engagement.</p>
                          
                          <div className="flex items-center justify-between pt-1">
                              <button className="px-4 py-2 lg:px-6 lg:py-2.5 bg-white text-indigo-950 text-[9px] lg:text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all">Join Session</button>
                              <div className="hidden sm:flex w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-primary items-center justify-center text-white cursor-pointer hover:rotate-12 transition-transform shadow-lg">
                                <span className="material-symbols-outlined text-lg">add</span>
                              </div>
                          </div>
                        </div>
                    </div>
                  </section>

                </div>
              </div>
            </>
          )}

          {activeTab === 'Assignments' && (
            <AssignmentForm user={user} />
          )}

          {activeTab === 'AI Generator' && (
            <AIQuestionStudio user={user} />
          )}

          {activeTab === 'Submissions' && (
            <MCQSubmissionReview submissions={quizSubmissions} onBack={() => setActiveTab('Overview')} />
          )}

          {activeTab === 'Students' && (
            <StudentList students={students} />
          )}

          {activeTab === 'Grading' && (
            <StudentGradingView user={user} students={students} />
          )}

          {activeTab === 'History' && (
             <MarkHistoryView history={fullHistory} />
          )}

          {activeTab === 'Resources' && (
             <TeacherPastPaperUpload user={user} />
          )}

          {activeTab === 'Settings' && (
             <TeacherSettingsView user={user} />
          )}

          {activeTab === 'Notifications' && (
            <TeacherNotificationsView notifications={notifications} />
          )}

          {activeTab !== 'Overview' && 
           activeTab !== 'Assignments' && 
           activeTab !== 'Submissions' && 
           activeTab !== 'AI Generator' && 
           activeTab !== 'Students' && 
           activeTab !== 'Grading' && 
           activeTab !== 'History' && 
           activeTab !== 'Resources' && 
           activeTab !== 'Settings' && (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
              <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-300">
                <span className="material-symbols-outlined text-4xl">construction</span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">{activeTab} section is under development</h3>
              <p className="text-sm font-medium text-slate-400 max-w-xs">We are currently building this view to match the new design system.</p>
              <button 
                onClick={() => setActiveTab('Overview')}
                className="px-6 py-2 bg-indigo-50 text-primary text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary hover:text-white transition-all"
              >
                Back to Dashboard
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// --- Student List Component ---

function StudentList({ students }: { students: any[] }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900">Student Directory</h2>
          <p className="text-[12px] lg:text-[13px] font-semibold text-slate-500">Manage and track student performance across all classes.</p>
        </div>
        <button className="px-6 py-2.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">Add Student</button>
      </div>

      <div className="bg-white rounded-[2.5rem] p-2 shadow-sm border border-white overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300">
              <th className="px-8 py-6">Student Name</th>
              <th className="px-8 py-6">Grade</th>
              <th className="px-8 py-6">GPA</th>
              <th className="px-8 py-6">Attendance</th>
              <th className="px-8 py-6 text-right">Profile</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {students.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">No students enrolled yet.</td>
              </tr>
            ) : students.map((student) => (
              <tr key={student.id} className="group hover:bg-slate-50/50 transition-all">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-sm", getNameColor(student.fullName))}>
                       {getInitials(student.fullName)}
                    </div>
                    <div>
                      <p className="text-[13px] font-extrabold text-slate-900 leading-none">{student.fullName}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">{student.role || 'STUDENT'}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">{student.teacher_email || 'NO EMAIL'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="px-3 py-1 bg-indigo-50 text-primary text-[10px] font-black rounded-lg uppercase">{student.grade || 'G9'}</span>
                </td>
                <td className="px-8 py-5">
                  <p className="text-[12px] font-black text-slate-700">{student.gpa || '0.00'}</p>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <p className="text-[12px] font-black text-slate-700">{student.attendance || 0}%</p>
                  </div>
                </td>
                <td className="px-8 py-5 text-right">
                  <button className="text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-primary transition-all">View Files</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

