
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, User, Building2, Mail, 
  Box, Globe, Zap, Sparkles, Smile,
  ClipboardCheck, ArrowRight, ShieldCheck, X
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { SEO } from '../../components/SEO';
import { supabase } from '../../supabaseClient';

export const Acquisition: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const productName = searchParams.get('product');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    phone: '',
    interest: 'Imaging & Radiology',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Embed the target product naturally within the message payload to ensure DB persistence
    const finalMessage = productName 
      ? `[Product: ${productName}] [Interest: ${formData.interest}] - ${formData.message}`
      : `[Interest: ${formData.interest}] - ${formData.message}`;

    try {
      const { error } = await supabase.from('inquiries').insert([{
          name: formData.name,
          email: formData.email,
          company: formData.organization,
          message: finalMessage,
          status: 'pending'
      }]);
      if (error) throw error;
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#020408] text-slate-200 pt-24 min-h-screen font-sans selection:bg-blue-600">
      <SEO title="Get a Quote" description="Request a custom clinical infrastructure quote." />

      {/* 1. TOP PROCUREMENT SECTION */}
      <section className="relative py-16 md:py-24 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 neural-grid opacity-10 pointer-events-none" />
        
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Header Narrative - Professional & Clean */}
          <div className="lg:col-span-5">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
               <div className="flex items-center gap-3 mb-6">
                  <span className="px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wide flex items-center gap-2">
                    <Sparkles size={14} /> Official Sourcing Portal
                  </span>
               </div>
               <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-[1.15] mb-6">
                 Source the finest <br /><span className="text-blue-500">clinical assets.</span>
               </h1>
               <p className="text-lg text-slate-400 leading-relaxed font-medium mb-10 max-w-md">
                 Carelink connects your facility with world-class medical infrastructure. Detail your requirements, and our team will prepare a tailored proposal within four hours.
               </p>
               
               <div className="flex gap-10 pt-6 border-t border-white/10">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest block">Response Time</span>
                    <span className="text-2xl font-bold text-white tracking-tight">&lt; 4 Hours</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest block">Accuracy Rate</span>
                    <span className="text-2xl font-bold text-emerald-400 tracking-tight flex items-center gap-2">
                      <ShieldCheck size={24} /> 100%
                    </span>
                  </div>
               </div>
            </motion.div>
          </div>

          {/* THE FORM - Distinctive Grayish Background */}
          <div className="lg:col-span-7">
             <motion.div 
               initial={{ opacity: 0, scale: 0.98 }} 
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.6, delay: 0.1 }}
               className="bg-[#f4f4f5] border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden"
             >
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                  <ClipboardCheck size={200} className="text-slate-900" />
                </div>
                
                <AnimatePresence mode='wait'>
                  {!submitted ? (
                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                       <header className="mb-8">
                          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Request a Quote</h3>
                          <p className="text-sm font-medium text-slate-500 mt-1">Please fill out the form below to get started.</p>
                       </header>

                       {/* Product Binding Banner */}
                       {productName && (
                         <div className="bg-white border border-blue-200 p-4 rounded-xl flex items-center justify-between shadow-sm mb-2">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                                  <Box size={20} />
                               </div>
                               <div>
                                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Target Asset</div>
                                  <div className="text-sm font-black text-slate-900">{productName}</div>
                               </div>
                            </div>
                            <button type="button" onClick={() => { searchParams.delete('product'); setSearchParams(searchParams); }} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title="Clear specific product">
                               <X size={16} />
                            </button>
                         </div>
                       )}

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                             <label className="text-sm font-semibold text-slate-700 px-1">Full Name</label>
                             <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                                <input required type="text" className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-sm text-slate-900 placeholder:text-slate-400 shadow-sm" placeholder="e.g. Dr. John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                             </div>
                          </div>
                          <div className="space-y-2">
                             <label className="text-sm font-semibold text-slate-700 px-1">Organization</label>
                             <div className="relative group">
                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                                <input required type="text" className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-sm text-slate-900 placeholder:text-slate-400 shadow-sm" placeholder="Facility Name" value={formData.organization} onChange={e => setFormData({...formData, organization: e.target.value})} />
                             </div>
                          </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                             <label className="text-sm font-semibold text-slate-700 px-1">Work Email</label>
                             <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                                <input required type="email" className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-sm text-slate-900 placeholder:text-slate-400 shadow-sm" placeholder="contact@hospital.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                             </div>
                          </div>
                          <div className="space-y-2">
                             <label className="text-sm font-semibold text-slate-700 px-1">Infrastructure Interest</label>
                             <div className="relative group">
                                <Box className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                                <select className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-sm text-slate-900 appearance-none cursor-pointer shadow-sm" value={formData.interest} onChange={e => setFormData({...formData, interest: e.target.value})}>
                                  <option value="Imaging & Radiology">Imaging & Radiology</option>
                                  <option value="Laboratory Hub (Mindray)">Laboratory Hub (Mindray)</option>
                                  <option value="Surgical Infrastructure">Surgical Infrastructure</option>
                                  <option value="ICU Care Systems">ICU Care Systems</option>
                                  <option value="Dental Medical Care">Dental Medical Care</option>
                                  <option value="Dialysis Solutions">Dialysis Solutions</option>
                                </select>
                             </div>
                          </div>
                       </div>

                       <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700 px-1">Requirements Description</label>
                          <textarea rows={4} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-sm text-slate-900 placeholder:text-slate-400 resize-none shadow-sm" placeholder="Please detail the clinical scope or specific models you require..." value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} />
                       </div>

                       <button disabled={isSubmitting} type="submit" className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-base shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 group mt-2">
                          {isSubmitting ? 'Processing Request...' : 'Send Inquiry'} <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                       </button>
                    </form>
                  ) : (
                    <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-20 text-center">
                       <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                          <Smile size={48} className="animate-bounce" />
                       </div>
                       <h3 className="text-3xl font-bold text-slate-900 mb-4">Inquiry Received!</h3>
                       <p className="text-base text-slate-600 font-medium max-w-sm mx-auto leading-relaxed">Thank you for reaching out. Our technical team has received your request and will contact you shortly.</p>
                       <button onClick={() => setSubmitted(false)} className="mt-8 px-8 py-3 bg-slate-200 text-slate-800 hover:bg-slate-300 rounded-xl text-sm font-semibold transition-all">Submit Another Request</button>
                    </motion.div>
                  )}
                </AnimatePresence>
             </motion.div>
          </div>
        </div>
      </section>

      {/* 2. VALUE STEPS - Clean, Modern on Black */}
      <section className="py-24 bg-[#020408]">
         <div className="max-w-[1400px] mx-auto px-6 md:px-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {[
              { label: "Consultation", icon: <Sparkles size={24} />, desc: "We sit down to understand your facility’s precise clinical requirements." },
              { label: "Global Sourcing", icon: <Globe size={24} />, desc: "We procure directly from Tier-1 manufacturing partners worldwide." },
              { label: "Deployment", icon: <Box size={24} />, desc: "Enjoy seamless field installation and operational training." },
              { label: "Lifecycle Support", icon: <Zap size={24} />, desc: "Receive continuous technical monitoring and dedicated support." }
            ].map((step, i) => (
              <div key={i} className="group flex flex-col items-center text-center p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
                 <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    {step.icon}
                 </div>
                 <h4 className="text-xl font-bold text-white mb-3">{step.label}</h4>
                 <p className="text-sm text-slate-400 font-medium leading-relaxed">{step.desc}</p>
              </div>
            ))}
         </div>
      </section>

      {/* 3. PARTNER BADGES */}
      <section className="py-12 border-t border-white/5 flex flex-wrap justify-center gap-12 md:gap-24 opacity-40 hover:opacity-100 transition-all duration-500 cursor-default">
         {["SIEMENS", "GE HEALTHCARE", "MINDRAY", "PHILIPS", "MEDTRONIC"].map(brand => (
           <span key={brand} className="text-base font-bold tracking-widest text-white uppercase">{brand}</span>
         ))}
      </section>
    </div>
  );
};
