'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import PricingSection from '@/components/sections/PricingSection';

const SubscriptionPage = () => {
    return (
        <div className="min-h-screen bg-black text-white antialiased">
            <PricingSection className="pt-20" />
        </div>
    );
};

export default SubscriptionPage;
