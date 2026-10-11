import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Trash2, X, Save, 
  RefreshCw, Loader2, 
  Box, Terminal, ImagePlus, 
  ChevronRight, ImageIcon, Trash,
  FileText, Tv, Globe, Sparkles, Tag, CheckCircle2
} from 'lucide-react';
import { slugify } from '../../utils/slugify';
import { supabase } from '../../supabaseClient';
import { Division, Product, ProductPart } from '../../types';

type EditorTab = 'metadata' | 'seo' | 'blueprints' | 'visuals' | 'architecture';

export const ProductArchitecture: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<EditorTab>('metadata');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [relatedKeywordInput, setRelatedKeywordInput] = useState('');

  const mainImageRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    model_number: '',
    division_id: '',
    category_tag: '',
    short_description: '',
    long_description: '',
    main_image: '',
    image_gallery: [],
    technical_specs: {},
    is_published: true,
    brochure_url: '',
    video_url: '',
    show_video: true,
    primary_keyword: '',
    related_keywords: [],
    meta_title: '',
    meta_description: '',
  });

  const [parts, setParts] = useState<ProductPart[]>([]);

  const parseRelatedKeywords = (raw: unknown): string[] => {
    if (Array.isArray(raw)) {
      return raw.map(k => String(k).trim()).filter(Boolean);
    }
    if (typeof raw === 'string' && raw.trim()) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.map(k => String(k).trim()).filter(Boolean);
        }
      } catch {
        // Fallback to comma-separated parsing
      }
      return raw
        .split(',')
        .map(k => k.trim())
        .filter(Boolean);
    }
    return [];
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [pRes, dRes] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('divisions').select('*').order('order_index')
      ]);
      if (pRes.data) setProducts(pRes.data);
      if (dRes.data) setDivisions(dRes.data);
    } catch (err) {
      console.error('Registry Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFileUpload = async (file: File, bucket: string = 'products'): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    try {
      const { error } = await supabase.storage.from(bucket).upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath);
      return publicUrl;
    } catch (err: any) {
      console.error('Critical Asset Upload Fault:', err);
      return null;
    }
  };

  const onMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = await handleFileUpload(e.target.files[0], 'products');
      if (url) setFormData(prev => ({ ...prev, main_image: url }));
    }
  };

  const onDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = await handleFileUpload(e.target.files[0], 'documents');
      if (url) setFormData(prev => ({ ...prev, brochure_url: url }));
    }
  };

  const onGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files) as File[];
      const urls: string[] = [];
      for (const file of files) {
        const url = await handleFileUpload(file, 'products');
        if (url) urls.push(url);
      }
      setFormData(prev => ({ 
        ...prev, 
        image_gallery: [...(prev.image_gallery || []), ...urls] 
      }));
    }
  };

  const onPartImageUpload = async (idx: number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        const file = target.files[0] as File;
        const url = await handleFileUpload(file, 'products');
        if (url) {
          const newParts = [...parts];
          newParts[idx].image_url = url;
          setParts(newParts);
        }
      }
    };
    input.click();
  };

  const toggleEditor = async (product: Product | null = null) => {
    setRelatedKeywordInput('');
    if (product) {
      setEditingId(product.id);
      const isVidOn = Boolean(product.show_video) !== false && 
        String(product.show_video) !== 'false' && 
        String(product.show_video) !== '0' && 
        product.technical_specs?._show_video !== 'false';

      const vidUrl = product.video_url || product.technical_specs?._video_url || '';
      const primaryKw = product.primary_keyword || product.technical_specs?._primary_keyword || '';
      const relatedKws = product.related_keywords && product.related_keywords.length > 0
        ? product.related_keywords
        : parseRelatedKeywords(product.technical_specs?._related_keywords);
      const seoTitle = product.meta_title || product.technical_specs?._seo_title || '';
      const seoDesc = product.meta_description || product.technical_specs?._seo_description || '';

      setFormData({ 
        ...product, 
        image_gallery: product.image_gallery || [],
        technical_specs: product.technical_specs || {},
        show_video: isVidOn,
        video_url: vidUrl,
        primary_keyword: primaryKw,
        related_keywords: relatedKws,
        meta_title: seoTitle,
        meta_description: seoDesc,
      });
      const { data } = await supabase.from('product_parts').select('*').eq('product_id', product.id).order('order_index');
      setParts(data || []);
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        model_number: '',
        division_id: divisions[0]?.id || '',
        category_tag: 'High-Performance',
        short_description: '',
        long_description: '',
        main_image: '',
        image_gallery: [],
        technical_specs: { 'Resolution': '4K Cinematic', 'Precision': 'Ultra' },
        is_published: true,
        brochure_url: '',
        video_url: '',
        show_video: true,
        primary_keyword: '',
        related_keywords: [],
        meta_title: '',
        meta_description: '',
      });
      setParts([]);
    }
    setActiveTab('metadata');
    setIsEditorOpen(true);
  };

  const addRelatedKeywordsFromString = (rawInput: string) => {
    const incoming = rawInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    if (incoming.length === 0) return;
    setFormData(prev => {
      const existing = prev.related_keywords || [];
      const merged = Array.from(new Set([...existing, ...incoming]));
      return { ...prev, related_keywords: merged };
    });
    setRelatedKeywordInput('');
  };

  const removeRelatedKeyword = (kwToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      related_keywords: (prev.related_keywords || []).filter(k => k !== kwToRemove)
    }));
  };

  const handleAutoGenerateSEO = () => {
    const prodName = (formData.name || '').trim();
    const modelNum = (formData.model_number || '').trim();
    const category = (formData.category_tag || 'Medical Equipment').trim();
    const divisionName = divisions.find(d => d.id === formData.division_id)?.name || 'Clinical Systems';

    if (!prodName) {
      alert('Please enter the Product Name (Asset Identity) first to auto-generate SEO keywords.');
      return;
    }

    const isDurr =
      prodName.toLowerCase().includes('vista') ||
      prodName.toLowerCase().includes('dürr') ||
      prodName.toLowerCase().includes('durr') ||
      category.toLowerCase().includes('dental');

    const generatedPrimary = isDurr
      ? `${prodName} Dürr Dental Price in Bangladesh`
      : `${prodName}${modelNum ? ` ${modelNum}` : ''} Price in Bangladesh`;

    const generatedRelated = Array.from(
      new Set(
        [
          `${prodName} specification`,
          modelNum ? `${modelNum} ${category}` : '',
          `buy ${prodName} Bangladesh`,
          `${category} supplier Dhaka`,
          `${divisionName} equipment Bangladesh`,
          isDurr ? 'Authorized Dürr Dental distributor Bangladesh' : 'Certified hospital equipment distributor',
          'Carelink Healthineers medical equipment',
          `${prodName} official warranty & price quote`
        ].filter(Boolean)
      )
    );

    const generatedTitle = `${prodName}${modelNum ? ` (${modelNum})` : ''} – ${generatedPrimary}`;
    const baseSummary = (formData.short_description || '').trim();
    const generatedDesc = baseSummary
      ? `${generatedPrimary}. ${baseSummary.slice(0, 110)} Official warranty & direct factory quote from Carelink Healthineers.`
      : `Buy genuine ${prodName}${modelNum ? ` (${modelNum})` : ''} in Bangladesh. Official distributor pricing, technical specifications, installation & warranty by Carelink Healthineers.`;

    setFormData(prev => ({
      ...prev,
      primary_keyword: prev.primary_keyword?.trim() ? prev.primary_keyword : generatedPrimary,
      related_keywords: Array.from(new Set([...(prev.related_keywords || []), ...generatedRelated])),
      meta_title: prev.meta_title?.trim() ? prev.meta_title : generatedTitle,
      meta_description: prev.meta_description?.trim() ? prev.meta_description : generatedDesc
    }));
  };

  const syncProductToGlobalSEOMatrix = async (
    slug: string,
    prodName: string,
    modelNum: string,
    primaryKeyword: string,
    relatedKeywords: string[],
    metaTitle: string,
    metaDescription: string,
    mainImage: string
  ) => {
    try {
      const pagePath = `/portfolio/${slug}`;
      const { data: existingRow } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'page_seo_matrix')
        .maybeSingle();

      let list: any[] = [];
      if (existingRow?.value) {
        try {
          const parsed = JSON.parse(existingRow.value);
          if (Array.isArray(parsed)) list = parsed;
        } catch {
          list = [];
        }
      }

      const combinedKeywords = Array.from(
        new Set(
          [
            primaryKeyword,
            ...relatedKeywords,
            prodName,
            modelNum,
            'Carelink Healthineers'
          ]
            .map(s => (s || '').trim())
            .filter(Boolean)
        )
      );

      const finalTitle =
        metaTitle.trim() ||
        (primaryKeyword
          ? `${prodName}${modelNum ? ` (${modelNum})` : ''} – ${primaryKeyword}`
          : `${prodName}${modelNum ? ` (${modelNum})` : ''}`);

      const finalDescription =
        metaDescription.trim() ||
        (formData.short_description || '').trim() ||
        `Official ${prodName} specifications and factory direct quotation from Carelink Healthineers.`;

      const seoEntry = {
        id: `seo-prod-${slug}`,
        page_path: pagePath,
        title: finalTitle,
        meta_description: finalDescription,
        keywords: combinedKeywords,
        og_image: mainImage || 'https://i.imgur.com/y0UvXGu.png',
        updated_at: new Date().toISOString()
      };

      const existingIdx = list.findIndex((item: any) => item.page_path === pagePath);
      if (existingIdx >= 0) {
        list[existingIdx] = { ...list[existingIdx], ...seoEntry };
      } else {
        list.unshift(seoEntry);
      }

      await supabase.from('settings').upsert(
        {
          key: 'page_seo_matrix',
          value: JSON.stringify(list),
          category: 'seo',
          description: 'Global dynamic route SEO metadata matrix'
        },
        { onConflict: 'key' }
      );
    } catch (err) {
      console.warn('SEO Matrix sync notice:', err);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.model_number) return alert('Registry Fault: Identity Missing');
    setIsSaving(true);

    // Commit any pending related keyword typed into the input box before saving
    const pendingRelated = relatedKeywordInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    const finalRelatedKeywords = Array.from(
      new Set([...(formData.related_keywords || []), ...pendingRelated])
    );
    const finalPrimaryKeyword = (formData.primary_keyword || '').trim();
    const finalMetaTitle = (formData.meta_title || '').trim();
    const finalMetaDesc = (formData.meta_description || '').trim();

    const slug = editingId && formData.slug
      ? formData.slug
      : `${slugify(formData.name)}-${slugify(formData.model_number)}`;
    
    try {
      const isVidOn = formData.show_video !== false && String(formData.show_video) !== 'false';
      const techSpecs: Record<string, string> = {
        ...(formData.technical_specs || {}),
        _show_video: String(isVidOn),
        _video_url: formData.video_url || '',
        _primary_keyword: finalPrimaryKeyword,
        _related_keywords: finalRelatedKeywords.join(', '),
        _seo_title: finalMetaTitle,
        _seo_description: finalMetaDesc,
      };

      // Clean out UI-only fields before sending to Supabase products table
      const {
        primary_keyword,
        related_keywords,
        parts: _unusedParts,
        ...dbFields
      } = formData as any;

      const payload: any = { 
        ...dbFields, 
        meta_title: finalMetaTitle || null,
        meta_description: finalMetaDesc || null,
        show_video: isVidOn,
        video_url: formData.video_url || '',
        technical_specs: techSpecs,
        slug 
      };

      let productId = editingId;
      if (editingId) {
        const { data: updatedRows, error: updateErr } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editingId)
          .select();

        if (updateErr) {
          console.warn('Payload update warning, falling back to schema-safe columns:', updateErr.message);
          const { show_video, video_url, meta_title, meta_description, ...safePayload } = payload;
          const { data: fallbackRows, error: fallbackErr } = await supabase
            .from('products')
            .update(safePayload)
            .eq('id', editingId)
            .select();

          if (fallbackErr) throw fallbackErr;
          if (!fallbackRows || fallbackRows.length === 0) {
            throw new Error('Update failed: 0 rows modified in public.products (check RLS permissions).');
          }
        } else if (!updatedRows || updatedRows.length === 0) {
          throw new Error('Update failed: 0 rows modified in public.products (check RLS permissions).');
        }
      } else {
        let { data, error: insertErr } = await supabase.from('products').insert([payload]).select();
        if (insertErr) {
          console.warn('Payload insert warning, falling back to schema-safe columns:', insertErr.message);
          const { show_video, video_url, meta_title, meta_description, ...safePayload } = payload;
          const res = await supabase.from('products').insert([safePayload]).select();
          if (res.error) throw res.error;
          data = res.data;
        }
        if (!data || data.length === 0) {
          throw new Error('Insert failed: 0 rows created in public.products (check RLS permissions).');
        }
        productId = data[0].id;
      }

      if (productId) {
        const { error: delPartsErr } = await supabase.from('product_parts').delete().eq('product_id', productId);
        if (delPartsErr) console.warn('Product parts cleanup notice:', delPartsErr.message);
        if (parts.length > 0) {
          const { error: insPartsErr } = await supabase.from('product_parts').insert(parts.map((p, i) => ({
            product_id: productId,
            name: p.name,
            description: p.description,
            image_url: p.image_url,
            order_index: i
          })));
          if (insPartsErr) throw insPartsErr;
        }
      }

      // Sync product SEO keywords & metadata into the global SEO Matrix
      await syncProductToGlobalSEOMatrix(
        slug,
        formData.name,
        formData.model_number,
        finalPrimaryKeyword,
        finalRelatedKeywords,
        finalMetaTitle,
        finalMetaDesc,
        formData.main_image || ''
      );

      setRelatedKeywordInput('');
      await fetchData();
      setIsEditorOpen(false);
    } catch (err: any) {
      console.error('Product Save Error:', err);
      alert(`Failed to save product: ${err?.message || 'Database mutation error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Compute SEO readiness score for the editor
  const seoScoreInfo = (() => {
    let score = 0;
    const hasPrimary = Boolean(formData.primary_keyword?.trim());
    const relCount = (formData.related_keywords || []).length;
    const hasDesc = Boolean((formData.meta_description || formData.short_description || '').trim());
    const hasImage = Boolean(formData.main_image?.trim());

    if (hasPrimary) score += 40;
    if (relCount >= 3) score += 30;
    else if (relCount >= 1) score += 15;
    if (hasDesc) score += 15;
    if (hasImage) score += 15;

    return { score, hasPrimary, relCount };
  })();

  const renderSEOPanel = () => {
    const previewSlug = formData.slug || `${slugify(formData.name || 'product')}-${slugify(formData.model_number || 'model')}`;
    const previewTitle =
      formData.meta_title?.trim() ||
      (formData.primary_keyword?.trim()
        ? `${formData.name || 'Product Name'} (${formData.model_number || 'Model'}) – ${formData.primary_keyword.trim()} | Carelink Healthineers`
        : `${formData.name || 'Product Name'} | Carelink Healthineers`);
    const previewDesc =
      formData.meta_description?.trim() ||
      formData.short_description?.trim() ||
      'Official medical and dental equipment specifications, warranty, and direct factory quotation from Carelink Healthineers.';

    return (
      <div className="p-8 bg-gradient-to-br from-emerald-950/30 via-[#0a0f18] to-blue-950/20 rounded-[2.5rem] border border-emerald-500/20 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
              <Globe size={26} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h4 className="text-xl font-black text-white tracking-tight">
                  Google Top Ranking SEO &amp; Keyword Engine
                </h4>
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                  seoScoreInfo.score >= 80
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : seoScoreInfo.score >= 50
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                }`}>
                  SEO Power: {seoScoreInfo.score}%
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Set the Primary Keyword and Related Keywords for this product to rank #1 on Google Search, Schema.org Product Rich Snippets, and Sitemap indexing.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAutoGenerateSEO}
            className="px-6 py-4 bg-emerald-500 hover:bg-emerald-400 text-black rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2.5 shadow-lg shadow-emerald-500/20 transition-all shrink-0 cursor-pointer"
          >
            <Sparkles size={16} />
            <span>Auto-Generate Strong SEO</span>
          </button>
        </div>

        {/* 1. Primary Keyword */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] flex items-center gap-2">
              <Tag size={13} /> Primary Keyword (Main Google Ranking Keyword) *
            </label>
            <span className="text-[10px] font-bold text-slate-500">
              Front-loaded in Google Title, H1 Schema &amp; Meta Tags
            </span>
          </div>
          <input
            type="text"
            placeholder="e.g., VistaPano S 2.0 Panoramic X-Ray Price in Bangladesh"
            className="w-full px-6 py-4 bg-black/60 border border-emerald-500/30 rounded-2xl outline-none font-bold text-sm text-white placeholder:text-slate-600 focus:border-emerald-400 transition-all"
            value={formData.primary_keyword || ''}
            onChange={e => setFormData({ ...formData, primary_keyword: e.target.value })}
          />
        </div>

        {/* 2. Related Keywords */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] flex items-center gap-2">
              <Sparkles size={13} /> Related Keywords (Secondary &amp; Long-Tail Search Terms)
            </label>
            <span className="text-[10px] font-bold text-slate-500">
              {(formData.related_keywords || []).length} keywords active
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Type related keywords separated by commas (e.g., digital dental x-ray, Dürr Dental Bangladesh, OPG machine price) and press Enter..."
              className="flex-1 px-6 py-4 bg-black/60 border border-white/10 rounded-2xl outline-none font-medium text-xs text-white placeholder:text-slate-600 focus:border-blue-500 transition-all"
              value={relatedKeywordInput}
              onChange={e => setRelatedKeywordInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ',') {
                  e.preventDefault();
                  addRelatedKeywordsFromString(relatedKeywordInput);
                }
              }}
            />
            <button
              type="button"
              onClick={() => addRelatedKeywordsFromString(relatedKeywordInput)}
              className="px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 cursor-pointer"
            >
              + Add Keywords
            </button>
          </div>

          {/* Active Related Keyword Chips */}
          {(formData.related_keywords || []).length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-2">
              {(formData.related_keywords || []).map((kw, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-500/10 border border-blue-500/25 text-blue-300 text-xs font-bold"
                >
                  <span>{kw}</span>
                  <button
                    type="button"
                    onClick={() => removeRelatedKeyword(kw)}
                    className="text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Remove keyword"
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-slate-500 italic">
              No related keywords added yet. Type keywords above or click &ldquo;Auto-Generate Strong SEO&rdquo;.
            </p>
          )}
        </div>

        {/* 3. Custom SEO Title & Meta Description */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/10">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
              Custom SEO Title (Optional Override)
            </label>
            <input
              type="text"
              placeholder="Auto-generated from Product Name + Primary Keyword if left blank"
              className="w-full px-5 py-3.5 bg-black/50 border border-white/10 rounded-xl outline-none text-xs font-bold text-white placeholder:text-slate-600 focus:border-blue-500 transition-all"
              value={formData.meta_title || ''}
              onChange={e => setFormData({ ...formData, meta_title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
              Custom SEO Meta Description (Optional Override)
            </label>
            <input
              type="text"
              placeholder="Auto-generated from Primary Keyword + Summary if left blank"
              className="w-full px-5 py-3.5 bg-black/50 border border-white/10 rounded-xl outline-none text-xs font-medium text-white placeholder:text-slate-600 focus:border-blue-500 transition-all"
              value={formData.meta_description || ''}
              onChange={e => setFormData({ ...formData, meta_description: e.target.value })}
            />
          </div>
        </div>

        {/* 4. Live Google Search Result Preview */}
        <div className="p-6 bg-white rounded-2xl text-slate-900 space-y-1.5 shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 size={13} /> Live Google Search Snippet Preview
            </span>
            <span className="text-[10px] font-mono text-slate-400">Schema.org/Product Enabled</span>
          </div>
          <div className="text-xs text-slate-600 truncate">
            https://carelinkhealthineers.com/portfolio/{previewSlug}
          </div>
          <div className="text-base md:text-lg font-bold text-[#1a0dab] hover:underline truncate">
            {previewTitle}
          </div>
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {previewDesc}
          </p>
        </div>
      </div>
    );
  };

  const filteredProductsList = products.filter(p => {
    const q = searchTerm.toLowerCase();
    if (!q) return true;
    const pk = (p.primary_keyword || p.technical_specs?._primary_keyword || '').toLowerCase();
    const rk = (p.technical_specs?._related_keywords || '').toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.model_number || '').toLowerCase().includes(q) ||
      pk.includes(q) ||
      rk.includes(q)
    );
  });

  return (
    <div className="p-10 lg:p-16 bg-[#020408] min-h-screen text-white">
      <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
           <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.4em]">Node_Control: Asset_Master</span>
           </div>
           <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">Product <span className="text-slate-700 italic">Architecture.</span></h1>
        </div>
        <div className="flex gap-4">
          <button onClick={fetchData} className="p-4 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all shadow-xl">
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => toggleEditor()} className="flex items-center gap-4 px-10 py-5 bg-white text-black rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-2xl cursor-pointer">
            <Plus size={18} /> Deploy New Asset
          </button>
        </div>
      </header>

      {/* Modern Search Node */}
      <div className="relative group mb-16">
        <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-blue-500 transition-colors" />
        <input 
          type="text" 
          placeholder="QUERY REGISTRY BY PRODUCT NAME, MODEL, OR SEO KEYWORD..." 
          className="w-full bg-white/[0.02] border border-white/5 rounded-3xl pl-16 pr-8 py-6 text-[10px] font-black text-white placeholder:text-slate-800 uppercase tracking-widest outline-none focus:border-blue-600 focus:bg-white/[0.04] transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Asset Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-10">
        {isLoading ? (
          <div className="col-span-full py-60 flex flex-col items-center justify-center opacity-30">
             <Loader2 size={64} className="animate-spin mb-8 text-blue-500" />
             <span className="text-[9px] font-black uppercase tracking-[0.8em]">Syncing Neural Database...</span>
          </div>
        ) : (
          filteredProductsList.map((item) => {
            const itemPrimaryKw = item.primary_keyword || item.technical_specs?._primary_keyword || '';
            return (
              <motion.div layout key={item.id} className="bg-white/[0.01] rounded-[2.5rem] p-8 border border-white/5 overflow-hidden group hover:border-blue-500/50 hover:bg-white/[0.02] transition-all duration-500 shadow-2xl flex flex-col h-full">
                 <div className="aspect-[4/3] rounded-[2rem] overflow-hidden bg-black mb-8 border border-white/5 relative">
                    <img src={item.main_image} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000 grayscale group-hover:grayscale-0" />
                    <div className="absolute top-5 right-5 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[7px] font-black text-white uppercase tracking-widest border border-white/10">
                      {item.model_number}
                    </div>
                 </div>
                 <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-[8px] font-black uppercase tracking-widest rounded-lg border border-blue-500/20">
                      {divisions.find(d => d.id === item.division_id)?.name || 'UNMAPPED'}
                    </span>
                    <div className="flex items-center gap-2">
                      {(() => {
                        const isVidOn = item.show_video !== false && 
                          String(item.show_video) !== 'false' && 
                          Number(item.show_video) !== 0 && 
                          String(item.show_video) !== '0' && 
                          item.technical_specs?._show_video !== 'false';
                        return (
                          <span className={`px-2 py-0.5 text-[7px] font-black uppercase tracking-widest rounded ${isVidOn ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                            {isVidOn ? 'VIDEO: ON' : 'VIDEO: OFF'}
                          </span>
                        );
                      })()}
                      <div className={`flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest ${item.is_published ? 'text-emerald-500' : 'text-amber-500'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${item.is_published ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 opacity-30'}`} />
                        {item.is_published ? 'LIVE' : 'DRAFT'}
                      </div>
                    </div>
                 </div>
                 <h3 className="text-xl font-black text-white mb-2 tracking-tight group-hover:text-blue-500 transition-colors line-clamp-1">{item.name}</h3>
                 <p className="text-slate-500 text-[10px] font-bold uppercase tracking-tight leading-relaxed line-clamp-2 h-10 italic mb-4 opacity-60">{item.short_description}</p>

                 {/* Primary SEO Keyword Indicator */}
                 <div className="mb-6">
                   {itemPrimaryKw ? (
                     <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold truncate flex items-center gap-1.5">
                       <Globe size={11} className="shrink-0" />
                       <span className="truncate">SEO: {itemPrimaryKw}</span>
                     </div>
                   ) : (
                     <div className="px-3 py-1.5 rounded-xl bg-white/[0.02] border border-white/5 text-slate-600 text-[9px] font-bold truncate flex items-center gap-1.5">
                       <Globe size={11} className="shrink-0" />
                       <span>SEO Keywords Not Set</span>
                     </div>
                   )}
                 </div>
                 
                 <div className="mt-auto flex gap-3">
                    <button onClick={() => toggleEditor(item)} className="flex-1 py-4 bg-white/5 text-white border border-white/5 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all cursor-pointer">Modify</button>
                    <button onClick={async () => {
                      if (confirm('Purge product from registry?')) {
                        const { data, error } = await supabase.from('products').delete().eq('id', item.id).select();
                        if (error) {
                          alert(`Failed to delete product: ${error.message}`);
                          return;
                        }
                        if (!data || data.length === 0) {
                          alert('Delete blocked by Row-Level Security (0 rows deleted).');
                          return;
                        }
                        fetchData();
                      }
                    }} className="p-4 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-2xl hover:bg-rose-500 hover:text-white transition-all cursor-pointer"><Trash2 size={16} /></button>
                 </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Command Editor Modal */}
      <AnimatePresence>
        {isEditorOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-12">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditorOpen(false)} className="absolute inset-0 bg-[#020408]/90 backdrop-blur-3xl" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.98, y: 30 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.98, y: 30 }} 
              className="relative w-full max-w-[1400px] h-full bg-[#05070a] rounded-[3rem] border border-white/10 shadow-4xl flex flex-col overflow-hidden"
            >
              <header className="p-10 border-b border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 bg-white/[0.01]">
                 <div className="flex items-center gap-8">
                    <div className="w-20 h-20 rounded-[2.5rem] bg-blue-600 text-white flex items-center justify-center shadow-2xl shadow-blue-500/20">
                       <Terminal size={36} />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-white tracking-tighter leading-none">{editingId ? 'Modify System Node' : 'Initialize Infrastructure'}</h2>
                      <div className="flex items-center gap-3 mt-3">
                        <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.4em]">{formData.name || 'UNINITIALIZED'}</span>
                        <ChevronRight size={10} className="text-slate-800" />
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em]">{activeTab} Terminal</span>
                      </div>
                    </div>
                 </div>

                 <nav className="flex flex-wrap bg-white/5 p-1.5 rounded-full border border-white/5">
                    {[
                      { id: 'metadata', label: 'Identity & SEO' },
                      { id: 'seo', label: 'SEO Keywords' },
                      { id: 'blueprints', label: 'Metrics' },
                      { id: 'visuals', label: 'Visuals' },
                      { id: 'architecture', label: 'Structure' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as EditorTab)}
                        className={`px-6 py-3.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                          activeTab === tab.id ? 'bg-white text-black' : 'text-slate-500 hover:text-white'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                 </nav>
              </header>

              <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                <AnimatePresence mode='wait'>
                  {activeTab === 'metadata' && (
                    <motion.div key="meta" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 max-w-4xl">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                             <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] px-1">Asset Identity (Product Name)</label>
                             <input className="w-full px-8 py-5 bg-white/[0.02] border border-white/10 rounded-2xl outline-none font-black text-xl text-white focus:border-blue-600 transition-all" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g., VistaPano S 2.0" />
                          </div>
                          <div className="space-y-3">
                             <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] px-1">Registry Model Number</label>
                             <input className="w-full px-8 py-5 bg-white/[0.02] border border-white/10 rounded-2xl outline-none font-mono text-blue-500 font-bold focus:border-blue-600 transition-all" value={formData.model_number} onChange={e => setFormData({...formData, model_number: e.target.value})} placeholder="e.g., DURR-VP-S20" />
                          </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                             <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] px-1">Clinical Department</label>
                             <select className="w-full px-8 py-5 bg-white/[0.02] border border-white/10 rounded-2xl outline-none font-bold text-slate-300 cursor-pointer focus:border-blue-600 transition-all" value={formData.division_id} onChange={e => setFormData({...formData, division_id: e.target.value})}>
                                <option value="">Select Division Node...</option>
                                {divisions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                             </select>
                          </div>
                          <div className="space-y-3">
                             <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] px-1">Protocol Tag (Category)</label>
                             <input className="w-full px-8 py-5 bg-white/[0.02] border border-white/10 rounded-2xl outline-none font-bold text-white focus:border-blue-600 transition-all" value={formData.category_tag} onChange={e => setFormData({...formData, category_tag: e.target.value})} />
                          </div>
                       </div>

                       <div className="space-y-3">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] px-1">Technical Summary (Short Description)</label>
                          <textarea rows={3} className="w-full px-8 py-5 bg-white/[0.02] border border-white/10 rounded-2xl outline-none font-medium leading-relaxed text-slate-300 focus:border-blue-600 transition-all" value={formData.short_description} onChange={e => setFormData({...formData, short_description: e.target.value})} placeholder="Clear summary of this medical/dental system..." />
                       </div>

                       {/* Primary & Related Keywords SEO Box directly inside the Add/Edit Product form */}
                       {renderSEOPanel()}
                       
                       <div className="p-8 bg-blue-500/5 rounded-[2.5rem] border border-blue-500/10 flex flex-col md:flex-row items-center justify-between gap-10">
                          <div className="flex items-center gap-6">
                             <div className="w-16 h-16 bg-blue-600/10 text-blue-500 rounded-2xl flex items-center justify-center border border-blue-500/20">
                                <FileText size={28} />
                             </div>
                             <div>
                                <h4 className="text-xl font-black text-white tracking-tight leading-none">Technical Dossier (PDF Brochure)</h4>
                                <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mt-2 block">Archive_Sync Status: {formData.brochure_url ? 'LINKED' : 'NULL'}</span>
                             </div>
                          </div>
                          <div className="flex-1 max-w-lg w-full">
                             <div className="flex items-center gap-3 bg-white/[0.02] p-2 rounded-2xl border border-white/5">
                               <input 
                                 type="text" 
                                 className="flex-1 px-4 py-3 bg-transparent outline-none text-[9px] font-mono text-blue-400 placeholder:text-slate-800" 
                                 placeholder="MASTER_URL_SOURCE..." 
                                 value={formData.brochure_url || ''} 
                                 onChange={e => setFormData({...formData, brochure_url: e.target.value})}
                               />
                               <button onClick={() => docRef.current?.click()} className="px-6 py-3 bg-white text-black rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all cursor-pointer">
                                  Sync Source
                               </button>
                             </div>
                             <input ref={docRef} type="file" className="hidden" onChange={onDocUpload} />
                          </div>
                       </div>

                       {/* Product Video Control Box */}
                       <div className="p-8 bg-[#0a0f18] rounded-[2.5rem] border border-white/10 flex flex-col gap-6">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                             <div className="flex items-center gap-5">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${formData.show_video !== false ? 'bg-blue-600/20 text-blue-400 border-blue-500/30' : 'bg-white/5 text-slate-500 border-white/10'}`}>
                                   <Tv size={26} />
                                </div>
                                <div>
                                   <h4 className="text-xl font-black text-white tracking-tight">Product Video Button</h4>
                                   <p className="text-xs text-slate-400 font-medium">Enable or disable the "Watch Video" button and video tab on this product's detail page.</p>
                                </div>
                             </div>

                             <button 
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, show_video: prev.show_video === false }))}
                                className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all cursor-pointer ${
                                  formData.show_video !== false 
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                                    : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
                                }`}
                             >
                                <div className={`w-3 h-3 rounded-full ${formData.show_video !== false ? 'bg-white animate-pulse' : 'bg-rose-500'}`} />
                                <span>{formData.show_video !== false ? 'Button Status: ENABLED' : 'Button Status: DISABLED'}</span>
                             </button>
                          </div>

                          {formData.show_video !== false && (
                            <div className="space-y-3 pt-4 border-t border-white/10">
                               <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                                  <Tv size={14} /> Product Video Link (YouTube, Vimeo, Google Drive, MP4, or Website Video)
                               </label>
                               <input 
                                  type="text" 
                                  placeholder="Paste YouTube, Vimeo, Google Drive, or MP4 video link..." 
                                  className="w-full px-6 py-4 bg-black/60 border border-white/10 rounded-2xl outline-none font-mono text-xs text-blue-400 focus:border-blue-600 transition-all"
                                  value={formData.video_url || ''} 
                                  onChange={e => setFormData({ ...formData, video_url: e.target.value })}
                               />
                               <p className="text-[11px] text-slate-400 font-medium">
                                  Paste any YouTube link, Vimeo, Google Drive video link, or direct MP4. It will play directly on your website when visitors click "Watch Video".
                               </p>
                            </div>
                          )}
                       </div>
                    </motion.div>
                  )}

                  {activeTab === 'seo' && (
                    <motion.div key="seo-tab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl">
                      {renderSEOPanel()}
                    </motion.div>
                  )}

                  {activeTab === 'blueprints' && (
                    <motion.div key="tech" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10 max-w-4xl">
                       <header className="flex items-center justify-between mb-8">
                          <h4 className="text-xl font-black text-white tracking-tighter">Performance Coefficients</h4>
                          <button onClick={() => setFormData(prev => ({ ...prev, technical_specs: { ...prev.technical_specs, 'NEW_METRIC': 'NOMINAL' } }))} className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all cursor-pointer">
                             Add Node
                          </button>
                       </header>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(formData.technical_specs || {})
                            .filter(([key]) => !key.startsWith('_'))
                            .map(([key, val], idx) => (
                            <div key={idx} className="flex gap-3 items-center bg-white/[0.02] p-4 rounded-2xl border border-white/5 group">
                               <input className="flex-1 bg-black/40 px-4 py-3 rounded-xl outline-none font-black text-[9px] uppercase tracking-widest text-slate-400" value={key} onChange={e => {
                                 const newSpecs = { ...formData.technical_specs };
                                 const newKey = e.target.value;
                                 const oldVal = newSpecs[key];
                                 delete newSpecs[key];
                                 newSpecs[newKey] = oldVal;
                                 setFormData({...formData, technical_specs: newSpecs});
                               }} />
                               <input className="flex-1 bg-black/40 px-4 py-3 rounded-xl outline-none font-bold text-[10px] text-blue-500" value={val} onChange={e => setFormData({...formData, technical_specs: { ...formData.technical_specs, [key]: e.target.value }})} />
                               <button onClick={() => {
                                 const newSpecs = { ...formData.technical_specs };
                                 delete newSpecs[key];
                                 setFormData({...formData, technical_specs: newSpecs});
                               }} className="p-3 text-slate-600 hover:text-rose-500 transition-colors cursor-pointer"><X size={16} /></button>
                            </div>
                          ))}
                       </div>
                    </motion.div>
                  )}

                  {activeTab === 'visuals' && (
                    <motion.div key="vis" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-16 max-w-5xl">
                       <div className="space-y-8">
                          <header className="flex items-end justify-between">
                             <div>
                               <h4 className="text-3xl font-black text-white tracking-tighter">Master Visual Node</h4>
                               <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2 opacity-60 italic">Primary Asset Identification</p>
                             </div>
                             <button onClick={() => mainImageRef.current?.click()} className="px-10 py-5 bg-white text-black rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-blue-600 hover:text-white transition-all cursor-pointer">
                                Source Image
                             </button>
                             <input ref={mainImageRef} type="file" accept="image/*" className="hidden" onChange={onMainImageUpload} />
                          </header>

                          <div className="w-full aspect-video rounded-[3rem] bg-black border border-white/5 overflow-hidden relative group">
                             {formData.main_image ? (
                               <img src={formData.main_image} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-1000" />
                             ) : (
                               <div className="absolute inset-0 flex flex-col items-center justify-center opacity-10">
                                  <ImageIcon size={100} />
                               </div>
                             )}
                             <div className="absolute bottom-10 left-10 p-4 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl">
                                <span className="text-[8px] font-black text-blue-500 uppercase tracking-[0.4em]">Primary_Registry_Asset</span>
                             </div>
                          </div>
                       </div>

                       <div className="space-y-8 mt-16 border-t border-white/5 pt-16">
                          <header className="flex items-end justify-between">
                             <div>
                               <h4 className="text-3xl font-black text-white tracking-tighter">Asset Gallery</h4>
                               <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2 opacity-60 italic">Supplemental Visual Matrix</p>
                             </div>
                             <button onClick={() => galleryRef.current?.click()} className="px-10 py-5 bg-white/5 border border-white/10 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-3 cursor-pointer">
                                <Plus size={16} /> Batch Upload Assets
                             </button>
                             <input ref={galleryRef} type="file" className="hidden" multiple accept="image/*" onChange={onGalleryUpload} />
                          </header>

                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                             {formData.image_gallery?.map((url, i) => (
                               <div key={i} className="aspect-square bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden relative group shadow-xl">
                                  <img src={url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all" />
                                  <button onClick={() => setFormData(prev => ({ ...prev, image_gallery: prev.image_gallery?.filter((_, idx) => idx !== i) }))} className="absolute top-4 right-4 p-2 bg-rose-500/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"><X size={14} /></button>
                               </div>
                             ))}
                             <button onClick={() => galleryRef.current?.click()} className="aspect-square bg-white/[0.01] border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-slate-800 hover:text-blue-500 hover:border-blue-500/20 transition-all group/btn cursor-pointer">
                                <ImagePlus size={32} className="group-hover/btn:scale-110 transition-transform" />
                                <span className="text-[8px] font-black uppercase tracking-widest mt-4">Append Asset</span>
                             </button>
                          </div>
                       </div>
                    </motion.div>
                  )}

                  {activeTab === 'architecture' && (
                    <motion.div key="arch" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 max-w-5xl">
                       <header className="flex items-center justify-between mb-8">
                          <h4 className="text-xl font-black text-white tracking-tighter">Sub-System Decomposition</h4>
                          <button onClick={() => setParts(prev => [...prev, { name: 'Module Name', description: 'Technical description...', image_url: '' }])} className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-xl cursor-pointer">
                             Initialize Sub-Node
                          </button>
                       </header>

                       <div className="grid grid-cols-1 gap-8">
                          {parts.map((part, i) => (
                            <motion.div layout key={i} className="bg-white/[0.01] rounded-[2.5rem] p-8 border border-white/5 flex flex-col md:flex-row gap-10 group relative">
                               <div className="w-full md:w-[350px] aspect-square rounded-[2rem] bg-black border border-white/5 relative shrink-0 overflow-hidden">
                                  {part.image_url ? (
                                    <img src={part.image_url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-1000" />
                                  ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-5">
                                       <Box size={80} />
                                    </div>
                                  )}
                                  <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                     <button onClick={() => onPartImageUpload(i)} className="px-6 py-3 bg-white text-black rounded-xl text-[8px] font-black uppercase tracking-widest shadow-2xl cursor-pointer">
                                        Source Local
                                     </button>
                                  </div>
                               </div>
                               <div className="flex-1 space-y-6">
                                  <div className="flex items-center justify-between">
                                     <span className="text-[8px] font-black text-blue-600 uppercase tracking-[0.4em]">Sub_Sys_Node_0{i+1}</span>
                                     <button onClick={() => setParts(prev => prev.filter((_, idx) => idx !== i))} className="text-slate-600 hover:text-rose-500 transition-colors cursor-pointer"><Trash size={20} /></button>
                                  </div>
                                  <input className="w-full bg-white/[0.02] border border-white/5 px-6 py-4 rounded-xl outline-none font-black text-white text-xl focus:border-blue-600 transition-all" value={part.name} onChange={e => {
                                    const newParts = [...parts];
                                    newParts[i].name = e.target.value;
                                    setParts(newParts);
                                  }} />
                                  <textarea rows={4} className="w-full bg-white/[0.02] border border-white/5 px-6 py-4 rounded-xl outline-none font-medium text-slate-500 leading-relaxed text-sm italic focus:border-blue-600 transition-all" value={part.description} onChange={e => {
                                    const newParts = [...parts];
                                    newParts[i].description = e.target.value;
                                    setParts(newParts);
                                  }} />
                               </div>
                            </motion.div>
                          ))}
                       </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <footer className="p-10 border-t border-white/5 bg-white/[0.01] flex flex-col md:flex-row items-center justify-between gap-10">
                 <div className="flex items-center gap-10">
                    <div className="flex items-center gap-4">
                       <button 
                         onClick={() => setFormData({...formData, is_published: !formData.is_published})}
                         className={`w-12 h-6 rounded-full relative transition-all cursor-pointer ${formData.is_published ? 'bg-emerald-500' : 'bg-slate-800'}`}
                       >
                         <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.is_published ? 'left-7' : 'left-1'}`} />
                       </button>
                       <span className="text-[9px] font-black text-white uppercase tracking-widest">Registry_Broadcast: {formData.is_published ? 'LIVE_PUBLIC' : 'DRAFT_MODE'}</span>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <button onClick={() => setIsEditorOpen(false)} className="px-8 py-4 font-black text-slate-600 hover:text-white uppercase text-[9px] tracking-widest transition-colors cursor-pointer">Abort_Process</button>
                    <button onClick={handleSave} disabled={isSaving} className="px-12 py-5 bg-white text-black rounded-3xl font-black shadow-2xl hover:bg-blue-600 hover:text-white transition-all flex items-center gap-4 cursor-pointer">
                       {isSaving ? <RefreshCw size={20} className="animate-spin" /> : <Save size={20} />}
                       Commit_To_Registry
                    </button>
                 </div>
              </footer>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
