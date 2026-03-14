'use client';
import React, { Suspense, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import SectionHeader from '@/components/common/SectionHeader';
import PricingCard from '@/components/ui/PricingCard';
import LightRays from '@/components/ui/LightRays';
import PaymentModal from '@/components/payment/PaymentModal';
import SpecialOfferCard from '@/components/subscription/SpecialOfferCard';

// Extract component that uses useSearchParams
function PricingSectionContent({ className = '' }) {
    const router = useRouter();
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [isTrialEligible, setIsTrialEligible] = useState(false);
    const [processingTrial, setProcessingTrial] = useState(false);
    const [showSpecialOffer, setShowSpecialOffer] = useState(false);
    const [processingSpecialOffer, setProcessingSpecialOffer] = useState(false);

    const { user, isLoaded, isSignedIn } = useUser();
    const searchParams = useSearchParams();

    // ... rest of component logic stays the same
    // (Keep all existing code from the original PricingSection component)
}

// Wrap with Suspense
export default function PricingSection(props) {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-white">Loading...</div></div>}>
            <PricingSectionContent {...props} />
        </Suspense>
    );
}
