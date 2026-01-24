
import React, { useState, useEffect, useCallback } from "react";
import { Book } from "@/entities/Book";
import { PublicBook } from "@/entities/PublicBook";
import { InvokeLLM, GenerateImage } from "@/integrations/Core";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { DragDropContext } from "@hello-pangea/dnd";

import EditorToolbar from "../components/editor/EditorToolbar";
import PageManager from "../components/editor/PageManager";
import PageEditor from "../components/editor/PageEditor";
import { Skeleton } from "@/components/ui/skeleton";

export default function Editor() {
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [selectedPage, setSelectedPage] = useState(0);
  const [error, setError] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false); // New state for export modal

  const getBookId = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
  };

  const loadBook = useCallback(async () => {
    const bookId = getBookId();
    if (!bookId) {
      navigate(createPageUrl("Library"));
      return;
    }
    setIsLoading(true);
    try {
      const results = await Book.filter({ id: bookId });
      if (results && results.length > 0) {
        const fetchedBook = results[0];
        setBook(fetchedBook);
        setSelectedPage(fetchedBook.pages[0]?.page_number || 1);
      } else {
        setError("Could not find the book.");
      }
    } catch (err) {
      console.error("Error loading book:", err);
      setError("Could not load the book. Please try again.");
    }
    setIsLoading(false);
  }, [navigate]);

  const checkAuthAndLoad = async () => {
    try {
      const authenticated = await base44.auth.isAuthenticated();
      if (!authenticated) {
        base44.auth.redirectToLogin(window.location.href);
        return;
      }
      setIsCheckingAuth(false);
      loadBook();
    } catch (error) {
      console.error("Authentication check failed:", error);
      base44.auth.redirectToLogin(window.location.href);
    }
  };

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  const handleSave = async () => {
    if (!book) return;
    setIsSaving(true);
    try {
      // Exclude public_book_id and is_public from the main book update
      // as these are specifically handled by the public toggle function.
      const { public_book_id, is_public, ...bookDataToSave } = book;
      await Book.update(book.id, bookDataToSave);

      // If book is public, update the public version as well
      if (is_public && public_book_id) {
        // For PublicBook, exclude id, created_by, created_date, updated_date
        // as these are specific to the user's private book record.
        // bookDataToSave already contains the content fields.
        const { id: bookId, created_by: cb, created_date: cd, updated_date: ud, ...publicBookData } = bookDataToSave;
        await PublicBook.update(public_book_id, publicBookData);
      }
    } catch (err) {
      console.error("Error saving book:", err);
      setError("Could not save the book. Please try again.");
    }
    setIsSaving(false);
  };

  const handlePublicToggle = async (isPublic) => {
    if (!book) return;
    // Optimistically update UI
    const originalBook = book;
    setBook(prev => ({ ...prev, is_public: isPublic }));

    try {
      if (isPublic) {
        // Toggling to Public: Create a new public book record
        // Prepare data for the PublicBook entity, excluding private-book specific metadata
        const { id, created_by, created_date, updated_date, is_public, public_book_id, ...publicBookData } = book;
        const newPublicBook = await PublicBook.create(publicBookData);
        // Update the original book with the new public status and the ID of the public record
        await Book.update(book.id, { is_public: true, public_book_id: newPublicBook.id });
        setBook(prev => ({ ...prev, public_book_id: newPublicBook.id }));
      } else {
        // Toggling to Private: Delete the public book record if it exists
        if (book.public_book_id) {
          await PublicBook.delete(book.public_book_id);
        }
        // Update the original book to private and remove the public book ID link
        await Book.update(book.id, { is_public: false, public_book_id: null });
        setBook(prev => ({ ...prev, public_book_id: null }));
      }
    } catch (err) {
      console.error("Error updating public status:", err);
      // Revert if API call fails
      setBook(originalBook);
      setError("Could not update public status. Please try again.");
    }
  };

  const handleRegenerate = async () => {
    if (!book) return;
    setIsRegenerating(true);
    setError(null);
    
    try {
      // First, regenerate the story outline
      const outlineResult = await InvokeLLM({
        prompt: `Create a children's story outline based on this idea: "${book.idea}"

Age group: ${book.age_group} years old
Focus topic: ${book.focus_topic}
Title: ${book.title}
Story length: ${book.page_length} pages

Please create a detailed outline that includes:
1. A brief story summary (2-3 sentences)
2. Main characters with descriptions
3. Key lessons or messages
4. A ${book.page_length}-page story structure with brief descriptions of what happens on each page

Make sure the content is age-appropriate, engaging, and educational for the specified focus topic. The story should be properly paced for ${book.page_length} pages.`,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            characters: { type: "string" },
            lessons: { type: "string" },
            pages: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  page_number: { type: "number" },
                  description: { type: "string" }
                }
              }
            }
          }
        }
      });

      // Then generate the full story content
      const storyResult = await InvokeLLM({
        prompt: `Based on this story outline, create full page content for a children's book:

Title: ${book.title}
Age group: ${book.age_group} years
Focus topic: ${book.focus_topic}
Story length: ${book.page_length} pages
Outline: ${JSON.stringify(outlineResult)}

Create ${book.page_length} pages of age-appropriate content. Each page should have:
- Engaging text suitable for ${book.age_group} year olds (2-4 sentences per page for shorter stories, 3-6 sentences for longer stories)
- A detailed illustration prompt that maintains character consistency and matches the page text
- Educational elements related to ${book.focus_topic}

Make sure the story flows well across all ${book.page_length} pages and teaches the intended lesson in an engaging way.`,
        response_json_schema: {
          type: "object",
          properties: {
            pages: {
              type: "array",
              items: { 
                "type": "object", 
                "properties": { 
                  "page_number": { "type": "number" }, 
                  "text": { "type": "string" }, 
                  "illustration_prompt": { "type": "string" } 
                }, 
                "required": ["page_number", "text", "illustration_prompt"] 
              }
            },
            character_description: { type: "string" }
          },
          required: ["pages", "character_description"]
        }
      });
      
      // Generate new images sequentially to avoid overwhelming the API
      const pagesWithImages = [];
      for (const page of storyResult.pages) {
        try {
          const imageResult = await GenerateImage({
            prompt: `${page.illustration_prompt}, ${storyResult.character_description}, ${book.illustration_style} style`
          });
          pagesWithImages.push({ ...page, illustration_url: imageResult.url });
        } catch (imageError) {
          console.error("Error generating image for page:", page.page_number, imageError);
          // Keep the page but without the new image
          pagesWithImages.push({ ...page, illustration_url: "" });
        }
      }
      
      // Generate new cover image
      let coverImageUrl = book.cover_image_url;
      try {
        const coverResult = await GenerateImage({
          prompt: `Children's book cover for "${book.title}". Style: ${book.illustration_style}. Featuring: ${storyResult.character_description}. Theme: ${book.focus_topic}. Mood is bright, cheerful, and welcoming for ages ${book.age_group}.`
        });
        coverImageUrl = coverResult.url;
      } catch (coverError) {
        console.error("Error generating cover image:", coverError);
        // Keep the existing cover if new one fails
      }

      // Update the book with new content
      const updatedBookData = {
        story_outline: JSON.stringify(outlineResult),
        pages: pagesWithImages,
        character_description: storyResult.character_description,
        cover_image_url: coverImageUrl,
        status: "completed"
      };

      await Book.update(book.id, updatedBookData);
      
      const fullUpdatedBook = { ...book, ...updatedBookData };
      setBook(fullUpdatedBook);

      // If the book was public, update the public record too
      if (fullUpdatedBook.is_public && fullUpdatedBook.public_book_id) {
        await PublicBook.update(fullUpdatedBook.public_book_id, updatedBookData);
      }

      setSelectedPage(1);
      
    } catch (error) {
      console.error("Error regenerating story:", error);
      setError("Failed to regenerate the story. Please try again.");
    } finally {
      setIsRegenerating(false);
    }
  };

  const handlePageUpdate = (updatedPage) => {
    setBook((prevBook) => {
      const newPages = prevBook.pages.map((p) =>
        p.page_number === updatedPage.page_number ? updatedPage : p
      );
      return { ...prevBook, pages: newPages };
    });
  };
  
  const handlePageOrderChange = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(book.pages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    const newPages = items.map((p, index) => ({ ...p, page_number: index + 1 }));
    setBook(prev => ({...prev, pages: newPages}));
    
    // Adjust selected page if it was moved
    const newIndexOfSelected = newPages.findIndex(p => p.illustration_prompt === book.pages.find(pg => pg.page_number === selectedPage)?.illustration_prompt);
    if(newIndexOfSelected !== -1) {
      setSelectedPage(newIndexOfSelected + 1);
    }
  };

  // New handler for export functionality
  const handleExport = useCallback(() => {
    console.log("Export functionality triggered for book:", book);
    setShowExportModal(true); // Open the export modal
  }, [book]);

  const handleExportPdf = () => {
    if (!book) return;

    // Create a temporary iframe or new window to render content for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Please allow pop-ups for PDF export.");
      return;
    }

    // Construct the HTML content for the PDF export
    let contentHtml = `
      <!DOCTYPE html>
      <html>
      <head>
          <title>${book.title}</title>
          <style>
              body { font-family: sans-serif; margin: 20mm; }
              h1 { text-align: center; margin-bottom: 30px; }
              .page { page-break-after: always; margin-bottom: 20mm; }
              .page:last-child { page-break-after: avoid; }
              .page-number { text-align: right; font-size: 0.8em; color: #888; margin-bottom: 10px; }
              .page-text { font-size: 1.2em; line-height: 1.6; margin-bottom: 20px; }
              .page-image { max-width: 100%; height: auto; display: block; margin: 0 auto; border: 1px solid #eee; }
              .cover-image { width: 100%; max-height: 80vh; object-fit: contain; margin-bottom: 40px; }
          </style>
      </head>
      <body>
          <h1>${book.title}</h1>
          ${book.cover_image_url ? `<div style="text-align:center;"><img src="${book.cover_image_url}" alt="Book Cover" class="cover-image"></div>` : ''}
          ${book.pages.map(page => `
              <div class="page">
                  <div class="page-number">Page ${page.page_number}</div>
                  <p class="page-text">${page.text}</p>
                  ${page.illustration_url ? `<img src="${page.illustration_url}" alt="Illustration for page ${page.page_number}" class="page-image">` : ''}
              </div>
          `).join('')}
      </body>
      </html>
    `;

    printWindow.document.write(contentHtml);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print(); // Trigger the browser's print dialog
    setShowExportModal(false); // Close the export modal
  };

  const handleExportRtf = () => {
    if (!book) return;

    // Basic RTF structure
    let rtfContent = `{\\rtf1\\ansi\\deff0\n`;
    rtfContent += `{\\fonttbl{\\f0\\fswiss\\fcharset0 Arial;}}\n`;
    rtfContent += `{\\pard\\sa200\\sl276\\slmult1\\f0\\fs24\n`; // Default paragraph formatting

    // Title
    rtfContent += `\\qc\\b\\fs48 ${book.title}\\par\n`; // Centered, bold, larger font
    rtfContent += `\\par\n`; // Blank line

    // Cover Image Placeholder (RTF has complex image embedding, so we'll just link or describe)
    if (book.cover_image_url) {
        rtfContent += `\\qc {\\f0\\fs24 [Cover Image: ${book.cover_image_url}]}\\par\n`;
        rtfContent += `\\par\n`;
    }

    // Pages content
    book.pages.forEach(page => {
      rtfContent += `\\page\n`; // Page break
      rtfContent += `\\ql\\b Page ${page.page_number}\\par\n`; // Left align, bold page number
      // Replace newlines with RTF paragraph breaks, escape backslashes and braces
      const escapedText = page.text.replace(/\\/g, '\\\\').replace(/{/g, '\\{').replace(/}/g, '\\}').replace(/\n/g, '\\par ');
      rtfContent += `\\pard\\sa200\\sl276\\slmult1\\f0\\fs24 ${escapedText}\\par\n`; // Page text
      if (page.illustration_url) {
        rtfContent += `\\pard\\qc {\\f0\\fs24 [Illustration for page ${page.page_number}: ${page.illustration_url}]}\\par\n`;
      }
      rtfContent += `\\par\n`;
    });

    rtfContent += `}`; // End RTF document

    // Create a Blob and trigger download
    const blob = new Blob([rtfContent], { type: 'application/rtf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    // Sanitize book title for filename
    const filename = `${book.title.replace(/[^a-zA-Z0-9_.-]/g, '_')}.rtf`;
    a.download = filename;
    document.body.appendChild(a); // Append to body to make it clickable
    a.click(); // Programmatically click the link
    document.body.removeChild(a); // Clean up the temporary link
    URL.revokeObjectURL(url); // Release the object URL
    setShowExportModal(false); // Close the export modal
  };

  const currentPageData = book?.pages.find((p) => p.page_number === selectedPage);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--mindbloom-background))' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="w-80 border-r p-4 space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="flex-1 p-8 space-y-4">
          <Skeleton className="h-12 w-1/2" />
          <Skeleton className="w-full h-96" />
          <Skeleton className="w-full h-32" />
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        {error || "Book not found."}
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handlePageOrderChange}>
      <div className="flex flex-col h-screen" style={{ backgroundColor: 'hsl(var(--mindbloom-background))' }}>
        <EditorToolbar
          book={book} // Changed to pass the entire book object
          onTitleChange={(newTitle) => setBook({ ...book, title: newTitle })}
          onSave={handleSave}
          isSaving={isSaving}
          onRegenerate={handleRegenerate}
          isRegenerating={isRegenerating}
          onPublicToggle={handlePublicToggle}
          onExport={handleExport} // New prop for export functionality
        />
        {isRegenerating && (
          <div className="bg-blue-50 border-b border-blue-200 p-4">
            <div className="flex items-center gap-3 text-blue-800">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Regenerating your story... This may take a few moments.</span>
            </div>
          </div>
        )}
        <div className="flex flex-1 overflow-hidden">
          <PageManager
            pages={book.pages}
            selectedPage={selectedPage}
            onSelectPage={setSelectedPage}
          />
          <main className="flex-1 p-8 overflow-y-auto">
            {currentPageData ? (
              <PageEditor
                page={currentPageData}
                onUpdate={handlePageUpdate}
                bookCharacterDescription={book.character_description}
                bookIllustrationStyle={book.illustration_style}
                disabled={isRegenerating}
              />
            ) : (
              <div className="text-center text-gray-500">Select a page to start editing.</div>
            )}
          </main>
        </div>

        {/* Export Modal UI */}
        {showExportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-w-md">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Export Book</h2>
              <p className="mb-4 text-gray-700">Choose your desired export format:</p>
              <div className="space-y-3">
                <button 
                  className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition ease-in-out duration-150"
                  onClick={handleExportPdf} // Placeholder action
                >
                  Export as PDF
                </button>
                <button 
                  className="w-full bg-emerald-600 text-white py-2 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50 transition ease-in-out duration-150"
                  onClick={handleExportRtf} // Placeholder action
                >
                  Export as RTF
                </button>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="mt-6 w-full bg-gray-200 text-gray-800 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50 transition ease-in-out duration-150"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </DragDropContext>
  );
}
