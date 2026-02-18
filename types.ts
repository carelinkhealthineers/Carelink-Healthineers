
export interface Division {
  id: string;
  name: string;
  slug: string;
  description: string;
  hero_gradient: string;
  image_url?: string;
}

export interface Product {
  id: string;
  division_id: string;
  name: string;
  model_number: string;
  slug: string;
  short_description: string;
  long_description: string;
  main_image: string;
  is_published: boolean;
  meta_title?: string;
  meta_description?: string;
  created_at: string;
}

export interface Specification {
  id: string;
  product_id: string;
  spec_key: string;
  spec_value: string;
  order_index: number;
}

export interface Inquiry {
  id: string;
  product_id?: string;
  name: string;
  email: string;
  company: string;
  message: string;
  status: 'pending' | 'reviewed' | 'archived';
  created_at: string;
}

export interface Setting {
  key: string;
  value: string;
  description?: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image: string;
  published_at: string;
}

// Added missing Alliance interface required for strategic partnership management
export interface Alliance {
  id: string;
  name: string;
  slug: string;
  logo_url: string;
  country: string;
  specialization: string;
  description: string;
  certifications: string[];
  category: string;
  is_featured: boolean;
  created_at: string;
  website_url?: string;
}
