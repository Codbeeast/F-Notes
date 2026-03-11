'use client';
import React from 'react';
import Image from 'next/image';

const TestimonialCard = ({
  quote,
  rating,
  user,
  className = '',
}) => {
  return (
    <div
      className={`rounded-[16px] transition-all duration-300 ease-in-out transform hover:scale-105 hover:-translate-y-2 group ${className}`}
      style={{
        background: 'radial-gradient(96% 96% at 16% 21.8%, rgb(18, 20, 38) 0%, rgb(0, 0, 0) 100%)',
        cursor: 'pointer',
        boxSizing: 'border-box',
        WebkitFontSmoothing: 'inherit',
        opacity: 1,
        boxShadow: '0 1px 35px #2934ff33',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 8px 50px #2934ff66, 0 0 30px #4A90E240';
        e.currentTarget.style.background =
          'radial-gradient(96% 96% at 16% 21.8%, rgb(25, 30, 55) 0%, rgb(8, 8, 15) 100%)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 35px #2934ff33';
        e.currentTarget.style.background =
          'radial-gradient(96% 96% at 16% 21.8%, rgb(18, 20, 38) 0%, rgb(0, 0, 0) 100%)';
      }}
    >
      <div
        className="flex flex-col w-full rounded-[16px]"
        style={{
          alignContent: 'center',
          alignItems: 'center',
          display: 'flex',
          flex: 'none',
          flexDirection: 'column',
          flexWrap: 'nowrap',
          gap: '32px',
          height: 'min-content',
          justifyContent: 'center',
          overflow: 'visible',
          padding: '32px',
          position: 'relative',
          width: '100%',
        }}
      >
        {/* Quote and Rating */}
        <div className="flex flex-col w-full" style={{ gap: '16px' }}>
          <div className="flex flex-row justify-start items-start w-full">
            <p
              className="w-full transition-colors duration-300 group-hover:text-blue-100"
              style={{
                fontSize: '16px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 'normal',
                lineHeight: '25px',
                textAlign: 'left',
                color: 'rgb(255, 255, 255)',
              }}
            >
              "{quote}"
            </p>
          </div>

          <div className="flex flex-row justify-start items-center w-full">
            <p
              className="mr-2"
              style={{
                fontSize: '15px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '600',
                lineHeight: '19px',
                textAlign: 'left',
                color: 'rgba(230, 236, 255, 0.7)',
              }}
            >
              {rating.toFixed(1)}
            </p>
            <div className="flex flex-row justify-start items-center">
              {[...Array(5)].map((_, index) => (
                <Image
                  key={index}
                  src={
                    index < Math.floor(rating)
                      ? '/images/img_component_1_yellow_a700.svg'
                      : '/images/img_component_1_white_a700_18x18.svg'
                  }
                  alt="Star"
                  width={18}
                  height={18}
                  className="w-[18px] h-[18px] transition-transform duration-200 group-hover:scale-110"
                />
              ))}
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="flex flex-row justify-start items-center w-full" style={{ gap: '12px' }}>
          <Image
            src={user.avatar}
            alt={user.name}
            width={40}
            height={40}
            className="w-[40px] h-[40px] rounded-[20px] flex-shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:ring-2 group-hover:ring-blue-400 group-hover:ring-opacity-50"
          />
          <div className="flex flex-col justify-start items-start flex-1">
            <p
              className="w-auto"
              style={{
                fontSize: '14px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '600',
                lineHeight: '17px',
                textAlign: 'left',
                color: 'rgb(255, 255, 255)',
                marginBottom: '2px',
              }}
            >
              {user.name}
            </p>
            <p
              className="w-auto"
              style={{
                fontSize: '14px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 'normal',
                lineHeight: '17px',
                textAlign: 'left',
                color: 'rgba(230, 236, 255, 0.6)',
              }}
            >
              {user.title}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;