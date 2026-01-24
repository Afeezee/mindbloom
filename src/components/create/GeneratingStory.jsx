import React from 'react';
import { motion } from "framer-motion";
import { Sparkles, BookOpen, Palette, Wand2 } from "lucide-react";

export default function GeneratingStory({ message }) {
  return (
    <div className="text-center py-16">
      <div className="relative">
        {/* Animated background circles */}
        <motion.div
          className="absolute inset-0 w-32 h-32 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full mx-auto"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Main icon */}
        <motion.div
          className="relative w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl"
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <Wand2 className="w-12 h-12 text-white" />
        </motion.div>
      </div>

      <motion.h2
        className="text-3xl font-bold text-gray-900 mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Creating Magic... ✨
      </motion.h2>
      
      <motion.p
        className="text-lg text-gray-600 mb-8 max-w-md mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        {message || "Our AI is crafting your unique story..."}
      </motion.p>

      {/* Animated progress indicators */}
      <div className="flex justify-center gap-6">
        {[
          { icon: BookOpen, label: "Writing story", delay: 0 },
          { icon: Palette, label: "Designing art", delay: 1 },
          { icon: Sparkles, label: "Adding magic", delay: 2 }
        ].map((item, index) => (
          <motion.div
            key={index}
            className="flex flex-col items-center gap-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 + item.delay * 0.3 }}
          >
            <motion.div
              className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl flex items-center justify-center"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: item.delay * 0.5,
                ease: "easeInOut"
              }}
            >
              <item.icon className="w-6 h-6 text-purple-600" />
            </motion.div>
            <span className="text-sm font-medium text-gray-600">{item.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Loading dots */}
      <motion.div
        className="flex justify-center gap-2 mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut"
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}