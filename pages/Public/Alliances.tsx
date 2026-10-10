import React from 'react';
import { motion } from 'framer-motion';
import {
  Globe, Activity, ShieldCheck, Link2, Sparkles,
  ArrowRight, HeartHandshake
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '../../components/SEO';

const FEATURED_DISTRIBUTORS = [
  { name: "Dürr Dental", origin: "Germany", sector: "Dental & Imaging Systems", desc: "Premier German dental equipment distributor and official global distributor network partner.", status: "Verified Distributor", icon: <Activity size={28}/>, color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-100" }
];

export const Alliances: React.FC = () => {
  return (
    <div className="alliances-page min-h-screen overflow-hidden bg-white pt-24 font-sans text-slate-800 selection:bg-sky-100 selection:text-slate-950">
      <SEO
        title="Our Partners | Global Distributors & Dürr Dental"
        description="Explore Carelink Healthineers' direct partnerships with world-leading medical and dental distributors including Dürr Dental, Siemens, GE, and Philips."
        keywords={['medical partners', 'Dürr Dental distributor', 'medical equipment distributors', 'Siemens Healthineers', 'GE Healthcare']}
      />

      <section className="border-b border-slate-200 bg-white py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="mb-7 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                <img src="https://i.imgur.com/y0UvXGu.png" alt="Carelink Logo" className="h-full w-full object-contain" />
              </div>
            </div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-sky-800">
              <HeartHandshake size={14} /> Global Sourcing Partners
            </div>
            <h1 className="mb-6 text-4xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-5xl md:text-7xl">
              World-class quality,<br />
              <span className="font-medium text-sky-700">delivered globally.</span>
            </h1>
            <p className="mx-auto mb-9 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
              We partner directly with leading tier-1 medical distributors around the globe to bring exceptional medical equipment to healthcare facilities.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/acquisition" className="group inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#075985] px-7 py-3.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#06486b] sm:w-auto">
                Work With Us <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <div className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-7 py-3.5 text-sm font-semibold text-slate-700 sm:w-auto">
                <Globe size={16} className="text-sky-700" /> 480+ Brands Connected
              </div>
            </div>
            <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 divide-y divide-slate-200 border-y border-slate-200 text-left sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              <div className="px-5 py-4"><div className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Featured partner</div><div className="text-base font-semibold text-slate-950">Dürr Dental</div></div>
              <div className="px-5 py-4"><div className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Headquarters</div><div className="text-base font-semibold text-slate-950">Germany</div></div>
              <div className="px-5 py-4"><div className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Specialty</div><div className="text-base font-semibold text-slate-950">Dental & Imaging Systems</div></div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50 py-16 md:py-20">
        <div className="mx-auto max-w-5xl px-6 md:px-10">
          <header className="mb-10 space-y-3 text-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-800">TRUSTED PARTNER</span>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">Featured Partner</h2>
            <p className="mx-auto max-w-xl text-base leading-7 text-slate-600">Discover the industry expertise supporting modern dental care.</p>
          </header>
          {FEATURED_DISTRIBUTORS.map((node, i) => (
            <motion.div
              key={node.name}
              whileHover={{ y: -3 }}
              transition={{ type: 'spring', stiffness: 240, damping: 24 }}
              className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-md md:p-9"
            >
              <div className="flex flex-col gap-7 md:flex-row md:items-start md:gap-9">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-sky-100 bg-sky-50 text-sky-800">{node.icon}</div>
                <div className="min-w-0 flex-1">
                  <div className="mb-3 flex flex-wrap items-center gap-3">
                    <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{node.origin}</span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700"><ShieldCheck size={13} /> {node.status}</span>
                  </div>
                  <h3 className="mb-3 text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">{node.name}</h3>
                  <div className="mb-4 text-sm font-medium text-sky-800">{node.sector}</div>
                  <p className="max-w-2xl text-sm leading-7 text-slate-600">{node.desc}</p>
                  <div className="mt-7 border-t border-slate-100 pt-5">
                    <Link to="/portfolio" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-800 transition-colors hover:text-sky-800">
                      Explore Catalog <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden bg-white py-20 md:py-32">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-14 px-6 md:px-12 lg:grid-cols-2 lg:gap-20">
          <div className="space-y-10">
            <div className="space-y-5">
              <div className="mb-2 flex items-center gap-2 text-sky-700">
                <Sparkles size={18} />
                <span className="text-[10px] font-extrabold uppercase tracking-[0.24em]">THE CARELINK ADVANTAGE</span>
              </div>
              <h2 className="text-4xl font-semibold leading-[1.08] tracking-[-0.04em] text-slate-950 md:text-5xl">
                Making medical procurement <br />
                <span className="font-medium text-sky-700">beautifully simple.</span>
              </h2>
            </div>

            <div className="space-y-4">
              {[
                { title: "Direct Sourcing Pathways", desc: "We eliminate procurement intermediaries. Ship direct from certified distributor networks, maximizing your capital budget efficiency.", icon: <Link2 size={22}/> },
                { title: "Rigorous Technical Compliance", desc: "Every medical asset is distributed by Dürr Dental and thoroughly vetted to conform with top medical standards.", icon: <ShieldCheck size={22}/> },
                { title: "Sovereign Engineering Support", desc: "Our certified medical technicians assemble, test, and provide personal training directly at your medical facility.", icon: <Activity size={22}/> }
              ].map((item, i) => (
                <div key={i} className="group flex gap-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_5px_20px_rgba(15,23,42,.025)] transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-[0_14px_35px_rgba(15,23,42,.07)] md:gap-6 md:p-6">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-700 transition-all duration-300 group-hover:border-sky-600 group-hover:bg-sky-600 group-hover:text-white">{item.icon}</div>
                  <div>
                    <h4 className="mb-2 text-base font-bold tracking-tight text-slate-950 md:text-lg">{item.title}</h4>
                    <p className="text-sm font-medium leading-7 text-slate-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <div className="group relative flex aspect-square w-full max-w-md items-center justify-center overflow-hidden rounded-[2.5rem] border border-slate-200 bg-[#f2f7fb] shadow-[0_30px_90px_rgba(15,23,42,.1)] md:rounded-[3rem]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(14,165,233,.14),transparent_48%)]" />
              <div className="absolute inset-5 rounded-[2rem] border border-sky-900/[0.06] md:inset-7" />
              <Globe size={300} className="absolute text-sky-900/[0.08] transition-transform duration-1000 group-hover:rotate-6 group-hover:scale-105" />
              <div className="relative z-10 w-4/5 rounded-[1.8rem] border border-white bg-white/90 p-7 text-center shadow-[0_20px_70px_rgba(15,23,42,.12)] backdrop-blur-xl md:p-10">
                <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700"><ShieldCheck size={23} /></div>
                <div className="mb-2 text-6xl font-bold tracking-[-0.06em] text-slate-950">99%</div>
                <p className="mb-8 text-[10px] font-extrabold uppercase tracking-[0.2em] text-sky-700">Supply Chain Reliability</p>
                <Link to="/acquisition" className="group/quote inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#075985] py-4 text-sm font-extrabold uppercase tracking-[0.12em] text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#06486b]">
                  Get a Quote <ArrowRight size={16} className="transition-transform duration-300 group-hover/quote:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};