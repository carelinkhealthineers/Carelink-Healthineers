
import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Target, 
  Users, 
  History, 
  Compass, 
  Award, 
  CheckCircle2, 
  ArrowRight,
  Landmark,
  Scale,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '../../components/SEO';

const PILLARS = [
  {
    title: "Clinical Integrity",
    desc: "Every component we source is validated against the most stringent global clinical standards (CE, ISO 13485).",
    icon: <ShieldCheck size={28} />,
    color: "blue"
  },
  {
    title: "Global Synergy",
    desc: "Bridging the gap between world-class manufacturers and local healthcare providers through strategic alliances.",
    icon: <Compass size={28} />,
    color: "indigo"
  },
  {
    title: "Sustainable Innovation",
    desc: "Focusing on hardware that isn't just advanced today, but upgradable for the clinical needs of tomorrow.",
    icon: <Zap size={28} />,
    color: "emerald"
  }
];

const TIMELINE = [
  { year: "1998", event: "Foundation of Carelink Infrastructure in a localized distribution hub." },
  { year: "2005", event: "Expansion into Radiological Imaging and specialized pathology logistics." },
  { year: "2012", event: "Inauguration of the Global Strategic Alliance network with Tier 1 manufacturers." },
  { year: "2018", event: "Launch of the Intelligence Layer for AI-driven diagnostic telemetry." },
  { year: "2024", event: "Deployment of Command Nexus: The world's most transparent B2B medical sourcing matrix." }
];

