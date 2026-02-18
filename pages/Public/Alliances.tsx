
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Globe, ShieldCheck, Zap, Handshake, Network, 
  ArrowRight, Award, Box, Microscope, Activity 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '../../components/SEO';

const PARTNERSHIP_TIERS = [
  {
    title: "Manufacturing Sovereigns",
    description: "Direct alliances with the world's most innovative medical hardware engineers.",
    icon: <Box size={24} />,
    color: "from-blue-600 to-indigo-600",
    features: ["Priority Allocation", "R&D Co-Development", "Direct Technical Support"]
  },
  {
    title: "Logistical Arteries",
    description: "High-speed distribution networks ensuring sub-24h delivery for critical components.",
    icon: <Zap size={24} />,
    color: "from-emerald-600 to-teal-600",
    features: ["Cold-Chain Mastery", "Automated Customs Clearance", "Real-time Telemetry"]
  },
  {
    title: "Clinical Knowledge Hubs",
    description: "Specialized institutions that validate and optimize our infrastructure in the field.",
    icon: <Microscope size={24} />,
    color: "from-purple-600 to-indigo-700",
    features: ["Field Validation", "User-Experience Feedback", "Protocols Standardization"]
  }
];

const LOGO_GARDEN = [
  "Siemens Healthineers", "GE Healthcare", "Mindray", "Philips", "Medtronic", "Roche", "Stryker", "Sysmex"
];

