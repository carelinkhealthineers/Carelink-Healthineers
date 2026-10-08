import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Target, 
  Users, 
  Compass, 
  Award, 
  CheckCircle2, 
  ArrowRight,
  Scale,
  Zap,
  Building2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '../../components/SEO';

const PILLARS = [
  {
    title: "Official Dürr Dental Partner",
    desc: "We supply genuine German dental and medical equipment directly in partnership with Dürr Dental.",
    icon: <ShieldCheck size={26} />,
    accent: "text-blue-600 bg-blue-50 border-blue-100"
  },
  {
    title: "Hospital & Clinic Projects",
    desc: "Complete equipment supply and room setup for hospitals, dental clinics, and diagnostic centers.",
    icon: <Compass size={26} />,
    accent: "text-indigo-600 bg-indigo-50 border-indigo-100"
  },
  {
    title: "Reliable Service & Support",
    desc: "On-site installation, staff training, and fast technical support from our engineering team.",
    icon: <Zap size={26} />,
    accent: "text-emerald-600 bg-emerald-50 border-emerald-100"
  }
];

export const Foundation: React.FC = () => {
  return (
    <div className="bg-white pt-20 overflow-hidden text-slate-900">
      <SEO 
        title="About Us & Projects | Carelink Healthineers & Dürr Dental Partner" 
        description="Learn about Carelink Healthineers — Official Dürr Dental Distributor supplying medical and dental equipment for hospital and clinic projects." 
        keywords={['about Carelink Healthineers', 'Dürr Dental partner', 'hospital projects', 'medical equipment company']}
      />

      {/* Hero Section */}
      <section className="relative py-24 md:py-32 border-b border-slate-100 bg-slate-50/50">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white border border-slate-200 text-[10px] font-bold text-slate-800 uppercase tracking-widest shadow-xs">
              <img src="/durr-dental-logo.svg" alt="Dürr Dental" className="h-4 w-auto object-contain" />
              <span className="w-px h-3.5 bg-slate-200" />
              <span className="text-blue-600 font-extrabold">OFFICIAL DISTRIBUTOR · CORPORATE &amp; PROJECTS</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-normal text-slate-900 leading-tight tracking-tight font-serif-classical">
              Trusted Medical &amp; Dental <br />
              <span className="italic text-blue-600 font-serif-classical">Equipment Partner.</span>
            </h1>

            <p className="text-base md:text-lg text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
              Carelink Healthineers connects hospitals and clinics directly with certified medical and dental equipment, official <strong className="text-slate-800">Dürr Dental</strong> systems, and complete project setup.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Three Pillars */}
      <section className="py-24 bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {PILLARS.map((pillar, i) => (
                <div
                  key={i}
                  className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4"
                >
                  <div className={`w-12 h-12 rounded-2xl border ${pillar.accent} flex items-center justify-center`}>
                    {pillar.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{pillar.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed font-medium">
                    {pillar.desc}
                  </p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Compliance & Project Support */}
      <section className="py-24 bg-slate-50 border-b border-slate-200/60">
        <div className="max-w-6xl mx-auto px-6">
           <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
              <div className="max-w-xl space-y-6">
                 <h2 className="text-3xl md:text-4xl font-normal text-slate-900 font-serif-classical">
                   Quality &amp; Project <span className="italic text-blue-600 font-serif-classical">Standards</span>
                 </h2>
                 <p className="text-slate-500 leading-relaxed text-sm sm:text-base font-medium">
                   Every piece of equipment we supply is tested, certified, and backed by official manufacturer support.
                 </p>
                 <div className="space-y-3">
                    {[
                      "Official Dürr Dental Distributor (Germany)",
                      "Certified Hospital & Dental Equipment",
                      "Full Clinic & Hospital Room Project Setup",
                      "On-Site Installation & Technical Service"
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm font-bold text-slate-700">
                        <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                        {item}
                      </div>
                    ))}
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
                 <div className="p-8 bg-white rounded-3xl border border-slate-200 flex flex-col items-center text-center">
                    <Award size={32} className="text-blue-600 mb-3" />
                    <div className="text-2xl font-bold text-slate-900">100%</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Genuine Equipment</div>
                 </div>
                 <div className="p-8 bg-white rounded-3xl border border-slate-200 flex flex-col items-center text-center">
                    <Users size={32} className="text-indigo-600 mb-3" />
                    <div className="text-2xl font-bold text-slate-900">24/7</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Technical Support</div>
                 </div>
                 <div className="col-span-2 p-8 bg-white border border-blue-200 rounded-3xl flex items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <img src="/durr-dental-logo.svg" alt="Dürr Dental" className="h-6 w-auto object-contain" />
                      <div>
                        <div className="text-base font-bold text-slate-900">Official Partner</div>
                        <div className="text-xs text-slate-500 font-medium">Direct factory supply &amp; warranty</div>
                      </div>
                    </div>
                    <Link to="/acquisition" className="p-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all">
                      <ArrowRight size={18} />
                    </Link>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-6">
           <h2 className="text-3xl md:text-5xl font-normal text-slate-900 font-serif-classical">
             Start Your Project <span className="italic text-blue-600 font-serif-classical">With Us.</span>
           </h2>
           <p className="text-base sm:text-lg text-slate-500 leading-relaxed font-medium">
             Browse our equipment catalog or request a price quote for your hospital or clinic.
           </p>
           <div className="flex flex-wrap justify-center gap-4 pt-2">
              <Link to="/portfolio" className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-widest shadow-sm transition-all">
                 View Products
              </Link>
              <Link to="/acquisition" className="px-8 py-4 rounded-xl bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 font-bold text-xs uppercase tracking-widest transition-all">
                 Get a Quote
              </Link>
           </div>
        </div>
      </section>
    </div>
  );
};
