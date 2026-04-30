import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/lib/api';
import { Post, PaginatedResponse } from '@/types';

interface PostsState {
  posts: Post[];
  currentPost: Post | null;
  total: number;
  page: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
}

const initialState: PostsState = {
  posts: [],
  currentPost: null,
  total: 0,
  page: 1,
  totalPages: 1,
  loading: false,
  error: null,
};

export const fetchPosts = createAsyncThunk(
  'posts/fetchAll',
  async (params: Record<string, string | number> = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams(params as Record<string, string>).toString();
      const { data } = await api.get<PaginatedResponse<Post>>(`/posts?${query}`);
      return data;
    } catch {
      return rejectWithValue('Failed to fetch posts');
    }
  }
);

export const fetchPostBySlug = createAsyncThunk(
  'posts/fetchBySlug',
  async (slug: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get<{ data: Post }>(`/posts/${slug}`);
      return data.data;
    } catch {
      return rejectWithValue('Post not found');
    }
  }
);

export const createPost = createAsyncThunk(
  'posts/create',
  async (payload: Partial<Post>, { rejectWithValue }) => {
    try {
      const { data } = await api.post<{ data: Post }>('/posts', payload);
      return data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to create post');
    }
  }
);

export const updatePost = createAsyncThunk(
  'posts/update',
  async ({ id, payload }: { id: string; payload: Partial<Post> }, { rejectWithValue }) => {
    try {
      const { data } = await api.put<{ data: Post }>(`/posts/${id}`, payload);
      return data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to update post');
    }
  }
);

export const deletePost = createAsyncThunk(
  'posts/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/posts/${id}`);
      return id;
    } catch {
      return rejectWithValue('Failed to delete post');
    }
  }
);

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    clearCurrentPost: (state) => { state.currentPost = null; },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchPostBySlug.pending, (state) => { state.loading = true; })
      .addCase(fetchPostBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPost = action.payload;
      })
      .addCase(fetchPostBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.posts.unshift(action.payload);
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        const idx = state.posts.findIndex((p) => p._id === action.payload._id);
        if (idx !== -1) state.posts[idx] = action.payload;
        if (state.currentPost?._id === action.payload._id) {
          state.currentPost = action.payload;
        }
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter((p) => p._id !== action.payload);
      });
  },
});

export const { clearCurrentPost, clearError } = postsSlice.actions;
export default postsSlice.reducer;
