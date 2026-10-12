import { supabase } from '../supabaseClient';
import { Product } from '../types';
import {
  BANGLADESH_64_DISTRICTS,
  matchBangladeshDistrict,
  UNKNOWN_LOCATION_ID,
  INTERNATIONAL_LOCATION_ID,
} from './bangladeshDistricts';

export type AnalyticsEventName =
  | 'page_view'
  | 'product_view'
  | 'search'
  | 'quote_form_start'
  | 'quote_form_submit'
  | 'whatsapp_click'
  | 'phone_click'
  | 'email_click'
  | 'contact_form_submit';

export type TrafficChannel =
  | 'Organic Search'
  | 'Direct'
  | 'Referral'
  | 'Social'
  | 'Campaign';

export interface VisitorGeoInfo {
  city: string;
  region: string;
  country: string;
  label: string;
  districtId: string; // One of the 64 BD district IDs, 'unknown_location', or 'international'
  districtName: string;
  divisionName: string;
  confidence: 'verified_ip' | 'timezone_estimate' | 'unavailable';
}

export interface LocationTrafficMetric {
  city: string;
  country: string;
  label: string;
  pageViews: number;
  productViews: number;
  lastActiveAt: string;
}

export interface DistrictAnalyticsMetric {
  districtId: string;
  districtName: string;
  divisionName: string;
  pageViews: number;
  uniqueVisitors: number;
  productViews: number;
  inquiries: number;
  quoteRequests: number;
  whatsappClicks: number;
  phoneClicks: number;
  emailClicks: number;
  productBreakdown: Record<string, number>; // productId -> views in this district
  dailyViews: Record<string, number>; // YYYY-MM-DD -> pageViews in this district
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
  uniqueVisitors: number;
  inquiries: number;
  quoteRequests: number;
  whatsappClicks: number;
  phoneClicks: number;
  emailClicks: number;
  lastViewedAt: string;
  locations?: Record<string, number>; // districtName -> views
  dailyViews?: Record<string, number>; // YYYY-MM-DD -> views
  referralSources?: Record<string, number>; // TrafficChannel -> views
}

export interface DailyAnalyticsSnapshot {
  pageViews: number;
  uniqueVisitors: number;
  productViews: number;
  inquiries: number;
  quoteSubmits: number;
  whatsappClicks: number;
  phoneClicks: number;
  emailClicks: number;
  organicViews: number;
  directViews: number;
  referralViews: number;
  socialViews: number;
  campaignViews: number;
  engagementSeconds: number;
  engagedSessions: number;
}

export interface SiteTrafficAnalytics {
  totalPageViews: number;
  totalProductViews: number;
  uniqueVisitors: number;
  returningVisitors: number;
  totalInquiries: number;
  totalQuoteSubmits: number;
  totalQuoteStarts: number;
  totalWhatsappClicks: number;
  totalPhoneClicks: number;
  totalEmailClicks: number;
  totalSearches: number;
  totalEngagementSeconds: number;
  totalEngagedSessions: number;
  eventCounts: Record<AnalyticsEventName, number>;
  channelViews: Record<TrafficChannel, number>;
  searchQueries: Record<string, number>;
  dailyHistory: Record<string, DailyAnalyticsSnapshot>;
  routeViews: Record<string, number>;
  routeInquiries: Record<string, number>;
  locationViews: Record<string, LocationTrafficMetric>;
  districtStats: Record<string, DistrictAnalyticsMetric>;
  productViews: Record<string, ProductViewMetric>;
  updatedAt: string;
}

const ANALYTICS_SETTING_KEY = 'site_traffic_analytics';
const SESSION_VISITOR_KEY = 'carelink_visitor_session_counted';
const LOCAL_VISITOR_KNOWN_KEY = 'carelink_visitor_returning_flag';
const SESSION_PRODUCTS_VIEWED_KEY = 'carelink_session_products_viewed';
const SESSION_GEO_CACHE_KEY = 'carelink_visitor_geo_cache_v2';

const getTodayKey = (): string => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

/**
 * Basic bot/crawler filter so automated crawlers do not pollute analytics counts.
 */
const isLikelyBot = (): boolean => {
  if (typeof navigator === 'undefined') return true;
  const ua = (navigator.userAgent || '').toLowerCase();
  return /bot|crawler|spider|crawling|headless|lighthouse|pingdom|gtmetrix|facebookexternalhit|whatsapp/i.test(
    ua
  );
};

