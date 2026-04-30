'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Post, Category, Tag, PostStatus } from '@/types';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

const schema = z.object({
  title: z.string().min(1, 'Title required').max(255),
  excerpt: z.string().max(500).optional(),
  status: z.enum(['draft', 'published', 'scheduled', 'archived']),
  featuredImage: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  scheduledAt: z.string().optional(),
  locale: z.string().default('en'),
  seo: z.object({
    metaTitle: z.string().max(70).optional(),
    metaDescription: z.string().max(160).optional(),
    keywords: z.string().optional(),
  }).optional(),
});

type FormData = z.infer<typeof schema>;

interface PostEditorProps {
  onSubmit: (data: Partial<Post>) => Promise<void>;
  initialData?: Post;
}

export default function PostEditor({ onSubmit, initialData }: PostEditorProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'settings'>('content');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Start writing your post…' }),
      Image,
      Link.configure({ openOnClick: false }),
    ],
    content: initialData?.content || '',
    editorProps: {
      attributes: {
        class: 'prose max-w-none min-h-[400px] p-4 focus:outline-none',
      },
    },
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initialData?.title || '',
      excerpt: initialData?.excerpt || '',
      status: (initialData?.status as PostStatus) || 'draft',
      featuredImage: initialData?.featuredImage || '',
      categories: initialData?.categories?.map((c) => (typeof c === 'string' ? c : c._id)) || [],
      tags: initialData?.tags?.map((t) => (typeof t === 'string' ? t : t._id)) || [],
      scheduledAt: initialData?.scheduledAt ? new Date(initialData.scheduledAt).toISOString().slice(0, 16) : '',
      locale: initialData?.locale || 'en',
      seo: {
        metaTitle: initialData?.seo?.metaTitle || '',
        metaDescription: initialData?.seo?.metaDescription || '',
        keywords: initialData?.seo?.keywords?.join(', ') || '',
      },
    },
  });

  const status = watch('status');

  useEffect(() => {
    Promise.all([
      api.get<{ data: Category[] }>('/categories'),
      api.get<{ data: Tag[] }>('/tags'),
    ]).then(([catRes, tagRes]) => {
      setCategories(catRes.data.data || []);
      setTags(tagRes.data.data || []);
    }).catch(() => {});
  }, []);

  const handleFormSubmit = async (data: FormData) => {
    const content = editor?.getHTML() || '';
    if (!content || content === '<p></p>') {
      alert('Please add some content to your post.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        ...data,
        content,
        featuredImage: data.featuredImage || undefined,
        scheduledAt: data.status === 'scheduled' ? data.scheduledAt : undefined,
        seo: {
          metaTitle: data.seo?.metaTitle,
          metaDescription: data.seo?.metaDescription,
          keywords: data.seo?.keywords?.split(',').map((k) => k.trim()).filter(Boolean),
        },
      });
    } finally {
      setSubmitting(false);
    }
  };

  const tabs = ['content', 'seo', 'settings'] as const;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Title */}
      <div>
        <input
          {...register('title')}
          placeholder="Post Title"
          className="w-full text-3xl font-bold border-0 border-b border-border pb-2 focus:outline-none focus:border-primary bg-transparent placeholder:text-muted-foreground/50"
        />
        {errors.title && <p className="text-destructive text-xs mt-1">{errors.title.message}</p>}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2 text-sm font-medium capitalize transition -mb-px border-b-2',
              activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content Tab */}
      {activeTab === 'content' && (
        <div className="bg-background border border-border rounded-xl overflow-hidden">
          {/* Toolbar */}
          {editor && (
            <div className="flex flex-wrap gap-1 p-2 border-b border-border bg-muted/30">
              {[
                { label: 'B', action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold') },
                { label: 'I', action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic') },
                { label: 'H2', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }) },
                { label: 'H3', action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive('heading', { level: 3 }) },
                { label: '• List', action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList') },
                { label: '1. List', action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList') },
                { label: '❝', action: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive('blockquote') },
                { label: '<>', action: () => editor.chain().focus().toggleCode().run(), active: editor.isActive('code') },
                { label: '— HR', action: () => editor.chain().focus().setHorizontalRule().run(), active: false },
              ].map((btn) => (
                <button
                  key={btn.label}
                  type="button"
                  onClick={btn.action}
                  className={cn(
                    'px-2 py-1 text-xs rounded transition',
                    btn.active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                  )}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          )}
          <EditorContent editor={editor} />
        </div>
      )}

      {/* SEO Tab */}
      {activeTab === 'seo' && (
        <div className="space-y-4 bg-background border border-border rounded-xl p-6">
          <div>
            <label className="block text-sm font-medium mb-1">Meta Title <span className="text-muted-foreground">(max 70 chars)</span></label>
            <input
              {...register('seo.metaTitle')}
              placeholder="SEO title (defaults to post title)"
              className="w-full border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Meta Description <span className="text-muted-foreground">(max 160 chars)</span></label>
            <textarea
              {...register('seo.metaDescription')}
              placeholder="Brief description for search engines"
              rows={3}
              className="w-full border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Keywords <span className="text-muted-foreground">(comma separated)</span></label>
            <input
              {...register('seo.keywords')}
              placeholder="headless cms, blog, content management"
              className="w-full border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Excerpt</label>
            <textarea
              {...register('excerpt')}
              placeholder="Short summary shown in listings (max 500 chars)"
              rows={3}
              className="w-full border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-4 bg-background border border-border rounded-xl p-6">
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              {...register('status')}
              className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="scheduled">Scheduled</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {status === 'scheduled' && (
            <div>
              <label className="block text-sm font-medium mb-1">Schedule Date & Time</label>
              <input
                {...register('scheduledAt')}
                type="datetime-local"
                className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Featured Image URL</label>
            <input
              {...register('featuredImage')}
              placeholder="https://..."
              className="w-full border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.featuredImage && <p className="text-destructive text-xs mt-1">{errors.featuredImage.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Categories</label>
            <Controller
              name="categories"
              control={control}
              render={({ field }) => (
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <label key={cat._id} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={field.value?.includes(cat._id) ?? false}
                        onChange={(e) => {
                          const current = field.value || [];
                          field.onChange(
                            e.target.checked
                              ? [...current, cat._id]
                              : current.filter((id) => id !== cat._id)
                          );
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{cat.name}</span>
                    </label>
                  ))}
                </div>
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tags</label>
            <Controller
              name="tags"
              control={control}
              render={({ field }) => (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <label key={tag._id} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={field.value?.includes(tag._id) ?? false}
                        onChange={(e) => {
                          const current = field.value || [];
                          field.onChange(
                            e.target.checked
                              ? [...current, tag._id]
                              : current.filter((id) => id !== tag._id)
                          );
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">#{tag.name}</span>
                    </label>
                  ))}
                </div>
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Language</label>
            <select
              {...register('locale')}
              className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="en">English</option>
              <option value="fr">French</option>
              <option value="es">Spanish</option>
              <option value="de">German</option>
              <option value="ar">Arabic</option>
            </select>
          </div>
        </div>
      )}

      {/* Submit */}
      <div className="flex gap-3 justify-end pt-4">
        <button
          type="button"
          onClick={() => history.back()}
          className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
        >
          {submitting ? 'Saving…' : initialData ? 'Update Post' : 'Create Post'}
        </button>
      </div>
    </form>
  );
}
