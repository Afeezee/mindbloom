import { auth } from '@clerk/nextjs/server';
import { currentUser } from '@clerk/nextjs/server';
import { AlignmentType, Document, ImageRun, Packer, Paragraph, PageBreak, TextRun } from 'docx';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { clerkSetupMessage, isClerkConfigured } from '@/lib/clerk-server';
import { isSupabaseConfigured, supabaseSetupMessage } from '@/lib/service-config';
import { getStoryById } from '@/lib/supabase';
import { type StoryPageDraft } from '@/lib/types';

interface StoryExportRouteContext {
  params: {
    id: string;
  };
}

function splitLines(text: string, maxCharsPerLine: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current.length > 0 ? `${current} ${word}` : word;

    if (candidate.length > maxCharsPerLine) {
      if (current.length > 0) {
        lines.push(current);
      }

      current = word;
    } else {
      current = candidate;
    }
  }

  if (current.length > 0) {
    lines.push(current);
  }

  return lines;
}

function getAuthorName(user: Awaited<ReturnType<typeof currentUser>>) {
  const combinedName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim();

  return user?.fullName?.trim() || combinedName || 'the writer';
}

function splitStoryContent(content: string) {
  return content
    .split(/\n\n--- PAGE ---\n\n/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((text, index) => ({
      pageNumber: index + 1,
      text,
      illustrationPrompt: '',
    } satisfies StoryPageDraft));
}

function getStoryPages(story: Awaited<ReturnType<typeof getStoryById>>) {
  if (!story) {
    return [];
  }

  return story.bookPages?.length ? story.bookPages : splitStoryContent(story.content);
}

async function fetchImageBytes(imageUrl: string, baseUrl: string) {
  const resolvedUrl = new URL(imageUrl, baseUrl).toString();
  const response = await fetch(resolvedUrl, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Failed to fetch illustration: ${response.status}`);
  }

  return {
    bytes: new Uint8Array(await response.arrayBuffer()),
    contentType: response.headers.get('content-type') ?? 'image/jpeg',
  };
}

function fitIntoBox(sourceWidth: number, sourceHeight: number, maxWidth: number, maxHeight: number) {
  const scale = Math.min(maxWidth / sourceWidth, maxHeight / sourceHeight);

  return {
    width: sourceWidth * scale,
    height: sourceHeight * scale,
  };
}

async function embedPdfImage(pdfDoc: PDFDocument, imageUrl: string, baseUrl: string) {
  const { bytes, contentType } = await fetchImageBytes(imageUrl, baseUrl);

  if (contentType.includes('png')) {
    return pdfDoc.embedPng(bytes);
  }

  return pdfDoc.embedJpg(bytes);
}

async function exportPdf(
  story: NonNullable<Awaited<ReturnType<typeof getStoryById>>>,
  authorName: string,
  baseUrl: string,
) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pages = getStoryPages(story);
  const pageSize: [number, number] = [612, 792];
  const pageWidth = pageSize[0];
  const pageHeight = pageSize[1];

  const coverPage = pdfDoc.addPage(pageSize);
  coverPage.drawRectangle({ x: 0, y: 0, width: pageWidth, height: pageHeight, color: rgb(0.98, 0.96, 0.9) });

  if (story.coverImageUrl) {
    try {
      const coverImage = await embedPdfImage(pdfDoc, story.coverImageUrl, baseUrl);
      const coverFit = fitIntoBox(coverImage.width, coverImage.height, pageWidth - 80, 520);
      coverPage.drawImage(coverImage, {
        x: (pageWidth - coverFit.width) / 2,
        y: 200,
        width: coverFit.width,
        height: coverFit.height,
      });
    } catch {
      // Fall back to text-only cover if the illustration cannot be embedded.
    }
  }

  coverPage.drawRectangle({
    x: 32,
    y: 44,
    width: pageWidth - 64,
    height: 134,
    color: rgb(0.11, 0.08, 0.17),
    opacity: 0.78,
  });

  coverPage.drawText(story.title, {
    x: 52,
    y: 136,
    size: 28,
    font: fontBold,
    color: rgb(1, 1, 1),
    maxWidth: pageWidth - 104,
  });

  coverPage.drawText(`by ${authorName}`, {
    x: 52,
    y: 108,
    size: 16,
    font,
    color: rgb(0.96, 0.95, 0.92),
    maxWidth: pageWidth - 104,
  });

  if (story.summary) {
    coverPage.drawText(story.summary, {
      x: 52,
      y: 84,
      size: 12,
      font,
      color: rgb(0.96, 0.95, 0.92),
      maxWidth: pageWidth - 104,
    });
  }

  for (const pageDraft of pages) {
    const page = pdfDoc.addPage(pageSize);
    page.drawRectangle({ x: 0, y: 0, width: pageWidth, height: pageHeight, color: rgb(1, 1, 1) });

    page.drawText(`Page ${pageDraft.pageNumber}`, {
      x: 48,
      y: 748,
      size: 14,
      font: fontBold,
      color: rgb(0.2, 0.15, 0.3),
    });

    if (pageDraft.imageUrl) {
      try {
        const illustration = await embedPdfImage(pdfDoc, pageDraft.imageUrl, baseUrl);
        const illustrationFit = fitIntoBox(illustration.width, illustration.height, pageWidth - 96, 320);
        page.drawImage(illustration, {
          x: (pageWidth - illustrationFit.width) / 2,
          y: 392,
          width: illustrationFit.width,
          height: illustrationFit.height,
        });
      } catch {
        page.drawRectangle({ x: 48, y: 388, width: pageWidth - 96, height: 324, color: rgb(0.97, 0.95, 0.9) });
      }
    }

    const textTop = 356;
    let y = textTop;
    const paragraphs = pageDraft.text.split(/\n{2,}/).filter(Boolean);

    for (const paragraph of paragraphs) {
      const lines = splitLines(paragraph, 74);

      for (const line of lines) {
        page.drawText(line, {
          x: 52,
          y,
          size: 12,
          font,
          color: rgb(0.13, 0.1, 0.18),
          maxWidth: pageWidth - 104,
        });

        y -= 18;
      }

      y -= 10;
    }

    page.drawText(pageDraft.text.length > 0 ? '' : ' ', {
      x: 52,
      y: textTop,
      size: 12,
      font,
    });
  }

  return pdfDoc.save();
}

async function exportDocx(
  story: NonNullable<Awaited<ReturnType<typeof getStoryById>>>,
  authorName: string,
  baseUrl: string,
) {
  const pages = getStoryPages(story);
  const coverImageData = story.coverImageUrl ? await fetchImageBytes(story.coverImageUrl, baseUrl).catch(() => null) : null;
  const children: Paragraph[] = [];

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: story.title, bold: true, size: 40 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: `by ${authorName}`, italics: true, size: 22 })],
    }),
  );

  if (coverImageData?.bytes) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new ImageRun({
            data: Buffer.from(coverImageData.bytes),
            transformation: { width: 400, height: 560 },
          }),
        ],
      }),
    );
  }

  if (story.summary) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: story.summary, size: 22 })],
      }),
    );
  }

  children.push(new Paragraph({ children: [new PageBreak()] }));

  for (let index = 0; index < pages.length; index += 1) {
    const pageDraft = pages[index];
    const pageImageData = pageDraft.imageUrl ? await fetchImageBytes(pageDraft.imageUrl, baseUrl).catch(() => null) : null;

    children.push(
      new Paragraph({
        children: [new TextRun({ text: `Page ${pageDraft.pageNumber}`, bold: true, size: 26 })],
      }),
    );

    if (pageImageData?.bytes) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new ImageRun({
              data: Buffer.from(pageImageData.bytes),
              transformation: { width: 400, height: 560 },
            }),
          ],
        }),
      );
    }

    children.push(
      new Paragraph({
        children: [new TextRun({ text: pageDraft.text, size: 24 })],
      }),
    );

    if (index < pages.length - 1) {
      children.push(new Paragraph({ children: [new PageBreak()] }));
    }
  }

  const doc = new Document({
    sections: [
      {
        children,
      },
    ],
  });

  return Packer.toBuffer(doc);
}

export async function GET(request: Request, { params }: StoryExportRouteContext) {
  if (!isClerkConfigured) {
    return Response.json({ error: clerkSetupMessage }, { status: 503 });
  }

  if (!isSupabaseConfigured) {
    return Response.json({ error: supabaseSetupMessage }, { status: 503 });
  }

  const { userId } = await auth();
  const user = await currentUser();

  if (!userId) {
    return Response.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const url = new URL(request.url);
  const format = (url.searchParams.get('format') ?? 'pdf').toLowerCase();

  if (format !== 'pdf' && format !== 'docx') {
    return Response.json({ error: 'Unsupported export format.' }, { status: 400 });
  }

  try {
    const baseUrl = new URL(request.url).origin;
    const story = await getStoryById(params.id, userId);

    if (!story || story.userId !== userId) {
      return Response.json({ error: 'Story not found.' }, { status: 404 });
    }

    if (format === 'docx') {
      const fileBuffer = await exportDocx(story, getAuthorName(user), baseUrl);
      return new Response(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="${story.title.replace(/[^a-z0-9_-]/gi, '_')}.docx"`,
        },
      });
    }

    const fileBytes = await exportPdf(story, getAuthorName(user), baseUrl);
    return new Response(fileBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${story.title.replace(/[^a-z0-9_-]/gi, '_')}.pdf"`,
      },
    });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Unexpected story export error.',
      },
      { status: 500 },
    );
  }
}
