"use client";
import FAQItem from '../common/FAQItem';

const FAQSection = () => (
    <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl">
            {/* Header Section */}
            <div className="text-center mb-12">
                {/* Badge */}
                <div className="inline-flex items-center mb-6">
                    <div className="relative inline-block">
                        {/* Gradient Border */}
                        <div
                            className="absolute overflow-hidden rounded-[22px] opacity-100"
                            style={{
                                inset: '-1px -1px -1px -2px',
                                background:
                                    'linear-gradient(105deg, rgb(41, 52, 255) -8%, rgba(36, 65, 212, 0) 50%)',
                                zIndex: 1,
                            }}
                        ></div>
                        {/* Button Content */}
                        <div className="relative bg-black rounded-[22px] px-4 py-2" style={{ zIndex: 2 }}>
                            <span
                                className="inline-block font-semibold tracking-[-0.02em] leading-[1.6em]"
                                style={{
                                    fontFamily: 'Inter, "Inter Placeholder", sans-serif',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    backgroundImage:
                                        'linear-gradient(105deg, rgb(138, 165, 255) 22.36939136402027%, rgb(133, 77, 255) 180%)',
                                    backgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    color: 'transparent',
                                }}
                            >
                                FAQS
                            </span>
                        </div>
                    </div>
                </div>
                
                {/* Title */}
                <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
                    Some Common FAQ's
                </h2>
                
                {/* Description */}
                <p className="text-gray-400">
                    Get answers to your questions and learn about our platform
                </p>
            </div>

            {/* FAQ Items */}
            <div className="space-y-4">
                <FAQItem
                    question="What is Forenotes?"
                    answer="Discover the power of Artificial Intelligence in trading. Our platform uses smart algorithms and real-time data to give you deep, accurate insights. Make faster, smarter decisions, reduce risks, and boost your trading profits with the help of AI."
                    isOpenDefault={true}
                />
                <FAQItem
                    question="Can I access Forenotes on mobile?"
                    answer="Yes, Forenotes is fully optimized for both desktop and mobile, ensuring a seamless experience everywhere."
                />
                <FAQItem
                    question="Is Forenotes secure?"
                    answer="Yes, Forenotes uses top-tier encryption, multi-layer security, and solutions to keep your assets safe."
                />
                <FAQItem
                    question="Do I need to verify my identity?"
                    answer="Yes, for security and compliance, identity verification is required for certain transactions."
                />
                <FAQItem
                    question="How can I contact support?"
                    answer="Our support team is available 24/7. Reach out via chat or email for any assistance."
                />
            </div>
        </div>
    </section>
);

export default FAQSection;