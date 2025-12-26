
import React from 'react';
import { ATSResult } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import Button from './Button';
import { jsPDF } from 'jspdf';

interface ResultCardProps {
  result: ATSResult;
  onReset: () => void;
  onGoToOptimizer: () => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, onReset, onGoToOptimizer }) => {
  const data = [
    { name: 'Match', value: result.match_percentage },
    { name: 'Gap', value: 100 - result.match_percentage },
  ];

  const COLORS = ['#4f46e5', '#e2e8f0'];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleExploreJobs = () => {
    window.open('https://grow.google/career-dreamer/home/', '_blank', 'noopener,noreferrer');
  };

  const downloadReport = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text(`ATS Scan Report: ${result.match_percentage}% Match`, 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Critique:`, 20, 40);
    const splitCritique = doc.splitTextToSize(result.summary_critique, 170);
    doc.text(splitCritique, 20, 50);
    
    doc.text(`Missing Keywords:`, 20, 100);
    result.missing_keywords.forEach((kw, i) => {
      doc.text(`- ${kw}`, 20, 110 + (i * 10));
    });
    
    doc.save("ATS_Report.pdf");
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Score Circle */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Match Score</h3>
          <div className="relative w-48 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  startAngle={90}
                  endAngle={450}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-bold ${getScoreColor(result.match_percentage)}`}>
                {result.match_percentage}%
              </span>
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Similarity</span>
            </div>
          </div>
          <p className="mt-6 text-sm text-gray-500 italic">
            "{result.summary_critique}"
          </p>
          <div className="mt-8 w-full space-y-3">
            <Button onClick={onGoToOptimizer} className="w-full !py-3 shadow-indigo-50">
               Optimize Resume
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Button>
            <Button variant="secondary" onClick={handleExploreJobs} className="w-full !py-3 border-indigo-100">
               Explore Matching Jobs
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            </Button>
            <Button variant="secondary" onClick={downloadReport} className="w-full !py-3 border-indigo-100">
               Download Report
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            </Button>
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm h-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Top Strengths
            </h3>
            <div className="flex flex-wrap gap-2 mb-8">
              {result.strengths.length > 0 ? (
                result.strengths.map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-100">
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-gray-400 text-sm">No significant strengths identified.</p>
              )}
            </div>

            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              Keyword Gaps
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.missing_keywords.length > 0 ? (
                result.missing_keywords.map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-medium border border-red-100">
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-gray-400 text-sm">Excellent keyword alignment! No major gaps found.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <button 
          onClick={onReset}
          className="text-gray-500 hover:text-indigo-600 flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          Start New Scan
        </button>
      </div>
    </div>
  );
};

export default ResultCard;
