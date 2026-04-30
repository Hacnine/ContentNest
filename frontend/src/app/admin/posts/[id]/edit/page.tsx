'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { updatePost, fetchPostBySlug } from '@/store/slices/postsSlice';
import PostEditor from '@/components/admin/PostEditor';
import { Post } from '@/types';
import api from '@/lib/api';

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ data: Post }>(`/posts/admin/${id}`)
      .then(({ data }) => {
        setPost(data.data);
        setLoading(false);
      })
      .catch(() => {
        router.replace('/admin/posts');
      });
  }, [id, router]);

  const handleSubmit = async (data: Partial<Post>) => {
    const result = await dispatch(updatePost({ id, payload: data }));
    if (updatePost.fulfilled.match(result)) {
      router.push('/admin/posts');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Post</h1>
      <PostEditor onSubmit={handleSubmit} initialData={post || undefined} />
    </div>
  );
}
