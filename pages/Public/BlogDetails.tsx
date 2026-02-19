
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Calendar, User, ArrowRight, Share2, Printer, Hash, Sparkles, Image as ImageIcon } from 'lucide-react';
import { SEO } from '../../components/SEO';
import { supabase } from '../../supabaseClient';
import { Blog } from '../../types';

export const BlogDetails: React.FC = () => {
  const { blogSlug } = useParams();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('blogs')
        .select('*')
        .eq('slug', blogSlug)
        .single();
      if (data) setBlog(data);
      setLoading(false);
    };
    fetchBlog();
  }, [blogSlug]);

  if (loading) return (
    <div className="min-h-screen bg-[#020408] flex flex-col items-center justify-center gap-6">
       <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
       <span className="text-slate-500 font-black uppercase tracking-[0.8em] text-[10px]">Decoding_Neural_Data...</span>
    </div>
  );
  
  if (!blog) return (
    <div className="min-h-screen bg-[#020408] flex items-center justify-center text-rose-500 font-black uppercase tracking-[0.5em]">
      INTEL_NOT_FOUND_REGISTRY_ERROR
    </div>
  );

  return (
    <div className="pt-40 pb-48 bg-[#020408] min-h-screen selection:bg-blue-600 selection:text-white">
      <SEO title={blog.title} description={blog.excerpt} image={blog.featured_image} />
      
      <article className="max-w-[1000px] mx-auto px-6">
        <Link to="/insights" className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all mb-16 group">
          <ChevronLeft size={16} className="group-hover:-translate-x-2 transition-transform" /> Back to Intelligence Briefings
        </Link>

        <header className="space-y-10 mb-20">
          <div className="flex items-center gap-6">
             <span className="px-5 py-2 bg-blue-600/10 border border-blue-500/20 rounded-full text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">
               {blog.category}
             </span>
             <div className="h-[1px] flex-1 bg-white/5" />
             <div className="flex gap-3">
                {blog.tags?.map(tag => (
                   <span key={tag} className="text-[9px] font-black text-slate-600 uppercase tracking-widest">#{tag}</span>
                ))}
             </div>
          </div>
          
          <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-[0.9] drop-shadow-2xl">
            {blog.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-8 text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] border-y border-white/5 py-8">
            <div className="flex items-center gap-12">
               <div className="flex items-center gap-3"><Calendar size={14} className="text-blue-500" /> {new Date(blog.published_at).toLocaleDateString()}</div>
               <div className="flex items-center gap-3"><User size={14} className="text-blue-500" /> Lead Architect: {blog.author}</div>
            </div>
            <div className="flex gap-6">
              <button className="hover:text-white transition-colors flex items-center gap-2"><Share2 size={16} /> Broadcast</button>
              <button className="hover:text-white transition-colors flex items-center gap-2" onClick={() => window.print()}><Printer size={16} /> Archive_Local</button>
            </div>
          </div>
        </header>

        {/* Cinematic Main Image */}
        <div className="rounded-[4rem] overflow-hidden mb-24 border border-white/10 shadow-4xl aspect-[16/9] relative group">
           <img src={blog.featured_image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
           <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        {/* Rich Content Area */}
        <div className="prose prose-invert prose-blue max-w-none prose-lg">
           <p className="text-2xl md:text-3xl font-black text-blue-400/90 leading-relaxed italic mb-20 border-l-8 border-blue-600/20 pl-10">
              {blog.excerpt}
           </p>
           <div className="text-slate-300 leading-relaxed text-xl space-y-12 font-medium whitespace-pre-line text-justify">
              {blog.content}
           </div>
        </div>

        {/* Viral Gallery Integration */}
        {blog.gallery && blog.gallery.length > 0 && (
           <div className="mt-32 space-y-12">
              <div className="flex items-center gap-4 mb-12">
                 <div className="w-12 h-px bg-white/5" />
                 <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.5em] flex items-center gap-4">
                    <ImageIcon size={16} /> Supplemental_Visual_Intel_Matrix
                 </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {blog.gallery.map((url, idx) => (
                    <motion.div 
                      key={idx}
                      whileHover={{ scale: 1.02 }}
                      className="aspect-square rounded-[3rem] overflow-hidden border border-white/10 bg-white/[0.01] group"
                    >
                       <img src={url} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-all duration-700" />
                    </motion.div>
                 ))}
              </div>
           </div>
        )}

        <footer className="mt-40 pt-20 border-t border-white/5">
           <div className="p-16 rounded-[4rem] bg-white text-black flex flex-col md:flex-row items-center justify-between gap-12 shadow-3xl overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-20 opacity-5 group-hover:rotate-12 transition-transform">
                 <Sparkles size={300} />
              </div>
              <div className="relative z-10 max-w-lg">
                 <h4 className="text-3xl font-black mb-4 tracking-tighter">Ready to Sovereignize Your Facility?</h4>
                 <p className="text-slate-600 text-lg font-medium leading-relaxed">Consult with our clinical engineering team to implement these intelligence protocols.</p>
              </div>
              <Link to="/acquisition" className="relative z-10 px-12 py-6 bg-blue-600 text-white rounded-[2rem] font-black uppercase text-[11px] tracking-widest hover:bg-black transition-all shadow-2xl flex items-center gap-4 group/btn">
                Initialize Strategic RFQ <ArrowRight size={18} className="group-hover/btn:translate-x-2 transition-transform" />
              </Link>
           </div>
        </footer>
      </article>
    </div>
  );
};
