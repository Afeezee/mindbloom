import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, RotateCcw, ImageIcon } from "lucide-react";
import { GenerateImage } from "@/integrations/Core";

export default function CoverEditor({ book, onUpdate, disabled = false }) {
  const [isRegeneratingCover, setIsRegeneratingCover] = useState(false);
  const [storyOutline, setStoryOutline] = useState('');

  useEffect(() => {
    if (book.story_outline) {
      try {
        const parsed = typeof book.story_outline === 'string' 
          ? JSON.parse(book.story_outline) 
          : book.story_outline;
        setStoryOutline(parsed.summary || '');
      } catch (error) {
        setStoryOutline('');
      }
    }
  }, [book.story_outline]);

  const handleRegenerateCover = async () => {
    setIsRegeneratingCover(true);
    try {
      const result = await GenerateImage({
        prompt: `Children's book cover for "${book.title}". Style: ${book.illustration_style}. Featuring: ${book.character_description}. Theme: ${book.focus_topic}. Mood is bright, cheerful, and welcoming for ages ${book.age_group}.`
      });
      onUpdate({ cover_image_url: result.url });
    } catch (error) {
      console.error("Error regenerating cover:", error);
    }
    setIsRegeneratingCover(false);
  };

  const handleSynopsisChange = (e) => {
    const newSummary = e.target.value;
    setStoryOutline(newSummary);
    
    try {
      const currentOutline = typeof book.story_outline === 'string' 
        ? JSON.parse(book.story_outline) 
        : book.story_outline;
      onUpdate({ 
        story_outline: JSON.stringify({ 
          ...currentOutline, 
          summary: newSummary 
        }) 
      });
    } catch (error) {
      onUpdate({ 
        story_outline: JSON.stringify({ summary: newSummary }) 
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Cover & Synopsis
        </h2>
        <Button
          onClick={handleRegenerateCover}
          disabled={isRegeneratingCover || disabled}
          variant="outline"
          className="rounded-lg"
        >
          {isRegeneratingCover ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RotateCcw className="w-4 h-4 mr-2" />
          )}
          {isRegeneratingCover ? "Regenerating..." : "Regenerate Cover"}
        </Button>
      </div>

      <Card className="bg-white shadow-lg rounded-2xl overflow-hidden">
        <CardContent className="p-8">
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Story Synopsis */}
            <div className="space-y-4">
              <Label htmlFor="synopsis" className="text-lg font-semibold">
                Story Synopsis
              </Label>
              <Textarea
                id="synopsis"
                value={storyOutline}
                onChange={handleSynopsisChange}
                disabled={disabled}
                className="h-48 text-lg leading-relaxed rounded-xl"
                placeholder="Enter a brief description of your story..."
              />
              <p className="text-sm text-gray-500">
                This synopsis helps guide the overall story theme and character consistency.
              </p>
            </div>

            {/* Cover Image */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Cover Image</Label>
              <div className="bg-gray-100 rounded-xl p-4 min-h-[200px] flex items-center justify-center">
                {book.cover_image_url ? (
                  <img
                    src={book.cover_image_url}
                    alt="Book cover"
                    className="max-w-full max-h-96 object-contain rounded-lg shadow-md"
                  />
                ) : (
                  <div className="text-gray-500 text-center">
                    <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No cover image yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Book Details */}
      <Card className="bg-white shadow-lg rounded-2xl overflow-hidden">
        <CardContent className="p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm font-semibold text-gray-700">Age Group</Label>
              <p className="text-lg text-gray-900 mt-1">{book.age_group}</p>
            </div>
            <div>
              <Label className="text-sm font-semibold text-gray-700">Focus Topic</Label>
              <p className="text-lg text-gray-900 mt-1">{book.focus_topic?.replace(/_/g, ' ')}</p>
            </div>
            <div>
              <Label className="text-sm font-semibold text-gray-700">Style</Label>
              <p className="text-lg text-gray-900 mt-1">{book.illustration_style}</p>
            </div>
            <div>
              <Label className="text-sm font-semibold text-gray-700">Pages</Label>
              <p className="text-lg text-gray-900 mt-1">{book.pages?.length || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}