import { auth } from '@clerk/nextjs/server';
import { currentUser } from '@clerk/nextjs/server';
import { AlignmentType, Document, ImageRun, Packer, Paragraph, PageBreak, TextRun } from 'docx';
import { clerkSetupMessage, isClerkConfigured } from '@/lib/clerk-server';
import { isSupabaseConfigured, supabaseSetupMessage } from '@/lib/service-config';
import { getStoryById } from '@/lib/supabase';
import { type StoryPageDraft } from '@/lib/types';

interface StoryExportRouteContext {
  params: {
    id: string;
  };
}

function getAuthorName(user: Awaited<ReturnType<typeof currentUser>>) {
  const combinedName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim();

  return user?.fullName?.trim() || combinedName || 'the writer';
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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

function buildPrintableHtml(story: NonNullable<Awaited<ReturnType<typeof getStoryById>>>, authorName: string, baseUrl: string) {
  const pages = getStoryPages(story);
  const summary = story.content.split(/\n{2,}/).filter(Boolean)[0] ?? story.content.slice(0, 220);

  const pageSections = pages
    .map((pageDraft) => {
      const pageImage = pageDraft.imageUrl ? new URL(pageDraft.imageUrl, baseUrl).toString() : '';
      return `
        <section class="sheet">
          <div class="page-label">Page ${pageDraft.pageNumber}</div>
          ${pageImage ? `<img class="page-art" src="${escapeHtml(pageImage)}" alt="Illustration for page ${pageDraft.pageNumber}" />` : ''}
          <div class="page-text">${escapeHtml(pageDraft.text).replace(/\n/g, '<br />')}</div>
        </section>
      `;
    })
    .join('');

  const coverImage = story.coverImageUrl ? new URL(story.coverImageUrl, baseUrl).toString() : '';

  return `<!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${escapeHtml(story.title)} | Print Preview</title>
      <style>
        * { box-sizing: border-box; }
        body { margin: 0; font-family: Georgia, 'Times New Roman', serif; background: #f3efe4; color: #20162f; }
        .book { max-width: 920px; margin: 0 auto; padding: 24px; }
        .sheet {
          page-break-after: always;
          break-after: page;
          min-height: 1120px;
          background: #fffdf8;
          border: 1px solid rgba(86, 64, 140, 0.15);
          border-radius: 28px;
          overflow: hidden;
          margin-bottom: 24px;
          box-shadow: 0 18px 40px rgba(31, 18, 58, 0.08);
        }
        .cover {
          position: relative;
          min-height: 1120px;
          background: linear-gradient(180deg, #f7f1dd 0%, #fffdf8 56%, #efe9ff 100%);
        }
        .cover-art { width: 100%; height: 70%; object-fit: cover; display: block; }
        .cover-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 36px;
          background: linear-gradient(180deg, rgba(15, 12, 25, 0.48), rgba(15, 12, 25, 0.08) 34%, rgba(15, 12, 25, 0.58) 100%);
          color: #fff;
        }
        .cover-kicker { font-size: 12px; letter-spacing: 0.28em; text-transform: uppercase; opacity: 0.82; }
        .cover-title {
          margin: 0;
          font-size: 56px;
          line-height: 0.98;
          font-weight: 900;
          max-width: 760px;
          text-wrap: balance;
        }
        .cover-byline { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.08em; opacity: 0.92; }
        .cover-summary {
          margin: 14px 0 0;
          max-width: 680px;
          font-size: 18px;
          line-height: 1.7;
          color: rgba(255, 255, 255, 0.9);
        }
        .cover-footer {
          align-self: flex-end;
          max-width: 70%;
          padding: 18px 22px;
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.16);
          backdrop-filter: blur(4px);
        }
        .page-label { padding: 28px 30px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.24em; color: #7b679d; }
        .page-art { width: calc(100% - 60px); margin: 18px 30px 0; max-height: 440px; object-fit: cover; border-radius: 24px; display: block; }
        .page-text { padding: 24px 34px 38px; font-size: 21px; line-height: 1.75; white-space: normal; }
        @media print {
          body { background: #fff; }
          .book { max-width: none; padding: 0; }
          .sheet { margin: 0; border: none; border-radius: 0; box-shadow: none; }
        }
      </style>
      <script>
        window.addEventListener('load', () => {
          const status = document.getElementById('print-status');
          if (status) {
            status.textContent = 'Ready to print or save as PDF.';
          }
        });
      </script>
    </head>
    <body>
      <main class="book">
        <section class="sheet cover">
          ${coverImage ? `<img class="cover-art" src="${escapeHtml(coverImage)}" alt="Cover illustration for ${escapeHtml(story.title)}" />` : ''}
          <div class="cover-overlay">
            <div>
              <div class="cover-kicker">Cover Illustration</div>
              <h1 class="cover-title">${escapeHtml(story.title)}</h1>
              <p class="cover-byline">by ${escapeHtml(authorName)}</p>
            </div>
            <div class="cover-footer">
              <p class="cover-summary">${escapeHtml(summary)}</p>
            </div>
          </div>
        </section>
        ${pageSections}
      </main>
      <p id="print-status" style="position: fixed; left: 16px; bottom: 16px; margin: 0; padding: 10px 14px; border-radius: 999px; background: rgba(32, 22, 47, 0.9); color: white; font: 14px/1.4 system-ui, sans-serif;">Open this page in a browser tab, then print or save as PDF.</p>
    </body>
  </html>`;
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

    const html = buildPrintableHtml(story, getAuthorName(user), baseUrl);
    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="${story.title.replace(/[^a-z0-9_-]/gi, '_')}.html"`,
      },
    });
  } catch (error) {
    console.error('Story export failed:', error);
    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Unexpected story export error.',
      },
      { status: 500 },
    );
  }
}
