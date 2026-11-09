import React, { useState } from 'react';
import {
  BookOpen,
  DollarSign,
  Stethoscope,
  FileSpreadsheet,
  FileText,
  Crown,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Download,
  Printer,
  Search,
  ChevronRight,
  HelpCircle,
  ShieldCheck,
  Building2,
  Calendar,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';

export const ExecutiveUserManualBangla: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const sections = [
    {
      id: 'intro',
      title: '১. এক্সিকিউটিভ পোর্টাল পরিচিতি ও লগইন',
      icon: Crown,
      badge: 'পরিচিতি',
      badgeColor: 'bg-indigo-100 text-indigo-800',
      content: (
        <div className="space-y-4 text-slate-700 leading-relaxed text-xs">
          <p>
            কেয়ারলিংক হেলথিনিয়ার্স-এর <strong>এক্সিকিউটিভ ম্যানেজমেন্ট পোর্টাল</strong> কোম্পানির সম্মানিত চেয়ারম্যান, ব্যবস্থাপনা পরিচালক (MD) এবং ডিরেক্টর মহোদয়দের জন্য তৈরি একটি প্রিমিয়াম ড্যাশবোর্ড। এটি কোনো সাধারণ অ্যাডমিন প্যানেল নয়—শীর্ষ ব্যবস্থাপনা যাতে কোম্পানির সমস্ত কার্যক্রম, আর্থিক হিসাব, ডাক্তারদের নিকট পণ্য বিক্রয় এবং কর্মচারীদের দৈনন্দিন রিপোর্ট এক জায়গা থেকে পর্যবেক্ষণ করতে পারেন, সেজন্য এটি তৈরি করা হয়েছে।
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-bold text-slate-900 block">MD / চেয়ারম্যান এক্সেস</span>
              <p className="text-[11px] text-slate-500">
                কোম্পানির সমস্ত ডিপার্টমেন্টের রিপোর্ট, মাসিক বাজেট এবং সর্বমোট আর্থিক হিসাব দেখার পূর্ণ অধিকার।
              </p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-bold text-slate-900 block">ডিরেক্টর এক্সেস</span>
              <p className="text-[11px] text-slate-500">
                নির্দিষ্ট বিভাগ অথবা সম্পূর্ণ কোম্পানির সেলস ও টেকনিক্যাল প্রগ্রেস তদারকি করার সুবিধা।
              </p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-bold text-slate-900 block">নিরাপদ রিড-অনলি ভিউ</span>
              <p className="text-[11px] text-slate-500">
                অসাবধানতাবশত ডেটা মুছে যাওয়ার ঝুঁকি নেই; শুধুমাত্র অনুমোদিত ম্যানেজমেন্ট সিদ্ধান্ত ও সেলস এন্ট্রি দেওয়া যায়।
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'briefing',
      title: '২. দৈনিক এক্সিকিউটিভ ব্রিফিং (আজকের সারসংক্ষেপ)',
      icon: FileText,
      badge: 'দৈনিক ব্রিফিং',
      badgeColor: 'bg-blue-100 text-blue-800',
      content: (
        <div className="space-y-3 text-slate-700 leading-relaxed text-xs">
          <p>
            পোর্টালে প্রবেশ করলেই প্রথমে দেখতে পাবেন <strong>Executive Briefing</strong>। এখানে আজকের দিনের সম্পূর্ণ কাজের একটি স্বয়ংক্রিয় সারসংক্ষেপ প্রদর্শিত হয়:
          </p>
          <ul className="space-y-2 list-disc list-inside bg-blue-50/50 p-3.5 rounded-2xl border border-blue-100 font-medium text-slate-800">
            <li>
              <strong>আজকের জমা পড়া রিপোর্ট:</strong> কোন কোন ফিল্ড ইঞ্জিনিয়ার বা কর্মকর্তা আজ রিপোর্ট জমা দিয়েছেন তার সংখ্যা ও বিস্তারিত তালিকা।
            </li>
            <li>
              <strong>রিপোর্ট জমা না দেওয়া কর্মচারী:</strong> আজ যাদের ফিল্ডে ডিউটি ছিল কিন্তু এখনো রিপোর্ট জমা দেননি, তাদের নাম ও ডিপার্টমেন্ট সরাসরি লাল/হলুদ ব্যাজে দেখানো হয়।
            </li>
            <li>
              <strong>ফিল্ড সমস্যা ও টেকনিক্যাল জটিলতা:</strong> কোনো হাসপাতালে মেশিন ইন্সটলেশনে সমস্যা বা ত্রুটি দেখা দিলে তা তাৎক্ষণিক হাইলাইট হয়।
            </li>
            <li>
              <strong>পূর্ণাঙ্গ রিপোর্ট পরিদর্শন:</strong> যেকোনো কর্মচারীর রিপোর্টের ডানপাশে থাকা <em>Full Details</em> বাটনে ক্লিক করে কাজের সম্পূর্ণ বিবরণ ও ছবি দেখতে পারবেন।
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 'hishab',
      title: '৩. সর্বমোট হিসাব ও বাজেট সিস্টেম (All Total Hishab & Budget)',
      icon: DollarSign,
      badge: 'আর্থিক হিসাব',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      content: (
        <div className="space-y-4 text-slate-700 leading-relaxed text-xs">
          <p>
            সাইডবারের <strong>Financial &amp; Budget Hishab</strong> ট্যাবে ক্লিক করলে কোম্পানির সম্পূর্ণ আর্থিক লেজার এবং আধুনিক চার্ট দেখতে পাবেন:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-2">
              <span className="font-extrabold text-emerald-900 text-sm flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-700" />
                চলতি মাসের বাজেট ও সর্বমোট খরচের হিসাব
              </span>
              <ul className="space-y-1.5 text-[11px] text-slate-700 list-disc list-inside">
                <li>
                  <strong>This Month Budget:</strong> চলতি মাসের জন্য নির্ধারিত বাজেট। পেন্সিল আইকনে ক্লিক করে MD বা চেয়ারম্যান যেকোনো সময় বাজেট পরিবর্তন করতে পারেন।
                </li>
                <li>
                  <strong>Personal / Field Expenses (TA/DA):</strong> কর্মচারীদের আন্তঃজেলা বাস/ট্রেন ভাড়া, হোটেল খরচ, খাবার খরচ ও লোকাল ট্রান্সপোর্ট-এর সর্বমোট যোগফল।
                </li>
                <li>
                  <strong>Company Operations Expenses:</strong> কোম্পানির অফিস ভাড়া, ইউটিলিটি বিল এবং অপারেশনাল নোটের খরচের হিসাব।
                </li>
                <li>
                  <strong>ALL TOTAL EXPENSES (সর্বমোট কত খরচ হলো):</strong> ফিল্ড খরচ + অফিস খরচ মিলিয়ে সর্বমোট টাকা স্বয়ংক্রিয়ভাবে হিসাব হয়ে বড় অক্ষরে প্রদর্শিত হয়।
                </li>
              </ul>
            </div>

            <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-2xl space-y-2">
              <span className="font-extrabold text-indigo-900 text-sm flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-indigo-700" />
                ক্যাশ আদায় ও নিট উদ্বৃত্ত (Net Cash Margin)
              </span>
              <ul className="space-y-1.5 text-[11px] text-slate-700 list-disc list-inside">
                <li>
                  <strong>বাজেট ব্যবহারের প্রগ্রেস বার:</strong> বাজেটের কত শতাংশ খরচ হয়েছে (যেমন: ৬৫%) তা সবুজ, হলুদ বা লাল রঙে রিয়েল-টাইমে সতর্ক করে।
                </li>
                <li>
                  <strong>ক্যাশ আদায় বনাম খরচ:</strong> বিক্রি হওয়া মেশিনের যে টাকা ব্যাংকে জমা হয়েছে, তা থেকে মোট খরচ বাদ দিয়ে <em>Net Cash Balance</em> প্রদর্শিত হয়।
                </li>
                <li>
                  <strong>সিস্টেম চার্ট:</strong> রঙিন বার চার্ট এবং পাই চার্টের মাধ্যমে খরচের খাতগুলো এক পলকেই বোঝা যায়।
                </li>
              </ul>
            </div>
          </div>
          <p className="text-[11px] bg-slate-100 p-2.5 rounded-xl border border-slate-200 text-slate-600">
            <strong>টিপস:</strong> উপরের ডানপাশের <em>Excel (.xlsx)</em> অথবা <em>PDF Statement</em> বাটনে চাপ দিলে চলতি মাসের এই পূর্ণাঙ্গ হিসাব এক সেকেন্ডে ডাউনলোড হয়ে যাবে।
          </p>
        </div>
      ),
    },
    {
      id: 'sales',
      title: '৪. কোন প্রোডাক্ট কোন ডাক্তার বা সেন্টারে বিক্রি হলো (Sales Ledger)',
      icon: Stethoscope,
      badge: 'সেলস লেজার',
      badgeColor: 'bg-blue-100 text-blue-800',
      content: (
        <div className="space-y-4 text-slate-700 leading-relaxed text-xs">
          <p>
            সাইডবারের <strong>Doctor &amp; Center Sales</strong> অপশনে গেলে কোন মেডিকেল বা ডেন্টাল ইকুইপমেন্ট কোন ডাক্তারের কাছে অথবা কোন হাসপাতালে বিক্রি ও ইন্সটল করা হয়েছে, তার স্বয়ংক্রিয় লেজার পাওয়া যায়।
          </p>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <span className="font-bold text-slate-900 block text-xs">
              লেজারে কী কী তথ্য সংরক্ষিত থাকে?
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-600">
              <div className="bg-white p-2 rounded-lg border border-slate-200">✓ মেশিনের নাম ও মডেল নাম্বার</div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">✓ সম্মানিত ডাক্তারের নাম</div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">✓ মেডিকেল সেন্টার / ক্লিনিকের নাম</div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">✓ বিক্রয় মূল্য (৳ BDT)</div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">✓ কত টাকা পরিশোধ হলো (Paid)</div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">✓ বকেয়া টাকার পরিমাণ (Due)</div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">✓ ইন্সটলেশন স্ট্যাটাস</div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">✓ ওয়ারেন্টি মেয়াদ (যেমন: ১ বা ২ বছর)</div>
              <div className="bg-white p-2 rounded-lg border border-slate-200">✓ জেলা ও শহরের নাম</div>
            </div>
          </div>

          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-2">
            <span className="font-bold text-blue-950 text-xs flex items-center gap-1.5">
              <Info size={16} className="text-blue-700" />
              নতুন বিক্রয় তথ্য যুক্ত করার নিয়ম (Record New Equipment Sale):
            </span>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-700">
              <li>উপরে ডানপাশে থাকা <strong>Record New Equipment Sale</strong> নীল বাটনে ক্লিক করুন।</li>
              <li>পপ-আপ ফর্মে মেশিনের নাম (যেমন: Dürr VistaPano S), ডাক্তারের নাম ও সেন্টারের নাম লিখুন।</li>
              <li>বিক্রয় মূল্য, পেইড টাকা এবং ডেলিভারি স্ট্যাটাস নির্বাচন করুন।</li>
              <li><em>Save Sale Record</em> বাটনে চাপ দিন। তথ্য সাথে সাথে সিস্টেমে সেভ হবে এবং চার্ট আপডেট হবে।</li>
            </ol>
          </div>
        </div>
      ),
    },
    {
      id: 'excel',
      title: '৫. ইন-পোর্টাল এক্সেল স্টুডিও ও কাস্টম এক্সেল এক্সপোর্ট',
      icon: FileSpreadsheet,
      badge: 'এক্সেল স্টুডিও',
      badgeColor: 'bg-teal-100 text-teal-800',
      content: (
        <div className="space-y-4 text-slate-700 leading-relaxed text-xs">
          <p>
            সাইডবারের <strong>Custom Excel Studio</strong> ট্যাবে গেলে মাইক্রোসফট এক্সেলের মতোই একটি স্বয়ংক্রিয় লাইভ গ্রিড পোর্টালের ভেতরেই দেখতে পাবেন (A, B, C কলাম, সারি নাম্বার এবং স্বয়ংক্রিয় যোগফল সহ)।
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 bg-white border border-slate-200 rounded-2xl space-y-1.5 shadow-2xs">
              <span className="font-bold text-slate-900 block text-xs">১. ডেটাসেট পছন্দ করুন</span>
              <p className="text-[11px] text-slate-600">
                ডাক্তার সেলস, কর্মচারী TA/DA, সর্বমোট হিসাব অথবা অফিস নোট—যেটির এক্সেল বানাতে চান সেটিতে ক্লিক করুন।
              </p>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-2xl space-y-1.5 shadow-2xs">
              <span className="font-bold text-slate-900 block text-xs">২. কলাম কাস্টমাইজ করুন</span>
              <p className="text-[11px] text-slate-600">
                যেকোনো কলামের চেকবক্সে টিক দিয়ে যোগ করুন বা আনটিক করে বাদ দিন। আপনার প্রয়োজনমতো কাস্টম শিট তৈরি হবে।
              </p>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-2xl space-y-1.5 shadow-2xs">
              <span className="font-bold text-slate-900 block text-xs">৩. পোর্টালে শিট সেভ রাখুন</span>
              <p className="text-[11px] text-slate-600">
                <em>Save Sheet in Portal</em> বাটনে চাপ দিয়ে নাম লিখুন। শিটটি পোর্টালে সংরক্ষিত থাকবে এবং ভবিষ্যতে এক ক্লিকেই খোলা যাবে।
              </p>
            </div>
          </div>
          <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-900 text-[11px]">
            <strong>এক্সেল ও পিডিএফ ডাউনলোড:</strong> <em>Download Excel (.xlsx)</em> বাটনে চাপ দিলে আপনার পছন্দ করা কলামগুলো দিয়েই স্ট্যান্ডার্ড মাইক্রোসফট এক্সেল ফাইল ডাউনলোড হয়ে যাবে।
          </div>
        </div>
      ),
    },
    {
      id: 'reports_tada',
      title: '৬. কর্মচারীদের দৈনিক রিপোর্ট ও TA/DA ক্লেইম পর্যবেক্ষণ',
      icon: Receipt,
      badge: 'কর্মচারী তদারকি',
      badgeColor: 'bg-amber-100 text-amber-800',
      content: (
        <div className="space-y-3 text-slate-700 leading-relaxed text-xs">
          <p>
            <strong>Employee Daily Reports</strong> এবং <strong>Employee TA/DA Claims</strong> ট্যাবের মাধ্যমে মাঠ পর্যায়ের যেকোনো কার্যক্রম নিবিড়ভাবে তদারকি করা যায়:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
              <span className="font-bold text-slate-900 block">কাজের রিপোর্ট ও ছবি দেখা</span>
              <p className="text-slate-600">
                ফিল্ড ইঞ্জিনিয়ার কোন হাসপাতালে কী কাজ করেছেন, কোন মেশিনে কাজ করেছেন এবং সমস্যার কোনো ছবি বা ভাউচার আপলোড করেছেন কিনা তা সরাসরি পোর্টালে বড় করে দেখতে পারবেন।
              </p>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
              <span className="font-bold text-slate-900 block">এক্সিকিউটিভ রিমার্ক দেওয়া</span>
              <p className="text-slate-600">
                যেকোনো রিপোর্টে চেয়ারম্যান বা MD মহোদয় পরামর্শ বা জরুরি নির্দেশনা (Flag Urgent) লিখে দিতে পারেন, যা সরাসরি সংশ্লিষ্ট কর্মচারী ও অ্যাডমিনের নিকট পৌঁছে যায়।
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'decisions_notes',
      title: '৭. ম্যানেজমেন্ট সিদ্ধান্ত ও কোম্পানি নির্দেশিকা (Decisions & Notes)',
      icon: Crown,
      badge: 'সিদ্ধান্ত জারি',
      badgeColor: 'bg-purple-100 text-purple-800',
      content: (
        <div className="space-y-3 text-slate-700 leading-relaxed text-xs">
          <p>
            কোম্পানির বোর্ড অফ ডিরেক্টরস বা শীর্ষ ম্যানেজমেন্টের যেকোনো অফিশিয়াল সিদ্ধান্ত এবং নীতিগত নির্দেশিকা বাস্তবায়নের জন্য দুটি বিশেষ অপশন রয়েছে:
          </p>
          <ul className="space-y-2 list-disc list-inside bg-purple-50/50 p-3.5 rounded-2xl border border-purple-100 font-medium text-slate-800">
            <li>
              <strong>Management Decisions:</strong> এখানে নতুন সিদ্ধান্ত তৈরি করতে পারবেন (যেমন: "ঢাকা মেডিকেলে নতুন মেশিন ইন্সটলেশনের জন্য আগামী ১৫ তারিখের মধ্যে টেকনিক্যাল টিম পাঠানো হোক")।
            </li>
            <li>
              <strong>ম্যানেজার নিয়োগ ও ডেডলাইন:</strong> কোন ডিপার্টমেন্টের ম্যানেজার কাজটি বাস্তবায়ন করবেন এবং কত তারিখের মধ্যে শেষ করবেন তা নির্ধারণ করে দেওয়া যায়।
            </li>
            <li>
              <strong>বাস্তবায়ন পর্যবেক্ষণ:</strong> কাজটি সম্পন্ন হলে <em>Mark Implemented</em> বাটনে ক্লিক করে বাস্তবায়ন নিশ্চিত করা হয়।
            </li>
            <li>
              <strong>Company Notes &amp; Expenses:</strong> অফিসের জরুরি নোটিশ, সার্কুলার বা খরচের অনুমোদন লিখে <em>Pin to Top</em> করে রাখা যায়।
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 'faq',
      title: '৮. সচরাচর জিজ্ঞাসিত প্রশ্ন ও সহজ সমাধান (FAQ)',
      icon: HelpCircle,
      badge: 'সহায়তা',
      badgeColor: 'bg-slate-200 text-slate-800',
      content: (
        <div className="space-y-3 text-slate-700 leading-relaxed text-xs">
          <div className="space-y-3">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 block">প্রশ্ন: আমি কি ফোন বা ট্যাব থেকে এক্সিকিউটিভ ড্যাশবোর্ড ব্যবহার করতে পারব?</span>
              <p className="text-[11px] text-slate-600">
                উত্তর: হ্যাঁ, সম্পূর্ণ এক্সিকিউটিভ ড্যাশবোর্ডটি মোবাইল, ট্যাব এবং ল্যাপটপ/ডেস্কটপে শতভাগ রেসপন্সিভভাবে কাজ করার উপযোগী করে তৈরি করা হয়েছে।
              </p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 block">প্রশ্ন: এক্সেল বা পিডিএফ ফাইল ডাউনলোড করলে কি কোম্পানির লোগো ও হেডার থাকবে?</span>
              <p className="text-[11px] text-slate-600">
                উত্তর: হ্যাঁ, প্রতিটি এক্সেল এবং পিডিএফ ফাইলে কেয়ারলিংক হেলথিনিয়ার্স-এর অফিশিয়াল নাম, তারিখ ও নিখুঁত কলাম ফরম্যাট স্বয়ংক্রিয়ভাবে যুক্ত থাকবে।
              </p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 block">প্রশ্ন: আমি কি ভুলবশত কোনো ডেটা মুছে ফেলার ভয় আছে?</span>
              <p className="text-[11px] text-slate-600">
                উত্তর: না। এক্সিকিউটিভ প্যানেলে কর্মচারীদের মূল ডেটা রিড-অনলি মোডে সংরক্ষিত থাকে, তাই কোনো জরুরি ডেটা দুর্ঘটনাবশত মুছে যাওয়ার কোনো সম্ভাবনা নেই।
              </p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const filteredSections = sections.filter((sec) => {
    if (activeSection !== 'all' && sec.id !== activeSection) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return sec.title.toLowerCase().includes(q) || sec.badge.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-6 lg:p-8 rounded-3xl shadow-lg border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-slate-950">
                সহজ বাংলা নির্দেশিকা
              </span>
              <span className="text-slate-400 text-xs">· সংস্করণ ১.০</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <BookOpen className="text-amber-400" size={24} />
              <span>এক্সিকিউটিভ পোর্টাল ব্যবহার ম্যানুয়াল (User Guide)</span>
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              চেয়ারম্যান, ব্যবস্থাপনা পরিচালক (MD) ও ডিরেক্টর মহোদয়দের জন্য ড্যাশবোর্ডের প্রতিটি ফিচার সহজে ব্যবহারের সম্পূর্ণ নিয়মাবলী।
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border border-white/20 shadow-xs"
            >
              <Printer size={15} />
              <span>ম্যানুয়াল প্রিন্ট করুন</span>
            </button>
          </div>
        </div>

        {/* Quick Search */}
        <div className="pt-2">
          <div className="flex items-center gap-2 bg-white/10 border border-white/20 px-3.5 py-2.5 rounded-2xl max-w-md text-xs">
            <Search size={16} className="text-slate-300" />
            <input
              type="text"
              placeholder="ম্যানুয়ালের যেকোনো বিষয় খুঁজুন (যেমন: বাজেট, সেলস, এক্সেল, TA/DA)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-white placeholder-slate-400 focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Quick Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setActiveSection('all')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSection === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          সব অধ্যায় একসাথে
        </button>
        {sections.map((sec) => (
          <button
            key={sec.id}
            onClick={() => setActiveSection(sec.id)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeSection === sec.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {sec.badge}
          </button>
        ))}
      </div>

      {/* Content Modules */}
      <div className="space-y-6">
        {filteredSections.map((sec) => {
          const IconComponent = sec.icon;
          return (
            <div
              key={sec.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden transition-all hover:border-slate-300"
            >
              <div className="p-5 lg:p-6 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 shadow-2xs">
                    <IconComponent size={20} className="text-blue-700" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                      {sec.title}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      কেয়ারলিংক অফিসিয়াল গাইডলাইন
                    </span>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${sec.badgeColor}`}>
                  {sec.badge}
                </span>
              </div>

              <div className="p-6 lg:p-8">{sec.content}</div>
            </div>
          );
        })}

        {filteredSections.length === 0 && (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 text-xs">
            আপনার অনুসন্ধান &quot;{searchQuery}&quot; দিয়ে কোনো নির্দেশনা খুঁজে পাওয়া যায়নি। অনুগ্রহ করে অন্য শব্দ দিয়ে খুঁজুন।
          </div>
        )}
      </div>

      {/* Footer Support Card */}
      <div className="p-5 bg-indigo-50/60 border border-indigo-200 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 text-white rounded-xl">
            <ShieldCheck size={20} />
          </div>
          <div>
            <div className="font-extrabold text-slate-900">
              টেকনিক্যাল সাপোর্ট ও এক্সিকিউটিভ অ্যাসিস্ট্যান্স
            </div>
            <div className="text-[11px] text-slate-500">
              ড্যাশবোর্ডের যেকোনো ফিচারে সহায়তার প্রয়োজন হলে সিস্টেম অ্যাডমিনের সাথে যোগাযোগ করুন।
            </div>
          </div>
        </div>
        <span className="px-3 py-1 bg-white border border-indigo-200 text-indigo-900 rounded-xl font-bold font-mono text-[11px]">
          Carelink Enterprise System v2.6
        </span>
      </div>
    </div>
  );
};
