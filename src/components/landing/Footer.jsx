import React from 'react';
import { BookOpen } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <div className="w-10 h-10 mindbloom-gradient rounded-2xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-xl text-gray-900 tracking-tight">MindBloom</h2>
              <p className="text-xs text-gray-500 font-medium">AI Story Creator</p>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            <p>&copy; {new Date().getFullYear()} MindBloom. All rights reserved.</p>
            <p>
              Developed by <a href="https://cereustechnologies.com" target="_blank" rel="noopener noreferrer" className="font-medium text-purple-700 hover:underline">Cereus Technologies</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}