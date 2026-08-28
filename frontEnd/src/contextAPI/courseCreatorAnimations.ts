export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const itemVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
};

export const stepVariants = {
  hidden: { opacity: 0, x: 50, filter: 'blur(10px)', scale: 0.95 },
  visible: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 20,
      mass: 1,
    },
  },
  exit: {
    opacity: 0,
    x: -50,
    filter: 'blur(10px)',
    scale: 0.95,
    transition: {
      duration: 0.4,
      ease: 'anticipate' as const,
    },
  },
};
