'use client';
import React from 'react';

const FeatureMarquee = ({ className = '' }) => {
  // First row tags
  const firstRowTags = [
    'Seameless Changes',
    'Smart Spending',
    'Customizable Plans',
    'Smart Insights',
    'Gamified laddering',
  ];

  // Second row tags
  const secondRowTags = [
    'Automatic Adjustments',
    'Real-Time Reports',
    'AI Journal',
    'Smart AI Insights',
    'Growth With AI',
  ];

  return (
    <div className={`w-full ${className}`}>
      {/* First Row Marquee */}
      <div
        className="w-full overflow-hidden relative"
        style={{
          maskImage:
            'linear-gradient(to right, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 12.5%, rgb(0, 0, 0) 87.5%, rgba(0, 0, 0, 0) 100%)',
          WebkitMaskImage:
            'linear-gradient(to right, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 12.5%, rgb(0, 0, 0) 87.5%, rgba(0, 0, 0, 0) 100%)',
        }}
      >
        <div
          className="flex items-center gap-6 animate-scroll"
          style={{
            width: 'max-content',
            willChange: 'transform',
          }}
        >
          {/* First set of tags */}
          {firstRowTags.map((tag, index) => (
            <div
              key={`first-${index}`}
              className="flex-shrink-0 whitespace-nowrap"
              style={{
                listStyleType: 'none',
                boxSizing: 'border-box',
                WebkitFontSmoothing: 'inherit',
                alignContent: 'center',
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'column',
                flexWrap: 'nowrap',
                gap: '10px',
                height: 'min-content',
                justifyContent: 'center',
                overflow: 'hidden',
                padding: '12px 24px',
                position: 'relative',
                width: 'min-content',
                willChange: 'transform',
                background:
                  'radial-gradient(97% 115% at 13.2% 3.7%, rgb(18, 20, 38) 0%, rgb(0, 0, 0) 100%)',
                borderRadius: '228px',
                opacity: 1,
                fontSize: '16px',
                fontFamily: 'Inter, sans-serif',
                color: '#E6ECFFB3',
                fontWeight: '500',
              }}
            >
              {tag}
            </div>
          ))}

          {/* Duplicate set for seamless scrolling */}
          {firstRowTags.map((tag, index) => (
            <div
              key={`first-duplicate-${index}`}
              className="flex-shrink-0 whitespace-nowrap"
              style={{
                listStyleType: 'none',
                boxSizing: 'border-box',
                WebkitFontSmoothing: 'inherit',
                alignContent: 'center',
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'column',
                flexWrap: 'nowrap',
                gap: '10px',
                height: 'min-content',
                justifyContent: 'center',
                overflow: 'hidden',
                padding: '12px 24px',
                position: 'relative',
                width: 'min-content',
                willChange: 'transform',
                background:
                  'radial-gradient(97% 115% at 13.2% 3.7%, rgb(18, 20, 38) 0%, rgb(0, 0, 0) 100%)',
                borderRadius: '228px',
                opacity: 1,
                fontSize: '16px',
                fontFamily: 'Inter, sans-serif',
                color: '#E6ECFFB3',
                fontWeight: '500',
              }}
              aria-hidden="true"
            >
              {tag}
            </div>
          ))}
        </div>
      </div>

      {/* Second Row Marquee */}
      <div
        className="w-full overflow-hidden relative mt-8"
        style={{
          maskImage:
            'linear-gradient(to right, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 12.5%, rgb(0, 0, 0) 87.5%, rgba(0, 0, 0, 0) 100%)',
          WebkitMaskImage:
            'linear-gradient(to right, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 12.5%, rgb(0, 0, 0) 87.5%, rgba(0, 0, 0, 0) 100%)',
        }}
      >
        <div
          className="flex items-center gap-6 animate-scroll-reverse"
          style={{
            width: 'max-content',
            willChange: 'transform',
          }}
        >
          {/* First set of tags */}
          {secondRowTags.map((tag, index) => (
            <div
              key={`second-${index}`}
              className="flex-shrink-0 whitespace-nowrap"
              style={{
                listStyleType: 'none',
                boxSizing: 'border-box',
                WebkitFontSmoothing: 'inherit',
                alignContent: 'center',
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'column',
                flexWrap: 'nowrap',
                gap: '10px',
                height: 'min-content',
                justifyContent: 'center',
                overflow: 'hidden',
                padding: '12px 24px',
                position: 'relative',
                width: 'min-content',
                willChange: 'transform',
                background:
                  'radial-gradient(97% 115% at 13.2% 3.7%, rgb(18, 20, 38) 0%, rgb(0, 0, 0) 100%)',
                borderRadius: '228px',
                opacity: 1,
                fontSize: '16px',
                fontFamily: 'Inter, sans-serif',
                color: '#E6ECFFB3',
                fontWeight: '500',
              }}
            >
              {tag}
            </div>
          ))}

          {/* Duplicate set for seamless scrolling */}
          {secondRowTags.map((tag, index) => (
            <div
              key={`second-duplicate-${index}`}
              className="flex-shrink-0 whitespace-nowrap"
              style={{
                listStyleType: 'none',
                boxSizing: 'border-box',
                WebkitFontSmoothing: 'inherit',
                alignContent: 'center',
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'column',
                flexWrap: 'nowrap',
                gap: '10px',
                height: 'min-content',
                justifyContent: 'center',
                overflow: 'hidden',
                padding: '12px 24px',
                position: 'relative',
                width: 'min-content',
                willChange: 'transform',
                background:
                  'radial-gradient(97% 115% at 13.2% 3.7%, rgb(18, 20, 38) 0%, rgb(0, 0, 0) 100%)',
                borderRadius: '228px',
                opacity: 1,
                fontSize: '16px',
                fontFamily: 'Inter, sans-serif',
                color: '#E6ECFFB3',
                fontWeight: '500',
              }}
              aria-hidden="true"
            >
              {tag}
            </div>
          ))}
        </div>
      </div>

      {/* HR Separator with additional spacing */}
      <div className="mt-20 mb-8 flex justify-center">
        <hr className="w-full max-w-[800px] border-t border-gray-600 opacity-30" />
      </div>
    </div>
  );
};

export default FeatureMarquee;
