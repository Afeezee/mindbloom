import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import CommunityLoveSection from '../components/landing/CommunityLoveSection';
import CtaSection from '../components/landing/CtaSection';
import Footer from '../components/landing/Footer';

export default function LandingPage() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const authenticated = await base44.auth.isAuthenticated();
      setIsAuthenticated(authenticated);
      if (authenticated) {
        navigate(createPageUrl('Dashboard'));
      }
    } catch (error) {
      console.log('User not authenticated');
    }
    setIsLoading(false);
  };

  const handleSignIn = () => {
    base44.auth.redirectToLogin(createPageUrl('Dashboard'));
  };

  const handleSignUp = () => {
    base44.auth.redirectToLogin(createPageUrl('Dashboard'));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white text-gray-800">
      {/* Header with Logo and Auth Buttons */}
      {!isAuthenticated && (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 tracking-tight">MindBloom</h1>
                  <p className="text-xs text-gray-500 font-medium">AI Story Creator</p>
                </div>
              </div>

              {/* Auth Buttons */}
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleSignIn}
                  variant="ghost"
                  className="rounded-xl font-semibold hover:bg-gray-100"
                >
                  Sign In
                </Button>
                <Button
                  onClick={handleSignUp}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl px-6 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                >
                  Sign Up Free
                </Button>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content with padding for fixed header */}
      <div className={!isAuthenticated ? "pt-20" : ""}>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <CommunityLoveSection />
        <CtaSection />
        <Footer />
      </div>
    </div>
  );
}