export interface CorporateCardConfig {
  title: string;
  description: string;
  badgeText: string;
  footerText: string;
}

export interface CustomSpotlightConfig {
  enabled: boolean;
  productId: string; // If linked to an existing catalog product, or '' for custom
  badge: string;
  headline: string;
  subheadline: string;
  customName: string;
  customModel: string;
  customDescription: string;
  customImage: string;
  customSlug: string;
  priceTag: string;
  bullets: string[];
  primaryButtonText: string;
  secondaryButtonText: string;
}

export interface HomepageControlConfig {
  // Section Visibility Toggles
  sections: {
    showHeroSlider: boolean;
    showSpotlightProduct: boolean;
    showCorporateCards: boolean;
    showFeaturedCarousel: boolean;
    showVideoShowcase: boolean;
    showQuoteWizard: boolean;
    showLatestBlogs: boolean;
  };

  // Hero Slider & Highlighted Products Control
  hero: {
    mode: 'all' | 'custom'; // 'all' = all published products, 'custom' = only selected highlighted product IDs in exact order
    highlightedProductIds: string[];
    productCustomBadges: Record<string, string>; // productId -> custom badge text
    distributorBadgeText: string;
    priceTagText: string;
    primaryBtnText: string;
    secondaryBtnText: string;
    autoPlayMs: number;
  };

  // Dedicated Custom Highlighted Product Spotlight Section
  spotlight: CustomSpotlightConfig;

  // Featured Carousel Control
  carousel: {
    mode: 'all' | 'highlighted_only';
    highlightedProductIds: string[];
    badgeText: string;
    titleMain: string;
    titleAccent: string;
    subtitle: string;
  };

  // Corporate & Projects ("Why Choose Carelink") Section
  corporate: {
    eyebrow: string;
    titleMain: string;
    titleAccent: string;
    subtitle: string;
    cards: CorporateCardConfig[];
  };

  // Quote Request Wizard Section
  quote: {
    eyebrow: string;
    titleLine1: string;
    titleAccent: string;
    description: string;
    bullet1Title: string;
    bullet1Text: string;
    bullet2Title: string;
    bullet2Text: string;
  };

  // Blogs Section Header
  blogs: {
    eyebrow: string;
    titleMain: string;
    titleAccent: string;
  };
}

