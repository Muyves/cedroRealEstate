import React from 'react';

/**
 * High-quality SVG Social Icons for X (Twitter), Instagram, Facebook, YouTube, and WhatsApp
 */

export function IconX({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function IconInstagram({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export function IconFacebook({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
  );
}

export function IconYoutube({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export function IconWhatsapp({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 2.137.672 4.116 1.82 5.74L2.343 21.657a1 1 0 001.244 1.244l3.917-1.477A9.956 9.956 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm-1.07 4.935c.245-.008.49.006.726.11.238.106.892 1.492.983 1.678.09.185.12.368.01.536-.11.168-.222.316-.362.46-.14.144-.294.303-.127.587.168.284.743 1.22 1.597 1.98 1.096.974 2.019 1.277 2.304 1.42.284.144.45.122.618-.07.168-.19.727-.847.922-1.136.195-.29.39-.241.653-.144.263.097 1.673.788 1.96 1.03.287.243.344.417.344.64 0 .224-.05.992-.472 1.455-.422.463-1.054.673-1.748.673-.695 0-1.72-.187-3.08-.887-1.36-.7-2.905-2.072-3.957-3.488-1.052-1.417-1.474-2.73-1.572-3.376-.098-.646.04-1.282.355-1.68.315-.398.814-.54 1.096-.549z" />
    </svg>
  );
}

export function SocialMediaLinks({ variant = "default", className = "" }) {
  const links = [
    {
      name: "X (Twitter)",
      href: "https://x.com/gabirwarealestate",
      icon: IconX,
      color: "hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-black",
      badgeColor: "bg-slate-800 text-white"
    },
    {
      name: "Instagram",
      href: "https://instagram.com/gabirwarealestate",
      icon: IconInstagram,
      color: "hover:bg-gradient-to-tr hover:from-amber-500 hover:via-rose-500 hover:to-purple-600 hover:text-white",
      badgeColor: "bg-pink-600 text-white"
    },
    {
      name: "Facebook",
      href: "https://facebook.com/gabirwarealestate",
      icon: IconFacebook,
      color: "hover:bg-[#1877F2] hover:text-white",
      badgeColor: "bg-blue-600 text-white"
    },
    {
      name: "YouTube",
      href: "https://youtube.com/@gabirwarealestate",
      icon: IconYoutube,
      color: "hover:bg-[#FF0000] hover:text-white",
      badgeColor: "bg-red-600 text-white"
    },
    {
      name: "WhatsApp",
      href: "https://wa.me/250782024578",
      icon: IconWhatsapp,
      color: "hover:bg-[#25D366] hover:text-white",
      badgeColor: "bg-emerald-600 text-white"
    }
  ];

  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.name}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              title={item.name}
              className={`p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all transform hover:scale-110 shadow-sm ${item.color}`}
            >
              <Icon className="w-4 h-4" />
            </a>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {links.map((item) => {
        const Icon = item.icon;
        return (
          <a
            key={item.name}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            title={`Follow us on ${item.name}`}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all transform hover:-translate-y-0.5 hover:shadow-md ${item.color}`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{item.name}</span>
          </a>
        );
      })}
    </div>
  );
}
