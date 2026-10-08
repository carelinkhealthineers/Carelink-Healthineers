import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowRight,
  Hexagon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product } from '../types';

interface DepthMotionCarouselProps {
  products: Product[];
}

export const DepthMotionCarousel: React.FC<DepthMotionCarouselProps> = ({ products }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Extract real categories from real products
  const categories = useMemo(() => {
    const tags = products.map((p) => p.category_tag).filter(Boolean);
    return ['All', ...Array.from(new Set(tags))];
  }, [products]);

  // Filter real products by selected category
  const filteredProducts = useMemo(() => {
    if (activeCategory === 'All') return products;
    return products.filter((p) => p.category_tag === activeCategory);
  }, [products, activeCategory]);

  const total = filteredProducts.length;

  // Reset index when category changes
  useEffect(() => {
    setActiveIndex(0);
  }, [activeCategory]);

  const handleNext = useCallback(() => {
    if (total === 0) return;
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    if (total === 0) return;
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (isPaused || total <= 1) return;
    const timer = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, total, handleNext]);

  if (total === 0) {
    return null;
  }

  const safeIndex = activeIndex % total;
  const activeProduct = filteredProducts[safeIndex] || filteredProducts[0];
  const specEntries = Object.entries(activeProduct.technical_specs || {}).slice(0, 4);

  // Determine visible offsets based on how many real products exist
  const offsets = total >= 5 ? [-2, -1, 0, 1, 2] : total >= 3 ? [-1, 0, 1] : [0];

  const getProductAtOffset = (offset: number) => {
    const index = (safeIndex + offset + total * 10) % total;
    return { product: filteredProducts[index], index };
  };

  const formatName = (name: string) =>
    name.replace('Newelectrosurgical', 'New Electrosurgical');

  return (
    <section
      id="catalog-section"
      className="py-24 bg-white relative border-b border-slate-100"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-[1600px] mx-auto px-6 md:px-16 space-y-12">
        {/* Clean Section Header + Category Filters */}
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 border-b border-slate-100 pb-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200">
              <img
                src="/durr-dental-logo.svg"
                alt="Dürr Dental"
                className="h-3.5 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
              <span className="w-px h-3 bg-slate-200" />
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                Official Distributor · Product Catalog
              </span>
            </div>

            <h2 className="text-3xl md:text-5xl font-normal text-slate-900 tracking-tight font-serif-classical">
              Featured <span className="italic text-blue-600 font-serif-classical">Products</span>
            </h2>
            <p className="text-slate-500 text-sm sm:text-base font-medium max-w-xl">
              Browse our certified medical and dental equipment. Click any product to view details or request a price quote.
            </p>
          </div>

          {/* Category Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
            <Link
              to="/portfolio"
              className="px-4 py-2 rounded-full text-xs font-bold bg-white border border-slate-200 text-blue-600 hover:bg-blue-50 transition-all flex items-center gap-1.5"
            >
              All Products <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Single White Corporate 3D Depth Carousel Stage */}
        <div className="relative rounded-[2.5rem] bg-slate-50/70 border border-slate-200/90 shadow-[0_20px_60px_-15px_rgba(15,23,42,0.06)] px-4 sm:px-10 md:px-14 py-10 md:py-14 overflow-hidden">
          {/* Active Product Name Above Center Card */}
          <div className="text-center mb-8 min-h-[56px] flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeProduct.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="space-y-1"
              >
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block">
                  {activeProduct.category_tag} · {activeProduct.model_number}
                </span>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                  {formatName(activeProduct.name)}
                </h3>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* 5-Card Horizontal Depth Row with Prev / Next Buttons */}
          <div
            className="relative flex items-center justify-center min-h-[300px] sm:min-h-[360px]"
            style={{ perspective: '1200px' }}
          >
            {/* Prev Button */}
            {total > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous product"
                className="absolute left-1 sm:left-3 z-40 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-white border border-slate-200 shadow-md hover:bg-blue-600 hover:text-white hover:border-blue-600 text-slate-800 font-bold text-xs flex items-center justify-center transition-all cursor-pointer"
              >
                <span className="flex items-center gap-0.5">
                  <ChevronLeft size={14} />
                  <span>Prev</span>
                </span>
              </button>
            )}

            {/* Real Product Cards */}
            <div className="flex items-center justify-center gap-3 sm:gap-5 md:gap-7 w-full max-w-[1260px] mx-auto px-10 sm:px-14">
              {offsets.map((offset) => {
                const { product, index } = getProductAtOffset(offset);
                const isCenter = offset === 0;
                const isAdjacent = Math.abs(offset) === 1;
                const rotateY = offset === 0 ? 0 : offset < 0 ? 12 : -12;

                return (
                  <motion.div
                    key={`${product.id}-${offset}`}
                    layout
                    onClick={() => setActiveIndex(index)}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{
                      opacity: isCenter ? 1 : isAdjacent ? 0.9 : 0.7,
                      scale: isCenter ? 1 : isAdjacent ? 0.9 : 0.82,
                      rotateY,
                      y: isCenter ? 0 : 8
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 260,
                      damping: 26
                    }}
                    className={`relative cursor-pointer shrink-0 overflow-hidden bg-white flex flex-col justify-between transition-shadow duration-300 group ${
                      isCenter
                        ? 'w-[220px] sm:w-[270px] md:w-[300px] h-[290px] sm:h-[340px] md:h-[370px] rounded-[2rem] shadow-xl border-2 border-blue-500/40 z-30 p-5'
                        : isAdjacent
                        ? 'w-[140px] sm:w-[185px] md:w-[215px] h-[195px] sm:h-[235px] md:h-[255px] rounded-[1.5rem] shadow-sm border border-slate-200/90 hover:border-blue-300 z-20 p-4'
                        : 'hidden lg:flex w-[170px] xl:w-[190px] h-[205px] xl:h-[225px] rounded-[1.35rem] border border-slate-200/70 hover:border-blue-200 z-10 p-3.5'
                    }`}
                  >
                    {/* Top Model Tag */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-1 bg-slate-50 border border-slate-200/70 rounded-lg text-[9px] font-bold text-slate-700 uppercase tracking-wider truncate">
                        {product.model_number}
                      </span>
                      {isCenter && (
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-bold uppercase tracking-wider shrink-0">
                          Selected
                        </span>
                      )}
                    </div>

                    {/* Real Product Image */}
                    <div className="flex-1 flex items-center justify-center my-2 overflow-hidden">
                      <img
                        src={product.main_image}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    {/* Bottom Product Title on Card */}
                    <div className="text-center pt-2 border-t border-slate-100">
                      <div className="text-[9px] font-bold text-blue-600 uppercase tracking-wider truncate">
                        {product.category_tag}
                      </div>
                      <div
                        className={`font-bold text-slate-900 truncate mt-0.5 ${
                          isCenter ? 'text-xs sm:text-sm' : 'text-[11px]'
                        }`}
                      >
                        {formatName(product.name)}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Next Button */}
            {total > 1 && (
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next product"
                className="absolute right-1 sm:right-3 z-40 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-white border border-slate-200 shadow-md hover:bg-blue-600 hover:text-white hover:border-blue-600 text-slate-800 font-bold text-xs flex items-center justify-center transition-all cursor-pointer"
              >
                <span className="flex items-center gap-0.5">
                  <span>Next</span>
                  <ChevronRight size={14} />
                </span>
              </button>
            )}
          </div>

          {/* Short Description + Dot Indicators Under Center Card */}
          <div className="text-center max-w-xl mx-auto mt-6 mb-8">
            <AnimatePresence mode="wait">
              <motion.p
                key={activeProduct.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="text-sm text-slate-600 font-medium leading-relaxed"
              >
                {activeProduct.short_description}
              </motion.p>
            </AnimatePresence>

            {total > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                {filteredProducts.map((p, idx) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    aria-label={`Select ${p.name}`}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      safeIndex === idx ? 'w-7 bg-blue-600' : 'w-2 bg-slate-300 hover:bg-slate-400'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Website-Style Product Details & Action Bar */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeProduct.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
            >
              {/* Left: Product Name & Partner Info */}
              <div className="lg:col-span-4 space-y-1.5 text-left border-b lg:border-b-0 lg:border-r border-slate-100 pb-4 lg:pb-0 lg:pr-6">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block">
                  {activeProduct.category_tag}
                </span>
                <h4 className="text-lg sm:text-xl font-bold text-slate-900">
                  {formatName(activeProduct.name)}
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  Model: <strong className="text-slate-800">{activeProduct.model_number}</strong> · Direct Factory Price
                </p>
              </div>

              {/* Middle: Real Technical Specifications */}
              <div className="lg:col-span-5 grid grid-cols-2 gap-3">
                {specEntries.length > 0 ? (
                  specEntries.map(([k, v], i) => (
                    <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                        {k}
                      </span>
                      <span className="text-xs font-bold text-slate-800 font-mono tabular-nums mt-0.5 block truncate">
                        {v}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-xs text-slate-400 font-medium py-2">
                    Full specifications available on the product details page.
                  </div>
                )}
              </div>

              {/* Right: Simple Action Buttons */}
              <div className="lg:col-span-3 flex flex-col sm:flex-row lg:flex-col gap-3">
                <Link
                  to={`/acquisition?product=${encodeURIComponent(activeProduct.name)}`}
                  className="w-full py-3 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
                >
                  Buy / Inquire <ArrowUpRight size={14} />
                </Link>
                <Link
                  to={`/portfolio/${activeProduct.slug}`}
                  className="w-full py-3 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-all text-center whitespace-nowrap"
                >
                  View Details
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
