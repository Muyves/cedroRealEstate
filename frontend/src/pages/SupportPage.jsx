import React, { useState } from 'react';
import {
  Headphones,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  Send,
  MessageCircle,
  CheckCircle,
  HelpCircle,
  ChevronDown,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { IconWhatsapp, IconX, IconInstagram, IconFacebook, IconYoutube, SocialMediaLinks } from '../components/common/SocialIcons';
import { useSettings } from '../context/SettingsContext';
import translations from '../context/translations';

export default function SupportPage() {
  const { language } = useSettings();
  const t = translations[language] || translations.en;

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    topic: 'General Inquiry',
    message: ''
  });

  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      q: language === 'rw' ? 'Ndekana gukora no kugura ubutaka kuri Gabirwa?' : 'How do I search and purchase land parcels on Gabirwa?',
      a: language === 'rw'
        ? 'Urashobora gukoresha urutonde rwacu rw\'ubutaka "Land Parcels". Buri butaka bufite amakuru arambuye ku cyemezo cy\'ubutaka (Title Deed), aho giherereye ku ikarita, no kuganira n\'umucuruzi wemejwe.'
        : 'Explore our "Land Parcels" directory. Every property listing contains verified title deed details, interactive location maps, exact land area (sqm), and direct inquiry options to contact verified sellers.'
    },
    {
      q: language === 'rw' ? 'Icyemezo cya Escrow gikora gute?' : 'How does the Escrow Title Transfer Guarantee work?',
      a: language === 'rw'
        ? 'Segurano yacu ya Escrow ibika amatsinda y\'abaguze mu buryo bwizewe kugeza ibyemezo n\'amasezerano yo kwimura ubutaka (Title Transfer) byemejwe n\'amategeko.'
        : 'Our Escrow protection ensures your funds are safely held in neutral trust until all title deed verification, government land registry approvals, and sales agreements are finalized.'
    },
    {
      q: language === 'rw' ? 'Vugana na Serivisi y\'Abakiriya kuri WhatsApp?' : 'Can I chat directly with Customer Support via WhatsApp?',
      a: language === 'rw'
        ? 'Yego! Urashobora gukanda ku bouton ya WhatsApp iri ku rubuga cyangwa ugahamagara +256 700 000 000 igihe cyose.'
        : 'Yes! You can launch the floating WhatsApp widget at the bottom right of the screen or message +256 700 000 000 anytime for instant responses.'
    },
    {
      q: language === 'rw' ? 'Nigute nshobora kwandikisha inzu cyangwa ubutaka bwanjye?' : 'How can I register as a seller and list my property?',
      a: language === 'rw'
        ? 'Injira mu konti yawe ya "Seller", hanyuma ukande "List Property". Uzuza amakuru y\'ubutaka cyangwa inzu yawe maze uyishyire ku isoko.'
        : 'Sign in to your account with the Seller role, navigate to "List Property", fill in the details (photos, acreage, location, title status), and submit for instant publishing.'
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setFormSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      
      {/* Header Banner */}
      <div className="max-w-5xl mx-auto text-center mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 text-xs font-bold uppercase tracking-wider mb-4 border border-yellow-300 dark:border-yellow-700/50">
          <Headphones className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
          <span>{language === 'rw' ? 'Ikigo cy\'Ubufasha 24/7' : '24/7 Customer Care & Support'}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
          {language === 'rw' ? 'Nigute Twagufasha Uyu Munsi?' : 'How Can We Assist You Today?'}
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          {language === 'rw'
            ? 'Tugufasha ku bibazo by\'imitungo, ubutaka, WhatsApp chat, n\'izindi serivisi z\'ubucuruzi.'
            : 'Whether you are inquiring about land parcels, escrow security, social channels, or seller listing assistance—our support team is ready.'}
        </p>
      </div>

      {/* 4 Main Contact Channels */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        
        {/* WhatsApp Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <IconWhatsapp className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">
              WhatsApp Chat
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              {language === 'rw' ? 'Tuvugishe kuri WhatsApp ku murongo utaziguye.' : 'Instant messaging support for quick property inquiries.'}
            </p>
          </div>
          <a
            href="https://wa.me/256700000000?text=Hello%20Gabirwa%20Real%20Estate%20Support"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
          >
            <IconWhatsapp className="w-4 h-4" />
            <span>+256 700 000 000</span>
          </a>
        </div>

        {/* Phone Call Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">
              {language === 'rw' ? 'Telefone z\'Ubufasha' : 'Phone Support'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              {language === 'rw' ? 'Hamagara abakozi bacu imbona nkubone.' : 'Speak directly with our real estate customer support desk.'}
            </p>
          </div>
          <a
            href="tel:+256700000000"
            className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#1a2744] dark:bg-slate-800 text-white font-bold text-xs hover:bg-[#243050] transition"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>{language === 'rw' ? 'Hamagara Nonaha' : 'Call Support'}</span>
          </a>
        </div>

        {/* Email Support Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">
              Email Support
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              {language === 'rw' ? 'Twandikire kuri imeyili yacu.' : 'Send detailed inquiries, title docs, or partnership requests.'}
            </p>
          </div>
          <a
            href="mailto:support@gabirwarealestate.com"
            className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>info@gabirwa.com</span>
          </a>
        </div>

        {/* Social Networks Hub Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">
              {language === 'rw' ? 'Imbere n\'Inyuma' : 'Social Networks'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              X (Twitter), Instagram, Facebook, & YouTube.
            </p>
          </div>
          <div className="flex items-center gap-1.5 justify-center pt-1">
            <a href="https://x.com/gabirwarealestate" target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-black hover:text-white transition" title="X (Twitter)">
              <IconX className="w-4 h-4" />
            </a>
            <a href="https://instagram.com/gabirwarealestate" target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-pink-600 hover:text-white transition" title="Instagram">
              <IconInstagram className="w-4 h-4" />
            </a>
            <a href="https://facebook.com/gabirwarealestate" target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white transition" title="Facebook">
              <IconFacebook className="w-4 h-4" />
            </a>
            <a href="https://youtube.com/@gabirwarealestate" target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-red-600 hover:text-white transition" title="YouTube">
              <IconYoutube className="w-4 h-4" />
            </a>
          </div>
        </div>

      </div>

      {/* Form & Social Network Highlights Section */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16">
        
        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-md">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <Send className="w-5 h-5 text-yellow-500" />
            <span>{language === 'rw' ? 'Oherereza Ubutumwa Serivisi y\'Abakiriya' : 'Send Direct Message to Support'}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6">
            {language === 'rw' ? 'Uzuza iyi fomu tuguhereze igisubizo vuba cyane.' : 'Fill out the form below and an assigned support executive will respond to you.'}
          </p>

          {formSubmitted ? (
            <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700/60 rounded-2xl p-6 text-center space-y-3">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-200">
                {language === 'rw' ? 'Ubutumwa bwawe bwoherejwe!' : 'Message Submitted Successfully!'}
              </h3>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 max-w-md mx-auto">
                {language === 'rw'
                  ? 'Urakoze kutuvugisha! Umukozi wacu aragusubiza mu masaha 24.'
                  : 'Thank you for reaching out. Our customer care representative will contact you shortly.'}
              </p>
              <button
                onClick={() => { setFormSubmitted(false); setFormData({ name: '', email: '', phone: '', topic: 'General Inquiry', message: '' }); }}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-500 transition"
              >
                {language === 'rw' ? 'Oherereza Ubutumwa Buhandi' : 'Send Another Message'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'rw' ? 'Amazina Yuzuye *' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'rw' ? 'Imeyili *' : 'Email Address *'}
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'rw' ? 'Telefone (Ibyahabwa)' : 'Phone Number'}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+256 700 000 000"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                    {language === 'rw' ? 'Igitekerezo / Serivisi' : 'Inquiry Topic'}
                  </label>
                  <select
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                  >
                    <option value="General Inquiry">General Property Inquiry</option>
                    <option value="Land Verification">Land Title Verification</option>
                    <option value="Escrow Support">Escrow Payment Security</option>
                    <option value="Seller Listing Help">Seller Listing Assistance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'rw' ? 'Ubutumwa BuraBura *' : 'Detailed Message *'}
                </label>
                <textarea
                  rows="4"
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder={language === 'rw' ? 'Andika ubutumwa bwawe hano...' : 'Please describe your request in detail...'}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-yellow-500 outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl bg-[#1a2744] dark:bg-yellow-500 text-white dark:text-slate-900 font-bold text-sm hover:bg-[#243050] dark:hover:bg-yellow-400 transition shadow-md flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{language === 'rw' ? 'Oherereza Ubutumwa' : 'Submit Support Inquiry'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Social Media Networks Info Panel */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-gradient-to-br from-[#1a2744] via-[#243050] to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700/50">
          <div>
            <h3 className="text-xl font-bold mb-3 flex items-center gap-2 text-yellow-400">
              <Sparkles className="w-5 h-5" />
              <span>{language === 'rw' ? 'Twumve Kuri Social Networks' : 'Connect On Social Networks'}</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
              {language === 'rw'
                ? 'Kurikira Gabirwa Real Estate kuri X (Twitter), Instagram, Facebook, no YouTube ku mitungo mizima n\'ibiciro.'
                : 'Follow our official channels on X (Twitter), Instagram, Facebook, and YouTube to catch real-time property drops, luxury estate video tours, and verified land opportunities.'}
            </p>

            <div className="space-y-4 mb-6">
              <a href="https://x.com/gabirwarealestate" target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition group">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-black text-white">
                    <IconX className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm group-hover:text-yellow-400 transition">X (Twitter)</h4>
                    <p className="text-[11px] text-slate-400">@gabirwarealestate</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </a>

              <a href="https://instagram.com/gabirwarealestate" target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition group">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white">
                    <IconInstagram className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm group-hover:text-pink-400 transition">Instagram</h4>
                    <p className="text-[11px] text-slate-400">@gabirwarealestate</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </a>

              <a href="https://facebook.com/gabirwarealestate" target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition group">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[#1877F2] text-white">
                    <IconFacebook className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm group-hover:text-blue-400 transition">Facebook</h4>
                    <p className="text-[11px] text-slate-400">Gabirwa Real Estate Official</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </a>

              <a href="https://youtube.com/@gabirwarealestate" target="_blank" rel="noreferrer" className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition group">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[#FF0000] text-white">
                    <IconYoutube className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm group-hover:text-red-400 transition">YouTube</h4>
                    <p className="text-[11px] text-slate-400">Gabirwa Real Estate TV</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-yellow-400" /> Verified Accounts
            </span>
            <span>Kampala • Kigali</span>
          </div>
        </div>

      </div>

      {/* FAQ Accordion Section */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-8 flex items-center justify-center gap-2">
          <HelpCircle className="w-6 h-6 text-yellow-500" />
          <span>{language === 'rw' ? 'Ibibazo Bikunze Kubazwa (FAQ)' : 'Frequently Asked Questions'}</span>
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-5 text-left font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180 text-yellow-500' : ''}`} />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/60 pt-3 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
