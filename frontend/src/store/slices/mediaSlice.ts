import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/api';
import { Media, PaginatedResponse } from '@/types';

interface MediaState {
  items: Media[];
  total: number;
  page: number;
  totalPages: number;
  loading: boolean;
  uploading: boolean;
  error: string | null;
}

const initialState: MediaState = {
  items: [],
  total: 0,
  page: 1,
  totalPages: 1,
  loading: false,
  uploading: false,
  error: null,
};

export const fetchMedia = createAsyncThunk(
  'media/fetchAll',
  async (params: { page?: number; limit?: number; type?: string } = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams(params as Record<string, string>).toString();
      const { data } = await api.get<PaginatedResponse<Media>>(`/media?${query}`);
      return data;
    } catch {
      return rejectWithValue('Failed to fetch media');
    }
  }
);

export const uploadMedia = createAsyncThunk(
  'media/upload',
  async (file: File, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post<{ data: Media }>('/media', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Upload failed');
    }
  }
);

export const deleteMedia = createAsyncThunk(
  'media/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/media/${id}`);
      return id;
    } catch {
      return rejectWithValue('Failed to delete media');
    }
  }
);

const mediaSlice = createSlice({
  name: 'media',
  initialState,
  reducers: { clearError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMedia.pending, (state) => { state.loading = true; })
      .addCase(fetchMedia.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchMedia.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(uploadMedia.pending, (state) => { state.uploading = true; state.error = null; })
      .addCase(uploadMedia.fulfilled, (state, action) => {
        state.uploading = false;
        state.items.unshift(action.payload);
      })
      .addCase(uploadMedia.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteMedia.fulfilled, (state, action) => {
        state.items = state.items.filter((m) => m._id !== action.payload);
      });
  },
});

export const { clearError } = mediaSlice.actions;
export default mediaSlice.reducer;
