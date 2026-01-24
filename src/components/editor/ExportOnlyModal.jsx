import React, { useState } from "react";
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FileText, FileDown, Loader2, Download } from "lucide-react";

const exportToWord = async (book) => {
    try {
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

const exportToPdf = (book) => {
    return new Promise((resolve, reject) => {
        const getPageSize = (format) => {
            switch (format) {
                case "A4 Portrait": return { width: '210mm', height: '297mm' };
                case "US Letter Portrait": return { width: '8.5in', height: '11in' };
                case "A5 Portrait":
                default:
                    return { width: '148mm', height: '210mm' };
            }
        };

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

export default function ExportOnlyModal({ book }) {
  const [isExporting, setIsExporting] = useState(false);

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

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          Export "{book?.title}"
        </DialogTitle>
        <DialogDescription>
          Download your story in your preferred format
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-3 pt-2">
        <Label className="text-base font-medium">Export Options</Label>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={handleWordDownload}
            disabled={isExporting}
            className="w-full justify-start h-auto py-4 flex-col items-start gap-1"
          >
            {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
            <span className="font-semibold">Word</span>
            <span className="text-xs text-gray-500">Editable document</span>
          </Button>
          <Button
            variant="outline"
            onClick={handlePdfDownload}
            disabled={isExporting}
            className="w-full justify-start h-auto py-4 flex-col items-start gap-1"
          >
            {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileDown className="w-5 h-5" />}
            <span className="font-semibold">PDF</span>
            <span className="text-xs text-gray-500">Print-ready</span>
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}