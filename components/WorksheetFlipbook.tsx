import React, { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

type WorksheetFlipbookProps = {
  fileUrl: string;
  title?: string;
};

const WorksheetFlipbook: React.FC<WorksheetFlipbookProps> = ({ fileUrl }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [bookWidth, setBookWidth] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bookRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const padding = 48;
      const maxWidth = Math.min(containerRef.current.clientWidth - padding, 960);
      const minWidth = 480;
      setBookWidth(Math.max(minWidth, maxWidth));
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  useEffect(() => {
    if (!numPages || !bookRef.current || !bookWidth) return;
    const win = window as any;
    const $ = win.jQuery || win.$;
    if (!$ || !$.fn || !$.fn.turn) return;

    const $el = $(bookRef.current);

    if ($el.data('hasTurn')) {
      try {
        $el.turn('destroy');
      } catch {
      }
    }

    const height = Math.round(bookWidth * 0.7);

    $el.turn({
      width: bookWidth,
      height,
      autoCenter: true,
      gradients: true,
      elevation: 50,
    });

    $el.data('hasTurn', true);

    return () => {
      try {
        $el.turn('destroy');
      } catch {
      }
    };
  }, [numPages, bookWidth]);

  const pageWidth = Math.floor(bookWidth / 2);

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center overflow-hidden">
      <div className="max-w-5xl w-full h-full flex items-center justify-center">
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<div className="text-white text-sm">Loading workbook...</div>}
          error={<div className="text-red-300 text-sm">Could not load workbook.</div>}
        >
          <div ref={bookRef} className="bg-gray-100 shadow-2xl">
            {numPages &&
              Array.from({ length: numPages }, (_, index) => (
                <div key={index + 1} className="bg-white">
                  <Page
                    pageNumber={index + 1}
                    width={pageWidth}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                </div>
              ))}
          </div>
        </Document>
      </div>
    </div>
  );
};

export default WorksheetFlipbook;
