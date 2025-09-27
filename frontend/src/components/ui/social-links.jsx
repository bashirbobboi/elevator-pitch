import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function SocialLinks({ socials, className = "", ...props }) {
  const [hoveredSocial, setHoveredSocial] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [clicked, setClicked] = useState(false);

  const animation = {
    scale: clicked ? [1, 1.3, 1] : 1,
    transition: { duration: 0.3 },
  };

  useEffect(() => {
    const handleClick = () => {
      setClicked(true);
      setTimeout(() => {
        setClicked(false);
      }, 200);
    };
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [clicked]);

  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-0 ${className}`}
      {...props}
    >
      {socials.map((social, index) => (
        <div
          className={`relative cursor-pointer px-2 sm:px-3 lg:px-5 py-1 sm:py-2 transition-opacity duration-200 ${
            hoveredSocial && hoveredSocial !== social.name
              ? "opacity-50"
              : "opacity-100"
          }`}
          key={index}
          onMouseEnter={() => {
            setHoveredSocial(social.name);
            setRotation(Math.random() * 20 - 10);
          }}
          onMouseLeave={() => setHoveredSocial(null)}
          onClick={() => {
            setClicked(true);
            if (social.href) {
              window.open(social.href, '_blank', 'noopener,noreferrer');
            }
          }}
        >
          <span className="block text-sm sm:text-base lg:text-lg font-medium text-gray-700 hover:text-gray-900">
            {social.name}
          </span>
          <AnimatePresence>
            {hoveredSocial === social.name && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 flex h-full w-full items-center justify-center"
                animate={animation}
              >
                <motion.img
                  key={social.name}
                  src={social.image}
                  alt={social.name}
                  className="w-10 h-10"
                  initial={{
                    y: -35,
                    rotate: rotation,
                    opacity: 0,
                    filter: "blur(2px)",
                  }}
                  animate={{ y: -45, opacity: 1, filter: "blur(0px)" }}
                  exit={{ y: -40, opacity: 0, filter: "blur(2px)" }}
                  transition={{ duration: 0.2 }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
