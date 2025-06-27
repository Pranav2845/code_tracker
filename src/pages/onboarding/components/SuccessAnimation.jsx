// File: src/pages/onboarding/components/SuccessAnimation.jsx
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import Icon from "../../../components/AppIcon";

const SuccessAnimation = () => {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 260, 
          damping: 20,
          delay: 0.2 
        }}
        className="w-24 h-24 rounded-full bg-success bg-opacity-20 flex items-center justify-center mb-6"
      >
        <motion.div
          initial={{ opacity: 0, pathLength: 0 }}
          animate={{ opacity: 1, pathLength: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <Icon name="CheckCircle" className="text-success" size={48} />
        </motion.div>
      </motion.div>
      
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="text-2xl font-bold text-text-primary mb-2 text-center"
      >
        Setup Complete!
      </motion.h2>
      
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="text-text-secondary text-center mb-8 max-w-xs"
      >
        Your Code Tracker account is ready. You can now start tracking your coding progress.
      </motion.p>
    </div>
  );
};

export default SuccessAnimation;