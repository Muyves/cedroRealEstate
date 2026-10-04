import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Phone,
  Mail,
  Headphones,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Clock,
  User,
  ArrowRight
} from 'lucide-react';
import { IconWhatsapp, IconX, IconInstagram, IconFacebook, IconYoutube } from './SocialIcons';
import { useSettings } from '../../context/SettingsContext';
import translations from '../../context/translations';

export default function SupportWidget() {
  const { language } = useSettings();
  const t = translations[language] || translations.en;

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('whatsapp'); // 'whatsapp' | 'live'
  
  // WhatsApp message state
  const [customMsg, setCustomMsg] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('');

  // Live support chat state
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: language === 'rw' 
        ? 'Muraho! Murakaza neza kuri Gabirwa Real Estate Support. Twagufasha iki uyu munsi?'
        : 'Hello! Welcome to Gabirwa Real Estate Customer Support. How can we assist you with properties, land parcels, or listings today?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  // Quick preset options for WhatsApp
  const presets = [
    {
      label: language === 'rw' ? '🌳 Gushaka Ubutaka' : '🌳 Inquire about Land Parcels',
      text: language === 'rw' 
        ? 'Muraho Gabirwa! Nshaka kumenya amakuru arambuye ku butaka buhari.' 
        : 'Hello Gabirwa Real Estate! I would like to inquire about available land parcels.'
    },
    {
      label: language === 'rw' ? '🏢 Gusura Amazu' : '🏢 Schedule Building Tour',
      text: language === 'rw'
        ? 'Muraho! Nifuza gukora porogaramu yo gusura inzu natsindiye.'
        : 'Hello! I am interested in scheduling a property tour for modern buildings.'
    },
    {
      label: language === 'rw' ? '📝 Kwandikisha Imitungo' : '📝 Assistance Listing Property',
      text: language === 'rw'
        ? 'Muraho! Nshaka ubufasha mu kwandikisha n\'izindi serivisi z\'imitungo.'
        : 'Hello! I need help creating and managing a seller listing on your platform.'
    },
    {
      label: language === 'rw' ? '🔒 Amategeko & Escrow' : '🔒 Title & Escrow Support',
      text: language === 'rw'
        ? 'Muraho! Nshaka kumenya uburyo bwa Escrow n\'ibyemezo by\'ubutaka.'
        : 'Hello! I have questions regarding land title verification and Escrow payments.'
    }
  ];

  // Quick FAQ triggers for Live Chat
  const faqOptions = [
    {
      q: language === 'rw' ? 'Uburyo bwo kugura ubutaka?' : 'How do I buy land?',
      a: language === 'rw'
        ? 'Kugura ubutaka kuri Gabirwa ni ibintu byoroshye: 1. Shakisha icyiciro cya "Land Parcels". 2. Reba icyemezo n\'aho giherereye. 3. Kanda "Make Offer" cyangwa ubaze umucuruzi wemejwe.'
        : 'Buying land on Gabirwa is straightforward: 1. Browse "Land Parcels". 2. Review title status & location map. 3. Click "Make Offer" or contact the verified seller directly via WhatsApp/Phone.'
    },
    {
      q: language === 'rw' ? 'Escrow ikora ute?' : 'What is Escrow payment?',
      a: language === 'rw'
        ? 'Escrow yacu irinda amafaranga yawe kugeza igihe ibyemezo by\'ubutaka (Title Transfer) byose byemejwe n\'ubuyobozi.'
        : 'Our Escrow protection holds funds securely until land title transfer documents are verified and approved by legal officers.'
    },
    {
      q: language === 'rw' ? 'Kuvugana n\'Abakozi?' : 'Talk to Human Agent',
      a: language === 'rw'
        ? 'Aba ejenti bacu bahari 24/7! Urashobora kubahamagara kuri +256 700 000 000 cyangwa ukoresheje WhatsApp chatbox.'
        : 'Our agents are available 24/7! You can call +256 700 000 000 or tap the WhatsApp tab to chat directly.'
    }
  ];

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isTyping]);

  const handlePresetSelect = (presetText) => {
    setSelectedPreset(presetText);
    setCustomMsg(presetText);
  };

  const handleOpenWhatsapp = () => {
    const textToSend = customMsg.trim() || (language === 'rw' ? 'Muraho Gabirwa Real Estate!' : 'Hello Gabirwa Real Estate!');
    const url = `https://wa.me/256700000000?text=${encodeURIComponent(textToSend)}`;
    window.open(url, '_blank');
  };

  const handleSendLiveMessage = (textOverride) => {
    const text = textOverride || inputMessage.trim();
    if (!text) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!textOverride) setInputMessage('');
    setIsTyping(true);

    // Simulate AI / Support Agent reply
    setTimeout(() => {
      let botResponse = language === 'rw'
        ? 'Urakoze ku message yawe! Umukozi wacu wa serivisi arakugera kure mu minota mike. Urashobora no kuva mu majwi ukoresheje WhatsApp wetu.'
        : 'Thank you for your inquiry! Our customer support team has received your message. You can also connect with an agent instantly via WhatsApp or call +256 700 000 000.';

      // Check if matches FAQ
      const matchedFaq = faqOptions.find(f => f.q.toLowerCase() === text.toLowerCase());
      if (matchedFaq) {
        botResponse = matchedFaq.a;
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: botResponse,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end pointer-events-auto">
      {/* Floating Chat Modal Box */}
      {isOpen && (
        <div className="mb-4 w-[92vw] sm:w-[420px] max-h-[620px] h-[85vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1a2744] via-[#243050] to-slate-900 text-white p-4 flex flex-col gap-3 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/20 border border-yellow-400/40 flex items-center justify-center text-yellow-400 font-bold">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900 animate-pulse"></span>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                    Gabirwa Customer Care
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                      ONLINE
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-yellow-400" />
                    {language === 'rw' ? 'Subiza mu minota 1' : 'Typically replies in 1 min'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-900/60 rounded-xl border border-slate-700/50 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('whatsapp')}
                className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition ${
                  activeTab === 'whatsapp'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <IconWhatsapp className="w-4 h-4" />
                <span>WhatsApp Chatbox</span>
              </button>
              <button
                onClick={() => setActiveTab('live')}
                className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition ${
                  activeTab === 'live'
                    ? 'bg-yellow-500 text-slate-950 font-bold shadow'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Live Support</span>
              </button>
            </div>
          </div>

          {/* TAB CONTENT: WHATSAPP CHATBOX */}
          {activeTab === 'whatsapp' && (
            <div className="flex-1 flex flex-col justify-between bg-slate-50 dark:bg-slate-950/60 p-4 overflow-y-auto space-y-4">
              {/* WhatsApp Banner */}
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-3.5 flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <IconWhatsapp className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-950 dark:text-emerald-300">
                    {language === 'rw' ? 'Ikiganiro cyihuse kuri WhatsApp' : 'Direct Instant WhatsApp Inquiry'}
                  </h4>
                  <p className="text-[11px] text-emerald-800 dark:text-emerald-400 mt-0.5">
                    {language === 'rw'
                      ? 'Hitamo ubuhamya cyangwa wandike ubutumwa uhawe serivisi zihuse n\'umwubatsi wacu.'
                      : 'Select a quick inquiry template or type custom message to talk directly with our real estate specialists.'}
                  </p>
                </div>
              </div>

              {/* Quick Inquiry Options */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 block uppercase tracking-wider">
                  {language === 'rw' ? 'Hitamo amakuru ushaka:' : 'Select Inquiry Topic:'}
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {presets.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePresetSelect(preset.text)}
                      className={`text-left p-2.5 rounded-xl border text-xs font-medium transition flex items-center justify-between ${
                        selectedPreset === preset.text
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-200 font-semibold'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-emerald-400'
                      }`}
                    >
                      <span>{preset.label}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block uppercase tracking-wider">
                  {language === 'rw' ? 'Ubutumwa bwawe:' : 'Your Custom Message:'}
                </label>
                <textarea
                  rows="3"
                  value={customMsg}
                  onChange={(e) => setCustomMsg(e.target.value)}
                  placeholder={
                    language === 'rw'
                      ? 'Andika hano ibyo nshaka kubaza...'
                      : 'Type your custom question or property request here...'
                  }
                  className="w-full p-3 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition resize-none"
                />
              </div>

              {/* Start WhatsApp Chat CTA */}
              <button
                onClick={handleOpenWhatsapp}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
              >
                <IconWhatsapp className="w-5 h-5" />
                <span>{t.startWhatsapp || (language === 'rw' ? 'Tangira Ikiganiro kuri WhatsApp' : 'Start WhatsApp Chat')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}

          {/* TAB CONTENT: LIVE SUPPORT CHAT */}
          {activeTab === 'live' && (
            <div className="flex-1 flex flex-col justify-between bg-slate-50 dark:bg-slate-950/60 overflow-hidden">
              {/* Chat Thread */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1 px-1">
                      {msg.sender === 'bot' && <span className="font-semibold text-yellow-600 dark:text-yellow-400">Gabirwa Support</span>}
                      <span>{msg.time}</span>
                    </div>
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl leading-relaxed shadow-sm ${
                        msg.sender === 'user'
                          ? 'bg-[#1a2744] dark:bg-yellow-500 text-white dark:text-slate-950 rounded-br-none font-medium'
                          : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-2 text-slate-400 text-xs italic p-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 animate-ping"></div>
                    <span>{language === 'rw' ? 'Umubazi arimo kwandika...' : 'Support agent is typing...'}</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* FAQ Quick Chips */}
              <div className="px-3 py-2 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                <span className="text-[10px] font-bold uppercase text-slate-400 shrink-0">FAQ:</span>
                {faqOptions.map((faq, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendLiveMessage(faq.q)}
                    className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px] font-medium whitespace-nowrap hover:bg-yellow-50 dark:hover:bg-yellow-900/30 transition"
                  >
                    {faq.q}
                  </button>
                ))}
              </div>

              {/* Input Footer */}
              <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendLiveMessage()}
                  placeholder={language === 'rw' ? 'Andika ubutumwa bwawe...' : 'Type a message...'}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                <button
                  onClick={() => handleSendLiveMessage()}
                  className="p-2.5 rounded-xl bg-[#1a2744] dark:bg-yellow-500 text-white dark:text-slate-900 hover:opacity-90 transition shadow-sm"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Social Media Footer Bar inside widget */}
          <div className="bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 p-2.5 px-4 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              {language === 'rw' ? 'Tuvugishe kuri:' : 'Follow & Connect:'}
            </span>
            <div className="flex items-center gap-2">
              <a
                href="https://x.com/gabirwarealestate"
                target="_blank"
                rel="noreferrer"
                title="X (Twitter)"
                className="p-1.5 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white transition"
              >
                <IconX className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://instagram.com/gabirwarealestate"
                target="_blank"
                rel="noreferrer"
                title="Instagram"
                className="p-1.5 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-pink-600 transition"
              >
                <IconInstagram className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://facebook.com/gabirwarealestate"
                target="_blank"
                rel="noreferrer"
                title="Facebook"
                className="p-1.5 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-600 transition"
              >
                <IconFacebook className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://youtube.com/@gabirwarealestate"
                target="_blank"
                rel="noreferrer"
                title="YouTube"
                className="p-1.5 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-red-600 transition"
              >
                <IconYoutube className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://wa.me/256700000000"
                target="_blank"
                rel="noreferrer"
                title="WhatsApp"
                className="p-1.5 rounded-md bg-emerald-500 text-white hover:bg-emerald-600 transition"
              >
                <IconWhatsapp className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

        </div>
      )}

      {/* Main Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Customer Support and WhatsApp Chat"
        className="group relative flex items-center gap-2.5 px-4 py-3.5 rounded-full bg-gradient-to-r from-[#1a2744] via-emerald-600 to-emerald-700 text-white shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 border border-emerald-400/40"
      >
        <div className="relative flex items-center justify-center">
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <div className="flex items-center gap-1.5">
              <IconWhatsapp className="w-6 h-6 text-emerald-300 animate-bounce" />
              <Headphones className="w-5 h-5 text-yellow-400" />
            </div>
          )}
          {!isOpen && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-slate-900 animate-ping"></span>
          )}
        </div>

        <span className="font-bold text-xs sm:text-sm tracking-wide pr-1">
          {isOpen 
            ? (language === 'rw' ? 'Funga' : 'Close Support') 
            : (language === 'rw' ? 'Ubufasha & WhatsApp' : 'Customer Support & WhatsApp')}
        </span>

        {/* Pulse halo */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-emerald-500/20 animate-pulse pointer-events-none"></span>
        )}
      </button>
    </div>
  );
}
