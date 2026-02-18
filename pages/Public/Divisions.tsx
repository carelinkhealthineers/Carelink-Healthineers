
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { SEO } from '../../components/SEO';

const DIVISIONS = [
  { name: 'Laboratory / Pathology', slug: 'laboratory-pathology', icon: 'Microscope', gradient: 'from-blue-500 to-indigo-600', count: '150+ Items' },
  { name: 'Imaging / Radiology', slug: 'imaging-radiology', icon: 'Zap', gradient: 'from-purple-500 to-violet-700', count: '80+ Systems' },
  { name: 'Operation Theatre (OT)', slug: 'surgical-ot', icon: 'Scissors', gradient: 'from-cyan-500 to-blue-600', count: '200+ Tools' },
  { name: 'ICU / CCU / Emergency', slug: 'critical-care', icon: 'Activity', gradient: 'from-red-500 to-rose-700', count: '120+ Devices' },
  { name: 'OPD / Examination', slug: 'opd-examination', icon: 'Stethoscope', gradient: 'from-emerald-500 to-teal-700', count: '90+ Items' },
  { name: 'Dialysis Department', slug: 'dialysis', icon: 'Droplets', gradient: 'from-blue-400 to-indigo-500', count: '40+ Solutions' },
  { name: 'Dental Department', slug: 'dental', icon: 'Smile', gradient: 'from-sky-400 to-blue-500', count: '60+ Units' },
  { name: 'CSSD / Sterilization', slug: 'sterilization', icon: 'ShieldCheck', gradient: 'from-slate-500 to-zinc-700', count: '30+ Systems' },
  { name: 'Hospital Furniture', slug: 'hospital-furniture', icon: 'Bed', gradient: 'from-amber-500 to-orange-600', count: '100+ Models' },
  { name: 'Medical Consumables', slug: 'consumables', icon: 'Package', gradient: 'from-pink-500 to-rose-600', count: '500+ Essentials' },
];

export const Divisions: React.FC = () => {
  return (
    <div className="pt-32 pb-20 bg-gray-50">
      <SEO title="Clinical Divisions" description="Explore our specialized medical departments and infrastructure solutions." />
      
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <header className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-widest mb-6"
          >
            Infrastructure Blueprint
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">Strategic Clinical <span className="text-gradient-primary">Divisions</span></h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Carelink operates through focused specialized units to deliver unparalleled technical expertise across the entire healthcare spectrum.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {DIVISIONS.map((div, i) => {
            const IconComponent = (Icons as any)[div.icon] || Icons.HelpCircle;
            return (
              <motion.div
                key={div.slug}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -8 }}
              >
                <Link to={`/portfolio?division=${div.slug}`} className="block group h-full">
                  <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm group-hover:shadow-2xl group-hover:shadow-blue-500/10 transition-all h-full flex flex-col items-center text-center">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${div.gradient} flex items-center justify-center text-white mb-6 shadow-lg transform group-hover:rotate-12 transition-transform`}>
                      <IconComponent size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors">{div.name}</h3>
                    <div className="mt-auto pt-4 flex flex-col items-center">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">{div.count}</span>
                      <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <Icons.ArrowRight size={16} />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
