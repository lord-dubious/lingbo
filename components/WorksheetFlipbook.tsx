import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

// Configure worker - use CDN to ensure cross-platform compatibility
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

type WorksheetFlipbookProps = {
  fileUrl: string;
  title?: string;
};

const WorksheetFlipbook: React.FC<WorksheetFlipbookProps> = ({ fileUrl, title }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle resize to fit width
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  // Calculate optimal scale based on container width
  const effectiveScale = containerWidth ? (containerWidth / 600) * scale : scale;

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    console.log(`PDF loaded successfully. Pages: ${numPages}`);
    setNumPages(numPages);
    setPageNumber(1);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('PDF loading error:', error);
  };

  const changePage = (offset: number) => {
    setPageNumber(prev => Math.min(Math.max(1, prev + offset), numPages));
  };

  // Debug log
  useEffect(() => {
    console.log('PDF URL:', fileUrl);
  }, [fileUrl]);

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 bg-gray-800 shadow-md z-10">
        <div className="flex items-center gap-4">
          <span className="font-bold text-sm md:text-base hidden md:block">{title}</span>
          <span className="bg-gray-700 px-3 py-1 rounded-full text-xs font-mono">
            Page {pageNumber} of {numPages || '--'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setScale(s => Math.max(0.5, s - 0.1))}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={20} />
          </button>
          <span className="text-xs font-mono w-12 text-center">{Math.round(scale * 100)}%</span>
          <button
            onClick={() => setScale(s => Math.min(2.0, s + 0.1))}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={20} />
          </button>
        </div>
      </div>

      {/* PDF Viewer Area */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-4 md:p-8 bg-gray-900/50 relative">
        <div ref={containerRef} className="max-w-4xl w-full flex justify-center min-h-[500px]">
          <Document
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="flex flex-col items-center gap-4 text-gray-400 mt-20">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p>Loading Workbook...</p>
              </div>
            }
            error={
              <div className="text-red-400 bg-red-900/20 p-6 rounded-xl border border-red-900 mt-20 text-center">
                <p className="font-bold mb-2">Unable to load PDF</p>
                <p className="text-sm opacity-80">Please check your internet connection or try again later.</p>
              </div>
            }
            className="shadow-2xl"
          >
            <Page
              pageNumber={pageNumber}
              width={containerWidth ? Math.min(containerWidth, 800) : 600}
              scale={scale}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="bg-white shadow-2xl"
            />
          </Document>
        </div>

        {/* Navigation Overlays (Desktop) */}
        <button
          onClick={() => changePage(-1)}
          disabled={pageNumber <= 1}
          className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full items-center justify-center disabled:opacity-0 transition-all backdrop-blur-sm"
        >
          <ChevronLeft size={24} />
        </button>

        <button
          onClick={() => changePage(1)}
          disabled={pageNumber >= numPages}
          className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full items-center justify-center disabled:opacity-0 transition-all backdrop-blur-sm"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="md:hidden p-4 bg-gray-800 flex justify-between items-center border-t border-gray-700">
        <button
          onClick={() => changePage(-1)}
          disabled={pageNumber <= 1}
          className="px-6 py-3 bg-gray-700 rounded-xl font-bold disabled:opacity-50 active:bg-gray-600"
        >
          Previous
        </button>
        <button
          onClick={() => changePage(1)}
          disabled={pageNumber >= numPages}
          className="px-6 py-3 bg-primary text-white rounded-xl font-bold disabled:opacity-50 active:bg-orange-600"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default WorksheetFlipbook;
