'use client';

import { useEffect, useRef } from 'react';
import api from '@/lib/api';

interface PostTrackerProps {
  postId: string;
  postSlug: string;
  postTitle: string;
}

export default function PostTracker({ postId, postSlug, postTitle }: PostTrackerProps) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;

    api.post('/analytics/track', {
      postId,
      postSlug,
      postTitle,
      referrer: typeof document !== 'undefined' ? document.referrer : '',
    }).catch(() => {
      // Silently fail — analytics should never break the page
    });
  }, [postId, postSlug, postTitle]);

  return null;
}
