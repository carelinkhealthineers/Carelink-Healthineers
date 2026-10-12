import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  ArrowUpRight, ArrowRight,
  Headphones, Check,
  Building2, User, Mail,
  Award, ChevronLeft, ChevronRight, Star, Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '../../components/SEO';
import { HomepageVideoShowcase } from '../../components/HomepageVideoShowcase';
import { DepthMotionCarousel } from '../../components/DepthMotionCarousel';
import { supabase } from '../../supabaseClient';
import { Product, Blog } from '../../types';
import { recordAnalyticsEvent } from '../../utils/analyticsTracker';
import {
  HomepageControlConfig,
  DEFAULT_HOMEPAGE_CONFIG,
  mergeHomepageConfig,
} from '../../utils/homepageConfig';

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
  const [homeConfig, setHomeConfig] = useState<HomepageControlConfig>(DEFAULT_HOMEPAGE_CONFIG);
  const [selectedHeroIndex, setSelectedHeroIndex] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);

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
        const [productsRes, blogsRes, settingsRes] = await Promise.all([
          supabase
            .from('products')
            .select('*')
            .eq('is_published', true)
            .order('created_at', { ascending: false }),
          supabase
            .from('blogs')
            .select('*')
            .eq('is_published', true)
            .limit(3)
            .order('published_at', { ascending: false }),
          supabase
            .from('settings')
            .select('value')
            .eq('key', 'homepage_control_config')
            .maybeSingle()
        ]);

        if (settingsRes.data?.value) {
          try {
            const parsedConfig = JSON.parse(settingsRes.data.value);
            setHomeConfig(mergeHomepageConfig(parsedConfig));
          } catch (e) {
            console.warn('Could not parse homepage_control_config:', e);
          }
        }

        if (productsRes.data && productsRes.data.length > 0) {
          const formatted = productsRes.data.map((p, idx) => {
            const rawSpecs = p.technical_specs || {};
            const visibleKeys = Object.keys(rawSpecs).filter(
              (k) => !k.startsWith('_') && !k.toLowerCase().includes('video')
            );
            return {
              ...p,
              technical_specs: visibleKeys.length > 0
                ? rawSpecs
                : (FALLBACK_PRODUCTS[idx % 3]?.technical_specs || {})
            };
          });
          setFeaturedProducts(formatted);
        } else {
          setFeaturedProducts(FALLBACK_PRODUCTS);
        }

        if (blogsRes.data) setLatestBlogs(blogsRes.data);
      } catch (err) {
        console.error("Error loading homepage products:", err);
        setFeaturedProducts(FALLBACK_PRODUCTS);
      }
    };

    loadHomepageData();
  }, []);

  // Compute the Hero Slider products list (either Custom Highlighted or All Published)
  const heroSliderProducts = useMemo(() => {
    if (homeConfig.hero.mode === 'custom' && homeConfig.hero.highlightedProductIds.length > 0) {
      const customOrdered = homeConfig.hero.highlightedProductIds
        .map(id => featuredProducts.find(p => p.id === id))
        .filter((p): p is Product => Boolean(p));
      if (customOrdered.length > 0) {
        return customOrdered;
      }
    }
    return featuredProducts;
  }, [featuredProducts, homeConfig.hero.mode, homeConfig.hero.highlightedProductIds]);

  // Compute the 3D Carousel products list
  const carouselProducts = useMemo(() => {
    if (homeConfig.carousel.mode === 'highlighted_only' && homeConfig.hero.highlightedProductIds.length > 0) {
      const customOrdered = homeConfig.hero.highlightedProductIds
        .map(id => featuredProducts.find(p => p.id === id))
        .filter((p): p is Product => Boolean(p));
      if (customOrdered.length > 0) {
        return customOrdered;
      }
    }
    return featuredProducts;
  }, [featuredProducts, homeConfig.carousel.mode, homeConfig.hero.highlightedProductIds]);

  useEffect(() => {
    if (heroPaused || heroSliderProducts.length <= 1) return;
    const intervalMs = Math.max(2500, homeConfig.hero.autoPlayMs || 5000);
    const timer = setInterval(() => {
      setSelectedHeroIndex((prev) => (prev + 1) % heroSliderProducts.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [heroPaused, heroSliderProducts.length, homeConfig.hero.autoPlayMs]);

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
      recordAnalyticsEvent('quote_form_submit', {
        productName: configData.interest,
        routePath: '/',
      });
      setConfigSubmitted(true);
    } catch (err) {
      console.error("Quote submit failed:", err);
    } finally {
      setConfigSubmitting(false);
    }
  };

  const safeHeroIdx = selectedHeroIndex % Math.max(1, heroSliderProducts.length);
  const currentHeroProduct = heroSliderProducts[safeHeroIdx] || FALLBACK_PRODUCTS[0];
  const currentHeroCustomBadge =
    homeConfig.hero.productCustomBadges?.[currentHeroProduct.id] ||
    homeConfig.hero.priceTagText ||
    'Direct Factory Price';

  // Resolve Dedicated Spotlight Product data if enabled
  const spotlightLinkedProduct = homeConfig.spotlight.productId
    ? featuredProducts.find(p => p.id === homeConfig.spotlight.productId)
    : featuredProducts[0];

  const spotlightName =
    homeConfig.spotlight.customName ||
    spotlightLinkedProduct?.name ||
    'Highlighted Clinical System';
  const spotlightModel =
    homeConfig.spotlight.customModel ||
    spotlightLinkedProduct?.model_number ||
    'OFFICIAL-OEM';
  const spotlightDesc =
    homeConfig.spotlight.customDescription ||
    spotlightLinkedProduct?.short_description ||
    homeConfig.spotlight.subheadline;
  const spotlightImg =
    homeConfig.spotlight.customImage ||
    spotlightLinkedProduct?.main_image ||
    FALLBACK_PRODUCTS[0].main_image;
  const spotlightSlug =
    homeConfig.spotlight.customSlug ||
    spotlightLinkedProduct?.slug ||
    '';

  return (
    <div className="pt-0 bg-white selection:bg-blue-600 selection:text-white">
      <SEO
        title="Carelink Healthineers | Medical & Dental Equipment · Official Dürr Dental Distributor"
        description="Carelink Healthineers supplies certified medical and dental equipment directly to hospitals and clinics. Official partner of Dürr Dental with direct factory prices and fast delivery."
        keywords={['medical equipment', 'Dürr Dental', 'dental equipment', 'hospital equipment', 'Carelink Healthineers']}
      />

      {/* 1. HERO SECTION: FULL-VIEW REAL PRODUCT SLIDER */}
      {homeConfig.sections.showHeroSlider && (
        <section
          className="relative pt-28 pb-14 md:pt-32 md:pb-20 flex items-center bg-white border-b border-slate-100"
          onMouseEnter={() => setHeroPaused(true)}
          onMouseLeave={() => setHeroPaused(false)}
        >
          <div className="relative z-20 max-w-[1600px] mx-auto px-6 md:px-16 w-full">
            <div className="relative rounded-[2.5rem] bg-slate-50/80 border border-slate-200/90 shadow-[0_20px_60px_-15px_rgba(15,23,42,0.07)] p-6 sm:p-10 md:p-14 overflow-hidden">

              {/* Top Bar: Official Distributor Badge + Prev/Next Controls */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-8 mb-8 border-b border-slate-200/80">
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white border border-slate-200 text-[10px] font-bold text-slate-800 uppercase tracking-widest shadow-xs">
                  <img src="/durr-dental-logo.svg" alt="Dürr Dental" className="h-4 w-auto object-contain" referrerPolicy="no-referrer" />
                  <span className="w-px h-3.5 bg-slate-200" />
                  <span className="text-blue-600 font-extrabold tracking-wider">
                    {homeConfig.hero.distributorBadgeText || 'OFFICIAL DISTRIBUTOR'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 font-mono tabular-nums mr-1">
                    {safeHeroIdx + 1} / {Math.max(1, heroSliderProducts.length)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedHeroIndex((prev) => (prev - 1 + Math.max(1, heroSliderProducts.length)) % Math.max(1, heroSliderProducts.length))}
                    aria-label="Previous slide"
                    className="w-10 h-10 rounded-full bg-white border border-slate-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 text-slate-700 flex items-center justify-center transition-all shadow-xs cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedHeroIndex((prev) => (prev + 1) % Math.max(1, heroSliderProducts.length))}
                    aria-label="Next slide"
                    className="w-10 h-10 rounded-full bg-white border border-slate-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 text-slate-700 flex items-center justify-center transition-all shadow-xs cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Active Full-View Product Slide */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentHeroProduct.id || safeHeroIdx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.35 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center"
                >
                  {/* Left Column: Real Product Details */}
                  <div className="lg:col-span-7 space-y-6 text-left">
                    <div className="flex flex-wrap items-center gap-2.5 text-xs font-bold">
                      {homeConfig.hero.mode === 'custom' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-extrabold uppercase tracking-wider">
                          <Star size={11} className="fill-amber-500 text-amber-500" /> Highlighted
                        </span>
                      )}
                      <span className="text-blue-600 uppercase tracking-wider">
                        {currentHeroProduct.category_tag}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-500 font-mono">
                        Model: {currentHeroProduct.model_number}
                      </span>
                    </div>

                    <Link
                      to={`/portfolio/${currentHeroProduct.slug}`}
                      className="block group"
                    >
                      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight leading-[1.15]">
                        {currentHeroProduct.name.replace("Newelectrosurgical", "New Electrosurgical")}
                      </h1>
                    </Link>

                    <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-medium max-w-2xl">
                      {currentHeroProduct.short_description}
                    </p>

                    {/* Real Product Specs Grid */}
                    {(() => {
                      const visibleSpecs = Object.entries(currentHeroProduct.technical_specs || {}).filter(
                        ([k]) => !k.startsWith('_') && !k.toLowerCase().includes('video')
                      );
                      return visibleSpecs.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                          {visibleSpecs.slice(0, 4).map(([k, v], i) => (
                            <div key={i} className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                                {k}
                              </span>
                              <span className="text-xs font-bold text-slate-900 font-mono tabular-nums mt-1 block truncate">
                                {v}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : null;
                    })()}

                    {/* Simple Action Buttons */}
                    <div className="flex flex-wrap items-center gap-4 pt-2">
                      <Link
                        to={`/portfolio/${currentHeroProduct.slug}`}
                        className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-2"
                      >
                        {homeConfig.hero.primaryBtnText || 'View Details'} <ArrowRight size={15} />
                      </Link>
                      <Link
                        to={`/acquisition?product=${encodeURIComponent(currentHeroProduct.name)}`}
                        className="px-8 py-4 bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shadow-2xs"
                      >
                        {homeConfig.hero.secondaryBtnText || 'Get a Quote'} <ArrowUpRight size={15} />
                      </Link>
                    </div>
                  </div>

                  {/* Right Column: Large Clickable Real Product Image */}
                  <div className="lg:col-span-5">
                    <Link
                      to={`/portfolio/${currentHeroProduct.slug}`}
                      className="h-72 sm:h-80 md:h-96 w-full rounded-[2rem] bg-white border border-slate-200 hover:border-blue-400 p-6 sm:p-8 shadow-md flex items-center justify-center relative overflow-hidden group cursor-pointer transition-all"
                    >
                      <img
                        src={currentHeroProduct.main_image}
                        alt={currentHeroProduct.name}
                        referrerPolicy="no-referrer"
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4 py-1 px-3 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                        {currentHeroCustomBadge}
                      </div>
                      <div className="absolute bottom-4 right-4 py-1.5 px-3.5 bg-slate-900/90 group-hover:bg-blue-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors">
                        <span>Click for Details</span>
                        <ArrowUpRight size={12} />
                      </div>
                    </Link>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Bottom Product Slide Selector Strip */}
              {heroSliderProducts.length > 1 && (
                <div className="mt-10 pt-6 border-t border-slate-200/80 flex items-center gap-3 overflow-x-auto no-scrollbar">
                  {heroSliderProducts.map((prod, idx) => {
                    const isActive = idx === safeHeroIdx;
                    return (
                      <button
                        key={prod.id}
                        type="button"
                        onClick={() => setSelectedHeroIndex(idx)}
                        className={`flex items-center gap-3 p-2 pr-4 rounded-2xl border transition-all shrink-0 cursor-pointer text-left ${isActive
                          ? 'bg-white border-blue-500 shadow-sm ring-1 ring-blue-500/20'
                          : 'bg-white/60 border-slate-200 hover:bg-white'
                          }`}
                      >
                        <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 p-1 flex items-center justify-center shrink-0">
                          <img
                            src={prod.main_image}
                            alt={prod.name}
                            referrerPolicy="no-referrer"
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <div className="max-w-[150px]">
                          <div className="text-[9px] font-bold text-blue-600 uppercase tracking-wider truncate">
                            {prod.category_tag}
                          </div>
                          <div className="text-xs font-bold text-slate-900 truncate">
                            {prod.name.replace("Newelectrosurgical", "New Electrosurgical")}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

            </div>
          </div>
        </section>
      )}

      {/* 2. DEDICATED CUSTOM HIGHLIGHTED PRODUCT SPOTLIGHT BANNER (Controlled from Admin) */}
      {homeConfig.sections.showSpotlightProduct && (
        <section className="py-16 bg-gradient-to-b from-blue-50/50 to-white border-b border-slate-200/70">
          <div className="max-w-[1600px] mx-auto px-6 md:px-16">
            <div className="rounded-[2.5rem] bg-white border-2 border-blue-500/25 shadow-xl p-8 md:p-14 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-7 space-y-6 text-left">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-600 text-white text-[10px] font-extrabold uppercase tracking-widest">
                    <Sparkles size={12} /> {homeConfig.spotlight.badge || 'FEATURED FLAGSHIP SYSTEM'}
                  </span>
                  {homeConfig.spotlight.priceTag && (
                    <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider">
                      {homeConfig.spotlight.priceTag}
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Model: {spotlightModel}
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                    {spotlightName}
                  </h2>
                </div>

                <p className="text-base text-slate-600 font-medium leading-relaxed max-w-2xl">
                  {spotlightDesc}
                </p>

                {homeConfig.spotlight.bullets && homeConfig.spotlight.bullets.filter(Boolean).length > 0 && (
                  <div className="space-y-2.5 pt-1">
                    {homeConfig.spotlight.bullets.filter(Boolean).map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                          <Check size={12} />
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-slate-800">{item}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-4 pt-3">
                  {spotlightSlug ? (
                    <Link
                      to={`/portfolio/${spotlightSlug}`}
                      className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-2"
                    >
                      {homeConfig.spotlight.primaryButtonText || 'View Full Specifications'} <ArrowRight size={15} />
                    </Link>
                  ) : (
                    <Link
                      to="/portfolio"
                      className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-2"
                    >
                      {homeConfig.spotlight.primaryButtonText || 'View Catalog'} <ArrowRight size={15} />
                    </Link>
                  )}

                  <Link
                    to={`/acquisition?product=${encodeURIComponent(spotlightName)}`}
                    className="px-8 py-4 bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2"
                  >
                    {homeConfig.spotlight.secondaryButtonText || 'Request Special Price Quote'} <ArrowUpRight size={15} />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="h-72 sm:h-80 md:h-96 w-full rounded-[2rem] bg-slate-50 border border-slate-200 p-6 flex items-center justify-center relative overflow-hidden">
                  <img
                    src={spotlightImg}
                    alt={spotlightName}
                    referrerPolicy="no-referrer"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. CORPORATE & PROJECT SUPPORT (Simple & Clear White Style) */}
      {homeConfig.sections.showCorporateCards && (
        <section className="py-20 bg-slate-50 border-b border-slate-200/60">
          <div className="max-w-[1600px] mx-auto px-6 md:px-16 space-y-10">
            <header className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block">
                  {homeConfig.corporate.eyebrow}
                </span>
                <h2 className="text-3xl md:text-4xl font-normal text-slate-900 tracking-tight font-serif-classical">
                  {homeConfig.corporate.titleMain}{' '}
                  <span className="text-blue-600 font-serif-classical italic">
                    {homeConfig.corporate.titleAccent}
                  </span>
                </h2>
              </div>
              <p className="text-slate-500 text-sm md:text-base max-w-md font-medium">
                {homeConfig.corporate.subtitle}
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
                      {homeConfig.corporate.cards[0]?.badgeText || 'Official Partner'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {homeConfig.corporate.cards[0]?.title}
                  </h3>
                  <p className="text-slate-500 text-xs font-medium leading-relaxed">
                    {homeConfig.corporate.cards[0]?.description}
                  </p>
                </div>
                <div className="pt-5 border-t border-slate-100 text-[10px] font-bold text-blue-600 uppercase tracking-wider mt-6">
                  {homeConfig.corporate.cards[0]?.footerText}
                </div>
              </div>

              {/* Card 2: Hospital & Clinic Projects */}
              <div className="p-7 bg-white border border-slate-200 rounded-3xl flex flex-col justify-between shadow-xs">
                <div className="space-y-4">
                  <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <Building2 size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {homeConfig.corporate.cards[1]?.title}
                  </h3>
                  <p className="text-slate-500 text-xs font-medium leading-relaxed">
                    {homeConfig.corporate.cards[1]?.description}
                  </p>
                </div>
                <div className="pt-5 border-t border-slate-100 text-[10px] font-bold text-blue-600 uppercase tracking-wider mt-6">
                  {homeConfig.corporate.cards[1]?.footerText}
                </div>
              </div>

              {/* Card 3: Direct Factory Pricing */}
              <div className="p-7 bg-white border border-slate-200 rounded-3xl flex flex-col justify-between shadow-xs">
                <div className="space-y-4">
                  <div className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                    <Award size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {homeConfig.corporate.cards[2]?.title}
                  </h3>
                  <p className="text-slate-500 text-xs font-medium leading-relaxed">
                    {homeConfig.corporate.cards[2]?.description}
                  </p>
                </div>
                <div className="pt-5 border-t border-slate-100 text-[10px] font-bold text-indigo-600 uppercase tracking-wider mt-6">
                  {homeConfig.corporate.cards[2]?.footerText}
                </div>
              </div>

              {/* Card 4: Technical Support */}
              <div className="p-7 bg-white border border-slate-200 rounded-3xl flex flex-col justify-between shadow-xs">
                <div className="space-y-4">
                  <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                    <Headphones size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {homeConfig.corporate.cards[3]?.title}
                  </h3>
                  <p className="text-slate-500 text-xs font-medium leading-relaxed">
                    {homeConfig.corporate.cards[3]?.description}
                  </p>
                </div>
                <div className="pt-5 border-t border-slate-100 text-[10px] font-bold text-emerald-600 uppercase tracking-wider mt-6">
                  {homeConfig.corporate.cards[3]?.footerText}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. FEATURED PRODUCTS CAROUSEL SECTION */}
      {homeConfig.sections.showFeaturedCarousel && (
        <DepthMotionCarousel
          products={carouselProducts}
          badgeText={homeConfig.carousel.badgeText}
          titleMain={homeConfig.carousel.titleMain}
          titleAccent={homeConfig.carousel.titleAccent}
          subtitle={homeConfig.carousel.subtitle}
        />
      )}

      {/* 5. PRODUCT VIDEOS */}
      {homeConfig.sections.showVideoShowcase && <HomepageVideoShowcase />}

      {/* 6. SIMPLE QUOTE REQUEST FORM */}
      {homeConfig.sections.showQuoteWizard && (
        <section id="procurement-wizard" className="py-20 bg-slate-50 border-t border-b border-slate-200/50">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            <div className="lg:col-span-5 space-y-5 text-left">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block">
                {homeConfig.quote.eyebrow}
              </span>
              <h2 className="text-3xl md:text-5xl font-normal text-slate-900 tracking-tight leading-tight font-serif-classical">
                {homeConfig.quote.titleLine1} <br />
                <span className="italic text-blue-600 font-serif-classical">
                  {homeConfig.quote.titleAccent}
                </span>
              </h2>
              <p className="text-slate-500 text-base font-medium leading-relaxed max-w-md">
                {homeConfig.quote.description}
              </p>

              <div className="space-y-3 pt-2">
                {[
                  { title: homeConfig.quote.bullet1Title, text: homeConfig.quote.bullet1Text },
                  { title: homeConfig.quote.bullet2Title, text: homeConfig.quote.bullet2Text }
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
                                onChange={e => setConfigData({ ...configData, facilityType: e.target.value })}
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
                                onChange={e => setConfigData({ ...configData, interest: e.target.value })}
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
                                onChange={e => setConfigData({ ...configData, budgetRange: e.target.value })}
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
                                onChange={e => setConfigData({ ...configData, timeline: e.target.value })}
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
                              onChange={e => setConfigData({ ...configData, notes: e.target.value })}
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
                                onChange={e => setConfigData({ ...configData, contactName: e.target.value })}
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
                                onChange={e => setConfigData({ ...configData, contactEmail: e.target.value })}
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
                                  onChange={e => setConfigData({ ...configData, contactOrg: e.target.value })}
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
                                  onChange={e => setConfigData({ ...configData, contactPhone: e.target.value })}
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
      )}

      {/* 7. BLOGS / NEWS (Only shown if enabled & real blogs exist in DB) */}
      {homeConfig.sections.showLatestBlogs && latestBlogs.length > 0 && (
        <section className="py-20 bg-white border-t border-slate-200/50">
          <div className="max-w-[1600px] mx-auto px-6 md:px-16">
            <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-12 border-b border-slate-200 pb-8">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block">
                  {homeConfig.blogs.eyebrow}
                </span>
                <h2 className="text-3xl md:text-4xl font-normal text-slate-900 tracking-tight font-serif-classical">
                  {homeConfig.blogs.titleMain}{' '}
                  <span className="italic text-blue-600 font-serif-classical">
                    {homeConfig.blogs.titleAccent}
                  </span>
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
