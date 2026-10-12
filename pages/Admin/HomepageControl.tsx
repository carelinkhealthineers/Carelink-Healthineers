import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Star, Sparkles, Save, RefreshCw, Eye, EyeOff,
  ArrowUp, ArrowDown, Plus, Trash2, CheckCircle2, Search,
  Layers, Tv, FileText, Building2, Upload, ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { Product } from '../../types';
import {
  HomepageControlConfig,
  DEFAULT_HOMEPAGE_CONFIG,
  mergeHomepageConfig,
} from '../../utils/homepageConfig';
import { AdminVideoManager } from '../../components/AdminVideoManager';

type ControlTab = 'highlighted' | 'spotlight' | 'sections' | 'corporate' | 'videos';

export const HomepageControl: React.FC = () => {
  const [config, setConfig] = useState<HomepageControlConfig>(DEFAULT_HOMEPAGE_CONFIG);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<ControlTab>('highlighted');
  const [productSearch, setProductSearch] = useState('');
  const spotlightImageInputRef = useRef<HTMLInputElement>(null);

  const fetchHomepageControlData = async () => {
    setIsLoading(true);
    try {
      const [settingsRes, productsRes] = await Promise.all([
        supabase
          .from('settings')
          .select('value')
          .eq('key', 'homepage_control_config')
          .maybeSingle(),
        supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false }),
      ]);

      if (productsRes.data) {
        setProducts(productsRes.data);
      }

      if (settingsRes.data?.value) {
        try {
          const parsed = JSON.parse(settingsRes.data.value);
          setConfig(mergeHomepageConfig(parsed));
        } catch (e) {
          console.error('Failed to parse homepage_control_config JSON:', e);
        }
      }
    } catch (err) {
      console.error('Error loading Homepage Control data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHomepageControlData();
  }, []);

  const handleSaveConfig = async (nextConfig: HomepageControlConfig = config) => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const { data, error } = await supabase
        .from('settings')
        .upsert(
          {
            key: 'homepage_control_config',
            value: JSON.stringify(nextConfig),
            category: 'homepage',
            description: 'Full Homepage Control & Custom Highlighted Products Configuration',
          },
          { onConflict: 'key' }
        )
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Save rejected by database permissions (0 rows affected).');
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Homepage Control save error:', err);
      alert(`Failed to save Homepage configuration: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Upload custom image for Spotlight section
  const handleSpotlightImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    const ext = file.name.split('.').pop();
    const path = `uploads/spotlight-${Date.now()}.${ext}`;
    try {
      const { error } = await supabase.storage.from('products').upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(path);
      setConfig(prev => ({
        ...prev,
        spotlight: { ...prev.spotlight, customImage: publicUrl },
      }));
    } catch (err: any) {
      alert(`Image upload failed: ${err?.message || 'Storage error'}`);
    }
  };

  // Hero Highlighted Products Helpers
  const toggleHeroHighlightProduct = (productId: string) => {
    setConfig(prev => {
      const exists = prev.hero.highlightedProductIds.includes(productId);
      const nextIds = exists
        ? prev.hero.highlightedProductIds.filter(id => id !== productId)
        : [...prev.hero.highlightedProductIds, productId];
      return {
        ...prev,
        hero: {
          ...prev.hero,
          mode: nextIds.length > 0 ? 'custom' : prev.hero.mode,
          highlightedProductIds: nextIds,
        },
      };
    });
  };

  const makePrimaryHeroProduct = (productId: string) => {
    setConfig(prev => {
      const filtered = prev.hero.highlightedProductIds.filter(id => id !== productId);
      return {
        ...prev,
        hero: {
          ...prev.hero,
          mode: 'custom',
          highlightedProductIds: [productId, ...filtered],
        },
      };
    });
  };

  const moveHeroProduct = (index: number, direction: 'up' | 'down') => {
    setConfig(prev => {
      const list = [...prev.hero.highlightedProductIds];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= list.length) return prev;
      const temp = list[index];
      list[index] = list[targetIndex];
      list[targetIndex] = temp;
      return {
        ...prev,
        hero: { ...prev.hero, highlightedProductIds: list },
      };
    });
  };

  const handleSelectSpotlightProduct = (productId: string) => {
    const found = products.find(p => p.id === productId);
    if (!found) {
      setConfig(prev => ({
        ...prev,
        spotlight: { ...prev.spotlight, productId: '' },
      }));
      return;
    }
    setConfig(prev => ({
      ...prev,
      sections: { ...prev.sections, showSpotlightProduct: true },
      spotlight: {
        ...prev.spotlight,
        enabled: true,
        productId: found.id,
        customName: found.name,
        customModel: found.model_number,
        customDescription: found.short_description,
        customImage: found.main_image,
        customSlug: found.slug,
      },
    }));
  };

  const highlightedHeroProducts = config.hero.highlightedProductIds
    .map(id => products.find(p => p.id === id))
    .filter((p): p is Product => Boolean(p));

  const filteredCatalogProducts = products.filter(p => {
    const q = productSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      (p.model_number || '').toLowerCase().includes(q) ||
      (p.category_tag || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 font-sans text-slate-100">
      {/* Header */}
      <header className="p-8 lg:p-10 rounded-[2.5rem] bg-gradient-to-br from-[#0F172A] via-[#0D1527] to-[#0A0F1D] border border-blue-500/15 shadow-2xl flex flex-col xl:flex-row xl:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400">
              Command Nexus · Homepage Master Control
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Homepage <span className="text-cyan-400 italic">Control Center.</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm font-medium max-w-2xl">
            Control every section of your Home page, handpick &amp; reorder custom highlighted products for the Hero slider, configure a Featured Spotlight product banner, and customize homepage copy.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <Link
            to="/"
            target="_blank"
            className="px-5 py-3.5 bg-[#0A0F1D] hover:bg-[#131F38] border border-[#1E2E50] rounded-2xl text-[10px] font-bold uppercase tracking-widest text-slate-300 hover:text-cyan-300 flex items-center gap-2 transition-all shadow-md"
          >
            <ExternalLink size={14} className="text-cyan-400" /> Preview Live
          </Link>
          <button
            type="button"
            onClick={() => handleSaveConfig()}
            disabled={isSaving}
            className="px-7 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-2xl text-[11px] font-bold uppercase tracking-wider shadow-lg shadow-blue-500/25 flex items-center gap-2.5 transition-all cursor-pointer"
          >
            {isSaving ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}
            <span>{isSaving ? 'Saving Changes...' : 'Save Homepage Settings'}</span>
          </button>
        </div>
      </header>

      {saveSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-emerald-300 shadow-md"
        >
          <div className="flex items-center gap-3 text-xs font-bold">
            <CheckCircle2 size={18} className="text-emerald-400" />
            <span>Homepage configuration and custom highlighted products saved! Changes are now live on the Home page.</span>
          </div>
          <Link to="/" className="text-xs font-black uppercase tracking-wider underline text-white">
            View Homepage &rarr;
          </Link>
        </motion.div>
      )}

      {/* Navigation Tabs */}
      <nav className="flex flex-wrap gap-2 bg-[#0D1527]/90 p-2 rounded-2xl border border-[#182642] shadow-lg">
        {[
          { id: 'highlighted', label: '1. Hero Highlighted Products', icon: <Star size={14} /> },
          { id: 'spotlight', label: '2. Product Spotlight Banner', icon: <Sparkles size={14} /> },
          { id: 'sections', label: '3. Section Visibility & Copy', icon: <Layers size={14} /> },
          { id: 'corporate', label: '4. Corporate Cards & Quotes', icon: <Building2 size={14} /> },
          { id: 'videos', label: '5. Video Showcase', icon: <Tv size={14} /> },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as ControlTab)}
            className={`px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white hover:bg-[#121B30]'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {/* TAB 1: HERO HIGHLIGHTED PRODUCTS */}
        {activeTab === 'highlighted' && (
          <motion.div
            key="tab-highlighted"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-10"
          >
            {/* Mode Selector Card */}
            <div className="p-8 bg-white/[0.02] border border-white/10 rounded-[2.5rem] space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    Hero Slider &amp; Carousel Product Display Mode
                  </h2>
                  <p className="text-xs text-slate-400 font-medium mt-1">
                    Choose whether the Homepage Hero Slider displays all published products automatically or only your handpicked Custom Highlighted Products in your exact chosen order.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setConfig(prev => ({
                        ...prev,
                        hero: { ...prev.hero, mode: 'all' },
                      }))
                    }
                    className={`px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer ${
                      config.hero.mode === 'all'
                        ? 'bg-white text-black border-white'
                        : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                    }`}
                  >
                    Show All Products (Auto)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setConfig(prev => ({
                        ...prev,
                        hero: { ...prev.hero, mode: 'custom' },
                      }))
                    }
                    className={`px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 transition-all cursor-pointer ${
                      config.hero.mode === 'custom'
                        ? 'bg-amber-400 text-black border-amber-400 shadow-lg shadow-amber-500/20'
                        : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                    }`}
                  >
                    <Star size={14} />
                    <span>Show Custom Highlighted Products ({highlightedHeroProducts.length})</span>
                  </button>
                </div>
              </div>

              {/* Also sync to 3D Carousel option */}
              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <span className="text-xs text-slate-300 font-bold">
                  3D Featured Products Carousel Display Mode:
                </span>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setConfig(prev => ({
                        ...prev,
                        carousel: { ...prev.carousel, mode: 'all' },
                      }))
                    }
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border cursor-pointer ${
                      config.carousel.mode === 'all'
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-white/5 text-slate-400 border-white/10'
                    }`}
                  >
                    All Published Products
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setConfig(prev => ({
                        ...prev,
                        carousel: { ...prev.carousel, mode: 'highlighted_only' },
                      }))
                    }
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border cursor-pointer ${
                      config.carousel.mode === 'highlighted_only'
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-white/5 text-slate-400 border-white/10'
                    }`}
                  >
                    Only Hero Highlighted Products
                  </button>
                </div>
              </div>
            </div>

            {/* Active Highlighted Products Queue (Ordered) */}
            <div className="p-8 bg-gradient-to-br from-blue-950/30 via-[#0a0f18] to-slate-950 border border-blue-500/25 rounded-[2.5rem] space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Star className="text-amber-400 fill-amber-400" size={22} />
                  <div>
                    <h3 className="text-xl font-black text-white tracking-tight">
                      Pinned Homepage Hero Products ({highlightedHeroProducts.length})
                    </h3>
                    <p className="text-xs text-slate-400">
                      Slide #1 appears first when visitors open your website. Reorder slides or add a custom promotional badge for each highlighted product.
                    </p>
                  </div>
                </div>
              </div>

              {highlightedHeroProducts.length === 0 ? (
                <div className="p-10 rounded-3xl bg-black/40 border border-dashed border-white/10 text-center space-y-2">
                  <p className="text-sm font-bold text-slate-300">
                    No custom highlighted products pinned yet.
                  </p>
                  <p className="text-xs text-slate-500">
                    Click &ldquo;Highlight on Hero&rdquo; or &ldquo;Make #1 Slide&rdquo; on any product below to pin it to your Home page!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {highlightedHeroProducts.map((prod, idx) => (
                    <div
                      key={prod.id}
                      className="p-4 sm:p-5 rounded-2xl bg-black/60 border border-white/10 flex flex-col lg:flex-row items-center justify-between gap-5"
                    >
                      <div className="flex items-center gap-4 w-full lg:w-auto">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                          idx === 0
                            ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20'
                            : 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                        }`}>
                          #{idx + 1}
                        </div>
                        <div className="w-16 h-16 rounded-xl bg-white p-1.5 shrink-0 flex items-center justify-center">
                          <img
                            src={prod.main_image}
                            alt={prod.name}
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            {idx === 0 && (
                              <span className="px-2.5 py-0.5 bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[9px] font-black uppercase tracking-widest rounded-full">
                                Primary #1 Slide
                              </span>
                            )}
                            <span className="text-[10px] font-mono text-blue-400 font-bold">
                              {prod.model_number}
                            </span>
                          </div>
                          <h4 className="text-base font-black text-white truncate mt-0.5">
                            {prod.name}
                          </h4>
                          <p className="text-xs text-slate-400 truncate max-w-md">
                            {prod.short_description}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto justify-end">
                        <input
                          type="text"
                          placeholder="Custom Badge (e.g. #1 Bestseller / Special Offer)"
                          className="w-full sm:w-64 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-amber-300 placeholder:text-slate-600 outline-none focus:border-amber-400"
                          value={config.hero.productCustomBadges[prod.id] || ''}
                          onChange={e =>
                            setConfig(prev => ({
                              ...prev,
                              hero: {
                                ...prev.hero,
                                productCustomBadges: {
                                  ...prev.hero.productCustomBadges,
                                  [prod.id]: e.target.value,
                                },
                              },
                            }))
                          }
                        />

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveHeroProduct(idx, 'up')}
                            className="p-2.5 bg-white/5 hover:bg-white/15 disabled:opacity-30 rounded-xl text-slate-300 cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp size={15} />
                          </button>
                          <button
                            type="button"
                            disabled={idx === highlightedHeroProducts.length - 1}
                            onClick={() => moveHeroProduct(idx, 'down')}
                            className="p-2.5 bg-white/5 hover:bg-white/15 disabled:opacity-30 rounded-xl text-slate-300 cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleHeroHighlightProduct(prod.id)}
                            className="p-2.5 bg-rose-500/15 hover:bg-rose-500 text-rose-400 hover:text-white rounded-xl transition-all cursor-pointer"
                            title="Remove from Highlighted"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Catalog Picker to Select Products to Highlight */}
            <div className="p-8 bg-white/[0.02] border border-white/10 rounded-[2.5rem] space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-white">
                    Select Products from Catalog to Highlight on Homepage
                  </h3>
                  <p className="text-xs text-slate-400">
                    Click any product to add it to your Homepage Hero Slider or make it your #1 Featured Product.
                  </p>
                </div>

                <div className="relative w-full md:w-80">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full pl-11 pr-4 py-3 bg-black/60 border border-white/10 rounded-xl text-xs font-bold text-white placeholder:text-slate-600 outline-none focus:border-blue-500"
                    value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredCatalogProducts.map(prod => {
                  const isHighlighted = config.hero.highlightedProductIds.includes(prod.id);
                  const isFirst = config.hero.highlightedProductIds[0] === prod.id;

                  return (
                    <div
                      key={prod.id}
                      className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                        isHighlighted
                          ? 'bg-blue-600/10 border-blue-500/50'
                          : 'bg-black/40 border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-white p-1.5 shrink-0 flex items-center justify-center">
                          <img
                            src={prod.main_image}
                            alt={prod.name}
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest block truncate">
                            {prod.category_tag} · {prod.model_number}
                          </span>
                          <h4 className="text-sm font-black text-white truncate mt-0.5">
                            {prod.name}
                          </h4>
                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                            {prod.short_description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                        <button
                          type="button"
                          onClick={() => toggleHeroHighlightProduct(prod.id)}
                          className={`flex-1 py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                            isHighlighted
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500 hover:text-white'
                              : 'bg-blue-600 text-white hover:bg-blue-500'
                          }`}
                        >
                          {isHighlighted ? 'Remove Highlight' : '+ Highlight on Hero'}
                        </button>

                        {!isFirst && (
                          <button
                            type="button"
                            onClick={() => makePrimaryHeroProduct(prod.id)}
                            className="py-2.5 px-3 rounded-xl bg-amber-400/15 hover:bg-amber-400 text-amber-300 hover:text-black border border-amber-400/30 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                            title="Pin as #1 First Product on Homepage"
                          >
                            Make #1 Slide
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: DEDICATED CUSTOM PRODUCT SPOTLIGHT BANNER */}
        {activeTab === 'spotlight' && (
          <motion.div
            key="tab-spotlight"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-8 bg-white/[0.02] border border-white/10 rounded-[2.5rem] space-y-8 max-w-5xl"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-6">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block">
                  Custom Highlighted Product Section
                </span>
                <h2 className="text-2xl font-black text-white">
                  Dedicated Flagship Product Spotlight Banner
                </h2>
                <p className="text-xs text-slate-400">
                  Show a large, dedicated &ldquo;Highlighted Product Spotlight&rdquo; showcase on the Home page to promote your #1 flagship equipment or special offer.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setConfig(prev => {
                    const nextState = !prev.sections.showSpotlightProduct;
                    return {
                      ...prev,
                      sections: { ...prev.sections, showSpotlightProduct: nextState },
                      spotlight: { ...prev.spotlight, enabled: nextState },
                    };
                  })
                }
                className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all cursor-pointer ${
                  config.sections.showSpotlightProduct
                    ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                    : 'bg-white/5 text-slate-400 border border-white/10'
                }`}
              >
                {config.sections.showSpotlightProduct ? <Eye size={16} /> : <EyeOff size={16} />}
                <span>
                  {config.sections.showSpotlightProduct
                    ? 'Spotlight Banner: VISIBLE ON HOMEPAGE'
                    : 'Spotlight Banner: HIDDEN'}
                </span>
              </button>
            </div>

            {/* Quick Select Existing Product */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest block">
                Quick-Fill from Existing Catalog Product (or customize manually below)
              </label>
              <select
                className="w-full px-5 py-4 bg-black/60 border border-white/15 rounded-2xl text-sm font-bold text-white outline-none focus:border-blue-500 cursor-pointer"
                value={config.spotlight.productId || ''}
                onChange={e => handleSelectSpotlightProduct(e.target.value)}
              >
                <option value="">-- Custom / Select a Product to Auto-Fill --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.model_number}) — {p.category_tag}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  Spotlight Top Badge
                </label>
                <input
                  type="text"
                  className="w-full px-5 py-3.5 bg-black/60 border border-white/10 rounded-xl text-xs font-bold text-amber-300 outline-none focus:border-blue-500"
                  value={config.spotlight.badge}
                  onChange={e =>
                    setConfig(prev => ({
                      ...prev,
                      spotlight: { ...prev.spotlight, badge: e.target.value },
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  Price / Offer Tag
                </label>
                <input
                  type="text"
                  className="w-full px-5 py-3.5 bg-black/60 border border-white/10 rounded-xl text-xs font-bold text-emerald-400 outline-none focus:border-blue-500"
                  value={config.spotlight.priceTag}
                  onChange={e =>
                    setConfig(prev => ({
                      ...prev,
                      spotlight: { ...prev.spotlight, priceTag: e.target.value },
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  Highlighted Product Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., VistaPano S 2.0 Panoramic X-Ray System"
                  className="w-full px-5 py-3.5 bg-black/60 border border-white/10 rounded-xl text-sm font-black text-white outline-none focus:border-blue-500"
                  value={config.spotlight.customName}
                  onChange={e =>
                    setConfig(prev => ({
                      ...prev,
                      spotlight: { ...prev.spotlight, customName: e.target.value },
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  Model Number
                </label>
                <input
                  type="text"
                  placeholder="e.g., DURR-VP-S2.0"
                  className="w-full px-5 py-3.5 bg-black/60 border border-white/10 rounded-xl text-xs font-mono font-bold text-blue-400 outline-none focus:border-blue-500"
                  value={config.spotlight.customModel}
                  onChange={e =>
                    setConfig(prev => ({
                      ...prev,
                      spotlight: { ...prev.spotlight, customModel: e.target.value },
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                Highlighted Product Description
              </label>
              <textarea
                rows={3}
                className="w-full px-5 py-3.5 bg-black/60 border border-white/10 rounded-xl text-xs font-medium text-slate-200 outline-none focus:border-blue-500"
                value={config.spotlight.customDescription}
                onChange={e =>
                  setConfig(prev => ({
                    ...prev,
                    spotlight: { ...prev.spotlight, customDescription: e.target.value },
                  }))
                }
              />
            </div>

            {/* Spotlight Image */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-6 bg-black/40 rounded-2xl border border-white/10">
              <div className="md:col-span-8 space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  Spotlight Product Image URL (or Upload Image)
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="https://..."
                    className="flex-1 px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-xs font-mono text-blue-300 outline-none"
                    value={config.spotlight.customImage}
                    onChange={e =>
                      setConfig(prev => ({
                        ...prev,
                        spotlight: { ...prev.spotlight, customImage: e.target.value },
                      }))
                    }
                  />
                  <button
                    type="button"
                    onClick={() => spotlightImageInputRef.current?.click()}
                    className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shrink-0 cursor-pointer"
                  >
                    <Upload size={14} /> Upload
                  </button>
                  <input
                    ref={spotlightImageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleSpotlightImageUpload}
                  />
                </div>
              </div>
              <div className="md:col-span-4 flex justify-center">
                {config.spotlight.customImage ? (
                  <img
                    src={config.spotlight.customImage}
                    alt="Spotlight preview"
                    className="h-28 w-auto object-contain bg-white p-2 rounded-xl"
                  />
                ) : (
                  <div className="h-28 w-full rounded-xl border border-dashed border-white/10 flex items-center justify-center text-xs text-slate-600">
                    No Image Selected
                  </div>
                )}
              </div>
            </div>

            {/* Key Highlight Bullet Points */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                Key Highlight Bullet Points (3 Points)
              </label>
              <div className="space-y-3">
                {[0, 1, 2].map(idx => (
                  <input
                    key={idx}
                    type="text"
                    placeholder={`Highlight point #${idx + 1}`}
                    className="w-full px-5 py-3 bg-black/60 border border-white/10 rounded-xl text-xs font-bold text-white outline-none focus:border-blue-500"
                    value={config.spotlight.bullets[idx] || ''}
                    onChange={e => {
                      const nextBullets = [...config.spotlight.bullets];
                      nextBullets[idx] = e.target.value;
                      setConfig(prev => ({
                        ...prev,
                        spotlight: { ...prev.spotlight, bullets: nextBullets },
                      }));
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: SECTION VISIBILITY & HERO TEXT */}
        {activeTab === 'sections' && (
          <motion.div
            key="tab-sections"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Section Visibility Toggles */}
            <div className="p-8 bg-white/[0.02] border border-white/10 rounded-[2.5rem] space-y-6">
              <div>
                <h3 className="text-xl font-black text-white">
                  Homepage Section Visibility Toggles
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Turn individual sections of the Home page ON or OFF anytime.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { key: 'showHeroSlider', label: '1. Main Hero Product Slider Section' },
                  { key: 'showSpotlightProduct', label: '2. Custom Highlighted Product Spotlight Banner' },
                  { key: 'showCorporateCards', label: '3. "Why Choose Carelink" Corporate Cards Section' },
                  { key: 'showFeaturedCarousel', label: '4. Featured Products 3D Depth Carousel' },
                  { key: 'showVideoShowcase', label: '5. Watch Equipment Demos (Video Showcase)' },
                  { key: 'showQuoteWizard', label: '6. Request Your Equipment Quote Form' },
                  { key: 'showLatestBlogs', label: '7. Latest News & Articles Section' },
                ].map(sec => {
                  const isOn = (config.sections as any)[sec.key];
                  return (
                    <div
                      key={sec.key}
                      className="p-4 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-between gap-4"
                    >
                      <span className="text-xs font-bold text-white">{sec.label}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setConfig(prev => ({
                            ...prev,
                            sections: {
                              ...prev.sections,
                              [sec.key]: !isOn,
                            },
                          }))
                        }
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                          isOn
                            ? 'bg-emerald-500 text-black'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {isOn ? 'VISIBLE' : 'HIDDEN'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Hero Texts & Carousel Headers */}
            <div className="p-8 bg-white/[0.02] border border-white/10 rounded-[2.5rem] space-y-6">
              <div>
                <h3 className="text-xl font-black text-white">
                  Hero Slider &amp; Carousel Labels
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Customize badges, button labels, and headings for the Hero and Featured Products sections.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                    Hero Top Badge Text
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-xs font-bold text-white outline-none"
                    value={config.hero.distributorBadgeText}
                    onChange={e =>
                      setConfig(prev => ({
                        ...prev,
                        hero: { ...prev.hero, distributorBadgeText: e.target.value },
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                    Hero Default Image Badge
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-xs font-bold text-white outline-none"
                    value={config.hero.priceTagText}
                    onChange={e =>
                      setConfig(prev => ({
                        ...prev,
                        hero: { ...prev.hero, priceTagText: e.target.value },
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                    Hero Primary Button Label
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-xs font-bold text-white outline-none"
                    value={config.hero.primaryBtnText}
                    onChange={e =>
                      setConfig(prev => ({
                        ...prev,
                        hero: { ...prev.hero, primaryBtnText: e.target.value },
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                    Hero Secondary Button Label
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-xs font-bold text-white outline-none"
                    value={config.hero.secondaryBtnText}
                    onChange={e =>
                      setConfig(prev => ({
                        ...prev,
                        hero: { ...prev.hero, secondaryBtnText: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-4">
                <h4 className="text-sm font-black text-blue-400 uppercase tracking-wider">
                  Featured Products Carousel Heading
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Title (Main)</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-xs font-bold text-white outline-none"
                      value={config.carousel.titleMain}
                      onChange={e =>
                        setConfig(prev => ({
                          ...prev,
                          carousel: { ...prev.carousel, titleMain: e.target.value },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Title (Blue Italic)</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-xs font-bold text-blue-400 outline-none"
                      value={config.carousel.titleAccent}
                      onChange={e =>
                        setConfig(prev => ({
                          ...prev,
                          carousel: { ...prev.carousel, titleAccent: e.target.value },
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Carousel Subtitle</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-xs font-medium text-slate-300 outline-none"
                    value={config.carousel.subtitle}
                    onChange={e =>
                      setConfig(prev => ({
                        ...prev,
                        carousel: { ...prev.carousel, subtitle: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 4: CORPORATE CARDS & QUOTE SECTION */}
        {activeTab === 'corporate' && (
          <motion.div
            key="tab-corporate"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {/* Corporate Section Header & 4 Cards */}
            <div className="p-8 bg-white/[0.02] border border-white/10 rounded-[2.5rem] space-y-6">
              <h3 className="text-xl font-black text-white">
                &ldquo;Why Choose Carelink&rdquo; Corporate Section &amp; 4 Value Cards
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Eyebrow Label</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-xs font-bold text-blue-400 outline-none"
                    value={config.corporate.eyebrow}
                    onChange={e =>
                      setConfig(prev => ({
                        ...prev,
                        corporate: { ...prev.corporate, eyebrow: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Heading Main</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-xs font-bold text-white outline-none"
                    value={config.corporate.titleMain}
                    onChange={e =>
                      setConfig(prev => ({
                        ...prev,
                        corporate: { ...prev.corporate, titleMain: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Heading Accent</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-xs font-bold text-blue-400 outline-none"
                    value={config.corporate.titleAccent}
                    onChange={e =>
                      setConfig(prev => ({
                        ...prev,
                        corporate: { ...prev.corporate, titleAccent: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Section Subtitle</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-xs font-medium text-slate-300 outline-none"
                  value={config.corporate.subtitle}
                  onChange={e =>
                    setConfig(prev => ({
                      ...prev,
                      corporate: { ...prev.corporate, subtitle: e.target.value },
                    }))
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                {config.corporate.cards.map((card, idx) => (
                  <div key={idx} className="p-5 bg-black/50 border border-white/10 rounded-2xl space-y-3">
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
                      Card #{idx + 1}
                    </span>
                    <input
                      type="text"
                      placeholder="Card Title"
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white outline-none"
                      value={card.title}
                      onChange={e => {
                        const nextCards = [...config.corporate.cards];
                        nextCards[idx] = { ...nextCards[idx], title: e.target.value };
                        setConfig(prev => ({
                          ...prev,
                          corporate: { ...prev.corporate, cards: nextCards },
                        }));
                      }}
                    />
                    <textarea
                      rows={2}
                      placeholder="Card Description"
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-slate-300 outline-none"
                      value={card.description}
                      onChange={e => {
                        const nextCards = [...config.corporate.cards];
                        nextCards[idx] = { ...nextCards[idx], description: e.target.value };
                        setConfig(prev => ({
                          ...prev,
                          corporate: { ...prev.corporate, cards: nextCards },
                        }));
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Footer Highlight Text"
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[11px] font-bold text-emerald-400 outline-none"
                      value={card.footerText}
                      onChange={e => {
                        const nextCards = [...config.corporate.cards];
                        nextCards[idx] = { ...nextCards[idx], footerText: e.target.value };
                        setConfig(prev => ({
                          ...prev,
                          corporate: { ...prev.corporate, cards: nextCards },
                        }));
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Quote Request Wizard Text */}
            <div className="p-8 bg-white/[0.02] border border-white/10 rounded-[2.5rem] space-y-6">
              <h3 className="text-xl font-black text-white">
                Homepage Equipment Quote Request Section Text
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Eyebrow</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-xs font-bold text-blue-400 outline-none"
                    value={config.quote.eyebrow}
                    onChange={e =>
                      setConfig(prev => ({
                        ...prev,
                        quote: { ...prev.quote, eyebrow: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Title Line 1</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-xs font-bold text-white outline-none"
                    value={config.quote.titleLine1}
                    onChange={e =>
                      setConfig(prev => ({
                        ...prev,
                        quote: { ...prev.quote, titleLine1: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Title Accent</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-xs font-bold text-blue-400 outline-none"
                    value={config.quote.titleAccent}
                    onChange={e =>
                      setConfig(prev => ({
                        ...prev,
                        quote: { ...prev.quote, titleAccent: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Description</label>
                <textarea
                  rows={2}
                  className="w-full px-4 py-3 bg-black/60 border border-white/10 rounded-xl text-xs text-slate-300 outline-none"
                  value={config.quote.description}
                  onChange={e =>
                    setConfig(prev => ({
                      ...prev,
                      quote: { ...prev.quote, description: e.target.value },
                    }))
                  }
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 5: HOMEPAGE VIDEO SHOWCASE MANAGER */}
        {activeTab === 'videos' && (
          <motion.div
            key="tab-videos"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <AdminVideoManager />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
