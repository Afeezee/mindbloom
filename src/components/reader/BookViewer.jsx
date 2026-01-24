import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Volume2, Music } from 'lucide-react';

export default function BookViewer({ book }) {
  const [currentPage, setCurrentPage] = useState(0);
  const audioRef = useRef(null);

  const pages = [
    { type: 'cover', image: book.cover_image_url, text: book.title, author: book.author_name },
    ...book.pages.map(p => ({ type: 'page', ...p })),
    { type: 'back', text: "The End" }
  ];

  const totalPages = pages.length;

  const goToNextPage = () => {
    setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : prev));
  };

  const goToPrevPage = () => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const readAloud = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Your browser does not support text-to-speech.");
    }
  };

  const renderPage = (page, index) => {
    if (page.type === 'cover') {
      return (
        <div className="flex flex-col items-center justify-center text-center h-full p-8 bg-white">
          <img src={page.image} alt="Cover" className="max-h-[60%] w-auto object-contain rounded-lg shadow-2xl mb-8" />
          <h2 className="text-4xl font-bold text-gray-800 mb-2">{page.text}</h2>
          {page.author && <p className="text-lg text-gray-600 mt-2">by {page.author}</p>}
        </div>
      );
    }
    if (page.type === 'back') {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 bg-white">
          <h2 className="text-5xl font-bold text-gray-800 font-serif">{page.text}</h2>
        </div>
      );
    }
    // Regular page
    return (
      <div className="flex flex-col md:grid md:grid-cols-2 gap-4 md:gap-8 items-center h-full p-4 md:p-8">
        <div className="w-full md:h-full flex items-center justify-center">
            <img src={page.illustration_url} alt={`Page ${page.page_number}`} className="max-h-[45vh] md:max-h-full w-auto object-contain rounded-lg shadow-xl" />
        </div>
        <div className="w-full flex-grow flex flex-col justify-center text-center md:text-left px-4 md:px-0">
          <p className="text-xl md:text-2xl lg:text-3xl leading-relaxed text-gray-700">{page.text}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl h-[85vh] md:max-w-6xl md:h-auto md:aspect-[16/9] relative">
      <AnimatePresence initial={false}>
        <motion.div
          key={currentPage}
          className="absolute inset-0 w-full h-full bg-white rounded-2xl shadow-2xl overflow-y-auto md:overflow-hidden"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.5 }}
        >
          {renderPage(pages[currentPage], currentPage)}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      {currentPage > 0 && (
        <Button
          onClick={goToPrevPage}
          variant="ghost"
          size="icon"
          className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 rounded-full bg-gray-800/90 hover:bg-gray-900 text-white backdrop-blur-sm w-12 h-12 shadow-lg z-10"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
      )}
      {currentPage < totalPages - 1 && (
        <Button
          onClick={goToNextPage}
          variant="ghost"
          size="icon"
          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 rounded-full bg-gray-800/90 hover:bg-gray-900 text-white backdrop-blur-sm w-12 h-12 shadow-lg z-10"
        >
          <ChevronRight className="w-6 h-6" />
        </Button>
      )}

      {/* Controls */}
      <div className="absolute bottom-[-60px] md:bottom-[-70px] left-1/2 -translate-x-1/2 flex items-center gap-4 p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg">
        <Button onClick={() => readAloud(pages[currentPage].text)} variant="ghost" size="icon" className="rounded-full">
          <Volume2 className="w-5 h-5" />
        </Button>
        <Button onClick={() => alert("Background music feature coming soon!")} variant="ghost" size="icon" className="rounded-full">
          <Music className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}