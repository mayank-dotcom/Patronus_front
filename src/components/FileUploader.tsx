"use client";
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { UploadCloud, CheckCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FileUploaderProps {
  onUploadSuccess: (msg: string) => void;
  onFileReady?: (url: string | null) => void;
}

export const FileUploader = ({ onUploadSuccess, onFileReady }: FileUploaderProps) => {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setStatus('uploading');
    setError('');
    
    try {
      // First upload to backend
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      // After successful upload, create blob URL for preview
      const blobUrl = URL.createObjectURL(file);
      onFileReady?.(blobUrl);
      
      setStatus('success');
      onUploadSuccess(response.data.details);
      
      // Refresh the PDF list after upload completes
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      setStatus('error');
      const errorMsg = err.response?.data?.details || err.message || 'Upload failed';
      setError(`Upload failed: ${errorMsg}`);
      console.error('Upload error:', err);
      onFileReady?.(null);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { 'application/pdf': ['.pdf'] },
  });

  return (
    <div
      {...getRootProps()}
      className={`cursor-pointer transition-all card-ingestion p-5 flex flex-col items-center justify-center`}
      style={{
        borderWidth: isDragActive ? '4px' : '3px',
      }}
    >
      <input {...getInputProps()} />

      <AnimatePresence mode="wait">
        {status === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center py-2"
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <UploadCloud className="w-10 h-10 text-red-600 mb-2" />
            </motion.div>
            <p className="text-xs font-black text-red-600 text-center uppercase tracking-widest">
              {isDragActive ? 'DROP PDF' : 'INGEST PDF'}
            </p>
            <span className="text-[10px] text-red-800 mt-2 font-black uppercase">MAX 10MB</span>
          </motion.div>
        )}

        {status === 'uploading' && (
          <motion.div
            key="uploading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center py-2"
          >
            <Loader2 className="w-10 h-10 text-red-600 animate-spin mb-2" />
            <p className="text-xs font-black text-red-600 uppercase">PROCESSING...</p>
          </motion.div>
        )}

        {status === 'success' && (
          <motion.div
            key="success"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center py-2"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.4 }}
            >
              <CheckCircle className="w-10 h-10 text-red-600 mb-2" />
            </motion.div>
            <p className="text-xs font-black text-red-600 uppercase">LIQUIDIZED ✓</p>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center py-2"
          >
            <UploadCloud className="w-10 h-10 text-white mb-2" />
            <p className="text-xs font-black text-white uppercase">X FAILED X</p>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="text-white text-[9px] mt-2 text-center font-black uppercase tracking-tighter">{error}</p>}
    </div>
  );
};
