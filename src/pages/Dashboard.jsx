import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Book } from "@/entities/Book";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Plus, BookOpen, Sparkles, Palette, Users, TrendingUp, Star } from "lucide-react";

import StatsCards from "../components/dashboard/StatsCards";
import RecentBooks from "../components/dashboard/RecentBooks";
import WelcomeSection from "../components/dashboard/WelcomeSection";
import PullToRefresh from "../components/PullToRefresh";

export default function Dashboard() {
  const navigate = useNavigate(); // Added
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); // Added

  useEffect(() => {
    checkAuthAndLoad(); // Modified to call checkAuthAndLoad
  }, []);

  // Added checkAuthAndLoad function
  const checkAuthAndLoad = async () => {
    try {
      const authenticated = await base44.auth.isAuthenticated();
      if (!authenticated) {
        base44.auth.redirectToLogin(window.location.href);
        return;
      }
      setIsCheckingAuth(false);
      loadBooks();
    } catch (error) {
      console.error("Authentication check failed:", error); // Log error for debugging
      base44.auth.redirectToLogin(window.location.href);
    }
  };

  const loadBooks = async () => {
    setIsLoading(true);
    try {
      const data = await Book.list("-created_date", 10);
      setBooks(data);
    } catch (error) {
      console.error("Error loading books:", error);
    }
    setIsLoading(false);
  };

  // Conditional rendering for authentication check
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--mindbloom-background))' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const completedBooks = books.filter(book => book.status === "completed");
  const draftBooks = books.filter(book => book.status === "draft");

  const handleRefresh = useCallback(async () => {
    await loadBooks();
  }, []);

  return (
    <PullToRefresh onRefresh={handleRefresh} className="min-h-screen p-4 md:p-8" style={{ backgroundColor: 'hsl(var(--mindbloom-background))' }}>
      <div className="max-w-7xl mx-auto space-y-8">
        <WelcomeSection totalBooks={books.length} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCards 
            title="Total Stories" 
            value={books.length}
            icon={BookOpen}
            bgColor="from-blue-500 to-blue-600"
            description="Created by you"
          />
          <StatsCards 
            title="Completed" 
            value={completedBooks.length}
            icon={Star}
            bgColor="from-green-500 to-green-600"
            description="Ready to share"
          />
          <StatsCards 
            title="In Progress" 
            value={draftBooks.length}
            icon={Palette}
            bgColor="from-purple-500 to-purple-600"
            description="Being crafted"
          />
          <StatsCards 
            title="Reading Level" 
            value="All Ages"
            icon={Users}
            bgColor="from-orange-500 to-orange-600"
            description="3-12 years"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <RecentBooks 
              books={books}
              isLoading={isLoading}
              onRefresh={loadBooks}
            />
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Quick Start
              </h3>
              <div className="space-y-3">
                <Link to={createPageUrl("Create")}>
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl py-3 shadow-lg hover:shadow-xl transition-all duration-300">
                    <Plus className="w-5 h-5 mr-2" />
                    Create New Story
                  </Button>
                </Link>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                    <div className="text-sm font-semibold text-blue-700">Morals</div>
                    <div className="text-xs text-blue-600">Life lessons</div>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                    <div className="text-sm font-semibold text-green-700">Finance</div>
                    <div className="text-xs text-green-600">Money basics</div>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                    <div className="text-sm font-semibold text-purple-700">Mental Health</div>
                    <div className="text-xs text-purple-600">Emotional skills</div>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-100">
                    <div className="text-sm font-semibold text-orange-700">Career</div>
                    <div className="text-xs text-orange-600">Dream jobs</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-6 border border-indigo-100">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Did You Know?</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                Reading interactive stories helps children develop creativity, emotional intelligence, and critical thinking skills while having fun!
              </p>
              <div className="flex items-center gap-2 text-sm font-medium text-indigo-600">
                <TrendingUp className="w-4 h-4" />
                <span>Boost learning by 40%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}