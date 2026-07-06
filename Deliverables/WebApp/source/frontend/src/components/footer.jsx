import React from 'react';

const footerLinks = [
  {
    heading: 'Company',
    links: [
      { label: 'About Us', href: '#about' },
      { label: 'Careers', href: '#careers' },
      { label: 'Press', href: '#press' },
      { label: 'Blog', href: '#blog' },
    ],
  },
  {
    heading: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Mobile App', href: '#mobile' },
      { label: 'Integrations', href: '#integrations' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { label: 'Help Center', href: '#help' },
      { label: 'Privacy Policy', href: '#privacy' },
      { label: 'Terms of Service', href: '#terms' },
      { label: 'Contact Us', href: '#contact' },
    ],
  },
];

const socials = [
  { label: 'Instagram', icon: 'photo_camera', href: '#instagram' },
  { label: 'Twitter / X', icon: 'alternate_email', href: '#twitter' },
  { label: 'LinkedIn', icon: 'work', href: '#linkedin' },
];

function Footer() {
  return (
    <footer className="bg-primary text-on-primary">
      {/* Top wave decoration */}
      <div className="w-full overflow-hidden leading-none">
        <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-10 -mb-px" style={{ display: 'block' }}>
          <path d="M0 40 C360 0 1080 0 1440 40 L1440 40 L0 40 Z" fill="var(--color-surface)" />
        </svg>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 md:px-16 pt-12 pb-8">

        {/* Top: Brand + Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-10 border-b border-white/10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 cursor-pointer selection:bg-transparent">
            <img 
              src="/src/assets/logo_transparente.png" 
              alt="TraveXperience" 
              className="h-12 w-12 object-contain"
            />
            <span className="font-display-lg text-2xl font-bold text-on-primary tracking-tighter">
              TraveXperience
            </span>
          </div>
            <p className="text-on-primary/50 text-sm leading-relaxed mb-6">
              Empowering explorers to discover the world through seamless, collaborative, and intelligent trip planning.
            </p>
            {/* Social icons */}
            <div className="flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-secondary-container hover:text-on-secondary-container flex items-center justify-center transition-all duration-200"
                >
                  <span className="material-symbols-outlined text-[16px]">{s.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {footerLinks.map((col) => (
            <div key={col.heading}>
              <span className="text-xs font-bold uppercase tracking-widest text-secondary-container mb-4 block">
                {col.heading}
              </span>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-on-primary/60 hover:text-on-primary text-sm transition-colors duration-150 font-medium"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom: copyright + newsletter */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8">
          <p className="text-on-primary/40 text-xs font-medium order-2 md:order-1">
            © {new Date().getFullYear()} TraveXperience. All rights reserved.
          </p>
          {/* Newsletter mini */}
          <div className="flex gap-2 w-full max-w-xs order-1 md:order-2">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-4 py-2 text-xs rounded-xl bg-white/10 border border-white/10 text-on-primary placeholder:text-on-primary/40 outline-none focus:border-secondary-container transition-colors"
            />
            <button className="bg-secondary-container text-on-secondary-container px-4 py-2 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;