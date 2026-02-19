
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight, Terminal, Search, Filter, Hash, Sparkles } from 'lucide-react';
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

  const filtered = blogs.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.tags?.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="pt-32 pb-32 bg-[#020408] min-h-screen">
      <SEO title="Intelligence Briefings" description="High-performance clinical insights, viral healthcare briefings, and technical bulletins." />
      
      <div className="max-w-[1500px] mx-auto px-6">
        <header className="flex flex-col lg:flex-row items-end justify-between gap-8 mb-24">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-pulse" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[1em]">Editorial_Matrix_4.0</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">
              Intelligence <br /><span className="text-slate-800 italic">Briefings.</span>
            </h1>
          </div>
          
          <div className="relative group w-full lg:w-[450px]">
            <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text"
              placeholder="QUERY INTEL OR HASHTAG..."
              className="w-full bg-white/[0.02] border border-white/5 rounded-3xl pl-16 pr-6 py-6 text-[10px] font-black text-white placeholder:text-slate-800 uppercase tracking-widest outline-none focus:border-blue-600 transition-all backdrop-blur-md"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[4/5] rounded-[3.5rem] bg-white/[0.01] border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            <AnimatePresence mode="popLayout">
              {filtered.map((blog, i) => (
                <motion.div
                  key={blog.id}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative bg-white/[0.01] border border-white/5 rounded-[3.5rem] overflow-hidden hover:border-blue-500/30 transition-all duration-700 shadow-2xl flex flex-col h-full"
                >
                  <Link to={`/insights/${blog.slug}`} className="block flex-1 p-3">
                    <div className="aspect-[16/10] rounded-[3rem] overflow-hidden relative mb-10 bg-black">
                       <img src={blog.featured_image} className="w-full h-full object-cover opacity-40 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-105 grayscale group-hover:grayscale-0" />
                       <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                       <div className="absolute bottom-6 left-6 px-4 py-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl">
                          <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">{blog.category}</span>
                       </div>
                    </div>
                    
                    <div className="px-8 pb-10 space-y-6">
                       <div className="flex flex-wrap gap-2">
                          {blog.tags?.slice(0, 3).map(tag => (
                            <span key={tag} className="text-[7px] font-black text-slate-700 uppercase tracking-widest border border-white/5 px-2 py-1 rounded-md group-hover:text-blue-500 group-hover:border-blue-500/20 transition-all">#{tag}</span>
                          ))}
                       </div>
                       
                       <h3 className="text-2xl font-black text-white tracking-tight leading-tight group-hover:text-blue-500 transition-colors line-clamp-2 min-h-[4rem]">
                         {blog.title}
                       </h3>
                       
                       <p className="text-sm font-medium text-slate-500 leading-relaxed italic line-clamp-2 opacity-60">
                         {blog.excerpt}
                       </p>
                       
                       <div className="flex items-center justify-between pt-6 border-t border-white/5">
                          <div className="text-[9px] font-black text-white uppercase tracking-widest group-hover:text-blue-500 transition-all flex items-center gap-3">
                             DECODE INTEL <ArrowRight size={14} className="text-blue-500" />
                          </div>
                          <span className="text-[8px] font-mono text-slate-800">{new Date(blog.published_at).toLocaleDateString()}</span>
                       </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
        
        {!loading && filtered.length === 0 && (
          <div className="py-48 text-center border-2 border-dashed border-white/5 rounded-[4rem] bg-white/[0.01]">
            <Terminal className="mx-auto text-slate-900 mb-8" size={64} />
            <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">NULL_QUERY_RESULT</h3>
            <p className="text-slate-600 text-sm font-medium italic">Adjust neural parameters or return to main archive.</p>
          </div>
        )}
      </div>
    </div>
  );
};
