
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';

interface BreadcrumbItem {
  name: string;
  item: string;
}

interface SEOProps {
  title: string;
  description?: string;
  keywords?: string[];
  image?: string;
  type?: 'website' | 'article' | 'product' | 'profile';
  jsonLd?: object;
  breadcrumbs?: BreadcrumbItem[];
  canonicalUrl?: string;
  disableDynamicFetch?: boolean;
}

export const SEO: React.FC<SEOProps> = ({ 
  title: initialTitle, 
  description: initialDescription, 
  keywords: initialKeywords = [], 
  image: initialImage, 
  type = 'website', 
  jsonLd,
  breadcrumbs,
  canonicalUrl,
  disableDynamicFetch = false
}) => {
  const location = useLocation();
  const [meta, setMeta] = useState({
    title: initialTitle,
    description: initialDescription,
    keywords: initialKeywords,
    image: initialImage
  });

  // Dynamic SEO Fetching (Client-Side "Pro" Feature)
  useEffect(() => {
    if (disableDynamicFetch) return;

    const fetchDynamicSEO = async () => {
      const { data } = await supabase
        .from('page_seo_settings')
        .select('*')
        .eq('page_path', location.pathname)
        .single();

      if (data) {
        setMeta({
          title: data.title || initialTitle,
          description: data.meta_description || initialDescription,
          keywords: data.keywords || initialKeywords,
          image: data.og_image || initialImage
        });
      }
    };

    fetchDynamicSEO();
  }, [location.pathname, disableDynamicFetch, initialTitle, initialDescription, initialKeywords, initialImage]);

  const siteUrl = 'https://carelinkhealthineers.com';
  const currentUrl = canonicalUrl || `${siteUrl}${location.pathname}`;
  const defaultImage = 'https://i.imgur.com/y0UvXGu.png';
  const finalImage = meta.image || defaultImage;
  const fullTitle = `${meta.title} | Carelink Healthineers`;

  useEffect(() => {
    document.title = fullTitle;
    
    const updateMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    const updateProperty = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', property);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    const updateLink = (rel: string, href: string) => {
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
    };

    // Standard Tags
    if (meta.description) updateMeta('description', meta.description);
    if (meta.keywords && meta.keywords.length > 0) updateMeta('keywords', meta.keywords.join(', '));
    updateMeta('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    updateMeta('viewport', 'width=device-width, initial-scale=1.0');
    updateMeta('author', 'Carelink Healthineers');
    updateMeta('publisher', 'Carelink Healthineers');

    // Open Graph
    updateProperty('og:title', fullTitle);
    updateProperty('og:description', meta.description || '');
    updateProperty('og:type', type);
    updateProperty('og:url', currentUrl);
    updateProperty('og:image', finalImage);
    updateProperty('og:site_name', 'Carelink Healthineers');
    updateProperty('og:locale', 'en_US');

    // Twitter
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', fullTitle);
    updateMeta('twitter:description', meta.description || '');
    updateMeta('twitter:image', finalImage);
    updateMeta('twitter:creator', '@CarelinkHealth');
    updateMeta('twitter:site', '@CarelinkHealth');

    // Canonical
    updateLink('canonical', currentUrl);

    // JSON-LD Construction
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach(s => s.remove());

    const schemas = [];

    // 1. Organization Schema (Global)
    schemas.push({
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Carelink Healthineers",
      "url": siteUrl,
      "logo": defaultImage,
      "sameAs": [
        "https://www.facebook.com/carelinkhealthineers/",
        "https://www.instagram.com/carelinkhealthineers/",
        "https://www.twitter.com/carelinkhealthineers/",
        "https://www.youtube.com/@carelinkhealthineers"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+8801339482917",
        "contactType": "customer service",
        "areaServed": "Global",
        "availableLanguage": ["English", "Bengali"]
      }
    });

    // 2. WebSite Schema with SearchAction (Google Sitelinks Search Box)
    schemas.push({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Carelink Healthineers",
      "url": siteUrl,
      "creator": {
        "@type": "Person",
        "name": "Mohibbul Wara Orjon",
        "url": "https://zaironx.top"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${siteUrl}/products?search={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      }
    });

    // 3. SiteNavigationElement Schema (Google Navbar / Sitelinks Branches)
    schemas.push({
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Site Navigation Sitelinks",
      "itemListElement": [
        {
          "@type": "SiteNavigationElement",
          "position": 1,
          "name": "Home",
          "description": "Carelink Healthineers Medical Equipment Sourcing & Dürr Dental Partner",
          "url": `${siteUrl}/`
        },
        {
          "@type": "SiteNavigationElement",
          "position": 2,
          "name": "Products",
          "description": "Certified Medical & Dental Equipment Catalog",
          "url": `${siteUrl}/products`
        },
        {
          "@type": "SiteNavigationElement",
          "position": 3,
          "name": "Clinical Divisions",
          "description": "Specialized Healthcare & Dental Departments",
          "url": `${siteUrl}/divisions`
        },
        {
          "@type": "SiteNavigationElement",
          "position": 4,
          "name": "Partners",
          "description": "Dürr Dental & Global Medical Manufacturers",
          "url": `${siteUrl}/alliances`
        },
        {
          "@type": "SiteNavigationElement",
          "position": 5,
          "name": "Clinical Insights",
          "description": "Medical Technology Articles & Intelligence Briefings",
          "url": `${siteUrl}/intelligence`
        },
        {
          "@type": "SiteNavigationElement",
          "position": 6,
          "name": "Request Quote",
          "description": "Get Custom Direct Factory Quotes Fast",
          "url": `${siteUrl}/acquisition`
        },
        {
          "@type": "SiteNavigationElement",
          "position": 7,
          "name": "About Us",
          "description": "Carelink Healthineers Mission & Global Sourcing",
          "url": `${siteUrl}/foundation`
        }
      ]
    });

    // 2. Breadcrumb Schema
    if (breadcrumbs) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((crumb, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": crumb.name,
          "item": crumb.item.startsWith('http') ? crumb.item : `${siteUrl}${crumb.item}`
        }))
      });
    }

    // 3. Page-Specific Schema
    if (jsonLd) {
      schemas.push(jsonLd);
    }

    // Inject Schemas
    schemas.forEach(schemaData => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(schemaData);
      document.head.appendChild(script);
    });

    return () => {
      // Cleanup logic if needed
    };
  }, [meta, type, jsonLd, breadcrumbs, currentUrl, finalImage, fullTitle]);

  return null;
};
