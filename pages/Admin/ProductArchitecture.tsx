
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Edit3, Trash2, Globe, Eye, EyeOff, 
  Settings, ChevronRight, X, Save, Image as ImageIcon,
  Layers, Database, AlertTriangle
} from 'lucide-react';
import { slugify } from '../../utils/slugify';

// Mock Divisions matching schema
const DIVISIONS = [
  { id: '1', name: 'Laboratory / Pathology' },
  { id: '2', name: 'Imaging / Radiology' },
  { id: '3', name: 'Operation Theatre (OT)' },
  { id: '4', name: 'ICU / CCU / Emergency' },
  { id: '5', name: 'OPD / General Examination' },
  { id: '6', name: 'Dialysis Department' },
  { id: '7', name: 'Dental Department' },
  { id: '8', name: 'CSSD / Sterilization' },
  { id: '9', name: 'Hospital Furniture' },
  { id: '10', name: 'Medical Consumables' },
];

interface ProductState {
  id: string;
  name: string;
  model: string;
  divisionId: string;
  categoryTag: string;
  shortDesc: string;
  longDesc: string;
  isPublished: boolean;
  specs: { key: string; value: string }[];
}

export const ProductArchitecture: React.FC = () => {
  const [products, setProducts] = useState<ProductState[]>([
    { 
      id: '1', 
      name: 'Hematology Analyzer', 
      model: 'KF92-52F', 
      divisionId: '1', 
      categoryTag: 'Diagnostic', 
      shortDesc: 'Automated 5-part differential analyzer.',
      longDesc: 'High-throughput system for clinical laboratories.',
      isPublished: true, 
      specs: [{ key: 'Throughput', value: '80/hr' }] 
    },
    { 
      id: '2', 
      name: 'Digital X-Ray System', 
      model: 'DRX-900', 
      divisionId: '2', 
      categoryTag: 'Imaging', 
      shortDesc: 'High-resolution digital radiography.',
      longDesc: 'Advanced flat-panel detector technology.',
      isPublished: true, 
      specs: [{ key: 'Power', value: '50kW' }] 
    },
  ]);

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<ProductState, 'id'>>({
    name: '',
    model: '',
    divisionId: '',
    categoryTag: '',
    shortDesc: '',
    longDesc: '',
    isPublished: true,
    specs: [{ key: '', value: '' }]
  });

  const handleAddSpec = () => {
    setFormData({ ...formData, specs: [...formData.specs, { key: '', value: '' }] });
  };

  const handleRemoveSpec = (index: number) => {
    const newSpecs = formData.specs.filter((_, i) => i !== index);
    setFormData({ ...formData, specs: newSpecs });
  };

  const handleSpecChange = (index: number, field: 'key' | 'value', val: string) => {
    const newSpecs = [...formData.specs];
    newSpecs[index][field] = val;
    setFormData({ ...formData, specs: newSpecs });
  };

  const toggleEditor = (product: ProductState | null = null) => {
    if (product) {
      setEditingId(product.id);
      setFormData({
        name: product.name,
        model: product.model,
        divisionId: product.divisionId,
        categoryTag: product.categoryTag,
        shortDesc: product.shortDesc,
        longDesc: product.longDesc,
        isPublished: product.isPublished,
        specs: product.specs.length > 0 ? product.specs : [{ key: '', value: '' }]
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        model: '',
        divisionId: '',
        categoryTag: '',
        shortDesc: '',
        longDesc: '',
        isPublished: true,
        specs: [{ key: '', value: '' }]
      });
    }
    setIsEditorOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.model || !formData.divisionId) {
      alert("Please complete required architectural fields (Name, Model, Division).");
      return;
    }

    if (editingId) {
      setProducts(prev => prev.map(p => p.id === editingId ? { ...formData, id: editingId } : p));
    } else {
      const newProduct = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9)
      };
      setProducts(prev => [...prev, newProduct]);
    }
    setIsEditorOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to terminate this infrastructure component? This action is irreversible.")) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.model.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  return (
    <div className="p-8">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Product Architecture</h1>
          <p className="text-gray-500 font-medium">Manage the global medical equipment inventory</p>
        </div>
        <button 
          onClick={() => toggleEditor()}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all"
        >
          <Plus size={20} /> Deploy New Product
        </button>
      </header>

      {/* Control Bar */}
      <div className="bg-white p-4 rounded-2xl border mb-8 flex flex-col md:flex-row gap-4 items-center shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Query inventory by name or model..." 
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select className="px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold text-gray-600 outline-none cursor-pointer">
            <option>All Divisions</option>
            {DIVISIONS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                <th className="px-8 py-4">Blueprint Status</th>
                <th className="px-8 py-4">Product Identifier</th>
                <th className="px-8 py-4">Clinical Division</th>
                <th className="px-8 py-4">Architecture Info</th>
                <th className="px-8 py-4 text-right">Command</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <AnimatePresence initial={false}>
                {filteredProducts.map((item) => (
                  <motion.tr 
                    key={item.id} 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        item.isPublished ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {item.isPublished ? <Eye size={12} /> : <EyeOff size={12} />}
                        {item.isPublished ? 'published' : 'draft'}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{item.name}</div>
                      <div className="text-xs text-gray-400 font-mono">{item.model}</div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-semibold text-gray-600">
                        {DIVISIONS.find(d => d.id === item.divisionId)?.name || 'N/A'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">{item.categoryTag || 'General'}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => toggleEditor(item)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                          <Edit3 size={18} />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-400 hover:text-rose-600 transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <div className="p-20 text-center text-gray-400 font-bold uppercase tracking-widest">
              No inventory matches your search.
            </div>
          )}
        </div>
      </div>

      {/* Editor Modal */}
      <AnimatePresence>
        {isEditorOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditorOpen(false)}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <header className="p-8 border-b flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Database size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900">
                      {editingId ? 'Edit Infrastructure Component' : 'Deploy New Infrastructure'}
                    </h3>
                    <p className="text-sm text-gray-400">Define technical specifications and clinical placement</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsEditorOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
                >
                  <X size={24} />
                </button>
              </header>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* Left Column: Essential Data */}
                  <div className="space-y-8">
                    <section>
                      <h4 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <Layers size={14} /> Essentials
                      </h4>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Product Name *</label>
                            <input 
                              type="text" 
                              className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 outline-none font-medium" 
                              placeholder="e.g. Hematology Analyzer"
                              value={formData.name}
                              onChange={e => setFormData({...formData, name: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Model Number *</label>
                            <input 
                              type="text" 
                              className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 outline-none font-mono" 
                              placeholder="e.g. KF92-52F"
                              value={formData.model}
                              onChange={e => setFormData({...formData, model: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase">Auto-Slug Preview</label>
                          <div className="px-4 py-3 bg-gray-100 rounded-xl text-xs font-mono text-gray-400 border border-dashed truncate">
                            /portfolio/{slugify(formData.name || 'product')}-{slugify(formData.model || 'model')}
                          </div>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h4 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <Globe size={14} /> Clinical Mapping
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase">Division *</label>
                          <select 
                            className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 outline-none font-medium cursor-pointer"
                            value={formData.divisionId}
                            onChange={e => setFormData({...formData, divisionId: e.target.value})}
                          >
                            <option value="">Select Division</option>
                            {DIVISIONS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase">Category Tag</label>
                          <input 
                            type="text" 
                            className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 outline-none font-medium" 
                            placeholder="e.g. Diagnostic Systems"
                            value={formData.categoryTag}
                            onChange={e => setFormData({...formData, categoryTag: e.target.value})}
                          />
                        </div>
                      </div>
                    </section>

                    <section>
                      <h4 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <ImageIcon size={14} /> Assets
                      </h4>
                      <div className="p-8 border-2 border-dashed border-gray-100 rounded-3xl flex flex-col items-center justify-center text-center group hover:border-blue-200 transition-all cursor-pointer bg-gray-50/50">
                        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-gray-400 group-hover:text-blue-600 transition-all mb-4">
                          <Plus size={24} />
                        </div>
                        <span className="text-sm font-bold text-gray-400">Upload High-Res Renders</span>
                        <span className="text-[10px] text-gray-300 uppercase mt-1">PNG, JPG up to 10MB</span>
                      </div>
                    </section>
                  </div>

                  {/* Right Column: Technical Spec Mapping */}
                  <div className="space-y-8">
                    <section>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2">
                          <Settings size={14} /> Technical Blueprint
                        </h4>
                        <button 
                          onClick={handleAddSpec}
                          className="text-[10px] font-black uppercase text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          <Plus size={12} /> Add Metric
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        {formData.specs.map((spec, index) => (
                          <div key={index} className="flex gap-2 group/spec">
                            <input 
                              type="text" 
                              placeholder="Key (e.g. Throughput)" 
                              className="flex-1 px-4 py-2 bg-gray-50 rounded-lg text-sm font-bold placeholder:font-normal focus:ring-2 focus:ring-blue-500 outline-none" 
                              value={spec.key}
                              onChange={e => handleSpecChange(index, 'key', e.target.value)}
                            />
                            <input 
                              type="text" 
                              placeholder="Value" 
                              className="flex-1 px-4 py-2 bg-gray-50 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none" 
                              value={spec.value}
                              onChange={e => handleSpecChange(index, 'value', e.target.value)}
                            />
                            <button 
                              onClick={() => handleRemoveSpec(index)}
                              className="p-2 text-gray-300 hover:text-rose-500 opacity-0 group-hover/spec:opacity-100 transition-all"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="space-y-4">
                       <h4 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Plus size={14} /> Narrative
                      </h4>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Short Intelligence Summary</label>
                        <textarea 
                          rows={2} 
                          className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 outline-none text-sm leading-relaxed" 
                          placeholder="One-sentence hook for the catalog..."
                          value={formData.shortDesc}
                          onChange={e => setFormData({...formData, shortDesc: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Technical Overview</label>
                        <textarea 
                          rows={5} 
                          className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 outline-none text-sm leading-relaxed" 
                          placeholder="Comprehensive architectural description..."
                          value={formData.longDesc}
                          onChange={e => setFormData({...formData, longDesc: e.target.value})}
                        />
                      </div>
                    </section>
                  </div>
                </div>
              </div>

              <footer className="p-8 border-t bg-gray-50/50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-6">
                   <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setFormData({...formData, isPublished: !formData.isPublished})}
                        className={`w-10 h-5 rounded-full transition-all relative ${formData.isPublished ? 'bg-emerald-500' : 'bg-gray-300'}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.isPublished ? 'left-6' : 'left-1'}`} />
                      </button>
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Visibility: {formData.isPublished ? 'Public' : 'Encrypted'}</span>
                   </div>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setIsEditorOpen(false)}
                    className="px-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-900 transition-all"
                  >
                    Discard Changes
                  </button>
                  <button 
                    onClick={handleSave}
                    className="px-8 py-3 bg-blue-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 flex items-center gap-2 transition-all"
                  >
                    <Save size={18} /> {editingId ? 'Commit Updates' : 'Commit to Database'}
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
