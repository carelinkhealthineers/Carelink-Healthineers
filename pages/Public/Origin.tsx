import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Zap, Globe, 
  ArrowUpRight, HeartPulse, Scan,
  Hexagon, ArrowRight, Database,
  Headphones, Cpu, Check, FileText,
  Building2, User, Mail, DollarSign,
  TrendingUp, Award, Clock, ArrowRightLeft,
  ChevronRight, Percent, Flame, Sliders,
  Gauge, Info, ShieldAlert, RefreshCw, CheckCircle2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { SEO } from '../../components/SEO';
import { HomepageVideoShowcase } from '../../components/HomepageVideoShowcase';
import { supabase } from '../../supabaseClient';
import { Product, Blog } from '../../types';

// Default high-fidelity product catalog in case DB values are not yet fully populated
const FALLBACK_PRODUCTS: Product[] = [
  {
    id: "fb1",
    division_id: "div-imaging",
    name: "Magnetom Lumina 3.0T MRI",
    model_number: "SIEMENS-ML-3T",
    slug: "magnetom-lumina-3t",
    short_description: "Deep-tissue diagnostic MRI scanner featuring BioMatrix patient personalization.",
    long_description: "A premium clinical 3 Tesla MRI scanner delivering exceptional diagnostic resolution, shorter scanning times, and direct HL7 system synchronization.",
    main_image: "https://vrtipkxoldcqhtvznpok.supabase.co/storage/v1/object/public/products/uploads/Extron%207_921_5e39e.png",
    image_gallery: [],
    category_tag: "Imaging & Radiology",
    technical_specs: {
      "Field Strength": "3.0 Tesla Superconductive",
      "Gantry Bore": "70cm Open-Comfort Bore",
      "Gradient Spec": "45 mT/m @ 200 T/m/s",
      "Personalization": "BioMatrix Sensors",
      "Power Grid": "380-480V 3-Phase",
      "Helium Boil-Off": "Zero Boil-Off Guarantee",
      "Distributor": "Dürr Dental Partner"
    },
    is_published: true,
    created_at: "2026-07-18"
  },
  {
    id: "fb2",
    division_id: "div-diagnostics",
    name: "BeneVision N22 Patient Monitor",
    model_number: "MINDRAY-BV-N22",
    slug: "benevision-n22",
    short_description: "Ultra-high density patient vital telemetry for intensive care departments.",
    long_description: "Advanced multi-touch critical care monitoring solution with seamless electronic medical record (EMR) integration and real-time hemodynamic indices.",
    main_image: "https://vrtipkxoldcqhtvznpok.supabase.co/storage/v1/object/public/products/uploads/931_a8698%20(2).png",
    image_gallery: [],
    category_tag: "ICU Care Systems",
    technical_specs: {
      "Display Area": "22-inch Rotatable Touch Screen",
      "Data Sync": "Native HL7 / FHIR Protocols",
      "Battery Reserve": "4h High-Capacity Li-Ion",
      "Vital Channels": "64 Live Waveforms",
      "ECG Resolution": "Real-time 12-lead Analysis",
      "Compliance": "Dürr Dental Certified"
    },
    is_published: true,
    created_at: "2026-07-18"
  },
  {
    id: "fb3",
    division_id: "div-surgical",
    name: "C-Arm Mobile Surgical Imaging",
    model_number: "PHILIPS-CA-S20",
    slug: "c-arm-surgical-imaging",
    short_description: "High-frequency surgical imaging console designed for operating suites.",
    long_description: "Mobile surgical C-arm with high-frequency generator and flat detector to support seamless, real-time vascular, orthopedic, and general surgical procedures.",
    main_image: "https://vrtipkxoldcqhtvznpok.supabase.co/storage/v1/object/public/products/uploads/6.Software-03_8675f.png",
    image_gallery: [],
    category_tag: "Surgical Infrastructure",
    technical_specs: {
      "Generator Rating": "20 kW High Frequency Output",
      "Panel Detector": "Amorphous Silicon Flat Panel",
      "Active Cooling": "Bilateral Anode Oil Circulation",
      "Dosage Mode": "Pulse-Dose Radiation Reduction",
      "Laser Guide": "Dual Red Target Positioning",
      "Support": "Direct Distributor Service"
    },
    is_published: true,
    created_at: "2026-07-18"
  }
];

