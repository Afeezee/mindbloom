
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, AlertCircle, BookOpen, Ruler } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const BOOK_SIZES = [
  { value: "A5 Portrait", label: "A5 Portrait", description: "148 x 210 mm" },
  { value: "A4 Portrait", label: "A4 Portrait", description: "210 x 297 mm" },
  { value: "US Letter Portrait", label: "US Letter", description: "8.5 x 11 in" },
];

export default function StoryIdeaForm({ onSubmit, focusTopics, ageGroups, generationError }) {
  const [formData, setFormData] = useState({
    title: "",
    idea: "",
    age_group: "",
    focus_topic: "",
    page_length: 6,
    illustration_style: "cartoon",
    print_format: "A5 Portrait"
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title && formData.idea && formData.age_group && formData.focus_topic) {
      onSubmit(formData);
    }
  };

  const isValid = formData.title && formData.idea && formData.age_group && formData.focus_topic;

  return (
    <Card className="bg-white shadow-xl rounded-3xl border-0 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100 p-8">
        <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          Tell Us Your Story Idea
        </CardTitle>
        <p className="text-gray-600 mt-2">
          Share your creative vision and we'll help bring it to life with AI magic!
        </p>
      </CardHeader>
      <CardContent className="p-8">
        {generationError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Outline Creation Failed</AlertTitle>
              <AlertDescription>{generationError}</AlertDescription>
            </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <Label htmlFor="title" className="text-lg font-semibold text-gray-900">
              Story Title
            </Label>
            <Input
              id="title"
              placeholder="e.g., The Brave Little Turtle"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="text-lg p-4 rounded-xl border-gray-200 focus:border-purple-400 focus:ring-purple-400"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="idea" className="text-lg font-semibold text-gray-900">
              Your Story Idea
            </Label>
            <Textarea
              id="idea"
              placeholder="Describe your story idea in detail. For example: A shy turtle named Toby learns to speak up about his feelings when he gets scared during a thunderstorm..."
              value={formData.idea}
              onChange={(e) => setFormData({...formData, idea: e.target.value})}
              className="text-lg p-4 h-32 rounded-xl border-gray-200 focus:border-purple-400 focus:ring-purple-400"
            />
            <p className="text-sm text-gray-500">
              💡 Tip: The more specific you are, the better your story will be!
            </p>
          </div>

          {/* Story Length Selector */}
          <div className="space-y-3">
            <Label className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Story Length: {formData.page_length} pages
            </Label>
            <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100">
              <Slider
                value={[formData.page_length]}
                onValueChange={([value]) => setFormData({...formData, page_length: value})}
                max={50}
                min={4}
                step={2}
                className="mb-4"
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>4 pages (Quick story)</span>
                <span>25 pages (Standard)</span>
                <span>50 pages (Epic adventure)</span>
              </div>
              <p className="text-sm text-gray-500 mt-3 text-center">
                {formData.page_length <= 8 && "Perfect for bedtime stories and young readers"}
                {formData.page_length > 8 && formData.page_length <= 20 && "Great for developing reading skills"}
                {formData.page_length > 20 && "Ideal for independent readers who love detailed stories"}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-lg font-semibold text-gray-900">Age Group</Label>
              <div className="space-y-2">
                {ageGroups.map((group) => (
                  <motion.div
                    key={group.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, age_group: group.value})}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                        formData.age_group === group.value
                          ? "border-purple-400 bg-purple-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{group.icon}</span>
                        <div>
                          <div className="font-semibold text-gray-900">{group.label}</div>
                          <div className="text-sm text-gray-600">{group.description}</div>
                        </div>
                      </div>
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-lg font-semibold text-gray-900">Learning Focus</Label>
              <div className="space-y-2">
                {focusTopics.map((topic) => {
                  const IconComponent = topic.icon;
                  return (
                    <motion.div
                      key={topic.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, focus_topic: topic.value})}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                          formData.focus_topic === topic.value
                            ? "border-purple-400 bg-purple-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 bg-gradient-to-r ${topic.color} rounded-xl flex items-center justify-center`}>
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{topic.label}</div>
                            <div className="text-sm text-gray-600">{topic.description}</div>
                          </div>
                        </div>
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Ruler className="w-5 h-5" />
              Book Size
            </Label>
            <div className="grid sm:grid-cols-3 gap-3">
              {BOOK_SIZES.map((size) => (
                <motion.div
                  key={size.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, print_format: size.value})}
                    className={`w-full p-4 rounded-xl border-2 text-center transition-all duration-200 ${
                      formData.print_format === size.value
                        ? "border-purple-400 bg-purple-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="font-semibold text-gray-900">{size.label}</div>
                    <div className="text-sm text-gray-600">{size.description}</div>
                  </button>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <Button
              type="submit"
              disabled={!isValid}
              className={`w-full py-4 text-lg font-semibold rounded-xl transition-all duration-300 ${
                isValid
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                Create My Story
                <ArrowRight className="w-5 h-5" />
              </span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
