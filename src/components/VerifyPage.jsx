
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import NavBar from './NavBar';
import Footer from './Footer';

// API Base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost/pastein/api/public/api';

// Helper function to get platform-specific colors
function getPlatformColors(actionType) {
  switch (actionType) {
    case 'youtube': return { bg: 'bg-red-50 dark:bg-red-900/20', iconBg: 'bg-white', text: 'text-red-600', checkmark: 'text-red-600', arrow: 'text-red-600' };
    case 'instagram': return { bg: 'bg-purple-50 dark:bg-purple-900/20', iconBg: 'bg-white', text: 'text-purple-600', checkmark: 'text-purple-600', arrow: 'text-purple-600' };
    case 'tiktok': return { bg: 'bg-gray-50 dark:bg-gray-900/20', iconBg: 'bg-white', text: 'text-gray-800', checkmark: 'text-gray-800', arrow: 'text-gray-800' };
    case 'facebook': return { bg: 'bg-blue-50 dark:bg-blue-900/20', iconBg: 'bg-white', text: 'text-blue-600', checkmark: 'text-blue-600', arrow: 'text-blue-600' };
    case 'twitter': return { bg: 'bg-sky-50 dark:bg-sky-900/20', iconBg: 'bg-white', text: 'text-sky-500', checkmark: 'text-sky-500', arrow: 'text-sky-500' };
    case 'whatsapp': return { bg: 'bg-green-50 dark:bg-green-900/20', iconBg: 'bg-white', text: 'text-green-600', checkmark: 'text-green-600', arrow: 'text-green-600' };
    case 'telegram': return { bg: 'bg-cyan-50 dark:bg-cyan-900/20', iconBg: 'bg-white', text: 'text-cyan-500', checkmark: 'text-cyan-500', arrow: 'text-cyan-500' };
    case 'discord': return { bg: 'bg-indigo-50 dark:bg-indigo-900/20', iconBg: 'bg-white', text: 'text-indigo-600', checkmark: 'text-indigo-600', arrow: 'text-indigo-600' };
    default: return { bg: 'bg-gray-50 dark:bg-gray-700/50', iconBg: 'bg-white dark:bg-gray-600', text: 'text-gray-700 dark:text-gray-300', checkmark: 'text-gray-600', arrow: 'text-gray-600' };
  }
}

// Helper function to get colored icon for action type
function getActionIconColored(actionType) {
  switch (actionType) {
    case 'youtube': return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#FF0000"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>;
    case 'instagram': return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="url(#instagram-gradient)"><defs><linearGradient id="instagram-gradient" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#FD5949" /><stop offset="50%" stopColor="#D6249F" /><stop offset="100%" stopColor="#285AEB" /></linearGradient></defs><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>;
    case 'tiktok': return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#000000"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>;
    case 'facebook': return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>;
    case 'twitter': return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#1DA1F2"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>;
    case 'whatsapp': return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>;
    case 'telegram': return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#0088cc"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>;
    case 'discord': return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#5865F2"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>;
    default: return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
  }
}

function getActionDefaultLabel(actionType) {
  switch (actionType) {
    case 'youtube': return 'Subscribe to YouTube Channel';
    case 'instagram': return 'Follow on Instagram';
    case 'tiktok': return 'Follow on TikTok';
    case 'facebook': return 'Like Facebook Page';
    case 'twitter': return 'Follow on Twitter';
    default: return 'Visit Link';
  }
}

