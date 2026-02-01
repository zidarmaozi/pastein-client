import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  FileText, 
  User, 
  MoreHorizontal, 
  ChevronRight, 
  Lock, 
  Globe, 
  Clock, 
  Share2, 
  ShieldCheck, 
  BarChart2, 
  Download, 
  Play,
  Zap,
  ChevronDown,
  Plus
} from 'lucide-react';

// --- Components ---

const Navbar = () => (
  <nav className="absolute top-0 left-0 right-0 z-50 py-4 text-white">
    <div className="container mx-auto px-6 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <div className="text-2xl font-bold flex items-center gap-2">
           <div className="w-8 h-8 bg-white text-blue-800 rounded-lg flex items-center justify-center font-black">P</div>
           PasteIn
        </div>
        <div className="hidden md:flex items-center gap-6 text-white/80 text-sm font-medium">
          <a href="#" className="flex items-center gap-2 hover:text-white transition-colors">
            <LayoutDashboard size={16} /> Dashboard
          </a>
          <a href="#" className="flex items-center gap-2 hover:text-white transition-colors">
            <FileText size={16} /> My Pastes
          </a>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
         <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <Clock size={18} />
         </button>
         <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <User size={18} />
         </button>
      </div>
    </div>
  </nav>
);

const HeroSection = () => (
  <section className="bg-blue-800 min-h-[700px] relative pt-24 overflow-hidden">
    {/* Background Shapes */}
    <div className="absolute top-0 right-0 w-2/3 h-full bg-blue-700/20 skew-x-12 translate-x-1/4"></div>

    <div className="container mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center gap-12 mt-10">
      <div className="lg:w-1/2 text-white">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 mb-6 text-sm font-medium">
          <span className="bg-blue-500 text-xs px-2 py-0.5 rounded text-white font-bold">New</span>
          Best Paste Service <ChevronRight size={14} />
        </div>
        
        <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6">
          Discover the Ease of <br/> Sharing with <span className="text-blue-300">PasteIn</span>
        </h1>
        
        <p className="text-lg text-blue-100 mb-10 max-w-lg leading-relaxed">
          Make your Paste Now and Experience the Ease of Sharing Text and Links instantly. 
          The best Pastelink Service designed for you.
        </p>
        
        
        <div className="flex gap-4">
          <Link to="/create" className="px-6 py-3 bg-white text-blue-900 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-50 transition-colors shadow-lg">
            Create Paste <Plus size={18} />
          </Link>
          <button className="px-6 py-3 bg-transparent border border-white/30 text-white rounded-lg font-bold hover:bg-white/10 transition-colors">
            Learn More
          </button>
        </div>
      </div>
      
      <div className="lg:w-1/2 relative hidden sm:block">
        <div className="relative z-10 bg-slate-900 rounded-xl shadow-2xl border border-slate-700 p-2 transform rotate-1 hover:rotate-0 transition-transform duration-500">
           {/* Mockup Header */}
           <div className="bg-slate-800 h-8 rounded-t-lg flex items-center px-4 gap-2">
             <div className="w-3 h-3 rounded-full bg-red-500"></div>
             <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
             <div className="w-3 h-3 rounded-full bg-green-500"></div>
             <div className="ml-4 bg-slate-900/50 px-3 py-0.5 rounded text-xs text-slate-500 font-mono w-full max-w-[200px] text-center">pastein.text/demo</div>
           </div>
           {/* Mockup Body */}
           <div className="bg-slate-900 p-6 rounded-b-lg font-mono text-sm min-h-[300px]">
              <div className="flex gap-4 mb-4">
                 <div className="w-12 h-12 bg-slate-800 rounded"></div>
                 <div className="flex-1 space-y-2">
                    <div className="h-2 bg-slate-800 w-1/3 rounded"></div>
                    <div className="h-2 bg-slate-800 w-1/2 rounded"></div>
                 </div>
              </div>
              <div className="space-y-2 mb-8">
                 <div className="h-2 bg-slate-800 w-full rounded"></div>
                 <div className="h-2 bg-slate-800 w-5/6 rounded"></div>
                 <div className="h-2 bg-slate-800 w-4/6 rounded"></div>
              </div>
              
              <div className="border border-slate-700/50 rounded p-4 text-green-400">
                 <span className="text-purple-400">function</span> <span className="text-yellow-300">share</span>() {'{'} <br/>
                 &nbsp;&nbsp;<span className="text-purple-400">return</span> <span className="text-orange-300">"Simple & Fast"</span>;<br/>
                 {'}'}
              </div>
           </div>
        </div>
      </div>
    </div>
  </section>
);

// Reuse the footer but update styling to match
const Footer = () => (
   <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
       <div className="container mx-auto px-6 text-center">
           <div className="flex items-center justify-center gap-2 mb-8">
               <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">P</div>
               <span className="text-white font-bold text-xl">PasteIn</span>
           </div>
           <p className="mb-8 text-sm">© {new Date().getFullYear()} PasteIn. All rights reserved.</p>
       </div>
   </footer>
);

// Simplified Landing Page
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <Footer />
    </div>
  );
}
