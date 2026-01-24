import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Users, Target, BookOpen, CheckCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function StoryOutline({ outline, formData, onContinue, onBack, isGenerating, generationError }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-white shadow-xl rounded-3xl border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-100 p-8">
          <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            Story Outline Preview
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Review your story structure before we create the full book
          </p>
        </CardHeader>
        
        <CardContent className="p-8 space-y-8">
          {generationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Generation Failed</AlertTitle>
              <AlertDescription>{generationError}</AlertDescription>
            </Alert>
          )}

          {/* Book Details */}
          <div className="grid md:grid-cols-3 gap-6 p-6 bg-gray-50 rounded-2xl">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className="font-semibold text-gray-900">{formData.title}</div>
              <div className="text-sm text-gray-600">Title</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="font-semibold text-gray-900">Ages {formData.age_group}</div>
              <div className="text-sm text-gray-600">Target Age</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div className="font-semibold text-gray-900 capitalize">{formData.focus_topic?.replace(/_/g, ' ')}</div>
              <div className="text-sm text-gray-600">Learning Focus</div>
            </div>
          </div>

          {/* Story Summary */}
          {outline.summary && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                📖 Story Summary
              </h3>
              <p className="text-gray-700 leading-relaxed bg-blue-50 p-4 rounded-xl">
                {outline.summary}
              </p>
            </div>
          )}

          {/* Characters */}
          {outline.characters && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                👥 Main Characters
              </h3>
              <p className="text-gray-700 leading-relaxed bg-green-50 p-4 rounded-xl">
                {outline.characters}
              </p>
            </div>
          )}

          {/* Key Lessons */}
          {outline.lessons && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                💡 Key Lessons
              </h3>
              <p className="text-gray-700 leading-relaxed bg-yellow-50 p-4 rounded-xl">
                {outline.lessons}
              </p>
            </div>
          )}

          {/* Page Structure */}
          {outline.pages && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                📚 Page Structure
              </h3>
              <div className="grid gap-3">
                {outline.pages.map((page, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 border border-gray-200 rounded-xl hover:shadow-sm transition-shadow"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                      {page.page_number}
                    </div>
                    <p className="text-gray-700 flex-1">{page.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-6 border-t border-gray-100">
            <Button
              onClick={onBack}
              variant="outline"
              className="px-6 py-3 rounded-xl"
              disabled={isGenerating}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Edit
            </Button>
            
            <Button
              onClick={onContinue}
              disabled={isGenerating}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <motion.div
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Creating Full Story...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Create Full Story
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}