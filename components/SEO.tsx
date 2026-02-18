
import React from 'react';

interface SEOProps {
  title: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  jsonLd?: object;
}

export const SEO: React.FC<SEOProps> = ({ title, description, image, type = 'website', jsonLd }) => {
  React.useEffect(() => {
    document.title = `${title} | Carelink Healthineers`;
    
    // Update basic meta tags
    const updateMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    const updateOg = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', property);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    if (description) {
      updateMeta('description', description);
      updateOg('og:description', description);
    }
    
    updateOg('og:title', title);
    updateOg('og:type', type);
    if (image) updateOg('og:image', image);

    // JSON-LD logic
    const existingScript = document.getElementById('json-ld');
    if (existingScript) existingScript.remove();

    if (jsonLd) {
      const script = document.createElement('script');
      script.id = 'json-ld';
      script.type = 'application/ld+json';
      script.text = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }
  }, [title, description, image, type, jsonLd]);

  return null;
};
