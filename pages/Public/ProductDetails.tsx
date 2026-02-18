
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { Mail, Download, CheckCircle, FileText, Settings, Shield, ChevronLeft, AlertCircle } from 'lucide-react';
import { SEO } from '../../components/SEO';
import { MASTER_PRODUCTS } from './Portfolio';

export const ProductDetails: React.FC = () => {
  const { productSlug } = useParams();
  const [activeTab, setActiveTab] = useState('overview');

  // Lookup the product from our expanded master list
  const product = useMemo(() => {
    return MASTER_PRODUCTS.find(p => p.id === productSlug);
  }, [productSlug]);

  if (!product) {
    return (
      <div className="pt-40 pb-20 text-center">
        <SEO title="System Not Found" />
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-500">
          <AlertCircle size={32} />
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-4">Infrastructure Registry Error</h1>
        <p className="text-gray-500 mb-8">The requested medical system is not found in the current architecture.</p>
        <Link to="/portfolio" className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold">Return to Portfolio</Link>
      </div>
    );
  }

  // Specialized specs based on division
  const specs = [
    { key: "Global Standard", value: "ISO 13485 / CE Certified" },
    { key: "Architecture", value: product.sub },
    { key: "Model Registry", value: product.model },
    { key: "Availability", value: "Global Acquisition Open" },
    { key: "Technical Support", value: "24/7 Remote Diagnostics" },
    { key: "Warranty", value: "3 Year Comprehensive" },
  ];

  const handleAcquisition = () => {
    const subject = encodeURIComponent(`Inquiry about ${product.name} [${product.model}]`);
    const body = encodeURIComponent(`Dear Carelink Team,\n\nI am interested in initiating acquisition for the following equipment:\n\nModel: ${product.name}\nIdentifier: ${product.model}\nDivision: ${product.sub}\n\nPlease provide formal quotation and technical documentation.\n\nBest regards,\n[Your Name]\n[Company]`);
    window.location.href = `mailto:acquisition@carelink.com?subject=${subject}&body=${body}`;
  };

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "MedicalDevice",
    "name": product.name,
    "model": product.model,
    "manufacturer": "Carelink Partners",
    "description": `Professional ${product.name} engineered for high-precision clinical environments.`
  };

  return (
    <div className="pt-24 pb-20">
      <SEO title={product.name} description={`Technical blueprint for ${product.name}`} image={product.image} type="product" jsonLd={jsonLd} />

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
            <Link to="/portfolio" className="hover:text-blue-600 transition-colors">Portfolio</Link>
            <span>/</span>
            <span className="text-blue-600">{product.sub}</span>
          </div>
          <Link to="/portfolio" className="flex items-center gap-2 text-xs font-black text-gray-500 hover:text-blue-600 transition-all uppercase tracking-widest">
            <ChevronLeft size={16} /> Back to Catalog
          </Link>
        </div>

        {/* Hero Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-xl"
          >
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col justify-center"
          >
            <div className="inline-flex mb-4 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em]">
              {product.sub} Intelligence
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
              {product.name}
            </h1>
            <p className="text-lg text-gray-500 mb-8 leading-relaxed">
              Professional-grade {product.name} (Model {product.model}) designed for mission-critical clinical performance. 
              Engineered with advanced analytical frameworks to ensure unparalleled accuracy in diagnostic and surgical workflows.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-10">
              <div className="p-4 rounded-2xl bg-gray-50 border">
                <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Status</div>
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-600">
                  <CheckCircle size={14} /> Available Globally
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 border">
                <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Standard</div>
                <div className="flex items-center gap-2 text-sm font-bold text-blue-600">
                  <Shield size={14} /> ISO 13485:2016
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <button 
                onClick={handleAcquisition}
                className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-full font-bold shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 hover:translate-y-[-2px] transition-all"
              >
                <Mail size={18} /> Initiate Acquisition
              </button>
              <button className="px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-all">
                <Download size={18} /> Documentation
              </button>
            </div>
          </motion.div>
        </div>

        {/* Tabbed Content */}
        <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
          <div className="flex border-b overflow-x-auto custom-scrollbar">
            {[
              { id: 'overview', icon: <FileText size={18} />, label: 'Overview' },
              { id: 'specs', icon: <Settings size={18} />, label: 'Specifications' },
              { id: 'compliance', icon: <Shield size={18} />, label: 'Compliance' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-8 py-5 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
                  activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          <div className="p-8 md:p-12">
            {activeTab === 'overview' && (
              <div className="prose prose-blue max-w-none">
                <h3 className="text-2xl font-bold mb-4">Technical Advantage</h3>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  The {product.name} incorporates the latest medical IoT technology and ergonomic engineering. 
                  Every component is stress-tested to meet the rigorous demands of multi-specialty hospital environments.
                </p>
                <ul className="space-y-3">
                  {['Enhanced High-Precision Sensors', 'Intelligent UI Dashboard', 'Energy-Efficient Architecture', 'Seamless EMR Integration'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-600 font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {activeTab === 'specs' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {specs.map((spec, i) => (
                  <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{spec.key}</span>
                    <span className="text-gray-900 font-bold">{spec.value}</span>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'compliance' && (
              <div className="prose prose-blue max-w-none">
                <h3 className="text-2xl font-bold mb-4">Global Certifications</h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  This unit adheres to stringent global healthcare standards, ensuring safety and performance reliability in any jurisdiction.
                </p>
                <div className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-4">
                  <Shield className="text-blue-600 shrink-0" size={24} />
                  <div>
                    <h4 className="font-bold text-blue-900 mb-1">Standard ISO 13485:2016</h4>
                    <p className="text-sm text-blue-700">Medical devices - Quality management systems - Requirements for regulatory purposes.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
