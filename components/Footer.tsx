import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronDown, Check, ArrowUpRight } from 'lucide-react';
import { supabase } from '../supabaseClient';

export interface FooterLink {
  label: string;
  path: string;
}

export interface FooterColumn {
  id: string;
  title: string;
  links: FooterLink[];
}

export interface FooterProps {
  brandName?: string;
  columns?: FooterColumn[];
  newsletterLabel?: string;
  newsletterPlaceholder?: string;
  defaultRegion?: string;
  regions?: string[];
}

const DEFAULT_COLUMNS: FooterColumn[] = [
  {
    id: 'medical-equipment',
    title: 'Medical Equipment',
    links: [
      { label: 'Imaging & Radiology', path: '/portfolio?division=imaging-radiology' },
      { label: 'Laboratory & Pathology', path: '/portfolio?division=laboratory-pathology' },
      { label: 'Surgical & Operating Room', path: '/portfolio?division=surgical-ot' },
      { label: 'Critical Care & ICU', path: '/portfolio?division=critical-care' },
      { label: 'Renal Care Systems', path: '/portfolio?division=dialysis' },
      { label: 'Dental Equipment', path: '/portfolio?division=dental' },
    ],
  },
  {
    id: 'quick-navigation',
    title: 'Quick Navigation',
    links: [
      { label: 'Product Portfolio', path: '/portfolio' },
      { label: 'Medical Divisions', path: '/divisions' },
      { label: 'Medical Insights & Blog', path: '/insights' },
      { label: 'Global Alliances', path: '/alliances' },
      { label: 'Request a Quote', path: '/acquisition' },
      { label: 'Medical AI Solutions', path: '/intelligence' },
    ],
  },
  {
    id: 'quality-corporate',
    title: 'Quality & Corporate',
    links: [
      { label: 'Certified Standards', path: '/foundation' },
      { label: 'Procurement Workflow', path: '/acquisition' },
      { label: 'Technical Assistance', path: '/alliances' },
      { label: 'Direct Factory Sourcing', path: '/foundation' },
      { label: 'Direct Factory Pricing', path: '/acquisition' },
    ],
  },
  {
    id: 'account-support',
    title: 'Account & Portal',
    links: [
      { label: 'Client Sign In', path: '/login' },
      { label: 'Partner Registration', path: '/signup' },
      { label: 'Service Terms', path: '/foundation' },
      { label: 'Privacy Policy', path: '/privacypolicy' },
      { label: 'Quality Guidelines', path: '/foundation' },
    ],
  },
];

const DEFAULT_REGIONS = [
  'Bangladesh',
  'Germany',
  'United States',
  'United Kingdom',
  'United Arab Emirates',
  'Singapore',
];

