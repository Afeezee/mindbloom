
import React from 'react';
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { BookOpen, Eye, Edit3, Clock, CheckCircle, Users, Target, Globe, Lock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const statusConfig = {
  draft: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock, label: "Draft" },
  generating: { color: "bg-blue-100 text-blue-800 border-blue-200", icon: Clock, label: "Generating" },
  completed: { color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle, label: "Complete" },
  published: { color: "bg-purple-100 text-purple-800 border-purple-200", icon: BookOpen, label: "Published" }
};

export default function BookCard({ book, viewMode, onRefresh, onPublicToggle }) {
  const statusInfo = statusConfig[book.status] || statusConfig.draft;
  const StatusIcon = statusInfo.icon;

  const handleToggle = (e) => {
    e.stopPropagation(); // Prevent card click event
    const newStatus = !book.is_public;
    onPublicToggle(newStatus);
  }

  const publicToggleSwitch = (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-1.5" onClick={handleToggle}>
            <Lock size={14} className={book.is_public ? "text-gray-400" : "text-gray-700"}/>
            <Switch
              checked={book.is_public}
              className="data-[state=checked]:bg-green-500"
              style={{ transform: 'scale(0.8)' }}
            />
            <Globe size={14} className={book.is_public ? "text-green-600" : "text-gray-400"}/>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{book.is_public ? "Public" : "Private"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
      >
        <div className="p-6">
          <div className="flex items-center gap-6">
            {book.cover_image_url ? (
              <img
                src={book.cover_image_url}
                alt={book.title}
                className="w-20 h-28 object-cover rounded-xl shadow-md flex-shrink-0"
              />
            ) : (
              <div className="w-20 h-28 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-8 h-8 text-purple-600" />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 truncate pr-4">{book.title}</h3>
                  {book.author_name && <p className="text-sm text-gray-500">by {book.author_name}</p>}
                </div>
                <div className="flex items-center gap-4">
                  {publicToggleSwitch}
                  <Badge className={`${statusInfo.color} border px-2 py-1 text-xs font-medium flex items-center gap-1 flex-shrink-0`}>
                    <StatusIcon className="w-3 h-3" />
                    {statusInfo.label}
                  </Badge>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm line-clamp-2 mb-3">{book.idea}</p>
              
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Ages {book.age_group}
                </span>
                <span className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  {book.focus_topic?.replace(/_/g, ' ')}
                </span>
                <span>📅 {format(new Date(book.created_date), "MMM d, yyyy")}</span>
              </div>
              
              <div className="flex gap-2">
                <Link to={createPageUrl(`Editor?id=${book.id}`)}>
                  <Button variant="outline" size="sm" className="rounded-lg">
                    <Edit3 className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </Link>
                {book.status === 'completed' && (
                  <Link to={createPageUrl(`Reader?id=${book.id}`)}>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                      <Eye className="w-4 h-4 mr-1" />
                      Read
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="group bg-white shadow-lg hover:shadow-xl border-0 rounded-2xl overflow-hidden transition-all duration-300">
        <div className="relative">
          {book.cover_image_url ? (
            <img
              src={book.cover_image_url}
              alt={book.title}
              className="w-full h-48 object-cover"
            />
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 flex items-center justify-center">
              <BookOpen className="w-16 h-16 text-purple-600" />
            </div>
          )}
          
          <div className="absolute top-3 right-3 flex items-center gap-2">
            {publicToggleSwitch}
            <Badge className={`${statusInfo.color} border px-2 py-1 text-xs font-medium`}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusInfo.label}
            </Badge>
          </div>
          
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
              <Link to={createPageUrl(`Editor?id=${book.id}`)}>
                <Button size="sm" variant="secondary" className="rounded-lg shadow-lg">
                  <Edit3 className="w-4 h-4" />
                </Button>
              </Link>
              {book.status === 'completed' && (
                <Link to={createPageUrl(`Reader?id=${book.id}`)}>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg">
                    <Eye className="w-4 h-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
        
        <CardContent className="p-4">
          <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{book.title}</h3>
          {book.author_name && <p className="text-xs text-gray-500 mb-2">by {book.author_name}</p>}
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">{book.idea}</p>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              Ages {book.age_group}
            </span>
            <span>{format(new Date(book.created_date), "MMM d")}</span>
          </div>
          
          <div className="mt-3 text-xs">
            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 rounded-full capitalize">
              {book.focus_topic?.replace(/_/g, ' ')}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
