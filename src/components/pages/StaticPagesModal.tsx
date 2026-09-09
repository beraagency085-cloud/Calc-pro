import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { SectionTranslatorBar } from '../common/SectionTranslatorBar';
import {
  X,
  ShieldCheck,
  Building,
  Mail,
  Lock,
  FileText,
  CheckCircle,
  Sparkles,
  MapPin,
  Clock,
  Phone,
  Send,
  AlertTriangle,
} from 'lucide-react';

export type StaticPageType = 'about' | 'contact' | 'privacy' | 'terms';

interface Props {
  pageType: StaticPageType | null;
  onClose: () => void;
}

export const StaticPagesModal: React.FC<Props> = ({ pageType, onClose }) => {
  const [activeTab, setActiveTab] = useState<StaticPageType>(pageType || 'about');
  const { t } = useLanguage();

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('General Inquiry');
  const [contactMessage, setContactMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Sync tab when prop opens
  React.useEffect(() => {
    if (pageType) {
      setActiveTab(pageType);
      setSubmitted(false);
    }
  }, [pageType]);

  if (!pageType) return null;

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) return;
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 z-10 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Tabs */}
        <div className="bg-[#1A1A1A] text-white p-4 sm:p-6 pb-0 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold italic shadow-xs">
                C
              </div>
              <div>
                <span className="text-xs uppercase tracking-widest text-slate-400 font-bold block">
                  CALCPRO TRUST & COMPLIANCE
                </span>
                <h3 className="text-lg font-bold tracking-tight text-white">
                  {activeTab === 'about' && t('about_us')}
                  {activeTab === 'contact' && t('contact_us')}
                  {activeTab === 'privacy' && t('privacy_policy')}
                  {activeTab === 'terms' && t('terms_disclaimer')}
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Pill Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 pt-1 border-t border-slate-800 scrollbar-none text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('about')}
              className={`px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider transition ${
                activeTab === 'about'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              About Us
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('contact')}
              className={`px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider transition ${
                activeTab === 'contact'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Contact Us
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('privacy')}
              className={`px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider transition ${
                activeTab === 'privacy'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('terms')}
              className={`px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider transition ${
                activeTab === 'terms'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Terms & Disclaimer
            </button>
          </div>
        </div>

        {/* Asian Language Translator Inside Modal */}
        <div className="px-6 pt-4 bg-slate-50 border-b border-slate-100">
          <SectionTranslatorBar compact />
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-slate-700 text-xs sm:text-sm leading-relaxed">
          {/* ABOUT US TAB */}
          {activeTab === 'about' && (
            <div className="space-y-6">
              <div className="bg-indigo-50/70 p-5 rounded-2xl border border-indigo-100 flex items-start gap-4">
                <ShieldCheck className="w-7 h-7 text-indigo-600 shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-indigo-950 text-sm mb-1">
                    Google E-E-A-T & YMYL কমপ্লায়েন্স নীতি
                  </h4>
                  <p className="text-indigo-900 text-xs leading-relaxed">
                    আর্থিক (Loan, Mortgage, SIP) এবং স্বাস্থ্য সংক্রান্ত (BMI, Calories) সিদ্ধান্ত মানুষের জীবনের জন্য অত্যন্ত স্পর্শকাতর (Your Money Your Life)। CalcPro আন্তর্জাতিক ব্যাংকিং মানদণ্ড এবং বিশ্ব স্বাস্থ্য সংস্থার (WHO) পরীক্ষিত বৈজ্ঞানিক সূত্র অনুসরণ করে নির্মিত।
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-900 mb-2">
                  আমাদের লক্ষ্য ও পরিচিতি (Mission & Identity)
                </h4>
                <p className="text-slate-600 mb-3">
                  CalcPro হলো একটি স্বাধীন, উচ্চ নির্ভুলতাসম্পন্ন আর্থিক ও বৈজ্ঞানিক কম্পিউটেশনাল ইঞ্জিন। আমাদের মূল লক্ষ্য হলো জটিল আর্থিক পরিকল্পনা এবং স্বাস্থ্য নির্দেশিকাগুলোকে স্বচ্ছ, বিজ্ঞাপনমুক্ত এবং সকলের জন্য ব্যবহারযোগ্য করে তোলা।
                </p>
                <p className="text-slate-600">
                  আমরা বিশ্বাস করি প্রতিটি ঋণগ্রহীতা এবং সাধারণ বিনিয়োগকারীর অধিকার রয়েছে ব্যাংকের জটিল হিসাবগুলো কোনো গোপনীয়তা ছাড়া নিজের স্ক্রিনেই পরিষ্কারভাবে যাচাই করার।
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <h5 className="font-bold text-slate-900 text-xs mb-1 uppercase tracking-wider">
                    ১. গাণিতিক নির্ভুলতা (Mathematical Rigor)
                  </h5>
                  <p className="text-xs text-slate-500">
                    আমাদের রিডিউসিং ব্যালেন্স অ্যামোর্টাইজেশন এবং অ্যানুইটি সূত্রগুলো চার্টার্ড অ্যাকচুয়ারি ও ফিন্যান্সিয়াল মডেলিং পেশাদারদের দ্বারা নিরীক্ষিত।
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <h5 className="font-bold text-slate-900 text-xs mb-1 uppercase tracking-wider">
                    ২. ১০০% ক্লায়েন্ট-সাইড প্রাইভেসি
                  </h5>
                  <p className="text-xs text-slate-500">
                    আপনার আয়ের অঙ্ক, লোনের পরিমাণ বা শারীরিক তথ্য কোনো রিমোট সার্ভারে পাঠানো হয় না। সকল হিসাব আপনার ডিভাইসেই সম্পন্ন হয়।
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4 text-xs text-slate-500">
                <p>
                  <strong>প্রতিষ্ঠাতা ও প্রযুক্তিগত উপদেষ্টা পরিষদ:</strong> CalcPro গ্লোবাল সিস্টেমস টিম — ফিনটেক ডেটা আর্কিটেক্ট ও বায়োস্ট্যাটিস্টিক্স গবেষকদের সমন্বয়ে পরিচালিত।
                </p>
              </div>
            </div>
          )}

          {/* CONTACT US TAB */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-base font-bold text-slate-900 mb-1">
                  আমাদের সাথে যোগাযোগ করুন (Contact Information)
                </h4>
                <p className="text-xs text-slate-500">
                  ক্যালকুলেটরের কোনো গাণিতিক সূত্র সংক্রান্ত প্রশ্ন, ব্যবসায়িক সহযোগিতা বা কারিগরি যেকোনো প্রয়োজনে আমাদের টিম সহায়তা করতে প্রস্তুত।
                </p>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center sm:text-left">
                  <Mail className="w-5 h-5 text-indigo-600 mb-2 mx-auto sm:mx-0" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    অফিসিয়াল ইমেইল
                  </span>
                  <a
                    href="mailto:support@calcpro.global"
                    className="text-xs font-bold text-indigo-600 hover:underline break-all"
                  >
                    support@calcpro.global
                  </a>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center sm:text-left">
                  <Clock className="w-5 h-5 text-emerald-600 mb-2 mx-auto sm:mx-0" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    সাপোর্ট রেসপন্স টাইম
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    ২৪ - ৪৮ ঘণ্টার মধ্যে উত্তর
                  </span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center sm:text-left">
                  <MapPin className="w-5 h-5 text-amber-600 mb-2 mx-auto sm:mx-0" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    হেডকোয়ার্টার
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    Tech Hub, Financial District
                  </span>
                </div>
              </div>

              {/* Form */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                {submitted ? (
                  <div className="text-center py-8 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <h5 className="font-bold text-slate-900 text-base">
                      আপনার বার্তাটি সফলভাবে গৃহীত হয়েছে!
                    </h5>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      ধন্যবাদ {contactName}। আমাদের কারিগরি দল দ্রুততম সময়ের মধ্যে আপনার ইমেইল ({contactEmail})-এ যোগাযোগ করবে।
                    </p>
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="text-xs font-bold text-indigo-600 hover:underline pt-2"
                    >
                      আরেকটি বার্তা পাঠান
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <h5 className="font-bold text-slate-900 text-sm">
                      সরাসরি বার্তা বা মতামত পাঠান
                    </h5>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                          আপনার নাম (Full Name) *
                        </label>
                        <input
                          type="text"
                          required
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder="Mohammad Karim"
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-indigo-600"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                          আপনার ইমেইল (Email Address) *
                        </label>
                        <input
                          type="email"
                          required
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="karim@example.com"
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-indigo-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        বিষয় (Subject)
                      </label>
                      <select
                        value={contactSubject}
                        onChange={(e) => setContactSubject(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-indigo-600"
                      >
                        <option>গাণিতিক সূত্র বা হিসাব সংক্রান্ত ফিডব্যাক</option>
                        <option>নতুন ক্যালকুলেটর সংযোজন করার অনুরোধ</option>
                        <option>বাগ বা টেকনিক্যাল ত্রুটির রিপোর্ট</option>
                        <option>ব্যবসায়িক বা মিডিয়া অনুসন্ধান</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        আপনার বার্তা বা প্রশ্ন (Your Message) *
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        placeholder="আপনার প্রশ্ন বা মতামত এখানে বিস্তারিত লিখুন..."
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-indigo-600"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className="btn-gloss btn-gloss-indigo py-2.5 px-5 rounded-xl text-xs font-bold inline-flex items-center gap-2"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>বার্তা পাঠান (Submit Message)</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* PRIVACY POLICY TAB */}
          {activeTab === 'privacy' && (
            <div className="space-y-5">
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-start gap-3">
                <Lock className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-emerald-950 text-xs sm:text-sm">
                    ১০০% ব্রাউজার ভিত্তিক লোকাল প্রাইভেসি গ্যারান্টি
                  </h4>
                  <p className="text-emerald-900 text-xs mt-0.5">
                    CalcPro আপনার কোনো ব্যক্তিগত আর্থিক পরিমাণ, লোনের সংখ্যা বা স্বাস্থ্য তথ্য কোনো দূরবর্তী সার্ভারে আপলোড করে না।
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">
                  ১. সংগৃহীত তথ্যের ধরন (Types of Data We Process)
                </h4>
                <p className="text-slate-600 text-xs">
                  আমরা কোনো লগইন, পাসওয়ার্ড বা সংবেদনশীল জাতীয় পরিচয়পত্র সংক্রান্ত তথ্য চাই না। আপনার ক্যালকুলেটর ইনপুট সম্পূর্ণভাবে আপনার ব্রাউজারের মেমোরিতে রিয়েল-টাইমে প্রসেস হয়।
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">
                  ২. লোকাল স্টোরেজ (LocalStorage) এর ব্যবহার
                </h4>
                <p className="text-slate-600 text-xs">
                  আপনি যখন হিস্ট্রি সেভ করেন, তখন সেই হিসাবটি আপনার নিজের ব্রাউজারের <code>localStorage</code>-এ সংরক্ষিত থাকে। আপনি যেকোনো সময় "সব মুছুন (Clear All)" বাটনে ক্লিক করে এক ক্লিকে তা স্থায়ীভাবে মুছে ফেলতে পারেন।
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">
                  ৩. কুকিজ ও থার্ড-পার্টি ট্র্যাকিং
                </h4>
                <p className="text-slate-600 text-xs">
                  আমরা কোনো আক্রমণাত্মক ট্র্যাকিং কুকি ব্যবহার করি না। কোনো তৃতীয় পক্ষের বিজ্ঞাপনদাতা বা ডেটা ব্রোকারের কাছে ব্যবহারকারীর ডেটা বিক্রি বা বিনিময় করা কঠোরভাবে নিষিদ্ধ।
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">
                  ৪. GDPR এবং CCPA অধিকার
                </h4>
                <p className="text-slate-600 text-xs">
                  ইউরোপীয় ইউনিয়নের GDPR এবং ক্যালিফোর্নিয়ার CCPA নির্দেশিকা অনুযায়ী আপনার ডেটার উপর সম্পূর্ণ নিয়ন্ত্রণ রয়েছে। কোনো তথ্যই আমাদের সেন্ট্রাল ডেটাবেজে স্থায়ীভাবে রক্ষিত হয় না।
                </p>
              </div>
            </div>
          )}

          {/* TERMS & DISCLAIMER TAB */}
          {activeTab === 'terms' && (
            <div className="space-y-5">
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-950 text-xs sm:text-sm">
                    গুরুত্বপূর্ণ আর্থিক ও চিকিৎসা সংক্রান্ত দাবিত্যাগ (YMYL Disclaimer)
                  </h4>
                  <p className="text-amber-900 text-xs mt-0.5">
                    CalcPro-র ফলাফল শুধুমাত্র শিক্ষামূলক ও প্রাথমিক আর্থিক বা স্বাস্থ্য পরিকল্পনার জন্য নির্দেশিত।
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">
                  ১. আর্থিক পরামর্শের বিকল্প নয় (Not Formal Financial Advice)
                </h4>
                <p className="text-slate-600 text-xs leading-relaxed">
                  আমাদের ক্যালকুলেটর আন্তর্জাতিকভাবে স্বীকৃত রিডিউসিং ব্যালেন্স এবং চক্রবৃদ্ধি সূত্র অনুযায়ী হিসাব করে। তবে বিভিন্ন ব্যাংক প্রসেসিং ফি, জিএসটি/ভ্যাট, কিংবা ক্রেডিট স্কোরের ওপর ভিত্তি করে অতিরিক্ত চার্জ ধার্য করতে পারে। যেকোনো আইনি লোন চুক্তিতে স্বাক্ষরের পূর্বে সংশ্লিষ্ট ব্যাংকের আনুষ্ঠানিক অফার লেটার যাচাই করুন।
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">
                  ২. মিউচুয়াল ফান্ড ও বিনিয়োগ ঝুঁকি
                </h4>
                <p className="text-slate-600 text-xs leading-relaxed">
                  মিউচুয়াল ফান্ড ও শেয়ার বাজার মূলধন ঝুঁকির অধীন। এসআইপি ক্যালকুলেটরে প্রদর্শিত রিটার্ন ঐতিহাসিক গড়ের ওপর ভিত্তি করে অনুমিত, এটি কোনো নিশ্চিত আয়ের প্রতিশ্রুতি নয়।
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">
                  ৩. চিকিৎসাগত দিকনির্দেশনা (Medical Disclaimer)
                </h4>
                <p className="text-slate-600 text-xs leading-relaxed">
                  BMI এবং ক্যালোরি ক্যালকুলেটর সাধারণ স্বাস্থ্যকর সীমার নির্দেশনা দেয়। তবে গুরুতর শারীরিক অসুস্থতা, গর্ভাবস্থা বা পেশাদার ক্রীড়াবিদদের ক্ষেত্রে বিশেষজ্ঞ চিকিৎসকের পরামর্শ চূড়ান্ত বলে গণ্য হবে।
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">
            সর্বশেষ পরিমার্জন: সেপ্টেম্বর ২০২৬ | CalcPro Compliance
          </span>
          <button
            type="button"
            onClick={onClose}
            className="btn-gloss btn-gloss-dark px-4 py-2 rounded-lg font-bold"
          >
            বন্ধ করুন (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