export const Alliances: React.FC = () => {
  return (
    <div className="pt-20 bg-white overflow-hidden">
      <SEO title="Global Alliances" description="Explore the neural network of Carelink's world-class medical partnerships." />

      {/* Cinematic Hero */}
      <section className="relative min-h-[90vh] flex items-center pt-20">
        <div className="absolute inset-0 pointer-events-none">
          {/* Animated Background Pulse */}
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-blue-500/10 rounded-full blur-[120px]" 
          />
          {/* Decorative Grid */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-[0.2em] mb-8">
              <Network size={14} /> Global Synergy Matrix
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-gray-900 leading-[0.95] mb-8 tracking-tighter">
              The Neural <br />
              <span className="text-gradient-primary">Network.</span>
            </h1>
            <p className="text-xl text-gray-500 font-medium leading-relaxed mb-12 max-w-lg">
              Carelink isn't just a distributor; we are the connective tissue between global innovation and local clinical excellence.
            </p>
            <div className="flex flex-wrap gap-6">
              <Link to="/acquisition" className="px-10 py-5 rounded-2xl bg-gray-900 text-white font-black hover:bg-blue-600 transition-all shadow-2xl shadow-gray-400/20 flex items-center gap-3">
                Join the Alliance <ArrowRight size={20} />
              </Link>
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center">
                       <ShieldCheck size={16} className="text-blue-600" />
                    </div>
                  ))}
                </div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">240+ Certified Partners</span>
              </div>
            </div>
          </motion.div>

          {/* Unique Visual Element: Orbiting Nodes */}
          <div className="relative h-[500px] hidden lg:block">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border border-blue-100 rounded-full border-dashed"
            />
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              className="absolute inset-10 border border-blue-50 rounded-full border-dashed"
            />
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 shadow-2xl shadow-blue-500/40 flex items-center justify-center text-white font-black text-4xl">
                 C
               </div>
               {/* Orbits */}
               {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                 <motion.div
                   key={i}
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   transition={{ delay: i * 0.2 }}
                   style={{ 
                     transform: `rotate(${deg}deg) translateX(250px) rotate(-${deg}deg)`,
                   }}
                   className="absolute w-12 h-12 rounded-xl bg-white shadow-xl border border-gray-100 flex items-center justify-center text-blue-600"
                 >
                   <Handshake size={20} />
                 </motion.div>
               ))}
            </div>
          </div>
        </div>
      </section>

      {/* Strategic Tiers */}
      <section className="py-40 bg-gray-50 relative">
        <div className="max-w-7xl mx-auto px-4">
          <header className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">Partnership Ecosystem</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              We maintain specialized alliance tiers to ensure every stage of the medical supply chain is fortified with technical integrity.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PARTNERSHIP_TIERS.map((tier, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="group bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tier.color} text-white flex items-center justify-center mb-8 shadow-lg group-hover:rotate-12 transition-transform`}>
                  {tier.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{tier.title}</h3>
                <p className="text-gray-500 mb-8 leading-relaxed font-medium">{tier.description}</p>
                <ul className="space-y-4">
                  {tier.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-sm font-bold text-gray-400 group-hover:text-gray-900 transition-colors">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      {feat}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance Bridge */}
      <section className="py-40">
        <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center gap-20">
          <div className="flex-1">
            <div className="p-12 bg-gray-900 rounded-[4rem] text-white relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform">
                 <ShieldCheck size={200} />
               </div>
               <h3 className="text-3xl font-black mb-8 leading-tight">The Compliance Bridge.</h3>
               <p className="text-gray-400 text-lg mb-10 leading-relaxed">
                 Entering complex medical markets requires more than just capital. We provide the regulatory infrastructure—ISO, CE, and Local Ministry clearances—for every product in our network.
               </p>
               <div className="grid grid-cols-2 gap-8">
                 <div>
                   <div className="text-4xl font-black text-blue-500 mb-2">100%</div>
                   <div className="text-xs font-bold uppercase tracking-widest text-gray-500">Ministry Compliance</div>
                 </div>
                 <div>
                   <div className="text-4xl font-black text-blue-500 mb-2">Zero</div>
                   <div className="text-xs font-bold uppercase tracking-widest text-gray-500">Logistical Drift</div>
                 </div>
               </div>
            </div>
          </div>
          <div className="flex-1 space-y-10">
            <div>
              <h2 className="text-4xl font-black text-gray-900 mb-6">Why Partner With Us?</h2>
              <p className="text-gray-500 text-lg leading-relaxed mb-8">
                Carelink serves as a master integrator. Manufacturers gain instant access to a battle-tested distribution network, while clinical end-users receive equipment with guaranteed technical continuity.
              </p>
            </div>
            <div className="space-y-6">
              {[
                { label: "Sub-24h Technical Dispatch", icon: <Activity className="text-blue-600" /> },
                { label: "Regulatory Fast-Tracking", icon: <Award className="text-blue-600" /> },
                { label: "Global Procurement Transparency", icon: <Globe className="text-blue-600" /> },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors cursor-default">
                  <div className="w-10 h-10 rounded-xl bg-white border flex items-center justify-center shadow-sm">
                    {item.icon}
                  </div>
                  <span className="font-bold text-gray-900 uppercase tracking-tight">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Wall - Animated Marquee Style */}
      <section className="py-32 bg-gray-50 border-y">
        <div className="max-w-7xl mx-auto px-4 mb-16 text-center">
          <span className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Industry Sovereigns in our Network</span>
        </div>
        <div className="relative flex overflow-x-hidden">
          <div className="py-12 animate-marquee whitespace-nowrap flex items-center">
            {LOGO_GARDEN.map((logo, i) => (
              <span key={i} className="text-3xl md:text-4xl font-black text-gray-300 mx-16 hover:text-blue-600 transition-colors cursor-default">
                {logo.toUpperCase()}
              </span>
            ))}
          </div>
          <div className="absolute top-0 py-12 animate-marquee2 whitespace-nowrap flex items-center">
            {LOGO_GARDEN.map((logo, i) => (
              <span key={i} className="text-3xl md:text-4xl font-black text-gray-300 mx-16 hover:text-blue-600 transition-colors cursor-default">
                {logo.toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-40 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-8 leading-tight">Ready to fortify your clinical <span className="text-blue-600">Infrastructure?</span></h2>
          <p className="text-xl text-gray-500 mb-12 max-w-2xl mx-auto">
            Our alliance architects are ready to design a custom procurement and technical support roadmap for your organization.
          </p>
          <Link to="/acquisition" className="inline-flex items-center gap-3 px-12 py-6 rounded-[2rem] bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black text-lg shadow-2xl shadow-blue-500/40 hover:scale-105 transition-all">
            Initiate Contact <Handshake size={24} />
          </Link>
        </div>
      </section>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-100%); }
        }
        @keyframes marquee2 {
          0% { transform: translateX(100%); }
          100% { transform: translateX(0%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-marquee2 {
          animation: marquee2 30s linear infinite;
        }
      `}</style>
    </div>
  );
};
