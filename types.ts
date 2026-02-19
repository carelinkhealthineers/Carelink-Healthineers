
export interface Division {
  id: string;
  name: string;
  slug: string;
  description: string;
  hero_gradient: string;
  icon_name: string;
  order_index: number;
}

export interface ProductPart {
  id?: string;
  product_id?: string;
  name: string;
  description: string;
  image_url: string;
  order_index?: number;
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
  image_gallery: string[];
  category_tag: string;
  technical_specs: Record<string, string>;
  brochure_url?: string;
  video_url?: string;
  warranty_info?: string;
  is_published: boolean;
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  parts?: ProductPart[];
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  category: string;
  author: string;
  is_published: boolean;
  published_at: string;
  created_at: string;
  tags?: string[];
  gallery?: string[];
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
  id: string;
  key: string;
  value: string;
  category: string;
  description?: string;
}

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
