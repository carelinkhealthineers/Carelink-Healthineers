import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  LockKeyhole,
  FileText,
  Database,
  Eye,
  Cookie,
  Globe2,
  Mail,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '../../components/SEO';

const sections = [
  { id: 'information', label: 'Information we collect', icon: Database },
  { id: 'use', label: 'How we use information', icon: Eye },
  { id: 'sharing', label: 'Sharing and disclosure', icon: Globe2 },
  { id: 'security', label: 'Data security and retention', icon: LockKeyhole },
  { id: 'cookies', label: 'Cookies and analytics', icon: Cookie },
  { id: 'rights', label: 'Your choices and rights', icon: ShieldCheck },
];

export const PrivacyPolicy: React.FC = () => {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f9fc] font-sans text-slate-800 selection:bg-[#d9edf8] selection:text-[#123b55]">
      <SEO
        title="Privacy Policy | Carelink Healthineers"
        description="Read the Carelink Healthineers Privacy Policy to understand how information may be collected, used, protected, and managed when you use our website."
        keywords={['Carelink Healthineers privacy policy', 'data privacy', 'personal information', 'medical equipment']}
      />

      <section className="relative isolate border-b border-slate-200/80 bg-white">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-28 -top-36 h-[28rem] w-[28rem] rounded-full bg-sky-100/70 blur-3xl" />
          <div className="absolute -left-32 bottom-[-12rem] h-[24rem] w-[24rem] rounded-full bg-cyan-50 blur-3xl" />
          <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(#164e63_1px,transparent_1px),linear-gradient(90deg,#164e63_1px,transparent_1px)] [background-size:36px_36px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-24 sm:px-8 sm:pb-20 md:pt-32">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="max-w-3xl"
          >
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-sky-800">
              <ShieldCheck size={15} />
              Privacy &amp; data protection
            </div>

            <h1 className="max-w-3xl text-4xl font-semibold leading-[1.08] tracking-[-0.045em] text-slate-950 sm:text-6xl md:text-7xl">
              Your trust deserves
              <span className="mt-1 block text-[#087ca5]">thoughtful protection.</span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              This policy explains how Carelink Healthineers may handle information when you visit our website,
              contact our team, or enquire about our medical equipment and services.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-slate-500">
              <span className="inline-flex items-center gap-2">
                <FileText size={16} className="text-[#087ca5]" />
                Privacy policy
              </span>
              <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />
              <span>Last updated: October 11, 2026</span>
            </div>
          </motion.div>

          <div className="mt-12 grid max-w-4xl gap-3 sm:grid-cols-3">
            {[
              { title: 'Clear purpose', text: 'Information is used for defined business and website purposes.' },
              { title: 'Careful handling', text: 'Access should be limited to people who need the information.' },
              { title: 'Your choices', text: 'You can contact us with privacy questions or requests.' },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 + index * 0.08, duration: 0.45 }}
                className="rounded-2xl border border-slate-200/90 bg-white/85 p-5 shadow-[0_8px_30px_-24px_rgba(15,23,42,0.3)]"
              >
                <CheckCircle2 size={19} className="mb-3 text-[#0782a9]" />
                <h2 className="text-sm font-semibold text-slate-900">{item.title}</h2>
                <p className="mt-1.5 text-sm leading-6 text-slate-500">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-16">
        <aside className="h-fit lg:sticky lg:top-8">
          <p className="mb-4 px-1 text-xs font-bold uppercase tracking-[0.17em] text-slate-400">On this page</p>
          <nav className="grid gap-1 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
            {sections.map(({ id, label, icon: Icon }) => (
              <a
                key={id}
                href={`#${id}`}
                className="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-sky-50 hover:text-[#087ca5]"
              >
                <Icon size={17} className="shrink-0 text-slate-400 transition-colors group-hover:text-[#087ca5]" />
                {label}
              </a>
            ))}
          </nav>
          <div className="mt-4 rounded-2xl bg-[#10354b] p-5 text-white">
            <LockKeyhole size={21} className="mb-3 text-cyan-300" />
            <p className="text-sm font-semibold">Questions about your privacy?</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Please contact Carelink Healthineers through the website so your request can be directed to the right team.
            </p>
            <Link
              to="/acquisition"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 transition-colors hover:text-white"
            >
              Contact our team <ArrowUpRight size={15} />
            </Link>
          </div>
        </aside>

        <div className="min-w-0">
          <div className="mb-8 rounded-2xl border border-sky-100 bg-sky-50/80 p-5 sm:p-6">
            <p className="text-sm leading-7 text-slate-700">
              <strong className="font-semibold text-slate-950">A note about scope:</strong> This policy is intended for
              information handled through this website and related enquiries. It is not a notice for patient medical
              records or a clinical care service. Please do not submit sensitive health information through a general
              website enquiry form.
            </p>
          </div>

          <article className="space-y-5">
            <PolicySection id="introduction" number="01" title="Introduction">
              Carelink Healthineers (“Carelink Healthineers”, “we”, “us” or “our”) respects your privacy. This policy
              describes the types of information that may be collected when you use our website, how that information
              may be used, and the choices available to you. By continuing to use the website, you acknowledge this
              policy. Where consent is required by applicable law, we will seek it separately.
            </PolicySection>

            <PolicySection id="information" number="02" title="Information we may collect">
              <p>Depending on how you interact with our website, information may include:</p>
              <ul>
                <li><strong>Contact information:</strong> your name, business name, email address, telephone number, and details you choose to include in an enquiry.</li>
                <li><strong>Business and enquiry information:</strong> organisation, professional role, products or services of interest, and communications you send to us.</li>
                <li><strong>Technical information:</strong> browser and device type, approximate location inferred from network information, IP address, pages visited, referral source, and basic diagnostic logs.</li>
                <li><strong>Cookie and usage information:</strong> information collected through cookies or similar technologies, where these are used and permitted.</li>
              </ul>
              <p>We ask that you provide only information relevant to your enquiry and that you are authorised to share.</p>
            </PolicySection>

            <PolicySection id="use" number="03" title="How we may use information">
              We may use information to respond to enquiries and requests, provide information about our products and services,
              coordinate business communications, operate and maintain the website, understand website performance,
              protect against misuse or security incidents, and meet applicable legal obligations. We will not use
              personal information for a materially different purpose without an appropriate basis to do so.
            </PolicySection>

            <PolicySection id="sharing" number="04" title="Sharing and disclosure">
              We do not intend to sell personal information. Information may be shared with service providers who help
              operate the website or support our business, relevant business partners where necessary to respond to your
              enquiry, or authorities and other parties where disclosure is required by law or necessary to protect rights
              and security. Where appropriate, we take steps to require recipients to handle information responsibly.
              We do not authorise third parties to use your information for their own unrelated marketing.
            </PolicySection>

            <PolicySection id="security" number="05" title="Data security and retention">
              We use reasonable administrative, technical, and organisational measures designed to protect information
              against unauthorised access, loss, misuse, alteration, or disclosure. No website or electronic transmission
              can be guaranteed to be completely secure. We retain information only for as long as reasonably needed for
              the purpose it was collected, including responding to enquiries, maintaining business records, resolving
              disputes, and meeting legal requirements.
            </PolicySection>

            <PolicySection id="cookies" number="06" title="Cookies and analytics">
              Our website may use essential cookies or similar technologies to support core functionality, security, and
              user experience. If analytics or other optional tracking tools are enabled, they may help us understand how
              visitors use the website and improve its performance. You can manage cookies through your browser settings.
              Blocking certain cookies may affect some website features. Any consent controls required by applicable law
              should be provided where relevant.
            </PolicySection>

            <PolicySection id="rights" number="07" title="Your choices and rights">
              Depending on the laws that apply to you, you may be able to request access to, correction of, or deletion of
              personal information we hold about you, object to or restrict certain processing, or withdraw consent where
              processing relies on consent. To make a request, contact us through the website and describe your request.
              We may need to verify your identity before acting and may retain information where the law permits or requires it.
            </PolicySection>

            <PolicySection id="transfers" number="08" title="Third-party websites and international processing">
              Our website may contain links to third-party websites or services. Their privacy practices are governed by
              their own policies, and we encourage you to review them before providing information. Some website or
              business service providers may process information in a country other than yours. Where applicable, we
              take reasonable steps to ensure appropriate safeguards are in place.
            </PolicySection>

            <PolicySection id="children" number="09" title="Children’s privacy">
              This website is intended for business and professional audiences and is not designed to collect personal
              information from children. If you believe a child has provided personal information to us, please contact
              us so we can review the matter and take appropriate steps.
            </PolicySection>

            <PolicySection id="changes" number="10" title="Changes to this policy">
              We may update this policy from time to time to reflect changes to our website, business practices, or
              applicable requirements. The updated version will be posted on this page with a revised “Last updated” date.
              We encourage you to review this page periodically.
            </PolicySection>

            <section id="contact" className="scroll-mt-8 rounded-3xl bg-[#10354b] p-6 text-white sm:p-9">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-cyan-200">
                <Mail size={21} />
              </div>
              <h2 className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl">Contact us about privacy</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                If you have a question about this policy or want to make a privacy-related request, please contact
                Carelink Healthineers through our website. Include enough detail for us to understand your request,
                but do not send sensitive personal or medical information through a general enquiry.
              </p>
              <Link
                to="/acquisition"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#10354b] transition-colors hover:bg-cyan-50"
              >
                Contact Carelink Healthineers <ArrowUpRight size={16} />
              </Link>
            </section>
          </article>

          <p className="mt-8 text-xs leading-6 text-slate-400">
            This page provides general privacy information and is not legal advice. Review it against your actual data
            collection, technology providers, business practices, and the privacy laws that apply before publishing.
          </p>
        </div>
      </section>
    </main>
  );
};

type PolicySectionProps = {
  id: string;
  number: string;
  title: string;
  children: React.ReactNode;
};

function PolicySection({ id, number, title, children }: PolicySectionProps) {
  return (
    <section id={id} className="scroll-mt-8 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-[0_8px_30px_-28px_rgba(15,23,42,0.25)] sm:p-8">
      <div className="mb-4 flex items-start gap-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-xs font-bold tracking-wide text-[#087ca5]">
          {number}
        </span>
        <h2 className="pt-1 text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">{title}</h2>
      </div>
      <div className="space-y-4 pl-0 text-sm leading-7 text-slate-600 sm:pl-[3.25rem] sm:text-[15px] [&_li]:relative [&_li]:pl-5 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-[0.85rem] [&_li]:before:h-1.5 [&_li]:before:w-1.5 [&_li]:before:rounded-full [&_li]:before:bg-[#0b87ac] [&_ul]:space-y-2 [&_ul]:pl-0">
        {children}
      </div>
    </section>
  );
}

export default PrivacyPolicy;