/**
 * Classifies traffic source from document.referrer and UTM parameters.
 */
export const detectTrafficChannel = (): TrafficChannel => {
  if (typeof window === 'undefined') return 'Direct';
  const params = new URLSearchParams(window.location.search);
  if (
    params.get('utm_source') ||
    params.get('utm_medium') ||
    params.get('utm_campaign') ||
    params.get('gclid') ||
    params.get('fbclid')
  ) {
    return 'Campaign';
  }

  const ref = (document.referrer || '').toLowerCase();
  if (!ref) return 'Direct';
  if (ref.includes(window.location.hostname.toLowerCase())) return 'Direct';

  if (/google\.|bing\.|yahoo\.|duckduckgo\.|baidu\.|yandex\./i.test(ref)) {
    return 'Organic Search';
  }
  if (/facebook\.|instagram\.|linkedin\.|t\.co|twitter\.|youtube\.|wa\.me|whatsapp\./i.test(ref)) {
    return 'Social';
  }
  return 'Referral';
};

/**
 * Resolves visitor location silently via IP Geolocation WITHOUT browser GPS permission.
 * Maps to one of Bangladesh's 64 districts when supported by IP data, or marks as
 * 'unknown_location' / 'international' honestly when unavailable.
 */
export const resolveVisitorLocation = async (): Promise<VisitorGeoInfo> => {
  try {
    const cached = sessionStorage.getItem(SESSION_GEO_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.districtId) return parsed;
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

  let rawCity = '';
  let rawRegion = '';
  let rawCountry = '';
  let ipResolved = false;

  // 1. Primary silent IP lookup: ipwho.is
  try {
    const data = await fetchWithTimeout('https://ipwho.is/');
    if (data && data.success !== false && data.city) {
      rawCity = String(data.city).trim();
      rawRegion = String(data.region || '').trim();
      rawCountry = String(data.country || '').trim();
      ipResolved = true;
    }
  } catch {}

  // 2. Secondary silent IP lookup: freeipapi.com
  if (!ipResolved) {
    try {
      const data = await fetchWithTimeout('https://freeipapi.com/api/json');
      if (data && data.cityName) {
        rawCity = String(data.cityName).trim();
        rawRegion = String(data.regionName || '').trim();
        rawCountry = String(data.countryName || '').trim();
        ipResolved = true;
      }
    } catch {}
  }

  // 3. Tertiary silent IP lookup: ipapi.co
  if (!ipResolved) {
    try {
      const data = await fetchWithTimeout('https://ipapi.co/json/');
      if (data && data.city) {
        rawCity = String(data.city).trim();
        rawRegion = String(data.region || '').trim();
        rawCountry = String(data.country_name || '').trim();
        ipResolved = true;
      }
    } catch {}
  }

  let finalGeo: VisitorGeoInfo;

  if (ipResolved) {
    const matchedDistrict = matchBangladeshDistrict(rawCity, rawRegion, rawCountry);
    if (matchedDistrict) {
      finalGeo = {
        city: matchedDistrict.name,
        region: matchedDistrict.division,
        country: 'Bangladesh',
        label: `${matchedDistrict.name}, ${matchedDistrict.division}`,
        districtId: matchedDistrict.id,
        districtName: matchedDistrict.name,
        divisionName: matchedDistrict.division,
        confidence: 'verified_ip',
      };
    } else if (
      rawCountry &&
      !rawCountry.toLowerCase().includes('bangladesh') &&
      rawCountry.toLowerCase() !== 'bd'
    ) {
      finalGeo = {
        city: rawCity || rawCountry,
        region: rawRegion || rawCountry,
        country: rawCountry,
        label: `${rawCity ? `${rawCity}, ` : ''}${rawCountry}`,
        districtId: INTERNATIONAL_LOCATION_ID,
        districtName: 'International (Outside BD)',
        divisionName: 'International',
        confidence: 'verified_ip',
      };
    } else {
      finalGeo = {
        city: rawCity || 'Unknown Location',
        region: rawRegion || 'Unknown',
        country: rawCountry || 'Bangladesh',
        label: rawCity ? `${rawCity}, Bangladesh` : 'Unknown / Unavailable Location',
        districtId: UNKNOWN_LOCATION_ID,
        districtName: 'Unknown / Unavailable Location',
        divisionName: 'Unmapped',
        confidence: 'unavailable',
      };
    }
  } else {
    // Timezone check when IP lookup is blocked by ad-blocker or privacy proxy
    let tz = '';
    try {
      tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    } catch {}

    if (tz.includes('Dhaka') || tz.includes('Dacca')) {
      finalGeo = {
        city: 'Dhaka',
        region: 'Dhaka',
        country: 'Bangladesh',
        label: 'Dhaka (Timezone Estimate)',
        districtId: 'dhaka',
        districtName: 'Dhaka',
        divisionName: 'Dhaka',
        confidence: 'timezone_estimate',
      };
    } else {
      finalGeo = {
        city: 'Unknown Location',
        region: 'Unknown',
        country: 'Unknown',
        label: 'Unknown / Unavailable Location',
        districtId: UNKNOWN_LOCATION_ID,
        districtName: 'Unknown / Unavailable Location',
        divisionName: 'Unmapped',
        confidence: 'unavailable',
      };
    }
  }

  try {
    sessionStorage.setItem(SESSION_GEO_CACHE_KEY, JSON.stringify(finalGeo));
  } catch {}

  return finalGeo;
};

export const createEmptyDailySnapshot = (): DailyAnalyticsSnapshot => ({
  pageViews: 0,
  uniqueVisitors: 0,
  productViews: 0,
  inquiries: 0,
  quoteSubmits: 0,
  whatsappClicks: 0,
  phoneClicks: 0,
  emailClicks: 0,
  organicViews: 0,
  directViews: 0,
  referralViews: 0,
  socialViews: 0,
  campaignViews: 0,
  engagementSeconds: 0,
  engagedSessions: 0,
});

export const createDefaultAnalytics = (products: Product[] = []): SiteTrafficAnalytics => {
  const dailyHistory: Record<string, DailyAnalyticsSnapshot> = {};
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().split('T')[0];
    dailyHistory[key] = createEmptyDailySnapshot();
  }

  const districtStats: Record<string, DistrictAnalyticsMetric> = {};
  BANGLADESH_64_DISTRICTS.forEach((dist) => {
    districtStats[dist.id] = {
      districtId: dist.id,
      districtName: dist.name,
      divisionName: dist.division,
      pageViews: 0,
      uniqueVisitors: 0,
      productViews: 0,
      inquiries: 0,
      quoteRequests: 0,
      whatsappClicks: 0,
      phoneClicks: 0,
      emailClicks: 0,
      productBreakdown: {},
      dailyViews: {},
      lastActiveAt: '',
    };
  });

  districtStats[UNKNOWN_LOCATION_ID] = {
    districtId: UNKNOWN_LOCATION_ID,
    districtName: 'Unknown / Unavailable Location',
    divisionName: 'Unmapped',
    pageViews: 0,
    uniqueVisitors: 0,
    productViews: 0,
    inquiries: 0,
    quoteRequests: 0,
    whatsappClicks: 0,
    phoneClicks: 0,
    emailClicks: 0,
    productBreakdown: {},
    dailyViews: {},
    lastActiveAt: '',
  };

  districtStats[INTERNATIONAL_LOCATION_ID] = {
    districtId: INTERNATIONAL_LOCATION_ID,
    districtName: 'International (Outside BD)',
    divisionName: 'International',
    pageViews: 0,
    uniqueVisitors: 0,
    productViews: 0,
    inquiries: 0,
    quoteRequests: 0,
    whatsappClicks: 0,
    phoneClicks: 0,
    emailClicks: 0,
    productBreakdown: {},
    dailyViews: {},
    lastActiveAt: '',
  };

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
      uniqueVisitors: 0,
      inquiries: 0,
      quoteRequests: 0,
      whatsappClicks: 0,
      phoneClicks: 0,
      emailClicks: 0,
      lastViewedAt: p.created_at || '',
      locations: {},
      dailyViews: {},
      referralSources: {},
    };
  });

  return {
    totalPageViews: 0,
    totalProductViews: 0,
    uniqueVisitors: 0,
    returningVisitors: 0,
    totalInquiries: 0,
    totalQuoteSubmits: 0,
    totalQuoteStarts: 0,
    totalWhatsappClicks: 0,
    totalPhoneClicks: 0,
    totalEmailClicks: 0,
    totalSearches: 0,
    totalEngagementSeconds: 0,
    totalEngagedSessions: 0,
    eventCounts: {
      page_view: 0,
      product_view: 0,
      search: 0,
      quote_form_start: 0,
      quote_form_submit: 0,
      whatsapp_click: 0,
      phone_click: 0,
      email_click: 0,
      contact_form_submit: 0,
    },
    channelViews: {
      'Organic Search': 0,
      Direct: 0,
      Referral: 0,
      Social: 0,
      Campaign: 0,
    },
    searchQueries: {},
    dailyHistory,
    routeViews: {
      '/': 0,
      '/portfolio': 0,
      '/acquisition': 0,
      '/divisions': 0,
      '/alliances': 0,
      '/insights': 0,
    },
    routeInquiries: {},
    locationViews: {},
    districtStats,
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

  // Merge daily history
  const mergedDaily: Record<string, DailyAnalyticsSnapshot> = { ...base.dailyHistory };
  if (raw.dailyHistory && typeof raw.dailyHistory === 'object') {
    Object.entries(raw.dailyHistory).forEach(([dateKey, val]: [string, any]) => {
      mergedDaily[dateKey] = {
        ...createEmptyDailySnapshot(),
        ...(val || {}),
      };
    });
  }

  // Merge districtStats for all 64 districts + unknown + international
  const mergedDistricts: Record<string, DistrictAnalyticsMetric> = { ...base.districtStats };
  if (raw.districtStats && typeof raw.districtStats === 'object') {
    Object.entries(raw.districtStats).forEach(([distId, val]: [string, any]) => {
      if (mergedDistricts[distId]) {
        mergedDistricts[distId] = {
          ...mergedDistricts[distId],
          ...(val || {}),
          productBreakdown: val?.productBreakdown || {},
          dailyViews: val?.dailyViews || {},
        };
      }
    });
  }

  // Also backfill any legacy locationViews (e.g. "Dhaka") into districtStats if districtStats was 0
  if (raw.locationViews && typeof raw.locationViews === 'object') {
    Object.entries(raw.locationViews).forEach(([cityKey, locVal]: [string, any]) => {
      const matched = matchBangladeshDistrict(cityKey, '', locVal?.country || 'Bangladesh');
      const targetId = matched ? matched.id : UNKNOWN_LOCATION_ID;
      const existingDist = mergedDistricts[targetId];
      if (
        existingDist &&
        existingDist.pageViews === 0 &&
        existingDist.productViews === 0 &&
        ((locVal?.pageViews || 0) > 0 || (locVal?.productViews || 0) > 0)
      ) {
        existingDist.pageViews += locVal?.pageViews || 0;
        existingDist.productViews += locVal?.productViews || 0;
        existingDist.lastActiveAt = locVal?.lastActiveAt || '';
      }
    });
  }

  // Merge productViews
  const mergedProductViews: Record<string, ProductViewMetric> = {
    ...base.productViews,
    ...(raw.productViews || {}),
  };

  products.forEach((p) => {
    const existing = mergedProductViews[p.id];
    const viewsCount = typeof existing?.views === 'number' ? existing.views : 0;
    const locationsMap =
      existing?.locations && typeof existing.locations === 'object'
        ? existing.locations
        : {};

    // Ensure district productBreakdown reflects product locations if not yet synced
    Object.entries(locationsMap).forEach(([locName, cnt]) => {
      const m = matchBangladeshDistrict(locName, '', 'Bangladesh');
      if (m && mergedDistricts[m.id]) {
        const currentCnt = mergedDistricts[m.id].productBreakdown[p.id] || 0;
        if (cnt > currentCnt) {
          mergedDistricts[m.id].productBreakdown[p.id] = cnt;
        }
      }
    });

    mergedProductViews[p.id] = {
      productId: p.id,
      name: p.name,
      modelNumber: p.model_number || existing?.modelNumber || '',
      slug: p.slug || existing?.slug || '',
      categoryTag: p.category_tag || existing?.categoryTag || 'Medical Equipment',
      mainImage: p.main_image || existing?.mainImage || '',
      views: viewsCount,
      uniqueVisitors:
        typeof existing?.uniqueVisitors === 'number' && existing.uniqueVisitors > 0
          ? existing.uniqueVisitors
          : viewsCount,
      inquiries: typeof existing?.inquiries === 'number' ? existing.inquiries : 0,
      quoteRequests: typeof existing?.quoteRequests === 'number' ? existing.quoteRequests : 0,
      whatsappClicks: typeof existing?.whatsappClicks === 'number' ? existing.whatsappClicks : 0,
      phoneClicks: typeof existing?.phoneClicks === 'number' ? existing.phoneClicks : 0,
      emailClicks: typeof existing?.emailClicks === 'number' ? existing.emailClicks : 0,
      lastViewedAt: existing?.lastViewedAt || p.created_at || '',
      locations: locationsMap,
      dailyViews: existing?.dailyViews || {},
      referralSources: existing?.referralSources || {},
    };
  });

  const totalPageViews = typeof raw.totalPageViews === 'number' ? raw.totalPageViews : 0;
  const totalProductViews = typeof raw.totalProductViews === 'number' ? raw.totalProductViews : 0;

  return {
    totalPageViews,
    totalProductViews,
    uniqueVisitors: typeof raw.uniqueVisitors === 'number' ? raw.uniqueVisitors : 0,
    returningVisitors: typeof raw.returningVisitors === 'number' ? raw.returningVisitors : 0,
    totalInquiries: typeof raw.totalInquiries === 'number' ? raw.totalInquiries : 0,
    totalQuoteSubmits: typeof raw.totalQuoteSubmits === 'number' ? raw.totalQuoteSubmits : 0,
    totalQuoteStarts: typeof raw.totalQuoteStarts === 'number' ? raw.totalQuoteStarts : 0,
    totalWhatsappClicks: typeof raw.totalWhatsappClicks === 'number' ? raw.totalWhatsappClicks : 0,
    totalPhoneClicks: typeof raw.totalPhoneClicks === 'number' ? raw.totalPhoneClicks : 0,
    totalEmailClicks: typeof raw.totalEmailClicks === 'number' ? raw.totalEmailClicks : 0,
    totalSearches: typeof raw.totalSearches === 'number' ? raw.totalSearches : 0,
    totalEngagementSeconds:
      typeof raw.totalEngagementSeconds === 'number' ? raw.totalEngagementSeconds : 0,
    totalEngagedSessions:
      typeof raw.totalEngagedSessions === 'number' ? raw.totalEngagedSessions : 0,
    eventCounts: {
      ...base.eventCounts,
      ...(raw.eventCounts || {}),
      page_view: Math.max(raw.eventCounts?.page_view || 0, totalPageViews),
      product_view: Math.max(raw.eventCounts?.product_view || 0, totalProductViews),
    },
    channelViews: {
      ...base.channelViews,
      ...(raw.channelViews || {}),
      Direct: Math.max(
        raw.channelViews?.Direct || 0,
        totalPageViews -
          ((raw.channelViews?.['Organic Search'] || 0) +
            (raw.channelViews?.Referral || 0) +
            (raw.channelViews?.Social || 0) +
            (raw.channelViews?.Campaign || 0))
      ),
    },
    searchQueries: raw.searchQueries || {},
    dailyHistory: mergedDaily,
    routeViews: {
      ...base.routeViews,
      ...(raw.routeViews || {}),
    },
    routeInquiries: raw.routeInquiries || {},
    locationViews:
      raw.locationViews && typeof raw.locationViews === 'object'
        ? raw.locationViews
        : {},
    districtStats: mergedDistricts,
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
        description: 'Live website traffic, 64-district geolocation, and product event telemetry',
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
 * Records a page_view event with district resolution and channel attribution.
 */
export const recordPageView = async (pathname: string): Promise<void> => {
  if (
    !pathname ||
    pathname.startsWith('/command-nexus') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    isLikelyBot()
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
    const channel = detectTrafficChannel();

    let isNewSession = false;
    let isReturningUser = false;
    try {
      if (!sessionStorage.getItem(SESSION_VISITOR_KEY)) {
        sessionStorage.setItem(SESSION_VISITOR_KEY, '1');
        isNewSession = true;
        if (localStorage.getItem(LOCAL_VISITOR_KNOWN_KEY)) {
          isReturningUser = true;
        } else {
          localStorage.setItem(LOCAL_VISITOR_KNOWN_KEY, '1');
        }
      }
    } catch {}

    const todayEntry = current.dailyHistory[todayKey] || createEmptyDailySnapshot();

    const normalizedRoute = pathname.startsWith('/portfolio/')
      ? '/portfolio/[product]'
      : pathname.startsWith('/insights/')
      ? '/insights/[article]'
      : pathname;

    const cityKey = geo.districtName || geo.city || 'Unknown / Unavailable Location';
    const existingLoc = current.locationViews[cityKey] || {
      city: cityKey,
      country: geo.country || 'Bangladesh',
      label: geo.label || cityKey,
      pageViews: 0,
      productViews: 0,
      lastActiveAt: new Date().toISOString(),
    };

    const distId = geo.districtId || UNKNOWN_LOCATION_ID;
    const existingDist = current.districtStats[distId] || {
      districtId: distId,
      districtName: geo.districtName || 'Unknown / Unavailable Location',
      divisionName: geo.divisionName || 'Unmapped',
      pageViews: 0,
      uniqueVisitors: 0,
      productViews: 0,
      inquiries: 0,
      quoteRequests: 0,
      whatsappClicks: 0,
      phoneClicks: 0,
      emailClicks: 0,
      productBreakdown: {},
      dailyViews: {},
      lastActiveAt: '',
    };

    const nextDailySnapshot: DailyAnalyticsSnapshot = {
      ...todayEntry,
      pageViews: todayEntry.pageViews + 1,
      uniqueVisitors: todayEntry.uniqueVisitors + (isNewSession ? 1 : 0),
      organicViews: todayEntry.organicViews + (channel === 'Organic Search' ? 1 : 0),
      directViews: todayEntry.directViews + (channel === 'Direct' ? 1 : 0),
      referralViews: todayEntry.referralViews + (channel === 'Referral' ? 1 : 0),
      socialViews: todayEntry.socialViews + (channel === 'Social' ? 1 : 0),
      campaignViews: todayEntry.campaignViews + (channel === 'Campaign' ? 1 : 0),
    };

    const nextAnalytics: SiteTrafficAnalytics = {
      ...current,
      totalPageViews: current.totalPageViews + 1,
      uniqueVisitors: current.uniqueVisitors + (isNewSession ? 1 : 0),
      returningVisitors: current.returningVisitors + (isReturningUser ? 1 : 0),
      eventCounts: {
        ...current.eventCounts,
        page_view: (current.eventCounts.page_view || 0) + 1,
      },
      channelViews: {
        ...current.channelViews,
        [channel]: (current.channelViews[channel] || 0) + 1,
      },
      dailyHistory: {
        ...current.dailyHistory,
        [todayKey]: nextDailySnapshot,
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
      districtStats: {
        ...current.districtStats,
        [distId]: {
          ...existingDist,
          pageViews: existingDist.pageViews + 1,
          uniqueVisitors: existingDist.uniqueVisitors + (isNewSession ? 1 : 0),
          dailyViews: {
            ...(existingDist.dailyViews || {}),
            [todayKey]: ((existingDist.dailyViews || {})[todayKey] || 0) + 1,
          },
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
 * Records a product_view event with 64-district attribution and referral channel.
 */
export const recordProductView = async (product: Product): Promise<void> => {
  if (!product || !product.id || isLikelyBot()) return;

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
    const channel = detectTrafficChannel();
    const todayEntry = current.dailyHistory[todayKey] || createEmptyDailySnapshot();
    const existingProd = current.productViews[product.id];

    let isFirstProductVisitInSession = false;
    try {
      const rawViewed = sessionStorage.getItem(SESSION_PRODUCTS_VIEWED_KEY);
      const viewedList: string[] = rawViewed ? JSON.parse(rawViewed) : [];
      if (!viewedList.includes(product.id)) {
        viewedList.push(product.id);
        sessionStorage.setItem(SESSION_PRODUCTS_VIEWED_KEY, JSON.stringify(viewedList));
        isFirstProductVisitInSession = true;
      }
    } catch {}

    const cityKey = geo.districtName || geo.city || 'Unknown / Unavailable Location';
    const prevProdLocations = existingProd?.locations || {};
    const nextProdLocations: Record<string, number> = {
      ...prevProdLocations,
      [cityKey]: (prevProdLocations[cityKey] || 0) + 1,
    };

    const prevDailyViews = existingProd?.dailyViews || {};
    const prevRefSources = existingProd?.referralSources || {};

    const distId = geo.districtId || UNKNOWN_LOCATION_ID;
    const existingDist = current.districtStats[distId] || current.districtStats[UNKNOWN_LOCATION_ID];

    const existingLoc = current.locationViews[cityKey] || {
      city: cityKey,
      country: geo.country || 'Bangladesh',
      label: geo.label || cityKey,
      pageViews: 0,
      productViews: 0,
      lastActiveAt: new Date().toISOString(),
    };

    const nextAnalytics: SiteTrafficAnalytics = {
      ...current,
      totalProductViews: current.totalProductViews + 1,
      eventCounts: {
        ...current.eventCounts,
        product_view: (current.eventCounts.product_view || 0) + 1,
      },
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
      districtStats: {
        ...current.districtStats,
        [distId]: {
          ...existingDist,
          productViews: (existingDist?.productViews || 0) + 1,
          productBreakdown: {
            ...(existingDist?.productBreakdown || {}),
            [product.id]: ((existingDist?.productBreakdown || {})[product.id] || 0) + 1,
          },
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
          uniqueVisitors:
            (existingProd?.uniqueVisitors || 0) + (isFirstProductVisitInSession ? 1 : 0),
          inquiries: existingProd?.inquiries || 0,
          quoteRequests: existingProd?.quoteRequests || 0,
          whatsappClicks: existingProd?.whatsappClicks || 0,
          phoneClicks: existingProd?.phoneClicks || 0,
          emailClicks: existingProd?.emailClicks || 0,
          lastViewedAt: new Date().toISOString(),
          locations: nextProdLocations,
          dailyViews: {
            ...prevDailyViews,
            [todayKey]: (prevDailyViews[todayKey] || 0) + 1,
          },
          referralSources: {
            ...prevRefSources,
            [channel]: (prevRefSources[channel] || 0) + 1,
          },
        },
      },
      updatedAt: new Date().toISOString(),
    };

    await saveSiteAnalytics(nextAnalytics);
  } catch (err) {
    console.warn('Product view tracking skipped:', err);
  }
};

let lastActionKey = '';
let lastActionTime = 0;

/**
 * Records business interaction events:
 * whatsapp_click, phone_click, email_click, quote_form_start, quote_form_submit, contact_form_submit, search
 */
export const recordAnalyticsEvent = async (
  eventName: AnalyticsEventName,
  options?: {
    productId?: string;
    productName?: string;
    searchQuery?: string;
    routePath?: string;
    engagementSeconds?: number;
  }
): Promise<void> => {
  if (isLikelyBot()) return;

  const dedupeKey = `${eventName}:${options?.productId || ''}:${options?.searchQuery || ''}`;
  const now = Date.now();
  if (dedupeKey === lastActionKey && now - lastActionTime < 2000) {
    return;
  }
  lastActionKey = dedupeKey;
  lastActionTime = now;

  try {
    const [current, geo] = await Promise.all([
      fetchSiteAnalytics(),
      resolveVisitorLocation(),
    ]);
    const todayKey = getTodayKey();
    const todayEntry = current.dailyHistory[todayKey] || createEmptyDailySnapshot();
    const distId = geo.districtId || UNKNOWN_LOCATION_ID;
    const existingDist = current.districtStats[distId] || current.districtStats[UNKNOWN_LOCATION_ID];

    // Match product by ID or name if provided
    let targetProdId = options?.productId || '';
    if (!targetProdId && options?.productName) {
      const lowerName = options.productName.toLowerCase();
      const matchedEntry = Object.values(current.productViews).find(
        (p) => p.name.toLowerCase() === lowerName || lowerName.includes(p.name.toLowerCase())
      );
      if (matchedEntry) targetProdId = matchedEntry.productId;
    }

    const updatedProductViews = { ...current.productViews };
    if (targetProdId && updatedProductViews[targetProdId]) {
      const prod = { ...updatedProductViews[targetProdId] };
      if (eventName === 'whatsapp_click') prod.whatsappClicks = (prod.whatsappClicks || 0) + 1;
      if (eventName === 'phone_click') prod.phoneClicks = (prod.phoneClicks || 0) + 1;
      if (eventName === 'email_click') prod.emailClicks = (prod.emailClicks || 0) + 1;
      if (eventName === 'quote_form_submit' || eventName === 'contact_form_submit') {
        prod.inquiries = (prod.inquiries || 0) + 1;
        prod.quoteRequests = (prod.quoteRequests || 0) + 1;
      }
      updatedProductViews[targetProdId] = prod;
    }

    const isInquirySubmit =
      eventName === 'quote_form_submit' || eventName === 'contact_form_submit';

    const routeKey = options?.routePath || (typeof window !== 'undefined' ? window.location.pathname : '/');

    const nextAnalytics: SiteTrafficAnalytics = {
      ...current,
      totalWhatsappClicks:
        current.totalWhatsappClicks + (eventName === 'whatsapp_click' ? 1 : 0),
      totalPhoneClicks:
        current.totalPhoneClicks + (eventName === 'phone_click' ? 1 : 0),
      totalEmailClicks:
        current.totalEmailClicks + (eventName === 'email_click' ? 1 : 0),
      totalQuoteStarts:
        current.totalQuoteStarts + (eventName === 'quote_form_start' ? 1 : 0),
      totalQuoteSubmits:
        current.totalQuoteSubmits + (isInquirySubmit ? 1 : 0),
      totalInquiries:
        current.totalInquiries + (isInquirySubmit ? 1 : 0),
      totalSearches:
        current.totalSearches + (eventName === 'search' ? 1 : 0),
      eventCounts: {
        ...current.eventCounts,
        [eventName]: (current.eventCounts[eventName] || 0) + 1,
      },
      searchQueries:
        eventName === 'search' && options?.searchQuery?.trim()
          ? {
              ...current.searchQueries,
              [options.searchQuery.trim().toLowerCase()]:
                (current.searchQueries[options.searchQuery.trim().toLowerCase()] || 0) + 1,
            }
          : current.searchQueries,
      routeInquiries: isInquirySubmit
        ? {
            ...current.routeInquiries,
            [routeKey]: (current.routeInquiries[routeKey] || 0) + 1,
          }
        : current.routeInquiries,
      dailyHistory: {
        ...current.dailyHistory,
        [todayKey]: {
          ...todayEntry,
          whatsappClicks:
            todayEntry.whatsappClicks + (eventName === 'whatsapp_click' ? 1 : 0),
          phoneClicks:
            todayEntry.phoneClicks + (eventName === 'phone_click' ? 1 : 0),
          emailClicks:
            todayEntry.emailClicks + (eventName === 'email_click' ? 1 : 0),
          quoteSubmits:
            todayEntry.quoteSubmits + (isInquirySubmit ? 1 : 0),
          inquiries:
            todayEntry.inquiries + (isInquirySubmit ? 1 : 0),
        },
      },
      districtStats: {
        ...current.districtStats,
        [distId]: {
          ...existingDist,
          whatsappClicks:
            (existingDist?.whatsappClicks || 0) + (eventName === 'whatsapp_click' ? 1 : 0),
          phoneClicks:
            (existingDist?.phoneClicks || 0) + (eventName === 'phone_click' ? 1 : 0),
          emailClicks:
            (existingDist?.emailClicks || 0) + (eventName === 'email_click' ? 1 : 0),
          inquiries:
            (existingDist?.inquiries || 0) + (isInquirySubmit ? 1 : 0),
          quoteRequests:
            (existingDist?.quoteRequests || 0) + (isInquirySubmit ? 1 : 0),
          lastActiveAt: new Date().toISOString(),
        },
      },
      productViews: updatedProductViews,
      updatedAt: new Date().toISOString(),
    };

    await saveSiteAnalytics(nextAnalytics);
  } catch (err) {
    console.warn('Analytics event tracking skipped:', err);
  }
};

/**
 * Records active session engagement duration (in seconds).
 */
export const recordSessionEngagement = async (seconds: number): Promise<void> => {
  if (seconds < 3 || seconds > 3600 || isLikelyBot()) return;
  try {
    const current = await fetchSiteAnalytics();
    const todayKey = getTodayKey();
    const todayEntry = current.dailyHistory[todayKey] || createEmptyDailySnapshot();

    const nextAnalytics: SiteTrafficAnalytics = {
      ...current,
      totalEngagementSeconds: (current.totalEngagementSeconds || 0) + seconds,
      totalEngagedSessions: (current.totalEngagedSessions || 0) + 1,
      dailyHistory: {
        ...current.dailyHistory,
        [todayKey]: {
          ...todayEntry,
          engagementSeconds: (todayEntry.engagementSeconds || 0) + seconds,
          engagedSessions: (todayEntry.engagedSessions || 0) + 1,
        },
      },
      updatedAt: new Date().toISOString(),
    };
    await saveSiteAnalytics(nextAnalytics);
  } catch {}
};
