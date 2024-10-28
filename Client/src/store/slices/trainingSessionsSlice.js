import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchTrainingSessions = createAsyncThunk(
  'trainingSessions/fetchTrainingSessions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:5000/api/trainingSessions', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) throw new Error('Failed to fetch training sessions');
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const saveTrainingSession = createAsyncThunk(
  'trainingSessions/saveTrainingSession',
  async (sessionData, { rejectWithValue }) => {
    try {
      console.log('Sending session data:', sessionData);
      const response = await fetch(`http://localhost:5000/api/trainingSessions${sessionData._id ? `/${sessionData._id}` : ''}`, {
        method: sessionData._id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...sessionData,
          tags: sessionData.tags || [],
          time: sessionData.time || '00:00',
          totalDuration: sessionData.totalDuration,
          note: sessionData.note  // Changed from 'notes' to 'note'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server response:', errorData);
        throw new Error(errorData.message || 'Failed to save training session');
      }

      const data = await response.json();
      console.log('Saved session data:', data);
      return data;
    } catch (error) {
      console.error('Error in saveTrainingSession:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const deleteTrainingSession = createAsyncThunk(
  'trainingSessions/deleteTrainingSession',
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:5000/api/trainingSessions/${sessionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete training session');
      }
      
      return sessionId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const trainingSessionsSlice = createSlice({
  name: 'trainingSessions',
  initialState: { items: [], status: 'idle', error: null },
  reducers: {
    clearTrainingSessions: (state) => {
      state.items = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrainingSessions.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTrainingSessions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchTrainingSessions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(saveTrainingSession.fulfilled, (state, action) => {
        const index = state.items.findIndex(session => session._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        } else {
          state.items.push(action.payload);
        }
      })
      .addCase(deleteTrainingSession.fulfilled, (state, action) => {
        state.items = state.items.filter(session => session._id !== action.payload);
      });
  },
});

export const { clearTrainingSessions } = trainingSessionsSlice.actions;
export default trainingSessionsSlice.reducer;