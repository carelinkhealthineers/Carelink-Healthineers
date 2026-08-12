import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, Globe, Zap, Mail, Phone, MapPin, 
  Linkedin, Twitter, Youtube, Facebook, Instagram, ArrowUpRight, 
  Activity, Award, Building2, Network, Cpu, Database
} from 'lucide-react';
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
    ]
  },
  {
    title: "Quick Navigation",
    links: [
      { label: "Product Portfolio", path: "/portfolio" },
      { label: "Medical Divisions", path: "/divisions" },
      { label: "Medical Insights & Blog", path: "/insights" },
      { label: "Global Alliances", path: "/alliances" },
      { label: "Request a Quote", path: "/acquisition" },
      { label: "Medical AI Solutions", path: "/intelligence" },
    ]
  },
  {
    title: "Quality & Corporate",
    links: [
      { label: "Certified Standards", path: "/foundation" },
      { label: "Procurement Workflow", path: "/acquisition" },
      { label: "Technical Assistance", path: "/alliances" },
    ]
  }
];

const SOCIAL_LINKS = [
  { icon: <Facebook size={16} />, label: "Facebook", href: "https://www.facebook.com/carelinkhealthineers/" },
  { icon: <Instagram size={16} />, label: "Instagram", href: "https://www.instagram.com/carelinkhealthineers/" },
  { icon: <Twitter size={16} />, label: "Twitter", href: "https://www.twitter.com/carelinkhealthineers/" },
  { icon: <Youtube size={16} />, label: "YouTube", href: "https://www.youtube.com/@carelinkhealthineers" },
];

export const Footer: React.FC = () => {
  const [contactInfo, setContactInfo] = useState({
    address: 'Shyamoli, Adabor, Dhaka 1207',
    phone: '01339-482917',
    email: 'carelinkhealthineers@gmail.com'
  });

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const { data } = await supabase.from('settings').select('key, value').filter('category', 'eq', 'footer');
        if (data && data.length > 0) {
          const info = { ...contactInfo };
          data.forEach(item => {
            if (item.key === 'footer_address' && item.value) info.address = item.value;
            if (item.key === 'footer_phone' && item.value) info.phone = item.value;
            if (item.key === 'footer_email' && item.value) info.email = item.value;
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
    <footer className="relative bg-slate-900 text-slate-300 pt-20 pb-12 border-t border-slate-800 overflow-hidden font-sans">
      {/* Ambient Gradients */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[350px] bg-[radial-gradient(circle_at_50%_100%,rgba(37,99,235,0.05),transparent_70%)] pointer-events-none" />

      <div className="max-w-[1500px] mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-16 mb-16">
          
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
              The premier B2B medical equipment procurement standard. Connecting healthcare networks with direct factory pricing and certified medical equipment.
            </p>
            <div className="flex gap-3 pt-1">
              {SOCIAL_LINKS.map((social, i) => (
                <a 
                  key={i} 
                  href={social.href} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label={social.label} 
                  className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-blue-600 text-slate-400 hover:text-white transition-all flex items-center justify-center border border-slate-700 hover:border-blue-500 shadow-sm"
                >
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
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-blue-400 transition-colors shrink-0" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact & Location */}
          <div className="lg:col-span-2 space-y-6">
            <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Office Registry</h4>
            <div className="space-y-4">
              <div className="flex gap-3 text-xs font-semibold text-slate-300 leading-relaxed">
                <MapPin size={16} className="text-blue-400 shrink-0 mt-0.5" />
                <span>{contactInfo.address}</span>
              </div>
              <div className="flex gap-3 text-xs font-semibold text-slate-300">
                <Phone size={16} className="text-blue-400 shrink-0 mt-0.5" />
                <a href={`tel:${contactInfo.phone.replace(/[^0-9+]/g, '')}`} className="hover:text-blue-400 transition-colors">
                  {contactInfo.phone}
                </a>
              </div>
              <div className="flex gap-3 text-xs font-semibold text-slate-300">
                <Mail size={16} className="text-blue-400 shrink-0 mt-0.5" />
                <a href={`mailto:${contactInfo.email}`} className="hover:text-blue-400 transition-colors break-all">
                  {contactInfo.email}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Verification & Trust Bar */}
        <div className="py-6 border-y border-slate-800 flex flex-wrap items-center justify-between gap-6 mb-8 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
           <div className="flex flex-wrap items-center gap-6 md:gap-10">
              <div className="flex items-center gap-2 text-white font-bold bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 shadow-sm">
                <img src="/durr-dental-logo-white.svg" alt="Dürr Dental Logo" className="h-4 w-auto object-contain" />
                <span className="text-blue-400 font-extrabold text-[10px] tracking-widest ml-1">OFFICIAL DISTRIBUTOR</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe size={12} className="text-blue-400" /> DIRECT FACTORY SOURCING
              </div>
              <div className="flex items-center gap-2">
                <Zap size={12} className="text-amber-400" /> DIRECT FACTORY PRICING
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
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] font-semibold text-slate-500">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-1">
            <Link to="/foundation" className="hover:text-slate-300 transition-colors">Service Terms</Link>
            <Link to="/foundation" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <Link to="/foundation" className="hover:text-slate-300 transition-colors">Quality Guidelines</Link>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-right">
            <span>&copy; {new Date().getFullYear()} Carelink Healthineers. All rights reserved.</span>
            <span className="hidden sm:inline text-slate-700">•</span>
            <span className="text-slate-400">
              Developed by{' '}
              <a 
                href="https://zaironx.top" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-400 hover:text-blue-300 font-bold transition-colors inline-flex items-center gap-0.5 underline decoration-blue-500/40 underline-offset-2"
              >
                Mohibbul Wara Orjon
                <ArrowUpRight size={11} className="inline ml-0.5" />
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
