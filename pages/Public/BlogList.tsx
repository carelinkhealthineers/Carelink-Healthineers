import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight, Terminal, Search, Clock, Hash, Sparkles, Filter, ChevronRight } from 'lucide-react';
import { SEO } from '../../components/SEO';
import { supabase } from '../../supabaseClient';
import { Blog } from '../../types';

export const BlogList: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

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

  const categories = ['All', 'Intelligence', 'Innovation', 'Industry', 'Medical'];

  const filtered = blogs.filter(b => {
    const matchesCategory = selectedCategory === 'All' || b.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      b.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.tags?.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredBlog = blogs.length > 0 ? blogs[0] : null;
  const gridBlogs = (selectedCategory === 'All' && !searchTerm && featuredBlog) ? filtered.slice(1) : filtered;

  return (
    <div className="pt-36 pb-32 bg-[#020408] min-h-screen selection:bg-blue-600 selection:text-white">
      <SEO 
        title="Medical Insights & Technical Briefings | Carelink Healthineers" 
        description="Explore high-impact medical intelligence, medical equipment technical guides, and industry news from Carelink Healthineers and Dürr Dental." 
        keywords={['medical news', 'medical insights', 'healthcare technology', 'dental equipment updates', 'Dürr Dental technical briefs']}
        breadcrumbs={[
          { name: 'Home', item: '/' },
          { name: 'Insights', item: '/intelligence' }
        ]}
      />
      
      <div className="max-w-[1500px] mx-auto px-6">
        {/* Header Section */}
        <header className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-10 mb-16">
          <div className="space-y-4 max-w-3xl">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-pulse" />
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.8em]">Carelink Intelligence Hub</span>
            </div>
            <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-tight">
              Medical Insights & <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 italic">Technical Briefings.</span>
            </h1>
            <p className="text-slate-400 text-sm md:text-base font-normal leading-relaxed">
              Stay ahead with verified technical specifications, medical equipment guidelines, and dental workflow innovations.
            </p>
          </div>
          
          <div className="relative group w-full lg:w-[420px]">
            <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text"
              placeholder="Search topic, equipment or tag..."
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-16 pr-6 py-5 text-xs font-medium text-white placeholder:text-slate-500 outline-none focus:border-blue-500 transition-all backdrop-blur-md shadow-inner"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        {/* Category Pills Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-16 pb-6 border-b border-white/5">
           <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mr-2 flex items-center gap-2">
              <Filter size={12} /> Filter Category:
           </span>
           {categories.map(cat => (
             <button
               key={cat}
               onClick={() => setSelectedCategory(cat)}
               className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${selectedCategory === cat ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10 hover:text-white'}`}
             >
                {cat}
             </button>
           ))}
        </div>

        {/* Featured Hero Article (Shows when no search & 'All' category) */}
        {!loading && featuredBlog && selectedCategory === 'All' && !searchTerm && (
          <div className="mb-20">
             <Link to={`/insights/${featuredBlog.slug}`} className="group relative block rounded-[3.5rem] border border-white/10 bg-slate-950 overflow-hidden shadow-3xl hover:border-blue-500/50 transition-all duration-700">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-8 lg:p-12">
                   <div className="lg:col-span-7 aspect-[16/10] rounded-[2.5rem] overflow-hidden relative bg-slate-900 border border-white/5">
                      <img src={featuredBlog.featured_image} alt={featuredBlog.title} className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-1000" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute top-6 left-6 px-4 py-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl">
                         <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Featured Briefing</span>
                      </div>
                   </div>

                   <div className="lg:col-span-5 space-y-6">
                      <div className="flex items-center gap-4">
                         <span className="px-4 py-1.5 bg-blue-600/20 border border-blue-500/30 rounded-full text-[9px] font-black text-blue-400 uppercase tracking-widest">
                           {featuredBlog.category}
                         </span>
                         <span className="text-xs text-slate-500 font-mono flex items-center gap-1.5">
                            <Clock size={12} className="text-blue-500" /> {Math.max(1, Math.ceil((featuredBlog.content?.split(/\s+/).length || 0) / 200))} min read
                         </span>
                      </div>

                      <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight group-hover:text-blue-400 transition-colors">
                         {featuredBlog.title}
                      </h2>

                      <p className="text-slate-400 text-sm md:text-base font-normal leading-relaxed line-clamp-3">
                         {featuredBlog.excerpt}
                      </p>

                      <div className="pt-4 flex items-center gap-4 text-xs font-black text-blue-400 uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                         Read Featured Briefing <ChevronRight size={16} />
                      </div>
                   </div>
                </div>
             </Link>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[4/5] rounded-[3rem] bg-white/[0.02] border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <AnimatePresence mode="popLayout">
              {gridBlogs.map((blog, i) => {
                const readTime = Math.max(1, Math.ceil((blog.content?.split(/\s+/).length || 0) / 200));
                return (
                  <motion.div
                    key={blog.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group relative bg-white/[0.01] border border-white/5 rounded-[3rem] overflow-hidden hover:border-blue-500/40 transition-all duration-500 shadow-2xl flex flex-col h-full"
                  >
                    <Link to={`/insights/${blog.slug}`} className="block flex-1 p-4">
                      <div className="aspect-[16/10] rounded-[2.2rem] overflow-hidden relative mb-6 bg-slate-900 border border-white/5">
                         <img src={blog.featured_image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                         <div className="absolute bottom-4 left-4 flex items-center gap-2">
                            <span className="px-3 py-1 bg-black/70 backdrop-blur-md border border-white/10 rounded-lg text-[8px] font-black text-blue-400 uppercase tracking-widest">
                               {blog.category}
                            </span>
                            <span className="px-2.5 py-1 bg-black/70 backdrop-blur-md border border-white/10 rounded-lg text-[8px] font-mono text-slate-300">
                               ⏱️ {readTime} min
                            </span>
                         </div>
                      </div>
                      
                      <div className="px-4 pb-6 space-y-4">
                         <div className="flex flex-wrap gap-2">
                            {blog.tags?.slice(0, 3).map(tag => (
                              <span key={tag} className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider bg-white/5 px-2.5 py-1 rounded-md">#{tag}</span>
                            ))}
                         </div>
                         
                         <h3 className="text-xl font-bold text-white tracking-tight leading-snug group-hover:text-blue-400 transition-colors line-clamp-2">
                           {blog.title}
                         </h3>
                         
                         <p className="text-xs text-slate-400 font-normal leading-relaxed line-clamp-2">
                           {blog.excerpt}
                         </p>
                         
                         <div className="flex items-center justify-between pt-4 border-t border-white/5 text-[9px] font-bold text-slate-400">
                            <span className="text-blue-400 uppercase tracking-widest flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                               Read Briefing <ChevronRight size={12} />
                            </span>
                            <span className="font-mono text-slate-500">{new Date(blog.published_at).toLocaleDateString()}</span>
                         </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
        
        {!loading && filtered.length === 0 && (
          <div className="py-32 text-center border border-white/5 rounded-[3rem] bg-white/[0.01] max-w-xl mx-auto space-y-4">
            <Terminal className="mx-auto text-slate-700" size={48} />
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">No Briefings Found</h3>
            <p className="text-slate-400 text-xs font-normal">Try clearing your search query or choosing a different category filter.</p>
            <button 
              onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }} 
              className="px-6 py-2.5 bg-blue-600 text-white text-xs font-bold uppercase rounded-xl hover:bg-blue-500 transition-all"
            >
               Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
