import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

// API Base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost/pastein/api/public/api';

export default function ViewPaste() {
  const { code } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [shareMessage, setShareMessage] = useState('');
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isExpired, setIsExpired] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Action Gate states
  const [showActionGate, setShowActionGate] = useState(false);
  const [completedActions, setCompletedActions] = useState(new Set());
  const [processingAction, setProcessingAction] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/resolve/${code}`);
        const pasteData = response.data.data;

        // Check if password protected
        setData(pasteData);

        // Check if password protected
        if (pasteData.is_password_protected) {
          setIsPasswordProtected(true);
        }
        
        // Check if action gate is required
        if (pasteData.require_actions && pasteData.actions && pasteData.actions.length > 0) {
          // Load completed actions from localStorage
          const storageKey = `action_gate_${code}`;
          const savedProgress = localStorage.getItem(storageKey);
          
          if (savedProgress) {
            const savedSet = new Set(JSON.parse(savedProgress));
            setCompletedActions(savedSet);
            
            // Check if all actions are already completed
            if (savedSet.size === pasteData.actions.length) {
              // Skip action gate and verification, go directly to content
              setShowActionGate(false);
              setIsVerified(true);
            } else {
              setShowActionGate(true);
            }
          } else {
            setShowActionGate(true);
          }
        }
      } catch (err) {
        console.error(err);
        if (err.response && err.response.status === 404) {
          setError('Paste not found.');
        } else if (err.response && err.response.status === 410) {
          setIsExpired(true);
        } else {
          setError('An error occurred while loading the paste.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (code) {
      fetchData();
    }
  }, [code]);

  const handleCopy = () => {
    if (data?.content) {
      navigator.clipboard.writeText(data.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleVerify = async () => {
    setVerifying(true);

    // Check if this paste was already viewed in this session
    const viewedKey = `paste_viewed_${code}`;
    const alreadyViewed = localStorage.getItem(viewedKey);

    try {
      // Only record visit if not already viewed in this session
      if (!alreadyViewed) {
        // Add a delay to prevent rapid requests
        await new Promise(resolve => setTimeout(resolve, 500));
        await axios.post(`${API_BASE_URL}/visit/${code}`);
        // Mark as viewed in this session
        localStorage.setItem(viewedKey, Date.now().toString());
      }

      setTimeout(() => {
        setVerifying(false);
        setIsVerified(true);
      }, 1000);
    } catch (err) {
      console.error('Error recording visit:', err);
      // Still allow viewing even if visit recording fails
      setTimeout(() => {
        setVerifying(false);
        setIsVerified(true);
      }, 1000);
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: data?.title || 'View this paste',
      text: `Check out this paste: ${data?.title || 'Untitled'}`,
      url: shareUrl
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareMessage('Shared!');
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setShareMessage('Link copied!');
      }
      setTimeout(() => setShareMessage(''), 2000);
    } catch (err) {
      console.error('Error sharing:', err);
      try {
        await navigator.clipboard.writeText(shareUrl);
        setShareMessage('Link copied!');
        setTimeout(() => setShareMessage(''), 2000);
      } catch (clipErr) {
        setShareMessage('Failed to share');
        setTimeout(() => setShareMessage(''), 2000);
      }
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (!password.trim()) {
      setPasswordError('Please enter a password');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/resolve/${code}/verify`, {
        password: password
      });

      // Check if response is successful
      if (response.data && response.data.success) {
        const verifiedData = response.data.data;
        setData(verifiedData);
        setIsPasswordProtected(false);
        
        // Check if action gate is required after password verification
        if (verifiedData.require_actions && verifiedData.actions && verifiedData.actions.length > 0) {
          // Load completed actions from localStorage
          const storageKey = `action_gate_${code}`;
          const savedProgress = localStorage.getItem(storageKey);
          
          if (savedProgress) {
            const savedSet = new Set(JSON.parse(savedProgress));
            setCompletedActions(savedSet);
            
            // Check if all actions are already completed
            if (savedSet.size === verifiedData.actions.length) {
              // Skip action gate and verification, go directly to content
              setShowActionGate(false);
              setIsVerified(true);
            } else {
              setShowActionGate(true);
            }
          } else {
            setShowActionGate(true);
          }
        }
      } else {
        setPasswordError('Incorrect password. Please try again.');
      }
    } catch (err) {
      console.error('Password verification error:', err);
      if (err.response) {
        if (err.response.status === 401 || err.response.status === 403) {
          setPasswordError('Incorrect password. Please try again.');
        } else {
          setPasswordError(err.response.data?.message || 'An error occurred. Please try again.');
        }
      } else {
        setPasswordError('Network error. Please check your connection.');
      }
    }
  };

  const handleActionClick = async (actionIndex) => {
    if (processingAction !== null || completedActions.has(actionIndex)) {
      return; // Already processing or completed
    }

    const action = data.actions[actionIndex];
    
    // Open URL in new tab
    window.open(action.action_url, '_blank', 'noopener,noreferrer');
    
    // Start processing animation
    setProcessingAction(actionIndex);
    
    // Wait 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mark as completed
    const newCompleted = new Set(completedActions);
    newCompleted.add(actionIndex);
    setCompletedActions(newCompleted);
    
    // Save to localStorage
    const storageKey = `action_gate_${code}`;
    localStorage.setItem(storageKey, JSON.stringify(Array.from(newCompleted)));
    
    // Stop processing animation
    setProcessingAction(null);
  };

  const handleContinueFromActionGate = () => {
    // Keep localStorage - don't clear it so actions stay completed permanently
    // User won't need to repeat actions even after refresh or revisit
    
    // Hide action gate and skip verification - go directly to content
    setShowActionGate(false);
    setIsVerified(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center"
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 180, 360],
              borderRadius: ["20%", "50%", "20%"]
            }}
            transition={{
              duration: 2,
              ease: "easeInOut",
              times: [0, 0.5, 1],
              repeat: Infinity
            }}
            className="w-16 h-16 bg-blue-600 text-white rounded-xl flex items-center justify-center text-3xl font-black shadow-blue-500/30 shadow-xl mb-6"
          >
            P
          </motion.div>
          
          <motion.div 
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="font-medium text-slate-400 tracking-widest text-sm uppercase"
          >
            Loading Paste...
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link to="/" className="text-primary-600 hover:underline">Go Home</Link>
        </div>
      </div>
    );
  }

  // SCREEN 0: Expired Page
  if (isExpired) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <NavBar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white text-gray-700 shadow-[0px_-2px_66px_-37px_rgba(0,_0,_0,_0.1)] border border-gray-200 rounded-xl dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 w-full max-w-md p-12 text-center">
            <div className="flex justify-center mb-8">
              <div className="p-6 bg-red-50 border-2 border-red-200 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-3 text-gray-800 dark:text-white">Paste Expired</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">This paste has expired or been deactivated and is no longer available.</p>
            <Link
              to="/"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 font-semibold text-lg text-white bg-primary-600 rounded-lg shadow-md hover:bg-primary-700 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-primary-300 transition-all duration-200"
            >
              Go to Homepage
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // SCREEN 0.5: Password Input
  if (isPasswordProtected) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <NavBar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white text-gray-700 shadow-[0px_-2px_66px_-37px_rgba(0,_0,_0,_0.1)] border border-gray-200 rounded-xl dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 w-full max-w-md p-12 text-center">
            <div className="flex justify-center mb-8">
              <div className="p-6 bg-yellow-50 border-2 border-yellow-200 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-600">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-3 text-gray-800 dark:text-white">Password Protected</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">This paste is password protected. Please enter the password to view it.</p>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="text-left">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                {passwordError && (
                  <p className="mt-2 text-sm text-red-600">{passwordError}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 font-semibold text-lg text-white bg-primary-600 rounded-lg shadow-md hover:bg-primary-700 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-primary-300 transition-all duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                Unlock Paste
              </button>
            </form>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // SCREEN 1.5: Action Gate
  if (showActionGate && data && data.require_actions && data.actions && data.actions.length > 0) {
    const totalActions = data.actions.length;
    const completedCount = completedActions.size;
    const allCompleted = completedCount === totalActions;

    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <NavBar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white text-gray-700 shadow-[0px_-2px_66px_-37px_rgba(0,_0,_0,_0.1)] border border-gray-200 rounded-xl dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 w-full max-w-3xl p-6 sm:p-10">
            
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-800 dark:text-white text-center">Unlock Your Link</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 text-center">Complete the actions and unlock the link</p>
            
            {/* Actions Grid */}
            <div className="grid grid-cols-1 gap-3 mb-6">
              {data.actions.map((action, index) => {
                const isCompleted = completedActions.has(index);
                const isProcessing = processingAction === index;
                const platformColors = getPlatformColors(action.action_type);
                
                return (
                  <button
                    key={index}
                    onClick={() => !isCompleted && !isProcessing && handleActionClick(index)}
                    disabled={isCompleted || isProcessing}
                    className={`relative flex items-center gap-3 p-2 rounded-lg transition-all duration-300 ${
                      isCompleted
                        ? 'bg-gray-50 dark:bg-gray-700/50 cursor-default'
                        : isProcessing
                        ? `${platformColors.bg} opacity-75`
                        : `${platformColors.bg} hover:scale-[1.02] hover:shadow-sm active:scale-[0.98]`
                    }`}
                  >
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${platformColors.iconBg}`}>
                      {getActionIconColored(action.action_type)}
                    </div>
                    
                    {/* Status Text */}
                    <div className="flex-1 text-left min-w-0">
                      {isProcessing ? (
                        <span className={`font-semibold text-sm ${platformColors.text}`}>Processing...</span>
                      ) : isCompleted ? (
                        <span className="font-semibold text-sm text-gray-500 dark:text-gray-400">Completed</span>
                      ) : (
                        <span className={`font-semibold text-sm ${platformColors.text}`}>
                          {action.action_label || getActionDefaultLabel(action.action_type)}
                        </span>
                      )}
                    </div>
                    
                    {/* Status Icon */}
                    <div className="flex-shrink-0">
                      {isCompleted ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={platformColors.checkmark}>
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : isProcessing ? (
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className={`opacity-75 ${platformColors.text}`} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={platformColors.arrow}>
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Progress Section */}
            <div className="mb-6">
              <div className="flex items-center justify-center mb-2">
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Unlock Progress {completedCount}/{totalActions}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-green-500 h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${(completedCount / totalActions) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Continue Button */}
            <button
              onClick={handleContinueFromActionGate}
              disabled={!allCompleted}
              className={`w-full inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold text-base rounded-lg shadow-sm transition-all duration-200 ${
                allCompleted
                  ? 'text-white bg-green-600 hover:bg-green-700 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-green-300'
                  : 'text-gray-400 bg-gray-200 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
              }`}
            >
              {allCompleted ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  Unlock Content
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  Complete All Actions First
                </>
              )}
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // SCREEN 2: Verification
  if (!isVerified) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <NavBar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white text-gray-700 shadow-lg border border-gray-200 rounded-xl dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 w-full max-w-md p-12 text-center">
            <div className="flex justify-center mb-8">
              <div className="p-6 bg-primary-50 border-2 border-primary-200 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-600">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-3 text-gray-800 dark:text-white">Verify that You are not a Robot</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">Please complete this verification to view the content</p>
            <button
              onClick={handleVerify}
              disabled={verifying}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 font-semibold text-lg text-white bg-primary-600 rounded-lg shadow-md hover:bg-primary-700 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-primary-300 disabled:opacity-75 transition-all duration-200"
            >
              {verifying ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  I am Not a Robot
                </>
              )}
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // SCREEN 2: Content
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <NavBar />

      {/* Page Heading */}
      <div className="mb-6 lg:mb-10"></div>

      {/* Page Content */}
      <main>
        <div className="px-4 max-w-7xl mx-auto sm:px-6 lg:px-8 xl:px-12">
          <div className="bg-white text-gray-700 shadow-sm border border-gray-200 rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 max-w-3xl pb-6 mx-auto">
            <div className="px-4 sm:px-6 pt-4 sm:pt-6 flex flex-col gap-y-0.5">
              <h2 className="font-semibold tracking-tighter text-lg">{data.title || 'Untitled Paste'}</h2>

              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4 items-center">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" viewBox="0 0 576 512" fill="currentColor">
                    <path d="M572.5 238.1C518.3 115.5 410.9 32 288 32S57.69 115.6 3.469 238.1C1.563 243.4 0 251 0 256c0 4.977 1.562 12.6 3.469 17.03C57.72 396.5 165.1 480 288 480s230.3-83.58 284.5-206.1C574.4 268.6 576 260.1 576 256C576 251 574.4 243.4 572.5 238.1zM432 256c0 79.45-64.47 144-143.9 144C208.6 400 144 335.5 144 256S208.5 112 288 112S432 176.5 432 256zM288 160C285.7 160 282.4 160.4 279.5 160.8C284.8 170 288 180.6 288 192c0 35.35-28.65 64-64 64C212.6 256 201.1 252.7 192.7 247.5C192.4 250.5 192 253.6 192 256c0 52.1 43 96 96 96s96-42.99 96-95.99S340.1 160 288 160z"></path>
                  </svg>
                  <span><b>{data.views_count || 0}</b></span> <span>Views</span>
                </div>

                <div className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 448 512" fill="currentColor">
                    <path d="M400 64H352V31.1C352 14.4 337.6 0 320 0s-32 14.4-32 31.1V64H160V31.1C160 14.4 145.6 0 128 0S96 14.4 96 31.1V64H48c-26.51 0-48 21.49-48 48L0 160h448l.0002-48C448 85.49 426.5 64 400 64zM.0002 464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48L448 192H0L.0002 464zM120 272h208C341.3 272 352 282.8 352 296S341.3 320 328 320h-208C106.8 320 96 309.3 96 296S106.8 272 120 272zM120 368h112c13.25 0 24 10.75 24 24S245.3 416 232 416h-112C106.8 416 96 405.3 96 392S106.8 368 120 368z"></path>
                  </svg>
                  <b>Created:</b> <span>{new Date(data.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
              </div>

              <div className="text-gray-500 text-sm border rounded-md dark:border-gray-700 overflow-hidden">
                <div className="px-5 py-3 bg-gray-100 dark:bg-gray-700">
                  <div className="flex items-center justify-between gap-5">
                    <h2 className="text-lg font-bold dark:text-white truncate">
                      {data.title || 'Untitled Paste'}
                    </h2>

                    <div className="inline-flex gap-3 shrink-0">
                      <div className="text-sm font-normal copy_cnt group">
                        <button
                          onClick={handleCopy}
                          className={`text-primary-600 hover:underline ${copied ? 'hidden' : 'block'}`}
                        >
                          Copy
                        </button>
                        <span className={`${copied ? 'block' : 'hidden'} text-green-600`}>Copied!</span>
                      </div>
                      <div className="text-sm font-normal report_cnt">
                        <a href="#" className="text-red-600 hover:underline">Report</a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 dark:bg-gray-900">
                  <div className="mainCnt content-body text-base">
                    <LinkifiedContent content={data.content} />
                  </div>

                  <div className="mt-8 pt-6 border-t border-dashed border-gray-200">
                    <div className="text-xs text-gray-400 mb-2">Sponsored from Pastelink</div>
                    <button className="flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2 rounded font-semibold text-sm w-full hover:bg-primary-700 transition">
                      Download Video
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                    </button>
                  </div>
                </div>

                <div className="px-5 py-3 border-t dark:border-gray-700 bg-white">
                  <div className="inline-flex gap-5 text-gray-500 text-sm items-center flex-wrap">
                    <span className="cursor-pointer hover:underline hover:text-primary-600">Download</span>
                    <button onClick={handleShare} className="cursor-pointer hover:underline hover:text-primary-600 bg-transparent border-0 p-0 text-sm">
                      {shareMessage || 'Share'}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={handleCopy}
                        className={`hover:underline hover:text-primary-600 ${copied ? 'hidden' : 'block'}`}
                      >
                        Copy
                      </button>
                      <span className={`${copied ? 'block' : 'hidden'} text-green-600`}>Copied!</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function NavBar() {
  return (
    <nav className="sticky top-0 z-10 bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8 xl:px-12">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                {/* <img class="block w-auto h-9" src="..." alt="PasteLink.ID"> */}
                <div className="w-8 h-8 bg-primary-600 rounded mr-2 flex items-center justify-center text-white font-bold">P</div>

                <h2 className="ml-2"><span className="self-center text-lg font-black dark:text-white sm:text-xl whitespace-nowrap">
                  Paste<span className="text-primary-700 dark:text-primary-300">in</span>
                </span></h2>
              </Link>
            </div>

            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
              <Link className="inline-flex items-center px-1 pt-1 border-b-2 border-primary-500 text-sm font-medium leading-5 text-gray-900 focus:outline-none focus:border-primary-700 transition duration-150 ease-in-out" to="/">
                Home
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-5">
            <div className="sm:flex">
              <Link to="/create" className="inline-flex items-center px-4 py-2 font-semibold text-sm text-white bg-primary-600 rounded-md shadow hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                Create Paste
              </Link>
            </div>

            <div className="hidden space-x-5 sm:-my-px sm:flex">
              <Link className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium leading-5 text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:outline-none focus:text-gray-700 focus:border-gray-300 transition duration-150 ease-in-out" to="/login">
                Login
              </Link>
              <Link className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium leading-5 text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:outline-none focus:text-gray-700 focus:border-gray-300 transition duration-150 ease-in-out" to="/register">
                Register
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="py-5 mx-auto mt-6 lg:mt-10 bg-primary-800 text-white">
      <div className="max-w-screen-xl px-4 py-4 mx-auto lg:px-20">
        <div className="flex flex-col items-center justify-center text-center">
          <Link to="/" className="flex items-center justify-center gap-2 text-white mb-2">
            <div className="w-8 h-8 bg-white text-primary-800 rounded flex items-center justify-center font-bold">P</div>
            <span className="self-center text-2xl font-black sm:text-3xl whitespace-nowrap">
              Pastein
            </span>
          </Link>

          <p className="my-2 leading-tight text-center text-primary-200 text-sm max-w-2xl px-4">
            Pastein is the best online text storage service for sharing code and notes online,
            Pastein is also the best platform for saving and sharing text and code.
          </p>
        </div>

        <ul className="flex flex-wrap items-center justify-center space-x-4 space-y-2 mt-4 text-sm md:text-base">
          <li><a href="#" className="text-primary-50 hover:underline">Terms of service</a></li>
          <li><a href="#" className="text-primary-50 hover:underline">Privacy Policy</a></li>
          <li><a href="#" className="text-primary-50 hover:underline">About</a></li>
          <li><a href="#" className="text-primary-50 hover:underline">Contact</a></li>
          <li><a href="#" className="text-primary-50 hover:underline">Report Abuse</a></li>
        </ul>

        <div className="my-5 border-t opacity-10 border-primary-200 w-full"></div>

        <div className="mb-3 text-center">
          <p className="mt-4 text-sm text-primary-200 opacity-85">
            © 2023-2026 <a href="#" className="font-bold hover:underline">Pastein™</a>. All rights reserved.
          </p>
        </div>

        <div className="flex justify-center space-x-5 mt-4">
          {/* Social Icons placeholders */}
          <a href="#" className="text-primary-200 hover:text-white">FB</a>
          <a href="#" className="text-primary-200 hover:text-white">IG</a>
          <a href="#" className="text-primary-200 hover:text-white">TG</a>
        </div>
      </div>
    </footer>
  );
}

// Helper function to get platform-specific colors
function getPlatformColors(actionType) {
  switch (actionType) {
    case 'youtube':
      return {
        bg: 'bg-red-50 dark:bg-red-900/20',
        iconBg: 'bg-white',
        text: 'text-red-600',
        checkmark: 'text-red-600',
        arrow: 'text-red-600'
      };
    case 'instagram':
      return {
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        iconBg: 'bg-white',
        text: 'text-purple-600',
        checkmark: 'text-purple-600',
        arrow: 'text-purple-600'
      };
    case 'tiktok':
      return {
        bg: 'bg-gray-50 dark:bg-gray-900/20',
        iconBg: 'bg-white',
        text: 'text-gray-800',
        checkmark: 'text-gray-800',
        arrow: 'text-gray-800'
      };
    case 'facebook':
      return {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        iconBg: 'bg-white',
        text: 'text-blue-600',
        checkmark: 'text-blue-600',
        arrow: 'text-blue-600'
      };
    case 'twitter':
      return {
        bg: 'bg-sky-50 dark:bg-sky-900/20',
        iconBg: 'bg-white',
        text: 'text-sky-500',
        checkmark: 'text-sky-500',
        arrow: 'text-sky-500'
      };
    case 'whatsapp':
      return {
        bg: 'bg-green-50 dark:bg-green-900/20',
        iconBg: 'bg-white',
        text: 'text-green-600',
        checkmark: 'text-green-600',
        arrow: 'text-green-600'
      };
    case 'telegram':
      return {
        bg: 'bg-cyan-50 dark:bg-cyan-900/20',
        iconBg: 'bg-white',
        text: 'text-cyan-500',
        checkmark: 'text-cyan-500',
        arrow: 'text-cyan-500'
      };
    case 'discord':
      return {
        bg: 'bg-indigo-50 dark:bg-indigo-900/20',
        iconBg: 'bg-white',
        text: 'text-indigo-600',
        checkmark: 'text-indigo-600',
        arrow: 'text-indigo-600'
      };
    case 'custom':
    default:
      return {
        bg: 'bg-gray-50 dark:bg-gray-700/50',
        iconBg: 'bg-white dark:bg-gray-600',
        text: 'text-gray-700 dark:text-gray-300',
        checkmark: 'text-gray-600',
        arrow: 'text-gray-600'
      };
  }
}

// Helper function to get colored icon for action type
function getActionIconColored(actionType) {
  switch (actionType) {
    case 'youtube':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#FF0000">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      );
    case 'instagram':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="url(#instagram-gradient)">
          <defs>
            <linearGradient id="instagram-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FD5949" />
              <stop offset="50%" stopColor="#D6249F" />
              <stop offset="100%" stopColor="#285AEB" />
            </linearGradient>
          </defs>
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      );
    case 'tiktok':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#000000">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
        </svg>
      );
    case 'facebook':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#1877F2">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      );
    case 'twitter':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#1DA1F2">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      );
    case 'whatsapp':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#25D366">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      );
    case 'telegram':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#0088cc">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
        </svg>
      );
    case 'discord':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#5865F2">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
        </svg>
      );
    case 'custom':
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      );
  }
}

// Helper function to get icon for action type
function getActionIcon(actionType, isCompleted = false) {
  const iconColor = isCompleted ? 'text-green-600' : 'text-gray-600';
  
  switch (actionType) {
    case 'youtube':
      return (
        <svg className={iconColor} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      );
    case 'instagram':
      return (
        <svg className={iconColor} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      );
    case 'tiktok':
      return (
        <svg className={iconColor} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
        </svg>
      );
    case 'facebook':
      return (
        <svg className={iconColor} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      );
    case 'twitter':
      return (
        <svg className={iconColor} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      );
    case 'custom':
    default:
      return (
        <svg className={iconColor} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      );
  }
}

// Helper function to get default label for action type
function getActionDefaultLabel(actionType) {
  switch (actionType) {
    case 'youtube':
      return 'Visit YouTube Channel';
    case 'instagram':
      return 'Follow on Instagram';
    case 'tiktok':
      return 'Follow on TikTok';
    case 'facebook':
      return 'Like Facebook Page';
    case 'twitter':
      return 'Follow on Twitter';
    case 'custom':
    default:
      return 'Visit Link';
  }
}

// Helper for Content Body Detection
function LinkifiedContent({ content }) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const renderContent = () => {
    if (!content) return null;
    const parts = content.split('\n');
    return parts.map((line, lineIndex) => {
      const segments = line.split(urlRegex);
      return (
        <div key={lineIndex} className="min-h-[1.5em]">
          {segments.map((segment, segmentIndex) => {
            if (urlRegex.test(segment)) {
              return (
                <a
                  key={segmentIndex}
                  href={segment}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline break-all"
                >
                  {segment}
                </a>
              );
            }
            return <span key={segmentIndex}>{segment}</span>;
          })}
        </div>
      );
    });
  };
  return <div>{renderContent()}</div>;
}
