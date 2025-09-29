'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

const containerVariants = {
  hidden: { 
    opacity: 0,
    y: 30
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.43, 0.13, 0.23, 0.96],
      delayChildren: 0.1,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { 
    opacity: 0,
    y: 20
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.43, 0.13, 0.23, 0.96]
    }
  }
};

const numberVariants = {
  hidden: (direction) => ({
    opacity: 0,
    x: direction * 40,
    y: 15,
    rotate: direction * 5
  }),
  visible: {
    opacity: 0.7,
    x: 0,
    y: 0,
    rotate: 0,
    transition: {
      duration: 0.8,
      ease: [0.43, 0.13, 0.23, 0.96]
    }
  }
};

const ghostVariants = {
  hidden: { 
    scale: 0.8,
    opacity: 0,
    y: 15,
    rotate: -5
  },
  visible: { 
    scale: 1,
    opacity: 1,
    y: 0,
    rotate: 0,
    transition: {
      duration: 0.6,
      ease: [0.43, 0.13, 0.23, 0.96]
    }
  },
  hover: {
    scale: 1.1,
    y: -10,
    rotate: [0, -5, 5, -5, 0],
    transition: {
      duration: 0.8,
      ease: "easeInOut",
      rotate: {
        duration: 2,
        ease: "linear",
        repeat: Infinity,
        repeatType: "reverse"
      }
    }
  },
  floating: {
    y: [-5, 5],
    transition: {
      y: {
        duration: 2,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "reverse"
      }
    }
  }
};

export function NotFound() {
  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <AnimatePresence mode="wait">
        <motion.div 
          className="text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <div className="flex items-center justify-center gap-4 md:gap-6 mb-8 md:mb-12">
            <motion.span 
              className="text-[80px] md:text-[120px] font-bold text-[#222222] opacity-70 select-none"
              variants={numberVariants}
              custom={-1}
            >
              4
            </motion.span>
            <motion.div
              variants={ghostVariants}
              whileHover="hover"
              animate={["visible", "floating"]}
              className="flex items-center justify-center"
            >
              {/* Ghost SVG since we can't use Next.js Image */}
              <svg 
                width="120" 
                height="120" 
                viewBox="0 0 120 120" 
                className="w-[80px] h-[80px] md:w-[120px] md:h-[120px] object-contain select-none"
                fill="none"
              >
                <path 
                  d="M60 20C40 20 24 36 24 56V90C24 94 26 97 29 98L35 100C37 101 39 99 39 97V90H45V97C45 99 47 101 49 100L55 98C58 97 60 94 60 90V56C60 36 44 20 24 20Z" 
                  fill="#f0f0f0" 
                  stroke="#ddd" 
                  strokeWidth="2"
                />
                <circle cx="45" cy="45" r="4" fill="#333" />
                <circle cx="75" cy="45" r="4" fill="#333" />
                <path d="M50 60 Q60 70 70 60" stroke="#333" strokeWidth="2" fill="none" />
              </svg>
            </motion.div>
            <motion.span 
              className="text-[80px] md:text-[120px] font-bold text-[#222222] opacity-70 select-none"
              variants={numberVariants}
              custom={1}
            >
              4
            </motion.span>
          </div>
          
          <motion.h1 
            className="text-3xl md:text-5xl font-bold text-[#222222] mb-4 md:mb-6 opacity-70 select-none"
            variants={itemVariants}
          >
            Boo! Page missing!
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl text-[#222222] mb-8 md:mb-12 opacity-50 select-none"
            variants={itemVariants}
          >
            Wait 60 Seconds and try refreshing the page just in case because sometimes the server goes to sleep.
          </motion.p>

          <motion.div 
            variants={itemVariants}
            whileHover={{ 
              scale: 1.05,
              transition: {
                duration: 0.3,
                ease: [0.43, 0.13, 0.23, 0.96]
              }
            }}
          >
            {/* <button 
              onClick={handleGoBack}
              className="inline-flex items-center gap-2 bg-[#222222] text-white px-8 py-3 rounded-full text-lg font-medium hover:bg-[#000000] transition-colors select-none"
            >
              <ArrowLeft size={20} />
              Go Back
            </button> */}
          </motion.div>

          <motion.div 
            className="mt-12"
            variants={itemVariants}
          >
            {/* <a
              href="/"
              className="text-[#222222] opacity-50 hover:opacity-70 transition-opacity underline select-none"
            >
              Return to Home
            </a> */}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