export const DEFAULT_HOMEPAGE_CONFIG: HomepageControlConfig = {
  sections: {
    showHeroSlider: true,
    showSpotlightProduct: false,
    showCorporateCards: true,
    showFeaturedCarousel: true,
    showVideoShowcase: true,
    showQuoteWizard: true,
    showLatestBlogs: true,
  },
  hero: {
    mode: 'all',
    highlightedProductIds: [],
    productCustomBadges: {},
    distributorBadgeText: 'OFFICIAL DISTRIBUTOR',
    priceTagText: 'Direct Factory Price',
    primaryBtnText: 'View Details',
    secondaryBtnText: 'Get a Quote',
    autoPlayMs: 5000,
  },
  spotlight: {
    enabled: false,
    productId: '',
    badge: 'FEATURED FLAGSHIP SYSTEM',
    headline: 'Highlighted Clinical Solution',
    subheadline: 'Handpicked by our clinical engineering team for superior diagnostic precision and hospital reliability.',
    customName: '',
    customModel: '',
    customDescription: '',
    customImage: '',
    customSlug: '',
    priceTag: 'Official Distributor · Direct Factory Price',
    bullets: [
      'Official Manufacturer Warranty & On-Site Installation',
      'Certified German & Global Clinical Standards',
      'Priority Technical Engineering Support Across Bangladesh'
    ],
    primaryButtonText: 'View Full Specifications',
    secondaryButtonText: 'Request Special Price Quote',
  },
  carousel: {
    mode: 'all',
    highlightedProductIds: [],
    badgeText: 'Official Distributor · Product Catalog',
    titleMain: 'Featured',
    titleAccent: 'Products',
    subtitle: 'Browse our certified medical and dental equipment. Click any product to view details or request a price quote.',
  },
  corporate: {
    eyebrow: 'CORPORATE & PROJECTS',
    titleMain: 'Why Choose',
    titleAccent: 'Carelink',
    subtitle: 'Complete equipment supply and room setup for hospitals, dental clinics, and diagnostic centers.',
    cards: [
      {
        title: 'Dürr Dental Distributor',
        description: 'We are an official distributor of Dürr Dental (Germany), supplying genuine dental imaging, suction, and air systems.',
        badgeText: 'Official Partner',
        footerText: '✓ Made in Germany Quality',
      },
      {
        title: 'Hospital & Clinic Projects',
        description: 'Planning a new clinic or hospital department? We handle full equipment planning, delivery, and room installation.',
        badgeText: 'Turnkey',
        footerText: '✓ Complete Turnkey Setup',
      },
      {
        title: 'Direct Factory Prices',
        description: 'Buy directly from authorized distributors without extra middleman costs, saving your clinic budget.',
        badgeText: 'Direct Value',
        footerText: '✓ Best Value & Warranty',
      },
      {
        title: 'Fast Delivery & Support',
        description: 'Our engineering team provides on-site installation, staff training, and reliable after-sales service.',
        badgeText: '24/7 Support',
        footerText: '✓ Dedicated Service Team',
      },
    ],
  },
  quote: {
    eyebrow: 'GET A PRICE QUOTE',
    titleLine1: 'Request Your',
    titleAccent: 'Equipment Quote',
    description: 'Tell us what medical or dental equipment you need. Our team will send you a clear price quote and delivery plan within 4 hours.',
    bullet1Title: 'Official Warranty',
    bullet1Text: 'All equipment includes full warranty and service support.',
    bullet2Title: 'Project & Bulk Discounts',
    bullet2Text: 'Special pricing for full clinic or hospital room setups.',
  },
  blogs: {
    eyebrow: 'NEWS & UPDATES',
    titleMain: 'Latest',
    titleAccent: 'Articles',
  },
};

export const mergeHomepageConfig = (raw: any): HomepageControlConfig => {
  if (!raw || typeof raw !== 'object') return DEFAULT_HOMEPAGE_CONFIG;
  return {
    sections: {
      ...DEFAULT_HOMEPAGE_CONFIG.sections,
      ...(raw.sections || {}),
    },
    hero: {
      ...DEFAULT_HOMEPAGE_CONFIG.hero,
      ...(raw.hero || {}),
      highlightedProductIds: Array.isArray(raw.hero?.highlightedProductIds)
        ? raw.hero.highlightedProductIds
        : DEFAULT_HOMEPAGE_CONFIG.hero.highlightedProductIds,
      productCustomBadges:
        raw.hero?.productCustomBadges && typeof raw.hero.productCustomBadges === 'object'
          ? raw.hero.productCustomBadges
          : {},
    },
    spotlight: {
      ...DEFAULT_HOMEPAGE_CONFIG.spotlight,
      ...(raw.spotlight || {}),
      bullets: Array.isArray(raw.spotlight?.bullets)
        ? raw.spotlight.bullets
        : DEFAULT_HOMEPAGE_CONFIG.spotlight.bullets,
    },
    carousel: {
      ...DEFAULT_HOMEPAGE_CONFIG.carousel,
      ...(raw.carousel || {}),
      highlightedProductIds: Array.isArray(raw.carousel?.highlightedProductIds)
        ? raw.carousel.highlightedProductIds
        : DEFAULT_HOMEPAGE_CONFIG.carousel.highlightedProductIds,
    },
    corporate: {
      ...DEFAULT_HOMEPAGE_CONFIG.corporate,
      ...(raw.corporate || {}),
      cards:
        Array.isArray(raw.corporate?.cards) && raw.corporate.cards.length === 4
          ? raw.corporate.cards
          : DEFAULT_HOMEPAGE_CONFIG.corporate.cards,
    },
    quote: {
      ...DEFAULT_HOMEPAGE_CONFIG.quote,
      ...(raw.quote || {}),
    },
    blogs: {
      ...DEFAULT_HOMEPAGE_CONFIG.blogs,
      ...(raw.blogs || {}),
    },
  };
};
