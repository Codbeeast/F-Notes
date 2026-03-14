'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw } from 'lucide-react';
import Image from 'next/image';

const Tutorial = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [progress, setProgress] = useState(0);

  // Tutorial steps data
  const tutorialSteps = [
    {
      id: 1,
      title: "Welcome to Your Trading Journal!",
      description: "Start your trading journey with our comprehensive journal system. Before adding a trade, we recommend creating a strategy first to track your performance effectively.",
      image: "/tutorial/tutorial_1.png"
    },
    {
      id: 2,
      title: "Navigate to Strategies",
      description: "Click the 'Strategy' button in the menu to go to your strategy page.",
      image: "/tutorial/tutorial_2.png"
    },
    {
      id: 3,
      title: "Create Your First Strategy",
      description: "Click the '+ New Strategy' button to open the form, and then fill in all the details for your new strategy.",
      image: "/tutorial/tutorial_3.png"
    },
    {
      id: 4,
      title: "Save Your Strategy",
      description: "Make sure you have filled out all the sections of the form, and then click 'Create Strategy' to save it.",
      image: "/tutorial/tutorial_4.png"
    },
    {
      id: 5,
      title: "Review Your Strategies",
      description: "Review your created strategies to understand which trading sessions (e.g., Asian, London, New York) are most profitable for you. Optimize your schedule based on your data.",
      image: "/tutorial/tutorial_5.png"
    },
    {
      id: 6,
      title: "Add Your First Trade",
      description: "Ready to log a trade? Click the '+ Add Trade' button to open the journal form and fill it out.",
      image: "/tutorial/tutorial_6.png"
    },
    {
      id: 7,
      title: "Complete the Parameters",
      description: "Note: Ensure all sections are filled. Click the brain icon to modify your psychology stats and hit 'Save Rating'. Your trade will be saved automatically.",
      image: "/tutorial/tutorial_7.png"
    },
    {
      id: 8,
      title: "You're All Set!",
      description: "You're ready to go! Start adding trades and let our advanced analytics help you become a better trader. You can edit trades within 24 hours to fix errors. Remember, consistency is key!",
      image: "/tutorial/tutorial_8.png"
    }
  ];

  // Auto-play functionality
  useEffect(() => {
    let interval;
    if (isAutoPlay && currentStep < tutorialSteps.length - 1) {
      interval = setInterval(() => {
        setCurrentStep(prev => prev + 1);
      }, 4000); // 4 seconds per slide
    }
    return () => clearInterval(interval);
  }, [isAutoPlay, currentStep, tutorialSteps.length]);

  // Progress calculation
  useEffect(() => {
    setProgress(((currentStep + 1) / tutorialSteps.length) * 100);
  }, [currentStep, tutorialSteps.length]);

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepIndex) => {
    setCurrentStep(stepIndex);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlay(!isAutoPlay);
  };

  const restart = () => {
    setCurrentStep(0);
    setIsAutoPlay(false);
  };

  const skipTutorial = () => {
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-3"
          >
            Trading Journal Tutorial
          </motion.h1>
          <motion.p
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-400 text-base"
          >
            Learn how to use your trading journal effectively
          </motion.p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">
              Step {currentStep + 1} of {tutorialSteps.length}
            </span>
            <span className="text-sm text-gray-400">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Main Tutorial Card */}
        <motion.div
          className="bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-gray-700/50 overflow-hidden shadow-2xl"
          layout
        >
          {/* Image Section */}
          <div className="relative h-80 bg-gray-900">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
              >
                <Image
                  src={tutorialSteps[currentStep].image}
                  alt={tutorialSteps[currentStep].title}
                  fill
                  className="object-contain p-4"
                  priority
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Content Section */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-xl font-bold text-white mb-3">
                  {tutorialSteps[currentStep].title}
                </h2>
                <p className="text-gray-300 text-base leading-relaxed mb-5">
                  {tutorialSteps[currentStep].description}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Controls */}
            <div className="flex items-center justify-between">
              {/* Left Controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg transition-colors"
                >
                  <ChevronLeft size={20} />
                  Previous
                </button>

                <button
                  onClick={toggleAutoPlay}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  {isAutoPlay ? <Pause size={20} /> : <Play size={20} />}
                  {isAutoPlay ? 'Pause' : 'Auto Play'}
                </button>

                <button
                  onClick={restart}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  <RotateCcw size={20} />
                  Restart
                </button>
              </div>

              {/* Right Controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={skipTutorial}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Skip Tutorial
                </button>

                {currentStep === tutorialSteps.length - 1 ? (
                  <button
                    onClick={skipTutorial}
                    className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg font-semibold transition-all transform hover:scale-105"
                  >
                    Get Started!
                  </button>
                ) : (
                  <button
                    onClick={nextStep}
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg font-semibold transition-all transform hover:scale-105"
                  >
                    Next
                    <ChevronRight size={20} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Step Indicators */}
        <div className="flex justify-center mt-8 gap-2">
          {tutorialSteps.map((_, index) => (
            <button
              key={index}
              onClick={() => goToStep(index)}
              className={`w-3 h-3 rounded-full transition-all ${index === currentStep
                  ? 'bg-blue-500 scale-125'
                  : index < currentStep
                    ? 'bg-green-500'
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Tutorial;
