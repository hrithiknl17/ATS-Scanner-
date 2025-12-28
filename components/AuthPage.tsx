import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import Button from './Button';

interface AuthPageProps {
  onBack: () => void;
  onLoginSuccess: (user: any) => void;
}

// Define the 3 possible states for this page
type AuthView = 'login' | 'signup' | 'forgot_password';

export const AuthPage: React.FC<AuthPageProps> = ({ onBack, onLoginSuccess }) => {
  const [view, setView] = useState<AuthView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (view === 'login') {
        // --- LOGIN LOGIC ---
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data.user) onLoginSuccess(data.user);
      } 
      else if (view === 'signup') {
        // --- SIGNUP LOGIC ---
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name: name || 'User' } // Saves name to user_metadata
          }
        });
        if (error) throw error;
        setMessage('Account created! You can now log in.');
        if (data.session) onLoginSuccess(data.user); // Auto-login if session exists
      }
      else if (view === 'forgot_password') {
        // --- RESET PASSWORD LOGIC ---
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin, // Redirects back to your app
        });
        if (error) throw error;
        setMessage('Password reset link sent! Check your email.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
        
        {/* Dynamic Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            {view === 'login' && 'Welcome Back'}
            {view === 'signup' && 'Create Account'}
            {view === 'forgot_password' && 'Reset Password'}
          </h2>
          <p className="text-slate-500 text-sm">
            {view === 'login' && 'Enter your details to access your dashboard.'}
            {view === 'signup' && 'Start optimizing your resume today.'}
            {view === 'forgot_password' && 'Enter your email to receive a reset link.'}
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 border border-red-100">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {error}
          </div>
        )}
        {message && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg flex items-center gap-2 border border-green-100">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
            {message}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-5">
          {/* Name Field (Only for Signup) */}
          {view === 'signup' && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
            <input 
              type="email" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password Field (Hidden for Forgot Password) */}
          {view !== 'forgot_password' && (
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm font-semibold text-slate-700">Password</label>
                {view === 'login' && (
                  <button 
                    type="button"
                    onClick={() => setView('forgot_password')}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <input 
                type="password" 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          )}

          <Button isLoading={loading} className="w-full py-3.5 shadow-lg shadow-indigo-100">
            {view === 'login' ? 'Sign In' : view === 'signup' ? 'Create Account' : 'Send Reset Link'}
          </Button>
        </form>

        {/* Footer Navigation */}
        <div className="mt-8 text-center text-sm text-slate-500 space-y-3">
          {view === 'login' && (
            <p>
              Don't have an account?{' '}
              <button onClick={() => setView('signup')} className="font-bold text-indigo-600 hover:text-indigo-700">
                Sign up
              </button>
            </p>
          )}
          {view === 'signup' && (
            <p>
              Already have an account?{' '}
              <button onClick={() => setView('login')} className="font-bold text-indigo-600 hover:text-indigo-700">
                Log in
              </button>
            </p>
          )}
          {view === 'forgot_password' && (
            <button onClick={() => setView('login')} className="font-bold text-slate-400 hover:text-slate-600 flex items-center justify-center gap-2 w-full">
              Back to Sign In
            </button>
          )}
        </div>
        
        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
           <button onClick={onBack} className="text-xs text-slate-400 hover:text-slate-600">Return to Home Page</button>
        </div>
      </div>
    </div>
  );
};