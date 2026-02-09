
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavBar from './NavBar';
import Footer from './Footer';

export default function CreatePaste() {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [syntax, setSyntax] = useState('text');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Placeholder for API call
    // await axios.post(...)
    // navigate(`/${code}`);
    setTimeout(() => {
        setLoading(false);
        alert("Create Paste logic needs to be connected to API");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      <NavBar />
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Create New Paste</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title (Optional)</label>
                    <input 
                        type="text" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="My Awesome Paste"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Content</label>
                    <textarea 
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full h-64 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-y"
                        placeholder="Paste your content here..."
                        required
                    />
                </div>
                
                <div className="flex justify-end">
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? 'Creating...' : 'Create Paste'}
                        {!loading && <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>}
                    </button>
                </div>
            </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
