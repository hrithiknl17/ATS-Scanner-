
import React from 'react';
import Button from './Button';

interface PrivacyPageProps {
  onBack: () => void;
}

const PrivacyPage: React.FC<PrivacyPageProps> = ({ onBack }) => {
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
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Privacy Policy</h1>
          <p className="text-slate-500">Last Updated: May 20, 2024</p>
        </header>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-800">1. Data Collection</h2>
          <p className="text-slate-600 leading-relaxed">
            At ATS Scan Pro, we prioritize your privacy. We process resume text and job descriptions solely for the purpose of generating analysis reports. 
            When you upload a file (PDF or DOCX), the text is extracted locally in your browser and sent securely to our analysis engine.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-800">2. Data Usage</h2>
          <p className="text-slate-600 leading-relaxed">
            Your data is never used to train global AI models without your explicit consent. We do not sell your personal information or resume content to third parties. 
            History data is stored locally in your browser's local storage and can be cleared at any time.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-800">3. Security</h2>
          <p className="text-slate-600 leading-relaxed">
            We use industry-standard encryption (SSL/TLS) to protect your data during transmission. Our AI processing is conducted using Google's secure enterprise-grade Gemini infrastructure.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-800">4. Cookies</h2>
          <p className="text-slate-600 leading-relaxed">
            We use minimal cookies for authentication purposes and to improve user experience. You can manage your cookie preferences through your browser settings.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPage;
