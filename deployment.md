
# Carelink Healthineers - Deployment Guide

## 1. Supabase Setup
- Create a new project on [Supabase](https://supabase.com).
- Copy the contents of `schema.sql` into the SQL Editor and run it. This will:
  - Create all necessary tables.
  - Setup Row Level Security (RLS).
  - Seed initial divisions and settings.
- Under **Authentication > Users**, create an admin user and add `{ "role": "admin" }` to their raw user metadata.

## 2. Environment Configuration
Create a `.env` file with your credentials:
```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## 3. Storage Setup
- Create a public bucket named `products` for equipment images.
- Create a public bucket named `documents` for PDF brochures.
- Update RLS policies for storage to allow `authenticated` users to upload.

## 4. Vercel Deployment
- Connect your GitHub repository to Vercel.
- Add the environment variables above.
- The build command should be `npm run build`.

## 5. SEO Optimization Checklist
- [ ] Ensure `site_title` and `meta_default_description` are updated in the `settings` table.
- [ ] Upload a `favicon.ico` and `og-image.jpg` to the public folder.
- [ ] Ensure all products have high-quality descriptions for rich Google Search results.

## 6. Maintenance
- Inquiries can be viewed via the **Command Nexus** panel.
- Update the `inquiry_email` setting whenever the primary contact changes.
