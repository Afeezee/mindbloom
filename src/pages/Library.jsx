import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Book } from "@/entities/Book";
import { PublicBook } from "@/entities/PublicBook";
import { User } from "@/entities/User";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, BookOpen, Grid, List } from "lucide-react";

import BookCard from "../components/library/BookCard";
import BookFilters from "../components/library/BookFilters";

export default function Library() {
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [filters, setFilters] = useState({
    status: "all",
    age_group: "all",
    focus_topic: "all"
  });

  // Pull-to-refresh state
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef(null);
  const containerRef = useRef(null);
  const PULL_THRESHOLD = 70;

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  // Pull-to-refresh touch handlers
  const handleTouchStart = (e) => {
    if (containerRef.current?.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e) => {
    if (touchStartY.current === null || isRefreshing) return;
    const delta = e.touches[0].clientY - touchStartY.current;
    if (delta > 0 && containerRef.current?.scrollTop === 0) {
      setPullDistance(Math.min(delta * 0.5, PULL_THRESHOLD + 20));
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(0);
      await loadBooks();
      setIsRefreshing(false);
    } else {
      setPullDistance(0);
    }
    touchStartY.current = null;
  };

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
      console.error("Authentication check failed:", error);
      base44.auth.redirectToLogin(window.location.href);
    }
  };

  const loadBooks = async () => {
    setIsLoading(true);
    try {
      const data = await Book.list("-created_date");
      let currentUser = null;
      try {
        currentUser = await User.me();
      } catch (userError) {
        console.warn("Could not fetch current user, proceeding without user context:", userError);
      }

      const booksWithAuthor = data.map(book => {
        if (!book.author_name && currentUser && currentUser.full_name) {
          return { ...book, author_name: currentUser.full_name };
        }
        return book;
      });

      setBooks(booksWithAuthor);
    } catch (error) {
      console.error("Error loading books:", error);
      // Fallback to loading books without user context if the initial fetch fails for any reason
      try {
        const data = await Book.list("-created_date");
        setBooks(data);
      } catch (bookError) {
         console.error("Error loading books as fallback:", bookError);
      }
    }
    setIsLoading(false);
  };

  const handlePublicToggle = async (book, newStatus) => {
    // Optimistically update the UI
    setBooks(prevBooks =>
      prevBooks.map(b => b.id === book.id ? { ...b, is_public: newStatus } : b)
    );
    try {
      if (newStatus) {
        // Toggling to Public
        // 1. Create a copy in PublicBook
        // Destructure to exclude fields that are not part of the PublicBook schema or are generated,
        // and explicitly capture author_name to ensure it's passed to PublicBook.
        const { id, created_by, created_date, updated_date, is_public, public_book_id, author_name, ...publicBookData } = book;
        const newPublicBook = await PublicBook.create({ ...publicBookData, author_name });

        // 2. Update the original book with the public ID and status
        await Book.update(book.id, { is_public: true, public_book_id: newPublicBook.id });

      } else {
        // Toggling to Private
        // 1. Delete from PublicBook
        if (book.public_book_id) {
          await PublicBook.delete(book.public_book_id);
        }

        // 2. Update the original book
        await Book.update(book.id, { is_public: false, public_book_id: null });
      }
    } catch (error) {
      console.error("Failed to update book status", error);
      // Revert on failure
      loadBooks();
    }
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.idea.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filters.status === "all" || book.status === filters.status;
    const matchesAge = filters.age_group === "all" || book.age_group === filters.age_group;
    const matchesTopic = filters.focus_topic === "all" || book.focus_topic === filters.focus_topic;

    return matchesSearch && matchesStatus && matchesAge && matchesTopic;
  });

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--mindbloom-background))' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen p-4 md:p-8 overflow-y-auto"
      style={{ backgroundColor: 'hsl(var(--mindbloom-background))', overscrollBehavior: 'none' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull-to-refresh indicator */}
      {(pullDistance > 0 || isRefreshing) && (
        <div
          className="flex items-center justify-center transition-all duration-200"
          style={{ height: isRefreshing ? 48 : pullDistance, overflow: 'hidden' }}
        >
          <div className={`w-7 h-7 rounded-full border-2 border-purple-600 border-t-transparent ${isRefreshing ? 'animate-spin' : ''}`}
            style={{ transform: `rotate(${pullDistance * 3}deg)` }}
          />
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">My Story Library</h1>
            <p className="text-lg text-gray-600">Manage and organize all your created stories</p>
          </div>
          <Link to={createPageUrl("Create")}>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300">
              <Plus className="w-5 h-5 mr-2" />
              Create New Story
            </Button>
          </Link>
        </div>

        {/* Stats */}
        {books.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-2xl font-bold text-gray-900">{books.length}</div>
              <div className="text-sm text-gray-600">Total Stories</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-2xl font-bold text-green-600">{books.filter(b => b.status === 'completed').length}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-2xl font-bold text-yellow-600">{books.filter(b => b.status === 'draft').length}</div>
              <div className="text-sm text-gray-600">Drafts</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <div className="text-2xl font-bold text-purple-600">{new Set(books.map(b => b.focus_topic)).size}</div>
              <div className="text-sm text-gray-600">Topics Covered</div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search stories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-xl border-gray-200"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-md"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-md"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <BookFilters filters={filters} onFiltersChange={setFilters} />
        </div>

        {/* Books Display */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
                <div className="w-full h-48 bg-gray-200 rounded-xl mb-4" />
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-12 h-12 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {books.length === 0 ? "No stories yet" : "No stories match your filters"}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {books.length === 0
                ? "Start your creative journey by creating your first interactive children's book!"
                : "Try adjusting your search or filter criteria to find more stories."
              }
            </p>
            {books.length === 0 && (
              <Link to={createPageUrl("Create")}>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300">
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Story
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <AnimatePresence>
            <motion.div
              className={viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
              }
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {filteredBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  viewMode={viewMode}
                  onRefresh={loadBooks}
                  onPublicToggle={(newStatus) => handlePublicToggle(book, newStatus)}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}