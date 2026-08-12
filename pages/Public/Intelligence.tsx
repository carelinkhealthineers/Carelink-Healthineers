
import React from 'react';
import { motion } from 'framer-motion';
import { 
  BrainCircuit, Database, LineChart, ShieldAlert, 
  Cpu, BarChart3, Fingerprint, Activity, 
  Zap, Globe, ArrowRight, Layers, FileSearch,
  CheckCircle2, Server
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '../../components/SEO';

const INTELLIGENCE_FEATURES = [
  {
    title: "Certified Diagnostics",
    desc: "AI-augmented image analysis and pathology pattern recognition for sub-millimeter precision.",
    icon: <BrainCircuit size={24} />,
    color: "text-blue-500",
    bg: "bg-blue-500/10"
  },
  {
    title: "Equipment Analytics",
    desc: "Real-time utilization metrics and predictive maintenance protocols to guarantee operational uptime.",
    icon: <Cpu size={24} />,
    color: "text-indigo-500",
    bg: "bg-indigo-500/10"
  },
  {
    title: "Medical System Sync",
    desc: "Seamless HL7/FHIR data synchronization across disparate medical hardware and EMR systems.",
    icon: <Layers size={24} />,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10"
  },
  {
    title: "Compliance & Security",
    desc: "End-to-end encrypted medical data pipelines meeting HIPAA, GDPR, and global medical standards.",
    icon: <ShieldAlert size={24} />,
    color: "text-rose-500",
    bg: "bg-rose-500/10"
  }
];

export const Intelligence: React.FC = () => {
  return (
    <div className="bg-white text-slate-800 pt-20 overflow-hidden min-h-screen">
      <SEO 
        title="Medical Intelligence" 
        description="Carelink Intelligence: Convergence of medical data, AI diagnostics, and high-performance healthcare analytics." 
      />

      {/* Hero Section */}
      <section className="relative py-40 flex items-center">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.06)_0%,transparent_50%)]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-bold uppercase tracking-widest mb-8">
              <Zap size={12} className="animate-pulse" /> Intelligent Medical Systems
            </div>
            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-normal leading-[1] tracking-tight mb-8 text-slate-900 font-serif-classical">
              Medical <br />
              <span className="italic text-blue-600 font-serif-classical">Intelligence</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed mb-12 font-sans">
              Powering modern healthcare infrastructure with certified predictive diagnostics, equipment efficiency analytics, and secure data sync protocols.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <Link to="/acquisition" className="px-10 py-5 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 transition-all shadow-md flex items-center gap-3">
                Request Consultation <ArrowRight size={20} />
              </Link>
              <button className="px-10 py-5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 font-black hover:bg-slate-100 transition-all">
                Request Data Audit
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Core Intelligence Matrix */}
      <section className="py-40 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {INTELLIGENCE_FEATURES.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-8 bg-slate-50 border border-slate-200/60 rounded-[2.5rem] hover:bg-slate-100/40 transition-all hover:border-blue-500/20 shadow-sm"
              >
                <div className={`w-14 h-14 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-black mb-4 group-hover:text-blue-600 text-slate-900 transition-colors">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm font-medium">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Real-time Visualization Mockup */}
      <section className="py-40 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row gap-20 items-center">
           <div className="flex-1">
              <h2 className="text-5xl font-black mb-8 leading-tight text-slate-900">Diagnostic <br /> <span className="text-blue-600">Visualization.</span></h2>
              <div className="space-y-6">
                 {[
                   { title: "Automated Triage", icon: <Activity size={18} /> },
                   { title: "Anomaly Detection", icon: <FileSearch size={18} /> },
                   { title: "Predictive Health Modeling", icon: <BarChart3 size={18} /> }
                 ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200/80 bg-white group hover:border-blue-500/50 hover:shadow-sm transition-all cursor-default">
                       <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                         {item.icon}
                       </div>
                       <span className="font-bold text-slate-700 group-hover:text-slate-900 transition-colors">{item.title}</span>
                    </div>
                 ))}
              </div>
           </div>
           
           <div className="flex-1 w-full lg:w-auto">
              <div className="relative p-8 rounded-[3rem] bg-slate-950 border border-slate-900 shadow-2xl overflow-hidden group">
                 <div className="absolute inset-0 bg-blue-500/5 blur-[80px]" />
                 
                 {/* Mock UI Terminal */}
                 <div className="relative z-10 space-y-6">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                       <div className="flex gap-2">
                          <div className="w-3 h-3 rounded-full bg-rose-500/50" />
                          <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                          <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                       </div>
                       <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">System Status: Active</span>
                    </div>

                    <div className="space-y-4">
                       <div className="h-4 bg-white/10 rounded-full w-3/4 animate-pulse" />
                       <div className="h-4 bg-white/10 rounded-full w-1/2 animate-pulse delay-75" />
                       <div className="grid grid-cols-2 gap-4 pt-4">
                          <div className="h-32 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex flex-col items-center justify-center">
                             <Fingerprint size={32} className="text-blue-400 mb-2" />
                             <span className="text-[10px] font-black text-blue-400">VERIFYING</span>
                          </div>
                          <div className="h-32 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col items-center justify-center">
                             <Database size={32} className="text-indigo-400 mb-2" />
                             <span className="text-[10px] font-black text-indigo-400">SYNCING</span>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Global Data Nodes */}
      <section className="py-40">
        <div className="max-w-5xl mx-auto px-4 text-center">
           <Globe size={120} className="mx-auto text-blue-600 mb-12 animate-pulse" />
           <h2 className="text-5xl font-black mb-8 text-slate-900">Decentralized Intelligence Network</h2>
           <p className="text-slate-500 text-lg mb-16 max-w-2xl mx-auto">
             Carelink's intelligence framework operates across 40+ global data nodes, ensuring low-latency medical insights regardless of geographic site placement.
           </p>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 text-center shadow-sm">
                 <div className="text-4xl font-black text-slate-900 mb-2">99.99%</div>
                 <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Network Integrity</div>
              </div>
              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 text-center shadow-sm">
                 <div className="text-4xl font-black text-slate-900 mb-2">&lt; 10ms</div>
                 <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Signal Latency</div>
              </div>
              <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 text-center shadow-sm">
                 <div className="text-4xl font-black text-slate-900 mb-2">Petabytes</div>
                 <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Medical Assets</div>
              </div>
           </div>
        </div>
      </section>

      {/* Intelligence CTA */}
      <section className="py-40 relative">
        <div className="max-w-7xl mx-auto px-4">
           <div className="p-20 rounded-[4rem] bg-gradient-to-br from-blue-600 to-blue-800 text-center relative overflow-hidden group shadow-xl">
              <div className="absolute top-0 right-0 p-20 opacity-10 group-hover:scale-125 transition-transform duration-1000">
                 <BrainCircuit size={400} />
              </div>
              <div className="relative z-10">
                 <h2 className="text-5xl md:text-7xl font-black mb-8 leading-tight">Architect Your <br /> Intelligence Strategy.</h2>
                 <p className="text-blue-50 text-xl mb-12 max-w-xl mx-auto font-medium">
                    Consult with our medical data scientists to implement high-performance diagnostics in your facility.
                 </p>
                 <div className="flex flex-wrap justify-center gap-6">
                    <button className="px-12 py-6 rounded-full bg-white text-blue-600 font-black text-lg shadow-md hover:scale-105 transition-all">
                       Consult a Data Scientist
                    </button>
                    <Link to="/portfolio" className="px-12 py-6 rounded-full bg-black/20 border border-white/20 text-white font-black text-lg backdrop-blur-md hover:bg-black/40 transition-all">
                       View Smart Hardware
                    </Link>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Tech Footer Bar */}
      <section className="py-12 border-t border-slate-100">
         <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-12 text-slate-500 font-mono text-[10px] tracking-widest uppercase">
            <div className="flex items-center gap-2"><CheckCircle2 size={12} className="text-blue-600" /> Neural Pipeline: Active</div>
            <div className="flex items-center gap-2"><CheckCircle2 size={12} className="text-blue-600" /> Data Sovereignty: Locked</div>
            <div className="flex items-center gap-2"><CheckCircle2 size={12} className="text-blue-600" /> IoT Pulse: Nominal</div>
            <div className="flex items-center gap-2"><CheckCircle2 size={12} className="text-blue-600" /> Sourcing Matrix: Online</div>
         </div>
      </section>
    </div>
  );
};
