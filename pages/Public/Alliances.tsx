
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Globe, Activity, Share2, Layers, Target,
  Database, ShieldCheck, Link2, Sparkles,
  ArrowRight, HeartHandshake, MapPin, Stethoscope, Microscope
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '../../components/SEO';

const FEATURED_MANUFACTURERS = [
  { name: "Siemens Healthineers", origin: "Germany", sector: "Imaging Systems", desc: "Pioneering breakthroughs in healthcare with advanced diagnostic and therapeutic imaging.", status: "Verified", icon: <Activity size={28}/>, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  { name: "GE Healthcare", origin: "USA", sector: "Radiology", desc: "Delivering transformational medical technologies and services that are shaping a new age of patient care.", status: "Verified", icon: <Layers size={28}/>, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
  { name: "Philips Medical", origin: "Netherlands", sector: "Diagnostics", desc: "Meaningful innovations that improve people's health and well-being across the health continuum.", status: "Verified", icon: <Stethoscope size={28}/>, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  { name: "Mindray Global", origin: "China", sector: "Laboratory Hub", desc: "Advanced medical devices and solutions accessible to humanity, focusing on patient monitoring and IT.", status: "Verified", icon: <Microscope size={28}/>, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  { name: "Roche Diagnostics", origin: "Switzerland", sector: "Pathology", desc: "World leader in in-vitro diagnostics and tissue-based cancer diagnostics.", status: "Verified", icon: <Target size={28}/>, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
  { name: "Medtronic Systems", origin: "Ireland", sector: "Surgical", desc: "Transforming the lives of two people every second with medical technology, services, and solutions.", status: "Verified", icon: <Database size={28}/>, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" }
];

export const Alliances: React.FC = () => {
  return (
    <div className="pt-24 bg-[#020408] text-slate-200 overflow-hidden min-h-screen font-sans selection:bg-blue-600">
      <SEO title="Our Partners" description="Carelink's global network of manufacturing partners." />

      {/* 1. HERO SECTION - Smart, Casual, Engaging with Logo */}
      <section className="relative py-20 md:py-32 border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.06),transparent_70%)] pointer-events-none" />
        
        <div className="max-w-[1200px] mx-auto px-6 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
             
             {/* Logo Integration */}
             <div className="flex justify-center mb-8">
                <div className="w-20 h-20 bg-white/[0.03] p-4 rounded-[2rem] border border-white/10 flex items-center justify-center shadow-xl">
                   <img src="https://i.imgur.com/y0UvXGu.png" alt="Carelink Logo" className="w-full h-full object-contain" />
                </div>
             </div>

             <div className="flex items-center justify-center gap-3 mb-6">
                <div className="px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-sm font-semibold border border-blue-500/20 flex items-center gap-2 shadow-sm">
                  <HeartHandshake size={16} /> Global Alliance Network
                </div>
             </div>
             
             <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1] mb-6">
               World-class quality, <br /><span className="text-blue-400">delivered locally.</span>
             </h1>
             
             <p className="text-lg md:text-xl text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto mb-10">
               We team up with the smartest, most reliable medical manufacturers around the globe to bring exceptional clinical gear right to your facility.
             </p>
             
             <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link to="/acquisition" className="flex items-center gap-3 px-8 py-4 bg-white text-slate-900 rounded-2xl font-bold text-base shadow-xl hover:bg-slate-200 hover:scale-105 transition-all">
                   Work With Us <ArrowRight size={18} />
                </Link>
                <div className="flex items-center gap-3 px-8 py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-base font-bold text-white shadow-xl">
                   <Globe size={20} className="text-blue-400" /> 480+ Brands Connected
                </div>
             </div>
          </motion.div>
        </div>
      </section>

      {/* 2. CUTE & MODERN MANUFACTURERS GRID */}
      <section className="py-24 bg-[#020408]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <header className="text-center mb-16 space-y-4">
             <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Featured Manufacturers</h2>
             <p className="text-slate-400 text-lg font-medium max-w-xl mx-auto">Discover the industry leaders powering modern healthcare infrastructure through our network.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {FEATURED_MANUFACTURERS.map((node, i) => (
               <motion.div 
                 key={i} 
                 whileHover={{ y: -8 }}
                 className="p-8 bg-[#0a0d14] border border-white/5 rounded-[2.5rem] flex flex-col h-full group hover:border-slate-700 hover:shadow-2xl hover:shadow-black transition-all relative overflow-hidden"
               >
                  {/* Subtle Background Glow on Hover */}
                  <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-0 group-hover:opacity-20 transition-opacity ${node.bg}`} />

                  <div className="flex justify-between items-start mb-8 relative z-10">
                     <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center border transition-transform group-hover:scale-110 ${node.bg} ${node.color} ${node.border}`}>
                        {node.icon}
                     </div>
                     <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                        <ShieldCheck size={14} className="text-emerald-400" />
                        <span className="text-xs font-bold text-emerald-400">{node.status}</span>
                     </div>
                  </div>
                  
                  <div className="flex-1 relative z-10">
                    <h3 className="text-2xl font-bold text-white tracking-tight mb-2 group-hover:text-blue-400 transition-colors">{node.name}</h3>
                    
                    <div className="flex flex-wrap items-center gap-2 mb-6">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 bg-white/5 px-3 py-1 rounded-lg border border-white/5">
                        <MapPin size={12} /> {node.origin}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 bg-white/5 px-3 py-1 rounded-lg border border-white/5">
                        {node.sector}
                      </span>
                    </div>

                    <p className="text-slate-400 text-sm font-medium leading-relaxed mb-6 line-clamp-3">
                      {node.desc}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-white/5 mt-auto relative z-10">
                     <Link to="/portfolio" className="inline-flex items-center gap-2 text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors group/link">
                        Explore Catalog <ArrowRight size={16} className="group-hover/link:translate-x-1 transition-transform" />
                     </Link>
                  </div>
               </motion.div>
             ))}
          </div>
        </div>
      </section>

      {/* 3. FLOWING TICKER - Smooth & Neat */}
      <section className="py-8 border-y border-white/5 bg-[#05070a] overflow-hidden relative">
         <div className="flex whitespace-nowrap animate-ticker py-2 items-center">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="flex items-center mx-8">
                 <span className="text-sm font-bold text-slate-300 tracking-wide">
                   {FEATURED_MANUFACTURERS[i % 6].name}
                 </span>
                 <span className="mx-8 text-slate-700">•</span>
                 <span className="text-sm font-semibold text-blue-400">
                   {FEATURED_MANUFACTURERS[i % 6].sector}
                 </span>
                 <span className="mx-8 text-slate-700">•</span>
              </div>
            ))}
         </div>
      </section>

      {/* 4. WHY PARTNER WITH US? - Modern & Engaging */}
      <section className="py-32 bg-[#020408]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
           <div className="space-y-10">
              <div className="space-y-4">
                 <div className="flex items-center gap-2 text-blue-400 mb-2">
                    <Sparkles size={20} />
                    <span className="text-sm font-bold uppercase tracking-wider">The Carelink Advantage</span>
                 </div>
                 <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
                    Making global sourcing <br /> <span className="text-blue-500">beautifully simple.</span>
                 </h2>
              </div>
              
              <div className="space-y-6">
                 {[
                   { title: "Direct Connections", desc: "We eliminate the middlemen. Get your equipment shipped directly from the factory, saving time and cost.", icon: <Link2 size={24}/> },
                   { title: "Assured Quality", desc: "Every single piece of equipment is rigorously verified to meet local and international healthcare standards.", icon: <ShieldCheck size={24}/> },
                   { title: "Expert Installation", desc: "Our field engineers don't just deliver; they install, test, and train your team personally on-site.", icon: <Activity size={24}/> }
                 ].map((item, i) => (
                   <div key={i} className="flex gap-6 p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group">
                      <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-sm">
                         {item.icon}
                      </div>
                      <div>
                         <h4 className="text-lg font-bold text-white mb-2">{item.title}</h4>
                         <p className="text-sm text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
           
           <div className="relative flex justify-center lg:justify-end">
              <div className="w-full max-w-md aspect-square bg-gradient-to-br from-blue-900/40 to-[#0a0d14] rounded-[3rem] border border-white/10 flex items-center justify-center relative overflow-hidden group shadow-2xl">
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.15),transparent)]" />
                 <Globe size={300} className="text-blue-500/10 absolute group-hover:scale-110 group-hover:rotate-12 transition-transform duration-1000" />
                 
                 <div className="text-center relative z-10 p-10 bg-[#020408]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-2xl w-4/5">
                    <div className="text-6xl font-bold text-white tracking-tight mb-2">99%</div>
                    <p className="text-sm font-semibold text-blue-400 mb-8 uppercase tracking-widest">Supply Reliability</p>
                    <Link to="/acquisition" className="inline-flex items-center justify-center w-full py-4 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-blue-600 hover:text-white transition-all shadow-lg">
                       Get a Quote <ArrowRight size={18} className="ml-2" />
                    </Link>
                 </div>
              </div>
           </div>
        </div>
      </section>

      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          display: inline-flex;
          animation: ticker 40s linear infinite;
        }
      `}</style>
    </div>
  );
};
