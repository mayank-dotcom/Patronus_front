"use client";
import { useState, useEffect, useCallback } from 'react';
import { ChatInterface } from '@/components/ChatInterface';
import { FileUploader } from '@/components/FileUploader';
import { PdfViewer } from '@/components/PdfViewer';
import { ShieldCheck, Database, Calculator, Activity, FileText, ChevronDown, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Types ─────────────────────────── */
interface UploadedPDF {
  id: number;
  name: string;
  file_name: string;
  file_size: number | null;
  uploaded_at: string;
  url: string;
}

/* ─── Background shapes ─────────────── */
const shapes = [
  { type: 'square', left: '5%', top: '10%', size: 40, color: 'rgba(255,0,0,0.6)', rotate: 45, dur: 7, delay: 0 },
  { type: 'circle', left: '88%', top: '14%', size: 30, color: 'rgba(0,0,0,0.4)', rotate: 0, dur: 9, delay: 1.5 },
  { type: 'square', left: '12%', top: '72%', size: 24, color: 'rgba(255,0,0,0.4)', rotate: 20, dur: 6, delay: 0.8 },
  { type: 'circle', left: '80%', top: '65%', size: 48, color: 'rgba(255,0,0,0.2)', rotate: 0, dur: 11, delay: 2 },
  { type: 'square', left: '44%', top: '5%', size: 20, color: 'rgba(0,0,0,0.3)', rotate: 15, dur: 8, delay: 1 },
  { type: 'circle', left: '28%', top: '82%', size: 30, color: 'rgba(255,0,0,0.5)', rotate: 0, dur: 10, delay: 3 },
  { type: 'square', left: '65%', top: '88%', size: 22, color: 'rgba(0,0,0,0.25)', rotate: 35, dur: 7, delay: 2.5 },
  { type: 'circle', left: '3%', top: '45%', size: 20, color: 'rgba(255,0,0,0.4)', rotate: 0, dur: 8, delay: 0.3 },
];

const scenarios = [
  { title: 'Verification', icon: ShieldCheck, query: 'What is the total number of jobs reported, and where exactly is this stated?' },
  { title: 'Synthesis', icon: Database, query: "Compare the concentration of 'Pure-Play' cybersecurity firms in the South-West against the National Average." },
  { title: 'Forecasting', icon: Calculator, query: 'Based on 2022 baseline and 2030 target, calculate the required CAGR.' },
];

function formatBytes(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ─── PDF Dropdown Component ─────────── */
function PdfDropdown({
  pdfs,
  activePdfId,
  onSelect,
  onRefresh,
  loading,
}: {
  pdfs: UploadedPDF[];
  activePdfId: number | null;
  onSelect: (pdf: UploadedPDF) => void;
  onRefresh: () => void;
  loading: boolean;
}) {
  const [open, setOpen] = useState(false);
  const active = pdfs.find((p) => p.id === activePdfId);

  return (
    <div className="relative">
      {/* Trigger row */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex-1 flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all min-w-0"
          style={{
            background: '#ffffff',
            border: '3px solid #000000',
            boxShadow: '3px 3px 0px #000000',
          }}
        >
          <div className="flex items-center space-x-2 min-w-0">
            <FileText className="w-4 h-4 text-red-600 shrink-0" />
            <span className="text-[12px] font-black text-black truncate">
              {active ? active.name : 'Select a PDF…'}
            </span>
          </div>
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="shrink-0 ml-1">
            <ChevronDown className="w-4 h-4 text-black" />
          </motion.div>
        </button>
        {/* Refresh — sibling, not nested */}
        <motion.button
          onClick={onRefresh}
          whileTap={{ rotate: 360 }}
          transition={{ duration: 0.4 }}
          className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
          style={{ border: '3px solid #000000', background: '#FF0000' }}
          title="Refresh list"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-white' : 'text-white'}`} />
        </motion.button>
      </div>

      {/* Dropdown list */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scaleY: 0.9 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -6, scaleY: 0.9 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full mt-1.5 rounded-lg overflow-hidden z-50"
            style={{
              transformOrigin: 'top',
              background: '#ffffff',
              border: '3px solid #000000',
              boxShadow: '5px 5px 0px #000000',
            }}
          >
            {pdfs.length === 0 ? (
              <div className="px-3 py-4 text-center">
                <p className="text-[11px] text-gray-500 font-mono">No PDFs uploaded yet</p>
              </div>
            ) : (
              <div className="max-h-44 overflow-y-auto">
                {pdfs.map((pdf) => (
                  <button
                    key={pdf.id}
                    onClick={() => { onSelect(pdf); setOpen(false); }}
                    className="w-full flex items-center space-x-2.5 px-3 py-2.5 text-left transition-all group"
                    style={{
                      background: pdf.id === activePdfId ? 'rgba(255,0,0,0.1)' : 'transparent',
                      borderBottom: '1px solid #eee',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,0,0,0.05)'}
                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = pdf.id === activePdfId ? 'rgba(255,0,0,0.1)' : 'transparent'}
                  >
                    <div
                      className="w-7 h-7 rounded flex items-center justify-center shrink-0"
                      style={{
                        background: pdf.id === activePdfId ? '#FF0000' : '#f0f0f0',
                        border: '2px solid #000',
                      }}
                    >
                      <FileText className={`w-3.5 h-3.5 ${pdf.id === activePdfId ? 'text-white' : 'text-red-600'}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-black text-black truncate">{pdf.name}</p>
                      <p className="text-[10px] text-gray-600 font-mono">
                        {formatBytes(pdf.file_size)} · {new Date(pdf.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                    {pdf.id === activePdfId && (
                      <span className="text-[9px] font-black text-red-600 uppercase tracking-wider shrink-0">OPEN</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Main Page ─────────────────────── */
export default function Home() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [activePdfId, setActivePdfId] = useState<number | null>(null);
  const [pdfs, setPdfs] = useState<UploadedPDF[]>([]);
  const [pdfsLoading, setPdfsLoading] = useState(false);

  const fetchPdfs = useCallback(async () => {
    setPdfsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pdfs`);
      const data: UploadedPDF[] = await res.json();
      setPdfs(data);
    } catch (err) {
      console.error('Failed to fetch PDFs', err);
    } finally {
      setPdfsLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => { fetchPdfs(); }, [fetchPdfs]);

  const handleSelectPdf = (pdf: UploadedPDF) => {
    setActivePdfId(pdf.id);
    setPdfUrl(`${process.env.NEXT_PUBLIC_API_URL}${pdf.url}`);
  };

  const handleNewUpload = (blobUrl: string | null) => {
    setPdfUrl(blobUrl);
    setActivePdfId(null);  // blob URLs have no DB id yet
    // Refresh list after a short delay (upload takes time)
    setTimeout(fetchPdfs, 1500);
  };

  return (
    <div
      className="relative w-full h-screen overflow-hidden"
      style={{ background: 'var(--background)' }}
    >
      {/* ══ 2D Animated Background ══ */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 dot-grid" />
        <div className="absolute top-0 left-1/4 w-80 h-80 rounded-full" style={{ background: 'rgba(255,0,0,0.06)', filter: 'blur(100px)' }} />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full" style={{ background: 'rgba(0,0,0,0.04)', filter: 'blur(80px)' }} />
        {shapes.map((s, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              left: s.left, top: s.top,
              width: s.size, height: s.size,
              borderRadius: s.type === 'circle' ? '50%' : 2,
              border: `3px solid ${s.color}`,
              rotate: s.rotate,
            }}
            animate={{
              y: [0, -25, 0],
              rotate: s.type === 'square' ? [s.rotate, s.rotate + 180, s.rotate + 360] : [0],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* ══ Main App — 92vh ══ */}
      <div className="relative z-10 h-full flex items-center justify-center px-6">
        <div className="flex w-full gap-5" style={{ maxWidth: 1800, height: '92vh' }}>

          {/* ── Sidebar ── */}
          <aside className="hidden lg:flex w-72 shrink-0 h-full flex-col rounded-none overflow-hidden card-2d">
            {/* Logo */}
            <div
              className="flex items-center space-x-3 px-5 py-5 shrink-0"
              style={{ borderBottom: '3px solid #000000', background: '#ffffff' }}
            >
              <div
                className="w-10 h-10 rounded-none flex items-center justify-center font-black text-white text-xl"
                style={{
                  background: '#000000',
                  border: '3px solid #000',
                  boxShadow: '3px 3px 0px #FF0000',
                }}
              >
                A
              </div>
              <h1 className="text-sm font-black tracking-widest text-black uppercase">Nexus</h1>
            </div>

            {/* Scrollable sidebar body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">

              {/* Upload */}
              <section>
                <p className="text-[11px] font-black text-black uppercase tracking-widest mb-3">⬡ INGESTION</p>
                <FileUploader onUploadSuccess={() => { }} onFileReady={handleNewUpload} />
              </section>

              {/* PDF Library dropdown */}
              <section>
                <p className="text-[11px] font-black text-black uppercase tracking-widest mb-3">
                  ⬡ ARCHIVES ({pdfs.length})
                </p>
                <PdfDropdown
                  pdfs={pdfs}
                  activePdfId={activePdfId}
                  onSelect={handleSelectPdf}
                  onRefresh={fetchPdfs}
                  loading={pdfsLoading}
                />
              </section>

              {/* Query templates */}
              <section>
                <p className="text-[11px] font-black text-black uppercase tracking-widest mb-3">⬡ PROTOTYPES</p>
                <div className="space-y-4">
                  {scenarios.map((s, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ x: 2, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="scenario-card p-5"
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <s.icon className="w-5 h-5 text-black shrink-0" />
                        <span className="text-[12px] font-black text-black uppercase tracking-widest">{s.title}</span>
                      </div>
                      <p className="text-[11px] text-black/80 font-bold italic line-clamp-2 leading-relaxed">{s.query}</p>
                    </motion.div>
                  ))}
                </div>
              </section>
            </div>

            {/* Status footer */}
            <div className="shrink-0 p-4" style={{ borderTop: '4px solid #000', background: '#f8f8f8' }}>
              <div
                className="p-4 rounded-none"
                style={{
                  background: '#000',
                  border: '3px solid #000',
                  boxShadow: '4px 4px 0px #FF0000',
                }}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }}>
                    <Activity className="w-5 h-5 text-red-600" />
                  </motion.div>
                  <span className="text-[11px] font-black text-red-600 uppercase tracking-widest">CORE ONLINE</span>
                </div>
                <p className="text-[10px] text-white font-mono uppercase tracking-widest">
                  LOAD: <strong>100%</strong> · RAG: <strong>OK</strong>
                </p>
              </div>
            </div>
          </aside>

          {/* ── Chat Window ── */}
          <div className="flex-1 h-full overflow-hidden card-2d">
            <ChatInterface />
          </div>

          {/* ── PDF Viewer ── */}
          <AnimatePresence>
            {pdfUrl && (
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="shrink-0 h-full overflow-hidden card-2d"
                style={{ width: 420 }}
              >
                <PdfViewer url={pdfUrl} onClose={() => { setPdfUrl(null); setActivePdfId(null); }} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
