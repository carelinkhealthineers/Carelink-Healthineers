
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, Zap, Send, ClipboardList, 
  Settings, Truck, CheckCircle2, ArrowRight,
  ChevronRight, Building2, User, Mail, Phone,
  Activity, Award, Landmark, Layers, Search
} from 'lucide-react';
import { SEO } from '../../components/SEO';

const ACQUISITION_STAGES = [
  { 
    title: "Phase 01: Intelligence Gathering", 
    desc: "Our technical architects analyze your clinical requirements and site constraints.",
    icon: <ClipboardList size={24} />
  },
  { 
    title: "Phase 02: Strategic Sourcing", 
    desc: "Leveraging our global neural network of manufacturing sovereigns for optimal allocation.",
    icon: <Zap size={24} />
  },
  { 
    title: "Phase 03: Compliance Audit", 
    desc: "Every unit undergoes a triple-point verification for CE, ISO, and Local Ministry standards.",
    icon: <ShieldCheck size={24} />
  },
  { 
    title: "Phase 04: Precision Deployment", 
    desc: "White-glove installation and field-validation by Carelink certified engineers.",
    icon: <Truck size={24} />
  }
];

const PROCUREMENT_MODELS = [
  {
    title: "Project-Based",
    tier: "Single Facility",
    desc: "Ideal for new clinic launches or targeted department upgrades.",
    features: ["Standard Warranty", "Site Preparation Guide", "Basic Logistics"],
    color: "bg-blue-50 text-blue-600"
  },
  {
    title: "Fleet Acquisition",
    tier: "Institutional",
    desc: "Standardized equipment procurement across multiple clinical locations.",
    features: ["Volume Pricing", "Centralized Fleet Management", "Priority Support"],
    color: "bg-indigo-50 text-indigo-600"
  },
  {
    title: "Strategic Reserve",
    tier: "National / Govt",
    desc: "High-volume sourcing for national health infrastructure and emergency reserves.",
    features: ["Custom Manufacturing", "Managed Warehousing", "Dedicated Logistics Artery"],
    color: "bg-gray-900 text-white"
  }
];

