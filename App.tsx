import React, { useState, useEffect, useRef } from 'react';
import Button from './components/Button';
import ResultCard from './components/ResultCard';
import { AuthPage } from './components/AuthPage';
import PrivacyPage from './components/PrivacyPage';
import TermsPage from './components/TermsPage';
import SupportPage from './components/SupportPage';
import Chatbot from './components/Chatbot';
import OptimizerView from './components/OptimizerView';
import { ATSResult, EvaluationHistory } from './types';
import { analyzeResume } from './services/geminiService';
import * as mammoth from 'mammoth';
import * as pdfjs from 'pdfjs-dist';
import { supabase } from './supabaseClient';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.10.38/build/pdf.worker.mjs`;

type View = 'home' | 'auth' | 'privacy' | 'terms' | 'support' | 'optimizer';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [user, setUser] = useState<any | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [result, setResult] = useState<ATSResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<EvaluationHistory[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploadMethod, setUploadMethod] = useState<'upload' | 'paste'>('upload');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // AUTH & HISTORY MANAGEMENT
  useEffect(() => {
    // Check active session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchHistory(session.user.id);
    });

    // Listen for live auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchHistory(session.user.id);
      else setHistory([]);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchHistory = async (userId: string) => {
    const { data, error } = await supabase
      .from('ats_scans')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      const mappedHistory = data.map((item: any) => ({
        id: item.id,
        timestamp: new Date(item.created_at).getTime(),
        jobTitle: item.job_description ? (item.job_description.slice(0, 40) + "...") : "Job Scan",
        result: item.full_result
      }));
      setHistory(mappedHistory);
    }
  };

  const handleLoginSuccess = (userData: any) => {
    setCurrentView('home');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setHistory([]);
    setCurrentView('home');
    setResult(null);
  };

  // FILE PARSING
  const parsePDF = async (arrayBuffer: ArrayBuffer) => {
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(" ");
      fullText += pageText + "\n";
    }
    return fullText;
  };

  const parseDOCX = async (arrayBuffer: ArrayBuffer) => {
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsParsing(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      let extractedText = "";

      if (file.type === 'application/pdf') {
        extractedText = await parsePDF(arrayBuffer);
      } else if (
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.name.endsWith('.docx')
      ) {
        extractedText = await parseDOCX(arrayBuffer);
      } else {
        throw new Error("Unsupported file format. Please upload a PDF or DOCX file.");
      }

      if (!extractedText.trim()) {
        throw new Error("Could not extract any text from the file. It might be scanned or empty.");
      }

      setResumeText(extractedText);
    } catch (err: any) {
      setError(err.message || "Failed to read the file.");
      setFileName(null);
    } finally {
      setIsParsing(false);
    }
  };

  const handleAnalyze = async () => {
    if (!jobDescription || !resumeText) {
      setError("Both fields are required for a precise scan.");
      return;
    }
    setIsAnalyzing(true);
    setError(null);
    try {
      const evaluation = await analyzeResume(jobDescription, resumeText);
      setResult(evaluation);
      
      // Save to Supabase if logged in
      if (user) {
        const { error } = await supabase.from('ats_scans').insert({
          user_id: user.id,
          job_description: jobDescription,
          match_percentage: evaluation.match_percentage,
          summary_critique: evaluation.summary_critique,
          full_result: evaluation
        });
        
        if (!error) fetchHistory(user.id);
      }
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderLanding = () => (
    <div className="py-20 flex flex-col items-center text-center space-y-12 animate-in fade-in duration-700">
      <div className="max-w-4xl space-y-6">
        <h1 className="text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
          The Secret to Passing the <br/><span className="text-indigo-600">Initial Resume Screen.</span>
        </h1>
        <p className="text-2xl text-slate-500 max-w-2xl mx-auto">
          Over 75% of resumes are never seen by a human. Join ATS Scan Pro to simulate real hiring algorithms and optimize your profile.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={() => setCurrentView('auth')} className="!px-10 !py-4 text-lg shadow-xl shadow-indigo-200">
          Create Free Account
        </Button>
        <Button variant="secondary" onClick={() => setCurrentView('auth')} className="!px-10 !py-4 text-lg">
          Sign In
        </Button>
      </div>

      <div className="relative w-full max-w-5xl mt-12 group">
        <div className="absolute inset-0 bg-indigo-600/10 blur-3xl rounded-full -z-10 group-hover:bg-indigo-600/20 transition-all duration-700"></div>
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-4 overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
          <div className="bg-slate-50 rounded-2xl h-96 flex items-center justify-center border border-slate-100 relative">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                   <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <p className="font-bold text-slate-800 text-xl">Scanner Locked</p>
                <p className="text-slate-400 text-sm">Please sign in to access the simulator</p>
             </div>
             <div className="w-64 h-full bg-slate-200/20 absolute left-0 blur-sm"></div>
             <div className="w-64 h-full bg-slate-200/20 absolute right-0 blur-sm"></div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mt-12">
        <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm text-left">
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-6">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Algorithm Match</h3>
          <p className="text-slate-500 leading-relaxed text-sm">See exactly how a cold algorithm ranks your experience against the JD.</p>
        </div>
        <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm text-left">
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-6">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Keyword Gaps</h3>
          <p className="text-slate-500 leading-relaxed text-sm">Identify critical missing hard skills that are triggering automatic rejections.</p>
        </div>
        <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm text-left">
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-6">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">AI Optimization</h3>
          <p className="text-slate-500 leading-relaxed text-sm">Get precise rewrites and a ready-to-use optimized PDF version of your resume.</p>
        </div>
      </div>
    </div>
  );

  const renderScanner = () => (
    <>
      {!result ? (
        <div className="space-y-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <header className="text-center space-y-4 max-w-3xl mx-auto">
            <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Ready for Your <span className="text-indigo-600">Career Upgrade?</span>
            </h1>
            <p className="text-xl text-slate-500 leading-relaxed">
              Welcome, {(user?.user_metadata?.name || user?.email || 'User').split('@')[0]}. Paste the job and your resume below to start the audit.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Target Opportunity</h3>
                <span className="text-xs text-indigo-500 font-medium">Step 1</span>
              </div>
              <div className="group relative">
                <textarea
                  className="w-full h-[450px] p-6 text-sm bg-white border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 transition-all outline-none resize-none shadow-sm group-hover:shadow-md"
                  placeholder="Paste the full job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Your Resume Content</h3>
                <div className="flex items-center gap-2">
                  <button onClick={() => setUploadMethod('upload')} className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${uploadMethod === 'upload' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>File</button>
                  <button onClick={() => setUploadMethod('paste')} className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${uploadMethod === 'paste' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>Paste</button>
                </div>
              </div>

              {uploadMethod === 'upload' ? (
                <div onClick={() => fileInputRef.current?.click()} className={`w-full h-[450px] flex flex-col items-center justify-center border-2 border-dashed rounded-2xl transition-all cursor-pointer bg-white group shadow-sm ${fileName ? 'border-indigo-400 bg-indigo-50/20' : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50'}`}>
                  <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.docx" onChange={handleFileChange} />
                  {isParsing ? (
                    <div className="flex flex-col items-center gap-4">
                      {/* FIXED SVG Path below: added 'M' */}
                      <svg className="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p className="text-indigo-600 font-medium">Extracting text...</p>
                    </div>
                  ) : fileName ? (
                    <div className="text-center p-8">
                      <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      </div>
                      <p className="font-bold text-slate-800 break-all">{fileName}</p>
                      <p className="text-xs text-slate-400 mt-2">Click to replace file</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg></div>
                      <p className="text-slate-900 font-bold">Drop your resume here</p>
                      <div className="mt-6"><span className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg">Browse Files</span></div>
                    </div>
                  )}
                </div>
              ) : (
                <textarea className="w-full h-[450px] p-6 text-sm bg-white border-2 border-slate-100 rounded-2xl focus:border-indigo-500 transition-all outline-none resize-none shadow-sm" placeholder="Paste resume here..." value={resumeText} onChange={(e) => setResumeText(e.target.value)} />
              )}
            </section>
          </div>

          <div className="flex flex-col items-center gap-6">
            {error && <div className="text-red-500 text-sm font-medium animate-bounce flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              {error}
            </div>}
            <Button onClick={handleAnalyze} className="w-full max-w-md !py-5 text-xl shadow-xl shadow-indigo-100" isLoading={isAnalyzing} disabled={isParsing}>Launch Audit</Button>
          </div>
        </div>
      ) : currentView === 'optimizer' && result ? (
        <OptimizerView result={result} onBack={() => setCurrentView('home')} />
      ) : (
        <div className="animate-in fade-in zoom-in-95 duration-500">
           <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-bold text-slate-900">Analysis Report</h2>
              <Button variant="secondary" onClick={() => { setResult(null); setCurrentView('home'); }} className="!py-2 !px-4 text-sm">New Scan</Button>
           </div>
           <ResultCard result={result} onReset={() => { setResult(null); setCurrentView('home'); }} onGoToOptimizer={() => setCurrentView('optimizer')} />
        </div>
      )}

      {history.length > 0 && !result && (
        <section className="mt-24">
          <h4 className="text-center text-slate-400 text-sm font-bold uppercase tracking-widest mb-8">Recent Scans</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {history.map(item => (
              <button key={item.id} onClick={() => { setResult(item.result); setCurrentView('home'); }} className="p-5 bg-white border border-slate-100 rounded-xl text-left hover:border-indigo-300 transition-all group">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-indigo-600 font-bold">{item.result.match_percentage}%</span>
                  <span className="text-[10px] text-slate-300">{new Date(item.timestamp).toLocaleDateString()}</span>
                </div>
                <p className="text-sm font-medium text-slate-600 line-clamp-1 group-hover:text-indigo-900 transition-colors">{item.jobTitle}</p>
              </button>
            ))}
          </div>
        </section>
      )}
    </>
  );

  const navigateTo = (view: View) => {
    setCurrentView(view);
    if (view !== 'home' && view !== 'optimizer') setResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderContent = () => {
    switch (currentView) {
      case 'auth':
        return <AuthPage onBack={() => navigateTo('home')} onLoginSuccess={handleLoginSuccess} />;
      case 'privacy':
        return <PrivacyPage onBack={() => navigateTo('home')} />;
      case 'terms':
        return <TermsPage onBack={() => navigateTo('home')} />;
      case 'support':
        return <SupportPage onBack={() => navigateTo('home')} />;
      default:
        return user ? renderScanner() : renderLanding();
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] text-slate-900 font-sans selection:bg-indigo-100">
      <nav className="h-16 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div 
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => navigateTo('home')}
          >
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">ATS Scan Pro</span>
          </div>
          <div className="flex gap-4 items-center">
            <Button variant="ghost" className="text-sm hidden sm:flex" onClick={() => navigateTo('home')}>Scanner</Button>
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-slate-600 hidden md:inline">
                   Hi, {(user?.user_metadata?.name || user?.email || 'User').split('@')[0]}
                </span>
                <Button variant="secondary" className="!py-2 !px-4 text-sm" onClick={handleLogout}>Log Out</Button>
              </div>
            ) : (
              <Button variant="secondary" className="!py-2 !px-4 text-sm" onClick={() => navigateTo('auth')}>Sign In</Button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {renderContent()}
      </main>

      <Chatbot />

      <footer className="mt-32 border-t border-slate-100 py-12 bg-slate-50/50">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 opacity-50 grayscale cursor-pointer" onClick={() => navigateTo('home')}>
            <div className="w-6 h-6 bg-slate-600 rounded flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <span className="font-bold text-slate-900">ATS Scan Pro</span>
          </div>
          <div className="flex gap-8 text-sm text-slate-400 font-medium">
            <button onClick={() => navigateTo('privacy')} className="hover:text-indigo-600 transition-colors">Privacy</button>
            <button onClick={() => navigateTo('terms')} className="hover:text-indigo-600 transition-colors">Terms</button>
            <button onClick={() => navigateTo('support')} className="hover:text-indigo-600 transition-colors">Support</button>
          </div>
          <p className="text-slate-400 text-sm">© 2024 Optimizing Careers Everywhere.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;