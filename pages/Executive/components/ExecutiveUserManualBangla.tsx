import React, { useState } from 'react';
import {
  BookOpen,
  DollarSign,
  Stethoscope,
  FileSpreadsheet,
  FileText,
  Crown,
  CheckCircle2,
  Receipt,
  Search,
  HelpCircle,
  ShieldCheck,
  Building2,
  Info,
  Printer,
  Landmark,
  Package,
  FolderHeart,
  Layers,
} from 'lucide-react';

interface ManualSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge: string;
  badgeColor: string;
  keywords: string;
  content: React.ReactNode;
}

export const ExecutiveUserManualBangla: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const sections: ManualSection[] = [
    {
      id: 'intro',
      title: '১. এক্সিকিউটিভ পোর্টাল পরিচিতি ও সাব-মেনু সাইডবার',
      icon: Crown,
      badge: 'পরিচিতি ও মেনু',
      badgeColor: 'bg-indigo-100 text-indigo-800',
      keywords: 'sidebar menu submenu finance inventory employee draft management overview মেনু পরিচিতি সাবমেনু',
      content: (
        <div className="space-y-4 text-slate-700 leading-relaxed text-xs">
          <p>
            কেয়ারলিংক হেলথিনিয়ার্স-এর <strong>এক্সিকিউটিভ ম্যানেজমেন্ট পোর্টাল</strong> কোম্পানির সম্মানিত চেয়ারম্যান, ব্যবস্থাপনা পরিচালক (MD) এবং ডিরেক্টর মহোদয়দের জন্য তৈরি একটি প্রিমিয়াম ড্যাশবোর্ড। বাম পাশের সাইডবারটি এখন গোছানো ও সহজ <strong>সাব-মেনু (Sub-Menu)</strong> আকারে সাজানো হয়েছে, যাতে বাড়তি লেখা ছাড়াই প্রতিটি সেকশন দ্রুত খুঁজে পাওয়া যায়:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1">
              <span className="font-bold text-emerald-950 block">Finance (আর্থিক)</span>
              <p className="text-[11px] text-slate-600">
                Hishab, <strong>Invest</strong>, Expenses &amp; Notes, Doctor Sales এবং Excel Studio।
              </p>
            </div>
            <div className="p-3 bg-teal-50/60 border border-teal-200 rounded-xl space-y-1">
              <span className="font-bold text-teal-950 block">Inventory (মজুদ ও সম্পদ)</span>
              <p className="text-[11px] text-slate-600">
                <strong>Stock</strong> (বিক্রয়যোগ্য ইনভেন্টরি) ও <strong>Company Assets</strong> (অফিস সম্পদ)।
              </p>
            </div>
            <div className="p-3 bg-indigo-50/60 border border-indigo-200 rounded-xl space-y-1">
              <span className="font-bold text-indigo-950 block">Employee (কর্মচারী)</span>
              <p className="text-[11px] text-slate-600">
                ক্লিক করলে সাব-সেকশন খুলবে: <strong>Daily Reports</strong> ও <strong>TA/DA</strong>।
              </p>
            </div>
            <div className="p-3 bg-violet-50/60 border border-violet-200 rounded-xl space-y-1">
              <span className="font-bold text-violet-950 block">Draft (ড্রাফট ও ফাইল বক্স)</span>
              <p className="text-[11px] text-slate-600">
                ড্রাফট নোট, ফাইল Drag &amp; Drop এবং বিল্ট-ইন PDF ও Excel ভিউয়ার।
              </p>
            </div>
            <div className="p-3 bg-rose-50/60 border border-rose-200 rounded-xl space-y-1">
              <span className="font-bold text-rose-950 block">Management (ব্যবস্থাপনা)</span>
              <p className="text-[11px] text-slate-600">
                Decisions (সিদ্ধান্ত), Analytics ও Alerts (জরুরি সতর্কবার্তা)।
              </p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-bold text-slate-900 block">নিরাপদ এক্সেস</span>
              <p className="text-[11px] text-slate-600">
                MD / চেয়ারম্যান ও ডিরেক্টরদের জন্য আলাদা নিরাপদ ড্যাশবোর্ড ও রিয়েল-টাইম আপডেট।
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'briefing',
      title: '২. দৈনিক এক্সিকিউটিভ ব্রিফিং (Overview)',
      icon: FileText,
      badge: 'দৈনিক ব্রিফিং',
      badgeColor: 'bg-blue-100 text-blue-800',
      keywords: 'overview briefing report today summary ব্রিফিং রিপোর্ট আজকের',
      content: (
        <div className="space-y-3 text-slate-700 leading-relaxed text-xs">
          <p>
            পোর্টালে প্রবেশ করলেই <strong>Overview</strong>-তে দেখতে পাবেন আজকের দিনের স্বয়ংক্রিয় সারসংক্ষেপ:
          </p>
          <ul className="space-y-2 list-disc list-inside bg-blue-50/50 p-3.5 rounded-2xl border border-blue-100 font-medium text-slate-800">
            <li>
              <strong>আজকের জমা পড়া রিপোর্ট:</strong> কোন কোন ফিল্ড ইঞ্জিনিয়ার বা কর্মকর্তা আজ রিপোর্ট জমা দিয়েছেন তার সংখ্যা ও তালিকা।
            </li>
            <li>
              <strong>রিপোর্ট জমা না দেওয়া কর্মচারী:</strong> যাদের ফিল্ডে ডিউটি ছিল কিন্তু এখনো রিপোর্ট জমা দেননি, তাদের নাম আলাদাভাবে দেখানো হয়।
            </li>
            <li>
              <strong>লাইভ আর্থিক স্ট্রিপ:</strong> এক নজরে সর্বমোট Equipment Sales, TA/DA খরচ, অফিস খরচ এবং Financial Hub লিংক।
            </li>
            <li>
              <strong>পূর্ণাঙ্গ রিপোর্ট পরিদর্শন:</strong> যেকোনো রিপোর্টের পাশে থাকা <em>Full Details</em> বাটনে ক্লিক করে কাজের বিবরণ ও ছবি দেখা যায়।
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 'hishab',
      title: '৩. সর্বমোট হিসাব ও বাজেট সিস্টেম (Finance → Hishab)',
      icon: DollarSign,
      badge: 'আর্থিক হিসাব',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      keywords: 'finance hishab budget expense net cash হিসাব বাজেট খরচ টাকা',
      content: (
        <div className="space-y-4 text-slate-700 leading-relaxed text-xs">
          <p>
            বাম মেনুর <strong>Finance → Hishab</strong> ট্যাবে গেলে কোম্পানির সম্পূর্ণ আর্থিক লেজার এবং আধুনিক চার্ট দেখতে পাবেন:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-2">
              <span className="font-extrabold text-emerald-900 text-sm flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-700" />
                চলতি মাসের বাজেট ও সর্বমোট খরচ
              </span>
              <ul className="space-y-1.5 text-[11px] text-slate-700 list-disc list-inside">
                <li>
                  <strong>Monthly Budget:</strong> পেন্সিল আইকনে ক্লিক করে MD বা চেয়ারম্যান যেকোনো মাসের বাজেট পরিবর্তন করতে পারেন।
                </li>
                <li>
                  <strong>Field Expenses (TA/DA):</strong> কর্মচারীদের যাতায়াত, হোটেল ও খাবার খরচের সর্বমোট যোগফল।
                </li>
                <li>
                  <strong>Company Ops Expenses:</strong> অফিস ভাড়া, ইউটিলিটি বিল এবং অপারেশনাল খরচের হিসাব।
                </li>
                <li>
                  <strong>ALL TOTAL EXPENSES:</strong> ফিল্ড ও অফিস খরচ মিলে সর্বমোট টাকা স্বয়ংক্রিয়ভাবে হিসাব হয়।
                </li>
              </ul>
            </div>

            <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-2xl space-y-2">
              <span className="font-extrabold text-indigo-900 text-sm flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-indigo-700" />
                ক্যাশ আদায় ও নিট উদ্বৃত্ত (Net Cash)
              </span>
              <ul className="space-y-1.5 text-[11px] text-slate-700 list-disc list-inside">
                <li>
                  <strong>বাজেট প্রগ্রেস বার:</strong> বাজেটের কত শতাংশ খরচ হয়েছে তা সবুজ, হলুদ বা লাল রঙে সতর্ক করে।
                </li>
                <li>
                  <strong>ক্যাশ আদায় বনাম খরচ:</strong> সংগৃহীত টাকা থেকে মোট খরচ বাদ দিয়ে <em>Net Cash Balance</em> দেখানো হয়।
                </li>
                <li>
                  <strong>অ্যাকাউন্টস এক্সপোর্ট:</strong> এক ক্লিকেই <em>Excel (.xlsx)</em> অথবা <em>PDF Statement</em> ডাউনলোড করা যায়।
                </li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'invest',
      title: '৪. বিনিয়োগ ও MD ক্যাপিটাল ট্র্যাকিং (Finance → Invest)',
      icon: Landmark,
      badge: 'বিনিয়োগ (Invest)',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      keywords: 'invest investment md partner capital chart bar pie বিনিয়োগ এমডি পার্টনার চার্ট টাকা',
      content: (
        <div className="space-y-4 text-slate-700 leading-relaxed text-xs">
          <p>
            কোম্পানিতে কোন MD বা পার্টনার মোট কত টাকা বিনিয়োগ করেছেন তা স্বচ্ছভাবে হিসাব রাখার জন্য <strong>Finance → Invest</strong> সেকশন তৈরি করা হয়েছে:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-2">
              <span className="font-extrabold text-emerald-950 text-sm flex items-center gap-1.5">
                <Landmark size={16} className="text-emerald-700" />
                প্রত্যেক MD-এর আলাদা কার্ড ও সম্মিলিত চার্ট
              </span>
              <ul className="space-y-1.5 text-[11px] text-slate-700 list-disc list-inside">
                <li>
                  <strong>ইনভেস্টর কার্ড:</strong> ৩ জন MD বা সকল বিনিয়োগকারীর প্রত্যেকের মোট টাকা (৳), মোট শেয়ারের শতাংশ (%) ও জমা সংখ্যা রঙিন কার্ডে দেখা যায়।
                </li>
                <li>
                  <strong>একটি সম্মিলিত তুলনামূলক চার্ট:</strong> সকল MD-এর বিনিয়োগ পাশাপাশি তুলনা করার জন্য রয়েছে একটি ইউনিক চার্ট—যেখান থেকে <em>Bar Chart</em> এবং <em>Share Pie</em> ভিউ টগল করা যায়।
                </li>
                <li>
                  <strong>কার্ড ফিল্টার:</strong> যেকোনো MD-এর কার্ডে ক্লিক করলে নিচের লেজারে শুধু তাঁর এন্ট্রিগুলো ফিল্টার হয়ে দেখাবে।
                </li>
              </ul>
            </div>

            <div className="p-4 bg-sky-50/60 border border-sky-200 rounded-2xl space-y-2">
              <span className="font-extrabold text-sky-950 text-sm flex items-center gap-1.5">
                <Info size={16} className="text-sky-700" />
                নতুন ইনভেস্টমেন্ট যোগ ও রিপোর্ট
              </span>
              <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-700">
                <li>উপরে থাকা <strong>+ Add Investment</strong> বাটনে (অথবা নির্দিষ্ট MD কার্ডের <strong>+</strong> বাটনে) ক্লিক করুন।</li>
                <li>Quick Pick চিপ থেকে MD-এর নাম সিলেক্ট করুন বা নতুন নাম লিখুন।</li>
                <li>টাকার পরিমাণ (৳), তারিখ, পেমেন্ট মেথড (Bank/Cash/Cheque) এবং উদ্দেশ্য লিখে সেভ করুন।</li>
                <li>উপরের <strong>PDF</strong> বা <strong>Excel</strong> বাটনে চাপ দিয়ে পূর্ণাঙ্গ ইনভেস্টমেন্ট স্টেটমেন্ট ডাউনলোড করুন।</li>
              </ol>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'stock',
      title: '৫. স্মার্ট স্টক ও সেগমেন্ট ইনভেন্টরি (Inventory → Stock)',
      icon: Package,
      badge: 'স্টক ও ইনভেন্টরি',
      badgeColor: 'bg-blue-100 text-blue-800',
      keywords: 'stock inventory segment kits electronics scissors pdf স্টক ইনভেন্টরি সেগমেন্ট',
      content: (
        <div className="space-y-4 text-slate-700 leading-relaxed text-xs">
          <p>
            <strong>Inventory → Stock</strong> সেকশনটি এখন আরও স্মার্ট ও কিউট কার্ড ডিজাইনে সাজানো হয়েছে, যাতে প্রথমেই আপনি বেছে নিতে পারেন কোন ক্যাটাগরির প্রোডাক্ট দেখতে চান:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-2xl space-y-2">
              <span className="font-extrabold text-blue-950 text-sm flex items-center gap-1.5">
                <Layers size={16} className="text-blue-700" />
                সেগমেন্ট পছন্দ ও নতুন সেগমেন্ট যোগ
              </span>
              <ul className="space-y-1.5 text-[11px] text-slate-700 list-disc list-inside">
                <li>
                  <strong>Choose What You Want to View:</strong> <em>All Stock Items</em>, <em>Kits</em>, <em>Electronics</em>, <em>Scissors</em> ইত্যাদি কার্ড থেকে যেটিতে ক্লিক করবেন, নিচে সেই সেগমেন্টের আইটেমগুলো দেখাবে।
                </li>
                <li>
                  <strong>Add New Segment:</strong> ড্যাশড বক্সে ক্লিক করে যেকোনো নতুন সেগমেন্ট যোগ করা যায়—সাথে সাথেই তা সেগমেন্ট তালিকায় যুক্ত হবে।
                </li>
                <li>
                  <strong>খালি সেগমেন্ট রিমুভ:</strong> কোনো সেগমেন্টে ০টি আইটেম থাকলে কার্ডের কোণায় থাকা <strong>×</strong> বাটনে বা <em>Remove Empty</em> বাটনে ক্লিক করে মুছে ফেলা যায়।
                </li>
              </ul>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <span className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-600" />
                স্টক ইন, রিস্টক ও PDF এক্সপোর্ট
              </span>
              <ul className="space-y-1.5 text-[11px] text-slate-700 list-disc list-inside">
                <li>নতুন প্রোডাক্ট যোগ করতে <strong>+ Add Stock Item</strong> এবং সংখ্যা বাড়াতে আইটেমের পাশে <strong>Restock</strong> বাটন ব্যবহার করুন।</li>
                <li>যে সেগমেন্ট সিলেক্ট করা থাকবে, <strong>PDF</strong> বা <strong>Excel</strong> বাটনে ক্লিক করলে ঠিক সেই সেগমেন্টের স্টক রিপোর্ট ডাউনলোড হবে।</li>
                <li><strong>কর্মচারীর স্টক রিকোয়েস্ট অনুমোদন:</strong> এমপ্লয়ি পোর্টাল থেকে কর্মচারীরা শুধু স্টকের সংখ্যা (দাম নয়) দেখে পিস রিকোয়েস্ট পাঠাতে পারেন; আপনি <em>Approve &amp; Deduct</em> করলে স্টক থেকে পিস স্বয়ংক্রিয়ভাবে কমে যাবে।</li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'assets',
      title: '৬. কোম্পানি অ্যাসেট ও স্বতন্ত্র মূল্য (Inventory → Company Assets)',
      icon: Building2,
      badge: 'কোম্পানি অ্যাসেট',
      badgeColor: 'bg-teal-100 text-teal-800',
      keywords: 'company assets price office furniture laptop equipment সম্পদ অ্যাসেট দাম',
      content: (
        <div className="space-y-3 text-slate-700 leading-relaxed text-xs">
          <p>
            <strong>Inventory → Company Assets</strong> সেকশনটি অফিসের নিজস্ব সম্পদ (যেমন: ল্যাপটপ, ফার্নিচার, ডেমো মেশিন, অফিস যন্ত্রপাতি) ও তাদের মূল্য সংরক্ষণের জন্য তৈরি।
          </p>
          <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl space-y-2">
            <span className="font-bold text-teal-950 flex items-center gap-1.5">
              <Info size={16} className="text-teal-700" />
              স্টক থেকে কোম্পানি অ্যাসেটের মূল পার্থক্য কী?
            </span>
            <ul className="space-y-1.5 text-[11px] text-slate-700 list-disc list-inside">
              <li>
                <strong>স্বতন্ত্র অ্যাসেট প্রাইস (Standalone Company Price):</strong> এখানে প্রতিটি অ্যাসেটের <em>কোম্পানির মূল্য</em> লেখা হয়, কিন্তু এটি কোনোভাবেই <strong>Financial Hishab</strong>-এর মাসিক খরচে (Expense) যোগ হয় না।
              </li>
              <li>
                <strong>সেগমেন্ট কার্ড ও এক্সপোর্ট:</strong> স্টকের মতোই সেগমেন্ট কার্ড থেকে অ্যাসেট বাছাই, নতুন সেগমেন্ট যোগ এবং PDF/Excel এক্সপোর্ট করা যায়।
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'drafts',
      title: '৭. ড্রাফট ও ফাইল বক্স — Drag & Drop, PDF ও Excel ভিউয়ার (Draft)',
      icon: FolderHeart,
      badge: 'ড্রাফট ও ফাইল ভিউয়ার',
      badgeColor: 'bg-violet-100 text-violet-800',
      keywords: 'draft file box drag drop upload pdf viewer excel csv preview ড্রাফট ফাইল পিডিএফ এক্সেল',
      content: (
        <div className="space-y-4 text-slate-700 leading-relaxed text-xs">
          <p>
            গুরুত্বপূর্ণ অফিসিয়াল নোট, চুক্তিপত্র, কোটেশন বা স্প্রেডশিট নিরাপদে জমা রাখার জন্য সাইডবারে রয়েছে <strong>Draft</strong> সেকশন।
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="p-4 bg-violet-50/60 border border-violet-200 rounded-2xl space-y-2">
              <span className="font-extrabold text-violet-950 text-sm flex items-center gap-1.5">
                <FolderHeart size={16} className="text-violet-700" />
                সহজ Drag &amp; Drop ও ড্রাফট কার্ড
              </span>
              <ul className="space-y-1.5 text-[11px] text-slate-700 list-disc list-inside">
                <li>
                  <strong>সরাসরি ফাইল ড্রপ:</strong> কম্পিউটার থেকে যেকোনো ফাইল (PDF, Excel, Word, ছবি) টেনে এনে উপরের ড্রপজোনে অথবা সরাসরি কোনো ড্রাফট কার্ডের ওপর ছাড়লেই সাথে সাথে আপলোড হয়ে যাবে।
                </li>
                <li>
                  <strong>New Draft ও Pin:</strong> শিরোনাম, নোট, ট্যাগ ও অ্যাটাচমেন্টসহ ড্রাফট বানিয়ে গুরুত্বপূর্ণগুলোকে <em>Pin</em> করে সবার উপরে রাখা যায়।
                </li>
              </ul>
            </div>

            <div className="p-4 bg-fuchsia-50/50 border border-fuchsia-200 rounded-2xl space-y-2">
              <span className="font-extrabold text-fuchsia-950 text-sm flex items-center gap-1.5">
                <FileSpreadsheet size={16} className="text-fuchsia-700" />
                বিল্ট-ইন PDF ও Excel ভিউয়ার
              </span>
              <ul className="space-y-1.5 text-[11px] text-slate-700 list-disc list-inside">
                <li>
                  <strong>PDF প্রিভিউ:</strong> ডাউনলোড না করেই ড্রাফটের ভেতরে থাকা যেকোনো PDF ফাইল সরাসরি পোর্টালে দেখা যায়; প্রয়োজনে <em>Open in Tab</em> বাটনে ক্লিক করে নতুন ট্যাবে বড় করে পড়া যায়।
                </li>
                <li>
                  <strong>ইন্টারঅ্যাক্টিভ Excel/CSV ভিউয়ার:</strong> <code>.xlsx</code>, <code>.xls</code> বা <code>.csv</code> ফাইলে ক্লিক করলে সব শিট-ট্যাব (Sheet Tabs) ও সার্চ সুবিধাসহ পোর্টালের ভেতরেই সম্পূর্ণ টেবিল দেখা যায়।
                </li>
                <li>
                  <strong>ছবি প্রিভিউ:</strong> ছবি বড়-ছোট (Zoom) ও ঘোরানো (Rotate) যায়।
                </li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'sales',
      title: '৮. ডাক্তার ও মেডিকেল সেন্টার সেলস লেজার (Finance → Doctor Sales)',
      icon: Stethoscope,
      badge: 'সেলস লেজার',
      badgeColor: 'bg-blue-100 text-blue-800',
      keywords: 'doctor sales ledger paid due equipment ডাক্তার সেলস বিক্রয় বকেয়া',
      content: (
        <div className="space-y-4 text-slate-700 leading-relaxed text-xs">
          <p>
            <strong>Finance → Doctor Sales</strong> অপশনে গেলে কোন মেডিকেল বা ডেন্টাল ইকুইপমেন্ট কোন ডাক্তার বা হাসপাতালে বিক্রি হয়েছে তার পূর্ণাঙ্গ লেজার পাওয়া যায়:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-600 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="bg-white p-2 rounded-lg border border-slate-200">✓ মেশিনের নাম ও মডেল</div>
            <div className="bg-white p-2 rounded-lg border border-slate-200">✓ ডাক্তার ও সেন্টারের নাম</div>
            <div className="bg-white p-2 rounded-lg border border-slate-200">✓ বিক্রয় মূল্য (৳ BDT)</div>
            <div className="bg-white p-2 rounded-lg border border-slate-200">✓ পরিশোধিত টাকা (Paid)</div>
            <div className="bg-white p-2 rounded-lg border border-slate-200">✓ বকেয়া টাকা (Due)</div>
            <div className="bg-white p-2 rounded-lg border border-slate-200">✓ ইন্সটলেশন ও ওয়ারেন্টি</div>
          </div>
        </div>
      ),
    },
    {
      id: 'excel',
      title: '৯. ইন-পোর্টাল এক্সেল স্টুডিও (Finance → Excel Studio)',
      icon: FileSpreadsheet,
      badge: 'এক্সেল স্টুডিও',
      badgeColor: 'bg-teal-100 text-teal-800',
      keywords: 'excel studio custom sheet columns download এক্সেল স্টুডিও কলাম',
      content: (
        <div className="space-y-3 text-slate-700 leading-relaxed text-xs">
          <p>
            <strong>Finance → Excel Studio</strong> ট্যাবে পোর্টালের ভেতরেই A, B, C কলাম ও স্বয়ংক্রিয় যোগফলসহ লাইভ স্প্রেডশিট তৈরি করা যায়:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px]">
            <div className="p-3.5 bg-white border border-slate-200 rounded-2xl space-y-1">
              <span className="font-bold text-slate-900 block">১. ডেটাসেট বাছাই</span>
              <p className="text-slate-600">ডাক্তার সেলস, TA/DA, হিসাব বা নোট যেটির শিট দরকার তা বেছে নিন।</p>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-2xl space-y-1">
              <span className="font-bold text-slate-900 block">২. কলাম কাস্টমাইজ</span>
              <p className="text-slate-600">চেকবক্স দিয়ে প্রয়োজনীয় কলাম রাখুন বা বাদ দিন।</p>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-2xl space-y-1">
              <span className="font-bold text-slate-900 block">৩. সেভ ও এক্সপোর্ট</span>
              <p className="text-slate-600">পোর্টালে প্রিসেট সেভ রাখুন অথবা <em>.xlsx</em> ডাউনলোড করুন।</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'reports_tada',
      title: '১০. কর্মচারীদের রিপোর্ট ও TA/DA (Employee → Daily Reports & TA/DA)',
      icon: Receipt,
      badge: 'কর্মচারী তদারকি',
      badgeColor: 'bg-amber-100 text-amber-800',
      keywords: 'employee daily reports tada claim remark কর্মচারী রিপোর্ট টিএ ডিএ ভাউচার',
      content: (
        <div className="space-y-3 text-slate-700 leading-relaxed text-xs">
          <p>
            সাইডবারের <strong>Employee</strong> মেনুতে ক্লিক করলে <strong>Daily Reports</strong> ও <strong>TA/DA</strong> অপশন পাওয়া যায়:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
              <span className="font-bold text-slate-900 block">দৈনিক কাজের রিপোর্ট ও রিমার্ক</span>
              <p className="text-slate-600">
                ফিল্ড ইঞ্জিনিয়ারের কাজের ছবি ও বিবরণ দেখে চেয়ারম্যান বা MD সরাসরি পরামর্শ বা <em>Flag Urgent</em> নির্দেশনা পাঠাতে পারেন।
              </p>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
              <span className="font-bold text-slate-900 block">TA/DA বিল অনুমোদন ও পেমেন্ট</span>
              <p className="text-slate-600">
                ভ্রমণ ভাউচার ও রসিদ দেখে TA/DA ক্লেইম <em>Approve</em> এবং পেমেন্ট স্ট্যাটাস <em>Paid</em> হিসেবে আপডেট করা যায়।
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'decisions_notes',
      title: '১১. ম্যানেজমেন্ট সিদ্ধান্ত ও নোটস (Management & Expenses/Notes)',
      icon: Crown,
      badge: 'সিদ্ধান্ত জারি',
      badgeColor: 'bg-purple-100 text-purple-800',
      keywords: 'management decision note pin deadline alert সিদ্ধান্ত নোট অ্যালার্ট',
      content: (
        <div className="space-y-3 text-slate-700 leading-relaxed text-xs">
          <ul className="space-y-2 list-disc list-inside bg-purple-50/50 p-3.5 rounded-2xl border border-purple-100 font-medium text-slate-800">
            <li>
              <strong>Management → Decisions:</strong> নতুন বোর্ড সিদ্ধান্ত তৈরি, নির্দিষ্ট ডিপার্টমেন্ট ও ডেডলাইন নির্ধারণ এবং কাজ শেষে <em>Mark Implemented</em> করা যায়।
            </li>
            <li>
              <strong>Management → Analytics &amp; Alerts:</strong> ডিপার্টমেন্ট ওয়াইজ পারফরম্যান্স ও না-জমা-পড়া রিপোর্টের অ্যালার্ট দেখা যায়।
            </li>
            <li>
              <strong>Finance → Expenses &amp; Notes:</strong> অফিসের খরচ, জরুরি নোটিশ বা সার্কুলার লিখে <em>Pin to Top</em> করে রাখা যায়।
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 'faq',
      title: '১২. সচরাচর জিজ্ঞাসিত প্রশ্ন ও সহজ সমাধান (FAQ)',
      icon: HelpCircle,
      badge: 'সহায়তা',
      badgeColor: 'bg-slate-200 text-slate-800',
      keywords: 'faq help mobile pdf excel data safe সাহায্য প্রশ্ন উত্তর',
      content: (
        <div className="space-y-3 text-slate-700 leading-relaxed text-xs">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block">প্রশ্ন: ড্রাফটে আপলোড করা PDF বা Excel দেখতে আলাদা সফটওয়্যার লাগবে কি?</span>
            <p className="text-[11px] text-slate-600">
              উত্তর: না। Draft বক্সে বিল্ট-ইন PDF ও Excel ভিউয়ার রয়েছে—ফাইলে ক্লিক করলেই সরাসরি ব্রাউজারের ভেতরেই প্রিভিউ দেখা যায়।
            </p>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block">প্রশ্ন: Company Assets-এ দাম লিখলে কি মাসিক খরচের হিসাব বেড়ে যাবে?</span>
            <p className="text-[11px] text-slate-600">
              উত্তর: না। Company Assets শুধু অফিসের সম্পদের স্বতন্ত্র মূল্য হিসাব রাখে; এটি Financial Hishab-এর মাসিক খরচে যোগ হয় না।
            </p>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block">প্রশ্ন: ফোন বা ট্যাব থেকে সব চার্ট ও রিপোর্ট ব্যবহার করা যাবে?</span>
            <p className="text-[11px] text-slate-600">
              উত্তর: হ্যাঁ, Invest চার্ট, Stock কার্ড, Draft ফাইল বক্স এবং সকল PDF/Excel এক্সপোর্ট মোবাইল, ট্যাব ও ডেস্কটপে শতভাগ রেসপন্সিভ।
            </p>
          </div>
        </div>
      ),
    },
  ];

  const filteredSections = sections.filter((sec) => {
    if (activeSection !== 'all' && sec.id !== activeSection) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      sec.title.toLowerCase().includes(q) ||
      sec.badge.toLowerCase().includes(q) ||
      sec.keywords.toLowerCase().includes(q)
    );
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
              <span className="text-slate-400 text-xs">· সংস্করণ ২.০ (আপডেটেড)</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <BookOpen className="text-amber-400" size={24} />
              <span>এক্সিকিউটিভ পোর্টাল ব্যবহার ম্যানুয়াল (User Guide)</span>
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              চেয়ারম্যান, ব্যবস্থাপনা পরিচালক (MD) ও ডিরেক্টর মহোদয়দের জন্য Invest, Stock, Company Assets, Draft (PDF/Excel Viewer) সহ প্রতিটি ফিচার সহজে ব্যবহারের পূর্ণাঙ্গ নির্দেশিকা।
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
              placeholder="বিষয় খুঁজুন (যেমন: Invest, Stock, Asset, Draft, PDF, বাজেট)..."
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
          সব অধ্যায় ({sections.length})
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
          Carelink Enterprise System v3.0
        </span>
      </div>
    </div>
  );
};

