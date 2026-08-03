import React from 'react';
import { motion } from 'framer-motion';
import { 
  Globe, Activity, Layers, Target,
  Database, ShieldCheck, Link2, Sparkles,
  ArrowRight, HeartHandshake, MapPin, Stethoscope, Microscope
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '../../components/SEO';

const FEATURED_MANUFACTURERS = [
  { name: "Siemens Healthineers", origin: "Germany", sector: "Imaging Systems", desc: "Pioneering breakthroughs in healthcare with advanced diagnostic and therapeutic imaging.", status: "Verified Manufacturer", icon: <Activity size={28}/>, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
  { name: "GE Healthcare", origin: "USA", sector: "Radiology", desc: "Delivering transformational medical technologies and services that are shaping a new age of patient care.", status: "Verified Manufacturer", icon: <Layers size={28}/>, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100" },
  { name: "Philips Medical", origin: "Netherlands", sector: "Diagnostics", desc: "Meaningful innovations that improve people's health and well-being across the health continuum.", status: "Verified Manufacturer", icon: <Stethoscope size={28}/>, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
  { name: "Mindray Global", origin: "China", sector: "Laboratory Hub", desc: "Advanced medical devices and solutions accessible to humanity, focusing on patient monitoring and IT.", status: "Verified Manufacturer", icon: <Microscope size={28}/>, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100" },
  { name: "Roche Diagnostics", origin: "Switzerland", sector: "Pathology", desc: "World leader in in-vitro diagnostics and tissue-based cancer diagnostics.", status: "Verified Manufacturer", icon: <Target size={28}/>, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100" },
  { name: "Medtronic Systems", origin: "Ireland", sector: "Surgical", desc: "Transforming the lives of two people every second with medical technology, services, and solutions.", status: "Verified Manufacturer", icon: <Database size={28}/>, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" }
];

export const Alliances: React.FC = () => {
  return (
    <div className="pt-24 bg-white text-slate-800 overflow-hidden min-h-screen font-sans selection:bg-blue-600">
      <SEO 
        title="Our Partners | Global Manufacturers & Dürr Dental" 
        description="Explore Carelink Healthineers' direct partnerships with world-leading medical and dental manufacturers including Dürr Dental, Siemens, GE, and Philips."
        keywords={['medical partners', 'Dürr Dental partner', 'medical equipment manufacturers', 'Siemens Healthineers', 'GE Healthcare']}
      />

      {/* 1. HERO SECTION - Classical Light Theme */}
      <section className="relative py-24 md:py-32 border-b border-slate-100 bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.03),transparent_70%)] pointer-events-none" />
        
        <div className="max-w-[1200px] mx-auto px-6 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
             
             {/* Logo Integration */}
             <div className="flex justify-center mb-8">
                <div className="w-20 h-20 bg-slate-50 p-4 rounded-[2rem] border border-slate-200/80 flex items-center justify-center shadow-md">
                   <img src="https://i.imgur.com/y0UvXGu.png" alt="Carelink Logo" className="w-full h-full object-contain" />
                </div>
             </div>

             <div className="flex items-center justify-center mb-6">
                <div className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold border border-blue-100 flex items-center gap-2 shadow-sm uppercase tracking-wider">
                  <HeartHandshake size={14} /> Global Sourcing Partners
                </div>
             </div>
             
             <h1 className="text-4xl md:text-6xl lg:text-7xl font-normal text-slate-900 tracking-tight leading-[1.12] mb-6 font-serif-classical">
               World-class quality, <br />
               <span className="text-blue-600 italic font-serif-classical">delivered globally.</span>
             </h1>
             
             <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto mb-10">
               We partner directly with leading tier-1 medical manufacturers around the globe to bring exceptional clinical equipment to healthcare facilities.
             </p>
             
             <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                 <Link to="/acquisition" className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-blue-600 text-white font-bold text-sm tracking-wider uppercase rounded-xl hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-300">
                    Work With Us <ArrowRight size={16} />
                 </Link>
                 <div className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 shadow-sm">
                    <Globe size={16} className="text-blue-600" /> 480+ Brands Connected
                 </div>
             </div>
          </motion.div>
        </div>
      </section>

      {/* 2. MANUFACTURERS GRID - Light Classical Design */}
      <section className="py-24 bg-slate-50 border-b border-slate-200/50">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <header className="text-center mb-16 space-y-4">
             <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">TRUSTED MANUFACTURERS</span>
             <h2 className="text-3xl md:text-5xl font-normal text-slate-900 tracking-tight font-serif-classical">
               Featured Partners
             </h2>
             <p className="text-slate-500 text-lg font-medium max-w-xl mx-auto">
               Discover the industry giants powering modern healthcare infrastructure through our network.
             </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {FEATURED_MANUFACTURERS.map((node, i) => (
               <motion.div 
                 key={i} 
                 whileHover={{ y: -6 }}
                 className="p-8 bg-white border border-slate-200 rounded-[2.2rem] flex flex-col h-full group hover:border-blue-500/20 hover:shadow-md transition-all duration-300 relative overflow-hidden"
               >
                  <div className="flex justify-between items-start mb-8 relative z-10">
                     <div className={`w-16 h-16 rounded-[1.2rem] flex items-center justify-center border transition-transform group-hover:scale-105 ${node.bg} ${node.color} ${node.border}`}>
                        {node.icon}
                     </div>
                     <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                        <ShieldCheck size={14} className="text-emerald-600" />
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">{node.status}</span>
                     </div>
                  </div>
                  
                  <div className="flex-1 relative z-10">
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2 group-hover:text-blue-600 transition-colors">{node.name}</h3>
                    
                    <div className="flex flex-wrap items-center gap-2 mb-6">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                        <MapPin size={12} /> {node.origin}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                        {node.sector}
                      </span>
                    </div>

                    <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6 line-clamp-3">
                      {node.desc}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-slate-100 mt-auto relative z-10">
                     <Link to="/portfolio" className="inline-flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider hover:text-blue-600 transition-colors group/link">
                        Explore Catalog <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                     </Link>
                  </div>
               </motion.div>
             ))}
          </div>
        </div>
      </section>

      {/* 3. FLOWING TICKER - Beautiful soft-gray bar */}
      <section className="py-8 border-b border-slate-100 bg-white overflow-hidden relative">
         <div className="flex whitespace-nowrap animate-ticker py-2 items-center">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="flex items-center mx-8 shrink-0">
                 <span className="text-xs font-bold text-slate-700 tracking-wider">
                   {FEATURED_MANUFACTURERS[i % 6].name}
                 </span>
                 <span className="mx-8 text-slate-300">•</span>
                 <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                   {FEATURED_MANUFACTURERS[i % 6].sector}
                 </span>
                 <span className="mx-8 text-slate-300">•</span>
              </div>
            ))}
         </div>
      </section>

      {/* 4. WHY PARTNER WITH US? - Classical Elegance */}
      <section className="py-32 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
           <div className="space-y-10">
              <div className="space-y-4">
                 <div className="flex items-center gap-2 text-blue-600 mb-2">
                    <Sparkles size={18} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">THE CARELINK ADVANTAGE</span>
                 </div>
                 <h2 className="text-4xl md:text-5xl font-normal text-slate-900 tracking-tight leading-tight font-serif-classical">
                    Making clinical procurement <br /> 
                    <span className="text-blue-600 italic font-serif-classical">beautifully simple.</span>
                 </h2>
              </div>
              
              <div className="space-y-6">
                 {[
                   { title: "Direct Sourcing Pathways", desc: "We eliminate procurement intermediaries. Ship direct from certified factory production lines, maximizing your capital budget efficiency.", icon: <Link2 size={22}/> },
                   { title: "Rigorous Technical Compliance", desc: "Every clinical asset is produced by Dürr Dental and thoroughly vetted to conform with top clinical standards.", icon: <ShieldCheck size={22}/> },
                   { title: "Sovereign Engineering Support", desc: "Our certified medical technicians assemble, test, and provide personal training directly at your clinical facility.", icon: <Activity size={22}/> }
                 ].map((item, i) => (
                   <div key={i} className="flex gap-6 p-6 rounded-[2rem] bg-slate-50 border border-slate-200/80 hover:bg-slate-100/50 transition-all group">
                       <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          {item.icon}
                       </div>
                       <div>
                          <h4 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h4>
                          <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                       </div>
                   </div>
                 ))}
              </div>
           </div>
           
           <div className="relative flex justify-center lg:justify-end">
              <div className="w-full max-w-md aspect-square bg-slate-50 rounded-[3rem] border border-slate-200 flex items-center justify-center relative overflow-hidden group shadow-md">
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.06),transparent)]" />
                 <Globe size={300} className="text-slate-200 absolute group-hover:scale-[1.05] group-hover:rotate-6 transition-transform duration-1000" />
                 
                 <div className="text-center relative z-10 p-10 bg-white border border-slate-200/80 rounded-[2.2rem] shadow-lg w-4/5">
                    <div className="text-6xl font-bold text-slate-900 tracking-tight mb-2">99%</div>
                    <p className="text-xs font-bold text-blue-600 mb-8 uppercase tracking-widest">Supply Chain Reliability</p>
                    <Link to="/acquisition" className="inline-flex items-center justify-center w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-blue-700 transition-all shadow-md">
                       Get a Quote <ArrowRight size={16} className="ml-2" />
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
