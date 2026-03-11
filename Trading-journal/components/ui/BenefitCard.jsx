'use client';
import React from 'react';

const BenefitCard = ({ title, description, icon, className = '' }) => {
  return (
    <div className={`w-[375.34px] h-[294.8px] ${className}`}>
      {/* Outer container with blue radial gradient and hover effect */}
      <div
        className="w-full h-full rounded-[16px] relative transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 cursor-pointer group"
        style={{
          background:
            'radial-gradient(96% 96% at 48.8% -35.7%, rgb(138, 165, 255) 0%, rgb(0, 0, 0) 100%)',
          width: '100%',
          opacity: 1,
          borderRadius: '16px',
        }}
      >
        {/* Inner container with darker gradient */}
        <div
          className="w-full h-full flex flex-col justify-start items-start gap-[24px] p-[32px] rounded-[16px] relative transition-all duration-300 group-hover:bg-opacity-90"
          style={{
            background:
              'radial-gradient(96% 96% at 50% 7.5%, rgb(18, 20, 38) 0%, rgb(0, 0, 0) 100%)',
            borderRadius: '16px',
            opacity: 1,
          }}
        >
          {/* Icon Section */}
          <div className="flex justify-start items-start w-full h-[60.4px] z-[2] mt-[8px]">
            <div className="w-[58px] h-[60.4px] relative">
              {/* Icon container with blue border gradient */}
              <div className="relative z-[2] w-full h-full flex justify-center items-center p-[1.5px] rounded-[8px] overflow-hidden">
                <div
                  className="absolute inset-0 rounded-[8px] z-[1]"
                  style={{
                    background:
                      'linear-gradient(303deg, rgb(41, 52, 255) 0%, rgba(171, 171, 171, 0) 25%)',
                  }}
                />
                <div
                  className="absolute inset-0 rounded-[8px] z-[1]"
                  style={{
                    background:
                      'linear-gradient(140deg, rgb(41, 52, 255) -4%, rgba(0, 0, 0, 0) 25%)',
                  }}
                />
                <div className="w-[55px] h-[57.4px] bg-black rounded-[8px] flex justify-center items-center p-[10px] z-[2] relative">
                  <div className="w-[35px] h-[37.4px] flex justify-center items-center">
                    <svg
                      className="w-[35px] h-[35px] flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                      fill="rgb(138, 165, 255)"
                      viewBox="0 0 24 24"
                    >
                      {icon.paths.map((path, index) => (
                        <path key={index} d={path} />
                      ))}
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div
            className={`flex flex-col justify-start items-start gap-[16px] w-full h-[146.4px] z-[2] overflow-hidden`}
          >
            <div className="w-full flex flex-col justify-start">
              <h3
                className="text-[24px] font-medium leading-[32px] text-left text-white w-full overflow-hidden break-words transition-all duration-300 group-hover:text-blue-200"
                style={{
                  fontFamily: 'Inter, "Inter Placeholder", sans-serif',
                  letterSpacing: '-0.48px',
                }}
              >
                {title}
              </h3>
            </div>
            <div className={`w-full flex-1 flex flex-col justify-start`}>
              <p
                className="text-left w-full overflow-hidden break-words transition-all duration-300 group-hover:text-gray-200"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '16px',
                  lineHeight: '24px',
                  letterSpacing: '-0.32px',
                  color: 'rgba(230, 236, 255, 0.7)',
                }}
              >
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BenefitCard;
