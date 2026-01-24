import React, { useState } from "react";
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Copy, Share2, Globe, Lock, FileText, FileDown, Loader2 } from "lucide-react";
import { createPageUrl } from "@/utils";

// --- Export Logic ---

const getPageSize = (format) => {
    switch (format) {
        case "A4 Portrait": return { width: '210mm', height: '297mm' };
        case "US Letter Portrait": return { width: '8.5in', height: '11in' };
        case "A5 Portrait":
        default:
            return { width: '148mm', height: '210mm' };
    }
};

const convertImageToHex = async (imageUrl) => {
    try {
        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        let hex = '';
        for (let i = 0; i < bytes.length; i++) {
            hex += bytes[i].toString(16).padStart(2, '0');
        }
        return hex;
    } catch (error) {
        console.error('Error converting image to hex:', error);
        return null;
    }
};

const getImageDimensions = (imageUrl) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            resolve({ width: img.naturalWidth, height: img.naturalHeight });
        };
        img.onerror = () => {
            console.warn(`Could not load image to get dimensions: ${imageUrl}. Using default.`);
            resolve({ width: 640, height: 480 }); // Default dimensions in pixels
        };
        img.src = imageUrl;
    });
};

const generateRtfDocument = async (book) => {
    let rtfContent = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}{\\colortbl;\\red0\\green0\\blue0;\\red255\\green255\\blue255;}}`;
    
    // Document info with author
    rtfContent += `{\\info{\\title ${book.title}}{\\author ${book.author_name || ''}}}`;
    
    // Page setup based on book format
    const pageSetup = book.print_format === "A4 Portrait" ? 
        "\\paperw11906\\paperh16838\\margl1440\\margr1440\\margt1440\\margb1440" :
        book.print_format === "US Letter Portrait" ?
        "\\paperw12240\\paperh15840\\margl1440\\margr1440\\margt1440\\margb1440" :
        "\\paperw8391\\paperh11906\\margl1440\\margr1440\\margt1440\\margb1440"; // A5
    
    rtfContent += pageSetup;
    
    // Cover page with author
    rtfContent += `\\f0\\fs48\\qc\\b ${book.title}\\b0\\par`;
    if (book.author_name) {
        rtfContent += `\\fs24 by ${book.author_name}\\par\\par`;
    } else {
        rtfContent += `\\par\\par`;
    }

    // Cover image
    if (book.cover_image_url) {
        try {
            const dimensions = await getImageDimensions(book.cover_image_url);
            const hexData = await convertImageToHex(book.cover_image_url);
            
            if (hexData) {
                // RTF uses twips (1/20th of a point). 1 inch = 1440 twips. For typical 96 DPI screen, 1 pixel ~ 15 twips.
                const originalWidthTwips = dimensions.width * 15;
                const originalHeightTwips = dimensions.height * 15;
                
                // Goal dimensions for cover image (e.g., max 4000 twips width, 3000 twips height, maintaining aspect ratio)
                let finalGoalWidth = Math.min(4000, originalWidthTwips);
                let finalGoalHeight = Math.min(3000, originalHeightTwips);

                // Adjust goal dimensions to maintain aspect ratio
                if (originalWidthTwips > 0 && originalHeightTwips > 0) {
                    const aspectRatio = originalWidthTwips / originalHeightTwips;
                    if (finalGoalWidth / finalGoalHeight > aspectRatio) {
                        finalGoalWidth = finalGoalHeight * aspectRatio;
                    } else {
                        finalGoalHeight = finalGoalWidth / aspectRatio;
                    }
                }

                rtfContent += `\\par{\\pict\\jpegblip\\picw${originalWidthTwips}\\pich${originalHeightTwips}\\picwgoal${Math.round(finalGoalWidth)}\\pichgoal${Math.round(finalGoalHeight)} ${hexData}}\\par\\par`;
            } else {
                rtfContent += `\\par[Cover Image: ${book.title}]\\par\\par`;
            }
        } catch (error) {
            console.error('Error embedding cover image in RTF:', error);
            rtfContent += `\\par[Cover Image: ${book.title}]\\par\\par`;
        }
    }
    
    rtfContent += `\\fs24 Age Group: ${book.age_group}\\par`;
    rtfContent += `Focus: ${book.focus_topic.replace(/_/g, ' ')}\\par`;
    rtfContent += `\\page`;

    // Story pages
    let pageNum = 1; // Start page numbering
    for (let i = 0; i < book.pages.length; i++) {
        const page = book.pages[i];
        rtfContent += `\\fs28\\par`;
        
        // Page number
        rtfContent += `\\fs20\\i Page ${pageNum++}\\i0\\fs28\\par\\par`;
        
        let imageHex = null;
        let imageDimensions = null;
        
        // Get image data if exists
        if (page.illustration_url) {
            try {
                imageDimensions = await getImageDimensions(page.illustration_url);
                imageHex = await convertImageToHex(page.illustration_url);
            } catch (error) {
                console.error('Error processing image for page:', page.illustration_url, error);
            }
        }
        
        // Define common goal dimensions in twips
        const defaultImageGoalWidth = 5000; // ~3.5 inches
        const defaultImageGoalHeight = 3750; // ~2.6 inches
        const sideImageGoalWidth = 2500; // ~1.7 inches
        const sideImageGoalHeight = 1875; // ~1.3 inches
        const fullImageGoalWidth = 7000; // ~4.8 inches
        const fullImageGoalHeight = 9000; // ~6.25 inches (taller for portrait)

        // Helper to format image RTF
        const formatRtfImage = (hex, dims, goalW, goalH) => {
            const originalWidthTwips = dims.width * 15;
            const originalHeightTwips = dims.height * 15;

            let finalGoalWidth = goalW;
            let finalGoalHeight = goalH;

            // Adjust goal dimensions to maintain aspect ratio
            if (originalWidthTwips > 0 && originalHeightTwips > 0) {
                const aspectRatio = originalWidthTwips / originalHeightTwips;
                if (finalGoalWidth / finalGoalHeight > aspectRatio) {
                    finalGoalWidth = finalGoalHeight * aspectRatio;
                } else {
                    finalGoalHeight = finalGoalWidth / aspectRatio;
                }
            }
            
            return `{\\pict\\jpegblip\\picw${originalWidthTwips}\\pich${originalHeightTwips}\\picwgoal${Math.round(finalGoalWidth)}\\pichgoal${Math.round(finalGoalHeight)} ${hex}}`;
        };

        // Handle different layouts with actual images
        switch (page.layout) {
            case 'image-top':
                if (imageHex && imageDimensions) {
                    rtfContent += `\\qc${formatRtfImage(imageHex, imageDimensions, defaultImageGoalWidth, defaultImageGoalHeight)}\\par\\par`;
                }
                rtfContent += `\\ql${page.text}\\par`;
                break;
                
            case 'image-bottom':
                rtfContent += `\\ql${page.text}\\par\\par`;
                if (imageHex && imageDimensions) {
                    rtfContent += `\\qc${formatRtfImage(imageHex, imageDimensions, defaultImageGoalWidth, defaultImageGoalHeight)}\\par`;
                }
                break;
                
            case 'image-left':
                if (imageHex && imageDimensions) {
                    rtfContent += `${formatRtfImage(imageHex, imageDimensions, sideImageGoalWidth, sideImageGoalHeight)}\\tab\\tab`;
                }
                rtfContent += `${page.text}\\par`;
                break;
                
            case 'image-right':
                rtfContent += `${page.text}\\tab\\tab`;
                if (imageHex && imageDimensions) {
                    rtfContent += `${formatRtfImage(imageHex, imageDimensions, sideImageGoalWidth, sideImageGoalHeight)}`;
                }
                rtfContent += `\\par`;
                break;
                
            case 'text-only':
                rtfContent += `\\ql${page.text}\\par`;
                break;
                
            case 'full-image':
                if (imageHex && imageDimensions) {
                    rtfContent += `\\qc${formatRtfImage(imageHex, imageDimensions, fullImageGoalWidth, fullImageGoalHeight)}\\par`;
                }
                // Add text overlay effect with background
                rtfContent += `\\par\\fs20\\qc\\highlight2 ${page.text}\\highlight0\\fs28\\par`;
                break;
                
            default: // Fallback behavior for unhandled or default layouts
                if (imageHex && imageDimensions) {
                    rtfContent += `\\qc${formatRtfImage(imageHex, imageDimensions, defaultImageGoalWidth, defaultImageGoalHeight)}\\par\\par`;
                }
                rtfContent += `\\ql${page.text}\\par`;
        }
        
        // Add page break except for the last page
        if (i < book.pages.length - 1) {
            rtfContent += `\\page`;
        }
    }
    
    rtfContent += `}`;
    return rtfContent;
};

const exportToPdf = (book) => {
    return new Promise((resolve, reject) => {
        const pageSize = getPageSize(book.print_format);

        let printHtml = `
            <html>
                <head>
                    <title>${book.title}</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
                        @page { size: ${pageSize.width} ${pageSize.height}; margin: 20mm; }
                        body { font-family: 'Roboto', sans-serif; color: #333; }
                        .page { page-break-after: always; width: 100%; height: 100%; display: flex; gap: 1rem; align-items: center; justify-content: center; }
                        .page:last-child { page-break-after: avoid; }
                        .cover-page { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
                        .cover-image { max-width: 80%; max-height: 60%; object-fit: contain; margin-bottom: 2rem; }
                        .cover-title { font-size: 2.5em; font-weight: bold; margin-bottom: 0.5rem; }
                        .cover-author { font-size: 1.2em; color: #666; }
                        .page-content { font-size: 16pt; line-height: 1.6; white-space: pre-wrap; flex: 1; }
                        .page-image { max-width: 100%; max-height: 45%; object-fit: contain; }
                        .page.layout-image-left, .page.layout-image-right { flex-direction: row; }
                        .page.layout-image-bottom { flex-direction: column-reverse; }
                        .page.layout-image-left .page-image, .page.layout-image-right .page-image { max-width: 45%; max-height: 100%; }
                        .full-image-page { background-size: cover; background-position: center; background-repeat: no-repeat; position: relative; }
                        .full-image-text { position: absolute; bottom: 10%; left: 10%; right: 10%; background: rgba(255, 255, 255, 0.8); padding: 1rem; border-radius: 8px; font-size: 14pt; }
                    </style>
                </head>
                <body>
        `;

        // Cover page with author
        printHtml += `<div class="page cover-page">`;
        if (book.cover_image_url) {
            printHtml += `<img src="${book.cover_image_url}" class="cover-image" />`;
        }
        printHtml += `<div class="cover-title">${book.title}</div>`;
        if (book.author_name) {
            printHtml += `<div class="cover-author">by ${book.author_name}</div>`;
        }
        printHtml += `</div>`;

        book.pages.forEach(page => {
            if (page.layout === 'full-image' && page.illustration_url) {
                printHtml += `<div class="page full-image-page" style="background-image: url('${page.illustration_url}')"><div class="full-image-text">${page.text}</div></div>`;
            } else {
                printHtml += `<div class="page layout-${page.layout}">`;
                if (page.illustration_url && page.layout !== 'text-only') {
                    if (page.layout === 'image-right') {
                        printHtml += `<div class="page-content">${page.text}</div><img src="${page.illustration_url}" class="page-image" />`;
                    } else {
                        printHtml += `<img src="${page.illustration_url}" class="page-image" /><div class="page-content">${page.text}</div>`;
                    }
                } else {
                    printHtml += `<div class="page-content">${page.text}</div>`;
                }
                printHtml += `</div>`;
            }
        });

        printHtml += `</body></html>`;

        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        document.body.appendChild(iframe);

        iframe.onload = () => {
            setTimeout(() => {
                iframe.contentWindow.print();
                document.body.removeChild(iframe);
                resolve();
            }, 1000);
        };

        iframe.onerror = (e) => {
            console.error("Iframe loading failed:", e);
            document.body.removeChild(iframe);
            reject(new Error("PDF export iframe failed to load."));
        };

        iframe.contentDocument.open();
        iframe.contentDocument.write(printHtml);
        iframe.contentDocument.close();
    });
};

const exportToWord = async (book) => {
    try {
        // Helper function to convert image URL to base64
        const imageToBase64 = async (url) => {
            try {
                const response = await fetch(url);
                const blob = await response.blob();
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
            } catch (error) {
                console.error('Error converting image to base64:', error);
                return url;
            }
        };

        // Convert all images to base64
        let coverImageBase64 = book.cover_image_url;
        if (book.cover_image_url) {
            coverImageBase64 = await imageToBase64(book.cover_image_url);
        }

        const pagesWithBase64Images = await Promise.all(
            book.pages.map(async (page) => {
                if (page.illustration_url) {
                    const base64Image = await imageToBase64(page.illustration_url);
                    return { ...page, illustration_base64: base64Image };
                }
                return page;
            })
        );

        // Get paper size settings
        const getPaperSettings = (format) => {
            switch (format) {
                case "A4 Portrait":
                    return { size: "A4", width: "8.27in", height: "11.69in", margin: "1in", fontSize: "12pt", titleSize: "24pt" };
                case "US Letter Portrait":
                    return { size: "letter", width: "8.5in", height: "11in", margin: "1in", fontSize: "12pt", titleSize: "24pt" };
                case "A5 Portrait":
                default:
                    return { size: "A5", width: "5.83in", height: "8.27in", margin: "0.7in", fontSize: "11pt", titleSize: "20pt" };
            }
        };

        const paperSettings = getPaperSettings(book.print_format);

        const wordContent = `
<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset='utf-8'>
<title>${book.title}</title>
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
<div class="cover-page">
${coverImageBase64 ? `<img src="${coverImageBase64}" class="cover-image" alt="Cover Image">` : ''}
<div class="cover-title">${book.title}</div>
${book.author_name ? `<div class="cover-author">by ${book.author_name}</div>` : ''}
<div class="cover-details">
<p>Target Age: ${book.age_group} years</p>
<p>Focus: ${book.focus_topic?.replace(/_/g, ' ')}</p>
<p>Pages: ${book.pages.length}</p>
<p>Format: ${book.print_format}</p>
</div>
</div>

${pagesWithBase64Images.map((page, index) => {
    const layout = page.layout || 'image-top';
    let pageHTML = `<div class="story-page ${index > 0 ? 'page-break' : ''}">`;
    pageHTML += `<div class="page-number">Page ${page.page_number}</div>`;
    
    switch (layout) {
        case 'image-top':
            if (page.illustration_base64) {
                pageHTML += `<img src="${page.illustration_base64}" class="page-image" alt="Page ${page.page_number} illustration">`;
            }
            pageHTML += `<div class="page-text">${page.text || ''}</div>`;
            break;
            
        case 'image-bottom':
            pageHTML += `<div class="page-text">${page.text || ''}</div>`;
            if (page.illustration_base64) {
                pageHTML += `<img src="${page.illustration_base64}" class="page-image" alt="Page ${page.page_number} illustration">`;
            }
            break;
            
        case 'image-left':
            pageHTML += `<div class="layout-image-left">`;
            pageHTML += `<div class="image-cell">`;
            if (page.illustration_base64) {
                pageHTML += `<img src="${page.illustration_base64}" class="page-image" alt="Page ${page.page_number} illustration" style="max-width: 100%;">`;
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
            if (page.illustration_base64) {
                pageHTML += `<img src="${page.illustration_base64}" class="page-image" alt="Page ${page.page_number} illustration" style="max-width: 100%;">`;
            }
            pageHTML += `</div></div>`;
            break;
            
        case 'full-image':
            if (page.illustration_base64) {
                pageHTML += `<img src="${page.illustration_base64}" class="page-image" alt="Page ${page.page_number} illustration" style="width: 100%; height: auto;">`;
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
        return Promise.resolve();
    } catch (error) {
        console.error('Error generating Word document:', error);
        throw error;
    }
};

// --- Component ---

export default function ExportModal({ bookId, bookTitle, isPublic, onPublicToggle, publicBookId, book }) {
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const publicUrl = `${window.location.origin}${createPageUrl(`Reader?id=${publicBookId}&public=true`)}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggle = async () => {
    if (onPublicToggle) {
      await onPublicToggle(!isPublic);
    }
  };

  const handlePdfDownload = async () => {
    if (!book) return;
    setIsExporting(true);
    try {
      await exportToPdf(book);
    } catch (error) {
      console.error('PDF export failed:', error);
    }
    setIsExporting(false);
  };

  const handleWordDownload = async () => {
    if (!book) return;
    setIsExporting(true);
    try {
      await exportToWord(book);
    } catch (error) {
      console.error("Error generating Word document:", error);
      alert("Failed to generate Word document. Please try again.");
    }
    setIsExporting(false);
  };

  return (
    <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Share2 className="w-5 h-5" />
          Share "{bookTitle}"
        </DialogTitle>
        <DialogDescription>
          Export your story or share it with others
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        <div className="space-y-3">
          <Label className="text-base font-medium">Export Options</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={handleWordDownload}
              disabled={isExporting}
              className="w-full justify-start"
            >
              {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
              Word Download
            </Button>
            <Button
              variant="outline"
              onClick={handlePdfDownload}
              disabled={isExporting}
              className="w-full justify-start"
            >
              {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileDown className="w-4 h-4 mr-2" />}
              PDF Download
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-base font-medium">Public Sharing</Label>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              {isPublic ? <Globe className="w-4 h-4 text-green-600" /> : <Lock className="w-4 h-4 text-gray-500" />}
              <div>
                <span className="text-sm font-medium block">
                  {isPublic ? "Public" : "Private"}
                </span>
                <span className="text-xs text-gray-500">
                  {isPublic ? "Anyone with the link can view" : "Only you can view"}
                </span>
              </div>
            </div>
            <Switch checked={isPublic} onCheckedChange={handleToggle} />
          </div>
        </div>

        {isPublic && publicBookId && (
          <div className="space-y-3">
            <Label htmlFor="share-url" className="text-base font-medium">Share Link</Label>
            <div className="flex gap-2">
              <Input
                id="share-url"
                value={publicUrl}
                readOnly
                className="flex-1"
              />
              <Button onClick={copyToClipboard} variant="outline" size="icon">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            {copied && (
              <p className="text-sm text-green-600">Link copied to clipboard!</p>
            )}
          </div>
        )}
      </div>
    </DialogContent>
  );
}