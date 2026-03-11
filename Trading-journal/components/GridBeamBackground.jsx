// File: GridBeamBackground.jsx

import React, { useEffect } from 'react';
import { motion, useMotionValue } from 'framer-motion';

const GridBeamBackground = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <>
      <style jsx global>{`
        .backgroundContainer {
          position: fixed;
          inset: 0;
          z-index: -1;
          background-color: #020616;
          overflow: hidden;
        }
        .background-layer {
          position: absolute;
          inset: -20%;
          pointer-events: none;
        }
      `}</style>

      <div className="backgroundContainer">
        {/* Layer 1: Subtle drifting grid */}
        <motion.div
          className="background-layer"
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                to bottom,
                rgba(30, 41, 59, 0.12) 0px,
                rgba(30, 41, 59, 0.12) 1px,
                transparent 1px,
                transparent 60px
              ),
              repeating-linear-gradient(
                to right,
                rgba(30, 41, 59, 0.12) 0px,
                rgba(30, 41, 59, 0.12) 1px,
                transparent 1px,
                transparent 60px
              )
            `,
          }}
          animate={{ x: -50, y: -50 }}
          transition={{
            duration: 80,
            repeat: Infinity,
            repeatType: 'mirror',
            ease: 'linear',
          }}
        />

        {/* Layer 2: Left‑side origin beams */}
        <motion.div
          className="background-layer"
          style={{
            backgroundImage: `
              /* Core bright band */
              linear-gradient(
                90deg,
                rgba(59, 130, 246, 0.5) 0%,
                rgba(59, 130, 246, 0.25) 15%,
                transparent 45%
              ),
              /* Softer secondary */
              linear-gradient(
                90deg,
                rgba(96, 165, 250, 0.3) 5%,
                rgba(96, 165, 250, 0.1) 25%,
                transparent 50%
              ),
              /* Ambient feather */
              linear-gradient(
                90deg,
                rgba(59, 130, 246, 0.08) 0%,
                transparent 40%
              )
            `,
            backgroundPosition: 'left center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '150% 150%',
            mixBlendMode: 'screen',
            opacity: 0.55,
            filter: 'blur(3px)',
          }}
          animate={{
            x: [0, 25, 0],
            y: [0, 25, 0],
          }}
          transition={{
            duration: 110,
            repeat: Infinity,
            repeatType: 'mirror',
            ease: 'easeInOut',
          }}
        />

        {/* Layer 3: Optional mouse-follow glow */}
        <motion.div
          className="background-layer"
          style={{
            x: mouseX,
            y: mouseY,
            top: '-200px',
            left: '-200px',
            width: '400px',
            height: '400px',
            backgroundImage:
              'radial-gradient(circle at center, rgba(59, 130, 246, 0.04), transparent 70%)',
          }}
        />
      </div>
    </>
  );
};

export default GridBeamBackground;