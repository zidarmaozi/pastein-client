import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from './NavBar';
import Footer from './Footer';
import AdSlot from './AdSlot';

function LinkifiedContent({ content }) {
  if (!content) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return (
    <div>
      {content.split('\n').map((line, i) => (
        <div key={i} className="min-h-[1.5em] break-words whitespace-pre-wrap">
          {line.split(urlRegex).map((part, j) => 
            urlRegex.test(part) ? (
              <a key={j} href={part} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline break-all">{part}</a>
            ) : (
              <span key={j}>{part}</span>
            )
          )}
        </div>
      ))}
    </div>
  );
}

export default function ContentPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [shareMessage, setShareMessage] = useState('');

  useEffect(() => {
    const checkAccess = () => {
      const isVerified = sessionStorage.getItem('is_verified');
      const pasteData = sessionStorage.getItem('verified_paste_data');

      if (!isVerified || !pasteData) {
        const code = localStorage.getItem('paste_code');
        if (code) { navigate('/verify'); } else { navigate('/'); }
        return;
      }
      setData(JSON.parse(pasteData));
      setLoading(false);
    };
    checkAccess();
  }, [navigate]);

  const handleCopy = () => {
    if (data?.content) {
      navigator.clipboard.writeText(data.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
      // Use the specific domain provided by the user
      const shareUrl = `http://pastein.test/${localStorage.getItem('paste_code')}`;
      try {
        await navigator.clipboard.writeText(shareUrl);
        setShareMessage('Link copied!');
        setTimeout(() => setShareMessage(''), 2000);
      } catch (err) { console.error("Failed to copy", err); }
  };

  if (loading) return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      <NavBar />
      <main className="flex-1 py-8">
        <div className="px-4 max-w-7xl mx-auto sm:px-6 lg:px-8 xl:px-12 flex flex-col gap-6">
          
          {/* Ad Slot 1: Top (Above Content Card) */}
          <div className="max-w-3xl mx-auto w-full">
             <AdSlot label="Ad Space (Top)" />
          </div>

          <div className="bg-white text-gray-700 shadow-sm border border-gray-200 rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 max-w-3xl w-full pb-6 mx-auto">
            
            <div className="px-4 sm:px-6 pt-4 sm:pt-6 flex flex-col gap-y-0.5">
                <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-2xl mb-2">{data.title || 'Untitled Paste'}</h2>

                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4 items-center">
                   <div className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                      {data.views_count} Views
                   </div>
                   <div className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      {new Date(data.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                   </div>
                   <div className="flex items-center gap-1">
                       <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300">{data.syntax || 'Text'}</span>
                   </div>
                </div>

                <div className="text-gray-500 text-sm border rounded-md dark:border-gray-700 overflow-hidden">
                   <div className="px-5 py-3 bg-gray-50 dark:bg-gray-700/50 border-b dark:border-gray-700">
                      <div className="flex items-center justify-between gap-5">
                         <h2 className="text-sm font-medium text-gray-600 dark:text-gray-300 truncate">{data.title || 'Untitled Paste'}</h2>
                         <div className="flex items-center gap-2">
                             <a href="#" className="flex items-center gap-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                                <span className="hidden sm:inline" onClick={handleCopy}>{copied ? 'Copied' : 'Copy'}</span>
                             </a>
                         </div>
                      </div>
                   </div>

                   {/* Ad Slot 2: Middle (Between Toolbar and Content) */}
                   <div className="p-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
                      <AdSlot label="Ad Space (Middle)" className="min-h-[80px]" />
                   </div>

                   <div className="p-5 bg-white dark:bg-gray-900 overflow-x-auto">
                       <div className="font-mono text-base text-gray-800 dark:text-gray-200 whitespace-pre">
                           <LinkifiedContent content={data.content} />
                       </div>
                   </div>

                   {/* Ad Slot 3: Bottom (Below Content) */}
                   <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700">
                      <AdSlot label="Ad Space (Bottom)" className="min-h-[80px]" />
                   </div>

                   <div className="px-5 py-3 bg-gray-50 dark:bg-gray-700/50 border-t dark:border-gray-700 flex justify-between items-center flex-wrap gap-2">
                       <button className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm">
                           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                           Download
                       </button>
                       <div className="flex items-center gap-3">
                           <button onClick={handleShare} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-sm">
                               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                               {shareMessage || 'Share'}
                           </button>
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
