
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Edit3, Plus, BookOpen, Star, Users, Target, Palette, Ruler } from "lucide-react";

export default function StoryPreview({ story, onEdit, onNewStory }) {
  if (!story) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-white shadow-xl rounded-3xl border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl"
          >
            <Star className="w-10 h-10 text-white" />
          </motion.div>
          <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
            🎉 Your Story is Ready!
          </CardTitle>
          <p className="text-lg text-gray-600">
            Your magical children's book has been created successfully
          </p>
        </CardHeader>
        
        <CardContent className="p-8 space-y-8">
          {/* Book Preview */}
          <div className="text-center">
            {story.cover_image_url && (
              <motion.img
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                src={story.cover_image_url}
                alt={story.title}
                className="w-48 h-64 object-cover rounded-2xl shadow-2xl mx-auto mb-6"
              />
            )}
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{story.title}</h2>
            <p className="text-gray-600 max-w-md mx-auto leading-relaxed">{story.idea}</p>
          </div>

          {/* Book Details Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="font-semibold text-gray-900">Ages {story.age_group}</div>
              <div className="text-sm text-gray-600">Target Age</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-2xl border border-purple-100">
              <Target className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="font-semibold text-gray-900 capitalize">{story.focus_topic?.replace(/_/g, ' ')}</div>
              <div className="text-sm text-gray-600">Learning Focus</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-2xl border border-green-100">
              <BookOpen className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="font-semibold text-gray-900">{story.page_length} Pages</div>
              <div className="text-sm text-gray-600">Story Length</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-2xl border border-orange-100">
              <Palette className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <div className="font-semibold text-gray-900 capitalize">{story.illustration_style}</div>
              <div className="text-sm text-gray-600">Art Style</div>
            </div>
            <div className="text-center p-4 bg-pink-50 rounded-2xl border border-pink-100 col-span-2 lg:col-span-1">
              <Ruler className="w-8 h-8 text-pink-600 mx-auto mb-2" />
              <div className="font-semibold text-gray-900">{story.print_format}</div>
              <div className="text-sm text-gray-600">Book Size</div>
            </div>
          </div>

          {/* Story Status */}
          <div className="text-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100">
            <Badge className="bg-green-100 text-green-800 px-4 py-2 text-sm font-semibold border border-green-200 mb-3">
              ✨ Story Complete
            </Badge>
            <p className="text-gray-600">
              Your {story.page_length}-page story is ready to read, edit, or share! You can make changes anytime in the editor.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100">
            <Button
              onClick={onEdit}
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Edit3 className="w-5 h-5 mr-2" />
              Edit & Customize
            </Button>
            
            <Button
              onClick={onNewStory}
              variant="outline"
              className="flex-1 py-4 rounded-xl border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-300"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Another Story
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500 pt-4">
            🎨 You can always come back to edit your story, add more pages, or change the illustrations
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
