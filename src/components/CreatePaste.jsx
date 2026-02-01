import React from 'react';
import { Globe, Clock, Lock, MoreHorizontal } from 'lucide-react';

const CreatePaste = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="container mx-auto">
         <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-slate-900 mb-2">Create a new Paste</h2>
            <p className="text-slate-500">Create and publish any code and text instantly.</p>
         </div>
         
         <div className="bg-white rounded-3xl shadow-xl p-8 max-w-5xl mx-auto border border-slate-100">
            <div className="flex flex-col lg:flex-row gap-8">
               {/* Left: Content */}
               <div className="flex-1 space-y-6">
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Title (Optional)</label>
                     <input type="text" placeholder="My Awesome Snippet" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-700" />
                  </div>
                  
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Content</label>
                     <div className="relative">
                        <textarea 
                           className="w-full h-80 bg-slate-50 border border-slate-200 rounded-lg px-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono text-sm resize-none"
                           placeholder="Paste your code or text here..."
                        ></textarea>
                        <div className="absolute bottom-4 right-4 text-slate-400 cursor-se-resize">
                           <MoreHorizontal size={20} />
                        </div>
                     </div>
                  </div>
               </div>
               
               {/* Right: Settings */}
               <div className="lg:w-80 space-y-6">
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                     <div className="flex items-center gap-2 mb-4 text-slate-700 font-bold">
                        <Globe size={18} /> Visibility
                     </div>
                     <div className="flex bg-white rounded-lg p-1 border border-slate-200">
                        <button className="flex-1 py-1.5 text-sm font-medium rounded-md bg-blue-600 text-white shadow-sm">Public</button>
                        <button className="flex-1 py-1.5 text-sm font-medium rounded-md text-slate-500 hover:bg-slate-50">Private</button>
                     </div>
                  </div>

                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                     <div className="flex items-center gap-2 mb-4 text-slate-700 font-bold">
                        <Clock size={18} /> Expiry
                     </div>
                     <div className="flex bg-white rounded-lg p-1 border border-slate-200">
                        <button className="flex-1 py-1.5 text-sm font-medium rounded-md bg-slate-800 text-white shadow-sm">Never</button>
                        <button className="flex-1 py-1.5 text-sm font-medium rounded-md text-slate-500 hover:bg-slate-50">Expired</button>
                     </div>
                  </div>

                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                     <div className="flex items-center gap-2 mb-4 text-slate-700 font-bold">
                        <Lock size={18} /> Action Gate
                     </div>
                     <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500 font-medium">Require Social Action</span>
                        <div className="w-10 h-6 bg-slate-200 rounded-full relative cursor-pointer">
                           <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 shadow-sm"></div>
                        </div>
                     </div>
                  </div>
                  
                  <button className="w-full py-4 bg-slate-900 text-white font-bold rounded-lg shadow-lg hover:bg-slate-800 transition-all transform hover:-translate-y-0.5">
                     PUBLISH PASTE
                  </button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default CreatePaste;
