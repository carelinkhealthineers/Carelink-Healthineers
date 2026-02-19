
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, Globe, Zap, Mail, Phone, MapPin, 
  Linkedin, Twitter, Youtube, ArrowUpRight, 
  Activity, Award, Building2, Network, Cpu, Database
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient';

const SECTIONS = [
  {
    title: "Strategic Sectors",
    links: [
      { label: "Imaging & Radiology", path: "/portfolio?division=imaging-radiology" },
      { label: "Laboratory & Pathology", path: "/portfolio?division=laboratory-pathology" },
      { label: "Surgical & OT Hub", path: "/portfolio?division=surgical-ot" },
      { label: "Critical Care (ICU)", path: "/portfolio?division=critical-care" },
      { label: "Dialysis Systems", path: "/portfolio?division=dialysis" },
      { label: "Dental Care Matrix", path: "/portfolio?division=dental" },
      { label: "CSSD Sterilization", path: "/portfolio?division=sterilization" },
      { label: "Patient Monitoring", path: "/portfolio?division=monitoring" }
    ]
  },
  {
    title: "Neural Ecosystem",
    links: [
      { label: "The Neural Network", path: "/alliances" },
      { label: "Acquisition Protocol", path: "/acquisition" },
      { label: "Intelligence v2.5", path: "/intelligence" },
      { label: "Digital Interface", path: "/interface" },
      { label: "Foundation Registry", path: "/foundation" },
      { label: "Nexus Command Center", path: "/command-nexus" }
    ]
  },
  {
    title: "Technical Support",
    links: [
      { label: "Compliance Archive", path: "/foundation" },
      { label: "System Telemetry", path: "/intelligence" },
      { label: "Procurement Roadmap", path: "/acquisition" },
      { label: "Support Terminal", path: "/acquisition" },
      { label: "Field Engineering", path: "/alliances" },
      { label: "Clinical Careers", path: "/" }
    ]
  }
];

export const Footer: React.FC = () => {
  const [contactInfo, setContactInfo] = useState({
    address: 'Technical District 01, Innovation Drive, DXB',
    phone: '+971 4 000 0000',
    email: 'nexus@carelink.global'
  });

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const { data } = await supabase.from('settings').select('key, value').filter('category', 'eq', 'footer');
        if (data) {
          const info = { ...contactInfo };
          data.forEach(item => {
            if (item.key === 'footer_address') info.address = item.value;
            if (item.key === 'footer_phone') info.phone = item.value;
            if (item.key === 'footer_email') info.email = item.value;
          });
          setContactInfo(info);
        }
      } catch (err) {
        console.error('Footer Registry Sync Failed:', err);
      }
    };
    fetchContact();
  }, []);

  return (
    <footer className="relative bg-[#020408] text-white pt-40 pb-16 border-t border-white/5 overflow-hidden">
      {/* Decorative Neural Elements */}
      <div className="absolute inset-0 neural-grid opacity-10 pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[radial-gradient(circle_at_50%_100%,rgba(59,130,246,0.1),transparent_70%)] pointer-events-none" />
      
      {/* HUD Scanner Laser Line */}
      <motion.div 
        animate={{ top: ['-10%', '110%'] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent z-10 pointer-events-none"
      />

      <div className="max-w-[1600px] mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 mb-32">
          
          {/* Brand Hub */}
          <div className="lg:col-span-4">
            <Link to="/" className="flex items-center gap-4 mb-10 group">
              <div className="relative">
                <img 
                  src="https://i.imgur.com/y0UvXGu.png" 
                  alt="Carelink Logo" 
                  className="w-16 h-16 object-contain logo-glow group-hover:scale-110 transition-all duration-500"
                />
                <div className="absolute -inset-1 bg-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
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
                <a key={i} href="#" className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all hover:scale-110 group">
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
                      <span className="w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-blue-500 group-hover:shadow-[0_0_8px_rgba(59,130,246,0.8)] transition-all" />
                      {link.label}
                      <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 text-blue-500" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Logistics Command (Dynamic) */}
          <div className="lg:col-span-2">
            <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-10">Global Command</h4>
            <div className="space-y-8">
              <div className="flex gap-4 group cursor-default">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <MapPin size={18} />
                </div>
                <span className="text-sm font-bold text-gray-400 leading-relaxed group-hover:text-white transition-colors">
                  {contactInfo.address}
                </span>
              </div>
              <div className="flex gap-4 group cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <Phone size={18} />
                </div>
                <span className="text-sm font-bold text-gray-400 group-hover:text-white transition-colors">
                  {contactInfo.phone}
                </span>
              </div>
              <div className="flex gap-4 group cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <Mail size={18} />
                </div>
                <span className="text-sm font-bold text-gray-400 group-hover:text-white transition-colors truncate">
                  {contactInfo.email}
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