export default function VerifyPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [data, setData] = useState(null);
  const [code, setCode] = useState(null);
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [requireActions, setRequireActions] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [completedActions, setCompletedActions] = useState(new Set());
  const [processingAction, setProcessingAction] = useState(null);

  useEffect(() => {
    const storedCode = localStorage.getItem('paste_code');
    if (!storedCode) {
      navigate('/');
      return;
    }
    setCode(storedCode);

    const checkProtection = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/resolve/${storedCode}`);
        const pasteData = response.data.data;
        setData(pasteData);

        if (pasteData.is_password_protected) {
          setIsPasswordProtected(true);
        } else if (pasteData.require_actions && pasteData.actions && pasteData.actions.length > 0) {
            const storageKey = `action_gate_${storedCode}`;
            const savedProgress = localStorage.getItem(storageKey);
             let savedSet = new Set();
             if (savedProgress) {
                 savedSet = new Set(JSON.parse(savedProgress));
                 setCompletedActions(savedSet);
             }

             if (savedSet.size === pasteData.actions.length) {
                completeVerification(pasteData);
             } else {
                 setRequireActions(true);
             }
        }
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setError('Paste not found.');
        } else if (err.response && err.response.status === 410) {
          setIsExpired(true);
        } else {
          setError('An error occurred while loading.');
        }
      } finally {
        setLoading(false);
      }
    };

    checkProtection();
  }, [navigate]);

  const completeVerification = (pasteData) => {
      sessionStorage.setItem('verified_paste_data', JSON.stringify(pasteData));
      sessionStorage.setItem('is_verified', 'true');
      navigate('/content');
  };

  const recordVisit = async () => {
      try { await axios.post(`${API_BASE_URL}/visit/${code}`); } catch (e) { console.error("Visit recording failed", e); }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    if (!password.trim()) { setPasswordError('Please enter a password'); return; }

    try {
      const response = await axios.post(`${API_BASE_URL}/resolve/${code}/verify`, { password });
      if (response.data && response.data.success) {
        const verifiedData = response.data.data;
        if (verifiedData.require_actions && verifiedData.actions && verifiedData.actions.length > 0) {
            setData(verifiedData);
            setIsPasswordProtected(false);
            setRequireActions(true);
            const storageKey = `action_gate_${code}`;
            const savedProgress = localStorage.getItem(storageKey);
             if (savedProgress) {
                 const savedSet = new Set(JSON.parse(savedProgress));
                 setCompletedActions(savedSet);
                 if (savedSet.size === verifiedData.actions.length) {
                     await recordVisit();
                     completeVerification(verifiedData);
                 }
             }
        } else {
            await recordVisit();
            completeVerification(verifiedData);
        }
      } else {
        setPasswordError('Incorrect password.');
      }
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Incorrect password.');
    }
  };

  const handleActionClick = async (actionIndex) => {
    if (processingAction !== null || completedActions.has(actionIndex)) return;
    const action = data.actions[actionIndex];
    window.open(action.action_url, '_blank', 'noopener,noreferrer');
    setProcessingAction(actionIndex);
    await new Promise(resolve => setTimeout(resolve, 3000));
    const newCompleted = new Set(completedActions);
    newCompleted.add(actionIndex);
    setCompletedActions(newCompleted);
    localStorage.setItem(`action_gate_${code}`, JSON.stringify(Array.from(newCompleted)));
    setProcessingAction(null);
  };

  const handleContinueFromActionGate = async () => { 
      await recordVisit();
      completeVerification(data); 
  };

  const handleRobotVerify = async () => {
    setVerifying(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    await recordVisit();
    completeVerification(data);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || isExpired) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-gray-100 dark:border-gray-700"
        >
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6"
          >
             {isExpired ? (
                 <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
             ) : (
                 <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
             )}
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-gray-900 dark:text-white mb-2"
          >
            {isExpired ? "Paste Expired" : "Paste Not Found"}
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed"
          >
            {isExpired 
              ? "This paste has reached its time limit or view limit and has been automatically removed."
              : (error || "The paste you are looking for does not exist or has been removed.")}
          </motion.p>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
             <Link to="/" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/30">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                Return to Home
             </Link>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      <NavBar />
      <main className="flex-1 flex items-center justify-center p-4">
        {isPasswordProtected && (
          <div className="bg-white text-gray-700 shadow-xl border border-gray-200 rounded-xl w-full max-w-md p-10 text-center">
             <div className="flex justify-center mb-6">
              <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-600"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">Password Protected</h2>
            <p className="text-gray-500 mb-6">Enter password to unlock</p>
            <form onSubmit={handlePasswordSubmit} className="space-y-4 text-left">
              <div className="relative">
                 <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" autoFocus />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-gray-500">{showPassword ? "Hide" : "Show"}</button>
              </div>
              {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
              <button type="submit" className="w-full py-3 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 transition">Unlock</button>
            </form>
          </div>
        )}

        {!isPasswordProtected && requireActions && (
          <div className="bg-white text-gray-700 shadow-xl border border-gray-200 rounded-xl w-full max-w-3xl p-8">
             <h2 className="text-3xl font-bold mb-2 text-center">Unlock Link</h2>
             <p className="text-gray-500 mb-8 text-center">Complete actions to continue</p>
             <div className="grid gap-4 mb-8">
               {data.actions.map((action, index) => {
                 const isCompleted = completedActions.has(index);
                 const isProcessing = processingAction === index;
                 
                 // Uniform styling matching the requested image (Light Blue Theme)
                 return (
                   <button 
                     key={index} 
                     onClick={() => !isCompleted && !isProcessing && handleActionClick(index)} 
                     disabled={isCompleted || isProcessing} 
                     className={`relative group w-full flex items-center justify-between p-2.5 rounded-2xl transition-all duration-300 border border-transparent ${
                        isCompleted 
                          ? 'bg-gray-100 opacity-60 cursor-default' 
                          : 'bg-blue-50 hover:bg-blue-100 hover:shadow-sm active:scale-[0.99] cursor-pointer'
                     }`}
                   >
                     {/* Left Icon Container: White, rounded-xl */}
                     <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-500 flex-shrink-0">
                        {/* We reuse the colored icon helper but maybe force a specific size or style if needed, 
                            for now keeping the original colored icons inside the white box looks good */}
                        {getActionIconColored(action.action_type)}
                     </div>

                     {/* Center Text */}
                     <div className="flex-1 text-center font-bold text-gray-700 px-3 truncate">
                       {isProcessing ? 'Processing...' : (isCompleted ? 'Completed' : (action.action_label || getActionDefaultLabel(action.action_type)))}
                     </div>

                     {/* Right Icon: Double Arrow or Check */}
                     <div className="w-10 flex items-center justify-center text-blue-400 flex-shrink-0">
                        {isProcessing ? (
                           <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                           </svg>
                        ) : isCompleted ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><polyline points="20 6 9 17 4 12"/></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="m13 17 5-5-5-5"/><path d="m6 17 5-5-5-5"/></svg>
                        )}
                     </div>
                   </button>
                 );
               })}
             </div>
             
             {/* Unlock Progress & Button */}
             <div className="text-center mb-6">
                <p className="text-gray-500 font-bold mb-3">Unlock Progress {completedActions.size}/{data.actions.length}</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6 overflow-hidden">
                    <div className="bg-blue-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${(completedActions.size / data.actions.length) * 100}%` }}></div>
                </div>

                <button onClick={handleContinueFromActionGate} disabled={completedActions.size !== data.actions.length} className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${completedActions.size === data.actions.length ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-500/25' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
                    {completedActions.size === data.actions.length ? 'Unlock Content' : 'Complete Actions to Unlock'}
                </button>
             </div>
          </div>
        )}

        {!isPasswordProtected && !requireActions && (
           <div className="bg-white text-gray-700 shadow-xl border border-gray-200 rounded-xl w-full max-w-md p-12 text-center">
             <div className="flex justify-center mb-8">
               <div className="p-6 bg-primary-50 border-2 border-primary-200 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-600"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
               </div>
             </div>
             <h2 className="text-2xl font-bold mb-3">Security Check</h2>
             <p className="text-gray-500 mb-8">Please verify that you are not a robot</p>
             <button onClick={handleRobotVerify} disabled={verifying} className="w-full py-4 bg-primary-600 text-white rounded-lg font-bold text-lg hover:bg-primary-700 shadow-md transition-all flex items-center justify-center gap-2">
               {verifying ? (<><span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>Verifying...</>) : ("I am Not a Robot")}
             </button>
           </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
