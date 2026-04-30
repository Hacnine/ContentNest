'use client';

import { useState, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { uploadMedia } from '@/store/slices/mediaSlice';
import { cn, formatFileSize } from '@/lib/utils';

interface MediaUploadProps {
  onUploaded?: (url: string) => void;
}

export default function MediaUpload({ onUploaded }: MediaUploadProps) {
  const dispatch = useAppDispatch();
  const { uploading } = useAppSelector((s) => s.media);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    for (const file of Array.from(files)) {
      const result = await dispatch(uploadMedia(file));
      if (uploadMedia.fulfilled.match(result) && onUploaded) {
        onUploaded(result.payload.url);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div
      className={cn(
        'border-2 border-dashed rounded-xl p-8 text-center transition cursor-pointer',
        dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
      )}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*,video/*,.pdf"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
        disabled={uploading}
      />
      <p className="text-3xl mb-2">☁️</p>
      {uploading ? (
        <p className="text-sm text-primary font-medium">Uploading…</p>
      ) : (
        <>
          <p className="text-sm font-medium">Drop files here or click to upload</p>
          <p className="text-xs text-muted-foreground mt-1">Images, videos, and PDFs supported</p>
        </>
      )}
    </div>
  );
}
