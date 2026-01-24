
import React, { useState } from "react";
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Copy, Share2, Globe, Lock, FileText, FileDown, Loader2 } from "lucide-react";
import { createPageUrl } from "@/utils";
import { Book } from "@/entities/Book";
import { PublicBook } from "@/entities/PublicBook";

// PDF Generation Function
const generatePdfDownload = async (book) => {
  const pageSize = getPageDimensions(book.print_format);
  
  // Create a new window for PDF generation
  const pdfWindow = window.open('', '_blank', 'width=800,height=1000');
  
  if (!pdfWindow) {
    alert('Please allow popups to download PDF');
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${book.title}</title>
        <style>
          @page {
            size: ${pageSize.css};
            margin: 15mm;
          }
          * { box-sizing: border-box; }
          body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 0;
            color: #333;
            line-height: 1.4;
          }
          .page {
            width: 100vw;
            height: 100vh;
            page-break-after: always;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 20mm;
            position: relative;
          }
          .page:last-child {
            page-break-after: avoid;
          }
          .cover-page {
            text-align: center;
            justify-content: center;
          }
          .cover-page h1 {
            font-size: 2.5em;
            margin: 20px 0 10px 0; /* Adjusted margin-bottom */
            color: #2c3e50;
          }
          .cover-page .author { /* New CSS for author name */
            font-size: 1.2em;
            color: #666;
            margin-bottom: 20px;
            font-style: italic;
          }
          .cover-image {
            max-width: 60%;
            max-height: 50%;
            object-fit: contain;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          .story-page {
            gap: 20px;
          }
          .page-text {
            font-size: 18px;
            line-height: 1.6;
            text-align: left;
            max-width: 100%;
            word-wrap: break-word;
          }
          .page-image {
            max-width: 100%;
            max-height: 50%;
            object-fit: contain;
            border-radius: 8px;
          }
          .layout-image-bottom {
            flex-direction: column-reverse;
          }
          .layout-image-left {
            flex-direction: row;
            align-items: flex-start;
          }
          .layout-image-right {
            flex-direction: row-reverse;
            align-items: flex-start;
          }
          .layout-image-left .page-image,
          .layout-image-right .page-image {
            max-width: 45%;
            max-height: 80%;
          }
          .layout-image-left .page-text,
          .layout-image-right .page-text {
            flex: 1;
            padding: 0 20px;
          }
          .layout-full-image {
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
          }
          .layout-full-image .page-text {
            position: absolute;
            bottom: 15%;
            left: 10%;
            right: 10%;
            background: rgba(255, 255, 255, 0.9);
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          @media print {
            body { print-color-adjust: exact; }
            .page { margin: 0; }
          }
        </style>
      </head>
      <body>
        <!-- Cover Page -->
        <div class="page cover-page">
          ${book.cover_image_url ? `<img src="${book.cover_image_url}" class="cover-image" alt="Cover">` : ''}
          <h1>${book.title}</h1>
          ${book.author_name ? `<p class="author">by ${book.author_name}</p>` : ''} <!-- Added author name -->
          <p style="font-size: 16px; color: #666;">Ages ${book.age_group} • ${book.focus_topic?.replace(/_/g, ' ')}</p>
        </div>
        
        ${book.pages.map(page => {
          const layout = page.layout || 'image-top';
          
          if (layout === 'full-image' && page.illustration_url) {
            return `
              <div class="page story-page layout-full-image" style="background-image: url('${page.illustration_url}');">
                <div class="page-text">${page.text || ''}</div>
              </div>
            `;
          } else if (layout === 'text-only') {
            return `
              <div class="page story-page">
                <div class="page-text">${page.text || ''}</div>
              </div>
            `;
          } else {
            return `
              <div class="page story-page layout-${layout}">
                ${page.illustration_url ? `<img src="${page.illustration_url}" class="page-image" alt="Page ${page.page_number}">` : ''}
                <div class="page-text">${page.text || ''}</div>
              </div>
            `;
          }
        }).join('')}
      </body>
    </html>
  `;

  pdfWindow.document.write(html);
  pdfWindow.document.close();

  // Wait for images to load, then trigger download
  pdfWindow.onload = () => {
    setTimeout(() => {
      pdfWindow.print();
      pdfWindow.close();
    }, 1000);
  };
};

const getPageDimensions = (format) => {
  switch (format) {
    case "A4 Portrait": return { css: 'A4 portrait' };
    case "US Letter Portrait": return { css: 'letter portrait' };
    case "A5 Portrait":
    default: return { css: 'A5 portrait' };
  }
};

const generateWordDownload = async (book) => {
  // Get paper size settings based on book format
  const getPaperSettings = (format) => {
    switch (format) {
      case "A4 Portrait":
        return {
          size: "A4",
          width: "8.27in",
          height: "11.69in",
          margin: "1in",
          fontSize: "12pt",
          titleSize: "24pt"
        };
      case "US Letter Portrait":
        return {
          size: "letter",
          width: "8.5in", 
          height: "11in",
          margin: "1in",
          fontSize: "12pt",
          titleSize: "24pt"
        };
      case "A5 Portrait":
      default:
        return {
          size: "A5",
          width: "5.83in",
          height: "8.27in", 
          margin: "0.7in",
          fontSize: "11pt",
          titleSize: "20pt"
        };
    }
  };

  const paperSettings = getPaperSettings(book.print_format);

  const wordContent = `
    <!DOCTYPE html>
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${book.title}</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>90</w:Zoom>
          <w:DoNotPromptForConvert/>
          <w:DoNotShowRevisions/>
          <w:DoNotPrintRevisions/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        @page {
          size: ${paperSettings.size};
          width: ${paperSettings.width};
          height: ${paperSettings.height};
          margin: ${paperSettings.margin};
        }
        body {
          font-family: 'Times New Roman', serif;
          font-size: ${paperSettings.fontSize};
          line-height: 1.5;
          color: #000;
          background: white;
          width: 100%;
          height: 100%;
        }
        .cover-page {
          text-align: center;
          page-break-after: always;
          padding: ${book.print_format === 'A5 Portrait' ? '1.5in 0' : '2in 0'};
        }
        .cover-title {
          font-size: ${paperSettings.titleSize};
          font-weight: bold;
          margin: 20px 0;
          color: #2c3e50;
        }
        .cover-author {
          font-size: ${book.print_format === 'A5 Portrait' ? '12pt' : '14pt'};
          font-style: italic;
          color: #666;
          margin: 10px 0;
        }
        .cover-details {
          font-size: ${book.print_format === 'A5 Portrait' ? '10pt' : '12pt'};
          color: #666;
          margin-top: 20px;
        }
        .cover-image {
          max-width: ${book.print_format === 'A5 Portrait' ? '280px' : '400px'};
          max-height: ${book.print_format === 'A5 Portrait' ? '200px' : '300px'};
          margin: 15px auto;
          display: block;
          border: 1px solid #ddd;
        }
        .page-break {
          page-break-before: always;
        }
        .story-page {
          margin-bottom: ${book.print_format === 'A5 Portrait' ? '20px' : '30px'};
          min-height: ${book.print_format === 'A5 Portrait' ? '300px' : '500px'};
        }
        .page-number {
          font-size: ${book.print_format === 'A5 Portrait' ? '9pt' : '10pt'};
          color: #666;
          margin-bottom: 10px;
          font-weight: bold;
        }
        .page-text {
          font-size: ${book.print_format === 'A5 Portrait' ? '12pt' : '14pt'};
          line-height: 1.6;
          margin: 10px 0;
          text-align: justify;
        }
        .page-image {
          max-width: 100%;
          height: auto;
          margin: 10px auto;
          display: block;
          border: 1px solid #ddd;
        }
        .layout-image-left {
          display: table;
          width: 100%;
        }
        .layout-image-left .image-cell {
          display: table-cell;
          width: 45%;
          vertical-align: top;
          padding-right: ${book.print_format === 'A5 Portrait' ? '15px' : '20px'};
        }
        .layout-image-left .text-cell {
          display: table-cell;
          width: 55%;
          vertical-align: top;
        }
        .layout-image-right {
          display: table;
          width: 100%;
        }
        .layout-image-right .text-cell {
          display: table-cell;
          width: 55%;
          vertical-align: top;
          padding-right: ${book.print_format === 'A5 Portrait' ? '15px' : '20px'};
        }
        .layout-image-right .image-cell {
          display: table-cell;
          width: 45%;
          vertical-align: top;
        }
        .end-page {
          text-align: center;
          font-size: ${book.print_format === 'A5 Portrait' ? '16pt' : '18pt'};
          font-weight: bold;
          color: #2c3e50;
          padding-top: ${book.print_format === 'A5 Portrait' ? '1.5in' : '2in'};
        }
      </style>
    </head>
    <body>
      <!-- Cover Page -->
      <div class="cover-page">
        ${book.cover_image_url ? `<img src="${book.cover_image_url}" class="cover-image" alt="Cover Image">` : ''}
        <div class="cover-title">${book.title}</div>
        ${book.author_name ? `<div class="cover-author">by ${book.author_name}</div>` : ''}
        <div class="cover-details">
          <p>Target Age: ${book.age_group} years</p>
          <p>Focus: ${book.focus_topic?.replace(/_/g, ' ')}</p>
          <p>Pages: ${book.pages.length}</p>
          <p>Format: ${book.print_format}</p>
        </div>
      </div>
      
      <!-- Story Pages -->
      ${book.pages.map((page, index) => {
        const layout = page.layout || 'image-top';
        let pageHTML = `<div class="story-page ${index > 0 ? 'page-break' : ''}">`;
        pageHTML += `<div class="page-number">Page ${page.page_number}</div>`;
        
        switch (layout) {
          case 'image-top':
            if (page.illustration_url) {
              pageHTML += `<img src="${page.illustration_url}" class="page-image" alt="Page ${page.page_number} illustration">`;
            }
            pageHTML += `<div class="page-text">${page.text || ''}</div>`;
            break;
            
          case 'image-bottom':
            pageHTML += `<div class="page-text">${page.text || ''}</div>`;
            if (page.illustration_url) {
              pageHTML += `<img src="${page.illustration_url}" class="page-image" alt="Page ${page.page_number} illustration">`;
            }
            break;
            
          case 'image-left':
            pageHTML += `<div class="layout-image-left">`;
            pageHTML += `<div class="image-cell">`;
            if (page.illustration_url) {
              pageHTML += `<img src="${page.illustration_url}" class="page-image" alt="Page ${page.page_number} illustration" style="max-width: 100%;">`;
            }
            pageHTML += `</div>`;
            pageHTML += `<div class="text-cell">`;
            pageHTML += `<div class="page-text">${page.text || ''}</div>`;
            pageHTML += `</div></div>`;
            break;
            
          case 'image-right':
            pageHTML += `<div class="layout-image-right">`;
            pageHTML += `<div class="text-cell">`;
            pageHTML += `<div class="page-text">${page.text || ''}</div>`;
            pageHTML += `</div>`;
            pageHTML += `<div class="image-cell">`;
            if (page.illustration_url) {
              pageHTML += `<img src="${page.illustration_url}" class="page-image" alt="Page ${page.page_number} illustration" style="max-width: 100%;">`;
            }
            pageHTML += `</div></div>`;
            break;
            
          case 'full-image':
            if (page.illustration_url) {
              pageHTML += `<img src="${page.illustration_url}" class="page-image" alt="Page ${page.page_number} illustration" style="width: 100%; height: auto;">`;
            }
            pageHTML += `<div class="page-text" style="background: rgba(255,255,255,0.9); padding: 15px; margin: 10px 0; border-radius: 5px;">${page.text || ''}</div>`;
            break;
            
          case 'text-only':
          default:
            pageHTML += `<div class="page-text">${page.text || ''}</div>`;
            break;
        }
        
        pageHTML += `</div>`;
        return pageHTML;
      }).join('')}
      
      <!-- End Page -->
      <div class="page-break">
        <div class="end-page">The End</div>
      </div>
      
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', wordContent], {
    type: 'application/msword'
  });
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${book.title.replace(/[^a-zA-Z0-9]/g, '_')}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export default function ReaderShareModal({ book }) {
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isPublic, setIsPublic] = useState(book?.is_public || false);
  const [publicBookId, setPublicBookId] = useState(book?.public_book_id || null);

  if (!book) return null;

  const publicUrl = isPublic && publicBookId 
    ? `${window.location.origin}${createPageUrl(`Reader?id=${publicBookId}&public=true`)}`
    : null;

  const handleCopy = async () => {
    if (publicUrl) {
      try {
        await navigator.clipboard.writeText(publicUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy URL:', err);
      }
    }
  };

  const handlePublicToggle = async (newStatus) => {
    try {
      if (newStatus) {
        // Making public - create PublicBook
        const { id, created_by, created_date, updated_date, is_public, public_book_id, ...publicBookData } = book;
        const newPublicBook = await PublicBook.create(publicBookData);
        await Book.update(book.id, { is_public: true, public_book_id: newPublicBook.id });
        setPublicBookId(newPublicBook.id);
      } else {
        // Making private - delete PublicBook
        if (publicBookId) {
          await PublicBook.delete(publicBookId);
        }
        await Book.update(book.id, { is_public: false, public_book_id: null });
        setPublicBookId(null);
      }
      setIsPublic(newStatus);
    } catch (error) {
      console.error("Failed to update book visibility:", error);
    }
  };

  const handlePdfDownload = async () => {
    setIsExporting(true);
    try {
      await generatePdfDownload(book);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
    setIsExporting(false);
  };

  const handleWordDownload = async () => {
    setIsExporting(true);
    try {
      await generateWordDownload(book);
    } catch (error) {
      console.error("Error generating Word document:", error);
    }
    setIsExporting(false);
  };

  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Share2 className="w-5 h-5" />
          Share & Export "{book.title}"
        </DialogTitle>
        <DialogDescription>
          Share your story with others or export it for printing and offline reading.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        {/* Public Sharing Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="public-toggle" className="flex items-center gap-2">
              {isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              Make Public
            </Label>
            <Switch
              id="public-toggle"
              checked={isPublic}
              onCheckedChange={handlePublicToggle}
            />
          </div>
          
          {isPublic && publicUrl ? (
            <div className="space-y-2">
              <Label htmlFor="public-url">Public Link</Label>
              <div className="flex gap-2">
                <Input
                  id="public-url"
                  value={publicUrl}
                  readOnly
                  className="flex-1"
                />
                <Button 
                  onClick={handleCopy}
                  variant="outline" 
                  size="icon"
                  className={copied ? "bg-green-50 border-green-200" : ""}
                >
                  {copied ? (
                    <span className="text-green-600">✓</span>
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                Anyone with this link can read your story
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center">
              Toggle to enable public sharing and generate a shareable link.
            </p>
          )}
        </div>

        {/* Export Section */}
        <div className="space-y-4">
          <h4 className="font-semibold flex items-center gap-2">
            <FileDown className="w-4 h-4" />
            Export Options
          </h4>
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handlePdfDownload}
              disabled={isExporting}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              PDF
            </Button>
            
            <Button
              onClick={handleWordDownload}
              disabled={isExporting}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              Word
            </Button>
          </div>
          
          <p className="text-sm text-gray-500">
            Download your story as a PDF or Word document for printing or sharing offline.
          </p>
        </div>
      </div>
    </DialogContent>
  );
}
