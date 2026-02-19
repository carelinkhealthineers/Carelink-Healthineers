
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { SEO } from '../../components/SEO';
import { supabase } from '../../supabaseClient';
import { Division } from '../../types';

export const Divisions: React.FC = () => {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDivisions = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('divisions')
          .select('*')
          .order('order_index');
        
        if (error) throw error;
        setDivisions(data || []);
      } catch (err) {
        console.error('Division Fetch Error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDivisions();
  }, []);

  return (
    <div className="pt-32 pb-20 bg-gray-50/50">
      <SEO title="Clinical Matrix" description="Explore our 10 specialized clinical departments and infrastructure solutions." />
      
      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        <header className="text-center mb-24 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest mb-6 border border-blue-100"
          >
            Clinical Infrastructure Blueprint
          </motion.div>
          <h1 className="text-6xl md:text-8xl font-black text-gray-900 mb-8 tracking-tighter leading-none">The 10 Strategic <br /><span className="text-gradient-primary">Clinical Hubs.</span></h1>
          <p className="text-gray-500 text-xl leading-relaxed font-medium">
            Carelink operates through 10 highly-specialized divisions to ensure absolute technical mastery and global compliance across the entire healthcare ecosystem.
          </p>
        </header>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-80 bg-white border border-gray-100 rounded-[3rem] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
            {divisions.map((div, i) => {
              const IconComponent = (Icons as any)[div.icon_name] || Icons.HelpCircle;
              return (
                <motion.div
                  key={div.slug}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -12 }}
                >
                  <Link to={`/portfolio?division=${div.slug}`} className="block group h-full">
                    <div className="bg-white rounded-[3.5rem] p-10 border border-gray-100 shadow-sm group-hover:shadow-2xl group-hover:shadow-blue-500/10 transition-all h-full flex flex-col items-center text-center relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-125 transition-transform duration-700">
                         <IconComponent size={140} />
                      </div>
                      
                      <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${div.hero_gradient} flex items-center justify-center text-white mb-8 shadow-xl transform group-hover:rotate-12 transition-transform`}>
                        <IconComponent size={36} />
                      </div>

                      <div className="mb-4">
                        <span className="px-4 py-1.5 bg-gray-50 rounded-full text-[11px] font-black text-blue-600 uppercase tracking-widest border border-gray-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          {(div as any).count_label || 'Strategic Node'}
                        </span>
                      </div>

                      <h3 className="text-2xl font-black text-gray-900 mb-4 leading-tight group-hover:text-blue-600 transition-colors">{div.name}</h3>
                      <p className="text-gray-400 text-sm font-medium leading-relaxed mb-10 line-clamp-2">
                        {div.description}
                      </p>

                      <div className="mt-auto flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                          <Icons.ChevronRight size={20} />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
        
        <section className="mt-40 p-16 rounded-[4rem] bg-slate-900 text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 p-20 opacity-5"><Icons.ShieldCheck size={400} /></div>
           <div className="max-w-3xl relative z-10">
              <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight">Unified Clinical Sourcing.</h2>
              <p className="text-gray-400 text-lg mb-10 leading-relaxed font-medium">Carelink Healthineers provides a single point of entry for high-performance medical infrastructure. Every division is audited by our global compliance matrix to ensure zero operational downtime.</p>
              <Link to="/acquisition" className="inline-flex items-center gap-3 px-10 py-5 bg-blue-600 text-white rounded-[2rem] font-black hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/20">
                 Acquire Clinical Asset <Icons.ArrowRight size={20} />
              </Link>
           </div>
        </section>
      </div>
    </div>
  );
};
