import React from 'react';
import { motion } from "framer-motion";
import { BookOpen, Sparkles, Users, Palette } from "lucide-react";

export default function WelcomeSection({ totalBooks }) {
  return (
    <div className="relative overflow-hidden bg-white rounded-3xl shadow-lg border-0 p-8 md:p-12">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full transform translate-x-20 -translate-y-20 opacity-60" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-100 to-cyan-100 rounded-full transform -translate-x-16 translate-y-16 opacity-60" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                Welcome to MindBloom! 
                <motion.span 
                  className="inline-block ml-2"
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  👋
                </motion.span>
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl">
                Create magical, educational stories that inspire young minds. Turn your ideas into beautiful interactive books with AI-powered storytelling and illustrations.
              </p>
            </motion.div>
          </div>
          <motion.div
            className="animate-float"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">AI Powered</div>
              <div className="text-sm text-gray-600">Smart storytelling</div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-100">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <Palette className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">Custom Art</div>
              <div className="text-sm text-gray-600">Unique illustrations</div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">All Ages</div>
              <div className="text-sm text-gray-600">3-12 year olds</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}