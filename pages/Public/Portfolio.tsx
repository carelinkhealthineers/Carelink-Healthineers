import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SEO } from '../../components/SEO';
import { supabase } from '../../supabaseClient';
import { Product, Division } from '../../types';

const ITEMS_PER_PAGE = 12;

export const Portfolio: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialDivSlug = searchParams.get('division') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialDivSlug && initialDivSlug !== 'all' ? [initialDivSlug] : []
  );
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'featured' | 'name-asc' | 'price-asc' | 'price-desc'>('featured');
  const [currentPage, setCurrentPage] = useState(1);

  // Mobile Filter Sidebar State
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Modals State
  const [selectedProductModal, setSelectedProductModal] = useState<Product | null>(null);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);

  // Quote Form State
  const [quoteForm, setQuoteForm] = useState({
    name: '',
    email: '',
    org: '',
    category: 'Medical Equipment',
    productName: '',
    message: ''
  });
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);

  // Sync URL ?division= parameter when arriving from external links
  useEffect(() => {
    const divParam = searchParams.get('division');
    if (divParam && divParam !== 'all') {
      setSelectedCategories([divParam]);
    } else if (divParam === 'all') {
      setSelectedCategories([]);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [pRes, dRes] = await Promise.all([
          supabase.from('products').select('*').eq('is_published', true).order('created_at', { ascending: false }),
          supabase.from('divisions').select('*').order('order_index')
        ]);
        if (pRes.data) setProducts(pRes.data);
        if (dRes.data) {
          setDivisions(dRes.data);
          if (dRes.data.length > 0) {
            setQuoteForm(prev => ({ ...prev, category: dRes.data[0].name }));
          }
        }
      } catch (err) {
        console.error('Data Fetch Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helper to extract brand or manufacturer from product specs
  const getProductBrand = (p: Product): string => {
    const specs = p.technical_specs || {};
    for (const [k, v] of Object.entries(specs)) {
      const keyLower = k.toLowerCase();
      if (
        (keyLower.includes('brand') || keyLower.includes('manufacturer') || keyLower.includes('make') || keyLower.includes('partner')) &&
        typeof v === 'string' &&
        v.trim()
      ) {
        return v.trim();
      }
    }
    if (p.name.toLowerCase().includes('dürr') || p.name.toLowerCase().includes('durr') || p.name.toLowerCase().includes('vista')) {
      return 'Dürr Dental';
    }
    if (p.name.toLowerCase().includes('mindray')) {
      return 'Mindray';
    }
    return 'Carelink Certified';
  };

  // Helper to extract price if present in technical_specs, else return 'Request Quote'
  const getProductPriceDisplay = (p: Product): string => {
    const specs = p.technical_specs || {};
    for (const [k, v] of Object.entries(specs)) {
      if (k.toLowerCase().includes('price') && typeof v === 'string' && v.trim()) {
        return v.trim();
      }
    }
    return 'Factory Direct Quote';
  };

  const getProductNumericPrice = (p: Product): number => {
    const raw = getProductPriceDisplay(p);
    const num = parseFloat(raw.replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 0 : num;
  };

  // Compute Category Options (from Divisions) with product counts
  const categoryOptions = useMemo(() => {
    return divisions.map(div => {
      const count = products.filter(p => p.division_id === div.id).length;
      return {
        slug: div.slug,
        id: div.id,
        name: div.name,
        count
      };
    });
  }, [divisions, products]);

  // Compute Subcategory Options (from product.category_tag) filtered by selected categories if any
  const subcategoryOptions = useMemo(() => {
    const relevantProducts = selectedCategories.length > 0
      ? products.filter(p => {
          const div = divisions.find(d => d.id === p.division_id);
          return div && selectedCategories.includes(div.slug);
        })
      : products;

    const counts: Record<string, number> = {};
    relevantProducts.forEach(p => {
      const tag = (p.category_tag || '').trim();
      if (tag) {
        counts[tag] = (counts[tag] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [products, divisions, selectedCategories]);

  // Compute Brand Options
  const brandOptions = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach(p => {
      const brand = getProductBrand(p);
      if (brand) {
        counts[brand] = (counts[brand] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [products]);

  // Filtered and Sorted Products
  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();

    const filtered = products.filter(p => {
      const division = divisions.find(d => d.id === p.division_id);
      const divSlug = division?.slug || '';
      const subcat = (p.category_tag || '').trim();
      const brand = getProductBrand(p);

      const matchCategory = selectedCategories.length === 0 || selectedCategories.includes(divSlug);
      const matchSubcategory = selectedSubcategories.length === 0 || selectedSubcategories.includes(subcat);
      const matchBrand = selectedBrands.length === 0 || selectedBrands.includes(brand);

      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.model_number || '').toLowerCase().includes(q) ||
        subcat.toLowerCase().includes(q) ||
        (p.short_description || '').toLowerCase().includes(q) ||
        (division?.name || '').toLowerCase().includes(q);

      return matchCategory && matchSubcategory && matchBrand && matchSearch;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'name-asc') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'price-asc') {
        return getProductNumericPrice(a) - getProductNumericPrice(b) || a.name.localeCompare(b.name);
      }
      if (sortBy === 'price-desc') {
        return getProductNumericPrice(b) - getProductNumericPrice(a) || a.name.localeCompare(b.name);
      }
      return 0; // featured (default order)
    });
  }, [products, divisions, selectedCategories, selectedSubcategories, selectedBrands, search, sortBy]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategories, selectedSubcategories, selectedBrands, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  // Toggle Handlers
  const toggleCategory = (slug: string) => {
    setSelectedCategories(prev => {
      const next = prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug];
      if (next.length === 1) {
        setSearchParams({ division: next[0] });
      } else {
        setSearchParams({});
      }
      return next;
    });
  };

  const toggleSubcategory = (sub: string) => {
    setSelectedSubcategories(prev =>
      prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]
    );
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const clearAllFilters = () => {
    setSearch('');
    setSelectedCategories([]);
    setSelectedSubcategories([]);
    setSelectedBrands([]);
    setSortBy('featured');
    setSearchParams({});
  };

  const activeFilterCount =
    (search.trim() ? 1 : 0) +
    selectedCategories.length +
    selectedSubcategories.length +
    selectedBrands.length;

  // Open Quote Modal with optional product context
  const handleOpenQuoteModal = (product?: Product) => {
    if (product) {
      const div = divisions.find(d => d.id === product.division_id);
      setQuoteForm(prev => ({
        ...prev,
        category: div?.name || product.category_tag || prev.category,
        productName: product.name,
        message: `Requesting official quotation and technical specifications for ${product.name} (${product.model_number}).`
      }));
    } else {
      setQuoteForm(prev => ({
        ...prev,
        productName: '',
        message: ''
      }));
    }
    setSelectedProductModal(null);
    setQuoteSubmitted(false);
    setQuoteModalOpen(true);
  };

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteForm.name.trim()) return;
    setQuoteSubmitting(true);

    const payloadMessage = quoteForm.productName
      ? `[Product: ${quoteForm.productName}] [Category: ${quoteForm.category}] - ${quoteForm.message}`
      : `[Category: ${quoteForm.category}] - ${quoteForm.message}`;

    try {
      const { error } = await supabase.from('inquiries').insert([
        {
          name: quoteForm.name,
          email: quoteForm.email || 'inquiry@carelinkhealthineers.com',
          company: quoteForm.org || 'Clinical Facility',
          message: payloadMessage,
          status: 'pending'
        }
      ]);
      if (error) throw error;
      setQuoteSubmitted(true);
      setTimeout(() => {
        setQuoteModalOpen(false);
        setQuoteSubmitted(false);
      }, 1800);
    } catch (err) {
      console.error('Quote submission error:', err);
    } finally {
      setQuoteSubmitting(false);
    }
  };

  return (
    <div className="sf-products-page min-h-screen">
      <SEO
        title="Equipment Portfolio | Medical & Dental Catalog"
        description="Browse our complete catalog of certified medical and dental equipment. Official partner of Dürr Dental with direct factory pricing and fast delivery."
        keywords={['medical equipment catalog', 'dental equipment', 'Dürr Dental products', 'VistaPano', 'imaging systems', 'clinical equipment']}
      />

      {/* ============ PAGE HEADER ============ */}
      <header className="page-header">
        <div className="wrap">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <em>Products</em>
          </nav>
          <h1>
            Medical &amp; Dental <em>Equipment Catalog</em>
          </h1>
          <p className="lede">
            Certified clinical infrastructure, diagnostic imaging systems, and hospital equipment with direct factory sourcing and technical deployment.
          </p>
          <div className="ph-meta">
            <span>
              <strong>{products.length}</strong> Certified Products
            </span>
            <span className="ph-dot" />
            <span>
              <strong>{divisions.length}</strong> Clinical Divisions
            </span>
            <span className="ph-dot" />
            <span>Authorized Dürr Dental Partner</span>
          </div>
        </div>
      </header>

      {/* ============ CATALOG ============ */}
      <section className="catalog" id="catalog">
        <div className="wrap catalog-layout">
          <button
            className="filters-toggle"
            id="filtersToggle"
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 6h16M7 12h10M10 18h4" />
            </svg>
            Filters
            {activeFilterCount > 0 && (
              <span className="filters-toggle-count" id="filtersToggleCount">
                {activeFilterCount}
              </span>
            )}
          </button>

          <div
            className={`filters-overlay ${mobileFiltersOpen ? 'open' : ''}`}
            id="filtersOverlay"
            onClick={() => setMobileFiltersOpen(false)}
          />

          {/* FILTER SIDEBAR */}
          <aside className={`filters ${mobileFiltersOpen ? 'open' : ''}`} id="filters">
            <div className="filters-head">
              <h3>Filter Products</h3>
              <button
                className="filters-close"
                id="filtersClose"
                aria-label="Close filters"
                onClick={() => setMobileFiltersOpen(false)}
              >
                &times;
              </button>
            </div>

            <div className="filter-group">
              <label className="filter-search">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.3-4.3" />
                </svg>
                <input
                  type="text"
                  id="searchInput"
                  placeholder="Search products…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </label>
            </div>

            <div className="filter-group">
              <div className="filter-group-head">
                <h4>Category</h4>
              </div>
              <div className="filter-options" id="categoryOptions">
                {categoryOptions.map(cat => (
                  <label key={cat.slug} className="filter-option">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat.slug)}
                      onChange={() => toggleCategory(cat.slug)}
                    />
                    <span>{cat.name}</span>
                    <em>{cat.count}</em>
                  </label>
                ))}
              </div>
            </div>

            {subcategoryOptions.length > 0 && (
              <div className="filter-group" id="subcategoryGroup">
                <div className="filter-group-head">
                  <h4>Subcategory</h4>
                </div>
                <div className="filter-options filter-options-scroll" id="subcategoryOptions">
                  {subcategoryOptions.map(sub => (
                    <label key={sub.name} className="filter-option">
                      <input
                        type="checkbox"
                        checked={selectedSubcategories.includes(sub.name)}
                        onChange={() => toggleSubcategory(sub.name)}
                      />
                      <span>{sub.name}</span>
                      <em>{sub.count}</em>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {brandOptions.length > 0 && (
              <div className="filter-group">
                <div className="filter-group-head">
                  <h4>Brand</h4>
                </div>
                <div className="filter-options filter-options-scroll" id="brandOptions">
                  {brandOptions.map(b => (
                    <label key={b.name} className="filter-option">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(b.name)}
                        onChange={() => toggleBrand(b.name)}
                      />
                      <span>{b.name}</span>
                      <em>{b.count}</em>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <button
              className="btn btn-ghost filters-clear"
              id="clearFilters"
              type="button"
              onClick={clearAllFilters}
            >
              Clear All Filters
            </button>
          </aside>

          {/* MAIN */}
          <div className="catalog-main">
            <div className="catalog-toolbar">
              <p className="catalog-count" id="resultCount">
                {loading
                  ? 'Loading products…'
                  : `Showing ${filteredProducts.length} of ${products.length} products`}
              </p>
              <label className="catalog-sort">
                <span>Sort by</span>
                <select
                  id="sortSelect"
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                >
                  <option value="featured">Featured</option>
                  <option value="name-asc">Name: A–Z</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </label>
            </div>

            {/* Active Filter Chips */}
            {activeFilterCount > 0 && (
              <div className="active-filters" id="activeFilters">
                {search.trim() && (
                  <span className="chip">
                    Search: &ldquo;{search.trim()}&rdquo;
                    <button type="button" onClick={() => setSearch('')} aria-label="Remove search filter">
                      &times;
                    </button>
                  </span>
                )}
                {selectedCategories.map(slug => {
                  const div = divisions.find(d => d.slug === slug);
                  return (
                    <span key={slug} className="chip">
                      {div?.name || slug}
                      <button type="button" onClick={() => toggleCategory(slug)} aria-label="Remove category filter">
                        &times;
                      </button>
                    </span>
                  );
                })}
                {selectedSubcategories.map(sub => (
                  <span key={sub} className="chip">
                    {sub}
                    <button type="button" onClick={() => toggleSubcategory(sub)} aria-label="Remove subcategory filter">
                      &times;
                    </button>
                  </span>
                ))}
                {selectedBrands.map(brand => (
                  <span key={brand} className="chip">
                    {brand}
                    <button type="button" onClick={() => toggleBrand(brand)} aria-label="Remove brand filter">
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Product Grid */}
            {loading ? (
              <div className="product-grid catalog-grid">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="product-card"
                    style={{ minHeight: '320px', background: 'var(--color-mist)', opacity: 0.6 }}
                  />
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="product-grid catalog-grid" id="productGrid">
                {paginatedProducts.map(product => {
                  const division = divisions.find(d => d.id === product.division_id);
                  const categoryLabel = division?.name || product.category_tag || 'Medical Asset';
                  const brandLabel = getProductBrand(product);

                  return (
                    <article key={product.id} className="product-card">
                      <Link
                        to={`/portfolio/${product.slug}`}
                        className="product-media"
                        style={{ cursor: 'pointer', textDecoration: 'none' }}
                      >
                        <span className="product-cat-pill">{categoryLabel}</span>
                        <img src={product.main_image} alt={product.name} loading="lazy" />
                      </Link>
                      <div className="product-body">
                        <h4>
                          <Link
                            to={`/portfolio/${product.slug}`}
                            style={{ color: 'inherit', textDecoration: 'none' }}
                          >
                            {product.name}
                          </Link>
                        </h4>
                        <div className="product-specs">
                          <span>
                            Model: <b>{product.model_number || 'Standard'}</b>
                          </span>
                          <span>
                            Type: <b>{product.category_tag || 'Clinical'}</b>
                          </span>
                          <span>
                            Brand: <b>{brandLabel}</b>
                          </span>
                        </div>
                        <Link
                          to={`/portfolio/${product.slug}`}
                          className="btn btn-ghost product-details-btn"
                          style={{ textDecoration: 'none' }}
                        >
                          View Details
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="catalog-empty" id="catalogEmpty">
                <span className="catalog-empty-icon">
                  <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <circle cx="11" cy="11" r="7" />
                    <path d="M21 21l-4.3-4.3" />
                  </svg>
                </span>
                <h3>No products match your filters</h3>
                <p>Try removing a filter or search for something else.</p>
                <button
                  className="btn btn-primary"
                  id="emptyClearBtn"
                  type="button"
                  onClick={clearAllFilters}
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <nav className="pagination" id="pagination" aria-label="Product pages">
                <button
                  type="button"
                  className="page-btn"
                  disabled={currentPage === 1}
                  onClick={() => {
                    setCurrentPage(p => Math.max(1, p - 1));
                    window.scrollTo({ top: 260, behavior: 'smooth' });
                  }}
                >
                  &lsaquo;
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    type="button"
                    className={`page-btn ${currentPage === page ? 'active' : ''}`}
                    onClick={() => {
                      setCurrentPage(page);
                      window.scrollTo({ top: 260, behavior: 'smooth' });
                    }}
                  >
                    {page}
                  </button>
                ))}
                <button
                  type="button"
                  className="page-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => {
                    setCurrentPage(p => Math.min(totalPages, p + 1));
                    window.scrollTo({ top: 260, behavior: 'smooth' });
                  }}
                >
                  &rsaquo;
                </button>
              </nav>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
