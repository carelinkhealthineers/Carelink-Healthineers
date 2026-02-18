
import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ShieldCheck, Zap, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '../../components/SEO';

export const Origin: React.FC = () => {
  return (
    <div className="pt-20">
      <SEO title="Origin" description="Carelink Healthineers: Pioneering Medical Sourcing Excellence." />
      
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent z-10"></div>
          <img 
            src="https://picsum.photos/seed/medtech/1920/1080" 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-20 grayscale"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-20 w-full">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-widest mb-6">
              <ShieldCheck size={14} />
              Global Standards Certified
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-gray-900 leading-[1.1] mb-6">
              Architecting <br />
              <span className="text-gradient-primary">Healthcare</span> Excellence.
            </h1>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-lg">
              Carelink Healthineers provides enterprise-grade medical infrastructure 
              and equipment sourcing solutions for the next generation of healthcare facilities.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/portfolio" className="px-8 py-4 rounded-full bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20">
                Explore Portfolio <ChevronRight size={18} />
              </Link>
              <Link to="/foundation" className="px-8 py-4 rounded-full bg-white text-gray-900 font-bold border border-gray-200 hover:bg-gray-50 transition-all">
                The Foundation
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Metrics */}
      <section className="py-20 bg-white border-y">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Districts Served', value: '450+', icon: <Globe className="text-blue-500" /> },
            { label: 'Active Alliances', value: '120+', icon: <Zap className="text-indigo-500" /> },
            { label: 'Product Lines', value: '1.2k+', icon: <ShieldCheck className="text-blue-600" /> },
            { label: 'Years Leading', value: '25+', icon: <Globe className="text-emerald-500" /> },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="flex justify-center mb-3">{stat.icon}</div>
              <div className="text-3xl font-black text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm font-semibold text-gray-500 uppercase tracking-tighter">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Division Preview */}
      <section className="py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Core Strategic Divisions</h2>
            <p className="text-gray-600 max-w-xl mx-auto text-lg">
              Operating through focused specialized units to deliver unparalleled technical expertise.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Laboratory Intelligence', slug: 'laboratory-intelligence', gradient: 'from-blue-600 to-indigo-700' },
              { title: 'Radiological Imaging', slug: 'radiological-imaging', gradient: 'from-purple-600 to-indigo-700' },
              { title: 'Surgical Infrastructure', slug: 'surgical-infrastructure', gradient: 'from-cyan-600 to-blue-700' },
            ].map((div, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="group cursor-pointer rounded-3xl overflow-hidden bg-white shadow-xl shadow-gray-200/50"
              >
                <div className={`h-48 bg-gradient-to-br ${div.gradient} relative overflow-hidden p-8 flex items-end`}>
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <ShieldCheck size={120} />
                  </div>
                  <h3 className="text-2xl font-bold text-white relative z-10 leading-tight">{div.title}</h3>
                </div>
                <div className="p-8">
                  <p className="text-gray-500 mb-6 leading-relaxed">
                    Advanced analytical frameworks and high-precision diagnostic systems for modern labs.
                  </p>
                  <Link to={`/divisions/${div.slug}`} className="flex items-center gap-2 text-sm font-bold text-blue-600 group-hover:gap-4 transition-all">
                    Explore Division <ChevronRight size={16} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
