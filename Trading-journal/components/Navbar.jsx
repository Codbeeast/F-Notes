'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  UserButton,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
} from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { dark } from '@clerk/themes';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Features', href: '/#features' },     // stays as anchor
    { name: 'Pricing', href: '/pricing' },       // changed to route
    { name: 'Contact', href: '/contact' },       // changed to route
    { name: 'Discord', href: "https://discord.gg/62rcZjQVYe", target: "_blank" },       // changed to route
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-lg border-b border-white/10"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/forenotes.png"
              alt="Forenotes Logo"
              className="h-11 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                target={link.target}
                rel={link.target === '_blank' ? 'noopener noreferrer' : ''}
                className="text-gray-300 hover:text-white transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Auth Actions & Mobile Menu */}
          <div className="flex items-center gap-4">
            {/* Desktop Auth Actions */}
            <div className="hidden md:flex items-center gap-4">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="text-gray-300 hover:text-white transition-colors">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button
                    className="relative inline-flex items-center justify-center text-white transition-all duration-300 hover:brightness-110 transform hover:scale-105 cursor-pointer"
                    style={{
                      alignContent: 'center',
                      alignItems: 'center',
                      backgroundColor: 'rgb(41, 52, 255)',
                      height: '34px',
                      minWidth: '100px',
                      borderRadius: '10px',
                      boxShadow:
                        'rgba(16, 27, 255, 0.52) 0px 8px 40px 0px, rgba(255, 255, 255, 0.03) 0px 0px 10px 1px inset, rgba(0, 85, 255, 0.13) 0px 0px 0px 1.40127px',
                      display: 'flex',
                      justifyContent: 'center',
                      padding: '8px 12px',
                      textDecoration: 'none',
                      willChange: 'transform',
                      WebkitFontSmoothing: 'antialiased',
                      opacity: 1,
                      position: 'relative',
                      border: '1.6px solid rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    <span
                      className="text-white font-inter text-sm font-normal tracking-[-0.32px] whitespace-nowrap"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        color: 'rgb(255, 255, 255)',
                        WebkitFontSmoothing: 'antialiased',
                      }}
                    >
                      Sign Up
                    </span>
                  </button>
                </SignUpButton>
              </SignedOut>

              <SignedIn>
                <motion.div
                  whileHover={{
                    scale: 1.05,
                    brightness: 1.1,
                  }}
                >
                  <Link
                    href="/dashboard"
                    className="relative inline-flex items-center justify-center text-white transition-all duration-300 hover:brightness-110 cursor-pointer"
                    style={{
                      alignContent: 'center',
                      alignItems: 'center',
                      backgroundColor: 'rgb(41, 52, 255)',
                      height: '34px',
                      minWidth: '140px',
                      borderRadius: '10px',
                      boxShadow:
                        'rgba(16, 27, 255, 0.52) 0px 8px 40px 0px, rgba(255, 255, 255, 0.03) 0px 0px 10px 1px inset, rgba(0, 85, 255, 0.13) 0px 0px 0px 1.40127px',
                      display: 'flex',
                      justifyContent: 'center',
                      padding: '8px 12px',
                      textDecoration: 'none',
                      willChange: 'transform',
                      WebkitFontSmoothing: 'antialiased',
                      opacity: 1,
                      position: 'relative',
                      border: '1.6px solid rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    <span
                      className="text-white font-inter text-sm font-normal tracking-[-0.32px] whitespace-nowrap"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        color: 'rgb(255, 255, 255)',
                        WebkitFontSmoothing: 'antialiased',
                      }}
                    >
                      Dashboard
                    </span>
                  </Link>
                </motion.div>
              </SignedIn>
            </div>

            {/* Always visible Clerk UserButton */}
            <SignedIn>
              <UserButton
                afterSignOutUrl="/"
                userProfileMode="navigation"
                userProfileUrl="/profile"
                appearance={{
                  baseTheme: dark,
                  variables: {
                    colorPrimary: '#00ff88',
                    colorBackground: '#000000',
                    colorText: '#ffffff',
                    colorInputBackground: '#111111',
                    colorInputText: '#ffffff',
                  },
                }}
              />
            </SignedIn>

            {/* Mobile Hamburger Menu */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 text-gray-300 hover:text-white transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-lg border-b border-white/10"
          >
            <div className="container mx-auto px-4 py-6">
              {/* Mobile Navigation Links */}
              <nav className="flex flex-col space-y-4 mb-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    target={link.target}
                    rel={link.target === '_blank' ? 'noopener noreferrer' : ''}
                    className="text-gray-300 hover:text-white transition-colors py-2 border-b border-gray-700/50"
                    onClick={toggleMobileMenu}
                  >
                    {link.name}
                  </Link>
                ))}

                {/* Dashboard Link for Mobile (when signed in) */}
                <SignedIn>
                  <Link
                    href="/dashboard"
                    className="text-gray-300 hover:text-white transition-colors py-2 border-b border-gray-700/50"
                    onClick={toggleMobileMenu}
                  >
                    Dashboard
                  </Link>
                </SignedIn>
              </nav>

              {/* Mobile Auth Actions */}
              <div className="flex flex-col space-y-3">
                <SignedOut>
                  <SignInButton mode="modal">
                    <button
                      className="w-full text-left text-gray-300 hover:text-white transition-colors py-2"
                      onClick={toggleMobileMenu}
                    >
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button
                      className="w-full relative inline-flex items-center justify-center text-white transition-all duration-300 hover:brightness-110 transform hover:scale-105 cursor-pointer"
                      style={{
                        alignContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgb(41, 52, 255)',
                        height: '40px',
                        borderRadius: '10px',
                        boxShadow:
                          'rgba(16, 27, 255, 0.52) 0px 8px 40px 0px, rgba(255, 255, 255, 0.03) 0px 0px 10px 1px inset, rgba(0, 85, 255, 0.13) 0px 0px 0px 1.40127px',
                        display: 'flex',
                        justifyContent: 'center',
                        padding: '8px 12px',
                        textDecoration: 'none',
                        willChange: 'transform',
                        WebkitFontSmoothing: 'antialiased',
                        opacity: 1,
                        position: 'relative',
                        border: '1.6px solid rgba(255, 255, 255, 0.2)',
                      }}
                      onClick={toggleMobileMenu}
                    >
                      <span
                        className="text-white font-inter text-sm font-normal tracking-[-0.32px] whitespace-nowrap"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          color: 'rgb(255, 255, 255)',
                          WebkitFontSmoothing: 'antialiased',
                        }}
                      >
                        Sign Up
                      </span>
                    </button>
                  </SignUpButton>
                </SignedOut>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}