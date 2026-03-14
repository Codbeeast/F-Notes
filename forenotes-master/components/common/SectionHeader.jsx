'use client';
import React from 'react';

const SectionHeader = ({
  badge,
  title,
  description,
  maxWidth = 'lg',
  className = '',
}) => {
  const maxWidthClasses = {
    sm: 'max-w-[400px]',
    md: 'max-w-[500px]',
    lg: 'max-w-[600px]',
    xl: 'max-w-[800px]',
  };

  return (
    <div
      className={`flex flex-col justify-start items-center w-full ${maxWidthClasses[maxWidth]} ${className}`}
    >
      {/* Badge */}
      <div className="relative inline-block">
        {/* Gradient Border - matches the design system */}
        <div
          className="absolute overflow-hidden rounded-[22px] opacity-100"
          style={{
            inset: '-1px -1px -1px -2px',
            background: 'linear-gradient(105deg, rgb(41, 52, 255) -8%, rgba(36, 65, 212, 0) 50%)',
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
            {badge}
          </span>
        </div>
      </div>

      {/* Title */}
      <div className="flex flex-row justify-center items-center w-full px-[28px] sm:px-[56px] mt-[10px]">
        <h2 className="text-[22px] sm:text-[33px] md:text-[44px] font-inter font-medium leading-[27px] sm:leading-[41px] md:leading-[54px] text-center text-[#ffffff] w-auto">
          {title}
        </h2>
      </div>

      {/* Description */}
      {description && (
        <div className="flex flex-row justify-center items-center w-full">
          <p className="text-[16px] font-inter font-normal leading-[20px] text-center text-[#e6ecffb2] self-end w-auto max-w-[500px]">
            {description}
          </p>
        </div>
      )}
    </div>
  );
};

export default SectionHeader;
