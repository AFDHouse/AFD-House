import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Mail, Lock, Phone, User, ArrowRight, Eye, EyeOff, 
  Search, Flag, CheckCircle2, AlertCircle, Loader2
} from 'lucide-react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult
} from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [authMethod, setAuthMethod] = useState<'email' | 'phone' | 'google'>('google');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login: googleLogin } = useAuth();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Custom Auth States
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setToast(null);
      setShowOtpInput(false);
      setOtp('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    const target = authMethod === 'email' ? email : phone;
    if (!target) {
      setError(`Please enter your ${authMethod}`);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, type: authMethod }),
      });
      const data = await response.json();
      
      if (data.success) {
        showToast(data.message, 'success');
        setShowOtpInput(true);
        if (data.debug_code) {
          console.log(`[DEV] Your OTP code is: ${data.debug_code}`);
          showToast(`Your demo OTP is: ${data.debug_code}.`, 'success');
        }
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
      showToast(err.message || 'Error sending code', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    const target = authMethod === 'email' ? email : phone;
    
    try {
      const response = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, code: otp }),
      });
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        showToast('Authenticated successfully!', 'success');
        setTimeout(() => {
          onClose();
          window.location.reload(); 
        }, 1200);
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      setError(err.message || 'Invalid OTP code');
      showToast('Validation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await googleLogin();
      showToast('Welcome back!', 'success');
      setTimeout(onClose, 1200);
    } catch (err: any) {
      console.error(err);
      setError('Login failed. Please try again.');
      showToast('Authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
      />

      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-white w-full max-w-[400px] rounded-[3rem] shadow-2xl overflow-hidden"
      >
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ y: -60, opacity: 0 }}
              animate={{ y: 20, opacity: 1 }}
              exit={{ y: -60, opacity: 0 }}
              className={cn(
                "absolute top-0 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 min-w-[280px]",
                toast.type === 'success' ? "bg-green-600 text-white" : "bg-red-600 text-white"
              )}
            >
              {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span className="text-sm font-bold">{toast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 w-full" />
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 transition-colors z-10"
        >
          <X className="w-5 h-5 text-slate-500" />
        </button>

        <div className="p-8 md:p-10 space-y-8">
          <div className="text-center space-y-2">
             <h2 className="text-3xl font-black text-slate-900 tracking-tight">AFD House</h2>
             <p className="text-slate-500 text-sm font-medium">Secure Access Portal</p>
          </div>

          {!showOtpInput ? (
            <div className="space-y-6">
              {/* Method Switcher */}
              <div className="flex p-1 bg-slate-100 rounded-2xl">
                {['google', 'email', 'phone'].map((m) => (
                  <button
                    key={m}
                    onClick={() => setAuthMethod(m as any)}
                    className={cn(
                      "flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all",
                      authMethod === m ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {authMethod === 'google' && (
                  <button 
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-4 py-4 bg-white border-2 border-slate-100 rounded-[1.5rem] hover:bg-slate-50 hover:border-blue-100 transition-all active:scale-95 disabled:opacity-50 group shadow-sm"
                  >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
                    <span className="text-base font-black text-slate-700">Google One-Tap</span>
                  </button>
                )}

                {authMethod === 'email' && (
                  <div className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="email" 
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-bold"
                      />
                    </div>
                    <button 
                      onClick={handleSendOtp}
                      disabled={loading || !email}
                      className="w-full py-4 bg-slate-900 text-white rounded-[1.5rem] font-black tracking-widest uppercase text-sm hover:shadow-xl transition-all active:scale-95 disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Get Email OTP'}
                    </button>
                  </div>
                )}

                {authMethod === 'phone' && (
                  <div className="space-y-4">
                    <div className="phone-input-container">
                      <PhoneInput
                        country={'bd'}
                        value={phone}
                        onChange={(val) => setPhone(val)}
                        containerClass="!w-full"
                        inputClass="!w-full !h-14 !bg-slate-50 !border-slate-200 !rounded-[1.5rem] !pl-14 !text-sm !font-bold focus:!ring-2 focus:!ring-blue-500/20"
                        buttonClass="!bg-transparent !border-none !rounded-xl !pl-3"
                      />
                    </div>
                    <button 
                      onClick={handleSendOtp}
                      disabled={loading || !phone}
                      className="w-full py-4 bg-slate-900 text-white rounded-[1.5rem] font-black tracking-widest uppercase text-sm hover:shadow-xl transition-all active:scale-95 disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Get Phone OTP'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6 text-center">
              <div className="space-y-2">
                <h4 className="text-xl font-black text-slate-900">Verify Identity</h4>
                <p className="text-xs text-slate-500 font-medium">Code sent to {authMethod === 'email' ? email : phone}</p>
              </div>
              
              <div className="relative">
                <input 
                  type="text" 
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••••"
                  className="w-full px-4 py-5 bg-slate-50 border border-slate-200 rounded-2xl text-center text-3xl font-black tracking-[0.5em] focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                />
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleVerifyOtp}
                  disabled={loading || otp.length < 6}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black tracking-widest uppercase text-sm hover:shadow-xl transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Verify Code'}
                </button>
                <button 
                  onClick={() => setShowOtpInput(false)}
                  className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600"
                >
                  Back to methods
                </button>
              </div>
            </div>
          )}

          {error && (
            <p className="text-center text-[10px] font-black text-red-500 bg-red-50 py-2.5 rounded-xl uppercase tracking-widest leading-loose">
              {error}
            </p>
          )}

          <div className="space-y-4 pt-4 border-t border-slate-50 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
              <Lock className="w-3 h-3" />
              Secure • Encrypted • Verified
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
