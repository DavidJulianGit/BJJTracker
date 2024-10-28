import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchTechniques = createAsyncThunk(
  'techniques/fetchTechniques',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:5000/api/techniques', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) throw new Error('Failed to fetch techniques');
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTechniqueById = createAsyncThunk(
  'techniques/fetchTechniqueById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:5000/api/techniques/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) throw new Error('Failed to fetch technique');
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateTechnique = createAsyncThunk(
  'techniques/updateTechnique',
  async (techniqueData, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:5000/api/techniques/${techniqueData._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(techniqueData)
      });
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 409) {
          return rejectWithValue({ ...errorData, conflict: true });
        }
        return rejectWithValue(errorData || 'Failed to update technique');
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteTechnique = createAsyncThunk(
  'techniques/deleteTechnique',
  async (techniqueId, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:5000/api/techniques/${techniqueId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) throw new Error('Failed to delete technique');
      return techniqueId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createTechnique = createAsyncThunk(
  'techniques/createTechnique',
  async (techniqueData, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:5000/api/techniques', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(techniqueData)
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.log("errorData in createTechnique in techniquesSlice.js",errorData);
        return rejectWithValue(errorData || 'Failed to create technique');
      }
      return await response.json();
    } catch (error) {
      console.log("error in createTechnique in techniquesSlice.js",error);
      return rejectWithValue(error.message);
    }
  }
);

export const restoreTechnique = createAsyncThunk(
  'techniques/restoreTechnique',
  async (techniqueId, { rejectWithValue }) => {
    try {
      console.log("techniqueId in restoreTechnique in techniquesSlice.js",techniqueId);
      const response = await fetch(`http://localhost:5000/api/techniques/${techniqueId}/restore`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to restore technique');
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const replaceTechnique = createAsyncThunk(
  'techniques/replaceTechnique',
  async (techniqueData, { rejectWithValue }) => {
    try {
      console.log("techniqueData in replaceTechnique in techniquesSlice.js",techniqueData);
      const response = await fetch(`http://localhost:5000/api/techniques/${techniqueData._id}/replace`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(techniqueData)
      });
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to replace technique');
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const techniquesSlice = createSlice({
  name: 'techniques',
  initialState: { items: [], currentTechnique: null, status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTechniques.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTechniques.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchTechniques.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchTechniqueById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTechniqueById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentTechnique = action.payload;
      })
      .addCase(fetchTechniqueById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(updateTechnique.fulfilled, (state, action) => {
        state.currentTechnique = action.payload;
        const index = state.items.findIndex(technique => technique._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteTechnique.fulfilled, (state, action) => {
        state.items = state.items.filter(technique => technique._id !== action.payload);
      })
      .addCase(createTechnique.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(restoreTechnique.fulfilled, (state, action) => {
        const index = state.items.findIndex(technique => technique._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        } else {
          state.items.push(action.payload);
        }
      })
      .addCase(replaceTechnique.fulfilled, (state, action) => {
        const index = state.items.findIndex(technique => technique._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  },
});

export default techniquesSlice.reducer;
