'use client';
import React from 'react';
import Image from 'next/image';
import Button from '@/components/ui/Button';

const PricingCard = ({
  planName,
  price,
  originalPrice = null,
  period = '/ month',
  isPopular = false,
  features,
  buttonText = 'Get Started',
  buttonVariant = 'primary',
  onSelect = null,
  onTrialSelect = null,
  isTrialEligible = false,
  bonusMonths = 0,
  monthlyEquivalent = null,
  isOneTime = false,
  badgeText = null,
  className = '',
}) => {
  return (
    <div
      className={`pricing-card flex flex-col justify-start items-start w-full overflow-hidden rounded-[16px] min-h-[500px] lg:h-full transition-all duration-500 ${className}`}
      style={{
        padding: '24px',
        background: 'radial-gradient(96% 96% at 50% 7.5%, rgb(18, 20, 38) 0%, rgb(0, 0, 0) 100%)',
        borderRadius: '16px',
        border: isPopular ? '2px solid rgba(133, 77, 255, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: isPopular ? '0 0 20px rgba(133, 77, 255, 0.15)' : 'none'
      }}
    >
      {/* Top Section - Fixed height to align buttons */}
      <div className="flex flex-col gap-4 justify-start items-start w-full h-[130px] sm:h-[145px]">
        {/* Plan Header with Popular/Flexible Badge */}
        <div className="flex flex-row justify-between items-center w-full">
          <p className="text-base sm:text-lg font-inter font-medium text-white">{planName}</p>
          {isPopular && (
            <div className="flex flex-row justify-center items-center shadow-lg bg-[#854dff] rounded-lg px-2 sm:px-3 py-1">
              <p className="text-xs sm:text-sm font-inter font-medium text-center text-white">
                Popular
              </p>
            </div>
          )}
          {isOneTime && !isPopular && (
            <div className="flex flex-row justify-center items-center shadow-lg bg-blue-600/30 border border-blue-500/50 rounded-lg px-2 sm:px-3 py-1">
              <p className="text-[10px] sm:text-xs font-inter font-medium text-center text-blue-300 uppercase tracking-wider">
                Flexible
              </p>
            </div>
          )}
          {badgeText && !isPopular && !isOneTime && (
            <div className="flex flex-row justify-center items-center shadow-lg bg-blue-600/30 border border-blue-500/50 rounded-lg px-2 sm:px-3 py-1">
              <p className="text-[10px] sm:text-xs font-inter font-medium text-center text-blue-300 uppercase tracking-wider">
                {badgeText}
              </p>
            </div>
          )}
        </div>

        {/* Price Section */}
        <div className="flex flex-col justify-start items-start w-full gap-1">
          <div className="flex flex-row justify-start items-baseline w-full flex-wrap gap-2">
            {originalPrice && (
              <h4 className="text-lg sm:text-xl font-inter font-medium text-gray-500 line-through decoration-gray-500">
                {typeof originalPrice === 'string' ? originalPrice : `$${originalPrice}`}
              </h4>
            )}
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-inter font-bold text-white">
              {typeof price === 'string' ? price : `$${price}`}
            </h3>
            {period && typeof price === 'number' && (
              <p className="text-sm sm:text-base font-inter font-normal text-gray-400 ml-0">
                {period}
              </p>
            )}
          </div>

          {/* Info/Effective Price Line */}
          <div className="min-h-[28px] flex items-center">
            {monthlyEquivalent && (
              <p className="text-xs sm:text-sm font-inter font-normal text-blue-400">
                ${monthlyEquivalent}/month effective
              </p>
            )}
            {isOneTime && (
              <div className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 rounded-md py-1 px-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                <p className="text-[11px] sm:text-xs font-inter font-medium text-blue-300">
                  Get One Month Access for $7
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bonus Months/Promo Section */}
        {bonusMonths > 0 && (
          <div className="w-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-2 backdrop-blur-sm">
            <p className="text-xs font-semibold text-center text-green-300">
              {bonusMonths === 1 ? '+1 Month' : `+${bonusMonths} Months`} FREE Bonus
            </p>
          </div>
        )}
      </div>

      {/* Button Section - Now perfectly aligned */}
      <div className="w-full mb-6">
        <button
          onClick={onSelect}
          className="relative inline-flex items-center justify-center w-full rounded-lg py-3 px-4 transition-all duration-300 hover:brightness-110 transform hover:scale-[1.02] cursor-pointer font-medium text-sm sm:text-base"
          style={{
            backgroundColor: buttonVariant === 'primary' ? 'rgb(41, 52, 255)' : 'rgb(3, 20, 87)',
            minHeight: '48px',
            boxShadow:
              buttonVariant === 'primary'
                ? 'rgba(16, 27, 255, 0.52) 0px 8px 40px 0px, rgba(255, 255, 255, 0.03) 0px 0px 10px 1px inset'
                : 'rgba(0, 0, 0, 0.3) 0px 4px 20px 0px, rgba(255, 255, 255, 0.1) 0px 0px 5px 1px inset',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
          onMouseEnter={(e) => {
            if (buttonVariant === 'secondary') {
              e.currentTarget.style.backgroundColor = 'rgb(41, 52, 255)';
            }
          }}
          onMouseLeave={(e) => {
            if (buttonVariant === 'secondary') {
              e.currentTarget.style.backgroundColor = 'rgb(3, 20, 87)';
            }
          }}
        >
          <span className="text-white font-inter font-medium tracking-tight">{buttonText}</span>
        </button>
      </div>

      {/* Features Section */}
      <div className="flex flex-col gap-3 sm:gap-4 justify-start items-start w-full">
        <p className="text-sm sm:text-base font-inter font-normal text-gray-400">Includes:</p>
        {features.map((feature, index) => (
          <div key={index} className="flex flex-row justify-start items-start w-full gap-2">
            <Image
              src="/images/img_component_1_white_a700_22x22.svg"
              alt="Check"
              width={18}
              height={18}
              className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5"
            />
            <p className="text-sm sm:text-base font-inter font-normal text-gray-300 leading-relaxed">
              {feature.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PricingCard;