export const Acquisition: React.FC = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    phone: '',
    interest: 'Radiology',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const nextStep = () => setActiveStep(prev => Math.min(prev + 1, 2));
  const prevStep = () => setActiveStep(prev => Math.max(prev - 1, 1));

  return (
    <div className="bg-white pt-20 overflow-hidden">
      <SEO 
        title="Strategic Acquisition" 
        description="Formalize your clinical infrastructure procurement through Carelink's enterprise-grade acquisition framework." 
      />

      {/* Hero Section */}
      <section className="relative py-32 border-b">
        <div className="absolute inset-0 pointer-events-none opacity-40">
           <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-50 to-transparent" />
        </div>
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 flex flex-col lg:flex-row items-center gap-20">
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-[0.2em] mb-6">
                <Landmark size={14} /> Global Procurement Framework
              </div>
              <h1 className="text-6xl md:text-8xl font-black text-gray-900 leading-[0.95] mb-8 tracking-tighter">
                Clinical <br />
                <span className="text-gradient-primary">Acquisition.</span>
              </h1>
              <p className="text-xl text-gray-500 font-medium leading-relaxed max-w-xl">
                The Carelink Acquisition Framework (CAF) streamlines high-performance medical infrastructure sourcing through data-driven procurement and global logistical mastery.
              </p>
            </motion.div>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-4">
            <div className="space-y-4 pt-12">
               <div className="p-8 bg-white border rounded-[2rem] shadow-sm group hover:border-blue-200 transition-all">
                 <Award className="text-blue-600 mb-4 group-hover:scale-110 transition-transform" size={32} />
                 <div className="text-2xl font-black text-gray-900">$450M+</div>
                 <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Assets Managed</div>
               </div>
               <div className="p-8 bg-gray-900 text-white rounded-[2rem] shadow-xl group hover:bg-blue-900 transition-all">
                 <Building2 className="text-blue-500 mb-4 group-hover:scale-110 transition-transform" size={32} />
                 <div className="text-2xl font-black">1.2k+</div>
                 <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Institutions Served</div>
               </div>
            </div>
            <div className="space-y-4">
               <div className="p-8 bg-blue-600 text-white rounded-[2rem] shadow-xl group hover:bg-indigo-700 transition-all">
                 <ShieldCheck className="text-blue-200 mb-4 group-hover:scale-110 transition-transform" size={32} />
                 <div className="text-2xl font-black">Zero</div>
                 <div className="text-[10px] font-black text-blue-200 uppercase tracking-widest">Sourcing Drift</div>
               </div>
               <div className="p-8 bg-white border rounded-[2rem] shadow-sm group hover:border-blue-200 transition-all">
                 <Activity className="text-indigo-600 mb-4 group-hover:scale-110 transition-transform" size={32} />
                 <div className="text-2xl font-black">24/7</div>
                 <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Support Lifecycle</div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Procurement Models */}
      <section className="py-40 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4">
          <header className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">Acquisition Models</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Tailored procurement structures designed to match the scale and complexity of your clinical operations.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PROCUREMENT_MODELS.map((model, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col hover:shadow-2xl hover:shadow-blue-500/10 transition-all"
              >
                <div className={`self-start px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 ${model.color}`}>
                  {model.tier}
                </div>
                <h3 className="text-3xl font-black text-gray-900 mb-4">{model.title}</h3>
                <p className="text-gray-500 mb-8 leading-relaxed font-medium">{model.desc}</p>
                <div className="space-y-4 mb-10 flex-1">
                  {model.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-sm font-bold text-gray-600">
                      <CheckCircle2 size={16} className="text-blue-500" />
                      {feat}
                    </div>
                  ))}
                </div>
                <button className="w-full py-4 rounded-2xl bg-gray-50 text-gray-900 font-bold hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2 group">
                  Initiate Discussion <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The CAF Framework */}
      <section id="rfq-section" className="py-40 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-5xl font-black text-gray-900 mb-10 tracking-tighter">The Acquisition <br /> <span className="text-blue-600">Blueprint.</span></h2>
              <div className="space-y-8">
                {ACQUISITION_STAGES.map((stage, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-6 group"
                  >
                    <div className="w-14 h-14 shrink-0 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                      {stage.icon}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">{stage.title}</h4>
                      <p className="text-gray-500 leading-relaxed font-medium">{stage.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* RFQ Form Interface */}
            <div className="relative">
               <div className="absolute inset-0 bg-blue-600 blur-[100px] opacity-10 rounded-full" />
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 className="relative bg-white p-8 md:p-12 rounded-[3.5rem] border border-gray-100 shadow-2xl"
               >
                 <AnimatePresence mode='wait'>
                    {!submitted ? (
                      <motion.form 
                        key="form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onSubmit={handleSubmit} 
                        className="space-y-6"
                      >
                        <header className="mb-8 flex items-center justify-between">
                          <div>
                            <h3 className="text-2xl font-black text-gray-900">Formal RFQ</h3>
                            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">Sourcing Intel {activeStep}/2</p>
                          </div>
                          <div className="flex gap-1">
                            <div className={`w-8 h-1.5 rounded-full transition-all ${activeStep === 1 ? 'bg-blue-600' : 'bg-gray-100'}`} />
                            <div className={`w-8 h-1.5 rounded-full transition-all ${activeStep === 2 ? 'bg-blue-600' : 'bg-gray-100'}`} />
                          </div>
                        </header>

                        {activeStep === 1 ? (
                          <motion.div 
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            className="space-y-6"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Full Name</label>
                                <div className="relative">
                                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                  <input 
                                    required
                                    type="text" 
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-medium transition-all" 
                                    placeholder="e.g. Dr. Sarah Miller"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Organization</label>
                                <div className="relative">
                                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                  <input 
                                    required
                                    type="text" 
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-medium transition-all" 
                                    placeholder="e.g. City General"
                                    value={formData.organization}
                                    onChange={e => setFormData({...formData, organization: e.target.value})}
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Work Email</label>
                                <div className="relative">
                                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                  <input 
                                    required
                                    type="email" 
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-medium transition-all" 
                                    placeholder="sarah@hospital.com"
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Contact Phone</label>
                                <div className="relative">
                                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                  <input 
                                    type="tel" 
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-medium transition-all" 
                                    placeholder="+1 (555) 000-0000"
                                    value={formData.phone}
                                    onChange={e => setFormData({...formData, phone: e.target.value})}
                                  />
                                </div>
                              </div>
                            </div>

                            <button 
                              type="button"
                              onClick={nextStep}
                              className="w-full py-5 bg-gray-900 text-white rounded-[2rem] font-black text-lg shadow-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-3"
                            >
                              Next Phase <ChevronRight size={20} />
                            </button>
                          </motion.div>
                        ) : (
                          <motion.div 
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            className="space-y-6"
                          >
                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Primary Interest</label>
                              <select 
                                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-bold text-gray-700 cursor-pointer transition-all"
                                value={formData.interest}
                                onChange={e => setFormData({...formData, interest: e.target.value})}
                              >
                                <option>Imaging & Radiology</option>
                                <option>Laboratory / Pathology</option>
                                <option>OT / Surgical Infrastructure</option>
                                <option>ICU / Critical Care</option>
                                <option>Dental Department</option>
                                <option>National Supply Chain</option>
                              </select>
                            </div>

                            <div className="space-y-2">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Requirements Blueprint</label>
                              <textarea 
                                rows={5}
                                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-medium transition-all" 
                                placeholder="Describe your technical needs or project scope..."
                                value={formData.message}
                                onChange={e => setFormData({...formData, message: e.target.value})}
                              />
                            </div>

                            <div className="flex gap-4">
                              <button 
                                type="button"
                                onClick={prevStep}
                                className="px-8 py-5 bg-gray-100 text-gray-500 rounded-[2rem] font-black hover:bg-gray-200 transition-all"
                              >
                                Back
                              </button>
                              <button 
                                type="submit"
                                className="flex-1 py-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-[2rem] font-black text-lg shadow-2xl shadow-blue-500/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                              >
                                Commit RFQ <Send size={20} />
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </motion.form>
                    ) : (
                      <motion.div 
                        key="success"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-20"
                      >
                        <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
                           <CheckCircle2 size={48} />
                        </div>
                        <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tighter">Sourcing Intelligence Dispatched.</h3>
                        <p className="text-gray-500 font-medium leading-relaxed max-w-sm mx-auto">
                          Our clinical architects are analyzing your requirements. A formal response and technical dossier will be dispatched to your terminal within 4-6 hours.
                        </p>
                        <button 
                          onClick={() => { setSubmitted(false); setActiveStep(1); }}
                          className="mt-12 px-8 py-4 bg-gray-50 text-gray-900 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-100 transition-all"
                        >
                          New Inquiry
                        </button>
                      </motion.div>
                    )}
                 </AnimatePresence>
               </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Financing & Logistics Section */}
      <section className="py-40 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-40 opacity-5 pointer-events-none">
           <Landmark size={400} />
        </div>
        <div className="max-w-7xl mx-auto px-4 relative z-10 flex flex-col lg:flex-row gap-20 items-center">
           <div className="flex-1">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-6 border border-white/5">
                <Layers size={14} /> Operational Security
             </div>
             <h2 className="text-5xl font-black mb-8 leading-tight">Financial & Logistical <br /> <span className="text-blue-500">Stability.</span></h2>
             <p className="text-gray-400 text-lg leading-relaxed mb-10 max-w-xl">
               Carelink provides structured clinical leasing, national procurement agreements, and end-to-end global logistical arteries for mission-critical hardware.
             </p>
             <div className="space-y-4">
               {[
                 { title: "Clinical Leasing Models", desc: "Preserve capital through specialized pay-per-procedure or 0% interest lease structures." },
                 { title: "Direct Distribution Arteries", desc: "Sub-24h part distribution networks ensuring zero clinical downtime." },
                 { title: "Turnkey Implementation", desc: "Site preparation, room shielding, and software interoperability included." }
               ].map((item, i) => (
                 <div key={i} className="flex gap-4 p-6 bg-white/5 rounded-3xl border border-white/5 group hover:bg-white/10 transition-all">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 group-hover:bg-blue-500 group-hover:text-white transition-all">
                      <Settings size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-1">{item.title}</h4>
                      <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
                    </div>
                 </div>
               ))}
             </div>
           </div>
           <div className="flex-1 w-full lg:w-auto">
              <div className="aspect-square bg-blue-600 rounded-[5rem] flex items-center justify-center relative shadow-3xl shadow-blue-500/20 group">
                 <Truck size={250} className="text-white/10 absolute group-hover:scale-110 transition-transform duration-700" />
                 <div className="text-center p-12 relative z-10">
                   <motion.div 
                     initial={{ scale: 0.8 }}
                     whileInView={{ scale: 1 }}
                     className="text-8xl font-black mb-4 tracking-tighter"
                   >
                     98%
                   </motion.div>
                   <p className="text-xl font-bold text-blue-100 mb-8 tracking-tight">On-Time Infrastructure <br /> Deployment Matrix</p>
                   <Link to="/alliances" className="inline-flex items-center gap-2 px-10 py-5 bg-white text-blue-600 rounded-2xl font-black shadow-xl hover:scale-105 transition-all">
                      Review Supply Chain <ArrowRight size={18} />
                   </Link>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Trust & Certifications */}
      <section className="py-24 border-b bg-gray-50/30">
         <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-16 opacity-30 grayscale hover:grayscale-0 transition-all">
            <div className="flex flex-col items-center">
               <span className="font-black text-3xl tracking-tighter text-gray-900">CE CERTIFIED</span>
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">EU Directive 93/42/EEC</span>
            </div>
            <div className="flex flex-col items-center">
               <span className="font-black text-3xl tracking-tighter text-gray-900">ISO 13485</span>
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Quality Management System</span>
            </div>
            <div className="flex flex-col items-center">
               <span className="font-black text-3xl tracking-tighter text-gray-900">FDA CLEARED</span>
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Section 510(k)</span>
            </div>
         </div>
      </section>
    </div>
  );
};
