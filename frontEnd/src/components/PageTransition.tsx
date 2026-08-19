import React from 'react';
import { motion } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 15, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -15, scale: 0.99 }}
      transition={{
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1] // Quint ease-out for maximum smoothness
      }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
