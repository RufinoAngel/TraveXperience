import React from 'react';

function Footer() {
  return (
    <footer className="bg-primary dark:bg-surface-container-lowest mt-12">
      <div className="flex flex-col md:flex-row justify-between items-center px-16 py-12 mx-auto max-w-[1280px]">
        <div className="mb-8 md:mb-0 text-center md:text-left">
          <div className="text-xl text-on-primary dark:text-on-surface font-bold mb-2">
            TraveXperience
          </div>
          <p className="text-xs text-on-primary/70 dark:text-on-surface/70">
            © 2026 TraveXperience. All rights reserved.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          <a className="text-on-primary/70 dark:text-on-surface/70 hover:text-secondary transition-colors text-xs" href="#">About Us</a>
          <a className="text-on-primary/70 dark:text-on-surface/70 hover:text-secondary transition-colors text-xs" href="#">Careers</a>
          <a className="text-on-primary/70 dark:text-on-surface/70 hover:text-secondary transition-colors text-xs" href="#">Privacy Policy</a>
          <a className="text-on-primary/70 dark:text-on-surface/70 hover:text-secondary transition-colors text-xs" href="#">Terms of Service</a>
          <a className="text-on-primary/70 dark:text-on-surface/70 hover:text-secondary transition-colors text-xs" href="#">Support</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;