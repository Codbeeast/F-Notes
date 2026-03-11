'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import PricingSection from '@/components/sections/PricingSection';
import Footer from '@/components/sections/Footer';

const PricingPage = () => {
  return (
    <div className="min-h-screen bg-black text-white antialiased">
      {/* Navigation */}
      <Navbar />

      {/* Pricing Section with Cards */}
      <PricingSection className="pt-20" />

      {/* Footer */}
      <Footer />

    </div>
  );
};

export default PricingPage;