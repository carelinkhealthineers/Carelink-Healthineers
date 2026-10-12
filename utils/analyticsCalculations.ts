import {
  BANGLADESH_64_DISTRICTS,
  BANGLADESH_DIVISIONS,
  BangladeshDivisionName,
  DistrictMetadata,
} from './bangladeshDistricts';
import {
  SiteTrafficAnalytics,
  DailyAnalyticsSnapshot,
  DistrictAnalyticsMetric,
  ProductViewMetric,
} from './analyticsTracker';

export type AnalyticsDateFilter =
  | 'today'
  | 'last_7_days'
  | 'last_28_days'
  | 'last_90_days'
  | 'this_month'
  | 'last_month'
  | 'custom';

export interface DateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  label: string;
}

export interface PeriodComparison {
  currentRange: DateRange;
  previousRange: DateRange;
}

/**
 * Computes start/end dates for standard analytics date filters and their matching previous equivalent period.
 */
export const computeDateRanges = (
  filter: AnalyticsDateFilter,
  customStart?: string,
  customEnd?: string
): PeriodComparison => {
  const now = new Date();
  const formatYMD = (d: Date) => d.toISOString().split('T')[0];

  let currentStart = new Date(now);
  let currentEnd = new Date(now);
  let daysDiff = 1;

  if (filter === 'today') {
    currentStart = new Date(now);
    currentEnd = new Date(now);
    daysDiff = 1;
  } else if (filter === 'last_7_days') {
    currentStart = new Date(now);
    currentStart.setDate(now.getDate() - 6);
    currentEnd = new Date(now);
    daysDiff = 7;
  } else if (filter === 'last_28_days') {
    currentStart = new Date(now);
    currentStart.setDate(now.getDate() - 27);
    currentEnd = new Date(now);
    daysDiff = 28;
  } else if (filter === 'last_90_days') {
    currentStart = new Date(now);
    currentStart.setDate(now.getDate() - 89);
    currentEnd = new Date(now);
    daysDiff = 90;
  } else if (filter === 'this_month') {
    currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
    currentEnd = new Date(now);
    daysDiff = Math.max(1, Math.round((currentEnd.getTime() - currentStart.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  } else if (filter === 'last_month') {
    currentStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    currentEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    daysDiff = Math.max(1, Math.round((currentEnd.getTime() - currentStart.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  } else if (filter === 'custom' && customStart && customEnd) {
    currentStart = new Date(customStart);
    currentEnd = new Date(customEnd);
    daysDiff = Math.max(1, Math.round((currentEnd.getTime() - currentStart.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  } else {
    // Default 28 days
    currentStart = new Date(now);
    currentStart.setDate(now.getDate() - 27);
    currentEnd = new Date(now);
    daysDiff = 28;
  }

  // Previous equivalent period (same duration, immediately preceding)
  const prevEnd = new Date(currentStart);
  prevEnd.setDate(currentStart.getDate() - 1);
  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevEnd.getDate() - daysDiff + 1);

  return {
    currentRange: {
      startDate: formatYMD(currentStart),
      endDate: formatYMD(currentEnd),
      label: `${formatYMD(currentStart)} - ${formatYMD(currentEnd)}`,
    },
    previousRange: {
      startDate: formatYMD(prevStart),
      endDate: formatYMD(prevEnd),
      label: `${formatYMD(prevStart)} - ${formatYMD(prevEnd)}`,
    },
  };
};

export interface FilteredAggregates {
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
  avgEngagementSeconds: number;
  conversionRate: number; // percentage (inquiries / max(1, pageViews) * 100)
}

export interface AggregationResult {
  current: FilteredAggregates;
  previous: FilteredAggregates;
  dailyPoints: Array<{
    date: string;
    label: string;
    pageViews: number;
    uniqueVisitors: number;
    productViews: number;
    inquiries: number;
    organicViews: number;
  }>;
}

const isDateInRange = (dateKey: string, start: string, end: string): boolean => {
  return dateKey >= start && dateKey <= end;
};

/**
 * Aggregates daily history snapshots for given range.
 */
export const aggregateRangeMetrics = (
  analytics: SiteTrafficAnalytics | null,
  start: string,
  end: string
): FilteredAggregates => {
  if (!analytics || !analytics.dailyHistory) {
    return {
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
      avgEngagementSeconds: 0,
      conversionRate: 0,
    };
  }

  let pageViews = 0;
  let uniqueVisitors = 0;
  let productViews = 0;
  let inquiries = 0;
  let quoteSubmits = 0;
  let whatsappClicks = 0;
  let phoneClicks = 0;
  let emailClicks = 0;
  let organicViews = 0;
  let directViews = 0;
  let referralViews = 0;
  let socialViews = 0;
  let campaignViews = 0;
  let totalEngagementSeconds = 0;
  let totalEngagedSessions = 0;

  Object.entries(analytics.dailyHistory).forEach(([dateKey, snapshot]) => {
    if (isDateInRange(dateKey, start, end)) {
      pageViews += snapshot.pageViews || 0;
      uniqueVisitors += snapshot.uniqueVisitors || 0;
      productViews += snapshot.productViews || 0;
      inquiries += snapshot.inquiries || 0;
      quoteSubmits += snapshot.quoteSubmits || 0;
      whatsappClicks += snapshot.whatsappClicks || 0;
      phoneClicks += snapshot.phoneClicks || 0;
      emailClicks += snapshot.emailClicks || 0;
      organicViews += snapshot.organicViews || 0;
      directViews += snapshot.directViews || 0;
      referralViews += snapshot.referralViews || 0;
      socialViews += snapshot.socialViews || 0;
      campaignViews += snapshot.campaignViews || 0;
      totalEngagementSeconds += snapshot.engagementSeconds || 0;
      totalEngagedSessions += snapshot.engagedSessions || 0;
    }
  });

  // Fallback to top-level totals if daily history is very new (e.g., today)
  if (pageViews === 0 && analytics.totalPageViews > 0) {
    pageViews = analytics.totalPageViews;
    uniqueVisitors = analytics.uniqueVisitors;
    productViews = analytics.totalProductViews;
    inquiries = analytics.totalInquiries;
    quoteSubmits = analytics.totalQuoteSubmits;
    whatsappClicks = analytics.totalWhatsappClicks;
    phoneClicks = analytics.totalPhoneClicks;
    emailClicks = analytics.totalEmailClicks;
    organicViews = analytics.channelViews['Organic Search'] || 0;
    directViews = analytics.channelViews.Direct || 0;
    referralViews = analytics.channelViews.Referral || 0;
    socialViews = analytics.channelViews.Social || 0;
    campaignViews = analytics.channelViews.Campaign || 0;
    totalEngagementSeconds = analytics.totalEngagementSeconds || 0;
    totalEngagedSessions = analytics.totalEngagedSessions || 0;
  }

  const avgEngagementSeconds =
    totalEngagedSessions > 0
      ? Math.round(totalEngagementSeconds / totalEngagedSessions)
      : Math.round(totalEngagementSeconds / Math.max(1, uniqueVisitors));

  const totalActions = inquiries + quoteSubmits + whatsappClicks + phoneClicks + emailClicks;
  const conversionRate =
    pageViews > 0 ? Number(((totalActions / pageViews) * 100).toFixed(1)) : 0;

  return {
    pageViews,
    uniqueVisitors,
    productViews,
    inquiries,
    quoteSubmits,
    whatsappClicks,
    phoneClicks,
    emailClicks,
    organicViews,
    directViews,
    referralViews,
    socialViews,
    campaignViews,
    avgEngagementSeconds,
    conversionRate,
  };
};

/**
 * Calculates percentage change between current and previous period.
 * Returns null if previous period was 0 to avoid Infinity.
 */
export const calculatePercentageChange = (
  current: number,
  previous: number
): { diff: number; pct: number | null; isPositive: boolean } => {
  const diff = current - previous;
  if (previous === 0) {
    return {
      diff,
      pct: current > 0 ? 100 : 0,
      isPositive: current >= 0,
    };
  }
  const pct = Number(((diff / previous) * 100).toFixed(1));
  return {
    diff,
    pct,
    isPositive: pct >= 0,
  };
};

/**
 * Formats duration in seconds to mm:ss or hh:mm:ss for YouTube Studio feel.
 */
export const formatDuration = (seconds: number): string => {
  if (!seconds || seconds <= 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins >= 60) {
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hrs}h ${remMins}m`;
  }
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

/**
 * Generates daily trend points between start and end date for charts.
 */
export const generateDailyTrendPoints = (
  analytics: SiteTrafficAnalytics | null,
  start: string,
  end: string
): Array<{
  date: string;
  label: string;
  pageViews: number;
  uniqueVisitors: number;
  productViews: number;
  inquiries: number;
  organicViews: number;
}> => {
  if (!start || !end) return [];
  const points: any[] = [];
  const curr = new Date(start);
  const last = new Date(end);

  const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  while (curr <= last) {
    const key = curr.toISOString().split('T')[0];
    const snap = analytics?.dailyHistory?.[key];
    points.push({
      date: key,
      label: `${shortMonths[curr.getMonth()]} ${curr.getDate()}`,
      pageViews: snap?.pageViews || 0,
      uniqueVisitors: snap?.uniqueVisitors || 0,
      productViews: snap?.productViews || 0,
      inquiries: snap?.inquiries || 0,
      organicViews: snap?.organicViews || 0,
    });
    curr.setDate(curr.getDate() + 1);
  }

  return points;
};
