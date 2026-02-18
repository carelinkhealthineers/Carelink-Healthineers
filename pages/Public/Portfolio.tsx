
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronRight, LayoutGrid, ListFilter, Activity } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { SEO } from '../../components/SEO';

// Expanded product list based on user's clinical departments
export const MASTER_PRODUCTS = [
  // Laboratory
  { id: 'lab-1', name: 'Automated Hematology Analyzer', model: 'XT-Series 5-Part', division: 'laboratory-pathology', sub: 'Lab Equipment', image: 'https://picsum.photos/seed/lab1/400/400' },
  { id: 'lab-2', name: 'Biochemistry Analyzer', model: 'Bio-Smart 400', division: 'laboratory-pathology', sub: 'Lab Equipment', image: 'https://picsum.photos/seed/lab2/400/400' },
  { id: 'lab-3', name: 'Immunoassay Analyzer (CLIA)', model: 'Hormone-Nexus', division: 'laboratory-pathology', sub: 'Lab Equipment', image: 'https://picsum.photos/seed/lab3/400/400' },
  
  // Imaging
  { id: 'rad-1', name: 'Digital X-Ray Machine (DR)', model: 'DRX-900 Elite', division: 'imaging-radiology', sub: 'Imaging Equipment', image: 'https://picsum.photos/seed/rad1/400/400' },
  { id: 'rad-2', name: 'Ultrasound / Color Doppler', model: 'Sono-Vision G30', division: 'imaging-radiology', sub: 'Imaging Equipment', image: 'https://picsum.photos/seed/rad2/400/400' },
  { id: 'rad-3', name: 'CT Scan System', model: 'Multi-Slice 128', division: 'imaging-radiology', sub: 'Imaging Equipment', image: 'https://picsum.photos/seed/rad3/400/400' },
  
  // Surgical
  { id: 'ot-1', name: 'Operation Table (Electric)', model: 'Surgi-Base E200', division: 'surgical-ot', sub: 'Surgical Items', image: 'https://picsum.photos/seed/ot1/400/400' },
  { id: 'ot-2', name: 'Anesthesia Machine', model: 'Flow-Master V5', division: 'surgical-ot', sub: 'Surgical Items', image: 'https://picsum.photos/seed/ot2/400/400' },
  
  // ICU
  { id: 'icu-1', name: 'ICU Ventilator', model: 'Breathe-Pro X3', division: 'critical-care', sub: 'Critical Care', image: 'https://picsum.photos/seed/icu1/400/400' },
  { id: 'icu-2', name: 'Multi-Parameter Monitor', model: 'Vital-Sync 12', division: 'critical-care', sub: 'Critical Care', image: 'https://picsum.photos/seed/icu2/400/400' },
  
  // OPD
  { id: 'opd-1', name: 'Digital BP Monitor', model: 'Press-Check 500', division: 'opd-examination', sub: 'OPD Equipment', image: 'https://picsum.photos/seed/opd1/400/400' },
  
  // Dialysis
  { id: 'dia-1', name: 'Hemodialysis Machine', model: 'Renal-X Platinum', division: 'dialysis', sub: 'Dialysis Equipment', image: 'https://picsum.photos/seed/dia1/400/400' },
  
  // Dental
  { id: 'den-1', name: 'Dental Chair Unit', model: 'Aura-Dental S', division: 'dental', sub: 'Dental Equipment', image: 'https://picsum.photos/seed/den1/400/400' },
  
  // Sterilization
  { id: 'cssd-1', name: 'Plasma Sterilizer', model: 'Clean-99 Low Temp', division: 'sterilization', sub: 'CSSD Systems', image: 'https://picsum.photos/seed/cssd1/400/400' },
  
  // Furniture
  { id: 'furn-1', name: 'Electric Hospital Bed', model: 'Zen-Bed ICU-Grade', division: 'hospital-furniture', sub: 'Furniture', image: 'https://picsum.photos/seed/furn1/400/400' },
  
  // Consumables
  { id: 'con-1', name: 'Lab Reagents & Kits', model: 'Assay-Pack 500', division: 'consumables', sub: 'Consumables', image: 'https://picsum.photos/seed/con1/400/400' },
];

