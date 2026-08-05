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
      "Manufacturer": "Dürr Dental Partner"
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
      "Support": "Direct Manufacturer Service"
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

  // Active product selected in the high-fidelity Hero Selector
  const currentHeroProduct = featuredProducts[selectedHeroIndex] || FALLBACK_PRODUCTS[0];



  return (
    <div className="pt-0 bg-white selection:bg-blue-600 selection:text-white">
      <SEO 
        title="Carelink Healthineers | Direct Medical Equipment Sourcing & Dürr Dental Partner" 
        description="Carelink Healthineers connects healthcare facilities directly with certified medical and dental equipment. Official partner of Dürr Dental, providing direct factory prices, fast delivery, and expert technical support."
        keywords={['medical equipment', 'Dürr Dental', 'dental equipment', 'medical sourcing', 'VistaPano', 'radiology equipment', 'hospital equipment', 'Carelink Healthineers']}
      />
      
      {/* 1. HERO SECTION: DYNAMIC PRODUCT CENTERPIECE & SALES SUITE */}
      <section className="relative pt-28 pb-16 md:pt-32 md:pb-20 xl:pt-36 xl:pb-24 flex items-center bg-white border-b border-slate-100">
        
        {/* Soft Radial Gradient for Premium Light feel */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(59,130,246,0.04),transparent_60%)] pointer-events-none z-10" />
        <div className="absolute right-0 top-0 w-1/2 h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.02),transparent_50%)] pointer-events-none z-10 hidden xl:block" />

        <div className="relative z-20 max-w-[1600px] mx-auto px-6 md:px-16 w-full grid grid-cols-1 xl:grid-cols-12 gap-12 xl:gap-20 items-center">
          
          {/* Left Column: Sourcing Narrative & Fast CTAs */}
          <div className="xl:col-span-5 space-y-8 text-left">
            
            {/* Featured Dürr Dental Manufacturer Trust badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white border border-slate-200 text-[10px] font-bold text-slate-800 uppercase tracking-widest shadow-sm hover:border-blue-400 transition-all"
            >
              <img src="/durr-dental-logo.svg" alt="Dürr Dental Logo" className="h-4 w-auto object-contain" />
              <span className="w-px h-3.5 bg-slate-200" />
              <span className="text-blue-600 font-extrabold tracking-wider">OFFICIAL MANUFACTURER</span>
            </motion.div>

            {/* Powerful conversion headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal text-slate-900 tracking-tight leading-[1.08] font-serif-classical"
            >
              Procure Clinical <br />
              Equipment. <span className="italic text-blue-600 font-serif-classical">Direct.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-500 max-w-lg leading-relaxed font-sans"
            >
              Skip middleman markups. Carelink connects hospitals and clinics directly with certified medical equipment, transparent factory pricing, and fast delivery.
            </motion.p>

            {/* Sourcing Quick Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 w-full"
            >
              <a 
                href="#procurement-wizard"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('procurement-wizard')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-blue-600 text-white font-bold text-sm tracking-wider uppercase rounded-xl hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-300"
              >
                Get Custom Quote <Zap size={14} className="text-amber-300" />
              </a>
              <a
                href="#catalog-section"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-white border border-slate-200 text-slate-700 font-bold text-sm tracking-wider uppercase rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
              >
                Browse Catalog <ArrowRight size={15} />
              </a>
            </motion.div>

            {/* Key Advantages Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.4 }}
              className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-100"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pricing</span>
                <span className="text-xl sm:text-2xl font-bold text-blue-600 tracking-tight">Direct Factory</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Quality Standard</span>
                <span className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Dürr Certified</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Delivery</span>
                <span className="text-xl sm:text-2xl font-bold text-emerald-600 tracking-tight flex items-center gap-1.5">
                  Fast &amp; Tested
                </span>
              </div>
            </motion.div>

          </div>

          {/* Right Column: Immersive Interactive Sourcing Centerpiece */}
          <div className="xl:col-span-7 flex flex-col items-center">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="w-full max-w-2xl bg-slate-50 border border-slate-200 rounded-[2.5rem] p-6 md:p-8 shadow-xl relative overflow-hidden"
            >
              {/* Product selector tabs */}
              <div className="flex gap-2 p-1.5 bg-slate-200/60 rounded-xl mb-6 overflow-x-auto no-scrollbar">
                {featuredProducts.slice(0, 3).map((prod, idx) => (
                  <button
                    key={prod.id}
                    onClick={() => setSelectedHeroIndex(idx)}
                    className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${selectedHeroIndex === idx ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    {prod.name.includes("Newelectrosurgical") 
                      ? "Electrosurgical" 
                      : prod.name.split(' ').slice(0, 2).join(' ')}
                  </button>
                ))}
              </div>

              {/* Showcase Visual with Framer Motion Switcher */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedHeroIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  <div className="h-60 sm:h-72 w-full rounded-2xl border border-slate-200 bg-slate-50 p-6 overflow-hidden relative shadow-inner group flex items-center justify-center">
                    <img 
                      src={currentHeroProduct.main_image} 
                      alt={currentHeroProduct.name} 
                      className="max-h-full max-w-full object-contain group-hover:scale-[1.03] transition-transform duration-700" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 left-4 py-1 px-3 bg-blue-600 text-white rounded-md text-[9px] font-bold uppercase tracking-wider shadow-sm">
                      Immediate Q3 Allocation
                    </div>
                  </div>

                  {/* High Density Product Info and Specifications */}
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block mb-1">
                          {currentHeroProduct.category_tag}
                        </span>
                        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight">
                          {currentHeroProduct.name.replace("Newelectrosurgical", "New Electrosurgical")}
                        </h3>
                      </div>
                      <div className="sm:text-right shrink-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Price Option</span>
                        <span className="text-lg font-bold text-blue-600 tracking-tight block">Direct Factory Price</span>
                      </div>
                    </div>

                    <p className="text-slate-500 text-sm leading-relaxed font-medium">
                      {currentHeroProduct.short_description}
                    </p>

                    {/* Detailed Specifications Box */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 pb-1.5 border-b border-slate-100">
                        Vetted Sourcing Specifications
                      </div>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                        {Object.entries(currentHeroProduct.technical_specs || {}).slice(0, 4).map(([k, v], i) => (
                          <div key={i} className="flex justify-between items-center text-xs">
                            <span className="text-slate-400 font-semibold">{k}</span>
                            <span className="text-slate-800 font-bold font-mono text-right">{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quick Sales Action CTAs */}
                    <div className="flex gap-4 pt-2">
                      <Link 
                        to={`/acquisition?product=${encodeURIComponent(currentHeroProduct.name)}`}
                        className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-center text-xs font-bold uppercase tracking-widest rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        Initiate Sourcing Inquiry <ArrowUpRight size={14} />
                      </Link>
                      <Link 
                        to={`/portfolio/${currentHeroProduct.slug}`}
                        className="px-6 py-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        Full Dossier <FileText size={14} className="text-slate-400" />
                      </Link>
                    </div>

                  </div>
                </motion.div>
              </AnimatePresence>

            </motion.div>
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
                  Carelink connects healthcare providers directly with certified manufacturer lines, optimizing delivery speed and supply security.
                </p>
              </div>
              <div className="pt-6 border-t border-slate-100 text-[10px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1.5 mt-6">
                <TrendingUp size={14} /> Certified Partners
              </div>
            </div>

            {/* Bento Card 2: Dürr Dental Official Manufacturer */}
            <div className="p-8 bg-white border border-blue-200/80 rounded-3xl flex flex-col justify-between shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center shadow-xs">
                    <img src="/durr-dental-logo.svg" alt="Dürr Dental" className="h-6 w-auto object-contain" />
                  </div>
                  <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full uppercase tracking-wider border border-blue-100">
                    Official Manufacturer
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
                  Avoid long manufacturer waitlists. Carelink secures active production quotas, delivering assets to clinic doors under 30 days.
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
                { title: "Direct Manufacturer Negotiation", text: "We handle bilateral discussions to guarantee best-tier pricing structures." },
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
          <div className="flex items-center gap-2 text-slate-900"><img src="/durr-dental-logo.svg" alt="Dürr Dental" className="h-4 w-auto object-contain inline" /><span className="text-blue-600 font-extrabold ml-1">OFFICIAL MANUFACTURER NETWORK</span></div>
          <div className="flex items-center gap-2"><Globe size={12} className="text-blue-600" /> INTERNATIONAL SUPPLY HUBS: ACTIVE</div>
          <div className="flex items-center gap-2"><HeartPulse size={12} className="text-emerald-500 animate-pulse" /> VITAL CLINICAL SERVICES: SYSTEM OK</div>
          <div className="flex items-center gap-2"><Database size={12} className="text-indigo-600" /> PRODUCT REGISTRY: IN SYNC</div>
        </div>
      </section>
    </div>
  );
};
