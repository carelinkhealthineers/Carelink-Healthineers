
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Monitor, 
  Smartphone, 
  Layout, 
  Share2, 
  ShieldCheck, 
  Zap, 
  Cpu, 
  Activity, 
  MousePointer2,
  RefreshCcw,
  Layers,
  Search,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '../../components/SEO';

const INTERFACE_LAYERS = [
  {
    title: "Sovereign Dashboard",
    desc: "A centralized command center for hospital administrators to monitor equipment health and utilization in real-time.",
    icon: <Layout size={24} />,
    color: "blue"
  },
  {
    title: "Clinical Mobile Link",
    desc: "Direct access for clinicians to diagnostic results and equipment telemetry from any mobile terminal.",
    icon: <Smartphone size={24} />,
    color: "indigo"
  },
  {
    title: "Interoperability Bridge",
    desc: "Standardized HL7/FHIR connectors to synchronize data across existing EMR and HIS platforms.",
    icon: <Share2 size={24} />,
    color: "emerald"
  }
];

export const Interface: React.FC = () => {
  return (
    <div className="bg-[#05070a] text-white pt-20 overflow-hidden min-h-screen">
      <SEO 
        title="Digital Interface" 
        description="Explore the Carelink Interface: The digital software layer bridging high-performance medical hardware and clinical decision-making." 
      />

      {/* Hero Section */}
      <section className="relative py-40">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,rgba(59,130,246,0.1)_0%,transparent_50%)]" />
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_70%,rgba(99,102,241,0.1)_0%,transparent_50%)]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8">
                <Monitor size={14} /> UI/UX Ecosystem v4.0
              </div>
              <h1 className="text-6xl md:text-9xl font-black leading-[0.9] tracking-tighter mb-8">
                The Human <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Interface.</span>
              </h1>
              <p className="text-xl text-gray-400 font-medium leading-relaxed mb-12">
                Carelink's Interface layer transforms complex clinical data into intuitive visual narratives, empowering medical professionals with absolute clarity.
              </p>
              <div className="flex flex-wrap gap-6">
                <Link to="/acquisition" className="px-10 py-5 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/20 flex items-center gap-3 group">
                  Request Demo <MousePointer2 size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Link>
                <Link to="/intelligence" className="px-10 py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-black hover:bg-white/10 transition-all">
                  Neural Framework
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Interface Pillars */}
      <section className="py-40 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {INTERFACE_LAYERS.map((layer, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-10 rounded-[3rem] bg-black border border-white/5 hover:border-blue-500/30 transition-all"
              >
                <div className={`w-16 h-16 rounded-2xl bg-${layer.color}-500/10 text-${layer.color}-400 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                  {layer.icon}
                </div>
                <h3 className="text-2xl font-black mb-4">{layer.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm font-medium">{layer.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Visualization */}
      <section className="py-40 relative">
        <div className="max-w-7xl mx-auto px-4">
           <div className="flex flex-col lg:flex-row items-center gap-20">
              <div className="flex-1">
                 <h2 className="text-5xl font-black mb-8 leading-tight">Zero-Latency <br /><span className="text-blue-500">Visualization.</span></h2>
                 <p className="text-gray-400 text-lg leading-relaxed mb-10">
                   Our interface isn't just a layer—it's an extension of the clinician. Designed with "Eye-Sync" technology, it prioritizes critical vitals and diagnostic alerts to reduce cognitive load.
                 </p>
                 <div className="space-y-4">
                    {[
                      { title: "Universal Dark Mode Architecture", icon: <Layers size={18} /> },
                      { title: "Real-time Telemetry Syncing", icon: <RefreshCcw size={18} /> },
                      { title: "AI-Augmented Alert Triaging", icon: <Activity size={18} /> }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/5 group hover:border-blue-500/50 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                          {item.icon}
                        </div>
                        <span className="font-bold text-gray-300 group-hover:text-white transition-colors">{item.title}</span>
                      </div>
                    ))}
                 </div>
              </div>
              <div className="flex-1 w-full lg:w-auto">
                 <div className="relative p-4 rounded-[4rem] bg-gradient-to-br from-blue-600 to-indigo-900 shadow-3xl shadow-blue-500/20">
                    <div className="bg-black rounded-[3.5rem] overflow-hidden border border-white/10 aspect-video relative group">
                       <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent)]" />
                       
                       {/* Mock Dashboard UI */}
                       <div className="absolute inset-0 p-8 flex flex-col">
                          <div className="flex items-center justify-between mb-8">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black">C</div>
                                <div className="h-4 w-32 bg-white/10 rounded-full" />
                             </div>
                             <div className="flex gap-2">
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-emerald-400"><ShieldCheck size={16} /></div>
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-blue-400"><Zap size={16} /></div>
                             </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4 mb-8">
                             {[1,2,3].map(i => (
                               <div key={i} className="h-24 rounded-2xl bg-white/5 border border-white/10 p-4">
                                  <div className="h-2 w-1/2 bg-white/10 rounded-full mb-4" />
                                  <div className="h-6 w-3/4 bg-blue-500/20 rounded-lg animate-pulse" />
                               </div>
                             ))}
                          </div>

                          <div className="flex-1 bg-white/5 rounded-3xl border border-white/10 p-6 flex items-center justify-center">
                             <div className="text-center">
                                <Activity size={48} className="text-blue-500 mx-auto mb-4 animate-pulse" />
                                <div className="text-xs font-black text-gray-500 uppercase tracking-widest">Global Telemetry Stream</div>
                             </div>
                          </div>
                       </div>

                       {/* Hover Overlay */}
                       <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px] flex items-center justify-center">
                          <div className="px-6 py-3 bg-white text-blue-600 rounded-xl font-black text-sm shadow-2xl">
                             LIVE INTERFACE PREVIEW
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Integration Ecosystem */}
      <section className="py-40 bg-[#080a0f]">
        <div className="max-w-7xl mx-auto px-4 text-center">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-8 border border-indigo-500/20">
              <Cpu size={14} /> Full Stack Interoperability
           </div>
           <h2 className="text-5xl font-black mb-8">Connect Your <span className="text-indigo-400">Entire Matrix.</span></h2>
           <p className="text-gray-500 text-xl mb-20 max-w-2xl mx-auto">
             Carelink Interface bridges the gap between hardware sovereigns and clinical records, creating a unified flow of medical intelligence.
           </p>

           <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { label: "HL7/FHIR", desc: "Data Standards" },
                { label: "REST API", desc: "Custom Access" },
                { label: "DICOM", desc: "Imaging Engine" },
                { label: "MQTT", desc: "IoT Protocol" }
              ].map((node, i) => (
                <div key={i} className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 group hover:bg-white/[0.08] transition-all">
                   <div className="text-3xl font-black text-white mb-2">{node.label}</div>
                   <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{node.desc}</div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-40">
        <div className="max-w-4xl mx-auto px-4 text-center">
           <h2 className="text-6xl font-black mb-10 tracking-tighter">Ready to Upgrade Your <br /> <span className="text-blue-500 text-gradient-primary">Clinical Workflow?</span></h2>
           <div className="flex flex-wrap justify-center gap-6">
              <button className="px-12 py-6 rounded-full bg-blue-600 text-white font-black text-lg shadow-2xl shadow-blue-500/30 hover:scale-105 transition-all flex items-center gap-3">
                 Schedule Consultation <ArrowRight size={20} />
              </button>
              <Link to="/portfolio" className="px-12 py-6 rounded-full bg-white/5 border border-white/10 text-white font-black text-lg hover:bg-white/10 transition-all">
                 Browse Smart Hardware
              </Link>
           </div>
        </div>
      </section>

      {/* Tech Footer Bar */}
      <section className="py-12 border-t border-white/10 bg-black">
         <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-12 text-gray-600 font-mono text-[10px] tracking-widest uppercase">
            <div className="flex items-center gap-2"><ShieldCheck size={12} className="text-blue-500" /> UI Certified</div>
            <div className="flex items-center gap-2"><ShieldCheck size={12} className="text-blue-500" /> FHIR Compliant</div>
            <div className="flex items-center gap-2"><ShieldCheck size={12} className="text-blue-500" /> HIPAA Secure</div>
            <div className="flex items-center gap-2"><ShieldCheck size={12} className="text-blue-500" /> Cloud Sync: Active</div>
         </div>
      </section>
    </div>
  );
};
