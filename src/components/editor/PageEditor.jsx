
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, RotateCcw, ImageIcon } from "lucide-react";
import { GenerateImage } from "@/integrations/Core";

export default function PageEditor({ page, onUpdate, bookCharacterDescription, bookIllustrationStyle, disabled = false }) {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [currentPage, setCurrentPage] = useState(page);

  useEffect(() => {
    // Synchronize currentPage state with the 'page' prop whenever 'page' changes.
    // This ensures that the component displays the most up-to-date page data from its parent.
    setCurrentPage(page);
  }, [page]);

  const handleTextChange = (e) => {
    const updatedText = e.target.value;
    // Update local state immediately for a responsive UI
    setCurrentPage(prev => ({ ...prev, text: updatedText }));
    // Inform the parent component about the text change.
    // We pass a new page object based on the original 'page' prop, but with updated text.
    onUpdate({ ...page, text: updatedText });
  };

  const handleRegenerateImage = async () => {
    setIsRegenerating(true);
    try {
      const result = await GenerateImage({
        // Use currentPage for the prompt as it reflects the current state of the page object
        prompt: `${currentPage.illustration_prompt}, ${bookCharacterDescription}, ${bookIllustrationStyle} style`,
      });
      // Inform the parent component about the new illustration URL.
      // The parent will then likely update its state, which in turn will pass
      // a new 'page' prop down to this component, triggering the useEffect
      // to update 'currentPage' with the new illustration_url.
      onUpdate({ ...page, illustration_url: result.url });
    } catch (error) {
      console.error("Error regenerating illustration:", error);
    }
    setIsRegenerating(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Page {page.page_number}
        </h2>
        <Button
          onClick={handleRegenerateImage}
          disabled={isRegenerating || disabled}
          variant="outline"
          className="rounded-lg"
        >
          {isRegenerating ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RotateCcw className="w-4 h-4 mr-2" />
          )}
          {isRegenerating ? "Regenerating..." : "Regenerate Illustration"}
        </Button>
      </div>

      <Card className="bg-white shadow-lg rounded-2xl overflow-hidden">
        <CardContent className="p-8">
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Text Content */}
            <div className="space-y-4">
              <Label htmlFor="pageText" className="text-lg font-semibold">
                Page Text
              </Label>
              <Textarea
                id="pageText"
                value={currentPage.text || ''}
                onChange={handleTextChange}
                disabled={disabled}
                className="h-32 text-lg leading-relaxed rounded-xl"
                placeholder="Enter the text for this page..."
              />
            </div>

            {/* Illustration */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Current Illustration</Label>
              <div className="bg-gray-100 rounded-xl p-4 min-h-[200px] flex items-center justify-center">
                {currentPage.illustration_url ? (
                  <img
                    src={currentPage.illustration_url}
                    alt={`Page ${page.page_number} illustration`}
                    className="max-w-full max-h-80 object-contain rounded-lg shadow-md"
                  />
                ) : (
                  <div className="text-gray-500 text-center">
                    <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No illustration yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Illustration Prompt Section */}
      <Card className="bg-white shadow-lg rounded-2xl overflow-hidden">
        <CardContent className="p-8">
          <div className="space-y-2">
            <Label className="text-md font-semibold text-gray-700">Illustration Prompt</Label>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border">
              {currentPage.illustration_prompt}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
