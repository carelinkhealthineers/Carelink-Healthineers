
import React from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title: string;
  description?: string;
  keywords?: string[];
  image?: string;
  type?: 'website' | 'article' | 'product';
  jsonLd?: object;
  canonicalUrl?: string;
}

export const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  keywords = [], 
  image, 
  type = 'website', 
  jsonLd,
  canonicalUrl 
}) => {
  const location = useLocation();
  const siteUrl = 'https://carelink-healthineers.vercel.app'; // Replace with actual domain
  const currentUrl = canonicalUrl || `${siteUrl}${location.pathname}`;
  const defaultImage = 'https://i.imgur.com/y0UvXGu.png'; // Default OG Image
  const finalImage = image || defaultImage;

  React.useEffect(() => {
    document.title = `${title} | Carelink Healthineers`;
    
    // Helper to update or create meta tags
    const updateMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // Helper for Open Graph / Property tags
    const updateProperty = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', property);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // Helper for Link tags (canonical)
    const updateLink = (rel: string, href: string) => {
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
    };

    // Standard Meta Tags
    if (description) {
      updateMeta('description', description);
    }
    
    if (keywords.length > 0) {
      updateMeta('keywords', keywords.join(', '));
    }

    updateMeta('robots', 'index, follow');
    updateMeta('viewport', 'width=device-width, initial-scale=1.0');
    updateMeta('author', 'Carelink Healthineers');

    // Open Graph Tags
    updateProperty('og:title', title);
    updateProperty('og:description', description || '');
    updateProperty('og:type', type);
    updateProperty('og:url', currentUrl);
    updateProperty('og:image', finalImage);
    updateProperty('og:site_name', 'Carelink Healthineers');
    updateProperty('og:locale', 'en_US');

    // Twitter Card Tags
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', title);
    updateMeta('twitter:description', description || '');
    updateMeta('twitter:image', finalImage);
    updateMeta('twitter:creator', '@CarelinkHealth'); // Replace with actual handle

    // Canonical URL
    updateLink('canonical', currentUrl);

    // JSON-LD Structured Data
    const existingScript = document.getElementById('json-ld');
    if (existingScript) existingScript.remove();

    const structuredData = jsonLd || {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Carelink Healthineers",
      "url": siteUrl,
      "logo": defaultImage,
      "sameAs": [
        "https://www.linkedin.com/company/carelink-healthineers",
        "https://twitter.com/CarelinkHealth"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+1-555-0123",
        "contactType": "customer service"
      }
    };

    const script = document.createElement('script');
    script.id = 'json-ld';
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);

    // Cleanup function (optional, but good practice if component unmounts)
    return () => {
      // We generally don't remove meta tags on unmount in SPA navigation 
      // because the next page will overwrite them immediately.
      // However, removing the JSON-LD script is safe.
      const script = document.getElementById('json-ld');
      if (script) script.remove();
    };
  }, [title, description, keywords, image, type, jsonLd, currentUrl, finalImage]);

  return null;
};