const SOCIAL_ITEMS = [
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/carelinkhealthineers/',
    svg: (
      <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5Z" />
      </svg>
    ),
  },
  {
    name: 'X (Twitter)',
    href: 'https://www.twitter.com/carelinkhealthineers/',
    svg: (
      <svg className="w-[17px] h-[17px] fill-current" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: 'YouTube',
    href: 'https://www.youtube.com/@carelinkhealthineers',
    svg: (
      <svg className="w-[19px] h-[19px] fill-current" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
 
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/carelinkhealthineers/',
    svg: (
      <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
  },
  {
    name: 'Product Portfolio',
    href: '/portfolio',
    isInternal: true,
    svg: (
      <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z" />
      </svg>
    ),
  },
];

export const Footer: React.FC<FooterProps> = ({
  brandName = 'Carelink Healthineers',
  columns = DEFAULT_COLUMNS,
  newsletterLabel = 'Stay in the loop',
  newsletterPlaceholder = 'Email address',
  defaultRegion = 'Bangladesh',
  regions = DEFAULT_REGIONS,
}) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(defaultRegion);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [contactInfo, setContactInfo] = useState({
    address: 'Shyamoli, Adabor, Dhaka 1207',
    phone: '01339-482917',
    email: 'carelinkhealthineers@gmail.com',
  });

  // Global Quote Requisition Modal State
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [divisions, setDivisions] = useState<{ id: string; name: string }[]>([]);
  const [quoteForm, setQuoteForm] = useState({
    name: '',
    email: '',
    org: '',
    category: 'Imaging & Radiology',
    message: ''
  });
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);

  useEffect(() => {
    const fetchContactAndDivisions = async () => {
      try {
        const [{ data: settingsData }, { data: divData }] = await Promise.all([
          supabase.from('settings').select('key, value').filter('category', 'eq', 'footer'),
          supabase.from('divisions').select('id, name').order('order_index')
        ]);

        if (settingsData && settingsData.length > 0) {
          const info = { ...contactInfo };
          settingsData.forEach((item) => {
            if (item.key === 'footer_address' && item.value) info.address = item.value;
            if (item.key === 'footer_phone' && item.value) info.phone = item.value;
            if (item.key === 'footer_email' && item.value) info.email = item.value;
          });
          setContactInfo(info);
        }

        if (divData && divData.length > 0) {
          setDivisions(divData);
          setQuoteForm(prev => ({ ...prev, category: divData[0].name }));
        }
      } catch (err) {
        console.error('Footer Registry Sync Failed:', err);
      }
    };
    fetchContactAndDivisions();
  }, []);

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteForm.name.trim()) return;
    setQuoteSubmitting(true);

    const payloadMessage = `[Category: ${quoteForm.category}] - ${quoteForm.message}`;

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
        setQuoteForm(prev => ({ ...prev, name: '', email: '', org: '', message: '' }));
      }, 1800);
    } catch (err) {
      console.error('Quote submission error:', err);
    } finally {
      setQuoteSubmitting(false);
    }
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 4000);
  };

  const toggleAccordion = (id: string) => {
    setOpenAccordion((prev) => (prev === id ? null : id));
  };

  return (
    <>
      {/* ============ GLOBAL MINI CTA OVER FOOTER ============ */}
      <div className="sf-products-page">
        <section className="mini-cta">
          <div className="wrap">
            <div className="mini-cta-box">
              <div>
                <span className="eyebrow" style={{ color: '#fff' }}>
                  Not Listed Here?
                </span>
                <h3>Send us a custom product requisition.</h3>
                <p>
                  Our sourcing team can quote almost any medical, laboratory or hospital equipment on request.
                </p>
              </div>
              <div className="mini-cta-actions">
                <button
                  type="button"
                  className="btn btn-on-dark js-quote-trigger"
                  onClick={() => {
                    setQuoteSubmitted(false);
                    setQuoteModalOpen(true);
                  }}
                >
                  Request Quotation
                </button>
                <a
                  href={`https://wa.me/${contactInfo.phone.replace(/[^0-9]/g, '').replace(/^0/, '880') || '8801339482917'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-on-dark"
                >
                  WhatsApp Us
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ============ GLOBAL QUOTE MODAL ============ */}
        <div
          className={`quote-modal ${quoteModalOpen ? 'open' : ''}`}
          onClick={e => {
            if (e.target === e.currentTarget) setQuoteModalOpen(false);
          }}
        >
          <div className="quote-modal-box">
            <button
              type="button"
              className="quote-modal-close"
              aria-label="Close"
              onClick={() => setQuoteModalOpen(false)}
            >
              &times;
            </button>
            <form className="cta-form" onSubmit={handleQuoteSubmit}>
              <div className="cta-form-head">
                <span>Product Requisition</span>
                <h3>Request a quotation</h3>
              </div>
              {quoteSubmitted ? (
                <div style={{ padding: '24px 0', textAlign: 'center' }}>
                  <h4 style={{ color: 'var(--color-green)', marginBottom: '8px', fontSize: '18px' }}>
                    Requisition Submitted!
                  </h4>
                  <p style={{ fontSize: '13.5px' }}>
                    Our clinical sourcing team has received your inquiry and will respond shortly.
                  </p>
                </div>
              ) : (
                <>
                  <label htmlFor="global-qm-name">Name</label>
                  <input
                    id="global-qm-name"
                    type="text"
                    required
                    placeholder="Your name"
                    value={quoteForm.name}
                    onChange={e => setQuoteForm({ ...quoteForm, name: e.target.value })}
                  />
                  <label htmlFor="global-qm-email">Email Address</label>
                  <input
                    id="global-qm-email"
                    type="email"
                    required
                    placeholder="your@email.com"
                    value={quoteForm.email}
                    onChange={e => setQuoteForm({ ...quoteForm, email: e.target.value })}
                  />
                  <label htmlFor="global-qm-org">Hospital / Clinic / Lab</label>
                  <input
                    id="global-qm-org"
                    type="text"
                    required
                    placeholder="Organization name"
                    value={quoteForm.org}
                    onChange={e => setQuoteForm({ ...quoteForm, org: e.target.value })}
                  />
                  <label htmlFor="global-qm-cat">Product Category</label>
                  <select
                    id="global-qm-cat"
                    value={quoteForm.category}
                    onChange={e => setQuoteForm({ ...quoteForm, category: e.target.value })}
                  >
                    {divisions.length > 0 ? (
                      divisions.map(div => (
                        <option key={div.id} value={div.name}>
                          {div.name}
                        </option>
                      ))
                    ) : (
                      <>
                        <option>Imaging &amp; Radiology</option>
                        <option>Laboratory Equipment</option>
                        <option>OT &amp; Hospital Furniture</option>
                        <option>Dental Equipment</option>
                      </>
                    )}
                  </select>
                  <label htmlFor="global-qm-msg">Message</label>
                  <textarea
                    id="global-qm-msg"
                    rows={3}
                    placeholder="Tell us what you need..."
                    value={quoteForm.message}
                    onChange={e => setQuoteForm({ ...quoteForm, message: e.target.value })}
                  />
                  <button type="submit" className="btn btn-primary" disabled={quoteSubmitting}>
                    {quoteSubmitting ? 'Submitting…' : 'Submit Requisition'}
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      </div>

      <footer
        className="w-full bg-[var(--footer-bg,#000000)] text-[var(--footer-text-primary,#ffffff)] font-sans antialiased selection:bg-white selection:text-black border-t border-[var(--footer-border,#27272a)] overflow-x-hidden"
        aria-label="Site Footer"
      >
      <div className="max-w-[var(--footer-max-width,1280px)] mx-auto px-6 sm:px-10 lg:px-16 pt-12 pb-10 md:pt-16 md:pb-14">
        
        {/* BRAND & PARTNER HEADER BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-10 mb-10 border-b border-[var(--footer-border,#27272a)]">
          <Link to="/" className="flex items-center gap-3.5 group">
            <img
              src="https://i.imgur.com/y0UvXGu.png"
              alt="Carelink Healthineers Logo"
              referrerPolicy="no-referrer"
              className="w-11 h-11 object-contain brightness-110"
            />
            <div>
              <span className="text-xl font-bold tracking-tight text-white block leading-none font-serif-classical">
                Carelink
              </span>
              <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-[0.3em] mt-1 block">
                Healthineers
              </span>
            </div>
          </Link>

          <p className="text-xs text-[var(--footer-text-muted,#9ca3af)] max-w-md leading-relaxed">
            The premier B2B medical equipment procurement standard. Connecting healthcare networks with direct factory pricing and certified medical equipment.
          </p>

          <div className="flex items-center gap-3 self-start md:self-auto border border-[var(--footer-border,#27272a)] px-3.5 py-2 bg-neutral-950">
            <img
              src="/durr-dental-logo-white.svg"
              alt="Dürr Dental Official Distributor"
              className="h-4 w-auto object-contain"
            />
            <span className="text-[10px] font-semibold text-neutral-300 uppercase tracking-widest">
              Official Distributor
            </span>
          </div>
        </div>

        {/* TOP SECTION: 4 Evenly Distributed Columns */}
        <nav
          aria-label="Footer Navigation"
          className="grid grid-cols-1 md:grid-cols-4 gap-0 md:gap-8 lg:gap-12 pb-10 md:pb-14 border-b border-[var(--footer-border,#27272a)]"
        >
          {columns.map((column) => {
            const isOpen = openAccordion === column.id;
            return (
              <div
                key={column.id}
                className="border-b border-[var(--footer-border,#27272a)] md:border-b-0"
              >
                {/* Mobile Accordion Trigger / Desktop Heading */}
                <div className="flex items-center justify-between py-4 md:py-0 md:mb-5">
                  <h2 className="text-[var(--footer-heading-size,0.9375rem)] font-bold tracking-[0.06em] text-[var(--footer-text-primary,#ffffff)]">
                    {column.title}
                  </h2>
                  <button
                    type="button"
                    onClick={() => toggleAccordion(column.id)}
                    aria-expanded={isOpen}
                    aria-controls={`footer-col-${column.id}`}
                    className="md:hidden p-1 -mr-1 text-[var(--footer-text-muted,#9ca3af)] hover:text-white transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-white"
                  >
                    <ChevronDown
                      size={18}
                      className={`transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-white' : ''
                      }`}
                    />
                    <span className="sr-only">Toggle {column.title} links</span>
                  </button>
                </div>

                {/* Links List */}
                <ul
                  id={`footer-col-${column.id}`}
                  className={`space-y-2.5 pb-5 md:pb-0 ${
                    isOpen ? 'block' : 'hidden md:block'
                  }`}
                >
                  {column.links.map((link, idx) => (
                    <li key={idx}>
                      <Link
                        to={link.path}
                        className="inline-block text-[var(--footer-link-size,0.875rem)] font-normal text-[var(--footer-text-secondary,#d4d4d8)] hover:text-[var(--footer-text-primary,#ffffff)] hover:underline underline-offset-4 decoration-neutral-500 transition-colors duration-150 py-0.5"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </nav>

        {/* MIDDLE UTILITY SECTION: Newsletter, Region Selector, Social Icons */}
        <div className="py-8 md:py-10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-8 lg:gap-6">
          {/* Left: Newsletter Signup */}
          <form
            onSubmit={handleNewsletterSubmit}
            className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full lg:w-auto"
          >
            <label
              htmlFor="footer-newsletter-email"
              className="text-[0.9375rem] font-semibold tracking-wide text-[var(--footer-text-primary,#ffffff)] whitespace-nowrap"
            >
              {newsletterLabel}
            </label>
            <div className="relative flex items-center w-full sm:w-64 md:w-72">
              <input
                id="footer-newsletter-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={subscribed ? 'Thank you for subscribing' : newsletterPlaceholder}
                disabled={subscribed}
                required
                aria-label={newsletterPlaceholder}
                className="w-full h-9 pl-3.5 pr-10 bg-[var(--footer-input-bg,#ffffff)] text-[var(--footer-input-text,#111827)] placeholder:text-neutral-500 text-xs font-normal border border-transparent focus:outline-none focus:ring-1 focus:ring-neutral-400 transition-all"
              />
              <button
                type="submit"
                aria-label="Submit email for newsletter"
                className="absolute right-0 top-0 h-9 w-9 flex items-center justify-center text-neutral-800 hover:text-black transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-black"
              >
                {subscribed ? (
                  <Check size={16} className="text-emerald-600" />
                ) : (
                  <ChevronRight size={17} strokeWidth={2.2} />
                )}
              </button>
            </div>
          </form>

          {/* Center: Region Selector Dropdown */}
          <div className="flex items-center justify-start lg:justify-center w-full lg:w-auto">
            <div className="relative inline-flex items-center w-full sm:w-auto">
              <label htmlFor="footer-region-select" className="sr-only">
                Select Region
              </label>
              <select
                id="footer-region-select"
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="appearance-none w-full sm:w-auto bg-transparent text-[var(--footer-text-secondary,#d4d4d8)] hover:text-white text-xs sm:text-[0.8125rem] font-normal tracking-wide py-2 pl-3 pr-8 border border-[var(--footer-border,#27272a)] lg:border-transparent hover:border-neutral-700 focus:outline-none focus:border-neutral-500 cursor-pointer transition-colors"
              >
                {regions.map((region) => (
                  <option
                    key={region}
                    value={region}
                    className="bg-neutral-950 text-white py-1"
                  >
                    {region}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-2.5 text-[var(--footer-text-muted,#9ca3af)]"
              />
            </div>
          </div>

          {/* Right: Monochrome Social Media Icons */}
          <div
            className="flex items-center justify-start lg:justify-end flex-wrap gap-5 sm:gap-6"
            aria-label="Social Media Links"
          >
            {SOCIAL_ITEMS.map((item) =>
              item.isInternal ? (
                <Link
                  key={item.name}
                  to={item.href}
                  aria-label={item.name}
                  title={item.name}
                  className="text-[var(--footer-text-secondary,#d4d4d8)] hover:text-white transition-colors duration-150 p-1 -m-1 focus:outline-none focus-visible:ring-1 focus-visible:ring-white"
                >
                  {item.svg}
                </Link>
              ) : (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.name}
                  title={item.name}
                  className="text-[var(--footer-text-secondary,#d4d4d8)] hover:text-white transition-colors duration-150 p-1 -m-1 focus:outline-none focus-visible:ring-1 focus-visible:ring-white"
                >
                  {item.svg}
                </a>
              )
            )}
          </div>
        </div>

        {/* FINAL COPYRIGHT & LEGAL AREA */}
        <div className="pt-6 md:pt-8 text-center space-y-2 text-[var(--footer-legal-size,0.75rem)] leading-relaxed text-[var(--footer-text-muted,#9ca3af)]">
          <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1">
            <span>
              Copyright &copy; {new Date().getFullYear()} {brandName}. All rights reserved.
            </span>
            <Link
              to="/foundation"
              className="text-[var(--footer-text-secondary,#d4d4d8)] hover:text-white underline underline-offset-2 transition-colors ml-1"
            >
              Service Terms
            </Link>
            <span aria-hidden="true" className="text-neutral-600 px-0.5">
              |
            </span>
            <Link
              to="/privacypolicy"
              className="text-[var(--footer-text-secondary,#d4d4d8)] hover:text-white underline underline-offset-2 transition-colors"
            >
              Privacy Policy
            </Link>
            <span aria-hidden="true" className="text-neutral-600 px-0.5">
              |
            </span>
            <Link
              to="/foundation"
              className="text-[var(--footer-text-secondary,#d4d4d8)] hover:text-white underline underline-offset-2 transition-colors"
            >
              Quality Guidelines
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[0.75rem] text-[var(--footer-text-muted,#9ca3af)]">
            <a
              href={`tel:${contactInfo.phone.replace(/[^0-9+]/g, '')}`}
              className="hover:text-white transition-colors tabular-nums"
            >
              {contactInfo.phone}
            </a>
            <span aria-hidden="true" className="text-neutral-600">
              |
            </span>
            <span>Office Registry ({contactInfo.address})</span>
            <span aria-hidden="true" className="text-neutral-600 hidden sm:inline">
              |
            </span>
            <a
              href={`mailto:${contactInfo.email}`}
              className="hover:text-white transition-colors hidden sm:inline"
            >
              {contactInfo.email}
            </a>
            <span aria-hidden="true" className="text-neutral-600 hidden md:inline">
              |
            </span>
            <span className="hidden md:inline">
              Developed by{' '}
              <a
                href="https://zaironx.top"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--footer-text-secondary,#d4d4d8)] hover:text-white underline underline-offset-2 transition-colors inline-flex items-center gap-0.5"
              >
                Mohibbul Wara Orjon
                <ArrowUpRight size={11} className="inline" />
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
    </>
  );
};
