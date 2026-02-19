
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight, Terminal, Search, Filter } from 'lucide-react';
import { SEO } from '../../components/SEO';
import { supabase } from '../../supabaseClient';
import { Blog } from '../../types';

export const BlogList: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('blogs')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false });
      if (data) setBlogs(data);
      setLoading(false);
    };
    fetchBlogs();
  }, []);

  const filtered = blogs.filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="pt-32 pb-20 bg-[#020408] min-h-screen">
      <SEO title="Intelligence Briefings" description="High-performance clinical insights and technical infrastructure bulletins." />
      
      <div className="max-w-[1400px] mx-auto px-6">
        <header className="flex flex-col lg:flex-row items-end justify-between gap-8 mb-20">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.8em]">Editorial_Artery_v1.0</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none">
              Intelligence <span className="text-blue-500/30 italic">Briefings.</span>
            </h1>
          </div>
          
          <div className="relative group w-full lg:w-80">
            <Search size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text"
              placeholder="QUERY ARCHIVE..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-[10px] font-black text-white placeholder:text-slate-600 uppercase tracking-widest outline-none focus:border-blue-600 transition-all backdrop-blur-md"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[4/3] rounded-[2.5rem] bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <AnimatePresence>
              {filtered.map((blog, i) => (
                <motion.div
                  key={blog.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] overflow-hidden hover:border-blue-500/40 transition-all duration-700"
                >
                  <Link to={`/insights/${blog.slug}`} className="block p-2">
                    <div className="aspect-video rounded-[2rem] overflow-hidden relative mb-8">
                       <img src={blog.featured_image} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-105 grayscale group-hover:grayscale-0" />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-transparent" />
                    </div>
                    <div className="px-6 pb-8 space-y-4">
                       <div className="flex items-center gap-3">
                         <span className="px-3 py-1 rounded-lg bg-blue-600/10 border border-blue-500/20 text-[8px] font-black text-blue-400 uppercase tracking-widest">
                            {blog.category}
                         </span>
                         <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">
                           {new Date(blog.published_at).toLocaleDateString()}
                         </span>
                       </div>
                       <h3 className="text-2xl font-black text-white tracking-tight leading-tight group-hover:text-blue-400 transition-colors line-clamp-2">
                         {blog.title}
                       </h3>
                       <p className="text-[11px] font-medium text-slate-500 leading-relaxed italic line-clamp-2 opacity-80">
                         {blog.excerpt}
                       </p>
                       <div className="flex items-center gap-3 text-[9px] font-black text-white uppercase tracking-widest group-hover:gap-5 transition-all pt-4">
                          ACCESS INTEL <ArrowRight size={14} className="text-blue-500" />
                       </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};
