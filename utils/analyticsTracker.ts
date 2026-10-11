import { supabase } from '../supabaseClient';
import { Product } from '../types';

export interface VisitorGeoInfo {
  city: string;
  region: string;
  country: string;
  label: string; // e.g. "Dhaka, Bangladesh"
}

export interface LocationTrafficMetric {
  city: string;
  country: string;
  label: string;
  pageViews: number;
  productViews: number;
  lastActiveAt: string;
}

export interface ProductViewMetric {
  productId: string;
  name: string;
  modelNumber: string;
  slug: string;
  categoryTag: string;
  mainImage: string;
  views: number;
  lastViewedAt: string;
  locations?: Record<string, number>; // e.g., { "Dhaka": 20, "Chattogram": 5 }
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
  locationViews: Record<string, LocationTrafficMetric>;
  productViews: Record<string, ProductViewMetric>;
  updatedAt: string;
}

const ANALYTICS_SETTING_KEY = 'site_traffic_analytics';
const SESSION_VISITOR_KEY = 'carelink_visitor_session_counted';
const SESSION_GEO_CACHE_KEY = 'carelink_visitor_geo_cache';

const getTodayKey = (): string => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

/**
 * Resolves visitor location (City, Country) silently via IP Geolocation
 * WITHOUT asking for browser GPS permission.
 * Falls back to Timezone inference if an ad-blocker blocks IP lookup APIs.
 */
export const resolveVisitorLocation = async (): Promise<VisitorGeoInfo> => {
  try {
    const cached = sessionStorage.getItem(SESSION_GEO_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.city) return parsed;
    }
  } catch {}

  const fetchWithTimeout = async (url: string, ms = 2500): Promise<any> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    try {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } finally {
      clearTimeout(timer);
    }
  };

  let geo: VisitorGeoInfo | null = null;

  // 1. Primary silent IP lookup: ipwho.is (HTTPS, CORS-enabled, no key required)
  try {
    const data = await fetchWithTimeout('https://ipwho.is/');
    if (data && data.success !== false && data.city) {
      const city = String(data.city).trim();
      const country = String(data.country || 'Bangladesh').trim();
      geo = {
        city,
        region: String(data.region || city).trim(),
        country,
        label: `${city}, ${country}`,
      };
    }
  } catch {}

  // 2. Secondary silent IP lookup: freeipapi.com
  if (!geo) {
    try {
      const data = await fetchWithTimeout('https://freeipapi.com/api/json');
      if (data && data.cityName) {
        const city = String(data.cityName).trim();
        const country = String(data.countryName || 'Bangladesh').trim();
        geo = {
          city,
          region: String(data.regionName || city).trim(),
          country,
          label: `${city}, ${country}`,
        };
      }
    } catch {}
  }

  // 3. Tertiary silent IP lookup: ipapi.co
  if (!geo) {
    try {
      const data = await fetchWithTimeout('https://ipapi.co/json/');
      if (data && data.city) {
        const city = String(data.city).trim();
        const country = String(data.country_name || 'Bangladesh').trim();
        geo = {
          city,
          region: String(data.region || city).trim(),
          country,
          label: `${city}, ${country}`,
        };
      }
    } catch {}
  }

  // 4. Fallback: Timezone-based silent city detection (never blocked, 0 permissions)
  if (!geo) {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      if (tz.includes('Dhaka') || tz.includes('Dacca')) {
        geo = { city: 'Dhaka', region: 'Dhaka', country: 'Bangladesh', label: 'Dhaka, Bangladesh' };
      } else if (tz.includes('/')) {
        const parts = tz.split('/');
        const city = parts[parts.length - 1].replace(/_/g, ' ');
        const region = parts[0];
        geo = { city, region, country: region, label: `${city} (${region})` };
      }
    } catch {}
  }

  const finalGeo: VisitorGeoInfo = geo || {
    city: 'Dhaka',
    region: 'Dhaka',
    country: 'Bangladesh',
    label: 'Dhaka, Bangladesh',
  };

  try {
    sessionStorage.setItem(SESSION_GEO_CACHE_KEY, JSON.stringify(finalGeo));
  } catch {}

  return finalGeo;
};

export const createDefaultAnalytics = (products: Product[] = []): SiteTrafficAnalytics => {
  const dailyHistory: Record<string, { pageViews: number; productViews: number }> = {};
  const today = new Date();

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
      locations: {},
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
    locationViews: {},
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
      locations:
        existing?.locations && typeof existing.locations === 'object'
          ? existing.locations
          : {},
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
    locationViews:
      raw.locationViews && typeof raw.locationViews === 'object'
        ? raw.locationViews
        : {},
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
        description: 'Live website traffic, IP city geolocation, and product view counters',
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
 * Records a page view + silent IP city location for public routes.
 */
export const recordPageView = async (pathname: string): Promise<void> => {
  if (
    !pathname ||
    pathname.startsWith('/command-nexus') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup')
  ) {
    return;
  }

  const now = Date.now();
  if (pathname === lastTrackedPath && now - lastTrackedTime < 3000) {
    return;
  }
  lastTrackedPath = pathname;
  lastTrackedTime = now;

  try {
    const [current, geo] = await Promise.all([
      fetchSiteAnalytics(),
      resolveVisitorLocation(),
    ]);
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

    const cityKey = geo.city || 'Dhaka';
    const existingLoc = current.locationViews[cityKey] || {
      city: cityKey,
      country: geo.country || 'Bangladesh',
      label: geo.label || `${cityKey}, Bangladesh`,
      pageViews: 0,
      productViews: 0,
      lastActiveAt: new Date().toISOString(),
    };

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
      locationViews: {
        ...current.locationViews,
        [cityKey]: {
          ...existingLoc,
          pageViews: existingLoc.pageViews + 1,
          lastActiveAt: new Date().toISOString(),
        },
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
 * Records a view + silent IP city location (e.g. Dhaka: 20) for a specific product.
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
    const [current, geo] = await Promise.all([
      fetchSiteAnalytics(),
      resolveVisitorLocation(),
    ]);
    const todayKey = getTodayKey();
    const todayEntry = current.dailyHistory[todayKey] || { pageViews: 0, productViews: 0 };
    const existingProd = current.productViews[product.id];

    const cityKey = geo.city || 'Dhaka';
    const prevProdLocations = existingProd?.locations || {};
    const nextProdLocations: Record<string, number> = {
      ...prevProdLocations,
      [cityKey]: (prevProdLocations[cityKey] || 0) + 1,
    };

    const existingLoc = current.locationViews[cityKey] || {
      city: cityKey,
      country: geo.country || 'Bangladesh',
      label: geo.label || `${cityKey}, Bangladesh`,
      pageViews: 0,
      productViews: 0,
      lastActiveAt: new Date().toISOString(),
    };

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
      locationViews: {
        ...current.locationViews,
        [cityKey]: {
          ...existingLoc,
          productViews: existingLoc.productViews + 1,
          lastActiveAt: new Date().toISOString(),
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
          locations: nextProdLocations,
        },
      },
      updatedAt: new Date().toISOString(),
    };

    await saveSiteAnalytics(nextAnalytics);
  } catch (err) {
    console.warn('Product view tracking skipped:', err);
  }
};
