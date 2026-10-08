import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Zap, Globe, 
  ArrowUpRight, ArrowRight, Database,
  Headphones, Check, FileText,
  Building2, User, Mail,
  Award, Clock, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '../../components/SEO';
import { HomepageVideoShowcase } from '../../components/HomepageVideoShowcase';
import { DepthMotionCarousel } from '../../components/DepthMotionCarousel';
import { supabase } from '../../supabaseClient';
import { Product, Blog } from '../../types';

// Real fallback products from Supabase storage if DB query is empty
const FALLBACK_PRODUCTS: Product[] = [
  {
    id: "fb1",
    division_id: "div-imaging",
    name: "Magnetom Lumina 3.0T MRI",
    model_number: "SIEMENS-ML-3T",
    slug: "magnetom-lumina-3t",
    short_description: "High-resolution 3.0T MRI scanner for fast and comfortable hospital imaging.",
    long_description: "A clinical 3 Tesla MRI scanner delivering clear diagnostic images and shorter scanning times.",
    main_image: "https://vrtipkxoldcqhtvznpok.supabase.co/storage/v1/object/public/products/uploads/Extron%207_921_5e39e.png",
    image_gallery: [],
    category_tag: "Imaging & Radiology",
    technical_specs: {
      "Field Strength": "3.0 Tesla",
      "Gantry Bore": "70cm Open Bore",
      "Power": "380-480V 3-Phase",
      "Partner": "Dürr Dental & OEM"
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
    short_description: "Clear 22-inch touch screen patient monitor for ICU and hospital rooms.",
    long_description: "Easy-to-use critical care patient monitor with live vital signs tracking.",
    main_image: "https://vrtipkxoldcqhtvznpok.supabase.co/storage/v1/object/public/products/uploads/931_a8698%20(2).png",
    image_gallery: [],
    category_tag: "ICU Care Systems",
    technical_specs: {
      "Screen": "22-inch Touch Screen",
      "Battery": "4 Hours Backup",
      "Channels": "12-Lead ECG & Vitals",
      "Standard": "Dürr Dental Certified"
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
    short_description: "Mobile surgical X-ray system designed for operating rooms.",
    long_description: "Mobile C-arm with flat detector for clear live imaging during surgery.",
    main_image: "https://vrtipkxoldcqhtvznpok.supabase.co/storage/v1/object/public/products/uploads/6.Software-03_8675f.png",
    image_gallery: [],
    category_tag: "Surgical Systems",
    technical_specs: {
      "Power Output": "20 kW Generator",
      "Detector": "Flat Panel Detector",
      "Safety": "Low-Dose X-Ray Mode",
      "Support": "Full Setup & Service"
    },
    is_published: true,
    created_at: "2026-07-18"
  }
];

export const Origin: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [latestBlogs, setLatestBlogs] = useState<Blog[]>([]);
  const [selectedHeroIndex, setSelectedHeroIndex] = useState(0);

  // Simple Quote Form State
  const [configStep, setConfigStep] = useState(1);
  const [configData, setConfigData] = useState({
    facilityType: 'Hospital',
    interest: 'Dental & Imaging Equipment',
    budgetRange: '1-5 units',
    timeline: 'Within 1-3 Months',
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
          .order('created_at', { ascending: false });

        if (productsData && productsData.length > 0) {
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
        console.error("Error loading homepage products:", err);
        setFeaturedProducts(FALLBACK_PRODUCTS);
      }
    };

    loadHomepageData();
  }, []);

  const handleConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfigSubmitting(true);
    
    const formattedMessage = `[Homepage Quote Request]
- Facility Type: ${configData.facilityType}
- Equipment Category: ${configData.interest}
- Quantity: ${configData.budgetRange}
- Delivery Time: ${configData.timeline}
- Phone: ${configData.contactPhone}
- Notes: ${configData.notes || 'None'}`;

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
      console.error("Quote submit failed:", err);
    } finally {
      setConfigSubmitting(false);
    }
  };

  const currentHeroProduct = featuredProducts[selectedHeroIndex] || FALLBACK_PRODUCTS[0];

  return (
    <div className="pt-0 bg-white selection:bg-blue-600 selection:text-white">
      <SEO 
        title="Carelink Healthineers | Medical & Dental Equipment · Official Dürr Dental Distributor" 
        description="Carelink Healthineers supplies certified medical and dental equipment directly to hospitals and clinics. Official partner of Dürr Dental with direct factory prices and fast delivery."
        keywords={['medical equipment', 'Dürr Dental', 'dental equipment', 'hospital equipment', 'Carelink Healthineers']}
      />
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-28 pb-16 md:pt-32 md:pb-20 xl:pt-36 xl:pb-24 flex items-center bg-white border-b border-slate-100">
        <div className="relative z-20 max-w-[1600px] mx-auto px-6 md:px-16 w-full grid grid-cols-1 xl:grid-cols-12 gap-12 xl:gap-16 items-center">
          
          {/* Left Column: Simple & Clear Message */}
          <div className="xl:col-span-5 space-y-7 text-left">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white border border-slate-200 text-[10px] font-bold text-slate-800 uppercase tracking-widest shadow-xs"
            >
              <img src="/durr-dental-logo.svg" alt="Dürr Dental" className="h-4 w-auto object-contain" />
              <span className="w-px h-3.5 bg-slate-200" />
              <span className="text-blue-600 font-extrabold tracking-wider">OFFICIAL DISTRIBUTOR</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl font-normal text-slate-900 tracking-tight leading-[1.1] font-serif-classical"
            >
              Medical &amp; Dental <br />
              Equipment. <span className="italic text-blue-600 font-serif-classical">Direct.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-base sm:text-lg text-slate-500 max-w-lg leading-relaxed"
            >
              We supply genuine medical and dental equipment directly to hospitals and clinics. Get direct factory prices, full project setup, and fast delivery.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 w-full"
            >
              <a 
                href="#procurement-wizard"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('procurement-wizard')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white font-bold text-sm uppercase tracking-wider rounded-xl hover:bg-blue-700 shadow-md transition-all"
              >
                Get a Quote <Zap size={14} className="text-amber-300" />
              </a>
              <a
                href="#catalog-section"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border border-slate-200 text-slate-700 font-bold text-sm uppercase tracking-wider rounded-xl hover:bg-slate-50 transition-all shadow-xs"
              >
                View Products <ArrowRight size={15} />
              </a>
            </motion.div>

            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pricing</span>
                <span className="text-lg sm:text-xl font-bold text-blue-600">Direct Price</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Partner</span>
                <span className="text-lg sm:text-xl font-bold text-slate-900">Dürr Dental</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Service</span>
                <span className="text-lg sm:text-xl font-bold text-emerald-600">Fast Setup</span>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Single Real Product Card */}
          <div className="xl:col-span-7 flex flex-col items-center">
            <div className="w-full max-w-2xl bg-slate-50 border border-slate-200 rounded-[2.25rem] p-6 md:p-8 shadow-lg">
              {/* Simple Product Tabs */}
              <div className="flex gap-2 p-1.5 bg-slate-200/60 rounded-xl mb-6 overflow-x-auto no-scrollbar">
                {featuredProducts.slice(0, 3).map((prod, idx) => (
                  <button
                    key={prod.id}
                    onClick={() => setSelectedHeroIndex(idx)}
                    className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      selectedHeroIndex === idx ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {prod.name.includes("Newelectrosurgical") 
                      ? "Electrosurgical" 
                      : prod.name.split(' ').slice(0, 2).join(' ')}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedHeroIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  <Link
                    to={`/portfolio/${currentHeroProduct.slug}`}
                    className="h-56 sm:h-64 w-full rounded-2xl border border-slate-200 hover:border-blue-400 bg-white p-6 overflow-hidden relative flex items-center justify-center group cursor-pointer transition-all"
                  >
                    <img 
                      src={currentHeroProduct.main_image} 
                      alt={currentHeroProduct.name} 
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3.5 left-3.5 py-1 px-3 bg-blue-600 text-white rounded-md text-[9px] font-bold uppercase tracking-wider">
                      In Stock
                    </div>
                  </Link>

                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block">
                          {currentHeroProduct.category_tag}
                        </span>
                        <Link
                          to={`/portfolio/${currentHeroProduct.slug}`}
                          className="text-xl sm:text-2xl font-bold text-slate-900 hover:text-blue-600 transition-colors block"
                        >
                          {currentHeroProduct.name.replace("Newelectrosurgical", "New Electrosurgical")}
                        </Link>
                      </div>
                      <span className="text-xs font-bold text-slate-500 font-mono">
                        {currentHeroProduct.model_number}
                      </span>
                    </div>

                    <p className="text-slate-500 text-sm leading-relaxed font-medium">
                      {currentHeroProduct.short_description}
                    </p>

                    <div className="flex gap-3 pt-1">
                      <Link 
                        to={`/acquisition?product=${encodeURIComponent(currentHeroProduct.name)}`}
                        className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-center text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
                      >
                        Get a Quote <ArrowUpRight size={14} />
                      </Link>
                      <Link 
                        to={`/portfolio/${currentHeroProduct.slug}`}
                        className="px-6 py-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5"
                      >
                        Details <FileText size={14} className="text-slate-400" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

        </div>
      </section>

      {/* 2. FEATURED PRODUCTS CAROUSEL SECTION (Real Products Only) */}
      <DepthMotionCarousel products={featuredProducts} />

      {/* 3. CORPORATE & PROJECT SUPPORT (Simple & Clear White Style) */}
      <section className="py-20 bg-slate-50 border-b border-slate-200/60">
        <div className="max-w-[1600px] mx-auto px-6 md:px-16 space-y-10">
          <header className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block">CORPORATE &amp; PROJECTS</span>
              <h2 className="text-3xl md:text-4xl font-normal text-slate-900 tracking-tight font-serif-classical">
                Why Choose <span className="text-blue-600 font-serif-classical italic">Carelink</span>
              </h2>
            </div>
            <p className="text-slate-500 text-sm md:text-base max-w-md font-medium">
              Complete equipment supply and room setup for hospitals, dental clinics, and diagnostic centers.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Dürr Dental */}
            <div className="p-7 bg-white border border-blue-200 rounded-3xl flex flex-col justify-between shadow-xs">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <img src="/durr-dental-logo.svg" alt="Dürr Dental" className="h-5 w-auto object-contain" />
                  </div>
                  <span className="text-[9px] font-bold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full uppercase">
                    Official Partner
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">Dürr Dental Distributor</h3>
                <p className="text-slate-500 text-xs font-medium leading-relaxed">
                  We are an official distributor of Dürr Dental (Germany), supplying genuine dental imaging, suction, and air systems.
                </p>
              </div>
              <div className="pt-5 border-t border-slate-100 text-[10px] font-bold text-blue-600 uppercase tracking-wider mt-6">
                ✓ Made in Germany Quality
              </div>
            </div>

            {/* Card 2: Hospital & Clinic Projects */}
            <div className="p-7 bg-white border border-slate-200 rounded-3xl flex flex-col justify-between shadow-xs">
              <div className="space-y-4">
                <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                  <Building2 size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Hospital &amp; Clinic Projects</h3>
                <p className="text-slate-500 text-xs font-medium leading-relaxed">
                  Planning a new clinic or hospital department? We handle full equipment planning, delivery, and room installation.
                </p>
              </div>
              <div className="pt-5 border-t border-slate-100 text-[10px] font-bold text-blue-600 uppercase tracking-wider mt-6">
                ✓ Complete Turnkey Setup
              </div>
            </div>

            {/* Card 3: Direct Factory Pricing */}
            <div className="p-7 bg-white border border-slate-200 rounded-3xl flex flex-col justify-between shadow-xs">
              <div className="space-y-4">
                <div className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                  <Award size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Direct Factory Prices</h3>
                <p className="text-slate-500 text-xs font-medium leading-relaxed">
                  Buy directly from authorized distributors without extra middleman costs, saving your clinic budget.
                </p>
              </div>
              <div className="pt-5 border-t border-slate-100 text-[10px] font-bold text-indigo-600 uppercase tracking-wider mt-6">
                ✓ Best Value &amp; Warranty
              </div>
            </div>

            {/* Card 4: Technical Support */}
            <div className="p-7 bg-white border border-slate-200 rounded-3xl flex flex-col justify-between shadow-xs">
              <div className="space-y-4">
                <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                  <Headphones size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Fast Delivery &amp; Support</h3>
                <p className="text-slate-500 text-xs font-medium leading-relaxed">
                  Our engineering team provides on-site installation, staff training, and reliable after-sales service.
                </p>
              </div>
              <div className="pt-5 border-t border-slate-100 text-[10px] font-bold text-emerald-600 uppercase tracking-wider mt-6">
                ✓ Dedicated Service Team
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PRODUCT VIDEOS */}
      <HomepageVideoShowcase />

      {/* 5. SIMPLE QUOTE REQUEST FORM */}
      <section id="procurement-wizard" className="py-20 bg-slate-50 border-t border-b border-slate-200/50">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-5 space-y-5 text-left">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block">GET A PRICE QUOTE</span>
            <h2 className="text-3xl md:text-5xl font-normal text-slate-900 tracking-tight leading-tight font-serif-classical">
              Request Your <br />
              <span className="italic text-blue-600 font-serif-classical">Equipment Quote</span>
            </h2>
            <p className="text-slate-500 text-base font-medium leading-relaxed max-w-md">
              Tell us what medical or dental equipment you need. Our team will send you a clear price quote and delivery plan within 4 hours.
            </p>

            <div className="space-y-3 pt-2">
              {[
                { title: "Official Warranty", text: "All equipment includes full warranty and service support." },
                { title: "Project & Bulk Discounts", text: "Special pricing for full clinic or hospital room setups." }
              ].map((item, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mt-0.5 shrink-0">
                    <Check size={12} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                    <p className="text-xs text-slate-500 font-medium">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-white border border-slate-200 rounded-[2rem] p-8 md:p-10 shadow-md">
              <div className="w-full bg-slate-100 h-1 rounded-full mb-8">
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
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -15 }}
                        className="space-y-6"
                      >
                        <div>
                          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block mb-1">Step 1 of 3</span>
                          <h3 className="text-xl font-bold text-slate-900">Select Your Facility &amp; Category</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Facility Type</label>
                            <select 
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm font-semibold text-slate-800"
                              value={configData.facilityType}
                              onChange={e => setConfigData({...configData, facilityType: e.target.value})}
                            >
                              <option value="Hospital">Hospital / Medical Center</option>
                              <option value="Dental Clinic">Dental Clinic</option>
                              <option value="Diagnostic Center">Diagnostic / Imaging Center</option>
                              <option value="Private Clinic">Private Specialist Clinic</option>
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Equipment Needed</label>
                            <select 
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm font-semibold text-slate-800"
                              value={configData.interest}
                              onChange={e => setConfigData({...configData, interest: e.target.value})}
                            >
                              <option value="Dental & Imaging Equipment">Dürr Dental &amp; Dental Systems</option>
                              <option value="Imaging & Radiology">Imaging &amp; Radiology (MRI, CT, X-Ray)</option>
                              <option value="ICU Care Systems">ICU &amp; Patient Monitors</option>
                              <option value="Surgical Systems">Operating Room Equipment</option>
                            </select>
                          </div>
                        </div>

                        <button 
                          type="button" 
                          onClick={() => setConfigStep(2)}
                          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          Next Step <ArrowRight size={14} />
                        </button>
                      </motion.div>
                    )}

                    {configStep === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -15 }}
                        className="space-y-6"
                      >
                        <div>
                          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block mb-1">Step 2 of 3</span>
                          <h3 className="text-xl font-bold text-slate-900">Quantity &amp; Delivery Time</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">How Many Units?</label>
                            <select 
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm font-semibold text-slate-800"
                              value={configData.budgetRange}
                              onChange={e => setConfigData({...configData, budgetRange: e.target.value})}
                            >
                              <option value="1-5 units">1 - 5 units</option>
                              <option value="6-15 units">6 - 15 units</option>
                              <option value="Full Project Setup">Full Clinic / Hospital Project</option>
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">When Do You Need It?</label>
                            <select 
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm font-semibold text-slate-800"
                              value={configData.timeline}
                              onChange={e => setConfigData({...configData, timeline: e.target.value})}
                            >
                              <option value="Urgent (Within 1 Month)">Urgent (Within 1 Month)</option>
                              <option value="Within 1-3 Months">Within 1 - 3 Months</option>
                              <option value="3-6 Months Project">3 - 6 Months Project</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Additional Details (Optional)</label>
                          <textarea
                            rows={3}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm text-slate-800 resize-none font-medium placeholder:text-slate-400"
                            placeholder="Write product names or project details here..."
                            value={configData.notes}
                            onChange={e => setConfigData({...configData, notes: e.target.value})}
                          />
                        </div>

                        <div className="flex gap-4">
                          <button 
                            type="button" 
                            onClick={() => setConfigStep(1)}
                            className="flex-1 py-4 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-widest transition-all cursor-pointer"
                          >
                            Back
                          </button>
                          <button 
                            type="button" 
                            onClick={() => setConfigStep(3)}
                            className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer"
                          >
                            Next Step <ArrowRight size={14} />
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {configStep === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -15 }}
                        className="space-y-6"
                      >
                        <div>
                          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block mb-1">Step 3 of 3</span>
                          <h3 className="text-xl font-bold text-slate-900">Your Contact Details</h3>
                        </div>

                        <div className="space-y-4">
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input 
                              required 
                              type="text" 
                              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm font-semibold text-slate-800 placeholder:text-slate-400"
                              placeholder="Your Full Name"
                              value={configData.contactName}
                              onChange={e => setConfigData({...configData, contactName: e.target.value})}
                            />
                          </div>

                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input 
                              required 
                              type="email" 
                              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm font-semibold text-slate-800 placeholder:text-slate-400"
                              placeholder="Your Email Address"
                              value={configData.contactEmail}
                              onChange={e => setConfigData({...configData, contactEmail: e.target.value})}
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="relative">
                              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                              <input 
                                required 
                                type="text" 
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm font-semibold text-slate-800 placeholder:text-slate-400"
                                placeholder="Hospital / Clinic Name"
                                value={configData.contactOrg}
                                onChange={e => setConfigData({...configData, contactOrg: e.target.value})}
                              />
                            </div>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">PHONE</span>
                              <input 
                                required 
                                type="text" 
                                className="w-full pl-16 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm font-semibold text-slate-800 placeholder:text-slate-400"
                                placeholder="Phone Number"
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
                            className="flex-1 py-4 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-widest transition-all cursor-pointer"
                          >
                            Back
                          </button>
                          <button 
                            disabled={configSubmitting}
                            type="submit" 
                            className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-md transition-all cursor-pointer"
                          >
                            {configSubmitting ? 'Sending...' : 'Send Quote Request'}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </form>
                ) : (
                  <div className="py-10 text-center space-y-5">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
                      <ShieldCheck size={32} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-slate-900">Quote Request Sent</h3>
                      <p className="text-sm text-slate-500 font-medium max-w-sm mx-auto">
                        Thank you! Our team has received your request and will contact you shortly with a price quote.
                      </p>
                    </div>
                    <button 
                      onClick={() => { setConfigSubmitted(false); setConfigStep(1); }} 
                      className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                    >
                      Send Another Request
                    </button>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </section>

      {/* 6. BLOGS / NEWS (Only shown if real blogs exist in DB) */}
      {latestBlogs.length > 0 && (
        <section className="py-20 bg-white border-t border-slate-200/50">
          <div className="max-w-[1600px] mx-auto px-6 md:px-16">
            <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-12 border-b border-slate-200 pb-8">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block">NEWS &amp; UPDATES</span>
                <h2 className="text-3xl md:text-4xl font-normal text-slate-900 tracking-tight font-serif-classical">
                  Latest <span className="italic text-blue-600 font-serif-classical">Articles</span>
                </h2>
              </div>
              <Link to="/insights" className="text-xs font-bold text-slate-600 uppercase tracking-wider hover:text-blue-600 flex items-center gap-1.5">
                View All Articles <ChevronRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {latestBlogs.map((blog) => (
                <div 
                  key={blog.id} 
                  className="group bg-white border border-slate-200 rounded-3xl p-5 hover:shadow-md transition-all"
                >
                  <div className="aspect-video rounded-2xl overflow-hidden mb-5 bg-slate-50">
                     <img src={blog.featured_image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="space-y-2.5">
                     <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">{blog.title}</h3>
                     <p className="text-slate-500 text-xs font-medium leading-relaxed line-clamp-2">{blog.excerpt}</p>
                     <Link to={`/insights/${blog.slug}`} className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 pt-1">
                       Read More <ArrowRight size={12} />
                     </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
