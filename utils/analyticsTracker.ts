import { supabase } from '../supabaseClient';
import { Product } from '../types';

export interface ProductViewMetric {
  productId: string;
  name: string;
  modelNumber: string;
  slug: string;
  categoryTag: string;
  mainImage: string;
  views: number;
  lastViewedAt: string;
}

export interface DailyTrafficPoint {
  date: string; // YYYY-MM-DD
  label: string; // e.g., "Oct 11"
  pageViews: number;
  productViews: number;
}

export interface SiteTrafficAnalytics {
  totalPageViews: number;
  totalProductViews: number;
  uniqueVisitors: number;
  dailyHistory: Record<string, { pageViews: number; productViews: number }>;
  routeViews: Record<string, number>;
  productViews: Record<string, ProductViewMetric>;
  updatedAt: string;
}

const ANALYTICS_SETTING_KEY = 'site_traffic_analytics';
const SESSION_VISITOR_KEY = 'carelink_visitor_session_counted';

const getTodayKey = (): string => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

export const createDefaultAnalytics = (products: Product[] = []): SiteTrafficAnalytics => {
  const dailyHistory: Record<string, { pageViews: number; productViews: number }> = {};
  const today = new Date();

  // Initialize last 7 days with clean baseline structure if empty
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().split('T')[0];
    dailyHistory[key] = {
      pageViews: 0,
      productViews: 0,
    };
  }

  const productViews: Record<string, ProductViewMetric> = {};
  products.forEach((p) => {
    productViews[p.id] = {
      productId: p.id,
      name: p.name,
      modelNumber: p.model_number || '',
      slug: p.slug,
      categoryTag: p.category_tag || 'Medical Equipment',
      mainImage: p.main_image || '',
      views: 0,
      lastViewedAt: p.created_at || new Date().toISOString(),
    };
  });

  return {
    totalPageViews: 0,
    totalProductViews: 0,
    uniqueVisitors: 0,
    dailyHistory,
    routeViews: {
      '/': 0,
      '/portfolio': 0,
      '/acquisition': 0,
      '/divisions': 0,
      '/alliances': 0,
      '/insights': 0,
    },
    productViews,
    updatedAt: new Date().toISOString(),
  };
};

export const normalizeAnalytics = (
  raw: any,
  products: Product[] = []
): SiteTrafficAnalytics => {
  const base = createDefaultAnalytics(products);
  if (!raw || typeof raw !== 'object' || Object.keys(raw).length === 0) {
    return base;
  }

  const mergedProductViews: Record<string, ProductViewMetric> = {
    ...base.productViews,
    ...(raw.productViews || {}),
  };

  // Ensure all current catalog products have up-to-date metadata in the map
  products.forEach((p) => {
    const existing = mergedProductViews[p.id];
    mergedProductViews[p.id] = {
      productId: p.id,
      name: p.name,
      modelNumber: p.model_number || existing?.modelNumber || '',
      slug: p.slug || existing?.slug || '',
      categoryTag: p.category_tag || existing?.categoryTag || 'Medical Equipment',
      mainImage: p.main_image || existing?.mainImage || '',
      views: typeof existing?.views === 'number' ? existing.views : 0,
      lastViewedAt: existing?.lastViewedAt || p.created_at || new Date().toISOString(),
    };
  });

  return {
    totalPageViews: typeof raw.totalPageViews === 'number' ? raw.totalPageViews : 0,
    totalProductViews: typeof raw.totalProductViews === 'number' ? raw.totalProductViews : 0,
    uniqueVisitors: typeof raw.uniqueVisitors === 'number' ? raw.uniqueVisitors : 0,
    dailyHistory: {
      ...base.dailyHistory,
      ...(raw.dailyHistory || {}),
    },
    routeViews: {
      ...base.routeViews,
      ...(raw.routeViews || {}),
    },
    productViews: mergedProductViews,
    updatedAt: raw.updatedAt || new Date().toISOString(),
  };
};

