'use client';

import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { createPost } from '@/store/slices/postsSlice';
import PostEditor from '@/components/admin/PostEditor';
import { Post } from '@/types';

export default function NewPostPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleSubmit = async (data: Partial<Post>) => {
    const result = await dispatch(createPost(data));
    if (createPost.fulfilled.match(result)) {
      router.push('/admin/posts');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">New Post</h1>
      <PostEditor onSubmit={handleSubmit} />
    </div>
  );
}
