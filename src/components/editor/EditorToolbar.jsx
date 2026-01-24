import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Save, Eye, X, BookOpen, Loader2, Download, RotateCcw, Lock, Globe } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import ExportOnlyModal from "./ExportOnlyModal";

export default function EditorToolbar({ book, onTitleChange, onSave, isSaving, onRegenerate, isRegenerating, onPublicToggle }) {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);

  const handleRegenerateClick = () => {
    setShowRegenerateConfirm(true);
  };

  const handleConfirmRegenerate = () => {
    setShowRegenerateConfirm(false);
    onRegenerate();
  };

  if (!book) return null; // Don't render toolbar if book is not loaded

  return (
    <>
      <header className="bg-white border-b border-gray-100 shadow-sm p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(createPageUrl("Library"))}>
              <X className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
              <Input
                value={book.title}
                onChange={(e) => onTitleChange(e.target.value)}
                className="text-lg font-bold border-none focus:ring-0 shadow-none p-1"
                disabled={isRegenerating}
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 border-r pr-4">
                    <Lock className="w-4 h-4 text-gray-500" />
                    <Switch
                      id="public-toggle"
                      checked={book.is_public}
                      onCheckedChange={onPublicToggle}
                      disabled={isRegenerating || isSaving}
                    />
                    <Globe className="w-4 h-4 text-gray-500" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{book.is_public ? "This story has a public link." : "This story is private."}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Link to={createPageUrl(`Reader?id=${book.id}`)} target="_blank">
              <Button variant="outline" className="rounded-lg" disabled={isRegenerating}>
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </Link>
            
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="rounded-lg" disabled={isRegenerating}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </DialogTrigger>
              <ExportOnlyModal book={book} />
            </Dialog>

            <Button
              onClick={handleRegenerateClick}
              variant="outline" 
              disabled={isRegenerating || isSaving}
              className="rounded-lg border-orange-200 text-orange-700 hover:bg-orange-50"
            >
              {isRegenerating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RotateCcw className="w-4 h-4 mr-2" />
              )}
              {isRegenerating ? "Regenerating..." : "Regenerate Story"}
            </Button>

            <Button
              onClick={onSave}
              disabled={isSaving || isRegenerating}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg shadow-md"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>

        {showRegenerateConfirm && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertDescription className="flex items-center justify-between">
              <span className="text-orange-800">
                This will create a completely new version of your story using the original idea. Your current content will be replaced. Are you sure?
              </span>
              <div className="flex gap-2 ml-4">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setShowRegenerateConfirm(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleConfirmRegenerate}
                  className="bg-orange-600 hover:bg-orange-700 text-white text-xs"
                >
                  Yes, Regenerate
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </header>
    </>
  );
}