const DEPARTMENTS = [
  { name: 'All', slug: 'all' },
  { name: 'Laboratory', slug: 'laboratory-pathology' },
  { name: 'Radiology', slug: 'imaging-radiology' },
  { name: 'OT / Surgical', slug: 'surgical-ot' },
  { name: 'Critical Care', slug: 'critical-care' },
  { name: 'OPD / Exams', slug: 'opd-examination' },
  { name: 'Dialysis', slug: 'dialysis' },
  { name: 'Dental', slug: 'dental' },
  { name: 'Sterilization', slug: 'sterilization' },
  { name: 'Furniture', slug: 'hospital-furniture' },
  { name: 'Consumables', slug: 'consumables' },
];

export const Portfolio: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentDept = searchParams.get('division') || 'all';
  const [search, setSearch] = useState('');

  const filteredProducts = useMemo(() => {
    return MASTER_PRODUCTS.filter(p => {
      const matchDept = currentDept === 'all' || p.division === currentDept;
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.model.toLowerCase().includes(search.toLowerCase());
      return matchDept && matchSearch;
    });
  }, [currentDept, search]);

  return (
    <div className="pt-32 pb-20 bg-gray-50 min-h-screen">
      <SEO title="Platform Portfolio" description="The complete inventory of professional medical hardware and infrastructure." />

      <div className="max-w-[1600px] mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Filters */}
          <aside className="lg:w-72 flex-shrink-0">
            <div className="sticky top-24 space-y-8">
              <div>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 px-2">Global Search</h3>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search systems..." 
                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 px-2">Departments</h3>
                <div className="space-y-1">
                  {DEPARTMENTS.map((dept) => (
                    <button
                      key={dept.slug}
                      onClick={() => setSearchParams({ division: dept.slug })}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                        currentDept === dept.slug 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                        : 'text-gray-500 hover:bg-white hover:text-gray-900'
                      }`}
                    >
                      {dept.name}
                      {currentDept === dept.slug && <motion.div layoutId="activeDot" className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] text-white shadow-xl">
                <Activity size={24} className="mb-4 opacity-50" />
                <h4 className="font-bold mb-2">Technical Support</h4>
                <p className="text-xs text-blue-100 leading-relaxed mb-4">
                  Need custom configuration or multi-unit procurement planning?
                </p>
                <Link to="/acquisition" className="inline-block text-xs font-black uppercase tracking-widest bg-white text-blue-600 px-4 py-2 rounded-lg">
                  Contact Specialist
                </Link>
              </div>
            </div>
          </aside>

          {/* Product Grid Area */}
          <div className="flex-1">
            <header className="mb-10 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Technical <span className="text-blue-600">Inventory</span></h2>
                <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">
                  Showing {filteredProducts.length} Systems in {DEPARTMENTS.find(d => d.slug === currentDept)?.name}
                </p>
              </div>
              <div className="flex gap-2">
                 <button className="p-3 bg-white border rounded-xl text-gray-400 hover:text-blue-600 transition-colors shadow-sm">
                   <LayoutGrid size={20} />
                 </button>
                 <button className="p-3 bg-white border rounded-xl text-gray-400 hover:text-blue-600 transition-colors shadow-sm">
                   <ListFilter size={20} />
                 </button>
              </div>
            </header>

            <motion.div 
              layout
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              <AnimatePresence mode='popLayout'>
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group"
                  >
                    <Link to={`/portfolio/${product.id}`} className="block h-full bg-white rounded-[2.5rem] p-6 border border-gray-100 hover:shadow-2xl hover:shadow-blue-500/10 transition-all relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-opacity">
                         <Activity size={80} className="text-blue-600" />
                      </div>

                      <div className="h-56 rounded-3xl overflow-hidden bg-gray-50 mb-6 border">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest">
                          {product.sub}
                        </span>
                        <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">
                          Model: {product.model}
                        </span>
                      </div>

                      <h3 className="text-xl font-black text-gray-900 mb-6 group-hover:text-blue-600 transition-colors leading-tight">
                        {product.name}
                      </h3>

                      <div className="w-full flex items-center justify-between px-6 py-4 bg-gray-50 group-hover:bg-blue-600 group-hover:text-white rounded-2xl font-bold text-sm transition-all">
                        View Blueprint
                        <ChevronRight size={18} />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-40">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                  <Search size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No systems found</h3>
                <p className="text-gray-500">Try adjusting your filters or search keywords.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
