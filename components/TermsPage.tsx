
import React from 'react';

interface TermsPageProps {
  onBack: () => void;
}

const TermsPage: React.FC<TermsPageProps> = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-indigo-600 font-semibold mb-8 hover:text-indigo-700 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Back to Home
      </button>

      <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-sm space-y-8">
        <header>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Terms of Service</h1>
          <p className="text-slate-500">Effective Date: May 20, 2024</p>
        </header>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-800">1. Acceptance of Terms</h2>
          <p className="text-slate-600 leading-relaxed">
            By accessing or using ATS Scan Pro, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use the service.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-800">2. Description of Service</h2>
          <p className="text-slate-600 leading-relaxed">
            ATS Scan Pro provides an AI-powered resume analysis tool designed to help candidates optimize their resumes for Applicant Tracking Systems. 
            The results provided are for informational purposes only and do not guarantee employment.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-800">3. User Conduct</h2>
          <p className="text-slate-600 leading-relaxed">
            Users agree not to use the service for any unlawful purposes or to upload content that violates the intellectual property rights of others.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-800">4. Limitation of Liability</h2>
          <p className="text-slate-600 leading-relaxed">
            ATS Scan Pro shall not be liable for any indirect, incidental, or consequential damages arising out of your use of the service.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsPage;