export const Origin: React.FC = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [latestBlogs, setLatestBlogs] = useState<Blog[]>([]);
  const [selectedHeroIndex, setSelectedHeroIndex] = useState(0);
  const [isHeroPaused, setIsHeroPaused] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All');

  // Interactive Sourcing Form / Configurator State
  const [configStep, setConfigStep] = useState(1);
  const [configData, setConfigData] = useState({
    facilityType: 'General Hospital',
    interest: 'Imaging & Radiology',
    budgetRange: '1-5 units',
    timeline: 'Within 3 Months',
    contactName: '',
    contactEmail: '',
    contactOrg: '',
    contactPhone: '',
    notes: ''
  });
  const [configSubmitting, setConfigSubmitting] = useState(false);
  const [configSubmitted, setConfigSubmitted] = useState(false);

  useEffect(() => {
    const loadHomepageData = async () => {
      try {
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .eq('is_published', true)
          .limit(6)
          .order('created_at', { ascending: false });

        if (productsData && productsData.length > 0) {
          // Merge database products with fallback fields to ensure maximum specification density
          const formatted = productsData.map((p, idx) => ({
            ...p,
            technical_specs: p.technical_specs && Object.keys(p.technical_specs).length > 0
              ? p.technical_specs 
              : (FALLBACK_PRODUCTS[idx % 3]?.technical_specs || {})
          }));
          setFeaturedProducts(formatted);
        } else {
          setFeaturedProducts(FALLBACK_PRODUCTS);
        }

        const { data: blogsData } = await supabase
          .from('blogs')
          .select('*')
          .eq('is_published', true)
          .limit(3)
          .order('published_at', { ascending: false });
        if (blogsData) setLatestBlogs(blogsData);
      } catch (err) {
        console.error("Error loading homepage assets:", err);
        setFeaturedProducts(FALLBACK_PRODUCTS);
      }
    };

    loadHomepageData();
  }, []);

  const handleConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfigSubmitting(true);
    
    const formattedMessage = `[Homepage Custom Configurator Sourcing Lead]
- Facility Classification: ${configData.facilityType}
- Sourcing Category Target: ${configData.interest}
- Capital Budget Range: ${configData.budgetRange}
- Delivery Requirement Timeline: ${configData.timeline}
- Callback Phone Number: ${configData.contactPhone}
- Procurement Scope & Notes: ${configData.notes || 'None specified.'}`;

    try {
      const { error } = await supabase.from('inquiries').insert([{
        name: configData.contactName,
        email: configData.contactEmail,
        company: configData.contactOrg,
        message: formattedMessage,
        status: 'pending'
      }]);
      
      if (error) throw error;
      setConfigSubmitted(true);
    } catch (err) {
      console.error("Sourcing configuration submit failed:", err);
    } finally {
      setConfigSubmitting(false);
    }
  };

  // Extract unique categories for catalog filters
  const categories = ['All', ...new Set(featuredProducts.map(p => p.category_tag))];
  const filteredProducts = activeCategoryFilter === 'All' 
    ? featuredProducts 
    : featuredProducts.filter(p => p.category_tag === activeCategoryFilter);

  const heroSlides = (featuredProducts.length > 0 ? featuredProducts : FALLBACK_PRODUCTS).slice(0, 4);
  const currentHeroProduct = heroSlides[selectedHeroIndex % heroSlides.length] || FALLBACK_PRODUCTS[0];
  const highlightedLatestProducts = (featuredProducts.length > 0 ? featuredProducts : FALLBACK_PRODUCTS).slice(0, 2);

  useEffect(() => {
    if (isHeroPaused || heroSlides.length <= 1) return;
    const timer = setInterval(() => {
      setSelectedHeroIndex((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isHeroPaused, heroSlides.length]);

  const handlePrevSlide = () => {
    setSelectedHeroIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const handleNextSlide = () => {
    setSelectedHeroIndex((prev) => (prev + 1) % heroSlides.length);
  };

  return (
    <div className="pt-0 bg-white selection:bg-blue-600 selection:text-white">
      <SEO 
        title="Carelink Healthineers | Direct Medical Equipment Sourcing & Dürr Dental Partner" 
        description="Carelink Healthineers connects healthcare facilities directly with certified medical and dental equipment. Official partner of Dürr Dental, providing direct factory prices, fast delivery, and expert technical support."
        keywords={['medical equipment', 'Dürr Dental', 'dental equipment', 'medical sourcing', 'VistaPano', 'radiology equipment', 'hospital equipment', 'Carelink Healthineers']}
      />
      
      {/* 1. HERO SECTION: CORPORATE EXECUTIVE CAROUSEL & HIGHLIGHTED LATEST PRODUCTS */}
      <section 
        className="relative pt-24 pb-16 md:pt-28 md:pb-20 xl:pt-32 xl:pb-24 bg-white border-b border-slate-200/80 overflow-hidden"
        onMouseEnter={() => setIsHeroPaused(true)}
        onMouseLeave={() => setIsHeroPaused(false)}
      >
        {/* Subtle Architectural Grid & Ambient Illumination */}
        <div className="absolute inset-0 neural-grid opacity-60 pointer-events-none" />
        <div className="absolute top-0 right-0 w-2/3 h-full bg-[radial-gradient(circle_at_75%_35%,rgba(37,99,235,0.05),transparent_65%)] pointer-events-none" />

        <div className="relative z-20 max-w-[1600px] mx-auto px-6 md:px-16 w-full space-y-10">
          
          {/* Top Corporate Bar: Official Distributor + Carousel Slide Counter & Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="inline-flex items-center gap-3">
              <img src="/durr-dental-logo.svg" alt="Dürr Dental Logo" className="h-4 w-auto object-contain" />
              <span className="text-slate-300" aria-hidden="true">|</span>
              <span className="text-xs font-semibold text-blue-600 tracking-wide">
                Official Sovereign Distribution Partner
              </span>
              <span className="hidden sm:inline text-slate-300" aria-hidden="true">·</span>
              <span className="hidden sm:inline text-xs text-slate-500">
                German Clinical Precision Standards
              </span>
            </div>

            {/* Carousel Controls & Slide Indicators */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs font-mono tabular-nums text-slate-500">
                <span className="font-bold text-slate-900">
                  {String((selectedHeroIndex % heroSlides.length) + 1).padStart(2, '0')}
                </span>
                <span>/</span>
                <span>{String(heroSlides.length).padStart(2, '0')}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {heroSlides.map((slide, idx) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => setSelectedHeroIndex(idx)}
                    aria-label={`View slide ${idx + 1}: ${slide.name}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      selectedHeroIndex % heroSlides.length === idx
                        ? 'w-8 bg-blue-600'
                        : 'w-2 bg-slate-200 hover:bg-slate-400'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-1.5 pl-2">
                <button
                  type="button"
                  onClick={handlePrevSlide}
                  aria-label="Previous featured system"
                  className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 flex items-center justify-center transition-colors"
                >
                  <ChevronRight size={15} className="rotate-180" />
                </button>
                <button
                  type="button"
                  onClick={handleNextSlide}
                  aria-label="Next featured system"
                  className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 flex items-center justify-center transition-colors"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* Main Hero Grid: Left Executive Narrative + Right Flagship Carousel & 2 Highlighted Latest Releases */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 xl:gap-14 items-start">
            
            {/* Left Column (5 Cols): Corporate Value Proposition & Highlighted Latest Products */}
            <div className="xl:col-span-5 flex flex-col justify-between space-y-8 text-left">
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <span>Direct Factory Procurement</span>
                  <span aria-hidden="true">·</span>
                  <span>Sub-30 Day Clinical Dispatch</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-normal text-slate-900 tracking-tight leading-[1.08] font-serif-classical">
                  Clinical Infrastructure. <br />
                  <span className="italic text-blue-600 font-serif-classical">Engineered Direct.</span>
                </h1>

                <p className="text-base text-slate-600 max-w-lg leading-relaxed font-sans">
                  Eliminate multi-tier distributor markups. Carelink Healthineers connects hospitals and diagnostic centers directly with certified medical systems, transparent factory pricing, and turnkey clinical deployment.
                </p>

                {/* Primary & Secondary CTAs */}
                <div className="flex flex-col sm:flex-row gap-3.5 pt-1">
                  <a 
                    href="#procurement-wizard"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('procurement-wizard')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-slate-950 text-white font-semibold text-xs tracking-wider uppercase rounded-xl hover:bg-blue-600 transition-colors duration-200 whitespace-nowrap"
                  >
                    Configure Facility Quote <ArrowUpRight size={15} />
                  </a>
                  <a
                    href="#catalog-section"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white border border-slate-200 text-slate-800 font-semibold text-xs tracking-wider uppercase rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors duration-200 whitespace-nowrap"
                  >
                    Explore Portfolio <ArrowRight size={15} />
                  </a>
                </div>
              </div>

              {/* HIGHLIGHTED LATEST PRODUCTS (2 Featured Latest Releases) */}
              <div className="pt-6 border-t border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    <span>Highlighted Latest Releases</span>
                  </div>
                  <Link 
                    to="/portfolio" 
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                  >
                    View all systems <ArrowRight size={12} />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {highlightedLatestProducts.map((latestProd, idx) => {
                    const isCurrentlyActive = currentHeroProduct.id === latestProd.id;
                    return (
                      <div
                        key={latestProd.id}
                        onClick={() => setSelectedHeroIndex(idx)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedHeroIndex(idx);
                          }
                        }}
                        className={`group cursor-pointer p-3.5 rounded-2xl border transition-all duration-200 flex items-center gap-3.5 text-left ${
                          isCurrentlyActive
                            ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                            : 'bg-slate-50/80 hover:bg-white text-slate-900 border-slate-200/90 hover:border-slate-300'
                        }`}
                      >
                        <div className={`w-16 h-16 rounded-xl p-2 shrink-0 flex items-center justify-center border ${
                          isCurrentlyActive ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200/60'
                        }`}>
                          <img
                            src={latestProd.main_image}
                            alt={latestProd.name}
                            referrerPolicy="no-referrer"
                            className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        <div className="min-w-0 flex-1 space-y-1">
                          <div className={`text-[10px] font-medium truncate ${
                            isCurrentlyActive ? 'text-blue-400' : 'text-blue-600'
                          }`}>
                            Latest Release · {latestProd.category_tag.split(' ')[0]}
                          </div>
                          <h3 className={`text-xs font-bold truncate ${
                            isCurrentlyActive ? 'text-white' : 'text-slate-900'
                          }`}>
                            {latestProd.name.replace("Newelectrosurgical", "New Electrosurgical")}
                          </h3>
                          <div className="flex items-center justify-between pt-0.5">
                            <span className={`text-[10px] font-mono tabular-nums truncate ${
                              isCurrentlyActive ? 'text-slate-300' : 'text-slate-500'
                            }`}>
                              {latestProd.model_number}
                            </span>
                            <Link
                              to={`/portfolio/${latestProd.slug}`}
                              onClick={(e) => e.stopPropagation()}
                              className={`text-[10px] font-semibold underline underline-offset-2 whitespace-nowrap ${
                                isCurrentlyActive ? 'text-white hover:text-blue-300' : 'text-slate-700 hover:text-blue-600'
                              }`}
                            >
                              Specs
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column (7 Cols): Corporate Flagship Interactive Carousel Stage */}
            <div className="xl:col-span-7 w-full">
              <div className="bg-slate-950 text-white rounded-[2rem] border border-slate-800 p-6 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden">
                
                {/* Subtle Top Slide Selector Bar */}
                <div className="flex items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-800/90 overflow-x-auto no-scrollbar">
                  <div className="flex items-center gap-1.5">
                    {heroSlides.map((prod, idx) => {
                      const active = selectedHeroIndex % heroSlides.length === idx;
                      return (
                        <button
                          key={prod.id}
                          type="button"
                          onClick={() => setSelectedHeroIndex(idx)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                            active
                              ? 'bg-blue-600 text-white'
                              : 'text-slate-400 hover:text-white hover:bg-slate-900'
                          }`}
                        >
                          <span className="font-mono tabular-nums mr-1.5 opacity-70">
                            0{idx + 1}.
                          </span>
                          {prod.name.includes("Newelectrosurgical")
                            ? "Electrosurgical"
                            : prod.name.split(' ').slice(0, 2).join(' ')}
                        </button>
                      );
                    })}
                  </div>

                  <span className="hidden sm:inline-block text-[11px] font-mono tabular-nums text-slate-400 shrink-0">
                    {currentHeroProduct.model_number}
                  </span>
                </div>

                {/* Animated Slide Content */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentHeroProduct.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
                  >
                    {/* Visual Showcase Box (7 of 12 cols inside stage) */}
                    <div className="lg:col-span-7 relative">
                      <div className="h-64 sm:h-80 w-full rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/80 p-6 flex items-center justify-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.12),transparent_70%)] pointer-events-none" />
                        <img
                          src={currentHeroProduct.main_image}
                          alt={currentHeroProduct.name}
                          referrerPolicy="no-referrer"
                          className="relative z-10 max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute bottom-3.5 left-4 right-4 flex items-center justify-between text-[11px] text-slate-400">
                          <span>{currentHeroProduct.category_tag}</span>
                          <span className="text-emerald-400 font-medium">Direct Factory Allocation</span>
                        </div>
                      </div>
                    </div>

                    {/* Product Executive Dossier & Telemetry (5 of 12 cols inside stage) */}
                    <div className="lg:col-span-5 flex flex-col justify-between space-y-5">
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2 text-xs text-blue-400 font-medium">
                          <span>Featured Clinical System</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">
                            0{(selectedHeroIndex % heroSlides.length) + 1}
                          </span>
                        </div>

                        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                          {currentHeroProduct.name.replace("Newelectrosurgical", "New Electrosurgical")}
                        </h2>

                        <p className="text-slate-400 text-xs sm:text-sm leading-relaxed line-clamp-3">
                          {currentHeroProduct.short_description}
                        </p>
                      </div>

                      {/* Key Technical Specifications */}
                      <div className="border-t border-b border-slate-800/90 py-3.5 space-y-2">
                        {Object.entries(currentHeroProduct.technical_specs || {})
                          .slice(0, 3)
                          .map(([k, v], i) => (
                            <div key={i} className="flex items-center justify-between gap-2 text-xs">
                              <span className="text-slate-400 truncate">{k}</span>
                              <span className="text-slate-100 font-mono tabular-nums font-semibold text-right truncate max-w-[150px]">
                                {v}
                              </span>
                            </div>
                          ))}
                      </div>

                      {/* Slide Action Buttons */}
                      <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 pt-1">
                        <Link
                          to={`/acquisition?product=${encodeURIComponent(currentHeroProduct.name)}`}
                          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                          Request Factory Quote <ArrowUpRight size={14} />
                        </Link>
                        <Link
                          to={`/portfolio/${currentHeroProduct.slug}`}
                          className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                          Technical Dossier <FileText size={13} className="text-slate-400" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

              </div>
            </div>

          </div>

        </div>

      </section>

      {/* 2. SPECIFICATION & PRICING TRANSPARENCY BENTO GRID */}
      <section className="py-24 bg-slate-50 border-t border-b border-slate-200/60 relative">
        <div className="max-w-[1600px] mx-auto px-6 md:px-16 space-y-12">
          
          <header className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
            <div className="space-y-4">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block">OUR CORE PROMISE</span>
              <h2 className="text-3xl md:text-5xl font-normal text-slate-900 tracking-tight font-serif-classical">
                Why Choose <span className="text-blue-600 font-serif-classical italic">Carelink</span>
              </h2>
            </div>
            <p className="text-slate-500 text-sm md:text-base max-w-md font-medium leading-relaxed">
              We streamline logistics, quality inspections, and direct factory communications to guarantee complete equipment support.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Bento Card 1: Direct Factory Sourcing */}
            <div className="p-8 bg-white border border-slate-200 rounded-3xl flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                  <Award size={22} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Direct Sourcing</h3>
                <p className="text-slate-500 text-xs font-medium leading-relaxed">
                  Carelink connects healthcare providers directly with certified distributor lines, optimizing delivery speed and supply security.
                </p>
              </div>
              <div className="pt-6 border-t border-slate-100 text-[10px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1.5 mt-6">
                <TrendingUp size={14} /> Certified Partners
              </div>
            </div>

            {/* Bento Card 2: Dürr Dental Official Distributor */}
            <div className="p-8 bg-white border border-blue-200/80 rounded-3xl flex flex-col justify-between shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center shadow-xs">
                    <img src="/durr-dental-logo.svg" alt="Dürr Dental" className="h-6 w-auto object-contain" />
                  </div>
                  <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full uppercase tracking-wider border border-blue-100">
                    Official Distributor
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Dürr Dental Quality Standards</h3>
                <p className="text-slate-500 text-xs font-medium leading-relaxed">
                  Every asset is engineered, tested, and calibrated in direct partnership with Dürr Dental according to German precision clinical standards before dispatch.
                </p>
              </div>
              <div className="pt-6 border-t border-slate-100 text-[10px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1.5 mt-6">
                ✓ Dürr Dental Certified
              </div>
            </div>

            {/* Bento Card 3: Direct Factory Support */}
            <div className="p-8 bg-white border border-slate-200 rounded-3xl flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                  <Database size={22} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Comprehensive Support</h3>
                <p className="text-slate-500 text-xs font-medium leading-relaxed">
                  Complete on-site engineering team response for setup, calibration training, and direct certified component replacement.
                </p>
              </div>
              <div className="pt-6 border-t border-slate-100 text-[10px] font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5 mt-6">
                <Headphones size={14} /> 24/7 Dispatch Ready
              </div>
            </div>

            {/* Bento Card 4: Dynamic Allocation Tracker */}
            <div className="p-8 bg-white border border-slate-200 rounded-3xl flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center shadow-sm">
                  <Clock size={22} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Q3 Delivery Dispatch</h3>
                <p className="text-slate-500 text-xs font-medium leading-relaxed">
                  Avoid long distributor waitlists. Carelink secures active production quotas, delivering assets to clinic doors under 30 days.
                </p>
              </div>
              <div className="pt-6 border-t border-slate-100 text-[10px] font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1.5 mt-6">
                ⚡ Rapid Global Logistics
              </div>
            </div>

          </div>

        </div>
      </section>



      {/* 3. PRIMARY PRODUCT CATALOG: STREAMLINED SELLING PORTFOLIO */}
      <section id="catalog-section" className="py-28 bg-white relative">
        <div className="max-w-[1600px] mx-auto px-6 md:px-16 space-y-12">
          
          {/* Header */}
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 border-b border-slate-100 pb-10">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Hexagon className="text-blue-500" size={12} />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">OUR CATALOG</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-normal text-slate-900 tracking-tight font-serif-classical">
                Featured <span className="italic text-blue-600 font-serif-classical">Products</span>
              </h2>
            </div>
            
            {/* Category selection filters to sell faster */}
            <div className="flex flex-wrap gap-2 pt-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategoryFilter(cat)}
                  className={`px-4.5 py-2 rounded-full text-xs font-bold transition-all ${activeCategoryFilter === cat ? 'bg-slate-900 text-white' : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => {
                const specEntries = Object.entries(product.technical_specs || {}).slice(0, 3);
                return (
                  <motion.div 
                    layout
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.5 }}
                    className="group relative h-[470px] bg-white border border-slate-200 rounded-[2.2rem] overflow-hidden hover:border-blue-500/20 shadow-sm hover:shadow-md flex flex-col justify-between transition-all duration-300"
                  >
                    {/* Visual box */}
                    <div className="p-3 pb-0">
                      <div className="w-full h-56 rounded-[1.8rem] overflow-hidden relative bg-slate-50 border border-slate-100 flex items-center justify-center">
                        <img 
                          src={product.main_image} 
                          alt={product.name} 
                          className="max-h-full max-w-full object-contain p-4 group-hover:scale-[1.03] transition-transform duration-700" 
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-4 left-4 py-1 px-3 bg-white/90 backdrop-blur-md border border-slate-200/50 rounded-lg text-[9px] font-bold text-slate-800 uppercase tracking-wider shadow-sm">
                          {product.model_number}
                        </div>
                      </div>
                    </div>

                    {/* Meta detail specifications */}
                    <div className="px-8 pb-8 space-y-4 flex-1 flex flex-col justify-between mt-4">
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block">
                          {product.category_tag}
                        </span>
                        <h3 className="text-lg font-extrabold text-slate-900 leading-tight tracking-tight group-hover:text-blue-600 transition-colors">
                          {product.name.replace("Newelectrosurgical", "New Electrosurgical")}
                        </h3>
                      </div>

                      {/* Technical Specs List (High Detail) */}
                      <div className="space-y-1.5 bg-slate-50 border border-slate-150 p-3.5 rounded-xl text-[11px]">
                        {specEntries.length > 0 ? (
                          specEntries.map(([k, v], idx) => (
                            <div key={idx} className="flex justify-between items-center">
                              <span className="text-slate-400 font-semibold uppercase tracking-wider">{k}</span>
                              <span className="text-slate-800 font-bold font-mono text-right truncate max-w-[130px]">{v}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-slate-400 font-medium text-center">Specifications detailed in technical dossier.</div>
                        )}
                      </div>

                      {/* CTA Buttons */}
                      <div className="flex gap-3 pt-2">
                        <Link 
                          to={`/acquisition?product=${encodeURIComponent(product.name)}`}
                          className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] text-center uppercase tracking-widest rounded-lg shadow-sm transition-all flex items-center justify-center gap-1"
                        >
                          Buy/Inquire <ArrowUpRight size={12} />
                        </Link>
                        <Link 
                          to={`/portfolio/${product.slug}`}
                          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] text-center uppercase tracking-widest rounded-lg transition-all"
                        >
                          Details
                        </Link>
                      </div>

                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

        </div>
      </section>

      {/* 3.5 LANDSCAPE VIDEO THEATRE & CLINICAL SHOWCASE */}
      <HomepageVideoShowcase />

      {/* 4. INTERACTIVE STEP-BY-STEP PROCUREMENT CONFIGURATOR (HIGH CONVERSION) */}
      <section id="procurement-wizard" className="py-24 bg-slate-50 border-t border-b border-slate-200/50">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Sourcing pitch */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block">FACILITY PLANNER</span>
            <h2 className="text-3xl md:text-5xl font-normal text-slate-900 tracking-tight leading-[1.12] font-serif-classical">
              Configure Your <br />
              <span className="italic text-blue-600 font-serif-classical">Procurement Plan</span>
            </h2>
            <p className="text-slate-500 text-base font-medium leading-relaxed font-sans max-w-md">
              Complete this step-by-step custom order configuration, and our senior clinical logistics engineers will compile a tailored, fully customized capital proposal in under 4 hours.
            </p>

            <div className="space-y-4 pt-4">
              {[
                { title: "Direct Distributor Negotiation", text: "We handle bilateral discussions to guarantee best-tier pricing structures." },
                { title: "Custom Integration Assessment", text: "Ensuring HL7 synchronization match with existing clinical infrastructures." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mt-1 shrink-0">
                    <Check size={12} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Interactive Multi-step Form Wizard */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-lg relative overflow-hidden">
              
              {/* Progress Bar */}
              <div className="w-full bg-slate-100 h-1 rounded-full mb-8 relative">
                <div 
                  className="bg-blue-600 h-1 rounded-full transition-all duration-500" 
                  style={{ width: `${(configStep / 3) * 100}%` }}
                />
              </div>

              <AnimatePresence mode="wait">
                {!configSubmitted ? (
                  <form onSubmit={handleConfigSubmit} className="space-y-6">
                    
                    {configStep === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        <div>
                          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block mb-1">Step 01 of 03</span>
                          <h3 className="text-xl font-bold text-slate-900">Define Facility and Sourcing Target</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Facility Classification</label>
                            <select 
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-sm font-semibold text-slate-800"
                              value={configData.facilityType}
                              onChange={e => setConfigData({...configData, facilityType: e.target.value})}
                            >
                              <option value="General Hospital">General Hospital / Medical Center</option>
                              <option value="Imaging Suite">Diagnostic Imaging Suite</option>
                              <option value="Private Clinic">Private Specialists Clinic</option>
                              <option value="Research Laboratory">Research Institution Lab</option>
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Asset Categories Wanted</label>
                            <select 
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-sm font-semibold text-slate-800"
                              value={configData.interest}
                              onChange={e => setConfigData({...configData, interest: e.target.value})}
                            >
                              <option value="Imaging & Radiology">Imaging &amp; Radiology (MRI, CT, X-Ray)</option>
                              <option value="ICU Care Systems">ICU Patient Monitoring Systems</option>
                              <option value="Surgical Infrastructure">Surgical Devices &amp; Theaters</option>
                              <option value="Laboratory Diagnostics">Clinical Lab &amp; Pathology Hub</option>
                            </select>
                          </div>
                        </div>

                        <button 
                          type="button" 
                          onClick={() => setConfigStep(2)}
                          className="w-full py-4 bg-slate-900 hover:bg-slate-850 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-md transition-all flex items-center justify-center gap-2"
                        >
                          Next Step <ArrowRight size={14} />
                        </button>
                      </motion.div>
                    )}

                    {configStep === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        <div>
                          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block mb-1">Step 02 of 03</span>
                          <h3 className="text-xl font-bold text-slate-900">Equipment Plan &amp; Sourcing Logistics</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Required Units</label>
                            <select 
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-sm font-semibold text-slate-800"
                              value={configData.budgetRange}
                              onChange={e => setConfigData({...configData, budgetRange: e.target.value})}
                            >
                              <option value="1-5 units">1 - 5 units</option>
                              <option value="6-15 units">6 - 15 units</option>
                              <option value="16+ units">16+ units (Facility-wide procurement)</option>
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Target Delivery Timeline</label>
                            <select 
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-sm font-semibold text-slate-800"
                              value={configData.timeline}
                              onChange={e => setConfigData({...configData, timeline: e.target.value})}
                            >
                              <option value="Urgent (Under 1 Month)">Urgent (Under 1 Month)</option>
                              <option value="Within 3 Months">Within 3 Months (Standard)</option>
                              <option value="6 Months Plan">6 Months Plan (Hospital Build Stage)</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Procurement Scope (Models, Quantities, or Layout details)</label>
                          <textarea
                            rows={3}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-sm text-slate-800 resize-none font-medium placeholder:text-slate-400"
                            placeholder="e.g. Need 2 MRI units and full ICU vital monitoring setup."
                            value={configData.notes}
                            onChange={e => setConfigData({...configData, notes: e.target.value})}
                          />
                        </div>

                        <div className="flex gap-4">
                          <button 
                            type="button" 
                            onClick={() => setConfigStep(1)}
                            className="flex-1 py-4 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
                          >
                            Back
                          </button>
                          <button 
                            type="button" 
                            onClick={() => setConfigStep(3)}
                            className="flex-1 py-4 bg-slate-900 hover:bg-slate-850 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-md transition-all flex items-center justify-center gap-2"
                          >
                            Last Step <ArrowRight size={14} />
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {configStep === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        <div>
                          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block mb-1">Step 03 of 03</span>
                          <h3 className="text-xl font-bold text-slate-900">Secure Contact Identification</h3>
                        </div>

                        <div className="space-y-4">
                          <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={16} />
                            <input 
                              required 
                              type="text" 
                              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-sm font-semibold text-slate-800 placeholder:text-slate-400"
                              placeholder="Your Full Name (e.g. Dr. Jane Carter)"
                              value={configData.contactName}
                              onChange={e => setConfigData({...configData, contactName: e.target.value})}
                            />
                          </div>

                          <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={16} />
                            <input 
                              required 
                              type="email" 
                              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-sm font-semibold text-slate-800 placeholder:text-slate-400"
                              placeholder="Clinical / Facility Email (e.g. carter@hospital.org)"
                              value={configData.contactEmail}
                              onChange={e => setConfigData({...configData, contactEmail: e.target.value})}
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="relative group">
                              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={16} />
                              <input 
                                required 
                                type="text" 
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-sm font-semibold text-slate-800 placeholder:text-slate-400"
                                placeholder="Organization Name"
                                value={configData.contactOrg}
                                onChange={e => setConfigData({...configData, contactOrg: e.target.value})}
                              />
                            </div>
                            <div className="relative group">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">PHONE</span>
                              <input 
                                required 
                                type="text" 
                                className="w-full pl-16 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-sm font-semibold text-slate-800 placeholder:text-slate-400"
                                placeholder="Direct Callback #"
                                value={configData.contactPhone}
                                onChange={e => setConfigData({...configData, contactPhone: e.target.value})}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <button 
                            type="button" 
                            onClick={() => setConfigStep(2)}
                            className="flex-1 py-4 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
                          >
                            Back
                          </button>
                          <button 
                            disabled={configSubmitting}
                            type="submit" 
                            className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-md transition-all flex items-center justify-center gap-2"
                          >
                            {configSubmitting ? 'Submitting...' : 'Compile Capital Proposal'}
                          </button>
                        </div>
                      </motion.div>
                    )}

                  </form>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    className="py-12 text-center space-y-6"
                  >
                    <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner border border-emerald-150">
                      <ShieldCheck size={40} className="animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Configuration Submitted</h3>
                      <p className="text-sm text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
                        Your clinical infrastructure specs have been logged. A regional logistics manager is preparing your cost-optimized quote. Expect response inside 4 hours.
                      </p>
                    </div>
                    <button 
                      onClick={() => { setConfigSubmitted(false); setConfigStep(1); }} 
                      className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
                    >
                      New Specification
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>

        </div>
      </section>

      {/* 5. CLINICAL INSIGHTS & INTEL BRIEFINGS */}
      {latestBlogs.length > 0 && (
        <section className="py-24 bg-white border-t border-slate-200/50 relative overflow-hidden">
          <div className="max-w-[1600px] mx-auto px-6 md:px-16">
            
            <div className="flex flex-col md:flex-row items-end justify-between gap-10 mb-16 border-b border-slate-200 pb-10">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">KNOWLEDGE BASE</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-normal text-slate-900 tracking-tight leading-none font-serif-classical">
                  Clinical Insights <span className="italic text-blue-600 font-serif-classical">&amp; Updates</span>
                </h2>
              </div>
              <Link to="/insights" className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-300 pb-1 hover:text-blue-600 hover:border-blue-600 transition-all flex items-center gap-2">
                Browse All Insights <ChevronRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
              {latestBlogs.map((blog) => (
                <motion.div 
                  key={blog.id} 
                  className="group relative bg-white border border-slate-200 shadow-sm rounded-[2rem] p-6 hover:border-blue-500/20 hover:shadow-md transition-all duration-500"
                >
                  <div className="aspect-video rounded-[1.4rem] overflow-hidden mb-6 bg-slate-50 relative">
                     <img src={blog.featured_image} alt={blog.title} className="w-full h-full object-cover opacity-95 group-hover:opacity-100 transition-all duration-700 group-hover:scale-[1.01]" />
                  </div>
                  <div className="space-y-3">
                     <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                       <Cpu size={10} className="text-slate-400" /> Published Sourcing Briefing
                     </div>
                     <h3 className="text-lg font-bold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">{blog.title}</h3>
                     <p className="text-slate-500 text-xs font-medium leading-relaxed line-clamp-2">{blog.excerpt}</p>
                     <Link to={`/insights/${blog.slug}`} className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-800 uppercase tracking-wider pt-2 hover:text-blue-600 transition-colors">
                       Read Full Article <ArrowRight size={12} className="text-blue-600" />
                     </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. TRUST HARBINGER BAR */}
      <section className="py-12 bg-white border-t border-b border-slate-200">
        <div className="max-w-[1600px] mx-auto px-10 flex flex-wrap justify-center md:justify-between items-center gap-8 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
          <div className="flex items-center gap-2 text-slate-900"><img src="/durr-dental-logo.svg" alt="Dürr Dental" className="h-4 w-auto object-contain inline" /><span className="text-blue-600 font-extrabold ml-1">OFFICIAL DISTRIBUTOR NETWORK</span></div>
          <div className="flex items-center gap-2"><Globe size={12} className="text-blue-600" /> INTERNATIONAL SUPPLY HUBS: ACTIVE</div>
          <div className="flex items-center gap-2"><HeartPulse size={12} className="text-emerald-500 animate-pulse" /> VITAL MEDICAL SERVICES: SYSTEM OK</div>
          <div className="flex items-center gap-2"><Database size={12} className="text-indigo-600" /> PRODUCT REGISTRY: IN SYNC</div>
        </div>
      </section>
    </div>
  );
};