export const Foundation: React.FC = () => {
  return (
    <div className="bg-white pt-20 overflow-hidden">
      <SEO 
        title="Our Foundation" 
        description="Discover the core values, mission, and history of Carelink Healthineers — architecting healthcare excellence since 1998." 
      />

      {/* Hero Section */}
      <section className="relative py-40 border-b bg-gradient-to-b from-gray-50/50 to-white">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.1)_0%,transparent_50%)]" />
           <Landmark size={600} className="absolute -bottom-20 -left-20 text-gray-100 opacity-20 rotate-12" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
              <History size={14} /> Established 1998
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-gray-900 leading-[0.95] mb-8 tracking-tighter">
              The Architecture of <br />
              <span className="text-gradient-primary">Trust.</span>
            </h1>
            <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed">
              At Carelink Healthineers, our foundation is built upon the unwavering belief that high-performance medical infrastructure should be accessible, transparent, and built to last.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-40">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
           <motion.div
             initial={{ opacity: 0, x: -30 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
           >
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-8 leading-tight">
                Our Mission is to <span className="text-blue-600">Sovereignize</span> Local Clinical Capabilities.
              </h2>
              <p className="text-lg text-gray-500 leading-relaxed font-medium mb-10">
                We don't just sell equipment; we architect the backbone of hospitals. By integrating global sourcing intelligence with local logistical mastery, we empower healthcare providers to focus on what matters most: patient recovery.
              </p>
              <div className="grid grid-cols-2 gap-8">
                 <div className="space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                       <Target size={24} />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900">Precision Focus</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">Dedicated units for every clinical department from Radiology to CSSD.</p>
                 </div>
                 <div className="space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                       <Scale size={24} />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900">Ethical Sourcing</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">Strict adherence to transparency and fair clinical infrastructure distribution.</p>
                 </div>
              </div>
           </motion.div>
           
           <div className="relative">
              <div className="aspect-[4/5] rounded-[4rem] overflow-hidden shadow-2xl">
                 <img 
                   src="https://picsum.photos/seed/carelink-foundation/800/1000" 
                   alt="Carelink Leadership" 
                   className="w-full h-full object-cover grayscale" 
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent" />
              </div>
              <div className="absolute -bottom-10 -right-10 p-12 bg-white rounded-[3rem] shadow-2xl border border-gray-100 max-w-xs">
                 <Award className="text-blue-600 mb-4" size={40} />
                 <p className="text-sm font-bold text-gray-900 italic">"Excellence is not an act, but a habit of clinical precision."</p>
                 <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="font-black text-xs text-gray-400 uppercase tracking-widest">Leadership Vision</div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Three Pillars */}
      <section className="py-40 bg-gray-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
           <header className="text-center mb-24">
              <h2 className="text-4xl md:text-5xl font-black mb-6">Core Clinical Pillars</h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">The fundamental principles that govern every acquisition, alliance, and deployment.</p>
           </header>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {PILLARS.map((pillar, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-12 rounded-[3.5rem] bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
                >
                  <div className={`w-16 h-16 rounded-2xl bg-${pillar.color}-500/20 text-${pillar.color}-400 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                    {pillar.icon}
                  </div>
                  <h3 className="text-2xl font-black mb-4">{pillar.title}</h3>
                  <p className="text-gray-400 leading-relaxed font-medium">
                    {pillar.desc}
                  </p>
                </motion.div>
              ))}
           </div>
        </div>
      </section>

      {/* History Timeline */}
      <section className="py-40">
        <div className="max-w-7xl mx-auto px-4">
           <div className="max-w-3xl mx-auto">
              <header className="mb-20">
                <h2 className="text-4xl font-black text-gray-900 mb-6 text-center">Innovation Timeline</h2>
                <p className="text-gray-500 text-center font-medium">A quarter-century of pioneering the medical supply chain.</p>
              </header>
              
              <div className="space-y-12">
                 {TIMELINE.map((item, i) => (
                   <motion.div 
                     key={i} 
                     initial={{ opacity: 0, x: -20 }}
                     whileInView={{ opacity: 1, x: 0 }}
                     viewport={{ once: true }}
                     className="flex gap-8 group"
                   >
                      <div className="flex flex-col items-center">
                         <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-lg border-2 border-transparent group-hover:border-blue-600 transition-all shrink-0">
                           {item.year}
                         </div>
                         {i !== TIMELINE.length - 1 && <div className="w-0.5 h-full bg-gray-100 my-4" />}
                      </div>
                      <div className="pt-4">
                         <p className="text-lg text-gray-600 font-medium leading-relaxed group-hover:text-gray-900 transition-colors">
                           {item.event}
                         </p>
                      </div>
                   </motion.div>
                 ))}
              </div>
           </div>
        </div>
      </section>

      {/* Certifications & Trust */}
      <section className="py-40 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
           <div className="flex flex-col lg:flex-row items-center justify-between gap-20">
              <div className="max-w-xl">
                 <h2 className="text-4xl font-black text-gray-900 mb-8">Uncompromising <br /><span className="text-blue-600">Compliance Matrix.</span></h2>
                 <p className="text-gray-500 leading-relaxed mb-10 font-medium">
                   Foundation of our trust is built on rigorous certification cycles. Every alliance partner and hardware unit in our matrix is audited for absolute clinical safety.
                 </p>
                 <div className="space-y-4">
                    {[
                      "ISO 13485:2016 Certified Quality Systems",
                      "CE Medical Device Directive (MDD) Compliance",
                      "FDA Cleared Technology Pathways",
                      "Global Traceability & Ethical Sourcing Protocols"
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm font-bold text-gray-700">
                        <CheckCircle2 size={18} className="text-emerald-500" />
                        {item}
                      </div>
                    ))}
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
                 <div className="p-10 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                    <Award size={40} className="text-blue-600 mb-4" />
                    <div className="text-2xl font-black">25+</div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Industry Awards</div>
                 </div>
                 <div className="p-10 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                    <Users size={40} className="text-indigo-600 mb-4" />
                    <div className="text-2xl font-black">1.2k+</div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Clinical Users</div>
                 </div>
                 <div className="col-span-2 p-10 bg-gray-900 text-white rounded-3xl shadow-xl flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-black">Global Readiness</div>
                      <div className="text-xs text-gray-400 font-bold">Deploying infrastructure across 18 nations.</div>
                    </div>
                    <ArrowRight size={24} className="text-blue-500" />
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-40">
        <div className="max-w-4xl mx-auto px-4 text-center">
           <h2 className="text-5xl font-black text-gray-900 mb-8">Architect Your Future With Us.</h2>
           <p className="text-xl text-gray-500 mb-12 leading-relaxed">
             Join the thousands of healthcare professionals who rely on Carelink for mission-critical infrastructure.
           </p>
           <div className="flex flex-wrap justify-center gap-6">
              <Link to="/portfolio" className="px-12 py-6 rounded-full bg-blue-600 text-white font-black text-lg shadow-2xl shadow-blue-500/30 hover:scale-105 transition-all">
                 Explore Portfolio
              </Link>
              <Link to="/acquisition" className="px-12 py-6 rounded-full bg-white text-gray-900 border border-gray-200 font-black text-lg hover:bg-gray-50 transition-all">
                 Initiate RFQ
              </Link>
           </div>
        </div>
      </section>
    </div>
  );
};
