import React from 'react';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Sparkles, ChevronRight } from 'lucide-react';

export default function HeroSection() {
  const handleGetStarted = () => {
    // This will redirect to login which will then redirect back to Dashboard
    window.location.href = createPageUrl("Dashboard");
  };

  return (
    <section className="relative bg-gradient-to-b from-purple-50 to-white pt-24 pb-20 md:pt-32 md:pb-28">
      <div className="container mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}>

          <div className="inline-block bg-white border border-purple-200 rounded-full px-4 py-2 mb-6 shadow-sm">
            <p className="flex items-center gap-2 text-sm font-medium text-purple-700">
              <Sparkles className="w-4 h-4 text-purple-500" />
              AI-Powered Storytelling for Kids
            </p>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
            Bring Your Story Ideas to Life as<br/>Magical Children's Books
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-600 mb-10">
            With the power of AI, create personalized, illustrated stories in minutes. Spark imagination, teach valuable lessons, and make reading an adventure.
          </p>
          <div className="flex justify-center gap-4">
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Start Creating for Free
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </motion.div>
      </div>
      <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full transform -translate-x-20 -translate-y-20 opacity-60" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-gradient-to-tr from-blue-100 to-cyan-100 rounded-full transform translate-x-16 translate-y-16 opacity-60" />
    </section>
  );
}