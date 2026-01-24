import React, { useState, useEffect, useCallback } from "react";
import { Book } from "@/entities/Book";
import { PublicBook } from "@/entities/PublicBook";
import { User } from "@/entities/User";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { X, BookOpen, Loader2, Share2 } from "lucide-react";
import BookViewer from "../components/reader/BookViewer";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import ReaderShareModal from "../components/reader/ReaderShareModal";

export default function Reader() {
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublicView, setIsPublicView] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); // New state for authentication check

  const [isUnregisteredPublicUser, setIsUnregisteredPublicUser] = useState(false);

  const loadBook = useCallback(async () => {
    const params = new URLSearchParams(window.location.search);
    const bookId = params.get("id");
    const isPublic = params.get("public") === "true";
    setIsPublicView(isPublic);

    // Check if unregistered user viewing public link
    if (isPublic) {
      try {
        const authenticated = await base44.auth.isAuthenticated();
        setIsUnregisteredPublicUser(!authenticated);
      } catch (error) {
        setIsUnregisteredPublicUser(true);
      }
    }

    if (!bookId) {
      navigate(createPageUrl("Library"));
      return;
    }

    // Check auth only for private books
    if (!isPublic) {
      try {
        const authenticated = await base44.auth.isAuthenticated();
        if (!authenticated) {
          base44.auth.redirectToLogin(window.location.href);
          return; // Stop execution if not authenticated and redirected
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        base44.auth.redirectToLogin(window.location.href);
        return; // Stop execution if auth check failed and redirected
      }
    }

    // Auth check complete (either public book or authenticated private book)
    setIsCheckingAuth(false);
    setIsLoading(true);

    try {
      const Entity = isPublic ? PublicBook : Book;
      const results = await Entity.filter({ id: bookId });
      
      let fetchedBook = null;
      if (results && results.length > 0) {
        fetchedBook = results[0];
        
        // If it's not a public view (i.e., a private book) and author_name is missing,
        // try to populate it with the current user's full name.
        if (!isPublic && !fetchedBook.author_name) {
          try {
            const currentUser = await User.me();
            if (currentUser && currentUser.full_name) {
              fetchedBook.author_name = currentUser.full_name;
            }
          } catch (userError) {
            console.warn("Could not fetch user to populate author name.", userError);
          }
        }
        setBook(fetchedBook);
      } else {
        setBook(null);
      }
    } catch (err) {
      console.error("Error loading book:", err);
    }
    setIsLoading(false);
  }, [navigate]);

  useEffect(() => {
    loadBook();
  }, [loadBook]);

  if (isCheckingAuth) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-700">
        <Loader2 className="w-12 h-12 animate-spin mb-4 text-purple-600" />
        <p className="text-lg font-medium">Loading your story...</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-50 text-red-600">
        <h2 className="text-2xl font-bold mb-4">Story Not Found</h2>
        <Button onClick={() => {
          if (isUnregisteredPublicUser) {
            window.location.href = "https://mindbloom.cereustechnologies.com";
          } else {
            navigate(createPageUrl("Library"));
          }
        }}>Back to {isUnregisteredPublicUser ? "Home" : "Library"}</Button>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col items-center justify-center relative p-4">
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        {!isPublicView && (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="bg-white/50 backdrop-blur-sm rounded-full"
              >
                <Share2 className="w-5 h-5 text-gray-700" />
              </Button>
            </DialogTrigger>
            <ReaderShareModal book={book} />
          </Dialog>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            if (isUnregisteredPublicUser) {
              window.location.href = "https://mindbloom.cereustechnologies.com";
            } else {
              navigate(createPageUrl("Library"));
            }
          }}
          className="bg-white/50 backdrop-blur-sm rounded-full"
        >
          <X className="w-6 h-6 text-gray-700" />
        </Button>
      </div>
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-white/50 backdrop-blur-sm p-2 rounded-full">
        <BookOpen className="w-5 h-5 text-purple-600" />
        <h1 className="font-bold text-gray-800">{book.title}</h1>
        {book.author_name && (
          <p className="text-sm text-gray-600 ml-2">by {book.author_name}</p>
        )}
      </div>

      <BookViewer book={book} />
    </div>
  );
}