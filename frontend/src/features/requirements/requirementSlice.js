import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../api/apiClient';

const initialState = { items: [], selected: null, loading: false, error: null };

export const fetchRequirements = createAsyncThunk('requirements/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.get('/requirements', { params });
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load requirements');
  }
});

export const fetchRequirementById = createAsyncThunk('requirements/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.get(`/requirements/${id}`);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load requirement');
  }
});

export const createRequirement = createAsyncThunk('requirements/create', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.post('/requirements', payload);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create requirement');
  }
});

export const addRequirementVersion = createAsyncThunk(
  'requirements/addVersion',
  async ({ id, body, changeSummary }, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post(`/requirements/${id}/versions`, { body, changeSummary });
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to add version');
    }
  }
);

export const decideOnVersion = createAsyncThunk(
  'requirements/decide',
  async ({ versionId, decision, note }, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post(`/requirements/versions/${versionId}/approve`, { decision, note });
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to record decision');
    }
  }
);

const requirementSlice = createSlice({
  name: 'requirements',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRequirements.pending, (state) => { state.loading = true; })
      .addCase(fetchRequirements.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchRequirementById.fulfilled, (state, action) => {
        state.selected = action.payload;
      });
  },
});

export default requirementSlice.reducer;
