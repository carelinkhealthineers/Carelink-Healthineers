
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, User, Building2, Mail, 
  Box, Globe, Zap, Sparkles, Smile,
  ClipboardCheck, ArrowRight, ShieldCheck, X,
  Phone, MapPin, Clock, ExternalLink, ArrowUpRight, MessageSquare
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

  const [contactInfo, setContactInfo] = useState({
    address: 'Shyamoli, Adabor, Dhaka 1207, Bangladesh',
    phone: '01339-482917',
    email: 'carelinkhealthineers@gmail.com',
  });

  useEffect(() => {
    const fetchContactSettings = async () => {
      try {
        const { data } = await supabase
          .from('settings')
          .select('key, value')
          .filter('category', 'eq', 'footer');
        if (data && data.length > 0) {
          setContactInfo(prev => {
            const next = { ...prev };
            data.forEach(item => {
              if (item.key === 'footer_address' && item.value) next.address = item.value;
              if (item.key === 'footer_phone' && item.value) next.phone = item.value;
              if (item.key === 'footer_email' && item.value) next.email = item.value;
            });
            return next;
          });
        }
      } catch (err) {
        console.error('Contact settings fetch error:', err);
      }
    };
    fetchContactSettings();
  }, []);

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
    <div className="bg-white text-slate-800 pt-24 min-h-screen font-sans selection:bg-blue-600">
      <SEO 
        title="Request a Quote | Direct Medical Equipment Sourcing" 
        description="Get a fast, transparent quote for medical and dental equipment. Carelink Healthineers and Dürr Dental provide direct factory pricing and fast delivery." 
        keywords={['request quote', 'medical equipment quote', 'dental equipment pricing', 'Dürr Dental quote', 'Carelink Healthineers']}
      />

      {/* 1. TOP PROCUREMENT SECTION */}
      <section className="relative py-16 md:py-24 overflow-hidden border-b border-slate-100">
        <div className="absolute inset-0 neural-grid opacity-10 pointer-events-none" />
        
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Header Narrative - Professional & Clean */}
          <div className="lg:col-span-5">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
               <div className="flex items-center gap-3 mb-6">
                  <span className="px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold tracking-wide flex items-center gap-2">
                    <Sparkles size={14} /> Official Sourcing Portal
                  </span>
               </div>
               <h1 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight leading-[1.15] mb-6">
                 Source the finest <br /><span className="text-blue-500">clinical assets.</span>
               </h1>
               <p className="text-lg text-slate-500 leading-relaxed font-medium mb-10 max-w-md">
                 Carelink connects your facility with world-class medical infrastructure. Detail your requirements, and our team will prepare a tailored proposal within four hours.
               </p>
               
               <div className="flex gap-10 pt-6 border-t border-slate-100">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest block">Response Time</span>
                    <span className="text-2xl font-bold text-slate-900 tracking-tight">&lt; 4 Hours</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest block">Accuracy Rate</span>
                    <span className="text-2xl font-bold text-emerald-600 tracking-tight flex items-center gap-2">
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
               className="bg-[#f4f4f5] border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-md relative overflow-hidden"
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

      {/* 2. CONTACT INFORMATION & OFFICE LOCATION SECTION */}
      <section className="py-20 md:py-28 bg-white border-b border-slate-100">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-[0.2em] mb-3">
                <span className="w-6 h-[2px] bg-blue-600 rounded-full" />
                Direct Channels &amp; Headquarters
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
                Connect with our <span className="text-blue-600">clinical sourcing team.</span>
              </h2>
            </div>
            <p className="text-sm md:text-base text-slate-500 font-medium max-w-md leading-relaxed">
              Reach out directly via phone, email, or visit our Dhaka headquarters for in-person technical consultations and procurement planning.
            </p>
          </div>

          {/* Main Contact Grid: Info Column + Map Column */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            
            {/* Left Column: Contact Cards & Socials (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between bg-slate-50/70 border border-slate-200/80 rounded-[2rem] p-7 md:p-9 shadow-sm space-y-8">
              <div className="space-y-6">
                <div>
                  <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-blue-600 block mb-1">
                    Carelink Healthineers
                  </span>
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Contact Information
                  </h3>
                  <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                    Official medical &amp; dental equipment distribution and technical service center.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  {/* Phone Card */}
                  <a
                    href={`tel:${contactInfo.phone.replace(/[^0-9+]/g, '')}`}
                    className="group flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-500/40 hover:shadow-md transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                      <Phone size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400 block">
                        Direct Phone &amp; Hotline
                      </span>
                      <span className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors block mt-0.5 tabular-nums">
                        +880 {contactInfo.phone.replace(/^0/, '')}
                      </span>
                      <span className="text-xs text-slate-500 block mt-0.5">
                        Sat – Thu, 9:00 AM – 7:00 PM (BST)
                      </span>
                    </div>
                    <ArrowUpRight size={16} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 mt-1" />
                  </a>

                  {/* Email Card */}
                  <a
                    href={`mailto:${contactInfo.email}`}
                    className="group flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-500/40 hover:shadow-md transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                      <Mail size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400 block">
                        Official Email
                      </span>
                      <span className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors block mt-0.5 break-all">
                        {contactInfo.email}
                      </span>
                      <span className="text-xs text-slate-500 block mt-0.5">
                        Direct factory quotations &amp; support
                      </span>
                    </div>
                    <ArrowUpRight size={16} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 mt-1" />
                  </a>

                  {/* Office Address Card */}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `Carelink Healthineers, ${contactInfo.address}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-500/40 hover:shadow-md transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                      <MapPin size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400 block">
                        Corporate Headquarters
                      </span>
                      <span className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors block mt-0.5 leading-snug">
                        {contactInfo.address}
                      </span>
                      <span className="text-xs text-blue-600 font-semibold inline-flex items-center gap-1 mt-1">
                        Get Directions <ExternalLink size={11} />
                      </span>
                    </div>
                    <ArrowUpRight size={16} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 mt-1" />
                  </a>
                </div>
              </div>

              {/* Social Media Channels */}
              <div className="pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400 block">
                    Social &amp; Direct Connect
                  </span>
                  <span className="text-xs font-medium text-slate-600">
                    Follow updates or message us
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  {/* Facebook */}
                  <a
                    href="https://www.facebook.com/carelinkhealthineers/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    title="Facebook"
                    className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] flex items-center justify-center shadow-xs transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5Z" />
                    </svg>
                  </a>

                  {/* WhatsApp */}
                  <a
                    href={`https://wa.me/${contactInfo.phone.replace(/[^0-9]/g, '').replace(/^0/, '880') || '8801339482917'}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="WhatsApp"
                    title="WhatsApp"
                    className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-[#25D366] hover:text-white hover:border-[#25D366] flex items-center justify-center shadow-xs transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M17.47 14.38c-.29-.15-1.7-.84-1.97-.93-.26-.1-.46-.15-.65.15-.2.29-.75.93-.92 1.13-.17.19-.34.22-.63.07-.29-.15-1.22-.45-2.32-1.43-.86-.76-1.44-1.7-1.6-1.99-.17-.29-.02-.45.13-.6.13-.13.29-.34.43-.51.15-.17.2-.29.29-.48.1-.2.05-.36-.02-.51-.07-.15-.65-1.57-.9-2.15-.24-.57-.48-.5-.65-.5h-.56c-.2 0-.51.07-.78.36-.26.29-1.02 1-1.02 2.43s1.05 2.82 1.19 3.01c.15.19 2.06 3.14 4.99 4.4.7.3 1.24.48 1.66.61.7.22 1.34.19 1.84.12.56-.08 1.7-.7 1.94-1.37.24-.68.24-1.26.17-1.38-.07-.12-.26-.19-.55-.34ZM12.02 22h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37A9.9 9.9 0 0 1 2.1 12C2.1 6.53 6.55 2.08 12.03 2.08c2.65 0 5.14 1.03 7.01 2.91a9.83 9.83 0 0 1 2.9 6.99c0 5.47-4.45 9.92-9.92 9.92Zm8.4-18.32A11.82 11.82 0 0 0 12.03.1C5.4.1.02 5.48.02 12.1c0 2.1.55 4.15 1.6 5.96L0 24l6.1-1.6a11.94 11.94 0 0 0 5.92 1.5h.01c6.62 0 12-5.38 12-12 0-3.2-1.25-6.22-3.5-8.22Z" />
                    </svg>
                  </a>

                  {/* Instagram */}
                  <a
                    href="https://www.instagram.com/carelinkhealthineers/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    title="Instagram"
                    className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-[#E1306C] hover:text-white hover:border-[#E1306C] flex items-center justify-center shadow-xs transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                    </svg>
                  </a>

                  {/* YouTube */}
                  <a
                    href="https://www.youtube.com/@carelinkhealthineers"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="YouTube"
                    title="YouTube"
                    className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-[#FF0000] hover:text-white hover:border-[#FF0000] flex items-center justify-center shadow-xs transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </a>

                  {/* X / Twitter */}
                  <a
                    href="https://www.twitter.com/carelinkhealthineers/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="X (Twitter)"
                    title="X (Twitter)"
                    className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 flex items-center justify-center shadow-xs transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column: Embedded Google Map & Open in Maps Bar (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col bg-slate-50/70 border border-slate-200/80 rounded-[2rem] overflow-hidden shadow-sm">
              {/* Top Map Bar */}
              <div className="px-7 py-5 bg-white border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 leading-tight">
                      Carelink Healthineers — Dhaka Office
                    </h4>
                    <p className="text-xs text-slate-500">
                      {contactInfo.address}
                    </p>
                  </div>
                </div>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `Shyamoli, Adabor, Dhaka 1207, Bangladesh`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold tracking-wide transition-all shadow-xs hover:shadow-md"
                >
                  <span>Open in Maps</span>
                  <ExternalLink size={14} />
                </a>
              </div>

              {/* Embedded Map */}
              <div className="relative flex-1 min-h-[340px] lg:min-h-[420px] w-full bg-slate-100">
                <iframe
                  title="Carelink Healthineers Office Location Map"
                  src="https://www.google.com/maps?q=Shyamoli,+Adabor,+Dhaka+1207,+Bangladesh&output=embed"
                  className="absolute inset-0 w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>

              {/* Bottom Location Meta Strip */}
              <div className="px-7 py-4 bg-white border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-medium text-slate-700">Open for Scheduled Clinical Consultations</span>
                </div>
                <span className="font-mono text-[11px] text-slate-400">
                  23.7748° N, 90.3654° E · Dhaka, BD
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. VALUE STEPS - Clean, Modern */}
      <section className="py-24 bg-slate-50/50">
         <div className="max-w-[1400px] mx-auto px-6 md:px-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {[
              { label: "Consultation", icon: <Sparkles size={24} />, desc: "We sit down to understand your facility’s precise clinical requirements." },
              { label: "Global Sourcing", icon: <Globe size={24} />, desc: "We procure directly from Tier-1 manufacturing partners worldwide." },
              { label: "Deployment", icon: <Box size={24} />, desc: "Enjoy seamless field installation and operational training." },
              { label: "Lifecycle Support", icon: <Zap size={24} />, desc: "Receive continuous technical monitoring and dedicated support." }
            ].map((step, i) => (
              <div key={i} className="group flex flex-col items-center text-center p-8 rounded-3xl bg-white border border-slate-200 hover:bg-slate-50 hover:shadow-sm transition-all duration-300">
                 <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    {step.icon}
                 </div>
                 <h4 className="text-xl font-bold text-slate-900 mb-3">{step.label}</h4>
                 <p className="text-sm text-slate-500 font-medium leading-relaxed">{step.desc}</p>
              </div>
            ))}
         </div>
      </section>

      {/* 3. PARTNER BADGES */}
      <section className="py-12 border-t border-slate-100 flex flex-wrap justify-center gap-12 md:gap-24 opacity-60 hover:opacity-100 transition-all duration-500 cursor-default">
         {["SIEMENS", "GE HEALTHCARE", "MINDRAY", "PHILIPS", "MEDTRONIC"].map(brand => (
           <span key={brand} className="text-base font-bold tracking-widest text-slate-400 hover:text-slate-600 uppercase transition-colors">{brand}</span>
         ))}
      </section>
    </div>
  );
};
