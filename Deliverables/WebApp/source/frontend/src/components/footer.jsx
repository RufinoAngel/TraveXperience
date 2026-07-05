import React from 'react';

function Footer() {
  return (
    <footer className="bg-primary pt-12 pb-12">
      <div className="max-w-[1280px] mx-auto px-6 md:px-16">
        
        {/* Top Section */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-0 border-b border-solid border-white/10 pb-6 mb-6">
          <div className="max-w-xs">
            <div className="font-display-lg text-2xl text-on-primary font-bold mb-4 tracking-tighter">
              TraveXperience
            </div>
            <p className="text-white/60 font-sans text-sm leading-relaxed">
              Empowering explorers to discover the world through seamless, collaborative, and intelligent planning.
            </p>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
            <div className="flex flex-col gap-3">
              <span className="font-sans text-sm font-semibold tracking-wide text-secondary-container">Company</span>
              <a className="text-white/70 hover:text-white transition-colors text-xs font-medium" href="#about">About Us</a>
              <a className="text-white/70 hover:text-white transition-colors text-xs font-medium" href="#careers">Careers</a>
              <a className="text-white/70 hover:text-white transition-colors text-xs font-medium" href="#press">Press</a>
            </div>
            <div className="flex flex-col gap-3">
              <span className="font-sans text-sm font-semibold tracking-wide text-secondary-container">Product</span>
              <a className="text-white/70 hover:text-white transition-colors text-xs font-medium" href="#features">Features</a>
              <a className="text-white/70 hover:text-white transition-colors text-xs font-medium" href="#pricing">Pricing</a>
              <a className="text-white/70 hover:text-white transition-colors text-xs font-medium" href="#mobile">Mobile App</a>
            </div>
            <div className="flex flex-col gap-3">
              <span className="font-sans text-sm font-semibold tracking-wide text-secondary-container">Support</span>
              <a className="text-white/70 hover:text-white transition-colors text-xs font-medium" href="#help">Help Center</a>
              <a className="text-white/70 hover:text-white transition-colors text-xs font-medium" href="#privacy">Privacy Policy</a>
              <a className="text-white/70 hover:text-white transition-colors text-xs font-medium" href="#terms">Terms</a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-white/40 text-xs font-medium">
          <p>© {new Date().getFullYear()} TraveXperience. All rights reserved.</p>
          <div className="flex gap-6">
            <a className="hover:text-white transition-colors" href="#instagram">Instagram</a>
            <a className="hover:text-white transition-colors" href="#twitter">Twitter</a>
            <a className="hover:text-white transition-colors" href="#linkedin">LinkedIn</a>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;