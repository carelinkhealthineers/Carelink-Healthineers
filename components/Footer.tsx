
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
    title: "Medical Equipment",
    links: [
      { label: "Imaging & Radiology", path: "/portfolio?division=imaging-radiology" },
      { label: "Laboratory & Pathology", path: "/portfolio?division=laboratory-pathology" },
      { label: "Surgical & Operating Room", path: "/portfolio?division=surgical-ot" },
      { label: "Critical Care & ICU", path: "/portfolio?division=critical-care" },
      { label: "Renal Care Systems", path: "/portfolio?division=dialysis" },
      { label: "Dental Equipment", path: "/portfolio?division=dental" },
      { label: "Sterilization & CSSD", path: "/portfolio?division=sterilization" },
      { label: "Patient Monitoring", path: "/portfolio?division=monitoring" }
    ]
  },
  {
    title: "Resources & Services",
    links: [
      { label: "Clinical Insights & Blog", path: "/insights" },
      { label: "Our Global Alliances", path: "/alliances" },
      { label: "Request a Quote", path: "/acquisition" },
      { label: "Medical AI Solutions", path: "/intelligence" },
      { label: "Client Portal", path: "/interface" },
      { label: "Quality & Compliance", path: "/foundation" },
      { label: "Admin Dashboard", path: "/command-nexus" }
    ]
  },
  {
    title: "Company & Support",
    links: [
      { label: "Quality Standards", path: "/foundation" },
      { label: "Clinical Solutions", path: "/intelligence" },
      { label: "Procurement Process", path: "/acquisition" },
      { label: "Contact Support", path: "/acquisition" },
      { label: "Technical Assistance", path: "/alliances" },
      { label: "Careers", path: "/" }
    ]
  }
];

export const Footer: React.FC = () => {
  const [contactInfo, setContactInfo] = useState({
    address: 'Innovation District, Medical Plaza Block A, Suite 410',
    phone: '+1 (800) 555-0199',
    email: 'procurement@carelink.global'
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
    <footer className="relative bg-slate-900 text-slate-300 pt-24 pb-16 border-t border-slate-800 overflow-hidden font-sans">
      {/* Elegant Ambient Gradients */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[350px] bg-[radial-gradient(circle_at_50%_100%,rgba(37,99,235,0.05),transparent_70%)] pointer-events-none" />

      <div className="max-w-[1500px] mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-16 mb-20">
          
          {/* Brand Hub */}
          <div className="lg:col-span-4 space-y-6">
            <Link to="/" className="flex items-center gap-3.5 group">
              <img 
                src="https://i.imgur.com/y0UvXGu.png" 
                alt="Carelink Logo" 
                className="w-12 h-12 object-contain brightness-110 filter"
              />
              <div>
                <span className="text-xl font-bold tracking-tight text-white block leading-none font-serif-classical">Carelink</span>
                <span className="text-[9px] font-bold text-blue-400 uppercase tracking-[0.3em]">Healthineers</span>
              </div>
            </Link>
            <p className="text-slate-400 font-medium leading-relaxed max-w-sm text-sm">
              The premium B2B medical equipment procurement standard. We connect global hospital systems with direct factory pricing and fully certified clinical equipment.
            </p>
            <div className="flex gap-3 pt-2">
              {[
                { icon: <Linkedin size={16} />, label: "LinkedIn" },
                { icon: <Twitter size={16} />, label: "Twitter" },
                { icon: <Youtube size={16} />, label: "YouTube" },
              ].map((social, i) => (
                <a key={i} href="#" aria-label={social.label} className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-400 hover:text-white transition-all flex items-center justify-center border border-slate-700 hover:border-blue-500 shadow-sm">
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Matrix */}
          {SECTIONS.map((section, i) => (
            <div key={i} className="lg:col-span-2">
              <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-6">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link, idx) => (
                  <li key={idx}>
                    <Link to={link.path} className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-2 group transition-colors">
                      <span className="w-1 h-1 rounded-full bg-slate-700 group-hover:bg-blue-400 transition-colors" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Logistics Command */}
          <div className="lg:col-span-2 space-y-6">
            <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Office Registry</h4>
            <div className="space-y-4">
              <div className="flex gap-3 text-xs font-semibold text-slate-400 leading-relaxed">
                <MapPin size={14} className="text-slate-500 shrink-0 mt-0.5" />
                <span>{contactInfo.address}</span>
              </div>
              <div className="flex gap-3 text-xs font-semibold text-slate-400">
                <Phone size={14} className="text-slate-500 shrink-0" />
                <span>{contactInfo.phone}</span>
              </div>
              <div className="flex gap-3 text-xs font-semibold text-slate-400 truncate">
                <Mail size={14} className="text-slate-500 shrink-0" />
                <span>{contactInfo.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Verification & Trust Bar */}
        <div className="py-8 border-y border-slate-800 flex flex-wrap items-center justify-between gap-6 mb-10 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
           <div className="flex flex-wrap items-center gap-8 md:gap-12">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> 
                ISO 13485 CERTIFIED
              </div>
              <div className="flex items-center gap-2">
                <Globe size={12} className="text-blue-400" /> GLOBAL DIRECT SOURCING
              </div>
              <div className="flex items-center gap-2">
                <Zap size={12} className="text-amber-400" /> DIRECT FACTORY WARRANTY
              </div>
           </div>
           <div className="flex items-center gap-4 text-slate-600">
              <ShieldCheck size={20} />
              <Globe size={20} />
              <Zap size={20} />
              <Award size={20} />
           </div>
        </div>

        {/* Global Footer Subline */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-semibold text-slate-500">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-1">
            <a href="#" className="hover:text-slate-300 transition-colors">Service Terms</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Quality Guidelines</a>
          </div>
          <div>
            &copy; {new Date().getFullYear()} Carelink Healthineers. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};
