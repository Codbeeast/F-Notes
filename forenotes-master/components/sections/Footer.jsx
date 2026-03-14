'use client';
import React from 'react';
import Image from 'next/image';

const Footer = ({ className = '' }) => {
    return (
        <footer id="footer" className={`FOOTER_C9IZl relative w-full ${className}`}>
            {/* Background pseudo-elements */}
            <div className="DIV_iMF90 relative flex flex-col items-center w-full">
                {/* Navigation Section */}
                <nav className="NAV_K22jb flex flex-row items-center justify-between w-full">
                    {/* Logo */}
                    <div className="DIV_foHhZ flex items-center justify-center flex-1 min-w-[160px]">
                        <a className="A_Nx9Bl block" href="./">
                            <div className="DIV_m0aBP relative">
                                <div className="DIV_ulzhA relative">
                                    <Image
                                        className="IMG_6ujQL w-auto h-auto"
                                        src="/logo.png"
                                        alt="Forenotes Logo"
                                        width={90}
                                        height={30}
                                        sizes="117.619px"
                                        priority
                                    />
                                </div>
                            </div>
                        </a>
                    </div>

                    {/* Separator Line */}
                    <div className="DIV_tBLdf w-[1px] h-[34px] bg-[#121426] mx-3"></div>

                    {/* Features Link */}
                    <div className="DIV_Az4mv flex-1 min-w-[120px] text-center">
                        <p className="P_lfFpG text-[16px] font-normal leading-[20px] text-[#e6ecffb2]">
                            <a
                                className="A_cyioy text-[#8aa5ff] hover:text-[#e6ecff] transition-colors"
                                href="./#features"
                            >
                                Features
                            </a>
                        </p>
                    </div>

                    {/* Separator Line */}
                    <div className="DIV_cgU9u w-[1px] h-[34px] bg-[#121426] mx-3"></div>

                    {/* Benefits Link */}
                    <div className="DIV_nX9Pm flex-1 min-w-[120px] text-center">
                        <p className="P_hWcZA text-[16px] font-normal leading-[20px] text-[#e6ecffb2]">
                            <a
                                className="A_sp5ih text-[#8aa5ff] hover:text-[#e6ecff] transition-colors"
                                href="./#benefits"
                            >
                                Benefits
                            </a>
                        </p>
                    </div>

                    {/* Separator Line */}
                    <div className="DIV_nv21n w-[1px] h-[34px] bg-[#121426] mx-3"></div>

                    {/* Contact Link */}
                    <div className="DIV_lngtt flex-1 min-w-[120px] text-center">
                        <p className="P_UlELF text-[16px] font-normal leading-[20px] text-[#e6ecffb2]">
                            <a
                                className="A_oWAKH text-[#8aa5ff] hover:text-[#e6ecff] transition-colors"
                                href="./contact"
                            >
                                Contact
                            </a>
                        </p>
                    </div>

                    {/* Separator Line */}
                    <div className="DIV_WqsbU w-[1px] h-[34px] bg-[#121426] mx-3"></div>

                    {/* Pricing Link */}
                    <div className="DIV_B9Rlv flex-1 min-w-[120px] text-center">
                        <p className="P_rw95U text-[16px] font-normal leading-[20px] text-[#e6ecffb2]">
                            <a
                                className="A_8HMGf text-[#8aa5ff] hover:text-[#e6ecff] transition-colors"
                                href="./#pricing"
                            >
                                Pricing
                            </a>
                        </p>
                    </div>

                    {/* Separator Line */}
                    <div className="DIV_k1OFV w-[1px] h-[34px] bg-[#121426] mx-3"></div>

                    {/* Email */}
                    <div className="DIV_2sGIL flex-1 min-w-[200px] text-center whitespace-nowrap">
                        <p className="P_hIqCh text-[16px] font-normal leading-[20px] text-[#e6ecffb2]">
                            <a
                                className="text-[#8aa5ff] hover:text-[#e6ecff] transition-colors cursor-pointer"
                                href="mailto:support@forenotes.com"
                            >
                                support@forenotes.com
                            </a>
                        </p>
                    </div>

                    {/* Separator Line */}
                    <div className="DIV_VqO93 w-[1px] h-[34px] bg-[#121426] mx-3"></div>
                </nav>

                {/* Social Media Section */}
                <div className="DIV_dDfVX flex flex-row gap-12 mt-8 w-full justify-between">
                    {/* Instagram */}
                    <div className="DIV_KwzI7 flex-1 text-center">
                        <a
                            className="A_rTKYR block relative group"
                            href="https://www.instagram.com/fore.notes/"
                            target="_blank"
                            rel="noopener"
                        >
                            <div className="DIV_oukKG w-full h-[2px] bg-[#121426] group-hover:bg-[#8aa5ff] transition-colors"></div>
                            <div className="DIV_hsDWv flex flex-row items-center justify-between w-full py-4">
                                <div className="DIV_6YgIg">
                                    <p className="P_nAvgb text-[16px] font-normal leading-[20px] text-[#e6ecffb2] group-hover:text-[#e6ecff] transition-colors">
                                        Instagram
                                    </p>
                                </div>
                                <div className="DIV_fe1On">
                                    <div className="DIV_aoGK2 w-6 h-6">
                                        <svg
                                            className="svg_paUEE w-6 h-6 text-[rgba(230,236,255,0.6)]"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 256 256"
                                            focusable="false"
                                        >
                                            <g className="g_KuacL">
                                                <path
                                                    className="path_wvAIN fill-current"
                                                    d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160ZM176,24H80A56.06,56.06,0,0,0,24,80v96a56.06,56.06,0,0,0,56,56h96a56.06,56.06,0,0,0,56-56V80A56.06,56.06,0,0,0,176,24Zm40,152a40,40,0,0,1-40,40H80a40,40,0,0,1-40-40V80A40,40,0,0,1,80,40h96a40,40,0,0,1,40,40ZM192,76a12,12,0,1,1-12-12A12,12,0,0,1,192,76Z"
                                                ></path>
                                            </g>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </a>
                    </div>

                    {/* Twitter/X */}
                    <div className="DIV_CHArq flex-1 text-center">
                        <a
                            className="A_IbDhr block relative group"
                            href="https://x.com/yourForenotes"
                            target="_blank"
                            rel="noopener"
                        >
                            <div className="DIV_L5lUw w-full h-[2px] bg-[#121426] group-hover:bg-[#8aa5ff] transition-colors"></div>
                            <div className="DIV_jxZYs flex flex-row items-center justify-between w-full py-4">
                                <div className="DIV_yIn5g">
                                    <p className="P_eZMQn text-[16px] font-normal leading-[20px] text-[#e6ecffb2] group-hover:text-[#e6ecff] transition-colors">
                                        Twitter/ X
                                    </p>
                                </div>
                                <div className="DIV_9SgVK">
                                    <div className="DIV_6vyuT w-6 h-6">
                                        <svg
                                            className="svg_YtcAk w-6 h-6 text-[rgba(230,236,255,0.6)]"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 256 256"
                                            focusable="false"
                                        >
                                            <g className="g_TVElb">
                                                <path
                                                    className="path_MRHgI fill-current"
                                                    d="M214.75,211.71l-62.6-98.38,61.77-67.95a8,8,0,0,0-11.84-10.76L143.24,99.34,102.75,35.71A8,8,0,0,0,96,32H48a8,8,0,0,0-6.75,12.3l62.6,98.37-61.77,68a8,8,0,1,0,11.84,10.76l58.84-64.72,40.49,63.63A8,8,0,0,0,160,224h48a8,8,0,0,0,6.75-12.29ZM164.39,208,62.57,48h29L193.43,208Z"
                                                ></path>
                                            </g>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </a>
                    </div>

                    {/* Discord */}
                    <div className="DIV_fppTw flex-1 text-center">
                        <a
                            className="A_Sw5is block relative group"
                            href="https://discord.gg/62rcZjQVYe"
                            target="_blank"
                            rel="noopener"
                        >
                            <div className="DIV_tvCfc w-full h-[2px] bg-[#121426] group-hover:bg-[#8aa5ff] transition-colors"></div>
                            <div className="DIV_wmImt flex flex-row items-center justify-between w-full py-4">
                                <div className="DIV_ukFTg">
                                    <p className="P_A5SjR text-[16px] font-normal leading-[20px] text-[#e6ecffb2] group-hover:text-[#e6ecff] transition-colors">
                                        Discord
                                    </p>
                                </div>
                                <div className="DIV_zZ6Yn">
                                    <div className="DIV_KLFdB w-6 h-6">
                                        <svg
                                            className="svg_aCHIp w-6 h-6 text-[rgba(230,236,255,0.6)]"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 256 256"
                                            focusable="false"
                                        >
                                            <g className="g_jaqmG">
                                                <path
                                                    className="path_RqTeQ fill-current"
                                                    d="M104,140a12,12,0,1,1-12-12A12,12,0,0,1,104,140Zm60-12a12,12,0,1,0,12,12A12,12,0,0,0,164,128Zm74.45,64.9-67,29.71a16.17,16.17,0,0,1-21.71-9.1l-8.11-22q-6.72.45-13.63.46t-13.63-.46l-8.11,22a16.18,16.18,0,0,1-21.71,9.1l-67-29.71a15.93,15.93,0,0,1-9.06-18.51L38,58A16.07,16.07,0,0,1,51,46.14l36.06-5.93a16.22,16.22,0,0,1,18.26,11.88l3.26,12.84Q118.11,64,128,64t19.4.93l3.26-12.84a16.21,16.21,0,0,1,18.26-11.88L205,46.14A16.07,16.07,0,0,1,218,58l29.53,116.38A15.93,15.93,0,0,1,238.45,192.9Z"
                                                ></path>
                                            </g>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </a>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="DIV_vZB3J flex flex-row justify-between items-center w-full mt-8">
                    <div className="DIV_aA1PF">
                        <p className="P_Gv6PV text-[16px] font-normal leading-[20px] text-[#e6ecffb2]">
                            © 2026 — Copyright
                        </p>
                    </div>
                    <div className="DIV_w2dbC"></div>
                </div>

                {/* Separator Line */}
                <div className="DIV_N4OYy w-full h-[2px] bg-[#121426] mt-8"></div>
            </div>

            {/* Custom CSS classes for specific styling */}
            <style dangerouslySetInnerHTML={{
                __html: `
        .FOOTER_C9IZl {
          background: linear-gradient(180deg, #000000 70%, #031457 100%);
          padding: 48px 0;
        }

        .FOOTER_C9IZl::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(180deg, #8aa5ff23 0%, #00000023 100%);
        }

        .FOOTER_C9IZl::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(180deg, #8aa5ff23 0%, #00000023 100%);
        }

        .DIV_iMF90 {
          max-width: 1204px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .NAV_K22jb {
          gap: 12px;
          flex-wrap: nowrap;
          justify-content: center;
        }

        .DIV_foHhZ {
          margin-right: 12px;
        }

        .A_Nx9Bl {
          display: block;
          transition: opacity 0.3s ease;
        }

        .A_Nx9Bl:hover {
          opacity: 0.8;
        }

        .DIV_m0aBP {
          max-width: 118px;
        }

        .IMG_6ujQL {
          max-width: 100%;
          height: auto;
        }

        .DIV_tBLdf,
        .DIV_cgU9u,
        .DIV_nv21n,
        .DIV_G3slM,
        .DIV_WqsbU,
        .DIV_k1OFV,
        .DIV_VqO93 {
          width: 1px;
          height: 34px;
          background: #2a2f4a; /* slightly brighter to be visible */
          margin: 0 12px;
          flex: 0 0 1px;
          align-self: stretch;
        }

        .DIV_Az4mv,
        .DIV_nX9Pm,
        .DIV_lngtt,
        .DIV_B9Rlv,
        .DIV_2sGIL {
          margin: 0 12px;
          margin-right: 6px;
        }

        .A_cyioy,
        .A_sp5ih,
        .A_oWAKH,
        .A_8HMGf {
          color: #8aa5ff;
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .A_cyioy:hover,
        .A_sp5ih:hover,
        .A_oWAKH:hover,
        .A_8HMGf:hover {
          color: #e6ecff;
        }

        .DIV_dDfVX {
          margin-top: 48px;
          gap: 48px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .DIV_KwzI7,
        .DIV_CHArq,
        .DIV_fppTw {
          min-width: 200px;
          flex: 1;
        }

        .DIV_oukKG,
        .DIV_L5lUw,
        .DIV_tvCfc {
          height: 2px;
          background: #121426;
          transition: background-color 0.3s ease;
        }

        .A_rTKYR:hover .DIV_oukKG,
        .A_IbDhr:hover .DIV_L5lUw,
        .A_Sw5is:hover .DIV_tvCfc {
          background: #8aa5ff;
        }

        .DIV_hsDWv,
        .DIV_jxZYs,
        .DIV_wmImt {
          padding: 16px 0;
          gap: 16px;
          justify-content: space-between;
          width: 100%;
        }

        .svg_paUEE,
        .svg_YtcAk,
        .svg_aCHIp {
          transition: color 0.3s ease;
        }

        .A_rTKYR:hover .svg_paUEE,
        .A_IbDhr:hover .svg_YtcAk,
        .A_Sw5is:hover .svg_aCHIp {
          color: #e6ecff;
        }

        .DIV_vZB3J {
          margin-top: 48px;
          padding-top: 24px;
        }

        .DIV_N4OYy {
          margin-top: 32px;
        }

        @media (max-width: 768px) {
          .NAV_K22jb {
            flex-direction: column;
            gap: 16px;
          }

          .DIV_dDfVX {
            flex-direction: column;
            gap: 24px;
          }

          .DIV_KwzI7,
          .DIV_CHArq,
          .DIV_fppTw {
            min-width: auto;
            width: 100%;
          }
        }
      ` }} />
        </footer>
    );
};

export default Footer;
