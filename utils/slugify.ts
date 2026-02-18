
export const generateProductSlug = (name: string, model: string, keyword: string): string => {
  const base = `${name} ${model} ${keyword}`.toLowerCase();
  return base
    .replace(/[^\w\s-]/g, '') // remove non-word chars
    .replace(/\s+/g, '-')     // replace spaces with hyphens
    .replace(/-+/g, '-')      // remove multiple hyphens
    .trim();
};

export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};
