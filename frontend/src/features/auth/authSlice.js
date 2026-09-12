import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../api/apiClient';

const storedUser = (() => {
  try {
    return JSON.parse(localStorage.getItem('devflow_user') || 'null');
  } catch {
    return null;
  }
})();

const initialState = {
  user: storedUser,
  accessToken: localStorage.getItem('devflow_access_token') || null,
  isAuthenticated: !!localStorage.getItem('devflow_access_token'),
  loading: false,
  error: null,
};

export const loginUser = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.post('/auth/login', { email, password });
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ name, email, password, confirmPassword }, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post('/auth/register', { name, email, password, confirmPassword });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Registration failed');
    }
  }
);

export const verifyEmail = createAsyncThunk('auth/verifyEmail', async ({ email, token }, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.post('/auth/verify-email', { email, token });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Verification failed');
  }
});

export const fetchCurrentUser = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    const { data } = await apiClient.get('/auth/me');
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  try {
    await apiClient.post('/auth/logout');
  } catch {
    // ignore network errors on logout — clear client state regardless
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        localStorage.setItem('devflow_access_token', action.payload.accessToken);
        localStorage.setItem('devflow_refresh_token', action.payload.refreshToken);
        localStorage.setItem('devflow_user', JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload };
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        // token invalid — reset auth state
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        localStorage.removeItem('devflow_access_token');
        localStorage.removeItem('devflow_refresh_token');
        localStorage.removeItem('devflow_user');
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
