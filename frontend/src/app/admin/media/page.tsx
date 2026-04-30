'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMedia, uploadMedia, deleteMedia } from '@/store/slices/mediaSlice';
import { formatFileSize, formatDate } from '@/lib/utils';

export default function MediaPage() {
  const dispatch = useAppDispatch();
  const { items, loading, uploading } = useAppSelector((s) => s.media);

  useEffect(() => {
    dispatch(fetchMedia({ limit: 50 }));
  }, [dispatch]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => dispatch(uploadMedia(file)));
    e.target.value = '';
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this file?')) return;
    dispatch(deleteMedia(id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Media Library</h1>
        <label className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium cursor-pointer hover:opacity-90 transition">
          {uploading ? 'Uploading…' : '+ Upload Files'}
          <input type="file" multiple accept="image/*,video/*,.pdf" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading…</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-xl">
          <p className="mb-2">No files uploaded yet</p>
          <p className="text-sm">Upload images, videos, and documents</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map((media) => (
            <div
              key={media._id}
              className="group relative border border-border rounded-lg overflow-hidden bg-background hover:shadow-md transition"
            >
              {media.type === 'image' ? (
                <div className="relative h-32 bg-muted">
                  <Image src={media.url} alt={media.originalName} fill className="object-cover" />
                </div>
              ) : (
                <div className="h-32 bg-muted flex items-center justify-center text-4xl">
                  {media.type === 'video' ? '🎬' : '📄'}
                </div>
              )}
              <div className="p-2">
                <p className="text-xs font-medium truncate">{media.originalName}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(media.size)}</p>
                <p className="text-xs text-muted-foreground">{formatDate(media.createdAt)}</p>
              </div>
              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition flex gap-1">
                <button
                  onClick={() => navigator.clipboard.writeText(media.url)}
                  className="bg-background/90 text-xs px-2 py-1 rounded shadow hover:bg-background"
                  title="Copy URL"
                >
                  📋
                </button>
                <button
                  onClick={() => handleDelete(media._id)}
                  className="bg-destructive/90 text-white text-xs px-2 py-1 rounded shadow hover:bg-destructive"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