export const fetchSiteAnalytics = async (
  products: Product[] = []
): Promise<SiteTrafficAnalytics> => {
  try {
    const { data } = await supabase
      .from('settings')
      .select('value')
      .eq('key', ANALYTICS_SETTING_KEY)
      .maybeSingle();

    if (data?.value) {
      try {
        const parsed = JSON.parse(data.value);
        return normalizeAnalytics(parsed, products);
      } catch {
        return createDefaultAnalytics(products);
      }
    }
  } catch (err) {
    console.warn('Analytics fetch notice:', err);
  }
  return createDefaultAnalytics(products);
};

const saveSiteAnalytics = async (analytics: SiteTrafficAnalytics): Promise<void> => {
  try {
    await supabase.from('settings').upsert(
      {
        key: ANALYTICS_SETTING_KEY,
        value: JSON.stringify(analytics),
        category: 'analytics',
        description: 'Live website traffic and product view counters',
      },
      { onConflict: 'key' }
    );
  } catch (err) {
    console.warn('Analytics save notice:', err);
  }
};

let lastTrackedPath = '';
let lastTrackedTime = 0;

/**
 * Records a page view for public routes.
 */
export const recordPageView = async (pathname: string): Promise<void> => {
  if (!pathname || pathname.startsWith('/command-nexus') || pathname.startsWith('/login') || pathname.startsWith('/signup')) {
    return;
  }

  const now = Date.now();
  if (pathname === lastTrackedPath && now - lastTrackedTime < 3000) {
    return;
  }
  lastTrackedPath = pathname;
  lastTrackedTime = now;

  try {
    const current = await fetchSiteAnalytics();
    const todayKey = getTodayKey();

    let isNewSession = false;
    try {
      if (!sessionStorage.getItem(SESSION_VISITOR_KEY)) {
        sessionStorage.setItem(SESSION_VISITOR_KEY, '1');
        isNewSession = true;
      }
    } catch {}

    const todayEntry = current.dailyHistory[todayKey] || { pageViews: 0, productViews: 0 };

    const normalizedRoute = pathname.startsWith('/portfolio/')
      ? '/portfolio/[product]'
      : pathname.startsWith('/insights/')
      ? '/insights/[article]'
      : pathname;

    const nextAnalytics: SiteTrafficAnalytics = {
      ...current,
      totalPageViews: current.totalPageViews + 1,
      uniqueVisitors: current.uniqueVisitors + (isNewSession ? 1 : 0),
      dailyHistory: {
        ...current.dailyHistory,
        [todayKey]: {
          ...todayEntry,
          pageViews: todayEntry.pageViews + 1,
        },
      },
      routeViews: {
        ...current.routeViews,
        [normalizedRoute]: (current.routeViews[normalizedRoute] || 0) + 1,
      },
      updatedAt: new Date().toISOString(),
    };

    await saveSiteAnalytics(nextAnalytics);
  } catch (err) {
    console.warn('Page view tracking skipped:', err);
  }
};

let lastProductViewId = '';
let lastProductViewTime = 0;

/**
 * Records a view for a specific product when a visitor views its details page.
 */
export const recordProductView = async (product: Product): Promise<void> => {
  if (!product || !product.id) return;

  const now = Date.now();
  if (product.id === lastProductViewId && now - lastProductViewTime < 4000) {
    return;
  }
  lastProductViewId = product.id;
  lastProductViewTime = now;

  try {
    const current = await fetchSiteAnalytics();
    const todayKey = getTodayKey();
    const todayEntry = current.dailyHistory[todayKey] || { pageViews: 0, productViews: 0 };
    const existingProd = current.productViews[product.id];

    const nextAnalytics: SiteTrafficAnalytics = {
      ...current,
      totalProductViews: current.totalProductViews + 1,
      dailyHistory: {
        ...current.dailyHistory,
        [todayKey]: {
          ...todayEntry,
          productViews: todayEntry.productViews + 1,
        },
      },
      productViews: {
        ...current.productViews,
        [product.id]: {
          productId: product.id,
          name: product.name,
          modelNumber: product.model_number || '',
          slug: product.slug,
          categoryTag: product.category_tag || 'Medical Equipment',
          mainImage: product.main_image || '',
          views: (existingProd?.views || 0) + 1,
          lastViewedAt: new Date().toISOString(),
        },
      },
      updatedAt: new Date().toISOString(),
    };

    await saveSiteAnalytics(nextAnalytics);
  } catch (err) {
    console.warn('Product view tracking skipped:', err);
  }
};
