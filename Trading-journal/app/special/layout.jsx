// app/special/layout.jsx
import { notFound } from 'next/navigation';

export default function SpecialLayout({ children }) {
    // Check if promo feature is enabled via environment variable
    // This runs on the server, so process.env access is secure
    if (process.env.PROMO_ENABLED !== 'true') {
        notFound();
    }

    return (
        <div className="min-h-screen bg-black">
            {children}
        </div>
    );
}
