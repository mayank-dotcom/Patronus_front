"use client";
import { FileText, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface PdfViewerProps {
  url: string;
  onClose: () => void;
}

export const PdfViewer = ({ url, onClose }: PdfViewerProps) => {
  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-4 shrink-0"
        style={{
          background: '#FF0000',
          borderBottom: '3px solid #000000',
        }}
      >
        <div className="flex items-center space-x-2">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <FileText className="w-5 h-5 text-black" />
          </motion.div>
          <span className="text-sm font-black text-black uppercase tracking-widest">
            SOURCE TRACE
          </span>
          <span
            className="text-[9px] font-black px-2 py-1 bg-black text-white"
            style={{
              border: '2px solid #000',
            }}
          >
            LIVE
          </span>
        </div>
        <button
          onClick={onClose}
          className="flex items-center justify-center w-8 h-8 rounded-none transition-all bg-white border-2 border-black shadow-[2px 2px 0px #000]"
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = '#000';
            (e.currentTarget as HTMLButtonElement).style.color = '#fff';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = '#fff';
            (e.currentTarget as HTMLButtonElement).style.color = '#000';
          }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* PDF iframe */}
      <div className="flex-1 overflow-hidden">
        <iframe
          src={url}
          className="w-full h-full"
          style={{ border: 'none', display: 'block' }}
          title="PDF Document"
        />
      </div>
    </div>
  );
};
