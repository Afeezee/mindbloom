import React from 'react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function CtaSection() {
  const handleGetStarted = () => {
    window.location.href = createPageUrl("Dashboard");
  };

  return (
    <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600">
      <div className="container mx-auto px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-medium">Start Your Creative Journey</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Create Your First Story?
          </h2>
          <p className="text-xl text-white/90 mb-10">
            Join thousands of parents and educators bringing stories to life with AI
          </p>
          <Button 
            size="lg"
            onClick={handleGetStarted}
            className="bg-white text-purple-600 hover:bg-gray-50 rounded-xl px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <p className="text-white/80 text-sm mt-4">No credit card required • Create unlimited stories</p>
        </div>
      </div>
    </section>
  );
}