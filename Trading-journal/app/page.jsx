'use client';
import React from 'react';
import HeroSection from '@/components/sections/HeroSection';
import FeaturesSection from '@/components/sections/FeaturesSection';
import BenefitsSection from '@/components/sections/BenefitsSection';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import PricingSection from '@/components/sections/PricingSection';
import IntegrationSection from '@/components/sections/IntegrationSection';
import ComparisonSection from '@/components/sections/ComparisonSection';
import AIDrivenSection from '@/components/sections/AIDrivenSection';
import FAQSection from '@/components/sections/FAQSection';
import FinalCTASection from '@/components/sections/FinalCTASection';
import Footer from '@/components/sections/Footer';
import Navbar from '@/components/Navbar';

// Forces regeneration 2
export default function ForesightAIJournalLandingPage() {
  return (
    <div className="flex flex-col justify-start items-center w-full bg-[#000000] overflow-y-auto">
      {/* Background Stack Container */}
      <div className="relative w-full">
        {/* Header */}
        <Navbar />

        {/* Hero Section */}
        <HeroSection />

        {/* Features Section */}
        <FeaturesSection />

        {/* Benefits Section */}
        <BenefitsSection />

        {/* Testimonials Section */}
        <TestimonialsSection />

        {/* Pricing Section */}
        <PricingSection />

        {/* Integration Section */}
        <IntegrationSection />

        {/* Comparison Section */}
        <ComparisonSection />

        {/* AI-Driven Section */}
        <AIDrivenSection />

        {/* FAQ Section */}
        <FAQSection />

        {/* Final CTA Section */}
        <FinalCTASection />

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}