
import React, { useState } from 'react';
import { ATSResult } from '../types';
import Button from './Button';
import { jsPDF } from 'jspdf';

interface OptimizerViewProps {
  result: ATSResult;
  onBack: () => void;
}

const OptimizerView: React.FC<OptimizerViewProps> = ({ result, onBack }) => {
  const [activeTab, setActiveTab] = useState<'changes' | 'preview'>('changes');

  const handleDownloadPDF = () => {
    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
    });

    // Simple Professional PDF generation
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    // Split the text into lines that fit in the PDF width
    const lines = doc.splitTextToSize(result.optimized_full_text, 170);
    
    let y = 20;
    lines.forEach((line: string) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, 20, y);
      y += 5;
    });

    doc.save('Optimized_Resume.pdf');
  };

  const handleExploreJobs = () => {
    window.open('https://grow.google/career-dreamer/home/', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Resume Optimizer</h2>
          <p className="text-slate-500">Review and apply AI-powered improvements.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" onClick={onBack} className="!py-2 !px-4 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back
          </Button>
          <Button variant="secondary" onClick={handleExploreJobs} className="!py-2 !px-4 text-sm border-indigo-100 text-indigo-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            Find Jobs
          </Button>
          <Button onClick={handleDownloadPDF} className="!py-2 !px-4 text-sm shadow-indigo-100">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Download PDF
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('changes')}
          className={`px-6 py-3 font-bold text-sm transition-all ${activeTab === 'changes' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Recommended Changes ({result.recommended_changes.length})
        </button>
        <button 
          onClick={() => setActiveTab('preview')}
          className={`px-6 py-3 font-bold text-sm transition-all ${activeTab === 'preview' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Full Optimized Preview
        </button>
      </div>

      {activeTab === 'changes' ? (
        <div className="space-y-6">
          {result.recommended_changes.map((change, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded text-[10px] font-bold uppercase tracking-wider">
                  {change.section}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Original Text</p>
                  <p className="text-sm text-slate-500 line-through bg-slate-50 p-4 rounded-xl italic">"{change.original}"</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Suggested Rewrite</p>
                  <p className="text-sm text-slate-900 font-medium bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl leading-relaxed">
                    {change.suggested}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-50 flex gap-2 items-start">
                <div className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0">
                  <svg fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM13.536 14.95a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 010-1.414zM16.464 16.464a1 1 0 010-1.414l.707-.707a1 1 0 111.414 1.414l-.707.707a1 1 0 01-1.414 0zM4.95 14.95a1 1 0 010 1.414l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 0z" /></svg>
                </div>
                <p className="text-xs text-slate-400 font-medium">Reason: {change.reason}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl p-10 shadow-lg max-h-[800px] overflow-y-auto font-mono text-sm leading-relaxed text-slate-700 whitespace-pre-wrap selection:bg-indigo-100">
          {result.optimized_full_text}
        </div>
      )}
    </div>
  );
};

export default OptimizerView;
