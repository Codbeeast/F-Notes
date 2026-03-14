'use client';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card1 from '../ui/Feature_Card/Card1';
import Card2 from '../ui/Feature_Card/Card2';
import Card3 from '../ui/Feature_Card/Card3';
import Card4 from '../ui/Feature_Card/Card4';
import LightRays from '@/components/ui/LightRays';
import { ChevronRight } from 'lucide-react';

const features = [
  {
    id: 0,
    title: 'Smart Notes Review',
    description: 'Turn notes into insights that prevent losses and boost performance',
    Component: Card1,
  },
  {
    id: 1,
    title: 'Visualize Your Journey',
    description: 'Monitor daily performance through a dynamic metrics dashboard to uncover successful strategies.',
    Component: Card2,
  },
  {
    id: 2,
    title: 'Data-Driven Insights',
    description: 'Turn every trade into a lesson. Decode your Psychometric history with insights that sharpen your edge.',
    Component: Card3,
  },
  {
    id: 3,
    title: 'Profitable Sessions',
    description: 'Focus your efforts where they count by identifying and capitalizing on your most profitable trading hours',
    Component: Card4,
  },
];

const FeaturesSection = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isAutoPlaying) {
      setProgress(0);
      const startTime = Date.now();
      const duration = 5000;

      // Update progress bar every 50ms
      progressIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min((elapsed / duration) * 100, 100);
        setProgress(newProgress);

        if (elapsed >= duration) {
          setActiveTab((prev) => (prev + 1) % features.length);
          clearInterval(progressIntervalRef.current);
          // The effect will re-run because activeTab changes, resetting the loop
        }
      }, 50);
    } else {
      setProgress(0);
    }

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [activeTab, isAutoPlaying]);

  const handleTabClick = (index) => {
    setActiveTab(index);
    setIsAutoPlaying(false);
  };

  const ActiveComponent = features[activeTab].Component;

  return (
    <section id="features" className={`relative w-full min-h-[800px] bg-[#000000] py-20 ${className}`}>
      {/* Light Rays Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        <LightRays
          raysOrigin="top-center"
          raysColor="#4A90E2"
          raysSpeed={1.0}
          lightSpread={1.7}
          rayLength={3.0}
          pulsating={false}
          fadeDistance={0.2}
          saturation={4.0}
          followMouse={false}
          mouseInfluence={0.15}
          noiseAmount={0.1}
          distortion={0.1}
          className="opacity-90"
        />
      </div>

      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        {/* Header */}
        <div className="flex flex-col items-center gap-6 mb-16 text-center">
          <div className="relative inline-block">
            <div
              className="absolute inset-0 rounded-full opacity-100"
              style={{
                margin: '-1px',
                background: 'linear-gradient(105deg, rgb(41, 52, 255) -8%, rgba(36, 65, 212, 0) 50%)',
                zIndex: 1,
              }}
            />
            <div className="relative bg-black rounded-full px-4 py-2 z-10 border border-white/10">
              <span
                className="inline-block font-semibold tracking-wide text-sm"
                style={{
                  backgroundImage: 'linear-gradient(105deg, rgb(138, 165, 255) 20%, rgb(133, 77, 255) 180%)',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                FEATURES
              </span>
            </div>
          </div>

          <div>
            <h2 className="text-4xl sm:text-[33px] md:text-[44px] font-inter font-bold leading-[27px] sm:leading-[41px] md:leading-[54px] text-center text-[#ffffff] w-auto  leading-tight bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
              Powerful Trading Analytics
            </h2>
            <p className="text-sm sm:text-base md:text-lg font-inter font-normal text-gray-400 leading-relaxed max-w-2xl mx-auto mt-4">
              Transform your trading with data-driven insights and advanced analytics designed to give you the edge.
            </p>
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="flex flex-col lg:flex-row w-full gap-8 lg:gap-12 items-stretch h-full min-h-[500px]">

          {/* Left Navigation (Desktop) / Top Navigation (Mobile) */}
          <div className="w-full lg:w-1/3 flex flex-col gap-4 relative">
            {features.map((feature, index) => (
              <button
                key={feature.id}
                onClick={() => handleTabClick(index)}
                className={`group relative flex flex-col items-start p-6 rounded-2xl transition-all duration-300 text-left border overflow-hidden ${activeTab === index
                    ? 'bg-white/5 border-indigo-500/50 shadow-[0_0_30px_-10px_rgba(79,70,229,0.3)]'
                    : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/10'
                  }`}
              >
                {/* Active Tab Background Progress/Fill Effect (Subtle Gradient) */}
                {activeTab === index && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                {/* Progress Bar Line for Autoplay */}
                {activeTab === index && isAutoPlaying && (
                  <div className="absolute bottom-0 left-0 h-[2px] bg-indigo-500 transition-all duration-75" style={{ width: `${progress}%` }} />
                )}

                <div className="relative z-10 w-full">
                  <div className="flex items-center justify-between w-full mb-2">
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${activeTab === index ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/5 text-gray-500'}`}>
                        0{index + 1}
                      </span>
                      <span className={`text-lg font-bold transition-colors ${activeTab === index ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                        {feature.title}
                      </span>
                    </div>
                    {activeTab === index && (
                      <motion.div
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                      >
                        <ChevronRight className="w-5 h-5 text-indigo-400" />
                      </motion.div>
                    )}
                  </div>
                  <p className={`text-sm transition-colors pl-11 ${activeTab === index ? 'text-gray-300' : 'text-gray-500 group-hover:text-gray-400'}`}>
                    {feature.description}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Right Display Area */}
          <div className="w-full lg:w-2/3 relative h-[500px] sm:h-[600px] lg:h-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  mass: 0.5
                }}
                className="w-full h-full"
              >
                <div className="w-full h-full relative p-1 group perspective-1000">
                  <div className="w-full h-full transition-all duration-500">
                    <ActiveComponent
                      title={features[activeTab].title}
                      description={features[activeTab].description}
                    />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;