import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../api/apiClient';

const initialState = {
  items: [],
  selected: null,
  filters: { search: '', status: '', page: 1, limit: 10 },
  meta: { total: 0, totalPages: 0 },
  pipeline: {},
  loading: false,
  error: null,
};

export const fetchLeads = createAsyncThunk('leads/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.get('/leads', { params });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load leads');
  }
});

export const fetchLeadById = createAsyncThunk('leads/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.get(`/leads/${id}`);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load lead');
  }
});

export const createLead = createAsyncThunk('leads/create', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.post('/leads', payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create lead');
  }
});

export const updateLead = createAsyncThunk('leads/update', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.patch(`/leads/${id}`, payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update lead');
  }
});

export const convertLead = createAsyncThunk('leads/convert', async (id, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.post(`/leads/${id}/convert`);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to convert lead');
  }
});

export const fetchPipeline = createAsyncThunk('leads/fetchPipeline', async (_, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.get('/deals/pipeline');
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load pipeline');
  }
});

const leadSlice = createSlice({
  name: 'leads',
  initialState,
  reducers: {
    setLeadFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeads.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchLeadById.fulfilled, (state, action) => {
        state.selected = action.payload;
      })
      .addCase(createLead.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateLead.fulfilled, (state, action) => {
        const idx = state.items.findIndex((l) => l.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
        if (state.selected?.id === action.payload.id) state.selected = { ...state.selected, ...action.payload };
      })
      .addCase(fetchPipeline.fulfilled, (state, action) => {
        state.pipeline = action.payload;
      });
  },
});

export const { setLeadFilters } = leadSlice.actions;
export default leadSlice.reducer;
