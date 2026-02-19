
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Calendar, User, ArrowRight, Share2, Printer } from 'lucide-react';
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

  if (loading) return <div className="min-h-screen bg-[#020408] flex items-center justify-center text-slate-500 font-black uppercase tracking-[0.5em]">DECODING_INTEL...</div>;
  if (!blog) return <div className="min-h-screen bg-[#020408] flex items-center justify-center text-rose-500">INTEL_NOT_FOUND</div>;

  return (
    <div className="pt-40 pb-32 bg-[#020408] min-h-screen">
      <SEO title={blog.title} description={blog.excerpt} image={blog.featured_image} />
      
      <article className="max-w-[900px] mx-auto px-6">
        <Link to="/insights" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all mb-12 group">
          <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Briefings
        </Link>

        <header className="space-y-8 mb-16">
          <div className="flex items-center gap-4">
             <span className="px-4 py-1.5 bg-blue-600/10 border border-blue-500/20 rounded-full text-[10px] font-black text-blue-400 uppercase tracking-widest">
               {blog.category}
             </span>
             <div className="h-[1px] flex-1 bg-white/5" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none">
            {blog.title}
          </h1>
          <div className="flex flex-wrap items-center gap-8 text-[10px] font-black text-slate-500 uppercase tracking-widest border-y border-white/5 py-6">
            <div className="flex items-center gap-2"><Calendar size={14} /> {new Date(blog.published_at).toLocaleDateString()}</div>
            <div className="flex items-center gap-2"><User size={14} /> {blog.author}</div>
            <div className="ml-auto flex gap-4">
              <button className="hover:text-blue-500"><Share2 size={16} /></button>
              <button className="hover:text-blue-500" onClick={() => window.print()}><Printer size={16} /></button>
            </div>
          </div>
        </header>

        <div className="rounded-[3rem] overflow-hidden mb-16 border border-white/10 shadow-4xl aspect-video">
           <img src={blog.featured_image} className="w-full h-full object-cover" />
        </div>

        <div className="prose prose-invert prose-blue max-w-none prose-lg">
           <p className="text-2xl font-black text-blue-400/80 leading-relaxed italic mb-12 border-l-4 border-blue-600/30 pl-8">
              {blog.excerpt}
           </p>
           <div className="text-slate-300 leading-relaxed text-xl space-y-8 font-medium whitespace-pre-line">
              {blog.content}
           </div>
        </div>

        <footer className="mt-24 pt-16 border-t border-white/5">
           <div className="p-12 rounded-[3rem] bg-white/[0.02] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-10">
              <div>
                 <h4 className="text-2xl font-black text-white mb-2">Architecting Your Infrastructure?</h4>
                 <p className="text-slate-500 text-sm">Consult our clinical engineering team for a dedicated RFQ.</p>
              </div>
              <Link to="/acquisition" className="px-10 py-5 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 hover:text-white transition-all">
                Initialize RFQ <ArrowRight size={16} className="inline ml-2" />
              </Link>
           </div>
        </footer>
      </article>
    </div>
  );
};
