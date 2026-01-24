import React from 'react';
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Eye, Edit3, Clock, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const statusColors = {
  draft: "bg-yellow-100 text-yellow-800 border-yellow-200",
  generating: "bg-blue-100 text-blue-800 border-blue-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  published: "bg-purple-100 text-purple-800 border-purple-200"
};

const statusIcons = {
  draft: Clock,
  generating: Clock,
  completed: CheckCircle,
  published: BookOpen
};

export default function RecentBooks({ books, isLoading, onRefresh }) {
  if (isLoading) {
    return (
      <Card className="bg-white shadow-lg rounded-3xl border-0">
        <CardHeader className="p-6">
          <CardTitle className="text-xl font-bold text-gray-900">Recent Stories</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="grid gap-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="p-4 border border-gray-100 rounded-2xl animate-pulse">
                <div className="flex items-center justify-between mb-3">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-lg rounded-3xl border-0">
      <CardHeader className="p-6 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold text-gray-900">Recent Stories</CardTitle>
          {books.length > 0 && (
            <Link to={createPageUrl("Library")}>
              <Button variant="outline" size="sm" className="rounded-xl">
                View All
              </Button>
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {books.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-10 h-10 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No stories yet</h3>
            <p className="text-gray-600 mb-4">Start creating your first interactive children's book!</p>
            <Link to={createPageUrl("Create")}>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-300">
                Create Your First Story
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {books.slice(0, 5).map((book) => {
              const StatusIcon = statusIcons[book.status];
              return (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group p-4 border border-gray-100 rounded-2xl hover:shadow-md hover:border-gray-200 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      {book.cover_image_url ? (
                        <img 
                          src={book.cover_image_url} 
                          alt={book.title}
                          className="w-12 h-12 rounded-xl object-cover shadow-md"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-purple-600" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold text-gray-900 line-clamp-1">{book.title}</h4>
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">{book.idea}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${statusColors[book.status]} border px-2 py-1 text-xs font-medium`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {book.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        📅 {format(new Date(book.created_date), "MMM d, yyyy")}
                      </span>
                      <span className="flex items-center gap-1">
                        👥 Ages {book.age_group}
                      </span>
                      <span className="flex items-center gap-1">
                        📚 {book.focus_topic?.replace(/_/g, ' ')}
                      </span>
                    </div>
                    
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {book.status === 'completed' && (
                        <Link to={createPageUrl(`Reader?id=${book.id}`)}>
                          <Button variant="ghost" size="sm" className="rounded-lg">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                      )}
                      <Link to={createPageUrl(`Editor?id=${book.id}`)}>
                        <Button variant="ghost" size="sm" className="rounded-lg">
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}