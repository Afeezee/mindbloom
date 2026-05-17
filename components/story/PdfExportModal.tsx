"use client";

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';

interface PdfExportModalProps {
  open: boolean;
  title: string;
  pdfUrl: string | null;
  onClose: () => void;
}

export function PdfExportModal({ open, title, pdfUrl, onClose }: PdfExportModalProps) {
  useEffect(() => {
    if (!open || !pdfUrl) {
      return undefined;
    }

    return () => {
      URL.revokeObjectURL(pdfUrl);
    };
  }, [open, pdfUrl]);

  function openInNewTab() {
    if (!pdfUrl) {
      return;
    }

    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
  }

  function handlePrint() {
    if (!pdfUrl) {
      return;
    }

    const printWindow = window.open(pdfUrl, '_blank', 'noopener,noreferrer');

    if (printWindow) {
      printWindow.focus();
      window.setTimeout(() => printWindow.print(), 900);
    }
  }

  return (
    <Modal
      open={open}
      title={`Preview ${title}`}
      description="Preview the PDF here, then use your browser's controls to save or print it."
      onClose={onClose}
      className="max-w-5xl"
    >
      <div className="space-y-4">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
          {pdfUrl ? (
            <iframe title={`${title} PDF preview`} src={pdfUrl} className="h-[70vh] w-full bg-white" />
          ) : (
            <div className="flex h-[70vh] items-center justify-center text-sm text-slate-500">Preparing PDF preview...</div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3">
          <Button variant="outline" onClick={openInNewTab} disabled={!pdfUrl}>
            Open in new tab
          </Button>
          <Button variant="secondary" onClick={handlePrint} disabled={!pdfUrl}>
            Print / Save
          </Button>
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  );
}