'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const Header = ({ className = '' }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const menuItems = [
    { label: 'Benefits', href: '#benefits' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Contact', href: '#footer' },
    { label: 'Discord', href: 'https://discord.gg/62rcZjQVYe' },
  ];

  return (
    <header className={`w-full ${className}`}>
      <div className="w-full bg-gradient-to-b from-black to-transparent backdrop-blur-[8px] border-b border-white/5">
        <div className="max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between h-[60px] sm:h-[68px]">
            {/* Logo Section */}
            <div className="flex items-center gap-2 sm:gap-[10px]">
              <Link href="/#hero" className="flex items-center gap-1 sm:gap-[6px]">
                {/* Logo Icon */}
                <div className="w-[58px] h-[58px] sm:w-[78px] sm:h-[78px] flex items-center justify-center">
                  <Image
                    src="/logo.png"
                    alt="Forenotes Logo"
                    width={78}
                    height={78}
                    className="w-[58px] h-[58px] sm:w-[78px] sm:h-[78px] object-contain"
                  />
                </div>
              </Link>
              {/* Logo Text */}
              <div className="flex items-center">
                <span className="text-lg sm:text-xl lg:text-[26px] font-inter font-normal leading-tight text-[#fff5f5] whitespace-nowrap">
                  Forenotes
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center justify-center gap-2 lg:gap-4">
              {menuItems.map((item, index) => (
                <div key={index} className="px-2 lg:px-3 py-[6px]">
                  <div className="px-2 lg:px-3 py-[6px] cursor-pointer group" tabIndex={0}>
                    <Link
                      href={item.href}
                      className="text-sm lg:text-[16px] font-inter font-normal leading-tight lg:leading-[25.6px] text-[rgba(230,236,255,0.7)] hover:text-white transition-colors duration-200 whitespace-nowrap tracking-[-0.32px] select-none"
                    >
                      {item.label}
                    </Link>
                  </div>
                </div>
              ))}
            </nav>

            {/* Mobile menu button */}
            <button
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors duration-200"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-expanded={menuOpen}
              aria-label="Toggle navigation menu"
            >
              {menuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {menuOpen && (
            <div className="md:hidden border-t border-white/5">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {menuItems.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    className="block px-3 py-2 rounded-md text-base font-medium text-[rgba(230,236,255,0.7)] hover:text-white hover:bg-white/10 transition-colors duration-200"
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
