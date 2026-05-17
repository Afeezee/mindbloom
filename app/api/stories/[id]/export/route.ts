import { auth } from '@clerk/nextjs/server';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { clerkSetupMessage, isClerkConfigured } from '@/lib/clerk-server';
import { isSupabaseConfigured, supabaseSetupMessage } from '@/lib/service-config';
import { getStoryById } from '@/lib/supabase';

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

async function exportPdf(title: string, content: string) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let page = pdfDoc.addPage([612, 792]);
  let y = 760;

  page.drawText(title, {
    x: 50,
    y,
    size: 22,
    font: fontBold,
  });

  y -= 34;

  const paragraphs = content.split(/\n{2,}/).filter(Boolean);

  for (const paragraph of paragraphs) {
    const lines = splitLines(paragraph, 90);

    for (const line of lines) {
      if (y < 60) {
        page = pdfDoc.addPage([612, 792]);
        y = 760;
      }

      page.drawText(line, {
        x: 50,
        y,
        size: 12,
        font,
      });

      y -= 18;
    }

    y -= 10;
  }

  return pdfDoc.save();
}

async function exportDocx(title: string, content: string) {
  const paragraphs = content.split(/\n{2,}/).filter(Boolean);

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            children: [new TextRun({ text: title, bold: true, size: 36 })],
          }),
          ...paragraphs.map(
            (paragraph) =>
              new Paragraph({
                children: [new TextRun({ text: paragraph, size: 24 })],
              }),
          ),
        ],
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

  if (!userId) {
    return Response.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const url = new URL(request.url);
  const format = (url.searchParams.get('format') ?? 'pdf').toLowerCase();

  if (format !== 'pdf' && format !== 'docx') {
    return Response.json({ error: 'Unsupported export format.' }, { status: 400 });
  }

  try {
    const story = await getStoryById(params.id, userId);

    if (!story || story.userId !== userId) {
      return Response.json({ error: 'Story not found.' }, { status: 404 });
    }

    if (format === 'docx') {
      const fileBuffer = await exportDocx(story.title, story.content);
      return new Response(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="${story.title.replace(/[^a-z0-9_-]/gi, '_')}.docx"`,
        },
      });
    }

    const fileBytes = await exportPdf(story.title, story.content);
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
