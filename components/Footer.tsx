
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, Globe, Zap, Mail, Phone, MapPin, 
  Linkedin, Twitter, Youtube, ArrowUpRight, 
  Activity, Award, Building2, Network, Cpu, Database
} from 'lucide-react';
import { motion } from 'framer-motion';

const SECTIONS = [
  {
    title: "Strategic Sectors",
    links: [
      { label: "Radiology & Imaging", path: "/portfolio?division=imaging-radiology" },
      { label: "Pathology Systems", path: "/portfolio?division=laboratory-pathology" },
      { label: "Surgical Infrastructure", path: "/portfolio?division=surgical-ot" },
      { label: "Critical Care (ICU)", path: "/portfolio?division=critical-care" },
      { label: "Dialysis Matrix", path: "/portfolio?division=dialysis" },
      { label: "Sterilization (CSSD)", path: "/portfolio?division=sterilization" }
    ]
  },
  {
    title: "Neural Ecosystem",
    links: [
      { label: "Alliance Matrix", path: "/alliances" },
      { label: "Strategic Acquisition", path: "/acquisition" },
      { label: "Intelligence v2.5", path: "/intelligence" },
      { label: "Digital Interface", path: "/interface" },
      { label: "Foundation Registry", path: "/foundation" },
      { label: "Command Nexus", path: "/command-nexus" }
    ]
  },
  {
    title: "Technical Resources",
    links: [
      { label: "Compliance Dossier", path: "/foundation" },
      { label: "System Status", path: "/intelligence" },
      { label: "Procurement Guide", path: "/acquisition" },
      { label: "Support Terminal", path: "/acquisition" },
      { label: "Global Network", path: "/alliances" },
      { label: "Careers", path: "/" }
    ]
  }
];

export const Footer: React.FC = () => {
  return (
    <footer className="relative bg-[#020408] text-white pt-40 pb-16 border-t border-white/5 overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 neural-grid opacity-10 pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[radial-gradient(circle_at_50%_100%,rgba(59,130,246,0.1),transparent_70%)] pointer-events-none" />

      <div className="max-w-[1600px] mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 mb-32">
          
          {/* Brand Hub */}
          <div className="lg:col-span-4">
            <Link to="/" className="flex items-center gap-4 mb-10 group">
              <img 
                src="https://i.imgur.com/y0UvXGu.png" 
                alt="Carelink Logo" 
                className="w-16 h-16 object-contain logo-glow group-hover:scale-110 transition-all duration-500 flicker"
              />
              <div>
                <span className="text-3xl font-black tracking-tighter text-white block leading-none">Carelink</span>
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">Healthineers</span>
              </div>
            </Link>
            <p className="text-gray-400 font-medium leading-relaxed mb-12 max-w-sm text-lg">
              Architecting the absolute frontier of global healthcare infrastructure. Sourcing precision, delivering clinical sovereignty.
            </p>
            <div className="flex gap-4">
              {[
                { icon: <Linkedin size={20} />, label: "LinkedIn" },
                { icon: <Twitter size={20} />, label: "Twitter" },
                { icon: <Youtube size={20} />, label: "YouTube" },
              ].map((social, i) => (
                <a key={i} href="#" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all hover:scale-110">
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Matrix */}
          {SECTIONS.map((section, i) => (
            <div key={i} className="lg:col-span-2">
              <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-10">{section.title}</h4>
              <ul className="space-y-5">
                {section.links.map((link, idx) => (
                  <li key={idx}>
                    <Link to={link.path} className="text-sm font-bold text-gray-400 hover:text-white flex items-center gap-3 group transition-all">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-blue-500 transition-colors" />
                      {link.label}
                      <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Logistics Command */}
          <div className="lg:col-span-2">
            <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-10">Global Command</h4>
            <div className="space-y-8">
              <div className="flex gap-4 group">
                <MapPin size={20} className="text-blue-600 shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-bold text-gray-400 leading-relaxed group-hover:text-white transition-colors">
                  Technical District 01, <br /> Innovation Drive, DXB
                </span>
              </div>
              <div className="flex gap-4 group">
                <Phone size={20} className="text-blue-600 shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-bold text-gray-400 group-hover:text-white transition-colors">
                  +971 4 000 0000
                </span>
              </div>
              <div className="flex gap-4 group">
                <Mail size={20} className="text-blue-600 shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-bold text-gray-400 group-hover:text-white transition-colors">
                  nexus@carelink.global
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Telemetry Bar */}
        <div className="py-12 border-y border-white/5 flex flex-wrap items-center justify-between gap-12 mb-16 font-mono">
           <div className="flex items-center gap-12 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-3 text-[10px] font-bold text-emerald-500 uppercase tracking-widest whitespace-nowrap">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" /> 
                System: Nominal
              </div>
              <div className="flex items-center gap-3 text-[10px] font-bold text-blue-400 uppercase tracking-widest whitespace-nowrap">
                <Network size={16} /> Nodes: 48 Active
              </div>
              <div className="flex items-center gap-3 text-[10px] font-bold text-indigo-400 uppercase tracking-widest whitespace-nowrap">
                <Database size={16} /> Registry: Synced
              </div>
              <div className="flex items-center gap-3 text-[10px] font-bold text-purple-400 uppercase tracking-widest whitespace-nowrap">
                <Cpu size={16} /> AI: Deploying v2.5
              </div>
           </div>
           <div className="flex items-center gap-8 grayscale opacity-20 hover:opacity-100 transition-all cursor-default">
              <ShieldCheck size={28} />
              <Globe size={28} />
              <Zap size={28} />
              <Award size={28} />
              <Building2 size={28} />
           </div>
        </div>

        {/* Global Footer Subline */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 text-[10px] font-black text-gray-600 uppercase tracking-[0.4em]">
          <div className="flex flex-wrap justify-center gap-10">
            <a href="#" className="hover:text-white transition-colors">SLA.Protocol</a>
            <a href="#" className="hover:text-white transition-colors">Data.Sovereignty</a>
            <a href="#" className="hover:text-white transition-colors">Ethical.Registry</a>
            <a href="#" className="hover:text-white transition-colors">Network.Terms</a>
          </div>
          <div className="text-gray-500">
            &copy; {new Date().getFullYear()} Carelink Healthineers Group // Master_Nexus_Stable
          </div>
        </div>
      </div>
    </footer>
  );
};
