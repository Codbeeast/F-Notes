"use client";
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQItem = ({ question, answer, isOpenDefault = false }) => {
    const [isOpen, setIsOpen] = useState(isOpenDefault);

    return (
        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                <h5 className="font-semibold text-lg">{question}</h5>
                <ChevronDown className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </div>
            {isOpen && (
                <p className="text-gray-400 mt-4 transition-all duration-300 ease-in-out">
                    {answer}
                </p>
            )}
        </div>
    );
};

export default FAQItem;