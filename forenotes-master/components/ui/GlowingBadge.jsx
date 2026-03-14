'use client';
import React from 'react';

const GlowingBadge = ({ text, className = '' }) => {
    return (
        <div
            className={`relative flex items-center justify-start flex-shrink-0 overflow-hidden z-[2] ${className}`}
            style={{
                alignContent: 'center',
                alignItems: 'center',
                backdropFilter: 'blur(68px)',
                backgroundColor: 'rgb(0, 0, 0)',
                height: '41.6px',
                borderRadius: '26px',
                columnGap: '10px',
                display: 'flex',
                justifyContent: 'flex-start',
                minHeight: 'auto',
                minWidth: 'auto',
                overflowX: 'hidden',
                overflowY: 'hidden',
                padding: '8px 16px',
                rowGap: '10px',
                width: 'auto',
                WebkitFontSmoothing: 'antialiased',
                opacity: 1,
            }}
        >
            <div
                className="relative flex items-center justify-start flex-shrink-0"
                style={{
                    alignContent: 'center',
                    alignItems: 'center',
                    height: '25.6px',
                    columnGap: '4px',
                    display: 'flex',
                    justifyContent: 'flex-start',
                    minHeight: 'auto',
                    minWidth: 'auto',
                    rowGap: '4px',
                    width: 'auto',
                    WebkitFontSmoothing: 'antialiased',
                    opacity: 1,
                }}
            >
                <div
                    className="relative flex flex-col justify-start flex-shrink-0"
                    style={{
                        height: '25.6px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        minHeight: 'auto',
                        minWidth: 'auto',
                        textWrap: 'nowrap',
                        whiteSpaceCollapse: 'preserve',
                        width: 'auto',
                        WebkitFontSmoothing: 'antialiased',
                        outline: 'none',
                        transform: 'none',
                        opacity: 1,
                    }}
                >
                    <p
                        className="m-0"
                        style={{
                            fontFamily: 'Inter, "Inter Placeholder", sans-serif',
                            fontWeight: 600,
                            letterSpacing: '-0.32px',
                            lineHeight: '25.6px',
                            margin: 0,
                            textAlign: 'left',
                            textWrap: 'nowrap',
                            whiteSpaceCollapse: 'preserve',
                            WebkitFontSmoothing: 'antialiased',
                            height: '25.6px',
                            width: 'auto',
                        }}
                    >
                        <span
                            className="inline-block"
                            style={{
                                backgroundClip: 'text',
                                backgroundImage:
                                    'linear-gradient(105deg, rgb(163, 185, 255) 22.36939136402027%, rgb(103, 35, 250) 180%)',
                                display: 'inline-block',
                                fontFamily: 'Inter, "Inter Placeholder", sans-serif',
                                fontWeight: 600,
                                letterSpacing: '-0.32px',
                                lineHeight: '25.6px',
                                textAlign: 'left',
                                textWrap: 'nowrap',
                                whiteSpaceCollapse: 'preserve',
                                WebkitFontSmoothing: 'antialiased',
                                WebkitTextFillColor: 'rgba(0, 0, 0, 0)',
                                height: '25.6px',
                                width: 'auto',
                            }}
                        >
                            {text}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default GlowingBadge;