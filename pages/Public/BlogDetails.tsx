import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Calendar, User, ArrowRight, Share2, Printer, Hash, Sparkles, Image as ImageIcon, Clock, CheckCircle2, Copy, Maximize2, X } from 'lucide-react';
import { SEO } from '../../components/SEO';
import { supabase } from '../../supabaseClient';
import { Blog } from '../../types';

export const BlogDetails: React.FC = () => {
  const { blogSlug } = useParams();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeLightboxImage, setActiveLightboxImage] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
       <span className="text-slate-500 font-black uppercase tracking-[0.8em] text-[10px]">Loading_Clinical_Briefing...</span>
    </div>
  );
  
  if (!blog) return (
    <div className="min-h-screen bg-[#020408] flex items-center justify-center text-rose-500 font-black uppercase tracking-[0.5em]">
      BRIEFING_NOT_FOUND
    </div>
  );

  const wordCount = blog.content ? blog.content.split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  // Extract all sub-picture URLs embedded in markdown content for schema
  const embeddedImageUrls: string[] = [];
  const imgRegex = /!\[.*?\]\((.*?)\)/g;
  let match;
  while ((match = imgRegex.exec(blog.content || '')) !== null) {
    if (match[1]) embeddedImageUrls.push(match[1]);
  }

  const allImages = Array.from(new Set([
    blog.featured_image,
    ...embeddedImageUrls,
    ...(blog.gallery || [])
  ].filter(Boolean)));

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://carelinkhealthineers.com/insights/${blog.slug}`
    },
    "headline": blog.title,
    "image": allImages,
    "datePublished": blog.published_at,
    "dateModified": blog.published_at,
    "author": {
      "@type": "Person",
      "name": blog.author || "Carelink Healthineers Editorial Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Carelink Healthineers",
      "logo": {
        "@type": "ImageObject",
        "url": "https://i.imgur.com/y0UvXGu.png"
      }
    },
    "description": blog.excerpt,
    "articleBody": blog.content
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Content Paragraph & Sub-Picture Parser
  const renderContentBlocks = (content: string) => {
    // Regex matches markdown image syntax ![alt](url)
    const blocks = content.split(/(!\[.*?\]\(.*?\))/g);
    
    return blocks.map((block, idx) => {
      const imgMatch = block.match(/!\[(.*?)\]\((.*?)\)/);
      if (imgMatch) {
        const altText = imgMatch[1] || 'Clinical Equipment Sub-Picture';
        const imgUrl = imgMatch[2];
        return (
          <div key={idx} className="my-14 space-y-3">
             <div 
               onClick={() => setActiveLightboxImage(imgUrl)}
               className="relative rounded-[2.5rem] overflow-hidden border border-white/10 bg-slate-950 group cursor-pointer shadow-2xl transition-all hover:border-blue-500/50"
             >
                <img src={imgUrl} alt={altText} className="w-full max-h-[550px] object-cover group-hover:scale-102 transition-transform duration-700" />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-black text-xs uppercase tracking-widest backdrop-blur-xs">
                   <Maximize2 size={18} className="text-blue-400" /> View Sub-Picture High-Res
                </div>
                <div className="absolute top-4 left-4 px-3 py-1 bg-black/70 backdrop-blur-md rounded-lg text-[8px] font-black text-blue-400 uppercase tracking-widest border border-white/10">
                   Sub-Picture Asset
                </div>
             </div>
             {altText && (
               <p className="text-center text-xs font-mono text-slate-400 italic">
                  {altText}
               </p>
             )}
          </div>
        );
      }

      if (!block.trim()) return null;

      return (
        <div key={idx} className="whitespace-pre-line leading-relaxed text-slate-300 text-lg md:text-xl font-normal space-y-6">
           {block}
        </div>
      );
    });
  };

  return (
    <div className="pt-32 pb-48 bg-[#020408] min-h-screen selection:bg-blue-600 selection:text-white relative">
      {/* Scroll Progress Indicator Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 z-[110] bg-white/5">
        <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-150" style={{ width: `${scrollProgress}%` }} />
      </div>

      <SEO 
        title={`${blog.title} | Clinical Insights`} 
        description={blog.excerpt} 
        image={blog.featured_image}
        type="article"
        keywords={[...(blog.tags || []), blog.category, 'medical insights', 'clinical equipment', 'Dürr Dental updates']}
        jsonLd={articleSchema}
        breadcrumbs={[
          { name: 'Home', item: '/' },
          { name: 'Insights', item: '/intelligence' },
          { name: blog.title, item: `/insights/${blog.slug}` }
        ]}
      />
      
      <article className="max-w-[1000px] mx-auto px-6">
        <Link to="/intelligence" className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all mb-12 group">
          <ChevronLeft size={16} className="group-hover:-translate-x-2 transition-transform text-blue-500" /> Back to Intelligence Briefings
        </Link>

        <header className="space-y-8 mb-16">
          <div className="flex flex-wrap items-center gap-4">
             <span className="px-5 py-2 bg-blue-600/10 border border-blue-500/20 rounded-full text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">
               {blog.category}
             </span>
             <span className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-mono text-slate-400 flex items-center gap-2">
               <Clock size={12} className="text-blue-500" /> {readTime} min read
             </span>
             <div className="h-px flex-1 bg-white/5 min-w-[50px]" />
             <div className="flex flex-wrap gap-2">
                {blog.tags?.map(tag => (
                   <span key={tag} className="text-[9px] font-black text-slate-600 uppercase tracking-widest">#{tag}</span>
                ))}
             </div>
          </div>
          
          <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-[1.05] drop-shadow-2xl">
            {blog.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] border-y border-white/5 py-6">
            <div className="flex flex-wrap items-center gap-8">
               <div className="flex items-center gap-3"><Calendar size={14} className="text-blue-500" /> {new Date(blog.published_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
               <div className="flex items-center gap-3"><User size={14} className="text-blue-500" /> Author: {blog.author}</div>
            </div>
            <div className="flex gap-4">
              <button onClick={copyToClipboard} className="hover:text-white transition-colors flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 cursor-pointer">
                 {copied ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Copy size={14} />} 
                 {copied ? 'Copied Link!' : 'Share'}
              </button>
              <button className="hover:text-white transition-colors flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 cursor-pointer" onClick={() => window.print()}>
                 <Printer size={14} /> Print
              </button>
            </div>
          </div>
        </header>

        {/* Master Featured Image */}
        <div className="rounded-[3.5rem] overflow-hidden mb-20 border border-white/10 shadow-4xl aspect-[16/9] relative group">
           <img src={blog.featured_image} alt={blog.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-102" />
           <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
           <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between">
              <span className="text-[9px] font-black text-white/80 uppercase tracking-widest bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">Primary Visual Asset</span>
              <button onClick={() => setActiveLightboxImage(blog.featured_image)} className="p-3 bg-black/60 backdrop-blur-md text-white rounded-xl hover:bg-blue-600 transition-all border border-white/10">
                 <Maximize2 size={16} />
              </button>
           </div>
        </div>

        {/* Key Takeaways Box */}
        {blog.excerpt && (
          <div className="mb-16 p-8 md:p-10 rounded-[2.5rem] bg-blue-950/20 border border-blue-500/20 backdrop-blur-md space-y-3">
             <div className="flex items-center gap-3 text-blue-400 font-black text-[10px] uppercase tracking-[0.3em]">
                <Sparkles size={16} /> Executive Summary & Key Takeaways
             </div>
             <p className="text-xl md:text-2xl font-semibold text-blue-100/90 leading-relaxed italic">
                "{blog.excerpt}"
             </p>
          </div>
        )}

        {/* Content & Sub-Picture Gallery Area */}
        <div className="prose prose-invert prose-blue max-w-none text-slate-300 font-normal">
           {renderContentBlocks(blog.content)}
        </div>

        {/* Sub-Picture Supplemental Gallery */}
        {blog.gallery && blog.gallery.length > 0 && (
           <div className="mt-28 space-y-8 border-t border-white/10 pt-16">
              <div className="flex items-center justify-between">
                 <div>
                    <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                       <ImageIcon size={22} className="text-blue-500" /> Sub-Picture Gallery & Inspection
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">High-resolution clinical photos and equipment diagrams.</p>
                 </div>
                 <span className="text-[10px] font-mono text-slate-500 uppercase">{blog.gallery.length} Sub-Pictures</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {blog.gallery.map((url, idx) => (
                    <motion.div 
                      key={idx}
                      whileHover={{ scale: 1.03 }}
                      onClick={() => setActiveLightboxImage(url)}
                      className="aspect-square rounded-[2rem] overflow-hidden border border-white/10 bg-slate-900 group cursor-pointer relative shadow-xl"
                    >
                       <img src={url} alt={`Sub-Picture Figure ${idx + 1}`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-500" />
                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-2">
                          <Maximize2 size={18} className="text-blue-400" /> Inspect
                       </div>
                       <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/80 rounded-lg text-[8px] font-mono text-slate-300">
                          Fig #{idx + 1}
                       </div>
                    </motion.div>
                 ))}
              </div>
           </div>
        )}

        {/* CTA Banner */}
        <footer className="mt-32 pt-16 border-t border-white/5">
           <div className="p-12 md:p-16 rounded-[3.5rem] bg-gradient-to-br from-white to-slate-100 text-black flex flex-col md:flex-row items-center justify-between gap-10 shadow-3xl overflow-hidden relative group">
              <div className="relative z-10 max-w-lg space-y-3">
                 <span className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-600">Carelink Healthineers Solutions</span>
                 <h4 className="text-3xl md:text-4xl font-black tracking-tighter leading-tight">Equip Your Healthcare Facility Today</h4>
                 <p className="text-slate-600 text-base font-medium leading-relaxed">Direct factory sourcing for Dürr Dental and top European medical equipment with certified warranties.</p>
              </div>
              <Link to="/acquisition" className="relative z-10 px-10 py-5 bg-blue-600 text-white rounded-[2rem] font-black uppercase text-[11px] tracking-widest hover:bg-slate-900 transition-all shadow-2xl flex items-center gap-3 shrink-0">
                Request Equipment Quote <ArrowRight size={18} />
              </Link>
           </div>
        </footer>
      </article>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {activeLightboxImage && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl" onClick={() => setActiveLightboxImage(null)}>
             <button onClick={() => setActiveLightboxImage(null)} className="absolute top-8 right-8 p-4 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all cursor-pointer">
                <X size={24} />
             </button>
             <motion.img 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               src={activeLightboxImage} 
               alt="Sub-Picture High Resolution View" 
               className="max-w-full max-h-[90vh] object-contain rounded-3xl border border-white/10 shadow-2xl"
               onClick={(e) => e.stopPropagation()}
             />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
